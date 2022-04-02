var canvasShader;
var canvasVAO;
var canvasVBO;

var canvasPositionID;
var canvasUVID;
var canvasProjectionMatrixID;
var canvasColorUID;
var canvasDepthUID;

var canvasDefaultTexture;

var canvasDepth = 0;

function initCanvasRenderer(width, height){
    let canVertShad = "#version 300 es\n\
    in vec2 position;\n\
    in vec2 uvCoordinate;\n\
    uniform float depth;\n\
    uniform mat4 projectionMatrix;\n\
    out vec2 uv;\n\
    void main(){\
    uv = uvCoordinate;\
    gl_Position = projectionMatrix * vec4(position, depth, 1.0);\
    }\
    ";
    let canFragShad = "#version 300 es\n\
    precision mediump float;\n\
    in vec2 uv;\n\
    uniform vec4 color;\n\
    uniform sampler2D tex;\n\
    out vec4 finalColor;\n\
    void main(){\
    vec4 texCol = texture(tex, uv);\
    finalColor = color * texCol;\
    }";

    canvasShader = compileGLShader(gl, canVertShad, canFragShad);
    gl.useProgram(canvasShader);

    canvasPositionID = gl.getAttribLocation(canvasShader, "position");
    canvasUVID = gl.getAttribLocation(canvasShader, "uvCoordinate");
    canvasProjectionMatrixID = gl.getUniformLocation(canvasShader, "projectionMatrix");
    canvasColorUID = gl.getUniformLocation(canvasShader, "color");
    canvasDepthUID = gl.getUniformLocation(canvasShader, "depth");

    let cam = new Camera();
    cam.setOrthographicProjection(0, width, 0, height, -1, 1);
    gl.uniformMatrix4fv(canvasProjectionMatrixID, gl.FALSE, cam.projectionMatrix.m);

    canvasVAO = gl.createVertexArray();
    gl.bindVertexArray(canvasVAO);
    canvasVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, canvasVBO);

    gl.bufferData(gl.ARRAY_BUFFER, 16 * 16, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(canvasPositionID);
    gl.enableVertexAttribArray(canvasUVID);
    gl.vertexAttribPointer(canvasPositionID, 2, gl.FLOAT, gl.FALSE, 16, 0);
    gl.vertexAttribPointer(canvasUVID, 2, gl.FLOAT, gl.FALSE, 16, 8);

    let pix = [
        255, 255, 255, 255,
    ];

    canvasDefaultTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, canvasDefaultTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(pix));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.useProgram(canvasShader);
    gl.bindVertexArray(canvasVAO);
    gl.disable(gl.CULL_FACE);
    gl.bindBuffer(gl.ARRAY_BUFFER, canvasVBO);
}

function renderQuad(position, scale, color = new Vector4(1, 1, 1, 1), texture = canvasDefaultTexture){
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform4fv(canvasColorUID, color.toArray());
    gl.uniform1f(canvasDepthUID, canvasDepth);
    canvasDepth += 0.001

    let verts = [
        position.x, position.y, 0, 1, 
        position.x, position.y + scale.y, 0, 0,  
        position.x + scale.x, position.y + scale.y, 1, 0,
        position.x + scale.x, position.y + scale.y, 1, 0,
        position.x + scale.x, position.y, 1, 1,
        position.x, position.y, 0, 1,
    ];

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(verts));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function renderRotatedQuad(position, scale, color = new Vector4(1, 1, 1, 1), texture = canvasDefaultTexture, angle = 0){
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform4fv(canvasColorUID, color.toArray());
    gl.uniform1f(canvasDepthUID, canvasDepth);
    canvasDepth += 0.001

    let center = new Vector2(position.x + scale.x * 0.5, position.y + scale.y * 0.5);
    let p1 = Vector2.rotate(position, center, angle);
    let p2 = Vector2.rotate(new Vector2(position.x, position.y + scale.y), center, angle);
    let p3 = Vector2.rotate(new Vector2(position.x + scale.x, position.y + scale.y), center, angle);
    let p4 = Vector2.rotate(new Vector2(position.x + scale.x, position.y), center, angle);

    let verts = [
        p1.x, p1.y, 0, 1, 
        p2.x, p2.y, 0, 0,  
        p3.x, p3.y, 1, 0,
        p3.x, p3.y, 1, 0,
        p4.x, p4.y, 1, 1,
        p1.x, p1.y, 0, 1,
    ];

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(verts));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}