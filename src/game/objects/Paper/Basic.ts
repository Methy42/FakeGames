// import * as THREE from 'three';

// export class BasicPaper extends THREE.Mesh {
//     constructor() {
//         super();

//         this.dragging = false;

//         // 监听鼠标按下事件
//         this.addEventListener('mousedown', (event) => {
//             this.dragging = true;
//         });

//         // 监听鼠标松开事件
//         this.addEventListener('mouseup', (event) => {
//             this.dragging = false;
//         });

//         // 监听鼠标移动事件
//         this.addEventListener('mousemove', (event) => {
//             if (this.dragging) {
//                 // 计算鼠标移动的距离
//                 const deltaX = event.movementX;
//                 const deltaY = event.movementY;

//                 // 计算翻页的角度
//                 const angle = Math.atan2(deltaY, deltaX);

//                 // 计算翻页的卷曲程度
//                 const curl = Math.min(Math.max(deltaX / 10, -1), 1);

//                 // 将纸张旋转到该角度
//                 this.rotation.z += angle;

//                 // 将纸张卷曲
//                 const vertices = this.geometry.vertices;
//                 const numVertices = vertices.length;
//                 for (let i = 0; i < numVertices; i++) {
//                     const vertex = vertices[i];
//                     const distance = vertex.distanceTo(new THREE.Vector3(0, 0, 0));
//                     const curlAmount = Math.pow(distance / 10, 2) * curl;
//                     const curlVector = new THREE.Vector3(-vertex.y, vertex.x, 0).normalize().multiplyScalar(curlAmount);
//                     vertex.add(curlVector);
//                 }
//                 this.geometry.verticesNeedUpdate = true;
//             }
//         });
//     }
// }
