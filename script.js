// @ts-check

const _allColors = [
    '#f7867e',
    '#82677E',
    '#2C577C',
    '#00a0a0',
    '#355dff',
    '#7790ff'
];

const allColors = _allColors.map(x => (parseInt(x.substring(1), 16) << 8) | 255);

const defaultColors = _allColors.concat();

window.onload = () => {
    const colors = document.getElementById('colors');
    for (let i = 0; i < 6; i++) {
        const div = document.createElement('div');
        colors.appendChild(div);

        // Simple example, see optional options for more configuration.
        const pickr = Pickr.create({
            el: div,
            theme: 'nano', // or 'monolith', or 'nano'
            appClass: 'pkr-dis',
            swatches: defaultColors,
            default: defaultColors[i],
            components: {

                // Main components
                preview: true,
                opacity: true,
                hue: true,

                // Input / output Options
                interaction: {
                    hex: true,
                    rgba: true,
                    hsla: true,
                    hsva: true,
                    cmyk: true,
                    input: true,
                    save: true
                }
            }
        });
        pickr.on('save', (color, instance) => {
            const temp = color.toRGBA();
            allColors[i] = (temp[0] << 24) | (temp[1] << 16) | (temp[2] << 8) | (temp[3] * 255); 
            instance.hide();
        });
    }
}
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
const targetWidthInput = document.getElementById('target-width');
/**
 * @type {HTMLInputElement}
 */
const targetHeightInput = document.getElementById('target-height');
/**
 * @type {HTMLInputElement}
 */
const thresholdInput = document.getElementById('threshold');
/**
 * @type {HTMLInputElement}
 */
const keepAspectRatio = document.getElementById('keep-ratio');

const img = new Image();

targetWidthInput.onchange = function () {
    if (keepAspectRatio.checked) {
        targetHeightInput.value = (img.height / img.width * +targetWidthInput.value).toString();
    }
}

targetHeightInput.onchange = function () {
    if (keepAspectRatio.checked) {
        targetWidthInput.value = (img.width / img.height * +targetHeightInput.value).toString();
    }
}

function fixWH() {
    let w = +targetWidthInput.value, h = +targetHeightInput.value;
    const ratio = img.width / img.height;
    const temp = keepAspectRatio.checked;
    keepAspectRatio.checked = false;
    if (!w && !h) {
        w = img.width;
        h = img.height;
    } else if (!h) {
        h = w / ratio;
    } else if (!w) {
        w = h * ratio;
    }
    targetHeightInput.value = h.toFixed(0);
    targetWidthInput.value = w.toFixed(0);
    keepAspectRatio.checked = temp;
    return [w, h];
}

function draw() {
    const [w, h] = fixWH();
    const ratio = h / w;
    canvasAlgo.width = w;
    canvasAlgo.height = h;
    canvasUser.height = ratio * canvasUser.width;

    ctxAlgo.imageSmoothingEnabled = false;
    ctxAlgo.clearRect(0, 0, canvasUser.width, canvasUser.height);
    ctxAlgo.drawImage(img, 0, 0, canvasAlgo.width, canvasAlgo.height);

    ctxUser.imageSmoothingEnabled = false;
    ctxUser.clearRect(0, 0, canvasUser.width, canvasUser.height);
    ctxUser.drawImage(img, 0, 0, canvasUser.width, canvasUser.height);
}

img.onload = draw;

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

/**
 * @param {number[][]} matching 
 */
function dominoes(matching) {
    const width = canvasAlgo.width;
    const height = canvasAlgo.height;

    const colors = new Uint8Array(width * height);
    for (const [node1, node2] of matching) {

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

    const temp = new DataView(new ArrayBuffer(allColors.length * 4));
    for (let i = 0; i < allColors.length; i++) {
        temp.setUint32(i * 4, allColors[i], true);
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

function drawTiling() {
    thresh();

    const imgData = ctxAlgo.getImageData(0, 0, canvasAlgo.width, canvasAlgo.height);
    const pixels = imgData.data;

    const edges = [];
    const r = canvasAlgo.height, c = canvasAlgo.width;
    let a = 0, b = 0;
    const labelMap = new Int32Array(r * c).fill(-1);
    const revMap1 = [];
    const revMap2 = [];
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            const current = i * c + j;
            if (pixels[current << 2] === 0 && pixels[(current << 2) + 3] !== 0) {
                const temp = (i & 1) ^ (j & 1);
                if (temp) {
                    labelMap[current] = a++;
                    revMap1.push(current);
                } else {
                    2
                    labelMap[current] = b++;
                    revMap2.push(current);
                }
            }
        }
    }
    for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
            const current = i * c + j;
            const currentLabel = labelMap[current];
            if ((i & 1) ^ (j & 1) && currentLabel !== -1) {
                if (j > 0 && labelMap[current - 1] !== -1) {
                    edges.push([currentLabel, labelMap[current - 1]]);
                }
                if (j < c - 1 && labelMap[current + 1] !== -1) {
                    edges.push([currentLabel, labelMap[current + 1]]);
                }
                if (i > 0 && labelMap[current - c] !== -1) {
                    edges.push([currentLabel, labelMap[current - c]]);
                }
                if (i < r - 1 && labelMap[current + c] !== -1) {
                    edges.push([currentLabel, labelMap[current + c]]);
                }
            }
        }
    }
    const result = bipartiteMatching(a, b, edges);
    dominoes(result.map(([x1, x2]) => [revMap1[x1], revMap2[x2]]));
}