import { HTTP } from '@ionic-native/http';
import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { NetworkInterface } from '@ionic-native/network-interface';
import { Logger } from './logger';
import { Storage } from '@ionic/storage';

const TRAKKIT_WIFI_IP_PREFIX = '10.123.45.';
// local server
// export const TRAKKIT_URL = `http://localhost:8888`;
export const TRAKKIT_URL = `http://10.123.45.1`;
export const TRAKKIT_MAC_KEY = 'TRAKKIT_MAC_KEY';

@Injectable()
export class TrakkitProvider {
  public static isValidMAC(mac: string, isFull = false) {
    if (typeof mac !== 'string') {
      return false;
    }

    if (isFull) {
      return /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/.test(mac);
    } else {
      return /^[a-fA-F0-9]{12}$/.test(mac);
    }
  }

  public static toLocalFormat(mac: string) {
    return mac.replace(/[^a-z0-9]+/ig, '');
  }

  constructor(
    private networkInterface: NetworkInterface,
    private network: Network,
    private logger: Logger,
    private storage: Storage,
    private http: HTTP
  ) { }

  public async isAvailable(): Promise<boolean> {
    this.logger.info(`TrakkitProvider::network_type: ${this.network.type}`);

    switch (this.network.type) {
      case 'wifi':
        try {
          const info = ((await this.networkInterface.getWiFiIPAddress()) as any) as { ip: string; subnet: string };

          this.logger.info(`TrakkitProvider::wifi:info: ${JSON.stringify(info)}`);

          if (info.ip.startsWith(TRAKKIT_WIFI_IP_PREFIX)) {
            this.logger.info(`TrakkitProvider::wifi: prefix matched "${TRAKKIT_WIFI_IP_PREFIX}" ~ "${info.ip}"`);

            return true;
          } else {
            this.logger.info(
              `TrakkitProvider::wifi: prefix doesn't match "${TRAKKIT_WIFI_IP_PREFIX}" ~ "${info.ip}"`
            );

            return false;
          }
        } catch (error) {
          this.logger.error(`TrakkitProvider::wifi:error`);
          this.logger.error(error);

          return false;
        }

      case 'none':
        this.logger.info(`TrakkitProvider::no_internet_connection`);

      default:
        this.logger.info(`TrakkitProvider::default`);

        return false;
    }
  }

  public async storeMAC() {
    return new Promise<{
      mac: string;
      formattedMac: string;
    }>(async (resolve, reject) => {
      this.http.get(`${TRAKKIT_URL}/mymac.txt`, {}, {})
        .then(async ({ data: mac }) => {
          const isValidMAC = TrakkitProvider.isValidMAC(mac, true);

          if (isValidMAC) {
            const formattedMac = TrakkitProvider.toLocalFormat(mac);
            this.logger.debug(`External MAC available: ${mac}, Formatted MAC: ${formattedMac}`);

            // save MAC
            await this.storage.set(TRAKKIT_MAC_KEY, formattedMac);

            resolve({
              mac,
              formattedMac
            });
          } else {
            this.logger.debug(`External MAC is not valid: ${JSON.stringify(mac)}`);
            reject(new Error(`MAC is not valid`));
          }
        })
        .catch((error) => {
          this.logger.debug(`External MAC error: ${JSON.stringify(error)}`);

          reject(error);
        });
    });
  }
}
