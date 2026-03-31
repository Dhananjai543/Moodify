import { useEffect, useRef, useCallback } from 'react';
import { generateCodeVerifier, generateCodeChallenge, storeCodeVerifier } from '../auth/pkce';
import { buildAuthUrl } from '../services/spotify';
import AnimatedBackground from '../components/AnimatedBackground';
import gsap from 'gsap';

function useTilt(ref) {
  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -18;
    const rotateY = ((x - centerX) / centerX) * 18;
    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  }, [ref]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, [ref]);

  const handleClick = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el,
      { rotateX: 25, rotateY: -6, scale: 0.88 },
      { rotateX: 0, rotateY: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.25)',
        clearProps: 'transform',
        onComplete: () => { el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'; }
      }
    );
  }, [ref]);

  return { handleMouseMove, handleMouseLeave, handleClick };
}

function LiquidGlassCard({ children, index, cardRef }) {
  const innerRef = useRef(null);
  const shineRef = useRef(null);
  const combinedRef = useCallback((el) => {
    innerRef.current = el;
    if (cardRef) cardRef(el);
  }, [cardRef]);

  const handleMouseMove = (e) => {
    const el = innerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;

    if (shineRef.current) {
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      shineRef.current.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(0,255,135,0.2) 0%, rgba(164,255,185,0.06) 40%, transparent 70%)`;
    }
  };

  const handleMouseLeave = () => {
    const el = innerRef.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    if (shineRef.current) {
      shineRef.current.style.background = 'transparent';
    }
  };

  const handleClick = () => {
    const el = innerRef.current;
    if (!el) return;
    gsap.fromTo(el,
      { rotateX: -6, rotateY: 4, scale: 0.95 },
      { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.35)',
        clearProps: 'transform',
        onComplete: () => { el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'; }
      }
    );
  };

  return (
    <div
      ref={combinedRef}
      className="liquid-glass rounded-3xl p-8 flex flex-col items-center gap-5 text-center cursor-pointer"
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out',
        willChange: 'transform, opacity',
        opacity: 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Shine / light refraction overlay */}
      <div
        ref={shineRef}
        className="absolute inset-0 rounded-3xl pointer-events-none z-10"
        style={{ transition: 'background 0.2s ease' }}
      />
      {children}
    </div>
  );
}

export default function Login() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const taglineRef = useRef(null);
  const btnRef = useRef(null);
  const howRef = useRef(null);
  const howTitleRef = useRef(null);
  const cardsRef = useRef([]);
  const isVisible = useRef(false);

  const btnTilt = useTilt(btnRef);

  const handleLogin = async () => {
    const verifier = generateCodeVerifier();
    storeCodeVerifier(verifier);
    const challenge = await generateCodeChallenge(verifier);
    window.location.href = buildAuthUrl(challenge);
  };

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 60, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2 }
    )
      .fromTo(
        taglineRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      )
      .fromTo(
        btnRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 },
        '-=0.4'
      );

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const cards = cardsRef.current.filter(Boolean);

        if (entry.isIntersecting && !isVisible.current) {
          isVisible.current = true;

          gsap.to(howTitleRef.current, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.8, ease: 'power3.out',
          });

          cards.forEach((card, i) => {
            gsap.to(card, {
              opacity: 1, y: 0, rotateX: 0, rotateY: 0, scale: 1,
              duration: 1, ease: 'power3.out',
              delay: 0.12 + i * 0.18,
            });
          });
        } else if (!entry.isIntersecting && isVisible.current) {
          isVisible.current = false;

          gsap.to(howTitleRef.current, {
            opacity: 0, y: 30, scale: 0.9,
            duration: 0.5, ease: 'power2.in',
          });

          cards.forEach((card, i) => {
            gsap.to(card, {
              opacity: 0, y: 80, rotateX: 10, scale: 0.9,
              duration: 0.5, ease: 'power2.in',
              delay: i * 0.06,
            });
          });
        }
      });
    };

    if (howTitleRef.current) {
      gsap.set(howTitleRef.current, { opacity: 0, y: 30, scale: 0.9 });
    }
    cardsRef.current.filter(Boolean).forEach((card) => {
      gsap.set(card, { opacity: 0, y: 100, rotateX: 15, rotateY: -5, scale: 0.85 });
    });

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.08,
    });
    if (howRef.current) observer.observe(howRef.current);

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-emerald-glow" style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,135,0.5))' }}>
          <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
          <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
        </svg>
      ),
      title: 'Speak',
      desc: 'Tell us how you feel. Use your voice or type it out.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-emerald-glow" style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,135,0.5))' }}>
          <path d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0 .55 2.02L3.3 13.27a1 1 0 0 0 .26 1.39l2.12 1.42a1 1 0 0 0 1.24-.1l4.3-4.05A4 4 0 1 0 12 2Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
          <path d="M19.5 13a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM7 16.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm0 3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
        </svg>
      ),
      title: 'AI Analyzes',
      desc: 'Our AI reads your mood and picks songs that match your vibe.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-emerald-glow" style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,135,0.5))' }}>
          <path d="M15 2H9a1 1 0 0 0-1 1v14a1 1 0 0 0 1.5.87L12 16.3l2.5 1.57A1 1 0 0 0 16 17V3a1 1 0 0 0-1-1Z" />
          <path d="M5 5a1 1 0 0 0-1 1v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a1 1 0 0 0-1-1h-1v12a3 3 0 0 1-1.66 2.68 3 3 0 0 1-3.17-.18L12 18.54l-2.17 1.36A3 3 0 0 1 6 17.64V5Z" />
        </svg>
      ),
      title: 'Playlist Created',
      desc: 'A real Spotify playlist lands in your account, ready to play.',
    },
  ];

  return (
    <div className="min-h-screen text-on-surface flex flex-col relative overflow-hidden">
      <AnimatedBackground />

      {/* Aurora overlay blobs */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,135,0.08) 0%, transparent 70%)',
            animation: 'aurora-drift 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[-30%] right-[-15%] w-[50vw] h-[50vw] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(0,237,125,0.06) 0%, transparent 70%)',
            animation: 'aurora-drift 15s ease-in-out infinite 3s',
          }}
        />
        <div
          className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(0,108,72,0.1) 0%, transparent 70%)',
            animation: 'aurora-drift 10s ease-in-out infinite 6s',
          }}
        />
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center min-h-screen"
      >
        <h1
          ref={titleRef}
          className="font-headline text-8xl sm:text-9xl lg:text-[10rem] font-black tracking-tight mb-6 opacity-0"
          style={{ letterSpacing: '-0.03em', fontOpticalSizing: 'auto' }}
        >
          Mood<span className="text-glow text-emerald-glow">ify</span>
        </h1>

        <p
          ref={taglineRef}
          className="font-headline italic text-on-surface-variant text-xl sm:text-2xl lg:text-3xl mb-12 max-w-lg opacity-0"
          style={{ lineHeight: 1.6, letterSpacing: '0.01em' }}
        >
          Speak your mood, get a playlist.
        </p>

        <button
          ref={btnRef}
          onClick={handleLogin}
          onMouseMove={btnTilt.handleMouseMove}
          onMouseLeave={btnTilt.handleMouseLeave}
          onMouseDown={btnTilt.handleClick}
          className="btn-cta flex items-center gap-3 py-4 px-12 rounded-full text-lg opacity-0 cursor-pointer"
          style={{ transformStyle: 'preserve-3d', transition: 'transform 0.12s ease-out' }}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Get Started with Spotify
        </button>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 flex flex-col items-center gap-3 animate-[float_2.5s_ease-in-out_infinite]">
          <span
            className="text-xs font-body font-semibold uppercase tracking-[0.25em] text-emerald-glow"
            style={{ textShadow: '0 0 12px rgba(0,255,135,0.5), 0 0 24px rgba(0,255,135,0.2)' }}
          >
            Scroll
          </span>
          <div className="flex flex-col items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-glow" style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,135,0.6))' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-glow/50 -mt-2" style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,135,0.3))' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section ref={howRef} className="relative z-10 pb-28 pt-20 px-6">
        <h2
          ref={howTitleRef}
          className="text-center font-headline text-sm font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-16 opacity-0"
        >
          How it works
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <LiquidGlassCard
              key={step.title}
              index={i}
              cardRef={(el) => (cardsRef.current[i] = el)}
            >
              {/* Icon */}
              <div className="relative z-20 w-18 h-18 rounded-2xl flex items-center justify-center liquid-icon-bg">
                {step.icon}
              </div>
              {/* Title */}
              <h3 className="relative z-20 font-body text-on-surface font-semibold text-xl tracking-wide">
                {step.title}
              </h3>
              {/* Description */}
              <p className="relative z-20 font-body text-on-surface-variant text-sm leading-relaxed">
                {step.desc}
              </p>
            </LiquidGlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}
