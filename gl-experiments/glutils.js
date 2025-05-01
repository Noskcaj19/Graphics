
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


