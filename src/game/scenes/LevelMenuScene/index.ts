import { ImageButton } from "../../objects/Buttons/Image";
import { UIActionEvent, bindClickEvent, unbindEvent } from "../../controls/UIActionControls";
import { getCurrentRouteParams, setCurrentRoute } from "../../routers";
import { BasicScene } from "../Basic/BasicScene";

import { LevelSelectorObject } from "./objects/LevelSelectorObject";
import { initAssetsStore } from "../../store/InitAssets";

export interface ILevelMenuSceneRouteParams {
    type: "simple" | "difficulty"
};

export class LevelMenuScene extends BasicScene {
    private titleImage!: ImageButton;

    private backIcon: ImageButton = new ImageButton({
        scaling: 0.2,
        imageSrc: initAssetsStore.assetsMap.backIcon.image!
    });

    private levelSelectron: LevelSelectorObject = new LevelSelectorObject({
        levelList: [{
            nameImageAssets: "levelName0",
            imageAssets: "levelImage0",
            routeKey: "monthly_calender",
        }, {
            nameImageAssets: "levelName1",
            imageAssets: "levelImage1",
            routeKey: "live_room",
        }, {
            nameImageAssets: "levelName2",
            imageAssets: "levelImage2",
            routeKey: "outing",
        }],
        spacing: 50,
        itemScaling: 1,
        itemNameScaling: 0.7
    });

    private backIconClickEvent: UIActionEvent;

    constructor() {
        super();

        const routeParams = getCurrentRouteParams() as unknown as ILevelMenuSceneRouteParams;

        if (routeParams.type === "simple") {
            // SimpleButtonImage
            this.titleImage = new ImageButton({
                width: 360,
                height: 84,
                imageSrc: initAssetsStore.assetsMap.simpleButton.image!
            });
        } else if (routeParams.type === "difficulty") {
            // DifficultyButtonImage
            this.titleImage = new ImageButton({
                width: 360,
                height: 84,
                imageSrc: initAssetsStore.assetsMap.difficultyButton.image!
            });
        }

        this.add(this.titleImage);
        this.add(this.backIcon);
        this.add(this.levelSelectron);

        this.backIconClickEvent = bindClickEvent(this.backIcon, () => {
            setCurrentRoute("start");
        });

        const onBeforeRender = this.onBeforeRender;
        this.onBeforeRender = (renderer, ...args) => {
            onBeforeRender(renderer, ...args);

            this.backIcon.position.y = (renderer.domElement.height / 2) - 72;
            this.backIcon.position.x = (-renderer.domElement.width / 2) + 84;

            this.titleImage.position.y = (renderer.domElement.height / 2) - 72;
        }
    }

    public clear = () => {
        unbindEvent(this.backIconClickEvent);
        this.levelSelectron.clear();
        this.children.forEach(child => {
            child.clear && child.clear();
            this.remove(child);
        });
        return this;
    }
}