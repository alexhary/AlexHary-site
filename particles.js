/* particles_zoom2.js — offline background with zoom x2 and cursor reaction */
(function(){
  const canvas = document.getElementById('bgParticles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;

  const mode = canvas.dataset.mode || "trail";
  const count = parseInt(canvas.dataset.count || 240);
  const speed = parseFloat(canvas.dataset.speed || 0.55);
  const fade = parseFloat(canvas.dataset.fade || 0.08);
  const linkDist = parseFloat(canvas.dataset["linkDistance"] || 120);
  const lineAlpha = parseFloat(canvas.dataset["lineAlpha"] || 0.30);
  const pxratio = parseFloat(canvas.dataset["pxratio"] || 2);
  const react = parseFloat(canvas.dataset["react"] || 0.15);
  const zoom = 2; // масштаб 2×

  // курсор
  let mouse = {x:0.5, y:0.5};
  window.addEventListener("mousemove", e=>{
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = e.clientY / window.innerHeight;
  });
  window.addEventListener("touchmove", e=>{
    if (!e.touches.length) return;
    mouse.x = e.touches[0].clientX / window.innerWidth;
    mouse.y = e.touches[0].clientY / window.innerHeight;
  }, {passive:true});

  const dpr = Math.min(window.devicePixelRatio || 1, pxratio);

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const particles = [];
  for (let i=0; i<count; i++){
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed
    });
  }

  function applyTransform(){
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(width/2, height/2);
    ctx.scale(zoom, zoom);
    ctx.translate(-width/2, -height/2);
  }

  function resize(){
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    applyTransform();
  }
  window.addEventListener('resize', resize);

  applyTransform();

  let lastTime = performance.now();
  function update(time){
    const dt = (time - lastTime) / 16.7;
    lastTime = time;

    // очистка / шлейф
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    const fadeNow = fade * 0.6 * Math.min(dt,2.0);
    if (mode === "trail"){
      ctx.fillStyle = `rgba(0,0,0,${fadeNow})`;
      ctx.fillRect(0, 0, width * dpr, height * dpr);
    } else {
      ctx.clearRect(0, 0, width * dpr, height * dpr);
    }
    ctx.restore();

    applyTransform();

    // частицы
    for (let i=0; i<count; i++){
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // реакция на курсор (усиленная)
      p.vx += (mouse.x - p.x / width) * react * 0.15;
      p.vy += (mouse.y - p.y / height) * react * 0.15;

      if (p.x < 0 || p.x > width)  p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI*2);
      ctx.fillStyle = `rgba(180,210,255,${lineAlpha * 1.3})`;
      ctx.fill();
    }

    // связи
    ctx.lineWidth = 1;
    for (let i=0; i<count; i++){
      const p1 = particles[i];
      for (let j=i+1; j<count; j++){
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < linkDist){
          const a = 1 - dist / linkDist;
          ctx.strokeStyle = `rgba(100,160,255,${a * lineAlpha * 1.3})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
})();
