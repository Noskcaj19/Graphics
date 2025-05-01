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

// import {mat4, vec3, vec4, quat} from "https://esm.sh/gl-matrix@latest?dev";
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
import {Matrix4, Quat, Vector3} from "../kcaj-physics/src/structures";

let defaultCube = await fetch("./assets/DefaultCube.gltf").then(r => r.text())
let brickFloor = await fetch("./assets/BrickCube.gltf").then(r => r.text())
let sphereGltf = await fetch("./assets/BlenderSphere.gltf").then(r => r.text())
let khronosCubeGltf = await fetch("./assets/khronos_cube.gltf").then(r => r.text())

// var SPECTOR = new spector.Spector();
// SPECTOR.spyCanvases()
// SPECTOR.displayUI();

let parms = new URLSearchParams(window.location.search)
let host = parms.has("host")
let group = parms.get("group") ?? "Testing"
let name = parms.get("name")


let gl = (document!.getElementById("root")! as HTMLCanvasElement).getContext("webgl2")!


let renderer = new Renderer(gl)
let scene = new Scene()

scene.setRenderer(renderer)

let physicsSystem = new PhysicsSystem();
(window as any).ps = physicsSystem;

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

let makePhysicsSphere = (radius: number = 1) => {
    let sphere = new Gltf2Node({str: sphereGltf})
    // let sphere = new Icosphere()
    sphere.scale = new Vector3(radius, radius, radius)
    // sphere.translation = new Vector3(.5, 7, 0)
    let inverseMass = radius
    let po = new PhysicsObject(inverseMass, new SphereVolume(radius), new Transform(sphere.translation))
    po.inverseInertia = InertiaBuilder.sphere( radius, inverseMass)
    po.gravity = true
    physicsSystem.objects.push(po)
    sphere.addComponent(new class extends Component {
        onUpdate(_timestamp, _frameDelta) {
            this.node.translation = po.transform.worldPosition
            this.node.orientation = po.transform.worldOrientation
        }
    })

    return sphere
}

for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
        let s = makePhysicsSphere(.5)
        s.translation.x = i * .5
        s.translation.z = j * .5
        s.translation.y = i * 2 + j * 2
        scene.addNode(s)
    }
}

let coin = new Gltf2Node({str: khronosCubeGltf})
coin.translation = new Vector3(2, 5, 0)
// coin.scale = new Vector3(10,10,10)
scene.addNode(coin)
// let coinPo = new PhysicsObject(0, new SphereVolume(1), new Transform(coin.translation))
let coinPo = new PhysicsObject(0, new AABBVolume(new Vector3(1, 1, 1)), new Transform(coin.translation))
coinPo.inverseInertia = InertiaBuilder.cube(new Vector3(1, 1, 1), 1)
coinPo.gravity = false
physicsSystem.objects.push(coinPo)


let floor = new Gltf2Node({str: brickFloor})
// floor.scale = new Vector3(10,10,10)
scene.addNode(floor)
let floorPo = new PhysicsObject(0, new AABBVolume(new Vector3(12, .5, 12)), new Transform(floor.translation))
physicsSystem.objects.push(floorPo)

let doFrame = () => {
    scene.frame((_frameΔ) => {
        requestAnimationFrame(doFrame)

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

        const fieldOfView = (45 * Math.PI) / 180;
        const aspect = (gl.canvas as HTMLCanvasElement).clientWidth / (gl.canvas as HTMLCanvasElement).clientHeight;
        const zNear = 0.1;
        const zFar = 500.0;
        let perspectiveMatrix = Matrix4.perspective(fieldOfView, aspect, zNear, zFar)
        let viewAngle = new Quat()
        viewAngle = viewAngle.rotatedX(-Math.PI/6)
        // let pos = new Vector3(0, 15, 20)
        let pos = new Vector3(0, 20, 30)
        let view = Matrix4.fromRotationTranslation(viewAngle, pos)


        // console.log(new Array(...cube1Po.transform.localOrientation._data))
        // cube1.translation = cube1Po.transform.worldPosition
        // cube1.rotation = cube1Po.transform.worldOrientation


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


requestAnimationFrame(doFrame)
window.vec3 = Vector3