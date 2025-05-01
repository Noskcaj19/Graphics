import {Peer} from "./Peer.js";

export interface Listener<T> {
    (event: T): any
}

export class Client {
    readonly id: string
    readonly websocket: WebSocket
    peer: Peer;
    private signalHandlers: Map<string, Listener<any>[]> = new Map();

    constructor(websocket: WebSocket, id: string) {
        this.websocket = websocket
        this.id = id

        this.peer = new Peer({initiator: true})
        this.peer.on('data', (d) => {
            if (d.from === this.id ) return
            this.emit('data', d)
        })
        this.peer.on('signal', (event) => {
            websocket.send(JSON.stringify({actual: event, from: id}))
        })
        this.peer.on('error', (e) => this.emit('error', e))
        this.peer.on('close', (e) => this.emit('close', e))
        this.peer.on('connected', (e) => this.emit('connected', e))
        websocket.onmessage = (ev) => {
            let msg = JSON.parse(ev.data)
            if (msg.from === id) {
                return
            }
            if (msg.to !== undefined && msg.to !== id) {
                return
            }
            // Only server needs to respond to offers
            if (msg.actual.type === "offer") return
            this.peer.signal(msg.actual)
        }
    }

    send(data: any) {
        this.peer.send(data)
    }

    on(event: string, cb: Listener<any>) {
        if (!this.signalHandlers.get(event)) {
            this.signalHandlers.set(event, [])
        }
        this.signalHandlers.get(event)!.push(cb)
    }

    private emit(event: string, data: any) {
        for (let cb of this.signalHandlers.get(event) ?? []) {
            cb(data)
        }
    }
}

export class Server {
    readonly id: string
    readonly websocket: WebSocket
    private signalHandlers: Map<string, Listener<any>[]> = new Map();
    connections = new Map<string, Peer>()

    constructor(websocket: WebSocket, id: string) {
        this.websocket = websocket
        this.id = id

        websocket.onmessage = (ev) => {
            let msg = JSON.parse(ev.data)
            if (msg.from === id) {
                return
            }
            let peer = this.connections.get(msg.from)
            if (!peer) {
                peer = new Peer({initiator: false})
                this.connections.set(msg.from, peer)
                peer.on('data', (d) => {
                    if (d.from === this.id ) return
                    this.emit('data', d)
                })
                peer.on('close', () =>{
                    this.connections.delete(msg.from)
                })
                peer.on('error', () =>{
                    this.connections.delete(msg.from)
                })
                peer.on('signal', (event) => {
                    websocket.send(JSON.stringify({actual: event, from: id, to: msg.from}))
                })
            }
            peer.signal(msg.actual)
        }
    }

    send(data: any) {
        for (let [_name, peer] of this.connections) {
            peer.send(data)
        }
    }

    on(event: string, cb: Listener<any>) {
        if (!this.signalHandlers.get(event)) {
            this.signalHandlers.set(event, [])
        }
        this.signalHandlers.get(event)!.push(cb)
    }

    private emit(event: string, data: any) {
        for (let cb of this.signalHandlers.get(event) ?? []) {
            cb(data)
        }
    }
}
