import * as THREE from 'three';
import { UIActionEvent, bindClickEvent, setFromCamera, unbindEvent } from '../../controls/UIActionControls';
import { ImageButton } from '../../objects/Buttons/Image';
import { BasicNumber } from '../../objects/Number/Basic';
import { TitleMesh } from './meshes/TitleMesh';
import { getCurrentRoute, getCurrentRouteParams, setCurrentRoute } from '../../routers';
import { BasicBackground } from '../../objects/Backgrounds/Basic';
import { initAssetsStore } from '../../store/InitAssets';

export class StartScene extends THREE.Scene {
    private backgroundImage: BasicBackground = new BasicBackground();
    private titleMesh: TitleMesh = new TitleMesh();
    private ambientLight = new THREE.AmbientLight(0xffffff, 3.0);
    private pointLight = new THREE.PointLight(0xffffff, 2.0);

    private simpleButton: ImageButton = new ImageButton({
        width: 360,
        height: 84,
        imageSrc: initAssetsStore.assetsMap.simpleButton.image!
    });
    private difficultyButton: ImageButton = new ImageButton({
        width: 360,
        height: 84,
        imageSrc: initAssetsStore.assetsMap.difficultyButton.image!
    });
    private communityButton: ImageButton = new ImageButton({
        width: 360,
        height: 84,
        imageSrc: initAssetsStore.assetsMap.communityButton.image!
    });
    private hersonalButton: ImageButton = new ImageButton({
        width: 360,
        height: 84,
        imageSrc: initAssetsStore.assetsMap.hersonalButton.image!
    });

    private noticeTip: ImageButton = new ImageButton({
        scaling: 1.5,
        imageSrc: initAssetsStore.assetsMap.noticeTip.image!
    });

    private settingsTip: ImageButton = new ImageButton({
        scaling: 0.75,
        imageSrc: initAssetsStore.assetsMap.settingsTip.image!
    });

    private tiliTip: ImageButton = new ImageButton({
        scaling: 0.75,
        imageSrc: initAssetsStore.assetsMap.tiliTip.image!
    });

    private isFristRender: boolean = true;

    private simpleButtonClickEvent!: UIActionEvent;

    private hersonalButtonClickEvent!: UIActionEvent;

    constructor() {
        super();

        this.backgroundImage.position.z = -1;
        this.pointLight.position.set(0, 10, 4);

        this.add(this.backgroundImage);
        this.add(this.ambientLight);
        this.add(this.pointLight);

        this.add(this.titleMesh);
        this.add(this.simpleButton);
        this.add(this.difficultyButton);
        this.add(this.communityButton);
        this.add(this.hersonalButton);
        this.add(this.noticeTip);
        this.add(this.settingsTip);
        this.add(this.tiliTip);

        this.onBeforeRender = (renderer, _, camera) => {
            if (this.isFristRender) {
                this.isFristRender = false;

                setFromCamera(camera);
            }
        };
    }

    public load = async (canvas: HTMLCanvasElement) => {
        await this.backgroundImage.load(canvas);

        this.simpleButtonClickEvent = bindClickEvent(this.simpleButton, () => {
            setCurrentRoute("level_menu", {
                type: "simple"
            })
        });

        this.hersonalButtonClickEvent = bindClickEvent(this.hersonalButton, () => {
            setCurrentRoute("personal_center");
        });

        this.titleMesh.position.x = -40;
        this.titleMesh.position.y = 160;

        this.simpleButton.position.y = (- canvas.height / 2) + 276;
        this.difficultyButton.position.y = (- canvas.height / 2) + 276;
        this.communityButton.position.y = (- canvas.height / 2) + 142;
        this.hersonalButton.position.y = (- canvas.height / 2) + 142;

        this.simpleButton.position.x = -280;
        this.difficultyButton.position.x = 200;
        this.communityButton.position.x = -280;
        this.hersonalButton.position.x = 200;

        this.noticeTip.position.x = -canvas.width / 2 + 180;
        this.noticeTip.position.y = -canvas.height / 2 + 120;

        this.settingsTip.position.x = canvas.width / 2 - 105;
        this.settingsTip.position.y = canvas.height / 2 - 230;

        this.tiliTip.position.x = canvas.width / 2 - 105;
        this.tiliTip.position.y = canvas.height / 2 - 400;
    };

    private levelTo = (routerKey: string) => {
        setCurrentRoute(routerKey);
    };

    public clear = ()  => {
        unbindEvent(this.simpleButtonClickEvent);
        unbindEvent(this.hersonalButtonClickEvent);

        this.children.forEach(child => {
            child.clear && child.clear();
            this.remove(child);
        });
        return this;
    }
};