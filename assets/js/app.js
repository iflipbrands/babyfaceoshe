(function(){
  const defaults=window.BABYFACE_CONTENT||{};
  let data=defaults;
  try{const saved=localStorage.getItem('babyfaceContent');if(saved)data=JSON.parse(saved)}catch(e){}
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  // Accept the simple relative paths used by the site, plus common GitHub URLs people
  // paste from the browser. GitHub /blob/ links point to an HTML page, not the audio
  // file itself, so convert those to raw.githubusercontent.com automatically.
  const safeUrl=(v='')=>{
    let s=String(v||'').trim().replace(/\\/g,'/');
    if(!s)return'';
    const blob=s.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i);
    if(blob)return `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}/${blob[4]}`;
    if(/^https?:\/\//i.test(s))return s;
    // If a copied path includes the repository/folder name before assets/, keep only
    // the site-relative part so it works correctly on GitHub Pages.
    const assetsAt=s.toLowerCase().indexOf('assets/');
    if(assetsAt>=0)s=s.slice(assetsAt);
    s=s.replace(/^\.\//,'');
    return s;
  };

  const topbar=document.getElementById('topbar');
  const syncTopbar=()=>topbar?.classList.toggle('scrolled',window.scrollY>24);
  syncTopbar();window.addEventListener('scroll',syncTopbar,{passive:true});

  const menuBtn=document.querySelector('.menu-toggle'),nav=document.getElementById('site-nav');
  menuBtn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.textContent=open?'CLOSE':'MENU'});
  nav?.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuBtn?.setAttribute('aria-expanded','false');if(menuBtn)menuBtn.textContent='MENU'}));

  const name=document.querySelector('[data-artist-name]');
  if(name){
    const parts=String(data.artist?.name||'BABYFACE OSHE').trim().split(/\s+/);
    const first=parts.shift()||'BABYFACE';
    const rest=parts.join(' ')||'OSHE';
    name.innerHTML=`<span class="hero-name-top">${esc(first)}</span><span class="hero-name-bottom">${esc(rest)}</span>`;
  }

  const tour=document.querySelector('[data-tour]');
  if(tour){
    const rows=(data.tour||[]).filter(t=>t&&(t.date||t.city||t.venue||t.price)).map(t=>{
      const button=(t.buttonLabel&&t.link)?`<a class="tour-button" href="${esc(safeUrl(t.link))}" target="_blank" rel="noopener">${esc(t.buttonLabel)}</a>`:'';
      return `<article class="tour-row">
        <div class="tour-cell"><strong class="tour-date">${esc(t.date||'—')}</strong></div>
        <div class="tour-cell"><strong class="tour-city">${esc(t.city||'—')}</strong></div>
        <div class="tour-cell"><span class="tour-venue">${esc(t.venue||'—')}</span></div>
        <div class="tour-cell"><span class="tour-price">${esc(t.price||'—')}</span></div>
        <div class="tour-action">${button}</div>
      </article>`;
    }).join('');
    tour.innerHTML=rows?`<div class="tour-head" aria-hidden="true"><span>DATE</span><span>CITY</span><span>VENUE</span><span>TICKET PRICE</span><span></span></div>${rows}`:'<div class="tour-empty">MORE DATES COMING SOON.</div>';
  }

  const socialWrap=document.querySelector('[data-social-links]');
  if(socialWrap){
    const socialData=data.socials||{};
    const networks=[['facebook','Facebook'],['instagram','Instagram'],['tiktok','TikTok'],['soundcloud','SoundCloud'],['youtube','YouTube']];
    const links=networks.filter(([key])=>String(socialData[key]||'').trim()).map(([key,label])=>`<a href="${esc(safeUrl(socialData[key]))}" target="_blank" rel="noopener">${label}</a>`).join('');
    socialWrap.innerHTML=links||'<span class="social-empty">SOCIAL LINKS COMING SOON</span>';
  }

  const audio=document.getElementById('audioPlayer'),dock=document.getElementById('audioDock'),toggle=document.getElementById('playerToggle'),playerTitle=document.getElementById('playerTitle'),playerLabel=document.getElementById('playerLabel'),playerCover=document.getElementById('playerCover'),progress=document.getElementById('playerProgress'),progressTrack=document.getElementById('playerProgressTrack'),time=document.getElementById('playerTime'),minimize=document.getElementById('playerMinimize'),nowPop=document.getElementById('nowPlayingPop'),popTitle=document.getElementById('popTitle'),popMeta=document.getElementById('popMeta');
  let activeCard=null,popTimer=null,currentItem=null,playerPlaylist=[],playlistIndex=-1;
  if(audio){audio.setAttribute('playsinline','');audio.setAttribute('webkit-playsinline','');audio.preload='metadata';}
  function fmt(sec){if(!Number.isFinite(sec))return'0:00';sec=Math.max(0,Math.floor(sec));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`}
  function setPlayState(playing){if(toggle)toggle.textContent=playing?'❚❚':'▶︎';activeCard?.classList.toggle('is-playing',playing);dock?.classList.toggle('is-playing',playing)}
  function showNowPlaying(item){if(!nowPop)return;popTitle.textContent=item.title||'BABYFACE OSHE';popMeta.textContent=((item.type||'Music')+(item.year?' / '+item.year:''));nowPop.classList.add('show');nowPop.setAttribute('aria-hidden','false');clearTimeout(popTimer);popTimer=setTimeout(()=>{nowPop.classList.remove('show');nowPop.setAttribute('aria-hidden','true')},3200)}
  function updatePlayer(item){currentItem=item;playerTitle.textContent=item.title||'BABYFACE OSHE';playerLabel.textContent=(item.type||'READY TO PLAY').toUpperCase();if(playerCover)playerCover.src=safeUrl(item.cover)||'assets/images/babyface-bg.png';}
  function loadPlayerSource(item,card=null,autoplay=false){
    if(!item)return false;
    updatePlayer(item);
    const resolvedAudio=safeUrl(item.audio);
    if(!resolvedAudio){playerLabel.textContent='AUDIO COMING SOON';audio.removeAttribute('src');audio.removeAttribute('data-source');audio.load();setPlayState(false);return false}
    if(activeCard&&activeCard!==card)activeCard.classList.remove('is-playing');
    activeCard=card||null;
    if(audio.getAttribute('data-source')!==resolvedAudio){audio.setAttribute('data-source',resolvedAudio);audio.src=resolvedAudio;audio.load()}
    if(autoplay){showNowPlaying(item);audio.play().then(()=>setPlayState(true)).catch(()=>{playerLabel.textContent='CHECK AUDIO FILE / PATH';setPlayState(false)})}
    return true;
  }
  minimize?.addEventListener('click',()=>{const mini=dock.classList.toggle('minimized');document.body.classList.toggle('player-minimized',mini);minimize.textContent=mini?'↗':'—';minimize.setAttribute('aria-label',mini?'Expand player':'Minimize player');minimize.title=mini?'Expand player':'Minimize player'});
  function playTrack(item,card){
    const idx=playerPlaylist.indexOf(item);if(idx>=0)playlistIndex=idx;
    loadPlayerSource(item,card,true);
  }
  toggle?.addEventListener('click',()=>{
    if(!audio.getAttribute('data-source')){
      const fallback=currentItem||playerPlaylist[0];
      if(fallback&&!loadPlayerSource(fallback,null,false))return;
    }
    if(audio.paused){
      const item=currentItem||playerPlaylist[playlistIndex];
      if(item&&!audio.currentSrc){loadPlayerSource(item,null,false);}
      showNowPlaying(item||{title:'BABYFACE OSHE',type:'Music'});
      const promise=audio.play();
      if(promise&&typeof promise.catch==='function')promise.catch(()=>{playerLabel.textContent='TAP A TRACK TO PLAY';setPlayState(false)});
    }else audio.pause();
  });
  audio?.addEventListener('play',()=>setPlayState(true));
  audio?.addEventListener('pause',()=>setPlayState(false));
  audio?.addEventListener('loadedmetadata',()=>{if(currentItem)playerLabel.textContent=(currentItem.type||'NOW PLAYING').toUpperCase()});
  audio?.addEventListener('error',()=>{playerLabel.textContent='CHECK AUDIO FILE / PATH';setPlayState(false)});
  audio?.addEventListener('timeupdate',()=>{const pct=audio.duration?audio.currentTime/audio.duration*100:0;progress.style.width=`${pct}%`;time.textContent=`${fmt(audio.currentTime)} / ${fmt(audio.duration)}`});
  audio?.addEventListener('ended',()=>{
    setPlayState(false);
    if(playerPlaylist.length>1){playlistIndex=(playlistIndex+1)%playerPlaylist.length;const next=playerPlaylist[playlistIndex];loadPlayerSource(next,null,true)}
  });
  progressTrack?.addEventListener('click',e=>{if(!audio.duration)return;const r=progressTrack.getBoundingClientRect();audio.currentTime=Math.max(0,Math.min(audio.duration,(e.clientX-r.left)/r.width*audio.duration))});

  const music=document.querySelector('[data-music]');
  if(music){
    const items=[...(data.music||[])].slice(0,4);while(items.length<4)items.push({title:'Coming Soon',type:'Upcoming',year:'',audio:'',cover:'assets/images/babyface-bg.png',player:false});
    music.innerHTML=items.map((m,i)=>`<article class="music-card" tabindex="0" role="button" aria-label="${m.audio?'Play':'View'} ${esc(m.title)}" data-track="${i}">
      <div class="music-art"><img src="${esc(safeUrl(m.cover)||'assets/images/babyface-bg.png')}" alt="${esc(m.title)} artwork"></div>
      <div class="music-info"><div class="track-no">${String(i+1).padStart(2,'0')} / ${esc(m.year||'—')}</div><p>${esc(m.type||'Release')}</p><h3>${esc(m.title||'Coming Soon')}</h3><div class="track-action"><span>${m.audio?'PLAY TRACK':'COMING SOON'}</span><span class="play-dot">▶︎</span></div></div>
    </article>`).join('');
    const cards=[...music.querySelectorAll('.music-card')];
    cards.forEach((card,i)=>{const go=()=>playTrack(items[i],card);card.addEventListener('click',go);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
    // Admin checkboxes build the docked-player playlist. If nothing has been checked yet,
    // fall back to the first song with audio so older content files still work. Browsers
    // do not allow autoplay with sound, but the source is loaded and the dock play button
    // works immediately on the first user tap.
    playerPlaylist=items.filter(m=>m&&m.player===true&&safeUrl(m.audio));
    if(!playerPlaylist.length){const firstAudio=items.find(m=>m&&safeUrl(m.audio));if(firstAudio)playerPlaylist=[firstAudio]}
    if(playerPlaylist.length){playlistIndex=0;const first=playerPlaylist[0];const cardIndex=items.indexOf(first);loadPlayerSource(first,cardIndex>=0?cards[cardIndex]:null,false)}
    else{const first=items[0];if(first)updatePlayer(first)}
  }

  function videoEmbedSrc(value=''){
    let raw=String(value||'').trim();
    if(!raw)return'';
    const srcMatch=raw.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if(srcMatch)raw=srcMatch[1];
    raw=raw.replace(/&amp;/g,'&');
    try{
      const u=new URL(raw,location.href);
      const host=u.hostname.replace(/^www\./,'').toLowerCase();
      if(host==='youtube.com'||host==='m.youtube.com'){
        const parts=u.pathname.split('/').filter(Boolean);
        if(parts[0]==='embed'&&parts[1])return `https://www.youtube.com/embed/${encodeURIComponent(parts[1])}`;
        if(parts[0]==='shorts'&&parts[1])return `https://www.youtube.com/embed/${encodeURIComponent(parts[1])}`;
        const id=u.searchParams.get('v');
        if(id)return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
      }
      if(host==='youtu.be'){
        const id=u.pathname.split('/').filter(Boolean)[0];
        if(id)return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
      }
      if(u.protocol==='https:')return u.href;
    }catch(e){}
    return'';
  }

  const videos=document.querySelector('[data-videos]');
  if(videos){
    const list=[...(data.videos||[])].slice(0,2);while(list.length<2)list.push({title:'',embed:''});
    videos.innerHTML=list.map(v=>{
      const src=videoEmbedSrc(v.embed||'');
      if(!src)return `<div class="video-embed"><div class="video-placeholder">VIDEO COMING SOON</div></div>`;
      return `<div class="video-embed"><iframe src="${esc(src)}" title="${esc(v.title||'BabyFace Oshe music video')}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
    }).join('');
  }

  const ah=document.querySelector('[data-about-heading]'),ab=document.querySelector('[data-about-body]'),aq=document.querySelector('[data-about-quote]');if(ah)ah.textContent=data.about?.heading||'BabyFace Oshe';if(ab)ab.textContent=data.about?.body||'';if(aq)aq.textContent=data.about?.quote||'';

  const bookingForm=document.getElementById('bookingForm'),bookingStatus=document.getElementById('bookingStatus');
  bookingForm?.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!bookingForm.checkValidity()){bookingForm.reportValidity();return}
    const button=bookingForm.querySelector('button[type="submit"]');button.disabled=true;button.textContent='SENDING…';bookingStatus.textContent='';
    try{
      const res=await fetch(bookingForm.action,{method:'POST',headers:{Accept:'application/json'},body:new FormData(bookingForm)});
      if(!res.ok)throw new Error('Submission failed');
      bookingStatus.textContent='Thank you. Your booking inquiry was sent successfully.';bookingForm.reset();
    }catch(err){bookingStatus.textContent='Something happened and your message did not send. Please try again.'}
    finally{button.disabled=false;button.textContent='SEND BOOKING INQUIRY'}
  });

  document.getElementById('year').textContent=new Date().getFullYear();
  const reveals=document.querySelectorAll('.reveal');if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});reveals.forEach(el=>io.observe(el))}else reveals.forEach(el=>el.classList.add('in'));
  const sections=[...document.querySelectorAll('main section[id]')],links=[...document.querySelectorAll('.nav a[href^="#"]')];if('IntersectionObserver'in window){const sio=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}})},{rootMargin:'-35% 0px -55% 0px'});sections.forEach(s=>sio.observe(s))}
})();
