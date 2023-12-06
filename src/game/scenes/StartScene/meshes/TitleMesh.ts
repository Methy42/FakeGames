import * as THREE from 'three';
import { initAssetsStore } from '../../../store/InitAssets';

export class TitleMesh extends THREE.Mesh {
    private isFristRender: boolean;
    private backgroundTexture: THREE.Texture;

    constructor() {
        super();
        this.isFristRender = true;
        this.backgroundTexture = initAssetsStore.assetsMap.title.image!;
        this.onBeforeRender = () => {
            if (this.isFristRender) {
                this.isFristRender = false;
                this.geometry = new THREE.PlaneGeometry(800, 320);
                this.material = new THREE.MeshStandardMaterial({ map: this.backgroundTexture, transparent: true, roughness: 0.1, metalness: 0.1 });
            }
        };
    }
}