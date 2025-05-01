import {vec3, vec4, mat4, mat3, quat} from "../../src/glutils.js"
import {mat4H} from "../../src/helpers";
import {SpatialHash} from "../../src/spatial_structure";


export class ContactPoint {
    a: PhysicsObject
    b: PhysicsObject
    localA: vec3
    localB: vec3
    normal: vec3
    penetration: number

    constructor(a: PhysicsObject, b: PhysicsObject, localA: vec3, localB: vec3, normal: vec3, penetration: number) {
        this.a = a
        this.b = b
        this.localA = localA
        this.localB = localB
        this.normal = normal
        this.penetration = penetration
    }
}

export class CollisionVolume {
}

export class AABBVolume extends CollisionVolume {
    halfSizes: vec3

    constructor(halfSizes: vec3) {
        super();
        this.halfSizes = halfSizes
    }
}

export class SphereVolume extends CollisionVolume {
    radius

    constructor(radius: number) {
        super()
        this.radius = radius
    }

}

export class OOBVolume extends CollisionVolume {
    width: number
    height: number
    depth: number

    constructor(width: number, height: number, depth: number) {
        super()
        this.width = width
        this.height = height
        this.depth = depth
    }
}

export class Transform {
    parent?: Transform
    #localPosition!: vec3
    worldMatrix: mat4 = mat4.create()
    localMatrix: mat4 = mat4.create()

    localScale: vec3 = vec3.fromValues(1, 1, 1)

    worldOrientation: quat = quat.create()
    localOrientation: quat = quat.create()

    #worldPosition = vec3.create()

    constructor(pos: vec3, parent?: Transform) {
        this.parent = parent
        this.worldPosition = pos
        this.updateMatrices()
    }

    get worldPosition(): vec3 {
        // return mat4.getTranslation(vec3.create(), this.worldMatrix)
        return this.#worldPosition
    }

    set worldPosition(newPos: vec3) {
        if (Number.isNaN(newPos[0])) debugger
        if (this.parent) {
            let parent = mat4.getTranslation(vec3.create(), this.parent.worldMatrix)
            let diff = vec3.subtract(vec3.create(), parent, newPos)
            this.#localPosition = diff
            mat4H.setTranslationMat4(this.localMatrix, diff)
        } else {
            this.#localPosition = newPos
        }
        // this.updateMatrices()
    }

    get localPosition(): vec3 {
        return this.#localPosition
    }

    set localPosition(v: vec3) {
        this.#localPosition = v
        // this.updateMatrices()
    }

    _updateMatricesM4_1DONOTUSE = mat4.create()
    _updateMatricesM4_2DONOTUSE = mat4.create()
    updateMatrices() {
        this.localMatrix = mat4.fromTranslation(this.localMatrix, this.#localPosition)
        mat4.multiply(this.localMatrix, this.localMatrix, mat4.fromQuat(this._updateMatricesM4_1DONOTUSE, this.localOrientation))
        mat4.multiply(this.localMatrix, this.localMatrix, mat4.fromScaling(this._updateMatricesM4_2DONOTUSE, this.localScale))

        if (this.parent) {
            mat4.multiply(this.worldMatrix, this.parent.worldMatrix, this.localMatrix)
            quat.multiply(this.worldOrientation, this.parent.worldOrientation, this.localOrientation)
            this.#worldPosition = mat4.getTranslation(this.#worldPosition, this.worldMatrix)
            if (Number.isNaN(this.#worldPosition[0])) debugger
        } else {
            this.worldMatrix = this.localMatrix
            this.#worldPosition = mat4.getTranslation(this.#worldPosition, this.worldMatrix)
            this.worldOrientation = this.localOrientation
        }
    }
}

export class PhysicsSystem {
    static UNIT_MULTIPLIER = 1

    objects: PhysicsObject[] = []
    #gravity: vec3 = vec3.create()

    damping = .95

    dTOffset = 0

    collisions: Set<ContactPoint> = new Set()

    constructor() {
        this.gravity = vec3.fromValues(0, -9.8, 0)
    }

    set gravity(g: vec3) {
        vec3.scale(this.#gravity, g, PhysicsSystem.UNIT_MULTIPLIER)
    }

    get gravity() {
        return this.#gravity
    }

    integrateAccel(dt: number) {
        for (let obj of this.objects) {
            let inverseMass = obj.inverseMass

            let force = obj.force

            let accel = vec3.scale(vec3.create(), force, inverseMass)
            if (obj.inverseMass > 0 && obj.gravity) {
                vec3.add(accel, accel, this.gravity)
            }

            vec3.add(obj.linearVelocity, obj.linearVelocity, vec3.scale(accel, accel, dt))
            // obj.linearVelocity.insert(accel.scaled(dt));

            // Angular
            let torque = obj.torque
            let angVel = obj.angularVelocity

            obj.updateInertiaTensor()

            let angAccel = vec3.transformMat3(vec3.create(), torque, obj.inverseInertiaTensor)

            vec3.add(angVel, angVel, vec3.scale(vec3.create(), angAccel, dt))
            obj.angularVelocity = angVel
        }
    }

    integrateVelocity(dt: number) {
        let dampingFactor = 1 - this.damping
        let globalFrameDamping = Math.pow(dampingFactor, dt)

        for (let obj of this.objects) {
            if (obj.inverseMass === 0) continue
            let t = obj.transform
            let frameDamping = obj.damping ? Math.pow(1 - obj.damping, dt) : globalFrameDamping
            let p = t.localPosition
            let linearVel = obj.linearVelocity
            vec3.add(p, p, vec3.scale(vec3.create(), linearVel, dt))
            // t.localPosition = p
            vec3.scale(linearVel, linearVel, frameDamping)
            if (Number.isNaN(linearVel[0])) debugger
            obj.linearVelocity = linearVel

            // Orientation
            let orientation = t.localOrientation
            let angVel = obj.angularVelocity

            // orientation = orientation.added(new Quat(...angVel.scaled(dt).scaled(0.5)._data, 0).multiplied(orientation))
            // orientation.normalize()


            let l1 = vec3.scale(vec3.create(), angVel, dt)
            let l2 = vec3.scale(l1, l1, .5)
            let q = quat.fromValues(l2[0], l2[1], l2[2], 0)
            quat.add(orientation, orientation, quat.multiply(quat.create(), q, orientation))

            // orientation.normalize()
            quat.normalize(q, q)

            t.localOrientation = orientation

            vec3.scale(angVel, angVel, frameDamping)
            obj.angularVelocity = angVel
        }
    }

    update(dt: number) {
        // Target update rate
        let iterationDt = 1 / 60

        this.dTOffset += dt

        let iterCount = Math.round(this.dTOffset / iterationDt)
        iterCount = clamp(iterCount, 0, 4)
        // console.log(iterCount)
        let subDt = dt / iterCount
        this.integrateAccel(dt)

        for (let i = 0; i < iterCount; i++) {
            this.basicCollisionDetection()

            let iterCount = 10
            let iDt = subDt / iterCount
            for (let c = 0; c < iterCount; c++) {
                // TODO: Constraints
                this.integrateVelocity(iDt)
            }
            this.dTOffset -= iterationDt
        }
        this.clearAllForces()

        // TODO: Update collision list
    }

    clearAllForces() {
        this.objects.forEach(obj => obj.clearForces())
    }

    oct: SpatialHash | null = null

    basicCollisionDetection() {
        if (!this.oct) {
            this.oct = new SpatialHash(1)
            window.oct= this.oct

            for (let o of this.objects) {
                // this.oct.set(new Vector3(...o.transform.worldPosition), o)
                this.oct.insert(vec3.copy(vec3.create(), o.transform.worldPosition), o)
            }
        }
        for (let obj of this.objects) {
            this.oct.move(vec3.copy(vec3.create(), obj.transform.worldPosition), obj)
        }
        let _checks = 0
        let dist = vec3.create()
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].collide === null) continue
            for (let j = i + 1; j < this.objects.length; j++) {
                //if (!this.objects[j].collide) continue
                if (this.objects[j] === this.objects[i]) continue
                 // vec3.subtract(dist, this.objects[j].transform.worldPosition, this.objects[i].transform.worldPosition)
                // if (vec3.length(dist) > 20) {
                //     // if (_checks % 100 == 0)
                //     // console.log(vec3.length(dist))
                //     continue
                // }
                //if (!(this.objects[i].collide && this.objects[j].collide)) continue
                // _checks += 1
                let info = Collision.intersection(this.objects[i], this.objects[j])
                if (info) {
                    this.impulseResolveCollision(info.a, info.b, info)
                    info.a._collided(info.b)
                    info.b._collided(info.a)
                    // this.collisions.insert(info)
                }
            }
            // this.oct.dumbGetNeighbors(this.objects[i].transform.worldPosition).map(n => n.values()).forEach(n => {
            //     for (let nn of n) {
            //         _checks += 1
            //         if (this.objects[i] === nn) continue
            //         let info = Collision.intersection(this.objects[i], nn)
            //         if (info) {
            //             this.impulseResolveCollision(info.a, info.b, info)
            //             info.a._collided(info.b)
            //             info.b._collided(info.a)
            //             // this.collisions.insert(info)
            //         }
            //
            //     }
            // })

        }
        // console.log(_checks)

    }

    impulseResolveCollision(a: PhysicsObject, b: PhysicsObject, p: ContactPoint) {
        let transformA = a.transform
        let transformB = b.transform

        let totalMass = a.inverseMass + b.inverseMass
        if (totalMass == 0) return
        let pNormalScaled = vec3.scale(vec3.create(), p.normal, p.penetration)
        let pNS2A = vec3.scale(vec3.create(), pNormalScaled, a.inverseMass / totalMass)
        let pNS2B = vec3.scale(vec3.create(), pNormalScaled, b.inverseMass / totalMass)

        a.transform.worldPosition = vec3.subtract(vec3.create(), transformA.worldPosition, pNS2A)
        b.transform.worldPosition = vec3.add(vec3.create(), transformB.worldPosition, pNS2B)

        let angVelA = vec3.cross(vec3.create(), a.angularVelocity, p.localA)
        let angVelB = vec3.cross(vec3.create(), b.angularVelocity, p.localB)

        let velocityA = vec3.add(vec3.create(), a.linearVelocity, angVelA)
        let velocityB = vec3.add(vec3.create(), b.linearVelocity, angVelB)

        let contactVelocity = vec3.subtract(vec3.create(), velocityB, velocityA)
        let impulseForce = vec3.dot(contactVelocity, p.normal)

        let p1a = vec3.cross(vec3.create(), p.localA, p.normal)
        let p2a = vec3.transformMat3(p1a, p1a, a.inverseInertiaTensor)
        let inertiaA = vec3.cross(p2a, p2a, p.localA)

        let p1b = vec3.cross(vec3.create(), p.localB, p.normal)
        let p2b = vec3.transformMat3(p1b, p1b, b.inverseInertiaTensor)
        let inertiaB = vec3.cross(p2b, p2b, p.localB)

        let angularEffect = vec3.dot(vec3.add(vec3.create(), inertiaA, inertiaB), p.normal)

        let cRestitution = 0.66

        let j = (-(1 + cRestitution) * impulseForce) / (totalMass + angularEffect)
        let impulse = vec3.scale(vec3.create(), p.normal, j)

        let invImpulse = vec3.scale(vec3.create(), impulse, -1)
        a.applyLinearImpulse(invImpulse)
        b.applyLinearImpulse(impulse)

        a.applyAngularImpulse(vec3.cross(vec3.create(), p.localA, invImpulse))
        b.applyAngularImpulse(vec3.cross(vec3.create(), p.localB, impulse))
    }

}

export class InertiaBuilder {
    static cube(dims: vec3, inverseMass: number) {
        dims.multiply(dims)

        return vec3.fromValues(
            (12 * inverseMass) / (dims.y + dims.z),
            (12 * inverseMass) / (dims.x + dims.z),
            (12 * inverseMass) / (dims.x + dims.y),
        )

    }

    static sphere(radius: number, inverseMass: number): vec3 {
        let i = 2.5 * inverseMass / (radius * radius)
        return vec3.fromValues(
            i, i, i
        )
    }
}

export class PhysicsObject {
    name: string | null = null

    inverseMass: number = 0;
    elasticity: number = 0;
    friction: number = 0;

    linearVelocity: vec3 = vec3.create()
    force: vec3 = vec3.create()

    angularVelocity: vec3 = vec3.create()
    torque: vec3 = vec3.create()
    inverseInertia: vec3 = vec3.create()
    inverseInertiaTensor: mat3 = mat3.create()

    volume: CollisionVolume
    transform: Transform

    damping: number | undefined

    gravity = true
    collide: any = 0

    collideCBs: Array<(other: PhysicsObject, cbUserData: any) => void> = []
    cbUserData: any

    constructor(inverseMass: number, volume: CollisionVolume, transform: Transform) {
        this.inverseMass = inverseMass
        this.volume = volume
        this.transform = transform
    }

    _collided(other: PhysicsObject) {
        this.collideCBs.forEach(cb => cb(other, other.cbUserData))
    }

    addCollideCB(cb: (other: PhysicsObject, userData: any) => void) {
        this.collideCBs.push(cb)
    }

    public clearForces() {
        this.force = vec3.create()
    }

    public addForce(force: vec3) {
        vec3.add(this.force, this.force, force)
    }

    addForceAtPosition(force: vec3, position: vec3) {
        let localPos = position.minused(this.transform.worldPosition)

        this.force.add(force)
        this.torque.add(localPos.crossed(force))
    }

    applyLinearImpulse(force: vec3) {
        vec3.add(this.linearVelocity, this.linearVelocity, vec3.scale(force, force, this.inverseMass))
    }

    applyAngularImpulse(force: vec3) {
        vec3.add(this.angularVelocity, this.angularVelocity, vec3.transformMat3(vec3.create(), force, this.inverseInertiaTensor))
        // this.angularVelocity.insert(force.transformedMat3(this.inverseInertiaTensor))
    }


    updateInertiaTensor() {
        let q = this.transform.worldOrientation
        if (Number.isNaN(q[0])) debugger

        quat.normalize(q, q)
        let invOrientation = mat3.fromQuat(mat3.create(), quat.conjugate(quat.create(), q))
        let orientation = mat3.fromQuat(mat3.create(), q) //Matrix3.fromQuat(q)

        // this.inverseInertiaTensor = orientation.multiplied(Matrix3.fromScaling(this.inverseInertia)).multiplied(invOrientation)
        let scaled = mat3.create()
        scaled[0] = this.inverseInertia[0]
        scaled[4] = this.inverseInertia[1]
        scaled[8] = this.inverseInertia[2]
        let step1 = mat3.multiply(mat3.create(), orientation, scaled)
        let step2 = mat3.multiply(mat3.create(), step1, invOrientation)
        this.inverseInertiaTensor = step2

        // mat3.multiply(orientation, orientation, m)
        // this.inverseInertiaTensor = mat3.multiply(orientation, orientation, invOrientation)
    }
}

// function OBBOBBIntersection (volumeA:OOBVolume, transformA: Transform, volumeB: OOBVolume, transformB: Transform){
//
// }
namespace Collision {
    let delta = vec3.create()

    function SphereSphereIntersection(a: PhysicsObject, b: PhysicsObject): ContactPoint | null {
        let volumeA = a.volume as SphereVolume
        let volumeB = b.volume as SphereVolume
        let pA = a.transform.worldPosition
        let pB = b.transform.worldPosition
        let minimumSep = volumeA.radius + volumeB.radius
        // let delta = vec3.subtract(vec3.create(), pB, pA)
        vec3.subtract(delta, pB, pA)
        // let delta = transformB.worldPosition.minused(transformA.worldPosition)

        // let deltaLength = vec3.length(delta)
        // console.log("check collisison", deltaLength)
        // HACK: Math.hypot is REALLY slow
        // let deltaLength = Math.sqrt(delta[0]**delta[0]+ delta[1]**delta[1]+ delta[2]**delta[2])
        let deltaLength = Math.sqrt(delta[0] ** 2 + delta[1] ** 2 + delta[2] ** 2)
        // let deltaLength = Math.hypot(delta[0], delta[1], delta[2])

        // let distanceSquared = (pA[0] - pB[0]) ** 2 + (pA[1] - pB[1]) ** 2 + (pA[2] - pB[2]) ** 2
        // console.log("check collisison", distanceSquared)

        // if (distanceSquared < (minimumSep ** 2)) {
        if (deltaLength < minimumSep) {
            // let deltaLength = Math.sqrt(delta[0] ** 2 + delta[1] ** 2 + delta[2] ** 2)
            let deltaLength = vec3.length(delta)
            let penetration = minimumSep - deltaLength
            let normal = vec3.normalize(delta, delta)

            let lA = vec3.scale(vec3.create(), normal, volumeA.radius)
            let t = vec3.scale(vec3.create(), normal, -1)
            let lB = vec3.scale(t, t, volumeB.radius)
            // let lA = normal.scaled(volumeA.radius)
            // let lB = normal.scaled(-1).scaled(volumeB.radius)

            return new ContactPoint(a, b, lA, lB, vec3.copy(vec3.create(), normal), penetration);
        }

        return null
    }

    let aabbsiV2DONOTUSE = vec3.create()
    let aabbsiV3DONOTUSE = vec3.create()

    function AABBSphereIntersection(
        a: PhysicsObject, b: PhysicsObject
    ): ContactPoint | null {
        let volumeA = a.volume as AABBVolume
        let volumeB = b.volume as SphereVolume
        let transformA = a.transform
        let transformB = b.transform
        let boxSize = volumeA.halfSizes
        vec3.subtract(delta, transformB.worldPosition, transformA.worldPosition)

        let closestPointOnBox = clampVec3(delta, vec3.scale(aabbsiV2DONOTUSE, boxSize, -1), boxSize)
        // let localPoint = delta.minused(closestPointOnBox)
        let localPoint = vec3.subtract(delta, delta, closestPointOnBox)
        // let dist = Math.hypot(localPoint[0], localPoint[1], localPoint[2])
        let dist = Math.sqrt(localPoint[0] * localPoint[0] + localPoint[1] * localPoint[1] + localPoint[2] * localPoint[2])

        if (dist < volumeB.radius) {
            let dist = Math.hypot(localPoint[0], localPoint[1], localPoint[2])
            let normal = vec3.normalize(vec3.create(), localPoint)
            let penetration = volumeB.radius - dist

            let lA = vec3.fromValues(0, 0, 0)
            let lB = vec3.scale(aabbsiV3DONOTUSE, normal, -1)
            lB = vec3.scale(lB, lB, volumeB.radius)
            // let lB = normal.scaled(-1).scaled(volumeB.radius)

            return new ContactPoint(a, b, lA, lB, normal, penetration)
        }
        return null
    }

    function AABBAABBIntersection(
        // _volumeA: AABBVolume, _transformA: Transform, _volumeB: AABBVolume, _transformB: Transform
        _a: PhysicsObject, _b: PhysicsObject
    ): ContactPoint | null {
        return null
    }

    export function intersection(a: PhysicsObject, b: PhysicsObject): ContactPoint | null {
        // if (a.volume instanceof AABBVolume && b.volume instanceof AABBVolume) {
        //     return AABBAABBIntersection(a, b)
        // }
        if (a.volume instanceof AABBVolume && b.volume instanceof SphereVolume) {
            return AABBSphereIntersection(a, b)
        }
        if (a.volume instanceof SphereVolume && b.volume instanceof AABBVolume) {
            return AABBSphereIntersection(b, a)
        }
        if (a.volume instanceof SphereVolume && b.volume instanceof SphereVolume) {
            return SphereSphereIntersection(a, b)
        }
        // throw 'Unknown collider pair'
        return null

    }

    let clampVec3DONOTUSE = vec3.create()

    function clampVec3(a: vec3, min: vec3, max: vec3): vec3 {
        // return vec3.fromValues(
        //     clamp(a[0], min[0], max[0]),
        //     clamp(a[1], min[1], max[1]),
        //     clamp(a[2], min[2], max[2]),
        // )
        clampVec3DONOTUSE[0] = clamp(a[0], min[0], max[0])
        clampVec3DONOTUSE[1] = clamp(a[1], min[1], max[1])
        clampVec3DONOTUSE[2] = clamp(a[2], min[2], max[2])
        return clampVec3DONOTUSE
    }
}


function clamp<T>(value: T, min: T, max: T) {
    if (value < min) {
        return min
    }
    if (value > max) {
        return max
    }
    return value
}
