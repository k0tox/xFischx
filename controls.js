// controls.js
export const keysPressed = {};

window.addEventListener("keydown", e => keysPressed[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keysPressed[e.key.toLowerCase()] = false);

export function isKeyPressed(key) {
    return !!keysPressed[key.toLowerCase()];
}
