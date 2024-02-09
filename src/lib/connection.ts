import TCP from "embedded:io/socket/tcp";

import { Reader } from "./utils/reader.js";
import type Server from "./server.js";
import {
  ConnectRequest,
  ConnectResponse,
  DeviceInfoRequest,
  DeviceInfoResponse,
  HelloRequest,
  HelloResponse,
} from "./gen/esphome_pb.js";
import type { Message } from "@bufbuild/protobuf";

export type ConnectionOptions = {
  server: Server;
  from: TCP;
};

export default class Connection {
  private server: Server;
  private tcp: TCP;

  constructor({ server, from }: ConnectionOptions) {
    this.server = server;
    this.tcp = new TCP({
      from,
      onReadable: this.onReadable.bind(this),
      onWritable: this.onWritable.bind(this),
      onError: this.onError.bind(this),
      format: "buffer"
    });
  }

  private onReadable(bytes: number) {
    trace(`Connection - onReadable: ${bytes}\n`);
    const buffer = this.tcp.read(bytes) as ArrayBuffer;
    this.parseRequest(buffer);
  }

  private onWritable(bytes: number) {
    trace(`Connection - onWritable: ${bytes}\n`);
  }

  private onError() {
    trace(`Connection - onError\n`);
    this.server.detach(this);
    this.close();
  }

  private parseRequest(buffer: ArrayBuffer) {
    const reader = new Reader(buffer);

    if (reader.readByte() !== 0x00) {
      throw new Error("Invalid request");
    }

    const length = reader.readVarUInt();
    const type = reader.readVarUInt();

    const dataView = reader.getView(length);

    this.processRequest(type, dataView);
  }

  private sendResponse(type: number, message: Message) {
    const messageData = message.toBinary();
    trace(`Connection - toHex(messageData): ${toHex(messageData)}\n`)
    trace(`Connection - Sending response of type ${type}\n`);

    const varIntLength = to_varint(messageData.byteLength);
    const varIntType = type; // currently type is always < 127, to_varint(type);

    // Calling write multiple times to avoid copying a new buffer
    try {
      this.tcp.write(Uint8Array.of(0x00));
      this.tcp.write(Uint8Array.from(varIntLength));
      this.tcp.write(Uint8Array.of(varIntType));
      this.tcp.write(messageData);
    } catch (e) {
      // output buffer is full 
      // TODO: Handle this case
    }
  }

  private processRequest(type: number, data: Uint8Array) {
    switch (type) {
      case 1: {
        // 'HelloRequest'
        const helloRequest = HelloRequest.fromBinary(data);
        trace(`Connection - HelloRequest ${helloRequest.apiVersionMajor}.${helloRequest.apiVersionMinor} ${helloRequest.clientInfo}\n`);

        const response = new HelloResponse();
        response.apiVersionMajor = 1;
        response.apiVersionMinor = 9;
        response.serverInfo = "";
        response.name = "ESPHome on XS";

        this.sendResponse(2, response);
        break;
      }
      case 2: // 'HelloResponse'
        break;
      case 3: {
        // 'ConnectRequest'
        trace(`Connection - ConnectRequest\n`);
        const connectRequest = ConnectRequest.fromBinary(data);

        const response = new ConnectResponse();
        response.invalidPassword = false;
        this.sendResponse(2, response);
        break;
      }
      case 4: // 'ConnectResponse'
        break;
      case 5: // 'DisconnectRequest'
        break;
      case 6: // 'DisconnectResponse'
        break;
      case 7: // 'PingRequest'
        break;
      case 8: // 'PingResponse'
        break;
      case 9: // 'DeviceInfoRequest'
        trace(`Connection - DeviceInfoRequest\n`);
        const deviceInfoRequest = DeviceInfoRequest.fromBinary(data);

        const response = new DeviceInfoResponse();
        response.usesPassword = false;
        response.name = this.server.espHome.deviceInfo.name;
        response.macAddress = this.server.espHome.deviceInfo.macAddress;
        response.esphomeVersion = this.server.espHome.deviceInfo.version;
        response.model = this.server.espHome.deviceInfo.model;
        response.manufacturer = this.server.espHome.deviceInfo.manufacturer;
        response.friendlyName = this.server.espHome.deviceInfo.friendlyName;
        response.suggestedArea = this.server.espHome.deviceInfo.suggestedArea;

        this.sendResponse(10, response);
        break;
      case 10: // 'DeviceInfoResponse'
        break;
      case 11: // 'ListEntitiesRequest'
        break;
      case 12: // 'ListEntitiesBinarySensorResponse'
        break;
      case 13: // 'ListEntitiesCoverResponse'
        break;
      case 14: // 'ListEntitiesFanResponse'
        break;
      case 15: // 'ListEntitiesLightResponse'
        break;
      case 16: // 'ListEntitiesSensorResponse'
        break;
      case 17: // 'ListEntitiesSwitchResponse'
        break;
      case 18: // 'ListEntitiesTextSensorResponse'
        break;
      case 19: // 'ListEntitiesDoneResponse'
        break;
      case 20: // 'SubscribeStatesRequest'
        break;
      case 21: // 'BinarySensorStateResponse'
        break;
      case 22: // 'CoverStateResponse'
        break;
      case 23: // 'FanStateResponse'
        break;
      case 24: // 'LightStateResponse'
        break;
      case 25: // 'SensorStateResponse'
        break;
      case 26: // 'SwitchStateResponse'
        break;
      case 27: // 'TextSensorStateResponse'
        break;
      case 28: // 'SubscribeLogsRequest'
        break;
      case 29: // 'SubscribeLogsResponse'
        break;
      case 30: // 'CoverCommandRequest'
        break;
      case 31: // 'FanCommandRequest'
        break;
      case 32: // 'LightCommandRequest'
        break;
      case 33: // 'SwitchCommandRequest'
        break;
      case 34: // 'SubscribeHomeassistantServicesRequest'
        break;
      case 35: // 'HomeassistantServiceResponse'
        break;
      case 36: // 'GetTimeRequest'
        break;
      case 37: // 'GetTimeResponse'
        break;
      case 38: // 'SubscribeHomeAssistantStatesRequest'
        break;
      case 39: // 'SubscribeHomeAssistantStateResponse'
        break;
      case 40: // 'HomeAssistantStateResponse'
        break;
      case 41: // 'ListEntitiesServicesResponse'
        break;
      case 42: // 'ExecuteServiceRequest'
        break;
      case 43: // 'ListEntitiesCameraResponse'
        break;
      case 44: // 'CameraImageResponse'
        break;
      case 45: // 'CameraImageRequest'
        break;
      case 46: // 'ListEntitiesClimateResponse'
        break;
      case 47: // 'ClimateStateResponse'
        break;
      case 48: // 'ClimateCommandRequest'
        break;
      case 49: // 'ListEntitiesNumberResponse'
        break;
      case 50: // 'NumberStateResponse'
        break;
      case 51: // 'NumberCommandRequest'
        break;
      case 52: // 'ListEntitiesSelectResponse'
        break;
      case 53: // 'SelectStateResponse'
        break;
      case 54: // 'SelectCommandRequest'
        break;
      case 55: // 'ListEntitiesSirenResponse'
        break;
      case 56: // 'SirenStateResponse'
        break;
      case 57: // 'SirenCommandRequest'
        break;
      case 58: // 'ListEntitiesLockResponse'
        break;
      case 59: // 'LockStateResponse'
        break;
      case 60: // 'LockCommandRequest'
        break;
      case 61: // 'ListEntitiesButtonResponse'
        break;
      case 62: // 'ButtonCommandRequest'
        break;
      case 63: // 'ListEntitiesMediaPlayerResponse'
        break;
      case 64: // 'MediaPlayerStateResponse'
        break;
      case 65: // 'MediaPlayerCommandRequest'
        break;
      case 66: // 'SubscribeBluetoothLEAdvertisementsRequest'
        break;
      case 67: // 'BluetoothLEAdvertisementResponse'
        break;
      case 68: // 'BluetoothDeviceRequest'
        break;
      case 69: // 'BluetoothDeviceConnectionResponse'
        break;
      case 70: // 'BluetoothGATTGetServicesRequest'
        break;
      case 71: // 'BluetoothGATTGetServicesResponse'
        break;
      case 72: // 'BluetoothGATTGetServicesDoneResponse'
        break;
      case 73: // 'BluetoothGATTReadRequest'
        break;
      case 74: // 'BluetoothGATTReadResponse'
        break;
      case 75: // 'BluetoothGATTWriteRequest'
        break;
      case 76: // 'BluetoothGATTReadDescriptorRequest'
        break;
      case 77: // 'BluetoothGATTWriteDescriptorRequest'
        break;
      case 78: // 'BluetoothGATTNotifyRequest'
        break;
      case 79: // 'BluetoothGATTNotifyDataResponse'
        break;
      case 80: // 'SubscribeBluetoothConnectionsFreeRequest'
        break;
      case 81: // 'BluetoothConnectionsFreeResponse'
        break;
      case 82: // 'BluetoothGATTErrorResponse'
        break;
      case 83: // 'BluetoothGATTWriteResponse'
        break;
      case 84: // 'BluetoothGATTNotifyResponse'
        break;
      case 85: // 'BluetoothDevicePairingResponse'
        break;
      case 86: // 'BluetoothDeviceUnpairingResponse'
        break;
      case 87: // 'UnsubscribeBluetoothLEAdvertisementsRequest'
        break;
      case 88: // 'BluetoothDeviceClearCacheResponse'
        break;
      case 93: // 'BluetoothLERawAdvertisementsResponse'
        break;
      case 97: // 'ListEntitiesTextResponse'
        break;
      case 98: // 'TextStateResponse'
        break;
      case 99: // 'TextCommandRequest'
        break
    }
  }

  close() {
    this.tcp.close();
  }
}

function toHex(buffer: ArrayLike<number> | ArrayBuffer) {
  return Array.prototype.map
    .call(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

// Create Protobuf's VarInt encoding
function to_varint(value) {
  if (value <= 0x7f) return [value];
  const result = [];
  while (value) {
    const temp = value & 0x7f;
    value >>= 7;
    result.push(value ? temp | 0x80 : temp);
  }

  return result;
}
