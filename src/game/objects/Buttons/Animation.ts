import * as THREE from "three";
import { load, loadAsync } from "../../loaders/TextureLoader";

export interface IAnimationButtonProps {
    name?: string;
    imageSrcList: string[] | THREE.Texture[];
    width?: number;
    height?: number;
    scaling?: number;
    duration?: number;
    isCheckArea?: boolean;
    noLoop?: boolean;
    manual?: boolean;
}

export interface IAnimationFrame {
    texture: THREE.Texture;
    duration: number;
}

export class AnimationButton extends THREE.Mesh {
    private timestamp: number = new Date().getTime();
    private currentFrameIndex: number = 0;
    private expectedCurrentFrameIndex: number = 0;

    private initialWidth?: number;
    private initialHeight?: number;
    private initialScaling?: number;

    private isCheckArea?: boolean;
    private noLoop?: boolean;
    private manual?: boolean;

    public width!: number;
    public height!: number;

    public texture?: THREE.Texture;

    public frameList: IAnimationFrame[] = [];

    constructor(props: IAnimationButtonProps) {
        super();

        this.initialWidth = props.width;
        this.initialHeight = props.height;
        this.initialScaling = props.scaling;
        props.name && (this.name = props.name);
        this.isCheckArea = props.isCheckArea;
        this.noLoop = props.noLoop;
        this.manual = props.manual;

        if (props.imageSrcList[0] instanceof THREE.Texture) {
            (props.imageSrcList as THREE.Texture[]).forEach(texture => {
                this.createFrame(texture, props.duration || 300);
            });

            this.onLoad && this.onLoad();
        } else if (typeof props.imageSrcList[0] === "string") {
            Promise.all((props.imageSrcList as string[]).map((image) => loadAsync(image))).then((textures) => {
                textures.forEach(texture => {
                    this.createFrame(texture, props.duration || 300);
                });

                this.onLoad && this.onLoad();
            });
        }
    }

    public onBeforeRender = () => {
        const now = new Date().getTime();
        if (this.frameList.length > 0 && now - this.timestamp > this.frameList[this.currentFrameIndex].duration) {
            if (this.noLoop && this.currentFrameIndex === this.frameList.length - 1) {
                return;
            }

            this.timestamp = now;

            if (!this.manual) {
                this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frameList.length;
            } else if (this.expectedCurrentFrameIndex > this.currentFrameIndex) {
                this.currentFrameIndex++;
            }

            this.renderFrame();
        }
    };

    private renderFrame = () => {
        const texture = this.frameList[this.currentFrameIndex].texture;

        this.width = this.initialWidth || texture.image.width * (this.initialScaling || 1);
        this.height = this.initialHeight || texture.image.height * (this.initialScaling || 1);

        this.texture = texture;
        this.geometry = new THREE.PlaneGeometry(this.width, this.height);

        this.setCheckArea(this.isCheckArea || false);
    };

    public createFrame = (texture: THREE.Texture, duration: number) => {
        return this.frameList.push({
            texture,
            duration
        });
    }

    public onLoad?: () => void;

    public setCheckArea = (isCheckArea: boolean) => {
        this.isCheckArea = isCheckArea;
        if (isCheckArea) {
            this.material = new THREE.MeshStandardMaterial({ map: this.texture, transparent: true, roughness: 1, metalness: 1 });
        } else {
            this.material = new THREE.MeshStandardMaterial({ map: this.texture, transparent: true, roughness: 0.1, metalness: 0.1 });
        }
    }

    public backToBeginning = () => {
        this.currentFrameIndex = 0;
    }

    public setCurrentFrameIndex = (index: number) => {
        this.expectedCurrentFrameIndex = index;
    }

    public setManual = (manual: boolean) => {
        this.manual = manual;
    }
}