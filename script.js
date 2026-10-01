const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

// nav
const nav = $('#siteNav');
const menu = $('.nav-menu');
menu?.addEventListener('click',()=>{
  const open = nav.classList.toggle('menu-open');
  menu.setAttribute('aria-expanded', String(open));
});
$$('.nav-links a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}));
document.addEventListener('click',e=>{if(!nav.contains(e.target)){nav.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}});
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>25),{passive:true});

// Scroll polish: lightweight progress bar + current section indicator.
const scrollProgress = $('#scrollProgress i');
const navSectionLinks = $$('.nav-links a[href^=\"#\"]');
const sectionTargets = navSectionLinks.map(a=>({a,el:$(a.getAttribute('href'))})).filter(x=>x.el);
let scrollRaf=0;
function updateScrollUI(){
  scrollRaf=0;
  const doc=document.documentElement;
  const max=doc.scrollHeight-window.innerHeight;
  const pct=max>0 ? Math.min(100,Math.max(0,(window.scrollY/max)*100)) : 0;
  if(scrollProgress) scrollProgress.style.width=pct+'%';
  let current=null;
  for(const item of sectionTargets){
    const top=item.el.getBoundingClientRect().top;
    if(top<=window.innerHeight*0.35) current=item;
  }
  navSectionLinks.forEach(a=>a.classList.remove('active'));
  current?.a.classList.add('active');
}
window.addEventListener('scroll',()=>{if(!scrollRaf) scrollRaf=requestAnimationFrame(updateScrollUI)},{passive:true});
window.addEventListener('resize',()=>{if(!scrollRaf) scrollRaf=requestAnimationFrame(updateScrollUI)},{passive:true});
updateScrollUI();

// cursor glow
const orb = $('.cursor-orb');
let orbRaf = 0, orbX = 0, orbY = 0;
window.addEventListener('pointermove', e => {
  if(!orb) return;
  orbX = e.clientX; orbY = e.clientY;
  if(orbRaf) return;
  orbRaf = requestAnimationFrame(() => {
    orb.style.transform = `translate3d(${orbX}px,${orbY}px,0) translate(-50%,-50%)`;
    orbRaf = 0;
  });
}, {passive:true});

// count-up stats
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
$$('[data-count]').forEach(el=>{
  const target = Number(el.dataset.count);
  if(reduceMotion){el.textContent=target.toLocaleString();return}
  const start=performance.now(),duration=1100;
  const tick=now=>{const p=Math.min(1,(now-start)/duration), eased=1-Math.pow(1-p,3);el.textContent=Math.round(target*eased).toLocaleString();if(p<1)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
});

// Small hero signal ticker. It stays decorative and stops when the tab is hidden.
const signalTicker = $('#signalTicker');
const signalMessages = [
  'CHROMEUS FEED: ONLINE',
  'NEXUS SIGNAL: STABLE-ISH',
  '1,446 SLIDES DETECTED',
  'PORTAL ROUTE: AVAILABLE',
  'DIMENSIONAL MESS: 01'
];
let signalIndex = 0;
let signalTimer = null;
function rotateSignal(){
  if(document.hidden){ signalTimer=null; return; }
  if(signalTicker){
    signalTicker.style.opacity='0';
    window.setTimeout(()=>{
      signalIndex=(signalIndex+1)%signalMessages.length;
      signalTicker.textContent=signalMessages[signalIndex];
      signalTicker.style.opacity='1';
    },140);
  }
  signalTimer=window.setTimeout(rotateSignal,4200);
}
rotateSignal();
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){ clearTimeout(signalTimer); signalTimer=null; }
  else if(!signalTimer) rotateSignal();
});

// reveal on scroll
const revealItems = $$('.route-card,.act-grid article,.universe-card,.cast-card,.poster-card,.crew-card,.making-grid,.watch-card,.credits-grid,.hub-hero-card,.statement-grid');
if('IntersectionObserver' in window){
  const ro = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('revealed');
      ro.unobserve(entry.target);
    }
  }),{threshold:.08});
  revealItems.forEach(el=>{el.classList.add('will-reveal');ro.observe(el)});
}

// scan joke
const scanButton = $('#scanButton');
const scanResult = $('#scanResult');
const scanLines = [
  'scan complete. result: absolutely no reason this needed 1,446 slides.',
  'scan complete. chromeus is still somewhere over there.',
  'scan complete. dimensional stability remains questionable.',
  'scan complete. pleuh levels: within expected range.',
  'scan complete. recommendation: watch the movie.'
];
scanButton?.addEventListener('click',()=>{
  scanResult.textContent='scanning...';
  setTimeout(()=>scanResult.textContent=scanLines[Math.floor(Math.random()*scanLines.length)],420);
});

// Poster room: the character posters are grouped by their source universe.
const universePosterData = {
  bots: {
    name:'THE BOT GAMES', className:'room-bots', mark:'BOT', kicker:'SIGNAL: BOT GAMES', stat:'235 PLAYERS', mood:'MECHANICAL / COMPETITIVE / LOUD', note:'The robots get a proper technical bay: scanlines, diagnostics and a little game-show energy around their posters.',
    posters:[
      ['p05','Geobot'],['p06','Subot'],['p07','Maxbot'],['p08','Emobot'],['p09','Nerdbot'],['p10','Frank'],['p26','Maxbot — feature']
    ]
  },
  eightfit: {
    name:'8FIT', className:'room-8fit', mark:'8F', kicker:'SIGNAL: 8FIT', stat:'4 HUMAN POSTERS', mood:'HUMAN / LATE-NIGHT / CHAOS', note:'A warmer, more human corner for the 8FIT crew, with diary-card details and a slightly less robotic interface.',
    posters:[
      ['p11','Elijah'],['p12','Malachi'],['p13','Shay'],['p14','Ayaan'],['p25','Elijah — feature']
    ]
  },
  colours: {
    name:'COLOURS', className:'room-colours', mark:'C', kicker:'SIGNAL: COLOURS', stat:'6 COLOUR SIGNALS', mood:'COLOUR / POWERS / PERSONALITY', note:'This bay gets colour bars, little power-signature readouts and a deliberately vibrant treatment to match the source world.',
    posters:[
      ['p15','Turquoise'],['p16','Gold'],['p17','Blue'],['p18','Green'],['p19','Cyan'],['p20','Red'],['p24','Turquoise — feature']
    ]
  },
  algo: {
    name:'ALGOTRIACONTATHLON', className:'room-algo', mark:'EXQ', kicker:'SIGNAL: ALGOTRIACONTATHLON', stat:'EXQ ONLINE', mood:'HOST / COMPETITION / BROADCAST', note:'A broadcast-style bay for EXQ Genius, with competition markers and host-console decoration around the original poster art.',
    posters:[
      ['p21','EXQ Genius'],['p27','EXQ Genius — feature']
    ]
  },
  crossover: {
    name:'NEXUS COLLISION', className:'room-crossover', mark:'×', kicker:'SIGNAL: CROSSOVER', stat:'COLLISION FILES', mood:'ENSEMBLE / PORTALS / DIMENSIONAL', note:'The shared artwork lives here: ensemble pieces, release artwork and the posters built around the Transdimensionalizer.',
    posters:[
      ['p02','Ensemble teaser'],['p03','Main release'],['p23','Ensemble'],
      ['p02','Transdimensionalizer 2000','landscape'],['p03','Main crossover poster','landscape'],['p06','Faceoff','landscape']
    ]
  }
};

const posterRoom = $('#posterRoom');
const posterPortalTransition = $('#posterPortalTransition');
const posterRoomGroups = $('#posterRoomGroups');
const posterGrid = posterRoomGroups;
const portalOpenButton = $('#openPosterRoom');
const portalCloseButton = $('#closePosterRoom');
let filteredPosters=[];

function posterPath(id, type='portrait'){ return `assets/posters/${type}/${id}.png`; }
function posterThumbPath(id, type='portrait'){ return `assets/poster-thumbs/${type}/${id}.webp`; }
let roomPosterCache=null;
function allRoomPosters(){
  if(!roomPosterCache) roomPosterCache=Object.entries(universePosterData).flatMap(([universe,data])=>data.posters.map(([id,title,type='portrait'])=>({id,title,type,universe,className:data.className})));
  return roomPosterCache;
}

function renderPosterRoom(filter='all', focusUniverse=null){
  if(!posterRoomGroups) return;
  const entries=Object.entries(universePosterData).filter(([key])=>filter==='all'||key===filter);
  posterRoomGroups.innerHTML=entries.map(([key,data])=>{
    const cards=data.posters.map(([id,title,type='portrait'],i)=>{
      const src=posterPath(id,type);
      const thumb=posterThumbPath(id,type);
      const index = allRoomPosters().findIndex(p=>p.id===id&&p.title===title&&p.type===type);
      const dims = type==='landscape' ? 'width=600 height=338' : 'width=450 height=636';
      const feature = /feature/i.test(title);
      return `<button class="room-poster ${type}${feature?' feature-poster':''}" type="button" data-room-index="${index}" aria-label="Open ${title} poster"><span class="poster-pin"></span>${feature?'<span class="feature-ribbon">FEATURE</span>':''}<img src="${thumb}" data-full="${src}" alt="${title} poster" loading="lazy" decoding="async" ${dims}><span class="room-poster-caption"><b>${title}</b><small>${type==='landscape'?'LANDSCAPE':'CHARACTER'} / ORIGINAL ART</small></span></button>`;
    }).join('');
    return `<article class="poster-universe-group ${data.className}" data-universe-group="${key}">
      <div class="universe-plaque"><div class="plaque-mark">${data.mark}</div><div class="plaque-copy"><span>${data.kicker}</span><h3>${data.name}</h3><p>${data.note}</p><div class="plaque-tags"><b>${data.stat}</b><span>${data.mood}</span></div></div><div class="plaque-scan"><i></i><b>ONLINE</b></div></div>
      <div class="room-poster-grid">${cards}</div>
    </article>`;
  }).join('');
  if(focusUniverse){
    const el=$(`.poster-universe-group[data-universe-group="${focusUniverse}"]`);
    el?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
  }
  $$('.room-poster',posterRoomGroups).forEach(card=>card.addEventListener('click',()=>{
    const visible = Array.from(posterRoomGroups.querySelectorAll('.poster-universe-group'))
      .flatMap(group => Array.from(group.querySelectorAll('.room-poster')).map(x => Number(x.dataset.roomIndex)))
      .map(i => allRoomPosters()[i]);
    const clicked = allRoomPosters()[Number(card.dataset.roomIndex)];
    filteredPosters = visible;
    const localIndex = filteredPosters.findIndex(p=>p.id===clicked.id && p.title===clicked.title && p.type===clicked.type);
    openLightbox(localIndex < 0 ? 0 : localIndex);
  }));
}
// Poster Room is rendered lazily when opened. This avoids decoding 27 large posters on page load.


function openPosterPortal(focusUniverse=null){
  if(!posterRoom || !posterPortalTransition) return;
  const portalTitle=$('#portalTransitionTitle');
  const portalStatus=$('#portalTransitionStatus');
  document.body.classList.add('poster-portal-pull');
  posterPortalTransition.classList.add('show');
  posterPortalTransition.setAttribute('aria-hidden','false');
  posterRoom.classList.remove('open');
  portalTitle && (portalTitle.textContent=focusUniverse && universePosterData[focusUniverse] ? `ENTERING ${universePosterData[focusUniverse].name.toUpperCase()} ARCHIVE...` : 'ENTERING POSTER ARCHIVE...');
  portalStatus && (portalStatus.textContent='locking coordinates · please keep all limbs inside the dimension.');
  window.setTimeout(()=>{ if(portalStatus) portalStatus.textContent='coordinates locked · dimensional passage stable-ish.'; },620);
  window.setTimeout(()=>{ if(portalStatus) portalStatus.textContent='arrival vector confirmed · opening archive.'; },1080);
  window.setTimeout(()=>{
    posterRoom.classList.add('open');
    posterRoom.setAttribute('aria-hidden','false');
    document.body.classList.remove('poster-portal-pull');
    document.body.style.overflow='hidden';
    $$('.room-filter').forEach(b=>b.classList.toggle('active',b.dataset.roomFilter===(focusUniverse||'all')));
    renderPosterRoom(focusUniverse||'all',focusUniverse);
  },1350);
  window.setTimeout(()=>{
    posterPortalTransition.classList.remove('show');
    posterPortalTransition.setAttribute('aria-hidden','true');
  },1540);
}
function closePosterPortal(){
  if(!posterRoom) return;
  posterRoom.classList.remove('open');
  posterRoom.setAttribute('aria-hidden','true');
  posterPortalTransition?.classList.remove('show');
  posterPortalTransition?.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  document.body.classList.remove('poster-portal-pull');
  window.setTimeout(()=>{
    if(!posterRoom?.classList.contains('open') && posterRoomGroups){
      posterRoomGroups.innerHTML='';
    }
  },120);
}
portalOpenButton?.addEventListener('click',()=>openPosterPortal());
portalCloseButton?.addEventListener('click',closePosterPortal);
posterRoom?.addEventListener('click',e=>{ if(e.target===posterRoom || e.target.closest('.poster-room-backdrop')) closePosterPortal(); });
$$('.directory-jump').forEach(btn=>btn.addEventListener('click',()=>openPosterPortal(btn.dataset.openUniverse)));
$$('.room-filter').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.room-filter').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderPosterRoom(btn.dataset.roomFilter);
  posterRoom?.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'});
}));

// poster lightbox
const lightbox=$('#lightbox'), lbImg=$('#lightboxImg'), lbMeta=$('#lightboxMeta'), lbTitle=$('#lightboxTitle');let lbIndex=0;
function openLightbox(i){
  lbIndex=i;
  const p=filteredPosters[lbIndex];
  if(!p) return;
  lbImg.src=p.src;
  lbImg.alt=p.title+' poster';
  lbMeta.textContent=`${p.type} / original marketing art`;
  lbTitle.textContent=p.title;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}
function closeLightbox(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  window.setTimeout(()=>{ if(!lightbox.classList.contains('open')) lbImg.removeAttribute('src'); },220);
}
function moveLightbox(dir){lbIndex=(lbIndex+dir+filteredPosters.length)%filteredPosters.length;openLightbox(lbIndex)}
$('#lightboxClose').addEventListener('click',closeLightbox);$('#lightboxPrev').addEventListener('click',()=>moveLightbox(-1));$('#lightboxNext').addEventListener('click',()=>moveLightbox(1));lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeLightbox();closeCast();closePosterPortal()}
  if(lightbox.classList.contains('open')){if(e.key==='ArrowRight')moveLightbox(1);if(e.key==='ArrowLeft')moveLightbox(-1)}
});

// Making-of player: local file builds cannot reliably provide YouTube the referrer
// information its embedded player expects, which is a known cause of Error 153.
// On file://, use a polished local fallback that opens the real video instead.
// On an actual hosted page, use the privacy-enhanced embed with an explicit referrer policy.
const makingOfFrame = $('#makingOfFrame');
const videoStatus = $('#videoStatus');
const makingOfVideoId = 'GgjMURUGig8';
const makingOfUrl = `https://www.youtube.com/watch?v=${makingOfVideoId}`;
function renderMakingOfPlayer(){
  if(!makingOfFrame) return;
  if(location.protocol === 'file:'){
    makingOfFrame.innerHTML = `<a class="video-fallback" href="${makingOfUrl}" target="_blank" rel="noopener noreferrer"><strong>WATCH THE MAKING-OF ON YOUTUBE ↗</strong><span>The embedded player is disabled for local file previews. Open the video directly and it will play normally.</span><em class="video-local-note">LOCAL PREVIEW MODE / YOUTUBE EMBEDS NEED A WEB OR HTTPS ORIGIN</em></a>`;
    if(videoStatus) videoStatus.textContent='LOCAL PREVIEW';
    return;
  }
  const origin = encodeURIComponent(location.origin);
  makingOfFrame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${makingOfVideoId}?rel=0&modestbranding=1&playsinline=1&origin=${origin}" title="Nexus-Verse vs Colours making-of video" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  if(videoStatus) videoStatus.textContent='EMBED READY';
}
renderMakingOfPlayer();

// tiny stability Easter egg
const stability=$('#stability');
let stabilityTimer=null;
function rotateStability(){
  if(document.hidden){ stabilityTimer=null; return; }
  const states=['QUESTIONABLE','STABLE-ISH','PROBABLY FINE','UNKNOWN','QUESTIONABLE'];
  if(stability) stability.textContent=states[Math.floor(Math.random()*states.length)];
  stabilityTimer=window.setTimeout(rotateStability,3200);
}
rotateStability();
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){ clearTimeout(stabilityTimer); stabilityTimer=null; }
  else if(!stabilityTimer) rotateStability();
});

// secret spoiler mode — type PLEUH anywhere on the page
const spoilerZone = $('#spoilerZone');
const spoilerUnlock = $('#spoilerUnlock');
const lockSpoilers = $('#lockSpoilers');
const spoilerChip = $('.nav-pill');
let pleuhBuffer = '';
let spoilerTimer = null;

function setSpoilerMode(open, showFlash=true){
  document.body.classList.toggle('spoilers-unlocked', open);
  spoilerZone?.setAttribute('aria-hidden', String(!open));
  if(spoilerChip) spoilerChip.textContent = open ? 'SPOILERS UNLOCKED' : 'SPOILER-FREE';
  if(open){
    spoilerZone?.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block:'center'});
  }
  if(showFlash && open){
    spoilerUnlock?.classList.add('show');
    spoilerUnlock?.setAttribute('aria-hidden','false');
    clearTimeout(spoilerTimer);
    spoilerTimer=setTimeout(()=>{spoilerUnlock?.classList.remove('show');spoilerUnlock?.setAttribute('aria-hidden','true')},1900);
  }
}

window.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  const tag=document.activeElement?.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||document.activeElement?.isContentEditable) return;
  if(e.key.length!==1) return;
  pleuhBuffer=(pleuhBuffer+e.key.toLowerCase()).slice(-5);
  if(pleuhBuffer==='pleuh'){
    pleuhBuffer='';
    setSpoilerMode(!document.body.classList.contains('spoilers-unlocked'));
  }
});

lockSpoilers?.addEventListener('click',()=>setSpoilerMode(false,false));

/* =========================================================
   V3 INTERACTIONS
   ========================================================= */

// Chromeus navigator: click the actual supplied Transdimensionalizer image.
const transDevice = $('#transDimensionalizer');
const chromeusBg = $('#chromeusBg');
const chromeusViewport = $('#chromeusViewport');
const deviceStatus = $('#deviceStatus');
const deviceShots = $('#deviceShots');
const dimensionLabel = $('#dimensionLabel');
const viewportCorner = $('#viewportCorner');
const viewportMessage = $('#viewportMessage');
const viewportSub = $('#viewportSub');
const viewportReadout = $('#viewportReadout');
const viewportCoords = $('#viewportCoords');

const chromeusScenes = [
  {src:'assets/interactive/chromeus-01.png', label:'REGION 01', message:'CHROMEUS // OPEN TERRAIN', sub:'clear skies. questionable dimensional activity.', signal:'86%', coords:'14 / 07 / 22'},
  {src:'assets/interactive/chromeus-02.png', label:'REGION 02', message:'CHROMEUS // CITY EDGE', sub:'urban sector detected. absolutely no idea where the road goes.', signal:'71%', coords:'31 / 18 / 05'},
  {src:'assets/interactive/chromeus-03.png', label:'REGION 03', message:'CHROMEUS // FOREST SECTOR', sub:'tree density: concerning. visibility: also concerning.', signal:'93%', coords:'04 / 42 / 19'},
  {src:'assets/interactive/chromeus-04.png', label:'REGION 04', message:'CHROMEUS // FLOWER FIELD', sub:'everything looks suspiciously peaceful here.', signal:'99%', coords:'27 / 03 / 61'}
];
let chromeusCurrent=-1;
let shots=10;
let lastScene=-1;

function randomScene(){
  let i=Math.floor(Math.random()*chromeusScenes.length);
  if(chromeusScenes.length>1) while(i===lastScene) i=Math.floor(Math.random()*chromeusScenes.length);
  lastScene=i;
  return chromeusScenes[i];
}
function activateTransdimensionalizer(){
  const scene=randomScene();
  chromeusViewport?.classList.add('active','device-loading');
  deviceStatus.textContent='ACTIVE';
  deviceShots.textContent=`SHOTS: ${shots}`;
  dimensionLabel.textContent='TRANSITIONING...';
  viewportMessage.textContent='OPENING PORTAL...';
  viewportSub.textContent='please remain calm. probably.';
  viewportReadout.textContent='SIGNAL: ACQUIRING';
  viewportCoords.textContent='COORDS: CALCULATING';
  transDevice?.classList.add('firing');

  window.setTimeout(()=>{
    chromeusBg.style.backgroundImage=`url("${scene.src}")`;
    viewportCorner.textContent=scene.label;
    viewportMessage.textContent=scene.message;
    viewportSub.textContent=scene.sub;
    viewportReadout.textContent=`SIGNAL: ${scene.signal}`;
    viewportCoords.textContent=`COORDS: ${scene.coords}`;
    dimensionLabel.textContent='FEED LOCKED';
    deviceStatus.textContent='STABLE-ISH';
    shots = Math.max(0, shots - 1);
    deviceShots.textContent=`SHOTS: ${shots}`;
    chromeusViewport.classList.remove('device-loading');
    transDevice?.classList.remove('firing');
  }, 620);
}
transDevice?.addEventListener('click',activateTransdimensionalizer);

// Initial device hint
chromeusBg.style.backgroundImage='url("assets/interactive/chromeus-04.png")';

// Universe terminal
const universeData = {
  colours: {
    label:'COLOURS',
    lines:[
      'loading source universe...',
      'visual signature: HIGHLY COLOURFUL',
      'status: <b>CONNECTED</b>'
    ]
  },
  algo: {
    label:'ALGOTRIACONTATHLON',
    lines:[
      'loading competition universe...',
      'host signature: EXQ GENIUS',
      'status: <b>CONNECTED</b>'
    ]
  },
  bots: {
    label:'THE BOT GAMES',
    lines:[
      'loading bot universe...',
      'participants: 235',
      'status: <b>CONNECTED</b>'
    ]
  },
  unknown: {
    label:'UNKNOWN DIMENSION',
    lines:[
      'loading...',
      'loading...',
      'WHY IS IT LOUD',
      'status: <b>NOPE</b>'
    ]
  }
};
const terminalLines = $('#terminalLines');
$$('.terminal-choice').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.terminal-choice').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const key=btn.dataset.universe;
  const data=universeData[key];
  terminalLines.classList.remove('universe-glitch');
  void terminalLines.offsetWidth;
  terminalLines.classList.add('universe-glitch');
  terminalLines.innerHTML=data.lines.map((line,i)=>`<p><span>${String(i+1).padStart(2,'0')}</span>&gt; ${line}</p>`).join('');
  if(key==='unknown'){
    const chrome=$('#chromeus');
    chrome?.classList.add('universe-glitch');
    setTimeout(()=>chrome?.classList.remove('universe-glitch'),600);
  }
}));

// Fake archive viewer
const archiveInfo = {
  final:['PROJECT_NEXUS_FINAL.pptx','1,446 slides detected. finality level: suspicious.','/nexus/archive/project/final/final.pptx'],
  real:['PROJECT_NEXUS_FINAL_REAL.pptx','This file contains absolutely no evidence that the first file was final.','/nexus/archive/project/final/final_REAL.pptx'],
  '67':['SLIDE_67_DO_NOT_OPEN','You were specifically warned. The archive has nothing useful to say about slide 67.','/nexus/archive/67/uh-oh'],
  pleuh:['PLEUH.txt','Contents: pleuh\\n\\nEnd of file.','/nexus/archive/misc/pleuh.txt']
};
const archiveTitle=$('#archiveTitle'), archiveText=$('#archiveText'), archiveCode=$('#archiveCode'), archiveState=$('#archiveState');
$$('.archive-file').forEach(btn=>btn.addEventListener('click',()=>{
  const data=archiveInfo[btn.dataset.archive];
  $$('.archive-file').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  archiveState.textContent='FILE OPEN';
  archiveTitle.textContent=data[0];
  archiveText.textContent=data[1];
  archiveCode.textContent=data[2];
}));

// "DO NOT PRESS"
const dontClick=$('#dontClick'), dontClickStatus=$('#dontClickStatus');
let dontCount=0;
const dontMessages=[
  'i literally told you.',
  'why.',
  'okay you clicked it again.',
  'the machine is judging you.',
  'please stop assisting the machine.',
  'this is now officially a bit.',
  'you have pressed it 7 times. impressive.',
  'NO.',
  'fine. one last warning.',
  '...pleuh.'
];
dontClick?.addEventListener('click',()=>{
  dontCount++;
  dontClick.classList.remove('pressed'); void dontClick.offsetWidth; dontClick.classList.add('pressed');
  dontClickStatus.textContent = dontMessages[Math.min(dontCount-1,dontMessages.length-1)];
  if(dontCount===5){
    dontClick.textContent='I SAID NO';
  }
  if(dontCount>=10){
    dontClick.textContent='BUTTON DEFEATED';
    dontClickStatus.textContent='you won. the button has retired.';
    dontClick.disabled=true;
  }
});

// Production timeline
const timelineMessages={
  idea:'01 // IDEA — start with the extremely normal thought: “what if these universes met?”',
  script:'02 // SCRIPT — stitch the crossover together without losing everybody’s personalities.',
  assets:'03 // ASSETS — characters, environments, props, logos and enough tiny pieces to build scenes.',
  slides:'04 // SLIDES — the number starts climbing. 1,446 eventually becomes a real problem.',
  animites:'05 // ANIMITES — turn the static slide language into movement, one frame at a time.',
  release:'06 // RELEASE — publish the thing and let other humans experience the consequences.'
};
const timelineReadout=$('#timelineReadout');
$$('.timeline-track button').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.timeline-track button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  timelineReadout.textContent=timelineMessages[btn.dataset.time];
}));

// Persistent spoiler unlock
const originalSetSpoilerMode=setSpoilerMode;
setSpoilerMode = function(open, showFlash=true){
  originalSetSpoilerMode(open,showFlash);
  try{localStorage.setItem('nvvcSpoilers',open?'1':'0')}catch{}
};
try{
  if(localStorage.getItem('nvvcSpoilers')==='1'){
    document.body.classList.add('spoilers-unlocked');
    spoilerZone?.setAttribute('aria-hidden','false');
    if(spoilerChip) spoilerChip.textContent='SPOILERS UNLOCKED';
  }
}catch{}

// Slide 67 secret
function showSlide67(){
  if($('.slide67-overlay')) return;
  const overlay=document.createElement('div');
  overlay.className='slide67-overlay';
  overlay.innerHTML=`<div class="slide67-inner"><div class="slide67-chaos"></div><p>YOU FOUND IT.</p><h2>THE 67TH<br>SLIDE!!</h2><p>it does nothing.</p><button type="button">RETURN TO REALITY</button></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('button').addEventListener('click',()=>{
    overlay.remove();
    document.body.classList.remove('slide67-mode');
  });
}
let secret67='';
window.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  if(document.querySelector('.slide67-overlay')) return;
  if(e.key.length!==1) return;
  secret67=(secret67+e.key).slice(-2);
  if(secret67==='67'){
    secret67='';
    showSlide67();
  }
});

// Character signal: a tiny click glitch before opening the card.
$$('.cast-card').forEach(card=>card.addEventListener('dblclick',()=>{
  card.classList.add('universe-glitch');
  setTimeout(()=>card.classList.remove('universe-glitch'),550);
}));

// End-of-site delayed reveal
const endExtra=$('#endExtra');
const endSection=$('#end');
if('IntersectionObserver' in window && endExtra && endSection){
  let endRevealed=false;
  const eo=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting && !endRevealed){
      endRevealed=true;
      setTimeout(()=>endExtra.classList.add('show'),1450);
      eo.disconnect();
    }
  },{threshold:.35});
  eo.observe(endSection);
}
$('#backToTopWeird')?.addEventListener('click',()=>{
  window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'});
});

// Make the navigation pill reflect persistent state immediately.
try{
  if(localStorage.getItem('nvvcSpoilers')==='1' && spoilerChip) spoilerChip.textContent='SPOILERS UNLOCKED';
}catch{}

// Tiny hidden typing easter eggs. They intentionally avoid input fields.
const secretToast=$('#secretToast');
const secretToastLabel=$('#secretToastLabel');
const secretToastText=$('#secretToastText');
let toastTimer=null;
function showSecretToast(label,text,glitch=true){
  if(!secretToast) return;
  if(secretToastLabel) secretToastLabel.textContent=label;
  if(secretToastText) secretToastText.textContent=text;
  secretToast.classList.toggle('glitch',glitch);
  void secretToast.offsetWidth;
  secretToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=window.setTimeout(()=>{secretToast.classList.remove('show');secretToast.classList.remove('glitch')},2300);
}
let secretWord='';
window.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  const tag=document.activeElement?.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||document.activeElement?.isContentEditable) return;
  if(e.key.length!==1) return;
  secretWord=(secretWord+e.key.toLowerCase()).slice(-8);
  if(secretWord.endsWith('eatery')){
    secretWord='';
    showSecretToast('DIMENSIONAL TRANSLATION','WHAT ON EATERY..?',true);
  } else if(secretWord.endsWith('2000')){
    secretWord='';
    showSecretToast('DEVICE CODE','TRANSDIMENSIONALIZER 2000: STANDING BY.',false);
    $('#chromeus')?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
    transDevice?.classList.add('firing');
    setTimeout(()=>transDevice?.classList.remove('firing'),700);
  } else if(secretWord.endsWith('3000')){
    secretWord='';
    showSecretToast('UNEXPECTED DEVICE','TRANSDIMENSIONALIZER 3000 DETECTED.',true);
  } else if(secretWord.endsWith('404')){
    secretWord='';
    showSecretToast('DIMENSION ERROR','404: DIMENSION NOT FOUND. obviously.',true);
    document.body.classList.add('universe-glitch');
    setTimeout(()=>document.body.classList.remove('universe-glitch'),500);
  } else if(secretWord.endsWith('nexus')){
    secretWord='';
    showSecretToast('NEXUS ACCESS','TERMINAL LINK ESTABLISHED.',false);
    $('#terminalInput')?.focus();
    $('#terminalInput')?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'center'});
  }
});

/* =========================================================
   V4: TERMINAL COMMANDS + SMALL SYSTEM POLISH
   ========================================================= */
const terminalForm = $('#terminalForm');
const terminalInput = $('#terminalInput');
const terminalShell = $('.terminal-shell');
const deviceHeatBar = $('#deviceHeatBar');
const deviceHeatText = $('#deviceHeatText');
let deviceHeat = 8;
let heatTimer = null;

function setDeviceHeat(value){
  deviceHeat = Math.max(0, Math.min(100, value));
  if(deviceHeatBar) deviceHeatBar.style.width = `${Math.max(4, deviceHeat)}%`;
  const label = deviceHeat >= 80 ? 'CRITICAL' : deviceHeat >= 55 ? 'WARM' : deviceHeat >= 25 ? 'WARM-ISH' : 'COOL';
  if(deviceHeatText) deviceHeatText.textContent = label;
  deviceStatus?.classList.remove('cool','warm','hot');
  deviceStatus?.classList.add(deviceHeat >= 80 ? 'hot' : deviceHeat >= 25 ? 'warm' : 'cool');
}
setDeviceHeat(8);
function coolDevice(){
  clearInterval(heatTimer);
  const tick=()=>{
    if(deviceHeat<=8){ heatTimer=null; return; }
    setDeviceHeat(deviceHeat-2);
    heatTimer=window.setTimeout(tick,1800);
  };
  heatTimer=window.setTimeout(tick,1800);
}
coolDevice();

// Wrap the existing activation with a little heat buildup, without changing its visual result.
const oldActivateTransdimensionalizer = activateTransdimensionalizer;
activateTransdimensionalizer = function(){
  setDeviceHeat(deviceHeat + 24);
  oldActivateTransdimensionalizer();
  if(deviceHeat >= 85 && deviceHeatText) deviceHeatText.textContent = 'CRITICAL';
};

function terminalWrite(lines){
  if(!terminalLines) return;
  const current = terminalLines.querySelectorAll('p').length;
  terminalLines.innerHTML = lines.map((line,i)=>`<p><span>${String(current+i+1).padStart(2,'0')}</span>&gt; ${line}</p>`).join('');
}
function terminalCommand(raw){
  const cmd = raw.trim().toLowerCase();
  if(!cmd) return;
  const responses = {
    help:[
      'AVAILABLE COMMANDS:',
      'scan · scan the dimensional environment',
      'chromeus · jump to the Chromeus navigator',
      'movie · open the movie hub',
      'posters · open the poster vault',
      'archive · open the Nexus archives',
      'crew · open Meet the Crew',
      'pleuh · toggle spoiler mode',
      '67 · open the 67th slide',
      'banana · absolutely useless',
      'top · return to the beginning',
      'type eatery / 2000 / 3000 / 404 / nexus for hidden responses'
    ],
    banana:['BANANA PROTOCOL ENABLED.','...nothing happened.','BANANA PROTOCOL DISABLED.'],
    scan:[scanLines[Math.floor(Math.random()*scanLines.length)]],
    status:['SYSTEM STATUS: <b>PROBABLY FINE</b>','DIMENSIONAL STABILITY: <b>'+stability.textContent+'</b>','DEVICE HEAT: <b>'+Math.round(deviceHeat)+'%</b>']
  };
  terminalShell?.classList.remove('command-flash');
  void terminalShell?.offsetWidth;
  terminalShell?.classList.add('command-flash');
  if(responses[cmd]){terminalWrite([`> ${cmd}`,...responses[cmd]]);return;}
  const jumps = {
    chromeus:'#chromeus', movie:'#hub', home:'#top', top:'#top', posters:'#posters', archive:'#archives', archives:'#archives', crew:'#crew'
  };
  if(jumps[cmd]){
    terminalWrite([`> ${cmd}`,'NAVIGATING...']);
    setTimeout(()=>$(jumps[cmd])?.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'}),180);
    return;
  }
  if(cmd==='pleuh'){
    terminalWrite(['> pleuh','SEQUENCE RECOGNISED.']);
    setTimeout(()=>setSpoilerMode(!document.body.classList.contains('spoilers-unlocked')),160);
    return;
  }
  if(cmd==='67'){
    terminalWrite(['> 67','ARCHIVE FRAGMENT FOUND.']);
    setTimeout(showSlide67,160);
    return;
  }
  terminalWrite([`> ${cmd}`,'command not recognised.','try `help`.']);
}
terminalForm?.addEventListener('submit',e=>{
  e.preventDefault();
  terminalCommand(terminalInput.value);
  terminalInput.value='';
  terminalInput.focus();
});

// Let the little end joke reflect that the viewer has actually been poking around.
let systemTouches = 0;
function noteSystemTouch(){
  systemTouches++;
  if(systemTouches===5 && stability) stability.textContent='WATCHED';
  if(systemTouches===10 && stability) stability.textContent='WHY';
}
transDevice?.addEventListener('click',noteSystemTouch);
$('#scanButton')?.addEventListener('click',noteSystemTouch);
$$('.archive-file').forEach(btn=>btn.addEventListener('click',noteSystemTouch));
$$('.terminal-choice').forEach(btn=>btn.addEventListener('click',noteSystemTouch));

/* =========================================================
   V10 PERFORMANCE PASS
   Keep the playful visuals, but stop painting/animating work the
   viewer cannot currently see.
   ========================================================= */
const lowPowerDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
if(lowPowerDevice) document.body.classList.add('lite-mode');

if('IntersectionObserver' in window){
  const animatedSections = $$('.section, .site-footer').filter(el=>el.id!=='posters');
  const animationObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>entry.target.classList.toggle('is-offscreen', !entry.isIntersecting));
  }, {rootMargin:'180px 0px'});
  animatedSections.forEach(el=>animationObserver.observe(el));
}


/* Final navigation polish: floating back-to-top control. */
const quickTop = $('#quickTop');
let quickTopRaf=0;
function updateQuickTop(){
  quickTopRaf=0;
  quickTop?.classList.toggle('show', window.scrollY > Math.max(520, window.innerHeight * .7));
}
window.addEventListener('scroll',()=>{if(!quickTopRaf) quickTopRaf=requestAnimationFrame(updateQuickTop)},{passive:true});
quickTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'}));
updateQuickTop();


/* =========================================================
   V17: FINAL FINISH — LOADER + MICRO SFX
   ========================================================= */
const siteLoader = $('#siteLoader');
const loaderStatus = $('#loaderStatus');
const loaderStates = [
  'ESTABLISHING DIMENSIONAL LINK...',
  'CHECKING 1,446 SLIDES...',
  'CALIBRATING COLOURS...',
  'DIMENSIONAL STABILITY: PROBABLY FINE.'
];
let loaderStateIndex = 0;
let loaderStateTimer = null;
function finishSiteLoader(){
  if(!siteLoader) return;
  siteLoader.classList.add('loaded');
  clearTimeout(loaderStateTimer);
  window.setTimeout(()=>siteLoader.remove(),650);
}
function runLoader(){
  if(!siteLoader) return;
  const started=performance.now();
  const tick=()=>{
    if(!loaderStatus) return;
    loaderStateIndex=(loaderStateIndex+1)%loaderStates.length;
    loaderStatus.textContent=loaderStates[loaderStateIndex];
    if(performance.now()-started<950){ loaderStateTimer=window.setTimeout(tick,230); }
  };
  loaderStateTimer=window.setTimeout(tick,230);
  window.setTimeout(finishSiteLoader,700);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',runLoader,{once:true});
else runLoader();

// Tiny UI sound design. Audio is created only after a real user gesture, so
// browsers' autoplay policies are respected and there are no extra audio files.
let audioCtx=null;
function getAudioContext(){
  if(audioCtx) return audioCtx;
  try{ audioCtx=new (window.AudioContext||window.webkitAudioContext)(); return audioCtx; }catch{return null}
}
function blip({freq=520,duration=.045,volume=.035,type='sine',slide=0}={}){
  const ctx=getAudioContext();
  if(!ctx) return;
  if(ctx.state==='suspended') ctx.resume().catch(()=>{});
  const osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.type=type; osc.frequency.setValueAtTime(freq,ctx.currentTime);
  if(slide) osc.frequency.exponentialRampToValueAtTime(Math.max(60,freq+slide),ctx.currentTime+duration);
  gain.gain.setValueAtTime(0.0001,ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.006);
  gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+duration);
  osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+duration+.01);
}
function portalSfx(){
  const ctx=getAudioContext();
  if(!ctx) return;
  if(ctx.state==='suspended') ctx.resume().catch(()=>{});
  const now=ctx.currentTime;
  const osc=ctx.createOscillator(), gain=ctx.createGain(), filter=ctx.createBiquadFilter();
  osc.type='sine'; osc.frequency.setValueAtTime(160,now); osc.frequency.exponentialRampToValueAtTime(880,now+.42);
  gain.gain.setValueAtTime(.0001,now); gain.gain.exponentialRampToValueAtTime(.07,now+.08); gain.gain.exponentialRampToValueAtTime(.0001,now+.5);
  filter.type='lowpass'; filter.frequency.setValueAtTime(650,now); filter.frequency.exponentialRampToValueAtTime(1800,now+.42);
  osc.connect(filter).connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now+.52);
  blip({freq:1040,duration:.09,volume:.02,type:'triangle',slide:-300});
}
function sfxClick(){ blip({freq:520,duration:.045,volume:.024,type:'triangle',slide:-120}); }
function sfxScan(){ blip({freq:720,duration:.07,volume:.03,type:'sine',slide:260}); }

document.addEventListener('click',e=>{
  const target=e.target?.closest?.('.btn,.terminal-choice,.archive-file,.room-filter,#scanButton,#dontClick,#quickTop');
  if(target && target.id!=='openPosterRoom') sfxClick();
},{passive:true});
portalOpenButton?.addEventListener('click',portalSfx,{passive:true});
transDevice?.addEventListener('click',()=>{portalSfx();}, {passive:true});
scanButton?.addEventListener('click',sfxScan,{passive:true});

// Make the making-of player feel intentional while it initializes, and provide
// a direct-watch route if an embed doesn't finish loading in a reasonable time.
(function improveMakingOfLoading(){
  if(!makingOfFrame) return;
  const revealFallback=()=>{
    if(makingOfFrame.querySelector('.video-timeout')) return;
    const a=document.createElement('a');
    a.className='video-timeout';
    a.href=makingOfUrl; a.target='_blank'; a.rel='noopener noreferrer';
    a.textContent='EMBED TAKING TOO LONG? OPEN THE VIDEO DIRECTLY ↗';
    makingOfFrame.appendChild(a);
  };
  const observer=new MutationObserver(()=>{
    const iframe=makingOfFrame.querySelector('iframe');
    if(!iframe || iframe.dataset.v17Bound) return;
    iframe.dataset.v17Bound='1';
    iframe.addEventListener('load',()=>{ if(videoStatus) videoStatus.textContent='EMBED LOADED'; },{once:true});
    window.setTimeout(revealFallback,8000);
  });
  observer.observe(makingOfFrame,{childList:true});
  window.setTimeout(revealFallback,8500);
})();

window.addEventListener('pagehide',()=>{
  clearTimeout(stabilityTimer);
  clearTimeout(heatTimer);
  clearTimeout(signalTimer);
  clearTimeout(toastTimer);
});

