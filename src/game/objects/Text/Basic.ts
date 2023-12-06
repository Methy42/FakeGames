import * as THREE from "three";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { requestAssets } from "../../../utils/request";
import opentype from 'opentype.js'
import { OTFToJSON } from "../../../utils/font";

export interface IBasicTextProps {
    x?: number;
    y?: number;
    text?: string;
    color?: number;
    size?: number;
    wordSpace?: number;
    curveSegments?: number;
    bevelEnabled?: boolean;
}

export class BasicText extends THREE.Group {
    private x: number = 0;
    private y: number = 0;
    private text: string = "";
    private opacity: number = 1;
    private color: number = 0x000000;
    private size: number = 1;
    private wordSpace: number;
    private curveSegments: number = 12;
    private bevelEnabled: boolean = false;
    private static font: Font;
    private static fontLoading: boolean = false;

    public width: number = 0;
    public height: number = 0;

    constructor(props: IBasicTextProps) {
        super();

        props.x && (this.x = props.x);
        props.y && (this.y = props.y);
        props.text && (this.text = props.text);
        props.color && (this.color = props.color);
        props.size && (this.size = props.size);
        props.wordSpace ? (this.wordSpace = props.wordSpace) : (this.wordSpace = this.size * 0.3);
        props.curveSegments && (this.curveSegments = props.curveSegments);
        props.bevelEnabled && (this.bevelEnabled = props.bevelEnabled);
    }

    private loadFont = async () => {
        try {
            BasicText.fontLoading = true;
            const result = await requestAssets("https://methy.net:10233/fonts/AlimamaShuHeiTi-Bold.otf", {
                method: "GET",
                responseType: "arraybuffer"
            });
            
            const fontFile = opentype.parse((result as any).data);
            
            const fontJSON = OTFToJSON(fontFile);
            BasicText.font = new FontLoader().parse(JSON.parse(fontJSON));
            BasicText.fontLoading = false;
        } catch (error) {
            BasicText.fontLoading = false;
            console.log("Failed to load font", error);
        }
    }

    private loadText = () => {
        try {
            const strList = this.text.split("");
            this.width = 0;
            this.height = 0;
            for (let index = 0; index < strList.length; index++) {
                const str = strList[index];
                const geometry = new TextGeometry(str, {
                    font: BasicText.font,
                    size: this.size,
                    height: 1,
                    curveSegments: this.curveSegments,
                    bevelEnabled: this.bevelEnabled,
                });

                geometry.computeBoundingBox();
                geometry.computeVertexNormals();

                const positionArray = new Float32Array(geometry.attributes.position.array);
                const boundingBox = new THREE.Box3().setFromBufferAttribute(new THREE.BufferAttribute(positionArray, 3));
                const width = boundingBox.max.x - boundingBox.min.x;
                const height = boundingBox.max.y - boundingBox.min.y;

                for (let i = 0; i < positionArray.length; i += 3) {
                    positionArray[i] += this.x;
                    positionArray[i + 1] += this.y;
                }
                geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
        
                const material = new THREE.MeshStandardMaterial({
                    color: this.color,
                    transparent: true,
                    roughness: 0.1,
                    metalness: 0.1,
                    opacity: this.opacity
                });

                const mesh = new THREE.Mesh(geometry, material);
                
        
                mesh.position.x = (index - strList.length/2) * width - width/2 + this.wordSpace * index;
                mesh.position.y = -height/2;

                this.width += width + this.wordSpace;
                this.height < height && (this.height = height);

                this.add(mesh);
            }
        } catch (error) {
            console.log("Failed to load text", error);
        }
    };

    public async loadAsync() {
        if (!BasicText.font && !BasicText.fontLoading) {
            await this.loadFont();
        }
        BasicText.font && this.loadText();
    }

    public updateText = async ({
        text,
        opacity
    }: {
        text: string;
        opacity?: number;
    }) => {
        this.text = text;
        opacity && (this.opacity = opacity);
        this.clear();
        this.loadText();
    }
}