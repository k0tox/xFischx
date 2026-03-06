// bestiary.js
export const fishList = [
    { id: 1, name: "Common Fisch", rarity: "common", size: "small" },
    { id: 2, name: "Golden Fisch", rarity: "rare", size: "medium" },
];

export function getFishById(id) {
    return fishList.find(f => f.id === id);
}

export function logAllFish() {
    console.table(fishList);
}
