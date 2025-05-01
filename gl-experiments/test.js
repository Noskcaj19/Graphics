import {initBuffers} from "./init-buffers.js";
import {drawScene} from "./draw-scene.js";

let cubeRotation = 0.0
let deltaTime = 0.0

main();

function main () {
    const canvas = $("canvas")
    /** @type {WebGLRenderingContext} */
    const gl = canvas.getContext("webgl2")
    if (gl === null) {
        alert(
            "Unable to initialize WebGL"
        )
        return
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec3 aVertexNormal;
        attribute vec4 aVertexColor;
        
        uniform mat4 uNormalMatrix;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        
        varying lowp vec4 vColor;

        varying highp vec3 vLighting;

        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

            vColor = aVertexColor;

            highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
            highp vec3 directionalLightColor = vec3(1, 1, 1);
            highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
      
            highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
      
            highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
            vLighting = ambientLight + (directionalLightColor * directional);
        }
    `
    const fsSource = `
    precision mediump float;
    varying lowp vec4 vColor; 
    varying highp vec3 vLighting;

    void main() {
        gl_FragColor = vColor * vec4(vLighting, 1);
    }
    `

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource)
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
            vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
        },
    }

    const buffers = initBuffers(gl)

    let then = 0
    function render(now) {
        now *= 0.001
        deltaTime = now - then
        then = now

        drawScene(gl, programInfo, buffers, cubeRotation)
        cubeRotation += deltaTime

        requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

    const shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Failed to init shader program ${gl.getProgramInfoLog(shaderProgram)}`)
        return null
    }

    return shaderProgram
}
function loadShader(gl, type, source) {
    const shader = gl.createShader(type)

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`Failed to compile shader ${gl.getShaderInfoLog(shader)}`)
        gl.deleteShader(shader)
        return null
    }
     return shader
}
