import { Icon } from "solid-heroicons";
import Sidebar from "../components/Sidebar";
import { trash, plus, documentPlus, folderOpen } from "solid-heroicons/outline";
import { createEffect, createSignal, For, onMount } from "solid-js";
import { Instance, SettingsManager } from "../SettingsManager";
import { InstanceManager } from "../InstanceManager";
import { listen } from "@tauri-apps/api/event";
import { useSearchParams } from "@solidjs/router";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { InstanceComponent } from "../components/InstanceComponent";

function LoadingComponent() {
  let totalSize = 0;
  const [progress, setProgress] = createSignal(0);
  listen<{ totalSize: number; packets: number }>(
    "download_progress",
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
      id="instanceDownloadingDialog"
      class="rounded-xl bg-crust"
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

function CreateInstanceComponent(props: { instances: Instance[] }) {
  const [instanceTaken, setInstanceTaken] = createSignal(false);
  return (
    <dialog
      id="instanceCreationDialog"
      class="rounded-xl bg-crust"
      onClick={(event) => {
        var rect = event.target.getBoundingClientRect();
        var isInDialog =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (!isInDialog) {
          if (event.target instanceof HTMLDialogElement) {
            event.target.close();
          }
        }
      }}
    >
      <div class="text-text px-4 py-4 ">
        <h1 class="text-3xl font-bold pt-4 pb-8 text-center">
          Create Instance
        </h1>
        <section class="flex flex-col gap-y-2">
          <h2>
            Name:
            <input
              class={`bg-surface0 rounded-lg mx-2 ${
                instanceTaken() ? "border-red border-2" : ""
              }`}
              maxlength={32}
              id="instanceNameInput"
            ></input>
            <p class={`text-red ${instanceTaken() ? "" : "hidden"}`}>
              Instance already exists!
            </p>
          </h2>
          <h2>
            Version:
            <select
              class="bg-surface0 mx-2 text-black"
              id="instanceVersionDropdown"
            >
              <option value={38}>38</option>
              <option value={37}>37</option>
              <option value={36}>36</option>
              <option value={34}>34</option>
              <option value={25}>25</option>
            </select>
          </h2>
          <p class="text-subtext0 ">
            Note: You cannot change instance name after creating it.
          </p>
          <button
            class="bg-surface0 hover:bg-mantle px-4 py-2 rounded-lg"
            onClick={() => {
              const name = (
                document.querySelector("#instanceNameInput") as HTMLInputElement
              ).value;
              const version = (
                document.querySelector(
                  "#instanceVersionDropdown"
                ) as HTMLSelectElement
              ).value;
              let instanceExists = false;
              props.instances.forEach((instance) => {
                if (instance.name === name) {
                  instanceExists = true;
                }
              });

              if (instanceExists) {
                setInstanceTaken(true);
              } else {
                setInstanceTaken(false);
                (
                  document.querySelector(
                    "#instanceCreationDialog"
                  ) as HTMLDialogElement
                ).close();
                const dialog = document.querySelector(
                  "#instanceDownloadingDialog"
                ) as HTMLDialogElement;
                dialog.showModal();
                const promise = InstanceManager.addInstance({
                  name: name,
                  version: parseInt(version),
                  isFreeWeekend: true,
                });
                if (promise) {
                  promise.then(() => {
                    dialog.close();
                    SettingsManager.saveSettings();
                  });
                }
              }
            }}
          >
            Create Instance
          </button>
        </section>
      </div>
    </dialog>
  );
}

function InstanceImportComponent() {
  let pathRef!: HTMLParagraphElement;
  let versionRef!: HTMLSelectElement;
  let freeWeekendRef!: HTMLInputElement;
  const [invalidInstance, setInvalidInstance] = createSignal(false);
  return (
    <dialog
      class="rounded-xl bg-crust"
      id="instanceImportDialog"
      onClick={(event) => {
        var rect = event.target.getBoundingClientRect();
        var isInDialog =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (!isInDialog) {
          if (event.target instanceof HTMLDialogElement) {
            event.target.close();
          }
        }
      }}
    >
      <div class="px-4 py-4 text-text">
        <h1 class="font-bold text-2xl pt-4 pb-8 text-center">
          Import Instance
        </h1>
        <section class="flex flex-col gap-y-2 justify-items-start">
          <div>
            <p class="flex flex-row items-center">
              Instance Path:
              <button
                class={`bg-surface0 flex flex-row text-xs px-2 py-1 rounded-md my-2 mx-2 ${
                  invalidInstance() ? "border-red border-2" : ""
                }`}
                onClick={async () => {
                  const folder = await open({
                    directory: true,
                    canCreateDirectories: true,
                  });
                  if (folder) {
                    document.querySelector("#instanceFolderPath")!.innerHTML =
                      folder;
                  }
                }}
              >
                <Icon class="w-4 h-4 mr-2" path={folderOpen} />
                <p
                  class="text-subtext1 text-ellipsis"
                  ref={pathRef}
                  id="instanceFolderPath"
                ></p>
              </button>
            </p>
            <p class={`text-red ${invalidInstance() ? "" : "hidden"}`}>
              Invalid Instance Path
            </p>
          </div>

          <h2>
            Version:
            <select
              class="bg-surface0 mx-2 text-black"
              id="instanceVersionDropdown"
              ref={versionRef}
            >
              <option value={38}>38</option>
              <option value={37}>37</option>
              <option value={36}>36</option>
              <option value={34}>34</option>
              <option value={25}>25</option>
            </select>
          </h2>
          <p class="flex flex-row items-center">
            Is Free Weekend:{" "}
            <input
              class="w-4 h-4 bg-surface0"
              id="freeWeekendCheckbox"
              type="checkbox"
              ref={freeWeekendRef}
            />
          </p>
          <button
            class="bg-surface0 hover:bg-mantle px-4 py-2 rounded-lg"
            onClick={async () => {
              const path = pathRef.innerText;
              const version = parseInt(versionRef.value);
              const isFreeWeekend = freeWeekendRef!.checked;
              invoke("is_instance_command", { path: path })
                .then(() => {
                  setInvalidInstance(false);
                  InstanceManager.addInstance({
                    name: path.slice(path.lastIndexOf("/") + 1),
                    path: path,
                    version: version,
                    isFreeWeekend: isFreeWeekend,
                  });
                  SettingsManager.saveSettings();
                })
                .catch(() => {
                  setInvalidInstance(true);
                });
            }}
          >
            Import Instance
          </button>
        </section>
      </div>
    </dialog>
  );
}
export default function () {
  const [searchParams] = useSearchParams();
  if (searchParams.createInstance) {
    onMount(() => {
      (
        document.querySelector("#instanceCreationDialog") as HTMLDialogElement
      ).showModal();
    });
  }
  const [instances, setInstances] = createSignal<Instance[]>(
    InstanceManager.getInstances(),
    {
      equals: false,
    }
  );
  const [deleteMode, setDeleteMode] = createSignal(false);
  InstanceManager.onInstanceChange(setInstances);
  return (
    <>
      <LoadingComponent />
      <CreateInstanceComponent instances={instances()} />
      <InstanceImportComponent />
      <Sidebar />
      <section class="ml-72 mr-12">
        <h1 class="text-center text-3xl font-bold pt-12 pb-8">Instances</h1>
        <hr class="border-surface0" />
        <div class="flex flex-row my-4 gap-x-4">
          <button
            class={`flex flex-row transition-colors duration-100 hover:bg-crust pl-1 pr-2 py-2 rounded-xl bg-surface0`}
            onClick={() => {
              (
                document.querySelector(
                  "#instanceCreationDialog"
                ) as HTMLDialogElement
              ).showModal();
            }}
          >
            <Icon path={plus} class="w-6 h-6 mr-1" /> Add Instance
          </button>
          <button
            class={`flex flex-row transition-colors duration-100 hover:bg-crust pl-1 pr-2 py-2 rounded-xl bg-surface0`}
            onClick={() => {
              setDeleteMode(!deleteMode());
            }}
          >
            <Icon path={trash} class="w-5 h-6 mr-1" /> Delete Instance
          </button>
          <button
            class={`flex flex-row transition-colors duration-100 hover:bg-crust pl-1 pr-2 py-2 rounded-xl bg-surface0`}
            onClick={() => {
              (
                document.querySelector(
                  "#instanceImportDialog"
                ) as HTMLDialogElement
              ).showModal();
            }}
          >
            <Icon path={documentPlus} class="w-5 h-6 mr-1" /> Import Instance
          </button>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          <For each={instances()}>
            {(instance) => (
              <InstanceComponent
                instance={instance}
                deleteMode={deleteMode()}
              />
            )}
          </For>
        </div>
      </section>
    </>
  );
}
