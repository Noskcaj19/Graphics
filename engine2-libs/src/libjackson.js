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
  urandom: () => Math.random() * 2 - 1,
  mergeDeep: mergeDeep,
  clamp: (lower, upper, val) => {
    return Math.max(Math.min(upper, val), lower)
  },
  scale: (x, inMin, inMax, outMin, outMax) =>
      ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin,
  deg2rad: (deg) => deg * (Math.PI / 180),
  contains: function (container, needle) {
    return container.find((a) => _.equals(a, needle)) ?? false
  },
  equals: function (a, b) {
    if (typeof a !== typeof b) {
      return false
    }
    if (typeof a === 'number' || typeof a === 'string') {
      return a === b
    }
    if (a instanceof Array) {
      return _.zip(a, b).every(([l, r]) => _.equals(l, r))
    } else if (a instanceof Object) {
      return _.zip(Object.entries(a), Object.entries(b)).every(
          ([l, r]) => _.equals(l, r)
      )
    }
    throw 'todo'
  },
  zip: function () {
    let out = []
    let arr = Array.from(arguments)
    for (
        let i = 0;
        i < Math.max(...arr.map((a) => a.length));
        i++
    ) {
      out.push(arr.map((a) => a[i]))
    }
    return out
  },
  map2d: (x, y, fn) => {
    if (typeof x === 'number') {
      return _.map2d(_.range(x), _.range(y), fn)
    } else {
      return x.map((a) => y.map((b) => fn(a, b))).flat()
    }
  }
}


export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, {[key]: {}});
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, {[key]: source[key]});
      }
    }
  }

  return mergeDeep(target, ...sources);
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
    let data;
    [data, str] = parser(str)

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


class Path {
  /**
   * @type {[number, number][]}
   */
  #path
  #i = 0

  constructor(path) {
    this.#path = path
  }

  next() {
    return this.#path[this.#i++]
  }

  get remainingPath() {
    return this.#path.slice(this.#i)
  }

  get totalPath() {
    return this.#path
  }

  get traversedPath() {
    return this.#path.slice(0, this.#i)
  }

  get length() {
    return this.remainingPath.length
  }
}
export function astarSimple(start, end, world) {
  function neighbors(pos) {
    return [
      [pos[0] - 1, pos[1]],
      [pos[0] + 1, pos[1]],
      [pos[0], pos[1] - 1],
      [pos[0], pos[1] + 1],
    ]
        .filter(
            (a) =>
                a[0] >= 0 &&
                a[1] >= 0 &&
                a[0] < world.width &&
                a[1] < world.height
        )
        .filter((x) => {
          let entity = world.get(...x)
          if (entity) {
            return entity instanceof Player
          }
          return true
        })
  }

  if (world.get(...end)) {
    if (!(world.get(...end) instanceof Player)) return null
  }

  return astar(start, end, manhattan, () => 1, neighbors, world)
}

export function astar(start, end, distance, cost, neighbors, gas) {
  function path(cameFrom, current) {
    let totalPath = [current]
    while (cameFrom[current]) {
      current = cameFrom[current]
      totalPath.unshift(current)
    }
    return new Path(totalPath)
  }

  let open = [start]
  let closed = new Map()
  let cameFrom = {}

  let gScore = {}
  gScore[start] = 0

  let fScore = {}
  fScore[start] = distance(start, end)

  function lowestFscore(candidates) {
    let lowest = Infinity
    let val = null
    for (let can of candidates) {
      let tmp = fScore[can] ?? Infinity
      if (tmp < lowest) {
        lowest = tmp
        val = can
      }
    }
    return val
  }

  gas ??= 500
  while (open.length !== 0) {
    if (gas < 0) throw 'Ran out of gas'
    let current = lowestFscore(open) // the node in openSet having the lowest fScore[] value
    if (_.equals(current, end)) {
      return path(cameFrom, current)
    }

    // open.removeElement(current)
    _.remove(open, current)
    closed.set(current.toString(), null)
    for (let neighbor of neighbors(current)) {
      if (closed.has(neighbor.toString())) {
        gas -= 1
        continue
      }
      let tent =
          (gScore[current] ?? Infinity) +
          cost(current, neighbor)
      if (tent < (gScore[neighbor] ?? Infinity)) {
        cameFrom[neighbor] = current
        gScore[neighbor] = tent
        fScore[neighbor] = tent + distance(neighbor, end)
        if (!_.contains(open, neighbor)) {
          open.push(neighbor)
          gas -= 4
        }
      }
    }
  }
  throw 'no path'
}

export function manhattan(pos0, pos1) {
  let d1 = Math.abs(pos1[0] - pos0[0])
  let d2 = Math.abs(pos1[1] - pos0[1])
  return d1 + d2
}


function bicubicInterpolator(vals, {translateX, translateY}) {
  const a00 = vals[1][1],
      a01 = (-1 / 2) * vals[1][0] + (1 / 2) * vals[1][2],
      a02 = vals[1][0] + (-5 / 2) * vals[1][1] + 2 * vals[1][2] + (-1 / 2) * vals[1][3],
      a03 = (-1 / 2) * vals[1][0] + (3 / 2) * vals[1][1] + (-3 / 2) * vals[1][2] + (1 / 2) * vals[1][3],
      a10 = (-1 / 2) * vals[0][1] + (1 / 2) * vals[2][1],
      a11 = (1 / 4) * vals[0][0] + (-1 / 4) * vals[0][2] + (-1 / 4) * vals[2][0] + (1 / 4) * vals[2][2],
      a12 = (-1 / 2) * vals[0][0] + (5 / 4) * vals[0][1] + -1 * vals[0][2] + (1 / 4) * vals[0][3] + (1 / 2) * vals[2][0] + (-5 / 4) * vals[2][1] + vals[2][2] + (-1 / 4) * vals[2][3],
      a13 = (1 / 4) * vals[0][0] + (-3 / 4) * vals[0][1] + (3 / 4) * vals[0][2] + (-1 / 4) * vals[0][3] + (-1 / 4) * vals[2][0] + (3 / 4) * vals[2][1] + (-3 / 4) * vals[2][2] + (1 / 4) * vals[2][3],
      a20 = vals[0][1] + (-5 / 2) * vals[1][1] + 2 * vals[2][1] + (-1 / 2) * vals[3][1],
      a21 = (-1 / 2) * vals[0][0] + (1 / 2) * vals[0][2] + (5 / 4) * vals[1][0] + (-5 / 4) * vals[1][2] + -1 * vals[2][0] + vals[2][2] + (1 / 4) * vals[3][0] + (-1 / 4) * vals[3][2],
      a22 = vals[0][0] + (-5 / 2) * vals[0][1] + 2 * vals[0][2] + (-1 / 2) * vals[0][3] + (-5 / 2) * vals[1][0] + (25 / 4) * vals[1][1] + -5 * vals[1][2] + (5 / 4) * vals[1][3] + 2 * vals[2][0] + -5 * vals[2][1] + 4 * vals[2][2] + -1 * vals[2][3] + (-1 / 2) * vals[3][0] + (5 / 4) * vals[3][1] + -1 * vals[3][2] + (1 / 4) * vals[3][3],
      a23 = (-1 / 2) * vals[0][0] + (3 / 2) * vals[0][1] + (-3 / 2) * vals[0][2] + (1 / 2) * vals[0][3] + (5 / 4) * vals[1][0] + (-15 / 4) * vals[1][1] + (15 / 4) * vals[1][2] + (-5 / 4) * vals[1][3] + -1 * vals[2][0] + 3 * vals[2][1] + -3 * vals[2][2] + vals[2][3] + (1 / 4) * vals[3][0] + (-3 / 4) * vals[3][1] + (3 / 4) * vals[3][2] + (-1 / 4) * vals[3][3],
      a30 = (-1 / 2) * vals[0][1] + (3 / 2) * vals[1][1] + (-3 / 2) * vals[2][1] + (1 / 2) * vals[3][1],
      a31 = (1 / 4) * vals[0][0] + (-1 / 4) * vals[0][2] + (-3 / 4) * vals[1][0] + (3 / 4) * vals[1][2] + (3 / 4) * vals[2][0] + (-3 / 4) * vals[2][2] + (-1 / 4) * vals[3][0] + (1 / 4) * vals[3][2],
      a32 = (-1 / 2) * vals[0][0] + (5 / 4) * vals[0][1] + -1 * vals[0][2] + (1 / 4) * vals[0][3] + (3 / 2) * vals[1][0] + (-15 / 4) * vals[1][1] + 3 * vals[1][2] + (-3 / 4) * vals[1][3] + (-3 / 2) * vals[2][0] + (15 / 4) * vals[2][1] + -3 * vals[2][2] + (3 / 4) * vals[2][3] + (1 / 2) * vals[3][0] + (-5 / 4) * vals[3][1] + vals[3][2] + (-1 / 4) * vals[3][3],
      a33 = (1 / 4) * vals[0][0] + (-3 / 4) * vals[0][1] + (3 / 4) * vals[0][2] + (-1 / 4) * vals[0][3] + (-3 / 4) * vals[1][0] + (9 / 4) * vals[1][1] + (-9 / 4) * vals[1][2] + (3 / 4) * vals[1][3] + (3 / 4) * vals[2][0] + (-9 / 4) * vals[2][1] + (9 / 4) * vals[2][2] + (-3 / 4) * vals[2][3] + (-1 / 4) * vals[3][0] + (3 / 4) * vals[3][1] + (-3 / 4) * vals[3][2] + (1 / 4) * vals[3][3]

  return (x, y) => {
    x = x + translateX ?? 0
    y = y + translateY ?? 0
    if (x < 0 || y < 0 || x > 1 || y > 1)
      throw `oob: (${x}, ${y}) outside of (0, 0) to (1, 1)`

    const x2 = x * x,
        x3 = x * x2,
        y2 = y * y,
        y3 = y * y2

    return (
        a00 +
        a01 * y +
        a02 * y2 +
        a03 * y3 +
        (a10 + a11 * y + a12 * y2 + a13 * y3) * x +
        (a20 + a21 * y + a22 * y2 + a23 * y3) * x2 +
        (a30 + a31 * y + a32 * y2 + a33 * y3) * x3
    )
  }
}

function bicubicGridInterpolator(values) {
  const m = values.length
  const n = values[0].length
  const interpolators = []

  for (let x of _.range(1, m - 2)) interpolators[x] = []

  return (x, y) => {
    if (x < 1 || y < 1 || x > m - 2 || y > n - 2)
      throw `oob: (${x}, ${y}) outside of (1,1) to (${
          m - 2
      }, ${n - 2})`

    let blX = Math.floor(x)
    let blY = Math.floor(y)

    if (x === m - 2) blX--
    if (y === n - 2) blY--

    if (!interpolators[blX][blY]) {
      interpolators[blX][blY] = bicubicInterpolator(
          [
            [
              values[blX - 1][blY - 1],
              values[blX - 1][blY],
              values[blX - 1][blY + 1],
              values[blX - 1][blY + 2],
            ],
            [
              values[blX + 0][blY - 1],
              values[blX + 0][blY],
              values[blX][blY + 1],
              values[blX][blY + 2],
            ],
            [
              values[blX + 1][blY - 1],
              values[blX + 1][blY],
              values[blX + 1][blY + 1],
              values[blX + 1][blY + 2],
            ],
            [
              values[blX + 2][blY - 1],
              values[blX + 2][blY],
              values[blX + 2][blY + 1],
              values[blX + 2][blY + 2],
            ],
          ],
          {
            translateX: -blX,
            translateY: -blY,
          }
      )
    }
    const interpolator = interpolators[blX][blY]
    return interpolator(x, y)
  }
}

// Supersample a bicubic noise grid to get detailed noise at small scales
export function bicubicNoiseHelper(
    noiseWidth,
    noiseHeight,
    sampleWidth,
    sampleHeight
) {
  // generate pointmap
  let points = _.range(noiseHeight).map((_i) =>
      _.range(noiseHeight).map((_i) => _.randInt(0, 255) / 255)
  )
  const interpolator = bicubicGridInterpolator(points)

  return (x, y) => {
    // scale sample-space to pointmap scale
    return interpolator(
        _.scale(x, 0, sampleWidth, 1, noiseWidth - 2),
        _.scale(y, 0, sampleHeight, 1, noiseHeight - 2)
    )
  }
}
