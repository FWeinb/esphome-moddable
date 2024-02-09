import MDNS from "mdns";

export type ServiceInfo = {
  /// EspHome Version
  version: string,
  // Human-readable name of the device
  friendly_name: string,
  // MAC address of the device
  mac: string,
  // Platform of the device (e.g. ESP8266, ESP32, etc)
  platform: string,
  // Board (e.g. esp01, nodemcu, etc)
  board: string,
  // Network type (wifi, ethernet)
  network: "wifi" | "ethernet",
  // API encryption type
  api_encryption?: "Noise_NNpsk0_25519_ChaChaPoly_SHA256",
  // Project name
  project_name?: string,
  // Project version
  project_version?: string,
  // Dashbaord import URL
  package_import_url?: string,
}

export default function setupAdvertisment(hostName: string, serviceInfo: ServiceInfo) {
  const mdns = new MDNS(
    { hostName }, 
    (message, value) => {
      if (message === 1 && value === hostName) {
        mdns.add({
          name: "esphomelib", 
          protocol: "tcp", 
          port: 6053, 
          txt: serviceInfo
        });
      }
    }
  );
  return mdns;
}