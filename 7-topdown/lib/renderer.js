import {mat4, quat, vec4, vec3} from "./glutils.js";

// import { mat4, vec3, vec4, quat } from "https://esm.sh/gl-matrix?dev";
import {_, Enum} from "./libjackson.js";

const GL = WebGL2RenderingContext;

const DEFAULT = {
  LIGHT_COLOR: [3, 3, 3],
  LIGHT_DIRECTION: [-0.1, -1, -0.2]
};

export class RenderAttributeEnum extends Enum {
  static POSITION = new RenderAttributeEnum(1)
  static NORMAL = new RenderAttributeEnum(2)
  static TANGENT = new RenderAttributeEnum(3)
  static TEXCOORD_0 = new RenderAttributeEnum(4)
  static COLOR_0 = new RenderAttributeEnum(5)

  static {
    this.make()
  }
}

export class RenderEnvironment {
  globalLightColor = vec3.fromValues(...DEFAULT.LIGHT_COLOR)
  globalLightDirection = vec3.fromValues(...DEFAULT.LIGHT_DIRECTION)
}

export class RenderBuffer {
  /** @type {GLenum} */
  target
  /** @type {GLenum} */
  usage
  /** @type {WebGLBuffer} */
  buffer
  length = 0

  /**
   * @param {number} target
   * @param {number} usage
   * @param {WebGLBuffer} buffer
   * @param {number} [length]
   */
  constructor(target, usage, buffer, length = 0) {
    this.target = target
    this.usage = usage
    this.length = length
    this.buffer = buffer
  }
}

export class PrimitiveAttribute {
  /** @type {string} */
  name;
  /** @type {RenderBuffer} */
  buffer;
  /** @type {number} */
  componentCount;
  /** @type {GLenum} */
  componentType;
  /** @type {number} */
  stride;
  /** @type {number} */
  byteOffset;
  normalized = false;

  /**
   * @param name {string}
   * @param buffer {RenderBuffer}
   * @param componentCount {number}
   * @param componentType {GLenum}
   * @param stride {number}
   * @param byteOffset {number}
   */
  constructor(name, buffer, componentCount, componentType, stride, byteOffset) {
    this.name = name;
    this.buffer = buffer;
    this.componentCount = componentCount;
    this.componentType = componentType;
    this.stride = stride;
    this.byteOffset = byteOffset;
  }
}

export class Primitive {
  indexBuffer = null;
  indexByteOffset = 0
  indexType = 0

  /**
   *
   * @param attrs {PrimitiveAttribute[]}
   * @param elementCount {number}
   * @param [drawMode] {GLenum}
   */
  constructor(attrs, elementCount, drawMode = GL.TRIANGLES) {
    this.attrs = attrs ?? []
    this.elementCount = elementCount
    this.drawMode = drawMode ?? GL.TRIANGLES
  }

  /**
   * @param {RenderBuffer} indexBuffer
   * @param {number} [byteOffset]
   * @param {number} [indexType]
   */
  setIndexBuffer(indexBuffer, byteOffset, indexType) {
    this.indexBuffer = indexBuffer;
    this.indexByteOffset = byteOffset ?? 0
    this.indexType = indexType ?? GL.UNSIGNED_SHORT
  }
}

export class MaterialUniform {
  /**
   * @param name {string}
   * @param value {ArrayBuffer|number}
   * @param [length] {number}
   */
  constructor(name, value, length) {
    this.name = name
    this.value = value
    this.length = length
    if (!this.length) {
      if (value instanceof Array) {
        this.length = value.length
      } else {
        this.length = 1
      }
    }
  }

}

class Texture {
  constructor() {
    this.sampler = new TextureSampler()
  }

  get format() {
    return GL.RGBA
  }

  get width() {
    return 0
  }

  get height() {
    return 0
  }

  get key() {
    return null
  }

}

class TextureSampler {
  minFilter = null
  magFilter = null
  wrapS = null
  wrapT = null
}

class MaterialSampler {
  /** @type {string} */
  uniformName;
  /** @type {Texture} */
  texture = null;

  constructor(uniformName) {
    this.uniformName = uniformName
  }
}

export class Material {
  /** @type {MaterialUniform[]} */
  uniforms = [];
  /** @type {MaterialSampler[]} */
  samplers = [];

  constructor() {
  }

  /**
   * @param name {string}
   * @param value {ArrayBuffer|number}
   * @param length {number}
   * @return {MaterialUniform}
   */
  addUniform(name, value, length) {
    let uniform = new MaterialUniform(name, value, length)
    this.uniforms.push(uniform)
    return uniform
  }

  /**
   * @return {null|string}
   */
  get materialName() {
    return null
  }

  /**
   * @return {string|null}
   */
  get vertexSource() {
    return null
  }

  /**
   * @return {string|null}
   */
  get fragmentSource() {
    return null
  }

  getProgramDefines(renderPrimitive) {
    return {}
  }

  defineUniform(uniformName, defaultValue = null, length = 0) {
    let uniform = new MaterialUniform(uniformName, defaultValue, length)
    this.uniforms.push(uniform)
    return uniform
  }

  defineSampler(uniformName) {
    let sampler = new MaterialSampler(uniformName)
    this.samplers.push(sampler)
    return sampler

  }
}

class RenderMaterial {
  /** @type {Program} */
  program;
  // TODO: Samplers
  /**
   * @type {[RenderMaterialUniform]}
   */
  uniforms = [];
  firstBind = true;

  /**
   * @param {Renderer} renderer
   * @param {Material} material
   * @param {Program} program
   */
  constructor(renderer, material, program) {
    this.program = program

    this.samplers = []
    for (let samplerIdx of _.range(material.samplers.length)) {
      let renderSampler = new RenderMaterialSampler(renderer, material.samplers[samplerIdx], samplerIdx)
      this.samplers.push(renderSampler)
    }

    for (let uniform of material.uniforms) {
      let renderUniform = new RenderMaterialUniform(uniform)
      this.uniforms.push(renderUniform)
    }
  }

  /**
   * @param {WebGL2RenderingContext} gl
   */
  bind(gl) {
    if (this.firstBind) {
      // TODO: Samplers
      for (let i = 0; i < this.samplers.length;) {
        let sampler = this.samplers[i]
        if (!this.program.uniforms[sampler.uniformName]) {
          this.samplers.splice(i, 1)
          continue
        }
        i++
      }

      for (let i = 0; i < this.uniforms.length;) {
        let uniform = this.uniforms[i]
        uniform.uniform = this.program.uniforms[uniform.uniformName]
        if (!uniform.uniform) {
          this.uniforms.splice(i, 1)
          continue
        }
        i++
      }

      this.firstBind = false
    }

    for (let sampler of this.samplers) {
      gl.activeTexture(gl.TEXTURE0 + sampler.index);
      if (sampler.renderTexture && sampler.renderTexture.complete) {
        gl.bindTexture(gl.TEXTURE_2D, sampler.renderTexture.texture);
      } else {
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
    }

    for (let uniform of this.uniforms) {
      switch (uniform.length) {
        case 1:
          gl.uniform1fv(uniform.uniform, uniform.value);
          break;
        case 2:
          gl.uniform2fv(uniform.uniform, uniform.value);
          break;
        case 3:
          gl.uniform3fv(uniform.uniform, uniform.value);
          break;
        case 4:
          gl.uniform4fv(uniform.uniform, uniform.value);
          break;
      }
    }
  }
}

class RenderMaterialSampler {
  /**
   * @param {Renderer} renderer
   * @param {MaterialSampler} materialSampler
   * @param {number} index
   */
  constructor(renderer, materialSampler, index) {
    this.renderer = renderer
    this.uniformName = materialSampler.uniformName
    this.renderTexture = renderer.getRenderTexture(materialSampler.texture)
    this.index = index
  }

  set texture(value) {
    this.renderTexture = this.renderer.getRenderTexture(value)
  }
}


class RenderMaterialUniform {
  /** @type {string} */
  uniformName;
  /** @type {number} */
  length;
  /** @type {MaterialUniform} */
  uniform;

  #value;

  /**
   * @param {MaterialUniform} materialUniform
   */
  constructor(materialUniform) {
    this.uniformName = materialUniform.name
    this.length = materialUniform.length
    if (materialUniform.value instanceof Array) {
      this.#value = new Float32Array(materialUniform.value)
    } else {
      this.#value = new Float32Array([materialUniform.value])
    }
  }

  set value(value) {
    if (this.#value.length === 1) {
      this.#value[0] = value
    } else {
      for (let i = 0; i < this.#value.length; i++) {
        this.#value[i] = value[i]
      }
    }
  }

  get value() {
    return this.#value
  }
}

class Program {
  gl
  program
  attrs = {}
  uniforms = {}
  defines = {}

  firstUse = true
  oneshotCallbacks = []

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {string|null} vs
   * @param {string|null} fs
   * @param {Enum} attrEnum
   * @param {{[key: string]: any}} defines
   */
  constructor(gl, vs, fs, attrEnum, defines) {
    this.gl = gl
    this.program = gl.createProgram()

    // TODO: Defines

    function createShader(program, source, type) {
      let shader = gl.createShader(type)
      gl.attachShader(program, shader)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`Failed to compile shader ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
      }
      return shader
    }

    function insertDefines(program, defines) {
      let joinedDefines = Object.entries(defines).map(([k, v]) => {
        return `#define ${k} ${v}`
      }).join("\n")

      if (program.startsWith("#version")) {
        let lines = program.split("\n")
        lines.splice(1, 0, joinedDefines)
        return lines.join("\n")
      }

      return joinedDefines + program

    }

    this.vertShader = createShader(this.program, insertDefines(vs, defines), GL.VERTEX_SHADER)
    this.fragShader = createShader(this.program, insertDefines(fs, defines), GL.FRAGMENT_SHADER)

    if (attrEnum) {
      for (let variant of attrEnum) {
        gl.bindAttribLocation(this.program, variant.value, variant.name)
        this.attrs[variant] = variant.value
      }
    }

    gl.linkProgram(this.program)

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      alert(`Failed to init shader program ${this.gl.getProgramInfoLog(this.program)}`);
      gl.deleteProgram(this.program)
      this.program = null
    }
  }

  onNextUse(cb) {
    this.oneshotCallbacks.push(cb)
  }

  use() {
    let gl = this.gl

    if (this.firstUse) {
      this.firstUse = false

      let uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
      let uniformName = '';
      for (let i = 0; i < uniformCount; i++) {
        let uniformInfo = gl.getActiveUniform(this.program, i);
        uniformName = uniformInfo.name.replace('[0]', '');
        this.uniforms[uniformName] = gl.getUniformLocation(this.program, uniformName);
      }

      // Linked, we don't need them anymore
      gl.deleteShader(this.vertShader)
      gl.deleteShader(this.fragShader)
    }

    gl.useProgram(this.program)

    if (this.oneshotCallbacks.length) {
      this.oneshotCallbacks.forEach(cb => cb(this))
      this.oneshotCallbacks = []
    }

  }
}

export class Renderer {
  currentFrameIdx = 0;
  /** @type {WebGL2RenderingContext} */
  gl;

  /** @type {RenderPrimitive[]} */
  renderPrimitives = []
  /** @type {{[key: string]: Program}} */
  programCache = {}

  /**
   * @param gl {GL}
   */
  constructor(gl) {
    this.gl = gl
    console.assert(!!gl)
  }

  /**
   * @param {GLenum} target
   * @param {Float32Array|Uint16Array|DataView} data
   * @param {GLenum} [usage]
   */
  createRenderBuffer(target, data, usage = GL.STATIC_DRAW) {
    let gl = this.gl
    let glBuffer = gl.createBuffer()

    gl.bindBuffer(target, glBuffer)
    gl.bufferData(target, data, usage)
    return new RenderBuffer(target, usage, glBuffer, data.byteLength)
  }

  /**
   * @param {Primitive} primitive
   * @param {Material} material
   */
  createRenderPrimitive(primitive, material) {
    let renderPrimitive = new RenderPrimitive(primitive)

    let program = this.getMaterialProgram(material, renderPrimitive)
    let renderMaterial = new RenderMaterial(this, material, program)
    renderPrimitive.setRenderMaterial(renderMaterial)

    this.renderPrimitives.push(renderPrimitive)
    return renderPrimitive
  }

  /**
   * @param {Material} material
   * @param {RenderPrimitive} renderPrimitive
   */
  getMaterialProgram(material, renderPrimitive) {
    let vs = material.vertexSource
    let fs = material.fragmentSource

    console.assert(material.materialName)
    console.assert(vs)
    console.assert(fs)

    let defines = material.getProgramDefines(renderPrimitive)
    let key = this._getProgramKey(material.materialName, defines)

    if (key in this.programCache) {
      return this.programCache[key]
    } else {
      vs += `
      uniform mat4 PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX;
      
      void main() {
        gl_Position = vertex_main(PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX);
      }
      `

      fs += `
      // out vec4 vsShaderColorOut;
      void main() {
        // vsShaderColorOut = fragment_main();
        gl_FragColor = fragment_main();
      }
      `

      let program = new Program(this.gl, vs, fs, RenderAttributeEnum, defines)
      this.programCache[key] = program

      program.onNextUse((program) => {
        // TODO: setup samplers
        // for (let i = 0; i<material.)
      })
      return program
    }
  }

  /**
   * @param {string|null} name
   * @param {{[key:string]: any}} defines
   */
  _getProgramKey(name, defines) {
    let definesJoined = Object.entries(defines).map(([k, v]) => `${k}=${v}`).join(",")
    return `${name}:${definesJoined}`
  }

  drawView(view, rootNode) {
    let gl = this.gl

    // TODO: Camera position

    this.drawRenderPrimitives(view, this.renderPrimitives)
  }

  /**
   * @param {View} view
   * @param {RenderPrimitive[]} renderPrimitives
   */
  drawRenderPrimitives(view, renderPrimitives) {
    let gl = this.gl
    let program = null
    let material = null

    for (let primitive of renderPrimitives) {
      if (program !== primitive.material.program) {
        program = primitive.material.program
        program.use()

        gl.uniformMatrix4fv(program.uniforms.PROJECTION_MATRIX, false, view.projectionMatrix)
        gl.uniformMatrix4fv(program.uniforms.VIEW_MATRIX, false, view.viewMatrix)
        // TODO: Camera position
      }
      if (material !== primitive.material) {
        primitive.material.bind(gl, program, material)
        material = primitive.material
      }

      this.bindPrimitive(primitive)

      for (let instance of primitive.instances) {
        gl.uniformMatrix4fv(program.uniforms.MODEL_MATRIX, false, instance.worldMatrix)

        if (primitive.indexBuffer) {
          gl.drawElements(primitive.drawMode, primitive.elementCount, primitive.indexType, primitive.indexByteOffset)
        } else {
          gl.drawArrays(primitive.drawMode, 0, primitive.elementCount)
        }
      }
    }
  }


  /**
   * @param {RenderPrimitive} primitive
   */
  bindPrimitive(primitive) {
    let gl = this.gl

    // for (let attr of RenderAttributeEnum) {
    // gl.disableVertexAttribArray(attr.value)
    // }


    for (let attrBuffer of primitive.attributeBuffers) {
      gl.bindBuffer(gl.ARRAY_BUFFER, attrBuffer.buffer.buffer)
      for (let attr of attrBuffer.attrs) {
        gl.vertexAttribPointer(
            attr.attrib_index.value, attr.componentCount, attr.componentType,
            attr.normalized, attr.stride, attr.byteOffset
        )
        gl.enableVertexAttribArray(attr.attrib_index.value)
      }
    }

    if (primitive.indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive.indexBuffer.buffer)
    } else {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    }
  }

  /**
   *
   * @param {ImageTexture} texture
   * @returns {RenderTexture}
   */
  getRenderTexture(texture) {
    if (!texture) return null
    let gl = this.gl
    console.log("processing texture with key " + texture.key)

    // do
    let handle = gl.createTexture()

    let renderTexture = new RenderTexture(handle)

    texture.finish().then(() => {
      gl.bindTexture(gl.TEXTURE_2D, handle)
      gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.format, gl.UNSIGNED_BYTE, texture.imgBmp)
      renderTexture.complete = true
      if (Renderer.isPowerOf2(texture.width) && Renderer.isPowerOf2(texture.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texture.sampler.wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texture.sampler.wrapT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.sampler.minFilter ?? gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.sampler.magFilter ?? gl.LINEAR);
      }
    })


    // throw 'get render texture'
    console.log(texture)
    return renderTexture
  }

  static isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }
}


class RenderTexture {
  constructor(texture) {
    this.texture = texture
    this.complete = false
  }
}

class View {
  projectionMatrix
  viewMatrix

  constructor(projectionMatrix, viewTransform) {
    this.projectionMatrix = projectionMatrix
    this.viewMatrix = mat4.create()
    mat4.invert(this.viewMatrix, viewTransform)
  }
}

export class Node {
  /** @type {Node[]} */
  children = [];
  /** @type {Component[]} */
  components = []
  /** @type {Node} */
  parent = null;
  visible = true;
  #translation;
  #rotation;
  #scale;
  /** @type {Renderer} */
  _renderer = null;
  renderPrimitives = [];
  /** @type {Scene} */
  scene = null;

  constructor() {
    this.translation = vec3.create()
    this.rotation = quat.create()
    this.scale = vec3.fromValues(1, 1, 1)
    this.components.get = (name) => {
      for (let [k, v] of Object.entries(this.components)) {
        if (v.name === name) {
          return v
        }
      }
    }
    this.components.find = (type) => {
      for (let [k, v] of Object.entries(this.components)) {
        if (v instanceof type) {
          return v
        }
      }
    }
  }

  /**
   *
   * @param renderer {Renderer}
   */
  setRenderer(renderer) {
    this._renderer = renderer

    this.onRendererChange(renderer)

    for (let child of this.children) {
      child.setRenderer(renderer)
    }
  }

  /**
   * @param renderer {Renderer}
   */
  onRendererChange(renderer) {
    // Abstract
  }

  /**
   * @param node {Node}
   */
  addNode(node) {
    if (node.parent) {
      node.parent.removeNode(node)
    }
    node.parent = this

    this.children.push(node)

    if (this._renderer) {
      node.setRenderer(this._renderer)
    }
  }

  /**
   * @param node {Node}
   */
  removeNode(node) {
    _.remove(this.children, node)
    node.parent = null
  }

  /**
   * @param {RenderPrimitive} primitive
   */
  addRenderPrimitive(primitive) {
    this.renderPrimitives.push(primitive)
    primitive.instances.push(this)
  }

  get worldMatrix() {
    let m = mat4.create()

    mat4.fromRotationTranslationScale(
        m, this.rotation, this.translation, this.scale
    )
    if (this.parent) {
      mat4.multiply(m, this.parent.worldMatrix, m)
    } else {

    }
    return m
  }

  get worldTranslation() {
    let out = vec3.create()
    mat4.getTranslation(out, this.worldMatrix)
    return out
  }

  /**
   * @param {Component} component
   * @param {string} [name]
   */
  addComponent(component, name) {
    component.attach(this)
    component.name = name
    this.components.push(component)
  }

  _update(timestamp, frameDelta) {
    this.onUpdate(timestamp, frameDelta)
    this.components.forEach(c => c.onUpdate(timestamp, frameDelta))

    this.children.forEach(child => child._update(timestamp, frameDelta))
  }


  onUpdate(timestamp, frameDelta) {
    // abstract
  }

  get worldX() {
    return this.worldTranslation[0]
  }

  get worldY() {
    return this.worldTranslation[1]
  }

  get worldZ() {
    return this.worldTranslation[2]
  }
}

export class RenderPrimitiveAttribute {
  /**
   * @param attr {PrimitiveAttribute}
   */
  constructor(attr) {
    this.attrib_index = RenderAttributeEnum.named(attr.name)
    this.componentCount = attr.componentCount
    this.componentType = attr.componentType
    this.stride = attr.stride
    this.byteOffset = attr.byteOffset
    this.normalized = attr.normalized
  }
}

export class RenderPrimitiveAttributeBuffer {
  /** @type {RenderBuffer} */
  buffer;
  /** @type {RenderPrimitiveAttribute[]} */
  attrs = [];

  /**
   * @param {RenderBuffer} buffer
   */
  constructor(buffer) {
    this.buffer = buffer
  }
}

export class RenderPrimitive {
  /** @type {RenderMaterial} */
  material;
  /** @type {number} */
  drawMode;
  /** @type {number} */
  elementCount
  // /** @type {Promise|null} */
  // _promise
  // /** @type {boolean} */
  // _complete = true
  /** @type {RenderPrimitiveAttributeBuffer[]} */
  attributeBuffers = []
  indexBuffer = null;
  indexByteOffset = 0;
  indexType = 0;

  /**
   * @type {Node[]}
   */
  instances = []


  /**
   * @param primitive {Primitive}
   */
  constructor(primitive) {
    this.material = null

    this.setPrimitive(primitive)
  }

  /**
   * @param primitive {Primitive}
   */
  setPrimitive(primitive) {
    this.drawMode = primitive.drawMode
    this.elementCount = primitive.elementCount
    // this._promise = null
    // this._complete = false
    this.attributeBuffers = []

    attrLoop:
        for (let attr of primitive.attrs) {
          let renderAttr = new RenderPrimitiveAttribute(attr)
          //findBufferLoop:
          for (let buffer of this.attributeBuffers) {
            if (buffer.buffer === attr.buffer) {
              buffer.attrs.push(renderAttr)
              continue attrLoop
            }
          }

          // if we didn't find and existing buffer used by multiple attrs
          let attrBuffer = new RenderPrimitiveAttributeBuffer(attr.buffer)
          attrBuffer.attrs.push(renderAttr)
          this.attributeBuffers.push(attrBuffer)
        }

    if (primitive.indexBuffer) {
      this.indexBuffer = primitive.indexBuffer
      this.indexType = primitive.indexType
      this.indexByteOffset = primitive.indexByteOffset
    }
  }

  /**
   * @param {RenderMaterial} material
   */
  setRenderMaterial(material) {
    this.material = material
  }
}

export class Scene extends Node {
  /** @type {DOMHighResTimeStamp} */
  timestamp = null

  constructor() {
    super();
  }

  /**
   * @param {mat4} projectionMatrix
   * @param {mat4} viewTransform
   */
  draw(projectionMatrix, viewTransform) {
    this._renderer.drawView(new View(projectionMatrix, viewTransform), this)
  }

  frame(frameCtx) {
    let prevTimestamp = this.timestamp
    this.timestamp = performance.now()

    let frameDelta = prevTimestamp ? this.timestamp - prevTimestamp : 0


    this._update(this.timestamp, frameDelta)

    frameCtx(frameDelta)
  }

  addNode(node) {
    node.scene = this
    super.addNode(node);
  }
}

export class ManualBlender extends Node {
  onRendererChange(renderer) {
    let vertices = [1, 1, -1, 1, 1, -1, 1, 1, -1, 1, -1, -1, 1, -1, -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1, -1, 1, 1, -1, 1, -1, 1, -1, -1, 1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, 1, 1, -1, -1, 1, -1, -1, 1, -1, -1, 1]
    let normals = [0, 1, 0, 0, 0, -1, 1, 0, 0, 0, 0, -1, 1, 0, 0, 0, -1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, -1, 0, -1, 0, 0, 0, 0, -1, 0, 1, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0, 1, 0, 1, 0, -1, 0, 0, 0, -1, 0, 0, 0, 1, -1, 0, 0]
    let indices = [0, 14, 19, 0, 19, 6, 10, 8, 18, 10, 18, 22, 23, 20, 12, 23, 12, 15, 16, 5, 11, 16, 11, 21, 4, 2, 7, 4, 7, 9, 17, 13, 1, 17, 1, 3]
    let singleBuffer = new Float32Array([...vertices, ...normals])

    // let vertexView = new DataView(singleBuffer.buffer, 0, vertices.length * 4)
    // let normalView = new DataView(singleBuffer.buffer, vertices.length * 4, normals.length * 4)

    let vertexView = singleBuffer.buffer
    let normalView = singleBuffer.buffer

    let vertexBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, vertexView)
    let normalBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, normalView)

    // let vertexBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(vertices))
    // let normalBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(normals))
    // let buffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new FlosingleBuffer)
    let indexBuffer = renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices))

    let attrs = [
      new PrimitiveAttribute('POSITION', vertexBuffer, 3, GL.FLOAT, 0, 0),
      new PrimitiveAttribute('NORMAL', normalBuffer, 3, GL.FLOAT, 0, vertices.length * 4),
    ]

    let primitive = new Primitive(attrs, indices.length)
    primitive.setIndexBuffer(indexBuffer)

    let material = new SimpleMaterial()

    let renderPrimitive = renderer.createRenderPrimitive(primitive, material)
    this.addRenderPrimitive(renderPrimitive)
  }

}

export class Cube extends Node {
  /** @type {number} */
  width;
  /** @type {number} */
  height;
  /** @type {number} */
  depth;

  /**
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   */
  constructor(width, height, depth) {
    super()
    this.width = width;
    this.height = height;
    this.depth = depth;
  }

  onRendererChange(renderer) {
    let vertices = []
    let indices = []

    vertices = jPositions
    let normals = jNormals

    let vertexBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(vertices))
    let normalBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(normals))

    let attrs = [
      new PrimitiveAttribute('POSITION', vertexBuffer, 3, GL.FLOAT, 0, 0),
      new PrimitiveAttribute('NORMAL', normalBuffer, 3, GL.FLOAT, 0, 0),
    ]

    let primitive = new Primitive(attrs, vertices.length / 3)

    let material = new SimpleMaterial()

    let renderPrimitive = renderer.createRenderPrimitive(primitive, material)
    this.addRenderPrimitive(renderPrimitive)
  }

}

export class Icosphere extends Node {
  onRendererChange(renderer) {
    let vertices = [0, -1, 0, 0.7236, -0.447215, 0.52572, -0.276385, -0.447215, 0.85064, 0.7236, -0.447215, 0.52572, 0, -1, 0, 0.7236, -0.447215, -0.52572, 0, -1, 0, -0.276385, -0.447215, 0.85064, -0.894425, -0.447215, 0, 0, -1, 0, -0.894425, -0.447215, 0, -0.276385, -0.447215, -0.85064, 0, -1, 0, -0.276385, -0.447215, -0.85064, 0.7236, -0.447215, -0.52572, 0.7236, -0.447215, 0.52572, 0.7236, -0.447215, -0.52572, 0.894425, 0.447215, 0, -0.276385, -0.447215, 0.85064, 0.7236, -0.447215, 0.52572, 0.276385, 0.447215, 0.85064, -0.894425, -0.447215, 0, -0.276385, -0.447215, 0.85064, -0.7236, 0.447215, 0.52572, -0.276385, -0.447215, -0.85064, -0.894425, -0.447215, 0, -0.7236, 0.447215, -0.52572, 0.7236, -0.447215, -0.52572, -0.276385, -0.447215, -0.85064, 0.276385, 0.447215, -0.85064, 0.7236, -0.447215, 0.52572, 0.894425, 0.447215, 0, 0.276385, 0.447215, 0.85064, -0.276385, -0.447215, 0.85064, 0.276385, 0.447215, 0.85064, -0.7236, 0.447215, 0.52572, -0.894425, -0.447215, 0, -0.7236, 0.447215, 0.52572, -0.7236, 0.447215, -0.52572, -0.276385, -0.447215, -0.85064, -0.7236, 0.447215, -0.52572, 0.276385, 0.447215, -0.85064, 0.7236, -0.447215, -0.52572, 0.276385, 0.447215, -0.85064, 0.894425, 0.447215, 0, 0.276385, 0.447215, 0.85064, 0.894425, 0.447215, 0, 0, 1, 0, -0.7236, 0.447215, 0.52572, 0.276385, 0.447215, 0.85064, 0, 1, 0, -0.7236, 0.447215, -0.52572, -0.7236, 0.447215, 0.52572, 0, 1, 0, 0.276385, 0.447215, -0.85064, -0.7236, 0.447215, -0.52572, 0, 1, 0, 0.894425, 0.447215, 0, 0.276385, 0.447215, -0.85064, 0, 1, 0]
    let normals = [0.1876, -0.7947, 0.5774, 0.1876, -0.7947, 0.5774, 0.1876, -0.7947, 0.5774, 0.6071, -0.7947, 0, 0.6071, -0.7947, 0, 0.6071, -0.7947, 0, -0.4911, -0.7947, 0.3568, -0.4911, -0.7947, 0.3568, -0.4911, -0.7947, 0.3568, -0.4911, -0.7947, -0.3568, -0.4911, -0.7947, -0.3568, -0.4911, -0.7947, -0.3568, 0.1876, -0.7947, -0.5774, 0.1876, -0.7947, -0.5774, 0.1876, -0.7947, -0.5774, 0.9822, -0.1876, 0, 0.9822, -0.1876, 0, 0.9822, -0.1876, 0, 0.3035, -0.1876, 0.9342, 0.3035, -0.1876, 0.9342, 0.3035, -0.1876, 0.9342, -0.7946, -0.1876, 0.5774, -0.7946, -0.1876, 0.5774, -0.7946, -0.1876, 0.5774, -0.7946, -0.1876, -0.5774, -0.7946, -0.1876, -0.5774, -0.7946, -0.1876, -0.5774, 0.3035, -0.1876, -0.9342, 0.3035, -0.1876, -0.9342, 0.3035, -0.1876, -0.9342, 0.7946, 0.1876, 0.5774, 0.7946, 0.1876, 0.5774, 0.7946, 0.1876, 0.5774, -0.3035, 0.1876, 0.9342, -0.3035, 0.1876, 0.9342, -0.3035, 0.1876, 0.9342, -0.9822, 0.1876, 0, -0.9822, 0.1876, 0, -0.9822, 0.1876, 0, -0.3035, 0.1876, -0.9342, -0.3035, 0.1876, -0.9342, -0.3035, 0.1876, -0.9342, 0.7946, 0.1876, -0.5774, 0.7946, 0.1876, -0.5774, 0.7946, 0.1876, -0.5774, 0.4911, 0.7947, 0.3568, 0.4911, 0.7947, 0.3568, 0.4911, 0.7947, 0.3568, -0.1876, 0.7947, 0.5774, -0.1876, 0.7947, 0.5774, -0.1876, 0.7947, 0.5774, -0.6071, 0.7947, 0, -0.6071, 0.7947, 0, -0.6071, 0.7947, 0, -0.1876, 0.7947, -0.5774, -0.1876, 0.7947, -0.5774, -0.1876, 0.7947, -0.5774, 0.4911, 0.7947, -0.3568, 0.4911, 0.7947, -0.3568, 0.4911, 0.7947, -0.3568]

    let vertexBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(vertices))
    let normalBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(normals))

    let attrs = [
      new PrimitiveAttribute('POSITION', vertexBuffer, 3, GL.FLOAT, 0, 0),
      new PrimitiveAttribute('NORMAL', normalBuffer, 3, GL.FLOAT, 0, 0),
    ]

    let primitive = new Primitive(attrs, vertices.length / 3)

    let material = new SimpleMaterial()

    let renderPrimitive = renderer.createRenderPrimitive(primitive, material)
    this.addRenderPrimitive(renderPrimitive)
  }
}

export class PlaneWithNormals extends Node {
  onRendererChange(renderer) {
    let width = 1
    let height = 1
    let vertices = [
      width / 2, height / 2, -0.0, -1.0 * width / 2, height / 2, -0.0, -1.0 * width / 2, -1.0 * height / 2, -0.0, width / 2, -1.0 * height / 2, -0.0
    ]
    let normals = [
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0
    ]
    let indices = [
      0,
      1,
      2,
      3,
      0,
      2 // front
    ]

    let vertexBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(vertices))
    let normalBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(normals))
    let indexBuffer = renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices))

    let attrs = [
      new PrimitiveAttribute('POSITION', vertexBuffer, 3, GL.FLOAT, 0, 0),
      new PrimitiveAttribute('NORMAL', normalBuffer, 3, GL.FLOAT, 0, 0),
    ]

    let primitive = new Primitive(attrs, indices.length)
    primitive.setIndexBuffer(indexBuffer)

    let material = new SimpleMaterial()

    let renderPrimitive = renderer.createRenderPrimitive(primitive, material)
    this.addRenderPrimitive(renderPrimitive)
  }
}

class SimpleMaterial extends Material {
  constructor() {
    super();

    this.baseColor = this.defineSampler('baseColorTex')

    this.baseColorFactor = this.defineUniform('baseColorFactor', [1, 1, 1, 1])
    this.metallicRoughnessFactor = this.defineUniform('metallicRoughnessFactor', [1.0, 1.0]);
  }

  get materialName() {
    return 'Simple'
  }

  getProgramDefines(renderPrimitive) {
    let defs = {}

    if (this.baseColor.texture) {
      defs["USE_BASE_COLOR_TEX"] = 1
    }

    return defs
  }

  get vertexSource() {
    // language=GLSL
    return `
//#version 300 es
    attribute vec3 NORMAL;
    attribute vec3 POSITION;
    attribute vec2 TEXCOORD_0;
    attribute vec3 COLOR_0;
    
    

    varying vec2 vTexCoord;
    varying vec3 vLight;
    varying vec3 normal;
    varying vec3 pos;
    varying vec3 cameraPos;
    varying vec3 vView;
    varying vec3 vNorm;
    varying vec3 vColor0;

    const vec3 lightDir = vec3(0, -1.0, -15.0);
    const vec3 ambientColor = vec3(0.5, 0.5, 0.5);
    const vec3 lightColor = vec3(0.75, 0.75, 0.75);
    const vec3 CAMERA_POSITION = vec3(0, 35, 0);
    
    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
    vec3 n = normalize(vec3(model * vec4(NORMAL, 0)));
      vec3 normalRotated = vec3(model * vec4(NORMAL, 0.0));
      float lightFactor = max(dot(normalize(lightDir), normalRotated), 0.0);
      vLight = ambientColor + (lightColor * lightFactor);
      vTexCoord = TEXCOORD_0;
//      cameraPos = CAMERA_POSITION;
normal = NORMAL;
vColor0 = COLOR_0;
vNorm = n;
pos = POSITION;
vec4 mPos = model * vec4(POSITION, 1.0);
//vLight = -lightDir;
vView = CAMERA_POSITION -mPos.xyz;
      return  proj * view * mPos;
    }
    `.trim()
  }

  get fragmentSource() {
    // language=GLSL
    return `
//    #version 300 es
          precision highp float;
    //      uniform sampler2D baseColor;
          varying vec2 vTexCoord;
          varying vec3 vLight;
          varying vec3 vView;
          varying vec3 vColor0;
          varying vec3 vNorm;
          varying vec3 pos;
//          varying vec3 cameraPos;
          
          uniform sampler2D baseColorTex;
          
  uniform vec4 baseColorFactor;
const vec3 LIGHT_COLOR = vec3(1.0, 1.0, 1.0);


          vec4 fragment_main() {
//          vec3 cameraDir = normalize(cameraPos - pos.xyz);
#ifdef USE_BASE_COLOR_TEX
vec4 baseColor = (texture2D(baseColorTex, vTexCoord)) * baseColorFactor;
#else
vec4 baseColor = baseColorFactor;
#endif
//baseColor *= vec4(vColor0, 1.0);
vec3 n = normalize(vNorm);
          
            vec3 l = normalize(vLight);
            vec3 v = normalize(vView);
            vec3 h = normalize(l+v);
            
            float halfLambert = dot(n,l)*0.5+0.5;
            halfLambert = pow(halfLambert, 2.0);
        return vec4(halfLambert * LIGHT_COLOR * baseColor.rgb, baseColor.a);
//return vec4(texture2D(baseColorTex, vTexCoord)) + (o * vec4(0,0,0,0));
          
//          vec3 surfaceToLightDirection = normalize(v)
//const vec3 lightDirection = vec3(0, -1.0, -15.0);
//vec3 reflectionDir = reflect(-lightDirection, normal);
//        float lightIntensity = dot(normal, vec3(0, -1.0, -15.0));
    //      return vec4(pos.xyz, 1.0);

    //      return vec4(normal.xyz, 1.0);
//            return vec4(pow(max(dot(reflectionDir, cameraDir), 0.0), 10.0) * vLight,  1.0); // * texture(baseColor, vTexCoord);
          }
        `.trim()
  }
}

class VertexColorMaterial extends Material {

  get materialName() {
    return "VertexColorMaterial"
  }

  get vertexSource() {
    return `
    #version 330 es
    in vec3 POSITION;
    in vec3 COLOR_0;
    
    out vec3 vColor0;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vec4 pos = vec4(POSTIION.x, POSITION.y, POSITION.z, 1.0);
      vColor0 = COLOR_0;
      return proj * view * model * pos;
    }
    `.trim()
  }

  get fragmentSource() {
    return `
    #version 330 es
    in vec3 vColor0;

    vec4 fragment_main() {
      return vec4(vColor0, 1.0);
    }
    `.trim()
  }
}

// class TextureMaterial extends Material {
//   constructor() {
//     super();
//
//
//   }
//
//
//   get materialName() {
//     return "TextureMaterial"
//   }
//
//   get vertexSource() {
//     return `
//     #version 330 es
//     in vec3 POSITION;
//     in vec2 TEXCOORD0;
//
//      // vec2 vTexCoord;
//
//     vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
//       vTexCoord = TEXCOORD0;
//       vec4 pos = vec4(POSTIION.x, POSITION.y, POSITION.z, 1.0);
//       return proj * view * model * pos;
//     }
//     `.trim()
//   }
//
//   get fragmentSource() {
//     return `
//     #version 330 es
//     uniform sample2D icon;
//     in vec2 vTexCoord;
//
//     vec4 fragment_main() {
//       return texture2D(icon, vTexCoord);
//     }
//     `.trim()
//   }
// }

class Gltf2Loader {
  constructor(renderer) {
    this.renderer = renderer
    this.gl = renderer.gl
  }

  async loadFromUrl(url) {
    console.assert(url.endsWith('.gltf'))
    let response = await fetch(url)

    let json = await response.json()
    return this.loadFromJson(json)
  }

  static getComponentCount(type) {
    if (type === "SCALAR") {
      return 1
    } else if (type === "VEC2") {
      return 2
    } else if (type === "VEC3") {
      return 3
    } else if (type === "VEC4") {
      return 4
    }
    return 0
  }

  /**
   * @param {Gltf2} json
   * @return {Node}
   */
  loadFromJson(json) {
    console.assert(!(json.asset.minVersion !== '2.0' && json.asset.version !== '2.0'))

    let buffers = []
    for (let buffer of json.buffers) {
      buffers.push(new Gltf2Resource(buffer))
    }

    let bufferViews = []
    for (let bufferView of json.bufferViews) {
      bufferViews.push(new Gltf2BufferView(bufferView, buffers))
    }

    let images = [];
    if (json.images) {
      for (let image of json.images) {
        images.push(new Gltf2Resource(image))
      }
    }

    let textures = []
    if (json.textures) {
      for (let tex of json.textures) {
        let image = images[tex.source]
        let glTex = image.texture(bufferViews)
        if (tex.sampler) {
          let sampler = json.samplers[tex.sampler]
          glTex.sampler.minFilter = sampler.minFilter
          glTex.sampler.magFilter = sampler.magFilter
          glTex.sampler.wrapS = sampler.wrapS
          glTex.sampler.wrapT = sampler.wrapT
        }
        textures.push(glTex)
      }
    }


    let getTexture = (info) => {
      if (!info) return null
      return textures[info.index]
    }

    // TODO: Materials
    let materials = []
    if (json.materials) {
      for (let material of json.materials) {
        let glMaterial = new SimpleMaterial()

        let pbr = material.pbrMetallicRoughness ?? {}

        glMaterial.baseColor.texture = getTexture(pbr.baseColorTexture)

        glMaterial.baseColorFactor.value = pbr.baseColorFactor ?? [1, 1, 1, 1]
        glMaterial.metallicRoughnessFactor.value = [
          pbr.metallicFactor ?? 1,
          pbr.roughnessFactor ?? 1,
        ]

        materials.push(glMaterial)
      }
    }

    let accessors = json.accessors

    let meshes = []
    for (let mesh of json.meshes) {
      let glMesh = new Gltf2Mesh()
      meshes.push(glMesh)

      for (let primitive of mesh.primitives) {
        let material = null
        if ("material" in primitive) {
          material = materials[primitive.material]
        } else {
          material = new SimpleMaterial()
        }

        let attrs = []
        let elementCount = 0

        let min = null
        let max = null

        for (let name in primitive.attributes) {
          let accessor = accessors[primitive.attributes[name]]
          let bufferView = bufferViews[accessor.bufferView]
          elementCount = accessor.count

          let glAttribute = new PrimitiveAttribute(
              name,
              bufferView.renderBuffer(this.renderer, GL.ARRAY_BUFFER),
              Gltf2Loader.getComponentCount(accessor.type),
              accessor.componentType,
              bufferView.byteStride ?? 0,
              accessor.byteOffset ?? 0,
          )
          glAttribute.normalized = accessor.normalized ?? false

          if (name === "POSITION") {
            min = accessor.min
            max = accessor.max
          }

          attrs.push(glAttribute)
        }

        let glPrimitive = new Primitive(attrs, elementCount, primitive.mode)

        if ("indices" in primitive) {
          let accessor = accessors[primitive.indices];
          let bufferView = bufferViews[accessor.bufferView];
          glPrimitive.setIndexBuffer(
              bufferView.renderBuffer(this.renderer, GL.ELEMENT_ARRAY_BUFFER),
              accessor.byteOffset ?? 0,
              accessor.componentType,
          )
          glPrimitive.indexType = accessor.componentType
          glPrimitive.indexByteOffset = accessor.byteOffset ?? 0
          glPrimitive.elementCount = accessor.count
        }

        if (min && max) {
          // TODO: Position bounds
          // glPrimitive.setBounds(min, max)
        }

        glMesh.primitives.push(
            this.renderer.createRenderPrimitive(glPrimitive, material)
        )
      }
    }

    let sceneNode = new Node()
    let scene = json.scenes[json.scene]
    for (let nodeId of scene.nodes) {
      let node = json.nodes[nodeId]
      sceneNode.addNode(
          this.processNodes(node, json.nodes, meshes)
      )
    }

    return sceneNode
  }

  /**
   * @param {{mesh: number, name: string}} node
   * @param {{mesh: number, name: string}[]} nodes
   * @param {*[]} meshes
   * @return {Node}
   */
  processNodes(node, nodes, meshes) {
    let glNode = new Node()
    glNode.name = node.name

    if ("mesh" in node) {
      let mesh = meshes[node.mesh];
      for (let primitive of mesh.primitives) {
        glNode.addRenderPrimitive(primitive)
      }
    }

    if (node.translation) {
      glNode.translation = new Float32Array(node.translation)
    }
    if (node.rotation) {
      glNode.rotation = new Float32Array(node.rotation)
    }
    if (node.scale) {
      glNode.scale = new Float32Array(node.scale)
    }

    for (let nodeId of node.children ?? []) {
      let node = nodes[nodeId];
      glNode.addNode(this.processNodes(node, nodes, meshes))
    }

    return glNode
  }
}

/**
 * @typedef {{byteLength: number, uri: string}} Gltf2Buffer
 */
/**
 * @typedef {{
 *   asset: {
 *     generator: string, version: string, minVersion: string,
 *   },
 *   scenes: {name: string, nodes: number[]}[],
 *   nodes: {mesh: number, name: string}[],
 *   meshes: {name: string, primitives: {attributes: {[key: string]: number}[], indices: number, material: number}[]}[],
 *   textures: {sampler: number, source: number}[],
 *   images: {bufferView: number, mimeType: string, name: string}[],
 *   accessors: {
 *     bufferView: number,
 *     componentType: number,
 *     count: number,
 *     max: number[],
 *     min: number[],
 *     type: string,
 *   }[],
 *   bufferViews: {buffer: number, byteLength: number, byteOffset: number, target: number}[],
 *   samplers: {magFilter: number, minFilter: number }[],
 *   buffers: Gltf2Buffer[]
 * }} Gltf2
 */

class Gltf2Mesh {
  primitives = []
}

class Gltf2BufferView {
  /** @type {RenderBuffer|null} */
  _renderBuffer;

  /**
   *
   * @param {any} json
   * @param {Gltf2Resource[]} buffers
   */
  constructor(json, buffers) {
    this.buffer = buffers[json.buffer]
    this.byteOffset = json.byteOffset ?? 0
    this.byteLength = json.byteLength ?? null
    this.byteStride = json.byteStride
  }

  /**
   * @return {DataView}
   */
  dataView() {
    return new DataView(this.buffer.arrayBuffer(), this.byteOffset, this.byteLength)
  }

  /**
   * @param {Renderer} renderer
   * @param {GLenum} target
   * @return {RenderBuffer}
   */
  renderBuffer(renderer, target) {
    if (!this._renderBuffer) {

      this._renderBuffer = renderer.createRenderBuffer(target, this.dataView())
      return this._renderBuffer
      // for compatibility wit webgl-inspector
      if (target === GL.ARRAY_BUFFER) {
        this._renderBuffer = renderer.createRenderBuffer(target, new Float32Array(this.dataView().buffer, this.dataView().byteOffset, this.dataView().byteLength / 4))
      } else if (target === GL.ELEMENT_ARRAY_BUFFER) {
        this._renderBuffer = renderer.createRenderBuffer(target, new Uint16Array(this.dataView().buffer, this.dataView().byteOffset, this.dataView().byteLength / 2))
      } else {
        throw ''
      }
    }
    return this._renderBuffer
  }
}

class Gltf2Resource {
  /** @type {Gltf2Buffer|any} json */
  json;
  /** @type {ImageTexture} */
  #texture = null

  /** @param {Gltf2Buffer|any} json */
  constructor(json) {
    this.json = json
  }

  /**
   * @return {ArrayBufferLike}
   */
  arrayBuffer() {
    if (!this.buffer) {
      let base64String = this.json.uri.replace('data:application/octet-stream;base64,', '');
      let binaryArray = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0))
      this.buffer = binaryArray.buffer
    }
    return this.buffer
  }

  /**
   * @param {Gltf2BufferView[]} bufferViews
   * @return {ImageTexture}
   */
  texture(bufferViews) {
    if (!this.#texture) {
      let img = new Image()
      this.#texture = new ImageTexture(img)

      // this.#texture.makeDataKey()
      let view = bufferViews[this.json.bufferView]
      let blob = new Blob([view.dataView()], {type: this.json.mimeType})
      img.src = window.URL.createObjectURL(blob)
    }
    return this.#texture
  }
}

class ImageTexture extends Texture {
  constructor(img) {
    super();

    this.img = img
    this.imgBmp = null

    if (img.src && img.complete) {
      this.promise = this.createImageBitmap()
    } else {
      this.promise = new Promise((resolve) => {
        img.addEventListener('load', () => {
          resolve(this.createImageBitmap())
        })
      })
    }
  }

  async createImageBitmap() {
    this.imgBmp = await window.createImageBitmap(this.img)
  }

  finish() {
    return this.promise
  }

  get width() {
    return this.img.width
  }

  get height() {
    return this.img.height
  }

  get textureKey() {
    return this.img.src
  }
}

export class Gltf2Node extends Node {
  constructor({str}) {
    super()
    this.str = str
  }

  onRendererChange(renderer) {
    this.loader = new Gltf2Loader(renderer)

    let data = JSON.parse(this.str)

    this.addNode(this.loader.loadFromJson(data))
  }
}


export class Component {
  /** @type {Node} */
  node;
  /** @type {string|null} */
  name;

  /**
   * @param {Node} node
   */
  attach(node) {
    this.node = node
  }

  onUpdate(timestamp, frameDelta) {
    // abstract
  }
}

export class GravityComponent extends Component {
  acc = 0
  colliderType;
  jump = false

  constructor({collidesWith: colliderType} = {}) {
    super();
    this.colliderType = colliderType ?? Collider
  }

  onUpdate(timestamp, frameDelta) {
    let collider = this.node.components.find(this.colliderType);
    if (this.jump && collider.colliding) {
      this.acc = .3
    }
    if (!this.jump && collider.colliding) {
      this.acc = 0
    }
    this.node.translation[1] +=this.acc
      this.acc -= 0.015
  }
}

export class WobbleComponent extends Component {
  x = 0
  magnitude

  constructor({x, y, z}) {
    super()
    this.magnitude = {x: x ?? 20, y: y ?? 20, z: z ?? 20}
  }


  onUpdate(timestamp, frameDelta) {
    quat.fromEuler(this.node.rotation, Math.cos(this.x) * this.magnitude.x, Math.sin(this.x) * this.magnitude.y, Math.sin(this.x) * this.magnitude.z)
    quat.rotateY(this.node.rotation, this.node.rotation, Math.PI)
    this.x += 0.05
  }
}


export class Collider extends Component {
  test = false

  constructor(test = false) {
    super();
    this.test = test
  }

  /**
   * @param {Component} one
   * @param {Component} two
   * @return {number}
   */
  static distance(one, two) {
    return Math.sqrt(((two.node.worldX - one.node.worldX) ** 2) + ((two.node.worldY - one.node.worldY) ** 2) + ((two.node.worldZ - one.node.worldZ) ** 2))
  }
}

export class RectangleColliderComponent extends Collider {
  /** @type {number} */
  w
  /** @type {number} */
  h
  /** @type {number} */
  d
  /** @type {Set<Node>} */
  #colliders = new Set()

  constructor(w, h, d, test = false) {
    super(test);
    this.w = w;
    this.h = h;
    this.d = d;
  }

  get colliding() {
    return this.#colliders.size
  }

  get colliders() {
    return this.#colliders
  }

  checkRect(other) {
    throw 'TODO'
  }

  onUpdate(timestamp, frameDelta) {
    if (this.test) return
    this.colliders.clear()
    for (let other of this.node.components) {
      if (other === this) continue
      if (other instanceof SphereColliderComponent) {
        if (other.test) continue
        if (other.checkRect(this)) {
          this.colliders.add(other)
        }
      } else if (other instanceof RectangleColliderComponent) {
        if (other.test) continue
        if (this.checkRect(this)) {
          this.colliders.add(other)
        }
      }
    }
  }
}

export class SphereColliderComponent extends Collider {
  /** @type {number} */
  radius
  /** @type {Set<Node>} */
  #colliders = new Set()

  constructor(radius, test = false) {
    super(test);
    this.radius = radius;
  }

  get colliding() {
    return this.#colliders.size
  }

  get colliders() {
    return this.#colliders
  }

  /**
   * @param {SphereColliderComponent} other
   * @return {boolean}
   */
  checkSphere(other) {
    return (other.radius + this.radius) > Collider.distance(this, other);
  }

  /**
   * @param {RectangleColliderComponent} rect
   * @return {boolean}
   */
  checkRect(rect) {
    let b_min = [rect.node.translation[0] - (rect.w / 2), rect.node.translation[1] - (rect.h / 2), rect.node.translation[2] - (rect.d / 2)]
    let b_max = [rect.node.translation[0] + (rect.w / 2), rect.node.translation[1] + (rect.h / 2), rect.node.translation[2] + (rect.d / 2)]
    let c = [this.node.translation[0], this.node.translation[1], this.node.translation[2]]

    let p = [0, 0, 0]
    for (let i = 0; i < 3; i++) {
      if (c[i] < b_min[i]) {
        p[i] = b_min[i]
      }
      if (b_min[i] < c[i] && c[i] < b_max[i]) {
        p[i] = c[i]
      }
      if (b_max[i] < c[i]) {
        p[i] = b_max[i]
      }
    }

    let p1 = (p[0] - c[0]) ** 2;
    let p2 = (p[1] - c[1]) ** 2;
    let p3 = (p[2] - c[2]) ** 2;
    let r2 = this.radius ** 2;
    if (Math.sqrt(p1 + p2 + p3) < r2) {
      return true
    }
    return false
  }

  onUpdate(timestamp, frameDelta) {
    this.colliders.clear()
    for (let otherNode of this.node.scene.children) {
      for (let other of otherNode.components) {
        if (other === this) continue
        if (other instanceof SphereColliderComponent) {
          if (this.checkSphere(other)) {
            this.colliders.add(other)
          }
        } else if (other instanceof RectangleColliderComponent) {
          if (this.checkRect(other)) {
            this.colliders.add(other)
          }
        }
      }
    }
  }
}