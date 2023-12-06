import * as THREE from "three";
import { UIActionEvent, bindClickEvent } from "../../controls/UIActionControls";
import { ImageButton } from "../../objects/Buttons/Image";
import { setCurrentRoute } from "../../routers";
import { BasicScene } from "../Basic/BasicScene";
import { loadAsync } from "../../loaders/TextureLoader";
import { startSwingAnimation } from "../../animations/Swing";

const BackIconImage = "https://methy.net:10233/images/back.png";

const BottomBackgroundImage = "https://methy.net:10233/images/basic_background.png";
const TopBackgroundImage = "https://methy.net:10233/images/outing/top_background.jpg";
const TalkIconImage = "https://methy.net:10233/images/outing/talk_icon.png";

const TalkIconList = [{
    position: (canvas: HTMLCanvasElement) => ({
        x: -canvas.width / 2 + 340,
        y: -50
    })
}, {
    position: (canvas: HTMLCanvasElement) => ({
        x: 0,
        y: (canvas.height / 2) - 200
    })
}, {
    position: (canvas: HTMLCanvasElement) => ({
        x: 0,
        y: (canvas.height / 2) - 300
    })
}];

export class OutingScene extends BasicScene {
    public needLoading = true;
    public manualLoadingProcess = true;

    private backIcon!: ImageButton;
    private backIconClickEvent!: UIActionEvent;

    private topBackground!: ImageButton;

    private talkIconTexture!: THREE.Texture;

    private talkIconList: ImageButton[] = [];

    private ifFirstRender = true;

    constructor() {
        super(BottomBackgroundImage);

        this.onBeforeRender = () => {
            if (this.ifFirstRender) {
                this.ifFirstRender = false;

                for (let i = 0; i < 3; i++) {
                    startSwingAnimation(this.talkIconList[i], 1000 + (i * 500));
                }
            }
        };
    }

    public async load(canvas: HTMLCanvasElement, setCurrentProcess?: (process: number) => void) {
        await super.load(canvas);

        this.topBackground = new ImageButton({
            width: canvas.width,
            height: canvas.height,
            imageSrc: TopBackgroundImage
        });

        await new Promise<void>((resolve, reject) => {
            this.topBackground.onLoad = resolve;
        })

        this.backIcon = new ImageButton({
            width: 100,
            height: 100,
            imageSrc: BackIconImage
        });

        await new Promise<void>((resolve, reject) => {
            this.backIcon.onLoad = resolve;
        })

        this.backIconClickEvent = bindClickEvent(this.backIcon, () => {
            setCurrentRoute("level_menu", {
                type: "simple"
            });
        });

        this.talkIconTexture = await loadAsync(TalkIconImage);

        this.backIcon.position.y = (canvas.height / 2) - 72;
        this.backIcon.position.x = (-canvas.width / 2) + 84;

        this.topBackground.position.z = 1;

        this.add(this.topBackground);
        this.add(this.backIcon);

        for (let i = 0; i < 3; i++) {
            const talkIcon = new ImageButton({
                width: 50,
                height: 50,
                imageSrc: TalkIconImage
            });

            await new Promise<void>((resolve, reject) => {
                talkIcon.onLoad = resolve;
            })

            const talkIconPosition = TalkIconList[i].position(canvas);

            talkIcon.position.x = talkIconPosition.x;
            talkIcon.position.y = talkIconPosition.y;
            talkIcon.position.z = 1;

            this.talkIconList.push(talkIcon);
            this.add(talkIcon);
        }
    }
}