// =====================
// Day–night cycle
// =====================
AFRAME.registerComponent('day-night-cycle', {
  schema: { speed: { default: 0.05 } },
  init() { this.angle = 0; },
  tick(time, delta) {
    const sun = document.querySelector('#sunLight');
    const moon = document.querySelector('#moonLight');
    if (!sun || !moon) return;
    const d = delta / 1000;
    this.angle += d * this.data.speed;
    sun.object3D.rotation.x = this.angle;
    moon.object3D.rotation.x = this.angle + Math.PI;
  }
});

// =====================
// Basic game state
// =====================
let money = 0;
let level = 1;
let currentRod = "Driftwood Rod";
let currentBait = "Glowworms";
let currentTotem = "Totem of Fortune";

const moneyEl = document.getElementById("money");
const levelEl = document.getElementById("level");
const weatherEl = document.getElementById("weather");
const rodNameEl = document.getElementById("rodName");

function updateHUD() {
  moneyEl.textContent = "Money: " + money;
  levelEl.textContent = "Level: " + level;
  rodNameEl.textContent = "Rod: " + currentRod;
}
updateHUD();

// =====================
// Weather system
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
// Data: rods, bait, fish
// (expand these lists to match Fisch counts)
// =====================
const rods = [
  "Driftwood Rod",
  "Ironline Rod",
  "Stormcaster Rod",
  "Crystal Thread Rod",
  "Abyss Piercer Rod",
  "Solarforge Rod",
  "Lunarweave Rod",
  "Frostbite Rod",
  "Emberflare Rod"
];

const baitList = [
  "Glowworms",
  "Iron Minnows",
  "Storm Larvae",
  "Crystal Shrimp",
  "Abyssal Grubs"
];

const fishList = [
  { name: "Sunscale Trout", rarity: "common" },
  { name: "Moonfin Eel", rarity: "uncommon" },
  { name: "Stormback Ray", rarity: "rare" },
  { name: "Crystal Carp", rarity: "legendary" },
  { name: "Abyssal Leviathan", rarity: "mythic" }
];

// Rod / bait / totem bonuses (structure like Fisch)
const rodBonuses = {
  "Driftwood Rod": 1.0,
  "Ironline Rod": 1.05,
  "Stormcaster Rod": 1.1,
  "Crystal Thread Rod": 1.15,
  "Abyss Piercer Rod": 1.2,
  "Solarforge Rod": 1.25,
  "Lunarweave Rod": 1.3,
  "Frostbite Rod": 1.35,
  "Emberflare Rod": 1.4
};

const baitBonuses = {
  "Glowworms": 1.0,
  "Iron Minnows": 1.05,
  "Storm Larvae": 1.1,
  "Crystal Shrimp": 1.15,
  "Abyssal Grubs": 1.2
};

const totemBonuses = {
  "Totem of Fortune": 1.05,
  "Totem of Storms": 1.1,
  "Totem of Depth": 1.15,
  "Totem of Swiftness": 1.2,
  "Totem of Calm Waters": 1.25
};

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

// Rarity settings (tune to feel like Fisch)
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

  rarityConfig = raritySettings[rarity] || raritySettings.common;
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
    money += Math.floor(Math.random() * 50) + 10;
    updateHUD();
    alert("You caught a " + caught.name + " (" + caught.rarity + ")!");
  }
}

function moveFishPattern() {
  if (!rarityConfig) return;

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

  // Catch zone movement
  if (mouseDown) {
    catchX += 3;
  } else {
    catchX -= 3;
  }
  catchX = Math.max(0, Math.min(240, catchX));

  fishMarkerH.style.left = fishX + "px";
  catchZoneH.style.left = catchX + "px";

  // Overlap check
  const overlap =
    catchX < fishX + 20 &&
    catchX + 60 > fishX;

  const rodBoost = rodBonuses[currentRod] || 1;
  const baitBoost = baitBonuses[currentBait] || 1;
  const totemBoost = totemBonuses[currentTotem] || 1;
  const totalBoost = rodBoost * baitBoost * totemBoost;

  if (overlap) {
    progressH += rarityConfig.gain * totalBoost;
  } else {
    progressH -= rarityConfig.drain;
  }

  progressH = Math.max(0, Math.min(100, progressH));
  progressInnerH.style.width = progressH + "%";

  if (progressH >= 100) {
    endFishingH(true);
    return;
  }

  requestAnimationFrame(fishingLoopH);
}

// Mouse control
document.addEventListener("mousedown", () => {
  if (fishingH) mouseDown = true;
});

document.addEventListener("mouseup", () => {
  if (fishingH) mouseDown = false;
});

// Click to start fishing when near spot
document.addEventListener("click", () => {
  if (fishingH) return;

  const rig = document.querySelector("#rig");
  const fishingSpot = document.querySelector("#fishingSpot");

  if (!rig || !fishingSpot) return;

  const pos = rig.object3D.position;
  const spotPos = fishingSpot.object3D.position;

  const dist = pos.distanceTo(spotPos);

  if (dist < 5) {
    // Pick a random fish and use its rarity
    const chosen = fishList[Math.floor(Math.random() * fishList.length)];
    startFishingH(chosen.rarity);
  }
});
