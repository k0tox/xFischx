// bestiary.js
export const fishList = [
    { id: 1, name: "Common Fisch", size: 15, speed: 2, rarity: "common", bait: [1,3], xp: 5 },
    { id: 2, name: "Golden Fisch", size: 25, speed: 3, rarity: "rare", bait: [2,3], xp: 20 },
    { id: 3, name: "Shadow Fisch", size: 35, speed: 4, rarity: "epic", bait: [2,4], xp: 50 }
];

export function getFishById(id) {
    return fishList.find(f => f.id === id);
}
