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

/* --- Project data placeholder --- */
const PROJECTS = {
  art: { p1:{title:"A1",desc:""}, p2:{title:"A2",desc:""}, p3:{title:"A3",desc:""}, p4:{title:"A4",desc:""},
         p5:{title:"A5",desc:""}, p6:{title:"A6",desc:""}, p7:{title:"A7",desc:""}, p8:{title:"A8",desc:""} },
  design: { p1:{title:"D1",desc:""}, p2:{title:"D2",desc:""}, p3:{title:"D3",desc:""}, p4:{title:"D4",desc:""},
            p5:{title:"D5",desc:""}, p6:{title:"D6",desc:""}, p7:{title:"D7",desc:""}, p8:{title:"D8",desc:""} },
  code: { p1:{title:"C1",desc:""}, p2:{title:"C2",desc:""}, p3:{title:"C3",desc:""}, p4:{title:"C4",desc:""},
          p5:{title:"C5",desc:""}, p6:{title:"C6",desc:""}, p7:{title:"C7",desc:""}, p8:{title:"C8",desc:""} }
};

/* --- Init from hash --- */
function indexFromHash(){
  const hash = window.location.hash.replace('#','').split('/')[0];
  const map = { art:0, design:1, code:2, contact:3 };
  if (map.hasOwnProperty(hash)) return map[hash];
  return 0;
}

/* --- Navigation --- */
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
  if (!location.hash.startsWith(`#${id}`)){
    history.replaceState(null, '', `#${id}`);
  }

  window.setTimeout(()=>{
    index = i;
    isAnimating = false;
    document.body.classList.remove('body--animating');
  }, animate ? 720 : 0);
}

/* --- Click nav --- */
links.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const i = parseInt(a.dataset.index, 10);
    goTo(i);
  });
});

/* --- Wheel navigation: DISABLED by request --- */
/* (intentionally removed) */

/* --- Touch / swipe --- */
let startX = 0, startY = 0, swiping = false;
window.addEventListener('touchstart', (e)=>{
  if (!e.touches.length) return;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  swiping = true;
}, {passive:true});

window.addEventListener('touchmove', (e)=>{
  if (!swiping) return;
  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;
  if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy)) return; // horizontal intent
  e.preventDefault();
}, {passive:false});

window.addEventListener('touchend', (e)=>{
  if (!swiping) return;
  const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
  const dx = endX - startX;
  if (Math.abs(dx) > 60){
    if (dx < 0) goTo(index+1); else goTo(index-1);
  }
  swiping = false;
});

/* --- Keyboard --- */
window.addEventListener('keydown', (e)=>{
  if (overlay.hidden){
    if (e.key === 'ArrowRight' || e.key === 'PageDown') goTo(index+1);
    if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   goTo(index-1);
  }
});

/* --- Resize / vh fix --- */
window.addEventListener('resize', ()=>{
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  goTo(index, {animate:false});
});

/* ---------- Project overlay logic ---------- */
const overlay = $("#project-overlay");
const ovTitle = $("#ov-title");
const ovDesc  = $("#ov-desc");
const ovStage = $("#ov-stage");
const btnClose = $(".overlay__close");
const btnPrev  = $(".ov-prev");
const btnNext  = $(".ov-next");

let current = { section:null, id:null, mediaIndex:0 };

function openProject(section, id, fromHash=false){
  current = { section, id, mediaIndex:0 };
  ovTitle.textContent = (PROJECTS[section] && PROJECTS[section][id] && PROJECTS[section][id].title) || 'Project';
  ovDesc.textContent  = (PROJECTS[section] && PROJECTS[section][id] && PROJECTS[section][id].desc) || '';
  ovStage.innerHTML = "";
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  if (!fromHash){
    history.pushState(null, "", `#${section}/${id}`);
  }
}

function closeProject(){
  overlay.hidden = true;
  document.body.style.overflow = "hidden";
  const secHash = ['art','design','code','contact'][index] || 'art';
  history.pushState(null, "", `#${secHash}`);
}

btnClose.addEventListener("click", closeProject);
window.addEventListener("keydown", (e)=>{ if (!overlay.hidden && e.key === "Escape") closeProject(); });

/* Click on tiles */
$$(".tile").forEach(t=>{
  t.addEventListener("click", (e)=>{
    e.preventDefault();
    const section = t.dataset.section;
    const id = t.dataset.id;
    const map = { art:0, design:1, code:2, contact:3 };
    if (map[section] !== index) goTo(map[section]);
    openProject(section, id);
  });
});

/* Hash router */
function parseHash(){
  const h = (location.hash || "#art").slice(1); // e.g. art/p1
  const [sec, pid] = h.split("/");
  const map = { art:0, design:1, code:2, contact:3 };
  if (map.hasOwnProperty(sec)){
    goTo(map[sec], {animate:false});
    if (pid) openProject(sec, pid, true);
    else if (!overlay.hidden) closeProject();
  }
}
window.addEventListener("hashchange", parseHash);

/* --- Initialize positions and active state --- */
window.addEventListener('load', ()=>{
  window.scrollTo(0, 0); // avoid centering on mobile
  index = indexFromHash();
  goTo(index, {animate:false});
  parseHash();
});
