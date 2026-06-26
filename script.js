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

    let fadeTimer = null;

    // MUSIK FIX DEFINITIF — Tanpa load(), play() langsung dalam gesture context
    // ROOT CAUSE: bgMusic.load() memutus iOS user gesture chain → play() diblok
    function playAudioWithFadeIn() {
        if (fadeTimer) clearInterval(fadeTimer);
        bgMusic.volume = 0.0;
        // JANGAN panggil bgMusic.load() — itu yang memutus gesture chain di iOS!

        // play() harus dipanggil langsung di sini (masih dalam gesture callstack)
        bgMusic.play()
            .then(() => {
                // play() berhasil. Sekarang seek ke detik 52.
                // Beri waktu 1 detik agar audio cukup ter-buffer sebelum seek
                setTimeout(() => {
                    bgMusic.currentTime = 52.0;
                    console.log('[Music] Seeking to 52s. readyState=' + bgMusic.readyState);

                    // Verifikasi setelah 500ms lagi
                    setTimeout(() => {
                        console.log('[Music] Actual position: ' + Math.round(bgMusic.currentTime) + 's');
                        if (bgMusic.currentTime < 50) {
                            // Seek gagal (audio belum cukup buffer), coba lagi
                            bgMusic.currentTime = 52.0;
                        }
                    }, 500);

                    musicToggle.classList.add('playing');
                    musicStateText.textContent = 'Mute';
                    musicTooltip.textContent = 'Senapkan Musik';
                    startFadeIn();
                }, 1000);
            })
            .catch(err => {
                console.log('[Music] Blocked:', err);
                musicToggle.classList.remove('playing');
                musicStateText.textContent = 'Play';
                musicTooltip.textContent = 'Putar Musik';
            });
    }

    function startFadeIn() {
        console.log("Audio berjalan dari detik: " + bgMusic.currentTime);
        musicToggle.classList.add('playing');
        musicStateText.textContent = 'Mute';
        musicTooltip.textContent = 'Senapkan Musik';

        const fadeDuration = 4000;
        const fadeInterval = 50;
        const targetVolume = 0.7;
        const volumeStep = targetVolume / (fadeDuration / fadeInterval);
        let currentVolume = 0.0;

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

    // Fungsi memudarkan dan menjeda audio secara halus
    function pauseAudioWithFadeOut() {
        if (fadeTimer) clearInterval(fadeTimer);

        const fadeDuration = 600; // Cepat memudar saat pause
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

    // Toggle play/pause musik
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            // Mainkan kembali (lanjutkan posisi saat ini)
            bgMusic.play()
                .then(() => {
                    musicToggle.classList.add('playing');
                    musicStateText.textContent = 'Mute';
                    musicTooltip.textContent = 'Senapkan Musik';
                    bgMusic.volume = 0.7;
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
    
    // Daftar terpadu seluruh 11 gambar portofolio
    const portfolioAssets = [
        { src: 'lensa-1.jpg', alt: 'Dokumentasi Lensa Shafa 1' },
        { src: 'lensa-2.jpg', alt: 'Dokumentasi Lensa Shafa 2' },
        { src: 'lensa-3.jpg', alt: 'Dokumentasi Lensa Shafa 3' },
        { src: 'lensa-4.jpg', alt: 'Dokumentasi Lensa Shafa 4' },
        { src: 'lensa-5.jpg', alt: 'Dokumentasi Lensa Shafa 5' },
        { src: 'lensa-6.jpg', alt: 'Dokumentasi Lensa Shafa 6' },
        { src: 'lensa-7.jpg', alt: 'Dokumentasi Lensa Shafa 7' },
        { src: 'lensa-8.jpg', alt: 'Dokumentasi Lensa Shafa 8' },
        { src: 'lensa-9.jpg', alt: 'Dokumentasi Lensa Shafa 9' },
        { src: 'lensa-10.jpg', alt: 'Dokumentasi Lensa Shafa 10' },
        { src: 'lensa-11.png', alt: 'Dokumentasi Lensa Shafa 11' }
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
            const index = parseInt(item.getAttribute('data-index'), 10);
            if (!isNaN(index)) {
                openLightbox(index);
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
    const videoCards = document.querySelectorAll('.video-card');

    function openVideoModal(videoId, title) {
        const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;
        const driveUrl = `https://drive.google.com/file/d/${videoId}/view`;

        videoIframe.src = embedUrl;
        videoModalTitle.textContent = title;
        videoDriveLink.href = driveUrl;

        videoModal.classList.add('open');
        videoModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('scroll-locked');
    }

    function closeVideoModal() {
        videoModal.classList.remove('open');
        videoModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('scroll-locked');
        // Hentikan video saat modal ditutup
        setTimeout(() => { videoIframe.src = ''; }, 400);
    }

    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.getAttribute('data-video-id');
            const title = card.getAttribute('data-video-title');
            if (videoId) openVideoModal(videoId, title);
        });
    });

    if (videoModalClose) videoModalClose.addEventListener('click', closeVideoModal);
    if (videoModalBackdrop) videoModalBackdrop.addEventListener('click', closeVideoModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('open')) {
            closeVideoModal();
        }
    });
});
