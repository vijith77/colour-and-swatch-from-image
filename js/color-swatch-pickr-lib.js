// =======================
// DOM ELEMENTS
// =======================
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

// =======================
// STATE
// =======================
let selectionEnabled = false;
let colorPickerEnabled = false;
let activeSwatchIndex = null;

// =======================
// EVENT LISTENERS
// =======================
swatchColors.forEach(c => c.addEventListener('click', handleSwatchClick));
toggleSelectionBtn.addEventListener('click', toggleSelection);
toggleColorPickerBtn.addEventListener('click', toggleColorPicker);
saveSwatchBtn.addEventListener('click', saveSwatchAsImage);
imageContainer.addEventListener('mousemove', updateSelectionBox);
imageContainer.addEventListener('click', handleImageClick);
document.addEventListener('click', handleDocumentClick);

// =======================
// CURSOR CONTROLLER (FIX)
// =======================
function updateCursor() {
    if (selectionEnabled) {
        imageContainer.style.cursor = 'crosshair'; // ➕ texture selection
        return;
    }

    if (colorPickerEnabled || activeSwatchIndex !== null) {
        imageContainer.style.cursor =
            'url("images/color-dropper.png") 0 24, crosshair';
        return;
    }

    imageContainer.style.cursor = 'default';
}

// =======================
// DELETE WRAPPER
// =======================
function createDeletableItem(child) {
    const wrapper = document.createElement('div');
    wrapper.className = 'deletable-item';

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.innerHTML = '×';

    del.addEventListener('click', e => {
        e.stopPropagation();
        wrapper.remove();
    });

    wrapper.appendChild(child);
    wrapper.appendChild(del);
    return wrapper;
}

// =======================
// SWATCH CLICK
// =======================
function handleSwatchClick(e) {
    e.stopPropagation();

    if (selectionEnabled) toggleSelection();
    if (colorPickerEnabled) toggleColorPicker();

    const index = +e.target.dataset.index;
    if (activeSwatchIndex === index) {
        swatchColors[index].classList.remove('active');
        activeSwatchIndex = null;
        updateCursor();
        return;
    }

    swatchColors.forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    activeSwatchIndex = index;
    updateCursor();
}

// =======================
// DOCUMENT CLICK (RESET)
// =======================
function handleDocumentClick(e) {
    if (
        !e.target.closest('.swatch-color') &&
        !e.target.closest('#imageContainer') &&
        activeSwatchIndex !== null
    ) {
        swatchColors[activeSwatchIndex].classList.remove('active');
        activeSwatchIndex = null;
        updateCursor();
    }
}

// =======================
// TOGGLE SELECTION (TEXTURE)
// =======================
function toggleSelection() {
    if (activeSwatchIndex !== null) {
        swatchColors[activeSwatchIndex].classList.remove('active');
        activeSwatchIndex = null;
    }
    if (colorPickerEnabled) {
        colorPickerEnabled = false;
        toggleColorPickerBtn.classList.remove('mode-active');
        toggleColorPickerBtn.textContent = 'Enable Color Picker';
    }

    selectionEnabled = !selectionEnabled;
    selectionBox.style.display = selectionEnabled ? 'block' : 'none';
    toggleSelectionBtn.classList.toggle('mode-active', selectionEnabled);
    toggleSelectionBtn.textContent = selectionEnabled
        ? 'Disable Selection'
        : 'Enable Selection';

    updateCursor();
}

// =======================
// TOGGLE COLOR PICKER
// =======================
function toggleColorPicker() {
    if (activeSwatchIndex !== null) {
        swatchColors[activeSwatchIndex].classList.remove('active');
        activeSwatchIndex = null;
    }
    if (selectionEnabled) {
        selectionEnabled = false;
        selectionBox.style.display = 'none';
        toggleSelectionBtn.classList.remove('mode-active');
        toggleSelectionBtn.textContent = 'Enable Selection';
    }

    colorPickerEnabled = !colorPickerEnabled;
    toggleColorPickerBtn.classList.toggle('mode-active', colorPickerEnabled);
    toggleColorPickerBtn.textContent = colorPickerEnabled
        ? 'Disable Color Picker'
        : 'Enable Color Picker';

    updateCursor();
}

// =======================
// SELECTION BOX FOLLOW
// =======================
function updateSelectionBox(e) {
    if (!selectionEnabled) return;

    const rect = image.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        selectionBox.style.left = `${x}px`;
        selectionBox.style.top = `${y}px`;
    }
}

// =======================
// IMAGE CLICK HANDLER
// =======================
function handleImageClick(e) {
    const rect = image.getBoundingClientRect();
    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (selectionEnabled) saveSelectedArea(x, y);
    else if (colorPickerEnabled) pickColor(x, y);
    else if (activeSwatchIndex !== null) {
        swatchColors[activeSwatchIndex].style.backgroundColor =
            getColorAtPosition(x, y);
    }
}

// =======================
// SAVE TEXTURE AREA
// =======================
function saveSelectedArea(x, y) {
    const size = 50;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');

    ctx.drawImage(image, x - size / 2, y - size / 2, size, size, 0, 0, size, size);

    const img = new Image();
    img.src = c.toDataURL();
    img.className = 'selected-area';

    selectedAreas.appendChild(createDeletableItem(img));
}

// =======================
// PICK COLOR
// =======================
function pickColor(x, y) {
    const color = getColorAtPosition(x, y);
    const box = document.createElement('div');
    box.className = 'color-box';
    box.style.backgroundColor = color;

    selectedColors.appendChild(createDeletableItem(box));
}

// =======================
// READ PIXEL COLOR
// =======================
function getColorAtPosition(x, y) {
    const c = document.createElement('canvas');
    c.width = image.naturalWidth;
    c.height = image.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const d = ctx.getImageData(x, y, 1, 1).data;
    return `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
}

// =======================
// SAVE SWATCH IMAGE
// =======================
function saveSwatchAsImage() {
    const c = document.createElement('canvas');
    c.width = 48;
    c.height = 32;
    const ctx = c.getContext('2d');

    const w = c.width / swatchColors.length;
    swatchColors.forEach((s, i) => {
        ctx.fillStyle = s.style.backgroundColor;
        ctx.fillRect(i * w, 0, w, c.height);
    });

    savedSwatch.innerHTML = '';
    savedSwatch.style.display = 'block';

    const img = new Image();
    img.src = c.toDataURL();
    savedSwatch.appendChild(createDeletableItem(img));
}
``
