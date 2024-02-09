import type { EspHomeDeviceInfo } from "./lib/esphome.js";
import EspHome from "./lib/esphome.js";

const deviceInfo: EspHomeDeviceInfo = {
  name: "moddable-esphome-test",
  model: "model-a",
  board: "board-a",
  manufacturer: "manufacturer-a",
  friendlyName: "Moddable EspHome Test",
  suggestedArea: "Room A",
  platform: "platform-a",
  network: "wifi",

  projectName: "project-name-a",
  projectVersion: "1.0.0",
}

// Start EspHome
const espHome = new EspHome(deviceInfo);
