import * as THREE from 'three';
import { BasicText } from '../../objects/Text/Basic';
import { BasicScene } from '../Basic/BasicScene';
import { playerStore } from '../../store/Player';
import { ImageButton } from '../../objects/Buttons/Image';
import { UIActionEvent, bindClickEvent, unbindEvent } from '../../controls/UIActionControls';
import { setCurrentRoute } from '../../routers';

const BackIconImage = "https://methy.net:10233/images/back.png";

export class PersonalCenterScene extends BasicScene {
    private nickname?: BasicText;

    private backIcon!: ImageButton;
    private backIconClickEvent!: UIActionEvent;

    constructor() {
        super("https://methy.net:10233/images/personal_center.jpg");

        playerStore.addEventListener("change", async () => {
            await this.loadNickname();
        });
    }

    public async load(canvas: HTMLCanvasElement) {
        await super.load(canvas);

        await this.loadBackIcon(canvas);

        await this.loadNickname();
    }

    private loadNickname = async () => {
        if (!playerStore.name) return;

        this.nickname = new BasicText({ text: playerStore.name, size: 16, color: 0xa2c8b4 });

        await this.nickname.loadAsync();

        this.nickname.position.set(-480, 50, 0);
        this.add(this.nickname);
    }

    private loadBackIcon = async (canvas: HTMLCanvasElement) => {
        this.backIcon = new ImageButton({
            scaling: 0.2,
            imageSrc: BackIconImage
        });

        await new Promise<void>((resolve) => {
            this.backIcon.onLoad = resolve;
        });

        this.backIcon.position.y = (canvas.height / 2) - 72;
        this.backIcon.position.x = (-canvas.width / 2) + 84;
        this.backIcon.position.z = 2;

        this.add(this.backIcon);

        this.backIconClickEvent = bindClickEvent(this.backIcon, () => {
            setCurrentRoute("start");
        });
    };

    public clear() {
        super.clear?.();
        unbindEvent(this.backIconClickEvent);

        this.children.forEach(child => {
            child.clear && child.clear();
            this.remove(child);
        });

        return this;
    }
}

// Path: src/game/scenes/PersonalCenterScene/index.ts