import { Route, Router } from "@solidjs/router";
import "./App.css";
import NotFound from "./pages/404";
import Home from "./pages/Home";
import ServerList from "./pages/ServerList";
import Settings from "./pages/Settings";
import Instances from "./pages/Instances";
import PlayerSearch from "./pages/PlayerSearch";
import { createEffect, createSignal, ErrorBoundary } from "solid-js";
import { check } from "@tauri-apps/plugin-updater";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { SettingsManager } from "./SettingsManager";
const [errorReason, setErrorReason] = createSignal("");
const [errorTitle, setErrorTitle] = createSignal("");
function LoadingComponent(props: { ref?: HTMLDialogElement }) {
  let totalSize = 0;
  const [progress, setProgress] = createSignal(0);
  listen<{ totalSize: number; packets: number }>(
    "update_progress",
    (packet) => {
      totalSize = packet.payload.totalSize;
      setProgress(packet.payload.packets);
    }
  );
  createEffect(() => {
    (document.querySelector("#loadingBar") as HTMLDivElement).style.width = `${
      192 * (progress() / totalSize)
    }px`;
  });
  return (
    <dialog
      id="launcherDownloadingDialog"
      class="rounded-xl bg-crust"
      ref={props.ref}
      onInput={(event) => {
        event.preventDefault();
      }}
    >
      <div class="text-text px-4 py-4">
        <h1 class="font-bold text-2xl">
          {totalSize === progress() ? "Extracting..." : "Downloading..."}
        </h1>
        <div class="rounded-xl bg-mantle h-4 w-48">
          <div id="loadingBar" class="rounded-xl h-4 bg-lavender"></div>
        </div>
        <p class="text-subtext0">{`${(progress() / 1000000).toFixed(2)}/${(
          totalSize / 1000000
        ).toFixed(2)}MB`}</p>
      </div>
    </dialog>
  );
}
let updateDialog!: HTMLDialogElement;
let [updateMessage, setUpdateMessage] = createSignal("");
export async function checkUpdates() {
  const val = await check();
  if (val) {
    const json: { body: string; tag_name: string } = await (
      await fetch(
        "https://api.github.com/repos/jpxs-intl/jpxs-launcher/releases/latest"
      )
    ).json();
    // fix update checker being dumb
    if (json.tag_name !== `v${await invoke("get_version")}`) {
      const desc = json.body.replace(/\r\n/g, "<br />");
      setUpdateMessage(desc);
      updateDialog.showModal();
      return true;
    }
  } else {
    console.log("No update");
    return false;
  }
}
function App() {
  let downloadingDialog!: HTMLDialogElement;
  let checkboxRef!: HTMLInputElement;
  const [settings, setSettings] = createSignal(SettingsManager.getSettings(), {
    equals: false,
  });

  SettingsManager.onSettingsChange((setting) => {
    if (settings() === undefined) {
      // first check only
      if (setting.checkUpdateAutomatically) {
        checkUpdates();
      }
    }
    setSettings(setting);
  });

  if (settings()) {
    if (settings()!.checkUpdateAutomatically) {
      checkUpdates();
    }
  }

  return (
    <ErrorBoundary
      fallback={(err, reset) => {
        return (
          <div class="text-center">
            <h1 class="font-bold text-4xl text-red ">{err.toString()}</h1>

            <p class="text-lg font-normal text-text">
              Something went wrong, please report this error in the JPXS discord
              with context.
            </p>
            <button
              onClick={reset}
              class="rounded-xl px-4 py-1 text-text bg-surface0 hover:bg-crust transition-colors"
            >
              Go Back
            </button>
          </div>
        );
      }}
    >
      <main class="">
        <LoadingComponent ref={downloadingDialog} />
        <dialog
          ref={updateDialog}
          class="rounded-xl bg-crust min-w-96 max-w-[36rem]"
        >
          <div class="bg-crust rounded-xl py-4 px-4 text-center text-text">
            <h1 class="font-bold text-3xl">Update Found!</h1>
            <p class="pt-2 pb-1">Would you like to update?</p>
            <p class="pb-4" innerHTML={updateMessage()}></p>
            <section class="flex flex-row gap-x-1">
              <button
                class="rounded-lg bg-surface0 hover:bg-mantle transition-colors px-2 py-1 grow"
                onClick={() => {
                  downloadingDialog.showModal();
                  const newSettings = settings()!;
                  newSettings.checkUpdateAutomatically = !checkboxRef.checked;
                  SettingsManager.saveSettings(newSettings);
                  invoke("update_app");
                }}
              >
                Yes
              </button>
              <button
                class="rounded-lg bg-surface0 hover:bg-mantle transition-colors px-2 py-1 mx-2 grow-1"
                onClick={() => {
                  const newSettings = settings()!;
                  newSettings.checkUpdateAutomatically = !checkboxRef.checked;
                  SettingsManager.saveSettings(newSettings);
                  updateDialog.close();
                }}
              >
                No
              </button>
            </section>
            <p class="mt-4 flex flex-row justify-center items-center text-center">
              Do Not Show Again:{" "}
              <input
                class="w-4 h-4 bg-surface0 mx-1 rounded-full transition-colors appearance-none checked:bg-green"
                type="checkbox"
                ref={checkboxRef}
              />
            </p>
          </div>
        </dialog>
        <dialog id="instanceDownloadError">
          <div class="bg-crust rounded-2xl p-8 flex flex-col max-w-[36rem]">
            <h1 class="text-3xl font-bold pb-4">{errorTitle()}</h1>
            <p class="text-subtext1 text-lg">{errorReason()}</p>
            <p>
              Report this error in the JPXS Discord if you don't know how to fix
              it.
            </p>
            <button
              class="rounded-xl px-4 py-1 mt-4 text-text bg-surface0 hover:bg-mantle transition-colors"
              onClick={() => {
                const dialog = document.querySelector(
                  "#instanceDownloadError"
                ) as HTMLDialogElement;
                dialog.close();
                setErrorTitle("");
                setErrorReason("");
              }}
            >
              Close
            </button>
          </div>
        </dialog>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/live" component={ServerList} />
          <Route path="/instances" component={Instances} />
          <Route path="/playersearch" component={PlayerSearch} />
          <Route path="/settings" component={Settings} />
          <Route path="*404" component={NotFound} />
        </Router>
      </main>
    </ErrorBoundary>
  );
}

export default App;
export { errorReason, setErrorReason, errorTitle, setErrorTitle };
