class PresentationController {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.currentSlideElement = document.getElementById('current-slide');
        this.totalSlidesElement = document.getElementById('total-slides');
        this.progressFill = document.querySelector('.progress-fill');
        this.isTransitioning = false;
        
        this.init();
    }

    init() {
        // Set total slides count
        this.totalSlidesElement.textContent = this.totalSlides;
        
        // Initialize first slide
        this.updateSlide();
        
        // Add event listeners
        this.addEventListeners();
        
        // Initialize progress bar
        this.updateProgressBar();
        
        // Focus management
        document.body.focus();

        console.log('Presentation initialized with', this.totalSlides, 'slides');
    }

    addEventListeners() {
        // Button navigation with proper event handling
        if (this.prevBtn && this.nextBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Previous button clicked');
                this.previousSlide();
            });
            
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Next button clicked');
                this.nextSlide();
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Prevent context menu on right-click for cleaner presentation
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Handle window resize for responsive updates
        window.addEventListener('resize', () => this.handleResize());
        
        // Touch/swipe support for mobile
        this.addTouchSupport();

        // Prevent any click event bubbling issues
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-buttons')) {
                e.stopPropagation();
            }
        });
    }

    handleKeyPress(e) {
        // Prevent default behavior during transitions
        if (this.isTransitioning) {
            e.preventDefault();
            return;
        }

        switch(e.key) {
            case 'ArrowRight':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                console.log('Right arrow/space pressed');
                this.nextSlide();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                console.log('Left arrow/page up pressed');
                this.previousSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides - 1);
                break;
            case 'Escape':
                e.preventDefault();
                this.exitFullscreen();
                break;
            case 'f':
            case 'F':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    this.toggleFullscreen();
                }
                break;
        }
    }

    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        });
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diffX = touchStartX - touchEndX;
            const diffY = Math.abs(touchStartY - touchEndY);
            
            // Only process horizontal swipes
            if (Math.abs(diffX) > swipeThreshold && diffY < 100) {
                if (diffX > 0) {
                    // Swipe left - next slide
                    this.nextSlide();
                } else {
                    // Swipe right - previous slide
                    this.previousSlide();
                }
            }
        };
        
        this.handleSwipe = handleSwipe;
    }

    nextSlide() {
        if (this.isTransitioning) {
            console.log('Transition in progress, ignoring next slide request');
            return;
        }

        if (this.currentSlide < this.totalSlides - 1) {
            console.log('Moving from slide', this.currentSlide + 1, 'to', this.currentSlide + 2);
            this.currentSlide++;
            this.updateSlide();
            this.animateSlideTransition('next');
        } else {
            console.log('Already at last slide');
        }
    }

    previousSlide() {
        if (this.isTransitioning) {
            console.log('Transition in progress, ignoring previous slide request');
            return;
        }

        if (this.currentSlide > 0) {
            console.log('Moving from slide', this.currentSlide + 1, 'to', this.currentSlide);
            this.currentSlide--;
            this.updateSlide();
            this.animateSlideTransition('prev');
        } else {
            console.log('Already at first slide');
        }
    }

    goToSlide(slideIndex) {
        if (this.isTransitioning) {
            return;
        }

        if (slideIndex >= 0 && slideIndex < this.totalSlides && slideIndex !== this.currentSlide) {
            const direction = slideIndex > this.currentSlide ? 'next' : 'prev';
            console.log('Jumping to slide', slideIndex + 1);
            this.currentSlide = slideIndex;
            this.updateSlide();
            this.animateSlideTransition(direction);
        }
    }

    updateSlide() {
        console.log('Updating to show slide', this.currentSlide + 1);
        
        // Update slide visibility
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev');
            if (index === this.currentSlide) {
                slide.classList.add('active');
                console.log('Activated slide', index + 1);
            } else if (index < this.currentSlide) {
                slide.classList.add('prev');
            }
        });

        // Update slide counter
        this.currentSlideElement.textContent = this.currentSlide + 1;

        // Update progress bar
        this.updateProgressBar();

        // Update button states
        this.updateButtonStates();

        // Announce slide change for screen readers
        this.announceSlideChange();
    }

    animateSlideTransition(direction) {
        this.isTransitioning = true;
        
        const currentSlideElement = this.slides[this.currentSlide];
        
        // Add subtle animation class
        currentSlideElement.style.animation = 'slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Remove animation after completion and reset transition flag
        setTimeout(() => {
            currentSlideElement.style.animation = '';
            this.isTransitioning = false;
            console.log('Transition completed');
        }, 500);
    }

    updateProgressBar() {
        if (this.progressFill) {
            const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
            this.progressFill.style.width = `${progress}%`;
            console.log('Progress updated to', progress.toFixed(1) + '%');
        } else {
            console.error('Progress bar element not found');
        }
    }

    updateButtonStates() {
        // Update previous button
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentSlide === 0;
            console.log('Previous button disabled:', this.prevBtn.disabled);
        }
        
        // Update next button
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
            
            // Update button text for last slide
            if (this.currentSlide === this.totalSlides - 1) {
                this.nextBtn.innerHTML = 'Finish ✓';
            } else {
                this.nextBtn.innerHTML = 'Next ❯';
            }
            console.log('Next button disabled:', this.nextBtn.disabled);
        }
    }

    announceSlideChange() {
        const slideTitle = this.slides[this.currentSlide].querySelector('h1, h2');
        if (slideTitle) {
            const announcement = `Slide ${this.currentSlide + 1} of ${this.totalSlides}: ${slideTitle.textContent}`;
            this.announceToScreenReader(announcement);
        }
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    handleResize() {
        // Recalculate any responsive elements if needed
        this.updateProgressBar();
    }

    // Additional utility methods
    getCurrentSlideData() {
        return {
            index: this.currentSlide,
            total: this.totalSlides,
            progress: ((this.currentSlide + 1) / this.totalSlides) * 100
        };
    }
}

// Additional utility functions
function addCustomAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .sr-only {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        }
    `;
    document.head.appendChild(style);
}

// Enhanced keyboard shortcuts handler
function addAdvancedKeyboardShortcuts(presentation) {
    document.addEventListener('keydown', (e) => {
        // Number keys for quick slide navigation (1-9)
        if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const slideNum = parseInt(e.key) - 1;
            if (slideNum < presentation.totalSlides) {
                e.preventDefault();
                presentation.goToSlide(slideNum);
            }
        }
        
        // 'r' for reload/restart presentation
        if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            presentation.goToSlide(0);
        }
        
        // '?' for help
        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            showKeyboardShortcuts();
        }
    });
}

function showKeyboardShortcuts() {
    const helpModal = document.createElement('div');
    helpModal.className = 'help-modal';
    helpModal.innerHTML = `
        <div class="help-content">
            <h3>Keyboard Shortcuts</h3>
            <div class="shortcuts-list">
                <div class="shortcut-item">
                    <kbd>→</kbd> <kbd>Space</kbd> <kbd>PgDn</kbd>
                    <span>Next slide</span>
                </div>
                <div class="shortcut-item">
                    <kbd>←</kbd> <kbd>PgUp</kbd>
                    <span>Previous slide</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Home</kbd>
                    <span>First slide</span>
                </div>
                <div class="shortcut-item">
                    <kbd>End</kbd>
                    <span>Last slide</span>
                </div>
                <div class="shortcut-item">
                    <kbd>F</kbd>
                    <span>Toggle fullscreen</span>
                </div>
                <div class="shortcut-item">
                    <kbd>1-9</kbd>
                    <span>Go to slide 1-9</span>
                </div>
                <div class="shortcut-item">
                    <kbd>R</kbd>
                    <span>Restart presentation</span>
                </div>
                <div class="shortcut-item">
                    <kbd>?</kbd>
                    <span>Show this help</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Esc</kbd>
                    <span>Exit fullscreen/Close dialogs</span>
                </div>
            </div>
            <button id="close-help" class="btn btn--primary">Close</button>
        </div>
    `;
    
    // Style the modal
    helpModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    const content = helpModal.querySelector('.help-content');
    content.style.cssText = `
        background: var(--background-card);
        padding: 30px;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        border: 1px solid var(--border-color);
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .shortcuts-list {
            margin: 20px 0;
        }
        
        .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .shortcut-item:last-child {
            border-bottom: none;
        }
        
        kbd {
            background: var(--background-dark);
            color: var(--text-primary);
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9rem;
            border: 1px solid var(--border-color);
            margin: 0 2px;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(helpModal);
    
    const closeBtn = helpModal.querySelector('#close-help');
    
    const closeModal = () => {
        if (document.body.contains(helpModal)) {
            document.body.removeChild(helpModal);
        }
        if (document.head.contains(style)) {
            document.head.removeChild(style);
        }
    };
    
    closeBtn.addEventListener('click', closeModal);
    
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing presentation');
    
    // Add custom animations
    addCustomAnimations();
    
    // Wait a moment for all elements to be ready
    setTimeout(() => {
        // Initialize presentation controller
        const presentation = new PresentationController();
        
        // Add advanced keyboard shortcuts
        addAdvancedKeyboardShortcuts(presentation);
        
        // Expose presentation controller globally for debugging
        window.presentation = presentation;
        
        // Optional: Add presentation mode indicator
        const addPresentationModeIndicator = () => {
            const indicator = document.createElement('div');
            indicator.innerHTML = 'Press F for fullscreen, ? for help';
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.7);
                color: var(--text-secondary);
                padding: 8px 12px;
                border-radius: 15px;
                font-size: 12px;
                z-index: 999;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            `;
            
            indicator.addEventListener('mouseenter', () => {
                indicator.style.opacity = '1';
            });
            
            indicator.addEventListener('mouseleave', () => {
                indicator.style.opacity = '0.7';
            });
            
            document.body.appendChild(indicator);
            
            // Hide indicator after 5 seconds
            setTimeout(() => {
                indicator.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(indicator)) {
                        document.body.removeChild(indicator);
                    }
                }, 300);
            }, 5000);
        };
        
        // Show indicator after a short delay
        setTimeout(addPresentationModeIndicator, 2000);
        
        console.log('🎯 ML/NLP Presentation initialized successfully!');
        console.log('💡 Press ? for keyboard shortcuts');
        console.log('🚀 Total slides:', presentation.totalSlides);
        
    }, 100);
});