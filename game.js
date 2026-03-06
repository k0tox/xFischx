// =====================
// Components
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

AFRAME.registerComponent('npc-sway', {
  tick(time) {
    const t = time / 1000;
    this.el.object3D.rotation.y = Math.sin(t) * 0.2;
  }
});

AFRAME.registerComponent('render-distance', {
  schema: { maxDistance: { default: 500 } },
  init() {
    this.camera = document.querySelector('#camera');
  },
  tick() {
    if (!this.camera) return;
    const camPos = new THREE.Vector3();
    this.camera.object3D.getWorldPosition(camPos);
    const objPos = new THREE.Vector3();
    this.el.object3D.getWorldPosition(objPos);
    const dist = camPos.distanceTo(objPos);
    this.el.object3D.visible = dist <= this.data.maxDistance;
  }
});

AFRAME.registerComponent('boat-controller', {
  init() {
    this.rig = document.querySelector('#rig');
    this.camera = document.querySelector('#camera');
    this.playerOnBoat = false;
    this.speed = 0;
    this.maxSpeed = 12;
    this.turnSpeed = 0.03;
    this.keys = {};
    window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
  },
  tick(time, delta) {
    if (!this.playerOnBoat) return;
    const d = delta / 1000;

    if (this.keys['w']) this.speed += 10 * d;
    if (this.keys['s']) this.speed -= 10 * d;
    this.speed *= 0.98;
    if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
    if (this.speed < -this.maxSpeed) this.speed = -this.maxSpeed;

    if (this.keys['a']) this.el.object3D.rotation.y += this.turnSpeed;
    if (this.keys['d']) this.el.object3D.rotation.y -= this.turnSpeed;

    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.el.object3D.quaternion);
    this.el.object3D.position.addScaledVector(forward, this.speed * d);

    const boatPos = this.el.object3D.position;
    this.rig.object3D.position.set(boatPos.x, boatPos.y + 1.2, boatPos.z);
  },
  sit() { this.playerOnBoat = true; },
  leave() { this.playerOnBoat = false; }
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

let homePosition = { x: 0, y: 3, z: 5 };

const moneyEl = document.getElementById("money");
const levelEl = document.getElementById("level");
const streakEl = document.getElementById("streak");
const weatherEl = document.getElementById("weather");
const inventoryEl = document.getElementById("inventory");
const bestiaryEl = document.getElementById("bestiary");
const rodBestiaryEl = document.getElementById("rodBestiary");
const escMenuEl = document.getElementById("escMenu");
const levelText = document.getElementById("levelText");
const fishAlert = document.getElementById("fishAlert");
const rodInHand = document.getElementById("rodInHand");
const radarInfo = document.getElementById("radarInfo");

const invCloseBtn = document.getElementById("invClose");
const bestiaryCloseBtn = document.getElementById("bestiaryClose");
const rodBestiaryCloseBtn = document.getElementById("rodBestiaryClose");
const escCloseBtn = document.getElementById("escClose");
const fovSlider = document.getElementById("fovSlider");

const rig = document.getElementById("rig");
const camera = document.getElementById("camera");

// Force all GUIs closed on load
inventoryEl.classList.add("hidden");
bestiaryEl.classList.add("hidden");
rodBestiaryEl.classList.add("hidden");
escMenuEl.classList.add("hidden");
document.getElementById("fishingUI").classList.add("hidden");

// Oxygen
let oxygen = 100;
const oxygenInner = document.getElementById("oxygenInner");
const WATER_LEVEL = 2;

function updateOxygenHUD() {
  oxygenInner.style.width = oxygen + "%";
}
updateOxygenHUD();

function updateHUD() {
  moneyEl.textContent = "Quents: " + money;
  levelEl.textContent = "Level: " + level;
  streakEl.textContent = "Streak: " + streak;
  levelText.setAttribute("text", "value", "Lv " + level);
}
updateHUD();

// Weather
const weatherTypes = ["Clear", "Rain", "Storm", "Fog"];
let currentWeather = "Clear";

function randomWeather() {
  currentWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
  weatherEl.textContent = "Weather: " + currentWeather;
}
randomWeather();
setInterval(randomWeather, 60000);

// Data
let fishList = [
  { name: "Sunscale Trout", rarity: "common", sellValue: 10, xp: 5, weight: 5, island: "spawn", boss: false },
  { name: "Pebble Minnow", rarity: "common", sellValue: 12, xp: 6, weight: 3, island: "spawn", boss: false },
  { name: "Reedflicker", rarity: "common", sellValue: 15, xp: 7, weight: 4, island: "spawn", boss: false },
  { name: "Moonfin Eel", rarity: "uncommon", sellValue: 25, xp: 12, weight: 10, island: "spawn", boss: false },
  { name: "Stormtail Perch", rarity: "uncommon", sellValue: 30, xp: 14, weight: 12, island: "spawn", boss: false },
  { name: "Stormback Ray", rarity: "rare", sellValue: 75, xp: 30, weight: 40, island: "spawn", boss: false },
  { name: "Frostjaw Salmon", rarity: "rare", sellValue: 90, xp: 35, weight: 45, island: "spawn", boss: false },
  { name: "Crystal Carp", rarity: "legendary", sellValue: 250, xp: 80, weight: 80, island: "spawn", boss: false },
  { name: "Abyssal Leviathan", rarity: "mythic", sellValue: 1000, xp: 300, weight: 500, island: "underground", boss: true }
];

let rods = [
  {
    name: "Driftwood Rod",
    resilience: 1.0,
    luck: 1.0,
    control: 1.0,
    lureSpeed: 1.0,
    progressSpeed: 1.0,
    maxWeight: 50,
    cost: 0
  },
  {
    name: "Ironline Rod",
    resilience: 1.1,
    luck: 1.05,
    control: 1.1,
    lureSpeed: 1.05,
    progressSpeed: 1.05,
    maxWeight: 150,
    cost: 500
  },
  {
    name: "Stormcaster Rod",
    resilience: 1.2,
    luck: 1.1,
    control: 1.15,
    lureSpeed: 1.1,
    progressSpeed: 1.1,
    maxWeight: 300,
    cost: 2500
  }
];

// Leveling
function addXP(amount) {
  xp += amount;
  let needed = level * 100;
  while (xp >= needed && level < 2000) {
    xp -= needed;
    level++;
    needed = level * 100;
  }
  if (level >= 2000) {
    level = 2000;
    xp = 0;
  }
  updateHUD();
}

// Oxygen / death
function respawnPlayer() {
  rig.setAttribute("position", `${homePosition.x} ${homePosition.y} ${homePosition.z}`);
}

function handleDeath() {
  const loss = Math.floor(money * 0.05);
  money = Math.max(0, money - loss);
  streak = 0;
  oxygen = 100;
  updateOxygenHUD();
  updateHUD();
  respawnPlayer();
  alert("You drowned and lost " + loss + " Quents.");
}

setInterval(() => {
  const camWorldPos = new THREE.Vector3();
  camera.object3D.getWorldPosition(camWorldPos);

  const underwater = camWorldPos.y < WATER_LEVEL - 0.2;

  if (underwater) {
    oxygen -= 1;
    if (oxygen <= 0) {
      oxygen = 0;
      handleDeath();
    }
  } else {
    oxygen += 1;
    if (oxygen > 100) oxygen = 100;
  }
  updateOxygenHUD();
}, 200);

// Hotbar / camera / ESC / inventory
function setSlot(slot) {
  currentSlot = slot;
  document.querySelectorAll(".slot").forEach(s => {
    s.classList.toggle("selected", Number(s.dataset.slot) === slot);
  });
  rodInHand.setAttribute("visible", currentSlot === 1);
  if (slot === 3) bestiaryEl.classList.remove("hidden");
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

  if (e.key.toLowerCase() === "h") {
    respawnPlayer();
  }

  if (e.key === "Escape") {
    const isHidden = escMenuEl.classList.contains("hidden");
    escMenuEl.classList.toggle("hidden", !isHidden);
  }

  if (e.key.toLowerCase() === "e") {
    handleInteract();
  }
});

function toggleCameraMode() {
  thirdPerson = !thirdPerson;
  if (thirdPerson) {
    camera.setAttribute("position", "0 1.5 3");
  } else {
    camera.setAttribute("position", "0 0 0");
  }
}

// Right-click orbit in TP
let rotatingTP = false;
let lastX = 0;

document.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("mousedown", (e) => {
  if (e.button === 2 && thirdPerson) {
    rotatingTP = true;
    lastX = e.clientX;
  }
});

document.addEventListener("mouseup", (e) => {
  if (e.button === 2) rotatingTP = false;
});

document.addEventListener("mousemove", (e) => {
  if (!rotatingTP || !thirdPerson) return;
  const dx = e.clientX - lastX;
  lastX = e.clientX;
  const rigObj = rig.object3D;
  rigObj.rotation.y -= dx * 0.005;
});

// Close buttons
invCloseBtn.addEventListener("click", () => {
  inventoryOpen = false;
  inventoryEl.classList.add("hidden");
});
bestiaryCloseBtn.addEventListener("click", () => {
  bestiaryEl.classList.add("hidden");
});
rodBestiaryCloseBtn.addEventListener("click", () => {
  rodBestiaryEl.classList.add("hidden");
});
escCloseBtn.addEventListener("click", () => {
  escMenuEl.classList.add("hidden");
});

// FOV slider
fovSlider.addEventListener("input", () => {
  const v = Number(fovSlider.value);
  camera.setAttribute("camera", "fov", v);
});

// Fishing minigame
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

  const rod = rods.find(ro => ro.name === currentRod) || rods[0];
  if (fish.weight > rod.maxWeight) {
    alert("This fish is too heavy for your rod! (Max " + rod.maxWeight + "kg)");
    currentFish = null;
    return;
  }

  fishingH = true;
  fishingUIH.classList.remove("hidden");

  rarityConfig = r;
  fishSpeedH = r.speed;
  fishMovementType = r.movement;

  fishX = 150;
  catchX = 150;
  progressH = r.start;
  progressInnerH.style.width = progressH + "%";

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

  if (progressH >= 100) return endFishingH(true);
  if (progressH <= 0) return endFishingH(false);

  requestAnimationFrame(fishingLoopH);
}

document.addEventListener("mousedown", (e) => {
  if (e.button === 0 && fishingH) mouseDown = true;
});
document.addEventListener("mouseup", (e) => {
  if (e.button === 0 && fishingH) mouseDown = false;
});

// Interact
function handleInteract() {
  const rigPos = rig.object3D.position;

  const homeNPC = document.getElementById("homeNPC");
  const merchantNPC = document.getElementById("merchantNPC");
  const appraiserNPC = document.getElementById("appraiserNPC");
  const waterSpout = document.getElementById("waterSpout");
  const boat1 = document.getElementById("boat1");

  function distTo(el) {
    const p = el.object3D.position;
    return rigPos.distanceTo(p);
  }

  if (distTo(homeNPC) < 4) {
    if (money >= 50) {
      money -= 50;
      homePosition = { x: rigPos.x, y: rigPos.y, z: rigPos.z };
      updateHUD();
      alert("Home set here for 50 Quents.");
    } else {
      alert("You need 50 Quents to set home.");
    }
    return;
  }

  if (distTo(merchantNPC) < 4) {
    alert("Merchant: rods, bait, boats will be sold here later.");
    return;
  }

  if (distTo(appraiserNPC) < 4) {
    alert("Appraiser: rare fish and items will be valued here later.");
    return;
  }

  if (distTo(waterSpout) < 3) {
    rig.setAttribute("position", "0 -15 0");
    return;
  }

  if (distTo(boat1) < 4) {
    const boatComp = boat1.components['boat-controller'];
    if (boatComp.playerOnBoat) {
      boatComp.leave();
      alert("You left the boat.");
    } else {
      boatComp.sit();
      alert("You sat on the boat. Use WASD to move.");
    }
    return;
  }
}

// Fishing trigger
document.addEventListener("click", (e) => {
  if (fishingH) return;
  if (currentSlot !== 1) return;

  const fishingSpot = document.getElementById("fishingSpot");
  const pos = rig.object3D.position;
  const spotPos = fishingSpot.object3D.position;
  const dist = pos.distanceTo(spotPos);

  if (dist < 6 && fishList.length > 0) {
    const fish = fishList[Math.floor(Math.random() * fishList.length)];
    startFishingH(fish);
  }
});

// Radar
setInterval(() => {
  if (!currentFish) {
    radarInfo.textContent = "No target";
  } else {
    radarInfo.textContent = currentFish.name + " (" + currentFish.rarity + ")";
  }
}, 500);

async function generateFishFromRules() {
  const rules = await fetch("fish-rules.json").then(r => r.json());
  const fish = [];

  const rarityOrder = ["common", "uncommon", "rare", "legendary", "mythic", "exotic"];

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRarity(weights) {
    const entries = Object.entries(weights);
    const total = entries.reduce((a, b) => a + b[1], 0);
    let roll = Math.random() * total;

    for (const [rarity, weight] of entries) {
      if (roll < weight) return rarity;
      roll -= weight;
    }
    return "common";
  }

  function randomName(rarity) {
    const prefixes = {
      common: ["Pebble", "River", "Sun", "Reed", "Shore", "Tiny"],
      uncommon: ["Moon", "Storm", "Wind", "Tide", "Silver"],
      rare: ["Frost", "Crystal", "Shadow", "Iron", "Thunder"],
      legendary: ["Ancient", "Radiant", "Phantom", "Solar", "Eternal"],
      mythic: ["Abyssal", "Titanic", "Leviathan", "Eldritch", "Primordial"],
      exotic: ["Celestial", "Voidborn", "Astral", "Eclipse", "Galactic"]
    };

    const suffixes = ["Trout", "Minnow", "Eel", "Ray", "Salmon", "Carp", "Snapper", "Bass"];

    const p = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${p} ${s}`;
  }

  for (const island of rules.islands) {
    for (let i = 0; i < island.fishCount; i++) {
      const rarity = pickRarity(island.rarityWeights);
      const [minW, maxW] = island.weightRanges[rarity];
      const weight = rand(minW, maxW);

      const rarityIndex = rarityOrder.indexOf(rarity);

      const sellValue = Math.floor(weight * (1 + rarityIndex * 1.2));
      const xp = Math.floor(weight * (0.7 + rarityIndex * 0.6));

      fish.push({
        name: randomName(rarity),
        rarity,
        weight,
        sellValue,
        xp,
        island: island.name,
        boss: false
      });
    }
  }

  return fish;
}

let fishList = [];
generateFishFromRules().then(f => fishList = f);
