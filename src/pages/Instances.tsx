import { Icon } from "solid-heroicons";
import Sidebar from "../components/Sidebar";
import { trash, plus } from "solid-heroicons/outline";
import { createEffect, createSignal, For } from "solid-js";
import {
  convertInstanceToRust,
  Instance,
  SettingsManager,
} from "../SettingsManager";
import { InstanceManager } from "../InstanceManager";
import freeweekend from "../assets/freeweekend.png";
import subrosa from "../assets/subrosa.png";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
const buildNumbers = new Map<number, string>([
  [38, "f"],
  [37, "c"],
]);

export function InstanceComponent(props: {
  instance: Instance;
  deleteMode: boolean;
}) {
  const instance = props.instance;
  return (
    <button
      class={`bg-surface0 ${
        props.deleteMode ? "hover:bg-red border-red border-2" : "hover:bg-crust"
      } transition-colors duration-100 px-4 py-2 rounded-xl flex flex-row gap-x-2`}
      onClick={() => {
        if (props.deleteMode) {
          InstanceManager.deleteInstance(instance);
          SettingsManager.saveSettings();
        } else {
          invoke("open_instance_command", {
            instance: convertInstanceToRust(instance),
          });
        }
      }}
    >
      <img
        src={instance.isFreeWeekend ? freeweekend : subrosa}
        class="w-24 h-24 rounded-xl"
      />
      <div class="text-left">
        <h1 class="text-2xl font-bold">{instance.name}</h1>
        <h2 style={`color: hsl(${instance.version * 45}, 100%, 60%)`}>
          {instance.version}
          {buildNumbers.get(instance.version)}
        </h2>
      </div>
    </button>
  );
}

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
export default function () {
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
      <Sidebar />
      <section class="ml-72 mr-12">
        <h1 class="text-center text-3xl font-bold pt-12 pb-8">Instances</h1>
        <hr class="border-surface0" />
        <div class="flex flex-row my-4 gap-x-4">
          <button
            class={`flex flex-row transition-colors duration-100 hover:bg-crust pl-2 pr-4 py-2 rounded-xl bg-surface0`}
            onClick={() => {
              (
                document.querySelector(
                  "#instanceCreationDialog"
                ) as HTMLDialogElement
              ).showModal();
            }}
          >
            <Icon path={plus} class="w-6 h-6 mr-2" /> Add Instance
          </button>
          <button
            class={`flex flex-row transition-colors duration-100 hover:bg-crust pl-2 pr-4 py-2 rounded-xl bg-surface0`}
            onClick={() => {
              setDeleteMode(!deleteMode());
            }}
          >
            <Icon path={trash} class="w-6 h-6 mr-2" /> Delete Instance
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
