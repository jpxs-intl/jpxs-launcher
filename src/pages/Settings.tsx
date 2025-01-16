import { createSignal, onCleanup, Show } from "solid-js";
import Sidebar from "../components/Sidebar";
import { SettingsManager } from "../SettingsManager";
import { Icon } from "solid-heroicons";
import { folder } from "solid-heroicons/solid";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { checkUpdates } from "../App";

export default function () {
  const [updateCheckLabel, setUpdateCheckLabel] = createSignal("");
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
        <div class="bg-surface0 w-[2px] h-96 my-16"></div>
        <div class="my-16 ">
          <h1 class="text-3xl font-bold pb-4 mx-4">Settings</h1>
          <hr class="border-surface0 w-full "></hr>
          <section class="">
            <h2 class="text-xl font-bold pt-4 mx-6">Instances</h2>
            <div class="flex flex-row-reverse">
              <button
                class="flex flex-row text-xs bg-crust px-2 py-1 rounded-md my-2 mx-2"
                onClick={async () => {
                  const thing = settings();
                  if (thing) {
                    const folder = await open({
                      directory: true,
                      canCreateDirectories: true,
                      defaultPath: settings()?.installLocation,
                    });
                    if (folder) {
                      thing.installLocation = folder;
                      thing.instances = [];
                      setSettings(thing);
                    }
                  }
                }}
              >
                <Icon path={folder} class="w-4 h-4 mr-2" />
                <p class="text-subtext1 text-ellipsis">
                  {settings()?.installLocation}
                </p>
              </button>
            </div>
            <p class="text-xs text-subtext0 font-light px-6">
              Changing Instance Location does not <br /> get rid of old Instance
              folders
            </p>
            <button
              class="bg-surface0 px-2 py-1 my-2 mr-4 rounded-lg text-sm"
              onClick={() => {
                invoke("open_path_command", {
                  path: settings()!.installLocation,
                });
              }}
            >
              Open Instances Folder
            </button>
          </section>
          <hr class="border-surface0 my-2 w-full" />
          <h2 class="text-xl font-bold py-2 mx-6">Settings</h2>
          <button
            class="bg-surface0 px-2 py-1 mr-4 rounded-lg text-sm"
            onClick={async () => {
              setUpdateCheckLabel("Checking for updates...");
              if (!(await checkUpdates())) {
                setUpdateCheckLabel("No updates found.");
              } else {
                setUpdateCheckLabel("");
              }
            }}
          >
            Check Updates
          </button>
          <Show when={updateCheckLabel() !== ""} fallback={<br />}>
            <p class="text-subtext0 text-sm ">{updateCheckLabel()}</p>
          </Show>

          <button
            class="bg-surface0 px-2 py-1 my-2 mr-4 rounded-lg text-sm"
            onClick={() => {
              invoke("open_settings_command");
            }}
          >
            Open Settings Folder
          </button>
        </div>
      </section>
    </>
  );
}
