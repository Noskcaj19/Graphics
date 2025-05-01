export var vec3 = {
  zero: () => {
    return new Float32Array([0, 0, 0])
  },
  fromValues: (x, y, z) => {
    return new Float32Array([x, y, z,])
  },
  create: () => {
    return new Float32Array([0, 0, 0])
  },
  copy: (out, other) => {
    out[0] = other[0]
    out[1] = other[1]
    out[2] = other[2]
    return out
  },
  scale: (out, a, scale) => {
    out[0] = a[0] * scale
    out[1] = a[1] * scale
    out[2] = a[2] * scale
    return out
  },
  transformMat3: (out, v, m) => {
    let [x, y, z] = v

    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];

    return out
  },
  add: (out, a, other) => {
    out[0] = a[0] + other[0]
    out[1] = a[1] + other[1]
    out[2] = a[2] + other[2]
    return out
  },
  subtract: (out, a, other) => {

    out[0] = a[0] - other[0]
    out[1] = a[1] - other[1]
    out[2] = a[2] - other[2]
    return out
  },
  length: (v) => {
    let [x, y, z] = v
    // SOOOOOO SLOW
    return Math.hypot(x, y, z)
  },
  normalize: (out, v) => {
    let [x, y, z] = v
    let len2 = x ** 2 + y ** 2 + z ** 2
    if (len2 > 0) {
      len2 = 1 / Math.sqrt(len2)
    }
    out[0] = v[0] * len2
    out[1] = v[1] * len2
    out[2] = v[2] * len2
    return out
  },
  cross: (out, lhs, rhs) => {
    let [lhsX, lhsY, lhsZ] = lhs
    let [rhsX, rhsY, rhsZ] = rhs
    out[0] = lhsY * rhsZ - lhsZ * rhsY;
    out[1] = lhsZ * rhsX - lhsX * rhsZ;
    out[2] = lhsX * rhsY - lhsY * rhsX;
    return out
  },
  dot: (lhs, rhs) => {
    return lhs[0] * rhs[0] + lhs[1] * rhs[1] + lhs[2] * rhs[2]
  },
  transformQuat: (out, v, q) => {
    let [qx, qy, qz, qw] = q

    // throw 'do quat'
    // var qvec = new Vec3(qx, qy, qz);
    let qvec = vec3.fromValues(qx, qy, qz)
    // var uv = qvec.cross(this);
    let uv = vec3.cross(vec3.create(), qvec, v)
    // var uuv = qvec.cross(uv);
    var uuv = vec3.cross(vec3.create(), qvec, uv);
    // uv = uv.scale(2 * qw);
    vec3.scale(uv, uv, 2 * qw)
    // uuv = uuv.scale(2);
    vec3.scale(uuv, uuv, 2)

    // return this.add(uv.add(uuv));

    return vec3.add(out, v, vec3.add(vec3.create(), uv, uuv))
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
  copy: (out, other) => {
    out[0] = other[0]
    out[1] = other[1]
    out[2] = other[2]
    return out
  },
  fromValues: (x, y, z, w) => {
    return new Float32Array([x, y, z, w])
  },
  applyEuler: (out, x, y, z) => {
    let factor = Math.PI / 2 / 180
    x *= factor
    y *= factor
    z *= factor

    let sx = Math.sin(x);
    let cx = Math.cos(x);
    let sy = Math.sin(y);
    let cy = Math.cos(y);
    let sz = Math.sin(z);
    let cz = Math.cos(z);

    out[0] = sx * cy * cz - cx * sy * sz
    out[1] = cx * sy * cz + sx * cy * sz
    out[2] = cx * cy * sz - sx * sy * cz
    out[3] = cx * cy * cz + sx * sy * sz
    return out
  },
  fromEuler: (out, x, y, z) => {
    let factor = Math.PI / 2 / 180
    x *= factor
    y *= factor
    z *= factor

    let sx = Math.sin(x);
    let cx = Math.cos(x);
    let sy = Math.sin(y);
    let cy = Math.cos(y);
    let sz = Math.sin(z);
    let cz = Math.cos(z);

    return new Float32Array([
      sx * cy * cz - cx * sy * sz,
      cx * sy * cz + sx * cy * sz,
      cx * cy * sz - sx * sy * cz,
      cx * cy * cz + sx * sy * sz,
    ])
  },
  setAxisAngle: (out, axis, rad) => {
    rad = rad / 2
    let s = Math.sin(rad)
    out[0] = s * axis[0]
    out[1] = s * axis[1]
    out[2] = s * axis[2]
    out[3] = Math.cos(rad)
    return out
  },
  multiply: (out, q, other) => {
    let [ax, ay, az, aw] = q
    let [bx, by, bz, bw] = other

    // thanks wolfram mathworld
    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
  },
  add: (out, q, other) => {
    out[0] = q[0] + other[0];
    out[1] = q[1] + other[1];
    out[2] = q[2] + other[2];
    out[3] = q[3] + other[3];
    return out
  },
  normalize: (out, q) => {
    let [x, y, z, w] = q
    let len2 = x ** 2 + y ** 2 + z ** 2 + w ** 2
    if (len2 > 0) {
      len2 = 1 / Math.sqrt(len2)
    }
    out[0] = q[0] * len2
    out[1] = q[1] * len2
    out[2] = q[2] * len2
    out[3] = q[3] * len2
    return out
  },
  conjugate: (out, other) => {
    out[0] = -other[0]
    out[1] = -other[1]
    out[2] = -other[2]
    out[3] = other[3]
    return out
  },
  rotateX: (out, input, radians) => {
    let [inX, inY, inZ, inW] = input
    let [w, x] = [Math.cos(radians * .5), Math.sin(radians * .5)]

    out[0] = inX * w + inW * x
    out[1] = inY * w + inZ * x
    out[2] = inZ * w - inY * x
    out[3] = inW * w - inX * x
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

export var mat3 = {
  create: () => {
    return mat3.fromRows([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ])
  },
  fromMat4: (out, other) => {
    out[0] = other[0]
    out[1] = other[1]
    out[2] = other[2]
    out[3] = other[4]
    out[4] = other[5]
    out[5] = other[6]
    out[6] = other[8]
    out[7] = other[9]
    out[8] = other[10]
    return out
  },
  fromRows: (rows) => new Float32Array(rows.flat()),
  fromQuat: (out, quat) => {
    let [x, y, z, w] = quat

    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;

    let xx = x * x2;
    let yx = y * x2;
    let yy = y * y2;
    let zx = z * x2;
    let zy = z * y2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;

    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;

    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;

    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;

    return out;
  },
  multiply: (out, lhs, rhs) => {
    let lhs00 = lhs[0],
        lhs01 = lhs[1],
        lhs02 = lhs[2];
    let lhs10 = lhs[3],
        lhs11 = lhs[4],
        lhs12 = lhs[5];
    let lhs20 = lhs[6],
        lhs21 = lhs[7],
        lhs22 = lhs[8];
    let rhs00 = rhs[0],
        rhs01 = rhs[1],
        rhs02 = rhs[2];
    let rhs10 = rhs[3],
        rhs11 = rhs[4],
        rhs12 = rhs[5];
    let rhs20 = rhs[6],
        rhs21 = rhs[7],
        rhs22 = rhs[8];

    out[0] = rhs00 * lhs00 + rhs01 * lhs10 + rhs02 * lhs20;
    out[1] = rhs00 * lhs01 + rhs01 * lhs11 + rhs02 * lhs21;
    out[2] = rhs00 * lhs02 + rhs01 * lhs12 + rhs02 * lhs22;
    out[3] = rhs10 * lhs00 + rhs11 * lhs10 + rhs12 * lhs20;
    out[4] = rhs10 * lhs01 + rhs11 * lhs11 + rhs12 * lhs21;
    out[5] = rhs10 * lhs02 + rhs11 * lhs12 + rhs12 * lhs22;
    out[6] = rhs20 * lhs00 + rhs21 * lhs10 + rhs22 * lhs20;
    out[7] = rhs20 * lhs01 + rhs21 * lhs11 + rhs22 * lhs21;
    out[8] = rhs20 * lhs02 + rhs21 * lhs12 + rhs22 * lhs22;

    return out;
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
  fromTranslation: (out, t) => {
    let [x, y, z] = t
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = x;
    out[13] = y;
    out[14] = z;
    out[15] = 1;
    return out;
  },
  fromQuat: (out, quat) => {
    let [x, y, z, w] = quat

    let x2 = x + x;
    let y2 = y + y;
    let z2 = z + z;

    let xx = x * x2;
    let yx = y * x2;
    let yy = y * y2;
    let zx = z * x2;
    let zy = z * y2;
    let zz = z * z2;
    let wx = w * x2;
    let wy = w * y2;
    let wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;
    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;
    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out
  },
  fromScaling: (out, scaling) => {
    let [x, y, z] = scaling

    out[0] = x;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = y;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = z;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out
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
    for (let i = 0; i < 4 * 4; i++) {
      out[i] = result[i]
    }
    return out
  },
  fromRotationTranslationScale: (out, inQuat, translation, scale) => {
    // TODO: !!
    // Quaternion math
    let x = inQuat[0], y = inQuat[1], z = inQuat[2], w = inQuat[3];
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
    let sx = scale[0];
    let sy = scale[1];
    let sz = scale[2];

    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[3] = 0;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[7] = 0;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[11] = 0;
    out[12] = translation[0];
    out[13] = translation[1];
    out[14] = translation[2];
    out[15] = 1;

    return out;
  },
  getTranslation: (out, mat) => {
    out[0] = mat[12]
    out[1] = mat[13]
    out[2] = mat[14]
    return out
  },
  targetTo: (out, eye, target, up) => {
    let eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2];
    let z0 = eyex - target[0],
        z1 = eyey - target[1],
        z2 = eyez - target[2];
    let len = z0 * z0 + z1 * z1 + z2 * z2;
    if (len > 0) {
      len = 1 / Math.sqrt(len);
      z0 *= len;
      z1 *= len;
      z2 *= len;
    }
    let x0 = upy * z2 - upz * z1,
        x1 = upz * z0 - upx * z2,
        x2 = upx * z1 - upy * z0;
    len = x0 * x0 + x1 * x1 + x2 * x2;
    if (len > 0) {
      len = 1 / Math.sqrt(len);
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }
    out[0] = x0;
    out[1] = x1;
    out[2] = x2;
    out[3] = 0;
    out[4] = z1 * x2 - z2 * x1;
    out[5] = z2 * x0 - z0 * x2;
    out[6] = z0 * x1 - z1 * x0;
    out[7] = 0;
    out[8] = z0;
    out[9] = z1;
    out[10] = z2;
    out[11] = 0;
    out[12] = eyex;
    out[13] = eyey;
    out[14] = eyez;
    out[15] = 1;
    return out;
    // let [eyex, eyey, eyez] = eye
    // let [upx, upy, upz] = up
    //
    // let z0 = eyex - target[0]
    // let z1 = eyex - target[1]
    // let z2 = eyex - target[2]
    //
    // let len = z0 ** 2 + z1 ** 2 + z2 ** 2
    // if (len > 0) {
    //   len = 1 / Math.sqrt(len)
    //   z0 *= len
    //   z1 *= len
    //   z2 *= len
    // }
    //
    // let [x0, x1, x2] = [
    //   upy * z2 - upz * z1,
    //   upz * z0 - upx * z2,
    //   upx * z1 - upy * z0
    // ]
    //
    // len = x0 ** 2 + x1 ** 2 + x2 ** 2
    // if (len > 0) {
    //   len = 1 / Math.sqrt(len)
    //   x0 *= len
    //   x1 *= len
    //   x2 *= len
    // }
    //
    // out[0] = x0;
    // out[1] = x1;
    // out[2] = x2;
    // out[3] = 0;
    // out[4] = z1 * x2 - z2 * x1;
    // out[5] = z2 * x0 - z0 * x2;
    // out[6] = z0 * x1 - z1 * x0;
    // out[7] = 0;
    // out[8] = z0;
    // out[9] = z1;
    // out[10] = z2;
    // out[11] = 0;
    // out[12] = eyex;
    // out[13] = eyey;
    // out[14] = eyez;
    // out[15] = 1;
    // return out;
  },
  getRotation: (out, mat) => {
    let scaling = vec3.create();
    getScaling(scaling, mat);
    let is1 = 1 / scaling[0];
    let is2 = 1 / scaling[1];
    let is3 = 1 / scaling[2];
    let sm11 = mat[0] * is1;
    let sm12 = mat[1] * is2;
    let sm13 = mat[2] * is3;
    let sm21 = mat[4] * is1;
    let sm22 = mat[5] * is2;
    let sm23 = mat[6] * is3;
    let sm31 = mat[8] * is1;
    let sm32 = mat[9] * is2;
    let sm33 = mat[10] * is3;
    let trace = sm11 + sm22 + sm33;
    let S = 0;
    if (trace > 0) {
      S = Math.sqrt(trace + 1.0) * 2;
      out[3] = 0.25 * S;
      out[0] = (sm23 - sm32) / S;
      out[1] = (sm31 - sm13) / S;
      out[2] = (sm12 - sm21) / S;
    } else if (sm11 > sm22 && sm11 > sm33) {
      S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
      out[3] = (sm23 - sm32) / S;
      out[0] = 0.25 * S;
      out[1] = (sm12 + sm21) / S;
      out[2] = (sm31 + sm13) / S;
    } else if (sm22 > sm33) {
      S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
      out[3] = (sm31 - sm13) / S;
      out[0] = (sm12 + sm21) / S;
      out[1] = 0.25 * S;
      out[2] = (sm23 + sm32) / S;
    } else {
      S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
      out[3] = (sm12 - sm21) / S;
      out[0] = (sm31 + sm13) / S;
      out[1] = (sm23 + sm32) / S;
      out[2] = 0.25 * S;
    }
    return out;
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

export function getScaling(out, mat) {
  let m11 = mat[0];
  let m12 = mat[1];
  let m13 = mat[2];
  let m21 = mat[4];
  let m22 = mat[5];
  let m23 = mat[6];
  let m31 = mat[8];
  let m32 = mat[9];
  let m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}


// import {vec3, quat, mat3, mat4} from "gl-matrix"
// export {vec3, quat, mat3, mat4}

