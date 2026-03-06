// fishing.js
import { Fish } from "./fish.js";
import { fishList } from "./bestiary.js";

export class Fishing {
    constructor(player) {
        this.player = player;
        this.isFishing = false;
        this.currentBait = null;
        this.caughtFish = [];
    }

    startFishing(baitId) {
        this.isFishing = true;
        this.currentBait = baitId;
    }

    reel() {
        if(!this.isFishing) return null;
        const possible = fishList.filter(f => f.bait.includes(this.currentBait));
        if(Math.random() < 0.5){
            const f = possible[Math.floor(Math.random()*possible.length)];
            const fish = new Fish(f.name, this.player.x, this.player.y, f.size, f.speed, "swim_random");
            this.caughtFish.push(fish);
            this.isFishing = false;
            return fish;
        }
        return null;
    }
}
