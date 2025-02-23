const videoElement = document.getElementById('video-input');
const canvasElement = document.getElementById('hand-canvas');
const canvasCtx = canvasElement.getContext('2d');
const eyes = document.querySelectorAll('.eye');
const pupils = document.querySelectorAll('.pupil');

let lastX = window.innerWidth / 2;
let lastY = window.innerHeight / 2;

function onResults(results) {
  // Clear the canvas
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const hand = results.multiHandLandmarks[0];
    // Get index finger tip (8) and base (5) for better tracking
    const fingerTip = hand[8];
    const fingerBase = hand[5];

    // Convert normalized coordinates to screen coordinates
    // Adjust x-coordinate to account for mirroring
    const x = (1 - fingerTip.x) * window.innerWidth; // Invert x-coordinate
    const y = fingerTip.y * window.innerHeight;

    // Apply smooth movement
    const deltaX = x - lastX;
    const deltaY = y - lastY;
    lastX += deltaX * 0.1;
    lastY += deltaY * 0.1;

    // Update eye positions
    eyes.forEach((eye, index) => {
      const eyeRect = eye.getBoundingClientRect();
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;

      const angle = Math.atan2(lastY - eyeCenterY, lastX - eyeCenterX);
      const distance = Math.min(eyeRect.width / 4, eyeRect.height / 4);

      const pupilX = Math.cos(angle) * distance;
      const pupilY = Math.sin(angle) * distance;
      pupils[index].style.transform = `translate(-50%, -50%) translate(${pupilX}px, ${pupilY}px)`;

      const eyeMovementX = pupilX * 0.2;
      const eyeMovementY = pupilY * 0.2;
      eye.style.transform = `translate(${eyeMovementX}px, ${eyeMovementY}px)`;
    });

    // Draw only index finger landmarks
    canvasCtx.beginPath();
    canvasCtx.moveTo(
      (1 - fingerBase.x) * canvasElement.width,
      fingerBase.y * canvasElement.height
    );
    canvasCtx.lineTo(
      (1 - fingerTip.x) * canvasElement.width,
      fingerTip.y * canvasElement.height
    );
    canvasCtx.strokeStyle = '#00ff00';
    canvasCtx.lineWidth = 2;
    canvasCtx.stroke();

    // Draw dots at base and tip
    [fingerBase, fingerTip].forEach(point => {
      canvasCtx.beginPath();
      canvasCtx.arc(
        (1 - point.x) * canvasElement.width,
        point.y * canvasElement.height,
        4,
        0,
        2 * Math.PI
      );
      canvasCtx.fillStyle = '#00ff00';
      canvasCtx.fill();
    });
  }
  canvasCtx.restore();
}

// Set up MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

// Set up camera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 200,
  height: 150
});

camera.start();
