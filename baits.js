// baits.js
export const baits = [
    { id: 1, name: "Worm", value: 5, texture: "bait_worm" },
    { id: 2, name: "Shrimp", value: 20, texture: "bait_shrimp" },
    { id: 3, name: "Minnow", value: 15, texture: "bait_minnow" },
    { id: 4, name: "Cricket", value: 10, texture: "bait_cricket" }
];

export function getBaitById(id) {
    return baits.find(b => b.id === id);
}
