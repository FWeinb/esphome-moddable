export class Reader {
  private buffer: ArrayBuffer;
  private view: DataView;
  private offset: number;

  constructor(buffer: ArrayBuffer) {
    this.buffer = buffer;
    this.view = new DataView(buffer);
    this.offset = 0;
  }

  lengthInBytes(): number { 
    return this.buffer.byteLength;
  }

  readByte(): number {
    return this.view.getUint8(this.offset++);
  }

  readVarUInt(): number {
    let result = 0;
    let shift = 0;
    while (true) {
      const byte = this.view.getUint8(this.offset++);
      result |= (byte & 0x7F) << shift;
      shift += 7;
      if ((byte & 0x80) === 0) {
        return result;
      }
    }
  }

  getView(length: number): Uint8Array {
    if (this.offset + length > this.buffer.byteLength) {
      throw new Error("Buffer is smaller than expected length");
    }
    return new Uint8Array(this.buffer, this.offset, length);
  }
}