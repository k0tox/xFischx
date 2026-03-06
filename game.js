// =====================
// Day–night cycle
// =====================
AFRAME.registerComponent('day-night-cycle', {
  schema: { speed: { default: 0.05 } },
  init() { this.angle = 0; },
  tick(time, delta) {
    const sun = document.querySelector('#sunLight');
    const moon = document.querySelector('#moonLight');
    const d = delta / 1000;
    this.angle += d * this.data.speed;
    sun.object3D.rotation.x = this.angle;
    moon.object3D.rotation.x = this.angle + Math.PI;
  }
});

// =====================
// Core state
// =====================
let money = 0;
let level = 1;
let xp = 0;
let streak = 0;

let currentRod = "Driftwood Rod";
let currentBait = "Glowworms";
let currentTotem = "Totem of Fortune";

let currentSlot = 1;
let inventoryOpen = false;
let thirdPerson = false;

const moneyEl = document.getElementById("money");
const levelEl = document.getElementById("level");
const streakEl = document.getElementById("streak");
const weatherEl = document.getElementById("weather");
const inventoryEl = document.getElementById("inventory");
const levelText = document.getElementById("levelText");
const fishAlert = document.getElementById("fishAlert");
const rodInHand = document.getElementById("rodInHand");

function updateHUD() {
  moneyEl.textContent = "Money: " + money;
  levelEl.textContent = "Level: " + level;
  streakEl.textContent = "Streak: " + streak;
  levelText.setAttribute("text", "value", "Lv " + level);
}
updateHUD();

// =====================
// Weather
// =====================
const weatherTypes = ["Clear", "Rain", "Storm", "Fog"];
let currentWeather = "Clear";

function randomWeather() {
  currentWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
  weatherEl.textContent = "Weather: " + currentWeather;
}
randomWeather();
setInterval(randomWeather, 60000);

// =====================
// Rods (stats shell)
// =====================
const rods = [
  {
    name: "Driftwood Rod",
    resilience: 1.0,
    luck: 1.0,
    control: 1.0,
    lureSpeed: 1.0,
    progressSpeed: 1.0,
    cost: 0
  },
  {
    name: "Ironline Rod",
    resilience: 1.1,
    luck: 1.05,
    control: 1.1,
    lureSpeed: 1.05,
    progressSpeed: 1.05,
    cost: 500
  }
  // add more rods later to match Fisch count
];

// =====================
// Fish list
// =====================
const fishList = [
  { name: "Sunscale Trout", rarity: "common", sellValue: 10, xp: 5 },
  { name: "Pebble Minnow", rarity: "common", sellValue: 12, xp: 6 },
  { name: "Reedflicker", rarity: "common", sellValue: 15, xp: 7 },

  { name: "Moonfin Eel", rarity: "uncommon", sellValue: 25, xp: 12 },
  { name: "Stormtail Perch", rarity: "uncommon", sellValue: 30, xp: 14 },
  { name: "Crystal Darter", rarity: "uncommon", sellValue: 35, xp: 16 },

  { name: "Stormback Ray", rarity: "rare", sellValue: 75, xp: 30 },
  { name: "Frostjaw Salmon", rarity: "rare", sellValue: 90, xp: 35 },
  { name: "Ember Pike", rarity: "rare", sellValue: 110, xp: 40 },

  { name: "Crystal Carp", rarity: "legendary", sellValue: 250, xp: 80 },
  { name: "Thunderfin Barracuda", rarity: "legendary", sellValue: 300, xp: 90 },
  { name: "Glacier Manta", rarity: "legendary", sellValue: 350, xp: 100 },

  { name: "Abyssal Leviathan", rarity: "mythic", sellValue: 1000, xp: 300 },
  { name: "Solar Serpent", rarity: "mythic", sellValue: 1200, xp: 350 },
  { name: "Eclipse Phantom", rarity: "mythic", sellValue: 1500, xp: 400 }
];

// =====================
// Leveling
// =====================
function addXP(amount) {
  xp += amount;
  let needed = level * 100;
  while (xp >= needed) {
    xp -= needed;
    level++;
    needed = level * 100;
  }
  updateHUD();
}

// =====================
// Hotbar + inventory + camera mode
// =====================
function setSlot(slot) {
  currentSlot = slot;
  document.querySelectorAll(".slot").forEach(s => {
    s.classList.toggle("selected", Number(s.dataset.slot) === slot);
  });
  rodInHand.setAttribute("visible", currentSlot === 1);
}

document.addEventListener("keydown", (e) => {
  if (e.key >= "1" && e.key <= "9") {
    setSlot(Number(e.key));
  }

  if (e.key === "Tab") {
    e.preventDefault();
    inventoryOpen = !inventoryOpen;
    inventoryEl.classList.toggle("hidden", !inventoryOpen);
  }

  if (e.key.toLowerCase() === "v") {
    toggleCameraMode();
  }
});

function toggleCameraMode() {
  const rig = document.getElementById("rig");
  const camera = document.getElementById("camera");
  thirdPerson = !thirdPerson;
  if (thirdPerson) {
    camera.setAttribute("position", "0 1.5 3");
  } else {
    camera.setAttribute("position", "0 0 0");
  }
}

// =====================
// Fishing minigame (horizontal, streak, start progress)
// =====================
let fishingH = false;
let fishX = 150;
let fishSpeedH = 1.5;
let catchX = 150;
let progressH = 0;
let rarityConfig = null;
let fishMovementType = "smooth";
let mouseDown = false;
let currentFish = null;

const fishingUIH = document.getElementById("fishingUI");
const fishMarkerH = document.getElementById("fishMarkerH");
const catchZoneH = document.getElementById("catchZoneH");
const progressInnerH = document.getElementById("progressInnerH");

const raritySettings = {
  common:    { start: 20, speed: 1.2, drain: 0.4, gain: 0.7, movement: "smooth", color: "#ffffff" },
  uncommon:  { start: 20, speed: 1.5, drain: 0.6, gain: 0.7, movement: "smooth", color: "#00ff00" },
  rare:      { start: 15, speed: 2.0, drain: 0.8, gain: 0.6, movement: "jitter", color: "#007bff" },
  legendary: { start: 10, speed: 2.4, drain: 1.0, gain: 0.5, movement: "drift",  color: "#ff00ff" },
  mythic:    { start: 5,  speed: 3.0, drain: 1.3, gain: 0.45, movement: "chaos", color: "#ffa500" }
};

function startFishingH(fish) {
  currentFish = fish;
  const r = raritySettings[fish.rarity];

  fishingH = true;
  fishingUIH.classList.remove("hidden");

  rarityConfig = r;
  fishSpeedH = r.speed;
  fishMovementType = r.movement;

  fishX = 150;
  catchX = 150;
  progressH = r.start;

  progressInnerH.style.width = progressH + "%";

  // ! marker above head with rarity color
  fishAlert.setAttribute("visible", true);
  fishAlert.setAttribute("text", "color", r.color);

  requestAnimationFrame(fishingLoopH);
}

function endFishingH(success) {
  fishingH = false;
  fishingUIH.classList.add("hidden");
  fishAlert.setAttribute("visible", false);

  if (success && currentFish) {
    money += currentFish.sellValue;
    addXP(currentFish.xp);
    streak++;
    updateHUD();
    alert("You caught a " + currentFish.name + " (" + currentFish.rarity + ")!");
  } else {
    // lose fish, reset streak
    streak = 0;
    updateHUD();
    alert("The fish escaped!");
  }

  currentFish = null;
}

function moveFishPattern() {
  if (fishMovementType === "smooth") {
    fishX += fishSpeedH;
  } else if (fishMovementType === "jitter") {
    fishX += fishSpeedH + (Math.random() * 2 - 1);
  } else if (fishMovementType === "drift") {
    fishX += fishSpeedH * 0.7 + Math.sin(Date.now() / 200) * 2;
  } else if (fishMovementType === "chaos") {
    fishX += fishSpeedH * (Math.random() * 2);
  }

  if (fishX <= 0 || fishX >= 280) fishSpeedH *= -1;
}

function fishingLoopH() {
  if (!fishingH) return;

  moveFishPattern();

  if (mouseDown) catchX += 3;
  else catchX -= 3;

  catchX = Math.max(0, Math.min(240, catchX));

  fishMarkerH.style.left = fishX + "px";
  catchZoneH.style.left = catchX + "px";

  const overlap = catchX < fishX + 20 && catchX + 60 > fishX;

  if (overlap) {
    progressH += rarityConfig.gain;
  } else {
    progressH -= rarityConfig.drain;
  }

  progressH = Math.max(0, Math.min(100, progressH));
  progressInnerH.style.width = progressH + "%";

  if (progressH >= 100) {
    return endFishingH(true);
  }
  if (progressH <= 0) {
    return endFishingH(false);
  }

  requestAnimationFrame(fishingLoopH);
}

document.addEventListener("mousedown", () => {
  if (fishingH) mouseDown = true;
});
document.addEventListener("mouseup", () => {
  if (fishingH) mouseDown = false;
});

// =====================
// Interaction: E to interact, left click to fish
// =====================
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "e") {
    // later: open shops, talk to NPCs, etc.
  }
});

document.addEventListener("click", () => {
  if (fishingH) return;
  if (currentSlot !== 1) return; // must have rod selected

  const rig = document.getElementById("rig");
  const fishingSpot = document.getElementById("fishingSpot");
  const pos = rig.object3D.position;
  const spotPos = fishingSpot.object3D.position;
  const dist = pos.distanceTo(spotPos);

  if (dist < 5) {
    const fish = fishList[Math.floor(Math.random() * fishList.length)];
    startFishingH(fish);
  }
});
