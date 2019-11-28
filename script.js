// @ts-check
/**
 * @type {HTMLCanvasElement}
 */
const canvasUser = document.getElementById('canvas');
canvasUser.width = 720;
const ctxUser = canvasUser.getContext('2d');

/**
 * @type {HTMLCanvasElement}
 */
const canvasAlgo = document.getElementById('algo');
const ctxAlgo = canvasAlgo.getContext('2d');

/**
 * @type {HTMLInputElement}
 */
const targetSizeInput = document.getElementById('target-size');
/**
 * @type {HTMLInputElement}
 */
const thresholdInput = document.getElementById('threshold');
/**
 * @type {HTMLInputElement}
 */
const opacityInput = document.getElementById('opacity');

const img = new Image();

function draw() {
    canvasAlgo.width = +targetSizeInput.value;
    const ratio = img.height / img.width;
    canvasUser.height = ratio * canvasUser.width;
    canvasAlgo.height = ratio * canvasAlgo.width;

    ctxAlgo.imageSmoothingEnabled = false;
    ctxUser.drawImage(img, 0, 0, canvasUser.width, canvasUser.height);
    ctxUser.imageSmoothingEnabled = false;
    ctxAlgo.drawImage(img, 0, 0, canvasAlgo.width, canvasAlgo.height);
}
img.onload = draw

function handleImage(input) {
    const reader = new FileReader();
    reader.onload = function (event) {
        img.src = event.target.result;
    }
    reader.readAsDataURL(input.files[0]);
}

function thresh() {
    draw();

    const t = +thresholdInput.value;
    const imgData = ctxAlgo.getImageData(0, 0, canvasAlgo.width, canvasAlgo.height);
    const pixels = imgData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = avg > t ? 255 : 0;
    }

    ctxAlgo.imageSmoothingEnabled = false;
    ctxAlgo.putImageData(imgData, 0, 0);
    ctxUser.imageSmoothingEnabled = false;
    ctxUser.drawImage(canvasAlgo, 0, 0, canvasUser.width, canvasUser.height);
}

const allColors = [
    '#f7867e',
    '#ffa000',
    '#82677E',
    '#2C577C',
    '#6D838A',
    '#00a0a0',
    '#355dff',
    '#7790ff',
    '#9B5656',
    '#CC9393',
    '#993D5F'
];

/**
 * 
 * @param {Int32Array} matching 
 */
function dominoes(matching) {
    const width = canvasAlgo.width;
    const height = canvasAlgo.height;

    const colors = new Uint8Array(width * height);
    for (let i = 0; i < matching.length; i += 2) {
        const node1 = matching[i];
        const node2 = matching[i + 1];

        const n1 = colors[node1 - 1];
        const n2 = colors[node1 + 1];
        const n3 = colors[node1 - width];
        const n4 = colors[node1 + width];
        const n5 = colors[node2 - 1];
        const n6 = colors[node2 + 1];
        const n7 = colors[node2 - width];
        const n8 = colors[node2 + width];

        let j = 1;
        while (n1 === j || n2 === j || n3 === j || n4 === j || n5 === j || n6 === j || n7 === j || n8 === j) j++;
        colors[node1] = colors[node2] = j;
    }

    const opacity = +opacityInput.value;
    const temp = new DataView(new ArrayBuffer(allColors.length * 4));
    for (let i = 0; i < allColors.length; i++) {
        const color = allColors[i];
        temp.setUint32(i * 4, (parseInt(color.substring(1), 16) << 8) | opacity, true);
    }

    const imgData = ctxAlgo.getImageData(0, 0, canvasAlgo.width, canvasAlgo.height);
    const int32view = new Uint32Array(imgData.data.buffer);
    for (let i = 0; i < colors.length; i++) {
        const c = colors[i];
        if (c) {
            int32view[i] = temp.getUint32((c - 1) * 4); // get in reverse byte order
        }
    }

    ctxAlgo.imageSmoothingEnabled = false;
    ctxAlgo.putImageData(imgData, 0, 0);
    ctxUser.imageSmoothingEnabled = false;
    ctxUser.drawImage(canvasAlgo, 0, 0, canvasUser.width, canvasUser.height);
}

function test() {
    dominoes([1, 2, 3, 4, 5, 6, 7, 8]);
}