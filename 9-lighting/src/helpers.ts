// import {mat4, vec3} from "gl-matrix";
import {mat4, vec3} from "./glutils.js"

function setTranslationMat4(out: mat4, translation: vec3) {
    out[12] = translation[0]
    out[13] = translation[1]
    out[14] = translation[2]

    return out
}

export var mat4H = {setTranslationMat4}