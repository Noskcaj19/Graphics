import {$, _, h} from "./libjackson.js";
// import { newGLBuffer } from "./glutils.ts";
import {newGLBuffer, quat, mat4, vec3} from "./glutils.js";
// import { glMatrix, mat4, quat, vec3 } from "https://esm.sh/v104/gl-matrix@3.4.3/es2022/gl-matrix.development.js";
import "https://esm.sh/webgl-lint@1.10.1";

// import spector from "https://esm.sh/spectorjs@latest";


class Vector3 {
    x = 0.0;
    y = 0.0;
    z = 0.0;

    constructor(x?: number, y?: number, z?: number) {
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.z = z ?? 0;
    }

    get xyz(): [number, number, number] {
        return [this.x, this.y, this.z];
    }
}


class Object3d {
    position = new Vector3();
    quaternion: quat = quat.create();
    scale = new Vector3(1, 1, 1);

    render(gl: WebGL2RenderingContext, locations) {
        throw `No implementation of render for type ${this.constructor.name}`;
    }
}

class Camera extends Object3d {
    // Magic
}

class DirectionalLight extends Object3d {
    // Magic
}
class Shader {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;

    constructor(gl:WebGL2RenderingContext) {
        this.gl = gl

    }

    getVertexShaderSrc() {
        return `
        #version 300 es

        const bool useTex = false;
        in vec4 aVertexPosition;
        in vec2 aTextureCoord;
        in vec3 aVertexNormal;
        
        uniform vec4 aVertexColor;

        uniform mat4 uProjectionMatrix;
        uniform mat4 uModelViewMatrix;
        // TODO: Rename
        uniform mat4 uNormalMatrix;
        uniform vec3 uCameraPos;
        uniform vec3 uLightWorldPosition;
        
        out vec4 vPosition;
        out vec3 cameraPos;

        out highp vec2 vTextureCoord;
        out vec3 vNormal;
        out vec3 vSurfaceToLight;
        out vec3 vLightPosition;

        out lowp vec4 vColor;


        void main() {
            cameraPos = uCameraPos;
            // gl_Position = aVertexPosition;
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vPosition = gl_Position;

            vLightPosition = uLightWorldPosition;
            vec3 surfaceWorldPosition = (uModelViewMatrix * aVertexPosition).xyz;
            vSurfaceToLight = uLightWorldPosition - surfaceWorldPosition;
            highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
            vNormal = transformedNormal.xyz;
            

            vColor = aVertexColor;
            vTextureCoord = aTextureCoord;
        }
    `.trim();
    }

    getFragmentShaderSrc() {
        return `
    #version 300 es
    precision mediump float;
     
    const bool useTex = false;  
     
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
   
      vec3 normal = normalize(vNormal);
      vec3 cameraDir = normalize(cameraPos - vPosition.xyz);
    
      vec3 surfaceToLightDirection = normalize(vSurfaceToLight);

      vec3 lightDirection = normalize(vLightPosition.xyz - vPosition.xyz);
      vec3 reflectionDir = reflect(-lightDirection, vNormal);
     
      vec3 lightColor = vec3(.3, .3, .3);
      float lightIntensity = dot(vNormal, surfaceToLightDirection);
      vec3 diffuse = lightColor * lightIntensity;
      float ambient = 0.2;
      vec3 specular = pow(max(dot(reflectionDir, cameraDir), 0.0), 100.0) * lightColor.rgb;
      
//      outColor = vec4(vColor.rgb * (ambient + diffuse + specular), vColor.a);
outColor = vColor;
      // outColor = vec4(vPosition.xyz*.8+vec3(.2, .2, .2), 1);
    }
    `.trim();
    }

    compileShaderProgram(vsSource:string, fsSource:string) {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource)!;
        const fragmentShader = this.loadShader( this.gl.FRAGMENT_SHADER, fsSource)!;

        const shaderProgram = this.gl.createProgram()!;
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            alert(`Failed to init shader program ${this.gl.getProgramInfoLog(shaderProgram)}`);
            return null;
        }

        return shaderProgram;
    }
    loadShader(type: GLenum, source: string) {
        const shader = this.gl.createShader(type);

        this.gl.shaderSource(shader!, source);
        this.gl.compileShader(shader!);

        if (!new GLAttributeDescriptor({gl: this.gl, name: this.gl.COMPILE_STATUS})) {
            alert(`Failed to compile shader: ${this.gl.getShaderInfoLog(shader!)}`);
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    render(shape: Geometry, props) {
        console.log(arguments)

        throw `No implementation of render for type ${this.constructor.name}`;
    }
}

class Material extends Shader {

}

interface HasContext {
    gl: WebGLRenderingContext
}


type StaticDraw = WebGL2RenderingContext["STATIC_DRAW"]

class Float32BufferAttribute {
    usage: WebGL2RenderingContext["STATIC_DRAW"]

}
class Float32Uniform {

}

class GLUniformDescriptor{
    gl: WebGL2RenderingContext
    type: UniformType
    name: string;

    location: GLUniformLocation | undefined

    constructor({gl, type, name}: {
        gl: WebGL2RenderingContext,
        type: UniformType
        name: string
    }) {
        this.gl = gl
        this.type = type
        this.name = name
    }

    getLocation(program: WebGLProgram): GLUniformLocation {
        if (!this.location) {
            this.location = new GLUniformLocation({
                gl: this.gl,
                type: this.type,
                program: program,
                name: this.name
            })
        }
        return this.location
    }
}

class GLAttributeDescriptor {
    gl: WebGL2RenderingContext
    width: number
    type: GLenum
    normalize: boolean
    stride: number
    offset: number
    name: string;

    location: GLAttributeLocation | undefined

    constructor({gl, width, type, normalize, stride, offset, name}: {
        gl: WebGL2RenderingContext,
        width: number,
        type?: GLenum,
        normalize?: boolean,
        stride?: number,
        offset?: number
        name: string
    }) {
        this.gl = gl
        this.type = type ?? gl.ARRAY_BUFFER
        this.width = width
        this.normalize = normalize ?? false
        this.stride = stride ?? 0
        this.offset = offset ?? 0
        this.name = name
    }

    getLocation(program: WebGLProgram): GLAttributeLocation {
        if (!this.location) {
            this.location = new GLAttributeLocation({
                gl: this.gl,
                width: this.width,
                type: this.type,
                offset: this.offset,
                program: program,
                name: this.name
            });
        }
        return this.location
    }
}

enum UniformType {
    Matrix4fv,
    Uniform3f,
}

class GLUniformLocation {
    gl: WebGL2RenderingContext
    location: WebGLUniformLocation
    type: UniformType

    constructor({gl, type, program, name}: {
        gl: WebGL2RenderingContext,
        type: GLenum,
        program: WebGLProgram
        name: string
    }) {
        this.gl = gl
        this.type = type
        this.location = gl.getUniformLocation(program, name)!
    }

    set(value: Float32Array) {
        if (this.type === UniformType.Matrix4fv) {
            this.gl.uniformMatrix4fv(this.location, false, value)
        } else {
            throw `Unimplemented type ${this.type}`
        }
    }
}

class GLAttributeLocation {
    gl: WebGL2RenderingContext
    location: number
    width: number
    type: GLenum
    normalize: boolean
    stride: number
    offset: number

    constructor({gl, width, type, normalize, stride, offset, program, name}: {
        gl: WebGL2RenderingContext,
        width: number,
        type?: GLenum,
        normalize?: boolean,
        stride?: number,
        offset?: number
        program: WebGLProgram
        name: string
    }) {
        this.gl = gl
        this.type = type ?? gl.ARRAY_BUFFER
        this.width = width
        this.normalize = normalize ?? false
        this.stride = stride ?? 0
        this.offset = offset ?? 0
        this.location = gl.getAttribLocation(program, name)!
    }

    bind(value: WebGLBuffer) {
        this.gl.bindBuffer(this.type, value)
        this.gl.vertexAttribPointer(this.location, this.width, this.type, this.normalize, this.stride, this.offset)
        this.gl.enableVertexAttribArray(this.location)
    }
}

class ColorMaterial extends Material {
    color: Vector3

    constructor(gl: WebGL2RenderingContext, color: Vector3, props) {
        super(gl);
        this.color = color

        props.uniforms["uColor"] = new GLAttributeDescriptor({
            gl,
            width: 4,
            name: "uColor"
        })
    }

}

class TextureMaterial extends Material {
    texture;
    textureCoords;

    constructor(gl: WebGL2RenderingContext) {
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


    render(locations, shape: Geometry) {
        let gl = this.gl
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
}


class Geometry {
    positionBuffer: Float32BufferAttribute
    normalBuffer:Float32BufferAttribute
    indexBuffer:Float32BufferAttribute

    // colorBuffer:WebGLBuffer
    vertexCount = 0;
    drawMode = WebGLRenderingContext.TRIANGLES

    bindProperties(locations) {
        locations.attributes.aVertexPosition.bind(this.positionBuffer)
        locations.attributes.aNormalBuiffer.bind(this.normalBuffer)
        locations.attributes.aIndexBuffer.set(this.indexBuffer)
    }
}

export class Plane extends Geometry {
    vertexCount = 6;

    /** @type {WebGLBuffer} */

    /**
     * @param {MyWebGLContext} gl
     * @param width {number}
     * @param height {number}
     * @param color {Vector3}
     */
    constructor(gl:WebGL2RenderingContext, width:number, height:number) {
        super();
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
    }
}

// An object based on a Geometry and a Material
class Mesh extends Object3d {
    shape: Geometry
    material: Material

    constructor(shape: Geometry, material: Material) {
        super();
        this.shape = shape;
        this.material = material
    }

    render(gl, props) {
        this.material.render(locations, this.shape)
    }

}

export class Scene {
    objects: Object3d[] = [];
    light?: DirectionalLight;

    add(obj: Object3d) {
        this.objects.push(obj);
    }

    /**
     * @param {DirectionalLight} light
     */
    setLight(light: DirectionalLight) {
        this.light = light;
    }
}

export class Renderer {
    gl: WebGL2RenderingContext;
    scene: Scene;
    locations: { uniform: { [key: string]: GLUniformDescriptor | GLUniformDescriptor[] }, attribute: { [key: string]: GLAttributeDescriptor } };

    constructor(scene: Scene, ctx: WebGL2RenderingContext) {
        this.scene = scene;
        this.gl = ctx;

        this.locations = this.#getLocationRefs();

    }

    render(camera: Camera) {
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

            // gl.uniformMatrix4fv(
            //     this.locations.uniform.projectionMatrix,
            //     false,
            //     projectionMatrix
            // );
            // gl.uniformMatrix4fv(
            //     this.locations.uniform.modelViewMatrix,
            //     false,
            //     newModelViewMatrix
            // );
            // gl.uniformMatrix4fv(
            //     this.locations.uniform.normalMatrix,
            //     false,
            //     normalMatrix
            // );
            // gl.uniform3f(
            //     this.locations.uniform.lightPosition[0],
            //     ...this.scene.light.position.xyz
            // );
            // gl.uniform3f(
            //     this.locations.uniform.cameraPos,
            //     ...camera.position.xyz,
            // );

            let props = {
                uniform: {
                    projectionMatrix,
                    modelViewMatrix,
                    normalMatrix,
                    lightPosition: this.scene.light?.position,
                    cameraPos: camera.position,
                }
            }
            obj.render(gl, this.locations);
        }
    }


    #getLocationRefs() {
        let attribute = {
            vertexPosition: new GLAttributeDescriptor({gl: this.gl, name: "aVertexPosition", width: 3}),
            vertexNormal: new GLAttributeDescriptor({gl: this.gl, name: "aVertexNormal", width: 3}),
            textureCoord: new GLAttributeDescriptor({gl: this.gl, name: "aTextureCoord", width: 2}),
            // vertexColor: new GLAttributeDescriptor({gl: this.gl, name: "aVertexColor"})
        };
        let uniform = {
            modelViewMatrix: new GLUniformDescriptor({gl: this.gl, name: "uModelViewMatrix"}),
            uSampler: new GLUniformDescriptor({gl: this.gl, name: "uSampler"}),
            normalMatrix: new GLUniformDescriptor({gl: this.gl, name: "uNormalMatrix"}),
            cameraPos: new GLUniformDescriptor({gl: this.gl, name: "uCameraPos"}),
            lightPosition: [
                new GLUniformDescriptor({gl: this.gl, name: "uLightWorldPosition"})
            ],
            // lightDirection: [
            //   new GLUniformDescriptor({gl: this.gl, name: "uLight1Direction"}),
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
    let canvas = $("canvas") as HTMLCanvasElement;
    let gl = canvas.getContext("webgl2")!;

    let scene = new Scene();
    let camera = new Camera();
    camera.position = new Vector3(0, 0, -3.6);

    let directionalLight = new DirectionalLight();
    directionalLight.position = new Vector3(1, 1, 1);
    scene.setLight(directionalLight);

    let plane = new Plane(gl, 1, 1);
    let plane2 = new Plane(gl, 2, 1);
    // let texture = new TextureMaterial(gl)

    let attribute = {
        aVertexPosition: new GLAttributeDescriptor({gl: gl, name: "aVertexPosition", width: 3}),
        aVertexNormal: new GLAttributeDescriptor({gl: gl, name: "aVertexNormal", width: 3}),
        aVertexIndex: new GLAttributeDescriptor({gl: gl, name: "aVertexIndex", width: 3}),
        aTextureCoord: new GLAttributeDescriptor({gl: gl, name: "aTextureCoord", width: 2}),
        // vertexColor: new GLAttributeDescriptor({gl: this.gl, name: "aVertexColor"})
    };
    let uniform = {
        uModelViewMatrix: new GLUniformDescriptor({gl: gl,type:UniformType.Matrix4fv, name: "uModelViewMatrix"}),
        uSampler: new GLUniformDescriptor({gl: gl, type:UniformType.Matrix4fv, name: "uSampler"}),
        uNormalMatrix: new GLUniformDescriptor({gl: gl, type: UniformType.Matrix4fv, name: "uNormalMatrix"}),
        uCameraPos: new GLUniformDescriptor({gl: gl, type: UniformType.Uniform3f, name: "uCameraPos"}),
        uLightPosition:
            new GLUniformDescriptor({gl: gl,type: UniformType.Uniform3f, name: "uLightWorldPosition"})
        // ],
        // lightDirection: [
        //   new GLUniformDescriptor({gl: this.gl, name: "uLight1Direction"}),
        //   ],
    };


    let propertyDescriptors = {
        uniforms: uniform,
        attributes: attribute
    }

    let redMaterial = new ColorMaterial(gl, new Vector3(0, 0, 1), propertyDescriptors);
    redMaterial.program = redMaterial.compileShaderProgram(redMaterial.getVertexShaderSrc(), redMaterial.getFragmentShaderSrc())!
    // let vPos = props.uniforms.aVertexPosition.getLocation(redMaterial.program)
    // vPos.set(plane.positionBuffer)
    let mesh1 = new Mesh(plane, redMaterial);
    let mesh2 = new Mesh(plane2, redMaterial);
    scene.add(mesh1);
    scene.add(mesh2);
    // let plane3 = new Plane(gl, 1, 1, new Vector3(1, 0, 0));
    // let plane4 = new Plane(gl, 2, 1, new Vector3(0, 1, 1));
    // let mesh3 = new Mesh(plane3);
    // let mesh4 = new Mesh(plane, redMaterial);

    let propLocations = {
        uniforms:_.objectMap(propertyDescriptors.uniforms, (k) => {
            let [name, desc]= k
            console.log(name, desc);
            return [name, desc.getLocation(mesh1.material.program)]
        }),
        attributes:_.objectMap(propertyDescriptors.attributes, ([k,v]) => [k, v.getLocation(mesh1.material.program,)])
    }

    mesh1.shape.bindProperties(props)

    // let renderer = new Renderer(scene, gl);
    // renderer.render(camera);
    redMaterial.render(mesh1)
    return
    window["r"] = renderer;
    window["c"] = camera;
    window["s"] = scene;
    let then = 0;
    let rot = 0;

    quat.rotateX(mesh1.quaternion, mesh1.quaternion, Math.PI / 4);
    mesh1.position.y += 1;
    quat.rotateY(mesh2.quaternion, mesh2.quaternion, Math.PI / 4);
    // quat.rotateX(mesh3.quaternion, mesh3.quaternion, -Math.PI / 4);
    // mesh3.position.y += 2;
    // mesh4.position.x = 0;
    // mesh4.position.y = 0;
    // mesh4.position.z = 6;
    // quat.rotateY(mesh4.quaternion, mesh4.quaternion, -Math.PI / 4);
    window.camera = camera

    let inputs: { [key: string]: boolean } = {}

    function render(now: number) {
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
        // directionalLight.position.y = Math.cos(rot / 3 * 1 + Math.PI) * 4 + 3
        // directionalLight.position.x = Math.sin(rot / 3 * 1 + Math.PI) * 4 + 4
        // mesh4.position.z = directionalLight.position.z
        // mesh4.position.x = directionalLight.position.x
        // mesh4.position.y = directionalLight.position.y
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


    // let selectNode;
    // $("#ui-root")!.appendChild(h("div.ui", [
    //     h("label{Draw Mode}", {for: 'drawMode'}),
    //     h('br'),
    //     selectNode = h("select#drawMode", {
    //         id: 'drawMode',
    //         onclick: (e) => {
    //             pileOfPoints.shape.drawKind = selectNode.selectedIndex
    //         }
    //     }, [
    //         h("option{Triangles}", {value: "triangles"}),
    //         h("option{Triangle Strip}", {value: "strip"}),
    //         h("option{Triangle Fan}", {value: "fan"}),
    //     ])
    // ]))
}

go();
