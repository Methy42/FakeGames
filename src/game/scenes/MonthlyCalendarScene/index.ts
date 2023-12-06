import { UIActionEvent, bindClickEvent, unbindEvent } from "../../controls/UIActionControls";
import { ImageButton } from "../../objects/Buttons/Image";
import { setCurrentRoute } from "../../routers";
import { BasicScene } from "../Basic/BasicScene";

const BackIconImage = "https://methy.net:10233/images/back.png";
const MonthlyCalenderImageDir = "https://methy.net:10233/images/monthly_calendar/";

export class MonthlyCalendarScene extends BasicScene {
    public needLoading: boolean = true;
    public manualLoadingProcess = true;
    private backIcon!: ImageButton;
    private backIconClickEvent!: UIActionEvent;

    private monthlyCalendarImageList: ImageButton[] = [];

    constructor() {
        super("https://methy.net:10233/images/monthly_calendar/background.png");
    }

    public async load(canvas: HTMLCanvasElement, setCurrentProcess?: (process: number) => void) {
        await super.load(canvas);

        await this.loadBackIcon(canvas);

        setCurrentProcess && setCurrentProcess(0);

        await this.loadMonthlyCalenderImageList(setCurrentProcess);
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
            setCurrentRoute("level_menu", {
                type: "simple"
            });
        });
    };

    private loadMonthlyCalenderImageList = async (setCurrentProcess?: (process: number) => void) => {
        for (let index = 12; index >= 1; index--) {
            const imageSrc = MonthlyCalenderImageDir + index + ".png";
            const imageButton = new ImageButton({
                scaling: 0.5,
                imageSrc
            });

            await new Promise<void>((resolve) => {
                imageButton.onLoad = resolve;
            });

            imageButton.position.y = 0;
            imageButton.position.x = 0;
            imageButton.position.z = 1;

            this.add(imageButton);

            this.monthlyCalendarImageList.push(imageButton);

            setCurrentProcess && setCurrentProcess((12 - index) / 12 * 100);
        }
    }

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