const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.floor(width * window.devicePixelRatio);
  canvas.height = Math.floor(height * window.devicePixelRatio);
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

window.addEventListener("resize", () => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  resizeCanvas();
});

resizeCanvas();

fetch("data.json")
  .then((response) => response.json())
  .then((data) => startPlayback(data))
  .catch((error) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#3a342a";
    ctx.font = "16px Georgia, serif";
    ctx.fillText("Run backend/main.py first.", 20, 30);
    console.error(error);
  });

function startPlayback(data) {
  const frames = data.frames;
  const scale = 180;
  let frameIndex = 0;

  function drawFrame() {
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.fillStyle = "#5a3d2c";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();

    const frame = frames[frameIndex];
    frame.forEach((point) => {
      const x = centerX + point.x * scale;
      const y = centerY - point.y * scale;

      ctx.fillStyle = "#1c3f60";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    frameIndex = (frameIndex + 1) % frames.length;
    requestAnimationFrame(drawFrame);
  }

  drawFrame();
}
