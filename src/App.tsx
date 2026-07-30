import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Compass, ShieldCheck, Menu, X, Building2, LandPlot, Castle, Sparkles, Quote, Globe, Award, Clock, Sparkle } from 'lucide-react';

function FrenchFlag() {
  return (
    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/30 flex items-center justify-center shrink-0 shadow-sm">
      <svg viewBox="0 0 3 2" className="w-full h-full object-cover">
        <rect width="1" height="2" x="0" fill="#002395" />
        <rect width="1" height="2" x="1" fill="#FFFFFF" />
        <rect width="1" height="2" x="2" fill="#ED2939" />
      </svg>
    </div>
  );
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refs for spotlight reveal and grid parallax
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskDivRef = useRef<HTMLDivElement | null>(null);
  const gridDivRef = useRef<HTMLDivElement | null>(null);

  const targetX = useRef<number>(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
  const targetY = useRef<number>(typeof window !== 'undefined' ? window.innerHeight / 2 : 500);

  const smoothX = useRef<number>(targetX.current);
  const smoothY = useRef<number>(targetY.current);

  const gridTargetX = useRef<number>(0);
  const gridTargetY = useRef<number>(0);

  const gridSmoothX = useRef<number>(0);
  const gridSmoothY = useRef<number>(0);



  // Scroll Animation Logic for the 1f image sequence
  const frameCount = 300;
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const scrollCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const section3Ref = useRef<HTMLElement>(null);
  const section4Ref = useRef<HTMLElement>(null);
  const section5Ref = useRef<HTMLElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [introFinished, setIntroFinished] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  // Lock body scroll when mobile menu is open or images are loading
  useEffect(() => {
    if (mobileMenuOpen || showLoader) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, showLoader]);

  // Minimum intro duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroFinished(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const isReady = imagesLoaded && introFinished;

  // Unmount loader after fade out transition completes
  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 700); // Match CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = [];
    
    const handleLoad = () => {
      loaded++;
      setLoadProgress(Math.round((loaded / frameCount) * 100));
      if (loaded === frameCount) setImagesLoaded(true);
    };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const num = i.toString().padStart(4, '0');
      img.src = `/1f/frame-${num}.png`;
      img.onload = handleLoad;
      img.onerror = handleLoad; // Ensure it doesn't get stuck if an image fails
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let currentFrameIndex = 0;
    let targetFrameIndex = 0;
    let smoothFrameIndex = 0;

    const renderFrame = (index: number) => {
      const canvas = scrollCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = imagesRef.current[index];
      if (img && img.complete) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * imgRatio;
          drawHeight = canvas.height;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = maxScroll > 0 ? scrollTop / maxScroll : 0;
      targetFrameIndex = Math.min(frameCount - 1, Math.max(0, Math.floor(scrollFraction * frameCount)));
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', () => renderFrame(currentFrameIndex));

    const tick = () => {
      smoothFrameIndex += (targetFrameIndex - smoothFrameIndex) * 0.08;
      const frameToDraw = Math.round(smoothFrameIndex);
      
      if (frameToDraw !== currentFrameIndex) {
        currentFrameIndex = frameToDraw;
        renderFrame(currentFrameIndex);
      } else if (imagesLoaded && currentFrameIndex === 0) {
        renderFrame(0);
      }

      // Update section opacities based on scroll
      const progress = smoothFrameIndex / (frameCount > 1 ? frameCount - 1 : 1);
      
      const updateSection = (ref: React.RefObject<HTMLDivElement | HTMLElement>, start: number, end: number) => {
        if (!ref.current) return;
        const fadeRange = 0.05;
        let opacity = 0;
        let translateY = 40;
        
        if (progress >= start - fadeRange && progress <= end + fadeRange) {
          const fadeIn = Math.min(1, Math.max(0, (progress - start) / fadeRange + 1));
          const fadeOut = Math.min(1, Math.max(0, (end - progress) / fadeRange + 1));
          
          if (progress < start) {
            opacity = fadeIn;
            translateY = 40 * (1 - fadeIn);
          } else if (progress > end) {
            opacity = fadeOut;
            translateY = -40 * (1 - fadeOut);
          } else {
            opacity = 1;
            translateY = 0;
          }
        }
        
        ref.current.style.opacity = opacity.toString();
        ref.current.style.transform = `translateY(${translateY}px)`;
        ref.current.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      };

      updateSection(section1Ref, 0.0, 0.15);
      updateSection(section2Ref, 0.20, 0.35);
      updateSection(section3Ref, 0.40, 0.55);
      updateSection(section4Ref, 0.60, 0.75);
      updateSection(section5Ref, 0.80, 0.95);
      
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imagesLoaded]);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-16');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -100px 0px' });

    const sections = document.querySelectorAll('.scroll-reveal');
    sections.forEach(sec => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  // Handle cursor tracking & spotlight render loop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetX.current = e.clientX;
      targetY.current = e.clientY;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      gridTargetX.current = ((e.clientX - centerX) / (centerX || 1)) * 16;
      gridTargetY.current = ((e.clientY - centerY) / (centerY || 1)) * 16;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        targetX.current = touch.clientX;
        targetY.current = touch.clientY;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        gridTargetX.current = ((touch.clientX - centerX) / (centerX || 1)) * 16;
        gridTargetY.current = ((touch.clientY - centerY) / (centerY || 1)) * 16;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    let animationFrameId: number;

    const render = () => {
      // Smooth spotlight position (lerp 0.1)
      smoothX.current += (targetX.current - smoothX.current) * 0.1;
      smoothY.current += (targetY.current - smoothY.current) * 0.1;

      // Smooth grid parallax position (lerp 0.06)
      gridSmoothX.current += (gridTargetX.current - gridSmoothX.current) * 0.06;
      gridSmoothY.current += (gridTargetY.current - gridSmoothY.current) * 0.06;

      if (gridDivRef.current) {
        gridDivRef.current.style.transform = `translate3d(${gridSmoothX.current}px, ${gridSmoothY.current}px, 0)`;
      }

      // Draw mask gradient on hidden canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = window.innerWidth;
          const height = window.innerHeight;

          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

          ctx.clearRect(0, 0, width, height);

          const r = 260; // 260px radius
          const x = smoothX.current;
          const y = smoothY.current;

          const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
          grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
          grad.addColorStop(0.4, 'rgba(255, 255, 255, 1.0)');
          grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
          grad.addColorStop(0.75, 'rgba(255, 255, 255, 0.4)');
          grad.addColorStop(0.88, 'rgba(255, 255, 255, 0.12)');
          grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          const dataUrl = canvas.toDataURL();
          if (maskDivRef.current) {
            maskDivRef.current.style.webkitMaskImage = `url("${dataUrl}")`;
            maskDivRef.current.style.maskImage = `url("${dataUrl}")`;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full bg-transparent text-white selection:bg-white selection:text-black h-[500vh] relative">
      {/* Full Screen Loader */}
      {showLoader && (
        <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-white transition-opacity duration-700 ease-in-out ${isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="text-4xl sm:text-6xl font-bold font-dm tracking-widest uppercase mb-8 animate-pulse">
            PARIS
          </div>
          <div className="w-64 max-w-[80vw] h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${isReady ? 100 : loadProgress}%` }}
            />
          </div>
          <div className="mt-6 text-xs sm:text-sm font-dm text-white/50 tracking-widest uppercase">
            Loading Experience {isReady ? 100 : loadProgress}%
          </div>
        </div>
      )}

      {/* Scroll Background Canvas */}
      <div className="fixed inset-0 z-[-1] bg-black">
        <canvas ref={scrollCanvasRef} className="w-full h-full object-cover opacity-80" />
      </div>

      {/* Hidden Canvas used for generating Mask Data URL */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Fixed UI Layer that houses all sections overlapping */}
      <div className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
      
      {/* SECTION 1: 900px Banner Container (NO BACKGROUND IMAGE) */}
      <div ref={section1Ref} className="opacity-0 will-change-transform absolute top-0 left-0 w-full h-full overflow-hidden">
        
        <div className="w-full bg-transparent text-white relative">
          <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between z-20 relative">
            
            {/* Brand Logo */}
            <div className="text-xl sm:text-2xl font-bold tracking-wider text-white uppercase flex items-center gap-1 font-dm">
              PARIS
            </div>

            {/* Desktop Center Pill Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2 py-1.5 shadow-lg">
              <a
                href="#home"
                className="bg-white text-black font-medium px-5 py-2 rounded-full text-sm transition-all duration-200 shadow-sm"
              >
                Home
              </a>
              <a
                href="#tours"
                className="text-white hover:text-white/80 font-medium px-4 py-2 text-sm transition-all duration-200"
              >
                Tours
              </a>
              <a
                href="#destinations"
                className="text-white hover:text-white/80 font-medium px-4 py-2 text-sm transition-all duration-200"
              >
                Destinations
              </a>
              <a
                href="#about"
                className="text-white hover:text-white/80 font-medium px-4 py-2 text-sm transition-all duration-200"
              >
                About us
              </a>
              <a
                href="#contact"
                className="text-white hover:text-white/80 font-medium px-4 py-2 text-sm transition-all duration-200"
              >
                Contact
              </a>
            </nav>

            {/* Desktop Right Action Controls */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                type="button"
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-5 py-2 text-sm font-medium text-white transition-all duration-200 backdrop-blur-sm cursor-pointer"
              >
                Open menu
              </button>
              <FrenchFlag />
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="lg:hidden flex items-center gap-3">
              <FrenchFlag />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="bg-white/10 p-2.5 rounded-full border border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </header>

          {/* Mobile Glassmorphism Dropdown Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-black/95 border border-white/20 rounded-2xl px-6 py-6 space-y-3 z-30 flex flex-col text-white absolute top-20 left-4 right-4 shadow-2xl backdrop-blur-xl transition-all">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-white text-black font-semibold px-4 py-2.5 rounded-full text-center text-sm shadow-md"
              >
                Home
              </a>
              <a
                href="#tours"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-white/80 px-4 py-2 text-center text-sm font-medium"
              >
                Tours
              </a>
              <a
                href="#destinations"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-white/80 px-4 py-2 text-center text-sm font-medium"
              >
                Destinations
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-white/80 px-4 py-2 text-center text-sm font-medium"
              >
                About us
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-white/80 px-4 py-2 text-center text-sm font-medium"
              >
                Contact
              </a>
              <button
                type="button"
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-5 py-2.5 text-sm font-medium text-white w-full transition-colors cursor-pointer"
              >
                Open menu
              </button>
            </div>
          )}
        </div>

        {/* Main Hero Banner Content */}
        <main className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] z-10 w-full max-w-5xl mx-auto flex flex-col justify-center items-center text-center px-2 sm:px-4">
          {/* Main Headline */}
          <h1 className="text-[36px] sm:text-[48px] md:text-[54px] font-medium tracking-tight text-white max-w-3xl leading-[1.12] mb-3">
            Experience Paris<br />
            Like Never<br />
            Before
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-[15px] text-white font-normal max-w-xl leading-relaxed mb-6 opacity-90 font-dm px-2">
            From iconic landmarks to hidden cafés and unforgettable moments, we create journeys that feel effortless and memorable
          </p>

          {/* CTA Button with Blue Arrow */}
          <div className="inline-flex items-center">
            <button
              type="button"
              className="bg-white hover:bg-white/95 text-black font-medium rounded-full pl-5 pr-1.5 py-1.5 flex items-center gap-3 transition-all duration-200 shadow-xl cursor-pointer group hover:scale-[1.02]"
            >
              <span className="text-xs sm:text-sm tracking-tight font-medium text-black font-dm">
                Explore tours
              </span>
              <div className="w-8 h-8 rounded-full bg-[#0066ff] group-hover:bg-[#0052cc] flex items-center justify-center text-white transition-colors shrink-0">
                <ArrowUpRight size={18} strokeWidth={2.5} />
              </div>
            </button>
          </div>
        </main>

        {/* Bottom Cards Section */}
        <footer className="absolute bottom-6 left-0 right-0 z-10 w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 justify-items-center items-end shrink-0 px-4 sm:px-6">
          {/* Left Card 1 - Authentic Paris Experiences */}
          <div className="w-full max-w-full sm:max-w-[420px] bg-white/5 border border-white/20 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between hover:border-white/30 transition-all duration-300">
            <div>
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center mb-3 shadow-md">
                <Compass size={18} className="text-black" />
              </div>

              <h2 className="text-base sm:text-lg font-medium text-white mb-2 tracking-tight font-dm">
                Authentic Paris Experiences
              </h2>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal font-dm">
                Discover hidden cafés, charming streets, and iconic landmarks with expert local guides who know the city best.
              </p>
            </div>
          </div>

          {/* Right Card 2 - Stress-Free Every Step */}
          <div className="w-full max-w-full sm:max-w-[420px] bg-white/5 border border-white/20 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between hover:border-white/30 transition-all duration-300">
            <div>
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center mb-3 shadow-md">
                <ShieldCheck size={18} className="text-black" />
              </div>

              <h2 className="text-base sm:text-lg font-medium text-white mb-2 tracking-tight font-dm">
                Stress-Free Every Step
              </h2>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal font-dm">
                From airport transfers to curated itineraries, we handle every detail so you can simply enjoy your Paris adventure.
              </p>
            </div>
          </div>
        </footer>

      </div>

      {/* SECTION 2: Trusted By Leading Brands Section */}
      <section ref={section2Ref} className="opacity-0 translate-y-16 will-change-transform absolute inset-0 flex flex-col items-center justify-center w-full max-w-[1400px] mx-auto px-4 sm:px-6 bg-transparent text-white">
        <div className="w-full bg-transparent overflow-hidden relative flex flex-col justify-between min-h-[420px] sm:min-h-[480px]">
          
          {/* Subtle Warm Ambient Glow behind center text */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] sm:w-[650px] h-[220px] sm:h-[320px] pointer-events-none opacity-20 blur-[70px] sm:blur-[100px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(235, 110, 60, 0.6) 0%, rgba(180, 50, 30, 0.2) 50%, transparent 80%)'
            }}
          />

          {/* Main Section Content Area */}
          <div className="relative z-10 px-4 sm:px-12 pt-12 sm:pt-20 pb-10 sm:pb-14 flex flex-col items-center text-center">
            
            {/* Headline in Serif Italic style */}
            <h2 className="font-serif-italic italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-white max-w-4xl leading-[1.12] mb-5 sm:mb-7">
              Proudly Trusted<br />
              by Leading Brands<br />
              Across Industries<sup className="text-red-500 font-sans text-xl sm:text-3xl ml-0.5 align-top font-bold">®</sup>
            </h2>

            {/* Subtext in DM Sans font */}
            <p className="font-dm text-sm sm:text-base md:text-lg text-white/70 max-w-xl leading-relaxed font-normal px-2">
              We've partnered with leading brands to deliver innovative and impactful architectural solutions
            </p>
          </div>

          {/* Bottom Brand Logos Divider Bar */}
          <div className="relative z-10 w-full py-7 sm:py-9 px-6 sm:px-12 bg-transparent">
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center lg:justify-between gap-8 sm:gap-12 md:gap-16 opacity-85 hover:opacity-100 transition-opacity">
              
              {/* Brand Logo 1: CONSTRUCTION */}
              <div className="flex items-center gap-2.5 text-white/90 font-dm">
                <div className="w-5 h-5 border-2 border-white/80 rounded-sm flex items-center justify-center p-0.5 shrink-0">
                  <div className="w-full h-1 bg-white/80" />
                </div>
                <span className="font-bold text-xs sm:text-sm tracking-[0.25em] text-white uppercase">
                  CONSTRUCTION
                </span>
              </div>

              {/* Brand Logo 2: CONDON CONSTRUCTION */}
              <div className="flex items-center gap-2.5 text-white/90 font-dm">
                <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0 fill-white/90">
                  <path d="M12 2A10 10 0 1022 12A10 10 0 0012 2zm-6 6h12v1.5H6zm0 3.5h12v1.5H6zm0 3.5h12v1.5H6z" />
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="font-bold tracking-wider text-xs sm:text-sm text-white uppercase">CONDON</span>
                  <span className="text-[8px] sm:text-[9px] tracking-[0.2em] text-white/70 uppercase">CONSTRUCTION</span>
                </div>
              </div>

              {/* Brand Logo 3: Morrison Construction */}
              <div className="flex items-center gap-2.5 text-white/90 font-dm">
                <div className="flex flex-col text-left leading-none">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">Morrison</span>
                    <div className="w-2.5 h-2.5 bg-white/80 rounded-tl-full rounded-br-full" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] tracking-wider text-white/70 font-medium">Construction</span>
                </div>
              </div>

              {/* Brand Logo 4: Architectural Towers Graphic */}
              <div className="flex items-center gap-2 text-white/90">
                <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white/90">
                  <rect x="6" y="14" width="5" height="14" rx="1" />
                  <rect x="13" y="6" width="6" height="22" rx="1" />
                  <rect x="21" y="10" width="5" height="18" rx="1" />
                </svg>
              </div>

              {/* Brand Logo 5: Staggered Building Pillars Graphic */}
              <div className="flex items-center gap-2 text-white/90">
                <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white/90">
                  <rect x="6" y="16" width="5" height="12" rx="0.5" />
                  <rect x="13" y="11" width="5" height="17" rx="0.5" />
                  <rect x="20" y="6" width="5" height="22" rx="0.5" />
                </svg>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: Kinetic Studio / About Studio Section */}
      <section ref={section3Ref} className="opacity-0 translate-y-16 will-change-transform absolute inset-0 flex flex-col items-center justify-center w-full max-w-[1400px] mx-auto px-4 sm:px-6 bg-transparent text-white">
        <div className="w-full bg-transparent overflow-hidden relative p-6 sm:p-12 md:p-16 flex flex-col items-center">
          


          {/* 4 Cards Grid - Styled exactly like Banner cards */}
          <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
            
            {/* Card 1: Strategy */}
            <div className="bg-white/5 border border-white/20 rounded-2xl p-5 sm:p-6 backdrop-blur-md flex flex-col justify-between hover:border-white/30 transition-all duration-300 min-h-[280px] sm:min-h-[340px] relative overflow-hidden">
              <div 
                className="absolute top-[-50px] right-[-50px] w-[250px] h-[250px] pointer-events-none opacity-45 blur-[60px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 102, 255, 0.7) 0%, rgba(0, 180, 255, 0.25) 50%, transparent 80%)'
                }}
              />
              <div className="flex justify-start relative z-10">
                <span className="bg-white/10 border border-white/20 text-white/80 text-xs px-3.5 py-1 rounded-full font-dm">
                  Strategy
                </span>
              </div>

              <div className="mt-8 relative z-10">
                <div className="w-2 h-2 rounded-full bg-red-500 mb-2.5" />
                <h3 className="text-base sm:text-lg font-medium text-white mb-2 leading-snug font-dm">
                  Bold strategies that shape identities
                </h3>
                <p className="text-xs text-white/70 font-normal leading-relaxed mb-4 font-dm">
                  Discover unique positioning and campaign identities that leave lasting impressions.
                </p>
                
                <button
                  type="button"
                  className="bg-white text-black font-semibold text-xs px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/90 transition-colors shadow-md cursor-pointer font-dm"
                >
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                  <span>Visit site</span>
                </button>
              </div>
            </div>

            {/* Card 2: Growth */}
            <div className="bg-white/5 border border-white/20 rounded-2xl p-5 sm:p-6 backdrop-blur-md flex flex-col justify-between hover:border-white/30 transition-all duration-300 min-h-[280px] sm:min-h-[340px] relative overflow-hidden">
              <div 
                className="absolute top-[-50px] right-[-50px] w-[250px] h-[250px] pointer-events-none opacity-45 blur-[60px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 102, 255, 0.7) 0%, rgba(0, 180, 255, 0.25) 50%, transparent 80%)'
                }}
              />
              <div className="flex justify-start relative z-10">
                <span className="bg-white/10 border border-white/20 text-white/80 text-xs px-3.5 py-1 rounded-full font-dm">
                  Growth
                </span>
              </div>

              <div className="mt-8 relative z-10">
                <div className="w-2 h-2 rounded-full bg-red-500 mb-2.5" />
                <h3 className="text-base sm:text-lg font-medium text-white mb-2 leading-snug font-dm">
                  Driving measurable growth through impact
                </h3>
                <p className="text-xs text-white/70 font-normal leading-relaxed font-dm">
                  Focused on reach, engagement, and real sales — not empty metrics.
                </p>
              </div>
            </div>

            {/* Card 3: Creative */}
            <div className="bg-white/5 border border-white/20 rounded-2xl p-5 sm:p-6 backdrop-blur-md flex flex-col justify-between hover:border-white/30 transition-all duration-300 min-h-[280px] sm:min-h-[340px] relative overflow-hidden">
              <div 
                className="absolute top-[-50px] right-[-50px] w-[250px] h-[250px] pointer-events-none opacity-45 blur-[60px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 102, 255, 0.7) 0%, rgba(0, 180, 255, 0.25) 50%, transparent 80%)'
                }}
              />
              <div className="flex justify-start relative z-10">
                <span className="bg-white/10 border border-white/20 text-white/80 text-xs px-3.5 py-1 rounded-full font-dm">
                  Creative
                </span>
              </div>

              <div className="mt-8 relative z-10">
                <div className="w-2 h-2 rounded-full bg-red-500 mb-2.5" />
                <h3 className="text-base sm:text-lg font-medium text-white mb-2 leading-snug font-dm">
                  Creative processes with rapid delivery
                </h3>
                <p className="text-xs text-white/70 font-normal leading-relaxed font-dm">
                  Ideas turn into results fast, without losing quality or relevance.
                </p>
              </div>
            </div>

            {/* Card 4: Powerful */}
            <div className="bg-white/5 border border-white/20 rounded-2xl p-5 sm:p-6 backdrop-blur-md flex flex-col justify-between hover:border-white/30 transition-all duration-300 min-h-[280px] sm:min-h-[340px] relative overflow-hidden">
              <div 
                className="absolute top-[-50px] right-[-50px] w-[250px] h-[250px] pointer-events-none opacity-45 blur-[60px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 102, 255, 0.7) 0%, rgba(0, 180, 255, 0.25) 50%, transparent 80%)'
                }}
              />
              <div className="flex justify-start relative z-10">
                <span className="bg-white/10 border border-white/20 text-white/80 text-xs px-3.5 py-1 rounded-full font-dm">
                  Powerful
                </span>
              </div>

              <div className="mt-8 relative z-10">
                <div className="w-2 h-2 rounded-full bg-red-500 mb-2.5" />
                <h3 className="text-base sm:text-lg font-medium text-white mb-2 leading-snug font-dm">
                  A dedicated team behind success
                </h3>
                <p className="text-xs text-white/70 font-normal leading-relaxed font-dm">
                  Our experts guide every step, from launch to scale.
                </p>
              </div>

              <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                <Sparkles size={16} />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: Testimonial & Results Section (Blue Gradient) */}
      <section ref={section4Ref} className="opacity-0 translate-y-16 will-change-transform absolute inset-0 flex flex-col items-center justify-center w-full max-w-[1400px] mx-auto px-4 sm:px-6 bg-transparent text-white">
        <div className="w-full bg-transparent overflow-hidden relative p-5 sm:p-10 md:p-12">
          
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Card: Headshot / Portrait Card with Responsive Image */}
            <div className="lg:col-span-4 bg-white/5 border border-white/20 rounded-2xl overflow-hidden relative w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:h-full min-h-[280px] sm:min-h-[340px] flex items-center justify-center group hover:border-white/30 transition-all duration-300">
              <img
                src="https://res.cloudinary.com/djlsgdiad/image/upload/v1785348924/image.png_2K_202607292340_yay0lz.jpg"
                alt="Bernice Tay"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center sm:object-top lg:object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 z-10">
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/70 font-dm block mb-1">
                  CASE STUDY
                </span>
                <h3 className="text-base sm:text-lg font-medium text-white font-dm">
                  Bernice Tay
                </h3>
                <p className="text-xs text-white/80 font-dm">
                  Founder & CEO, Omni
                </p>
              </div>
            </div>

            {/* Right Card: Testimonial & Impact Metrics with Blue Gradient */}
            <div className="lg:col-span-8 bg-white/5 border border-white/20 rounded-2xl p-5 sm:p-10 backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[340px] sm:min-h-[440px] hover:border-white/30 transition-all duration-300">
              
              {/* Blue Color Gradient Ambient Glow */}
              <div 
                className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[250px] sm:h-[380px] pointer-events-none opacity-45 blur-[70px] sm:blur-[95px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 102, 255, 0.7) 0%, rgba(0, 180, 255, 0.25) 50%, transparent 80%)'
                }}
              />

              {/* Quote Content */}
              <div className="relative z-10 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-3 sm:mb-4 text-[#0066ff]">
                  <Quote size={24} className="rotate-180 sm:w-7 sm:h-7" />
                </div>

                <p className="text-base sm:text-2xl md:text-3xl font-medium tracking-wide text-white uppercase leading-snug font-dm max-w-2xl">
                  "I WASTED MY TIME WITH OTHER AGENCIES, BUT WITH OMNI, WE INCREASED OUR REVENUE AND GOT MORE STUDENTS WITH LOW CPL AND HIGH ROAS"
                </p>
              </div>

              {/* Bottom Metrics Grid & Author */}
              <div className="relative z-10 pt-4 sm:pt-6 border-t border-white/15">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-5">
                  
                  {/* Metric 1 */}
                  <div>
                    <div className="text-xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight font-dm">
                      $15-25
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider font-dm mt-1">
                      CPL
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div>
                    <div className="text-xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight font-dm">
                      263
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider font-dm mt-1">
                      STUDENTS ENROLLED
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight font-dm">
                      11.11X
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider font-dm mt-1">
                      RETURN ON ROAS
                    </div>
                  </div>

                </div>

                {/* Author Tag */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-white/80 font-dm uppercase tracking-wider pt-2">
                  <span>— BERNICE TAY</span>
                  <span className="text-white/50 text-[10px] sm:text-xs">BERNICE TAY</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: Core Services / Bespoke Curations Section */}
      <section ref={section5Ref} className="opacity-0 translate-y-16 will-change-transform absolute inset-0 flex flex-col items-center justify-center w-full max-w-[1400px] mx-auto px-4 sm:px-6 bg-transparent text-white">
        <div className="w-full bg-transparent overflow-hidden relative p-5 sm:p-12 md:p-16 flex flex-col items-center">
          
          {/* Subtle Ambient Background Glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[700px] h-[250px] sm:h-[400px] pointer-events-none opacity-15 blur-[90px] sm:blur-[120px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 102, 255, 0.5) 0%, rgba(235, 110, 60, 0.3) 50%, transparent 80%)'
            }}
          />



          {/* Grid Layout: 2 cards left, empty space in middle, 2 cards right */}
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch relative z-10">
            
            {/* Left Column Stack (Cards 1 & 2) */}
            <div className="flex flex-col gap-5 sm:gap-6">
              {/* Card 1: Global Concierge */}
              <div className="bg-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between hover:border-white/35 hover:bg-white/[0.07] transition-all duration-300 min-h-[210px] group shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Globe size={19} className="text-black" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-white mb-2 tracking-tight font-dm">
                    Global Concierge
                  </h3>
                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-normal font-dm">
                    Dedicated 24/7 personal trip managers overseeing every detail across European destinations.
                  </p>
                </div>
              </div>

              {/* Card 2: VIP Access */}
              <div className="bg-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between hover:border-white/35 hover:bg-white/[0.07] transition-all duration-300 min-h-[210px] group shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Award size={19} className="text-black" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-white mb-2 tracking-tight font-dm">
                    VIP Access
                  </h3>
                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-normal font-dm">
                    Skip-the-line privileges to world-class monuments, private estates, and Michelin-starred dining.
                  </p>
                </div>
              </div>
            </div>

            {/* Center Column: Empty Spacer */}
            <div className="hidden lg:block lg:col-span-1"></div>

            {/* Right Column Stack (Cards 3 & 4) */}
            <div className="flex flex-col gap-5 sm:gap-6">
              {/* Card 3: Flexible Scheduling */}
              <div className="bg-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between hover:border-white/35 hover:bg-white/[0.07] transition-all duration-300 min-h-[210px] group shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Clock size={19} className="text-black" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-white mb-2 tracking-tight font-dm">
                    Flexible Scheduling
                  </h3>
                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-normal font-dm">
                    Adaptable itineraries customized dynamically to your preferred pace and spontaneous requests.
                  </p>
                </div>
              </div>

              {/* Card 4: Bespoke Curations */}
              <div className="bg-white/5 border border-white/20 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between hover:border-white/35 hover:bg-white/[0.07] transition-all duration-300 min-h-[210px] group shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Sparkle size={19} className="text-black" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-white mb-2 tracking-tight font-dm">
                    Bespoke Curations
                  </h3>
                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-normal font-dm">
                    Hand-crafted micro-tours designed around art, gastronomy, fashion, or historic discoveries.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
      </div>

    </div>
  );
}
