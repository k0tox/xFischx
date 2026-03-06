// boats.js
export const boats = [
    { id: 1, name: "Row Boat", speed: 2 },
    { id: 2, name: "Motor Boat", speed: 5 },
];

export function getBoatById(id) {
    return boats.find(b => b.id === id);
}
