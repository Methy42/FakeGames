import * as THREE from "three";
import { ImageButton } from "../Buttons/Image";
import { AnimationButton } from "../Buttons/Animation";
import { UIActionEvent, bindClickEvent, unbindEvent } from "../../controls/UIActionControls";
import { setCurrentRoute } from "../../routers";
import { initAssetsStore } from "../../store/InitAssets";

export class LevelFinishDialog extends THREE.Mesh {
    private isFristRender: boolean = true;
    private isShow: boolean = false;
    private content: THREE.Group = new THREE.Group();
    private selectLevelButtonEvent: UIActionEvent
    private dialogBackground: ImageButton = new ImageButton({
        imageSrc: initAssetsStore.assetsMap.dialogBackground.image!,
        scaling: 0.6
    });
    private dialogTitle: ImageButton = new ImageButton({
        imageSrc: initAssetsStore.assetsMap.dialogTitle.image!,
        scaling: 0.3
    });
    private dialogCloseIcon: ImageButton = new ImageButton({
        imageSrc: initAssetsStore.assetsMap.dialogCloseIcon.image!,
        scaling: 0.2
    });
    private dialogSelectLevelButton: ImageButton = new ImageButton({
        imageSrc: initAssetsStore.assetsMap.dialogSelectLevelButton.image!,
        scaling: 0.3
    });
    private dialogNextLevelButton: ImageButton = new ImageButton({
        imageSrc: initAssetsStore.assetsMap.dialogNextLevelButton.image!,
        scaling: 0.3
    });
    private dialogGoodAnimation: AnimationButton;

    constructor() {
        super();

        this.content.scale.set(0, 0, 0);

        this.dialogGoodAnimation = new AnimationButton({
            imageSrcList: initAssetsStore.assetsMap.dialogGoodAnimation.animationImages!,
            scaling: 0.25,
            duration: 50,
        });

        this.selectLevelButtonEvent = bindClickEvent(this.dialogSelectLevelButton, () => {
            if (this.isShow) {
                setCurrentRoute("level_menu", {
                    type: "simple"
                });
            }
        });

        this.content.add(this.dialogBackground);
        this.content.add(this.dialogTitle);
        this.content.add(this.dialogCloseIcon);
        this.content.add(this.dialogSelectLevelButton);
        this.content.add(this.dialogNextLevelButton);
        this.content.add(this.dialogGoodAnimation);

        this.add(this.content);
    }

    public onBeforeRender = (renderer: THREE.Renderer) => {
        if (this.isFristRender) {
            this.isFristRender = false;

            this.initMask(renderer);

            this.dialogCloseIcon.position.set(10, 190, 4);
            this.dialogTitle.position.set(0, 80, 4);
            this.dialogSelectLevelButton.position.set(-130, -200, 4);
            this.dialogNextLevelButton.position.set(130, -200, 4);
            this.dialogGoodAnimation.position.set(0, -50, 4);
        } else if (this.isShow) {
            // mask透明度增加到0.5
            if ((this.material as THREE.Material).opacity < 0.5) {
                (this.material as THREE.Material).opacity += 0.02;
            }

            // 对话框缩放增加到1
            if (this.content.scale.x < 1) {
                this.content.scale.x += 0.1;
                this.content.scale.y += 0.1;
                this.content.scale.z += 0.1;
            }
        }
    }

    private initMask = (renderer: THREE.Renderer) => {
        this.geometry = new THREE.PlaneGeometry(renderer.domElement.width, renderer.domElement.height);
        this.material = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 });
    };

    public show = () => {
        this.isShow = true;
    }

    public clear(): this {
        super.clear();
        unbindEvent(this.selectLevelButtonEvent);
        return this;
    }
}