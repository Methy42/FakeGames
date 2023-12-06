import * as THREE from 'three';
import { generateUUID } from '../../utils/uuid';

interface IInitUIActionControlsInstanceProps {
    canvas: HTMLCanvasElement;
    camera?: THREE.Camera;
};

export class UIActionEvent {
    public id = generateUUID();
    public type: string;
    public callback: (event: UIActionEventTarget) => void;

    constructor(type: string, callback: (event: UIActionEventTarget) => void) {
        this.type = type;
        this.callback = callback;
    }
}

export interface UIActionEventTarget extends THREE.BaseEvent {
    preventDefault?: () => void;
}

export class UIActionEventDispatcher extends THREE.EventDispatcher<{
    move: unknown;
    click: unknown;
    drag: unknown;
}> {
    public dispatchEvent<T extends 'move' | 'click' | 'drag'>(event: UIActionEventTarget & { move: unknown; click: unknown; drag: unknown; }[T]): void {
        // super.dispatchEvent(event);
        if ( (this as any)._listeners === undefined ) return;

		const listeners = (this as any)._listeners;
		const listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			(event as any).target = this;

			// Make a copy, in case listeners are removed while iterating.
			const array = listenerArray.slice( 0 );

            let breakLoop = false;
			for ( let i = 0, l = array.length; i < l; i ++ ) {

                if (breakLoop) break;

                event.preventDefault = function () {
                    breakLoop = true;
                }

				array[ i ].call( this, event );

			}

		}
    }
}

class UIActionControlsInstance {
    private canvas!: HTMLCanvasElement;
    private camera?: THREE.Camera;
    private mouse: THREE.Vector2 | null = null;
    private mouseChangeValue: THREE.Vector2 | null = null;
    private raycaster: THREE.Raycaster = new THREE.Raycaster();
    public eventDispatcher = new UIActionEventDispatcher();
    private touchStartEvent: TouchEvent | null = null;
    private mouseDownEvent: MouseEvent | null = null;
    private actionEvents: UIActionEvent[] = [];

    public InitUIActionControls = (props: IInitUIActionControlsInstanceProps) => {
        this.canvas = props.canvas;
        props.camera && (this.camera = props.camera);

        this.canvas.addEventListener('mousemove', this.onMouseMove, false);
        this.canvas.addEventListener('touchmove', this.onTouchMove, false);
        this.canvas.addEventListener("click", this.onClick, false);
        this.canvas.addEventListener("mousedown", this.onMouseDown, false);
        this.canvas.addEventListener("touchstart", this.onTouchStart, false);
    }

    public setUIActionControls = (props: IInitUIActionControlsInstanceProps) => {
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        this.canvas.removeEventListener('touchmove', this.onTouchMove);
        this.canvas.removeEventListener("click", this.onClick);
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("touchstart", this.onTouchStart);

        this.canvas = props.canvas;
        props.camera && (this.camera = props.camera);

        this.canvas.addEventListener('mousemove', this.onMouseMove, false);
        this.canvas.addEventListener('touchmove', this.onTouchMove, false);
        this.canvas.addEventListener("click", this.onClick, false);
        this.canvas.addEventListener("mousedown", this.onMouseDown, false);
        this.canvas.addEventListener("touchstart", this.onTouchStart, false);
    };

    public bindHoverEvent = (object: THREE.Object3D, callback: (event?: UIActionEventTarget) => void) => {
        const _callback = (event: UIActionEventTarget) => {
            const intersects = this.raycaster.intersectObject(object);

            if (intersects.some(intersect => intersect.object.id === object.id)) {
                callback(event);
            } else if (object.children.length > 0) {
                object.children.forEach(child => {
                    const intersects = this.raycaster.intersectObject(child);

                    if (intersects.some(intersect => intersect.object.id === child.id)) {
                        callback(event);
                    }
                });
            }
        }

        this.eventDispatcher.addEventListener("move", _callback);

        const actionEvent = new UIActionEvent("move", _callback);
        this.actionEvents.push(actionEvent);
        return actionEvent;
    };

    public bindClickEvent = (object: THREE.Object3D, callback: (event?: UIActionEventTarget) => void) => {
        const _callback = (event?: UIActionEventTarget) => {
            const intersects = this.raycaster.intersectObject(object);

            if (intersects.some(intersect => intersect.object.id === object.id)) {
                callback(event);
            } else if (object.children.length > 0) {
                object.children.forEach(child => {
                    const intersects = this.raycaster.intersectObject(child);

                    if (intersects.some(intersect => intersect.object.id === child.id)) {
                        callback(event);
                    }
                });
            }
        };

        this.eventDispatcher.addEventListener("click", _callback);

        const actionEvent = new UIActionEvent("click", _callback);
        this.actionEvents.push(actionEvent);
        return actionEvent;
    };

    public bindDragEvent = (object: THREE.Object3D, callback: (mouse: THREE.Vector2 | null, changeValue: THREE.Vector2 | null, event?: UIActionEventTarget) => void) => {
        const _callback = (event?: UIActionEventTarget) => {
            if (this.isObjectInDraging(object)) {
                callback(this.mouse, this.mouseChangeValue, event);
            } else if (object.children.length > 0) {
                object.children.forEach(child => {
                    if (this.isObjectInDraging(child)) {
                        callback(this.mouse, this.mouseChangeValue, event);
                    }
                });
            }
        };

        this.eventDispatcher.addEventListener("drag", _callback);

        const actionEvent = new UIActionEvent("drag", _callback);
        this.actionEvents.push(actionEvent);
        return actionEvent;
    };

    public bindMoveinEvent = (object: THREE.Object3D, callback: (mouse: THREE.Vector2 | null, changeValue: THREE.Vector2 | null, event?: UIActionEventTarget) => void) => {
        const _callback = (event?: UIActionEventTarget) => {
            const intersects = this.raycaster.intersectObject(object);

            if (intersects.some(intersect => intersect.object.id === object.id)) {
                callback(this.mouse, this.mouseChangeValue, event);
            } else if (object.children.length > 0) {
                object.children.forEach(child => {
                    const intersects = this.raycaster.intersectObject(child);

                    if (intersects.some(intersect => intersect.object.id === child.id)) {
                        callback(this.mouse, this.mouseChangeValue, event);
                    }
                });
            }
        };

        this.eventDispatcher.addEventListener("move", _callback);

        const actionEvent = new UIActionEvent("move", _callback);
        this.actionEvents.push(actionEvent);
        return actionEvent;
    }

    public unbindEvent = (actionEvent: UIActionEvent) => {
        this.eventDispatcher.removeEventListener(actionEvent.type, actionEvent.callback);
        this.actionEvents = this.actionEvents.filter(_actionEvent => _actionEvent.id !== actionEvent.id);
    };

    public setFromCamera = (camera?: THREE.Camera) => {
        if (camera) this.camera = camera;

        if (this.camera && this.mouse) {
            const clientX = (this.mouse.x + this.canvas.width / 2) / 2;
            const clientY = (-this.mouse.y + this.canvas.height / 2) / 2;

            this.raycaster.setFromCamera(new THREE.Vector2(
                (clientX / (this.canvas.width / 2)) * 2 - 1,
                -(clientY / (this.canvas.height / 2)) * 2 + 1
            ), this.camera);
        }
    };

    private onMouseMove = (event: MouseEvent) => {
        const newX = ((event.clientX * 2) - (this.canvas.width / 2));
        const newY = -((event.clientY * 2) - (this.canvas.height / 2));
        this.mouseChangeValue = new THREE.Vector2();
        this.mouse && (this.mouseChangeValue.x = newX - this.mouse.x);
        this.mouse && (this.mouseChangeValue.y = newY - this.mouse.y);
        this.mouse = new THREE.Vector2();
        this.mouse.x = newX;
        this.mouse.y = newY;

        this.setFromCamera();

        this.eventDispatcher.dispatchEvent({ type: "move" });

        if (this.mouseDownEvent) {
            this.eventDispatcher.dispatchEvent({ type: "drag" });
        }
    }

    private onTouchMove = (event: TouchEvent) => {
        const newX = ((event.touches[0].clientX * 2) - (this.canvas.width / 2));
        const newY = -((event.touches[0].clientY * 2) - (this.canvas.height / 2));
        this.mouseChangeValue = new THREE.Vector2();
        this.mouse && (this.mouseChangeValue.x = newX - this.mouse.x);
        this.mouse && (this.mouseChangeValue.y = newY - this.mouse.y);
        this.mouse = new THREE.Vector2();
        this.mouse.x = newX;
        this.mouse.y = newY;

        this.setFromCamera();

        this.eventDispatcher.dispatchEvent({ type: "move" });

        if (this.touchStartEvent) {
            this.eventDispatcher.dispatchEvent({ type: "drag" })
        }
    }

    private onMouseDown = (event: MouseEvent) => {
        this.mouseDownEvent = event;
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mouseleave", this.onMouseLevel);
    }

    private onTouchStart = (event: TouchEvent) => {
        this.mouse = new THREE.Vector2();
        this.mouse.x = ((event.touches[0].clientX * 2) - (this.canvas.width / 2));
        this.mouse.y = -((event.touches[0].clientY * 2) - (this.canvas.height / 2));
        
        this.setFromCamera();
        
        this.touchStartEvent = event;
        this.canvas.addEventListener("touchend", this.onTouchEnd, false);
        this.canvas.addEventListener("touchcancel", this.onTouchCancel, false);
    };

    private onClick = (event: MouseEvent) => {
        this.mouse = new THREE.Vector2();
        this.mouse.x = ((event.clientX * 2) - (this.canvas.width / 2));
        this.mouse.y = -((event.clientY * 2) - (this.canvas.height / 2));

        this.setFromCamera();
        
        this.eventDispatcher.dispatchEvent({ type: "click" });
    }

    private onMouseUp = () => {
        if (!this.mouseDownEvent) return;
        this.mouseDownEvent = null;
        this.mouseChangeValue = null;
        this.mouse = null;
    }

    private onMouseLevel = () => {
        if (!this.mouseDownEvent) return;
        this.mouseDownEvent = null;
        this.mouseChangeValue = null;
        this.mouse = null;
    };

    private onTouchEnd = () => {
        if (!this.touchStartEvent) return;

        if (this.mouse) {
            const clientX = (this.mouse.x + this.canvas.width / 2) / 2;
            const clientY = (-this.mouse.y + this.canvas.height / 2) / 2;

            if (this.touchStartEvent.touches[0].clientX == clientX && this.touchStartEvent.touches[0].clientY == clientY) {
                this.eventDispatcher.dispatchEvent({ type: "click" });
            }
        }

        this.canvas.removeEventListener("touchend", this.onTouchEnd, false);
        this.canvas.removeEventListener("touchcancel", this.onTouchCancel, false);
        this.touchStartEvent = null;
        this.mouseChangeValue = null;
        this.mouse = null;
    }

    private onTouchCancel = () => {
        if (!this.touchStartEvent) return;

        this.canvas.removeEventListener("touchend", this.onTouchEnd, false);
        this.canvas.removeEventListener("touchcancel", this.onTouchCancel, false);
        this.touchStartEvent = null;
        this.mouseChangeValue = null;
        this.mouse = null;
    }

    private createObjectWithBoundary(object: THREE.Object3D): THREE.Mesh {
        // 计算物体的包围盒
        const box = new THREE.Box3().setFromObject(object);
    
        // 计算物体的大小
        const size = box.getSize(new THREE.Vector3());
    
        // 创建一个稍大的透明边界
        const boundaryGeometry = new THREE.BoxGeometry(size.x * 1.3, size.y * 1.3, size.z * 1.3);
        const boundaryMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
        const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
    
        return boundary;
    }

    public isObjectInDraging(object: THREE.Object3D) {
        const objectBox = new THREE.Box3().setFromObject(object);

        const size = objectBox.getSize(new THREE.Vector3());

        if (this.mouse) {
            const xMax = object.position.x + (size.x / 2 + 40);
            const xMin = object.position.x - (size.x / 2 + 40);
            const yMax = object.position.y + (size.y / 2 + 40);
            const yMin = object.position.y - (size.y / 2 + 40);

            return this.mouse.x <= xMax && this.mouse.x >= xMin && this.mouse.y <= yMax && this.mouse.y >= yMin;
        }

        return false;
    }

    public isObjectInMouse(object: THREE.Object3D, bleedArea: number) {
        const objectBox = new THREE.Box3().setFromObject(object);

        const size = objectBox.getSize(new THREE.Vector3());

        if (this.mouse) {
            const xMax = object.position.x + (size.x / 2 + bleedArea);
            const xMin = object.position.x - (size.x / 2 + bleedArea);
            const yMax = object.position.y + (size.y / 2 + bleedArea);
            const yMin = object.position.y - (size.y / 2 + bleedArea);

            return this.mouse.x <= xMax && this.mouse.x >= xMin && this.mouse.y <= yMax && this.mouse.y >= yMin;
        }

        return false;
    }

    public sortEventList = (type: 'move' | 'click' | 'drag', compareFn: (a: UIActionEvent, b: UIActionEvent) => number) => {
        console.log((this.eventDispatcher as any)._listeners?.[type]?.sort);
        
        (this.eventDispatcher as any)._listeners?.[type]?.sort(compareFn);
    }

    public getMouse = () => {
        return this.mouse;
    }

    public getMouseChangeValue = () => {
        return this.mouseChangeValue;
    }
}

const uiActionControlsInstance = new UIActionControlsInstance();

export const InitUIActionControls = uiActionControlsInstance.InitUIActionControls;
export const setFromCamera = uiActionControlsInstance.setFromCamera;
export const bindHoverEvent = uiActionControlsInstance.bindHoverEvent;
export const bindClickEvent = uiActionControlsInstance.bindClickEvent;
export const bindDragEvent = uiActionControlsInstance.bindDragEvent;
export const unbindEvent = uiActionControlsInstance.unbindEvent;
export const setUIActionControls = uiActionControlsInstance.setUIActionControls;
export const sortEventList = uiActionControlsInstance.sortEventList;
export const eventDispatcher = uiActionControlsInstance.eventDispatcher;
export const getMouse = uiActionControlsInstance.getMouse;
export const getMouseChangeValue = uiActionControlsInstance.getMouseChangeValue;
export const isObjectInDraging = uiActionControlsInstance.isObjectInDraging;
export const isObjectInMouse = uiActionControlsInstance.isObjectInMouse;