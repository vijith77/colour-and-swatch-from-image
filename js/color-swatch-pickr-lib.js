// DOM Elements
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

// State
let selectionEnabled = false;
let colorPickerEnabled = false;
let activeSwatchIndex = null;
const originalColors = Array.from(swatchColors).map(color => color.style.backgroundColor);

// Event Listeners
swatchColors.forEach(color => {
    color.addEventListener('click', handleSwatchClick);
});

toggleSelectionBtn.addEventListener('click', toggleSelection);
toggleColorPickerBtn.addEventListener('click', toggleColorPicker);
saveSwatchBtn.addEventListener('click', saveSwatchAsImage);
imageContainer.addEventListener('mousemove', updateSelectionBox);
imageContainer.addEventListener('click', handleImageClick);
document.addEventListener('click', handleDocumentClick);

// Functions
function handleSwatchClick(e) {
    e.stopPropagation();
    
    if (selectionEnabled) toggleSelection();
    if (colorPickerEnabled) toggleColorPicker();
    
    const clickedIndex = parseInt(e.target.dataset.index);
    if (activeSwatchIndex === clickedIndex) {
        e.target.classList.remove('active');
        activeSwatchIndex = null;
        imageContainer.style.cursor = 'default';
        return;
    }
    
    swatchColors.forEach(color => color.classList.remove('active'));
    e.target.classList.add('active');
    activeSwatchIndex = clickedIndex;
    
    imageContainer.style.cursor = 'none';
    setTimeout(() => {
        imageContainer.style.cursor = 'url("/images/Color-Dropper.png") 0 24, crosshair';
    }, 50);
    
    toggleSelectionBtn.classList.remove('mode-active');
    toggleColorPickerBtn.classList.remove('mode-active');
}

function handleDocumentClick(e) {
    if (!e.target.closest('.swatch-color') && !e.target.closest('#imageContainer') && activeSwatchIndex !== null) {
        swatchColors[activeSwatchIndex].classList.remove('active');
        activeSwatchIndex = null;
        imageContainer.style.cursor = 'default';
    }
}

function toggleSelection() {
    if (activeSwatchIndex !== null) {
        swatchColors[activeSwatchIndex].classList.remove('active');
        activeSwatchIndex = null;
        imageContainer.style.cursor = 'default';
    }
    
    if (colorPickerEnabled) toggleColorPicker();
    
    selectionEnabled = !selectionEnabled;
    
    if (selectionEnabled) {
        selectionBox.style.display = 'block';
        toggleSelectionBtn.textContent = 'Disable Selection';
        toggleSelectionBtn.classList.add('mode-active');
        toggleColorPickerBtn.textContent = 'Enable Color Picker';
        toggleColorPickerBtn.classList.remove('mode-active');
        imageContainer.style.cursor = 'crosshair';
    } else {
        selectionBox.style.display = 'none';
        toggleSelectionBtn.textContent = 'Enable Selection';
        toggleSelectionBtn.classList.remove('mode-active');
        imageContainer.style.cursor = 'default';
    }
}

function toggleColorPicker() {
    if (activeSwatchIndex !== null) {
        swatchColors[activeSwatchIndex].classList.remove('active');
        activeSwatchIndex = null;
        imageContainer.style.cursor = 'default';
    }
    
    if (selectionEnabled) toggleSelection();
    
    colorPickerEnabled = !colorPickerEnabled;
    
    if (colorPickerEnabled) {
        toggleColorPickerBtn.textContent = 'Disable Color Picker';
        toggleColorPickerBtn.classList.add('mode-active');
        toggleSelectionBtn.textContent = 'Enable Selection';
        toggleSelectionBtn.classList.remove('mode-active');
        imageContainer.style.cursor = 'none';
        setTimeout(() => {
            imageContainer.style.cursor = 'url("/images/Color-Dropper.png") 0 24, crosshair';
        }, 50);
    } else {
        toggleColorPickerBtn.textContent = 'Enable Color Picker';
        toggleColorPickerBtn.classList.remove('mode-active');
        imageContainer.style.cursor = 'default';
    }
}

function updateSelectionBox(e) {
    if (!selectionEnabled) return;
    
    const rect = image.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        selectionBox.style.left = `${x}px`;
        selectionBox.style.top = `${y}px`;
    }
}

function handleImageClick(e) {
    const rect = image.getBoundingClientRect();
    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (selectionEnabled) {
        saveSelectedArea(x, y);
    } 
    else if (colorPickerEnabled) {
        pickColor(x, y);
    }
    else if (activeSwatchIndex !== null) {
        const color = getColorAtPosition(x, y);
        swatchColors[activeSwatchIndex].style.backgroundColor = color;
    }
}

function saveSelectedArea(x, y) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 50;
    
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(image, x - size/2, y - size/2, size, size, 0, 0, size, size);
    
    const img = new Image();
    img.src = canvas.toDataURL();
    img.classList.add('selected-area');
    selectedAreas.appendChild(img);
}

function pickColor(x, y) {
    const color = getColorAtPosition(x, y);
    
    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = color;
    selectedColors.appendChild(colorBox);
}

function getColorAtPosition(x, y) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);
    
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
}

function saveSwatchAsImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 48;
    canvas.height = 32;
    const colorWidth = canvas.width / swatchColors.length;
    
    swatchColors.forEach((color, i) => {
        ctx.fillStyle = color.style.backgroundColor;
        ctx.fillRect(i * colorWidth, 0, colorWidth, canvas.height);
    });
    
    savedSwatchImg.src = canvas.toDataURL();
    savedSwatch.style.display = 'block';
}
