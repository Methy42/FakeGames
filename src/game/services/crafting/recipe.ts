import { Action } from "./action";
import { Item } from "./item";

export type Ingredient = Item | Action | { metadate?: any };

export class Recipe {
    ingredients: Ingredient[];
    results: (Item | Action)[];
    constructor(props?: { ingredients: Ingredient[], results: (Item | Action)[] }) {
        this.ingredients = props?.ingredients ?? [];
        this.results = props?.results ?? [];
    }
    addIngredient(ingredient: Ingredient) {
        this.ingredients.push(ingredient);
    }
    addResult(result: Item | Action) {
        this.results.push(result);
    }
}