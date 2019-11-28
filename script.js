/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// canvas.getContext('2d').getImageData();

function handleImage(input) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(input.files[0]);
}
