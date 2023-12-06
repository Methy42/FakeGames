import * as THREE from "three";
import { load, loadAsync } from "../../loaders/TextureLoader";

export interface ILongImageAnimationButtonProps {
    name?: string;
    imageSrc: string;
    frameCount: number;
    width?: number;
    height?: number;
    scaling?: number;
    duration?: number;
    isCheckArea?: boolean;
}

export class LongImageAnimationButton extends THREE.Mesh {
    private timestamp: number = new Date().getTime();
    public width!: number;
    public height!: number;
    public texture?: THREE.Texture;
    public frameCount!: number;
    public frameIndex!: number;
    public duration!: number;
    public isCheckArea?: boolean;
    public repeatX!: number;
    public repeatY!: number;

    constructor(props: ILongImageAnimationButtonProps) {
        super();
        props.name && (this.name = props.name);
        props.isCheckArea && (this.isCheckArea = props.isCheckArea);
        this.frameCount = props.frameCount;
        this.frameIndex = 0;
        this.duration = props.duration || 300;

        loadAsync(props.imageSrc).then((texture) => {
            this.repeatX = texture.image.width / this.frameCount;
            this.repeatY = texture.image.height;
            this.width = (props.width || texture.image.width * (props.scaling || 1)) / this.frameCount;
            this.height = props.height || texture.image.height * (props.scaling || 1);

            this.texture = texture;
            this.texture.wrapS = THREE.RepeatWrapping;
            this.texture.wrapT = THREE.RepeatWrapping;
            this.texture.repeat.set(1, 1);
            this.texture.magFilter = THREE.LinearFilter; // 设置纹理过滤模式
            this.texture.minFilter = THREE.LinearFilter; // 设置纹理过滤模式
            this.geometry = new THREE.PlaneGeometry(this.width, this.height);
            
            this.setCheckArea(props.isCheckArea || false)

            // this.onLoad && this.onLoad();
        });
    }

    public onLoad?: () => void;

    public setCheckArea = (isCheckArea: boolean) => {
        this.isCheckArea = isCheckArea;
        if (isCheckArea) {
            // this.material = new THREE.MeshStandardMaterial({ map: this.texture, transparent: true, roughness: 1, metalness: 1 });
        } else {
            
            // this.material = new THREE.MeshStandardMaterial({ map: this.texture, transparent: true, roughness: 0.1, metalness: 0.1 });
        }
    };

    // public onBeforeRender = () => {
        // const now = new Date().getTime();
        // if (this.frameCount > 0 && now - this.timestamp > this.duration) {
        //     this.timestamp = now;
        //     this.frameIndex = (this.frameIndex + 1) % this.frameCount;

        //     this.texture?.offset.set(this.repeatX * this.frameIndex, 0);

        //     this.setCheckArea(this.isCheckArea || false);
        // }
    // };
}