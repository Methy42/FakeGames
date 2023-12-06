import { ImageButton } from "../../../objects/Buttons/Image";

export interface IDragSceneObjectData {
    name: string;
    size: {
        width?: number;
        height?: number;
        scaling?: number;
    }
    checkPosition: {
        x: number;
        y: number;
    } | ((canvas: HTMLCanvasElement, thisImage: ImageButton, scene: THREE.Scene) => { x: number; y: number; }),
    currentPosition: {
        x: number;
        y: number;
    };
    image?: string;
    AnimationFramesCount?: number;
    AnimationFramesDir?: string;
    AnimationDuration?: number;
    isFinish?: boolean;
};

export interface IDragSceneData {
    backgroundImage: string;
    objects: IDragSceneObjectData[];
    totalTimes?: number;
    currentTimes?: number;
}

export const LiveRoomSceneData: IDragSceneData = {
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

            if ((window as any).safeArea) {
                x = -canvas.width / 2 + (window as any).safeArea.left * 2 + thisImage.width / 2
            }

            return {
                x,
                y: -canvas.height / 2 + thisImage.height / 2
            }
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
            const tiziImage = scene.children.find((child) => child.name === "Tizi") as ImageButton;
            const chuanghuImage = scene.children.find((child) => child.name === "Chuanghu") as ImageButton;
            let x = -canvas.width / 2 + thisImage.width / 2;

            if ((window as any).safeArea) {
                x = -canvas.width / 2 + (window as any).safeArea.left * 2 + thisImage.width / 2;
            }

            x += (chuanghuImage.width / 2 * 3 + tiziImage.width);

            return {
                x,
                y: -10
            }
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
            const chuanghuImage = scene.children.find((child) => child.name === "Chuanghu") as ImageButton;
            const guizi2Image = scene.children.find((child) => child.name === "Guizi2") as ImageButton;
            let x = -canvas.width / 2 + thisImage.width / 2;

            if ((window as any).safeArea) {
                x = -canvas.width / 2 + (window as any).safeArea.left * 2 + thisImage.width / 2;
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
            const chuanghuImage = scene.children.find((child) => child.name === "Chuanghu") as ImageButton;
            const tiziImage = scene.children.find((child) => child.name === "Tizi") as ImageButton;

            let x = -canvas.width / 2 + thisImage.width / 2

            if ((window as any).safeArea) {
                x = -canvas.width / 2 + (window as any).safeArea.left * 2 + thisImage.width / 2
            }

            x += chuanghuImage.width / 2 * 3 + tiziImage.width + 10

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
            const chuanghuImage = scene.children.find((child) => child.name === "Chuanghu") as ImageButton;
            const diannaoImage = scene.children.find((child) => child.name === "Diannao") as ImageButton;
            let x = -canvas.width / 2 + thisImage.width / 2;

            if ((window as any).safeArea) {
                x = -canvas.width / 2 + (window as any).safeArea.left * 2 + thisImage.width / 2;
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
            const chuanghuImage = scene.children.find((child) => child.name === "Chuanghu") as ImageButton;
            let x = -canvas.width / 2 + thisImage.width / 2;

            if ((window as any).safeArea) {
                x = -canvas.width / 2 + (window as any).safeArea.left * 2 + thisImage.width / 2;
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
            let x = -canvas.width / 2 + thisImage.width / 2

            if ((window as any).safeArea) {
                x = -canvas.width / 2 + (window as any).safeArea.left * 2 + thisImage.width / 2
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
            const guiziImage = scene.children.find((child) => child.name === "Guizi") as ImageButton;
            const chuanghuImage = scene.children.find((child) => child.name === "Chuanghu") as ImageButton;
            const tiziImage = scene.children.find((child) => child.name === "Tizi") as ImageButton;

            let x = -canvas.width / 2 + guiziImage.width / 2;

            if ((window as any).safeArea) {
                x = -canvas.width / 2 + (window as any).safeArea.left * 2 + guiziImage.width / 2;
            }

            x += chuanghuImage.width / 2 * 3 + tiziImage.width - thisImage.width / 2 + 10

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