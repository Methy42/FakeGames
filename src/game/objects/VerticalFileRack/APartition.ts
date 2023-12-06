import * as THREE from 'three';

export class APartition extends THREE.Object3D {
    private width: number = 25;
    private height: number = 30;

    private headPlane: THREE.Mesh;
    private tailPlane: THREE.Mesh;

    constructor() {
        super();
        
        this.headPlane = this.createMainPlane();
        this.headPlane.position.set(-1, 0, 0);
        this.headPlane.lookAt(-2, 0, 0);
        this.add(this.headPlane);

        this.tailPlane = this.createMainPlane();
        this.tailPlane.position.set(1, 0, 0);
        this.tailPlane.lookAt(2, 0, 0);
        this.add(this.tailPlane);
    }

    private createMainPlane() {
        const shape = new THREE.Shape();
        shape.moveTo(-this.width / 2, this.height / 2);
        shape.quadraticCurveTo(-this.width / 2 + this.width / 3, this.height / 2, -this.width / 2 + this.width / 3, this.height / 2 - this.height / 3);
        shape.quadraticCurveTo(-this.width / 2 + this.width / 3, -this.height / 2 + this.height / 3, this.width / 2 - this.width / 3, -this.height / 2 + this.height / 3);
        shape.quadraticCurveTo(this.width / 2, -this.height / 2 + this.height / 3, this.width / 2, -this.height / 2);
        shape.lineTo(-this.width / 2, -this.height / 2);
        shape.lineTo(-this.width / 2, this.height / 2);

        const geometry = new THREE.ExtrudeGeometry(shape, {
            steps: 1,
            depth: 0,
            bevelEnabled: false
        });
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        
        return plane;
    }
}