// crafting.js
export const recipes = [
    { id: 1, name: "Fish Sandwich", ingredients: ["Common Fisch", "Bread"], result: "Sandwich" },
    { id: 2, name: "Golden Meal", ingredients: ["Golden Fisch", "Cheese"], result: "Golden Meal" }
];

export function craft(itemName, inventory) {
    const recipe = recipes.find(r => r.name === itemName);
    if (!recipe) return false;
    for (let ing of recipe.ingredients) {
        if (!inventory.includes(ing)) return false;
    }
    recipe.ingredients.forEach(ing => {
        const index = inventory.indexOf(ing);
        if (index >= 0) inventory.splice(index, 1);
    });
    inventory.push(recipe.result);
    return true;
}
