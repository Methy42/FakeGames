import * as THREE from "three";
import { loadAsync } from "../../loaders/TextureLoader";

export interface IImageButtonProps {
    name?: string;
    imageSrc: string | THREE.Texture;
    width?: number;
    height?: number;
    scaling?: number;
    isCheckArea?: boolean;
}

export class ImageButton extends THREE.Mesh {
    public width!: number;
    public height!: number;
    public scaling?: number;
    public texture?: THREE.Texture;
    public isCheckArea?: boolean;

    private isLoaded: boolean = false;
    private _onLoad?: () => void;

    constructor(props: IImageButtonProps) {
        super();
        props.name && (this.name = props.name);
        props.scaling && (this.scaling = props.scaling);
        props.isCheckArea && (this.isCheckArea = props.isCheckArea);

        if (typeof props.imageSrc === "string") {
            this.loadEX(props.imageSrc).then((texture) => {
                this.width = props.width || texture.image.width * (props.scaling || 1);
                this.height = props.height || texture.image.height * (props.scaling || 1);
                
                this.init(texture);
            });
        } else if (props.imageSrc instanceof THREE.Texture) {
            this.width = props.width || props.imageSrc.image.width * (props.scaling || 1);
            this.height = props.height || props.imageSrc.image.height * (props.scaling || 1);
            this.init(props.imageSrc);
        }
    }

    private loadEX = (url: string) => new Promise<THREE.Texture>((resolve, reject) => {
        loadAsync(url).then(resolve).catch(() => this.loadEX(url).then(resolve).catch(reject));
    })

    private init = (texture: THREE.Texture) => {
        this.texture = texture;
        this.geometry = new THREE.PlaneGeometry(this.width, this.height);
        this.initMaterial();

        this.isLoaded = true;
        this._onLoad && this._onLoad();
    }

    private initMaterial = () => {
        this.material = new THREE.MeshStandardMaterial({
            map: this.texture,
            transparent: true,
            roughness: this.isCheckArea ? 1 : 0.1,
            metalness: this.isCheckArea ? 1 : 0.1
        });
    };

    public set onLoad(onLoad: () => void) {
        this._onLoad = onLoad;
        this.isLoaded && this._onLoad();
    };

    public setCheckArea = (isCheckArea: boolean) => {
        this.isCheckArea = isCheckArea;
        this.initMaterial();
    };
}