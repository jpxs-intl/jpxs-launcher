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
  private listeners: Array<(instances: Instance[]) => undefined> = new Array();
  constructor() {
    this.settings = SettingsManager.getSettings();
    if (this.settings) {
      this.instances = this.settings.instances;
    }
    SettingsManager.onSettingsChange((val) => {
      this.settings = val;
      this.instances = val.instances;
      this.listeners.forEach((val) => {
        val(this.instances);
      });
    });
  }

  addInstance(instance: Instance) {
    if (this.settings) {
      instance.path = `${this.settings.installLocation}/${instance.name}`;
      this.instances.unshift(instance);
      this.settings.instances = this.instances;
      this.listeners.forEach((val) => {
        val(this.instances);
      });
      return invoke("download_instance_command", {
        instance: convertInstanceToRust(instance),
      });
    } else {
      console.error("Settings not loaded");
    }
  }

  getInstances() {
    return this.instances;
  }

  onInstanceChange(callback: (instances: Instance[]) => undefined) {
    this.listeners.push(callback);
  }

  deleteInstance(instance: Instance) {
    if (this.settings) {
      this.instances.splice(
        this.instances.findIndex((val) => instance.name === val.name),
        1
      );
      this.settings.instances = this.instances;
      this.listeners.forEach((val) => {
        val(this.instances);
      });
      invoke("delete_instance_command", {
        instance: convertInstanceToRust(instance),
      });
    }
  }
}

const InstanceManager = new InstanceManagerConstructor();
export { InstanceManager };
