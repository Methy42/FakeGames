import * as THREE from "three";

import { ImageButton } from "../../../objects/Buttons/Image";
import { bindClickEvent, bindDragEvent, UIActionEvent, unbindEvent } from "../../../controls/UIActionControls";
import { setCurrentRoute } from "../../../routers";
import { initAssetsStore } from "../../../store/InitAssets";

export interface ILevelItem {
    nameImageAssets: string;
    imageAssets: string;
    routeKey?: string;
    clickEvent?: UIActionEvent;
}

export interface ILevelSelectorObjectProps {
    levelList: ILevelItem[];
    spacing: number;
    itemWidth?: number;
    itemHeight?: number;
    itemScaling?: number;
    itemNameScaling?: number;
}

export class LevelSelectorObject extends THREE.Group {
    private officeX: number = 0;

    private levelImageList: ImageButton[] = [];

    private levelList: ILevelItem[];

    private spacing: number;
    // private itemWidth: number;

    private itemWidth?: number;
    private itemHeight?: number;
    private itemScaling?: number;
    private itemNameScaling?: number;

    private dragEvent?: UIActionEvent;

    constructor(props: ILevelSelectorObjectProps) {
        super();

        this.levelList = props.levelList;
        this.spacing = props.spacing;
        this.itemWidth = props.itemWidth;
        this.itemHeight = props.itemHeight;
        this.itemScaling = props.itemScaling;
        this.itemNameScaling = props.itemNameScaling;

        this.initLevelImageList().then(() => {
            this.initLevelImageListPosition();
            this.initSlideEvent();
        });
    }

    private initLevelImageList = async () => {
        return await Promise.all(this.levelList.map(element => new Promise<void>((resolve) => {
            const borderImage = new ImageButton({
                imageSrc: initAssetsStore.assetsMap.levelBorder.image!,
                width: this.itemWidth,
                height: this.itemHeight,
                scaling: this.itemScaling
            });

            const borderBackImage = new ImageButton({
                imageSrc: initAssetsStore.assetsMap.levelBorderBack.image!,
                width: this.itemWidth,
                height: this.itemHeight,
                scaling: this.itemScaling
            });

            const levelImage = new ImageButton({
                imageSrc: initAssetsStore.assetsMap[element.imageAssets].image!,
                width: this.itemWidth,
                height: this.itemHeight,
                scaling: this.itemScaling
            });

            const levelNameImage = new ImageButton({
                imageSrc: initAssetsStore.assetsMap[element.nameImageAssets].image!,
                width: this.itemWidth,
                height: this.itemHeight,
                scaling: this.itemNameScaling
            });

            Promise.all([
                new Promise<void>((resolve) => {
                    borderImage.onLoad = resolve;
                }),
                new Promise<void>((resolve) => {
                    borderBackImage.onLoad = resolve;
                }),
                new Promise<void>((resolve) => {
                    levelImage.onLoad = resolve;
                }),
                new Promise<void>((resolve) => {
                    levelNameImage.onLoad = resolve;
                })
            ]).then(() => {
                levelNameImage.position.y = -levelImage.height / 2 - levelNameImage.height / 2 - 30;

                levelImage.add(borderImage);
                borderBackImage.add(levelImage);
                borderBackImage.add(levelNameImage);

                element.clickEvent = bindClickEvent(borderBackImage, () => {
                    this.levelItemOnClick(element);
                });

                this.levelImageList.push(borderBackImage);

                this.add(borderBackImage);

                resolve();
            })
        })));
    };

    private initLevelImageListPosition = () => {
        this.levelImageList.forEach((element, index) => {
            element.position.x = this.officeX + (index * (this.spacing + element.width));
        });
    }

    private initSlideEvent = () => {
        this.dragEvent = bindDragEvent(this, (_, changeValue, event) => {
            if (event) {
                event.preventDefault?.();
            }
            changeValue && (this.officeX += changeValue.x);

            this.initLevelImageListPosition();
        });
    }

    private levelItemOnClick = (levelItem: ILevelItem) => {
        if (levelItem.routeKey) {
            setCurrentRoute(levelItem.routeKey);
        }
    };

    public clear = () => {
        this.children.forEach(element => {
            element.clear && element.clear();
            element.remove();
        });

        this.levelList.forEach(element => {
            element.clickEvent && unbindEvent(element.clickEvent);
        });

        this.dragEvent && unbindEvent(this.dragEvent);

        return this;
    }
}