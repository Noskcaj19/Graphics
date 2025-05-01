// import {newGLBuffer} from "./glutils.js";
// import { newGLBuffer, quat, mat4, vec3 } from "./glutils.js";
/// Debugging
// import * as matrix from "https://esm.sh/gl-matrix?dev";
//import "https://esm.sh/webgl-lint@1.10.1";
// import spector from "https://esm.sh/spectorjs@latest";

const jData = {
    "position": [2, 0, -1, 1, 0, 0, 0, 0, 0, 0, -0.5, 2.014176, 0.2, -0.5, 3.4, 1, -0.5, 0, -1.200238, 0, 1.976373, -0.529239, -0.5, 2.581218, -0.529239, 0, 2.581218, 2, 0, 0, 1, -0.5, 0, 1, 0, 0, -0.529239, 0, 2.581218, 0, -0.5, 2.014176, 0, 0, 2.014176, 0, 0, 0, -1, -0.5, 0, -1, 0, 0, 0, 0, 2.014176, 0, -0.5, 0, 0, 0, 0, -1.618253, 0, 1.989722, -1.200238, -0.5, 1.976373, -1.200238, 0, 1.976373, -2.036268, 0, 2.003071, -1.618253, -0.5, 1.989722, -1.618253, 0, 1.989722, 1, 0, 0, 1, -0.5, 2, 1, 0, 2, 1, 0, 2, 0.2, -0.5, 3.4, 0.2, 0, 3.4, -1, 0, -1, 2, -0.5, -1, 2, 0, -1, 0.2, 0, 3.4, -1.240225, -0.5, 3.4, -1.240225, 0, 3.4, 2, 0, -1, 2, -0.5, 0, 2, 0, 0, -1.240225, 0, 3.4, -2.036268, -0.5, 2.003071, -2.036268, 0, 2.003071, -1, 0, 0, -1, -0.5, -1, -1, 0, -1, -1, 0, 0, -1, 0, -1, 2, 0, -1, 2, 0, -1, 2, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 2, 0.2, 0, 3.4, 0.2, 0, 3.4, -1.240225, 0, 3.4, -2.036268, 0, 2.003071, -1.618253, 0, 1.989722, -1.200238, 0, 1.976373, -0.529239, 0, 2.581218, 0.2, 0, 3.4, -2.036268, 0, 2.003071, -1.618253, 0, 1.989722, 0.2, 0, 3.4, -1.618253, 0, 1.989722, -0.529239, 0, 2.581218, 0.2, 0, 3.4, -0.529239, 0, 2.581218, 0, 0, 2.014176, 1, 0, 0, 0.2, 0, 3.4, 0, 0, 2.014176, 0, 0, 0, -1, 0, 0, 2, 0, -1, 1, 0, 0, 0, 0, 2.014176, 0, 0, 0, 2, -0.5, -1, -1, -0.5, -1, -1, -0.5, 0, 2, -0.5, -1, -1, -0.5, 0, 0, -0.5, 0, 1, -0.5, 0, 2, -0.5, 0, 2, -0.5, -1, 0.2, -0.5, 3.4, 1, -0.5, 2, 1, -0.5, 0, -2.036268, -0.5, 2.003071, -1.240225, -0.5, 3.4, 0.2, -0.5, 3.4, -0.529239, -0.5, 2.581218, -1.200238, -0.5, 1.976373, -1.618253, -0.5, 1.989722, -1.618253, -0.5, 1.989722, -2.036268, -0.5, 2.003071, 0.2, -0.5, 3.4, 1, -0.5, 0, 2, -0.5, -1, 0, -0.5, 0, -0.529239, -0.5, 2.581218, -1.618253, -0.5, 1.989722, 0.2, -0.5, 3.4, 1, -0.5, 0, 0, -0.5, 0, 0, -0.5, 2.014176, 0, -0.5, 2.014176, -0.529239, -0.5, 2.581218, 0.2, -0.5, 3.4, -1.200238, 0, 1.976373, -1.200238, -0.5, 1.976373, -0.529239, -0.5, 2.581218, 2, 0, 0, 2, -0.5, 0, 1, -0.5, 0, -0.529239, 0, 2.581218, -0.529239, -0.5, 2.581218, 0, -0.5, 2.014176, 0, 0, 0, 0, -0.5, 0, -1, -0.5, 0, 0, 0, 2.014176, 0, -0.5, 2.014176, 0, -0.5, 0, -1.618253, 0, 1.989722, -1.618253, -0.5, 1.989722, -1.200238, -0.5, 1.976373, -2.036268, 0, 2.003071, -2.036268, -0.5, 2.003071, -1.618253, -0.5, 1.989722, 1, 0, 0, 1, -0.5, 0, 1, -0.5, 2, 1, 0, 2, 1, -0.5, 2, 0.2, -0.5, 3.4, -1, 0, -1, -1, -0.5, -1, 2, -0.5, -1, 0.2, 0, 3.4, 0.2, -0.5, 3.4, -1.240225, -0.5, 3.4, 2, 0, -1, 2, -0.5, -1, 2, -0.5, 0, -1.240225, 0, 3.4, -1.240225, -0.5, 3.4, -2.036268, -0.5, 2.003071, -1, 0, 0, -1, -0.5, 0, -1, -0.5, -1],
    "normal": [0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -0.6695, 0, 0.7428, -0.6695, 0, 0.7428, -0.6695, 0, 0.7428, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0.7311, 0, 0.6823, 0.7311, 0, 0.6823, 0.7311, 0, 0.6823, 0, 0, -1, 0, 0, -1, 0, 0, -1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0.0319, 0, 0.9995, 0.0319, 0, 0.9995, 0.0319, 0, 0.9995, 0.0319, 0, 0.9995, 0.0319, 0, 0.9995, 0.0319, 0, 0.9995, -1, 0, 0, -1, 0, 0, -1, 0, 0, -0.8682, 0, -0.4961, -0.8682, 0, -0.4961, -0.8682, 0, -0.4961, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0.8688, 0, -0.4951, 0.8688, 0, -0.4951, 0.8688, 0, -0.4951, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -0.6695, 0, 0.7428, -0.6695, 0, 0.7428, -0.6695, 0, 0.7428, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0.7311, 0, 0.6823, 0.7311, 0, 0.6823, 0.7311, 0, 0.6823, 0, 0, -1, 0, 0, -1, 0, 0, -1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0.0319, 0, 0.9995, 0.0319, 0, 0.9995, 0.0319, 0, 0.9995, 0.0319, 0, 0.9995, 0.0319, 0, 0.9995, 0.0319, 0, 0.9995, -1, 0, 0, -1, 0, 0, -1, 0, 0, -0.8682, 0, -0.4961, -0.8682, 0, -0.4961, -0.8682, 0, -0.4961, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0.8688, 0, -0.4951, 0.8688, 0, -0.4951, 0.8688, 0, -0.4951, 1, 0, 0, 1, 0, 0, 1, 0, 0]
}
const dData = {
    "position": [-1, 0, -1, 0.095376, 0, 4.904624, 0.095376, 0, 0.095376, 2, 0, -1, 0.095376, 0, 0.095376, 1.566376, 0, 0.095376, 1.969738, 0, 0.474079, 2, 0, -1, 1.566376, 0, 0.095376, 0.095376, 0, 4.904624, 2, 0, 6, 1.566376, 0, 4.904624, 2, 0, 6, 1.969738, 0, 4.525921, 1.566376, 0, 4.904624, 1.969738, 0, 4.525921, 3.065114, 0, 0, 1.969738, 0, 0.474079, 0.095376, 0.5, 4.904624, -1, 0.5, -1, 0.095376, 0.5, 0.095376, 0.095376, 0.5, 0.095376, 2, 0.5, -1, 1.566376, 0.5, 0.095376, 1.969738, 0.5, 0.474079, 2, 0.5, -1, 3.065114, 0.5, 0, 0.095376, 0.5, 4.904624, 2, 0.5, 6, -1, 0.5, 6, 1.969738, 0.5, 4.525921, 2, 0.5, 6, 1.566376, 0.5, 4.904624, 1.969738, 0.5, 0.474079, 3.065114, 0.5, 5, 1.969738, 0.5, 4.525921, 0.095376, 0, 4.904624, 0.095376, 0.5, 0.095376, 0.095376, 0, 0.095376, -1, 0, 6, 2, 0.5, 6, 2, 0, 6, 1.969738, 0, 4.525921, 1.566376, 0.5, 4.904624, 1.566376, 0, 4.904624, -1, 0, -1, -1, 0.5, 6, -1, 0, 6, 0.095376, 0, 0.095376, 1.566376, 0.5, 0.095376, 1.566376, 0, 0.095376, 2, 0, 6, 3.065114, 0.5, 5, 3.065114, 0, 5, 1.969738, 0, 0.474079, 1.969738, 0.5, 4.525921, 1.969738, 0, 4.525921, 2, 0, -1, -1, 0.5, -1, -1, 0, -1, 1.566376, 0, 0.095376, 1.969738, 0.5, 0.474079, 1.969738, 0, 0.474079, 3.065114, 0, 5, 3.065114, 0.5, 0, 3.065114, 0, 0, 3.065114, 0, 0, 2, 0.5, -1, 2, 0, -1, 1.566376, 0, 4.904624, 0.095376, 0.5, 4.904624, 0.095376, 0, 4.904624, -1, 0, -1, -1, 0, 6, 0.095376, 0, 4.904624, 2, 0, -1, -1, 0, -1, 0.095376, 0, 0.095376, 1.969738, 0, 0.474079, 3.065114, 0, 0, 2, 0, -1, 0.095376, 0, 4.904624, -1, 0, 6, 2, 0, 6, 2, 0, 6, 3.065114, 0, 5, 1.969738, 0, 4.525921, 1.969738, 0, 4.525921, 3.065114, 0, 5, 3.065114, 0, 0, 0.095376, 0.5, 4.904624, -1, 0.5, 6, -1, 0.5, -1, 0.095376, 0.5, 0.095376, -1, 0.5, -1, 2, 0.5, -1, 1.969738, 0.5, 0.474079, 1.566376, 0.5, 0.095376, 2, 0.5, -1, 0.095376, 0.5, 4.904624, 1.566376, 0.5, 4.904624, 2, 0.5, 6, 1.969738, 0.5, 4.525921, 3.065114, 0.5, 5, 2, 0.5, 6, 1.969738, 0.5, 0.474079, 3.065114, 0.5, 0, 3.065114, 0.5, 5, 0.095376, 0, 4.904624, 0.095376, 0.5, 4.904624, 0.095376, 0.5, 0.095376, -1, 0, 6, -1, 0.5, 6, 2, 0.5, 6, 1.969738, 0, 4.525921, 1.969738, 0.5, 4.525921, 1.566376, 0.5, 4.904624, -1, 0, -1, -1, 0.5, -1, -1, 0.5, 6, 0.095376, 0, 0.095376, 0.095376, 0.5, 0.095376, 1.566376, 0.5, 0.095376, 2, 0, 6, 2, 0.5, 6, 3.065114, 0.5, 5, 1.969738, 0, 0.474079, 1.969738, 0.5, 0.474079, 1.969738, 0.5, 4.525921, 2, 0, -1, 2, 0.5, -1, -1, 0.5, -1, 1.566376, 0, 0.095376, 1.566376, 0.5, 0.095376, 1.969738, 0.5, 0.474079, 3.065114, 0, 5, 3.065114, 0.5, 5, 3.065114, 0.5, 0, 3.065114, 0, 0, 3.065114, 0.5, 0, 2, 0.5, -1, 1.566376, 0, 4.904624, 1.566376, 0.5, 4.904624, 0.095376, 0.5, 4.904624],
    "normal": [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0.6845, 0, 0.729, 0.6845, 0, 0.729, 0.6845, 0, 0.729, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, -0.6845, 0, -0.729, -0.6845, 0, -0.729, -0.6845, 0, -0.729, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0.6845, 0, -0.729, 0.6845, 0, -0.729, 0.6845, 0, -0.729, -1, 0, 0, -1, 0, 0, -1, 0, 0, -0.6845, 0, 0.729, -0.6845, 0, 0.729, -0.6845, 0, 0.729, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0.6845, 0, 0.729, 0.6845, 0, 0.729, 0.6845, 0, 0.729, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, -0.6845, 0, -0.729, -0.6845, 0, -0.729, -0.6845, 0, -0.729, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0.6845, 0, -0.729, 0.6845, 0, -0.729, 0.6845, 0, -0.729, -1, 0, 0, -1, 0, 0, -1, 0, 0, -0.6845, 0, 0.729, -0.6845, 0, 0.729, -0.6845, 0, 0.729, 0, 0, 1, 0, 0, 1, 0, 0, 1]
}
const nData = {
    "position": [-1, 0, -1, 0, 0, -1, -1, 0, -1, 2, 0, 4, 0, 0, 0.5, 2, 0, 4, 2, 0, -1, 3, 0, -1, 2, 0, -1, 0, 0, -1, 2, 0, 2.5, 0, 0, -1, 3, 0, -1, 3, 0, 4, 3, 0, -1, 0, 0, 4, -1, 0, 4, 0, 0, 4, 0, 0, 0.5, 0, 0, 4, 0, 0, 0.5, -1, 0, 4, -1, 0, -1, -1, 0, 4, 3, 0, 4, 2, 0, 4, 3, 0, 4, 2, 0, 2.5, 2, 0, -1, 2, 0, 2.5, 3, 0, -1, 3, 0, 4, 3, 0, -1, 3, 0, 4, 3, 0.5, -1, 3, 0, -1, 0, 0, 4, -1, 0, 4, 0, 0, 4, 3, 0, 4, 2, 0, 4, 3, 0, 4, 2, 0, 2.5, 2, 0, -1, 2, 0, 2.5, -1, 0, -1, 0, 0, -1, -1, 0, -1, 2, 0, 4, 0, 0, 0.5, 2, 0, 4, 2, 0, -1, 3, 0, -1, 2, 0, -1, 0, 0, -1, 2, 0, 2.5, 0, 0, -1, 0, 0, 0.5, 0, 0, 4, 0, 0, 0.5, -1, 0, 4, -1, 0, -1, -1, 0, 4, 0, 0.5, -1, 2, 0.5, 2.5, 0, 0.5, 0.5, -1, 0, 4, 0, 0.5, 4, 0, 0, 4, -1, 0, -1, -1, 0.5, 4, -1, 0, 4, 2, 0, 4, 3, 0.5, 4, 3, 0, 4, 2, 0, -1, 2, 0.5, 2.5, 2, 0, 2.5, 0, 0, -1, -1, 0.5, -1, -1, 0, -1, 0, 0, 0.5, 2, 0.5, 4, 2, 0, 4, 3, 0, -1, 2, 0.5, -1, 2, 0, -1, 2, 0, 2.5, 0, 0.5, -1, 0, 0, -1, 0, 0, 4, 0, 0.5, 0.5, 0, 0, 0.5, 0, 0, 0.5, 3, 0, 4, 2, 0, 2.5, -1, 0, -1, 0, 0, -1, 0, 0, -1, 2, 0, 4, 0, 0, 0.5, 0, 0, 0.5, 2, 0, -1, 3, 0, -1, 3, 0, -1, 0, 0, -1, 2, 0, 2.5, 2, 0, 2.5, 3, 0, -1, 3, 0, 4, 3, 0, 4, 0, 0, 4, -1, 0, 4, -1, 0, 4, 0, 0, 0.5, 0, 0, 4, 0, 0, 4, -1, 0, 4, -1, 0, -1, -1, 0, -1, 3, 0, 4, 2, 0, 4, 2, 0, 4, 2, 0, 2.5, 2, 0, -1, 2, 0, -1, 3, 0, -1, 3, 0, 4, 3, 0, 4, 3, 0, 4, 3, 0.5, 4, 3, 0.5, -1, 0, 0, 4, -1, 0, 4, -1, 0, 4, 3, 0, 4, 2, 0, 4, 2, 0, 4, 2, 0, 2.5, 2, 0, -1, 2, 0, -1, -1, 0, -1, 0, 0, -1, 0, 0, -1, 2, 0, 4, 0, 0, 0.5, 0, 0, 0.5, 2, 0, -1, 3, 0, -1, 3, 0, -1, 0, 0, -1, 2, 0, 2.5, 2, 0, 2.5, 0, 0, 0.5, 0, 0, 4, 0, 0, 4, -1, 0, 4, -1, 0, -1, -1, 0, -1, -1, 0.5, 4, -1, 0.5, -1, 0, 0.5, -1, 2, 0.5, 2.5, 2, 0.5, -1, 3, 0.5, -1, 0, 0.5, 0.5, 0, 0.5, 4, -1, 0.5, 4, 3, 0.5, 4, 2, 0.5, 4, 0, 0.5, 0.5, 2, 0.5, 2.5, 3, 0.5, -1, 3, 0.5, 4, 0, 0.5, 0.5, -1, 0.5, 4, 0, 0.5, -1, 2, 0.5, 2.5, 3, 0.5, 4, 0, 0.5, 0.5, -1, 0, 4, -1, 0.5, 4, 0, 0.5, 4, -1, 0, -1, -1, 0.5, -1, -1, 0.5, 4, 2, 0, 4, 2, 0.5, 4, 3, 0.5, 4, 2, 0, -1, 2, 0.5, -1, 2, 0.5, 2.5, 0, 0, -1, 0, 0.5, -1, -1, 0.5, -1, 0, 0, 0.5, 0, 0.5, 0.5, 2, 0.5, 4, 3, 0, -1, 3, 0.5, -1, 2, 0.5, -1, 2, 0, 2.5, 2, 0.5, 2.5, 0, 0.5, -1, 0, 0, 4, 0, 0.5, 4, 0, 0.5, 0.5, 2, 0, 2.5, 0, 0, -1, -1, 0, -1, -1, 0, -1, -1, 0, 4, 0, 0, 4, 0, 0, 0.5, 2, 0, 4, 3, 0, 4, -1, 0, -1, 0, 0, 4, 0, 0, 0.5, 3, 0, -1, 2, 0, -1, 2, 0, 2.5, 2, 0, 2.5, -1, 0, -1, 0, 0, 0.5, 3, 0, 4, 3, 0, -1, 2, 0, 2.5],
    "normal": [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0.8682, 0, -0.4961, 0.8682, 0, -0.4961, 0.8682, 0, -0.4961, 0, 0, 1, 0, 0, 1, 0, 0, 1, -0.8682, 0, 0.4961, -0.8682, 0, 0.4961, -0.8682, 0, 0.4961, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0.8682, 0, -0.4961, 0.8682, 0, -0.4961, 0.8682, 0, -0.4961, 0, 0, 1, 0, 0, 1, 0, 0, 1, -0.8682, 0, 0.4961, -0.8682, 0, 0.4961, -0.8682, 0, 0.4961, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]
}

/// Matrix math

/**
 * TypedArray
 * @typedef {Int8Array|Int16Array|Int32Array|BigInt64Array|Uint8Array|Uint16Array|Uint32Array|BigUint64Array|Float32Array|Float64Array} TypedArray
 */
/**
 * @param gl {WebGLRenderingContext}
 * @param {number|ArrayBufferView|ArrayBuffer|TypedArray} data
 * @param kind {GLenum}
 * @param usage {GLenum}
 */
export function newGLBuffer(gl, data, kind = WebGLRenderingContext.ARRAY_BUFFER, usage = WebGLRenderingContext.STATIC_DRAW) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(kind, buffer);

    gl.bufferData(
        kind,
        data,
        usage,
    );
    return buffer;
}

export var vec3 = {
    zero: () => {
        return new Float32Array([0, 0, 0])
    },
    fromValues: (x, y, z) => {
        return new Float32Array([x, y, z,])
    }
}
export var vec4 = {
    zero: () => {
        return new Float32Array([0, 0, 0, 0])
    }
}

export var quat = {
    create: () => {
        return new Float32Array([0, 0, 0, 1])
    },
    rotateX: (out, input, radians) => {
        let [inX, inY, inZ, inW] = input
        let [w, x] = [Math.cos(radians*.5), Math.sin(radians*.5)]

        out[0]= inX * w + inW *x
        out[1]=inY * w + inZ *x
        out[2]=inZ*w-inY*x
        out[3]=inW*w-inX*x
        return out
    },
    rotateY: (out, input, radians) => {
        let [inX, inY, inZ, inW] = input
        let [w, y] = [Math.cos(radians * .5), Math.sin(radians * .5)]

        out[0] = inX * w - inZ * y
        out[1] = inY * w + inW * y
        out[2] = inZ * w + inX * y
        out[3] = inW * w - inY * y
        return out
    },
    toTranslationMatrix: (input) => {
        let [a, b, c, d] = input
        return mat4.fromRows([
            [2 * Math.pow(a, 2) - 1 + 2 * Math.pow(b, 2), 2 * b * c + 2 * a * d, 2 * b * d - 2 * a * c],
            [2 * b * c - 2 * a * d, 2 * Math.pow(a, 2) - 1 + 2 * Math.pow(c, 2), 2 * c * d + 2 * a * d],
            [2 * b * d + 2 * a * c, 2 * c * d - 2 * a * b, 2 * Math.pow(a, 2) - 1 + 2 * Math.pow(d, 2)]
        ])
    }
}
export var mat4 = {
    create: () => {
        return mat4.fromRows([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ].flat())
    },
    perspective: (out, fovy, aspect, near, far) => {
        let f = 1.0 / Math.tan(fovy / 2),
            nf;
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
            nf = 1 / (near - far);
            out[10] = (far + near) * nf;
            out[14] = 2 * far * near * nf;
        } else {
            out[10] = -1;
            out[14] = -2 * near;
        }
        return out;
    },
    fromRotationTranslation: (out, quat, translation) => {
        let [x, y, z, w] = quat;
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

        let [tx, ty, tz] = translation
        let result = mat4.fromRows([
            [1 - (yy + zz), xy + wz, xz - wy, 0,],
            [xy - wz, 1 - (xx + zz), yz + wx, 0],
            [xz + wy, yz - wx, 1 - (xx + yy), 0],
            [tx, ty, tz, 1]
        ])
        for (let i = 0; i < 4*4;i++) {
            out[i] =  result[i]
        }
        return out
    },
    multiply: (out, lhs, rhs) => {
        let lhsT = mat4.clone(lhs)
        let rhsT = mat4.clone(rhs)
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
    },
    scale: (out, input, val) => {
        let [x, y, z] = val
        out[0] = input[0] * x
        out[1] = input[1] * x
        out[2] = input[2] * x
        out[3] = input[3] * x

        out[4] = input[4] * y
        out[5] = input[5] * y
        out[6] = input[6] * y
        out[7] = input[7] * y

        out[8] = input[8] * z
        out[9] = input[9] * z
        out[10] = input[10] * z
        out[11] = input[11] * z


        out[12] = input[12]
        out[13] = input[13]
        out[14] = input[14]
        out[15] = input[15]
        return out
    },
    invert: (out, input) => {
        // https://en.wikipedia.org/wiki/Invertible_matrix
        // https://glmatrix.net/docs/mat4.js.html
        // https://learnwebgl.brown37.net/transformations2/transformations_introduction.html
        let a00 = input[0],
            a01 = input[1],
            a02 = input[2],
            a03 = input[3];
        let a10 = input[4],
            a11 = input[5],
            a12 = input[6],
            a13 = input[7];
        let a20 = input[8],
            a21 = input[9],
            a22 = input[10],
            a23 = input[11];
        let a30 = input[12],
            a31 = input[13],
            a32 = input[14],
            a33 = input[15];
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
        // Calculate the determinant
        let det =
            b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {
            return null;
        }
        det = 1.0 / det;
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
                out[i + j * 4] = input[j + i * 4]
            }
        }
        return out
    },
    translate: (out, input, translation) => {
        mat4.multiply(out, out, mat4.fromColumns([
            [1, 0, 0, translation[0]],
            [0, 1, 0, translation[1]],
            [0, 0, 1, translation[2]],
            [0, 0, 0, 1],
        ]))
        return out
    },
    fromRows: (rows) => {
        return new Float32Array(rows.flat())
    },
    fromColumns: (columns) => {
        // let rows = [new Float32Array(4), new Float32Array(4), new Float32Array(4), new Float32Array(4)]
        let out = new Float32Array(4 * 4)
        for (let i = 0; i < 4; i++) {
            for (let y = 0; y < 4; y++) {
                // rows[i][y] =columns[y][i]
                out[y + i * 4] = columns[y][i]
            }
        }
        return out
    },
    clone: (m) => {
        return new Float32Array(m.slice(0))
    }
}




let $ = (sel) => document.querySelector(sel)
let _ = {}
_.range = function range(a, b) {
    if (b) {
        let step = a > b ? -1 : 1
        let size = a > b ? a - b : b - a
        return [...Array(size).keys()].map(i => step * i + a);
    }
    return [...Array(a).keys()];
}


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
    color;

    constructor(color) {
        super();
        this.color = color
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
        gl.bindBuffer(gl.ARRAY_BUFFER, shape.normalBuffer);
        if (shape.indexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, shape.positionBuffer);
        }

        gl.uniform4fv(locations.uniform.color, this.color)

        if (shape.indexBuffer) {
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            throw 'TODO'
            gl.drawElements(gl.TRIANGLE_STRIP, shape.vertexCount, type, offset);
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, shape.vertexCount);
        }
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
        
        out vec4 vPosition;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uNormalMatrix;
        uniform vec3 uLightWorldPosition;
        uniform vec3 uCameraPos;
        uniform vec4 uColor;

        out vec3 v_normal;
        out vec3 v_surfaceToLight;

        out vec3 cameraPos;
        out vec3 lightPosition;

       out lowp vec4 vColor;



        void main() {
            cameraPos = uCameraPos;
            // gl_Position = aVertexPosition;
            //vec4 x =  uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vPosition = gl_Position;

            lightPosition = uLightWorldPosition;
            vec3 surfaceWorldPosition = (uModelViewMatrix * aVertexPosition).xyz;
            v_surfaceToLight = uLightWorldPosition - surfaceWorldPosition;
            highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

           vColor = uColor;

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
    in lowp vec4 vColor;

    in vec3 lightPosition;
    in vec3 cameraPos;
    
    void main() {
            
      vec3 normal = normalize(v_normal);
      vec3 cameraDir = normalize(cameraPos - vPosition.xyz);
 
      vec3 surfaceToLightDirection = normalize(v_surfaceToLight);

      vec3 lightDirection = normalize(lightPosition.xyz - vPosition.xyz);
      vec3 reflectionDir = reflect(-lightDirection, v_normal);
     
      vec3 lightColor = vec3(.3, .3, .3);
      float lightIntensity = dot(v_normal, surfaceToLightDirection);
      vec3 diffuse = lightColor * lightIntensity;
      float ambient = 0.7;
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
        mat4.fromRotationTranslation(modelViewMatrix, camera.quaternion, camera.position.xyz)


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
            color: this.gl.getUniformLocation(this.program, "uColor"),
            normalMatrix: this.gl.getUniformLocation(this.program, "uNormalMatrix"),
            cameraPos: this.gl.getUniformLocation(this.program, "uCameraPos"),
            lightPosition: [
                this.gl.getUniformLocation(this.program, "uLightWorldPosition")
            ],
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

    let redMaterial = new ColorMaterial([1, 0, 0, 1]);
    let blueMaterial = new ColorMaterial([0, 1, 0, 1]);
    let greenMaterial = new ColorMaterial([0, 0, 1, 1]);


    let classPolygon = class extends Shape {
        constructor(gl, data) {
            super();
            this.vertexCount = Math.floor(data.position.length / 3)
            this.positionBuffer = newGLBuffer(gl, new Float32Array(data.position))
            this.normalBuffer = newGLBuffer(gl, new Float32Array(data.normal))
        }
    }

    let jMesh = new Mesh(new classPolygon(ctx, jData), redMaterial)
    jMesh.scale = new Vector3(1, 1, 1)
    jMesh.position.x -= 3
    jMesh.position.y += 1
    jMesh.position.z -= 9
    quat.rotateX(jMesh.quaternion, jMesh.quaternion, Math.PI / 2)
    scene.add(jMesh)

    let dMesh = new Mesh(new classPolygon(ctx, dData), blueMaterial)
    dMesh.scale = new Vector3(.5, 1, .6)
    dMesh.position.x -= 0
    dMesh.position.y += 1.3
    dMesh.position.z -= 9
    quat.rotateX(dMesh.quaternion, dMesh.quaternion, Math.PI / 2)
    scene.add(dMesh)

    let nMesh = new Mesh(new classPolygon(ctx, nData), greenMaterial)
    nMesh.scale = new Vector3(.5, 1, .9)
    nMesh.position.x += 2.7
    nMesh.position.y += 1.1
    nMesh.position.z -= 9
    quat.rotateX(nMesh.quaternion, nMesh.quaternion, Math.PI / 2)
    scene.add(nMesh)

    let renderer = new Renderer(scene, ctx);
    renderer.render(camera);
    window["r"] = renderer;
    window["c"] = camera;
    window["s"] = scene;
    let then = 0;
    let rot = 0;

    window.camera = camera

    let inputs = {}

    function render(now) {
        now *= 0.001;
        let deltaTime = now - then;
        then = now;

        rot += deltaTime;

        // TODO: Fix light objects
        directionalLight.position.y = Math.cos(rot / 3 * 1 + Math.PI) * 4 + 3
        directionalLight.position.x = Math.sin(rot / 3 * 1 + Math.PI) * 4 + 4
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
        if (inputs["t"]) {
            quat.rotateZ(camera.quaternion, camera.quaternion, .1)
        }
        if (inputs["g"]) {
            quat.rotateZ(camera.quaternion, camera.quaternion, -.1)
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

    let listener = (e) => {
        function getCursorPosition(canvas, event) {
            var b = canvas.getBoundingClientRect()
            var scale = canvas.width / parseFloat(b.width)
            var x = (event.clientX - b.left) * scale
            var y = (event.clientY - b.top) * scale
            return [x, y]
        }

        let [x, y] = getCursorPosition(canvas, e)
        let screen = [e.clientX, e.clientY]
        let canvasSpace = [x, y]
        console.info(
            `Click at screen: ${screen}, canvas: ${canvasSpace}`
        )
    }
    canvas.addEventListener('click', listener)

}

go();

