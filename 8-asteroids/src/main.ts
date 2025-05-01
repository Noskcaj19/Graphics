import {WSClient} from "../kcaj-p2p/dist/index.js"

import {
    Renderer,
    PlaneWithNormals,
    GravityComponent,
    ManualBlender,
    Component,
    WobbleComponent,
    Collider,
    SphereColliderComponent,
    RectangleColliderComponent,
    Scene,
    Cube,
    Node,
    Icosphere,
    Gltf2Node, VertexColorMaterial
} from "./renderer";

// import {mat4, vec3, vec4, quat} from "gl-matrix";
// import * as glm from "gl-matrix"
import {mat4, vec3, vec4, quat} from "./glutils.js";
// import spector from "https://esm.sh/spectorjs@latest";
// import "https://esm.sh/webgl-lint@latest";
import {_, h, $} from "./libjackson.js";
import {
    PhysicsObject,
    PhysicsSystem,
    Transform,
    CollisionVolume,
    InertiaBuilder,
    OOBVolume,
    SphereVolume, AABBVolume
} from "../kcaj-physics/src";

class SelfDestruct extends Component {
    lifespan = 0

    constructor(lifespan) {
        super();
        this.lifespan = lifespan;
    }

    onUpdate(_timestamp, _frameDelta) {
        if (this.lifespan === 0) {
            this.node.dead = true
        }
        this.lifespan -= 1
    }
}


// import DefaultCube from "./assets/DefaultCube.gltf?raw"
// let defaultCube = await fetch("./assets/DefaultCube.gltf").then(r => r.text())
// let brickFloor = await fetch("./assets/BrickCube.gltf").then(r => r.text())
// let sphereGltf = await fetch("./assets/BlenderSphere.gltf").then(r => r.text())
// let khronosCubeGltf = await fetch("./assets/khronos_cube.gltf").then(r => r.text())
// let icosphereGltf = await fetch("./assets/icosphere.gltf").then(r => r.text())
import icosphereGltf from "../public/assets/icosphere.gltf?raw"
import sunGltf from "../public/assets/Sun.gltf?raw"
// var SPECTOR = new spector.Spector();
// SPECTOR.spyCanvases()
// SPECTOR.displayUI();

let parms = new URLSearchParams(window.location.search)
let host = parms.has("host")
let group = (parms.get("group") ?? "Testing") + "-asteroid"
let name = parms.get("name")

let websocket = new WebSocket("wss://mythos.tailnet-3006.ts.net/ws/" + group)
let client: WSClient | null


let canvas = document!.getElementById("root")! as HTMLCanvasElement
let gl = canvas.getContext("webgl2")!
canvas.addEventListener("click", async () => {
    await canvas.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement === canvas) {
        inputs["MouseRel"] = true
    } else {
        inputs["MouseRel"] = false
    }
}, false)

let controller: null | Gamepad = null
window.controller = controller

window.addEventListener("gamepadconnected", (event) => {
    console.log("A gamepad connected:");
    console.log(event.gamepad);
    controller = event.gamepad
});

window.addEventListener("gamepaddisconnected", (event) => {
    console.log("A gamepad disconnected:");
    console.log(event.gamepad);
    controller = null
});

function scangamepads() {
    let gamepads = navigator.getGamepads()
    controller = gamepads?.[0]
    if (controller != null) {
        console.log("got cont")
    }
}

// setInterval(scangamepads, 500)

let renderer = new Renderer(gl)
let scene = new Scene()

scene.setRenderer(renderer)

let physicsSystem = new PhysicsSystem();
physicsSystem.gravity = vec3.create();
physicsSystem.damping = 0;
(window as any).ps = physicsSystem;


class NetworkManager extends Component {
    public networkedNodes: Node[] = []
}

class NetworkReplicated extends Component {
    kind: string

    constructor(kind:string) {
        super()
        this.kind = kind

    }

    attach(node) {
        super.attach(node);
        node.scene.find(NetworkManager).networkedNodes.push(node)
    }
    //
    // toJson(): any {
    //     throw ''
    // }
    //
    // fromJson(_data: any): Node {
    //     throw ''
    // }
}

if (name) {
    client = new WSClient(websocket, name);
    client.on('connected', () => {
        client!.send(JSON.stringify({"kind": "peerJoin", "from": name}))
    })
    client.on('data', (m) => {
        let d = JSON.parse(m)
        if (d["kind"] === "peerJoin") {
            let nodesToSend = scene.components.find(NetworkManager)!.networkedNodes
            let dataToSend = nodesToSend.map(n => {
                return {
                    kind: n.components.find(NetworkReplicated)!.kind,
                    pos: n.translation,
                    rot: n.rotation,
                }
            })
            client!.send(JSON.stringify({from: name, kind: "peerJoinCurrentNodes", "data": dataToSend}))
        }
        if (d["kind"] === "peerJoinCurrentNodes") {
            let data = d["data"] as any[]
            // let nodes = d.map(d => NetworkReplicated.fromJson(d))
            for (let i of data) {
                if (i["kind"]==="player")  {

                }
            }

        }
    })
    scene.addComponent(new NetworkManager())
}

class PhysicsSystemComponent extends Component {
    onUpdate(_timestamp, frameDelta) {
        physicsSystem.update(frameDelta / 1000)
        physicsSystem.objects.forEach(o => o.transform.updateMatrices())
    }
}

scene.addComponent(new PhysicsSystemComponent())

// let cube1 = new Gltf2Node({str: sphereGltf})
// cube1.translation = new Vector3(.5, 7, 0)
// // cube1.scale = new Vector3(10,10,10)
// scene.addNode(cube1)
// let inverseMass = 1
// let cube1Po = new PhysicsObject(inverseMass, new SphereVolume(1), new Transform(cube1.translation))
// cube1Po.inverseInertia = InertiaBuilder.cube(new Vector3(1, 1, 1), inverseMass)
// cube1Po.gravity = false
// physicsSystem.objects.push(cube1Po)


class PhysicsObjectComponent extends Component {
    po!: PhysicsObject
    collideCBs: Array<(other: Node) => void> = []

    constructor(po: PhysicsObject) {
        super();
        this.po = po
    }

    attach(node) {
        super.attach(node);
        this.po.cbUserData = node
        this.po.addCollideCB((_o, n) => {
            this.collideCBs.forEach(cb => cb(n))
        })
        this.po.transform.worldPosition = this.node.translation
        this.po.transform.worldOrientation = this.node.rotation
    }

    onUpdate(_timestamp, _frameDelta) {
        this.node.translation = this.po.transform.worldPosition
        this.node.rotation = this.po.transform.worldOrientation
    }
}

class HealthComponent extends Component {
    health: number

    constructor(health) {
        super();
        this.health = health
    }

    damage(amount: number = 1) {
        this.health -= amount
        if (this.health <= 0) {
            this.node.dead = true
        }
    }
}

let makeAstroid = (radius: number = .76) => {
    let sphere = new Gltf2Node({str: icosphereGltf})
    sphere.scale = vec3.fromValues(radius, radius, radius)
    let inverseMass = radius
    let po = new PhysicsObject(inverseMass, new SphereVolume(radius), new Transform(vec3.create()))
    sphere.addComponent(new HealthComponent(3))

    let collisions = new Set()
    po.addCollideCB((o, node) => {
        if (node?.kind === "bullet") {
            if (collisions.has(node)) {
                return
            } else {
                collisions.add(node);
                (sphere.components.find(HealthComponent) as HealthComponent).damage()
            }
        }
    })
    po.inverseInertia = InertiaBuilder.sphere(radius, inverseMass)
    po.gravity = false
    sphere.po = po
    physicsSystem.objects.push(po)
    sphere.addComponent(new PhysicsObjectComponent(po))
    sphere.addComponent(new class extends Component {
        onUpdate(_timestamp, _frameDelta) {
            this.node.translation = po.transform.worldPosition
            this.node.rotation = po.transform.worldOrientation
        }
    })

    return sphere
}

function cloneMesh(node: Node) {
    let newNode: Node = new class extends Node {
        #wm

        get worldMatrix(): mat4 {
            if (!this.#wm) {
                this.#wm = super.worldMatrix
            }
            return this.#wm
        }
    }

    function regInstances(node: Node) {
        for (let p of node.renderPrimitives) {
            p.instances.push(newNode)
        }
        for (let c of node.children) {
            regInstances(c)
        }
    }

    regInstances(node)
    return newNode
}

let ico = new Gltf2Node({str: icosphereGltf})
scene.addNode(ico)
for (let i = 0; i < 10_000; i++) {
    let n = cloneMesh(ico)
    let spread = 500
    let r = () => {
        let v = _.urandom() * spread
        return v
    }
    n.translation = vec3.fromValues(r(), r(), r())
    if (Math.abs(n.translation[0]) < 50 || Math.abs(n.translation[1]) < 50 || Math.abs(n.translation[2]) < 50) {
        continue
    }
    scene.addNode(n)
}
scene.removeNode(ico)

for (let i = 0; i < 500; i++) {
    let a = makeAstroid(1)
    a.po.transform.worldPosition = vec3.fromValues(_.urandom() * 55, _.urandom() * 55, _.urandom() * 55)
    let po: PhysicsObject = a.po
    let s = .7
    po.applyAngularImpulse([_.urandom() * s, _.urandom() * s, _.urandom() * s])

    // po.applyLinearImpulse([_.urandom() * s, _.urandom() * s, _.urandom() * s])
    // s.addComponent(new class RandomSpin extends Component {
    //     s = vec3.fromValues(
    //         _.urandom()/10,
    //         _.urandom()/10,
    //         _.urandom()/10,
    //     )
    //
    //     onUpdate(_timestamp: any, _frameDelta: any): void {
    //         // quat.rotateX(this.node.po.transform.worldOrientation,this.node.po.transform.worldOrientation, this.s[0])
    //         // quat.rotateY(this.node.po.transform.worldOrientation,this.node.po.transform.worldOrientation, this.s[1])
    //         // quat.rotateZ(this.node.po.transform.worldOrientation,this.node.po.transform.worldOrientation, this.s[2])
    //     }
    // })
    scene.addNode(a)
}

let a1 = makeAstroid(1)
a1.po.transform.worldPosition = [2, 0, 0]
let po: PhysicsObject = a1.po
po.applyLinearImpulse(vec3.fromValues(-2, 0, 0))

let a2 = makeAstroid(1)
a2.po.transform.worldPosition = [-2, 0, 0]
po.applyLinearImpulse(vec3.fromValues(-2, 0, 0))

let a3 = makeAstroid(1)
a3.po.transform.worldPosition = [0, -.7, .8];
(a3.po as PhysicsObject).applyAngularImpulse(vec3.fromValues(0, 2, 2))
scene.addNode(a1)
scene.addNode(a2)
scene.addNode(a3)

let sun = new Gltf2Node({str: sunGltf})
sun.scale = [500, 500, 500]
sun.translation = [0, 0, 700]
scene.addNode(sun)

let viewAngle = quat.create()
let cameraPos = vec3.fromValues(0, 0, 10.1)
let cameraPO = new PhysicsObject(1, new SphereVolume(1), new Transform(vec3.copy(vec3.create(), cameraPos)))
cameraPO.inverseInertia = InertiaBuilder.sphere(1, 1)
cameraPO.damping = .9
physicsSystem.objects.push(cameraPO)

let controllerMapping = {axes: {yaw: 4, pitch: 2, roll: 1}, buttons: {thumb: 1,trigger:0}}
let cm =controllerMapping
// let controllerMapping = {axes: {twist: 4, pitch: 2, roll: 1}}
//

scene.addComponent(new class PlayerIsCamera extends Component {
    lastFireTimestamp = -1
    onUpdate(timestamp: number, _frameDelta: any): void {
        this.frame += 1
        let dir: vec3 | null = vec3.create()
        let boost = 10
        if (inputs["w"] || inputs["W"]) {
            dir = vec3.fromValues(0, 0, -10)
        }
        if (inputs["s"] || inputs["S"]) {
            dir = vec3.fromValues(0, 0, 10)
        }
        if (inputs["a"] || inputs["A"]) {
            dir = vec3.fromValues(-10, 0, 0)
        }
        if (inputs["d"] || inputs["D"]) {
            dir = vec3.fromValues(10, 0, 0)
        }


        let controller = navigator.getGamepads()?.[0]
        if (controller) {
            let s = 0.02
            let dir = vec3.fromValues(controller.axes[cm.axes.pitch] * s, -controller.axes[cm.axes.yaw] * s, -controller.axes[cm.axes.roll] * s)
            if (inputs["y"] || controller?.buttons[cm.buttons.thumb].pressed) {
                vec3.scale(dir, dir, boost / 4)
            }
            cameraPO.applyAngularImpulse(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))
        }

        if (inputs["y"] || controller?.buttons[cm.buttons.thumb].pressed) {
            vec3.scale(dir, dir, boost)
        }

        if (dir) {
            cameraPO.addForce(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))
        }

        if (inputs["q"]) {
            let dir = vec3.fromValues(0, 0, .01)
            cameraPO.applyAngularImpulse(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))
        }
        if (inputs["e"]) {
            let dir = vec3.fromValues(0, 0, -.01)
            cameraPO.applyAngularImpulse(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))
        }
        if (inputs["ArrowLeft"]) {
            let dir = vec3.fromValues(0, .02, 0)
            cameraPO.applyAngularImpulse(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))
        }
        if (inputs["ArrowRight"]) {
            let dir = vec3.fromValues(0, -.02, 0)
            cameraPO.applyAngularImpulse(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))
        }
        if (inputs["ArrowUp"]) {
            let dir = vec3.fromValues(.02, 0, 0)
            cameraPO.applyAngularImpulse(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))
        }
        if (inputs["ArrowDown"]) {
            let dir = vec3.fromValues(-.02, 0, 0)
            cameraPO.applyAngularImpulse(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))
        }
        if (inputs["MouseRel"]) {
            let mouse = vec3.fromValues(-inputs["MouseRelY"] ?? 0, -inputs["MouseRelX"] ?? 0, 0)
            vec3.scale(mouse, mouse, 1 / 1500)
            cameraPO.applyAngularImpulse(vec3.transformQuat(vec3.create(), mouse, cameraPO.transform.worldOrientation))

        }
        cameraPos = cameraPO.transform.worldPosition
        viewAngle = cameraPO.transform.worldOrientation
        // if ((inputs[" "] && !prevInputs[" "]) || (controller?.buttons[cm.buttons.trigger].pressed && !prevInputs["Controller1"])) {
        if ((inputs[" "] || controller?.buttons[cm.buttons.trigger].pressed)&& timestamp - this.lastFireTimestamp > 100) {
            this.lastFireTimestamp = timestamp
            let bullet = new Gltf2Node({str: icosphereGltf})
            bullet.kind = "bullet"
            bullet.scale = vec3.fromValues(0.2, 0.2, 0.2)
            bullet.translation = vec3.copy(vec3.create(), cameraPO.transform.worldPosition)

            let forward = vec3.fromValues(0, 0, -3)
            vec3.transformQuat(forward, forward, cameraPO.transform.worldOrientation)
            vec3.add(bullet.translation, bullet.translation, forward)

            let inverseMass = 50
            let radius = .9 * .2
            let cRadius = .5
            let po = new PhysicsObject(inverseMass, new SphereVolume(cRadius), new Transform(bullet.translation))
            po.addCollideCB((o) => {
                bullet.dead = true
            })
            po.inverseInertia = InertiaBuilder.sphere(radius, inverseMass)
            po.gravity = false
            bullet.po = po
            po.transform.worldOrientation = quat.copy(quat.create(), cameraPO.transform.worldOrientation)
            po.cbUserData = bullet
            physicsSystem.objects.push(po)
            bullet.addComponent(new class extends Component {
                onUpdate(_timestamp, _frameDelta) {
                    this.node.translation = po.transform.worldPosition
                    this.node.rotation = po.transform.worldOrientation
                }
            })
            bullet.addComponent(new SelfDestruct(60 * 10))
            let dir = vec3.fromValues(0, 0, -1)
            po.applyLinearImpulse(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))

            scene.addNode(bullet)

        }
        prevInputs["Controller1"] = controller?.buttons[cm.buttons.trigger].pressed
    }
})

let doFrame = () => {
    scene.frame((_frameΔ) => {
        requestAnimationFrame(doFrame)

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

        const fieldOfView = (45 * Math.PI) / 180;
        const aspect = (gl.canvas as HTMLCanvasElement).clientWidth / (gl.canvas as HTMLCanvasElement).clientHeight;
        const zNear = 0.1;
        const zFar = 700.0;
        let perspectiveMatrix = mat4.perspective(mat4.create(), fieldOfView, aspect, zNear, zFar)
        let view = mat4.fromRotationTranslation(mat4.create(), viewAngle, cameraPos)

        scene.draw(perspectiveMatrix, view)
        Object.assign(prevInputs, inputs)
    })
}

let inputs = {}
let prevInputs = {}
document.addEventListener('keydown', ev => {
    inputs[ev.key] = true
})
document.addEventListener('keyup', ev => {
    inputs[ev.key] = false
})

document.addEventListener("mousemove", (event) => {
    if (event.movementX) {
        inputs["MouseRelX"] = Math.abs(event.movementX) < 2 ? 0 : event.movementX
        inputs["MouseRelY"] = Math.abs(event.movementY) < 2 ? 0 : event.movementY
    }
})

requestAnimationFrame(doFrame)
