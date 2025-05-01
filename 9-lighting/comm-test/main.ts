import './style.css';
// import {Server, Client} from "../kcaj-p2p/src"
import { WSClient } from "../kcaj-p2p/src"

let aWindow = (window as any);
aWindow.host = host;
aWindow.join = join;
(document.getElementById("group") as HTMLInputElement).value = "demo"


async function host() {
    let group = (document.getElementById("group") as HTMLInputElement).value
    let websocket = new WebSocket("wss://mythos.tailnet-3006.ts.net/ws/" + group)
    let name = (document.getElementById("name") as HTMLInputElement).value
    let client = new WSClient(websocket, name)
    client.on('data', (data) => {
        (document.getElementById("textout") as HTMLTextAreaElement).textContent += data + "\n"
    })
    // websocket.onopen = () => {
    //    let name = (document.getElementById("name") as HTMLInputElement).value
    //     let client = new WSClient(websocket, name)
    //    let server = new Server(websocket, name)
    //    server.on('data', (data) => {
    //        server.send(data);
    //        (document.getElementById("textout") as HTMLTextAreaElement).textContent += data + "\n"
    //    })
    //    server.on('error', (e) => console.log(e))
    //    server.on('closed', (e) => console.log(e))
    aWindow.send = () => {
        let msg = (document.getElementById("msg")! as HTMLInputElement).value;
        (document.getElementById("textout") as HTMLTextAreaElement).textContent += msg + "\n"
        client.send(msg)
    }
    // }
}

async function join() {
    let group = (document.getElementById("group") as HTMLInputElement).value
    let websocket = new WebSocket("wss://mythos.tailnet-3006.ts.net/ws/" + group)
    let name = (document.getElementById("name") as HTMLInputElement).value
    let client = new WSClient(websocket, name)
    client.on('data', (data) => {
        (document.getElementById("textout") as HTMLTextAreaElement).textContent += data + "\n"
    })
    // websocket.onopen = () => {
    //     let name = (document.getElementById("name") as HTMLInputElement).value
    //     let client = new WSClient(websocket, name)
    //     window.client = client
    //    let client = new Client(websocket, name)
    //    client.on('data', (data) => {
    //        (document.getElementById("textout") as HTMLTextAreaElement).textContent += data + "\n"
    //    })
    //    client.on('connected', () => console.log("CONNECTED!"))
    //    client.on('error', (e) => console.log(e))
    //    client.on('closed', (e) => console.log(e))
    aWindow.send = () => {
        let msg = (document.getElementById("msg")! as HTMLInputElement).value
        client.send(msg)
    }
    // }
}
