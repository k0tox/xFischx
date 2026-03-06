// assetsLoader.js
export const assets = {};

export async function loadAssets() {
    const images = [
        { name: "fisch", src: "textures/fisch.png" },
        { name: "rod_basic", src: "textures/rod_basic.png" },
        { name: "rod_advanced", src: "textures/rod_advanced.png" },
        { name: "bait_worm", src: "textures/bait_worm.png" },
        { name: "bait_shrimp", src: "textures/bait_shrimp.png" },
        { name: "grass", src: "textures/grass.png" },
        { name: "water", src: "textures/water.png" },
        { name: "boat_row", src: "textures/boat_row.png" }
    ];

    for (const img of images) {
        const image = new Image();
        image.src = img.src;
        await new Promise(resolve => image.onload = resolve);
        assets[img.name] = image;
    }
    console.log("All assets loaded:", Object.keys(assets));
}
