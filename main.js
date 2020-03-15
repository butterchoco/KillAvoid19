var gl;
var index = 0;

var maxNumTriangles = 200;
var maxNumVertices = 3 * maxNumTriangles;
var canvas;
var vBuffer;
var vPosition;
var program;

var enemyPosition = [];
var currVirusNum = 0;
var maxVirusNum = 50;
var score;
var speed;
var interval = 3000;
var audio;

var colors = [
  vec4(1.0, 0.0, 0.0, 1.0), // red
  vec4(1.0, 1.0, 1.0, 1.0), // white
  vec4(1.0, 1.0, 0.0, 1.0), // yellow
  vec4(0.0, 1.0, 0.0, 1.0), // green
  vec4(0.0, 0.0, 1.0, 1.0), // blue
  vec4(1.0, 0.0, 1.0, 1.0), // magenta
  vec4(0.0, 1.0, 1.0, 1.0) // cyan
];

function between(val, min, max) {
  return val >= min && val <= max;
}

function main() {
  canvas = document.getElementById("glCanvas");
  audio = new Audio("sound.mp3");
  audio.play();
  console.log(audio);

  // audio = document.getElementById("myAudio");

  score = document.getElementById("score").innerHTML;
  score = 0;

  speed = document.getElementById("speed").innerHTML;
  speed = 0;

  gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert("WebGL isn't available");
  }

  // Create viewport based on canvas size
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Set defult background color for viewport
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Load vertex-shader
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  canvas.addEventListener("mousedown", function(event) {
    if (currVirusNum <= maxVirusNum) {
      var mousePosX =
        (2 * (event.clientX - canvas.offsetLeft)) / canvas.width - 1;
      var mousePosY =
        (2 * (canvas.height - event.clientY + canvas.offsetTop)) /
          canvas.height -
        1;
      var isHitVirus = false;

      for (let i = 0; i < enemyPosition.length; i++) {
        if (
          between(
            mousePosX,
            enemyPosition[i].x - 0.03,
            enemyPosition[i].x + 0.03
          ) &&
          between(
            mousePosY,
            enemyPosition[i].y - 0.03,
            enemyPosition[i].y + 0.03
          )
        ) {
          isHitVirus = true;

          mousePosX = enemyPosition[i].x;
          mousePosY = enemyPosition[i].y;
          enemyPosition.splice(i, 1);
        }
      }

      if (isHitVirus) {
        generateCovidShape(vec4(0.0, 0.0, 0.0, 1.0), mousePosX, mousePosY);

        score += 1;
        audio.play();
        console.log("a");
        document.getElementById("score").innerHTML = score;
        isHitVirus = false;
        currVirusNum -= 1;
      }
    } else {
      document.getElementById("lose-modal").classList.replace("hide", "show");
    }
  });

  // Configure Webgl Buffer
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW);

  vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

  vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);
  // =========

  // Load Generate Opponents
  runTimer();

  render();
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, index);
  window.requestAnimFrame(render);
}

function runTimer() {
  var iteration = 1;
  setTimeout(function callback() {
    generateCovid();
    if (iteration % 3 === 0) {
      hideOldCovid();
    }
    iteration++;
    if (interval > 1000) {
      interval -= 50;
      speed += 50;
      document.getElementById("speed").innerHTML = speed;
    }
    if (currVirusNum <= maxVirusNum) {
      setTimeout(callback, interval);
    } else {
      document.getElementById("lose-modal").classList.replace("hide", "show");
    }
  });
}

function generateCovid() {
  var randomX = Math.floor(Math.random() * 1000);
  var randomY = Math.floor(Math.random() * 1000);

  var positionX = (2 * Math.floor(randomX % canvas.width)) / canvas.width - 1;
  var positionY =
    (2 * (canvas.height - Math.floor(randomY % canvas.height))) /
      canvas.height -
    1;

  let enemy = {
    x: positionX,
    y: positionY
  };

  enemyPosition.push(enemy);

  generateCovidShape(colors[index % 7], positionX, positionY);

  currVirusNum += 1;
  render();
}

function hideOldCovid() {
  generateCovidShape(
    vec4(0.0, 0.0, 0.0, 1.0),
    enemyPosition[0].x,
    enemyPosition[0].y
  );

  currVirusNum -= 1;
  enemyPosition.shift();
}

function generateCovidShape(color, posX, posY) {
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  var t = vec2(posX, posY);
  gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  t = vec4(color);
  gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
  index++;
}

window.onload = main;
