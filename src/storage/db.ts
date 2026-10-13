import { MeshMessage, PeerIdentity, RelayQueueItem, DiagnosticLog, DeviceSettings } from '../types/mesh';

const STORAGE_KEYS = {
  IDENTITY: 'meshlink_local_identity',
  CONTACTS: 'meshlink_contacts',
  MESSAGES: 'meshlink_messages',
  RELAY_QUEUE: 'meshlink_relay_queue',
  LOGS: 'meshlink_diagnostic_logs',
  SETTINGS: 'meshlink_device_settings',
};

export const defaultSettings: DeviceSettings = {
  relayOptIn: true,
  maxHops: 5,
  maxQueueSize: 500,
  ttlHours: 24,
  batterySaver: false,
  enableVibration: true,
};

export class LocalStorageManager {
  static saveContacts(contacts: PeerIdentity[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to save contacts', e);
    }
  }

  static loadContacts(): PeerIdentity[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveMessages(messages: MeshMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages', e);
    }
  }

  static loadMessages(): MeshMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveRelayQueue(queue: RelayQueueItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RELAY_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save relay queue', e);
    }
  }

  static loadRelayQueue(): RelayQueueItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RELAY_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveSettings(settings: DeviceSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  static loadSettings(): DeviceSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  static saveLogs(logs: DiagnosticLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(-300)));
    } catch (e) {
      console.error('Failed to save logs', e);
    }
  }

  static loadLogs(): DiagnosticLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.RELAY_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
  }
}
