import Listener from "embedded:io/socket/listener";

import Connection from "./connection.js";
import type EspHome from "./esphome.js";

export default class Server {
  public espHome: EspHome;
  private listener: Listener;
  private connections: Connection[];

  constructor(espHome: EspHome) {
    trace("Server - started on port 6053\n");
    this.espHome = espHome;
    this.connections = [];
    this.listener = new Listener({ 
      port: 6053, 
      onReadable: this.onReadable.bind(this) 
    });
  }

  private onReadable(requests: number) {
    while (requests--) {
      trace("Server - Create connection\n");
      const connection = new Connection({ 
        server: this,
        from: this.listener.read(),
      });
      this.connections.push(connection);
    }
  }

  detach(connection: Connection) {
		const i = this.connections.indexOf(connection);
		if (i < 0) throw new Error;

		this.connections.splice(i, 1);
  }
}