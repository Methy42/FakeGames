import * as THREE from "three";

class TextureLoader extends THREE.TextureLoader {}

const textureLoader = new TextureLoader();

export const load = textureLoader.load.bind(textureLoader);

export const loadAsync = (url: string): Promise<THREE.Texture> => {
    return new Promise((resolve, reject) => {
        textureLoader.load(url, resolve, undefined, reject);
    });
}