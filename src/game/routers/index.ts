import * as THREE from "three";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { StartScene } from "../scenes/StartScene";
import { LevelMenuScene } from "../scenes/LevelMenuScene";
import { ObjectTestScene } from "../scenes/ObjectTestScene";
import { Lianliankan } from "../scenes/Lianliankan";
import { PlaceObjectScene } from "../scenes/PlaceObjectScene";
import { KitchenScene } from "../scenes/Kitchen";
import { LiveRoomScene } from "../scenes/LiveRoomScene";
import { LoadingScene } from "../scenes/LoadingScene";
import { PersonalCenterScene } from "../scenes/PersonalCenterScene";
import { MonthlyCalendarScene } from "../scenes/MonthlyCalendarScene";
import { InitScene } from "../scenes/InitScene";
import { OutingScene } from "../scenes/OutingScene";

export interface IInitRouterProps {
    defaultRouteKey: string;
    canvas: HTMLCanvasElement,
    effectComposer?: EffectComposer;
    renderPass?: RenderPass
};

class RouterInstance {
    private routerMap: { [key: string]: () => THREE.Scene } = {
        "init": () => new InitScene(),
        "start": () => new StartScene(),
        "level_menu": () => new LevelMenuScene(),
        "object_test": () => new ObjectTestScene(),
        "lianliankan": () => new Lianliankan(),
        "place_object": () => new PlaceObjectScene(),
        "kitchen": () => new KitchenScene(),
        "live_room": () => new LiveRoomScene(),
        "personal_center": () => new PersonalCenterScene(),
        "monthly_calender": () => new MonthlyCalendarScene(),
        "outing": () => new OutingScene()
    };

    private canvas!: HTMLCanvasElement;

    private effectComposer?: EffectComposer;
    private renderPass?: RenderPass;

    private currentRoute!: THREE.Scene;
    private currentRouteParams?: { [key: string]: unknown };

    private loadingScene: LoadingScene = new LoadingScene();

    public InitRouter = (props: IInitRouterProps) => {
        this.canvas = props.canvas;
        props.effectComposer && (this.effectComposer = props.effectComposer);
        props.renderPass && (this.renderPass = props.renderPass);
        this.setCurrentRoute(props.defaultRouteKey);
    }

    public setRouterProps = (props: {
        effectComposer?: EffectComposer;
        renderPass?: RenderPass
    }) => {
        this.effectComposer && this.effectComposer.reset();

        props.effectComposer && (this.effectComposer = props.effectComposer);
        props.renderPass && (this.renderPass = props.renderPass);
    };

    public getCurrentRoute = () => {
        return this.currentRoute;
    }

    public setCurrentRoute = (routeKey: string, params?: {[key: string]: unknown}) => {
        this.currentRoute?.clear();
        this.currentRouteParams = params;

        const nextRoute = this.routerMap[routeKey]();
        
        if ((nextRoute as any).needLoading) {
            this.loadingScene.init({
                manualProcess: (nextRoute as any).manualLoadingProcess,
                loadingMethod: (setCurrentProcess) => ((nextRoute as any).load?.(this.canvas, setCurrentProcess) || Promise.resolve()),
                callback: () => {
                    this.currentRoute = nextRoute;
                    this.renderPass && (this.renderPass.scene = this.currentRoute);
                }
            })

            this.currentRoute = this.loadingScene;
            this.renderPass && (this.renderPass.scene = this.currentRoute);
        } else {
            (nextRoute as any).load?.(this.canvas);
            this.currentRoute = nextRoute;
            this.renderPass && (this.renderPass.scene = this.currentRoute);
        }
        
    }

    public getCurrentRouteParams = () => this.currentRouteParams;
}

const routerInstance = new RouterInstance();

export const InitRouter = routerInstance.InitRouter;
export const setRouterProps = routerInstance.setRouterProps;
export const getCurrentRoute = routerInstance.getCurrentRoute;
export const setCurrentRoute = routerInstance.setCurrentRoute;
export const getCurrentRouteParams = routerInstance.getCurrentRouteParams;