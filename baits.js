// baits.js
export const baits = [
    { id: 1, name: "Worm", value: 5 },
    { id: 2, name: "Insect", value: 10 },
    { id: 3, name: "Minnow", value: 15 },
    { id: 4, name: "Cricket", value: 8 },
    { id: 5, name: "Shrimp", value: 20 },
    { id: 6, name: "Corn", value: 3 },
    { id: 7, name: "Cheese", value: 4 },
    { id: 8, name: "Bread", value: 2 },
    { id: 9, name: "Artificial Lure", value: 25 },
    { id: 10, name: "Powerbait", value: 30 },
];

// Get bait by its ID
export function getBaitById(id) {
    return baits.find(b => b.id === id);
}

// Get bait by name
export function getBaitByName(name) {
    return baits.find(b => b.name.toLowerCase() === name.toLowerCase());
}

// List all baits (for debugging or UI)
export function listAllBaits() {
    console.table(baits);
}
