import * as THREE from 'three';
import { loadAsync } from '../../loaders/TextureLoader';

export interface ICutSegmentsObjectProps {
    imageSrc?: string;
    scaling?: number;
};

export interface ISegment {
    mesh: THREE.Mesh;
    office: THREE.Vector2;
}

export class CutSegmentsObject extends THREE.Group {
    private scaling: number = 1;
    private imageSrc?: string;
    private segmentList: ISegment[] = [];
    private imageTexture?: THREE.Texture;

    constructor(props: ICutSegmentsObjectProps) {
        super();

        props.scaling && (this.scaling = props.scaling);
        props.imageSrc && (this.imageSrc = props.imageSrc);

        loadAsync(this.imageSrc!).then((texture) => {
            this.imageTexture = texture;
            const width = texture.image.width * this.scaling;
            const height = texture.image.height * this.scaling;

            const geometry = new THREE.PlaneGeometry(width, height);
            const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.1, metalness: 0.1 });

            const mesh = new THREE.Mesh(geometry, material);
            this.segmentList.push({
                mesh,
                office: new THREE.Vector2(0, 0)
            })
            this.onLoad && this.onLoad();
        });
    }

    public onLoad?: () => void;

    private createSegment = (office: THREE.Vector2): void => {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);

        cube.position.set(office.x, office.y, 0);

        this.add(cube);
    }

    public cutSegment = async (segment: THREE.Mesh, office: THREE.Vector2) => {
        // loadAsync(this.imageSrc)
        const newTexture = this.imageTexture && this.imageTexture.clone();
        newTexture?.offset.set(office.x, office.y);

        (segment.material as THREE.MeshStandardMaterial).map?.offset;
        // segment.wi
    }
}