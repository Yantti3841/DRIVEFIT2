import {slides} from './slides.js';
let cleanup=()=>{},hasOpened=false;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const photoImages=(active=0)=>slides.map((s,i)=>`<img src="${s.src}" class="scene-photo ${i===active?'current':''}" style="--photo-position:${s.position}" ${i===active?'fetchpriority="high"':'loading="lazy"'} alt="">`).join('');
const photoControls=(active=0)=>`<div class="scene-chooser" aria-label="切换车型照片">${slides.map((s,i)=>`<button data-photo="${i}" aria-label="查看 ${s.name} 照片" aria-pressed="${i===active}">${String(i+1).padStart(2,'0')}</button>`).join('')}<button class="carousel-pause" data-pause aria-label="暂停自动轮播" aria-pressed="false">暂停</button></div>`;

export function quizCarousel(step){
 const active=step%slides.length;
 return `<aside class="quiz-visual" data-carousel data-start="${active}" aria-label="宝马车型照片轮播"><div class="quiz-photo-frame">${photoImages(active)}</div><div class="quiz-gallery-copy"><span class="eyebrow">MEET YOUR NEXT DRIVE</span><h2 data-photo-name>${slides[active].name}</h2><p>先看看不同车型。图片展示不影响你的推荐。</p><a data-photo-source href="${slides[active].source}" target="_blank" rel="noopener noreferrer">宝马官方车型资料</a></div>${photoControls(active)}</aside>`;
}

export function home(){
 return `<section class="drive-home" data-carousel aria-label="宝马试驾前选车">
  <div class="drive-background" aria-hidden="true">${photoImages()}</div>
  <div class="home-shade"></div>
  <div class="home-intro" aria-hidden="true"><span>DRIVEFIT</span></div>
  <button class="skip-intro" data-scene="skip">跳过开场</button>
  <div class="home-message"><p class="eyebrow">宝马试驾前选车</p><h1><span>试驾前，</span><span>先选对宝马。</span></h1><p class="home-description"><span>回答几个问题，选出 2—3 台候选。</span><span>带着重点去试驾。</span></p></div>
  <div class="home-entry"><div class="home-actions"><a class="btn start-button" href="#quiz"><span class="button-label">开始选车</span></a><a class="home-secondary" href="#explore">先看看车</a></div><p class="entry-note">约 1 分钟 · 无需懂参数 · 无需留手机号</p></div>
  <div class="home-foot"><span>独立参赛原型</span>${photoControls()}<a class="photo-caption" data-photo-source href="${slides[0].source}" target="_blank" rel="noopener noreferrer"><span data-photo-name>${slides[0].name}</span> · 官方图片</a></div>
 </section>`;
}

export function explore(){
 return `<section class="explore-scene"><div class="panel-backdrop" aria-hidden="true"><img src="assets/scene-3.jpg" alt=""></div>
 <div class="explore-grid panel-reveal">
  <a href="#quiz" class="explore-tile explore-main"><img src="assets/scene-3.jpg" alt="宝马 4 系驶过城市街道"><div class="tile-copy"><span class="eyebrow">START WITH YOU</span><h1>先选对，<br>再试驾。</h1><p>用几个简单选择，找到值得试驾的宝马。</p><span class="tile-label">开始选车</span></div><span class="tile-index">01 / 为你选车</span></a>
  <a href="#catalog" class="explore-tile explore-catalog"><img src="assets/scene-2.jpg" alt="宝马 4 系侧面"><div class="tile-copy"><span class="tile-index-inline">02 / 全部车型</span><h2>每一台，<br>都看清楚。</h2><span class="tile-label">浏览 44 款在售车型</span></div></a>
  <button data-action="about" class="explore-tile explore-method"><img src="assets/interior.jpg" alt="宝马车身展示"><div class="tile-copy"><span class="tile-index-inline">03 / 推荐依据</span><h2>为什么，<br>是这几台？</h2><span class="tile-label">了解我们怎么选</span></div></button>
  <a href="#showroom" class="model-preview"><span class="eyebrow">THE M4 · IN THREE DIMENSIONS</span><img src="assets/bmw-34.png" alt="BMW M4 双门轿跑车官方图片"><div class="preview-copy"><p>不只看一张照片。</p><h2>转一圈，<br>看看它。</h2><span class="preview-label">打开三维看车</span></div><span class="preview-note">BMW M4 · 外观示意模型</span></a>
 </div><div class="panel-bottom"><a class="btn secondary small" href="#home">返回首页</a><span>选车与看车，由你决定从哪开始。</span></div></section>`;
}

export function showroom(){
 return `<section class="showroom-scene panel-reveal"><div class="showroom-heading"><span class="eyebrow">A CLOSER LOOK</span><h1>BMW M4</h1><p>拖动旋转，近距离看车身细节。</p></div>
  <div class="viewer-slot" id="viewer-slot"><img class="model-poster" src="assets/bmw-34.png" alt="BMW M4 官方图片"><p class="model-loading" id="model-status" role="status">正在打开三维模型…</p></div>
  <div class="model-toolbar"><div class="view-controls" aria-label="模型视角"><button data-orbit="front" aria-pressed="false" disabled>正面</button><button data-orbit="side" aria-pressed="false" disabled>侧面</button><button data-orbit="rear" aria-pressed="false" disabled>车尾</button><button data-orbit="reset" aria-pressed="true" disabled>复位</button></div><div class="paint-controls" aria-label="外观颜色预览"><button class="paint paint-white" data-paint="white" aria-label="雾白色彩预览" aria-pressed="true" disabled></button><button class="paint paint-graphite" data-paint="graphite" aria-label="石墨色彩预览" aria-pressed="false" disabled></button><button class="paint paint-lime" data-paint="lime" aria-label="柠檬黄色彩预览" aria-pressed="false" disabled></button><span id="paint-name">雾白</span></div><p class="model-gesture" id="model-gesture">载入后，拖动旋转 · 滚动缩放</p></div>
  <div class="showroom-bottom"><a class="btn secondary small" href="#explore">返回展厅</a><a class="btn small" href="#quiz">找到适合我的车</a><p>外观与色彩示意，非具体在售配置。<br>模型：<a href="https://sketchfab.com/3d-models/bmw-m4-competition-m-package-5c0a2dafb1ad408d9fc9eeef9aee531b" target="_blank" rel="noopener noreferrer">SRT Performance</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · 已优化与调整</p></div>
 </section>`;
}

export function disposeScene(){cleanup();cleanup=()=>{};}
export function mountScene(view,app){
 const events=new AbortController();let timer;cleanup=()=>{events.abort();clearInterval(timer);};
 const carousel=app.querySelector('[data-carousel]');
 if(carousel){
  let active=Number(carousel.dataset.start)||0,paused=reduced(),touchStart=null;
  const pause=carousel.querySelector('[data-pause]');
  const changePhoto=i=>{active=i;carousel.querySelectorAll('.scene-photo').forEach((el,n)=>el.classList.toggle('current',i===n));carousel.querySelectorAll('[data-photo]').forEach((el,n)=>el.setAttribute('aria-pressed',String(i===n)));carousel.querySelector('[data-photo-name]').textContent=slides[i].name;carousel.querySelector('[data-photo-source]').href=slides[i].source;};
  const updatePause=()=>{pause.textContent=paused?'播放':'暂停';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'播放自动轮播':'暂停自动轮播');};
  const startTimer=()=>{clearInterval(timer);if(!paused)timer=setInterval(()=>{if(!document.hidden&&!document.querySelector('dialog[open]')&&(!carousel.matches(':focus-within')||document.activeElement===pause))changePhoto((active+1)%slides.length);},7500);};
  carousel.querySelectorAll('[data-photo]').forEach(b=>b.addEventListener('click',()=>{changePhoto(Number(b.dataset.photo));startTimer();},{signal:events.signal}));
  pause.addEventListener('click',()=>{paused=!paused;updatePause();startTimer();},{signal:events.signal});
  const frame=carousel.querySelector('.drive-background,.quiz-photo-frame');
  // Touch gestures stay on the photo surface, leaving page scrolling and form controls alone.
  frame.style.pointerEvents='auto';
  frame.addEventListener('touchstart',e=>{const t=e.touches[0];touchStart={x:t.clientX,y:t.clientY};},{passive:true,signal:events.signal});
  frame.addEventListener('touchend',e=>{if(!touchStart)return;const t=e.changedTouches[0],dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){changePhoto((active+(dx<0?1:slides.length-1))%slides.length);startTimer();}touchStart=null;},{passive:true,signal:events.signal});
  updatePause();startTimer();
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
  const attributes={src:'assets/models/bmw-m4.glb',alt:'可拖动旋转的 BMW M4 外观示意模型','camera-controls':'','touch-action':'pan-y','interaction-prompt':'none','camera-orbit':`35deg 80deg ${radius}`,'min-camera-orbit':'auto 45deg 55%','max-camera-orbit':'auto 88deg 150%','field-of-view':'28deg','shadow-intensity':'1','shadow-softness':'0.8',exposure:'0.95','environment-image':'neutral','loading':'eager'};
  Object.entries(attributes).forEach(([k,v])=>viewer.setAttribute(k,v));
  slot.prepend(viewer);
  const fail=()=>{status.textContent='三维模型暂时无法载入。可返回展厅继续选车。';slot.classList.add('model-failed');};
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
   app.querySelectorAll('[data-paint]').forEach(b=>b.addEventListener('click',()=>{paint(b.dataset.paint);app.querySelector('#paint-name').textContent=colors[b.dataset.paint][0];app.querySelectorAll('[data-paint]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));},{signal}));
   const orbits={front:`0deg 80deg ${radius}`,side:`90deg 80deg ${radius}`,rear:`180deg 80deg ${radius}`,reset:`35deg 80deg ${radius}`};
   app.querySelectorAll('[data-orbit]').forEach(b=>b.addEventListener('click',()=>{viewer.cameraOrbit=orbits[b.dataset.orbit];app.querySelectorAll('[data-orbit]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(reduced())viewer.jumpCameraToGoal();},{signal}));
  },{once:true,signal});
 }catch{if(!signal.aborted){status.textContent='三维看车暂时无法打开。可返回展厅继续选车。';slot.classList.add('model-failed');}}
}
