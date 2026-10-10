/**
 * ============================================================================
 * FOR MISHY - FLOWER FLY-OUT & BOX REMOVAL SCRIPT
 * Flower flies out of the box, box dissolves away, revealing the box-free keepsake
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. GENTLE MUSIC BOX SYNTHESIZER (Web Audio API)
  // --------------------------------------------------------------------------
  class GentleSoundEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.interval = null;
      this.step = 0;

      // Soft romantic pentatonic melody
      this.notes = [
        261.63, 329.63, 392.00, 523.25, // C - E - G - C
        220.00, 261.63, 329.63, 440.00, // A - C - E - A
        293.66, 349.23, 440.00, 587.33, // D - F - A - D
        392.00, 493.88, 587.33, 783.99, // G - B - D - G
        261.63, 329.63, 523.25, 659.25, // C - E - C - E
        349.23, 440.00, 523.25, 698.46  // F - A - C - F
      ];
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playChime(freq, duration = 1.2, vol = 0.08) {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    playFanfare() {
      this.init();
      const chimeNotes = [392.00, 523.25, 659.25, 783.99, 1046.50];
      chimeNotes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playChime(freq, 1.6, 0.12);
        }, idx * 75);
      });
    }

    playBounce() {
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.14);
        osc.frequency.exponentialRampToValueAtTime(290, now + 0.28);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(now + 0.3);
      } catch (e) {}
    }

    playDialogueBlip() {
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        // Sweet retro indie RPG dialogue blip (warm gentle triangle wave)
        osc.type = 'triangle';
        const pitch = 270 + Math.random() * 45; // Subtle variation (270-315Hz)
        osc.frequency.setValueAtTime(pitch, now);
        osc.frequency.exponentialRampToValueAtTime(pitch * 1.15, now + 0.035);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.045);
      } catch (e) {}
    }

    playEndingFanfare() {
      this.init();
      if (!this.ctx) return;
      // Magical multi-tone chime arpeggio: C5 -> E5 -> G5 -> C6
      const arpeggio = [523.25, 659.25, 783.99, 1046.50];
      arpeggio.forEach((note, index) => {
        setTimeout(() => {
          this.playChime(note, 2.4, 0.1);
        }, index * 170);
      });
    }

    startMusic(callback) {
      this.init();
      const audioEl = document.getElementById('bg-music');
      if (audioEl && audioEl.src) {
        audioEl.volume = 0.20; // Soft and gentle background volume
        audioEl.play().then(() => {
          this.isPlaying = true;
          if (callback) callback(true);
        }).catch(() => {
          this.startSynth(callback);
        });
        return;
      }
      this.startSynth(callback);
    }

    startSynth(callback) {
      if (this.isPlaying) return;
      this.isPlaying = true;
      this.step = 0;

      this.interval = setInterval(() => {
        this.playChime(this.notes[this.step], 1.2, 0.03);
        this.step = (this.step + 1) % this.notes.length;
      }, 420);

      if (callback) callback(true);
    }

    stopMusic(callback) {
      const audioEl = document.getElementById('bg-music');
      if (audioEl) {
        audioEl.pause();
      }
      this.isPlaying = false;
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      if (callback) callback(false);
    }

    toggleMusic(callback) {
      if (this.isPlaying) {
        this.stopMusic(callback);
      } else {
        this.startMusic(callback);
      }
    }
  }

  const sound = new GentleSoundEngine();

  // --------------------------------------------------------------------------
  // 2. DELICATE CHERRY PETALS & GOLDEN STARDUST CANVAS
  // --------------------------------------------------------------------------
  class DelicatePetalCanvas {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.maxParticles = 26;
      this.isEndingMode = false;
      this.width = (canvas.width = window.innerWidth);
      this.height = (canvas.height = window.innerHeight);

      window.addEventListener('resize', () => {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
      });

      this.init();
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    createParticle(isBurst = false, bx = 0, by = 0) {
      const rand = Math.random();
      const isFirefly = rand > 0.6;
      const isHeart = this.isEndingMode && rand < 0.28;
      
      let type = 'petal';
      let color = 'rgba(244, 160, 178, ';
      if (isFirefly) {
        type = 'sparkle';
        color = 'rgba(254, 200, 77, ';
      } else if (isHeart) {
        type = 'heart';
        color = 'rgba(255, 77, 109, ';
      }

      return {
        x: isBurst ? bx : Math.random() * this.width,
        y: isBurst ? by : Math.random() * this.height - 30,
        size: isBurst ? Math.random() * 10 + 5 : (isFirefly ? Math.random() * 2.5 + 1.5 : Math.random() * 7 + 4),
        speedY: isBurst ? (Math.random() - 0.5) * 8 - 1 : (isFirefly ? Math.random() * 0.3 - 0.15 : Math.random() * 0.6 + 0.3),
        speedX: isBurst ? (Math.random() - 0.5) * 8 : (isFirefly ? Math.random() * 0.4 - 0.2 : Math.random() * 0.3 - 0.15),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.5,
        type: type,
        color: color,
        alpha: Math.random() * 0.4 + 0.25,
        isBurst: isBurst,
        life: 1,
        decay: isBurst ? Math.random() * 0.02 + 0.012 : 0
      };
    }

    init() {
      for (let i = 0; i < this.maxParticles; i++) {
        this.particles.push(this.createParticle());
      }
    }

    enableEndingMode() {
      this.isEndingMode = true;
      this.maxParticles = 55;
      while (this.particles.length < this.maxParticles) {
        this.particles.push(this.createParticle());
      }
    }

    burst(x, y, count = 45) {
      for (let i = 0; i < count; i++) {
        this.particles.push(this.createParticle(true, x, y));
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.isBurst) {
          p.life -= p.decay;
        }

        const currentAlpha = p.isBurst ? Math.max(0, p.alpha * p.life) : p.alpha;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.type === 'sparkle') {
          this.ctx.fillStyle = `${p.color}${currentAlpha})`;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (p.type === 'heart') {
          this.ctx.fillStyle = `${p.color}${currentAlpha})`;
          this.ctx.font = `${Math.round(p.size * 1.8)}px sans-serif`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('♥', 0, 0);
        } else {
          this.ctx.fillStyle = `${p.color}${currentAlpha})`;
          this.ctx.beginPath();
          this.ctx.moveTo(0, 0);
          this.ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, -p.size / 4, p.size, p.size / 2);
          this.ctx.bezierCurveTo(p.size, p.size, p.size / 2, p.size * 1.2, 0, p.size);
          this.ctx.bezierCurveTo(-p.size / 4, p.size * 0.8, -p.size / 4, p.size / 4, 0, 0);
          this.ctx.fill();
        }

        this.ctx.restore();

        if (p.isBurst && p.life <= 0) {
          this.particles.splice(i, 1);
        } else if (!p.isBurst && p.y > this.height + 20) {
          p.y = -20;
          p.x = Math.random() * this.width;
        }
      }

      requestAnimationFrame(this.animate);
    }
  }

  // --------------------------------------------------------------------------
  // 3. SINCERE NAILONG MESSAGES WITH CINEMATIC ENDING
  // --------------------------------------------------------------------------
  const MISHY_MESSAGES = [
    "Hi Mishy! I brought these flowers just for you. Tap me whenever you want a sweet reminder.",
    "Nailong wants you to know: you make ordinary days feel so much brighter.",
    "Whenever you feel tired, take a deep breath. You are doing amazing.",
    "These flowers will stay fresh forever, just like the care behind them.",
    "Nailong says: don't forget to smile today. You deserve all the good things.",
    "And one last thing, Mishy... Never forget how truly special and loved you are. These flowers will bloom for you forever."
  ];

  const ENDING_INDEX = MISHY_MESSAGES.length - 1;

  // --------------------------------------------------------------------------
  // 4. MAIN INTERACTION SETUP
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    // Canvas init
    const canvas = document.getElementById('ambient-canvas');
    let petalEngine = null;
    if (canvas) {
      petalEngine = new DelicatePetalCanvas(canvas);
    }

    // Audio controls
    const bgAudio = document.getElementById('bg-music');
    if (bgAudio) {
      bgAudio.volume = 0.20;
    }
    const musicBtn = document.getElementById('music-btn');
    const musicText = document.getElementById('music-text');

    function updateAudioUI(isPlaying) {
      if (musicBtn && musicText) {
        if (isPlaying) {
          musicBtn.classList.add('playing');
          musicText.textContent = 'Pause music';
        } else {
          musicBtn.classList.remove('playing');
          musicText.textContent = 'Play music';
        }
      }
    }

    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        sound.toggleMusic(updateAudioUI);
      });
    }

    // Unboxing Stage: Flower flies out of box, box dissolves, keepsake reveals
    const boxTrigger = document.getElementById('box-trigger');
    const unboxingStage = document.getElementById('unboxing-stage');
    const keepsakeStage = document.getElementById('keepsake-stage');
    const shineContainer = document.getElementById('shine-container');

    function performUnboxing() {
      if (boxTrigger.classList.contains('opening')) return;
      boxTrigger.classList.add('opening');

      // 1. Play unboxing fanfare and start soothing music box
      sound.playFanfare();
      setTimeout(() => {
        sound.startMusic(updateAudioUI);
      }, 500);

      // 2. Trigger golden shine explosion
      if (shineContainer) {
        shineContainer.classList.remove('hidden');
      }

      // 3. Burst sparkling petals from the box opening
      if (petalEngine) {
        const rect = boxTrigger.getBoundingClientRect();
        petalEngine.burst(rect.left + rect.width / 2, rect.top + rect.height * 0.45, 55);
      }

      // 4. After flower flies out and box dissolves, reveal the box-free keepsake!
      setTimeout(() => {
        unboxingStage.classList.add('hidden');
        keepsakeStage.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          typeDialogue(MISHY_MESSAGES[0]);
        }, 220);
      }, 1050);

      // 5. Fade out shine overlay
      setTimeout(() => {
        if (shineContainer) {
          shineContainer.classList.add('hidden');
        }
      }, 1300);
    }

    if (boxTrigger) {
      boxTrigger.addEventListener('click', performUnboxing);
      boxTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          performUnboxing();
        }
      });
    }

    // Interactive Flower Blooming on Tap (in the keepsake stage)
    const flowerTrigger = document.getElementById('flower-trigger');
    if (flowerTrigger) {
      flowerTrigger.addEventListener('click', () => {
        sound.playChime(659.25, 1.4, 0.1);

        flowerTrigger.classList.remove('bloom-active');
        void flowerTrigger.offsetWidth; // Force reflow
        flowerTrigger.classList.add('bloom-active');

        if (petalEngine) {
          const rect = flowerTrigger.getBoundingClientRect();
          petalEngine.burst(rect.left + rect.width / 2, rect.top + rect.height * 0.45, 30);
        }

        setTimeout(() => {
          flowerTrigger.classList.remove('bloom-active');
        }, 850);
      });

      flowerTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          flowerTrigger.click();
        }
      });
    }

    // --------------------------------------------------------------------------
    // 5. PIXEL INDIE GAME DIALOGUE ENGINE & CINEMATIC ENDING
    // --------------------------------------------------------------------------
    const nailongTrigger = document.getElementById('nailong-trigger');
    const speechBox = document.getElementById('speech-box');
    const dialogueText = document.getElementById('dialogue-text');
    const dialogueCaret = document.getElementById('dialogue-caret');
    const dialogueNametag = speechBox ? speechBox.querySelector('.dialogue-nametag') : null;
    const sceneComposition = document.getElementById('scene-composition');
    const dialogueContainer = document.getElementById('dialogue-container');

    let messageIndex = 0;
    let isTyping = false;
    let currentTargetText = MISHY_MESSAGES[0];
    let typewriterTimeout = null;

    function finishTyping() {
      if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
        typewriterTimeout = null;
      }
      isTyping = false;

      const isEnding = messageIndex === ENDING_INDEX;
      const promptLabel = speechBox ? speechBox.querySelector('.dialogue-prompt-label') : null;

      if (dialogueText) {
        if (isEnding) {
          dialogueText.innerHTML = 'And one last thing, Mishy... Never forget how <span class="text-highlight-gold">truly special and loved you are</span>. These flowers will <span class="text-highlight-rose">bloom for you forever</span>.';
        } else {
          dialogueText.textContent = currentTargetText;
        }
      }

      if (dialogueCaret) {
        if (isEnding) {
          dialogueCaret.textContent = '♥';
          dialogueCaret.classList.remove('typing');
          dialogueCaret.classList.add('ready', 'heart-end');
          if (promptLabel) promptLabel.textContent = ''; // Removed repeat part!

          // Enable romantic ambient particle shower with floating hearts!
          if (petalEngine) {
            petalEngine.enableEndingMode();
          }

          // Automatically play background music track if not playing yet
          if (!sound.isPlaying) {
            sound.startMusic(updateAudioUI);
          }

          // Trigger Nailong's cute love bubble!
          if (nailongTrigger) {
            nailongTrigger.classList.add('love-active');
          }

          // Magical ending chime fanfare
          sound.playEndingFanfare();

          // Golden celebration cascades around the blossoms
          if (petalEngine && flowerTrigger) {
            const rect = flowerTrigger.getBoundingClientRect();
            petalEngine.burst(rect.left + rect.width / 2, rect.top + rect.height * 0.45, 60);
            setTimeout(() => {
              petalEngine.burst(rect.left + rect.width * 0.35, rect.top + rect.height * 0.3, 35);
            }, 300);
            setTimeout(() => {
              petalEngine.burst(rect.left + rect.width * 0.65, rect.top + rect.height * 0.35, 35);
            }, 600);
          }
        } else {
          dialogueCaret.textContent = '▼';
          dialogueCaret.classList.remove('typing', 'heart-end');
          dialogueCaret.classList.add('ready');
          if (promptLabel) promptLabel.textContent = 'TAP TO CONTINUE';
        }
      }
    }

    function typeDialogue(text) {
      if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
        typewriterTimeout = null;
      }

      currentTargetText = text;
      isTyping = true;

      const isEnding = messageIndex === ENDING_INDEX;
      const promptLabel = speechBox ? speechBox.querySelector('.dialogue-prompt-label') : null;
      const keepsakeCard = document.querySelector('.keepsake-card');

      // Cinematic Ending: darken background and spotlight the flowers!
      if (isEnding) {
        document.body.classList.add('ending-mode');
        if (keepsakeCard) keepsakeCard.classList.add('ending-mode');
        if (flowerTrigger) flowerTrigger.classList.add('ending-close-up');
        if (sceneComposition) sceneComposition.classList.add('ending-mode');
        if (nailongTrigger) nailongTrigger.classList.add('ending-mode');
        if (dialogueContainer) dialogueContainer.classList.add('ending-mode');
        if (dialogueNametag) {
          dialogueNametag.innerHTML = '<span class="pixel-sparkle">✦</span> NAILONG · [ FOREVER FOR MISHY ♥ ]';
        }
        if (promptLabel) {
          promptLabel.textContent = '';
        }
      } else {
        document.body.classList.remove('ending-mode');
        if (keepsakeCard) keepsakeCard.classList.remove('ending-mode');
        if (flowerTrigger) flowerTrigger.classList.remove('ending-close-up');
        if (sceneComposition) sceneComposition.classList.remove('ending-mode');
        if (nailongTrigger) nailongTrigger.classList.remove('ending-mode');
        if (dialogueContainer) dialogueContainer.classList.remove('ending-mode');
        if (dialogueNametag) {
          dialogueNametag.innerHTML = '<span class="pixel-sparkle">✦</span> NAILONG';
        }
        if (promptLabel) {
          promptLabel.textContent = 'TAP TO CONTINUE';
        }
      }

      if (dialogueText) dialogueText.textContent = '';
      if (dialogueCaret) {
        dialogueCaret.textContent = '▌';
        dialogueCaret.classList.remove('ready', 'heart-end');
        dialogueCaret.classList.add('typing');
      }

      let i = 0;
      let lastBlipTime = 0;

      function step() {
        if (!isTyping) return;

        if (i < text.length) {
          const char = text[i];
          if (dialogueText) dialogueText.textContent += char;
          i++;

          // Pixel retro blip sound on characters (gentle cadence)
          const now = performance.now();
          if (char !== ' ' && now - lastBlipTime > 55) {
            sound.playDialogueBlip();
            lastBlipTime = now;
          }

          // Indie RPG punctuation rhythm
          let delay = 32;
          if (char === ',' || char === ';') {
            delay = 140;
          } else if (char === '.' || char === '!' || char === '?') {
            delay = 230;
          }

          typewriterTimeout = setTimeout(step, delay);
        } else {
          finishTyping();
        }
      }

      step();
    }

    function handleDialogueClick(e) {
      if (e) e.stopPropagation();
      sound.init();

      // If text is currently typing, instantly fast-forward / complete the line
      if (isTyping) {
        finishTyping();
        return;
      }

      // If already at the ending, interactive love bounce & sparkles!
      if (messageIndex === ENDING_INDEX) {
        sound.playBounce();
        if (nailongTrigger) {
          nailongTrigger.classList.remove('bounce', 'love-active');
          void nailongTrigger.offsetWidth; // Force reflow
          nailongTrigger.classList.add('bounce', 'love-active');
        }
        if (petalEngine && flowerTrigger) {
          const rect = flowerTrigger.getBoundingClientRect();
          petalEngine.burst(rect.left + rect.width / 2, rect.top + rect.height * 0.4, 30);
        }
        return; // Eternal ending - do not repeat!
      }

      // Advance to next dialogue message
      sound.playBounce();
      if (nailongTrigger) {
        nailongTrigger.classList.remove('bounce');
        void nailongTrigger.offsetWidth; // Force reflow
        nailongTrigger.classList.add('bounce');
      }

      messageIndex++;
      typeDialogue(MISHY_MESSAGES[messageIndex]);
    }

    if (nailongTrigger) {
      nailongTrigger.addEventListener('click', handleDialogueClick);
      nailongTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleDialogueClick(e);
        }
      });
    }

    if (speechBox) {
      speechBox.addEventListener('click', handleDialogueClick);
    }
  });
})();
