import { For, createResource, createSignal } from "solid-js";
import Sidebar from "../components/Sidebar";
import Server from "../components/Server";

const [playerCount, setPlayerCount] = createSignal(0);
export { playerCount };
export type server = {
  id: number;
  name: string;
  address: string;
  port: number;
  version: number;
  gameType: number;
  players: number;
  maxPlayers: number;
  build: string;
  tps?: number;
  customMode?: { name: string };
  map: string;
  icon?: string;
  link?: string;
  description?: string;
  masterServer: string;
  latency: number;
  emoji: string;
  country: string;
};

const ignoreList = ["205.174.149.108"];

const [servers, { refetch }] = createResource(async () => {
  let playercount = 0;
  const serverList: server[] = await (
    await fetch(`https://jpxs.io/api/servers`)
  ).json();
  serverList
    .filter((server) => !ignoreList.includes(server.address))
    .map((server) => {
      server.name = `${server.emoji} ${server.name}`;
      playercount += server.players;
      if (server.masterServer == "jpxs") {
        server.build = `${server.build}`;
        server.icon =
          server.icon || "https://assets.jpxs.io/img/default/freeweekend.png";
      } else {
        server.icon =
          server.icon || "https://assets.jpxs.io/img/default/subrosa.png";
      }
      return server;
    });
  setPlayerCount(playercount);
  return serverList;
});

setInterval(refetch, 15000);

export default function ServerList() {
  const [isFreeWeekend, setFreeWeekend] = createSignal<boolean>(true);
  return (
    <>
      <Sidebar />
      <section class="ml-72 mr-12">
        <h1 class="text-center font-bold text-3xl pt-12 pb-8">Server List</h1>
        <hr class="border-surface0 pb-2" />
        <p class="text-subtext0 text-sm mt-2">
          Note: To play on these servers, launch an instance with the same
          version number!
        </p>
        <div class="flex flex-row mt-2 mb-4 gap-x-4">
          <button
            class={`transition-colors duration-100 hover:bg-crust px-4 py-2 rounded-xl ${
              isFreeWeekend() ? "bg-surface0" : "bg-mantle"
            }`}
            onClick={() => {
              setFreeWeekend(true);
            }}
          >
            Free Weekend
          </button>
          <button
            class={`transition-colors duration-100 hover:bg-crust px-4 py-2 rounded-xl ${
              isFreeWeekend() ? "bg-mantle" : "bg-surface0"
            }`}
            onClick={() => {
              setFreeWeekend(false);
            }}
          >
            Vanilla
          </button>
        </div>
        <div class="grid gap-x-8 gap-y-2 xl:gap-y-4 grid-cols-1 xl:grid-cols-2  ">
          <For
            each={servers()
              ?.filter(
                (server) =>
                  (isFreeWeekend() && server.masterServer === "jpxs") ||
                  (!isFreeWeekend() && server.masterServer === "vanilla")
              )
              .sort((a, b) => b.players - a.players)}
          >
            {(server: server) => <Server server={server} />}
          </For>
        </div>
      </section>
    </>
  );
}
