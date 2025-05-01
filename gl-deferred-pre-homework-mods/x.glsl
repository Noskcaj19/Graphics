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