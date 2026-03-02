import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './index.css';
import { slides, TEAM_MEMBERS } from './slideData';
import { VisualForType } from './Visuals';

// ─────────────────────────────────────────────────────────────
// KaTeX renderer component
// ─────────────────────────────────────────────────────────────
function KaTeXSpan({ tex, display = false, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(tex, ref.current, {
        throwOnError: false,
        displayMode: display,
        trust: true,
        strict: false,
      });
    } catch (e) {
      ref.current.textContent = tex;
    }
  }, [tex, display]);
  return <span ref={ref} className={className} />;
}

// ─────────────────────────────────────────────────────────────
// Tag Badge
// ─────────────────────────────────────────────────────────────
const TAG_COLORS = {
  blue:   { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
  purple: { bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9' },
  teal:   { bg: '#f0fdfa', border: '#0d9488', text: '#0f766e' },
  gold:   { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
};

function TagBadge({ tag, color = 'blue' }) {
  const c = TAG_COLORS[color] || TAG_COLORS.blue;
  return (
    <span style={{
      display: 'inline-block',
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      color: c.text,
      borderRadius: '20px',
      padding: '3px 14px',
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {tag}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Formula Block with glow
// ─────────────────────────────────────────────────────────────
function FormulaBlock({ latex, glow = 'blue', index }) {
  const [active, setActive] = useState(false);
  const glowClass =
    glow === 'gold' ? 'formula-glow-gold' :
    glow === 'teal' ? 'formula-glow-green' :
    'formula-glow';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 * index, duration: 0.4 }}
      className={`${glowClass}${active ? ' active' : ''}`}
      style={{ marginBottom: '10px', cursor: 'default', textAlign: 'center' }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <KaTeXSpan tex={latex} display={true} />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Example Step
// ─────────────────────────────────────────────────────────────
function ExampleBox({ example }) {
  if (!example) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      style={{
        background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)',
        border: '1.5px solid #e2e8f0',
        borderLeft: '4px solid #0d9488',
        borderRadius: '10px',
        padding: '12px 16px',
        marginTop: '10px',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f766e', marginBottom: '8px' }}>
        📐 {example.title}
      </div>
      {example.steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + i * 0.12 }}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '6px',
            padding: '4px 6px',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.7)',
          }}
        >
          <span style={{
            minWidth: '20px',
            height: '20px',
            background: '#0d9488',
            color: 'white',
            borderRadius: '50%',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>{i + 1}</span>
          <KaTeXSpan tex={step} display={false} />
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bullet List
// ─────────────────────────────────────────────────────────────
function BulletList({ bullets }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {bullets.map((b, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#334155',
            lineHeight: 1.5,
          }}
        >
          <span style={{
            minWidth: '8px', height: '8px',
            background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
            borderRadius: '50%',
            marginTop: '6px',
            flexShrink: 0,
          }} />
          {b}
        </motion.li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────
// Presenter Badge
// ─────────────────────────────────────────────────────────────
function PresenterBadge({ presenter, slideNum }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '10px',
    }}>
      <div style={{
        width: 32, height: 32,
        background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '13px',
        fontWeight: 700,
        flexShrink: 0,
      }}>
        {presenter.split(' ').map(w => w[0]).slice(0, 2).join('')}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e3a8a' }}>{presenter}</div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>Slide {slideNum} of 40</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Audio Controls Panel
// ─────────────────────────────────────────────────────────────
function AudioPanel({ slide, onEnded, onUpload, audioSrc }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
  }, [slide.id]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const p = audioRef.current.currentTime / (audioRef.current.duration || 1);
    setProgress(isNaN(p) ? 0 : p);
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
    if (onEnded) onEnded();
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const seek = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * (audioRef.current.duration || 0);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)',
      border: '1.5px solid #e2e8f0',
      borderRadius: '12px',
      padding: '10px 14px',
      marginTop: '8px',
    }}>
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <button
          onClick={toggle}
          disabled={!audioSrc}
          style={{
            width: 34, height: 34,
            borderRadius: '50%',
            background: audioSrc
              ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)'
              : '#e2e8f0',
            border: 'none',
            color: 'white',
            cursor: audioSrc ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px',
            flexShrink: 0,
          }}
        >
          {playing ? '⏸' : '▶'}
        </button>
        {/* Progress bar */}
        <div
          onClick={audioSrc ? seek : undefined}
          style={{
            flex: 1, height: '6px',
            background: '#e2e8f0',
            borderRadius: '3px',
            cursor: audioSrc ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', left: 0, top: 0,
            height: '100%',
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)',
            borderRadius: '3px',
            transition: 'width 0.1s linear',
          }} />
        </div>
        <span style={{ fontSize: '11px', color: '#64748b', minWidth: '35px' }}>
          {duration ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}` : '--:--'}
        </span>
      </div>
      {/* Upload */}
      <label style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        cursor: 'pointer',
        fontSize: '11px', color: '#64748b',
      }}>
        <span style={{
          background: '#f1f5f9', border: '1px solid #e2e8f0',
          borderRadius: '6px', padding: '2px 8px',
          color: '#334155', fontWeight: 600,
        }}>
          📁 Upload Audio
        </span>
        <input
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={e => {
            if (e.target.files[0] && onUpload) {
              onUpload(URL.createObjectURL(e.target.files[0]));
            }
          }}
        />
        <span>{audioSrc ? '✅ Audio loaded' : 'No audio yet'}</span>
      </label>
      {/* Narration text */}
      <div style={{
        marginTop: '8px',
        fontSize: '11px',
        color: '#64748b',
        lineHeight: 1.5,
        maxHeight: '50px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <em>{slide.narration?.slice(0, 120)}…</em>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TITLE SLIDE
// ─────────────────────────────────────────────────────────────
function TitleSlide({ slide }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', textAlign: 'center', padding: '40px',
      position: 'relative',
    }}>
      {/* Animated background pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: '700px', width: '100%' }}
      >
        {/* Group badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)',
            color: 'white',
            borderRadius: '30px',
            padding: '6px 24px',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            marginBottom: '18px',
          }}
        >
          ⚡ GROUP: HEROES
        </motion.div>

        {/* Chapter label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: '16px', color: '#6366f1', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.06em' }}
        >
          {slide.chapter}
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            fontSize: 'clamp(28px,4.5vw,52px)',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.15,
            marginBottom: '8px',
            background: 'linear-gradient(135deg,#1e3a8a,#6366f1,#8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {slide.title}
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: '20px', fontWeight: 600, color: '#334155', marginBottom: '24px' }}
        >
          {slide.subtitle}
        </motion.h2>

        {/* Decorative formula */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="formula-glow"
          style={{ display: 'inline-block', marginBottom: '28px', padding: '10px 24px' }}
        >
          <KaTeXSpan
            tex="\\nabla = \\mathbf{i}\\frac{\\partial}{\\partial x} + \\mathbf{j}\\frac{\\partial}{\\partial y} + \\mathbf{k}\\frac{\\partial}{\\partial z}"
            display={false}
          />
        </motion.div>

        {/* College & instructors */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ marginBottom: '20px' }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>
            🎓 {slide.college}
          </div>
          <div style={{ fontSize: '13px', color: '#334155' }}>
            Supervised by: <strong>{slide.instructors.join(' / ')}</strong>
          </div>
        </motion.div>

        {/* Team members */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            display: 'flex', flexWrap: 'wrap', gap: '6px',
            justifyContent: 'center',
          }}
        >
          {TEAM_MEMBERS.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + i * 0.06 }}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              {m.name.split(' ').slice(0, 2).join(' ')}
              <span style={{ color: '#94a3b8', marginLeft: '4px' }}>
                ({m.slides[0]}–{m.slides[m.slides.length - 1]})
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTENT SLIDE
// ─────────────────────────────────────────────────────────────
function ContentSlide({ slide, audioSrc, onAudioEnded, onAudioUpload, isActive }) {
  const hasExample = !!slide.example;
  const hasBullets = slide.bullets && slide.bullets.length > 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 280px',
      gridTemplateRows: 'auto 1fr',
      gap: '16px',
      height: '100%',
      padding: '20px 24px',
    }}>
      {/* ── LEFT COLUMN ── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Presenter + tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <PresenterBadge presenter={slide.presenter} slideNum={slide.slideNum} />
          <TagBadge tag={slide.tag} color={slide.tagColor} />
        </div>

        {/* Topic title */}
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: 'clamp(18px,2.2vw,28px)',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '14px',
            lineHeight: 1.2,
          }}
        >
          {slide.topic}
        </motion.h2>

        {/* Formulas */}
        {slide.formulas && slide.formulas.map((f, i) => (
          <FormulaBlock key={i} latex={f.latex} glow={f.glow} index={i} />
        ))}

        {/* Bullets */}
        {hasBullets && (
          <div style={{ marginTop: '8px', flex: hasExample ? 0 : 1 }}>
            <BulletList bullets={slide.bullets} />
          </div>
        )}

        {/* Example */}
        {hasExample && (
          <div style={{ marginTop: '8px', overflowY: 'auto', flex: 1 }}>
            <ExampleBox example={slide.example} />
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '12px',
        overflow: 'hidden',
      }}>
        {/* Visual */}
        <div style={{
          background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)',
          border: '1.5px solid #e2e8f0',
          borderRadius: '14px',
          padding: '10px',
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <VisualForType type={slide.visual} animate={isActive} />
        </div>

        {/* Audio */}
        <AudioPanel
          slide={slide}
          audioSrc={audioSrc}
          onEnded={onAudioEnded}
          onUpload={onAudioUpload}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SLIDE PROGRESS BAR
// ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = (current / (total - 1)) * 100;
  return (
    <div style={{
      height: '3px',
      background: '#f1f5f9',
      position: 'relative',
    }}>
      <motion.div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)',
          borderRadius: '2px',
        }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SLIDE NAVIGATOR (thumbnail strip)
// ─────────────────────────────────────────────────────────────
function SlideNavigator({ slides, current, onGo }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const btn = el.querySelector(`[data-idx="${current}"]`);
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [current]);

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        gap: '4px',
        overflowX: 'auto',
        padding: '6px 12px',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        scrollbarWidth: 'thin',
      }}
    >
      {slides.map((s, i) => {
        const isTitle = s.type === 'title';
        const isCurrent = i === current;
        const presenter = s.presenter || '';
        const initials = isTitle ? '⚡' :
          presenter.split(' ').map(w => w[0]).slice(0, 2).join('');
        const member = TEAM_MEMBERS.find(m => m.slides?.includes(s.slideNum));
        const memberIdx = member ? TEAM_MEMBERS.indexOf(member) : -1;
        const memberColors = [
          '#3b82f6','#8b5cf6','#10b981','#f59e0b',
          '#ef4444','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1',
        ];
        const color = memberIdx >= 0 ? memberColors[memberIdx % memberColors.length] : '#3b82f6';

        return (
          <button
            key={i}
            data-idx={i}
            onClick={() => onGo(i)}
            title={isTitle ? 'Title Slide' : `Slide ${s.slideNum}: ${s.topic}`}
            style={{
              minWidth: isCurrent ? '52px' : '34px',
              height: '34px',
              borderRadius: '8px',
              border: isCurrent ? `2px solid ${color}` : '1.5px solid #e2e8f0',
              background: isCurrent ? `${color}22` : 'white',
              color: isCurrent ? color : '#64748b',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
            }}
          >
            {isTitle ? '⚡' : (
              <>
                <span>{initials}</span>
                {isCurrent && <span style={{ fontSize: '10px' }}>·{s.slideNum}</span>}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────
function Header({ slide, totalSlides, currentIdx }) {
  const isTitle = slide.type === 'title';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      borderBottom: '1px solid #f1f5f9',
      background: 'white',
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg,#1e3a8a,#6366f1)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '16px', fontWeight: 900,
        }}>∇</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
            Gradient, Divergence & Curl
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Faculty of Science · Alexandria University
          </div>
        </div>
      </div>

      {!isTitle && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '4px 12px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#334155',
          }}>
            Slide {slide.slideNum} / 40
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Dr. Mona Gad · Dr. Mona Khattab
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAVIGATION ARROWS
// ─────────────────────────────────────────────────────────────
function NavArrow({ dir, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'fixed',
        top: '50%',
        [dir === 'prev' ? 'left' : 'right']: '14px',
        transform: 'translateY(-50%)',
        width: 44, height: 44,
        borderRadius: '50%',
        background: disabled ? '#f1f5f9' : 'white',
        border: `2px solid ${disabled ? '#e2e8f0' : '#3b82f6'}`,
        color: disabled ? '#cbd5e1' : '#1e3a8a',
        fontSize: '18px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: disabled ? 'none' : '0 4px 12px rgba(59,130,246,0.2)',
        transition: 'all 0.15s',
        zIndex: 100,
      }}
    >
      {dir === 'prev' ? '‹' : '›'}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// SLIDE COUNTER (top mini bar)
// ─────────────────────────────────────────────────────────────
function MiniCounter({ current, total }) {
  return (
    <div style={{
      position: 'fixed', bottom: 100, right: 16,
      background: 'white', border: '1px solid #e2e8f0',
      borderRadius: '20px', padding: '4px 12px',
      fontSize: '12px', fontWeight: 700, color: '#334155',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      zIndex: 50,
    }}>
      {current} / {total - 1}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [audioPaths, setAudioPaths] = useState({});
  const totalSlides = slides.length;

  const currentSlide = slides[currentIdx];

  const goTo = useCallback((idx) => {
    if (idx < 0 || idx >= totalSlides) return;
    setDirection(idx > currentIdx ? 1 : -1);
    setCurrentIdx(idx);
  }, [currentIdx, totalSlides]);

  const goNext = useCallback(() => goTo(currentIdx + 1), [currentIdx, goTo]);
  const goPrev = useCallback(() => goTo(currentIdx - 1), [currentIdx, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Home') {
        goTo(0);
      } else if (e.key === 'End') {
        goTo(totalSlides - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, goTo, totalSlides]);

  // Wheel navigation
  useEffect(() => {
    let locked = false;
    const handler = (e) => {
      if (locked) return;
      locked = true;
      if (e.deltaY > 30) goNext();
      else if (e.deltaY < -30) goPrev();
      setTimeout(() => { locked = false; }, 600);
    };
    window.addEventListener('wheel', handler, { passive: true });
    return () => window.removeEventListener('wheel', handler);
  }, [goNext, goPrev]);

  const handleAudioUpload = (slideId, src) => {
    setAudioPaths(prev => ({ ...prev, [slideId]: src }));
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? '40%' : '-40%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: (dir) => ({
      x: dir > 0 ? '-40%' : '40%',
      opacity: 0,
      transition: { duration: 0.25, ease: 'easeIn' },
    }),
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'white',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>
      <Header slide={currentSlide} totalSlides={totalSlides} currentIdx={currentIdx} />
      <ProgressBar current={currentIdx} total={totalSlides} />

      {/* Main slide area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentIdx}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'white',
            }}
          >
            {currentSlide.type === 'title' ? (
              <TitleSlide slide={currentSlide} />
            ) : (
              <ContentSlide
                slide={currentSlide}
                audioSrc={audioPaths[currentSlide.id]}
                onAudioEnded={goNext}
                onAudioUpload={(src) => handleAudioUpload(currentSlide.id, src)}
                isActive={true}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide navigator strip */}
      <SlideNavigator slides={slides} current={currentIdx} onGo={goTo} />

      {/* Nav arrows */}
      <NavArrow dir="prev" onClick={goPrev} disabled={currentIdx === 0} />
      <NavArrow dir="next" onClick={goNext} disabled={currentIdx === totalSlides - 1} />
      <MiniCounter current={currentIdx} total={totalSlides} />
    </div>
  );
}
