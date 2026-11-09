import {slides} from './slides.js';
import {mountMotion,slideTransition,animateModelName,motionAllowed} from './motion.js';
let cleanup=()=>{},hasOpened=false;
const titleChars=text=>`<i aria-label="${text}">${[...text].map((char,index)=>`<span class="title-char" aria-hidden="true" style="--char-delay:${index*65}ms">${char}</span>`).join('')}</i>`;
const reduced=()=>!motionAllowed();
const photoImages=(active=0)=>slides.map((s,i)=>`<img src="${s.src}" class="scene-photo ${i===active?'current':''}" style="--photo-position:${s.position}" ${i===active?'fetchpriority="high"':'loading="lazy"'} alt="">`).join('');
const photoControls=(active=0)=>`<div class="scene-chooser" aria-label="切换车型照片">${slides.map((s,i)=>`<button data-photo="${i}" aria-label="查看 ${s.name} 照片" aria-pressed="${i===active}"><span class="photo-dot" aria-hidden="true"></span></button>`).join('')}</div>`;

export function home(){
 return `<section class="drive-home" data-carousel aria-label="宝马试驾前选车">
  <div class="drive-background" aria-hidden="true">${photoImages()}</div>
  <div class="home-shade"></div>
  <div class="home-intro" aria-hidden="true"><span>DRIVE<span>FIT</span></span><p>先选对 再出发</p></div>
  <button class="skip-intro" data-scene="skip">跳过开场</button>
  <div class="home-message"><h1><span class="line">${titleChars('试驾前')}</span><span class="line">${titleChars('先选对宝马')}</span></h1><p class="home-description">几个简单选择，找到值得试驾的 <span class="keep-together">2—3 台</span></p><div class="home-actions"><a class="btn start-button" href="#quiz"><span class="button-label">开始选车</span><span class="button-time">约 1 分钟</span></a><a class="home-secondary" href="#showroom">三维看车</a></div></div>
  <div class="hero-model" aria-hidden="true"><span data-model-code>${slides[0].code}</span></div>
  <div class="home-foot"><a class="photo-caption" data-photo-source href="${slides[0].source}" target="_blank" rel="noopener noreferrer"><span data-photo-name>${slides[0].name}</span><span class="image-credit">BMW 官方图片</span></a><div class="hero-playback">${photoControls()}</div><button class="scroll-cue" data-scroll="drive-story">往下探索<span class="scroll-mark" aria-hidden="true"></span></button></div>
 </section>
 <section class="drive-story" id="drive-story" aria-labelledby="story-title">
  <div class="story-heading"><h2 id="story-title" data-reveal>选车<br>从你的生活开始</h2></div>
  <div class="story-layout"><div class="story-steps"><div data-reveal><h3>从日常出发</h3><p>预算、同行的人、常走的路 几次轻松选择，说清你需要什么</p></div><div data-reveal><h3>看懂每个候选</h3><p>保留 2—3 台不同车系 为什么适合，哪里要取舍，一起摆在面前</p></div><div data-reveal><h3>带着重点去试驾</h3><p>生成你的试驾清单，复制到微信 把现场的时间，留给真正关心的体验</p></div><a class="btn" href="#quiz" data-reveal>找到我的试驾候选</a></div><figure class="story-image" data-reveal><img src="assets/interior.jpg" alt="BMW 3 系在户外的官方车型照片" loading="lazy"></figure></div>
 </section>
 <section class="drive-gallery" aria-labelledby="gallery-title"><div class="gallery-heading"><h2 id="gallery-title" data-reveal>心动可以不止一种</h2><p data-reveal>拖动看看，哪一种姿态更像你</p><a class="gallery-all" href="#catalog">查看全部车型</a></div><div class="gallery-track" data-drag-gallery tabindex="0" aria-label="车型图片展廊，可左右滚动">${slides.map(s=>`<button class="gallery-car" data-detail="${s.id}"><span class="gallery-photo"><img src="${s.src}" alt="${s.name} 官方图片" loading="lazy" style="object-position:${s.position}"></span><span class="gallery-car-name">${s.name}</span><span class="gallery-car-action">了解车型</span></button>`).join('')}</div><input class="gallery-scrollbar" type="range" min="0" max="1000" step="any" value="0" aria-label="左右浏览车型"></section>
 <section class="drive-close" aria-labelledby="close-title"><div><h2 id="close-title" data-reveal>下一程<br>选一台合拍的</h2><a class="btn" href="#quiz" data-reveal>开始选车</a></div><a href="#showroom" class="close-model" aria-label="打开 BMW M4 三维看车"><img src="assets/bmw-34.png" alt="BMW M4 官方车型图片" loading="lazy"><span>BMW M4 · 三维看车</span></a><footer class="home-signoff"><span class="signoff-brand">DRIVEFIT<span class="brand-dot" aria-hidden="true"></span></span><button data-action="about">独立参赛原型 · 推荐依据与素材来源</button></footer></section>`;
}

export function explore(){
 return `<section class="explore-scene"><div class="explore-heading"><h1>找到你心动的姿态</h1></div><div class="explore-grid">
  <a href="#catalog" class="explore-tile explore-catalog"><div class="explore-media"><img src="assets/scene-2.jpg" alt="BMW 4 系双门轿跑车"></div><div class="explore-content"><h2>不同的路<br>不同的宝马</h2><span class="explore-entry">浏览车型目录</span></div></a>
  <a href="#showroom" class="model-preview"><div class="explore-media"><img src="assets/bmw-34.png" alt="BMW M4 双门轿跑车官方图片"></div><div class="explore-content"><div><h2>换个角度<br>再心动一次</h2><p>BMW M4 · 外观示意模型</p></div><span class="explore-entry">打开三维看车</span></div></a>
 </div><div class="panel-bottom"><a class="text-btn" href="#home">返回首页</a><a class="btn" href="#quiz">按我的需求选车</a></div></section>`;
}

export function showroom(){
 return `<section class="showroom-scene panel-reveal"><div class="showroom-heading"><span class="eyebrow">A CLOSER LOOK</span><h1>BMW M4</h1><p>拖动旋转，近距离看车身细节</p></div>
  <div class="viewer-slot" id="viewer-slot"><img class="model-poster" src="assets/bmw-34.png" alt="BMW M4 官方图片"><p class="model-loading" id="model-status" role="status">正在打开三维模型…</p></div>
  <div class="model-toolbar"><div class="view-controls" aria-label="模型视角"><button data-orbit="front" aria-pressed="false" disabled>正面</button><button data-orbit="side" aria-pressed="false" disabled>侧面</button><button data-orbit="rear" aria-pressed="false" disabled>车尾</button><button data-orbit="reset" aria-pressed="true" disabled>复位</button></div><div class="paint-controls" aria-label="外观颜色预览"><button class="paint paint-white" data-paint="white" aria-label="雾白色彩预览" aria-pressed="true" disabled></button><button class="paint paint-graphite" data-paint="graphite" aria-label="石墨色彩预览" aria-pressed="false" disabled></button><button class="paint paint-lime" data-paint="lime" aria-label="柠檬黄色彩预览" aria-pressed="false" disabled></button><span id="paint-name">雾白</span></div><p class="model-gesture" id="model-gesture">载入后，拖动旋转 · 滚动缩放</p></div>
  <div class="showroom-bottom"><a class="btn secondary small" href="#explore">返回展厅</a><a class="btn small" href="#quiz">找到适合我的车</a><p>外观与色彩示意，非具体在售配置<br>模型：<a href="https://sketchfab.com/3d-models/bmw-m4-competition-m-package-5c0a2dafb1ad408d9fc9eeef9aee531b" target="_blank" rel="noopener noreferrer">SRT Performance</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · 已优化与调整</p></div>
 </section>`;
}

export function disposeScene(){cleanup();cleanup=()=>{};}
export function mountScene(view,app){
 const events=new AbortController();let timer;const disposeMotion=mountMotion(view,app,events.signal);cleanup=()=>{events.abort();clearInterval(timer);disposeMotion();};
 const carousel=app.querySelector('[data-carousel]');
 if(carousel){
  let active=Number(carousel.dataset.start)||0,paused=reduced(),touchStart=null;
  const changePhoto=i=>{if(i===active)return;const previous=active;active=i;const photos=carousel.querySelectorAll('.scene-photo');photos.forEach((el,n)=>el.classList.toggle('current',i===n));if(view==='home')slideTransition(photos,previous,i);carousel.querySelectorAll('[data-photo]').forEach((el,n)=>el.setAttribute('aria-pressed',String(i===n)));const name=carousel.querySelector('[data-photo-name]');name.textContent=slides[i].name;animateModelName(carousel,slides[i].code);carousel.querySelector('[data-photo-source]').href=slides[i].source;};
  const startTimer=()=>{clearInterval(timer);carousel.classList.toggle('carousel-running',!paused);if(!paused)timer=setInterval(()=>{const interacting=view!=='home'&&carousel.matches(':hover,:focus-within');const visible=carousel.getBoundingClientRect().bottom>0;if(visible&&!document.hidden&&!document.querySelector('dialog[open]')&&!interacting)changePhoto((active+1)%slides.length);},view==='home'?2000:7500);};
  carousel.querySelector('[data-playback]')?.addEventListener('click',e=>{paused=!paused;const b=e.currentTarget;b.textContent=paused?'播放':'暂停';b.setAttribute('aria-label',paused?'播放图片轮播':'暂停图片轮播');startTimer();},{signal:events.signal});
  if(paused){const b=carousel.querySelector('[data-playback]');if(b){b.textContent='播放';b.setAttribute('aria-label','播放图片轮播');}}
  carousel.querySelectorAll('[data-photo]').forEach(b=>b.addEventListener('click',()=>{changePhoto(Number(b.dataset.photo));startTimer();},{signal:events.signal}));
  // 悬停／键盘聚焦到圆点即预览该张（无需点击）
  carousel.querySelectorAll('[data-photo]').forEach(b=>{
   const preview=()=>{const i=Number(b.dataset.photo);if(i!==active)changePhoto(i);};
   b.addEventListener('focus',preview,{signal:events.signal});
  });
  const frame=carousel.querySelector('.drive-background,.quiz-photo-frame');
  // Touch gestures stay on the photo surface, leaving page scrolling and form controls alone.
  frame.style.pointerEvents='auto';
  frame.addEventListener('touchstart',e=>{const t=e.touches[0];touchStart={x:t.clientX,y:t.clientY};},{passive:true,signal:events.signal});
  frame.addEventListener('touchend',e=>{if(!touchStart)return;const t=e.changedTouches[0],dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){changePhoto((active+(dx<0?1:slides.length-1))%slides.length);startTimer();}touchStart=null;},{passive:true,signal:events.signal});
  startTimer();
 }
 if(view==='home'){
  const scene=app.querySelector('.drive-home');
  const opening=!hasOpened&&!reduced();hasOpened=true;
  scene.classList.add(opening?'opening':'ready');
  const stopIntro=()=>{scene.classList.remove('opening');scene.classList.add('ready');};
  scene.querySelector('.home-intro').addEventListener('animationend',e=>{if(e.target===e.currentTarget)stopIntro();},{signal:events.signal});
  scene.querySelector('[data-scene="skip"]').addEventListener('click',stopIntro,{signal:events.signal});
  if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduced()){
   const button=scene.querySelector('.start-button');
   button.addEventListener('pointermove',e=>{const rect=button.getBoundingClientRect();button.style.setProperty('--magnet-x',`${(e.clientX-rect.left-rect.width/2)*.04}px`);button.style.setProperty('--magnet-y',`${(e.clientY-rect.top-rect.height/2)*.08}px`);},{signal:events.signal});
   button.addEventListener('pointerleave',()=>{button.style.removeProperty('--magnet-x');button.style.removeProperty('--magnet-y');},{signal:events.signal});
  }
 }
 if(view==='showroom')loadModel(app,events.signal);
}

async function loadModel(app,signal){
 const slot=app.querySelector('#viewer-slot'),status=slot.querySelector('#model-status');
 try{
  await import('./vendor/model-viewer.min.js');
  if(signal.aborted)return;
  customElements.get('model-viewer').meshoptDecoderLocation=new URL('./vendor/meshopt_decoder.js',import.meta.url).href;
  const viewer=document.createElement('model-viewer');
  const radius=innerWidth<=540?'95%':'70%';
  const attributes={src:'assets/models/bmw-m4.glb',alt:'可拖动旋转的 BMW M4 外观示意模型','camera-controls':'','touch-action':'pan-y','interaction-prompt':'none','camera-orbit':`35deg 80deg ${radius}`,'min-camera-orbit':'auto 45deg 55%','max-camera-orbit':'auto 88deg 150%','field-of-view':'28deg','shadow-intensity':'1','shadow-softness':'0.8',exposure:'0.95','environment-image':'neutral','loading':'eager','rotation-per-second':'12deg'};
  Object.entries(attributes).forEach(([k,v])=>viewer.setAttribute(k,v));
  slot.prepend(viewer);
  const fail=()=>{status.textContent='三维模型暂时无法载入 可返回展厅继续选车';slot.classList.add('model-failed');};
  viewer.addEventListener('error',fail,{signal});
  viewer.addEventListener('load',()=>{
   if(signal.aborted)return;
   slot.classList.add('model-ready');status.textContent='三维模型已就绪';
   app.querySelectorAll('[data-orbit],[data-paint]').forEach(b=>b.disabled=false);
   const gesture=app.querySelector('#model-gesture');gesture.textContent=matchMedia('(pointer:coarse)').matches?'单指旋转 · 双指缩放':'拖动旋转 · 滚动缩放';
   const materials=viewer.model.materials.filter(m=>['Mesheszx1Mtl','Meshesbody151Mtl','Mesheslivery1Mtl'].includes(m.name));
   const colors={white:['雾白',[0.92,0.93,0.9,1]],graphite:['石墨',[0.12,0.14,0.15,1]],lime:['柠檬黄',[0.73,0.88,0.02,1]]};
   const paint=key=>{for(const material of materials){material.pbrMetallicRoughness.baseColorTexture.setTexture(null);material.pbrMetallicRoughness.setBaseColorFactor(colors[key][1]);material.pbrMetallicRoughness.setMetallicFactor(0.35);material.pbrMetallicRoughness.setRoughnessFactor(0.32);}};
   paint('white');
   viewer.autoRotate=!reduced();
   viewer.addEventListener('pointerdown',()=>{viewer.autoRotate=false;},{signal});
   app.querySelectorAll('[data-paint]').forEach(b=>b.addEventListener('click',()=>{paint(b.dataset.paint);app.querySelector('#paint-name').textContent=colors[b.dataset.paint][0];app.querySelectorAll('[data-paint]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));},{signal}));
   const orbits={front:`0deg 80deg ${radius}`,side:`90deg 80deg ${radius}`,rear:`180deg 80deg ${radius}`,reset:`35deg 80deg ${radius}`};
   app.querySelectorAll('[data-orbit]').forEach(b=>b.addEventListener('click',()=>{viewer.autoRotate=false;viewer.cameraOrbit=orbits[b.dataset.orbit];app.querySelectorAll('[data-orbit]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(reduced())viewer.jumpCameraToGoal();},{signal}));
  },{once:true,signal});
 }catch{if(!signal.aborted){status.textContent='三维看车暂时无法打开 可返回展厅继续选车';slot.classList.add('model-failed');}}
}
