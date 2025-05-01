import { $, _, h } from "./libjackson.js";
// import { newGLBuffer } from "./glutils.js";
import { newGLBuffer, quat, mat4, vec3} from "./glutils.js";
// import { glMatrix, mat4, quat, vec3 } from "https://esm.sh/v104/gl-matrix@3.4.3/es2022/gl-matrix.development.js";
import "https://esm.sh/webgl-lint@1.10.1";
// import spector from "https://esm.sh/spectorjs@latest";

/**
 * @typedef MyWebGLContext {WebGL2RenderingContext|WebGLRenderingContext}
 */
/**
 * @typedef UniformLocations {cameraPos: WebGLUniformLocation, normalMatrix: WebGLUniformLocation, lightPosition: WebGLUniformLocation[], projectionMatrix: WebGLUniformLocation, uSampler: WebGLUniformLocation, modelViewMatrix: WebGLUniformLocation}
 * @typedef AttributeLocations {vertexNormal: GLint, textureCoord: GLint, vertexPosition: GLint}
 * @typedef Locations {uniform: UniformLocations, attribute: AttributeLocations}
 */

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
    quaternion = quat.create();
    scale = new Vector3(1, 1, 1);

    render() {
        throw `No implementation of render for type ${this.constructor.name}`;
    }
}

class Camera extends Object3d {
    // Magic
}

class DirectionalLight extends Object3d {
    // Magic
}

class Material {
    render(gl, locations, shape) {
        throw `No implementation of render for type ${this.constructor.name}`;
    }
}

class ColorMaterial extends Material {
    colorBuffer;

    constructor() {
        super();
        throw 'TODO: Not implemented'
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
}

class TextureMaterial extends Material {
    texture;
    textureCoords;

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
            const pixels = new Uint8Array([0, 0, 255, 255, 255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255,]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

            let image = new Image()
            image.src = "./khronos_webgl.png"
            image.addEventListener('load', () => {
                gl.bindTexture(gl.TEXTURE_2D, this.texture)
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
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
                1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
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
            ]


            this.textureCoords = newGLBuffer(gl, new Float32Array(textureCoords))
            gl.generateMipmap(gl.TEXTURE_2D)
        }
    }


    /**
     * @param {MyWebGLContext} gl
     * @param {Locations} locations
     * @param {Shape} shape
     */
    render(gl, locations, shape) {
        shape.setPositionAttribute(gl, locations.attribute);
        // shape.setColorAttribute(gl, locations);
        shape.setNormalAttribute(gl, locations.attribute);
        this.setTextureAttribute(gl, locations.attribute)
        gl.bindBuffer(gl.ARRAY_BUFFER, shape.normalBuffer);
        if (shape.indexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, shape.positionBuffer);
        }
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.uniform1i(locations.uniform.uSampler, 0)

        if (shape.indexBuffer) {
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            throw 'dead code'
            gl.drawElements(gl.TRIANGLE_STRIP, shape.vertexCount, type, offset);
        } else {
            gl.drawArrays(shape.drawMode, 0, shape.vertexCount);
        }
    }


    /**
     *
     * @param gl {MyWebGLContext}
     * @param locations {AttributeLocations}
     */
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
        // gl.enableVertexAttribArray(locations.textureCoord);
    }
}


class Shape {
    positionBuffer;
    normalBuffer;
    indexBuffer;
    colorBuffer;
    vertexCount = 0;
    drawMode = WebGLRenderingContext.TRIANGLES

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
}

export class Plane extends Shape {
    vertexCount = 6;

    /** @type {WebGLBuffer} */

    /**
     * @param {MyWebGLContext} gl
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

    }
}

// An object based on a Shape and a Material
class Mesh extends Object3d {
    /**
     * @param {Shape} shape
     * @param {Material} material
     */
    constructor(shape, material) {
        super();
        this.shape = shape;
        this.material = material
    }

    render(gl, locations) {
        this.material.render(gl, locations, this.shape)
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
     * @param {MyWebGLContext} ctx
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
     
      vec3 lightColor = vec3(.3, 0, 0);
      float lightIntensity = dot(v_normal, surfaceToLightDirection);
      vec3 diffuse = lightColor * lightIntensity;
      float ambient = 0.2;
      vec3 specular = pow(max(dot(reflectionDir, cameraDir), 0.0), 100.0) * lightColor.rgb;
      
      outColor = vec4(vColor.rgb * (ambient + diffuse + specular), vColor.a);
      // outColor = vec4(vPosition.xyz*.8+vec3(.2, .2, .2), 1);
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

        window['mat4'] = mat4
        mat4.translate(modelViewMatrix, modelViewMatrix, camera.position.xyz);
        // mat4.fromRotationTranslation(modelViewMatrix, camera.quaternion, camera.position.xyz)


        // setPositionAttribute(gl, buffers, programInfo)
        // setColorAttribute(gl, buffers, programInfo)
        // setNormalAttribute(gl, buffers, programInfo);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.color)
        // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal)


        gl.useProgram(this.program);


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

            mat4.scale(newModelViewMatrix, newModelViewMatrix, vec3.fromValues(obj.scale.x, obj.scale.y, obj.scale.z))

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
                ...camera.position.xyz,
            );

            obj.render(gl, this.locations);
        }
    }


    /**
     *
     * @returns {Locations}
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
            cameraPos: this.gl.getUniformLocation(this.program, "uCameraPos"),
            lightPosition: [
                this.gl.getUniformLocation(this.program, "uLightWorldPosition")
            ],
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
    camera.position = new Vector3(0, 0, -3.6);

    let directionalLight = new DirectionalLight();
    directionalLight.position = new Vector3(1, 1, 1);
    scene.setLight(directionalLight);

    let plane = new Plane(ctx, 1, 1, new Vector3(1, 0, 0));
    let plane2 = new Plane(ctx, 2, 1, new Vector3(0, 1, 1));
    // let redMaterial = new ColorMaterial(1, 0, 0, 1);
    let texture = new TextureMaterial(ctx)
    let mesh1 = new Mesh(plane, texture);
    let mesh2 = new Mesh(plane2, texture);
    // scene.add(mesh1);
    // scene.add(mesh2);
    let plane3 = new Plane(ctx, 1, 1, new Vector3(1, 0, 0));
    let plane4 = new Plane(ctx, 2, 1, new Vector3(0, 1, 1));
    // let redMaterial = new ColorMaterial(1, 0, 0, 1);
    // let mesh3 = new Mesh(plane3);
    let mesh4 = new Mesh(plane4, texture);
    // scene.add(mesh3);
    // scene.add(mesh4);

    let weirdPolygon = class extends Shape {
        #drawKind = 0
        set drawKind(val) {
            this.#drawKind = val
            if (this.#drawKind === 0) {
                this.drawMode = WebGL2RenderingContext.TRIANGLES
            } else if (this.#drawKind === 1) {
                this.drawMode = WebGL2RenderingContext.TRIANGLE_STRIP
            } else if (this.#drawKind === 2) {
                this.drawMode = WebGL2RenderingContext.TRIANGLE_FAN
            }
        }
        constructor(gl) {
            super();
            this.vertexCount = 6
            this.positionBuffer = newGLBuffer(gl, new Float32Array([0, .5, 0, 1, .5, 0, .5, 1, 0, .5, 0, 0, 0, -1, 0, -.5, 0, 0]))
            this.colorBuffer = newGLBuffer(gl, new Uint8Array(_.range(6).map(() => [1, 0, 0]).flat()))
            this.normalBuffer = newGLBuffer(gl, new Float32Array(_.range(6).map(() => [1, 0, 0]).flat()))
        }
    }

    let pileOfPoints = new Mesh(new weirdPolygon(ctx), texture)
    window['pileOfPoints']=pileOfPoints
    pileOfPoints.shape.drawMode = ctx.TRIANGLES
    pileOfPoints.scale = new Vector3(2, 1.5, 1)
    scene.add(pileOfPoints)

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
    // quat.rotateX(mesh3.quaternion, mesh3.quaternion, -Math.PI / 4);
    // mesh3.position.y += 2;
    mesh4.position.x = 0;
    mesh4.position.y = 0;
    mesh4.position.z = 6;
    // quat.rotateY(mesh4.quaternion, mesh4.quaternion, -Math.PI / 4);
    window.camera = camera

    let inputs = {}

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
        directionalLight.position.y = Math.cos(rot * 1 + Math.PI) * 4 + 3
        directionalLight.position.x = Math.cos(rot * 1 + Math.PI) * 4 + 4
        mesh4.position.z = directionalLight.position.z
        mesh4.position.x = directionalLight.position.x
        mesh4.position.y = directionalLight.position.y
        // directionalLight.position.y = Math.cos(rot*1 + Math.PI)*4

        // directionalLight.position.z = 10.85;
        // directionalLight.position.x = -10
        // directionalLight.position.y = -10
        // quat.rotateX(directionalLight.quaternion, directionalLight.quaternion, 0.1)

        // camera.position.y = Math.sin(rot+ Math.PI)
        // camera.position.z = Math.cos(rot+ Math.PI) + -6

        if (inputs["w"]) {
            camera.position.z += .01
        }
        if (inputs["s"]) {
            camera.position.z -= .01
        }
        if (inputs["a"]) {
            camera.position.x += .01
        }
        if (inputs["d"]) {
            camera.position.x -= .01
        }
        if (inputs["z"]) {
            camera.position.y += .01
        }
        if (inputs["c"]) {
            camera.position.y -= .01
        }
        if (inputs["r"]) {
            quat.rotateX(camera.quaternion, camera.quaternion, .1)
        }
        if (inputs["f"]) {
            quat.rotateX(camera.quaternion, camera.quaternion, -.1)
        }
        if (inputs["q"]) {
            quat.rotateY(camera.quaternion, camera.quaternion, .1)
        }
        if (inputs["e"]) {
            quat.rotateY(camera.quaternion, camera.quaternion, -.1)
        }

        renderer.render(camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
    if (window.location.search.endsWith("?debug")) {
        var SPECTOR = new spector.Spector();
        SPECTOR.displayUI();
    }

    document.addEventListener('keydown', ev => {
        inputs[ev.key] = true
    })
    document.addEventListener('keyup', ev => {
        inputs[ev.key] = false
    })


    let selectNode;
    $("#ui-root").appendChild(h("div.ui", [
        h("label{Draw Mode}", { for: 'drawMode' }),
        h('br'),
        selectNode = h("select#drawMode", {
            id: 'drawMode',
            onclick: (e) => {
                pileOfPoints.shape.drawKind = selectNode.selectedIndex
            }
        }, [
            h("option{Triangles}", { value: "triangles" }),
            h("option{Triangle Strip}", { value: "strip" }),
            h("option{Triangle Fan}", { value: "fan" }),
        ])
    ]))
}

go();
