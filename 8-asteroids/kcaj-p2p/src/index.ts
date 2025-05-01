export interface Listener<T> {
    (event: T): any
}

export class WSClient {
    readonly id: string
    readonly ws: WebSocket
    private signalHandlers: Map<string, Listener<any>[]> = new Map();

    constructor(ws: WebSocket, id: string) {
        this.ws = ws
        this.id = id
        this.ws.addEventListener('close', (e) => { this.emit('close', e) })
        this.ws.addEventListener('error', (e) => { this.emit('error', e) })
        this.ws.addEventListener('open', (e) => { this.emit('connected', e) })
        this.ws.addEventListener('message', (e) => { this.emit('data', e.data) })
    }

    send(data: any) {
        this.ws.send(data)
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
