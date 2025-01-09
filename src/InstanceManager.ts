import { invoke } from "@tauri-apps/api/core";
import {
  Settings,
  SettingsManager,
  Instance,
  convertInstanceToRust,
} from "./SettingsManager";
class InstanceManagerConstructor {
  private settings?: Settings;
  private instances: Instance[] = new Array();

  constructor() {
    this.settings = SettingsManager.getSettings();
    if (this.settings) {
      this.instances = this.settings.instances;
    }
    SettingsManager.onSettingsChange((val) => {
      this.settings = val;
      this.instances = val.instances;
    });
  }

  addInstance(instance: Instance) {
    if (this.settings) {
      instance.path = `${this.settings.installLocation}/${instance.name}`;
      this.instances.push(instance);
      this.settings.instances = this.instances;
      invoke("download_instance_command", {
        instance: convertInstanceToRust(instance),
      }).catch(console.error);
    } else {
      console.error("Settings not loaded");
    }
  }
}

const InstanceManager = new InstanceManagerConstructor();
export { InstanceManager };
