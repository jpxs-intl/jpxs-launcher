import { invoke } from "@tauri-apps/api/core";
import {
  Settings,
  SettingsManager,
  Instance,
  convertInstanceToRust,
} from "./SettingsManager";
import { setErrorReason, setErrorTitle } from "./App";
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

  async addInstance(instance: Instance) {
    if (this.settings) {
      let download = false;
      if (!instance.path) {
        download = true;
        if (await invoke("is_windows")) {
          instance.path = `${this.settings.installLocation}\\${instance.name}`;
        } else {
          instance.path = `${this.settings.installLocation}/${instance.name}`;
        }
      }
      this.instances.unshift(instance);
      this.settings.instances = this.instances;
      this.listeners.forEach((val) => {
        val(this.instances);
      });
      if (download) {
        return await invoke("download_instance_command", {
          instance: convertInstanceToRust(instance),
        }).then(
          () => undefined,
          (err) => {
            console.error("Error downloading instance:", err);
            this.deleteInstance(instance);
            return err;
          }
        );
      }
    } else {
      console.error("Settings not loaded");
    }
  }

  openInstance(instance: Instance) {
    if (this.settings) {
      this.settings.lastPlayed = instance.name;
      SettingsManager.saveSettings();
      invoke("open_instance_command", {
        instance: convertInstanceToRust(instance),
      }).catch((err) => {
        setErrorTitle("Failed to open instance");
        setErrorReason(
          `${err} This is usually caused by a corrupted instance. Try deleting the instance and re-adding it.`
        );
        (
          document.querySelector("#instanceDownloadError") as HTMLDialogElement
        ).showModal();
      });
    }
    this.listeners.forEach((callback) => {
      callback(this.instances);
    });
  }

  getInstances() {
    return this.instances;
  }

  onInstanceChange(callback: (instances: Instance[]) => undefined) {
    this.listeners.push(callback);
  }

  deleteInstance(instance: Instance) {
    if (this.settings) {
      if (instance.name === this.settings.lastPlayed) {
        this.settings.lastPlayed = null;
      }
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
