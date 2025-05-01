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
export let _ = {
  remove: (array, target) => {
    let index = array.indexOf(target)
    if (index === -1) {
      return null
    }
    array.splice(index, 1)
    return target

  },

  objectMap: (obj, fn) => {
    return Object.fromEntries(Object.entries(obj).map(fn))
  },
  range: (a, b) => {
    if (b) {
      let step = a > b ? -1 : 1
      let size = a > b ? a - b : b - a
      return [...Array(size).keys()].map(i => step * i + a);
    }
    return [...Array(a).keys()];
  },
  randInt: (lower, upper) => lower + Math.floor(Math.random() * (upper - lower + 1)),
  urandom: () => Math.random() *2-1,
}


/** @template T */
export class Enum {
  /** @type {T} */
  value;

  /**
   * @param [value] {T} An optional value
   */
  constructor(value) {
    this.value = value
  }

  static named(name) {
    let found = Object.entries(this).find(([k, v]) => v?.name === name)
    if (found) return found[1]
    throw `Undefined variant "${name}"`
  }

  static make() {
    for (let [prop, val] of Object.entries(this)) {
      Object.defineProperty(val, 'name', {value: prop})
    }
  }

  toString() {
    return `${this.constructor.name}.${this.name}`
  }

  static* [Symbol.iterator]() {
    for (let v of Object.values(this)) {
      if (v instanceof this) {
        yield v
      }
    }
  }
}

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
    return [{
      type: 'classes', val: result[1].split('.'),
    }, str.substring(result.indices[1][1]),]
  } else {
    return [{type: 'id', val: result[2]}, str.substring(result.indices[2][1]),]
  }
}

function parseMultiplicity(str) {
  let result = /^\*(\d+)/du.exec(str)

  if (result == null) {
    return [null, str]
  }

  return [parseInt(result[1]), str.substring(result.indices[0][1]),]
}

function parseAll(str, parsers) {
  let results = {}
  for (let parser of parsers) {
    let data;[data, str] = parser(str)

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
  if (!children && (attrs instanceof Array || attrs instanceof Node)) {
    children = attrs
    attrs = {}
  }
  children = children instanceof Node ? [children] : children
  attrs = attrs || {}
  let {name, id, classes, text, multiplicity} = parseElement(elDescriptor)[0]
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

  if (multiplicity) el = _.range(multiplicity).map((_) => el.cloneNode(true))

  return el
}
