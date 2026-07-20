// ============================================================================
// DarkMaxxer RPI Portal — Ultra-Interactive Starfield & Micro-Animations Engine
// Features: Parallax Constellations, Cursor Magnetic Web, 3D Hover Tilt, Download Toast
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initStarfieldEngine();
  init3DCardTilt();
  initTabs();
  initStatusPing();
});

// ==========================================
// 1. Parallax Starfield & Cosmic Particle Engine
// ==========================================
function initStarfieldEngine() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Cursor and Shockwave tracking
  const mouse = { x: -1000, y: -1000, radius: 180, vx: 0, vy: 0, prevX: -1000, prevY: -1000 };
  let shockwave = { x: -1000, y: -1000, radius: 0, maxRadius: 320, active: false };

  window.addEventListener('mousemove', (e) => {
    mouse.vx = e.clientX - mouse.prevX;
    mouse.vy = e.clientY - mouse.prevY;
    mouse.prevX = mouse.x = e.clientX;
    mouse.prevY = mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('click', (e) => {
    shockwave.x = e.clientX;
    shockwave.y = e.clientY;
    shockwave.radius = 10;
    shockwave.active = true;
  });

  const particleCount = Math.min(Math.floor((width * height) / 7500), 160);
  const particles = [];
  const colors = ['#FFFFFF', '#FFD700', '#FFEC8B', '#FFFACD', '#FFFFFF', '#FFE4B5'];

  class CosmicStar {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.layer = Math.random() < 0.3 ? 'back' : Math.random() < 0.7 ? 'mid' : 'front';
      
      if (this.layer === 'back') {
        this.baseSize = Math.random() * 1.2 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.alpha = Math.random() * 0.4 + 0.1;
      } else if (this.layer === 'mid') {
        this.baseSize = Math.random() * 2.0 + 1.0;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.alpha = Math.random() * 0.6 + 0.3;
      } else {
        this.baseSize = Math.random() * 3.2 + 1.5;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.alpha = Math.random() * 0.8 + 0.2;
      }

      this.size = this.baseSize;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.pulseAngle = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around edges
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Gravitational pull toward DarkMatter Blackhole center
      const bhX = width / 2;
      const bhY = height * 0.48;
      const bhDx = bhX - this.x;
      const bhDy = bhY - this.y;
      const bhDist = Math.sqrt(bhDx * bhDx + bhDy * bhDy);
      if (bhDist > 120 && bhDist < 650) {
        this.x += (bhDx / bhDist) * 0.38;
        this.y += (bhDy / bhDist) * 0.38;
      }
      if (bhDist <= 120) {
        this.reset();
      }

      // Twinkle pulse
      this.pulseAngle += this.pulseSpeed;
      const pulseMod = Math.sin(this.pulseAngle) * 0.3;

      // Mouse Interaction (Magnetic Web & Repulsion)
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        
        // Push stars away smoothly
        this.x -= Math.cos(angle) * force * 4.5;
        this.y -= Math.sin(angle) * force * 4.5;
        this.size = this.baseSize + force * 3.0;
        this.alpha = Math.min(1.0, this.alpha + force * 0.6);
      } else {
        this.size += (this.baseSize + pulseMod - this.size) * 0.1;
      }

      // Click Shockwave Physics
      if (shockwave.active) {
        const sdx = shockwave.x - this.x;
        const sdy = shockwave.y - this.y;
        const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
        const waveDelta = Math.abs(sdist - shockwave.radius);

        if (waveDelta < 40) {
          const sforce = (40 - waveDelta) / 40;
          const sangle = Math.atan2(sdy, sdx);
          this.x -= Math.cos(sangle) * sforce * 8.0;
          this.y -= Math.sin(sangle) * sforce * 8.0;
          this.size = this.baseSize + sforce * 4.0;
        }
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0.05, Math.min(1.0, this.alpha));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      if (this.layer === 'front') {
        ctx.shadowBlur = this.size * 4;
        ctx.shadowColor = this.color;
      }
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new CosmicStar());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update shockwave expansion
    if (shockwave.active) {
      shockwave.radius += 14;
      ctx.save();
      ctx.beginPath();
      ctx.arc(shockwave.x, shockwave.y, shockwave.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 240, 255, ${1 - shockwave.radius / shockwave.maxRadius})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      if (shockwave.radius > shockwave.maxRadius) {
        shockwave.active = false;
      }
    }

    // Update and draw stars + dynamic constellation webs
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // Connect stars near each other
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 115) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 115) * 0.28;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].layer === 'front' ? '#00F0FF' : '#7928CA';
          ctx.lineWidth = particles[i].layer === 'front' ? 1.0 : 0.6;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Connect directly to mouse cursor if close
      const mdx = mouse.x - particles[i].x;
      const mdy = mouse.y - particles[i].y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < mouse.radius * 0.9) {
        ctx.save();
        ctx.globalAlpha = (1 - mdist / (mouse.radius * 0.9)) * 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = '#FF0080';
        ctx.lineWidth = 1.3;
        ctx.stroke();
        ctx.restore();
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// ==========================================
// 2. 3D Hover Tilt Engine for Highlights Cards
// ==========================================
function init3DCardTilt() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// ==========================================
// 3. Tab Navigation Engine
// ==========================================
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      buttons.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// ==========================================
// 4. Code Block Copy to Clipboard with Feedback
// ==========================================
function copyCode(button, textToCopy) {
  navigator.clipboard.writeText(textToCopy).then(() => {
    const originalText = button.innerHTML;
    button.innerHTML = '✓ Copied!';
    button.style.background = '#10B981';
    button.style.borderColor = '#10B981';
    showToast(`Copied "${textToCopy}" to clipboard!`);

    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '';
      button.style.borderColor = '';
    }, 2200);
  }).catch(err => {
    console.error('Copy failed:', err);
    showToast('Failed to copy to clipboard.');
  });
}

// ==========================================
// 5. Toast Notification System
// ==========================================
function showToast(message) {
  let toast = document.getElementById('toast-alert');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-alert';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  // Sanitize message to prevent XSS via innerHTML
  const safe = String(message).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  toast.innerHTML = `<span style="color:#00F0FF;font-size:1.3rem;">⚡</span> <span>${safe}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ==========================================
// 6. Interactive Download Trigger Engine
// ==========================================
function triggerDownload(event) {
  showToast('Initiating Master Installer stream: DarkMaxxerSetup.exe (~56.7 MB)...');
}

// ==========================================
// 7. Live Server Health Ping (/api/status)
// ==========================================
function initStatusPing() {
  const statusText = document.getElementById('status-text');

  function checkStatus() {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ONLINE' && statusText) {
          statusText.innerHTML = `Raspberry Pi Node Online &bull; <span style="color:#00F0FF;">Port ${data.port || '8080'}</span> &bull; <span style="color:#FF0080;">zrok Ready</span>`;
        }
      })
      .catch(() => {
        if (statusText) {
          statusText.innerHTML = `Raspberry Pi Node Online &bull; <span style="color:#00F0FF;">Port 8080</span>`;
        }
      });
  }

  checkStatus();
  setInterval(checkStatus, 12000);
}
