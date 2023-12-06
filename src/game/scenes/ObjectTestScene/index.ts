import * as THREE from 'three';
import { BasicLoading } from '../../objects/Loading/Basic';
import { BasicScene } from '../Basic/BasicScene';

const LoadingBackgroundImage = "https://methy.net:10233/images/basic_background.png";

export class ObjectTestScene extends BasicScene {
    private basicLoading: BasicLoading;

    private isFirstRender: boolean = true;

    constructor() {
        super(LoadingBackgroundImage);

        this.basicLoading = new BasicLoading();
        this.basicLoading.position.set(0, 0, 0);
        this.add(this.basicLoading);

        this.basicLoading.setProcess(100);

        this.onBeforeRender = (renderer) => {
            if (this.isFirstRender) {
                this.isFirstRender = false;
            }
        };
    }
}