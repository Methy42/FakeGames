import { AnimationButton } from '../../objects/Buttons/Animation';
import { ImageButton } from '../../objects/Buttons/Image';
import { BasicLoading } from '../../objects/Loading/Basic';
import { BasicScene } from '../Basic/BasicScene';

import LoadingBackgroundImage from "./assets/basic_background.png";
import LoadingWordImage from "./assets/loading_word.png";

export interface ILoadingSceneProps {
    manualProcess?: boolean;
    loadingMethod: (setCurrentProcess?: (process: number) => void) => Promise<void>;
    callback: () => void;
}

export class LoadingScene extends BasicScene {
    private basicLoading!: BasicLoading;
    private manualProcess?: boolean;
    private loadingMethod!: (setCurrentProcess?: (process: number) => void) => Promise<void>;
    private callback!: () => void;

    private loadingWord: ImageButton = new ImageButton({
        scaling: 0.4,
        imageSrc: LoadingWordImage
    });

    constructor() {
        super(LoadingBackgroundImage);
    };

    public init(props: ILoadingSceneProps) {
        if (!this.basicLoading) {
            this.basicLoading = new BasicLoading();
            this.add(this.basicLoading);

            this.loadingWord.position.set(0, 60, 0);
            this.add(this.loadingWord);
        }
        this.loadingMethod = props.loadingMethod;
        this.callback = props.callback;
        this.manualProcess = props.manualProcess;

        this.basicLoading.initProcess();

        if (!this.manualProcess) {
            this.basicLoading.setProcess(90);
        }

        let isFirstRender = true;
        this.onBeforeRender = (renderer) => {
            if (isFirstRender) {
                isFirstRender = false;
                this.load(renderer.domElement);
            }
        };

        setTimeout(() => {
            this.startLoading();
        }, 500);
    }

    private startLoading = () => {
        this.basicLoading.initProcess();
        Promise.all([
            this.loadingMethod((processNumber) => {
                this.basicLoading.setProcess(processNumber);
            })
        ]).then(() => {
            this.basicLoading.setProcess(100);

            this.callback();
        });
    };

    public clear(): this {
        super.clear();

        this.children.forEach(child => {
            child.clear && child.clear();
            this.remove(child);
        });

        this.basicLoading.clear();

        return this;
    }
}