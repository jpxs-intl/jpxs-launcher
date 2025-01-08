import { invoke } from "@tauri-apps/api/core";
import { Instance } from "./InstanceManager";

export interface Settings {
  installLocation: string;
  instances: Instance[];
  settingsVersion: number;
}

interface RustSettings {
  install_location: string;
  instances: Instance[];
  settings_version: number;
}

class SettingsManagerConstructor {
  private settings?: Settings;
  constructor() {
    invoke<RustSettings>("get_settings_command")
      .then((settings) => {
        console.log(settings);
        this.settings = {
          installLocation: settings.install_location,
          instances: settings.instances,
          settingsVersion: settings.settings_version,
        };
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  getSettings() {
    return this.settings;
  }

  async forceFetchSettings() {
    const settings = await invoke<RustSettings>("get_settings_command");
    this.settings = {
      installLocation: settings.install_location,
      instances: settings.instances,
      settingsVersion: settings.settings_version,
    };
    return settings;
  }
}

const SettingsManager = new SettingsManagerConstructor();
export { SettingsManager };
