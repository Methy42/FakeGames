'use strict';

var THREE = require('three');
var EffectComposer_js = require('three/examples/jsm/postprocessing/EffectComposer.js');
var RenderPass_js = require('three/examples/jsm/postprocessing/RenderPass.js');
var ShaderPass_js = require('three/examples/jsm/postprocessing/ShaderPass.js');
var BrightnessContrastShader_js = require('three/examples/jsm/shaders/BrightnessContrastShader.js');
var FontLoader = require('three/examples/jsm/loaders/FontLoader');
var TextGeometry = require('three/examples/jsm/geometries/TextGeometry');
var opentype = require('opentype.js');
var TWEEN = require('@tweenjs/tween.js');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var THREE__namespace = /*#__PURE__*/_interopNamespaceDefault(THREE);
var TWEEN__namespace = /*#__PURE__*/_interopNamespaceDefault(TWEEN);

function generateUUID() {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); // 使用 performance.now() 来获取更高精度的时间戳
    }
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

class UIActionEvent {
    constructor(type, callback) {
        this.id = generateUUID();
        this.type = type;
        this.callback = callback;
    }
}
class UIActionEventDispatcher extends THREE__namespace.EventDispatcher {
    dispatchEvent(event) {
        // super.dispatchEvent(event);
        if (this._listeners === undefined)
            return;
        const listeners = this._listeners;
        const listenerArray = listeners[event.type];
        if (listenerArray !== undefined) {
            event.target = this;
            // Make a copy, in case listeners are removed while iterating.
            const array = listenerArray.slice(0);
            let breakLoop = false;
            for (let i = 0, l = array.length; i < l; i++) {
                if (breakLoop)
                    break;
                event.preventDefault = function () {
                    breakLoop = true;
                };
                array[i].call(this, event);
            }
        }
    }
}
class UIActionControlsInstance {
    constructor() {
        this.mouse = null;
        this.mouseChangeValue = null;
        this.raycaster = new THREE__namespace.Raycaster();
        this.eventDispatcher = new UIActionEventDispatcher();
        this.touchStartEvent = null;
        this.mouseDownEvent = null;
        this.actionEvents = [];
        this.InitUIActionControls = (props) => {
            this.canvas = props.canvas;
            props.camera && (this.camera = props.camera);
            this.canvas.addEventListener('mousemove', this.onMouseMove, false);
            this.canvas.addEventListener('touchmove', this.onTouchMove, false);
            this.canvas.addEventListener("click", this.onClick, false);
            this.canvas.addEventListener("mousedown", this.onMouseDown, false);
            this.canvas.addEventListener("touchstart", this.onTouchStart, false);
        };
        this.setUIActionControls = (props) => {
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
        this.bindHoverEvent = (object, callback) => {
            const _callback = (event) => {
                const intersects = this.raycaster.intersectObject(object);
                if (intersects.some(intersect => intersect.object.id === object.id)) {
                    callback(event);
                }
                else if (object.children.length > 0) {
                    object.children.forEach(child => {
                        const intersects = this.raycaster.intersectObject(child);
                        if (intersects.some(intersect => intersect.object.id === child.id)) {
                            callback(event);
                        }
                    });
                }
            };
            this.eventDispatcher.addEventListener("move", _callback);
            const actionEvent = new UIActionEvent("move", _callback);
            this.actionEvents.push(actionEvent);
            return actionEvent;
        };
        this.bindClickEvent = (object, callback) => {
            const _callback = (event) => {
                const intersects = this.raycaster.intersectObject(object);
                if (intersects.some(intersect => intersect.object.id === object.id)) {
                    callback(event);
                }
                else if (object.children.length > 0) {
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
        this.bindDragEvent = (object, callback) => {
            const _callback = (event) => {
                if (this.isObjectInDraging(object)) {
                    callback(this.mouse, this.mouseChangeValue, event);
                }
                else if (object.children.length > 0) {
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
        this.bindMoveinEvent = (object, callback) => {
            const _callback = (event) => {
                const intersects = this.raycaster.intersectObject(object);
                if (intersects.some(intersect => intersect.object.id === object.id)) {
                    callback(this.mouse, this.mouseChangeValue, event);
                }
                else if (object.children.length > 0) {
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
        };
        this.unbindEvent = (actionEvent) => {
            this.eventDispatcher.removeEventListener(actionEvent.type, actionEvent.callback);
            this.actionEvents = this.actionEvents.filter(_actionEvent => _actionEvent.id !== actionEvent.id);
        };
        this.setFromCamera = (camera) => {
            if (camera)
                this.camera = camera;
            if (this.camera && this.mouse) {
                const clientX = (this.mouse.x + this.canvas.width / 2) / 2;
                const clientY = (-this.mouse.y + this.canvas.height / 2) / 2;
                this.raycaster.setFromCamera(new THREE__namespace.Vector2((clientX / (this.canvas.width / 2)) * 2 - 1, -(clientY / (this.canvas.height / 2)) * 2 + 1), this.camera);
            }
        };
        this.onMouseMove = (event) => {
            const newX = ((event.clientX * 2) - (this.canvas.width / 2));
            const newY = -((event.clientY * 2) - (this.canvas.height / 2));
            this.mouseChangeValue = new THREE__namespace.Vector2();
            this.mouse && (this.mouseChangeValue.x = newX - this.mouse.x);
            this.mouse && (this.mouseChangeValue.y = newY - this.mouse.y);
            this.mouse = new THREE__namespace.Vector2();
            this.mouse.x = newX;
            this.mouse.y = newY;
            this.setFromCamera();
            this.eventDispatcher.dispatchEvent({ type: "move" });
            if (this.mouseDownEvent) {
                this.eventDispatcher.dispatchEvent({ type: "drag" });
            }
        };
        this.onTouchMove = (event) => {
            const newX = ((event.touches[0].clientX * 2) - (this.canvas.width / 2));
            const newY = -((event.touches[0].clientY * 2) - (this.canvas.height / 2));
            this.mouseChangeValue = new THREE__namespace.Vector2();
            this.mouse && (this.mouseChangeValue.x = newX - this.mouse.x);
            this.mouse && (this.mouseChangeValue.y = newY - this.mouse.y);
            this.mouse = new THREE__namespace.Vector2();
            this.mouse.x = newX;
            this.mouse.y = newY;
            this.setFromCamera();
            this.eventDispatcher.dispatchEvent({ type: "move" });
            if (this.touchStartEvent) {
                this.eventDispatcher.dispatchEvent({ type: "drag" });
            }
        };
        this.onMouseDown = (event) => {
            this.mouseDownEvent = event;
            this.canvas.addEventListener("mouseup", this.onMouseUp);
            this.canvas.addEventListener("mouseleave", this.onMouseLevel);
        };
        this.onTouchStart = (event) => {
            this.mouse = new THREE__namespace.Vector2();
            this.mouse.x = ((event.touches[0].clientX * 2) - (this.canvas.width / 2));
            this.mouse.y = -((event.touches[0].clientY * 2) - (this.canvas.height / 2));
            this.setFromCamera();
            this.touchStartEvent = event;
            this.canvas.addEventListener("touchend", this.onTouchEnd, false);
            this.canvas.addEventListener("touchcancel", this.onTouchCancel, false);
        };
        this.onClick = (event) => {
            this.mouse = new THREE__namespace.Vector2();
            this.mouse.x = ((event.clientX * 2) - (this.canvas.width / 2));
            this.mouse.y = -((event.clientY * 2) - (this.canvas.height / 2));
            this.setFromCamera();
            this.eventDispatcher.dispatchEvent({ type: "click" });
        };
        this.onMouseUp = () => {
            if (!this.mouseDownEvent)
                return;
            this.mouseDownEvent = null;
            this.mouseChangeValue = null;
            this.mouse = null;
        };
        this.onMouseLevel = () => {
            if (!this.mouseDownEvent)
                return;
            this.mouseDownEvent = null;
            this.mouseChangeValue = null;
            this.mouse = null;
        };
        this.onTouchEnd = () => {
            if (!this.touchStartEvent)
                return;
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
        };
        this.onTouchCancel = () => {
            if (!this.touchStartEvent)
                return;
            this.canvas.removeEventListener("touchend", this.onTouchEnd, false);
            this.canvas.removeEventListener("touchcancel", this.onTouchCancel, false);
            this.touchStartEvent = null;
            this.mouseChangeValue = null;
            this.mouse = null;
        };
        this.sortEventList = (type, compareFn) => {
            console.log(this.eventDispatcher._listeners?.[type]?.sort);
            this.eventDispatcher._listeners?.[type]?.sort(compareFn);
        };
        this.getMouse = () => {
            return this.mouse;
        };
        this.getMouseChangeValue = () => {
            return this.mouseChangeValue;
        };
    }
    createObjectWithBoundary(object) {
        // 计算物体的包围盒
        const box = new THREE__namespace.Box3().setFromObject(object);
        // 计算物体的大小
        const size = box.getSize(new THREE__namespace.Vector3());
        // 创建一个稍大的透明边界
        const boundaryGeometry = new THREE__namespace.BoxGeometry(size.x * 1.3, size.y * 1.3, size.z * 1.3);
        const boundaryMaterial = new THREE__namespace.MeshBasicMaterial({ transparent: true, opacity: 0 });
        const boundary = new THREE__namespace.Mesh(boundaryGeometry, boundaryMaterial);
        return boundary;
    }
    isObjectInDraging(object) {
        const objectBox = new THREE__namespace.Box3().setFromObject(object);
        const size = objectBox.getSize(new THREE__namespace.Vector3());
        if (this.mouse) {
            const xMax = object.position.x + (size.x / 2 + 40);
            const xMin = object.position.x - (size.x / 2 + 40);
            const yMax = object.position.y + (size.y / 2 + 40);
            const yMin = object.position.y - (size.y / 2 + 40);
            return this.mouse.x <= xMax && this.mouse.x >= xMin && this.mouse.y <= yMax && this.mouse.y >= yMin;
        }
        return false;
    }
    isObjectInMouse(object, bleedArea) {
        const objectBox = new THREE__namespace.Box3().setFromObject(object);
        const size = objectBox.getSize(new THREE__namespace.Vector3());
        if (this.mouse) {
            const xMax = object.position.x + (size.x / 2 + bleedArea);
            const xMin = object.position.x - (size.x / 2 + bleedArea);
            const yMax = object.position.y + (size.y / 2 + bleedArea);
            const yMin = object.position.y - (size.y / 2 + bleedArea);
            return this.mouse.x <= xMax && this.mouse.x >= xMin && this.mouse.y <= yMax && this.mouse.y >= yMin;
        }
        return false;
    }
}
const uiActionControlsInstance = new UIActionControlsInstance();
const InitUIActionControls = uiActionControlsInstance.InitUIActionControls;
const setFromCamera = uiActionControlsInstance.setFromCamera;
uiActionControlsInstance.bindHoverEvent;
const bindClickEvent = uiActionControlsInstance.bindClickEvent;
const bindDragEvent = uiActionControlsInstance.bindDragEvent;
const unbindEvent = uiActionControlsInstance.unbindEvent;
const setUIActionControls = uiActionControlsInstance.setUIActionControls;
uiActionControlsInstance.sortEventList;
uiActionControlsInstance.eventDispatcher;
const getMouse = uiActionControlsInstance.getMouse;
uiActionControlsInstance.getMouseChangeValue;
uiActionControlsInstance.isObjectInDraging;
const isObjectInMouse = uiActionControlsInstance.isObjectInMouse;

class TextureLoader extends THREE__namespace.TextureLoader {
}
const textureLoader = new TextureLoader();
textureLoader.load.bind(textureLoader);
const loadAsync = (url) => {
    return new Promise((resolve, reject) => {
        textureLoader.load(url, resolve, undefined, reject);
    });
};

class ImageButton extends THREE__namespace.Mesh {
    constructor(props) {
        super();
        this.isLoaded = false;
        this.loadEX = (url) => new Promise((resolve, reject) => {
            loadAsync(url).then(resolve).catch(() => this.loadEX(url).then(resolve).catch(reject));
        });
        this.init = (texture) => {
            this.texture = texture;
            this.geometry = new THREE__namespace.PlaneGeometry(this.width, this.height);
            this.initMaterial();
            this.isLoaded = true;
            this._onLoad && this._onLoad();
        };
        this.initMaterial = () => {
            this.material = new THREE__namespace.MeshStandardMaterial({
                map: this.texture,
                transparent: true,
                roughness: this.isCheckArea ? 1 : 0.1,
                metalness: this.isCheckArea ? 1 : 0.1
            });
        };
        this.setCheckArea = (isCheckArea) => {
            this.isCheckArea = isCheckArea;
            this.initMaterial();
        };
        props.name && (this.name = props.name);
        props.scaling && (this.scaling = props.scaling);
        props.isCheckArea && (this.isCheckArea = props.isCheckArea);
        if (typeof props.imageSrc === "string") {
            this.loadEX(props.imageSrc).then((texture) => {
                this.width = props.width || texture.image.width * (props.scaling || 1);
                this.height = props.height || texture.image.height * (props.scaling || 1);
                this.init(texture);
            });
        }
        else if (props.imageSrc instanceof THREE__namespace.Texture) {
            this.width = props.width || props.imageSrc.image.width * (props.scaling || 1);
            this.height = props.height || props.imageSrc.image.height * (props.scaling || 1);
            this.init(props.imageSrc);
        }
    }
    set onLoad(onLoad) {
        this._onLoad = onLoad;
        this.isLoaded && this._onLoad();
    }
    ;
}

//#region 首页的资源
const SimpleButtonImage = "https://methy.net:10233/images/simple_button.png";
const DifficultyButtonImage = "https://methy.net:10233/images/difficulty_button.png";
const PersonalButtonImage = "https://methy.net:10233/images/personal_button.png";
const CommunityButtonImage = "https://methy.net:10233/images/community_button.png";
const NoticeTipImage = "https://methy.net:10233/images/notice_tip.png";
const SettingsTipImage = "https://methy.net:10233/images/settings_tip.png";
const TiliTipImage = "https://methy.net:10233/images/tili_tip.png";
const TitleImage = "https://methy.net:10233/images/title.png";
//#endregion
//#region 菜单页面的资源
const BackIconImage$4 = "https://methy.net:10233/images/back.png";
const LevelBorderImage = "https://methy.net:10233/images/level_border.png";
const LevelBorderBackImage = "https://methy.net:10233/images/level_border_back.png";
const LevelName0Image = "https://methy.net:10233/images/level_images/name_0.png";
const LevelImage0Image = "https://methy.net:10233/images/level_images/0.png";
const LevelName1Image = "https://methy.net:10233/images/level_images/name_1.png";
const LevelImage1Image = "https://methy.net:10233/images/level_images/1.png";
const LevelName2Image = "https://methy.net:10233/images/level_images/name_2.png";
const LevelImage2Image = "https://methy.net:10233/images/level_images/2.png";
//#endregion
//#region 对话框的资源
const DialogBackground = "https://methy.net:10233/images/dialogs/basic_dialog_background.png";
const DialogTitle = "https://methy.net:10233/images/dialogs/level_finish.png";
const DialogCloseIcon = "https://methy.net:10233/images/dialogs/close_icon.png";
const DialogSelectLevelButton = "https://methy.net:10233/images/dialogs/select_level.png";
const DialogNextLevelButton = "https://methy.net:10233/images/dialogs/next_level.png";
const DialogGoodAnimationDir = "https://methy.net:10233/images/dialogs/good";
//#endregion
//#region 通用的资源
const BasicBackgroundImage = "https://methy.net:10233/images/start_background.jpg";
//#endregion
class InitAssetsStore extends THREE.EventDispatcher {
    constructor() {
        super(...arguments);
        this.assetsMap = {
            simpleButton: {
                url: SimpleButtonImage,
                type: "image"
            },
            difficultyButton: {
                url: DifficultyButtonImage,
                type: "image"
            },
            communityButton: {
                url: CommunityButtonImage,
                type: "image"
            },
            hersonalButton: {
                url: PersonalButtonImage,
                type: "image"
            },
            noticeTip: {
                url: NoticeTipImage,
                type: "image"
            },
            settingsTip: {
                url: SettingsTipImage,
                type: "image"
            },
            tiliTip: {
                url: TiliTipImage,
                type: "image"
            },
            title: {
                url: TitleImage,
                type: "image"
            },
            backIcon: {
                url: BackIconImage$4,
                type: "image"
            },
            levelBorder: {
                url: LevelBorderImage,
                type: "image"
            },
            levelBorderBack: {
                url: LevelBorderBackImage,
                type: "image"
            },
            levelName0: {
                url: LevelName0Image,
                type: "image"
            },
            levelImage0: {
                url: LevelImage0Image,
                type: "image"
            },
            levelName1: {
                url: LevelName1Image,
                type: "image"
            },
            levelImage1: {
                url: LevelImage1Image,
                type: "image"
            },
            levelName2: {
                url: LevelName2Image,
                type: "image"
            },
            levelImage2: {
                url: LevelImage2Image,
                type: "image"
            },
            basicBackground: {
                url: BasicBackgroundImage,
                type: "image"
            },
            dialogBackground: {
                url: DialogBackground,
                type: "image"
            },
            dialogTitle: {
                url: DialogTitle,
                type: "image"
            },
            dialogCloseIcon: {
                url: DialogCloseIcon,
                type: "image"
            },
            dialogSelectLevelButton: {
                url: DialogSelectLevelButton,
                type: "image"
            },
            dialogNextLevelButton: {
                url: DialogNextLevelButton,
                type: "image"
            },
            dialogGoodAnimation: {
                url: DialogGoodAnimationDir,
                type: "animation",
                animationImagesCount: 31
            }
        };
        this.loadAsync = async (canvas) => {
            const assetsLoadList = Object.values(this.assetsMap);
            for (let i = 0; i < assetsLoadList.length; i++) {
                if (assetsLoadList[i].type === "image") {
                    assetsLoadList[i].image = await loadAsync(assetsLoadList[i].url);
                }
                if (assetsLoadList[i].type === "animation") {
                    const imageList = new Array(assetsLoadList[i].animationImagesCount);
                    for (let index = 1; index <= imageList.length; index++) {
                        const image = assetsLoadList[i].url + "/" + index + ".png";
                        imageList[index - 1] = await loadAsync(image);
                    }
                    assetsLoadList[i].animationImages = imageList;
                    assetsLoadList[i].animationImagesCount = imageList.length;
                }
                this.dispatchEvent({ type: "process", process: Math.floor(i / assetsLoadList.length * 100) });
            }
        };
    }
}
const initAssetsStore = new InitAssetsStore();

class TitleMesh extends THREE__namespace.Mesh {
    constructor() {
        super();
        this.isFristRender = true;
        this.backgroundTexture = initAssetsStore.assetsMap.title.image;
        this.onBeforeRender = () => {
            if (this.isFristRender) {
                this.isFristRender = false;
                this.geometry = new THREE__namespace.PlaneGeometry(800, 320);
                this.material = new THREE__namespace.MeshStandardMaterial({ map: this.backgroundTexture, transparent: true, roughness: 0.1, metalness: 0.1 });
            }
        };
    }
}

class BasicBackground extends THREE__namespace.Mesh {
    constructor(backgroundUrl) {
        super();
        this.backgroundUrl = backgroundUrl;
        this.load = async (canvas) => {
            if (this.backgroundUrl) {
                if (!this.startBackgroundImage) {
                    this.startBackgroundImage = await loadAsync(this.backgroundUrl);
                }
            }
            else {
                this.startBackgroundImage = initAssetsStore.assetsMap.basicBackground.image;
            }
            this.geometry = new THREE__namespace.PlaneGeometry(canvas.width, canvas.height);
            this.material = new THREE__namespace.MeshStandardMaterial({
                map: this.startBackgroundImage,
                transparent: true,
                roughness: 0.1,
                metalness: 0.1
            });
        };
    }
}

class StartScene extends THREE__namespace.Scene {
    constructor() {
        super();
        this.backgroundImage = new BasicBackground();
        this.titleMesh = new TitleMesh();
        this.ambientLight = new THREE__namespace.AmbientLight(0xffffff, 3.0);
        this.pointLight = new THREE__namespace.PointLight(0xffffff, 2.0);
        this.simpleButton = new ImageButton({
            width: 360,
            height: 84,
            imageSrc: initAssetsStore.assetsMap.simpleButton.image
        });
        this.difficultyButton = new ImageButton({
            width: 360,
            height: 84,
            imageSrc: initAssetsStore.assetsMap.difficultyButton.image
        });
        this.communityButton = new ImageButton({
            width: 360,
            height: 84,
            imageSrc: initAssetsStore.assetsMap.communityButton.image
        });
        this.hersonalButton = new ImageButton({
            width: 360,
            height: 84,
            imageSrc: initAssetsStore.assetsMap.hersonalButton.image
        });
        this.noticeTip = new ImageButton({
            scaling: 1.5,
            imageSrc: initAssetsStore.assetsMap.noticeTip.image
        });
        this.settingsTip = new ImageButton({
            scaling: 0.75,
            imageSrc: initAssetsStore.assetsMap.settingsTip.image
        });
        this.tiliTip = new ImageButton({
            scaling: 0.75,
            imageSrc: initAssetsStore.assetsMap.tiliTip.image
        });
        this.isFristRender = true;
        this.load = async (canvas) => {
            await this.backgroundImage.load(canvas);
            this.simpleButtonClickEvent = bindClickEvent(this.simpleButton, () => {
                setCurrentRoute("level_menu", {
                    type: "simple"
                });
            });
            this.hersonalButtonClickEvent = bindClickEvent(this.hersonalButton, () => {
                setCurrentRoute("personal_center");
            });
            this.titleMesh.position.x = -40;
            this.titleMesh.position.y = 160;
            this.simpleButton.position.y = (-canvas.height / 2) + 276;
            this.difficultyButton.position.y = (-canvas.height / 2) + 276;
            this.communityButton.position.y = (-canvas.height / 2) + 142;
            this.hersonalButton.position.y = (-canvas.height / 2) + 142;
            this.simpleButton.position.x = -280;
            this.difficultyButton.position.x = 200;
            this.communityButton.position.x = -280;
            this.hersonalButton.position.x = 200;
            this.noticeTip.position.x = -canvas.width / 2 + 180;
            this.noticeTip.position.y = -canvas.height / 2 + 120;
            this.settingsTip.position.x = canvas.width / 2 - 105;
            this.settingsTip.position.y = canvas.height / 2 - 230;
            this.tiliTip.position.x = canvas.width / 2 - 105;
            this.tiliTip.position.y = canvas.height / 2 - 400;
        };
        this.levelTo = (routerKey) => {
            setCurrentRoute(routerKey);
        };
        this.clear = () => {
            unbindEvent(this.simpleButtonClickEvent);
            unbindEvent(this.hersonalButtonClickEvent);
            this.children.forEach(child => {
                child.clear && child.clear();
                this.remove(child);
            });
            return this;
        };
        this.backgroundImage.position.z = -1;
        this.pointLight.position.set(0, 10, 4);
        this.add(this.backgroundImage);
        this.add(this.ambientLight);
        this.add(this.pointLight);
        this.add(this.titleMesh);
        this.add(this.simpleButton);
        this.add(this.difficultyButton);
        this.add(this.communityButton);
        this.add(this.hersonalButton);
        this.add(this.noticeTip);
        this.add(this.settingsTip);
        this.add(this.tiliTip);
        this.onBeforeRender = (renderer, _, camera) => {
            if (this.isFristRender) {
                this.isFristRender = false;
                setFromCamera(camera);
            }
        };
    }
}

class BasicScene extends THREE__namespace.Scene {
    constructor(backgroundUrl) {
        super();
        this.isFristRender = true;
        this.ambientLight = new THREE__namespace.AmbientLight(0xffffff, 3.0);
        this.pointLight = new THREE__namespace.PointLight(0xffffff, 2.0);
        this.basicBackground = new BasicBackground(backgroundUrl);
        this.basicBackground.position.z = -1;
        this.pointLight.position.set(0, 10, 4);
        this.add(this.basicBackground);
        this.add(this.ambientLight);
        this.add(this.pointLight);
        this.onBeforeRender = (_, __, camera) => {
            if (this.isFristRender) {
                this.isFristRender = false;
                setFromCamera(camera);
            }
        };
    }
    async load(canvas) {
        await this.basicBackground.load(canvas);
        this.basicBackground.position.set(0, 0, -1);
    }
    ;
}

class LevelSelectorObject extends THREE__namespace.Group {
    constructor(props) {
        super();
        this.officeX = 0;
        this.levelImageList = [];
        this.initLevelImageList = async () => {
            return await Promise.all(this.levelList.map(element => new Promise((resolve) => {
                const borderImage = new ImageButton({
                    imageSrc: initAssetsStore.assetsMap.levelBorder.image,
                    width: this.itemWidth,
                    height: this.itemHeight,
                    scaling: this.itemScaling
                });
                const borderBackImage = new ImageButton({
                    imageSrc: initAssetsStore.assetsMap.levelBorderBack.image,
                    width: this.itemWidth,
                    height: this.itemHeight,
                    scaling: this.itemScaling
                });
                const levelImage = new ImageButton({
                    imageSrc: initAssetsStore.assetsMap[element.imageAssets].image,
                    width: this.itemWidth,
                    height: this.itemHeight,
                    scaling: this.itemScaling
                });
                const levelNameImage = new ImageButton({
                    imageSrc: initAssetsStore.assetsMap[element.nameImageAssets].image,
                    width: this.itemWidth,
                    height: this.itemHeight,
                    scaling: this.itemNameScaling
                });
                Promise.all([
                    new Promise((resolve) => {
                        borderImage.onLoad = resolve;
                    }),
                    new Promise((resolve) => {
                        borderBackImage.onLoad = resolve;
                    }),
                    new Promise((resolve) => {
                        levelImage.onLoad = resolve;
                    }),
                    new Promise((resolve) => {
                        levelNameImage.onLoad = resolve;
                    })
                ]).then(() => {
                    levelNameImage.position.y = -levelImage.height / 2 - levelNameImage.height / 2 - 30;
                    levelImage.add(borderImage);
                    borderBackImage.add(levelImage);
                    borderBackImage.add(levelNameImage);
                    element.clickEvent = bindClickEvent(borderBackImage, () => {
                        this.levelItemOnClick(element);
                    });
                    this.levelImageList.push(borderBackImage);
                    this.add(borderBackImage);
                    resolve();
                });
            })));
        };
        this.initLevelImageListPosition = () => {
            this.levelImageList.forEach((element, index) => {
                element.position.x = this.officeX + (index * (this.spacing + element.width));
            });
        };
        this.initSlideEvent = () => {
            this.dragEvent = bindDragEvent(this, (_, changeValue, event) => {
                if (event) {
                    event.preventDefault?.();
                }
                changeValue && (this.officeX += changeValue.x);
                this.initLevelImageListPosition();
            });
        };
        this.levelItemOnClick = (levelItem) => {
            if (levelItem.routeKey) {
                setCurrentRoute(levelItem.routeKey);
            }
        };
        this.clear = () => {
            this.children.forEach(element => {
                element.clear && element.clear();
                element.remove();
            });
            this.levelList.forEach(element => {
                element.clickEvent && unbindEvent(element.clickEvent);
            });
            this.dragEvent && unbindEvent(this.dragEvent);
            return this;
        };
        this.levelList = props.levelList;
        this.spacing = props.spacing;
        this.itemWidth = props.itemWidth;
        this.itemHeight = props.itemHeight;
        this.itemScaling = props.itemScaling;
        this.itemNameScaling = props.itemNameScaling;
        this.initLevelImageList().then(() => {
            this.initLevelImageListPosition();
            this.initSlideEvent();
        });
    }
}

class LevelMenuScene extends BasicScene {
    constructor() {
        super();
        this.backIcon = new ImageButton({
            scaling: 0.2,
            imageSrc: initAssetsStore.assetsMap.backIcon.image
        });
        this.levelSelectron = new LevelSelectorObject({
            levelList: [{
                    nameImageAssets: "levelName0",
                    imageAssets: "levelImage0",
                    routeKey: "monthly_calender",
                }, {
                    nameImageAssets: "levelName1",
                    imageAssets: "levelImage1",
                    routeKey: "live_room",
                }, {
                    nameImageAssets: "levelName2",
                    imageAssets: "levelImage2",
                    routeKey: "outing",
                }],
            spacing: 50,
            itemScaling: 1,
            itemNameScaling: 0.7
        });
        this.clear = () => {
            unbindEvent(this.backIconClickEvent);
            this.levelSelectron.clear();
            this.children.forEach(child => {
                child.clear && child.clear();
                this.remove(child);
            });
            return this;
        };
        const routeParams = getCurrentRouteParams();
        if (routeParams.type === "simple") {
            // SimpleButtonImage
            this.titleImage = new ImageButton({
                width: 360,
                height: 84,
                imageSrc: initAssetsStore.assetsMap.simpleButton.image
            });
        }
        else if (routeParams.type === "difficulty") {
            // DifficultyButtonImage
            this.titleImage = new ImageButton({
                width: 360,
                height: 84,
                imageSrc: initAssetsStore.assetsMap.difficultyButton.image
            });
        }
        this.add(this.titleImage);
        this.add(this.backIcon);
        this.add(this.levelSelectron);
        this.backIconClickEvent = bindClickEvent(this.backIcon, () => {
            setCurrentRoute("start");
        });
        const onBeforeRender = this.onBeforeRender;
        this.onBeforeRender = (renderer, ...args) => {
            onBeforeRender(renderer, ...args);
            this.backIcon.position.y = (renderer.domElement.height / 2) - 72;
            this.backIcon.position.x = (-renderer.domElement.width / 2) + 84;
            this.titleImage.position.y = (renderer.domElement.height / 2) - 72;
        };
    }
}

const SERVER_URL = 'https://methy.net:10232';

const request = (url, options = {}) => {
    url = SERVER_URL + url;
    return new Promise((resolve, reject) => {
        if (!options.success) {
            options.success = (res) => {
                resolve(res);
            };
        }
        if (!options.fail) {
            options.fail = (err) => {
                reject(err);
            };
        }
        window.request(url, options);
    });
};
const requestAssets = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        if (!options.success) {
            options.success = (res) => {
                resolve(res);
            };
        }
        if (!options.fail) {
            options.fail = (err) => {
                reject(err);
            };
        }
        window.request(url, options);
    });
};

const OTFToJSON = function (font) {
    var scale = (1000 * 100) / ((font.unitsPerEm || 2048) * 72);
    var result = {
        glyphs: {}
    };
    for (let i = 0; i < font.glyphs.length; i++) {
        const glyph = font.glyphs.get(i);
        const unicodes = [];
        if (glyph.unicode !== undefined) {
            unicodes.push(glyph.unicode);
        }
        if (glyph.unicodes.length) {
            glyph.unicodes.forEach(function (unicode) {
                if (unicodes.indexOf(unicode) == -1) {
                    unicodes.push(unicode);
                }
            });
        }
        unicodes.forEach(function (unicode) {
            {
                var token = {
                    ha: 0,
                    x_min: 0,
                    x_max: 0,
                    o: ""
                };
                typeof glyph.advanceWidth === "number" && (token.ha = Math.round(glyph.advanceWidth * scale));
                typeof glyph.xMin === "number" && (token.x_min = Math.round(glyph.xMin * scale));
                typeof glyph.xMax === "number" && (token.x_max = Math.round(glyph.xMax * scale));
                token.o = "";
                glyph.path.commands = reverseCommands(glyph.path.commands);
                glyph.path.commands.forEach(function (command, i) {
                    if (command.type.toLowerCase() === "c") {
                        command.type = "b";
                    }
                    token.o += command.type.toLowerCase();
                    token.o += " ";
                    if (command.x !== undefined && command.y !== undefined) {
                        token.o += Math.round(command.x * scale);
                        token.o += " ";
                        token.o += Math.round(command.y * scale);
                        token.o += " ";
                    }
                    if (command.x1 !== undefined && command.y1 !== undefined) {
                        token.o += Math.round(command.x1 * scale);
                        token.o += " ";
                        token.o += Math.round(command.y1 * scale);
                        token.o += " ";
                    }
                    if (command.x2 !== undefined && command.y2 !== undefined) {
                        token.o += Math.round(command.x2 * scale);
                        token.o += " ";
                        token.o += Math.round(command.y2 * scale);
                        token.o += " ";
                    }
                });
                result.glyphs[String.fromCharCode(unicode)] = token;
            }
        });
    }
    result.familyName = font.names.fontFamily["en"] || font.names.fontFamily["en-us"] || font.names.fontFamily["en-ca"];
    result.ascender = Math.round(font.ascender * scale);
    result.descender = Math.round(font.descender * scale);
    result.underlinePosition = Math.round(font.tables.post.underlinePosition * scale);
    result.underlineThickness = Math.round(font.tables.post.underlineThickness * scale);
    result.boundingBox = {
        "yMin": Math.round(font.tables.head.yMin * scale),
        "xMin": Math.round(font.tables.head.xMin * scale),
        "yMax": Math.round(font.tables.head.yMax * scale),
        "xMax": Math.round(font.tables.head.xMax * scale)
    };
    result.resolution = 1000;
    result.original_font_information = font.tables.name;
    result.cssFontWeight = "normal";
    result.cssFontStyle = "normal";
    return JSON.stringify(result);
};
const reverseCommands = function (commands) {
    var paths = [];
    var path;
    commands.forEach(function (c) {
        if (c.type.toLowerCase() === "m") {
            path = [c];
            paths.push(path);
        }
        else if (c.type.toLowerCase() !== "z") {
            path.push(c);
        }
    });
    var reversed = [];
    paths.forEach(function (p) {
        var result = { "type": "m", "x": p[p.length - 1].x, "y": p[p.length - 1].y };
        reversed.push(result);
        for (var i = p.length - 1; i > 0; i--) {
            var command = p[i];
            result = { "type": command.type };
            if (command.x2 !== undefined && command.y2 !== undefined) {
                result.x1 = command.x2;
                result.y1 = command.y2;
                result.x2 = command.x1;
                result.y2 = command.y1;
            }
            else if (command.x1 !== undefined && command.y1 !== undefined) {
                result.x1 = command.x1;
                result.y1 = command.y1;
            }
            result.x = p[i - 1].x;
            result.y = p[i - 1].y;
            reversed.push(result);
        }
    });
    return reversed;
};

class BasicText extends THREE__namespace.Group {
    constructor(props) {
        super();
        this.x = 0;
        this.y = 0;
        this.text = "";
        this.opacity = 1;
        this.color = 0x000000;
        this.size = 1;
        this.curveSegments = 12;
        this.bevelEnabled = false;
        this.width = 0;
        this.height = 0;
        this.loadFont = async () => {
            try {
                BasicText.fontLoading = true;
                const result = await requestAssets("https://methy.net:10233/fonts/AlimamaShuHeiTi-Bold.otf", {
                    method: "GET",
                    responseType: "arraybuffer"
                });
                const fontFile = opentype.parse(result.data);
                const fontJSON = OTFToJSON(fontFile);
                BasicText.font = new FontLoader.FontLoader().parse(JSON.parse(fontJSON));
                BasicText.fontLoading = false;
            }
            catch (error) {
                BasicText.fontLoading = false;
                console.log("Failed to load font", error);
            }
        };
        this.loadText = () => {
            try {
                const strList = this.text.split("");
                this.width = 0;
                this.height = 0;
                for (let index = 0; index < strList.length; index++) {
                    const str = strList[index];
                    const geometry = new TextGeometry.TextGeometry(str, {
                        font: BasicText.font,
                        size: this.size,
                        height: 1,
                        curveSegments: this.curveSegments,
                        bevelEnabled: this.bevelEnabled,
                    });
                    geometry.computeBoundingBox();
                    geometry.computeVertexNormals();
                    const positionArray = new Float32Array(geometry.attributes.position.array);
                    const boundingBox = new THREE__namespace.Box3().setFromBufferAttribute(new THREE__namespace.BufferAttribute(positionArray, 3));
                    const width = boundingBox.max.x - boundingBox.min.x;
                    const height = boundingBox.max.y - boundingBox.min.y;
                    for (let i = 0; i < positionArray.length; i += 3) {
                        positionArray[i] += this.x;
                        positionArray[i + 1] += this.y;
                    }
                    geometry.setAttribute('position', new THREE__namespace.BufferAttribute(positionArray, 3));
                    const material = new THREE__namespace.MeshStandardMaterial({
                        color: this.color,
                        transparent: true,
                        roughness: 0.1,
                        metalness: 0.1,
                        opacity: this.opacity
                    });
                    const mesh = new THREE__namespace.Mesh(geometry, material);
                    mesh.position.x = (index - strList.length / 2) * width - width / 2 + this.wordSpace * index;
                    mesh.position.y = -height / 2;
                    this.width += width + this.wordSpace;
                    this.height < height && (this.height = height);
                    this.add(mesh);
                }
            }
            catch (error) {
                console.log("Failed to load text", error);
            }
        };
        this.updateText = async ({ text, opacity }) => {
            this.text = text;
            opacity && (this.opacity = opacity);
            this.clear();
            this.loadText();
        };
        props.x && (this.x = props.x);
        props.y && (this.y = props.y);
        props.text && (this.text = props.text);
        props.color && (this.color = props.color);
        props.size && (this.size = props.size);
        props.wordSpace ? (this.wordSpace = props.wordSpace) : (this.wordSpace = this.size * 0.3);
        props.curveSegments && (this.curveSegments = props.curveSegments);
        props.bevelEnabled && (this.bevelEnabled = props.bevelEnabled);
    }
    async loadAsync() {
        if (!BasicText.font && !BasicText.fontLoading) {
            await this.loadFont();
        }
        BasicText.font && this.loadText();
    }
}
BasicText.fontLoading = false;

class BasicLoading extends THREE__namespace.Group {
    constructor() {
        super();
        this.process = 0;
        this.expectedProcess = 0;
        this.width = 400;
        this.height = 40;
        this.processContainerPadding = 10;
        this.processColor = 0x705d58;
        this.processContainerColor = 0xe1dfe0;
        this.updateProcess = () => {
            if (this.expectedProcess === this.process)
                return;
            if (this.expectedProcess > this.process) {
                const count = this.expectedProcess - this.process;
                if (count / 10 > 2) {
                    this.process += count / 10;
                }
                else {
                    this.process += 2;
                }
            }
            this.processContainerMesh.clear();
            this.processMesh.clear();
            this.remove(this.processContainerMesh);
            this.remove(this.processMesh);
            this.initProcessContainerMesh();
            this.initProcessMesh();
            this.processText && this.processText.updateText({
                text: `${this.process}%`
            });
        };
        this.initProcessText();
        this.initProcessContainerMesh();
        this.initProcessMesh();
        setInterval(this.updateProcess, 1000 / 60);
    }
    createRoundedRectangle(x, y, width, height, color) {
        const radius = height / 2; // set the radius of the rounded corners
        // create a rounded rectangle shape
        const roundedRectShape = new THREE__namespace.Shape();
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
        const geometry = new THREE__namespace.ExtrudeGeometry(roundedRectShape, extrudeSettings);
        // create a mesh from the geometry
        const material = new THREE__namespace.MeshBasicMaterial({ color, transparent: true });
        this.processMesh = new THREE__namespace.Mesh(geometry, material);
        return this.processMesh;
    }
    initProcessMesh() {
        if (this.process <= 4)
            return;
        this.processMesh = this.createRoundedRectangle(-this.width / 2 + this.processContainerPadding, -this.height / 2 + this.processContainerPadding, this.process * (this.width - this.processContainerPadding * 2) / 100, this.height - this.processContainerPadding * 2, this.processColor);
        this.processMesh.position.setZ(0.1);
        this.add(this.processMesh);
    }
    initProcessContainerMesh() {
        this.processContainerMesh = this.createRoundedRectangle(-this.width / 2, -this.height / 2, this.width, this.height, this.processContainerColor);
        this.processContainerMesh.position.setZ(0);
        this.add(this.processContainerMesh);
    }
    initProcessText() {
        this.processText = new BasicText({
            x: this.width / 2 - 30,
            y: -this.height / 2 - 20,
            text: `${this.process}%`,
            size: 16,
            color: this.processColor,
        });
        this.processText.position.setZ(0.2);
        this.processText.loadAsync().then(() => {
            this.add(this.processText);
        });
    }
    setProcess(process) {
        this.expectedProcess = Math.floor(process);
    }
    initProcess() {
        this.process = 0;
        this.expectedProcess = -1;
        this.updateProcess();
    }
}

const LoadingBackgroundImage$1 = "https://methy.net:10233/images/basic_background.png";
class ObjectTestScene extends BasicScene {
    constructor() {
        super(LoadingBackgroundImage$1);
        this.isFirstRender = true;
        this.basicLoading = new BasicLoading();
        this.basicLoading.position.set(0, 0, 0);
        this.add(this.basicLoading);
        this.basicLoading.setProcess(100);
        this.onBeforeRender = (renderer) => {
            if (this.isFirstRender) {
                this.isFirstRender = false;
            }
        };
    }
}

const Laoge1Image = 'https://methy.net:10233/images/laoge/laoge-1.png';
const Laoge2Image = 'https://methy.net:10233/images/laoge/laoge-2.png';
const Laoge3Image = 'https://methy.net:10233/images/laoge/laoge-3.png';
const Laoge4Image = 'https://methy.net:10233/images/laoge/laoge-4.png';
const Laoge5Image = 'https://methy.net:10233/images/laoge/laoge-5.png';
const LaogeActivedImage = 'https://methy.net:10233/images/laoge/laoge-actived.png';
class Lianliankan extends THREE__namespace.Scene {
    constructor() {
        super();
        this.isFirstRender = true;
        this.planeWidth = 60;
        this.planeHeight = 60;
        this.itemPlaneImageSrcList = [
            Laoge1Image,
            Laoge2Image,
            Laoge3Image,
            Laoge4Image,
            Laoge5Image
        ];
        this.itemPlaneList = [];
        this.planeClickEvents = [];
        this.canBeConnectedAndEliminated = (plane1, plane2) => {
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
            }
            else if (plane1UserData.column === plane2UserData.column) {
                // 同列
                const start = Math.min(plane1UserData.row, plane2UserData.row);
                const end = Math.max(plane1UserData.row, plane2UserData.row);
                if (this.hasPlaneInRowOrColumn('column', start, end, plane1UserData.column)) {
                    return false;
                }
            }
            else {
                const plane1Row = plane1UserData.row;
                const plane1Column = plane1UserData.column;
                const plane2Row = plane2UserData.row;
                const plane2Column = plane2UserData.column;
                // 一次转折
                if (this.hasPlaneInRowOrColumn('row', Math.min(plane1Column, plane2Column), Math.max(plane1Column, plane2Column), plane1Row)) {
                    return false;
                }
                else if (this.hasPlaneInRowOrColumn('column', Math.min(plane1Row, plane2Row), Math.max(plane1Row, plane2Row), plane1Column)) {
                    return false;
                }
                else if (this.hasPlaneInRowOrColumn('row', Math.min(plane1Column, plane2Column), Math.max(plane1Column, plane2Column), plane2Row)) {
                    return false;
                }
                else if (this.hasPlaneInRowOrColumn('column', Math.min(plane1Row, plane2Row), Math.max(plane1Row, plane2Row), plane2Column)) {
                    return false;
                }
                else {
                    return true;
                }
            }
            return true;
        };
        this.hasPlaneInRowOrColumn = (type, start, end, dept) => {
            for (let i = start + 1; i < end; i++) {
                const plane = this.getObjectByName(`plane-${type === 'row' ? dept : i}-${type === 'column' ? dept : i}`);
                if (plane) {
                    return true;
                }
            }
            return false;
        };
        this.clear = () => {
            this.children.forEach(child => {
                this.remove(child);
            });
            this.planeClickEvents.forEach(planeClickEvent => {
                unbindEvent(planeClickEvent);
            });
            return this;
        };
        this.onBeforeRender = (renderer, _, camera) => {
            if (this.isFirstRender) {
                this.isFirstRender = false;
            }
        };
        this.addLianliankanPlanes(4, 4).then(() => {
            this.bindPlanesClickEvent();
        });
    }
    initItemPlane(backgroundImageSrc) {
        return new Promise((resolve, reject) => {
            const loader = new THREE__namespace.TextureLoader();
            loader.load(backgroundImageSrc, (texture) => {
                const material = new THREE__namespace.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    side: THREE__namespace.DoubleSide,
                });
                const geometry = new THREE__namespace.PlaneGeometry(this.planeWidth, this.planeHeight);
                const itemPlane = new THREE__namespace.Mesh(geometry, material);
                itemPlane.userData = {
                    ...(itemPlane.userData || {}),
                    backgroundImageSrc
                };
                resolve(itemPlane);
            });
        });
    }
    async addLianliankanPlanes(row, column) {
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
                itemPlane.position.set((j - column / 2) * this.planeWidth + this.planeWidth / 2, (i - row / 2) * this.planeHeight + this.planeHeight / 2, 0);
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
    bindPlanesClickEvent() {
        this.itemPlaneList.forEach(itemPlane => {
            const planeClickEvent = bindClickEvent(itemPlane, () => {
                // 判断是否已有激活的平面
                const activedPlane = this.getObjectByName('activedPlane');
                if (activedPlane) {
                    // 判断是否可以消除
                    if (this.canBeConnectedAndEliminated(activedPlane.userData.targetPlane, itemPlane)) {
                        // 可以消除
                        this.remove(activedPlane.userData.targetPlane);
                        this.remove(activedPlane);
                        this.remove(itemPlane);
                    }
                    else {
                        // 不可以消除
                        this.createActivedPlane(itemPlane);
                    }
                }
                else {
                    // 没有激活的平面
                    this.createActivedPlane(itemPlane);
                }
            });
            this.planeClickEvents.push(planeClickEvent);
        });
    }
    // 在指定平面上创建一个激活的平面，创建之前会先销毁之前的激活平面
    async createActivedPlane(plane) {
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
}

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
class PlaceObjectScene extends THREE__namespace.Scene {
    constructor() {
        super();
        this.isFirstRender = true;
        this.objectWidth = 100;
        this.objectHeight = 100;
        this.intervalDistance = 10;
        this.outlineImageList = [
            KouhongOutlineImage,
            XimiannaiOutlineImage,
            MeibiOutlineImage,
            JiemaojiaOutlineImage,
            FendiOutlineImage
        ];
        this.imageList = [
            KouhongImage,
            XimiannaiImage,
            MeibiImage,
            JiemaojiaImage,
            FendiImage
        ];
        this.outlineList = [];
        this.objectList = [];
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
        };
    }
    async initOutlineList() {
        const outlineList = await Promise.all(this.outlineImageList.map(async (image, index) => {
            const texture = await new THREE__namespace.TextureLoader().loadAsync(image);
            const material = new THREE__namespace.MeshBasicMaterial({
                map: texture,
                transparent: true
            });
            const geometry = new THREE__namespace.PlaneGeometry(this.objectWidth, this.objectHeight);
            const mesh = new THREE__namespace.Mesh(geometry, material);
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
    async initHuazhuangbao(renderer) {
        const canvasWidth = renderer.domElement.width;
        const canvasHeight = renderer.domElement.height;
        const texture = await new THREE__namespace.TextureLoader().loadAsync(HuazhuangbaoImage);
        const material = new THREE__namespace.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        const geometry = new THREE__namespace.PlaneGeometry(this.objectWidth, this.objectHeight);
        const mesh = new THREE__namespace.Mesh(geometry, material);
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
    async addObject(backgroundImgSrc) {
        const texture = await new THREE__namespace.TextureLoader().loadAsync(backgroundImgSrc);
        const material = new THREE__namespace.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        const geometry = new THREE__namespace.PlaneGeometry(this.objectWidth, this.objectHeight);
        const mesh = new THREE__namespace.Mesh(geometry, material);
        mesh.name = 'object';
        mesh.position.x = this.huazhuangbao.position.x;
        mesh.position.y = this.huazhuangbao.position.y;
        mesh.position.z = 0;
        mesh.userData = { flying: true };
        this.add(mesh);
        this.objectList.push(mesh);
        return mesh;
    }
}

class CraftingService {
    constructor() {
        this.recipes = [];
    }
    addRecipe(recipe) {
        this.recipes.push(recipe);
    }
    getRecipes() {
        return this.recipes;
    }
    getRecipeByResult(result) {
        return this.recipes.find((recipe) => recipe.results.includes(result));
    }
    getRecipeByIngredient(ingredient) {
        return this.recipes.find((recipe) => recipe.ingredients.includes(ingredient));
    }
    getRecipeByIngredients(ingredients) {
        return this.recipes.filter((recipe) => ingredients.every((ingredient) => recipe.ingredients.includes(ingredient)));
    }
}

class Recipe {
    constructor(props) {
        this.ingredients = props?.ingredients ?? [];
        this.results = props?.results ?? [];
    }
    addIngredient(ingredient) {
        this.ingredients.push(ingredient);
    }
    addResult(result) {
        this.results.push(result);
    }
}

class KitchenScene extends BasicScene {
    constructor() {
        super(...arguments);
        this.needLoading = true;
        this.manualLoadingProcess = true;
        this.isLevelFinish = false;
        this.mainFoodItems = []; // 食材
        this.sideDishes = []; // 配菜
        this.seasonings = []; // 调味品
    }
    async load(canvas, setCurrentProcess) {
        this.craftingService = new CraftingService();
        this.craftingService.addRecipe(new Recipe({
            ingredients: [{
                    metadate: {
                        name: 'test'
                    }
                }],
            results: []
        }));
    }
}

class AnimationButton extends THREE__namespace.Mesh {
    constructor(props) {
        super();
        this.timestamp = new Date().getTime();
        this.currentFrameIndex = 0;
        this.expectedCurrentFrameIndex = 0;
        this.frameList = [];
        this.onBeforeRender = () => {
            const now = new Date().getTime();
            if (this.frameList.length > 0 && now - this.timestamp > this.frameList[this.currentFrameIndex].duration) {
                if (this.noLoop && this.currentFrameIndex === this.frameList.length - 1) {
                    return;
                }
                this.timestamp = now;
                if (!this.manual) {
                    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frameList.length;
                }
                else if (this.expectedCurrentFrameIndex > this.currentFrameIndex) {
                    this.currentFrameIndex++;
                }
                this.renderFrame();
            }
        };
        this.renderFrame = () => {
            const texture = this.frameList[this.currentFrameIndex].texture;
            this.width = this.initialWidth || texture.image.width * (this.initialScaling || 1);
            this.height = this.initialHeight || texture.image.height * (this.initialScaling || 1);
            this.texture = texture;
            this.geometry = new THREE__namespace.PlaneGeometry(this.width, this.height);
            this.setCheckArea(this.isCheckArea || false);
        };
        this.createFrame = (texture, duration) => {
            return this.frameList.push({
                texture,
                duration
            });
        };
        this.setCheckArea = (isCheckArea) => {
            this.isCheckArea = isCheckArea;
            if (isCheckArea) {
                this.material = new THREE__namespace.MeshStandardMaterial({ map: this.texture, transparent: true, roughness: 1, metalness: 1 });
            }
            else {
                this.material = new THREE__namespace.MeshStandardMaterial({ map: this.texture, transparent: true, roughness: 0.1, metalness: 0.1 });
            }
        };
        this.backToBeginning = () => {
            this.currentFrameIndex = 0;
        };
        this.setCurrentFrameIndex = (index) => {
            this.expectedCurrentFrameIndex = index;
        };
        this.setManual = (manual) => {
            this.manual = manual;
        };
        this.initialWidth = props.width;
        this.initialHeight = props.height;
        this.initialScaling = props.scaling;
        props.name && (this.name = props.name);
        this.isCheckArea = props.isCheckArea;
        this.noLoop = props.noLoop;
        this.manual = props.manual;
        if (props.imageSrcList[0] instanceof THREE__namespace.Texture) {
            props.imageSrcList.forEach(texture => {
                this.createFrame(texture, props.duration || 300);
            });
            this.onLoad && this.onLoad();
        }
        else if (typeof props.imageSrcList[0] === "string") {
            Promise.all(props.imageSrcList.map((image) => loadAsync(image))).then((textures) => {
                textures.forEach(texture => {
                    this.createFrame(texture, props.duration || 300);
                });
                this.onLoad && this.onLoad();
            });
        }
    }
}

const LiveRoomSceneData = {
    backgroundImage: "https://methy.net:10233/images/live_room/background.png",
    objects: [{
            name: "D2",
            image: "https://methy.net:10233/images/live_room/d2.png",
            size: {
                scaling: 0.2
            },
            checkPosition: {
                x: 590,
                y: 80
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Diannao",
            image: "https://methy.net:10233/images/live_room/diannao.png",
            size: {
                scaling: 0.55
            },
            checkPosition: (canvas, thisImage) => {
                let x = -canvas.width / 2 + thisImage.width / 2;
                if (window.safeArea) {
                    x = -canvas.width / 2 + window.safeArea.left * 2 + thisImage.width / 2;
                }
                return {
                    x,
                    y: -canvas.height / 2 + thisImage.height / 2
                };
            },
            currentPosition: {
                x: 0,
                y: 0
            },
        }, {
            name: "Ditang",
            image: "https://methy.net:10233/images/live_room/ditang.png",
            size: {
                scaling: 1.1
            },
            checkPosition: {
                x: 160,
                y: -200
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Book1",
            image: "https://methy.net:10233/images/live_room/book1.png",
            size: {
                scaling: 0.25
            },
            checkPosition: {
                x: 200,
                y: -300
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "D1",
            image: "https://methy.net:10233/images/live_room/d1.png",
            size: {
                scaling: 0.3
            },
            checkPosition: {
                x: 590,
                y: -10
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "D3",
            image: "https://methy.net:10233/images/live_room/d3.png",
            size: {
                scaling: 0.45
            },
            checkPosition: {
                x: -90,
                y: 35
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Guizi",
            image: "https://methy.net:10233/images/live_room/guizi.png",
            size: {
                scaling: 0.35
            },
            checkPosition: (canvas, thisImage, scene) => {
                const tiziImage = scene.children.find((child) => child.name === "Tizi");
                const chuanghuImage = scene.children.find((child) => child.name === "Chuanghu");
                let x = -canvas.width / 2 + thisImage.width / 2;
                if (window.safeArea) {
                    x = -canvas.width / 2 + window.safeArea.left * 2 + thisImage.width / 2;
                }
                x += (chuanghuImage.width / 2 * 3 + tiziImage.width);
                return {
                    x,
                    y: -10
                };
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Guizi1",
            image: "https://methy.net:10233/images/live_room/guizi1.png",
            size: {
                scaling: 0.22
            },
            checkPosition: (canvas, thisImage, scene) => {
                const chuanghuImage = scene.children.find((child) => child.name === "Chuanghu");
                const guizi2Image = scene.children.find((child) => child.name === "Guizi2");
                let x = -canvas.width / 2 + thisImage.width / 2;
                if (window.safeArea) {
                    x = -canvas.width / 2 + window.safeArea.left * 2 + thisImage.width / 2;
                }
                x += chuanghuImage.width / 2 * 3 - 18;
                return {
                    x,
                    y: canvas.height / 2 - guizi2Image.height / 2 - 60
                };
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Guizi2",
            image: "https://methy.net:10233/images/live_room/guizi2.png",
            size: {
                scaling: 0.17
            },
            checkPosition: (canvas, thisImage, scene) => {
                const chuanghuImage = scene.children.find((child) => child.name === "Chuanghu");
                const tiziImage = scene.children.find((child) => child.name === "Tizi");
                let x = -canvas.width / 2 + thisImage.width / 2;
                if (window.safeArea) {
                    x = -canvas.width / 2 + window.safeArea.left * 2 + thisImage.width / 2;
                }
                x += chuanghuImage.width / 2 * 3 + tiziImage.width + 10;
                return {
                    x,
                    y: canvas.height / 2 - thisImage.height / 2 - 150
                };
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Light",
            image: "https://methy.net:10233/images/live_room/light.png",
            size: {
                scaling: 0.25
            },
            checkPosition: (canvas, thisImage) => {
                return {
                    x: 100,
                    y: canvas.height / 2 - thisImage.height / 2
                };
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Luzhi",
            image: "https://methy.net:10233/images/live_room/luzhi.png",
            size: {
                scaling: 0.3
            },
            checkPosition: (canvas, thisImage, scene) => {
                const chuanghuImage = scene.children.find((child) => child.name === "Chuanghu");
                const diannaoImage = scene.children.find((child) => child.name === "Diannao");
                let x = -canvas.width / 2 + thisImage.width / 2;
                if (window.safeArea) {
                    x = -canvas.width / 2 + window.safeArea.left * 2 + thisImage.width / 2;
                }
                x += chuanghuImage.width / 3;
                return {
                    x,
                    y: -canvas.height / 2 + thisImage.height / 2 + diannaoImage.height - 20
                };
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Muma",
            image: "https://methy.net:10233/images/live_room/muma.png",
            size: {
                scaling: 0.35
            },
            checkPosition: {
                x: -160,
                y: -160
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Rili",
            image: "https://methy.net:10233/images/live_room/rili.png",
            size: {
                scaling: 0.25
            },
            checkPosition: {
                x: 590,
                y: 250
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Sofa",
            image: "https://methy.net:10233/images/live_room/sofa.png",
            size: {
                scaling: 0.45
            },
            checkPosition: {
                x: 460,
                y: -180
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Book",
            image: "https://methy.net:10233/images/live_room/book.png",
            size: {
                scaling: 0.03
            },
            checkPosition: {
                x: 450,
                y: -190
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Tizi",
            image: "https://methy.net:10233/images/live_room/tizi.png",
            size: {
                scaling: 0.55
            },
            checkPosition: (canvas, thisImage, scene) => {
                const chuanghuImage = scene.children.find((child) => child.name === "Chuanghu");
                let x = -canvas.width / 2 + thisImage.width / 2;
                if (window.safeArea) {
                    x = -canvas.width / 2 + window.safeArea.left * 2 + thisImage.width / 2;
                }
                x += chuanghuImage.width / 2 * 3 - 18;
                return {
                    x,
                    y: 60
                };
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Z",
            image: "https://methy.net:10233/images/live_room/z.png",
            size: {
                scaling: 0.6
            },
            checkPosition: {
                x: 160,
                y: -120
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Shafa",
            image: "https://methy.net:10233/images/live_room/shafa.png",
            size: {
                scaling: 0.27
            },
            checkPosition: {
                x: 200,
                y: 60
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Girl",
            image: "https://methy.net:10233/images/live_room/girl.png",
            size: {
                scaling: 0.37
            },
            checkPosition: {
                x: 180,
                y: 50
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Chuanghu",
            image: "https://methy.net:10233/images/live_room/chuanghu.png",
            size: {
                scaling: 0.35
            },
            checkPosition: (canvas, thisImage) => {
                let x = -canvas.width / 2 + thisImage.width / 2;
                if (window.safeArea) {
                    x = -canvas.width / 2 + window.safeArea.left * 2 + thisImage.width / 2;
                }
                return {
                    x,
                    y: canvas.height / 2 - thisImage.height / 2
                };
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Shuli",
            image: "https://methy.net:10233/images/live_room/shuli.png",
            size: {
                scaling: 0.08
            },
            checkPosition: (canvas, thisImage, scene) => {
                const guiziImage = scene.children.find((child) => child.name === "Guizi");
                const chuanghuImage = scene.children.find((child) => child.name === "Chuanghu");
                const tiziImage = scene.children.find((child) => child.name === "Tizi");
                let x = -canvas.width / 2 + guiziImage.width / 2;
                if (window.safeArea) {
                    x = -canvas.width / 2 + window.safeArea.left * 2 + guiziImage.width / 2;
                }
                x += chuanghuImage.width / 2 * 3 + tiziImage.width - thisImage.width / 2 + 10;
                return {
                    x,
                    y: 90
                };
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }, {
            name: "Cat",
            AnimationFramesCount: 37,
            AnimationFramesDir: "https://methy.net:10233/images/live_room/cat",
            AnimationDuration: 100,
            size: {
                scaling: 0.17
            },
            checkPosition: {
                x: 260,
                y: 45
            },
            currentPosition: {
                x: 0,
                y: 0
            }
        }],
    totalTimes: 3,
    currentTimes: 0
};

class LevelFinishDialog extends THREE__namespace.Mesh {
    constructor() {
        super();
        this.isFristRender = true;
        this.isShow = false;
        this.content = new THREE__namespace.Group();
        this.dialogBackground = new ImageButton({
            imageSrc: initAssetsStore.assetsMap.dialogBackground.image,
            scaling: 0.6
        });
        this.dialogTitle = new ImageButton({
            imageSrc: initAssetsStore.assetsMap.dialogTitle.image,
            scaling: 0.3
        });
        this.dialogCloseIcon = new ImageButton({
            imageSrc: initAssetsStore.assetsMap.dialogCloseIcon.image,
            scaling: 0.2
        });
        this.dialogSelectLevelButton = new ImageButton({
            imageSrc: initAssetsStore.assetsMap.dialogSelectLevelButton.image,
            scaling: 0.3
        });
        this.dialogNextLevelButton = new ImageButton({
            imageSrc: initAssetsStore.assetsMap.dialogNextLevelButton.image,
            scaling: 0.3
        });
        this.onBeforeRender = (renderer) => {
            if (this.isFristRender) {
                this.isFristRender = false;
                this.initMask(renderer);
                this.dialogCloseIcon.position.set(10, 190, 4);
                this.dialogTitle.position.set(0, 80, 4);
                this.dialogSelectLevelButton.position.set(-130, -200, 4);
                this.dialogNextLevelButton.position.set(130, -200, 4);
                this.dialogGoodAnimation.position.set(0, -50, 4);
            }
            else if (this.isShow) {
                // mask透明度增加到0.5
                if (this.material.opacity < 0.5) {
                    this.material.opacity += 0.02;
                }
                // 对话框缩放增加到1
                if (this.content.scale.x < 1) {
                    this.content.scale.x += 0.1;
                    this.content.scale.y += 0.1;
                    this.content.scale.z += 0.1;
                }
            }
        };
        this.initMask = (renderer) => {
            this.geometry = new THREE__namespace.PlaneGeometry(renderer.domElement.width, renderer.domElement.height);
            this.material = new THREE__namespace.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 });
        };
        this.show = () => {
            this.isShow = true;
        };
        this.content.scale.set(0, 0, 0);
        this.dialogGoodAnimation = new AnimationButton({
            imageSrcList: initAssetsStore.assetsMap.dialogGoodAnimation.animationImages,
            scaling: 0.25,
            duration: 50,
        });
        this.selectLevelButtonEvent = bindClickEvent(this.dialogSelectLevelButton, () => {
            if (this.isShow) {
                setCurrentRoute("level_menu", {
                    type: "simple"
                });
            }
        });
        this.content.add(this.dialogBackground);
        this.content.add(this.dialogTitle);
        this.content.add(this.dialogCloseIcon);
        this.content.add(this.dialogSelectLevelButton);
        this.content.add(this.dialogNextLevelButton);
        this.content.add(this.dialogGoodAnimation);
        this.add(this.content);
    }
    clear() {
        super.clear();
        unbindEvent(this.selectLevelButtonEvent);
        return this;
    }
}

const BackIconImage$3 = "https://methy.net:10233/images/back.png";
const ActiveButtonImage = "https://methy.net:10233/images/live_room/active_box.png";
class LiveRoomScene extends BasicScene {
    constructor() {
        super(LiveRoomSceneData.backgroundImage);
        this.needLoading = true;
        this.manualLoadingProcess = true;
        this.isLevelFinish = false;
        this.objectList = LiveRoomSceneData.objects.map(object => ({
            ...object,
            isFinish: false
        }));
        this.realObjectList = [];
        this.levelFinishDialog = new LevelFinishDialog();
        this.onTouchStart = () => {
            for (let object of this.realObjectList.slice().reverse()) {
                if (isObjectInMouse.call({ mouse: getMouse() }, object, 5)) {
                    this.dragingObject = object;
                    break;
                }
            }
        };
        this.onTouchMove = () => {
            const mouse = getMouse();
            if (this.dragingObject && mouse) {
                this.dragingObject.position.x = mouse?.x;
                this.dragingObject.position.y = mouse?.y;
                this.checkObject(this.dragingObject.name.replace('real-', ''));
            }
        };
        this.onTouchEnd = () => {
            this.dragingObject = undefined;
        };
        this.onTouchCancel = () => {
            this.dragingObject = undefined;
        };
        this.moveToCenter = (object) => new Promise((resolve) => {
            if (Math.abs(object.position.x - (-100)) < 10 && Math.abs(object.position.y - 100) < 10) {
                return resolve();
            }
            object.position.x += (-100 - object.position.x) / 10;
            object.position.y += (100 - object.position.y) / 10;
            requestAnimationFrame(() => {
                this.moveToCenter(object).then(resolve);
            });
        });
        this.randomPopObject = () => {
            // 使用getObjectByName方法判断是否已经全部弹出
            if (this.objectList.every(object => this.getObjectByName('real-' + object.name))) {
                return;
            }
            const object = this.objectList[Math.floor(Math.random() * this.objectList.length)];
            const image = this.getObjectByName('real-' + object.name);
            if (!image) {
                if (object.image) {
                    const image = new ImageButton({
                        name: 'real-' + object.name,
                        imageSrc: object.image,
                        scaling: object.size.scaling,
                        width: object.size.width,
                        height: object.size.height,
                    });
                    image.position.set(this.activeButton.position.x, this.activeButton.position.y, 1);
                    this.add(image);
                    this.moveToCenter(image).then(() => {
                        this.realObjectList.push(image);
                    });
                }
                else if (object.AnimationFramesDir) {
                    const imageList = new Array(object.AnimationFramesCount);
                    for (let index = 1; index <= imageList.length; index++) {
                        const image = object.AnimationFramesDir + "/" + index + ".png";
                        imageList[index - 1] = image;
                    }
                    const animation = new AnimationButton({
                        name: 'real-' + object.name,
                        imageSrcList: imageList,
                        scaling: object.size.scaling,
                        width: object.size.width,
                        height: object.size.height,
                        duration: object.AnimationDuration,
                    });
                    animation.position.set(this.activeButton.position.x, this.activeButton.position.y, 1);
                    this.add(animation);
                    this.moveToCenter(animation).then(() => {
                        this.realObjectList.push(animation);
                    });
                }
            }
            else {
                this.randomPopObject();
            }
        };
        this.checkObject = (name) => {
            const realObject = this.getObjectByName('real-' + name);
            const checkObject = this.getObjectByName(name);
            if (realObject && checkObject) {
                const realObjectPosition = realObject.position;
                const checkObjectPosition = checkObject.position;
                if (Math.abs(realObjectPosition.x - checkObjectPosition.x) < 10 && Math.abs(realObjectPosition.y - checkObjectPosition.y) < 10) {
                    this.finishObject(name);
                }
            }
        };
        this.finishObject = (name) => {
            const realObject = this.getObjectByName('real-' + name);
            const checkObject = this.getObjectByName(name);
            if (realObject && checkObject) {
                realObject.position.set(0, 0, -10);
                checkObject.setCheckArea(false);
                this.objectList.find(object => object.name === name).isFinish = true;
                this.realObjectList = this.realObjectList.filter(object => object.name !== 'real-' + name);
                this.checkLevelFinish();
            }
        };
        this.checkLevelFinish = () => {
            if (this.objectList.every(object => object.isFinish) && !this.isLevelFinish) {
                this.isLevelFinish = true;
                this.add(this.levelFinishDialog);
                this.levelFinishDialog.show();
            }
        };
        this.clear = () => {
            unbindEvent(this.backIconClickEvent);
            unbindEvent(this.activeButtonEvent);
            this.canvas.removeEventListener('touchstart', this.onTouchStart);
            this.canvas.removeEventListener('touchmove', this.onTouchMove);
            this.canvas.removeEventListener('touchend', this.onTouchEnd);
            this.canvas.removeEventListener('touchcancel', this.onTouchCancel);
            this.children.forEach(child => {
                child.clear && child.clear();
                this.remove(child);
            });
            this.levelFinishDialog.clear();
            return this;
        };
    }
    async load(canvas, setCurrentProcess) {
        await super.load?.(canvas);
        this.canvas = canvas;
        const allPromise = [];
        for (let object of this.objectList) {
            allPromise.push(() => new Promise((resolve) => {
                if (object.image) {
                    const image = new ImageButton({
                        name: object.name,
                        imageSrc: object.image,
                        scaling: object.size.scaling,
                        width: object.size.width,
                        height: object.size.height,
                        isCheckArea: true,
                    });
                    image.onLoad = resolve;
                    if (typeof object.checkPosition != "function") {
                        image.position.set(object.checkPosition.x, object.checkPosition.y, 1);
                    }
                    this.add(image);
                }
                else if (object.AnimationFramesDir) {
                    const imageList = new Array(object.AnimationFramesCount);
                    for (let index = 1; index <= imageList.length; index++) {
                        const image = object.AnimationFramesDir + "/" + index + ".png";
                        imageList[index - 1] = image;
                    }
                    const animation = new AnimationButton({
                        name: object.name,
                        imageSrcList: imageList,
                        scaling: object.size.scaling,
                        width: object.size.width,
                        height: object.size.height,
                        duration: object.AnimationDuration,
                        isCheckArea: true,
                    });
                    animation.onLoad = resolve;
                    if (typeof object.checkPosition != "function") {
                        animation.position.set(object.checkPosition.x, object.checkPosition.y, 1);
                    }
                    this.add(animation);
                }
            }));
        }
        allPromise.push(() => new Promise((resolve) => {
            this.backIcon = new ImageButton({
                scaling: 0.2,
                imageSrc: BackIconImage$3
            });
            this.backIcon.onLoad = resolve;
            this.backIcon.position.y = (canvas.height / 2) - 72;
            this.backIcon.position.x = (-canvas.width / 2) + 84;
            this.backIcon.position.z = 2;
            this.add(this.backIcon);
            this.backIconClickEvent = bindClickEvent(this.backIcon, () => {
                setCurrentRoute("level_menu", {
                    type: "simple"
                });
            });
        }));
        allPromise.push(() => new Promise((resolve) => {
            this.activeButton = new ImageButton({
                scaling: 0.15,
                imageSrc: ActiveButtonImage
            });
            this.activeButton.onLoad = resolve;
            this.activeButton.position.y = (-canvas.height / 2) + 72;
            this.activeButton.position.x = (canvas.width / 2) - 84;
            this.activeButton.position.z = 2;
            this.add(this.activeButton);
            this.activeButtonEvent = bindClickEvent(this.activeButton, () => {
                this.randomPopObject();
            });
        }));
        // await Promise.all(allPromise);
        let index = 0;
        for (const promise of allPromise) {
            await promise();
            index++;
            const process = Math.floor(index / allPromise.length * 100);
            setCurrentProcess?.(process - 1);
        }
        for (let object of this.objectList) {
            if (typeof object.checkPosition === "function") {
                const image = this.getObjectByName(object.name);
                if (image) {
                    const position = object.checkPosition(canvas, image, this);
                    image.position.set(position.x, position.y, 1);
                }
            }
        }
        this.levelFinishDialog.position.set(0, 0, 3);
        this.canvas.addEventListener('touchstart', this.onTouchStart);
        this.canvas.addEventListener('touchmove', this.onTouchMove);
        this.canvas.addEventListener('touchend', this.onTouchEnd);
        this.canvas.addEventListener('touchcancel', this.onTouchCancel);
        setCurrentProcess?.(99);
        return;
    }
}

var LoadingBackgroundImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF92lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDg4LCAyMDIwLzA3LzEwLTIyOjA2OjUzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjMtMTAtMjFUMTU6NTY6NDcrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMTAtMjFUMTU6NTY6NDcrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIzLTEwLTIxVDE1OjU2OjQ3KzA4OjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjExODgxZDU3LTQ3ZjctNDYwZC1iYjUyLTI2ODBiMjgxZDEzOSIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmU5N2ViYWMxLWI3OTUtN2U0Mi1iNjc3LWI0MGU1YmNiNTAzNiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmZiNTUwMDI5LTUyMzYtNDFiOC05ZjUxLWQwYWVkZTI1NGJhOCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZmI1NTAwMjktNTIzNi00MWI4LTlmNTEtZDBhZWRlMjU0YmE4IiBzdEV2dDp3aGVuPSIyMDIzLTEwLTIxVDE1OjU2OjQ3KzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoTWFjaW50b3NoKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MTE4ODFkNTctNDdmNy00NjBkLWJiNTItMjY4MGIyODFkMTM5IiBzdEV2dDp3aGVuPSIyMDIzLTEwLTIxVDE1OjU2OjQ3KzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMCAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5YTi/PAAARjElEQVR42u3XMQ0AAAjAMA782yBBB8LwAa2EfcueCgAA4IeUAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAACAAZAAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAIABkAAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAgAGQAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAMAAAAYAAAAAADAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAGAAAAMAAAAIABAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAGAAAAMAAAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAADAAAAGAAAAAAAwAAABgAAADAAAAAAAYAAAAwAAAAgAEAAAAMAAAAYAAAAAADAAAABgAAADAAAACAAQAAAAwAAABgAAAAAAMAAAAYAAAAwAAAAAAGAAAAMAAAAIABAAAAAwAAABgAAADglgXDVRIW/D5BEgAAAABJRU5ErkJggg==";

var LoadingWordImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABDcAAACaCAMAAACKXlPGAAAAV1BMVEUAAAAyJyQ2KyhBNzROREJGPDptZWM9MzAzKCVpYV86MC19dnVXTkxaUk9KQT54cG5US0hRSEWEfnxxamdkXFqCe3lhWVZ1bmxnX1xdVFJfVlR0bGp6c3Gw7Xi9AAAAAXRSTlMAQObYZgAAGMRJREFUeNrs1LEJgEAABLA7wc5GUPcfVcQJtHr4ZIgEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABrL3cYTP1rZbYD5XX2f4E26XwHRu9u51OVUYigLwXgQoF5GLl1rt+z/nmWlrptiKCQI9Ya/vpyPCoC5JsrfgSyY07swZIVLmHVdCfnjmSK0EV6mQF545UgufOMHnD1dvQqQLrK2QF1zFQqQLc2M0XBVCpAusVsgLODFKWsGqhJgbRC5gnYSYG0QuYO3EW72pXkUt5gapBcfZvV3z9uMh5fMizA3SKsWQtl8dFkkPoLtBg7lButSnxmRw0MiH7W8JcdS+DgmrFqJhoXcxxfAx0ImxgZWILnWa57lBD7vcaIAJ/EuSwcv7/U6Muvc0NQrcoX3YRgPawAsrI/jp+rlxlm8AfSP8FzxWClFP/jXqDxY83WzV9jJUX25s4cDIE9hbu0Jd8A2Q8FPebGXuvdhRVICLRMZrcBFaG1zlEih4KHY/toqUN+HDhYy30XPppkgG6yJzKWZdpbjgkShp8tKxUiHXNk6J8Fgso1WcV12hYmjSPJhqoi3u2fkfUz5FxJ3DSZ8Ow0yTy3iVzlXtlUsAKxNrtr28yBKOsEZlWfT8X3ecwskNEQNr6o9DhS97GVam59ZkS56wQ6u3neBJzf0hbEiXGw47XPqg0pBy4xtMG/EbWEt8RjpxtDchvjn/i3yZ2GjcRkKryo0Lc+PmdymbPzc6WJGJq/2ulFv12bAsxQ1MKr8q+8VQs3F7m9aVGyVz46b8/+w6O7vAylooXUgYEr2YJG6qfVofZAZ7fEjSwaN6ldmcnL6hK8uNA3OjP1tdybBkudwIpyYYI2QmrvK6m3SZLWouvx/UXuYDpwqRleVGqDcwmjA3jE9sSLtobgRyuwc8L+um23fR5geJsEyF0/sfhHvilRupfGJuTJkbxVBsZNEsC9dwE8wFByawm2/fkcwo+oP6y9grN3D8x96ZrceqAlGYhYo4z/b4/s95pq/pY0eRAjGa7P9y7yQK4rKqqCqu4y2PuJLokblzztCbgCLdMJtsnPHihNkGVPNHN9zoHVeCHl7eJ+miJ96EVbqhycLIEgkd7spxsv43WQodhVNrg8QgQeY5H6HPSMmqIMI7dmiwAbmtl0lEBnXyZIydIsVcc1E32t910GqAFRKHFNTHwuTw+QnrZvSn9vCeBQcXDbWO3Sj3lCwlIX11InPjMYYptiHaTDd6dnyuWMXextW8Djf2ZtbWS4gRTJjB64GdgQjuxMwKbMIGH7KUeULUgcTWpJvpxp0dH45VbLOQpWm/+dkaOrypSLP+1oWhEtdbHkZBUNa3Xpwr3BT+TfkP0d8EfxOnnEtQkMySLOdw5bjmRgEvJMwRnKkaX2IVS5+Hr/1A8mXC4lkFSn/yLpZzozZRiXsdxRIzuEqXhDWRe4BSMi9U8AL/XQe7X7FGbGe7ROsmcKr5wuDNj979tiRYHu4zURuEbAMeNYcF1bYnpx0s4qyw8gmzgc1xrr7oNVaw0/HRyEIslnQjhSL/oxvaNCX/cNDZwIlgb46sGzwihYLr6e/m12rG7D4FJT5JQ0VBaXH9ZjBcgnxeNzoo+M/OtrOk3HG48UfIRDQpVmGWzEbDD6gbebXxV5oH5zxCoHFz1VLD0PKID4K5wja8+eFZuu7pjb6JluQg65f3MAPSQ+NBPXbtThVtKQyRPA6iKGzqOs/z4m8i5yyvGEZczxTC5w520hP/p6btMH41TUt67lL7u3SjJgzXf6OeLMmDqSUpnL/9JfMFt45uuhYDRyAR3M+gH6G9boS0xDmOKZ/2Rmth+lS/SzfyvYZ7pfYsycQtjKW7zyCjomOeCN92zvWSCbwx9Q67/VwkGR47S9FRN6bB4KcY/90cvKx3jULXfeSX4s2P77JmSbHTcLOJ+cy2BgbERca8QVtvN7eUzgD2RIc9UMRBNxiW3vyLQSyWsWksrISFrI+/Szf2Gq7O/fSvG/qLP8P8svFdcNMuicV3RGSPaXe46EbxsfM8lRF9eEp87FwPUIRHdPgPwU7mFS2Tiw4IxEsWV9QPzAnjCuLKTUPhCmck6G+/2Fk32EejGBOJfL4XPl7IqfofdGPyAOzTxJZ77qtYgcSoCzHK8tr6zmxv3UQU7uRM4cV8DXfWjUTZboa6odzF5OPBRXY7cenv0o1MF4X2UirNPDCCRmOgONGY+auIcfvyLzenGCox5ikMiJgPoGj21Q0mI5tWAhHw8eAEFMeqhjoY8N/kpfEtGywEkSshhZU/yHPJ/a4yKJKV6Imo012FA28aF93YrwWJ+OjUAkX/Rze+tcnL1X/z8j7pqoGUzk4y+Ruq1RPurRv6mFV7T6FYeC++P/ztRTcSUjaCw7m050zStWfi9PtgcNpKcX+tHqHUfG1hBLm2eC/dEOYxKxHTRuVeapK7FjAPfRhwK/uFKI4XUqLyDygmZOzwzRpoxZ7uzHqoQy0xhaQbgmqq7qYbtNTFhvhq0AnthUNiBe6vdREU8eRa9Cv+loNffedjc7x5sj2QS6bmNf0qBTCiPJVuZLqq0NhzrCmk9RRus0cy5mEUcKzT0GeooNU3lVfGGquWLSc5FmUzCF8f5wIstgtQ6CK06axbOlTXOrY0Woej6MagFeob/PYRbFaFYwhLpRM0mClUxzgoKvZGSMbYHz/lG+M5IXbXjViXKYI3+uHndN3IoSDsTHeb6YZp9kLq+YHUK4eScdgSbGBFF2HAffjlWIcHZd53Zygx/O79ox776wYUg9aHXh1+SgznplC05hpz86kbwkLf3Mm1oSHYs4EVPXiyrwfQkUEzdufobr6vbrTYXzdq7eVKgm6wgBaVxxoJU3R4EfrUjf57DtseNQ89gy3S3or2v947OJKwc+FzEeEbdEPfEqch6AYhC4De0N9piwmKxCIq2Pl/IMnyQxewgyduq7rLA3hc7zc4UrBzwfHC35/e8bzSDgq9NSIpuiGYhmvIYUZHk2t33WhWinmYF/TXgDFpmSdV61qZDIVP3Shhx6l6z+/TmDgg1G970KpI73rzTXQj49DgXzd6i731bBcDcDGMEGCZuCyUUpAZqi6511GKKfvoBocjATsX3voG5KTMZjG+nrhXt6vAi3gL3QhBgm2uGyMhKrivbrDFXYuKQyH/VYq9WiiI+Yk/RJPqlJ2Lq6dFdKEVb0OxkY3DV3Qj2EI3QCLaSzf0kzD8rFIKmJNPdtTKMRHVcBTdOFs53BMvMu+Ps/SuG1BcVsJXEUU3ui1Wy32zBA4obhaTmZ3WNnZ9BrHGTQrybns7d8iely7pb3lTBjH/UbrhqSBWYobYt27coVgLe4f76oYcl+60cey/QdeN08binLVbuc+LpDfHQKxkRgyPa17G8ifoRs22I8Yc0rdurLpE988f4Ea68XBYszxuhO7l5W7DpE9mhTOdO71KDHMM94HTft9yjbYrotP5jD6KVRu8SR9QOOqGe4XI+Gnhp0a6cSH1Jwx8583IFWMFCn29cM9+ADlM4aHKRVwnfjAKp83DOFLiVzctft5NN9JVDRw/35kAL+x6oc11xPE+7elKxAgKfSRcsKPRDll1efEcmAECq6S1sPFruPn8PA7eK/5fDq8bwBtG1Q2vQ7l/vjOlm24oMoeiezLRSvElFPo5eLIDUI1hihVi+wBH5xTLjg52DNGBgMJHTJQ56YZ1w6h13agM0lcIL1gFRfby1OTFKFHo6dTBlz6ZzXHWeAFDpHVBJVFmLPMqguPMKQHSWuO+G7jHn0d1QuE33R0KsV5GkKl/MLE3aPntajixiVteOLj03GIyo8OscZjDbSsqB+dMi4j95q7EDV54/vzUX4xEKEwEO9sgqmJuT/aWcVF9kam6FRPHJnaoN5Urk3nkkz4qUKhs2/TrX/E2q5I84tDym3Vj0SBPZv4j6/o8DFK8qWxWQzE/qUmSCCG6R/XMhq9LPXEvEQjNj9EWxH3YdUMmNhQcKJw6qOr9mCOvcZCQlpFjsWwOsw+SUmKeX6wbOV4sdzKpUyyRWKyGcmFSoSXInNchYRYqi7wvvfGfeNANYkVrfgbdyEDDUlivtMlhbc7xld97CkLhVthc0OsC469xUuKHJg3vD4tNhpRgdWV40Tql0sr//52nk26456n036gbT5Ek/9iSGb2ASY+lKXOzORF5lJiSm3czby/Xoonms8rjvGInY3TTjZBcO89njMbB5ILOCREtJcqDF5mTbkAxeW8vfkLwUKxEegZCop+P7ZGYohs8KMOwvl+T/+jveRNAkdk1w6iXx09JJzNN3xAMa/BTtfZK3HQjIHc9mrMEHv50I4HCaEWZ+CIEL22hBuJiEkkVM7dYuOhG9p7wPU/MoX1wOiji+kksVNSjr6WciKqGNsUb8yAADOAPdhY6N92Q1H6isx/5qz/dkHjRGzkzJtrwvm+abjRGi312aSvjLCLrhl7w/J8ILGkebmfUxRkKYddDJ3CwIjNTRyU21o3T5fg/F5eahAlEnX/OWiGFP92Agpafgxejrr8v7fIhTTdAHgYU9GoJ4Su8QXx6gjjS0a6JfupibzVQGD99GCLP0cm8XZyB0kOMYZx3IUJvuhHgRWS2P2eyiqTxmq220Y0eG+tGMzOok+pGYXcf0ql01aNuACU7A4sz0GMZHjVF3z1bojiFC1GjwK4X43YJe/LLZ0jniHPjg81uC7pxJXWEjrC1bgS6yDXbFo55MkLATSP0jWVdfaSb95xwGI/hNixWOdem7eIMDB9NpG8ic8wBjE0b07VD9qw60Y95CQ2U3SJOPMdLZ6fExt+6CIr7TLNiPmh3HzJ1K1vrBte93GxjME/lohsldUdPrIb0m6lxIOvBRLZq00Ol8cHZm3zhhfB5lHZie9bN9DlnIg+kVZ5vRjqnXL8rGRl7wrFFGKz9mHdMaA0bmhN0JeulXzO5fv3l2zXcyN64UW8XX4mXL6zWnFi7vDTSqm5ytH1T3MdxvBdF3YRRwM8pHMuO4qZ94+6AlROxYL21ouHInNwUfQaozlAJjSeGY43Vm6bk5366kteuylqmaA/wrYNicNENMWMPkgU8XYr03acejZjRdvLuvu436hO6KssPYNtB1HZvNYfCpQS3IAZ59I/ZeM3CWTdIVVwp3AnYIm2sHTg1Dc9FNypaBpEwCSTgxZzcx2NL/iBJQreZ8mznpux6ZCb9AiU85E866kZh/HCxir74StCSZWI4ww2Np9TXM09gEnXmxO6LS8xHjbFEMA6ELGRal6r+XAfDLo8nOoJujFA4HM4ZbKobvfHLA5u8udE6NzeCK1znaE6J/Txz4WIf0fW0syjE5eENit6wmTkUmvV6ohBHvLwRewTdcDm11KJu0SidQRg7cCFWIKjNlXyoFZ2S0oJLHkI3Ysf2YYXjGUmRwVhD08XIJ3/40PzV3pluuwlCUZgN4hiNc8b3f852tUtTE0UOQ6qt37+7eqtexM3hTCz356m3oBsMI+YpbZyuGxEGVJ+naZK12hI3j+nHsCEiWk6lj3fegEZMuafIFQaLgBEalUYP7Xlc7MbgUPihNqYbZ2NL6qL7JFxrk5ZRIsELBCHp/wjGPAtH3JMOA7c/i9LeZqJrN8sUynPHAKtzbn9/YXJwdbUXg6PGAK0M6vu6kTu6vEIIAoUZZiioZTDCNb2KAu+c3Lf0nZ723hnJX7EH3RCT0C/mSGaXg+7Ere6PEUqn3GAvBgcGQg8JHPbZusaOuFz/q2s/h+CmpxskAs0Gg4llE80uOz/C5Nrf81NZVUEhpfhJFEXcuFYe8+xAN9qp+mIWufxaQ+lGNyLdB+Y7qY1dVofIcxYKRs4eEjgwov9Bs5GrV924ENybFqNP32ARnZWhe9042+qGet3BAp26A0dSxOa6IaYb33+kKeny/Lx5/gNSDCTu7baa4Bvgn3do/qJuhN5SBzGQualN4+51IwMRXecGfyueKD8aCa3W5tetjPFOt/oWk+Wm0Ns+kEJzTrhanuitP29aRrub+LKeDmRedSMjbAq8rBGNox7jfnWj1skm0c3c+OiPcMaEmFBJ/7jx1aEUGFAfHKDsC7VhKkJAxdedK/dmm1Ggjr3wqhvrT+Nn7pheFUtkznWj00t5xwitwQ4Gincz6kla6INVWxkjVOOd76JK5YEBy9ZxnvI5MfI0unajP5nlt3Sj0/9GmUtMY1OErCdbOa8xktvqRvjZhnQa0hIYSWmJjhIDdx3dIF283cdGRePsu5L5IMEAdx6IxQjh3JHQs25MPPuNULS59K0blSPdgHFbynT9Xo2tbmAkWejslmNAfQrklIvUyH7DgCT3YdyZbpzYG8KvwfQgvvzU7guB7FbWDvYt3QBf2DGE+I5uCDMP9oh9YEZQWw7TdQMjt8W9YvZnMBFTuCz7JptsopKKa3Zmz9+C7o9/Vzf4cqYs80GGEb28HSuvaLx4SAWUutE5140pK4VpF0+vmkSHJTpGoifoxggXRXlPHhnRW55hIFftAfjrJ5hQ6IUbMgxk/4huiL/mGMWIXuKOwZWjTyWRHUE3FLjXjRifpJ4GnEbkyN7I1z0jILJuJZ1m00MmYp2Y64bUG+paP+ml2YduhNvWjRojFqfQXfEn8Wnuc67I07djCqhFHjfMsgndYFjA+Dji4rMjED+71Q02yoZ6SvfgFv1LhKZpp58GGu1DNxgG6i9Hkqnddjtzrz0+iMtOJY7Q4cIINJhlbUnPNqEbjjLNqzm3QBP/Oc1AZO1uuf5S2MMAsbJy9R9uxH8kYVQRneOAyB+MgFfduJEvnKxsEniVcAzQC8QSpslZrkhPhwmf53C7zvEj4yQOG8zoBscLt7rBANwIJnQNA6TmSGtXA7Z70Q2rPBP/uhFjILXy2BRQw+n77F6zJ/MyzWxVRkdddKwGxqJGP7TWDQn4043mc1OgPiPXAKk5tbUXgt2cwJT/LX2jJ/3pkbF5CooInLEOYXSVt3x8NoSQS2kMYZk/mSGB1Zs+4QNmqRsJYKkbnKm4LM+5m5VupBgINCNXGNH2gtVso2AGLmR1urfJ2EPfHyD2rgaz5UQRAYEV7gbO0BFZL9RycVXMtCANhPNKxawJr/0tdqQbGceIqX9DmFpNcq0D+bMtBcc7aZV06+6KEgPtzGTffccvuKaybIrv30904ViAzZK1VYR5zhZD3C7+TqT6qyO7HWWCAcd6T/eLRuwZzw4KRnhe/m4eEkVCSBmUp7wPL9l06ydMiym5nT2m3qtihDho0SSjbKvANdK2AQf9GDI6wtxXkT3PjyYMk7692HWuYH8wP4JyKsaEokod0817+hh905YSg/P0GTdVHGXnk6d2zmLjUDfOeLFhc4PBNRGjMOtfC6/3U1WIiEMHZkTICVeyIsM8S99SoJp7GUZ8NuCgrLVEWpVqGOlG4UY6qcHSRGkqNxiICLpxjt/aPm8WuCY2vH1v+kzMlDbGV97S+nMv7fM+/Sh44bEBh8/6iSfmiZ9z9WDLdObGPAasLKkKA+p6nrOucV2Lj09pu3C4xrBcqjTVjZqZc4sxEjFP1KvjlGKkV/acSR3qRu9RN+gyeqcu+WcMnPzoBpiamHwZTOGRDMr83rfXa9IKvLPlXQpjAq4xbPglTXUjY1Z0BX5RMX/0MQDxXLQXagzUS1uc8D2bMbH94ksXs+buRjdKeq1/i4HW+AnOBMcoWWC6AJgaDVCwM9lgAVxj6F1PTce3YdY0bca+A17M9BMoVn4dLwIHhfREKhHdO0V9srFuBEuLidBacS7GT3BX7qMcnOmVFchn7rt/2WCsPRVRDIcYphPAaHx3cPyuWjdGmrBWdr1IJj+lX4+ENJihcbBSyeVnjJ3WLGn6TzQnVoSB1r1PYAen0b/RncM2H4MZJHgqijLvGYXEXjdubEcQM+YveDFJVv9+5gVmKOz9xJHK6+UppUfoeSYi1+MooEt8Zgfkhl8c2mw7WGVxFJRaQrNN6IawtrlS5cqc6YVlHFdVpIp/tTvUp4AeccgO1HSRLO/JpTP11W6/9McuECEJUkmyeERi7ZYILRNaYpWBfz89CMcb0LhgQL8nMMBPz9nbt0yX8h+cz1viJGQRVGV+69skbB7nLOvYIput/FF/frHF9iC1C6AVDTPgginSMhwT+HAU0cWb3DQyDfK+gtHt71iDb/tgx4O/RkacbRvytBdbctuB5t+FqEm6Ie5PzfzIE8WZtwgv+sOlcaCg5qRYxnVTAaQyBoD07++/E+KHmwKQNllrew2XHvyn7D5C54UAI5TfF7W6LSZdN57s4GCDhMcCpz7OhdimOk0UCaPEqpotF7of/OfEh2x8wonpOxfMElrmXkTs4GCbZBjZ+gHlxvhvk4oR49Gsji3jwY4o8CJnB5NqWLtzKhOqhhf4gyNoerBlBAZO7GAyJg1BalI39TUslADA/35Q6eBAJxibsoMXuZRXRqOWh4/54L+iy9iBC64cI5z9T/wALLrxZS9AAsUAAAAASUVORK5CYII=";

class LoadingScene extends BasicScene {
    constructor() {
        super(LoadingBackgroundImage);
        this.loadingWord = new ImageButton({
            scaling: 0.4,
            imageSrc: LoadingWordImage
        });
        this.startLoading = () => {
            this.basicLoading.initProcess();
            Promise.all([
                this.loadingMethod((processNumber) => {
                    this.basicLoading.setProcess(processNumber);
                })
            ]).then(() => {
                this.basicLoading.setProcess(100);
                this.callback();
            });
        };
    }
    ;
    init(props) {
        if (!this.basicLoading) {
            this.basicLoading = new BasicLoading();
            this.add(this.basicLoading);
            this.loadingWord.position.set(0, 60, 0);
            this.add(this.loadingWord);
        }
        this.loadingMethod = props.loadingMethod;
        this.callback = props.callback;
        this.manualProcess = props.manualProcess;
        this.basicLoading.initProcess();
        if (!this.manualProcess) {
            this.basicLoading.setProcess(90);
        }
        let isFirstRender = true;
        this.onBeforeRender = (renderer) => {
            if (isFirstRender) {
                isFirstRender = false;
                this.load(renderer.domElement);
            }
        };
        setTimeout(() => {
            this.startLoading();
        }, 500);
    }
    clear() {
        super.clear();
        this.children.forEach(child => {
            child.clear && child.clear();
            this.remove(child);
        });
        this.basicLoading.clear();
        return this;
    }
}

class PlayerStore extends THREE.EventDispatcher {
}
const playerStore = new Proxy(new PlayerStore(), {
    set(target, p, value) {
        target[p] = value;
        target.dispatchEvent({ type: "change" });
        return true;
    }
});

const BackIconImage$2 = "https://methy.net:10233/images/back.png";
class PersonalCenterScene extends BasicScene {
    constructor() {
        super("https://methy.net:10233/images/personal_center.jpg");
        this.loadNickname = async () => {
            if (!playerStore.name)
                return;
            this.nickname = new BasicText({ text: playerStore.name, size: 16, color: 0xa2c8b4 });
            await this.nickname.loadAsync();
            this.nickname.position.set(-480, 50, 0);
            this.add(this.nickname);
        };
        this.loadBackIcon = async (canvas) => {
            this.backIcon = new ImageButton({
                scaling: 0.2,
                imageSrc: BackIconImage$2
            });
            await new Promise((resolve) => {
                this.backIcon.onLoad = resolve;
            });
            this.backIcon.position.y = (canvas.height / 2) - 72;
            this.backIcon.position.x = (-canvas.width / 2) + 84;
            this.backIcon.position.z = 2;
            this.add(this.backIcon);
            this.backIconClickEvent = bindClickEvent(this.backIcon, () => {
                setCurrentRoute("start");
            });
        };
        playerStore.addEventListener("change", async () => {
            await this.loadNickname();
        });
    }
    async load(canvas) {
        await super.load(canvas);
        await this.loadBackIcon(canvas);
        await this.loadNickname();
    }
    clear() {
        super.clear?.();
        unbindEvent(this.backIconClickEvent);
        this.children.forEach(child => {
            child.clear && child.clear();
            this.remove(child);
        });
        return this;
    }
}
// Path: src/game/scenes/PersonalCenterScene/index.ts

const BackIconImage$1 = "https://methy.net:10233/images/back.png";
const MonthlyCalenderImageDir = "https://methy.net:10233/images/monthly_calendar/";
class MonthlyCalendarScene extends BasicScene {
    constructor() {
        super("https://methy.net:10233/images/monthly_calendar/background.png");
        this.needLoading = true;
        this.manualLoadingProcess = true;
        this.monthlyCalendarImageList = [];
        this.loadBackIcon = async (canvas) => {
            this.backIcon = new ImageButton({
                scaling: 0.2,
                imageSrc: BackIconImage$1
            });
            await new Promise((resolve) => {
                this.backIcon.onLoad = resolve;
            });
            this.backIcon.position.y = (canvas.height / 2) - 72;
            this.backIcon.position.x = (-canvas.width / 2) + 84;
            this.backIcon.position.z = 2;
            this.add(this.backIcon);
            this.backIconClickEvent = bindClickEvent(this.backIcon, () => {
                setCurrentRoute("level_menu", {
                    type: "simple"
                });
            });
        };
        this.loadMonthlyCalenderImageList = async (setCurrentProcess) => {
            for (let index = 12; index >= 1; index--) {
                const imageSrc = MonthlyCalenderImageDir + index + ".png";
                const imageButton = new ImageButton({
                    scaling: 0.5,
                    imageSrc
                });
                await new Promise((resolve) => {
                    imageButton.onLoad = resolve;
                });
                imageButton.position.y = 0;
                imageButton.position.x = 0;
                imageButton.position.z = 1;
                this.add(imageButton);
                this.monthlyCalendarImageList.push(imageButton);
                setCurrentProcess && setCurrentProcess((12 - index) / 12 * 100);
            }
        };
    }
    async load(canvas, setCurrentProcess) {
        await super.load(canvas);
        await this.loadBackIcon(canvas);
        setCurrentProcess && setCurrentProcess(0);
        await this.loadMonthlyCalenderImageList(setCurrentProcess);
    }
    clear() {
        super.clear?.();
        unbindEvent(this.backIconClickEvent);
        this.children.forEach(child => {
            child.clear && child.clear();
            this.remove(child);
        });
        return this;
    }
}

class InitScene extends BasicScene {
    constructor() {
        super();
        this.needLoading = true;
        this.manualLoadingProcess = true;
        this.isFirstRender = true;
        const oldtOnBeforeRender = this.onBeforeRender;
        this.onBeforeRender = (...args) => {
            oldtOnBeforeRender?.(...args);
            if (this.isFirstRender) {
                this.isFirstRender = false;
                setTimeout(() => {
                    setCurrentRoute("start", {
                        showFromInit: true
                    });
                }, 50);
            }
        };
    }
    async load(canvas, setCurrentProcess) {
        initAssetsStore.addEventListener("process", (event) => {
            setCurrentProcess?.(event.process);
        });
        await initAssetsStore.loadAsync(canvas);
        await super.load(canvas);
    }
    ;
}

function startSwingAnimation(object, duration, easing) {
    const leftSwing = new TWEEN__namespace.Tween(object.rotation)
        .to({ y: -Math.PI / 4 }, duration / 2)
        .easing(easing || TWEEN__namespace.Easing.Quadratic.Out)
        .onComplete(() => rightSwing.start());
    const rightSwing = new TWEEN__namespace.Tween(object.rotation)
        .to({ y: Math.PI / 4 }, duration / 2)
        .easing(easing || TWEEN__namespace.Easing.Quadratic.Out)
        .onComplete(() => leftSwing.start());
    leftSwing.chain(rightSwing);
    rightSwing.chain(leftSwing);
    leftSwing.start();
}

const BackIconImage = "https://methy.net:10233/images/back.png";
const BottomBackgroundImage = "https://methy.net:10233/images/basic_background.png";
const TopBackgroundImage = "https://methy.net:10233/images/outing/top_background.jpg";
const TalkIconImage = "https://methy.net:10233/images/outing/talk_icon.png";
const TalkIconList = [{
        position: (canvas) => ({
            x: -canvas.width / 2 + 340,
            y: -50
        })
    }, {
        position: (canvas) => ({
            x: 0,
            y: (canvas.height / 2) - 200
        })
    }, {
        position: (canvas) => ({
            x: 0,
            y: (canvas.height / 2) - 300
        })
    }];
class OutingScene extends BasicScene {
    constructor() {
        super(BottomBackgroundImage);
        this.needLoading = true;
        this.manualLoadingProcess = true;
        this.talkIconList = [];
        this.ifFirstRender = true;
        this.onBeforeRender = () => {
            if (this.ifFirstRender) {
                this.ifFirstRender = false;
                for (let i = 0; i < 3; i++) {
                    startSwingAnimation(this.talkIconList[i], 1000 + (i * 500));
                }
            }
        };
    }
    async load(canvas, setCurrentProcess) {
        await super.load(canvas);
        this.topBackground = new ImageButton({
            width: canvas.width,
            height: canvas.height,
            imageSrc: TopBackgroundImage
        });
        await new Promise((resolve, reject) => {
            this.topBackground.onLoad = resolve;
        });
        this.backIcon = new ImageButton({
            width: 100,
            height: 100,
            imageSrc: BackIconImage
        });
        await new Promise((resolve, reject) => {
            this.backIcon.onLoad = resolve;
        });
        this.backIconClickEvent = bindClickEvent(this.backIcon, () => {
            setCurrentRoute("level_menu", {
                type: "simple"
            });
        });
        this.talkIconTexture = await loadAsync(TalkIconImage);
        this.backIcon.position.y = (canvas.height / 2) - 72;
        this.backIcon.position.x = (-canvas.width / 2) + 84;
        this.topBackground.position.z = 1;
        this.add(this.topBackground);
        this.add(this.backIcon);
        for (let i = 0; i < 3; i++) {
            const talkIcon = new ImageButton({
                width: 50,
                height: 50,
                imageSrc: TalkIconImage
            });
            await new Promise((resolve, reject) => {
                talkIcon.onLoad = resolve;
            });
            const talkIconPosition = TalkIconList[i].position(canvas);
            talkIcon.position.x = talkIconPosition.x;
            talkIcon.position.y = talkIconPosition.y;
            talkIcon.position.z = 1;
            this.talkIconList.push(talkIcon);
            this.add(talkIcon);
        }
    }
}

class RouterInstance {
    constructor() {
        this.routerMap = {
            "init": () => new InitScene(),
            "start": () => new StartScene(),
            "level_menu": () => new LevelMenuScene(),
            "object_test": () => new ObjectTestScene(),
            "lianliankan": () => new Lianliankan(),
            "place_object": () => new PlaceObjectScene(),
            "kitchen": () => new KitchenScene(),
            "live_room": () => new LiveRoomScene(),
            "personal_center": () => new PersonalCenterScene(),
            "monthly_calender": () => new MonthlyCalendarScene(),
            "outing": () => new OutingScene()
        };
        this.loadingScene = new LoadingScene();
        this.InitRouter = (props) => {
            this.canvas = props.canvas;
            props.effectComposer && (this.effectComposer = props.effectComposer);
            props.renderPass && (this.renderPass = props.renderPass);
            this.setCurrentRoute(props.defaultRouteKey);
        };
        this.setRouterProps = (props) => {
            this.effectComposer && this.effectComposer.reset();
            props.effectComposer && (this.effectComposer = props.effectComposer);
            props.renderPass && (this.renderPass = props.renderPass);
        };
        this.getCurrentRoute = () => {
            return this.currentRoute;
        };
        this.setCurrentRoute = (routeKey, params) => {
            this.currentRoute?.clear();
            this.currentRouteParams = params;
            const nextRoute = this.routerMap[routeKey]();
            if (nextRoute.needLoading) {
                this.loadingScene.init({
                    manualProcess: nextRoute.manualLoadingProcess,
                    loadingMethod: (setCurrentProcess) => (nextRoute.load?.(this.canvas, setCurrentProcess) || Promise.resolve()),
                    callback: () => {
                        this.currentRoute = nextRoute;
                        this.renderPass && (this.renderPass.scene = this.currentRoute);
                    }
                });
                this.currentRoute = this.loadingScene;
                this.renderPass && (this.renderPass.scene = this.currentRoute);
            }
            else {
                nextRoute.load?.(this.canvas);
                this.currentRoute = nextRoute;
                this.renderPass && (this.renderPass.scene = this.currentRoute);
            }
        };
        this.getCurrentRouteParams = () => this.currentRouteParams;
    }
}
const routerInstance = new RouterInstance();
const InitRouter = routerInstance.InitRouter;
const setRouterProps = routerInstance.setRouterProps;
const getCurrentRoute = routerInstance.getCurrentRoute;
const setCurrentRoute = routerInstance.setCurrentRoute;
const getCurrentRouteParams = routerInstance.getCurrentRouteParams;

class BasicCamera extends THREE__namespace.OrthographicCamera {
    constructor(canvas) {
        super(canvas.width / -2, canvas.width / 2, canvas.height / 2, canvas.height / -2, 1, 1000);
        this.position.z = 10;
    }
}

class BasicRenderer {
    constructor(canvas) {
        this.name = "basic";
        this.initComposer = () => {
            this.composer = new EffectComposer_js.EffectComposer(this.webglRenderer);
            this.renderPass = new RenderPass_js.RenderPass(getCurrentRoute(), this.camera);
            const brightnessContrastPass = new ShaderPass_js.ShaderPass(BrightnessContrastShader_js.BrightnessContrastShader);
            brightnessContrastPass.uniforms.brightness.value = 0.08;
            brightnessContrastPass.uniforms.contrast.value = 0.08;
            this.composer.addPass(this.renderPass);
            this.composer.addPass(brightnessContrastPass);
            this.renderPass.clearColor = new THREE__namespace.Color(0xFFFFFF);
        };
        const ctx = canvas.getContext('webgl');
        this.webglRenderer = new THREE__namespace.WebGLRenderer({
            context: ctx,
            antialias: true,
            alpha: true
        });
        this.camera = new BasicCamera(canvas);
        this.webglRenderer.autoClear = true;
        this.webglRenderer.setSize(canvas.width, canvas.height);
        this.webglRenderer.sortObjects = false;
        this.webglRenderer.localClippingEnabled = true;
        this.webglRenderer.toneMapping = THREE__namespace.CustomToneMapping;
        this.webglRenderer.toneMappingExposure = 2;
        this.webglRenderer.setClearColor(0xFFFFFF, 0);
        this.initComposer();
    }
    render() {
        this.composer.render();
    }
}

const wxLogin$2 = async (code, userInfo) => {
    console.log("wxLogin", code);
    const res = await request("/wechat-account/login", {
        method: 'POST',
        data: {
            code,
            userInfo
        }
    });
    return res;
};

class GameInstance {
    constructor() {
        this.InitGame = ({ canvas }) => {
            this.canvas = canvas;
            this.initCanvasSize();
            InitRouter({
                defaultRouteKey: "init",
                canvas: this.canvas
            });
            this.renderer = new BasicRenderer(this.canvas);
            setRouterProps({
                effectComposer: this.renderer.composer,
                renderPass: this.renderer.renderPass,
            });
            InitUIActionControls({
                canvas: this.canvas,
                camera: this.renderer.camera,
            });
        };
        this.initCanvasSize = () => {
            const { width, height } = this.canvas.getBoundingClientRect();
            this.canvas.width = width * 2;
            this.canvas.height = height * 2;
        };
        this.render = () => {
            this.renderer.render();
            requestAnimationFrame(this.render);
        };
        this.start = () => {
            this.render();
        };
        this.wxLogin = (code, userInfo) => {
            wxLogin$2(code, userInfo).then((res) => {
                const wxplayer = res.data.data.player;
                playerStore.name = wxplayer.name;
                playerStore.avatarUrl = wxplayer.avatarUrl;
                playerStore.language = wxplayer.language;
                playerStore.token = res.data.data.token;
            }).catch(err => {
                console.log(err);
            });
        };
        this.setRenderer = (rendererFactory) => {
            this.renderer = rendererFactory(this.canvas);
            setRouterProps({
                effectComposer: this.renderer.composer,
                renderPass: this.renderer.renderPass,
            });
            setUIActionControls({
                canvas: this.canvas,
                camera: this.renderer.camera,
            });
        };
    }
    get currentRenderer() {
        return this.renderer?.name;
    }
}
const gameInstance = new GameInstance();
const InitGame$1 = gameInstance.InitGame;
const start$1 = gameInstance.start;
const wxLogin$1 = gameInstance.wxLogin;
gameInstance.setRenderer;
gameInstance.currentRenderer;

const InitGame = InitGame$1;
const start = start$1;
const wxLogin = wxLogin$1;

exports.InitGame = InitGame;
exports.start = start;
exports.wxLogin = wxLogin;
//# sourceMappingURL=main.js.map
