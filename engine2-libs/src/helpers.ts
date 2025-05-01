// import {mat4, vec3} from "gl-matrix";
import {mat4, vec3} from "./glutils.js"
import {Component, Node} from "./renderer";
import {PhysicsObject, PhysicsSystem} from "../kcaj-physics/src";
import {_} from "./libjackson";

function setTranslationMat4(out: mat4, translation: vec3) {
    out[12] = translation[0]
    out[13] = translation[1]
    out[14] = translation[2]

    return out
}

export class HealthComponent extends Component {
    health: number

    constructor(health) {
        super();
        this.health = health
    }

    damage(amount: number = 1) {
        this.health -= amount
        if (this.health <= 0) {
            this.node.dead = true
            if (this.node.po) {
                let physicsSystem = this.node.scene.components.find(PhysicsSystemComponent).physicsSystem
                _.remove(physicsSystem.objects, this.node.po)
            }
        }
    }

}

export function makeBadguyCollisionCB(self:Node) {
    let collisions = new Set()
    return function(po, node) {
        if (po.name == "bullet") {
            if (collisions.has(po)) return
            collisions.add(po);
            (self.components.find(HealthComponent))!.damage()
        }
    }
}

export var mat4H = {setTranslationMat4}

export class PhysicsSystemComponent extends Component {
    physicsSystem: PhysicsSystem
    constructor(ps:PhysicsSystem) {
        super();
        this.physicsSystem = ps
    }
    onUpdate(_timestamp, frameDelta) {
        this.physicsSystem.update(frameDelta / 1000)
        this.physicsSystem.objects.forEach(o => o.transform.updateMatrices())
    }
}

export class PhysicsObjectComponent extends Component {
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
        // this.po.transform.worldPosition = vec3.copy(vec3.create(), this.node.translation)
        // this.po.transform.worldOrientation = quat.copy(quat.create(), this.node.rotation)
    }

    onUpdate(_timestamp, _frameDelta) {
        this.node.translation = vec3.copy(vec3.create(), this.po.transform.worldPosition)
        this.node.rotation = this.po.transform.worldOrientation
    }
}

export function cloneMesh(node: Node) {
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

export class SelfDestruct extends Component {
    lifespan = 0

    constructor(lifespan) {
        super();
        this.lifespan = lifespan;
    }

    onUpdate(_timestamp, _frameDelta) {
        if (this.lifespan === 0) {
            this.node.dead = true
            if (this.node.po) {
                let physicsSystem = this.node.scene.components.find(PhysicsSystemComponent).physicsSystem
                _.remove(physicsSystem.objects, this.node.po)
            }
        }
        this.lifespan -= 1
    }
}
