import {
    Renderer,
    Component,
    Scene,
    Node,
    Gltf2Node, VertexColorMaterial, RenderEnvironment
} from "./renderer";

// import {mat4, vec3, vec4, quat} from "gl-matrix";
// import * as glm from "gl-matrix"
import {mat4, vec3, vec4, quat} from "./glutils.js";
// import spector from "https://esm.sh/spectorjs@latest";
// import "https://esm.sh/webgl-lint@latest";
import {_, astar, bicubicNoiseHelper, h, manhattan} from "./libjackson.js";
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
import transparentIco from "../public/assets/TransparentIco.gltf?raw"
import brickCube from "../public/assets/BrickCube.gltf?raw"
import dirtCube from "../public/assets/DirtCube.gltf?raw"
import greenIco from "../public/assets/GreenIco.gltf?raw"
import ghostIco from "../public/assets/Ghost.gltf?raw"
import tarsIco from "../public/assets/Tars.gltf?raw"
import voroniCube from "../public/assets/VoroniCube.gltf?raw"

import icosphereGltf from "../public/assets/icosphere.gltf?raw"
import {
    cloneMesh,
    HealthComponent,
    makeBadguyCollisionCB,
    PhysicsObjectComponent,
    PhysicsSystemComponent,
    SelfDestruct
} from "./helpers";
// var SPECTOR = new spector.Spector();
// SPECTOR.spyCanvases()
// SPECTOR.displayUI();


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

let deadElement: HTMLElement
let winElement: HTMLElement
let healthElement: HTMLElement
let root = h("div#ui-root", [
    healthElement = h("p#health", "5"),
    winElement = h("h1#win", ""),
    deadElement= h("h1#dead", "")
])

document.getElementById("ui-root")!.replaceWith(root)

let renderer = new Renderer(gl)
let scene = new Scene()

scene.setRenderer(renderer)

let physicsSystem = new PhysicsSystem();
window.ps = physicsSystem


scene.addComponent(new PhysicsSystemComponent(physicsSystem))


let masterFloorCube = new Gltf2Node({str: dirtCube})
scene.addNode(masterFloorCube)
let masterVoroniCubeNode = new Gltf2Node({str: voroniCube})
scene.addNode(masterVoroniCubeNode)
let masterBrickCubeNode = new Gltf2Node({str: brickCube})
scene.addNode(masterBrickCubeNode)
// let masterGhostNode = new Gltf2Node({str: ghostIco})
// scene.addNode(masterGhostNode)

function makeFloor(x, y) {
    let floor = cloneMesh(masterFloorCube)
    floor.translation = [x, 0, y]
    scene.addNode(floor)
}

_.map2d(50, 50, (x, y) => {
    makeFloor((x * 2) - 25, (y * 2) - 25)
})

let groundPO = new PhysicsObject(0, new AABBVolume(vec3.fromValues(50, 1, 50)), new Transform(vec3.create()))
groundPO.name = "ground"
groundPO.collide = 0b01
physicsSystem.objects.push(groundPO)

function makeGhost(i) {
    // let ghost = cloneMesh(masterGhostNode)
    let ghost = new Gltf2Node({str: ghostIco})
    ghost.scale = vec3.scale(vec3.create(), [1, 1, 1], .5)
    let iM = 5
    let radius = .5
    let po = new PhysicsObject(iM, new SphereVolume(radius), new Transform([0, 2, -3]))
    po.name = "ghost"
    po.inverseInertia = InertiaBuilder.sphere(radius, iM)
    po.addCollideCB(makeBadguyCollisionCB(ghost))
    ghost.po = po
    po.collide = true
    // po.gravity = true
    physicsSystem.objects.push(po)
    ghost.addComponent(new PhysicsObjectComponent(po))
    ghost.addComponent(new HealthComponent(3))

    class BouncyAround extends Component {
        dir = [_.urandom() * 2, 0, _.urandom() * 2]
        c = 0

        onUpdate(_timestamp, _frameDelta) {
            if (this.c > 0) {
                this.c -= 1
            }
            let po: PhysicsObject = ghost.po
            po.transform.worldPosition
            let forward = vec3.fromValues(this.dir[0], 0, this.dir[2])
            vec3.transformQuat(forward, forward, po.transform.worldOrientation)
            po.addForce(forward)
            // vec3.add(po.transform.worldPosition, po.transform.worldPosition, forward)
        }
    }

    let ba = new BouncyAround()
    ghost.addComponent(ba)
    po.addCollideCB((po, node) => {
        if (po.name === "ground") return
        if (ba.c != 0) return
        let old = [...ba.dir]
        ba.dir[0] *= -1
        ba.dir[2] *= -1
        // console.log("collision", po.name, old, ba.dir, )
        ba.c = 2
    })
    ghost.addComponent(new class WobbleBubbles extends Component {
        legs!: Node
        x = 0
        pointLightIdx = i

        attach(node) {
            super.attach(node);
        }

        onUpdate(_timestamp, _frameDelta) {
            this.x = (this.x + 0.1) % 360
            if (env.pointlightPos[this.pointLightIdx]) {
                vec3.copy(env.pointlightPos[this.pointLightIdx], this.node.translation)
                env.pointlightPos[this.pointLightIdx][1] -= .25
            }
            if (this.legs) {
                quat.applyEuler(this.legs.rotation, Math.cos(this.x) * 4, this.x * 10, Math.cos(this.x) * 4)
            } else {
                for (let scene of this.node.children) {
                    for (let child of scene.children) {
                        if (child.name === "Legs") {
                            this.legs = child
                        }
                    }
                }
            }
        }
    })
    return ghost
}

function makeTars() {
    let tars = new Gltf2Node({str: tarsIco})
    tars.scale = [.5, .5, .5]

    let iM = 5
    let radius = .5
    let po = new PhysicsObject(iM, new SphereVolume(radius), new Transform([0, 2, -3]))
    po.name = "tars"
    po.inverseInertia = InertiaBuilder.sphere(radius, iM)
    tars.po = po
    po.collide = true
    po.addCollideCB(makeBadguyCollisionCB(tars))
    // po.gravity = true
    physicsSystem.objects.push(po)
    tars.addComponent(new HealthComponent(8))
    tars.addComponent(new PhysicsObjectComponent(po))
    tars.addComponent(new class extends Component {
        lleg!: Node
        rleg!: Node
        x = 0

        onUpdate(_timestamp, _frameDelta) {
            this.x = (this.x + 0.1) % 360
            if (this.lleg) {
                quat.applyEuler(this.lleg.rotation, 0, 0, Math.cos(this.x) * 10)
                quat.applyEuler(this.rleg.rotation, 0, 0, Math.sin(this.x) * 10)
            } else {
                for (let scene of this.node.children) {
                    for (let child of scene.children) {
                        if (child.name === "LeftLeg") {
                            this.lleg = child
                        }
                        if (child.name === "RightLeg") {
                            this.rleg = child
                        }
                    }
                }
            }
        }
    })

    class BouncyAround extends Component {
        dir = _.urandom() > .5 ? [_.urandom() > .5 ? -2 : 2, 0, 0] : [0, 0, _.urandom() > .5 ? -2 : 2]

        onUpdate(_timestamp, _frameDelta) {
            let po: PhysicsObject = tars.po
            let forward = vec3.fromValues(this.dir[0], 0, this.dir[2])
            vec3.transformQuat(forward, forward, po.transform.worldOrientation)
            po.addForce(forward)
            // if (_timestamp % 6000 == 0) {
            //     this.dir[0] *= -1
            //     this.dir[2] *= -1
            // }
            // vec3.add(po.transform.worldPosition, po.transform.worldPosition, forward)
        }
    }

    let ba = new BouncyAround()
    tars.addComponent(ba)
    po.addCollideCB((po, node) => {
        if (po.name === "ground") return
        ba.dir = _.urandom() > .5 ? [_.urandom() > .5 ? -2 : 2, 0, 0] : [0, 0, _.urandom() > .5 ? -2 : 2]
    })
    return tars
}

function makeTacluchnatagamuntoron() {
    let tac = new Gltf2Node({str: icosphereGltf})
    tac.scale = [.5, .5, .5]

    let iM = 10
    let radius = .5
    let po = new PhysicsObject(iM, new SphereVolume(radius), new Transform([0, 2, -3]))
    po.name = "tac"
    po.inverseInertia = InertiaBuilder.sphere(radius, iM)
    tac.po = po
    po.addCollideCB(makeBadguyCollisionCB(tac))
    po.collide = true
    // po.gravity = true
    physicsSystem.objects.push(po)
    tac.addComponent(new PhysicsObjectComponent(po))
    tac.addComponent(new HealthComponent(5))
    tac.addComponent(new class extends Component {
        x = 1

        onUpdate(_timestamp, _frameDelta) {
            this.x = (this.x + 1) % 120
            if (this.x == 0) {
                let lookAt = mat4.targetTo(mat4.create(), tac.translation, vec3.subtract(vec3.create(), env.cameraPos, [0, 1, 0]), [0, 1, 0])
                let rot = mat4.getRotation(quat.create(), lookAt)

                let bullet = new Gltf2Node({str: icosphereGltf})
                bullet.kind = "bullet"
                bullet.scale = vec3.fromValues(0.2, 0.2, 0.2)
                bullet.translation = vec3.copy(vec3.create(), this.node.translation)

                let forward = vec3.fromValues(0, 1, 0)
                vec3.transformQuat(forward, forward, tac.rotation)
                vec3.add(bullet.translation, bullet.translation, forward)

                let inverseMass = 20
                let radius = .9 * .2
                let cRadius = .5
                let po = new PhysicsObject(inverseMass, new SphereVolume(cRadius), new Transform(bullet.translation))
                po.name = "bullet"
                po.damping = 0
                po.addCollideCB((o) => {
                    bullet.dead = true
                })
                po.inverseInertia = InertiaBuilder.sphere(radius, inverseMass)
                po.gravity = false
                bullet.po = po
                po.transform.worldOrientation = quat.copy(quat.create(), rot)
                po.cbUserData = bullet
                physicsSystem.objects.push(po)
                bullet.addComponent(new class extends Component {
                    onUpdate(_timestamp, _frameDelta) {
                        this.node.translation = po.transform.worldPosition
                        this.node.rotation = po.transform.worldOrientation
                    }
                })
                bullet.addComponent(new SelfDestruct(60 * .5))
                let dir = vec3.fromValues(0, 0, -5)
                po.applyLinearImpulse(vec3.transformQuat(vec3.create(), dir, rot))

                scene.addNode(bullet)
            }
        }
    })

    scene.addNode(tac)
    return tac
}

function makeSphere(i, p = true, x, y) {
    let ico = new Gltf2Node({str: icosphereGltf})
    ico.translation = [_.urandom() * .1, 5 + i * 2, -5]
    ico.scale = [0.25, 0.25, 0.25]
    if (p) {
        let cubeCollider = new PhysicsObject(10, new SphereVolume(1 * .25), new Transform(vec3.create()))
        cubeCollider.inverseInertia = InertiaBuilder.sphere(1 * 0.25, 10)
        cubeCollider.gravity = true
        cubeCollider.name = "sphere"
        physicsSystem.objects.push(cubeCollider)
        ico.addComponent(new PhysicsObjectComponent(cubeCollider))
    } else {
        ico.translation = [x, y, -70]
    }
    scene.addNode(ico)
}


let env = new RenderEnvironment()
env.spotlightPos = [0.0, 10.0, 5.0, 0.5, 0.5, 7.0]
// env.pointlightPos = [[0, 2, 0], [2, 2, 0], [0, 2, 2], [5, 4, 5], [6, 2, -3], [-5, 4, -5]]
env.pointlightPos = _.range(100).map(_ => [0, 0, 0])
env.cameraPos = [0, 2.0, 0]
env.globalLightColor = [.75, .75, .75]
env.globalLightDirection = [20, 5, 20.0]
env.ambientLight = [0.2, 0.2, 0.2]


let playerHealth = 5
let viewAngle = quat.create()
let cameraPO = new PhysicsObject(1, new SphereVolume(.5), new Transform(vec3.copy(vec3.create(), env.cameraPos)))
cameraPO.name = "camera"
cameraPO.collide = true
let playerCollisions = new Set()
cameraPO.addCollideCB((po, node) => {
    if (po.name == "bullet") {
        if (po.name == "bullet") {
            if (playerCollisions.has(po)) return
            playerCollisions.add(po);
            playerHealth -= 1

            healthElement.innerText = `${playerHealth}`
            if (playerHealth == 0) {
                deadElement.innerText = "Dead"
            }
        }
    }
})
// cameraPO.gravity = false
cameraPO.inverseInertia = InertiaBuilder.sphere(.5, 1)
physicsSystem.objects.push(cameraPO)

scene.addComponent(new class PlayerIsCamera extends Component {
    lastFireTimestamp = 0

    onUpdate(timestamp: number, _frameDelta: any): void {
        let dir: vec3 = vec3.create()
        if (inputs["w"]) {
            vec3.add(dir, dir, vec3.fromValues(0, 0, -10))
        }
        if (inputs["s"]) {
            vec3.add(dir, dir, vec3.fromValues(0, 0, 10))
        }
        if (inputs["a"]) {
            vec3.add(dir, dir, vec3.fromValues(-10, 0, 0))
        }
        if (inputs["d"]) {
            vec3.add(dir, dir, vec3.fromValues(10, 0, 0))
        }

        if (dir) {
            vec3.scale(dir, dir, 5)
            cameraPO.addForce(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))
        }

        if (inputs["MouseRel"]) {
            let mouse = vec3.fromValues(0, -inputs["MouseRelX"] ?? 0, 0)
            vec3.scale(mouse, mouse, 1 / 550)
            // quat.rotateY(cameraPO.transform.worldOrientation, cameraPO.transform.worldOrientation, mouse[1])
            quat.setAxisAngle(cameraPO.transform.worldOrientation, [0, 1, 0], -inputs["rotY"] * .005)
        }

        if (inputs[" "] && timestamp - this.lastFireTimestamp > 100) {
            this.lastFireTimestamp = timestamp
            let bullet = new Gltf2Node({str: icosphereGltf})
            bullet.kind = "bullet"
            bullet.scale = vec3.fromValues(0.2, 0.2, 0.2)
            bullet.translation = vec3.copy(vec3.create(), cameraPO.transform.worldPosition)

            let forward = vec3.fromValues(0, .25, -2)
            vec3.transformQuat(forward, forward, cameraPO.transform.worldOrientation)
            vec3.add(bullet.translation, bullet.translation, forward)

            let inverseMass = 20
            let radius = .9 * .2
            let cRadius = .5
            let po = new PhysicsObject(inverseMass, new SphereVolume(cRadius), new Transform(bullet.translation))
            po.name = "bullet"
            // po.damping = 1
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
            bullet.addComponent(new SelfDestruct(60 * 1))
            let dir = vec3.fromValues(0, 0, -5)
            po.applyLinearImpulse(vec3.transformQuat(vec3.create(), dir, cameraPO.transform.worldOrientation))

            scene.addNode(bullet)
        }

        // env.cameraPos = cameraPO.transform.worldPosition
        // cameraPO.transform.worldPosition[1] =10
        env.cameraPos = [...cameraPO.transform.worldPosition]
        env.cameraPos[1] = 2
        viewAngle = cameraPO.transform.worldOrientation
        vec3.copy(env.pointlightPos[0], env.cameraPos)
        let [x,y]=[cameraPO.transform.worldPosition[0],cameraPO.transform.worldPosition[2]]
        let bounds = 32*2
        if ((x<0 ||  x> bounds) && (y< 0|| y>bounds)) {
            winElement.innerText = "You won"

        }

    }
})
window.cameraPO = cameraPO

let doFrame = () => {
    if (playerHealth < 0) return
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
window.doFrame = doFrame

let inputs = {'rotY': 0}
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
        inputs['rotY'] += event.movementX
    }
})

requestAnimationFrame(doFrame)


enum LevelComponent {
    Empty,
    Wall,
    Wall2,
}

let [width, height] = [32, 32]
width /= 2
height /= 2
let theGround = _.map2d(
    width,
    height,
    (_x, _y) => {
        return _.urandom() < 0 ?
            LevelComponent.Wall : LevelComponent.Wall2
    }
)
let noise = bicubicNoiseHelper(
    10,
    10,
    width,
    height
)

_.map2d(width, height, (x, y) => {
    for (let i of _.range(30)) {
        if (Math.pow(noise(x, y), 2.1) > 0.4) {
            // g.sprite = AssetManager.assets.ground[3]
            theGround[x + y * width] = LevelComponent.Empty
        }
    }
})

let cavities: [number, number][] = []

for (let _i in _.range(_.randInt(14, 15))) {
    let [x, y] = [
        _.randInt(0, width - 1),
        _.randInt(0, height - 1),
    ]
    // Diamond shape
    let offsets = [
        [
            ..._.range(-1, 1 + 1)
                .map((i) =>
                    _.range(-1, 1 + 1).map((j) => [i, j])
                )
                .flat(),
            [2, 0],
            [0, 2],
            [-2, 0],
            [0, -2],
        ],
    ]

    cavities.push([x, y])
    for (let [xOff, yOff] of offsets[0]) {
        // Only generate some cells in the diamond
        let rx = x + xOff
        let ry = y + yOff
        if (Math.random() > 0.3) {
            theGround[rx + ry * width] = LevelComponent.Empty
        }
    }
}

// Neighbors, but don't remove occupied cells
function neighbors(pos) {
    return [
        [pos[0] - 1, pos[1]],
        [pos[0] + 1, pos[1]],
        [pos[0], pos[1] - 1],
        [pos[0], pos[1] + 1],
    ].filter(
        (a) =>
            a[0] >= 0 &&
            a[1] >= 0 &&
            a[0] < width &&
            a[1] < height
    )
}

// We really don't want to go through entities, but we will if we have to
let cost = (current, neighbor) => {
    // let e = this.get(...neighbor)
    if (theGround[neighbor[0] + neighbor[1] * width]) {
        return 100
    }
    return 1
}

function clearBetween(a, b) {
    try {
        let aToB = astar(
            a,
            b,
            manhattan,
            cost,
            neighbors,
            50000
        )
        for (let cell of aToB.totalPath) {
            let [x, y] = cell
            if (
                theGround[x + y * width] != LevelComponent.Empty
            ) {
                theGround[x + y * width] = LevelComponent.Empty
            }
        }
    } catch (e) {
        console.warn(e)
    }
}

_.map2d(width, height, (x, y) => {
    if (theGround[x + y * width] == LevelComponent.Wall || theGround[x + y * width] == LevelComponent.Wall2) {
        makeSphere(0, false, x - 32, y)
    }
})

let lastCav = [0, 0]
let lightIdx = 0
let i = 0
let start = [0, 0]
let cav
for (cav of cavities) {
    clearBetween(lastCav, cav)
    lastCav = cav
    if (i == 0) {
        start = cav
    }

    let p = Math.random()
    if (p < .2) {
        let ghost = makeGhost(lightIdx++)
        ghost.po.transform.worldPosition = [cav[0] * 2, 2, cav[1] * 2]
        scene.addNode(ghost)
    } else if (p < .5) {
        let tars = makeTars()
        tars.po.transform.worldPosition = [cav[0] * 2, 2, cav[1] * 2]
        scene.addNode(tars)
    } else if (p < .7) {
        let tac = makeTacluchnatagamuntoron()
        tac.po.transform.worldPosition = [cav[0] * 2, 2, cav[1] * 2]
        scene.addNode(tac)
    }
    i += 1
}
let endPos = cav
cameraPO.transform.worldPosition = [endPos[0] * 2, 2, endPos[0] * 2]

for (let x of _.range(width)) {
    // makeWall(x*2, height*2)
    // makeWall(x*2, 0)
    theGround[x + height * width] = LevelComponent.Wall
    theGround[x + 0 * width] = LevelComponent.Wall
}
for (let y of _.range(height)) {
    // makeWall(width*2, y*2)
    // makeWall(0, y*2)
    theGround[width + y * width] = LevelComponent.Wall
    theGround[0 + y * width] = LevelComponent.Wall
}

theGround[start[0] + start[1]*width]=LevelComponent.Empty


// theGround[0 + 0 * width] = LevelComponent.Empty
// theGround[1 + 0 * width] = LevelComponent.Empty
// theGround[0 + 1 * width] = LevelComponent.Empty
// theGround[1 + 1 * width] = LevelComponent.Empty
_.map2d(width, height, (x, y) => {

    if (true || x < 10 && y < 10) {
        if (theGround[x + y * width] == LevelComponent.Wall) {
            makeSphere(0, false, x, y)
            makeWall(x * 2, y * 2)
        } else if (theGround[x + y * width] == LevelComponent.Wall2) {
            makeSphere(0, false, x, y)
            makeWall(x * 2, y * 2, 2)
        }
    }
})


function makeWall(x, y, kind = 1) {
    // let cube = cloneMesh(masterVoroniCubeNode)
    let cube = kind == 1 ? cloneMesh(masterBrickCubeNode) : cloneMesh(masterVoroniCubeNode)
    cube.translation = [x, 2, y]
    let iM = 0
    let po = new PhysicsObject(iM, new AABBVolume([1, 1, 1]), new Transform([...cube.translation]))
    po.name = "wall"
    po.gravity = false
    physicsSystem.objects.push(po)

    scene.addNode(cube)
}


// Cleanup
scene.removeNode(masterVoroniCubeNode)
scene.removeNode(masterBrickCubeNode)
scene.removeNode(masterFloorCube)
