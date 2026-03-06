// camera.js
export const camera = {
    x: 0,
    y: 0,
    zoom: 1
};

export function moveCamera(dx, dy) {
    camera.x += dx;
    camera.y += dy;
}

export function setZoom(z) {
    camera.zoom = z;
}
