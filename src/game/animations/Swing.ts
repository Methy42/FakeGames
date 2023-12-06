import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'

export function startSwingAnimation(
    object: THREE.Object3D,
    duration: number,
    easing?: (k: number) => number
): void {
    const leftSwing = new TWEEN.Tween(object.rotation)
        .to({ y: -Math.PI / 4 }, duration / 2)
        .easing(easing || TWEEN.Easing.Quadratic.Out)
        .onComplete(() => rightSwing.start());

    const rightSwing = new TWEEN.Tween(object.rotation)
        .to({ y: Math.PI / 4 }, duration / 2)
        .easing(easing || TWEEN.Easing.Quadratic.Out)
        .onComplete(() => leftSwing.start());

    leftSwing.chain(rightSwing);
    rightSwing.chain(leftSwing);

    leftSwing.start()
}