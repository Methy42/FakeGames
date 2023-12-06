import { setCurrentRoute } from "../../routers";
import { initAssetsStore } from "../../store/InitAssets";
import { BasicScene } from "../Basic/BasicScene";

export class InitScene extends BasicScene {
    public needLoading = true;
    public manualLoadingProcess = true;
    private isFirstRender = true;

    constructor() {
        super();

        const oldtOnBeforeRender = this.onBeforeRender;
        this.onBeforeRender = (...args) => {
            oldtOnBeforeRender?.(...args);

            if (this.isFirstRender) {
                this.isFirstRender = false;

                setTimeout(() => {
                    setCurrentRoute("start", {
                        showFromInit: true
                    });
                }, 50);
            }
        };
    }

    public async load(canvas: HTMLCanvasElement, setCurrentProcess?: (process: number) => void) {
        initAssetsStore.addEventListener("process", (event) => {
            setCurrentProcess?.(event.process as number);
        });

        await initAssetsStore.loadAsync(canvas);

        await super.load(canvas);
    };
}