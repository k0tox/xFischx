// fish.js
import { CONFIG } from "./config.js";

export class Fish {
    constructor(name, x, y, size, speed, behavior) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.behavior = behavior;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
    }

    move(player) {
        if (this.behavior === "swim_random") {
            this.x += this.vx;
            this.y += this.vy;
        } else if (this.behavior === "avoid_player") {
            const dx = this.x - player.x;
            const dy = this.y - player.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < 100){
                this.x += dx/dist * this.speed;
                this.y += dy/dist * this.speed;
            }
        }
        this._clamp();
    }

    _clamp() {
        this.x = Math.max(0, Math.min(CONFIG.WIDTH, this.x));
        this.y = Math.max(0, Math.min(CONFIG.HEIGHT, this.y));
    }

    draw(ctx, Camera) {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(this.x - Camera.x, this.y - Camera.y, this.size, 0, Math.PI*2);
        ctx.fill();
    }
}
