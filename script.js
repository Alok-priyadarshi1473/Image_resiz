const scene = document.getElementById('scene');
const carousel = document.getElementById('carousel');
const menuBtn = document.getElementById('menu-btn');
const closeMenu = document.getElementById('closeMenu');
const mobileMenu = document.getElementById('mobileMenu');
const uploadBox = document.getElementById('uploadBox');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const uploadPreview = document.getElementById('uploadPreview');
const previewImg = document.getElementById('previewImg');
const removeImg = document.getElementById('removeImg');
const resizeModal = document.getElementById('resizeModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const cancelResize = document.getElementById('cancelResize');
const downloadResized = document.getElementById('downloadResized');
const resizePreviewImg = document.getElementById('resizePreviewImg');
const cropStage = document.getElementById('cropStage');
const cropFrame = document.getElementById('cropFrame');
const cropPresets = document.querySelectorAll('.crop-preset');
const rotateLeft = document.getElementById('rotateLeft');
const rotateRight = document.getElementById('rotateRight');
const rotationValue = document.getElementById('rotationValue');
const targetSizeSlider = document.getElementById('targetSizeSlider');
const targetSizeUnit = document.getElementById('targetSizeUnit');
const targetSizeInput = document.getElementById('targetSizeInput');
const targetSizeValue = document.getElementById('targetSizeValue');
const targetSizeHelp = document.getElementById('targetSizeHelp');
const outputFormat = document.getElementById('outputFormat');
const cropHandles = document.querySelectorAll('.crop-handle');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const accordionBtns = document.querySelectorAll('.accordion-btn');
const feedbackForm = document.getElementById('feedbackForm');
let uploadedImage = null;
let originalWidth = 0;
let originalHeight = 0;
let currentAngle = 0;
let cropRatio = null;
let cropLeft = 0;
let cropTop = 0;
let cropWidth = 0;
let cropHeight = 0;
let cropDragStartX = 0;
let cropDragStartY = 0;
let cropStartLeft = 0;
let cropStartTop = 0;
let cropStartWidth = 0;
let cropStartHeight = 0;
let isDraggingCrop = false;
let isResizingCrop = false;
let activeCropHandle = null;
let rotation = 0;
let pointerStartX = 0;
let pointerStartY = 0;
let isDraggingCarousel = false;
let hasMovedCarousel = false;
function rotateCarousel(direction) {
    currentAngle += direction * 72;
    carousel.style.transform = `rotateY(${currentAngle}deg)`;
}
scene.addEventListener('pointerdown', (event) => {
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    isDraggingCarousel = true;
    hasMovedCarousel = false;
    scene.setPointerCapture(event.pointerId);
    scene.classList.add('is-dragging');
});
scene.addEventListener('pointermove', (event) => {
    if (!isDraggingCarousel) return;
    const horizontalDistance = event.clientX - pointerStartX;
    const verticalDistance = event.clientY - pointerStartY;
    if (Math.abs(horizontalDistance) > 12 || Math.abs(verticalDistance) > 12) {
        hasMovedCarousel = true;
    }
});
scene.addEventListener('pointerup', (event) => {
    if (!isDraggingCarousel) return;
    const horizontalDistance = event.clientX - pointerStartX;
    if (Math.abs(horizontalDistance) >= 30) {
        rotateCarousel(horizontalDistance > 0 ? 1 : -1);
    } else if (!hasMovedCarousel) {
        rotateCarousel(-1);
    }
    isDraggingCarousel = false;
    scene.classList.remove('is-dragging');
    scene.releasePointerCapture(event.pointerId);
});
scene.addEventListener('pointercancel', (event) => {
    isDraggingCarousel = false;
    scene.classList.remove('is-dragging');
    scene.releasePointerCapture(event.pointerId);
});
menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('active');
    document.body.style.overflow = isOpen ? 'hidden' : '';
});
closeMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
});
mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});
uploadBox.addEventListener('click', () => {
    if (!uploadedImage) fileInput.click();
});
uploadBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!uploadedImage) fileInput.click();
});
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => 
    uploadBox.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (eventName === 'dragenter' || eventName === 'dragover') {
            uploadBox.classList.add('dragover');
        }
        if (eventName === 'dragleave' || eventName === 'drop') {
            uploadBox.classList.remove('dragover');
        }
    })
);
uploadBox.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    } else {
        showToast('Please upload an image file (JPEG, PNG, WebP)', 'error');
    }
});
function handleFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showToast('File must be JPEG, JPG, PNG or WebP', 'error');
        return;
    }
    const MAX_SIZE = 40 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        showToast('File must be less than 40MB', 'error');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage = new Image();
        uploadedImage.onload = () => {
            originalWidth = uploadedImage.width;
            originalHeight = uploadedImage.height;
            previewImg.src = e.target.result;
            uploadPreview.classList.add('active');
            uploadBox.querySelector('.upload-content').style.display = 'none';
            showToast('Image uploaded! Click to resize.');
            setTimeout(() => {
                openResizeModal();
            }, 600);
        };
        uploadedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}


removeImg.addEventListener('click', (e) => {
    e.stopPropagation();
    uploadedImage = null;
    previewImg.src = '';
    uploadPreview.classList.remove('active');
    uploadBox.querySelector('.upload-content').style.display = 'block';
    fileInput.value = '';
    showToast('Image removed');
});


uploadPreview.addEventListener('click', (e) => {
    if (e.target !== removeImg && !removeImg.contains(e.target)) {
        openResizeModal();
    }
});

function openResizeModal() {
    if (!uploadedImage) {
        showToast('Please upload an image first', 'error');
        return;
    }
    resizePreviewImg.src = previewImg.src;
    rotation = 0;
    rotationValue.textContent = '0°';
    resizeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(resetCropFrame);
}


function closeResizeModal() {
    resizeModal.classList.remove('active');
    document.body.style.overflow = '';
}
modalOverlay.addEventListener('click', closeResizeModal);
modalClose.addEventListener('click', closeResizeModal);
cancelResize.addEventListener('click', closeResizeModal);

function resetCropFrame() {
    const stageWidth = cropStage.clientWidth;
    const stageHeight = cropStage.clientHeight;
    cropWidth = stageWidth * 0.8;
    cropHeight = stageHeight * 0.8;
    cropLeft = (stageWidth - cropWidth) / 2;
    cropTop = (stageHeight - cropHeight) / 2;
    applyCropRatio();
    updateCropFrame();
}

function applyCropRatio() {
    if (!cropRatio) return;
    const stageWidth = cropStage.clientWidth;
    const stageHeight = cropStage.clientHeight;
    if (cropWidth / cropHeight > cropRatio) {
        cropWidth = cropHeight * cropRatio;
    } else {
        cropHeight = cropWidth / cropRatio;
    }
    cropWidth = Math.min(cropWidth, stageWidth);
    cropHeight = Math.min(cropHeight, stageHeight);
    cropLeft = Math.max(0, (stageWidth - cropWidth) / 2);
    cropTop = Math.max(0, (stageHeight - cropHeight) / 2);
}

function updateCropFrame() {
    cropFrame.style.left = `${cropLeft}px`;
    cropFrame.style.top = `${cropTop}px`;
    cropFrame.style.width = `${cropWidth}px`;
    cropFrame.style.height = `${cropHeight}px`;
}

cropPresets.forEach(button => button.addEventListener('click', () => {
    cropRatio = button.dataset.ratio === 'free' ? null : parseFloat(button.dataset.ratio);
    cropPresets.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    applyCropRatio();
    updateCropFrame();
}));

cropFrame.addEventListener('pointerdown', event => {
    if (event.target.classList.contains('crop-handle')) return;
    isDraggingCrop = true;
    cropDragStartX = event.clientX;
    cropDragStartY = event.clientY;
    cropStartLeft = cropLeft;
    cropStartTop = cropTop;
    cropFrame.setPointerCapture(event.pointerId);
});

cropHandles.forEach(handle => handle.addEventListener('pointerdown', event => {
    event.stopPropagation();
    isResizingCrop = true;
    activeCropHandle = handle.className;
    cropDragStartX = event.clientX;
    cropDragStartY = event.clientY;
    cropStartLeft = cropLeft;
    cropStartTop = cropTop;
    cropStartWidth = cropWidth;
    cropStartHeight = cropHeight;
    cropFrame.setPointerCapture(event.pointerId);
}));

cropFrame.addEventListener('pointermove', event => {
    if (isResizingCrop) {
        const dx = event.clientX - cropDragStartX;
        const dy = event.clientY - cropDragStartY;
        const minSize = 40;
        let nextLeft = cropStartLeft;
        let nextTop = cropStartTop;
        let nextWidth = cropWidth;
        let nextHeight = cropHeight;
        if (activeCropHandle.includes('right')) nextWidth = Math.max(minSize, Math.min(cropStage.clientWidth - cropStartLeft, cropStartWidth + dx));
        if (activeCropHandle.includes('left')) {
            nextLeft = Math.max(0, Math.min(cropStartLeft + cropStartWidth - minSize, cropStartLeft + dx));
            nextWidth = cropStartWidth + cropStartLeft - nextLeft;
        }
        if (activeCropHandle.includes('bottom')) nextHeight = Math.max(minSize, Math.min(cropStage.clientHeight - cropStartTop, cropStartHeight + dy));
        if (activeCropHandle.includes('top')) {
            nextTop = Math.max(0, Math.min(cropStartTop + cropStartHeight - minSize, cropStartTop + dy));
            nextHeight = cropStartHeight + cropStartTop - nextTop;
        }
        cropLeft = nextLeft;
        cropTop = nextTop;
        cropWidth = nextWidth;
        cropHeight = nextHeight;
        updateCropFrame();
        return;
    }
    if (!isDraggingCrop) return;
    cropLeft = Math.max(0, Math.min(cropStage.clientWidth - cropWidth, cropStartLeft + event.clientX - cropDragStartX));
    cropTop = Math.max(0, Math.min(cropStage.clientHeight - cropHeight, cropStartTop + event.clientY - cropDragStartY));
    updateCropFrame();
});

cropFrame.addEventListener('pointerup', event => {
    isDraggingCrop = false;
    isResizingCrop = false;
    activeCropHandle = null;
    cropFrame.releasePointerCapture(event.pointerId);
});
function syncTargetSize(source = 'slider') {
    let size = parseInt(targetSizeSlider.value, 10);

    if (source === 'input') {
        size = parseInt(targetSizeInput.value, 10);
        if (isNaN(size) || size < 1) size = 1;
        if (size > 4096) size = 4096;
        targetSizeSlider.value = size;
        targetSizeInput.value = size;
    } else if (source === 'slider') {
        targetSizeInput.value = size
    }

    const unitText = targetSizeUnit.options[targetSizeUnit.selectedIndex].text;
    targetSizeValue.textContent = `${size} ${unitText}`;
    targetSizeHelp.textContent = 'Slide ya type karke file size choose karo';
}
targetSizeSlider.addEventListener('input', () => syncTargetSize('slider'));
targetSizeInput.addEventListener('input', () => syncTargetSize('input'));
targetSizeInput.addEventListener('blur', () => syncTargetSize('input'));
targetSizeUnit.addEventListener('change', () => syncTargetSize('slider'));
targetSizeInput.addEventListener('focus', () => {
    targetSizeInput.select();
});
syncTargetSize('slider');
function updateRotation() {
    resizePreviewImg.style.transform = `rotate(${rotation}deg)`;
    rotationValue.textContent = `${rotation}°`;
}

rotateLeft.addEventListener('click', () => {
    rotation = (rotation + 270) % 360;
    updateRotation();
});

rotateRight.addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    updateRotation();
});

downloadResized.addEventListener('click', () => {
    if (!uploadedImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scaleX = originalWidth / cropStage.clientWidth;
    const scaleY = originalHeight / cropStage.clientHeight;
    const sourceWidth = Math.max(1, Math.round(cropWidth * scaleX));
    const sourceHeight = Math.max(1, Math.round(cropHeight * scaleY));
    const sourceX = Math.round(cropLeft * scaleX);
    const sourceY = Math.round(cropTop * scaleY);
    const rotated = rotation % 180 !== 0;
    const outputWidth = sourceWidth;
    const outputHeight = sourceHeight;
    canvas.width = rotated ? outputHeight : outputWidth;
    canvas.height = rotated ? outputWidth : outputHeight;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(uploadedImage, sourceX, sourceY, sourceWidth, sourceHeight, -outputWidth / 2, -outputHeight / 2, outputWidth, outputHeight);
   const targetBytes = Math.round(
    parseInt(targetSizeSlider.value, 10) * parseInt(targetSizeUnit.value, 10)
);
    exportToTargetSize(canvas, targetBytes, outputFormat.value, (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cropped-image.${blob.type.split('/')[1]}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Cropped image downloaded successfully!');
        closeResizeModal();
    });
});
function exportToTargetSize(canvas, targetBytes, mimeType, callback) {
    const safeCallback = (blob) => {
        if (!blob) {
            canvas.toBlob((fallback) => {
                callback(fallback);
            }, 'image/jpeg', 0.5);
            return;
        }
        callback(blob);
    };
    if (!targetBytes) {
        canvas.toBlob(safeCallback, mimeType, 0.92);
        return;
    }
    if (mimeType === 'image/png' || mimeType === 'image/bmp') {
        canvas.toBlob(safeCallback, mimeType);
        return;
    }
    canvas.toBlob((midBlob) => {
        if (!midBlob) {
            safeCallback(null);
            return;
        }
        if (midBlob.size <= targetBytes) {
            canvas.toBlob((highBlob) => {
                if (highBlob && highBlob.size <= targetBytes) {
                    safeCallback(highBlob);
                } else {
                    safeCallback(midBlob);
                }
            }, mimeType, 0.8);
        } else {
            canvas.toBlob((lowBlob) => {
                if (lowBlob && lowBlob.size <= targetBytes) {
                    safeCallback(lowBlob);
                } else {
                    shrinkDimensionsFast(canvas, targetBytes, mimeType, safeCallback);
                }
            }, mimeType, 0.25);
        }
    }, mimeType, 0.5);
}
function shrinkDimensionsFast(originalCanvas, targetBytes, mimeType, callback) {
    const scales = [0.7, 0.5, 0.35, 0.25, 0.15];
    let index = 0;
    const attempt = () => {
        if (index >= scales.length) {
            originalCanvas.toBlob((fallback) => {
                callback(fallback || null);
            }, 'image/jpeg', 0.3);
            return;
        }
        const scale = scales[index];
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = Math.max(1, Math.round(originalCanvas.width * scale));
        tempCanvas.height = Math.max(1, Math.round(originalCanvas.height * scale));
        const tctx = tempCanvas.getContext('2d');
        tctx.imageSmoothingEnabled = true;
        tctx.imageSmoothingQuality = 'high';
        tctx.drawImage(originalCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
        tempCanvas.toBlob((blob) => {
            if (blob && blob.size <= targetBytes) {
                callback(blob);
            } else {
                index++;
                attempt();
            }
        }, mimeType, 0.7);
    };
    attempt();
}
accordionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const content = btn.nextElementSibling;
        const isActive = btn.classList.contains('active');
        accordionBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.accordion-content').forEach(c => 
            c.classList.remove('active')
        );
        if (!isActive) {
            btn.classList.add('active');
            content.classList.add('active');
        }
    });
});

feedbackForm.addEventListener('submit', event => {
    event.preventDefault();
    const feedback = new FormData(feedbackForm).get('feedback').trim();
    const savedFeedback = JSON.parse(localStorage.getItem('imageResizerFeedback') || '[]');
    savedFeedback.push({ feedback, submittedAt: new Date().toISOString() });
    localStorage.setItem('imageResizerFeedback', JSON.stringify(savedFeedback));
    feedbackForm.reset();
    showToast('Thank you for your feedback!');
});

function showToast(message, type = 'success') {
    toastMsg.textContent = message;
    const icon = toast.querySelector('i');
    
    if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = '#ff4444';
    } else {
        icon.className = 'fas fa-check-circle';
        icon.style.color = 'var(--green-check)';
    }
    
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (resizeModal.classList.contains('active')) {
            closeResizeModal();
        }
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);
document.querySelectorAll(
    '.step-card'
).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

window.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    console.log(
        '%c Image Resizer Loaded ',
        'background: linear-gradient(135deg, #7B61FF, #5A3FD1);' +
        'color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold;'
    );
    console.log(
        '%c Features: Upload, Resize, Download, Social Media IDs ',
        'color: #666;'
    );
});
