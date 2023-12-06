import * as THREE from 'three';
import { ImageButton } from '../Buttons/Image';
import { BasicBackground } from '../Backgrounds/Basic';
import { AnimationButton } from '../Buttons/Animation';

export interface IBasicDialogProps {
    background: {
        image: string;
        scaling?: number;
    };
    titleImage?: string;
    buttonList?: {
        image: string;
        click: () => void;
    }
}

export class BasicDialog extends THREE.Group {
    private background!: ImageButton | AnimationButton;

    constructor(props: IBasicDialogProps) {
        super();

        // this.background = new BasicBackground(props.background.image)

        this.background.position.z = 1;

        this.add(this.background);
    }
}