import * as THREE from "three";

export class BasicCamera extends THREE.OrthographicCamera {
    constructor(canvas: HTMLCanvasElement) {
        super(
            canvas.width / -2,
            canvas.width / 2,
            canvas.height / 2,
            canvas.height / -2,
            1,
            1000
        );
        this.position.z = 10;
    }
}