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
export let _ = {}

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

function parseName(str) {
    let result = /^[A-z0-9-]+/du.exec(str)

    if (result == null) {
        return [null, str]
    }

    return [result[0], str.substring(result.indices[0][1])]
}

function parseText(str) {
    let result = /^\{([^}]+)\}/du.exec(str)

    if (result == null) {
        return [null, str]
    }

    return [result[1], str.substring(result.indices[0][1])]
}

function parseIdOrClasses(str) {
    let result = /^(?:\.([A-z][A-z-.]*))|(?:#([A-z-]+))/du.exec(str)

    if (result == null) {
        return [null, str]
    }

    if (result[0][0] === '.') {
        return [
            {
                type: 'classes',
                val: result[1].split('.'),
            },
            str.substring(result.indices[1][1]),
        ]
    } else {
        return [
            {type: 'id', val: result[2]},
            str.substring(result.indices[2][1]),
        ]
    }
}

function parseMultiplicity(str) {
    let result = /^\*(\d+)/du.exec(str)

    if (result == null) {
        return [null, str]
    }

    return [
        parseInt(result[1]),
        str.substring(result.indices[0][1]),
    ]
}

function parseAll(str, parsers) {
    let results = {}
    for (let parser of parsers) {
        let data
        ;[data, str] = parser(str)

        if (data !== null) {
            let {type, val} = data
            Object.assign(results, {
                [type]: val,
            })
        }
    }
    return [results, str]
}

function parseOptionalIdAndClasses(str) {
    return parseAll(str, [parseIdOrClasses, parseIdOrClasses])
}

function parseElement(str) {
    var [name, str] = parseName(str)
    var [{id, classes}, str] = parseOptionalIdAndClasses(str)
    var [text, str] = parseText(str)
    var [multiplicity, str] = parseMultiplicity(str)

    return [{name, id, classes, text, multiplicity}, str]
}

export function h(elDescriptor, attrs, children) {
    if (typeof attrs == 'string') {
        children = [attrs]
        attrs = {}
    }
    if (
        !children &&
        (attrs instanceof Array || attrs instanceof Node)
    ) {
        children = attrs
        attrs = {}
    }
    children = children instanceof Node ? [children] : children
    attrs = attrs || {}
    let {name, id, classes, text, multiplicity} =
        parseElement(elDescriptor)[0]
    let el = document.createElement(name)
    if (id) el.setAttribute('id', id)
    classes?.forEach((className) => el.classList.add(className))
    if (text) {
        el.appendChild(document.createTextNode(text))
    }

    for (let [attr, val] of Object.entries(attrs)) {
        if (val === undefined) continue
        if (attr.startsWith('on')) {
            el.addEventListener(attr.substring(2), val)
            continue
        }
        if (attr.startsWith('$')) {
            if (val) el.setAttribute(attr.substring(1), '')
            continue
        }
        el.setAttribute(attr, val)
    }

    for (let child of children || []) {
        if (typeof child == 'string') {
            child = document.createTextNode(child)
        }
        el.appendChild(child)
    }

    if (multiplicity)
        el = _.range(multiplicity).map((_) => el.cloneNode(true))

    return el
}