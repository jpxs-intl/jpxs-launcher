import { createSignal, Show } from "solid-js";
import Sidebar from "../components/Sidebar";
import { InstanceManager } from "../InstanceManager";
import { SettingsManager } from "../SettingsManager";
import { InstanceComponent } from "./Instances";
import { Icon } from "solid-heroicons";
import { plus } from "solid-heroicons/outline";
import { A } from "@solidjs/router";
import { playerCount } from "./ServerList";

export default function () {
  const [lastPlayed, setLastPlayed] = createSignal<string | null>(null);
  const [noInstances, setNoInstances] = createSignal(true);
  let settings = SettingsManager.getSettings();
  if (settings) {
    setNoInstances(settings.instances.length === 0);
    setLastPlayed(settings.lastPlayed);
  }
  SettingsManager.onSettingsChange((newSettings) => {
    settings = newSettings;
    setNoInstances(settings.instances.length === 0);
    setLastPlayed(settings.lastPlayed);
  });
  return (
    <>
      <Sidebar />
      <section class="flex flex-row ml-64">
        <div class="bg-surface0 w-[2px] h-72 my-16"></div>
        <div class="my-16">
          <h1 class="text-3xl font-bold pb-4 mx-4">Welcome</h1>
          <Show when={lastPlayed() !== null}>
            <h3 class="text-left pt-1 mx-4">You last played...</h3>
            <InstanceComponent
              class="ml-2"
              instance={InstanceManager.getInstances().find(
                (instance) => instance.name === lastPlayed()
              )}
              deleteMode={false}
            />
            <p class="ml-4 mt-2 font-light text-subtext0 text-sm">
              Why not play some more?
            </p>
          </Show>
          <Show when={!lastPlayed() && !noInstances()}>
            <h3 class="text-left pt-1 mx-4">
              It's looking a little lonely here...
            </h3>
            <p class="ml-4 mt-2 font-light text-subtext0 text-sm">
              Why not play some more?
            </p>
          </Show>
          <Show when={noInstances()}>
            <h3 class="text-left pt-1 mx-4">
              It looks like you have no Instances...
            </h3>
            <A
              href="/instances?createInstance=true"
              class={`flex flex-row transition-colors duration-100 hover:bg-crust pl-2 py-2 rounded-xl bg-surface0 ml-2 w-40`}
            >
              <Icon path={plus} class="w-6 h-6 mr-2" /> Add Instance
            </A>
          </Show>
          <p class="mx-4">
            There are currently {playerCount()} players online.
          </p>
        </div>
      </section>
    </>
  );
}
