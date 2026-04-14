// =========================
// DOM ELEMENTS
// =========================
const imageContainer = document.getElementById('imageContainer');
const image = document.getElementById('image');
const selectionBox = document.getElementById('selectionBox');

const toggleSelectionBtn = document.getElementById('toggleSelection');
const toggleColorPickerBtn = document.getElementById('toggleColorPicker');

const swatchColors = document.querySelectorAll('.swatch-color');
const saveSwatchBtn = document.getElementById('saveSwatchBtn');
const savedSwatch = document.getElementById('savedSwatch');
const savedSwatchImg = document.getElementById('savedSwatchImg');

const selectedAreas = document.getElementById('selectedAreas');
const selectedColors = document.getElementById('selectedColors');

// =========================
// STATE
// =========================
let selectionEnabled = false;
let colorPickerEnabled = false;
let activeSwatchIndex = null;

// =========================
// DELETE WRAPPER HELPER
// =========================
function makeDeletable(element) {
    const wrapper = document.createElement('div');
    wrapper.className = 'deletable-item';

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '×';

    del.onclick = (e) => {
        e.stopPropagation();
        wrapper.remove();
    };

    wrapper.appendChild(element);
    wrapper.appendChild(del);
    return wrapper;
}

// =========================
// SWATCH CLICK
// =========================
swatchColors.forEach(color => {
    color.addEventListener('click', e => {
        e.stopPropagation();

        if (activeSwatchIndex === +color.dataset.index) {
            color.classList.remove('active');
            activeSwatchIndex = null;
            imageContainer.classList.remove('swatch-active');
            return;
        }

        swatchColors.forEach(c => c.classList.remove('active'));
        color.classList.add('active');
        activeSwatchIndex = +color.dataset.index;

        disableModes();
        imageContainer.classList.add('swatch-active');
    });
});

// =========================
// BUTTONS
// =========================
toggleSelectionBtn.onclick = () => {
    disableModes();
    selectionEnabled = !selectionEnabled;

    selectionBox.style.display = selectionEnabled ? 'block' : 'none';
    toggleSelectionBtn.classList.toggle('mode-active', selectionEnabled);
};

toggleColorPickerBtn.onclick = () => {
    disableModes();
    colorPickerEnabled = !colorPickerEnabled;

    toggleColorPickerBtn.classList.toggle('mode-active', colorPickerEnabled);
    imageContainer.classList.toggle('color-picker-cursor', colorPickerEnabled);
};

function disableModes() {
    selectionEnabled = false;
    colorPickerEnabled = false;

    selectionBox.style.display = 'none';
    toggleSelectionBtn.classList.remove('mode-active');
    toggleColorPickerBtn.classList.remove('mode-active');
    imageContainer.classList.remove('color-picker-cursor');
}

// =========================
// IMAGE EVENTS
// =========================
imageContainer.addEventListener('mousemove', e => {
    if (!selectionEnabled) return;

    const rect = image.getBoundingClientRect();
    selectionBox.style.left = `${e.clientX - rect.left}px`;
    selectionBox.style.top = `${e.clientY - rect.top}px`;
});

imageContainer.addEventListener('click', e => {
    const rect = image.getBoundingClientRect();
    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (selectionEnabled) saveSelectedArea(x, y);
    else if (colorPickerEnabled) pickColor(x, y);
    else if (activeSwatchIndex !== null) {
        swatchColors[activeSwatchIndex].style.backgroundColor = getPixelColor(x, y);
    }
});

// =========================
// SAVE SELECTED AREA
// =========================
function saveSelectedArea(x, y) {
    const size = 50;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;

    canvas.getContext('2d').drawImage(
        image,
        x - size / 2, y - size / 2, size, size,
        0, 0, size, size
    );

    const img = new Image();
    img.src = canvas.toDataURL();
    img.className = 'selected-area';

    selectedAreas.appendChild(makeDeletable(img));
}

// =========================
// PICK COLOR
// =========================
function pickColor(x, y) {
    const color = getPixelColor(x, y);

    const box = document.createElement('div');
    box.className = 'color-box';
    box.style.backgroundColor = color;

    selectedColors.appendChild(makeDeletable(box));
}

// =========================
// GET PIXEL COLOR
// =========================
function getPixelColor(x, y) {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
}

// =========================
// SAVE SWATCH AS IMAGE
// =========================
saveSwatchBtn.onclick = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 32;

    const ctx = canvas.getContext('2d');
    const w = canvas.width / swatchColors.length;

    swatchColors.forEach((c, i) => {
        ctx.fillStyle = c.style.backgroundColor;
        ctx.fillRect(i * w, 0, w, canvas.height);
    });

    savedSwatchImg.src = canvas.toDataURL();
    savedSwatch.style.display = 'block';

    const wrapper = makeDeletable(savedSwatchImg.cloneNode());
    savedSwatch.innerHTML = '';
    savedSwatch.appendChild(wrapper);
};
