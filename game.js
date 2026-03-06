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
// Game state
// =====================
let money = 0;
let level = 1;
let xp = 0;

let currentRod = "Driftwood Rod";
let currentBait = "Glowworms";
let currentTotem = "Totem of Fortune";

function updateHUD() {
  document.getElementById("money").textContent = "Money: " + money;
  document.getElementById("level").textContent = "Level: " + level;
  document.getElementById("rodName").textContent = "Rod: " + currentRod;
}
updateHUD();

// =====================
// Weather
// =====================
const weatherTypes = ["Clear", "Rain", "Storm", "Fog"];
let currentWeather = "Clear";

function randomWeather() {
  currentWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
  document.getElementById("weather").textContent = "Weather: " + currentWeather;
}
randomWeather();
setInterval(randomWeather, 60000);

// =====================
// Rods
// =====================
const rods = [
  { name: "Driftwood Rod", rarityBoost: 1.00 },
  { name: "Ironline Rod", rarityBoost: 1.05 },
  { name: "Stormcaster Rod", rarityBoost: 1.10 },
  { name: "Crystal Thread Rod", rarityBoost: 1.15 },
  { name: "Abyss Piercer Rod", rarityBoost: 1.20 },
  { name: "Solarforge Rod", rarityBoost: 1.25 },
  { name: "Lunarweave Rod", rarityBoost: 1.30 },
  { name: "Frostbite Rod", rarityBoost: 1.35 },
  { name: "Emberflare Rod", rarityBoost: 1.40 }
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
  { name: "Thunderfin Barracuda", rarity:  "legendary", sellValue: 300, xp: 90 },
  { name: "Glacier Manta", rarity: "legendary", sellValue: 350, xp: 100 },

  { name: "Abyssal Leviathan", rarity: "mythic", sellValue: 1000, xp: 300 },
  { name: "Solar Serpent", rarity: "mythic", sellValue: 1200, xp: 350 },
  { name: "Eclipse Phantom", rarity: "mythic", sellValue: 1500, xp: 400 }
];

// =====================
// Horizontal fishing minigame
// =====================
let fishingH = false;
let fishX = 150;
let fishSpeedH = 1.5;
let catchX = 150;
let progressH = 0;
let rarityConfig = null;
let fishMovementType = "smooth";
let mouseDown = false;

const fishingUIH = document.getElementById("fishingUI");
const fishMarkerH = document.getElementById("fishMarkerH");
const catchZoneH = document.getElementById("catchZoneH");
const progressInnerH = document.getElementById("progressInnerH");

const raritySettings = {
  common:    { speed: 1.2, drain: 0.4, gain: 0.7, movement: "smooth" },
  uncommon:  { speed: 1.5, drain: 0.6, gain: 0.7, movement: "smooth" },
  rare:      { speed: 2.0, drain: 0.8, gain: 0.6, movement: "jitter" },
  legendary: { speed: 2.4, drain: 1.0, gain: 0.5, movement: "drift" },
  mythic:    { speed: 3.0, drain: 1.3, gain: 0.45, movement: "chaos" }
};

function startFishingH(rarity = "common") {
  fishingH = true;
  fishingUIH.classList.remove("hidden");

  rarityConfig = raritySettings[rarity];
  fishSpeedH = rarityConfig.speed;
  fishMovementType = rarityConfig.movement;

  fishX = 150;
  catchX = 150;
  progressH = 0;

  requestAnimationFrame(fishingLoopH);
}

function endFishingH(success) {
  fishingH = false;
  fishingUIH.classList.add("hidden");

  if (success) {
    const caught = fishList[Math.floor(Math.random() * fishList.length)];
    money += caught.sellValue;
    xp += caught.xp;
    updateHUD();
    alert("You caught a " + caught.name + "!");
  }
}

function moveFishPattern() {
  if (fishMovementType === "smooth") fishX += fishSpeedH;
  if (fishMovementType === "jitter") fishX += fishSpeedH + (Math.random() * 2 - 1);
  if (fishMovementType === "drift") fishX += fishSpeedH * 0.7 + Math.sin(Date.now() / 200) * 2;
  if (fishMovementType === "chaos") fishX += fishSpeedH * (Math.random() * 2);

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

  if (overlap) progressH += rarityConfig.gain;
  else progressH -= rarityConfig.drain;

  progressH = Math.max(0, Math.min(100, progressH));
  progressInnerH.style.width = progressH + "%";

  if (progressH >= 100) return endFishingH(true);

  requestAnimationFrame(fishingLoopH);
}

document.addEventListener("mousedown", () => { if (fishingH) mouseDown = true; });
document.addEventListener("mouseup", () => { if (fishingH) mouseDown = false; });

document.addEventListener("click", () => {
  if (fishingH) return;

  const rig = document.querySelector("#rig");
  const fishingSpot = document.querySelector("#fishingSpot");

  const pos = rig.object3D.position;
  const spotPos = fishingSpot.object3D.position;

  const dist = pos.distanceTo(spotPos);

  if (dist < 5) {
    const chosen = fishList[Math.floor(Math.random() * fishList.length)];
    startFishingH(chosen.rarity);
  }
});
