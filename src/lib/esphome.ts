import Net from 'net';
import MDNS from 'mdns';
import Server from './server.js';
import setupAdvertisment from './advertisment.js';

export type FullEspHomeDeviceInfo = {
  name: string
  macAddress: string
  board: string
  model: string
  manufacturer: string
  version: string
  platform: string
  network: "wifi" | "ethernet",
  friendlyName: string
  suggestedArea: string
  projectName: string
  projectVersion: string
}

export type EspHomeDeviceInfo = Omit<FullEspHomeDeviceInfo, "version" | "macAddress">

export default class EspHome {
  private mdns: MDNS;
  private server: Server;
  public deviceInfo: FullEspHomeDeviceInfo;

  constructor(deviceInfo: EspHomeDeviceInfo) {
    this.deviceInfo = {
      ...deviceInfo,
      version: "1.10.0",
      macAddress: Net.get("MAC")
    };
    this.mdns = setupAdvertisment(`${deviceInfo.name}.local`, {
      "version": this.deviceInfo.version,
      "board": this.deviceInfo.board,
      "friendly_name": this.deviceInfo.friendlyName,
      "platform": this.deviceInfo.platform,
      "network": this.deviceInfo.network,
      "mac": this.deviceInfo.macAddress,
      "project_name": this.deviceInfo.projectName,
      "project_version": this.deviceInfo.projectVersion
    });
    this.server = new Server(this);
  }
}