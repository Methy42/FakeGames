import * as THREE from "three";
import { load, loadAsync } from "../../loaders/TextureLoader";

export interface IVideoButtonProps {
    videoSrc: string;
    width?: number;
    height?: number;
    scaling?: number;
}

export class VideoButton extends THREE.Mesh {
    public width!: number;
    public height!: number;
    public video?: HTMLVideoElement;

    constructor(props: IVideoButtonProps) {
        super();

        this.video = (window as any).createVideo() as HTMLVideoElement;
        
        this.video.src = props.videoSrc;
        this.video.loop = true;
        this.video.muted = true;
        this.video.autoplay = true;
        this.video.controls = false;
        this.video.play();

        const texture = new THREE.VideoTexture(this.video);

        this.width = props.width || texture.image.width * (props.scaling || 1);
        this.height = props.height || texture.image.height * (props.scaling || 1);

        this.geometry = new THREE.PlaneGeometry(this.width, this.height);
        this.material = new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.1, metalness: 0.1 });
    }
}