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

function convertToRust(settings: Settings): RustSettings {
  return {
    install_location: settings.installLocation,
    instances: settings.instances,
    settings_version: settings.settingsVersion,
  };
}

function convertToTs(settings: RustSettings): Settings {
  return {
    installLocation: settings.install_location,
    instances: settings.instances,
    settingsVersion: settings.settings_version,
  };
}

class SettingsManagerConstructor {
  private settings?: Settings;
  constructor() {
    invoke<RustSettings>("get_settings_command")
      .then((settings) => {
        console.log(settings);
        this.settings = convertToTs(settings);
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  getSettings() {
    return this.settings;
  }

  saveSettings(settings?: Settings) {
    if (settings) {
      this.settings = settings;
    }
    invoke("save_settings_command", {
      settings: convertToRust(this.settings!),
    }).catch(console.error);
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
