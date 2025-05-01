import { $ } from "./helper.js";
import { newGLBuffer } from "./glutils.js";
import { mat4, quat, vec3 } from "https://esm.sh/v104/gl-matrix@3.4.3/es2022/gl-matrix.development.js";
import "https://esm.sh/webgl-lint@1.10.1";
import spector from "https://esm.sh/spectorjs@latest";


class Vector3 {
  x = 0.0;
  y = 0.0;
  z = 0.0;

  constructor(x, y, z) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.z = z ?? 0;
  }

  get xyz() {
    return [this.x, this.y, this.z];
  }
}


class Object3d {
  position = new Vector3();
  rotation = new Vector3();
  quaternion = quat.create();

  render() {
    throw `No implementation of render for type ${this.constructor.name}`;
  }
}

class Camera extends Object3d {

}

class DirectionalLight extends Object3d {

}

class Shape {
  positionBuffer;
  normalBuffer;
  indexBuffer;
  colorBuffer;
  texture;
  textureCoords;
  vertexCount = 0;
}

export class Plane extends Shape {
  vertexCount = 6;

  /** @type {WebGLBuffer} */

  /**
   * @param {WebGLRenderingContext} gl
   * @param width {number}
   * @param height {number}
   * @param color {Vector3}
   */
  constructor(gl, width, height, color) {
    super();
    this.gl = gl;
    // this.vertexCount = data["position"].length/3
    this.positionBuffer = newGLBuffer(gl, new Float32Array([
      // Front face
      // width / 2, height / 2, -1.0, -1.0 * width / 2, height / 2, -1.0, -1.0 * width / 2, -1.0 * height / 2, -1.0, width / 2, -1.0 * height / 2, -1.0
      width / 2, height / 2, -0.0, -1.0 * width / 2, height / 2, -0.0, -1.0 * width / 2, -1.0 * height / 2, -0.0, width / 2, -1.0 * height / 2, -0.0
      // ...data["position"]
    ]));

    this.normalBuffer = newGLBuffer(gl, new Float32Array([
      // Front
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0
    ]));

    this.indexBuffer = newGLBuffer(gl, new Uint16Array([
      0,
      1,
      2,
      3,
      0,
      2 // front
    ]), gl.ELEMENT_ARRAY_BUFFER);

    let colors = [];
    for (let i = 0; i < this.vertexCount; i++) {
      colors = colors.concat(...color.xyz, 1);
    }

    this.colorBuffer = newGLBuffer(gl, new Float32Array(colors));

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
      const pixels = new Uint8Array([0, 0, 255, 255, 255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255, ]);

      let image = new Image()
      image.src = "./khronos_webgl.png"
      image.addEventListener('load', () =>{
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        gl.generateMipmap(gl.TEXTURE_2D)
      })

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
        // Front
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Back
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Top
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Bottom
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Right
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Left
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      ]


      this.textureCoords = newGLBuffer(gl, new Float32Array(textureCoords))
      gl.generateMipmap(gl.TEXTURE_2D)
    }

  }
}

// An object based on a Shape and a Material
class Mesh extends Object3d {
  /**
   * @param {Shape} shape
   // * @param {Material} material
   */
  constructor(shape) {
    super();
    this.shape = shape;
  }

  render(gl, locations) {
    this.setPositionAttribute(gl, locations);
    // this.setColorAttribute(gl, locations);
    this.setNormalAttribute(gl, locations);
    this.setTextureAttribute(gl, locations)
    if (this.shape.indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.shape.indexBuffer);
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.shape.positionBuffer);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shape.colorBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shape.normalBuffer);

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.shape.texture)
    gl.uniform1i(locations.uniform.uSampler, 0)

    if (this.shape.indexBuffer) {
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLE_STRIP, this.shape.vertexCount, type, offset);
    } else {
      gl.drawArrays(gl.TRIANGLES, 0, this.shape.vertexCount);
    }
  }


  setPositionAttribute(gl, locations) {
    const componentWidth = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shape.positionBuffer);
    gl.vertexAttribPointer(
      locations.attribute.vertexPosition,
      componentWidth,
      type,
      normalize,
      stride,
      offset
    );

    gl.enableVertexAttribArray(locations.attribute.vertexPosition);
  }


  setColorAttribute(gl, locations) {
    const componentWidth = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shape.colorBuffer);
    gl.vertexAttribPointer(
      locations.attribute.vertexColor,
      componentWidth,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(locations.attribute.vertexColor);
  }

  setNormalAttribute(gl, locations) {
    const componentWidth = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shape.normalBuffer);
    gl.vertexAttribPointer(
      locations.attribute.vertexNormal,
      componentWidth,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(locations.attribute.vertexNormal);
  }

  setTextureAttribute(gl, locations) {
    const componentWidth = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shape.textureCoords);
    gl.vertexAttribPointer(
      locations.attribute.textureCoord,
      componentWidth,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(locations.attribute.textureCoord);
  }
}

export class Scene {
  objects = [];
  light;

  /**
   * @param obj {Object3d}
   */
  add(obj) {
    this.objects.push(obj);
  }

  /**
   * @param {DirectionalLight} light
   */
  setLight(light) {
    this.light = light;
  }
}

export class Renderer {
  ctx;
  scene;

  /**
   * @param {Scene} scene
   * @param {WebGLRenderingContext} ctx
   */
  constructor(scene, ctx) {
    this.scene = scene;
    this.gl = ctx;
    let gl = this.gl;

    // Generate program
    let vsShader = this.#createVertexShaderSource(this.scene);
    let fsShader = this.#createFragmentShaderSource(this.scene);
    this.program = this.#compileShaderProgram(vsShader, fsShader);

    this.locations = this.#getLocations();
  }


  #createVertexShaderSource(_scene) {
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

        out vec3 v_normal;
        out vec3 v_surfaceToLight;

//        out lowp vec4 vColor;



        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vPosition = gl_Position;

            vec3 surfaceWorldPosition = (uModelViewMatrix * aVertexPosition).xyz;
            v_surfaceToLight = uLightWorldPosition - surfaceWorldPosition;
            highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

//            vColor = aVertexColor;
            vTextureCoord = aTextureCoord;

            v_normal = transformedNormal.xyz;
            // v_normal = uNormalMatrix * aVertexNormal;
        }
    `.trim();
  }

  #createFragmentShaderSource(_scene) {
    return `
    #version 300 es
    precision mediump float;
    in vec4 vPosition;
    out vec4 outColor;
    in vec3 v_normal;
    in vec3 v_surfaceToLight;
    in highp vec2 vTextureCoord;
    
    uniform highp sampler2D uSampler;
//    in lowp vec4 vColor;
//     vec4 color = vec4(1,0,0,1);
    void main() {
            
      // outColor = vec4(normalize(vec2(dFdx(vPosition.x), dFdy(vPosition.y))), 1, 1);
      vec4 vColor = texture(uSampler, vTextureCoord);
   
      vec3 normal = normalize(v_normal);
 
      vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
     
      float lightIntensity = dot(v_normal, surfaceToLightDirection);
      
      outColor = vec4(vColor.rgb * (vec3(1, 0,0) * lightIntensity), vColor.a);
    }
    `.trim();
  }

  #compileShaderProgram(vsSource, fsSource) {
    const vertexShader = this.#loadShader(this.gl, this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.#loadShader(this.gl, this.gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = this.gl.createProgram();
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);

    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
      alert(`Failed to init shader program ${this.gl.getProgramInfoLog(shaderProgram)}`);
      return null;
    }

    return shaderProgram;
  }

  #loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(`Failed to compile shader ${gl.getShaderInfoLog(shader)}`);
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  /**
   * @param {Camera} camera
   */
  render(camera) {
    if (!camera) throw "No camera passed to render function";
    let gl = this.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = mat4.create();

    mat4.translate(modelViewMatrix, modelViewMatrix, camera.position.xyz);


    // setPositionAttribute(gl, buffers, programInfo)
    // setColorAttribute(gl, buffers, programInfo)
    // setNormalAttribute(gl, buffers, programInfo);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
    // gl.bindBuffer(gl.ARRAY_BUFFER, this.color)
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal)


    gl.useProgram(this.program);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);


    for (let obj of this.scene.objects) {
      let newModelViewMatrix = mat4.clone(modelViewMatrix);
      // let newProjectionMatrix = mat4.clone(projectionMatrix)
      // let newNormalMatrix = mat4.clone(normalMatrix)
      ///// mat4.translate(newModelViewMatrix, modelViewMatrix, obj.position.xyz);
      // mat4.multiply(newModelViewMatrix, newModelViewMatrix, quat.toMat4(obj.quaternion))
      // mat4.rotateByQuatAppend(newModelViewMatrix, newModelViewMatrix, obj.quaternion)
      let rotationMatrix = mat4.create();
      mat4.fromRotationTranslation(rotationMatrix, obj.quaternion, vec3.fromValues(...obj.position.xyz));
      mat4.multiply(newModelViewMatrix, newModelViewMatrix, rotationMatrix);

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

      obj.render(gl, this.locations);
    }
  }

  /**
   *
   * @returns {{uniform: {normalMatrix: WebGLUniformLocation, projectionMatrix: WebGLUniformLocation, modelViewMatrix: WebGLUniformLocation}, attribute: {vertexNormal: GLint, vertexColor: GLint, vertexPosition: GLint}}}
   */
  #getLocations() {
    let attribute = {
      vertexPosition: this.gl.getAttribLocation(this.program, "aVertexPosition"),
      vertexNormal: this.gl.getAttribLocation(this.program, "aVertexNormal"),
      textureCoord: this.gl.getAttribLocation(this.program, "aTextureCoord"),
      // vertexColor: this.gl.getAttribLocation(this.program, "aVertexColor")
    };
    let uniform = {
      projectionMatrix: this.gl.getUniformLocation(this.program, "uProjectionMatrix"),
      modelViewMatrix: this.gl.getUniformLocation(this.program, "uModelViewMatrix"),
      uSampler: this.gl.getUniformLocation(this.program, "uSampler"),
      normalMatrix: this.gl.getUniformLocation(this.program, "uNormalMatrix"),
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
  }
}


function go() {
  /** @type {HTMLCanvasElement} */
  let canvas = $("canvas");
  let ctx = canvas.getContext("webgl2");

  let scene = new Scene();
  let camera = new Camera();
  camera.position = new Vector3(0, 0, -6);

  let directionalLight = new DirectionalLight();
  directionalLight.position = new Vector3(1, 1, 1);
  scene.setLight(directionalLight);

  let plane = new Plane(ctx, 1, 1, new Vector3(1, 0, 0));
  let plane2 = new Plane(ctx, 2, 1, new Vector3(0, 1, 1));
  // let redMaterial = new ColorMaterial(1, 0, 0, 1);
  let mesh1 = new Mesh(plane);
  let mesh2 = new Mesh(plane2);
  scene.add(mesh1);
  scene.add(mesh2);
  let plane3 = new Plane(ctx, 1, 1, new Vector3(1, 0, 0));
  let plane4 = new Plane(ctx, 2, 1, new Vector3(0, 1, 1));
  // let redMaterial = new ColorMaterial(1, 0, 0, 1);
  let mesh3 = new Mesh(plane3);
  let mesh4 = new Mesh(plane4);
  scene.add(mesh3);
  scene.add(mesh4);

  let renderer = new Renderer(scene, ctx);
  renderer.render(camera);
  window["r"] = renderer;
  window["c"] = camera;
  window["s"] = scene;
  let now = 1;
  let then = 0;
  let rot = 0;

  quat.rotateX(mesh1.quaternion, mesh1.quaternion, Math.PI / 4);
  mesh1.position.y += 1;
  quat.rotateY(mesh2.quaternion, mesh2.quaternion, Math.PI / 4);
  quat.rotateX(mesh3.quaternion, mesh3.quaternion, -Math.PI / 4);
  mesh3.position.y += 2;
  mesh4.position.x -= 1.4;
  quat.rotateY(mesh4.quaternion, mesh4.quaternion, -Math.PI / 4);

  function render(now) {
    now *= 0.001;
    let deltaTime = now - then;
    then = now;

    rot += deltaTime;
    //
    // mesh2.position.x = Math.cos(rot);
    // mesh2.position.y = Math.sin(rot);
    // quat.rotateY(mesh1.quaternion, mesh1.quaternion, .01)
    // quat.rotateZ(mesh1.quaternion, mesh1.quaternion, .01)
    // mesh2.position.z = Math.sin(rot);
    // mesh1.position.x = Math.cos(rot + Math.PI);
    // mesh1.position.y = Math.sin(rot + Math.PI);
    // mesh1.position.z = Math.sin(rot + Math.PI);
    // // mesh1.rotation.x = rot;
    // // // quat.fromEuler(mesh2.quaternion, 35, 35, 35)
    // quat.rotateX(mesh2.quaternion, mesh2.quaternion, .01)
    // quat.rotateY(mesh2.quaternion, mesh2.quaternion, .01)
    //
    // TODO: Fix light objects
    directionalLight.position.z = Math.cos(rot*1 + Math.PI)*4
    directionalLight.position.x = Math.cos(rot*1 + Math.PI)*4
    // directionalLight.position.y = Math.cos(rot*1 + Math.PI)*4

    // directionalLight.position.z = 10.85;
    // directionalLight.position.x = -10
    // directionalLight.position.y = -10
    // quat.rotateX(directionalLight.quaternion, directionalLight.quaternion, 0.1)

    // camera.position.y = Math.sin(rot+ Math.PI)
    // camera.position.z = Math.cos(rot+ Math.PI) + -6

    renderer.render(camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
  if (window.location.search.endsWith("?debug")) {
    var SPECTOR = new spector.Spector();
    SPECTOR.displayUI();
  }
}

go();
