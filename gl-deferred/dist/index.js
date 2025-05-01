"use strict";
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateMethod = (obj, member, method) => {
    __accessCheck(obj, member, "access private method");
    return method;
  };

  // libjackson.ts
  function $(selector) {
    return document.querySelector(selector);
  }
  var _ = {
    contains: function(container, needle) {
      var _a;
      return (_a = container.find((a) => _.equals(a, needle))) != null ? _a : false;
    },
    equals: function(a, b) {
      if (typeof a !== typeof b) {
        return false;
      }
      if (typeof a === "number" || typeof a === "string") {
        return a === b;
      }
      if (a instanceof Array) {
        return _.zip(a, b).every(([l, r]) => _.equals(l, r));
      } else if (a instanceof Object) {
        return _.zip(Object.entries(a), Object.entries(b)).every(([l, r]) => _.equals(l, r));
      }
      throw "todo";
    },
    zip: function(...any) {
      let out = [];
      let arr = Array.from(arguments);
      for (let i in _.range(Math.max(...arr.map((a) => a.length)))) {
        out.push(arr.map((a) => a[i]));
      }
      return out;
    },
    // from a to b or from 0 to a
    range: function range(a, b) {
      if (b) {
        let step = a > b ? -1 : 1;
        let size = a > b ? a - b : b - a;
        return [...Array(size).keys()].map((i) => step * i + a);
      }
      return [...Array(a).keys()];
    },
    map2d: (x, y, fn) => {
      if (typeof x === "number" && typeof y === "number") {
        return _.map2d(_.range(x), _.range(y), fn);
      } else if (x instanceof Array && y instanceof Array) {
        return x.map((a) => y.map((b) => fn(a, b))).flat();
      } else {
        throw "Unreachable";
      }
    },
    randInt: (lower, upper) => lower + Math.floor(Math.random() * (upper - lower + 1)),
    urandom: () => Math.random() * 2 - 1,
    clamp: (lower, upper, val) => Math.max(Math.min(upper, val), lower),
    ndRandom: (min, max, skew) => {
      let u = Math.random(), v = Math.random();
      let num = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      if (num > 1 || num < 0) {
        num = _.ndRandom(min, max, skew);
      } else {
        num = Math.pow(num, skew);
        num *= max - min;
        num += min;
      }
      return num;
    }
  };
  function parseName(str) {
    let result = new RegExp("^[A-z0-9-]+", "du").exec(str);
    if (result == null) {
      return [null, str];
    }
    return [result[0], str.substring(result.indices[0][1])];
  }
  function parseText(str) {
    let result = new RegExp("^\\{([^}]+)\\}", "du").exec(str);
    if (result == null) {
      return [null, str];
    }
    return [result[1], str.substring(result.indices[0][1])];
  }
  function parseIdOrClasses(str) {
    let result = new RegExp("^(?:\\.([A-z][A-z-.]*))|(?:#([A-z-]+))", "du").exec(str);
    if (result == null) {
      return [null, str];
    }
    if (result[0][0] === ".") {
      return [
        {
          type: "classes",
          val: result[1].split(".")
        },
        str.substring(result.indices[1][1])
      ];
    } else {
      return [
        { type: "id", val: result[2] },
        str.substring(result.indices[2][1])
      ];
    }
  }
  function parseMultiplicity(str) {
    let result = new RegExp("^\\*(\\d+)", "du").exec(str);
    if (result == null) {
      return [null, str];
    }
    return [
      parseInt(result[1]),
      str.substring(result.indices[0][1])
    ];
  }
  function parseAll(str, parsers) {
    let results = {};
    for (let parser of parsers) {
      let data;
      [data, str] = parser(str);
      if (data !== null) {
        let { type, val } = data;
        Object.assign(results, {
          [type]: val
        });
      }
    }
    return [results, str];
  }
  function parseOptionalIdAndClasses(str) {
    return parseAll(str, [parseIdOrClasses, parseIdOrClasses]);
  }
  function parseElement(str) {
    var [name, str] = parseName(str);
    var [{ id, classes }, str] = parseOptionalIdAndClasses(str);
    var [text, str] = parseText(str);
    var [multiplicity, str] = parseMultiplicity(str);
    return [{ name, id, classes, text, multiplicity }, str];
  }
  function h(elDescriptor, attrs, children) {
    if (typeof attrs == "string") {
      children = [attrs];
      attrs = {};
    }
    if (!children && (attrs instanceof Array || attrs instanceof Node)) {
      children = attrs;
      attrs = {};
    }
    children = children instanceof Node ? [children] : children;
    attrs = attrs || {};
    let { name, id, classes, text, multiplicity } = parseElement(elDescriptor)[0];
    let el = document.createElement(name);
    if (id)
      el.setAttribute("id", id);
    classes == null ? void 0 : classes.forEach((className) => el.classList.add(className));
    if (text) {
      el.appendChild(document.createTextNode(text));
    }
    for (let [attr, val] of Object.entries(attrs)) {
      if (val === void 0)
        continue;
      if (attr.startsWith("on")) {
        el.addEventListener(attr.substring(2), val);
        continue;
      }
      if (attr.startsWith("$")) {
        if (val)
          el.setAttribute(attr.substring(1), "");
        continue;
      }
      el.setAttribute(attr, val);
    }
    for (let child of children || []) {
      if (typeof child == "string") {
        child = document.createTextNode(child);
      }
      el.appendChild(child);
    }
    if (multiplicity)
      el = _.range(multiplicity).map((_3) => el.cloneNode(true));
    return el;
  }

  // glutils.ts
  function newGLBuffer(gl, data, kind = WebGLRenderingContext.ARRAY_BUFFER, usage = WebGLRenderingContext.STATIC_DRAW) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(kind, buffer);
    gl.bufferData(
      kind,
      data,
      usage
    );
    return buffer;
  }
  var vec3 = {
    zero: () => {
      return new Float32Array([0, 0, 0]);
    },
    fromValues: (x, y, z) => {
      return new Float32Array([x, y, z]);
    }
  };
  var quat = {
    create: () => {
      return new Float32Array([0, 0, 0, 1]);
    },
    rotateX: (out, input, radians) => {
      let [inX, inY, inZ, inW] = input;
      let [w, x] = [Math.cos(radians * 0.5), Math.sin(radians * 0.5)];
      out[0] = inX * w + inW * x;
      out[1] = inY * w + inZ * x;
      out[2] = inZ * w - inY * x;
      out[3] = inW * w - inX * x;
      return out;
    },
    rotateY: (out, input, radians) => {
      let [inX, inY, inZ, inW] = input;
      let [w, y] = [Math.cos(radians * 0.5), Math.sin(radians * 0.5)];
      out[0] = inX * w - inZ * y;
      out[1] = inY * w + inW * y;
      out[2] = inZ * w + inX * y;
      out[3] = inW * w - inY * y;
      return out;
    },
    toTranslationMatrix: (input) => {
      let [a, b, c, d] = input;
      return mat4.fromRows([
        [2 * Math.pow(a, 2) - 1 + 2 * Math.pow(b, 2), 2 * b * c + 2 * a * d, 2 * b * d - 2 * a * c],
        [2 * b * c - 2 * a * d, 2 * Math.pow(a, 2) - 1 + 2 * Math.pow(c, 2), 2 * c * d + 2 * a * d],
        [2 * b * d + 2 * a * c, 2 * c * d - 2 * a * b, 2 * Math.pow(a, 2) - 1 + 2 * Math.pow(d, 2)]
      ]);
    }
  };
  var mat4 = {
    create: () => {
      return mat4.fromRows([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ]);
    },
    perspective: (out, fovy, aspect, near, far) => {
      let f = 1 / Math.tan(fovy / 2);
      out[0] = f / aspect;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = f;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = -1;
      out[12] = 0;
      out[13] = 0;
      out[15] = 0;
      if (far != null && far !== Infinity) {
        let nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
      } else {
        out[10] = -1;
        out[14] = -2 * near;
      }
      return out;
    },
    fromRotationTranslation: (out, inQuat, translation) => {
      let [x, y, z, w] = inQuat;
      let x2 = x + x;
      let y2 = y + y;
      let z2 = z + z;
      let xx = x * x2;
      let xy = x * y2;
      let xz = x * z2;
      let yy = y * y2;
      let yz = y * z2;
      let zz = z * z2;
      let wx = w * x2;
      let wy = w * y2;
      let wz = w * z2;
      let [tx, ty, tz] = translation;
      let result = mat4.fromRows([
        [1 - (yy + zz), xy + wz, xz - wy, 0],
        [xy - wz, 1 - (xx + zz), yz + wx, 0],
        [xz + wy, yz - wx, 1 - (xx + yy), 0],
        [tx, ty, tz, 1]
      ]);
      for (let i = 0; i < 4 * 4; i++) {
        out[i] = result[i];
      }
      return out;
    },
    multiply: (out, lhs, rhs) => {
      let lhsT = mat4.clone(lhs);
      let rhsT = mat4.clone(rhs);
      out[0] = lhsT[0] * rhsT[0] + lhsT[4] * rhsT[1] + lhsT[8] * rhsT[2] + lhsT[12] * rhsT[3];
      out[1] = lhsT[1] * rhsT[0] + lhsT[5] * rhsT[1] + lhsT[9] * rhsT[2] + lhsT[13] * rhsT[3];
      out[2] = lhsT[2] * rhsT[0] + lhsT[6] * rhsT[1] + lhsT[10] * rhsT[2] + lhsT[14] * rhsT[3];
      out[3] = lhsT[3] * rhsT[0] + lhsT[7] * rhsT[1] + lhsT[11] * rhsT[2] + lhsT[15] * rhsT[3];
      out[4] = lhsT[0] * rhsT[4] + lhsT[4] * rhsT[5] + lhsT[8] * rhsT[6] + lhsT[12] * rhsT[7];
      out[5] = lhsT[1] * rhsT[4] + lhsT[5] * rhsT[5] + lhsT[9] * rhsT[6] + lhsT[13] * rhsT[7];
      out[6] = lhsT[2] * rhsT[4] + lhsT[6] * rhsT[5] + lhsT[10] * rhsT[6] + lhsT[14] * rhsT[7];
      out[7] = lhsT[3] * rhsT[4] + lhsT[7] * rhsT[5] + lhsT[11] * rhsT[6] + lhsT[15] * rhsT[7];
      out[8] = lhsT[0] * rhsT[8] + lhsT[4] * rhsT[9] + lhsT[8] * rhsT[10] + lhsT[12] * rhsT[11];
      out[9] = lhsT[1] * rhsT[8] + lhsT[5] * rhsT[9] + lhsT[9] * rhsT[10] + lhsT[13] * rhsT[11];
      out[10] = lhsT[2] * rhsT[8] + lhsT[6] * rhsT[9] + lhsT[10] * rhsT[10] + lhsT[14] * rhsT[11];
      out[11] = lhsT[3] * rhsT[8] + lhsT[7] * rhsT[9] + lhsT[11] * rhsT[10] + lhsT[15] * rhsT[11];
      out[12] = lhsT[0] * rhsT[12] + lhsT[4] * rhsT[13] + lhsT[8] * rhsT[14] + lhsT[12] * rhsT[15];
      out[13] = lhsT[1] * rhsT[12] + lhsT[5] * rhsT[13] + lhsT[9] * rhsT[14] + lhsT[13] * rhsT[15];
      out[14] = lhsT[2] * rhsT[12] + lhsT[6] * rhsT[13] + lhsT[10] * rhsT[14] + lhsT[14] * rhsT[15];
      out[15] = lhsT[3] * rhsT[12] + lhsT[7] * rhsT[13] + lhsT[11] * rhsT[14] + lhsT[15] * rhsT[15];
      return out;
    },
    scale: (out, input, val) => {
      let [x, y, z] = val;
      out[0] = input[0] * x;
      out[1] = input[1] * x;
      out[2] = input[2] * x;
      out[3] = input[3] * x;
      out[4] = input[4] * y;
      out[5] = input[5] * y;
      out[6] = input[6] * y;
      out[7] = input[7] * y;
      out[8] = input[8] * z;
      out[9] = input[9] * z;
      out[10] = input[10] * z;
      out[11] = input[11] * z;
      out[12] = input[12];
      out[13] = input[13];
      out[14] = input[14];
      out[15] = input[15];
      return out;
    },
    invert: (out, input) => {
      let a00 = input[0], a01 = input[1], a02 = input[2], a03 = input[3];
      let a10 = input[4], a11 = input[5], a12 = input[6], a13 = input[7];
      let a20 = input[8], a21 = input[9], a22 = input[10], a23 = input[11];
      let a30 = input[12], a31 = input[13], a32 = input[14], a33 = input[15];
      let b00 = a00 * a11 - a01 * a10;
      let b01 = a00 * a12 - a02 * a10;
      let b02 = a00 * a13 - a03 * a10;
      let b03 = a01 * a12 - a02 * a11;
      let b04 = a01 * a13 - a03 * a11;
      let b05 = a02 * a13 - a03 * a12;
      let b06 = a20 * a31 - a21 * a30;
      let b07 = a20 * a32 - a22 * a30;
      let b08 = a20 * a33 - a23 * a30;
      let b09 = a21 * a32 - a22 * a31;
      let b10 = a21 * a33 - a23 * a31;
      let b11 = a22 * a33 - a23 * a32;
      let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!det) {
        throw "det failed";
        return input;
      }
      det = 1 / det;
      out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
      out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
      out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
      return out;
    },
    transpose: (out, input) => {
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          out[i + j * 4] = input[j + i * 4];
        }
      }
      return out;
    },
    translate: (out, input, translation) => {
      mat4.multiply(out, out, mat4.fromColumns([
        [1, 0, 0, translation[0]],
        [0, 1, 0, translation[1]],
        [0, 0, 1, translation[2]],
        [0, 0, 0, 1]
      ]));
      return out;
    },
    fromRows: (rows) => {
      return new Float32Array(rows.flat());
    },
    fromColumns: (columns) => {
      let out = new Float32Array(4 * 4);
      for (let i = 0; i < 4; i++) {
        for (let y = 0; y < 4; y++) {
          out[y + i * 4] = columns[y][i];
        }
      }
      return out;
    },
    clone: (m) => {
      return new Float32Array(m.slice(0));
    }
  };

  // index.ts
  var import_webgl_lint_1_10 = __require("https://esm.sh/webgl-lint@1.10.1");
  var Vector3 = class {
    constructor(x, y, z) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.z = z != null ? z : 0;
    }
    get xyz() {
      return [this.x, this.y, this.z];
    }
  };
  var Object3d = class {
    constructor() {
      this.position = new Vector3();
      this.quaternion = quat.create();
      this.scale = new Vector3(1, 1, 1);
    }
    render(gl, locations) {
      throw `No implementation of render for type ${this.constructor.name}`;
    }
  };
  var Camera = class extends Object3d {
    // Magic
  };
  var DirectionalLight = class extends Object3d {
    // Magic
  };
  var _makeShader, makeShader_fn;
  var Shader = class {
    constructor() {
      __privateAdd(this, _makeShader);
      this.locations = { attribute: {}, uniform: {} };
    }
    getVertexShaderSrc() {
      return `
        #version 300 es

        {defines}

        #ifdef USE_LIGHTING
        #ifndef USE_NORMALS
        #define USE_NORMALS
        #endif // USE_NORMALS
        #endif // USE_LIGHTING

        in vec4 aVertexPosition;
        in vec2 aTextureCoord;
        #ifdef USE_NORMALS
        in vec3 aVertexNormal;
        #endif // USE_NORMALS
        #ifdef USE_VERTEX_COLOR
        in vec4 aVertexColor;
        #endif // USE_VERTEX_COLOR
        

        uniform mat4 uProjectionMatrix;
        uniform mat4 uModelViewMatrix;
        // TODO: Rename
        uniform mat4 uNormalMatrix;
        uniform vec3 uCameraPos;
        #ifdef USE_LIGHTING
        uniform vec3 uLightWorldPosition;
        #endif // USE_LIGHTING
        
        out vec4 vPosition;
        out vec3 cameraPos;

        #ifdef USE_TEX
        out highp vec2 vTextureCoord;
        #endif // USE_TEX

        #ifdef USE_NORMALS
        out vec3 vNormal;
        #endif // USE_NORMALS

        #ifdef USE_LIGHTING
        out vec3 vSurfaceToLight;
        out vec3 vLightPosition;
        #endif // USE_LIGHTING


        #ifdef USE_VERTEX_COLOR
        out lowp vec4 vColor;
        #endif // USE_VERTEX_COLOR


        void main() {
            cameraPos = uCameraPos;
            // gl_Position = aVertexPosition;
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vPosition = gl_Position;

            #ifdef USE_LIGHTING
            vLightPosition = uLightWorldPosition;
            vec3 surfaceWorldPosition = (uModelViewMatrix * aVertexPosition).xyz;
            vSurfaceToLight = uLightWorldPosition - surfaceWorldPosition;
            highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
            vNormal = transformedNormal.xyz;
            #endif // USE_LIGHTING
            


            #ifdef USE_VERTEX_COLOR
            vColor = aVertexColor;
            #endif // USE_VERTEX_COLOR
            #ifdef USE_TEX
            vTextureCoord = aTextureCoord;
            #endif // USE_TEX

            // vNormal = uNormalMatrix * aVertexNormal;
        }
    `.trim();
    }
    getFragmentShaderSrc() {
      return `
    #version 300 es
    precision mediump float;
    out vec4 outColor;

    in vec4 vPosition;
    in vec3 vNormal;
    in vec3 vSurfaceToLight;
    in highp vec2 vTextureCoord;

    in vec3 vLightPosition;
    in vec3 cameraPos;
    
    uniform highp sampler2D uSampler;
    void main() {
            
      vec4 vColorUnused = texture(uSampler, vTextureCoord);
      vec4 vColor = vec4(vPosition.xyz, 1);
   
      vec3 normal = normalize(v_normal);
      vec3 cameraDir = normalize(cameraPos - vPosition.xyz);
 
      vec3 surfaceToLightDirection = normalize(v_surfaceToLight);

      vec3 lightDirection = normalize(lightPosition.xyz - vPosition.xyz);
      vec3 reflectionDir = reflect(-lightDirection, v_normal);
     
      vec3 lightColor = vec3(.3, .3, .3);
      float lightIntensity = dot(v_normal, surfaceToLightDirection);
      vec3 diffuse = lightColor * lightIntensity;
      float ambient = 0.2;
      vec3 specular = pow(max(dot(reflectionDir, cameraDir), 0.0), 100.0) * lightColor.rgb;
      
      outColor = vec4(vColor.rgb * (ambient + diffuse + specular), vColor.a);
      // outColor = vec4(vPosition.xyz*.8+vec3(.2, .2, .2), 1);
    }
    `.trim();
    }
    loadShader(type, source) {
      const shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        alert(`Failed to compile shader: ${this.gl.getShaderInfoLog(shader)}`);
        this.gl.deleteShader(shader);
        return null;
      }
      return shader;
    }
    get program() {
      if (this.program === void 0) {
        this.program = __privateMethod(this, _makeShader, makeShader_fn).call(this);
      }
      return this.program;
    }
    bindLocations() {
    }
    render(locations, shape) {
      throw `No implementation of render for type ${this.constructor.name}`;
    }
  };
  _makeShader = new WeakSet();
  makeShader_fn = function() {
    const vsSrc = this.getVertexShaderSrc();
    const fsSrc = this.getFragmentShaderSrc();
    vsSrc.replace("{defines}", `
        #define USE_NORMALS
        #define USE_LIGHTING
        `);
    const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSrc);
    const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSrc);
    const shaderProgram = this.gl.createProgram();
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);
    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
      alert(`Failed to init shader program ${this.gl.getProgramInfoLog(shaderProgram)}`);
      return null;
    }
    this._program = shaderProgram;
  };
  var Material = class extends Shader {
  };
  var TextureMaterial = class extends Material {
    constructor(gl) {
      super();
      {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 2;
        const height = 2;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixels = new Uint8Array([0, 0, 255, 255, 255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        let image = new Image();
        image.src = "./khronos_webgl.png";
        image.addEventListener("load", () => {
          gl.bindTexture(gl.TEXTURE_2D, this.texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.generateMipmap(gl.TEXTURE_2D);
        });
        gl.texImage2D(
          gl.TEXTURE_2D,
          level,
          internalFormat,
          width,
          height,
          border,
          srcFormat,
          srcType,
          pixels
        );
        const textureCoords = [
          1,
          1,
          0,
          1,
          0,
          0,
          1,
          0
          // Front
          // 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Back
          // 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Top
          // 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Bottom
          // 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Right
          // 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Left
          // 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        ];
        this.textureCoords = newGLBuffer(gl, new Float32Array(textureCoords));
        gl.generateMipmap(gl.TEXTURE_2D);
      }
    }
    render(locations, shape) {
      let gl = this.gl;
      shape.setPositionAttribute(gl, locations.attribute);
      shape.setNormalAttribute(gl, locations.attribute);
      this.setTextureAttribute(gl, locations.attribute);
      gl.bindBuffer(gl.ARRAY_BUFFER, shape.normalBuffer);
      if (shape.indexBuffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, shape.positionBuffer);
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(locations.uniform.uSampler, 0);
      if (shape.indexBuffer) {
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLE_STRIP, shape.vertexCount, type, offset);
      } else {
        gl.drawArrays(shape.drawMode, 0, shape.vertexCount);
      }
    }
    setTextureAttribute(gl, locations) {
      const componentWidth = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoords);
      gl.vertexAttribPointer(
        locations.textureCoord,
        componentWidth,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(locations.textureCoord);
    }
  };
  var Shape = class {
    constructor() {
      this.vertexCount = 0;
      this.drawMode = WebGLRenderingContext.TRIANGLES;
    }
    /**
     * @param {MyWebGLContext} gl
     * @param {AttributeLocations} locations
     */
    setPositionAttribute(gl, locations) {
      const componentWidth = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.vertexAttribPointer(
        locations.vertexPosition,
        componentWidth,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(locations.vertexPosition);
    }
    /**
     * @param {MyWebGLContext} gl
     * @param {AttributeLocations} locations
     */
    setNormalAttribute(gl, locations) {
      const componentWidth = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.vertexAttribPointer(
        locations.vertexNormal,
        componentWidth,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(locations.vertexNormal);
    }
  };
  var Plane = class extends Shape {
    /** @type {WebGLBuffer} */
    /**
     * @param {MyWebGLContext} gl
     * @param width {number}
     * @param height {number}
     * @param color {Vector3}
     */
    constructor(gl, width, height, color) {
      super();
      this.vertexCount = 6;
      this.positionBuffer = newGLBuffer(gl, new Float32Array([
        // Front face
        // width / 2, height / 2, -1.0, -1.0 * width / 2, height / 2, -1.0, -1.0 * width / 2, -1.0 * height / 2, -1.0, width / 2, -1.0 * height / 2, -1.0
        width / 2,
        height / 2,
        -0,
        -1 * width / 2,
        height / 2,
        -0,
        -1 * width / 2,
        -1 * height / 2,
        -0,
        width / 2,
        -1 * height / 2,
        -0
        // ...data["position"]
      ]));
      this.normalBuffer = newGLBuffer(gl, new Float32Array([
        // Front
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1
      ]));
      this.indexBuffer = newGLBuffer(gl, new Uint16Array([
        0,
        1,
        2,
        3,
        0,
        2
        // front
      ]), gl.ELEMENT_ARRAY_BUFFER);
      let colors = [];
      for (let i = 0; i < this.vertexCount; i++) {
        colors = colors.concat(...color.xyz, 1);
      }
      this.colorBuffer = newGLBuffer(gl, new Float32Array(colors));
    }
  };
  var Mesh = class extends Object3d {
    constructor(shape, material) {
      super();
      this.shape = shape;
      this.material = material;
    }
    render(gl, locations) {
      this.material.render(gl, locations, this.shape);
    }
  };
  var Scene = class {
    constructor() {
      this.objects = [];
    }
    add(obj) {
      this.objects.push(obj);
    }
    /**
     * @param {DirectionalLight} light
     */
    setLight(light) {
      this.light = light;
    }
  };
  var _createVertexShaderSource, createVertexShaderSource_fn, _createFragmentShaderSource, createFragmentShaderSource_fn, _compileShaderProgram, compileShaderProgram_fn, _loadShader, loadShader_fn, _getLocations, getLocations_fn;
  var Renderer = class {
    constructor(scene, ctx) {
      __privateAdd(this, _createVertexShaderSource);
      __privateAdd(this, _createFragmentShaderSource);
      __privateAdd(this, _compileShaderProgram);
      __privateAdd(this, _loadShader);
      /**
       *
       * @returns {Locations}
       */
      __privateAdd(this, _getLocations);
      this.scene = scene;
      this.gl = ctx;
      let vsShader = __privateMethod(this, _createVertexShaderSource, createVertexShaderSource_fn).call(this, this.scene);
      let fsShader = __privateMethod(this, _createFragmentShaderSource, createFragmentShaderSource_fn).call(this, this.scene);
      this.program = __privateMethod(this, _compileShaderProgram, compileShaderProgram_fn).call(this, vsShader, fsShader);
      this.locations = __privateMethod(this, _getLocations, getLocations_fn).call(this);
    }
    /**
     * @param {Camera} camera
     */
    render(camera) {
      if (!camera)
        throw "No camera passed to render function";
      let gl = this.gl;
      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const fieldOfView = 45 * Math.PI / 180;
      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      const zNear = 0.1;
      const zFar = 100;
      const projectionMatrix = mat4.create();
      mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
      const modelViewMatrix = mat4.create();
      window["mat4"] = mat4;
      mat4.translate(modelViewMatrix, modelViewMatrix, camera.position.xyz);
      gl.useProgram(this.program);
      for (let obj of this.scene.objects) {
        let newModelViewMatrix = mat4.clone(modelViewMatrix);
        let rotationMatrix = mat4.create();
        mat4.fromRotationTranslation(rotationMatrix, obj.quaternion, vec3.fromValues(...obj.position.xyz));
        mat4.multiply(newModelViewMatrix, newModelViewMatrix, rotationMatrix);
        mat4.scale(newModelViewMatrix, newModelViewMatrix, vec3.fromValues(obj.scale.x, obj.scale.y, obj.scale.z));
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, newModelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        gl.uniformMatrix4fv(
          this.locations.uniform.projectionMatrix,
          false,
          projectionMatrix
        );
        gl.uniformMatrix4fv(
          this.locations.uniform.modelViewMatrix,
          false,
          newModelViewMatrix
        );
        gl.uniformMatrix4fv(
          this.locations.uniform.normalMatrix,
          false,
          normalMatrix
        );
        gl.uniform3f(
          this.locations.uniform.lightPosition[0],
          ...this.scene.light.position.xyz
        );
        gl.uniform3f(
          this.locations.uniform.cameraPos,
          ...camera.position.xyz
        );
        obj.render(gl, this.locations);
      }
    }
  };
  _createVertexShaderSource = new WeakSet();
  createVertexShaderSource_fn = function(_scene) {
    return `
        #version 300 es
        in vec4 aVertexPosition;
        in vec2 aTextureCoord;
        in vec3 aVertexNormal;
        // in vec4 aVertexColor;
        
        out highp vec2 vTextureCoord;

        out vec4 vPosition;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uNormalMatrix;
        uniform vec3 uLightWorldPosition;
        uniform vec3 uCameraPos;

        out vec3 v_normal;
        out vec3 v_surfaceToLight;

        out vec3 cameraPos;
        out vec3 lightPosition;

//        out lowp vec4 vColor;



        void main() {
          cameraPos = uCameraPos;
            // gl_Position = aVertexPosition;
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vPosition = gl_Position;

            lightPosition = uLightWorldPosition;
            vec3 surfaceWorldPosition = (uModelViewMatrix * aVertexPosition).xyz;
            v_surfaceToLight = uLightWorldPosition - surfaceWorldPosition;
            highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

//            vColor = aVertexColor;
            vTextureCoord = aTextureCoord;

            v_normal = transformedNormal.xyz;
            // v_normal = uNormalMatrix * aVertexNormal;
        }
    `.trim();
  };
  _createFragmentShaderSource = new WeakSet();
  createFragmentShaderSource_fn = function(_scene) {
    return `
    #version 300 es
    precision mediump float;
    in vec4 vPosition;
    out vec4 outColor;
    in vec3 v_normal;
    in vec3 v_surfaceToLight;
    in highp vec2 vTextureCoord;

    in vec3 lightPosition;
    in vec3 cameraPos;
    
    uniform highp sampler2D uSampler;
    void main() {
            
      vec4 vColorUnused = texture(uSampler, vTextureCoord);
      vec4 vColor = vec4(vPosition.xyz, 1);
   
      vec3 normal = normalize(v_normal);
      vec3 cameraDir = normalize(cameraPos - vPosition.xyz);
 
      vec3 surfaceToLightDirection = normalize(v_surfaceToLight);

      vec3 lightDirection = normalize(lightPosition.xyz - vPosition.xyz);
      vec3 reflectionDir = reflect(-lightDirection, v_normal);
     
      vec3 lightColor = vec3(.3, .3, .3);
      float lightIntensity = dot(v_normal, surfaceToLightDirection);
      vec3 diffuse = lightColor * lightIntensity;
      float ambient = 0.2;
      vec3 specular = pow(max(dot(reflectionDir, cameraDir), 0.0), 100.0) * lightColor.rgb;
      
      outColor = vec4(vColor.rgb * (ambient + diffuse + specular), vColor.a);
      // outColor = vec4(vPosition.xyz*.8+vec3(.2, .2, .2), 1);
    }
    `.trim();
  };
  _compileShaderProgram = new WeakSet();
  compileShaderProgram_fn = function(vsSource, fsSource) {
    const vertexShader = __privateMethod(this, _loadShader, loadShader_fn).call(this, this.gl, this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = __privateMethod(this, _loadShader, loadShader_fn).call(this, this.gl, this.gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = this.gl.createProgram();
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);
    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
      alert(`Failed to init shader program ${this.gl.getProgramInfoLog(shaderProgram)}`);
      return null;
    }
    return shaderProgram;
  };
  _loadShader = new WeakSet();
  loadShader_fn = function(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(`Failed to compile shader ${gl.getShaderInfoLog(shader)}`);
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };
  _getLocations = new WeakSet();
  getLocations_fn = function() {
    let attribute = {
      vertexPosition: this.gl.getAttribLocation(this.program, "aVertexPosition"),
      vertexNormal: this.gl.getAttribLocation(this.program, "aVertexNormal"),
      textureCoord: this.gl.getAttribLocation(this.program, "aTextureCoord")
      // vertexColor: this.gl.getAttribLocation(this.program, "aVertexColor")
    };
    let uniform = {
      projectionMatrix: this.gl.getUniformLocation(this.program, "uProjectionMatrix"),
      modelViewMatrix: this.gl.getUniformLocation(this.program, "uModelViewMatrix"),
      uSampler: this.gl.getUniformLocation(this.program, "uSampler"),
      normalMatrix: this.gl.getUniformLocation(this.program, "uNormalMatrix"),
      cameraPos: this.gl.getUniformLocation(this.program, "uCameraPos"),
      lightPosition: [
        this.gl.getUniformLocation(this.program, "uLightWorldPosition")
      ]
      // lightDirection: [
      //   this.gl.getUniformLocation(this.program, "uLight1Direction"),
      //   ],
    };
    return {
      uniform,
      attribute
    };
  };
  function go() {
    let canvas = $("canvas");
    let ctx = canvas.getContext("webgl2");
    let scene = new Scene();
    let camera = new Camera();
    camera.position = new Vector3(0, 0, -3.6);
    let directionalLight = new DirectionalLight();
    directionalLight.position = new Vector3(1, 1, 1);
    scene.setLight(directionalLight);
    let plane = new Plane(ctx, 1, 1, new Vector3(1, 0, 0));
    let plane2 = new Plane(ctx, 2, 1, new Vector3(0, 1, 1));
    let texture = new TextureMaterial(ctx);
    let mesh1 = new Mesh(plane, texture);
    let mesh2 = new Mesh(plane2, texture);
    let plane3 = new Plane(ctx, 1, 1, new Vector3(1, 0, 0));
    let plane4 = new Plane(ctx, 2, 1, new Vector3(0, 1, 1));
    let mesh4 = new Mesh(plane4, texture);
    let renderer = new Renderer(scene, ctx);
    renderer.render(camera);
    window["r"] = renderer;
    window["c"] = camera;
    window["s"] = scene;
    let then = 0;
    let rot = 0;
    quat.rotateX(mesh1.quaternion, mesh1.quaternion, Math.PI / 4);
    mesh1.position.y += 1;
    quat.rotateY(mesh2.quaternion, mesh2.quaternion, Math.PI / 4);
    mesh4.position.x = 0;
    mesh4.position.y = 0;
    mesh4.position.z = 6;
    window.camera = camera;
    let inputs = {};
    function render(now) {
      now *= 1e-3;
      let deltaTime = now - then;
      then = now;
      rot += deltaTime;
      if (inputs["w"]) {
        camera.position.z += 0.01;
      }
      if (inputs["s"]) {
        camera.position.z -= 0.01;
      }
      if (inputs["a"]) {
        camera.position.x += 0.01;
      }
      if (inputs["d"]) {
        camera.position.x -= 0.01;
      }
      if (inputs["z"]) {
        camera.position.y += 0.01;
      }
      if (inputs["c"]) {
        camera.position.y -= 0.01;
      }
      if (inputs["r"]) {
        quat.rotateX(camera.quaternion, camera.quaternion, 0.1);
      }
      if (inputs["f"]) {
        quat.rotateX(camera.quaternion, camera.quaternion, -0.1);
      }
      if (inputs["q"]) {
        quat.rotateY(camera.quaternion, camera.quaternion, 0.1);
      }
      if (inputs["e"]) {
        quat.rotateY(camera.quaternion, camera.quaternion, -0.1);
      }
      renderer.render(camera);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    if (window.location.search.endsWith("?debug")) {
      var SPECTOR = new spector.Spector();
      SPECTOR.displayUI();
    }
    document.addEventListener("keydown", (ev) => {
      inputs[ev.key] = true;
    });
    document.addEventListener("keyup", (ev) => {
      inputs[ev.key] = false;
    });
    let selectNode;
    $("#ui-root").appendChild(h("div.ui", [
      h("label{Draw Mode}", { for: "drawMode" }),
      h("br"),
      selectNode = h("select#drawMode", {
        id: "drawMode",
        onclick: (e) => {
          pileOfPoints.shape.drawKind = selectNode.selectedIndex;
        }
      }, [
        h("option{Triangles}", { value: "triangles" }),
        h("option{Triangle Strip}", { value: "strip" }),
        h("option{Triangle Fan}", { value: "fan" })
      ])
    ]));
  }
  go();
})();
