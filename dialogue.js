// dialogue.js
export class Dialogue {
    constructor() {
        this.queue = [];
        this.active = false;
        this.currentText = "";
    }

    add(text) { this.queue.push(text); }
    next() {
        if (this.queue.length > 0) {
            this.currentText = this.queue.shift();
            this.active = true;
        } else {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(50, 500, 700, 100);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(this.currentText, 70, 550);
    }
}
