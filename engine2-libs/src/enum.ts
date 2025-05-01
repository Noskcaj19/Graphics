export default class Enum<T>{
    value:T|undefined;

    constructor(value?: T) {
        this.value = value
    }

    static named(name) {
        let found = Object.entries(this).find(([_k, v]) => v?.name === name)
        if (found) return found[1]
        throw `Undefined variant "${name}"`
    }

    static make() {
        for (let [prop, val] of Object.entries(this)) {
            Object.defineProperty(val, 'name', {value: prop})
        }
    }

    toString() {
        return `${this.constructor.name}.${(this as any).name}`
    }

    static* [Symbol.iterator]() {
        for (let v of Object.values(this)) {
            if (v instanceof this) {
                yield v
            }
        }
    }
}
