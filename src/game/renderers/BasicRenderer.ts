import * as THREE from "three";

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { BrightnessContrastShader } from 'three/examples/jsm/shaders/BrightnessContrastShader.js';
import { getCurrentRoute } from "../routers";
import { BasicCamera } from "../cameras/BasicCamera";

export class BasicRenderer {
    private webglRenderer!: THREE.WebGLRenderer;
    public composer!: EffectComposer;
    public renderPass!: RenderPass;
    public camera: BasicCamera;
    public name: string = "basic";

    constructor(canvas: HTMLCanvasElement) {
        const ctx: WebGLRenderingContext = canvas.getContext('webgl') as WebGLRenderingContext;
        this.webglRenderer = new THREE.WebGLRenderer({
            context: ctx,
            antialias: true,
            alpha: true
        });

        this.camera = new BasicCamera(canvas);

        this.webglRenderer.autoClear = true;
        this.webglRenderer.setSize(canvas.width, canvas.height);

        this.webglRenderer.sortObjects = false;
        this.webglRenderer.localClippingEnabled = true;
        this.webglRenderer.toneMapping = THREE.CustomToneMapping;
        this.webglRenderer.toneMappingExposure = 2;
        this.webglRenderer.setClearColor(0xFFFFFF, 0);

        this.initComposer();
    }

    private initComposer = () => {
        this.composer = new EffectComposer(this.webglRenderer);
        this.renderPass = new RenderPass(getCurrentRoute(), this.camera);
        const brightnessContrastPass = new ShaderPass(BrightnessContrastShader);
        brightnessContrastPass.uniforms.brightness.value = 0.08;
        brightnessContrastPass.uniforms.contrast.value = 0.08;
        this.composer.addPass(this.renderPass);
        this.composer.addPass(brightnessContrastPass);

        this.renderPass.clearColor = new THREE.Color(0xFFFFFF);
    }

    public render() {
        this.composer.render();
    }
}