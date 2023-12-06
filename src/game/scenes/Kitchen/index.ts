import { ImageButton } from '../../objects/Buttons/Image';
import { CraftingService } from '../../services/crafting';
import { Action } from '../../services/crafting/action';
import { Item } from '../../services/crafting/item';
import { Ingredient, Recipe } from '../../services/crafting/recipe';
import { BasicScene } from '../Basic/BasicScene';

export class KitchenScene extends BasicScene {
    public needLoading = true;
    public manualLoadingProcess = true;
    private isLevelFinish = false;

    private craftingService!: CraftingService;

    private mainFoodItems: ImageButton[] = []; // 食材
    private sideDishes: ImageButton[] = []; // 配菜
    private seasonings: ImageButton[] = []; // 调味品

    public async load(canvas: HTMLCanvasElement, setCurrentProcess?: (process: number) => void) {
        this.craftingService = new CraftingService();
        this.craftingService.addRecipe(new Recipe({
            ingredients: [{
                metadate: {
                    name: 'test'
                }
            }],
            results: []
        }));
    }
}