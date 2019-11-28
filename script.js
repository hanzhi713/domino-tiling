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

const img = new Image();

function draw() {
    canvasAlgo.width = +targetSizeInput.value;
    const ratio = img.height / img.width;
    canvasUser.height = ratio * canvasUser.width;
    canvasAlgo.height = ratio * canvasAlgo.width;
    ctxUser.drawImage(img, 0, 0, canvasUser.width, canvasUser.height);
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

    ctxAlgo.putImageData(imgData, 0, 0);
    ctxUser.imageSmoothingEnabled = false;
    ctxUser.drawImage(canvasAlgo, 0, 0, canvasUser.width, canvasUser.height);
}