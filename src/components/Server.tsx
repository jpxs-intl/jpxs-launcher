import playerImg from "../assets/users-solid.svg";
import gamemodeImg from "../assets/map-solid.svg";
import versionImg from "../assets/code-branch-solid.svg";
import tpsImg from "../assets/microchip-solid.svg";
import customModeImg from "../assets/gamepad-solid.svg";
import latencyImg from "../assets/wifi-solid.svg";
import { Show } from "solid-js";
import type { server } from "../pages/ServerList";

const gameType = new Map<number, string>([
  [2, "Race"],
  [3, "Round"],
  [4, "World"],
  [5, "Eliminator"],
  [6, "Co-op"],
  [7, "Versus"],
]);

function getMapFromGameType(gameType: number) {
  return gameType == 4 ? "test2" : "Round";
}
export default function (props: { server: server }) {
  return (
    <div class="bg-mantle hover:bg-crust transition-colors duration-200 py-1 border-y-[1px] border-crust rounded-2xl">
      <div class="px-2 columns-1 xs:px-4 py-2 flex flex-row gap-4">
        <div class="flex justify-left">
          <img
            src={props.server.icon}
            class="w-[64px] h-[64px] sm:w-[96px] sm:h-[96px] rounded-2xl"
            alt={props.server.name}
          ></img>
        </div>
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-bold glow-small block">
            {props.server.name}
          </h1>
          <div class={"flex flex-row gap-4"}>
            <div class={"flex flex-row gap-x-4"}>
              <div class="flex flex-row">
                <img
                  src={playerImg}
                  class="w-[18px] h-[18px] sm:w-[24px] sm:h-[24px]"
                  alt="Players:"
                ></img>
                <h2 class="text-sm sm:px-2 sm:text-lg">
                  {props.server.players}/{props.server.maxPlayers}
                </h2>
              </div>
              <Show when={props.server.customMode}>
                <div class="flex flex-row">
                  <img
                    src={customModeImg}
                    class="w-[18px] h-[18px] sm:w-[24px] sm:h-[24px]"
                    alt="Game Mode:"
                  ></img>
                  <h2 class="text-sm sm:px-2 sm:text-lg">
                    {props.server.customMode?.name}
                  </h2>
                </div>
                <div class="flex flex-row">
                  <img
                    src={gamemodeImg}
                    class="w-[18px] h-[18px] sm:w-[24px] sm:h-[24px]"
                    alt="Game Mode:"
                  ></img>
                  <h2 class="text-sm sm:px-2 sm:text-lg">
                    {props.server.map?.toLowerCase()}
                  </h2>
                </div>
              </Show>
              <Show when={!props.server.customMode}>
                <div class="flex flex-row">
                  <img
                    src={customModeImg}
                    class="w-[18px] h-[18px] sm:w-[24px] sm:h-[24px]"
                    alt="Game Mode:"
                  ></img>
                  <h2 class="text-sm sm:px-2 sm:text-lg">
                    {gameType.get(props.server.gameType)}
                  </h2>
                </div>
                <div class="flex flex-row">
                  <img
                    src={gamemodeImg}
                    class="w-[18px] h-[18px] sm:w-[24px] sm:h-[24px]"
                    alt="Game Mode:"
                  ></img>
                  <h2 class="text-sm sm:px-2 sm:text-lg">
                    {getMapFromGameType(props.server.gameType).toLowerCase()}
                  </h2>
                </div>
              </Show>
            </div>
          </div>
          <div class="flex flex-row gap-4">
            <Show when={props.server.tps}>
              <div class="flex flex-row truncate">
                <img
                  src={tpsImg}
                  class="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]"
                  alt=""
                ></img>
                <h2 class="text-sm sm:px-2 sm:text-lg">
                  {props.server.tps?.toFixed(2)} TPS
                </h2>
              </div>
            </Show>
            <div class="flex flex-row">
              <img src={versionImg} height="16" width="16" alt="Version:"></img>
              <h2
                class="text-sm sm:px-2 sm:text-lg"
                style={`color: hsl(${props.server.version * 45}, 100%, 60%)`}
              >
                {props.server.version}
                {props.server.build}
              </h2>
            </div>
            <div class="flex flex-row truncate">
              <img
                src={latencyImg}
                class="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]"
                alt=""
              ></img>
              <h2 class="text-sm sm:px-2 sm:text-lg">
                {props.server.latency} ms
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
