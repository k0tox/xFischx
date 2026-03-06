// boats.js
export const boats = [
    { id: 1, name: "Row Boat", speed: 2, capacity: 2, texture: "boat_row" },
    { id: 2, name: "Motor Boat", speed: 5, capacity: 4, texture: "boat_motor" },
];

export function getBoatById(id) {
    return boats.find(b => b.id === id);
}
