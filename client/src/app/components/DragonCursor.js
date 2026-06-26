'use client';

import { useEffect, useRef, useState } from 'react';

export default function DragonCursor() {
  const svgRef = useRef(null);
  const screenRef = useRef(null);
  const starsGroupRef = useRef(null);

  // Persistence refs to prevent data loss when HUD toggles collapsed state
  const scoreRef = useRef(0);
  const evolvedRef = useRef(false);
  const evolved2Ref = useRef(false);

  // Set HUD collapsed by default to not block the Hire Me button
  const [isHudCollapsed, setIsHudCollapsed] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const screen = screenRef.current;
    const starsGroup = starsGroupRef.current;
    if (!screen || !starsGroup) return;

    const xmlns = "http://www.w3.org/2000/svg";
    const xlinkns = "http://www.w3.org/1999/xlink";

    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, false);

    // Scaling factor for the dragon cursor.
    let baseScaleFactor = 0.22;
    const N = 40;
    const elems = [];
    
    // Initialize elements
    for (let i = 0; i < N; i++) {
      elems[i] = { use: null, x: width / 2, y: 0 };
    }

    const pointer = { x: width / 2, y: height / 2 };
    const radm = Math.min(pointer.x, pointer.y) - 20;
    let frm = Math.random();
    let rad = 0;

    const handlePointerMove = (e) => {
      // Only follow mouse if not in rampage auto-eat mode (score < 300)
      if (scoreRef.current < 300) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        rad = 0;
      }
    };

    window.addEventListener("pointermove", handlePointerMove, false);

    // Prepend SVG elements
    const prepend = (useId, i) => {
      const elem = document.createElementNS(xmlns, "use");
      elems[i].use = elem;
      
      // Determine correct asset based on current score
      let resolvedId = useId;
      if (evolved2Ref.current) {
        resolvedId = useId + "Fire";
      } else if (evolvedRef.current) {
        resolvedId = useId + "Evolved";
      }
      
      elem.setAttributeNS(xlinkns, "xlink:href", "#" + resolvedId);
      screen.prepend(elem);
    };

    for (let i = 1; i < N; i++) {
      if (i === 1) prepend("Cabeza", i);
      else if (i === 8 || i === 14) prepend("Aletas", i);
      else prepend("Espina", i);
    }

    // ─── Stars & Eating Logic ────────────────────────────────────────────────
    let stars = [];
    let particles = [];
    const MAX_STARS = 40;
    let reloadTriggered = false;

    // Helper to get devourable elements on the website
    const getWebElements = () => {
      const selectors = 'p, span, h1, h2, h3, h4, h5, h6, button, a, img, input, code, pre, .glass-card';
      return Array.from(document.querySelectorAll(selectors))
        .filter(el => {
          // Do not eat the dragon HUD, the cursor itself, or unrendered components
          if (el.closest('#dragon-hud') || el.closest('svg') === svgRef.current) return false;
          const rect = el.getBoundingClientRect();
          return (
            rect.width > 0 && 
            rect.height > 0 && 
            el.style.opacity !== '0' && 
            el.style.visibility !== 'hidden' && 
            el.getAttribute('data-eaten') !== 'true'
          );
        });
    };

    const spawnStar = (initial = false) => {
      // Don't spawn star food if in rampage mode
      if (scoreRef.current >= 300) return;

      const star = {
        x: Math.random() * width,
        y: Math.random() * height,
        scale: 0.5 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        opacity: initial ? 0.8 : 0,
        eaten: false,
        element: document.createElementNS(xmlns, "use")
      };
      star.element.setAttributeNS(xlinkns, "xlink:href", "#Star");
      star.element.setAttribute("transform", `translate(${star.x}, ${star.y}) scale(${star.scale})`);
      star.element.setAttribute("opacity", star.opacity.toString());
      starsGroup.appendChild(star.element);
      stars.push(star);
    };

    // Pre-populate stars
    for (let i = 0; i < 20; i++) {
      spawnStar(true);
    }

    const createBurst = (x, y, customColor = null) => {
      let particleColor = customColor;
      if (!particleColor) {
        if (scoreRef.current >= 200) particleColor = "#FF8C00";
        else if (scoreRef.current >= 100) particleColor = "#FF007F";
        else particleColor = "#00F0FF";
      }

      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        const p = {
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          element: document.createElementNS(xmlns, "circle")
        };
        p.element.setAttribute("r", (2 + Math.random() * 4).toString());
        p.element.setAttribute("fill", i % 2 === 0 ? particleColor : "#FFFFFF");
        p.element.setAttribute("cx", x.toString());
        p.element.setAttribute("cy", y.toString());
        p.element.setAttribute("style", `filter: drop-shadow(0px 0px 4px ${particleColor})`);
        starsGroup.appendChild(p.element);
        particles.push(p);
      }
    };

    let animationFrameId;

    const run = () => {
      animationFrameId = requestAnimationFrame(run);
      let e = elems[0];

      // ─── 300+ Point RAMPAGE Auto-Eat targeting ─────────────────────────────
      if (scoreRef.current >= 300) {
        const targets = getWebElements();
        if (targets.length > 0) {
          // Find closest DOM element
          let closest = null;
          let minDist = Infinity;
          targets.forEach(el => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = cx - e.x;
            const dy = cy - e.y;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
              minDist = dist;
              closest = { el, cx, cy, rect };
            }
          });

          if (closest) {
            // Direct the dragon head to the element center
            pointer.x = closest.cx;
            pointer.y = closest.cy;
            rad = 0;

            // Check if head collided with element bounds (or is very close)
            const headDist = Math.sqrt((closest.cx - e.x) ** 2 + (closest.cy - e.y) ** 2);
            if (headDist < Math.max(35, closest.rect.width / 2)) {
              // Devour the element!
              closest.el.setAttribute('data-eaten', 'true');
              closest.el.style.transition = 'all 0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)';
              closest.el.style.transform = 'scale(0) rotate(15deg)';
              closest.el.style.opacity = '0';
              closest.el.style.pointerEvents = 'none';

              createBurst(closest.cx, closest.cy, "#FF3300");

              // Increment rampage score
              scoreRef.current++;
              const hudScore = document.getElementById("dragon-score");
              if (hudScore) hudScore.innerText = `${scoreRef.current}`;
            }
          }
        } else {
          // Everything is eaten! Trigger reload
          if (!reloadTriggered) {
            reloadTriggered = true;
            const hudLevel = document.getElementById("dragon-level");
            if (hudLevel) {
              hudLevel.innerText = 'SYS RESET: ALL DEVOURED';
              hudLevel.style.color = '#FFFFFF';
            }
            setTimeout(() => {
              window.location.reload();
            }, 1800);
          }
        }
      }

      const ax = (Math.cos(3 * frm) * rad * width) / height;
      const ay = (Math.sin(4 * frm) * rad * height) / width;
      e.x += (ax + pointer.x - e.x) / 10;
      e.y += (ay + pointer.y - e.y) / 10;

      for (let i = 1; i < N; i++) {
        let e = elems[i];
        let ep = elems[i - 1];
        const a = Math.atan2(e.y - ep.y, e.x - ep.x);
        e.x += (ep.x - e.x + (Math.cos(a) * (100 - i)) / 5) / 4;
        e.y += (ep.y - e.y + (Math.sin(a) * (100 - i)) / 5) / 4;
        
        // Dragon scales up: Evolved (1.35x), Fire Evolved / Rampage (1.6x)
        let scaleMultiplier = 1.0;
        if (scoreRef.current >= 200) scaleMultiplier = 1.6;
        else if (scoreRef.current >= 100) scaleMultiplier = 1.35;
        
        const s = ((162 + 4 * (1 - i)) / 50) * baseScaleFactor * scaleMultiplier;
        
        e.use.setAttributeNS(
          null,
          "transform",
          `translate(${(ep.x + e.x) / 2},${(ep.y + e.y) / 2}) rotate(${(180 / Math.PI) * a}) scale(${s},${s})`
        );

        // ─── 200+ Point Fire Aura Effects ───────────────────────────────────
        if (scoreRef.current >= 200 && Math.random() < 0.05) {
          const p = {
            x: e.x + (Math.random() * 12 - 6),
            y: e.y + (Math.random() * 12 - 6),
            vx: (Math.random() * 1.5 - 0.75),
            vy: -1.5 - Math.random() * 2, // Rise upwards like flames
            life: 1.0,
            color: Math.random() < 0.5 ? "#FF3300" : Math.random() < 0.85 ? "#FF8C00" : "#FFE766",
            element: document.createElementNS(xmlns, "circle")
          };
          p.element.setAttribute("r", (1.5 + Math.random() * 3.5).toString());
          p.element.setAttribute("fill", p.color);
          p.element.setAttribute("cx", p.x.toString());
          p.element.setAttribute("cy", p.y.toString());
          p.element.setAttribute("style", `filter: drop-shadow(0px 0px 4px ${p.color})`);
          starsGroup.appendChild(p.element);
          particles.push(p);
        }
      }

      if (rad < radm) rad++;
      frm += 0.003;

      if (rad > 60 && scoreRef.current < 300) {
        pointer.x += (width / 2 - pointer.x) * 0.05;
        pointer.y += (height / 2 - pointer.y) * 0.05;
      }

      // ─── Update Stars ──────────────────────────────────────────────────────
      if (stars.length < MAX_STARS && Math.random() < 0.04) {
        spawnStar(false);
      }

      const headX = elems[0].x;
      const headY = elems[0].y;

      stars = stars.filter((star) => {
        // Fade in
        if (star.opacity < 0.9) {
          star.opacity += 0.02;
          star.element.setAttribute("opacity", star.opacity.toString());
        }

        // Pulse scale
        const scaleVal = star.scale * (1 + 0.2 * Math.sin(frm * 8 + star.phase));
        star.element.setAttribute("transform", `translate(${star.x}, ${star.y}) scale(${scaleVal})`);

        // Check if eaten by head
        const dx = star.x - headX;
        const dy = star.y - headY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 32) {
          createBurst(star.x, star.y);
          if (starsGroup.contains(star.element)) {
            starsGroup.removeChild(star.element);
          }

          scoreRef.current++;

          // Query DOM elements dynamically to support React re-renders safely
          const hudScore = document.getElementById("dragon-score");
          const hudBar = document.getElementById("dragon-bar");
          const hudLevel = document.getElementById("dragon-level");

          if (hudScore) {
            hudScore.innerText = scoreRef.current >= 300 ? `${scoreRef.current}` : (evolvedRef.current && !evolved2Ref.current) ? `${scoreRef.current} / 200` : evolved2Ref.current ? `${scoreRef.current} / 300` : `${scoreRef.current} / 100`;
          }
          if (hudBar) {
            let maxScore = evolved2Ref.current ? 300 : evolvedRef.current ? 200 : 100;
            hudBar.style.width = `${Math.min(100, (scoreRef.current / maxScore) * 100)}%`;
          }

          // ─── 300+ Point RAMPAGE Mode Activation ────────────────────────────
          if (scoreRef.current >= 300) {
            if (hudLevel) {
              hudLevel.innerText = '🚨 RAMPAGE: EATING INTERFACE';
              hudLevel.style.color = '#FF3300';
              hudLevel.style.animation = 'pulse 1s infinite';
            }
            if (hudScore) {
              hudScore.style.color = '#FF3300';
            }
            if (hudBar) {
              hudBar.style.background = 'repeating-linear-gradient(45deg, #FF3300, #FF3300 10px, #FFE766 10px, #FFE766 20px)';
              hudBar.style.boxShadow = '0 0 15px #FF3300, 0 0 30px #FFE766';
            }
          }
          // ─── 200+ Point Fire Mode Activation ──────────────────────────────
          else if (scoreRef.current >= 200 && !evolved2Ref.current) {
            evolved2Ref.current = true;
            if (hudLevel) {
              hudLevel.innerText = 'DRAGON LEVEL: FIRE DEMON';
              hudLevel.style.color = '#FF8C00';
            }
            if (hudScore) {
              hudScore.style.color = '#FF8C00';
              hudScore.innerText = `${scoreRef.current} / 300`;
            }
            if (hudBar) {
              hudBar.style.background = 'linear-gradient(90deg, #FF007F, #FF8C00, #FFE766)';
              hudBar.style.boxShadow = '0 0 12px #FF8C00, 0 0 25px #FFE766';
            }

            // Update SVGs to Fire Dragon models
            for (let i = 1; i < N; i++) {
              const baseId = (i === 1) ? "Cabeza" : (i === 8 || i === 14) ? "Aletas" : "Espina";
              elems[i].use.setAttributeNS(xlinkns, "xlink:href", "#" + baseId + "Fire");
            }
          }
          // ─── 100+ Point Evolved Mode Activation ────────────────────────────
          else if (scoreRef.current >= 100 && !evolvedRef.current) {
            evolvedRef.current = true;
            if (hudLevel) {
              hudLevel.innerText = 'DRAGON LEVEL: EVOLVED';
              hudLevel.style.color = '#FF007F';
            }
            if (hudScore) {
              hudScore.style.color = '#FF007F';
              hudScore.innerText = `${scoreRef.current} / 200`;
            }
            if (hudBar) {
              hudBar.style.background = 'linear-gradient(90deg, #00F0FF, #FF007F)';
              hudBar.style.boxShadow = '0 0 10px #FF007F, 0 0 20px #00F0FF';
            }

            // Update SVGs of the dragon to evolved ones
            for (let i = 1; i < N; i++) {
              const baseId = (i === 1) ? "Cabeza" : (i === 8 || i === 14) ? "Aletas" : "Espina";
              elems[i].use.setAttributeNS(xlinkns, "xlink:href", "#" + baseId + "Evolved");
            }
          }

          return false;
        }
        return true;
      });

      // ─── Update Particles ──────────────────────────────────────────────────
      particles = particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;

        p.element.setAttribute("cx", p.x.toString());
        p.element.setAttribute("cy", p.y.toString());
        p.element.setAttribute("opacity", Math.max(0, p.life).toString());

        if (p.life <= 0) {
          if (starsGroup.contains(p.element)) {
            starsGroup.removeChild(p.element);
          }
          return false;
        }
        return true;
      });
    };

    run();

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(animationFrameId);
      if (screen) screen.innerHTML = "";
      if (starsGroup) starsGroup.innerHTML = "";
    };
  }, [isHudCollapsed]); // Re-initialize element layouts when toggling HUD view state

  return (
    <>
      {/* Interactive & Toggleable HUD */}
      <div
        id="dragon-hud"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          color: evolved2Ref.current ? '#FF8C00' : evolvedRef.current ? '#FF007F' : '#00F0FF',
          fontFamily: 'monospace',
          fontSize: '11px',
          letterSpacing: '2px',
          background: 'rgba(10, 15, 20, 0.85)',
          border: evolved2Ref.current ? '1px solid rgba(255, 140, 0, 0.35)' : evolvedRef.current ? '1px solid rgba(255, 0, 127, 0.3)' : '1px solid rgba(0, 240, 255, 0.25)',
          borderRadius: '8px',
          padding: isHudCollapsed ? '6px 12px' : '10px 16px',
          pointerEvents: 'auto', // Enable pointer clicks for toggling
          zIndex: 10000,
          backdropFilter: 'blur(6px)',
          boxShadow: evolved2Ref.current ? '0 0 15px rgba(255, 140, 0, 0.2)' : evolvedRef.current ? '0 0 15px rgba(255, 0, 127, 0.15)' : '0 0 15px rgba(0, 240, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '6px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'default'
        }}
      >
        {isHudCollapsed ? (
          <button
            onClick={() => setIsHudCollapsed(false)}
            style={{
              background: 'none',
              border: 'none',
              color: evolved2Ref.current ? '#FF8C00' : evolvedRef.current ? '#FF007F' : '#00F0FF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'monospace',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              padding: '2px 4px',
              textShadow: evolved2Ref.current ? '0 0 5px #FF8C00' : evolvedRef.current ? '0 0 5px #FF007F' : '0 0 5px #00F0FF',
              outline: 'none'
            }}
            title="Expand Dragon HUD"
          >
            🐲 HUD
          </button>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '160px' }}>
              <div id="dragon-level" style={{ fontWeight: 'bold', textShadow: '0 0 4px rgba(0,240,255,0.4)', color: evolved2Ref.current ? '#FF8C00' : evolvedRef.current ? '#FF007F' : '#00F0FF', fontSize: '10px' }}>
                {scoreRef.current >= 300 ? '🚨 WORLD EATER' : evolved2Ref.current ? 'DRAGON: FIRE DEMON' : evolvedRef.current ? 'DRAGON: EVOLVED' : 'DRAGON ENERGY'}
              </div>
              <button
                onClick={() => setIsHudCollapsed(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: evolved2Ref.current ? '#FF8C00' : evolvedRef.current ? '#FF007F' : '#00F0FF',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  opacity: 0.7,
                  padding: '0 4px',
                  marginLeft: '6px',
                  outline: 'none'
                }}
                title="Collapse HUD"
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '160px' }}>
              <div style={{
                flex: 1,
                height: '5px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div
                  id="dragon-bar"
                  style={{
                    width: `${Math.min(100, (scoreRef.current / (evolved2Ref.current ? 300 : evolvedRef.current ? 200 : 100)) * 100)}%`,
                    height: '100%',
                    background: scoreRef.current >= 300 ? 'repeating-linear-gradient(45deg, #FF3300, #FF3300 5px, #FFE766 5px, #FFE766 10px)' : evolved2Ref.current ? 'linear-gradient(90deg, #FF007F, #FF8C00, #FFE766)' : evolvedRef.current ? 'linear-gradient(90deg, #00F0FF, #FF007F)' : '#00F0FF',
                    boxShadow: scoreRef.current >= 300 ? '0 0 15px #FF3300, 0 0 30px #FFE766' : evolved2Ref.current ? '0 0 12px #FF8C00, 0 0 25px #FFE766' : evolvedRef.current ? '0 0 10px #FF007F, 0 0 20px #00F0FF' : '0 0 6px #00F0FF',
                    transition: 'width 0.2s ease-out, background 0.5s ease'
                  }}
                />
              </div>
              <span id="dragon-score" style={{ fontSize: '10px', fontWeight: 'bold', minWidth: '45px', textAlign: 'right', color: evolved2Ref.current ? '#FF8C00' : evolvedRef.current ? '#FF007F' : '#00F0FF' }}>
                {scoreRef.current >= 300 ? `${scoreRef.current}` : evolved2Ref.current ? `${scoreRef.current} / 300` : evolvedRef.current ? `${scoreRef.current} / 200` : `${scoreRef.current} / 100`}
              </span>
            </div>
          </>
        )}
      </div>

      <svg
        ref={svgRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      >
        <defs>
          {/* Glowing Circular Star definition matching website cyan color */}
          <g id="Star">
            <circle
              cx="0"
              cy="0"
              r="4.5"
              fill="#00F0FF"
              style={{ filter: 'drop-shadow(0px 0px 4px #00F0FF)' }}
            />
            <circle
              cx="0"
              cy="0"
              r="2"
              fill="#FFFFFF"
            />
          </g>

          {/* Cabeza (Head) */}
          <g id="Cabeza" transform="matrix(1, 0, 0, 1, 0, 0)">
            <path
              fill="#FFFFFF"
              fillOpacity="1"
              d="M-28.9,-1.1L-28.55 -1.95Q-28.1 -3.1 -27.25 -2.95L-26.7 -2.95Q-27.7 -1.65 -28.9 -1.1M-18.35,-1.8Q-15.1 -10.3 -9.6 -6.05Q-15.1 -6.2 -18.35 -1.8M-18.35,1.1Q-15.1 5.45 -9.6 5.35Q-15.1 9.55 -18.35 1.1M-26.7,2.2L-27.25 2.25Q-28.1 2.4 -28.55 1.2L-28.9 0.35Q-27.7 0.9 -26.7 2.2"
            />
            <path
              fill="#00F0FF"
              fillOpacity="1"
              d="M-21.05,-8.25Q-13.6 -15.95 -1.3 -12.1Q-7.85 -8.5 -5.85 -4.35Q-2.3 -4.85 10.5 0.15Q0 4.35 -5.85 3.65Q-7.85 7.75 -1.25 12.45Q-13.6 15.2 -21.05 7.5Q-29.55 4.05 -30.2 -0.35Q-29.55 -4.8 -21.05 -8.25M-26.7,-2.95L-27.25 -2.95Q-28.1 -3.1 -28.55 -1.95L-28.9 -1.1Q-27.7 -1.65 -26.7 -2.95M-9.6,-6.05Q-15.1 -10.3 -18.35 -1.8Q-15.1 -6.2 -9.6 -6.05M-9.6,5.35Q-15.1 5.45 -18.35 1.1Q-15.1 9.55 -9.6 5.35M-28.9,0.35L-28.55 1.2Q-28.1 2.4 -27.25 2.25L-26.7 2.2Q-27.7 0.9 -28.9 0.35"
            />
            <polygon points="-8,-4.5 1,-2 -5,-1" fill="#FFFFFF" style={{ filter: 'drop-shadow(0px 0px 2px #00F0FF)' }} />
            <polygon points="-8,4.5 1,2 -5,1" fill="#FFFFFF" style={{ filter: 'drop-shadow(0px 0px 2px #00F0FF)' }} />
          </g>

          {/* EVOLVED Head with pink eyes */}
          <g id="CabezaEvolved" transform="matrix(1, 0, 0, 1, 0, 0)">
            <path
              fill="#FFFFFF"
              d="M-28.9,-1.1L-28.55 -1.95Q-28.1 -3.1 -27.25 -2.95L-26.7 -2.95Q-27.7 -1.65 -28.9 -1.1M-18.35,-1.8Q-15.1 -10.3 -9.6 -6.05Q-15.1 -6.2 -18.35 -1.8M-18.35,1.1Q-15.1 5.45 -9.6 5.35Q-15.1 9.55 -18.35 1.1M-26.7,2.2L-27.25 2.25Q-28.1 2.4 -28.55 1.2L-28.9 0.35Q-27.7 0.9 -26.7 2.2"
            />
            <path
              fill="#FF007F"
              fillOpacity="1"
              d="M-21.05,-8.25Q-13.6 -15.95 -1.3 -12.1Q-7.85 -8.5 -5.85 -4.35Q-2.3 -4.85 10.5 0.15Q0 4.35 -5.85 3.65Q-7.85 7.75 -1.25 12.45Q-13.6 15.2 -21.05 7.5Q-29.55 4.05 -30.2 -0.35Q-29.55 -4.8 -21.05 -8.25M-26.7,-2.95L-27.25 -2.95Q-28.1 -3.1 -28.55 -1.95L-28.9 -1.1Q-27.7 -1.65 -26.7 -2.95M-9.6,-6.05Q-15.1 -10.3 -18.35 -1.8Q-15.1 -6.2 -9.6 -6.05M-9.6,5.35Q-15.1 5.45 -18.35 1.1Q-15.1 9.55 -9.6 5.35M-28.9,0.35L-28.55 1.2Q-28.1 2.4 -27.25 2.25L-26.7 2.2Q-27.7 0.9 -28.9 0.35"
              style={{ filter: 'drop-shadow(0px 0px 4px #FF007F)' }}
            />
            <polygon points="-8,-4.5 1,-2 -5,-1" fill="#FFFFFF" style={{ filter: 'drop-shadow(0px 0px 3px #FF007F)' }} />
            <polygon points="-8,4.5 1,2 -5,1" fill="#FFFFFF" style={{ filter: 'drop-shadow(0px 0px 3px #FF007F)' }} />
          </g>

          {/* FIRE EVOLVED Head with blazing orange/yellow eyes */}
          <g id="CabezaFire" transform="matrix(1, 0, 0, 1, 0, 0)">
            <path
              fill="#FFFFFF"
              d="M-28.9,-1.1L-28.55 -1.95Q-28.1 -3.1 -27.25 -2.95L-26.7 -2.95Q-27.7 -1.65 -28.9 -1.1M-18.35,-1.8Q-15.1 -10.3 -9.6 -6.05Q-15.1 -6.2 -18.35 -1.8M-18.35,1.1Q-15.1 5.45 -9.6 5.35Q-15.1 9.55 -18.35 1.1M-26.7,2.2L-27.25 2.25Q-28.1 2.4 -28.55 1.2L-28.9 0.35Q-27.7 0.9 -26.7 2.2"
            />
            <path
              fill="#FF8C00"
              fillOpacity="1"
              d="M-21.05,-8.25Q-13.6 -15.95 -1.3 -12.1Q-7.85 -8.5 -5.85 -4.35Q-2.3 -4.85 10.5 0.15Q0 4.35 -5.85 3.65Q-7.85 7.75 -1.25 12.45Q-13.6 15.2 -21.05 7.5Q-29.55 4.05 -30.2 -0.35Q-29.55 -4.8 -21.05 -8.25M-26.7,-2.95L-27.25 -2.95Q-28.1 -3.1 -28.55 -1.95L-28.9 -1.1Q-27.7 -1.65 -26.7 -2.95M-9.6,-6.05Q-15.1 -10.3 -18.35 -1.8Q-15.1 -6.2 -9.6 -6.05M-9.6,5.35Q-15.1 5.45 -18.35 1.1Q-15.1 9.55 -9.6 5.35M-28.9,0.35L-28.55 1.2Q-28.1 2.4 -27.25 2.25L-26.7 2.2Q-27.7 0.9 -28.9 0.35"
              style={{ filter: 'drop-shadow(0px 0px 4px #FF8C00)' }}
            />
            <polygon points="-8,-4.5 1,-2 -5,-1" fill="#FFFFFF" style={{ filter: 'drop-shadow(0px 0px 3px #FFE766)' }} />
            <polygon points="-8,4.5 1,2 -5,1" fill="#FFFFFF" style={{ filter: 'drop-shadow(0px 0px 3px #FFE766)' }} />
          </g>
          
          {/* Aletas (Fins/Wings) */}
          <g id="Aletas" transform="matrix(1, 0, 0, 1, 0, 0)">
            <linearGradient
              id="LinearGradID_1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.0935974, 0, 0, 0.188782, -20.55, 0)"
              spreadMethod="pad"
              x1="-819.2"
              y1="0"
              x2="819.2"
              y2="0"
            >
              <stop offset="0" stopColor="#00F0FF" stopOpacity="1" />
              <stop offset="1" stopColor="#111415" stopOpacity="0" />
            </linearGradient>
            <path
              fill="url(#LinearGradID_1)"
              d="M29.75,-36.85Q-17.75 -61.45 -42.05 -40.95L-45.35 -38.35L-53.7 -41.15L-51.15 -44.85Q-34.85 -68.4 21 -57.8Q-32.2 -72.1 -50.25 -50Q-53.85 -45.65 -56.05 -41.95L-64.7 -43.35L-60.6 -50.3Q-45.9 -75.55 5.1 -79.35Q-2.2 -79.8 -9.45 -79.15Q-16.2 -78.55 -22.85 -77.15Q-29.85 -75.65 -36.5 -73Q-43.05 -70.4 -48.8 -66.85Q-54.55 -63.35 -56.8 -60.3L-60.5 -55.4Q-62.95 -52.1 -67 -43.55L-70.55 -43.55L-76.35 -42.95Q-74.6 -49.1 -71.85 -54.85Q-68.9 -61.25 -64.8 -67.1Q-60.8 -73 -55.45 -77.55Q-49.9 -82.35 -43.65 -85.85L-30.6 -92.7Q-24.05 -95.95 -17 -98.25Q-63.75 -86.35 -73.65 -57.1Q-75.75 -50.75 -77.45 -42.75Q-82.9 -41.75 -88 -39.65Q-87.65 -46.65 -86.3 -53.05Q-79.8 -89.8 -36.65 -117.2Q-80.65 -94.5 -87.55 -59.55Q-88.65 -54.15 -88.95 -39.4L-89.8 -38.85L-92.7 -37.6Q-93.75 -44.35 -94.1 -51.15Q-94.4 -58.2 -93.25 -65.1Q-92.15 -72.5 -90.05 -79.65Q-88.05 -86.55 -85 -93Q-82.1 -99.3 -78.45 -105.15Q-74.6 -111.35 -70.25 -117.25Q-65.95 -123.1 -61.1 -128.55Q-70.3 -119.35 -77.9 -108.7Q-86 -97.3 -90.8 -84.05Q-95.8 -70.5 -96 -56.15Q-96.1 -46 -94.05 -36.05L-93.25 -31.55Q-93.5 -35.65 -92.35 -36Q-79.85 -42 -66.6 -40.45Q-52.45 -38.85 -39.2 -33.25Q-28.3 -29.9 -21.25 -24.15Q-17.8 -23.3 -8.6 -15.6Q-12.1 -20.75 -16.75 -24.5Q-24.55 -30.7 -34.25 -34.05L-42.55 -37Q-38.9 -41.25 -31.5 -43.25Q-24.05 -45.3 -16.2 -46.3Q-8.35 -47.35 -1 -46Q5.95 -44.75 12.75 -42.85Q19.85 -40.9 29.75 -36.85M-92.45,-27.35L-94.95 -36.25Q-109.7 -105 -27.95 -154.65Q-98.65 -103.8 -91.75 -39.4L-89.95 -40.2Q-92.2 -105.25 -5.6 -130.9Q-78.8 -99.95 -87.45 -40.9Q-83.15 -42.95 -78.45 -43.95Q-70 -101.3 17.65 -103.8Q-56.9 -93.4 -74.5 -44.55L-67.4 -45.45Q-49.1 -94.95 39.25 -75.65Q-36.75 -84.35 -62.25 -44.25L-57.3 -43.6Q-31.65 -86.5 56.15 -46.05Q-20.3 -73.35 -51.35 -41.7L-45.95 -39.75Q-17.85 -71.35 51.85 -24.8Q-8.7 -56.4 -39.75 -37.05Q-28.15 -34.05 -14.25 -24.45Q-8.6 -19.85 -5.8 -16.95Q5.95 -2.4 20 0Q5.95 2.4 -5.8 16.95Q-8.6 19.85 -14.25 24.45Q-28.15 34.05 -39.75 37.05Q-8.7 56.4 51.85 24.8Q-17.85 71.35 -45.95 39.75L-51.35 41.7Q-20.3 73.35 56.15 46.1Q-31.65 86.5 -57.3 43.65L-62.25 44.3Q-36.75 84.35 39.25 75.7Q-49.1 94.95 -67.4 45.5L-74.5 44.6Q-56.9 93.4 17.65 103.85Q-70 101.3 -78.45 43.95Q-83.15 42.95 -87.45 40.9Q-78.8 99.95 -5.6 130.9Q-92.2 105.25 -89.95 40.25L-91.75 39.4Q-98.65 103.8 -27.95 154.65Q-109.7 105 -94.95 36.3L-92.45 27.35Q-93.05 33.9 -92.05 34.75Q-91.1 35.55 -88.95 36.7L-87.95 37Q-83.7 38.25 -79.05 38.8L-77.25 38.95Q-72.55 39.3 -67.5 38.85L-65.45 38.65Q-44.4 36.05 -17.8 19.6Q-9.9 12.8 -15.15 4.4Q-18.15 3.15 -19 0Q-18.15 -3.15 -15.15 -4.4Q-9.9 -12.8 -17.8 -19.6L-17.8 -19.55Q-44.4 -36.05 -65.45 -38.6L-67.5 -38.8Q-72.55 -39.3 -77.25 -38.95L-79.05 -38.75Q-83.7 -38.25 -87.95 -36.95L-88.95 -36.65Q-91.1 -35.55 -92.05 -34.7Q-93.05 -33.9 -92.45 -27.35M-8.6,15.6Q-17.8 23.3 -21.25 24.2Q-28.3 29.9 -39.2 33.3Q-52.45 38.85 -66.6 40.5Q-79.85 42 -92.35 36Q-93.5 35.65 -93.25 31.55L-94.05 36.1Q-96.1 46.05 -96 56.15Q-95.8 70.5 -90.8 84.1Q-86 97.3 -77.9 108.75Q-70.3 119.35 -61.1 128.6Q-65.95 123.1 -70.25 117.25Q-74.6 111.35 -78.45 105.15Q-82.1 99.3 -85 93Q-88.05 86.55 -90.05 79.7Q-92.15 72.5 -93.25 65.1Q-94.4 58.2 -94.1 51.2Q-93.75 44.35 -92.7 37.6L-89.8 38.9L-88.95 39.45Q-88.65 54.15 -87.55 59.55Q-80.65 94.5 -36.65 117.25Q-79.8 89.8 -86.3 53.1Q-87.65 46.65 -88 39.65Q-82.9 41.75 -77.45 42.75Q-75.75 50.75 -73.65 57.15Q-63.75 86.35 -17 98.3Q-24.05 95.95 -30.6 92.75L-43.65 85.9Q-49.9 82.35 -55.45 77.6Q-60.8 73 -64.8 67.15Q-68.9 61.25 -71.85 54.85Q-74.6 49.1 -76.35 42.95L-70.55 42.95L-67 42.95Q-62.95 51.4 -60.5 54.7L-56.8 59.65Q-54.55 62.65 -48.8 66.2Q-43.05 69.7 -36.5 72.3Q-29.85 74.95 -22.85 76.45Q-16.2 77.85 -9.45 78.45Q-2.2 79.1 5.1 78.65Q-45.9 74.85 -60.6 49.6L-64.7 42.7L-56.05 41.25Q-53.85 44.95 -50.25 49.3Q-32.2 71.4 21 57.15Q-34.85 67.7 -51.15 44.15L-53.7 40.5L-45.35 37.65L-42.05 40.25Q-17.75 60.75 29.75 36.15Q19.85 40.2 12.75 42.2Q5.95 44.05 -1 45.3Q-8.35 46.65 -16.2 45.65Q-24.05 44.6 -31.5 42.6Q-38.9 40.55 -42.55 36.35L-34.25 33.35Q-24.55 30.0 -16.75 23.8Q-12.1 20.05 -8.6 14.9"
            />
          </g>

          {/* EVOLVED wings */}
          <g id="AletasEvolved" transform="matrix(1, 0, 0, 1, 0, 0)">
            <linearGradient
              id="LinearGradEvolved"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.0935974, 0, 0, 0.188782, -20.55, 0)"
              spreadMethod="pad"
              x1="-819.2"
              y1="0"
              x2="819.2"
              y2="0"
            >
              <stop offset="0" stopColor="#FF007F" stopOpacity="1" />
              <stop offset="0.5" stopColor="#00F0FF" stopOpacity="0.8" />
              <stop offset="1" stopColor="#111415" stopOpacity="0" />
            </linearGradient>
            <path
              fill="url(#LinearGradEvolved)"
              d="M29.75,-36.85Q-17.75 -61.45 -42.05 -40.95L-45.35 -38.35L-53.7 -41.15L-51.15 -44.85Q-34.85 -68.4 21 -57.8Q-32.2 -72.1 -50.25 -50Q-53.85 -45.65 -56.05 -41.95L-64.7 -43.35L-60.6 -50.3Q-45.9 -75.55 5.1 -79.35Q-2.2 -79.8 -9.45 -79.15Q-16.2 -78.55 -22.85 -77.15Q-29.85 -75.65 -36.5 -73Q-43.05 -70.4 -48.8 -66.85Q-54.55 -63.35 -56.8 -60.3L-60.5 -55.4Q-62.95 -52.1 -67 -43.55L-70.55 -43.55L-76.35 -42.95Q-74.6 -49.1 -71.85 -54.85Q-68.9 -61.25 -64.8 -67.1Q-60.8 -73 -55.45 -77.55Q-49.9 -82.35 -43.65 -85.85L-30.6 -92.7Q-24.05 -95.95 -17 -98.25Q-63.75 -86.35 -73.65 -57.1Q-75.75 -50.75 -77.45 -42.75Q-82.9 -41.75 -88 -39.65Q-87.65 -46.65 -86.3 -53.05Q-79.8 -89.8 -36.65 -117.2Q-80.65 -94.5 -87.55 -59.55Q-88.65 -54.15 -88.95 -39.4L-89.8 -38.85L-92.7 -37.6Q-93.75 -44.35 -94.1 -51.15Q-94.4 -58.2 -93.25 -65.1Q-92.15 -72.5 -90.05 -79.65Q-88.05 -86.55 -85 -93Q-82.1 -99.3 -78.45 -105.15Q-74.6 -111.35 -70.25 -117.25Q-65.95 -123.1 -61.1 -128.55Q-70.3 -119.35 -77.9 -108.7Q-86 -97.3 -90.8 -84.05Q-95.8 -70.5 -96 -56.15Q-96.1 -46 -94.05 -36.05L-93.25 -31.55Q-93.5 -35.65 -92.35 -36Q-79.85 -42 -66.6 -40.45Q-52.45 -38.85 -39.2 -33.25Q-28.3 -29.9 -21.25 -24.15Q-17.8 -23.3 -8.6 -15.6Q-12.1 -20.75 -16.75 -24.5Q-24.55 -30.7 -34.25 -34.05L-42.55 -37Q-38.9 -41.25 -31.5 -43.25Q-24.05 -45.3 -16.2 -46.3Q-8.35 -47.35 -1 -46Q5.95 -44.75 12.75 -42.85Q19.85 -40.9 29.75 -36.85M-92.45,-27.35L-94.95 -36.25Q-109.7 -105 -27.95 -154.65Q-98.65 -103.8 -91.75 -39.4L-89.95 -40.2Q-92.2 -105.25 -5.6 -130.9Q-78.8 -99.95 -87.45 -40.9Q-83.15 -42.95 -78.45 -43.95Q-70 -101.3 17.65 -103.8Q-56.9 -93.4 -74.5 -44.55L-67.4 -45.45Q-49.1 -94.95 39.25 -75.65Q-36.75 -84.35 -62.25 -44.25L-57.3 -43.6Q-31.65 -86.5 56.15 -46.05Q-20.3 -73.35 -51.35 -41.7L-45.95 -39.75Q-17.85 -71.35 51.85 -24.8Q-8.7 -56.4 -39.75 -37.05Q-28.15 -34.05 -14.25 -24.45Q-8.6 -19.85 -5.8 -16.95Q5.95 -2.4 20 0Q5.95 2.4 -5.8 16.95Q-8.6 19.85 -14.25 24.45Q-28.15 34.05 -39.75 37.05Q-8.7 56.4 51.85 24.8Q-17.85 71.35 -45.95 39.75L-51.35 41.7Q-20.3 73.35 56.15 46.1Q-31.65 86.5 -57.3 43.65L-62.25 44.3Q-36.75 84.35 39.25 75.7Q-49.1 94.95 -67.4 45.5L-74.5 44.6Q-56.9 93.4 17.65 103.85Q-70 101.3 -78.45 43.95Q-83.15 42.95 -87.45 40.9Q-78.8 99.95 -5.6 130.9Q-92.2 105.25 -89.95 40.25L-91.75 39.4Q-98.65 103.8 -27.95 154.65Q-109.7 105 -94.95 36.3L-92.45 27.35Q-93.05 33.9 -92.05 34.75Q-91.1 35.55 -88.95 36.7L-87.95 37Q-83.7 38.25 -79.05 38.8L-77.25 38.95Q-72.55 39.3 -67.5 38.85L-65.45 38.65Q-44.4 36.05 -17.8 19.6Q-9.9 12.8 -15.15 4.4Q-18.15 3.15 -19 0Q-18.15 -3.15 -15.15 -4.4Q-9.9 -12.8 -17.8 -19.6L-17.8 -19.55Q-44.4 -36.05 -65.45 -38.6L-67.5 -38.8Q-72.55 -39.3 -77.25 -38.95L-79.05 -38.75Q-83.7 -38.25 -87.95 -36.95L-88.95 -36.65Q-91.1 -35.55 -92.05 -34.7Q-93.05 -33.9 -92.45 -27.35M-8.6,15.6Q-17.8 23.3 -21.25 24.2Q-28.3 29.9 -39.2 33.3Q-52.45 38.85 -66.6 40.5Q-79.85 42 -92.35 36Q-93.5 35.65 -93.25 31.55L-94.05 36.1Q-96.1 46.05 -96 56.15Q-95.8 70.5 -90.8 84.1Q-86 97.3 -77.9 108.75Q-70.3 119.35 -61.1 128.6Q-65.95 123.1 -70.25 117.25Q-74.6 111.35 -78.45 105.15Q-82.1 99.3 -85 93Q-88.05 86.55 -90.05 79.7Q-92.15 72.5 -93.25 65.1Q-94.4 58.2 -94.1 51.2Q-93.75 44.35 -92.7 37.6L-89.8 38.9L-88.95 39.45Q-88.65 54.15 -87.55 59.55Q-80.65 94.5 -36.65 117.25Q-79.8 89.8 -86.3 53.1Q-87.65 46.65 -88 39.65Q-82.9 41.75 -77.45 42.75Q-75.75 50.75 -73.65 57.15Q-63.75 86.35 -17 98.3Q-24.05 95.95 -30.6 92.75L-43.65 85.9Q-49.9 82.35 -55.45 77.6Q-60.8 73 -64.8 67.15Q-68.9 61.25 -71.85 54.85Q-74.6 49.1 -76.35 42.95L-70.55 42.95L-67 42.95Q-62.95 51.4 -60.5 54.7L-56.8 59.65Q-54.55 62.65 -48.8 66.2Q-43.05 69.7 -36.5 72.3Q-29.85 74.95 -22.85 76.45Q-16.2 77.85 -9.45 78.45Q-2.2 79.1 5.1 78.65Q-45.9 74.85 -60.6 49.6L-64.7 42.7L-56.05 41.25Q-53.85 44.95 -50.25 49.3Q-32.2 71.4 21 57.15Q-34.85 67.7 -51.15 44.15L-53.7 40.5L-45.35 37.65L-42.05 40.25Q-17.75 60.75 29.75 36.15Q19.85 40.2 12.75 42.2Q5.95 44.05 -1 45.3Q-8.35 46.65 -16.2 45.65Q-24.05 44.6 -31.5 42.6Q-38.9 40.55 -42.55 36.35L-34.25 33.35Q-24.55 30.0 -16.75 23.8Q-12.1 20.05 -8.6 14.9"
              style={{ filter: 'drop-shadow(0px 0px 8px #FF007F)' }}
            />
          </g>

          {/* FIRE EVOLVED Blazing Wings */}
          <g id="AletasFire" transform="matrix(1, 0, 0, 1, 0, 0)">
            <linearGradient
              id="LinearGradFire"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.0935974, 0, 0, 0.188782, -20.55, 0)"
              spreadMethod="pad"
              x1="-819.2"
              y1="0"
              x2="819.2"
              y2="0"
            >
              <stop offset="0" stopColor="#FF3300" stopOpacity="1" />
              <stop offset="0.5" stopColor="#FF8C00" stopOpacity="0.95" />
              <stop offset="1" stopColor="#FFE766" stopOpacity="0" />
            </linearGradient>
            <path
              fill="url(#LinearGradFire)"
              d="M29.75,-36.85Q-17.75 -61.45 -42.05 -40.95L-45.35 -38.35L-53.7 -41.15L-51.15 -44.85Q-34.85 -68.4 21 -57.8Q-32.2 -72.1 -50.25 -50Q-53.85 -45.65 -56.05 -41.95L-64.7 -43.35L-60.6 -50.3Q-45.9 -75.55 5.1 -79.35Q-2.2 -79.8 -9.45 -79.15Q-16.2 -78.55 -22.85 -77.15Q-29.85 -75.65 -36.5 -73Q-43.05 -70.4 -48.8 -66.85Q-54.55 -63.35 -56.8 -60.3L-60.5 -55.4Q-62.95 -52.1 -67 -43.55L-70.55 -43.55L-76.35 -42.95Q-74.6 -49.1 -71.85 -54.85Q-68.9 -61.25 -64.8 -67.1Q-60.8 -73 -55.45 -77.55Q-49.9 -82.35 -43.65 -85.85L-30.6 -92.7Q-24.05 -95.95 -17 -98.25Q-63.75 -86.35 -73.65 -57.1Q-75.75 -50.75 -77.45 -42.75Q-82.9 -41.75 -88 -39.65Q-87.65 -46.65 -86.3 -53.05Q-79.8 -89.8 -36.65 -117.2Q-80.65 -94.5 -87.55 -59.55Q-88.65 -54.15 -88.95 -39.4L-89.8 -38.85L-92.7 -37.6Q-93.75 -44.35 -94.1 -51.15Q-94.4 -58.2 -93.25 -65.1Q-92.15 -72.5 -90.05 -79.65Q-88.05 -86.55 -85 -93Q-82.1 -99.3 -78.45 -105.15Q-74.6 -111.35 -70.25 -117.25Q-65.95 -123.1 -61.1 -128.55Q-70.3 -119.35 -77.9 -108.7Q-86 -97.3 -90.8 -84.05Q-95.8 -70.5 -96 -56.15Q-96.1 -46 -94.05 -36.05L-93.25 -31.55Q-93.5 -35.65 -92.35 -36Q-79.85 -42 -66.6 -40.45Q-52.45 -38.85 -39.2 -33.25Q-28.3 -29.9 -21.25 -24.15Q-17.8 -23.3 -8.6 -15.6Q-12.1 -20.75 -16.75 -24.5Q-24.55 -30.7 -34.25 -34.05L-42.55 -37Q-38.9 -41.25 -31.5 -43.25Q-24.05 -45.3 -16.2 -46.3Q-8.35 -47.35 -1 -46Q5.95 -44.75 12.75 -42.85Q19.85 -40.9 29.75 -36.85M-92.45,-27.35L-94.95 -36.25Q-109.7 -105 -27.95 -154.65Q-98.65 -103.8 -91.75 -39.4L-89.95 -40.2Q-92.2 -105.25 -5.6 -130.9Q-78.8 -99.95 -87.45 -40.9Q-83.15 -42.95 -78.45 -43.95Q-70 -101.3 17.65 -103.8Q-56.9 -93.4 -74.5 -44.55L-67.4 -45.45Q-49.1 -94.95 39.25 -75.65Q-36.75 -84.35 -62.25 -44.25L-57.3 -43.6Q-31.65 -86.5 56.15 -46.05Q-20.3 -73.35 -51.35 -41.7L-45.95 -39.75Q-17.85 -71.35 51.85 -24.8Q-8.7 -56.4 -39.75 -37.05Q-28.15 -34.05 -14.25 -24.45Q-8.6 -19.85 -5.8 -16.95Q5.95 -2.4 20 0Q5.95 2.4 -5.8 16.95Q-8.6 19.85 -14.25 24.45Q-28.15 34.05 -39.75 37.05Q-8.7 56.4 51.85 24.8Q-17.85 71.35 -45.95 39.75L-51.35 41.7Q-20.3 73.35 56.15 46.1Q-31.65 86.5 -57.3 43.65L-62.25 44.3Q-36.75 84.35 39.25 75.7Q-49.1 94.95 -67.4 45.5L-74.5 44.6Q-56.9 93.4 17.65 103.85Q-70 101.3 -78.45 43.95Q-83.15 42.95 -87.45 40.9Q-78.8 99.95 -5.6 130.9Q-92.2 105.25 -89.95 40.25L-91.75 39.4Q-98.65 103.8 -27.95 154.65Q-109.7 105 -94.95 36.3L-92.45 27.35Q-93.05 33.9 -92.05 34.75Q-91.1 35.55 -88.95 36.7L-87.95 37Q-83.7 38.25 -79.05 38.8L-77.25 38.95Q-72.55 39.3 -67.5 38.85L-65.45 38.65Q-44.4 36.05 -17.8 19.6Q-9.9 12.8 -15.15 4.4Q-18.15 3.15 -19 0Q-18.15 -3.15 -15.15 -4.4Q-9.9 -12.8 -17.8 -19.6L-17.8 -19.55Q-44.4 -36.05 -65.45 -38.6L-67.5 -38.8Q-72.55 -39.3 -77.25 -38.95L-79.05 -38.75Q-83.7 -38.25 -87.95 -36.95L-88.95 -36.65Q-91.1 -35.55 -92.05 -34.7Q-93.05 -33.9 -92.45 -27.35M-8.6,15.6Q-17.8 23.3 -21.25 24.2Q-28.3 29.9 -39.2 33.3Q-52.45 38.85 -66.6 40.5Q-79.85 42 -92.35 36Q-93.5 35.65 -93.25 31.55L-94.05 36.1Q-96.1 46.05 -96 56.15Q-95.8 70.5 -90.8 84.1Q-86 97.3 -77.9 108.75Q-70.3 119.35 -61.1 128.6Q-65.95 123.1 -70.25 117.25Q-74.6 111.35 -78.45 105.15Q-82.1 99.3 -85 93Q-88.05 86.55 -90.05 79.7Q-92.15 72.5 -93.25 65.1Q-94.4 58.2 -94.1 51.2Q-93.75 44.35 -92.7 37.6L-89.8 38.9L-88.95 39.45Q-88.65 54.15 -87.55 59.55Q-80.65 94.5 -36.65 117.25Q-79.8 89.8 -86.3 53.1Q-87.65 46.65 -88 39.65Q-82.9 41.75 -77.45 42.75Q-75.75 50.75 -73.65 57.15Q-63.75 86.35 -17 98.3Q-24.05 95.95 -30.6 92.75L-43.65 85.9Q-49.9 82.35 -55.45 77.6Q-60.8 73 -64.8 67.15Q-68.9 61.25 -71.85 54.85Q-74.6 49.1 -76.35 42.95L-70.55 42.95L-67 42.95Q-62.95 51.4 -60.5 54.7L-56.8 59.65Q-54.55 62.65 -48.8 66.2Q-43.05 69.7 -36.5 72.3Q-29.85 74.95 -22.85 76.45Q-16.2 77.85 -9.45 78.45Q-2.2 79.1 5.1 78.65Q-45.9 74.85 -60.6 49.6L-64.7 42.7L-56.05 41.25Q-53.85 44.95 -50.25 49.3Q-32.2 71.4 21 57.15Q-34.85 67.7 -51.15 44.15L-53.7 40.5L-45.35 37.65L-42.05 40.25Q-17.75 60.75 29.75 36.15Q19.85 40.2 12.75 42.2Q5.95 44.05 -1 45.3Q-8.35 46.65 -16.2 45.65Q-24.05 44.6 -31.5 42.6Q-38.9 40.55 -42.55 36.35L-34.25 33.35Q-24.55 30.0 -16.75 23.8Q-12.1 20.05 -8.6 14.9"
              style={{ filter: 'drop-shadow(0px 0px 10px #FF3300, 0px 0px 20px #FF8C00)' }}
            />
          </g>
          
          {/* Espina (Spine/Body segments) */}
          <g id="Espina" transform="matrix(1, 0, 0, 1, 0, 0)">
            <linearGradient
              id="LinearGradID_2"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.0229492, 0, 0, -0.0152893, 0, 0.05)"
              spreadMethod="pad"
              x1="-819.2"
              y1="0"
              x2="819.2"
              y2="0"
            >
              <stop offset="0" stopColor="#00F0FF" stopOpacity="1" />
              <stop offset="1" stopColor="#1d2022" stopOpacity="0.3" />
            </linearGradient>
            <path
              fill="url(#LinearGradID_2)"
              d="M-18.8,0Q-17.85 -5.7 -12.3 -9.6Q-11.2 -5.35 -6.5 -8.25L-6.45 -8.2L-6.2 -8.3Q1.25 -16.25 6.65 -12.4Q0.05 -12.55 0 -5.95Q2.7 -2.4 7.75 -4.1Q18 -1.45 18.8 0L-18.8 0"
            />
            
            <linearGradient
              id="LinearGradID_3"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.0229492, 0, 0, 0.0152893, 0, -0.05)"
              spreadMethod="pad"
              x1="-819.2"
              y1="0"
              x2="819.2"
              y2="0"
            >
              <stop offset="0" stopColor="#00F0FF" stopOpacity="1" />
              <stop offset="1" stopColor="#1d2022" stopOpacity="0.3" />
            </linearGradient>
            <path
              fill="url(#LinearGradID_3)"
              d="M18.8,0Q18 1.45 7.75 4.1Q2.7 2.4 0 5.95Q0.05 12.55 6.65 12.4Q1.25 16.25 -6.2 8.35Q-6.35 8.25 -6.45 8.25L-6.5 8.25Q-11.2 5.35 -12.3 9.6Q-17.85 5.7 -18.8 0L18.8 0"
            />
          </g>

          {/* EVOLVED Spine segments */}
          <g id="EspinaEvolved" transform="matrix(1, 0, 0, 1, 0, 0)">
            <linearGradient
              id="LinearGradEvolvedSpine1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.0229492, 0, 0, -0.0152893, 0, 0.05)"
              spreadMethod="pad"
              x1="-819.2"
              y1="0"
              x2="819.2"
              y2="0"
            >
              <stop offset="0" stopColor="#FF007F" stopOpacity="1" />
              <stop offset="1" stopColor="#1d2022" stopOpacity="0.3" />
            </linearGradient>
            <path
              fill="url(#LinearGradEvolvedSpine1)"
              d="M-18.8,0Q-17.85 -5.7 -12.3 -9.6Q-11.2 -5.35 -6.5 -8.25L-6.45 -8.2L-6.2 -8.3Q1.25 -16.25 6.65 -12.4Q0.05 -12.55 0 -5.95Q2.7 -2.4 7.75 -4.1Q18 -1.45 18.8 0L-18.8 0"
            />
            
            <linearGradient
              id="LinearGradEvolvedSpine2"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.0229492, 0, 0, 0.0152893, 0, -0.05)"
              spreadMethod="pad"
              x1="-819.2"
              y1="0"
              x2="819.2"
              y2="0"
            >
              <stop offset="0" stopColor="#FF007F" stopOpacity="1" />
              <stop offset="1" stopColor="#1d2022" stopOpacity="0.3" />
            </linearGradient>
            <path
              fill="url(#LinearGradEvolvedSpine2)"
              d="M18.8,0Q18 1.45 7.75 4.1Q2.7 2.4 0 5.95Q0.05 12.55 6.65 12.4Q1.25 16.25 -6.2 8.35Q-6.35 8.25 -6.45 8.25L-6.5 8.25Q-11.2 5.35 -12.3 9.6Q-17.85 5.7 -18.8 0L18.8 0"
            />
            <polygon
              points="0,-3 -8,-22 5,-3"
              fill="#00F0FF"
              style={{ filter: 'drop-shadow(0px 0px 3px #00F0FF)' }}
            />
            <polygon
              points="0,3 -8,22 5,3"
              fill="#00F0FF"
              style={{ filter: 'drop-shadow(0px 0px 3px #00F0FF)' }}
            />
          </g>

          {/* FIRE Spine segments with bigger jagged spikes */}
          <g id="EspinaFire" transform="matrix(1, 0, 0, 1, 0, 0)">
            <linearGradient
              id="LinearGradFireSpine1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.0229492, 0, 0, -0.0152893, 0, 0.05)"
              spreadMethod="pad"
              x1="-819.2"
              y1="0"
              x2="819.2"
              y2="0"
            >
              <stop offset="0" stopColor="#FF3300" stopOpacity="1" />
              <stop offset="1" stopColor="#1d2022" stopOpacity="0.3" />
            </linearGradient>
            <path
              fill="url(#LinearGradFireSpine1)"
              d="M-18.8,0Q-17.85 -5.7 -12.3 -9.6Q-11.2 -5.35 -6.5 -8.25L-6.45 -8.2L-6.2 -8.3Q1.25 -16.25 6.65 -12.4Q0.05 -12.55 0 -5.95Q2.7 -2.4 7.75 -4.1Q18 -1.45 18.8 0L-18.8 0"
            />
            
            <linearGradient
              id="LinearGradFireSpine2"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.0229492, 0, 0, 0.0152893, 0, -0.05)"
              spreadMethod="pad"
              x1="-819.2"
              y1="0"
              x2="819.2"
              y2="0"
            >
              <stop offset="0" stopColor="#FF3300" stopOpacity="1" />
              <stop offset="1" stopColor="#1d2022" stopOpacity="0.3" />
            </linearGradient>
            <path
              fill="url(#LinearGradFireSpine2)"
              d="M18.8,0Q18 1.45 7.75 4.1Q2.7 2.4 0 5.95Q0.05 12.55 6.65 12.4Q1.25 16.25 -6.2 8.35Q-6.35 8.25 -6.45 8.25L-6.5 8.25Q-11.2 5.35 -12.3 9.6Q-17.85 5.7 -18.8 0L18.8 0"
            />
            {/* Mega fire dorsal spikes */}
            <polygon
              points="0,-4 -12,-32 8,-4"
              fill="#FFE766"
              style={{ filter: 'drop-shadow(0px 0px 4px #FF8C00)' }}
            />
            <polygon
              points="0,4 -12,32 8,4"
              fill="#FFE766"
              style={{ filter: 'drop-shadow(0px 0px 4px #FF8C00)' }}
            />
          </g>
        </defs>
        {/* Group to contain glowing food stars and eating particle effects */}
        <g ref={starsGroupRef} id="stars-group" />
        <g ref={screenRef} id="screen" />
      </svg>
    </>
  );
}
