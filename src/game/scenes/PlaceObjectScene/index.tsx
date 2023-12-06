import * as THREE from 'three';

const HuazhuangbaoImage = 'https://methy.net:10233/images/cosmetics/化妆包.png';
const KouhongImage = 'https://methy.net:10233/images/cosmetics/口红.png';
const XimiannaiImage = 'https://methy.net:10233/images/cosmetics/洗面奶.png';
const MeibiImage = 'https://methy.net:10233/images/cosmetics/眉笔.png';
const JiemaojiaImage = 'https://methy.net:10233/images/cosmetics/睫毛夹.png';
const FendiImage = 'https://methy.net:10233/images/cosmetics/粉底.png';

const KouhongOutlineImage = 'https://methy.net:10233/images/cosmetics/口红-outline.png';
const XimiannaiOutlineImage = 'https://methy.net:10233/images/cosmetics/洗面奶-outline.png';
const MeibiOutlineImage = 'https://methy.net:10233/images/cosmetics/眉笔-outline.png';
const JiemaojiaOutlineImage = 'https://methy.net:10233/images/cosmetics/睫毛夹-outline.png';
const FendiOutlineImage = 'https://methy.net:10233/images/cosmetics/粉底-outline.png';
import { bindClickEvent } from '../../controls/UIActionControls';
import { getCurrentRoute } from '../../routers';

export class PlaceObjectScene extends THREE.Scene {
    private isFirstRender = true;

    private objectWidth = 100;
    private objectHeight = 100;
    private intervalDistance = 10;

    private outlineImageList = [
        KouhongOutlineImage,
        XimiannaiOutlineImage,
        MeibiOutlineImage,
        JiemaojiaOutlineImage,
        FendiOutlineImage
    ];

    private imageList = [
        KouhongImage,
        XimiannaiImage,
        MeibiImage,
        JiemaojiaImage,
        FendiImage
    ];

    private outlineList: THREE.Mesh[] = [];
    private objectList: THREE.Mesh[] = [];
    private huazhuangbao!: THREE.Mesh;

    constructor() {
        super();

        this.initOutlineList();
        this.onBeforeRender = (renderer) => {
            if (this.isFirstRender) {
                this.isFirstRender = false;
                this.initHuazhuangbao(renderer);
            }

            for (let i = 0; i < this.objectList.length; i++) {
                const object = this.objectList[i];
                if (object.userData.flying) {
                    object.position.x += (-100 - object.position.x) / 10;
                    object.position.y += (100 - object.position.y) / 10;

                    if (Math.abs(object.position.x - (-100)) < 10 && Math.abs(object.position.y - 100) < 10) {
                        object.userData.flying = false;
                    }
                }
            }
        }
    }

    private async initOutlineList() {
        const outlineList = await Promise.all(this.outlineImageList.map(async (image, index) => {
            const texture = await new THREE.TextureLoader().loadAsync(image);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true
            });
            const geometry = new THREE.PlaneGeometry(this.objectWidth, this.objectHeight);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = `outline-${index}`;
            mesh.position.x = index * this.objectWidth + index * this.intervalDistance - 2 * this.objectWidth - 2 * this.intervalDistance;
            mesh.position.y = 0;
            mesh.position.z = 0;
            this.add(mesh);
            return mesh;
        }));
        this.outlineList = outlineList;
        return outlineList;
    }

    private async initHuazhuangbao(renderer: THREE.WebGLRenderer) {
        const canvasWidth = renderer.domElement.width;
        const canvasHeight = renderer.domElement.height;

        const texture = await new THREE.TextureLoader().loadAsync(HuazhuangbaoImage);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        const geometry = new THREE.PlaneGeometry(this.objectWidth, this.objectHeight);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'huazhuangbao';
        mesh.position.x = canvasWidth / 2 - this.objectWidth / 2 - 100;
        mesh.position.y = -canvasHeight / 2 + this.objectHeight / 2 + 100;
        mesh.position.z = 0;
        bindClickEvent(mesh, () => {
            getCurrentRoute() === this &&
            this.addObject(this.imageList[this.objectList.length]);
        });
        this.huazhuangbao = mesh;
        this.add(mesh);
        return mesh;
    }

    private async addObject(backgroundImgSrc: string) {
        const texture = await new THREE.TextureLoader().loadAsync(backgroundImgSrc);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        const geometry = new THREE.PlaneGeometry(this.objectWidth, this.objectHeight);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'object';
        mesh.position.x = this.huazhuangbao.position.x;
        mesh.position.y = this.huazhuangbao.position.y;
        mesh.position.z = 0;
        mesh.userData = {flying: true};
        
        this.add(mesh);
        this.objectList.push(mesh);
        return mesh;
    }

}