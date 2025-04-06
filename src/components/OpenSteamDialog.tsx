import { InstanceManager } from "../InstanceManager";
import { Instance } from "../SettingsManager";

let activeInstance: Instance;
export function setActiveInstance(instance: Instance) {
  activeInstance = instance;
}
export default function OpenSteamDialog() {
  return (
    <dialog id="steam-closed">
      <div class="bg-crust rounded-2xl p-8 flex flex-col">
        <h1 class="text-3xl font-bold pb-4">Steam is closed</h1>
        <p class="text-subtext1 text-lg">Please open Steam to play Sub Rosa.</p>
        <p class="text-subtext0 text-xs pb-4">
          By not opening Steam, multiplayer features like the server list may
          not work.
        </p>
        <section class="flex flex-row gap-x-2">
          <button
            class="bg-surface0 hover:bg-mantle transition-colors px-4 py-2 rounded-xl grow"
            onClick={() => {
              const dialog = document.querySelector(
                "#steam-closed"
              ) as HTMLDialogElement;
              dialog.close();
            }}
          >
            Close
          </button>
          <button
            class="bg-surface0 hover:bg-mantle transition-colors px-4 py-2 rounded-xl"
            onClick={() => {
              const dialog = document.querySelector(
                "#steam-closed"
              ) as HTMLDialogElement;
              dialog.close();
              InstanceManager.openInstance(activeInstance);
            }}
          >
            Open Anyway
          </button>
        </section>
      </div>
    </dialog>
  );
}
