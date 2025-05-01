
        export function $(selector) {
            return document.querySelector(selector)
        }

        // Object.defineProperty(Array.prototype, "removeElement", {
        //     value:
        //         function (target) {
        //             let index = this.indexOf(target)
        //             if (index === -1) {
        //                 return -1
        //             }
        //             this.splice(index, 1)
        //             return this
        //         }
        // })

        // A [bad] [partial] reimplementation of the excellent lodash
        export let _ ={}

        _.contains = function (container, needle) {
            return container.find(a => _.equals(a, needle)) ?? false
        }
        _.equals = function (a, b) {
            if (typeof a !== typeof b) {
                return false
            }
            if (typeof a === "number" || typeof a === "string") {
                return a === b
            }
            if (a instanceof Array) {
                return _.zip(a, b).every(([l, r]) => _.equals(l, r))
            } else if (a instanceof Object) {
                return _.zip(Object.entries(a), Object.entries(b)).every(([l, r]) => _.equals(l, r))
            }
            throw "todo"
        }

        _.zip = function () {
            let out = []
            let arr = Array.from(arguments)
            for (let i in _.range(Math.max(...arr.map(a => a.length)))) {
                out.push(arr.map(a => a[i]))
            }
            return out
        }
        // from a to b or from 0 to a
        _.range = function range(a, b) {
            if (b) {
                let step = a > b ? -1 : 1
                let size = a > b ? a - b : b - a
                return [...Array(size).keys()].map(i => step * i + a);
            }
            return [...Array(a).keys()];
        }
        _.map2d = (x, y, fn) => {
            if (typeof x === "number") {
                return _.map2d(_.range(x), _.range(y), fn)
            } else {
                return x.map(a => y.map(b => fn(a, b))).flat()
            }
        }
        _.randInt = (lower, upper) => lower + Math.floor(Math.random() * (upper - lower + 1))
        _.urandom = () => Math.random() * 2 - 1
        _.clamp = (lower, upper, val) => Math.max(Math.min(upper, val), lower)
        _.ndRandom = (min, max, skew) => {
            let u = Math.random(), v = Math.random()
            let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
            if (num > 1 || num < 0) {
                num = _.ndRandom(min, max, skew)
            } else {
                num = Math.pow(num, skew)
                num *= max - min
                num += min
            }
            return num
        }

        // Object.defineProperties(Object, {
        //     "map": {
        //         value: (obj, fn) => {
        //             return Object.fromEntries(Object.entries(obj).map(fn))
        //         }
        //     },
        //     "asyncMap": {
        //         value: async (obj, fn) => {
        //             return Object.fromEntries(await Promise.all(Object.entries(obj).map(async (e) => await fn(e))))
        //         }
        //     }
        // })