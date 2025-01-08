import { For, createResource, createSignal } from "solid-js";
import Sidebar from "../components/Sidebar";
import Server from "../components/Server";

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

const peopleWeHate = ["205.174.149.108"];

const [servers, { refetch }] = createResource(async () => {
  const serverList: server[] = await (
    await fetch(`https://jpxs.io/api/servers`)
  ).json();
  serverList
    .filter((server) => !peopleWeHate.includes(server.address))
    .map((server) => {
      server.name = `${server.emoji} ${server.name}`;

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
        <div class="flex flex-row my-4 gap-x-4">
          <button
            class={`transition-colors duration-100 hover:bg-crust px-4 py-2 rounded-xl ${
              isFreeWeekend() ? "bg-surface0" : "bg-mantle"
            }`}
            onClick={() => {
              setFreeWeekend(true);
              refetch();
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
              refetch();
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
            {
              (server: server) => <Server server={server} />
              /*if (isFreeWeekend() && server.masterServer === "jpxs") {
                return <Server server={server}></Server>;
              } else if (
                !isFreeWeekend() &&
                server.masterServer === "vanilla"
              ) {
                return <Server server={server}></Server>;
              }*/
            }
          </For>
        </div>
      </section>
    </>
  );
}
