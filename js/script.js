/* Fungsi global untuk tab pricelist */
window.scrollToCards = function(target) {
    const map = { single: 'price-single', couple: 'price-couple', family: 'price-family' };
    const el = document.getElementById(map[target] || 'price-cards-section');
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
};

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. SPLASH SCREEN & AUDIO LATAR (CINEMATIC)
       ========================================================================== */
    const splashScreen = document.getElementById('splash-screen');
    const btnStart = document.getElementById('btn-start');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const musicTooltip = musicToggle.querySelector('.music-tooltip');
    const musicStateText = musicToggle.querySelector('.music-state-text');
    
    // Kunci scroll body saat splash screen aktif
    document.body.classList.add('scroll-locked');

    // Event ketika tombol splash screen diklik
    btnStart.addEventListener('click', () => {
        // Hilangkan splash screen secara halus
        splashScreen.classList.add('fade-out');
        document.body.classList.remove('scroll-locked');

        // Mainkan musik latar dari 52 detik dengan fade-in
        playAudioWithFadeIn();

        // Hapus elemen splash screen dari DOM setelah transisi selesai
        setTimeout(() => {
            splashScreen.style.display = 'none';
            // Trigger visual reveal untuk hero section setelah splash selesai
            const heroContent = document.querySelector('.hero-content-wrapper');
            if (heroContent) {
                heroContent.classList.add('visible');
            }
        }, 1500);
    });

    // WEBAUDIO API INTEGRATION — Mengatasi limitasi iOS Safari yang mengunci kontrol volume audio via JS.
    // iOS Safari membolehkan kontrol volume jika dikirim melalui Web Audio API GainNode.
    let audioCtx = null;
    let sourceNode = null;
    let gainNode = null;

    function initWebAudio() {
        if (audioCtx) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
                sourceNode = audioCtx.createMediaElementSource(bgMusic);
                gainNode = audioCtx.createGain();
                sourceNode.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                console.log('[WebAudio] Graph initialized successfully.');
            }
        } catch (e) {
            console.log('[WebAudio] Initialization failed, using fallback standard volume:', e);
            audioCtx = null;
        }
    }

    let fadeTimer = null;

    function playAudioWithFadeIn() {
        if (fadeTimer) clearInterval(fadeTimer);
        
        initWebAudio();
        
        if (audioCtx && gainNode) {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        } else {
            bgMusic.volume = 0.0;
        }

        bgMusic.play()
            .then(() => {
                console.log('[Music] Playback started successfully.');
                startFadeIn();
            })
            .catch(err => {
                console.log('[Music] Play blocked by user gesture restrictions:', err);
                musicToggle.classList.remove('playing');
                musicStateText.textContent = 'Play';
                musicTooltip.textContent = 'Putar Musik';
            });
    }

    function startFadeIn() {
        musicToggle.classList.add('playing');
        musicStateText.textContent = 'Mute';
        musicTooltip.textContent = 'Senapkan Musik';

        const targetVolume = 0.7;
        const fadeDuration = 4000; // 4 Detik fade-in

        if (audioCtx && gainNode) {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            // Linear fade-in menggunakan Web Audio API (Mulus & berfungsi di iOS)
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(targetVolume, audioCtx.currentTime + (fadeDuration / 1000));
            console.log('[WebAudio] Smooth fade-in started.');
        } else {
            // Fallback standard volume untuk browser lama
            const fadeInterval = 50;
            const volumeStep = targetVolume / (fadeDuration / fadeInterval);
            let currentVolume = 0.0;
            bgMusic.volume = 0.0;

            fadeTimer = setInterval(() => {
                currentVolume += volumeStep;
                if (currentVolume >= targetVolume) {
                    bgMusic.volume = targetVolume;
                    clearInterval(fadeTimer);
                } else {
                    bgMusic.volume = currentVolume;
                }
            }, fadeInterval);
        }
    }

    function pauseAudioWithFadeOut() {
        if (fadeTimer) clearInterval(fadeTimer);

        const fadeDuration = 600; // 0.6 detik memudar saat dijeda

        if (audioCtx && gainNode) {
            // Linear fade-out menggunakan Web Audio API
            gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + (fadeDuration / 1000));
            
            setTimeout(() => {
                bgMusic.pause();
                musicToggle.classList.remove('playing');
                musicStateText.textContent = 'Play';
                musicTooltip.textContent = 'Putar Musik';
            }, fadeDuration);
        } else {
            // Fallback standard volume
            const fadeInterval = 30;
            const startVolume = bgMusic.volume;
            const volumeStep = startVolume / (fadeDuration / fadeInterval);
            let currentVolume = startVolume;

            fadeTimer = setInterval(() => {
                currentVolume -= volumeStep;
                if (currentVolume <= 0) {
                    bgMusic.volume = 0;
                    bgMusic.pause();
                    musicToggle.classList.remove('playing');
                    musicStateText.textContent = 'Play';
                    musicTooltip.textContent = 'Putar Musik';
                    clearInterval(fadeTimer);
                } else {
                    bgMusic.volume = currentVolume;
                }
            }, fadeInterval);
        }
    }

    // Toggle play/pause musik
    musicToggle.addEventListener('click', () => {
        initWebAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        if (bgMusic.paused) {
            if (gainNode) {
                gainNode.gain.setValueAtTime(0.7, audioCtx.currentTime);
            } else {
                bgMusic.volume = 0.7;
            }
            bgMusic.play()
                .then(() => {
                    musicToggle.classList.add('playing');
                    musicStateText.textContent = 'Mute';
                    musicTooltip.textContent = 'Senapkan Musik';
                });
        } else {
            pauseAudioWithFadeOut();
        }
    });


    /* ==========================================================================
       2. LENIS SMOOTH SCROLL INTEGRATION
       ========================================================================== */
    let lenis = null;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing eksponensial premium yang lambat
            smoothWheel: true,
            smoothTouch: false
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        
        // Sinkronisasi navigasi link dengan Lenis scroll & Mobile Menu Close
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                // Jika menu mobile sedang terbuka, tutup dulu dan aktifkan kembali scroll
                if (mainNav && mainNav.classList.contains('open')) {
                    mobileNavToggle.classList.remove('open');
                    mainNav.classList.remove('open');
                    mobileNavToggle.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('scroll-locked');
                    if (lenis) lenis.start();
                }

                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    // Berikan jeda sangat kecil agar menu selesai menutup / lenis ter-start sebelum scrolling dimulai
                    setTimeout(() => {
                        if (lenis) {
                            lenis.scrollTo(targetEl, {
                                offset: -90, // Sesuaikan dengan tinggi header scrolled
                                duration: 2.0 // Durasi scroll lambat dan mewah
                            });
                        } else {
                            targetEl.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 50);
                }
            });
        });
    }


    /* ==========================================================================
       3. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Hanya sekali jalan demi performa
                }
            });
        }, {
            threshold: 0.05, // Memicu lebih awal demi kemulusan
            rootMargin: '0px 0px -100px 0px' 
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }


    /* ==========================================================================
       4. STICKY HEADER & NAV ACTIVE LINK ON SCROLL
       ========================================================================== */
    const header = document.querySelector('.main-header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Amati section aktif untuk menu navigasi
    if (sections.length > 0) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '-120px 0px -50% 0px'
        });

        sections.forEach(s => sectionObserver.observe(s));
    }


    /* ==========================================================================
       5. MOBILE NAVIGATION TOGGLE (DRAWER EFFECT)
       ========================================================================== */
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', () => {
            const isOpen = mobileNavToggle.classList.toggle('open');
            mainNav.classList.toggle('open');
            mobileNavToggle.setAttribute('aria-expanded', isOpen);
            
            if (isOpen) {
                document.body.classList.add('scroll-locked');
                if (lenis) lenis.stop();
            } else {
                document.body.classList.remove('scroll-locked');
                if (lenis) lenis.start();
            }
        });

        // Note: Penutupan menu drawer di mobile sudah ditangani di unified click listener di atas.
    }


    /* ==========================================================================
       6. UNIFIED LIGHTBOX GALLERY (ALL 11 PORTFOLIO IMAGES)
       ========================================================================== */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    // Daftar terpadu seluruh 7 gambar galeri aktif (lensa-1, 5, 7, 9 dikecualikan)
    const portfolioAssets = [
        { src: 'assets/images/lensa-2.jpg', alt: 'Dokumentasi Lensa Shafa 2' },
        { src: 'assets/images/lensa-3.jpg', alt: 'Dokumentasi Lensa Shafa 3' },
        { src: 'assets/images/lensa-4.jpg', alt: 'Dokumentasi Lensa Shafa 4' },
        { src: 'assets/images/lensa-6.jpg', alt: 'Dokumentasi Lensa Shafa 6' },
        { src: 'assets/images/lensa-8.jpg', alt: 'Dokumentasi Lensa Shafa 8' },
        { src: 'assets/images/lensa-10.jpg', alt: 'Dokumentasi Lensa Shafa 10' },
        { src: 'assets/images/lensa-11.png', alt: 'Dokumentasi Lensa Shafa 11' }
    ];

    let currentPhotoIndex = 0;

    // Fungsi membuka lightbox modal
    function openLightbox(index) {
        currentPhotoIndex = index;
        const photo = portfolioAssets[currentPhotoIndex];
        
        lightboxImg.style.opacity = '0';
        lightboxImg.src = photo.src;
        lightboxImg.alt = photo.alt;
        
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('scroll-locked');
        if (lenis) lenis.stop();

        setTimeout(() => {
            lightboxImg.style.opacity = '1';
        }, 50);
    }

    // Fungsi menutup lightbox modal
    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        
        // Hapus scroll-locked hanya jika menu mobile tidak aktif
        if (!mainNav.classList.contains('open')) {
            document.body.classList.remove('scroll-locked');
            if (lenis) lenis.start();
        }
    }

    // Fungsi navigasi foto lightbox (Sebelumnya / Selanjutnya)
    function navigateLightbox(direction) {
        if (direction === 'next') {
            currentPhotoIndex = (currentPhotoIndex + 1) % portfolioAssets.length;
        } else if (direction === 'prev') {
            currentPhotoIndex = (currentPhotoIndex - 1 + portfolioAssets.length) % portfolioAssets.length;
        }
        
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.97)';
        
        setTimeout(() => {
            const photo = portfolioAssets[currentPhotoIndex];
            lightboxImg.src = photo.src;
            lightboxImg.alt = photo.alt;
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
        }, 180);
    }

    // Event Listener untuk Galeri Unggulan (Section 4)
    const editorialItems = document.querySelectorAll('.editorial-item');
    editorialItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.getAttribute('data-img-src');
            // Cari index gambar yang dicocokkan di dalam portfolioAssets
            const matchedIndex = portfolioAssets.findIndex(asset => asset.src === imgSrc);
            if (matchedIndex !== -1) {
                openLightbox(matchedIndex);
            }
        });
    });

    // Event Listener untuk Galeri Dokumentasi (Section 5)
    const galleryItems = document.querySelectorAll('.gallery-card-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.getAttribute('data-img-src');
            const matchedIndex = portfolioAssets.findIndex(asset => asset.src === imgSrc);
            if (matchedIndex !== -1) {
                openLightbox(matchedIndex);
            }
        });
    });

    // Tombol Navigasi Lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox('prev');
    });
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox('next');
    });

    // Tutup lightbox jika area di luar gambar diklik
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Dukungan Keyboard untuk Lightbox (Esc, Panah Kiri, Panah Kanan)
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight') {
            navigateLightbox('next');
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox('prev');
        }
    });

    /* Dukungan Swipe Gesture Ringan Pada Lightbox (Untuk Device Layar Sentuh) */
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, { passive: true });

    function handleSwipeGesture() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) { navigateLightbox('next'); }
        if (touchEndX > touchStartX + threshold) { navigateLightbox('prev'); }
    }

    /* ==========================================================================
       VIDEO MODAL — Google Drive Embed
       ========================================================================== */
    const videoModal = document.getElementById('video-modal');
    const videoIframe = document.getElementById('video-iframe');
    const videoModalTitle = document.getElementById('video-modal-title');
    const videoModalClose = document.getElementById('video-modal-close');
    const videoModalBackdrop = document.getElementById('video-modal-backdrop');
    const videoDriveLink = document.getElementById('video-drive-link');
    const videoDownloadLink = document.getElementById('video-download-link');
    const videoLoadingSpinner = document.querySelector('.video-loading-spinner');
    const videoCards = document.querySelectorAll('.video-card');

    function openVideoModal(videoId, title, ratio) {
        const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;
        const viewUrl = `https://drive.google.com/file/d/${videoId}/view?usp=drivesdk`;
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${videoId}`;

        // Tampilkan loading spinner
        if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'block';

        videoIframe.src = embedUrl;
        videoModalTitle.textContent = title;
        if (videoDriveLink) videoDriveLink.href = viewUrl;
        if (videoDownloadLink) videoDownloadLink.href = downloadUrl;

        // Atur class vertical-video jika video berorientasi portrait
        const container = videoModal.querySelector('.video-modal-container');
        if (container) {
            if (ratio === 'portrait') {
                container.classList.add('vertical-video');
            } else {
                container.classList.remove('vertical-video');
            }
        }

        videoModal.classList.add('open');
        videoModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('scroll-locked');
        if (lenis) lenis.stop();
    }

    // Hilangkan loading spinner ketika iframe selesai dimuat
    if (videoIframe) {
        videoIframe.onload = () => {
            if (videoLoadingSpinner) videoLoadingSpinner.style.display = 'none';
        };
    }

    function closeVideoModal() {
        videoModal.classList.remove('open');
        videoModal.setAttribute('aria-hidden', 'true');
        
        // Hapus scroll-locked hanya jika menu mobile tidak aktif
        if (!mainNav.classList.contains('open')) {
            document.body.classList.remove('scroll-locked');
            if (lenis) lenis.start();
        }
        
        // Hentikan pemutaran video
        setTimeout(() => { videoIframe.src = ''; }, 400);
    }

    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.getAttribute('data-video-id');
            const title = card.getAttribute('data-video-title');
            const ratio = card.getAttribute('data-video-ratio');
            if (videoId) openVideoModal(videoId, title, ratio);
        });
    });

    if (videoModalClose) videoModalClose.addEventListener('click', closeVideoModal);
    if (videoModalBackdrop) videoModalBackdrop.addEventListener('click', closeVideoModal);


    /* ==========================================================================
       7. PRICELIST FULLSCREEN LIGHTBOX MODAL
       ========================================================================== */
    const pricelistImg = document.querySelector('.pricelist-image');
    const pricelistModal = document.getElementById('pricelist-modal');
    const pricelistModalClose = document.getElementById('pricelist-modal-close');
    const pricelistModalBackdrop = document.getElementById('pricelist-modal-backdrop');

    function openPricelistModal() {
        if (!pricelistModal) return;
        pricelistModal.classList.add('open');
        pricelistModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('scroll-locked');
        if (lenis) lenis.stop();
    }

    function closePricelistModal() {
        if (!pricelistModal) return;
        pricelistModal.classList.remove('open');
        pricelistModal.setAttribute('aria-hidden', 'true');
        
        // Hapus scroll-locked hanya jika menu mobile tidak aktif
        if (!mainNav.classList.contains('open')) {
            document.body.classList.remove('scroll-locked');
            if (lenis) lenis.start();
        }
    }

    if (pricelistImg) {
        pricelistImg.style.cursor = 'pointer';
        pricelistImg.addEventListener('click', openPricelistModal);
    }
    if (pricelistModalClose) pricelistModalClose.addEventListener('click', closePricelistModal);
    if (pricelistModalBackdrop) pricelistModalBackdrop.addEventListener('click', closePricelistModal);


    /* ==========================================================================
       8. PRICE CARD INTERACTIVITY (WHITE ON CLICK)
       ========================================================================== */
    const priceCards = document.querySelectorAll('.price-card');
    priceCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Jangan ubah active state jika yang diklik adalah tombol Pesan Sekarang
            if (e.target.classList.contains('btn-price')) return;

            const isAlreadyActive = card.classList.contains('active');
            priceCards.forEach(c => c.classList.remove('active'));
            
            if (!isAlreadyActive) {
                card.classList.add('active');
            }
        });
    });


    /* ==========================================================================
       9. UNIFIED KEYDOWN LISTENER (ESCAPE CLOSE FOR ALL MODALS)
       ========================================================================== */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (lightbox && lightbox.classList.contains('active')) closeLightbox();
            if (videoModal && videoModal.classList.contains('open')) closeVideoModal();
            if (pricelistModal && pricelistModal.classList.contains('open')) closePricelistModal();
        }
    });
});
