/* Helpers */
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

const viewport = $("#viewport");
const slider = $("#slider");
const links = $$(".nav__link");

let index = 0;                   // current panel index (0..3)
let isAnimating = false;
let panels = $$(".panel");
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

/* --- Project data (fill with real media later) --- */
const PROJECTS = {
  art: {
    p1: { title:"Porcelain Waves", desc:"Stoneware, CNC moulds, hand-finished glazes.",
      media:[{type:"img", src:"assets/art-1.jpg"}, {type:"img", src:"assets/art-2.jpg"}, {type:"img", src:"assets/art-3.jpg"}] },
    p2: { title:"Lattice Vessel", desc:"3D printed clay, reduction firing.",
      media:[{type:"img", src:"assets/art-2.jpg"}] },
    p3: { title:"Dark Relief", desc:"Bas-relief study in gypsum.",
      media:[{type:"img", src:"assets/art-3.jpg"}] },
    p4: { title:"Light Object", desc:"Aluminum frame, diffusion fabrics.",
      media:[{type:"img", src:"assets/design-1.jpg"}] },
    p5: { title:"Series A #5", desc:"Ceramic object.", media:[{type:"img", src:"assets/art-1.jpg"}] },
    p6: { title:"Series A #6", desc:"Ceramic object.", media:[{type:"img", src:"assets/art-2.jpg"}] },
    p7: { title:"Series A #7", desc:"Ceramic object.", media:[{type:"img", src:"assets/art-3.jpg"}] },
    p8: { title:"Series A #8", desc:"Ceramic object.", media:[{type:"img", src:"assets/design-2.jpg"}] },
  },
  design: {
    p1: { title:"Facade Pattern A", desc:"Aluminum / HPL systems, CNC and powder coating.",
      media:[{type:"img", src:"assets/design-1.jpg"}, {type:"img", src:"assets/design-2.jpg"}] },
    p2: { title:"Partition Panel", desc:"Backlit organic pattern.",
      media:[{type:"img", src:"assets/design-2.jpg"}] },
    p3: { title:"Acoustic Tiles", desc:"Felt + MDF parametric array.",
      media:[{type:"img", src:"assets/design-3.jpg"}] },
    p4: { title:"Pergola", desc:"Parametric ribs and shadows.",
      media:[{type:"img", src:"assets/design-1.jpg"}] },
    p5: { title:"Design #5", desc:"Prototype.", media:[{type:"img", src:"assets/design-3.jpg"}] },
    p6: { title:"Design #6", desc:"Prototype.", media:[{type:"img", src:"assets/design-2.jpg"}] },
    p7: { title:"Design #7", desc:"Prototype.", media:[{type:"img", src:"assets/design-1.jpg"}] },
    p8: { title:"Design #8", desc:"Prototype.", media:[{type:"img", src:"assets/design-2.jpg"}] },
  },
  code: {
    p1: { title:"Tunnel Field", desc:"GLSL field & feedback.", media:[{type:"img", src:"assets/code-1.jpg"}] },
    p2: { title:"Particles", desc:"Depth-mapped point cloud.", media:[{type:"img", src:"assets/code-2.jpg"}] },
    p3: { title:"Grid Streaks", desc:"Realtime stripes system.", media:[{type:"img", src:"assets/code-3.jpg"}] },
    p4: { title:"Mapping Set", desc:"Projection loops pack.", media:[{type:"img", src:"assets/code-1.jpg"}] },
    p5: { title:"Code #5", desc:"Visuals.", media:[{type:"img", src:"assets/code-2.jpg"}] },
    p6: { title:"Code #6", desc:"Visuals.", media:[{type:"img", src:"assets/code-3.jpg"}] },
    p7: { title:"Code #7", desc:"Visuals.", media:[{type:"img", src:"assets/code-1.jpg"}] },
    p8: { title:"Code #8", desc:"Visuals.", media:[{type:"img", src:"assets/code-2.jpg"}] },
  }
};

function indexFromHash(){
  const hash = window.location.hash.replace('#','').split('/')[0];
  const map = { art:0, design:1, code:2, contact:3 };
  if (map.hasOwnProperty(hash)) return map[hash];
  return 0;
}

function goTo(i, {animate=true} = {}){
  i = Math.max(0, Math.min(3, i));
  if (i === index && !isAnimating) return;
  isAnimating = true;
  document.body.classList.add('body--animating');
  const x = -i * window.innerWidth;
  slider.style.transform = `translateX(${x}px)`;
  panels.forEach((panel, pIdx) => {
    const offset = (pIdx - i) * window.innerWidth;
    panel.style.setProperty('--x', `${-offset}px`);
  });
  links.forEach((a, k)=> a.classList.toggle('is-active', k === i));
  const id = ['art','design','code','contact'][i];
  if (!location.hash.startsWith(`#${id}`)){ history.replaceState(null, '', `#${id}`); }
  window.setTimeout(()=>{
    index = i; isAnimating = false; document.body.classList.remove('body--animating');
  }, animate ? 720 : 0);
}

links.forEach(a => {
  a.addEventListener('click', e => { e.preventDefault(); goTo(parseInt(a.dataset.index, 10)); });
});

/* Wheel navigation removed by request */

let startX = 0, startY = 0, swiping = false;
window.addEventListener('touchstart', (e)=>{
  if (!e.touches.length) return;
  startX = e.touches[0].clientX; startY = e.touches[0].clientY; swiping = true;
}, {passive:true});
window.addEventListener('touchmove', (e)=>{
  if (!swiping) return;
  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;
  if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy)) return;
  e.preventDefault();
}, {passive:false});
window.addEventListener('touchend', (e)=>{
  if (!swiping) return;
  const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
  const dx = endX - startX;
  if (Math.abs(dx) > 60){ if (dx < 0) goTo(index+1); else goTo(index-1); }
  swiping = false;
});

window.addEventListener('keydown', (e)=>{
  if (overlay.hidden){
    if (e.key === 'ArrowRight' || e.key === 'PageDown') goTo(index+1);
    if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   goTo(index-1);
  }
});

window.addEventListener('resize', ()=>{
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  goTo(index, {animate:false});
});

const overlay = $("#project-overlay");
const ovTitle = $("#ov-title");
const ovDesc  = $("#ov-desc");
const ovStage = $("#ov-stage");
const btnClose = $(".overlay__close");
const btnPrev  = $(".ov-prev");
const btnNext  = $(".ov-next");

let current = { section:null, id:null, mediaIndex:0 };

function renderMedia(){
  const item = PROJECTS[current.section][current.id];
  if (!item) return;
  const m = item.media[current.mediaIndex];
  ovStage.innerHTML = "";
  if (m.type === "img"){ const el = document.createElement("img"); el.src = m.src; el.alt = item.title; ovStage.appendChild(el); }
  else if (m.type === "video"){ const v = document.createElement("video"); v.src = m.src; v.controls = true; v.playsInline = true; ovStage.appendChild(v); }
}

function openProject(section, id, fromHash=false){
  const item = PROJECTS[section]?.[id]; if (!item) return;
  current = { section, id, mediaIndex:0 };
  ovTitle.textContent = item.title; ovDesc.textContent  = item.desc; renderMedia();
  overlay.hidden = false; document.body.style.overflow = "hidden";
  if (!fromHash){ history.pushState(null, "", `#${section}/${id}`); }
}

function closeProject(){
  overlay.hidden = true; document.body.style.overflow = "hidden";
  const secHash = ['art','design','code','contact'][index] || 'art';
  history.pushState(null, "", `#${secHash}`);
}

btnClose.addEventListener("click", closeProject);
btnPrev.addEventListener("click", ()=> { const item = PROJECTS[current.section][current.id]; current.mediaIndex = (current.mediaIndex - 1 + item.media.length) % item.media.length; renderMedia(); });
btnNext.addEventListener("click", ()=> { const item = PROJECTS[current.section][current.id]; current.mediaIndex = (current.mediaIndex + 1) % item.media.length; renderMedia(); });
window.addEventListener("keydown", (e)=>{ if (overlay.hidden) return; if (e.key === "Escape") closeProject(); if (e.key === "ArrowLeft") btnPrev.click(); if (e.key === "ArrowRight") btnNext.click(); });

$$(".tile").forEach(t=>{
  t.addEventListener("click", (e)=>{
    e.preventDefault();
    const section = t.dataset.section; const id = t.dataset.id;
    const map = { art:0, design:1, code:2, contact:3 };
    if (map[section] !== index) goTo(map[section]);
    openProject(section, id);
  });
});

function parseHash(){
  const h = (location.hash || "#art").slice(1);
  const [sec, pid] = h.split("/");
  const map = { art:0, design:1, code:2, contact:3 };
  if (map.hasOwnProperty(sec)){
    goTo(map[sec], {animate:false});
    if (pid) openProject(sec, pid, true);
    else if (!overlay.hidden) closeProject();
  }
}
window.addEventListener("hashchange", parseHash);

window.addEventListener('load', ()=>{
  window.scrollTo(0, 0);
  index = indexFromHash();
  goTo(index, {animate:false});
  parseHash();
});
