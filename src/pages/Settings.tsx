import { createSignal, onCleanup } from "solid-js";
import Sidebar from "../components/Sidebar";
import { SettingsManager } from "../SettingsManager";
import { Icon } from "solid-heroicons";
import { folder } from "solid-heroicons/solid";
import { open } from "@tauri-apps/plugin-dialog";

export default function () {
  const [settings, setSettings] = createSignal(SettingsManager.getSettings(), {
    equals: false,
  });
  onCleanup(() => {
    console.log(settings());
    SettingsManager.saveSettings(settings());
  });
  return (
    <>
      <Sidebar />
      <section class="flex flex-row-reverse max-w-5xl mr-16 text-right">
        <div class="bg-surface0 w-[2px] h-72 my-16"></div>
        <div class="my-16 ">
          <h1 class="text-3xl font-bold pb-4 mx-4">Settings</h1>
          <hr class="border-surface0 w-64 "></hr>
          <section class="">
            <h2 class="text-xl font-bold pt-4 mx-6">Instances</h2>
            <div class="flex flex-row-reverse">
              <button
                class="flex flex-row-reverse text-xs bg-crust px-4 py-1 rounded-md my-2 mx-2 max-w-48"
                onClick={async () => {
                  const folder = await open({
                    directory: true,
                    canCreateDirectories: true,
                    defaultPath: settings()?.installLocation,
                  });
                  if (folder) {
                    const thing = settings();
                    thing!.installLocation = folder;
                    setSettings(thing);
                  }
                }}
              >
                <p class="text-subtext1 max-w-32">
                  {/* this doesnt want to wrap, help. */}
                  {settings()?.installLocation}
                </p>
                <Icon path={folder} class="w-4 h-4 mr-2" />
              </button>
            </div>
            <p class="text-xs text-subtext0 font-light px-6">
              Changing Instance Location does not <br /> get rid of old Instance
              folders
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
