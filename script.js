// ==================== DOM 引用 ====================

const giftPage        = document.getElementById('gift-page');
const celebrationPage = document.getElementById('celebration-page');
const giftContainer   = document.getElementById('giftContainer');
const giftOrb         = document.getElementById('giftOrb');
const bgCanvas        = document.getElementById('bg-particles');
const celebCanvas     = document.getElementById('celebration-canvas');
const photoFrame      = document.getElementById('photoFrame');
const line1           = document.getElementById('line1');
const line2           = document.getElementById('line2');
const sparkles        = document.getElementById('sparkles');
const bgMusic         = document.getElementById('bgMusic');

// ==================== 状态标志 ====================

let isOpened = false;

// ==================== 礼物页背景粒子 ====================

(function initBgParticles() {
  const ctx = bgCanvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    bgCanvas.width  = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  const count = Math.min(60, Math.floor(window.innerWidth * window.innerHeight / 15000));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.15,
      alpha: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.015 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2
    });
  }

  function draw(timestamp) {
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = bgCanvas.width + 10;
      if (p.x > bgCanvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = bgCanvas.height + 10;
      if (p.y > bgCanvas.height + 10) p.y = -10;

      const alpha = p.alpha + Math.sin(timestamp * p.twinkleSpeed + p.twinkleOffset) * 0.2;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 200, ${Math.max(0.05, alpha)})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  animId = requestAnimationFrame(draw);
})();

// ==================== 礼物盒点击 ====================

giftContainer.addEventListener('click', openGift);
giftContainer.addEventListener('touchend', function (e) {
  e.preventDefault();
  openGift();
});

function openGift() {
  if (isOpened) return;
  isOpened = true;
  giftOrb.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease';
  giftOrb.style.transform = 'scale(1.35)';
  giftOrb.style.boxShadow =
    '0 0 60px rgba(255, 210, 160, 1),' +
    '0 0 120px rgba(255, 180, 140, 0.7),' +
    '0 0 180px rgba(248, 150, 130, 0.5),' +
    '0 0 240px rgba(240, 130, 120, 0.3)';

  setTimeout(() => {
    giftOrb.style.transform = 'scale(0.2)';
    giftOrb.style.opacity = '0';
  }, 200);

  const burst = document.createElement('div');
  burst.className = 'gift-burst';
  giftContainer.appendChild(burst);

  const rect = giftContainer.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  burstConfetti(centerX, centerY);
  playMusic();
  setTimeout(() => {
    giftPage.classList.add('fade-out');
  }, 400);

  setTimeout(() => {
    giftPage.classList.remove('active');
    switchToCelebration();
  }, 1200);

  setTimeout(() => {
    if (burst.parentNode) burst.remove();
  }, 1500);
}

// ==================== 页面切换 ====================

function switchToCelebration() {
  celebrationPage.classList.add('active');

  requestAnimationFrame(() => {
    photoFrame.classList.add('visible');
  });
  startCelebrationParticles();
  startTypingAnimation();
  createSparkles();
}

// ==================== 音 乐 ====================

function playMusic() {
  if (!bgMusic) return;

  bgMusic.volume = 0;
  const targetVolume = 0.4;

  const playPromise = bgMusic.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        let vol = 0;
        const fadeIn = setInterval(() => {
          vol += 0.05;
          if (vol >= targetVolume) {
            vol = targetVolume;
            clearInterval(fadeIn);
          }
          bgMusic.volume = vol;
        }, 120);
      })
      .catch(() => {
        console.log('音乐自动播放被浏览器阻止，用户可手动播放');
      });
  }
}

// ==================== 礼花爆发（点击时） ====================

function burstConfetti(originX, originY) {
  const ctx = celebCanvas.getContext('2d');
  celebCanvas.width  = window.innerWidth;
  celebCanvas.height = window.innerHeight;

  const burstParticles = [];
  const colors = [
    '#f8b4c8', '#fef3d6', '#f0d78c', '#fcd4df',
    '#ffe7a0', '#f5a0b8', '#ffd1dc', '#fff5e6',
    '#e8b84b', '#ffb3c6', '#ffecb3', '#fce4ec'
  ];

  const count = 120;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 4;
    burstParticles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed * (0.5 + Math.random()),
      vy: Math.sin(angle) * speed * (0.5 + Math.random()) - 2,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 15,
      gravity: 0.15,
      alpha: 1,
      fadeStart: 40 + Math.random() * 30, 
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, celebCanvas.width, celebCanvas.height);
    let alive = false;

    for (const p of burstParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;

      // 淡出
      if (frame > p.fadeStart) {
        p.alpha -= 0.025;
        if (p.alpha < 0) p.alpha = 0;
      }

      if (p.alpha > 0 && p.y < celebCanvas.height + 50) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    frame++;
    if (alive && frame < 180) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

// ==================== 庆祝页面持续粒子 ====================

function startCelebrationParticles() {
  const ctx = celebCanvas.getContext('2d');

  celebCanvas.width  = window.innerWidth;
  celebCanvas.height = window.innerHeight;

  const particles = [];
  const maxParticles = 80;
  const colors = [
    'rgba(255, 220, 200, 0.7)',
    'rgba(248, 180, 200, 0.6)',
    'rgba(255, 235, 180, 0.6)',
    'rgba(255, 245, 230, 0.5)',
    'rgba(240, 215, 140, 0.55)',
    'rgba(252, 212, 223, 0.6)'
  ];

  function spawn() {
    if (particles.length >= maxParticles) return;

    particles.push({
      x: Math.random() * celebCanvas.width,
      y: -20,
      r: Math.random() * 3 + 1.5,
      vy: Math.random() * 0.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      sway: Math.random() * 0.03 + 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.4 + 0.3
    });
  }

  function draw(timestamp) {
    ctx.clearRect(0, 0, celebCanvas.width, celebCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.y += p.vy;
      p.x += Math.sin(timestamp * p.sway + p.swayOffset) * 0.3;

      if (p.y > celebCanvas.height + 20) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace('0.6', '0.08').replace('0.7', '0.08').replace('0.5', '0.06').replace('0.55', '0.06');
      ctx.fill();
    }

    if (Math.random() < 0.4) spawn();

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

// ==================== 打字机动画 ====================

function startTypingAnimation() {
  const text1 = '恭喜上岸';
  const text2 = '所有努力终将得到回报';

  let index1 = 0;
  let index2 = 0;

  function typeLine1() {
    if (index1 < text1.length) {
      line1.textContent = text1.slice(0, index1 + 1) + '|';
      wrapCursor(line1);
      index1++;
      setTimeout(typeLine1, 130);
    } else {
      line1.textContent = text1;
      setTimeout(() => {
        line2.classList.add('show');
        typeLine2();
      }, 300);
    }
  }

  function typeLine2() {
    if (index2 < text2.length) {
      line2.textContent = text2.slice(0, index2 + 1) + '|';
      wrapCursor(line2);
      index2++;
      setTimeout(typeLine2, 100);
    } else {
      line2.textContent = text2;
    }
  }

  typeLine1();
}

function wrapCursor(el) {
  const text = el.textContent;
  if (text.endsWith('|')) {
    el.innerHTML = text.slice(0, -1) + '<span class="typing-cursor">|</span>';
  }
}

// ==================== 装饰星星 ====================

function createSparkles() {
  const count = 20;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'sparkle';
    star.style.left   = Math.random() * 100 + '%';
    star.style.top    = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 4 + 's';
    star.style.animationDuration = (Math.random() * 3 + 3) + 's';
    const size = Math.random() * 3 + 2;
    star.style.width  = size + 'px';
    star.style.height = size + 'px';
    sparkles.appendChild(star);
  }
}

// ==================== 窗口尺寸变化处理 ====================

window.addEventListener('resize', () => {
  if (celebrationPage.classList.contains('active')) {
    celebCanvas.width  = window.innerWidth;
    celebCanvas.height = window.innerHeight;
  }
});
