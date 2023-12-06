import { Ingredient, Recipe } from "./recipe";

export class CraftingService {
    private recipes: Recipe[];
    constructor() {
        this.recipes = [];
    }
    addRecipe(recipe: Recipe) {
        this.recipes.push(recipe);
    }
    getRecipes() {
        return this.recipes;
    }
    getRecipeByResult(result: Ingredient) {
        return this.recipes.find((recipe) => recipe.results.includes(result));
    }
    getRecipeByIngredient(ingredient: Ingredient) {
        return this.recipes.find((recipe) => recipe.ingredients.includes(ingredient));
    }
    getRecipeByIngredients(ingredients: Ingredient[]) {
        return this.recipes.filter((recipe) => ingredients.every((ingredient) => recipe.ingredients.includes(ingredient)));
    }
}