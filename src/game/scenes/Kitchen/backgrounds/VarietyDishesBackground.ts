import * as THREE from 'three';
import { loadAsync } from '../../../loaders/TextureLoader';

export class VarietyDishesBackground extends THREE.Mesh {
    private imageSrc: string = "https://methy.net:10233/images/kitchen/marble_texture_background.png";
    private beforeRenderResolve!: (renderer: THREE.Renderer) => void;

    constructor() {
        super();

        Promise.all([
            new Promise<THREE.Renderer>((resolve) => {
                this.beforeRenderResolve = (renderer) => resolve(renderer);
            }),
            new Promise<THREE.Texture>((resolve) => {
                loadAsync(this.imageSrc).then((texture) => {
                    resolve(texture);
                });
            })
        ]).then(([renderer, texture]) => {
            const width = renderer.domElement.width;
            const height = renderer.domElement.height;

            const geometry = new THREE.PlaneGeometry(width, height);
            const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.1, metalness: 0.1 });

            this.geometry = geometry;
            this.material = material;

            this.onLoad && this.onLoad();
        });

        const onBeforeRender = this.onBeforeRender;
        this.onBeforeRender = (renderer, ...args) => {
            onBeforeRender && onBeforeRender(renderer, ...args);
            this.beforeRenderResolve(renderer);
        }
    }

    public onLoad?: () => void;
}