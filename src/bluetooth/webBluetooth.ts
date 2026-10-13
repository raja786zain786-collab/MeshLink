/**
 * Web Bluetooth API Integration.
 * Connects directly to physical BLE devices running MeshLink GATT Service
 * when running in supported desktop/Android Chrome browsers.
 */

export const MESHLINK_SERVICE_UUID = '0000fe60-0000-1000-8000-00805f9b34fb';
export const MESHLINK_RX_CHAR_UUID = '0000fe61-0000-1000-8000-00805f9b34fb';
export const MESHLINK_TX_CHAR_UUID = '0000fe62-0000-1000-8000-00805f9b34fb';

export class WebBleManager {
  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  static async requestDevice(): Promise<{
    name: string;
    id: string;
    connected: boolean;
    server?: unknown;
  } | null> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser. Use Chrome on Android or desktop with Bluetooth enabled.');
    }

    try {
      // @ts-expect-error Web Bluetooth API
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [MESHLINK_SERVICE_UUID],
      });

      const server = await device.gatt?.connect();
      return {
        name: device.name || 'Bluetooth Peripheral',
        id: device.id,
        connected: server?.connected ?? false,
        server,
      };
    } catch (e: unknown) {
      if ((e as Error).name === 'NotFoundError') {
        // User cancelled picker
        return null;
      }
      throw e;
    }
  }
}
