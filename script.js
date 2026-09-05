/**
 * ============================================================================
 * IMAGE RESIZER - MAIN JAVASCRIPT FILE
 * ============================================================================
 * 
 * This file contains all interactive functionality for the image resizer app.
 * Organized into logical sections for easy maintenance and understanding.
 * 
 * STRUCTURE:
 * 1. DOM Elements References
 * 2. Global State Variables
 * 3. Carousel Functionality
 * 4. Menu & Navigation
 * 5. File Upload & Validation
 * 6. Image Processing
 * 7. Modal Management
 * 8. Resize Controls
 * 9. Download Functionality
 * 10. Accordion
 * 11. Scroll Effects
 * 12. Notifications
 * 13. Interactions
 * 14. Animations
 * 15. Initialization
 * ============================================================================
 */

// ============================================================================
// 1. DOM ELEMENTS REFERENCES
// ============================================================================
// Carousel elements
const scene = document.getElementById('scene');
const carousel = document.getElementById('carousel');

// Navigation elements
const menuBtn = document.getElementById('menu-btn');
const closeMenu = document.getElementById('closeMenu');
const mobileMenu = document.getElementById('mobileMenu');

// Upload elements
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const uploadPreview = document.getElementById('uploadPreview');
const previewImg = document.getElementById('previewImg');
const removeImg = document.getElementById('removeImg');

// Sticky bar
const stickyBar = document.getElementById('stickyBar');
const stickyUpload = document.getElementById('stickyUpload');

// Modal elements
const resizeModal = document.getElementById('resizeModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const cancelResize = document.getElementById('cancelResize');
const downloadResized = document.getElementById('downloadResized');
const resizePreviewImg = document.getElementById('resizePreviewImg');

// Resize controls
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const qualitySelect = document.getElementById('qualitySelect');
const lockAspect = document.getElementById('lockAspect');

// Notifications & UI
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// Component collections
const accordionBtns = document.querySelectorAll('.accordion-btn');
const presetBtns = document.querySelectorAll('.preset-btn');
const socialCards = document.querySelectorAll('.social-card');

// ============================================================================
// 2. GLOBAL STATE VARIABLES
// ============================================================================
let uploadedImage = null;        // Stores the uploaded image object
let originalWidth = 0;           // Original image width
let originalHeight = 0;          // Original image height
let aspectRatio = 1;             // Image aspect ratio (width/height)
let lastScrollY = window.scrollY; // Track scroll position for sticky bar
let currentAngle = 0;            // Carousel rotation angle

// ============================================================================
// 3. CAROUSEL FUNCTIONALITY
// ============================================================================
/**
 * Rotates the 3D carousel to show the next platform card
 * Each click rotates 72 degrees (360 / 5 cards = 72)
 */
scene.addEventListener('click', () => {
    currentAngle -= 72;
    carousel.style.transform = `rotateY(${currentAngle}deg)`;
});

// ============================================================================
// 4. MENU & NAVIGATION
// ============================================================================
/**
 * Opens the mobile menu
 */
menuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
});

/**
 * Closes the mobile menu
 */
closeMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
});

/**
 * Closes menu when clicking on the menu itself (overlay)
 */
mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ============================================================================
// 5. FILE UPLOAD & VALIDATION
// ============================================================================
/**
 * Opens file picker when upload box is clicked
 */
uploadBox.addEventListener('click', () => {
    if (!uploadedImage) fileInput.click();
});

/**
 * Opens file picker from sticky bar
 */
stickyUpload.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.click();
});

/**
 * Handles file input change event
 */
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

/**
 * Handles drag and drop events
 * Manages dragenter, dragover, dragleave, and drop states
 */
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => 
    uploadBox.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Add visual feedback during drag
        if (eventName === 'dragenter' || eventName === 'dragover') {
            uploadBox.classList.add('dragover');
        }
        // Remove visual feedback on exit or drop
        if (eventName === 'dragleave' || eventName === 'drop') {
            uploadBox.classList.remove('dragover');
        }
    })
);

/**
 * Handles dropped files
 */
uploadBox.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    } else {
        showToast('Please upload an image file (JPEG, PNG, WebP)', 'error');
    }
});

// ============================================================================
// 6. IMAGE PROCESSING
// ============================================================================
/**
 * Validates and processes uploaded file
 * @param {File} file - The file to process
 */
function handleFile(file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showToast('File must be JPEG, JPG, PNG or WebP', 'error');
        return;
    }

    // Validate file size (40MB limit)
    const MAX_SIZE = 40 * 1024 * 1024; // 40MB
    if (file.size > MAX_SIZE) {
        showToast('File must be less than 40MB', 'error');
        return;
    }

    // Read and process the file
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage = new Image();
        uploadedImage.onload = () => {
            originalWidth = uploadedImage.width;
            originalHeight = uploadedImage.height;
            aspectRatio = originalWidth / originalHeight;
            
            // Display preview
            previewImg.src = e.target.result;
            uploadPreview.classList.add('active');
            uploadBox.querySelector('.upload-content').style.display = 'none';
            
            // Set default resize values
            widthInput.value = originalWidth;
            heightInput.value = originalHeight;
            
            showToast('Image uploaded! Click to resize.');
            
            // Auto open resize modal after delay
            setTimeout(() => {
                openResizeModal();
            }, 600);
        };
        uploadedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Removes the uploaded image and shows upload prompt again
 */
removeImg.addEventListener('click', (e) => {
    e.stopPropagation();
    uploadedImage = null;
    previewImg.src = '';
    uploadPreview.classList.remove('active');
    uploadBox.querySelector('.upload-content').style.display = 'block';
    fileInput.value = '';
    showToast('Image removed');
});

/**
 * Opens resize modal when clicking on preview
 */
uploadPreview.addEventListener('click', (e) => {
    if (e.target !== removeImg && !removeImg.contains(e.target)) {
        openResizeModal();
    }
});

// ============================================================================
// 7. MODAL MANAGEMENT
// ============================================================================
/**
 * Opens the resize modal with the uploaded image
 */
function openResizeModal() {
    if (!uploadedImage) {
        showToast('Please upload an image first', 'error');
        return;
    }
    resizePreviewImg.src = previewImg.src;
    resizeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Closes the resize modal
 */
function closeResizeModal() {
    resizeModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal when clicking overlay
modalOverlay.addEventListener('click', closeResizeModal);

// Close modal when clicking close button
modalClose.addEventListener('click', closeResizeModal);

// Close modal when clicking cancel button
cancelResize.addEventListener('click', closeResizeModal);

// ============================================================================
// 8. RESIZE CONTROLS
// ============================================================================
/**
 * Syncs height with width when aspect ratio is locked
 */
widthInput.addEventListener('input', () => {
    if (lockAspect.checked) {
        const newWidth = parseInt(widthInput.value) || 1;
        heightInput.value = Math.round(newWidth / aspectRatio);
    }
});

/**
 * Syncs width with height when aspect ratio is locked
 */
heightInput.addEventListener('input', () => {
    if (lockAspect.checked) {
        const newHeight = parseInt(heightInput.value) || 1;
        widthInput.value = Math.round(newHeight * aspectRatio);
    }
});

/**
 * Handles preset size button clicks
 */
presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const w = parseInt(btn.dataset.w);
        const h = parseInt(btn.dataset.h);
        widthInput.value = w;
        heightInput.value = h;
        
        // Visual feedback - highlight selected preset
        presetBtns.forEach(b => {
            b.style.background = '';
            b.style.color = '';
        });
        btn.style.background = 'var(--purple-primary)';
        btn.style.color = 'white';
    });
});

// ============================================================================
// 9. DOWNLOAD FUNCTIONALITY
// ============================================================================
/**
 * Downloads the resized image
 * Uses Canvas API for image resizing
 */
downloadResized.addEventListener('click', () => {
    if (!uploadedImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const targetWidth = parseInt(widthInput.value) || originalWidth;
    const targetHeight = parseInt(heightInput.value) || originalHeight;
    const quality = parseFloat(qualitySelect.value);
    
    // Set canvas dimensions
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // Enable high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(uploadedImage, 0, 0, targetWidth, targetHeight);
    
    // Determine output format
    let mimeType = 'image/jpeg';
    const file = fileInput.files[0];
    if (file) {
        if (file.type === 'image/png') mimeType = 'image/png';
        else if (file.type === 'image/webp') mimeType = 'image/webp';
    }
    
    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resized-image-${targetWidth}x${targetHeight}.${mimeType.split('/')[1]}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast(`Image resized to ${targetWidth}x${targetHeight} and downloaded!`);
        closeResizeModal();
    }, mimeType, quality);
});

// ============================================================================
// 10. ACCORDION
// ============================================================================
/**
 * Handles footer accordion toggle
 */
accordionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const content = btn.nextElementSibling;
        const isActive = btn.classList.contains('active');
        
        // Close all accordion items
        accordionBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.accordion-content').forEach(c => 
            c.classList.remove('active')
        );
        
        // Open clicked item if it was closed
        if (!isActive) {
            btn.classList.add('active');
            content.classList.add('active');
        }
    });
});

// ============================================================================
// 11. SCROLL EFFECTS
// ============================================================================
/**
 * Hides/shows sticky bar based on scroll direction
 * Hidden when scrolling down, shown when scrolling up
 */
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > lastScrollY && currentScrollY > 300) {
        stickyBar.classList.add('hidden');
    } else {
        stickyBar.classList.remove('hidden');
    }
    lastScrollY = currentScrollY;
});

// ============================================================================
// 12. NOTIFICATIONS (TOAST)
// ============================================================================
/**
 * Displays a toast notification message
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
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

// ============================================================================
// 13. INTERACTIONS
// ============================================================================
/**
 * Makes social media cards editable on click
 */
socialCards.forEach(card => {
    card.addEventListener('click', () => {
        const handleEl = card.querySelector('.social-handle');
        const currentHandle = handleEl.textContent;
        const platform = card.querySelector('h3').textContent;
        const newHandle = prompt(
            `Enter your ${platform} ID/handle:`, 
            currentHandle
        );
        
        if (newHandle !== null && newHandle.trim() !== '') {
            handleEl.textContent = newHandle.trim();
            card.classList.remove('placeholder');
            card.style.borderColor = 'var(--purple-primary)';
            showToast(`${platform} ID updated!`);
        }
    });
});

/**
 * Keyboard shortcuts
 * ESC to close modal or menu
 */
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

// ============================================================================
// 14. ANIMATIONS
// ============================================================================
/**
 * Demo image carousel animation
 * Cycles through sample images automatically
 */
const demoImages = [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop'
];
let currentDemoIndex = 0;
const demoImg = document.getElementById('demoImg');

setInterval(() => {
    currentDemoIndex = (currentDemoIndex + 1) % demoImages.length;
    demoImg.style.opacity = '0';
    setTimeout(() => {
        demoImg.src = demoImages[currentDemoIndex];
        demoImg.style.opacity = '1';
    }, 300);
}, 4000);

// Smooth opacity transition for demo image
demoImg.style.transition = 'opacity 0.3s ease';

/**
 * Intersection Observer for scroll animations
 * Fades in elements as they come into view
 */
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

// Observe sections for fade-in animation
document.querySelectorAll(
    '.step-card, .feature-content, .do-more-content, .social-card'
).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================================================
// 15. INITIALIZATION
// ============================================================================
/**
 * Page initialization - runs when DOM is fully loaded
 */
window.addEventListener('DOMContentLoaded', () => {
    // Fade in page on load
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Console messages
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
