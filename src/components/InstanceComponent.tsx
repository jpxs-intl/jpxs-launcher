import { InstanceManager } from "../InstanceManager";
import { Instance, SettingsManager } from "../SettingsManager";
import freeweekend from "../assets/freeweekend.png";
import subrosa from "../assets/subrosa.png";

const buildNumbers = new Map<number, string>([
  [99, "f"],
  [38, "f"],
  [37, "c"],
  [36, "b"],
  [34, "b"],
]);

export function InstanceComponent(props: {
  class?: string;
  instance?: Instance;
  deleteMode: boolean;
}) {
  const instance = props.instance;
  if (!instance) {
    return <></>;
  }
  return (
    <button
      class={`bg-surface0 ${
        props.deleteMode ? "hover:bg-red border-red border-2" : "hover:bg-crust"
      } transition-colors duration-100 px-4 py-2 rounded-xl flex flex-row gap-x-2 ${
        props.class
      }`}
      onClick={() => {
        if (props.deleteMode) {
          InstanceManager.deleteInstance(instance);
          SettingsManager.saveSettings();
        } else {
          InstanceManager.openInstance(instance);
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
          {instance.version === 99 ? 38 : instance.version}
          {buildNumbers.get(instance.version)}
          {instance.version === 99 ? " (No Custom Maps)" : ""}
        </h2>
      </div>
    </button>
  );
}
