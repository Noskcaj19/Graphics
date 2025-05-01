import {vec3} from "./glutils.js"

export class SpatialHash {
    bins: Map<any, any>[][] [] = []
    num: number

    constructor(num: number = 50) {
        this.num = num
    }


    reverseMap = new Map<Object, { c: Map<any, any>, p: vec3 }>

    insert(p: vec3, v: any) {
        let l1 = this.bins[Math.abs(Math.round(p[0])) % this.num] ??= [];
        let l2 = l1[Math.abs(Math.round(p[1])) % this.num] ??= [];
        let l3 = l2[Math.abs(Math.round(p[2])) % this.num] ??= new Map();
        l3.set(p[2], v)
        this.reverseMap.set(v, {c: l3, p: p})
    }


    dumbGetNeighbors(p: vec3) {
        let l1i = Math.abs(Math.round(p[0])) % this.num
        let l2i = Math.abs(Math.round(p[1])) % this.num
        let l3i = Math.abs(Math.round(p[2])) % this.num
        let l1s = [this.bins[l1i], this.bins[l1i - 1 < 0 ? this.num - l1i : l1i - 1], this.bins[l1i + 1 > this.num ? (l1i + 1) - this.num : l1i + 1]].filter(i => i)
        let l2s = l1s.map(l1 => [l1[l2i], l1[l2i - 1 < 0 ? this.num - l2i : l2i - 1], l1[l2i + 1 > this.num ? (l2i + 1) - this.num : l2i + 1]].filter(i => i)).flat()
        let l3s = l2s.map(l2 => [l2[l3i], l2[l3i - 1 < 0 ? this.num - l3i : l3i - 1], l2[l3i + 1 > this.num ? (l3i + 1) - this.num : l3i + 1]].filter(i => i)).flat()
        return l3s
    }

    move(newP: vec3, v: any) {
        let q = this.reverseMap.get(v)
        if (!q) {
            return
        }
        let {p: oldP, c: oldC} = q
        let l1 = this.bins[Math.abs(Math.round(newP[0])) % this.num] ??= [];
        let l2 = l1[Math.abs(Math.round(newP[1])) % this.num] ??= [];
        let l3 = l2[Math.abs(Math.round(newP[2])) % this.num] ??= new Map();
        if (l3 === oldC) {
            return
        }

        oldC.delete(oldP[2])
        this.reverseMap.delete(v)

        // l3.set(newP[2], v)
        this.insert(newP, v)
    }

}
