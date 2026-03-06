// game.js
import { CONFIG } from "./config.js";
import { loadAssets } from "./assetsLoader.js";
import { Player } from "./player.js";
import { Camera, follow } from "./camera.js";
import { Fishing } from "./fishing.js";
import { keysPressed } from "./controls.js";
import { islands } from "./islands.js";

const canvas = document.getElementById("gameCanvas");
canvas.width = CONFIG.WIDTH;
canvas.height = CONFIG.HEIGHT;
const ctx = canvas.getContext("2d");

let player;
let fishing;

async function init() {
    await loadAssets();
    player = new Player(CONFIG.WIDTH/2, CONFIG.HEIGHT/2, 50);
    fishing = new Fishing(player);
    requestAnimationFrame(loop);
}

function loop() {
    ctx.clearRect(0,0,CONFIG.WIDTH, CONFIG.HEIGHT);
    player.update(keysPressed);
    follow(player, canvas);
    player.draw(ctx, Camera);

    // Draw islands
    islands.forEach(isle => {
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(isle.x - Camera.x, isle.y - Camera.y, isle.size, 0, Math.PI*2);
        ctx.fill();
    });

    requestAnimationFrame(loop);
}

init();
