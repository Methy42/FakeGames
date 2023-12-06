import * as THREE from 'three';
import { BasicText } from '../Text/Basic';

export class BasicLoading extends THREE.Group {
    private process: number = 0;
    private expectedProcess: number = 0;
    private width: number = 400;
    private height: number = 40;
    private processContainerPadding: number = 10;
    private processColor: number = 0x705d58;
    private processContainerColor: number = 0xe1dfe0;
    private processMesh!: THREE.Mesh;
    private processContainerMesh!: THREE.Mesh;
    private processText!: BasicText;

    constructor() {
        super();

        this.initProcessText();
        this.initProcessContainerMesh();
        this.initProcessMesh();

        setInterval(this.updateProcess, 1000 / 60);
    }

    private createRoundedRectangle(x: number, y: number, width: number, height: number, color: number) {
        const radius = height / 2; // set the radius of the rounded corners

        // create a rounded rectangle shape
        const roundedRectShape = new THREE.Shape();
        const heightMinusRadius = height - radius;
        roundedRectShape.moveTo(x + radius, y);
        roundedRectShape.lineTo(x + width - radius, y);
        roundedRectShape.quadraticCurveTo(x + width, y, x + width, y + radius);
        roundedRectShape.lineTo(x + width, y + heightMinusRadius);
        roundedRectShape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        roundedRectShape.lineTo(x + radius, y + height);
        roundedRectShape.quadraticCurveTo(x, y + height, x, y + heightMinusRadius);
        roundedRectShape.lineTo(x, y + radius);
        roundedRectShape.quadraticCurveTo(x, y, x + radius, y);

        // extrude the shape into a 3D geometry
        const extrudeSettings = {
            depth: 0.1,
            bevelEnabled: false,
        };
        const geometry = new THREE.ExtrudeGeometry(roundedRectShape, extrudeSettings);

        // create a mesh from the geometry
        const material = new THREE.MeshBasicMaterial({ color, transparent: true });
        this.processMesh = new THREE.Mesh(geometry, material);

        return this.processMesh;
    }

    private initProcessMesh() {
        if (this.process <= 4) return;
        this.processMesh = this.createRoundedRectangle(
            -this.width / 2 + this.processContainerPadding,
            -this.height / 2 + this.processContainerPadding,
            this.process * (this.width - this.processContainerPadding * 2) / 100,
            this.height - this.processContainerPadding * 2,
            this.processColor
        );
        this.processMesh.position.setZ(0.1);
        this.add(this.processMesh);
    }

    private initProcessContainerMesh() {
        this.processContainerMesh = this.createRoundedRectangle(-this.width / 2, -this.height / 2, this.width, this.height, this.processContainerColor);
        this.processContainerMesh.position.setZ(0);
        this.add(this.processContainerMesh);
    }

    private initProcessText() {
        this.processText = new BasicText({
            x: this.width / 2 - 30,
            y: -this.height / 2 - 20,
            text: `${ this.process }%`,
            size: 16,
            color: this.processColor,
        });

        this.processText.position.setZ(0.2);

        this.processText.loadAsync().then(() => {
            this.add(this.processText);
        });
    }

    public setProcess(process: number) {
        this.expectedProcess = Math.floor(process);
    }

    public initProcess() {
        this.process = 0;
        this.expectedProcess = -1;
        this.updateProcess();
    }

    private updateProcess = () => {
        if (this.expectedProcess === this.process) return;

        if (this.expectedProcess > this.process) {
            const count = this.expectedProcess - this.process;
            if (count / 10 > 2) {
                this.process+=count/10;
            } else {
                this.process+=2;
            }
        }

        this.processContainerMesh.clear();
        this.processMesh.clear();

        this.remove(this.processContainerMesh);
        this.remove(this.processMesh);

        this.initProcessContainerMesh();
        this.initProcessMesh();

        this.processText && this.processText.updateText({
            text: `${ this.process }%`
        });
    };
}