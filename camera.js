// camera.js
export const Camera = { x: 0, y: 0, zoom: 1 };

export function follow(player, canvas) {
    Camera.x = player.x - canvas.width / 2;
    Camera.y = player.y - canvas.height / 2;
}
