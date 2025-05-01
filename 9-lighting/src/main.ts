import { WSClient } from "../kcaj-p2p/dist/index.js"

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
    Gltf2Node, VertexColorMaterial, RenderEnvironment
} from "./renderer";

// import {mat4, vec3, vec4, quat} from "gl-matrix";
// import * as glm from "gl-matrix"
import { mat4, vec3, vec4, quat } from "./glutils.js";
// import spector from "https://esm.sh/spectorjs@latest";
// import "https://esm.sh/webgl-lint@latest";
import { _ } from "./libjackson.js";
import {
    PhysicsObject,
    PhysicsSystem,
    Transform,
    CollisionVolume,
    InertiaBuilder,
    OOBVolume,
    SphereVolume, AABBVolume
} from "../kcaj-physics/src";

import greenCube from "../public/assets/GreenCube.gltf?raw"
import greenIco from "../public/assets/GreenIco.gltf?raw"
import trunk from "../public/assets/Trunk.gltf?raw"

import icosphereGltf from "../public/assets/icosphere.gltf?raw"
// var SPECTOR = new spector.Spector();
// SPECTOR.spyCanvases()
// SPECTOR.displayUI();


let canvas = document!.getElementById("root")! as HTMLCanvasElement
let gl = canvas.getContext("webgl2")!


let renderer = new Renderer(gl)
let scene = new Scene()

scene.setRenderer(renderer)

let physicsSystem = new PhysicsSystem();
// physicsSystem.gravity = [0,0,0]
class PhysicsSystemComponent extends Component {
    onUpdate(_timestamp, frameDelta) {
        physicsSystem.update(frameDelta / 1000)
        physicsSystem.objects.forEach(o => o.transform.updateMatrices())
    }
}

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
        this.po.transform.worldPosition = vec3.copy(vec3.create(), this.node.translation)
        this.po.transform.worldOrientation = quat.copy(quat.create(), this.node.rotation)
    }

    onUpdate(_timestamp, _frameDelta) {
        this.node.translation = vec3.copy(vec3.create(), this.po.transform.worldPosition)
        this.node.rotation = this.po.transform.worldOrientation
    }
}

class SpotlightMarker extends Component { }

scene.addComponent(new PhysicsSystemComponent())


let br = new Gltf2Node({ str: greenCube })
br.scale = [50, 1, 50]
scene.addNode(br)
let groundPO = new PhysicsObject(0, new AABBVolume(vec3.fromValues(50, 1, 50)), new Transform(vec3.create()))
groundPO.collide = 0b01
physicsSystem.objects.push(groundPO)

let makeTree = () => {
    let tree = new Gltf2Node({ str: trunk })
    tree.scale = [.25, .25, .25]
    tree.translation = [_.urandom() * 25, 0, _.urandom() * 25]
    tree.rotation = quat.rotateY(tree.rotation, tree.rotation, _.urandom())
    // tree.translation = [0, 0,0]
    let greenNode = new Gltf2Node({ str: greenIco });
    greenNode.translation = [3, 10, 0]
    greenNode.scale = [2, 2, 2]
    tree.addNode(greenNode)
    scene.addNode(tree)
    let pos = vec3.copy(vec3.create(), tree.translation);
    pos[1] = 2
    let treeCollider = new PhysicsObject(0, new SphereVolume(1), new Transform(pos))
    treeCollider.inverseInertia = InertiaBuilder.sphere(1, 0)
    treeCollider.gravity = false
    treeCollider.collide = 0b10
    treeCollider.name = "tree"
    physicsSystem.objects.push(treeCollider)
    // tree.addComponent(new PhysicsObjectComponent(treeCollider))
    return tree
}

let makeRock = () => {
    let ico = new Gltf2Node({ str: icosphereGltf })
    // ico.scale = [.25, .25, .25]
    //ico.translation = [0, 2.5, 0]
    ico.translation = [_.urandom() * 15, 1, _.urandom() * 15]
    // tree.rotation = quat.rotateY(tree.rotation, tree.rotation, _.urandom())
    // tree.translation = [0, 0,0]
    scene.addNode(ico)
    let pos = vec3.copy(vec3.create(), ico.translation);
    pos[1] = 2.5
    let icoCollider = new PhysicsObject(0, new SphereVolume(.5), new Transform(pos))
    icoCollider.inverseInertia = InertiaBuilder.sphere(.5, 0)
    icoCollider.gravity = false
    icoCollider.collide = 0b10
    icoCollider.name = "rock"
    physicsSystem.objects.push(icoCollider)
    // tree.addComponent(new PhysicsObjectComponent(treeCollider))
    return ico
}



for (let i in _.range(20)) {
    makeTree()
}

for (let i in _.range(5)) {
    makeRock()
}

// let cube = new Gltf2Node({str: defaultCube})
// cube.translation[1]= 4
// let cubeCollider = new PhysicsObject(1, new SphereVolume(1), new Transform(vec3.create()))
// treeCollider.inverseInertia = InertiaBuilder.sphere(1, 1)
// treeCollider.gravity = true
// physicsSystem.objects.push(cubeCollider)
// cube.addComponent(new PhysicsObjectComponent(cubeCollider))
// // cube.scale = vec3.fromValues(3,3,3)
// cube.addComponent(new class extends Component {
//     onUpdate(_timestamp, _frameDelta) {
//         quat.rotateX(this.node.rotation, this.node.rotation, .001)
//         quat.rotateY(this.node.rotation, this.node.rotation, .005)
//
//     }
// })
// scene.addNode(cube)
//
function makeSphere (i) {
    let ico = new Gltf2Node({str: icosphereGltf})
    ico.translation = [0, 5+i*2, -5]
    let cubeCollider = new PhysicsObject(1, new SphereVolume(1), new Transform(vec3.create()))
    cubeCollider.inverseInertia = InertiaBuilder.sphere(1, 1)
    cubeCollider.gravity = true
    cubeCollider.name = "sphere"
    physicsSystem.objects.push(cubeCollider)
    ico.addComponent(new PhysicsObjectComponent(cubeCollider))
    scene.addNode(ico)
}

//for (let i in _.range(1)) { 
//    makeSphere(i)
//}


let env = new RenderEnvironment()
env.spotlightPos = [0.0, 10.0, 5.0, 0.5, 0.5, 7.0]
env.pointlightPos = [[0, 2, 0], [2, 2, 0], [0, 2, 2], [5, 4, 5], [6, 2, -3], [-5, 4, -5]]
env.cameraPos = [0, 3.5, 0]
env.globalLightColor = [.25, .25, .25]
env.globalLightDirection = [20, 5, 20.0]
env.ambientLight = [0.1, 0.1, 0.1]


let viewAngle = quat.create()
let cameraPO = new PhysicsObject(1, new SphereVolume(1), new Transform(vec3.copy(vec3.create(), env.cameraPos)))
cameraPO.collide = 0b11
cameraPO.inverseInertia = InertiaBuilder.sphere(1, 1)
physicsSystem.objects.push(cameraPO)

scene.addComponent(new class PlayerIsCamera extends Component {
    onUpdate(timestamp: number, _frameDelta: any): void {
        let dir: vec3 | null = vec3.create()
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

        if (dir) {
            cameraPO.addForce(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))
        }

        if (inputs["ArrowLeft"]) {
            let dir = vec3.fromValues(0, .02, 0)
            cameraPO.applyAngularImpulse(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))
        }
        if (inputs["ArrowRight"]) {
            let dir = vec3.fromValues(0, -.02, 0)
            cameraPO.applyAngularImpulse(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))
        }

        env.cameraPos = cameraPO.transform.worldPosition
        viewAngle = cameraPO.transform.worldOrientation
    }
})

let x = 0
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
        // quat.rotateX(viewAngle, viewAngle, -.2)
        let view = mat4.fromRotationTranslation(mat4.create(), viewAngle, env.cameraPos)

        scene.draw(perspectiveMatrix, view, env)
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
