import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { BasicCamera } from '../cameras/BasicCamera';
import { getCurrentRoute } from '../routers';

export class UIReaderer {
    public renderer: CSS3DRenderer;
    private canvas: HTMLCanvasElement;
    public name: string = "ui";
    public camera: BasicCamera;
    private isFirstRender = true;

    constructor(canvas: HTMLCanvasElement) {
        this.renderer = new CSS3DRenderer();
        this.canvas = canvas;
        this.camera = new BasicCamera(canvas);

        this.renderer.setSize(this.canvas.width, this.canvas.height);
    }

    public render() {
        if (this.isFirstRender) {
            this.isFirstRender = false;
            
        }
        
        this.renderer.render(getCurrentRoute(), this.camera);
    }
}