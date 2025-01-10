import { Icon } from "solid-heroicons";
import Sidebar from "../components/Sidebar";
import { pencilSquare, plus } from "solid-heroicons/outline";
import { createSignal, For, Show } from "solid-js";
import { Instance, SettingsManager } from "../SettingsManager";
import { InstanceManager } from "../InstanceManager";
import freeweekend from "../assets/freeweekend.png";
import subrosa from "../assets/subrosa.png";
import { Portal } from "solid-js/web";
const buildNumbers = new Map<number, string>([
  [38, "e"],
  [37, "c"],
]);
export function InstanceComponent(props: { instance: Instance }) {
  const instance = props.instance;
  return (
    <div class="bg-surface0 hover:bg-crust transition-colors duration-100 px-4 py-2 rounded-xl flex flex-row gap-x-2">
      <img
        src={instance.isFreeWeekend ? freeweekend : subrosa}
        class="w-24 h-24 rounded-xl"
      />
      <div>
        <h1 class="text-2xl font-bold">{instance.name}</h1>
        <h2 style={`color: hsl(${instance.version * 45}, 100%, 60%)`}>
          {instance.version}
          {buildNumbers.get(instance.version)}
        </h2>
      </div>
    </div>
  );
}

export default function () {
  const [instanceTaken, setInstanceTaken] = createSignal(false);
  const [instances, setInstances] = createSignal<Instance[]>(
    InstanceManager.getInstances(),
    {
      equals: false,
    }
  );
  InstanceManager.onInstanceChange(setInstances);

  return (
    <>
      <dialog
        id="instanceDownloadingDialog"
        class="rounded-xl bg-crust"
        onInput={(event) => {
          event.preventDefault();
        }}
      >
        <div class="text-text px-4 py-4">Loading...</div>
      </dialog>
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
                  document.querySelector(
                    "#instanceNameInput"
                  ) as HTMLInputElement
                ).value;
                const version = (
                  document.querySelector(
                    "#instanceVersionDropdown"
                  ) as HTMLSelectElement
                ).value;
                let instanceExists = false;
                instances().forEach((instance) => {
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
      <Sidebar />
      <section class="ml-72 mr-12">
        <h1 class="text-center text-3xl font-bold pt-12 pb-8">Instances</h1>
        <hr class="border-surface0" />
        <div class="flex flex-row my-4 gap-x-4">
          <button
            class={`flex flex-row transition-colors duration-100 hover:bg-crust pl-2 pr-4 py-2 rounded-xl ${
              true ? "bg-surface0" : "bg-mantle"
            }`}
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
        </div>
        <div class="flex flex-row">
          <For each={instances()}>
            {(instance) => <InstanceComponent instance={instance} />}
          </For>
        </div>
      </section>
    </>
  );
}
