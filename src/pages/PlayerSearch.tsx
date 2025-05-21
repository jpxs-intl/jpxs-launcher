import { createSignal, For, Show } from "solid-js";
import Sidebar from "../components/Sidebar";
import Fuse from "fuse.js";
import { Icon } from "solid-heroicons";
import { arrowDown, arrowUp } from "solid-heroicons/outline";
type player = {
  name: string;
  gameId: number;
  phoneNumber: number;
  firstSeen: string;
  lastSeen: string;
  steamId: string;
  nameHistory: Array<{ name: string }>;
};

type response =
  | {
      success: true;
      error: string;
      searchMode: string;
      players: player[];
    }
  | {
      success: false;
      error: string;
      searchMode: string;
    };

const fuse = new Fuse<player>([], {
  keys: [
    { name: "name", weight: 0.7 },
    { name: "phoneNumber", weight: 0.5 },
    { name: "steamId", weight: 0.5 },
    { name: "gameId", weight: 0.5 },
    { name: "nameHistory.name", weight: 0.3 },
  ],
  threshold: 0.4,
  distance: 10,
});
function dateToString(date: Date, relative?: boolean) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (relative) {
    const rtf1 = new Intl.RelativeTimeFormat("en", { style: "short" });
    if (new Date().getFullYear() - year > 0) {
      return rtf1.format(-(new Date().getFullYear() - year), "year");
    } else if (new Date().getMonth() + 1 - month > 0) {
      return rtf1.format(-(new Date().getMonth() + 1 - month), "month");
    } else if (new Date().getDate() - day > 0) {
      return rtf1.format(-(new Date().getDate() - day), "day");
    } else if (new Date().getHours() - date.getHours() > 0) {
      return rtf1.format(-(new Date().getHours() - date.getHours()), "hour");
    } else {
      return rtf1.format(
        -(new Date().getMinutes() - date.getMinutes()),
        "minute"
      );
    }
  }
  return `${month}/${day}/${year}`;
}
function Player(props: { player: player }) {
  const player = props.player;
  return (
    <div class="bg-crust px-4 py-4 rounded-xl flex flex-row gap-x-2">
      <img
        class="w-32 h-32 place-self-center"
        src={`https://avatars.jpxs.io/${player.phoneNumber}?size=128`}
      />
      <div>
        <h1
          class="font-bold text-2xl"
          title={`Also Known As: ${player.nameHistory
            .map((val) => val.name)
            .join(", ")}`}
        >
          {player.name}
        </h1>
        <div class="text-left">
          <p>Phone Number: {player.phoneNumber}</p>
          <p>Game ID: {player.gameId}</p>
          <p>Steam ID: {player.steamId}</p>
          <p>First seen: {dateToString(new Date(player.firstSeen))}</p>
          <p title={dateToString(new Date(player.lastSeen))}>
            Last seen: {dateToString(new Date(player.lastSeen), true)}
          </p>
        </div>
      </div>
    </div>
  );
}
export default function () {
  const [error, setError] = createSignal<string>();
  const [expanded, setExpanded] = createSignal(false);
  const [playerList, setPlayerList] = createSignal<player[]>();
  let inputRef!: HTMLInputElement;
  return (
    <>
      <Sidebar />
      <section class="ml-64 flex flex-col items-center">
        <h1 class="font-bold text-3xl pt-12 pb-8 text-center">Player Search</h1>
        <p class="text-center my-2">
          <input
            ref={inputRef}
            class={`bg-surface0 rounded-xl px-2 ${
              error() ? "border-red border-2" : ""
            }`}
          ></input>
        </p>
        <Show when={error()}>
          <p class="text-red">{error()}</p>
        </Show>
        <button
          class="bg-surface0 hover:bg-mantle px-2 py-1 rounded-lg w-32"
          onClick={() => {
            if (inputRef.value.length === 0) return;
            fetch(
              "https://jpxs.io/api/player/" + encodeURIComponent(inputRef.value)
            ).then(async (val) => {
              const json: response = await val.json();
              if (json.success) {
                console.log(json);
                fuse.setCollection(json.players);
                setPlayerList(
                  fuse
                    .search(inputRef.value, {
                      limit: 5,
                    })
                    .map((val) => val.item)
                );
                console.log(playerList());
                setError();
              } else {
                setError(json.error);
              }
            });
          }}
        >
          Search
        </button>
        <Show when={playerList()}>
          <div class="flex flex-col gap-y-2 my-2">
            <For
              each={(() => {
                if (expanded()) {
                  return playerList();
                } else {
                  return playerList()?.slice(0, 1);
                }
              })()}
            >
              {(player, index) => {
                if (!expanded()) {
                  if (index() > 0) return <></>;
                }
                return <Player player={player} />;
              }}
            </For>
            <button
              class="flex flex-row-reverse gap-x-2 justify-self-center"
              onClick={() => setExpanded(!expanded())}
            >
              <Icon
                path={expanded() ? arrowUp : arrowDown}
                width={24}
                height={24}
              />
              <p>{expanded() ? "Minimize" : "Expand"}</p>
            </button>
          </div>
        </Show>
      </section>
    </>
  );
}
