const arena = document.querySelector("#arena");
const dog = document.querySelector("#dog");
const burstLayer = document.querySelector("#burstLayer");
const scoreLabel = document.querySelector("#score");
const dodgesLabel = document.querySelector("#dodges");
const statusLabel = document.querySelector("#status");
const resetButton = document.querySelector("#resetButton");

const messages = {
  start: [
    "Suspicious",
    "Already judging you",
    "Mildly alarmed",
    "Ready to bolt",
  ],
  dodge: [
    "Too slow",
    "Absolutely not",
    "Nice try",
    "Dog: 1, human: 0",
    "Outplayed again",
  ],
  catch: [
    "Unbelievable",
    "Temporarily caught",
    "That should not have worked",
    "The dog respects you now",
  ],
  rest: [
    "Feeling cocky",
    "Briefly distracted",
    "Pretending to be easy",
  ],
};

const state = {
  score: 0,
  dodges: 0,
  dogX: 0,
  dogY: 0,
  restUntil: 0,
  lastMoveAt: 0,
  width: 108,
  height: 108,
};

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateHud() {
  scoreLabel.textContent = String(state.score);
  dodgesLabel.textContent = String(state.dodges);
}

function setStatus(group) {
  statusLabel.textContent = randomFrom(messages[group]);
}

function syncDogSize() {
  const rect = dog.getBoundingClientRect();
  state.width = rect.width;
  state.height = rect.height;
}

function placeDog(x, y) {
  state.dogX = x;
  state.dogY = y;
  dog.style.left = `${x}px`;
  dog.style.top = `${y}px`;
}

function getArenaBounds() {
  const rect = arena.getBoundingClientRect();
  const maxX = Math.max(0, rect.width - state.width);
  const maxY = Math.max(0, rect.height - state.height);

  return { rect, maxX, maxY };
}

function randomDogPosition(pointerX = null, pointerY = null) {
  const { maxX, maxY } = getArenaBounds();
  const padding = 12;
  const minX = maxX > padding * 2 ? padding : 0;
  const minY = maxY > padding * 2 ? padding : 0;
  const maxSafeX = maxX > padding * 2 ? maxX - padding : maxX;
  const maxSafeY = maxY > padding * 2 ? maxY - padding : maxY;
  let nextX = Math.random() * maxX;
  let nextY = Math.random() * maxY;
  let attempts = 0;

  while (pointerX !== null && attempts < 40) {
    const dx = nextX + state.width / 2 - pointerX;
    const dy = nextY + state.height / 2 - pointerY;
    const distance = Math.hypot(dx, dy);

    if (distance > 170) {
      break;
    }

    nextX = Math.random() * maxX;
    nextY = Math.random() * maxY;
    attempts += 1;
  }

  return {
    x: clamp(nextX, minX, maxSafeX),
    y: clamp(nextY, minY, maxSafeY),
  };
}

function centerDog() {
  const { maxX, maxY } = getArenaBounds();

  placeDog(maxX / 2, maxY / 2);
}

function canRest() {
  return state.dodges > 0 && state.dodges % 7 === 0;
}

function dodge(pointerX, pointerY) {
  const now = performance.now();

  if (now < state.restUntil || now - state.lastMoveAt < 110) {
    return;
  }

  const next = randomDogPosition(pointerX, pointerY);
  placeDog(next.x, next.y);
  state.dodges += 1;
  state.lastMoveAt = now;
  dog.classList.remove("resting");
  dog.classList.add("escape");
  setTimeout(() => dog.classList.remove("escape"), 180);

  if (canRest()) {
    state.restUntil = now + 900;
    dog.classList.add("resting");
    setStatus("rest");
  } else {
    setStatus("dodge");
  }

  updateHud();
}

function pointerToArena(event) {
  const { rect } = getArenaBounds();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function maybeDodge(event) {
  const now = performance.now();

  if (now < state.restUntil) {
    return;
  }

  const pointer = pointerToArena(event);
  const dogCenterX = state.dogX + state.width / 2;
  const dogCenterY = state.dogY + state.height / 2;
  const distance = Math.hypot(pointer.x - dogCenterX, pointer.y - dogCenterY);
  const dangerRadius = window.matchMedia("(max-width: 700px)").matches
    ? 120
    : 150;

  if (distance < dangerRadius) {
    dodge(pointer.x, pointer.y);
  }
}

function createBurst(x, y) {
  const colors = ["", "alt"];

  for (let index = 0; index < 14; index += 1) {
    const burst = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 14;
    const velocity = 18 + Math.random() * 42;

    burst.className = `burst ${randomFrom(colors)}`.trim();
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    burst.style.setProperty("--x", `${Math.cos(angle) * velocity}px`);
    burst.style.setProperty("--y", `${Math.sin(angle) * velocity}px`);
    burstLayer.appendChild(burst);
    setTimeout(() => burst.remove(), 720);
  }
}

function handleCatch() {
  const centerX = state.dogX + state.width / 2;
  const centerY = state.dogY + state.height / 2;

  state.score += 1;
  dog.classList.remove("resting");
  updateHud();
  setStatus("catch");
  createBurst(centerX, centerY);
  state.restUntil = performance.now() + 500;
  setTimeout(() => {
    const next = randomDogPosition();
    placeDog(next.x, next.y);
  }, 180);
}

function resetGame() {
  state.score = 0;
  state.dodges = 0;
  state.restUntil = 0;
  state.lastMoveAt = 0;
  updateHud();
  setStatus("start");
  dog.classList.remove("resting");
  centerDog();
}

arena.addEventListener("pointermove", maybeDodge);
arena.addEventListener("pointerdown", maybeDodge);
dog.addEventListener("click", handleCatch);
resetButton.addEventListener("click", resetGame);
window.addEventListener("resize", () => {
  syncDogSize();
  centerDog();
});

syncDogSize();
resetGame();
