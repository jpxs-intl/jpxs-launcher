import { createSignal, Show } from "solid-js";
import Sidebar from "../components/Sidebar";
type player = {
  name: string;
  gameId: number;
  phoneNumber: number;
  firstSeen: string;
  lastSeen: string;
  steamId: string;
};

type response =
  | {
      success: true;
      error: string;
      searchMode: string;
      players: {
        0: player;
      };
    }
  | {
      success: false;
      error: string;
      searchMode: string;
    };

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

export default function () {
  const [error, setError] = createSignal<string>();
  const [player, setPlayer] = createSignal<player>();
  let inputRef!: HTMLInputElement;
  // https://avatars.jpxs.io/karl?size=256
  return (
    <>
      <Sidebar />
      <section class="ml-64 flex flex-col items-center">
        <h1 class="font-bold text-3xl pt-12 pb-8 text-center">Player Search</h1>
        <Show when={player()}>
          <div class="bg-crust px-4 py-4 rounded-xl flex flex-row gap-x-2">
            <img
              class="w-32 h-32 place-self-center"
              src={`https://avatars.jpxs.io/${player()!.phoneNumber}?size=128`}
            />
            <div>
              <h1 class="font-bold text-2xl">{player()!.name}</h1>
              <div class="text-left">
                <p>Phone Number: {player()!.phoneNumber}</p>
                <p>Game ID: {player()!.gameId}</p>
                <p>Steam ID: {player()!.steamId}</p>
                <p>First seen: {dateToString(new Date(player()!.firstSeen))}</p>
                <p>
                  Last seen: {dateToString(new Date(player()!.lastSeen), true)}
                </p>
              </div>
            </div>
          </div>
        </Show>
        <p class="text-center my-2">
          Input:{" "}
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
                setPlayer(json.players[0]);
                setError();
              } else {
                setError(json.error);
              }
            });
          }}
        >
          Search
        </button>
      </section>
    </>
  );
}
