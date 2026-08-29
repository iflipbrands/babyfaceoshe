(function(){
  const defaults=window.BABYFACE_CONTENT||{};
  let data=defaults;
  try{const saved=localStorage.getItem('babyfaceContent');if(saved)data=JSON.parse(saved)}catch(e){}
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  const topbar=document.getElementById('topbar');
  const syncTopbar=()=>topbar?.classList.toggle('scrolled',window.scrollY>24);
  syncTopbar();window.addEventListener('scroll',syncTopbar,{passive:true});

  const menuBtn=document.querySelector('.menu-toggle'), nav=document.getElementById('site-nav');
  menuBtn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.textContent=open?'CLOSE':'MENU'});
  nav?.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuBtn?.setAttribute('aria-expanded','false');if(menuBtn)menuBtn.textContent='MENU'}));

  const name=document.querySelector('[data-artist-name]');if(name)name.innerHTML=esc(data.artist?.name||'BABYFACE OSHE').replace(' ','<br>');

  const tour=document.querySelector('[data-tour]');
  if(tour){
    const rows=(data.tour||[]).map(t=>`<div class="tour-row"><div class="tour-date">${esc(t.date)}</div><div class="tour-city">${esc(t.city)}</div><div class="tour-venue">${esc(t.venue)}</div><div class="tour-status">${esc(t.status||'DETAILS SOON')}</div></div>`).join('');
    tour.innerHTML=rows||'<div class="tour-row"><div class="tour-date">—</div><div class="tour-city">MORE DATES SOON</div><div class="tour-venue">Stay tuned.</div><div class="tour-status">COMING SOON</div></div>';
  }

  const audio=document.getElementById('audioPlayer'), dock=document.getElementById('audioDock'), toggle=document.getElementById('playerToggle'), playerTitle=document.getElementById('playerTitle'), playerLabel=document.getElementById('playerLabel'), progress=document.getElementById('playerProgress'), time=document.getElementById('playerTime'), minimize=document.getElementById('playerMinimize'), nowPop=document.getElementById('nowPlayingPop'), popTitle=document.getElementById('popTitle'), popMeta=document.getElementById('popMeta');
  let activeCard=null, popTimer=null;
  function fmt(sec){if(!Number.isFinite(sec))return'0:00';sec=Math.max(0,Math.floor(sec));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`}
  function setPlayState(playing){if(toggle)toggle.textContent=playing?'❚❚':'▶';activeCard?.classList.toggle('is-playing',playing)}
  function showNowPlaying(item){
    if(!nowPop)return;
    popTitle.textContent=item.title||'BABYFACE OSHE';
    popMeta.textContent=((item.type||'Music')+(item.year?' / '+item.year:''));
    nowPop.classList.add('show');nowPop.setAttribute('aria-hidden','false');
    clearTimeout(popTimer);popTimer=setTimeout(()=>{nowPop.classList.remove('show');nowPop.setAttribute('aria-hidden','true')},3200);
  }
  minimize?.addEventListener('click',()=>{
    const mini=dock.classList.toggle('minimized');
    document.body.classList.toggle('player-minimized',mini);
    minimize.textContent=mini?'↗':'—';
    minimize.setAttribute('aria-label',mini?'Expand player':'Minimize player');
    minimize.title=mini?'Expand player':'Minimize player';
  });
  function playTrack(item,card){
    dock?.classList.add('visible');playerTitle.textContent=item.title||'BABYFACE OSHE';showNowPlaying(item);
    if(!item.audio){playerLabel.textContent='AUDIO COMING SOON';setPlayState(false);return}
    playerLabel.textContent=(item.type||'NOW PLAYING').toUpperCase();
    if(activeCard!==card||audio.src!==item.audio){if(activeCard)activeCard.classList.remove('is-playing');activeCard=card;audio.src=item.audio;audio.load()}
    audio.play().then(()=>setPlayState(true)).catch(()=>{playerLabel.textContent='UNABLE TO PLAY THIS AUDIO';setPlayState(false)});
  }
  toggle?.addEventListener('click',()=>{if(!audio.src)return;if(audio.paused)audio.play();else audio.pause()});
  audio?.addEventListener('play',()=>setPlayState(true));audio?.addEventListener('pause',()=>setPlayState(false));audio?.addEventListener('timeupdate',()=>{const pct=audio.duration?audio.currentTime/audio.duration*100:0;progress.style.width=`${pct}%`;time.textContent=fmt(audio.currentTime)});audio?.addEventListener('ended',()=>setPlayState(false));

  const music=document.querySelector('[data-music]');
  if(music){
    const items=[...(data.music||[])].slice(0,5);while(items.length<5)items.push({title:'Coming Soon',type:'Upcoming',year:'',audio:'',description:'New release coming soon.'});
    music.innerHTML=items.map((m,i)=>`<article class="music-card" tabindex="0" role="button" aria-label="Play ${esc(m.title)}" data-track="${i}"><div class="track-no">${String(i+1).padStart(2,'0')} / ${esc(m.year||'—')}</div><div><p>${esc(m.type||'Release')}</p><h3>${esc(m.title||'Coming Soon')}</h3><div class="track-action"><span>${m.audio?'PLAY TRACK':'COMING SOON'}</span><span class="play-dot">▶</span></div></div></article>`).join('');
    music.querySelectorAll('.music-card').forEach((card,i)=>{const go=()=>playTrack(items[i],card);card.addEventListener('click',go);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
  }

  function youtubeEmbed(url=''){
    if(!url)return'';
    try{const u=new URL(url);let id='';if(u.hostname.includes('youtu.be'))id=u.pathname.slice(1);else if(u.hostname.includes('youtube.com'))id=u.searchParams.get('v')||u.pathname.split('/').filter(Boolean).pop();if(id)return`https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;}catch(e){}
    return url;
  }
  const videos=document.querySelector('[data-videos]');
  if(videos){
    const list=[...(data.videos||[])].slice(0,2);while(list.length<2)list.push({title:'New Video Coming Soon',label:'MUSIC VIDEO',embed:''});
    videos.innerHTML=list.map((v,i)=>`<article class="video-card" data-video="${i}"><button class="video-play" type="button" aria-label="Play ${esc(v.title)}">▶</button><div class="video-copy"><span class="video-label">${esc(v.label||'MUSIC VIDEO')}</span><h3>${esc(v.title||'Coming Soon')}</h3></div></article>`).join('');
    videos.querySelectorAll('.video-card').forEach((card,i)=>card.querySelector('button').addEventListener('click',()=>{const src=youtubeEmbed(list[i].embed||'');if(!src){card.querySelector('.video-label').textContent='VIDEO COMING SOON';return}const f=document.createElement('iframe');f.src=src;f.title=list[i].title||'BabyFace Oshe video';f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';f.allowFullscreen=true;card.appendChild(f)}));
  }

  const ah=document.querySelector('[data-about-heading]'),ab=document.querySelector('[data-about-body]'),aq=document.querySelector('[data-about-quote]');if(ah)ah.textContent=data.about?.heading||'BabyFace Oshe';if(ab)ab.textContent=data.about?.body||'';if(aq)aq.textContent=data.about?.quote||'';

  document.getElementById('year').textContent=new Date().getFullYear();

  const reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});reveals.forEach(el=>io.observe(el))}else reveals.forEach(el=>el.classList.add('in'));

  const sections=[...document.querySelectorAll('main section[id]')],links=[...document.querySelectorAll('.nav a[href^="#"]')];
  if('IntersectionObserver'in window){const sio=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}})},{rootMargin:'-35% 0px -55% 0px'});sections.forEach(s=>sio.observe(s))}
})();
