import { $, _, h } from "./libjackson.js";
import { newGLBuffer } from "./glutils.js";
// Debugging
// import "https://esm.sh/webgl-lint@1.10.1";
// import spector from "https://esm.sh/spectorjs@latest";

const insertNode = (i, x, y, last) => {
    const p = { i, x, y }
    if (!last) {
        p.prev = p
        p.next = p
    } else {
        p.next = last.next
        p.prev = last
        last.next.prev = p
        last.next = p
    }
    return p
}

const removeNode = p => {
    p.next.prev = p.prev
    p.prev.next = p.next
}

function signedArea(data, start, end) {
    var sum = 0;
    for (var i = start, j = end - 2; i < end; i += 2) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }
    return sum;
}

const linkedList = data => {
    let i, last

    if (signedArea(data, 0, data.length) > 0) {
        for (i = 0; i < data.length; i += 2) {
            last = insertNode(i / 2, data[i], data[i + 1], last)
        }
    } else {
        for (i = data.length - 2; i >= 0; i -= 2) {
            last = insertNode(i / 2, data[i], data[i + 1], last)
        }
    }

    return last
}

const isInTriangle = (a, b, c, p) =>
    (c.x - p.x) * (a.y - p.y) - (a.x - p.x) * (c.y - p.y) >= 0 &&
    (a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y) >= 0 &&
    (b.x - p.x) * (c.y - p.y) - (c.x - p.x) * (b.y - p.y) >= 0
const area = (a, b, c) => (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)

const isEar = ear => {
    const a = ear.prev,
        b = ear,
        c = ear.next

    let area1 = area(a, b, c);
    if (area1 >= 0) return false


    let p = ear.next.next

    while (p !== ear.prev) {
        const inTriangle = isInTriangle(a, b, c, p)
        if (inTriangle && area(p.prev, p, p.next) >= 0) return false
        p = p.next
    }
    return true
}

const earcut = ear => {
    const triangles = []
    let next = ear.next,
        prev = ear.prev,
        stop = ear

    while (prev !== next) {
        prev = ear.prev
        next = ear.next

        if (isEar(ear)) {
            triangles.push(prev.i, ear.i, next.i)
            removeNode(ear)
            ear = next
            stop = next
            continue
        }

        ear = next
        if (ear === stop) {
            throw new Error('triangulation failed')
        }
    }
    return triangles
}

/**
 * @typedef MyWebGLContext {WebGL2RenderingContext WebGLRenderingContext}
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

export class Shape {
    vertexCount = 0;
    data = []

    /** @type {WebGLBuffer} */

    /**
     * @param {MyWebGLContext} gl
     * @param color {Vector3}
     */
    constructor(gl, data, fill = true) {
        this.fill = fill
        this.gl = gl;
        this.data = data ?? []
        // let points = earcut(linkedList(this.data)).flatMap(i => [this.data[2 * i], this.data[2 * i + 1], 0])
        // this.vertexCount = points.length / 3
        this.positionBuffer = newGLBuffer(gl, new Float32Array(data ?? []));
        this.vertexCount = data?.length / 3 ?? 0

        // let colors = [];
        // for (let i = 0; i < this.vertexCount; i++) {
        //     colors = colors.concat(...color.xyz, 1);
        // }

        // this.colorBuffer = newGLBuffer(gl, new Float32Array(colors));

    }

    #triangulate() {
        let points
        if (this.fill) {

            points = earcut(linkedList(this.data)).flatMap(i => [this.data[2 * i], this.data[2 * i + 1], 0])
        } else {
            points = _.chunk(this.data, 2).flatMap((([x, y]) => [x, y, 0]))
        }
        this.vertexCount = points.length / 3
        this.gl.deleteBuffer(this.positionBuffer)
        this.positionBuffer = newGLBuffer(this.gl, new Float32Array(points))

    }

    addPoint(x, y) {
        this.data.push(x, y)
        this.#triangulate()
    }

    popPoint() {
        this.data.pop()
        this.#triangulate()
    }

    setPoints(data) {
        this.data = data
        this.#triangulate()
    }

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
}


export class Line extends Shape {
    constructor(gl, p1, p2) {
        super(gl, Line.#makePoints(p1, p2), false)
        this.p1 = p1
        this.p2 = p2
        this.vertexCount = 3
    }

    static #makePoints(p1, p2) {
        let [x1, y1] = p1
        let [x2, y2] = p2
        return [
            x1, y1, 0,
            x2, y2, 0,
            x1, y1, 0,
        ]
    }

    setP2(p2) {
        this.data = Line.#makePoints(this.p1, p2)
        this.p2 = p2
        this.#updateAttrs()
    }


    #updateAttrs() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(this.data), 0)
    }
}

export class Box extends Shape {
    constructor(gl, p1, p2, fill = true) {
        super(gl, Box.#makePoints(p1, p2, fill), fill)
        this.p1 = p1
        this.p2 = p2
    }

    static #makePoints(p1, p2, fill) {
        let [x1, y1] = p1
        let [x2, y2] = p2
        if (fill) {
            return [
                x1, y1, 0,
                x2, y1, 0,
                x2, y2, 0,

                x1, y1, 0,
                x2, y2, 0,
                x1, y2, 0,
            ]
        } else {
            return [
                x1, y1, 0,
                x2, y1, 0,
                x2, y2, 0,
                x1, y2, 0,
            ]
        }
    }

    setP2(p2) {
        this.data = Box.#makePoints(this.p1, p2, this.fill)
        this.p2 = p2
        this.#updateAttrs()
    }


    #updateAttrs() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(this.data), 0)
    }
}


export class Triangle extends Shape {
    constructor(gl, p1, p2, p3, fill) {
        super(gl, Triangle.#makePoints(p1, p2, p3), fill)
        this.p1 = p1
        this.p2 = p2
        this.p3 = p3
        this.vertexCount = 3
    }

    static #makePoints(p1, p2, p3) {
        let [x1, y1] = p1
        let [x2, y2] = p2
        let [x3, y3] = p3
        return [
            x1, y1, 0,
            x2, y2, 0,
            x3, y3, 0,
        ]
    }

    setP2(p2) {
        this.data = Triangle.#makePoints(this.p1, p2, this.p3)
        this.p2 = p2
        this.#updateAttrs()
    }

    setP3(p3) {
        this.data = Triangle.#makePoints(this.p1, this.p2, p3)
        this.p3 = p3
        this.#updateAttrs()
    }


    #updateAttrs() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(this.data), 0)
    }
}

export class Circle extends Shape {
    constructor(gl, center, r, fill) {
        super(gl, Circle.#makePoints(center, r, fill), fill)
        this.center = center
        this.r = r
        this.vertexCount = this.data.length / 3
    }

    static #makePoints(center, r, fill) {
        let [x, y] = center
        if (r === 0) {
            return []
        }
        let count = 36
        let perimiter = _.range(0, count).flatMap(i => [
            r * Math.cos(i / count * Math.PI * 2) + x,
            r * Math.sin(i / count * Math.PI * 2) + y
        ])

        if (!fill) { return _.chunk(perimiter, 2).flatMap(([x, y]) => [x, y, 0]) }

        let points = earcut(linkedList(perimiter)).flatMap(i => [perimiter[2 * i], perimiter[2 * i + 1], 0])

        return points
    }

    setR(r) {
        this.data = Circle.#makePoints(this.center, r, this.fill)
        this.r = r
        this.#updateAttrs()
    }


    #updateAttrs() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        // console.log("current sisze", this.gl.getBufferParameter(this.gl.ARRAY_BUFFER, this.gl.BUFFER_SIZE))
        if (this.gl.getBufferParameter(this.gl.ARRAY_BUFFER, this.gl.BUFFER_SIZE) === this.data) {
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(this.data), 0)
        } else {
            this.gl.deleteBuffer(this.positionBuffer)
            this.positionBuffer = newGLBuffer(this.gl, new Float32Array(this.data))
        }
    }
}


// An object based on a Shape and a Material
class Mesh {
    /**
     * @param {Shape} shape
     */
    constructor(shape, color, fill = true) {
        this.shape = shape;
        this.color = color
    }


    /**
     * @param gl {WebGL2RenderingContext}
     */
    render(gl, locations, wireframe) {
        let shape = this.shape
        shape.setPositionAttribute(gl, locations.attribute);
        // shape.setColorAttribute(gl, locations);
        gl.bindBuffer(gl.ARRAY_BUFFER, shape.positionBuffer);

        gl.uniform4f(locations.uniform.color, this.color.x, this.color.y, this.color.z, 1)

        // gl.drawElements(gl.TRIANGLE_STRIP, shape.vertexCount, gl.UNSIGNED_SHORT, 0);

        if (shape.vertexCount === 0) {
            return
        }

        if (shape.fill) {
            gl.uniform1i(locations.uniform.debug, 0)
            gl.drawArrays(gl.TRIANGLES, 0, shape.vertexCount);
            if (wireframe) {

                gl.uniform1i(locations.uniform.debug, 1)
                gl.drawArrays(gl.LINE_LOOP, 0, shape.vertexCount);
            }
        } else {
            gl.uniform1i(locations.uniform.debug, 0)
            gl.drawArrays(gl.LINE_LOOP, 0, shape.vertexCount);
        }
        // gl.drawArrays(gl.LINES, 0, shape.vertexCount);


    }
}

export class Scene {
    objects = [];

    /**
     * @param obj {Object3d}
     */
    add(obj) {
        this.objects.push(obj);
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
        

        out vec4 vPosition;

        void main() {
            gl_Position = aVertexPosition;
            vPosition = gl_Position;
        //    vColor = aVertexColor;
        }
    `.trim();
    }

    #createFragmentShaderSource(_scene) {
        return `
    #version 300 es
    precision mediump float;

    float scale(float x, float inMin, float inMax, float outMin, float outMax) {
        return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    out vec4 outColor;
    
        uniform bool uDebug;
        uniform vec4 uColor;

    in vec4 vPosition;

    void main() {
    if (uDebug) {
        outColor = vec4(1, 0,0,1);
    } else {
    //   outColor = vec4(scale(vPosition.x, -1.0, 1.0, 0.0, 1.0), scale(vPosition.y, -1.0, 1.0, 0.0, 1.0), scale(vPosition.z, -1.0, 1.0, 0.0, 1.0), 1.0);
    outColor= uColor;
      }
   
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

    render(wireframe) {
        let gl = this.gl;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.program);

        for (let obj of this.scene.objects) {
            obj.render(gl, this.locations, wireframe);
        }
    }


    /**
     *
     * @returns {Locations}
     */
    #getLocations() {
        let attribute = {
            vertexPosition: this.gl.getAttribLocation(this.program, "aVertexPosition"),
        };
        let uniform = {
            color: this.gl.getUniformLocation(this.program, "uColor"),
            debug: this.gl.getUniformLocation(this.program, "uDebug"),
        };

        return {
            uniform,
            attribute
        };
    }
}

class Tool {
    constructor(gl, scene, appState) {
        this.gl = gl
        this.scene = scene
        this.appState = appState
    }

    get color() {
        return this.appState.currentColor
    }

    click(x, y) { return true }
    move(x, y) { }
    contextmenu(x, y, e) { }
}

class BoxTool extends Tool {
    p1
    p2
    tmpBox = null
    mesh = null
    click(x, y) {
        if (!this.p1) {
            this.p1 = [x, y]
            this.tmpBox = new Box(this.gl, this.p1, this.p1, this.appState.fill)
            this.mesh = new Mesh(this.tmpBox, this.color)
            this.scene.add(this.mesh)
            console.log("point 1, rendered")
            return false
        } else if (this.p1 && !this.p2) {
            this.p2 = [x, y]
            this.tmpBox.setP2(this.p2)
            console.log("point 2, rendered, done")
            return true
        }
    }

    move(x, y) {
        if (this.p1 && !this.p2) {
            this.tmpBox.setP2([x, y])
        }
    }

}

class LineTool extends Tool {
    p1
    p2
    tmp = null
    mesh = null
    click(x, y) {
        if (!this.p1) {
            this.p1 = [x, y]
            this.tmp = new Line(this.gl, this.p1, this.p1)
            this.mesh = new Mesh(this.tmp, this.color)
            this.scene.add(this.mesh)
            console.log("point 1, rendered")
            return false
        } else if (this.p1 && !this.p2) {
            this.p2 = [x, y]
            this.tmp.setP2(this.p2)
            console.log("point 2, rendered, done")
            return true
        }
    }

    move(x, y) {
        if (this.p1 && !this.p2) {
            this.tmp.setP2([x, y])
        }
    }

}


class TriangleTool extends Tool {
    p1
    p2
    p3
    tmp = null
    mesh = null
    click(x, y) {
        if (!this.p1) {
            this.p1 = [x, y]
            this.tmp = new Triangle(this.gl, this.p1, this.p1, this.p1, this.appState.fill)
            this.mesh = new Mesh(this.tmp, this.color)
            this.scene.add(this.mesh)
            console.log("point 1, rendered")
            return false
        } else if (!this.p2 && !this.p3) {
            this.p2 = [x, y]
            this.tmp.setP2(this.p2)
            console.log("point 2, rendered")
            return false
        } else if (!this.p3) {
            this.p3 = [x, y]
            this.tmp.setP3(this.p3)
            console.log("point 3, rendered, done")
            return true
        }
    }

    move(x, y) {
        if (this.p1 && !this.p2 && !this.p3) {
            this.tmp.setP2([x, y])
        } else if (this.p1 && this.p2 && !this.p3) {
            this.tmp.setP3([x, y])
        }
    }

}


class NGonTool extends Tool {
    points = []
    cursor = null
    constructor(gl, scene, appState) {
        super(gl, scene, appState)
    }

    click(x, y) {
        if (!this.tmp) {
            this.tmp = new Shape(this.gl, [], this.appState.fill)
            this.mesh = new Mesh(this.tmp, this.color)
            this.scene.add(this.mesh)
        }
        this.points.push([x, y])
        this.tmp.setPoints(this.points.flat())
        return false
    }

    move(x, y) {
        this.tmp.setPoints([...this.points.flat(), x, y])
    }

    contextmenu(x, y, e) {
        e.preventDefault()
        this.tmp.setPoints(this.points.flat())
        return true
    }
}

class CircleTool extends Tool {
    p1
    tmp = null
    mesh = null
    click(x, y) {
        if (!this.p1) {
            this.p1 = [x, y]
            this.tmp = new Circle(this.gl, this.p1, 0.1, this.appState.fill)
            this.mesh = new Mesh(this.tmp, this.color)
            this.scene.add(this.mesh)
            console.log("point 1, rendered")
            return false
        } else if (this.p1 && !this.p2) {
            this.p2 = [x, y]
            this.tmp.setR(_.manhattan(this.p1, [x, y]))
            console.log("point 2, rendered, done")
            return true
        }
    }

    move(x, y) {
        if (this.p1 && !this.p2) {
            this.tmp.setR(_.manhattan(this.p1, [x, y]))
        }
    }
}


function go() {
    /** @type {HTMLCanvasElement} */
    let canvas = $("canvas");
    let ctx = canvas.getContext("webgl2");

    let appState = {
        currentColor: new Vector3(0, 0, 1),
        lastPoint: null,
        fill: true,
        debug: false,
    }
    let scene = new Scene();


    appState.currentTool = new BoxTool(ctx, scene, appState)

    let renderer = new Renderer(scene, ctx);
    // renderer.render(wireframe);
    window["r"] = renderer;
    window["s"] = scene;
    let then = 0;
    let rot = 0;

    let inputs = {}

    function render(now) {
        now *= 0.001;
        let deltaTime = now - then;
        then = now;

        rot += deltaTime;

        renderer.render(appState.debug);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
    if (window.location.search.endsWith("?debug")) {
        var SPECTOR = new spector.Spector();
        SPECTOR.displayUI();
    }

    document.addEventListener('keydown', ev => {
        let key = ev.key;
        if (key === "q") {
            setCurrentTool("box")
        } else if (key === "w") {
            setCurrentTool("line")
        } else if (key === "e") {
            setCurrentTool("circle")
        } else if (key === "r") {
            setCurrentTool("triangle")
        } else if (key === "t") {
            setCurrentTool("ngon")
        }
        renderUi()
        inputs[key] = true
    })
    document.addEventListener('keyup', ev => {
        inputs[ev.key] = false
    })


    function getCursorPosition(canvas, event) {
        let b = canvas.getBoundingClientRect()
        let scale = canvas.width / b.width
        let x = (event.clientX - b.left) * scale
        let y = (event.clientY - b.top) * scale
        x = _.scale(x, 0, 640, -1, 1)
        y = _.scale(y, 0, 480, 1, -1)
        return [x, y]
    }

    canvas.addEventListener('contextmenu', (e) => {
        let [x, y] = getCursorPosition(canvas, e)
        let v = appState.currentTool.contextmenu(x, y, e)
        if (v) {
            console.log("tool complete")
            appState.currentTool = new appState.currentTool.constructor(ctx, scene, appState)
        }
    })

    canvas.addEventListener('mousemove', (e) => {
        appState.currentTool.move(...getCursorPosition(canvas, e))
    })

    canvas.addEventListener('click', (e) => {
        let [x, y] = getCursorPosition(canvas, e)
        let screen = [x, y]
        console.log(screen)

        let v = appState.currentTool.click(x, y, e)
        if (v) {
            console.log("tool complete")
            appState.currentTool = new appState.currentTool.constructor(ctx, scene, appState)
        }
    })

    let toolMap = {
        "box": () => new BoxTool(ctx, scene, appState),
        "line": () => new LineTool(ctx, scene, appState),
        "circle": () => new CircleTool(ctx, scene, appState),
        "triangle": () => new TriangleTool(ctx, scene, appState),
        "ngon": () => new NGonTool(ctx, scene, appState),
    }

    function setCurrentTool(name) {
        appState.currentTool = (toolMap[name])()
        appState.currentTool.name = name
    }

    function vecToHtml(vec) {
        return `#${(vec.x * 255).toString(16).padStart(2, "0")}${(vec.y * 255).toString(16).padStart(2, "0")}${(vec.z * 255).toString(16).padStart(2, "0")}`
    }

    let colorNode;
    let renderUi = () => {
        let makeTool = (title, value) => {
            return h(`option{${title}}`, { value, $selected: appState.currentTool.name === value })
        }
        $("#ui-root").replaceWith(h("div.ui#ui-root", [
            h("label{Shape}", { for: 'shape' }),
            h("select#shape", {
                onchange: (e) => {
                    setCurrentTool(e.target.options[e.target.selectedIndex].attributes.value.value)
                }
            }, [
                makeTool("Box (q)", "box"),
                makeTool("Line (w)", "line"),
                makeTool("Circle (e)", "circle"),
                makeTool("Triangle (r)", "triangle"),
                makeTool("N-gon (t)", "ngon"),
            ]),
            h('br'),
            h("label{Fill}", { for: 'fill' }),
            h("input#fill", {
                type: "checkbox", $checked: true, oninput: (e) => {
                    appState.fill = e.target.checked
                }
            }),
            h("label{Color}", { for: 'color' }),
            colorNode = h("input#color", {
                type: "color", value: vecToHtml(appState.currentColor), oninput: (e) => {
                    appState.currentColor = new Vector3(..._.chunk(colorNode.value.substring(1), 2).map(p => parseInt(p, 16) / 255))
                }
            }),
            h("label{Wireframe}", { for: 'debug' }),
            h("input#debug", {
                type: "checkbox", $checked: appState.debug, oninput: (e) => {
                    appState.debug = e.target.checked
                }
            }),
        ]))
    }
    renderUi()
}

go();
