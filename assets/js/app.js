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

  const audio=document.getElementById('audioPlayer'),dock=document.getElementById('audioDock'),waveform=document.getElementById('playerWaveform'),toggle=document.getElementById('playerToggle'),playerTitle=document.getElementById('playerTitle'),playerLabel=document.getElementById('playerLabel'),playerCover=document.getElementById('playerCover'),progress=document.getElementById('playerProgress'),progressTrack=document.getElementById('playerProgressTrack'),time=document.getElementById('playerTime'),minimize=document.getElementById('playerMinimize'),nowPop=document.getElementById('nowPlayingPop'),popTitle=document.getElementById('popTitle'),popMeta=document.getElementById('popMeta');
  let activeCard=null,popTimer=null,currentItem=null;
  if(waveform&&!waveform.children.length){const heights=[30,52,76,44,64,88,48,70,38,82,58,96,42,68,54,84,36,72,48,92,60,78,34,66,50,86,40,74,56,94,46,80,32,62,52,90,44,76,58,84,38,70,48,96,54,82,36,68,50,88,42,74,56,92,46,78,34,64,52,86,40,72,58,90];heights.forEach((h,i)=>{const bar=document.createElement('span');bar.style.setProperty('--wave-h',h+'%');bar.style.setProperty('--wave-delay',(-((i%9)*.07))+'s');waveform.appendChild(bar)})}
  function fmt(sec){if(!Number.isFinite(sec))return'0:00';sec=Math.max(0,Math.floor(sec));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`}
  function setPlayState(playing){if(toggle)toggle.textContent=playing?'❚❚':'▶';activeCard?.classList.toggle('is-playing',playing);dock?.classList.toggle('is-playing',playing)}
  function showNowPlaying(item){if(!nowPop)return;popTitle.textContent=item.title||'BABYFACE OSHE';popMeta.textContent=((item.type||'Music')+(item.year?' / '+item.year:''));nowPop.classList.add('show');nowPop.setAttribute('aria-hidden','false');clearTimeout(popTimer);popTimer=setTimeout(()=>{nowPop.classList.remove('show');nowPop.setAttribute('aria-hidden','true')},3200)}
  function updatePlayer(item){currentItem=item;playerTitle.textContent=item.title||'BABYFACE OSHE';playerLabel.textContent=(item.type||'NOW PLAYING').toUpperCase();if(playerCover)playerCover.src=safeUrl(item.cover)||'assets/images/babyface-bg.png';}
  minimize?.addEventListener('click',()=>{const mini=dock.classList.toggle('minimized');document.body.classList.toggle('player-minimized',mini);minimize.textContent=mini?'↗':'—';minimize.setAttribute('aria-label',mini?'Expand player':'Minimize player');minimize.title=mini?'Expand player':'Minimize player'});
  function playTrack(item,card){
    updatePlayer(item);showNowPlaying(item);
    if(!item.audio){playerLabel.textContent='AUDIO COMING SOON';setPlayState(false);return}
    const resolvedAudio=safeUrl(item.audio);
    if(!resolvedAudio){playerLabel.textContent='AUDIO PATH NEEDED';setPlayState(false);return}
    if(activeCard!==card||audio.getAttribute('data-source')!==resolvedAudio){
      if(activeCard)activeCard.classList.remove('is-playing');
      activeCard=card;
      audio.setAttribute('data-source',resolvedAudio);
      audio.src=resolvedAudio;
      audio.load();
    }
    audio.play().then(()=>setPlayState(true)).catch(()=>{playerLabel.textContent='CHECK AUDIO FILE / PATH';setPlayState(false)});
  }
  toggle?.addEventListener('click',()=>{if(!audio.src){if(currentItem)showNowPlaying(currentItem);return}if(audio.paused)audio.play();else audio.pause()});
  audio?.addEventListener('play',()=>setPlayState(true));
  audio?.addEventListener('pause',()=>setPlayState(false));
  audio?.addEventListener('loadedmetadata',()=>{if(currentItem)playerLabel.textContent=(currentItem.type||'NOW PLAYING').toUpperCase()});
  audio?.addEventListener('error',()=>{playerLabel.textContent='CHECK AUDIO FILE / PATH';setPlayState(false)});
  audio?.addEventListener('timeupdate',()=>{const pct=audio.duration?audio.currentTime/audio.duration*100:0;progress.style.width=`${pct}%`;time.textContent=`${fmt(audio.currentTime)} / ${fmt(audio.duration)}`});
  audio?.addEventListener('ended',()=>setPlayState(false));
  progressTrack?.addEventListener('click',e=>{if(!audio.duration)return;const r=progressTrack.getBoundingClientRect();audio.currentTime=Math.max(0,Math.min(audio.duration,(e.clientX-r.left)/r.width*audio.duration))});

  const music=document.querySelector('[data-music]');
  if(music){
    const items=[...(data.music||[])].slice(0,5);while(items.length<5)items.push({title:'Coming Soon',type:'Upcoming',year:'',audio:'',cover:'assets/images/babyface-bg.png'});
    music.innerHTML=items.map((m,i)=>`<article class="music-card" tabindex="0" role="button" aria-label="${m.audio?'Play':'View'} ${esc(m.title)}" data-track="${i}">
      <div class="music-art"><img src="${esc(safeUrl(m.cover)||'assets/images/babyface-bg.png')}" alt="${esc(m.title)} artwork"></div>
      <div class="music-info"><div class="track-no">${String(i+1).padStart(2,'0')} / ${esc(m.year||'—')}</div><p>${esc(m.type||'Release')}</p><h3>${esc(m.title||'Coming Soon')}</h3><div class="track-action"><span>${m.audio?'PLAY TRACK':'COMING SOON'}</span><span class="play-dot">▶</span></div></div>
    </article>`).join('');
    music.querySelectorAll('.music-card').forEach((card,i)=>{const go=()=>playTrack(items[i],card);card.addEventListener('click',go);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
    const firstPlayable=items.find(m=>m.audio)||items[0];if(firstPlayable)updatePlayer(firstPlayable);
  }

  function youtubeId(url=''){
    if(!url)return'';
    try{
      const u=new URL(String(url).trim());
      let id='';
      if(u.hostname.includes('youtu.be')) id=u.pathname.split('/').filter(Boolean)[0]||'';
      else if(u.hostname.includes('youtube.com')){
        if(u.pathname==='/watch') id=u.searchParams.get('v')||'';
        else {
          const parts=u.pathname.split('/').filter(Boolean);
          const marker=parts.findIndex(x=>['embed','shorts','live'].includes(x));
          id=marker>=0?parts[marker+1]||'':parts[parts.length-1]||'';
        }
      }
      return id.replace(/[^a-zA-Z0-9_-]/g,'');
    }catch(e){return''}
  }
  function youtubeEmbed(url=''){
    const id=youtubeId(url);
    if(!id)return'';
    const params=new URLSearchParams({
      autoplay:'1',
      rel:'0',
      playsinline:'1'
    });
    // YouTube error 153 can occur when an embed cannot identify the parent page.
    // Supplying the live site's origin plus an explicit iframe referrer policy
    // makes standard GitHub Pages embeds much more reliable.
    if(/^https?:$/i.test(location.protocol)&&location.origin)params.set('origin',location.origin);
    return`https://www.youtube.com/embed/${encodeURIComponent(id)}?${params.toString()}`;
  }
  function youtubeThumbnail(v={}){
    const override=safeUrl(v.thumbnail||'');
    if(override)return override;
    const id=youtubeId(v.embed||'');
    return id?`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`:'assets/images/babyface-bg.png';
  }
  const videos=document.querySelector('[data-videos]');
  if(videos){
    const list=[...(data.videos||[])].slice(0,2);while(list.length<2)list.push({title:'New Video Coming Soon',label:'MUSIC VIDEO',embed:'',thumbnail:''});
    videos.innerHTML=list.map((v,i)=>`<article class="video-card" data-video="${i}" style="--video-thumb:url('${esc(youtubeThumbnail(v)).replace(/'/g,'%27')}')"><button class="video-play" type="button" aria-label="Play ${esc(v.title)}"><span aria-hidden="true">▶</span></button><div class="video-copy"><span class="video-label">${esc(v.label||'MUSIC VIDEO')}</span><h3>${esc(v.title||'Coming Soon')}</h3></div></article>`).join('');
    videos.querySelectorAll('.video-card').forEach((card,i)=>card.querySelector('button').addEventListener('click',()=>{
      const src=youtubeEmbed(list[i].embed||'');
      if(!src){card.querySelector('.video-label').textContent='ADD YOUTUBE LINK';return}
      const existing=card.querySelector('iframe');
      if(existing)return;
      const f=document.createElement('iframe');
      f.src=src;
      f.title=list[i].title||'BabyFace Oshe video';
      f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.referrerPolicy='strict-origin-when-cross-origin';
      f.allowFullscreen=true;
      card.appendChild(f);
    }));
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
