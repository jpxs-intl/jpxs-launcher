import { invoke } from "@tauri-apps/api/core";

export interface Instance {
  name: string;
  version: number;
  isFreeWeekend: boolean;
  path?: string;
}

export interface RustInstance {
  name: string;
  version: number;
  is_free_weekend: boolean;
  path: string;
}

export function convertInstanceToRust(instance: Instance): RustInstance {
  if (!instance.path) {
    console.error("No instance path. Things will go wrong :D");
  }
  return {
    name: instance.name,
    version: instance.version,
    is_free_weekend: instance.isFreeWeekend,
    path: instance.path!,
  };
}

export function convertInstanceToTs(instance: RustInstance): Instance {
  return {
    name: instance.name,
    version: instance.version,
    isFreeWeekend: instance.is_free_weekend,
    path: instance.path,
  };
}

export interface Settings {
  installLocation: string;
  instances: Instance[];
  lastPlayed: string | null;
  settingsVersion: number;
  checkUpdateAutomatically: boolean;
}

export interface RustSettings {
  install_location: string;
  instances: RustInstance[];
  last_played: string | null;
  settings_version: number;
  check_update_automatically: boolean;
}

function convertToRust(settings: Settings): RustSettings {
  return {
    install_location: settings.installLocation,
    last_played: settings.lastPlayed,
    instances: settings.instances.map(convertInstanceToRust),
    settings_version: settings.settingsVersion,
    check_update_automatically: settings.checkUpdateAutomatically,
  };
}

function convertToTs(settings: RustSettings): Settings {
  return {
    installLocation: settings.install_location,
    lastPlayed: settings.last_played,
    instances: settings.instances.map(convertInstanceToTs),
    settingsVersion: settings.settings_version,
    checkUpdateAutomatically: settings.check_update_automatically,
  };
}

class SettingsManagerConstructor {
  private settings?: Settings;
  private listeners: Array<(settings: Settings) => undefined> = new Array();
  constructor() {
    this.forceFetchSettings();
  }

  getSettings() {
    return this.settings;
  }

  saveSettings(settings?: Settings) {
    if (settings) {
      this.settings = settings;
    }
    this.listeners.forEach((callback) => {
      callback(this.settings!);
    });
    invoke("save_settings_command", {
      settings: convertToRust(this.settings!),
    });
  }
  async forceFetchSettings() {
    const settings = await invoke<RustSettings>("get_settings_command");
    this.settings = convertToTs(settings);
    console.log("fetched settings");
    this.listeners.forEach((callback) => {
      callback(this.settings!);
    });
    return this.settings;
  }

  onSettingsChange(callback: (settings: Settings) => undefined) {
    this.listeners.push(callback);
  }
}

const SettingsManager = new SettingsManagerConstructor();
export { SettingsManager };
