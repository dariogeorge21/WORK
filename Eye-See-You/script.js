const eyes = document.querySelectorAll('.eye');
const pupils = document.querySelectorAll('.pupil');

let lastX = window.innerWidth / 2;
let lastY = window.innerHeight / 2;

document.addEventListener('mousemove', (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // Apply a "lag" effect by calculating the movement difference
  const deltaX = mouseX - lastX;
  const deltaY = mouseY - lastY;

  // Apply a smaller step to simulate slower movement
  lastX += deltaX * 0.1;  // Slows down the cursor by scaling the difference
  lastY += deltaY * 0.1;  // Slows down the cursor by scaling the difference

  eyes.forEach((eye, index) => {
    const eyeRect = eye.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    const angle = Math.atan2(lastY - eyeCenterY, lastX - eyeCenterX);
    const distance = Math.min(eyeRect.width / 4, eyeRect.height / 4); // Limit the pupil movement

    // Move the pupil
    const pupilX = Math.cos(angle) * distance;
    const pupilY = Math.sin(angle) * distance;
    pupils[index].style.transform = `translate(-50%, -50%) translate(${pupilX}px, ${pupilY}px)`;

    // Move the eye
    const eyeMovementX = pupilX * 0.2;  // Slight eye movement
    const eyeMovementY = pupilY * 0.2;
    eye.style.transform = `translate(${eyeMovementX}px, ${eyeMovementY}px)`;
  });
});
