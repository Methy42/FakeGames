import * as THREE from 'three';
import { APartition } from './APartition';

/**
 * VerticalFileRack
 * @class VerticalFileRack 立式文件架
 */
export class VerticalFileRack extends THREE.Object3D {
    private aPartition: APartition;

    constructor() {
        super();

        this.aPartition = new APartition();
        this.aPartition.position.set(0, 0, 0);
        this.add(this.aPartition);
    }
}