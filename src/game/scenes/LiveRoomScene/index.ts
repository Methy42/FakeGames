import * as THREE from 'three';
import { BasicScene } from '../Basic/BasicScene';
import { AnimationButton } from '../../objects/Buttons/Animation';
import { ImageButton } from '../../objects/Buttons/Image';
import { LiveRoomSceneData } from './data/LevelSceneData';

import { UIActionEvent, bindClickEvent, unbindEvent, isObjectInMouse, getMouse } from '../../controls/UIActionControls';
import { setCurrentRoute } from '../../routers';
import { LevelFinishDialog } from '../../objects/Dialogs/LevelFinishDialog';

const BackIconImage = "https://methy.net:10233/images/back.png";
const ActiveButtonImage = "https://methy.net:10233/images/live_room/active_box.png";

export class LiveRoomScene extends BasicScene {
    public needLoading = true;
    public manualLoadingProcess = true;
    private isLevelFinish = false;

    private backIcon!: ImageButton;
    private backIconClickEvent!: UIActionEvent;

    private activeButton!: ImageButton;
    private activeButtonEvent!: UIActionEvent;

    private objectList = LiveRoomSceneData.objects.map(object => ({
        ...object,
        isFinish: false
    }));

    private realObjectList: Array<ImageButton | AnimationButton> = [];

    private levelFinishDialog: LevelFinishDialog = new LevelFinishDialog();

    private dragingObject?: ImageButton | AnimationButton;

    private canvas!: HTMLCanvasElement;

    constructor() {
        super(LiveRoomSceneData.backgroundImage);
    }

    public async load(canvas: HTMLCanvasElement, setCurrentProcess?: (process: number) => void) {
        await super.load?.(canvas);

        this.canvas = canvas;

        const allPromise = [];

        for (let object of this.objectList) {
            allPromise.push(() => new Promise<void>((resolve) => {
                if (object.image) {
                    const image = new ImageButton({
                        name: object.name,
                        imageSrc: object.image,
                        scaling: object.size.scaling,
                        width: object.size.width,
                        height: object.size.height,
                        isCheckArea: true,
                    });
                    image.onLoad = resolve;

                    if (typeof object.checkPosition != "function") {
                        image.position.set(object.checkPosition.x, object.checkPosition.y, 1);
                    }

                    this.add(image);
                } else if (object.AnimationFramesDir) {
                    const imageList = new Array(object.AnimationFramesCount);
                    for (let index = 1; index <= imageList.length; index++) {
                        const image = object.AnimationFramesDir + "/" + index + ".png";
                        imageList[index - 1] = image;
                    }

                    const animation = new AnimationButton({
                        name: object.name,
                        imageSrcList: imageList,
                        scaling: object.size.scaling,
                        width: object.size.width,
                        height: object.size.height,
                        duration: object.AnimationDuration,
                        isCheckArea: true,
                    });

                    animation.onLoad = resolve;

                    if (typeof object.checkPosition != "function") {
                        animation.position.set(object.checkPosition.x, object.checkPosition.y, 1);
                    }

                    this.add(animation);
                }
            }));
        }

        allPromise.push(() => new Promise<void>((resolve) => {
            this.backIcon = new ImageButton({
                scaling: 0.2,
                imageSrc: BackIconImage
            });

            this.backIcon.onLoad = resolve;

            this.backIcon.position.y = (canvas.height / 2) - 72;
            this.backIcon.position.x = (-canvas.width / 2) + 84;
            this.backIcon.position.z = 2;

            this.add(this.backIcon);

            this.backIconClickEvent = bindClickEvent(this.backIcon, () => {
                setCurrentRoute("level_menu", {
                    type: "simple"
                });
            });
        }));

        allPromise.push(() => new Promise<void>((resolve) => {
            this.activeButton = new ImageButton({
                scaling: 0.15,
                imageSrc: ActiveButtonImage
            });

            this.activeButton.onLoad = resolve;

            this.activeButton.position.y = (-canvas.height / 2) + 72;
            this.activeButton.position.x = (canvas.width / 2) - 84;

            this.activeButton.position.z = 2;

            this.add(this.activeButton);

            this.activeButtonEvent = bindClickEvent(this.activeButton, () => {
                this.randomPopObject();
            });
        }));

        // await Promise.all(allPromise);
        let index = 0;
        for (const promise of allPromise) {
            await promise();
            index++;
            const process = Math.floor(index / allPromise.length * 100);

            setCurrentProcess?.(process - 1);
        }

        for (let object of this.objectList) {
            if (typeof object.checkPosition === "function") {
                const image = this.getObjectByName(object.name) as ImageButton;
                if (image) {
                    const position = object.checkPosition(canvas, image, this);

                    image.position.set(position.x, position.y, 1);
                }
            }
        }

        this.levelFinishDialog.position.set(0, 0, 3);

        this.canvas.addEventListener('touchstart', this.onTouchStart);
        this.canvas.addEventListener('touchmove', this.onTouchMove);
        this.canvas.addEventListener('touchend', this.onTouchEnd);
        this.canvas.addEventListener('touchcancel', this.onTouchCancel);

        setCurrentProcess?.(99);

        return;
    }

    private onTouchStart = () => {
        for (let object of this.realObjectList.slice().reverse()) {
            if (isObjectInMouse.call({ mouse: getMouse() }, object, 5)) {
                this.dragingObject = object;
                break;
            }
        }
    }

    private onTouchMove = () => {
        const mouse = getMouse();
        if (this.dragingObject && mouse) {
            this.dragingObject.position.x = mouse?.x;
            this.dragingObject.position.y = mouse?.y;
            this.checkObject(this.dragingObject.name.replace('real-', ''));
        }
    }

    private onTouchEnd = () => {
        this.dragingObject = undefined;
    }

    private onTouchCancel = () => {
        this.dragingObject = undefined;
    }

    private moveToCenter = (object: THREE.Object3D) => new Promise<void>((resolve) => {
        if (Math.abs(object.position.x - (-100)) < 10 && Math.abs(object.position.y - 100) < 10) {
            return resolve();
        }

        object.position.x += (-100 - object.position.x) / 10;
        object.position.y += (100 - object.position.y) / 10;

        requestAnimationFrame(() => {
            this.moveToCenter(object).then(resolve);
        });
    });

    private randomPopObject = () => {
        // 使用getObjectByName方法判断是否已经全部弹出
        if (this.objectList.every(object => this.getObjectByName('real-' + object.name) as ImageButton)) {
            return;
        }

        const object = this.objectList[Math.floor(Math.random() * this.objectList.length)];
        const image = this.getObjectByName('real-' + object.name) as ImageButton;
        if (!image) {
            if (object.image) {
                const image = new ImageButton({
                    name: 'real-' + object.name,
                    imageSrc: object.image,
                    scaling: object.size.scaling,
                    width: object.size.width,
                    height: object.size.height,
                });

                image.position.set(this.activeButton.position.x, this.activeButton.position.y, 1);

                this.add(image);

                this.moveToCenter(image).then(() => {
                    this.realObjectList.push(image);
                });
            } else if (object.AnimationFramesDir) {
                const imageList = new Array(object.AnimationFramesCount);
                for (let index = 1; index <= imageList.length; index++) {
                    const image = object.AnimationFramesDir + "/" + index + ".png";
                    imageList[index - 1] = image;
                }

                const animation = new AnimationButton({
                    name: 'real-' + object.name,
                    imageSrcList: imageList,
                    scaling: object.size.scaling,
                    width: object.size.width,
                    height: object.size.height,
                    duration: object.AnimationDuration,
                });

                animation.position.set(this.activeButton.position.x, this.activeButton.position.y, 1);

                this.add(animation);

                this.moveToCenter(animation).then(() => {
                    this.realObjectList.push(animation);
                });
            }

        } else {
            this.randomPopObject();
        }
    }

    private checkObject = (name: string) => {
        const realObject = this.getObjectByName('real-' + name) as ImageButton;
        const checkObject = this.getObjectByName(name) as ImageButton;
        if (realObject && checkObject) {
            const realObjectPosition = realObject.position;
            const checkObjectPosition = checkObject.position;
            if (Math.abs(realObjectPosition.x - checkObjectPosition.x) < 10 && Math.abs(realObjectPosition.y - checkObjectPosition.y) < 10) {
                this.finishObject(name);
            }
        }
    };

    private finishObject = (name: string) => {
        const realObject = this.getObjectByName('real-' + name) as ImageButton;
        const checkObject = this.getObjectByName(name) as ImageButton;
        if (realObject && checkObject) {
            realObject.position.set(0, 0, -10);
            checkObject.setCheckArea(false);
            this.objectList.find(object => object.name === name)!.isFinish = true;
            this.realObjectList = this.realObjectList.filter(object => object.name !== 'real-' + name);
            this.checkLevelFinish();
        }
    };

    private checkLevelFinish = () => {
        if (this.objectList.every(object => object.isFinish) && !this.isLevelFinish) {
            this.isLevelFinish = true;
            this.add(this.levelFinishDialog);
            this.levelFinishDialog.show();
        }
    }

    public clear = () => {
        unbindEvent(this.backIconClickEvent);
        unbindEvent(this.activeButtonEvent);
        this.canvas.removeEventListener('touchstart', this.onTouchStart);
        this.canvas.removeEventListener('touchmove', this.onTouchMove);
        this.canvas.removeEventListener('touchend', this.onTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.onTouchCancel);
        this.children.forEach(child => {
            child.clear && child.clear();
            this.remove(child);
        });
        this.levelFinishDialog.clear();
        return this;
    }
}