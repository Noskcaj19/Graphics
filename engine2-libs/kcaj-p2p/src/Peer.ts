const peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.stunprotocol.org:3478'},
        {'urls': 'stun:stun.l.google.com:19302'},
        {
            urls: 'turn:68.200.196.110:3478',
            username: 'demo',
            credential: 'test'
        }

    ]
}

export class Peer {
    private readonly initiator: boolean;
    private pc: RTCPeerConnection;
    private signalHandlers: { [x: string]: ((data: any) => void)[]; } = {};
    private datachannel: RTCDataChannel | null = null;

    constructor({initiator}: { initiator: boolean }) {
        this.initiator = initiator ?? false
        this.pc = new RTCPeerConnection(peerConnectionConfig)
        this.pc.onicecandidate = (event) => {
            this.emit('signal', {
                type: "candidate", candidate: {
                    candidate: event.candidate?.candidate,
                    sdpMid: event.candidate?.sdpMid,
                    sdpMLineIndex: event.candidate?.sdpMLineIndex,
                }
            })
        }

        if (initiator) {
            this.datachannel = this.pc.createDataChannel("myDataChannel")
            this.setupChannelHandlers(this.datachannel)
        } else {
            this.pc.ondatachannel = (event) => {
                this.datachannel = event.channel
                this.setupChannelHandlers(event.channel)
            }
        }

        this.pc.onnegotiationneeded = (_ev) => {
            this.renegotiate()
        }


        if (!this.initiator) {
            this.renegotiate()
        }
    }

    send(data: any) {
        if (this.datachannel) {
            this.datachannel.send(data)
        }
    }

    setupChannelHandlers(channel: RTCDataChannel) {
        channel.onmessage = (event) => {
            this.emit('data', event.data)
        }

        channel.onopen = (event) => {
            console.debug(event)
            this.emit('connected', event)
        }
        channel.onclose = (event) => {
            console.warn(event)
            this.emit('close', event)
        }
        channel.onerror = (event) => {
            console.error(event)
            alert("channel error")
            this.emit('error', event)
        }
    }


    async renegotiate() {
        if (this.initiator) {
            let offer = await this.pc.createOffer()
            await this.pc.setLocalDescription(offer)
            this.emit('signal', offer)
        }
    }

    on(event: string, cb: (data: any) => void): void {
        (this.signalHandlers[event] ??= []).push(cb)
    }

    emit(event: string, data: any): void {
        for (let cb of this.signalHandlers[event] ?? []) {
            cb(data)
        }
    }

    async createAnswer() {
        let answer = await this.pc.createAnswer()

        await this.pc.setLocalDescription(answer)
        this.emit('signal', answer)
    }

    signal(data: any) {
        (async () => {
            if (data.sdp) {
                await this.pc.setRemoteDescription(new RTCSessionDescription(data))
                if (this.pc.remoteDescription?.type === "offer") {
                    await this.createAnswer()
                }
            }
            if (data.candidate) {
                await this.pc.addIceCandidate(data.candidate)
            }
        })()
    }
}

