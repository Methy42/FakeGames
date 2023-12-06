import * as THREE from 'three';
import { load } from '../../loaders/TextureLoader';

const Number0Image = 'https://methy.net:10233/images/number/number_0.png';
const Number1Image = 'https://methy.net:10233/images/number/number_1.png';
const Number2Image = 'https://methy.net:10233/images/number/number_2.png';
const Number3Image = 'https://methy.net:10233/images/number/number_3.png';
const Number4Image = 'https://methy.net:10233/images/number/number_4.png';
const Number5Image = 'https://methy.net:10233/images/number/number_5.png';
const Number6Image = 'https://methy.net:10233/images/number/number_6.png';
const Number7Image = 'https://methy.net:10233/images/number/number_7.png';
const Number8Image = 'https://methy.net:10233/images/number/number_8.png';
const Number9Image = 'https://methy.net:10233/images/number/number_9.png';

const numberImageSrcList = [
    Number0Image,
    Number1Image,
    Number2Image,
    Number3Image,
    Number4Image,
    Number5Image,
    Number6Image,
    Number7Image,
    Number8Image,
    Number9Image
];

export interface IBasicNumberProps {
    value: number;
    scale?: number;
}

export class BasicNumber extends THREE.Mesh {
    private value: number = 0;
    private width!: number;
    private height!: number;
    private opacity: number = 1;
    private expectedOpacity: number = 1;

    constructor(props: IBasicNumberProps) {
        super();

        this.value = props.value;

        load(numberImageSrcList[this.value], (numberTexture) => {
            this.width = numberTexture.image.width * (props.scale || 1);
            this.height = numberTexture.image.height * (props.scale || 1);
    
            this.geometry = new THREE.PlaneGeometry(this.width, this.height);
            this.material = new THREE.MeshBasicMaterial({ map: numberTexture, transparent: true });
        });

        this.onBeforeRender = () => {
            if (this.opacity !== this.expectedOpacity) {
                this.opacity += Math.floor((this.expectedOpacity - this.opacity) * 100)/100 * 0.1;
            }

            if (this.opacity !== (this.material as any).opacity) {
                this.material && ((this.material as any).opacity = this.opacity);
            }
        };
    }

    public setOpacity = (opacity: number) => {
        this.opacity = opacity;
        this.expectedOpacity = opacity;
    };

    public setExpectedOpacity = (opacity: number) => {
        this.expectedOpacity = opacity;
    };
}