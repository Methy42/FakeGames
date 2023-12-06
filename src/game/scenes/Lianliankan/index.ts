import * as THREE from 'three';

import { UIActionEvent, bindClickEvent, unbindEvent } from '../../controls/UIActionControls';

const Laoge1Image = 'https://methy.net:10233/images/laoge/laoge-1.png';
const Laoge2Image = 'https://methy.net:10233/images/laoge/laoge-2.png';
const Laoge3Image = 'https://methy.net:10233/images/laoge/laoge-3.png';
const Laoge4Image = 'https://methy.net:10233/images/laoge/laoge-4.png';
const Laoge5Image = 'https://methy.net:10233/images/laoge/laoge-5.png';
const LaogeActivedImage = 'https://methy.net:10233/images/laoge/laoge-actived.png';

export class Lianliankan extends THREE.Scene {
    private isFirstRender: boolean = true;

    private planeWidth: number = 60;
    private planeHeight: number = 60;

    private itemPlaneImageSrcList: string[] = [
        Laoge1Image,
        Laoge2Image,
        Laoge3Image,
        Laoge4Image,
        Laoge5Image
    ];

    private itemPlaneList: THREE.Mesh[] = [];

    private planeClickEvents: UIActionEvent[] = [];

    constructor() {
        super();

        this.onBeforeRender = (renderer, _, camera) => {
            if (this.isFirstRender) {
                this.isFirstRender = false;
            }
        };

        this.addLianliankanPlanes(4, 4).then(() => {
            this.bindPlanesClickEvent();
        });
    }

    private initItemPlane(backgroundImageSrc: string) {
        return new Promise<THREE.Mesh>((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(backgroundImageSrc, (texture) => {
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    side: THREE.DoubleSide,
                });

                const geometry = new THREE.PlaneGeometry(this.planeWidth, this.planeHeight);

                const itemPlane = new THREE.Mesh(geometry, material);

                itemPlane.userData = {
                    ...(itemPlane.userData || {}),
                    backgroundImageSrc
                };

                resolve(itemPlane);
            });
        });
    }

    private async addLianliankanPlanes(row: number, column: number) {
        const totalPlaneCount = row * column;

        if (totalPlaneCount % 2 !== 0) {
            throw new Error('The total plane count must be even.');
        }

        // 预先创建一个足够容纳所有块的数组
        this.itemPlaneList = [];
        for (let i = 0; i < totalPlaneCount / 2; i++) {
            const planeType1 = await this.initItemPlane(this.itemPlaneImageSrcList[i % this.itemPlaneImageSrcList.length]);
            const planeType2 = await this.initItemPlane(this.itemPlaneImageSrcList[i % this.itemPlaneImageSrcList.length]);
            this.itemPlaneList.push(planeType1);
            this.itemPlaneList.push(planeType2);
        }

        // 随机打乱块数组顺序
        for (let i = this.itemPlaneList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.itemPlaneList[i], this.itemPlaneList[j]] = [this.itemPlaneList[j], this.itemPlaneList[i]];
        }

        // 根据行列数及平面宽高创建平面
        let planeIndex = 0;
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < column; j++) {
                    const itemPlane = this.itemPlaneList[planeIndex];
                    itemPlane.position.set(
                        (j - column / 2) * this.planeWidth + this.planeWidth / 2,
                        (i - row / 2) * this.planeHeight + this.planeHeight / 2,
                        0
                    );
                    itemPlane.name = `plane-${i}-${j}`;
                    itemPlane.userData = {
                        ...(itemPlane.userData || {}),
                        row: i,
                        column: j
                    };
                    this.add(itemPlane);
    
                    planeIndex++;
            }
        }
    }

    private bindPlanesClickEvent() {
        this.itemPlaneList.forEach(itemPlane => {
            const planeClickEvent = bindClickEvent(itemPlane, () => {
                // 判断是否已有激活的平面
                const activedPlane = this.getObjectByName('activedPlane');
                if (activedPlane) {
                    // 判断是否可以消除
                    if (this.canBeConnectedAndEliminated(activedPlane.userData.targetPlane as THREE.Mesh, itemPlane)) {
                        // 可以消除
                        this.remove(activedPlane.userData.targetPlane as THREE.Mesh);
                        this.remove(activedPlane);
                        this.remove(itemPlane);
                    } else {
                        // 不可以消除
                        this.createActivedPlane(itemPlane);
                    }
                } else {
                    // 没有激活的平面
                    this.createActivedPlane(itemPlane);
                }
            });

            this.planeClickEvents.push(planeClickEvent);
        });
    }

    // 在指定平面上创建一个激活的平面，创建之前会先销毁之前的激活平面
    private async createActivedPlane(plane: THREE.Mesh) {
        // 销毁之前的激活平面
        const activedPlane = this.getObjectByName('activedPlane');
        if (activedPlane) {
            this.remove(activedPlane);
        }
        
        // 创建新的激活平面
        const activedPlaneImageSrc = LaogeActivedImage;
        const activedPlaneMesh = await this.initItemPlane(activedPlaneImageSrc);
        activedPlaneMesh.name = 'activedPlane';
        activedPlaneMesh.userData = {
            ...(activedPlaneMesh.userData || {}),
            targetPlane: plane
        };
        activedPlaneMesh.position.set(plane.position.x, plane.position.y, plane.position.z + 1);
        this.add(activedPlaneMesh);

        return activedPlaneMesh;
    }

    private canBeConnectedAndEliminated = (plane1: THREE.Mesh, plane2: THREE.Mesh) => {
        const plane1UserData = plane1.userData;
        const plane2UserData = plane2.userData;

        if (plane1UserData.backgroundImageSrc !== plane2UserData.backgroundImageSrc) {
            return false;
        }

        if (plane1UserData.row === plane2UserData.row) {
            // 同行
            const start = Math.min(plane1UserData.column, plane2UserData.column);
            const end = Math.max(plane1UserData.column, plane2UserData.column);

            if (this.hasPlaneInRowOrColumn('row', start, end, plane1UserData.row)) {
                return false;
            }
        } else if (plane1UserData.column === plane2UserData.column) {
            // 同列
            const start = Math.min(plane1UserData.row, plane2UserData.row);
            const end = Math.max(plane1UserData.row, plane2UserData.row);

            if (this.hasPlaneInRowOrColumn('column', start, end, plane1UserData.column)) {
                return false;
            }
        } else {
            
            const plane1Row = plane1UserData.row;
            const plane1Column = plane1UserData.column;
            const plane2Row = plane2UserData.row;
            const plane2Column = plane2UserData.column;

            // 一次转折
            if (this.hasPlaneInRowOrColumn('row', Math.min(plane1Column, plane2Column), Math.max(plane1Column, plane2Column), plane1Row)) {
                return false;
            } else if (this.hasPlaneInRowOrColumn('column', Math.min(plane1Row, plane2Row), Math.max(plane1Row, plane2Row), plane1Column)) {
                return false;
            } else if (this.hasPlaneInRowOrColumn('row', Math.min(plane1Column, plane2Column), Math.max(plane1Column, plane2Column), plane2Row)) {
                return false;
            } else if (this.hasPlaneInRowOrColumn('column', Math.min(plane1Row, plane2Row), Math.max(plane1Row, plane2Row), plane2Column)) {
                return false;
            } else {
                return true;
            }



            // 二次转折
            // 计算出所有可能的转折点
            // const possibleTurnPoints: [number, number][] = [];




            return false;
        }

        return true;
    }

    private hasPlaneInRowOrColumn = (type: 'row' | 'column', start: number, end: number, dept: number) => {
        for (let i = start + 1; i < end; i++) {
            const plane = this.getObjectByName(`plane-${type === 'row' ? dept : i}-${type === 'column' ? dept : i}`);
            if (plane) {
                return true;
            }
        }

        return false;
    };

    public clear = () => {
        this.children.forEach(child => {
            this.remove(child);
        });
        this.planeClickEvents.forEach(planeClickEvent => {
            unbindEvent(planeClickEvent);
        });

        return this;
    }
}