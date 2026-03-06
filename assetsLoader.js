// assetsLoader.js
export const assets = {};

export async function loadAssets() {
    // Example: load images, 3D models, textures
    const images = [
        { name: "fisch", src: "textures/fisch.png" },
        { name: "food", src: "textures/food.png" },
    ];

    for (let img of images) {
        const image = new Image();
        image.src = img.src;
        await new Promise(res => {
            image.onload = res;
        });
        assets[img.name] = image;
    }
    console.log("Assets loaded", assets);
}
