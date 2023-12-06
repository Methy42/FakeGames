import * as THREE from 'three';
import { BasicBackground } from '../../objects/Backgrounds/Basic';
import { setFromCamera } from '../../controls/UIActionControls';

export class BasicScene extends THREE.Scene {
    private isFristRender: boolean = true;

    public basicBackground: BasicBackground;
    private ambientLight = new THREE.AmbientLight(0xffffff, 3.0);
    private pointLight = new THREE.PointLight(0xffffff, 2.0);

    constructor(backgroundUrl?: string) {
        super();

        this.basicBackground = new BasicBackground(backgroundUrl);

        this.basicBackground.position.z = -1;
        this.pointLight.position.set(0, 10, 4);

        this.add(this.basicBackground);
        this.add(this.ambientLight);
        this.add(this.pointLight);

        this.onBeforeRender = (_, __, camera) => {
            if (this.isFristRender) {
                this.isFristRender = false;

                setFromCamera(camera);
            }
        };
    }

    public async load(canvas: HTMLCanvasElement) {
        await this.basicBackground.load(canvas);
        
        this.basicBackground.position.set(0, 0, -1);
    };
}