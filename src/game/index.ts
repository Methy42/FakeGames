import { BasicRenderer } from "./renderers/BasicRenderer";
import { InitUIActionControls, setUIActionControls } from "./controls/UIActionControls";
import { InitRouter, getCurrentRoute, setRouterProps } from "./routers";
import * as apis from "../apis";
import { playerStore } from './store/Player';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

export interface IRenderer {
    name: string;
    composer?: EffectComposer;
    renderPass?: RenderPass;
    camera?: THREE.Camera;
    render: () => void;
}

class GameInstance {
    private canvas!: HTMLCanvasElement;
    private renderer!: IRenderer;

    get currentRenderer() {
        return this.renderer?.name;
    }

    public InitGame = ({
        canvas
    }: {
        canvas: any
    }) => {
        this.canvas = canvas;
        

        this.initCanvasSize();

        InitRouter({
            defaultRouteKey: "init",
            canvas: this.canvas
        });

        this.renderer = new BasicRenderer(this.canvas);

        setRouterProps({
            effectComposer: this.renderer.composer,
            renderPass: this.renderer.renderPass,
        })

        InitUIActionControls({
            canvas: this.canvas,
            camera: this.renderer.camera,
        });
    }

    private initCanvasSize = () => {
        const { width, height } = this.canvas.getBoundingClientRect();
        
        this.canvas.width = width * 2;
        this.canvas.height = height * 2;
    }

    private render = () => {
        this.renderer.render();
        requestAnimationFrame(this.render);
    }

    public start = () => {
        this.render();
    }

    public wxLogin = (code: string, userInfo: IWxUserInfo) => {
        apis.wxLogin(code, userInfo).then((res: any) => {
            const wxplayer = res.data.data.player;
            playerStore.name = wxplayer.name;
            playerStore.avatarUrl = wxplayer.avatarUrl;
            playerStore.language = wxplayer.language;
            playerStore.token = res.data.data.token;
        }).catch(err => {
            console.log(err);
        });
    }

    public setRenderer = (rendererFactory: (canvas: HTMLCanvasElement) => IRenderer) => {
        this.renderer = rendererFactory(this.canvas);

        setRouterProps({
            effectComposer: this.renderer.composer,
            renderPass: this.renderer.renderPass,
        })

        setUIActionControls({
            canvas: this.canvas,
            camera: this.renderer.camera,
        });
    }
}

const gameInstance = new GameInstance();

export const InitGame = gameInstance.InitGame;
export const start = gameInstance.start;
export const wxLogin = gameInstance.wxLogin;
export const setRenderer = gameInstance.setRenderer;
export const currentRenderer = gameInstance.currentRenderer;
