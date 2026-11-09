/* Slideshow choreography adapted from Codrops/SlideshowAnimations (MIT).
 * Layout continuity: Codrops/ScrollBasedLayoutAnimations; gallery movement:
 * Codrops/3DCarousel. See vendor/credits and research/reference-source. */
export const motionAllowed=()=>document.documentElement.dataset.motion==='on'||!matchMedia('(prefers-reduced-motion: reduce)').matches;
let photoTween;

export function slideTransition(photos,previous,next){
 const g=window.gsap;if(!g||!motionAllowed())return;
 photoTween?.kill();g.killTweensOf(photos);
 photos.forEach((photo,i)=>g.set(photo,{opacity:i===previous?1:0,zIndex:i===previous?1:0,clipPath:'inset(0% 0% 0% 0%)',xPercent:0,scale:1}));
 const incoming=photos[next],outgoing=photos[previous];
 g.set(incoming,{zIndex:2});
 // The incoming image reveals over the outgoing one; the car keeps its shape.
 photoTween=g.timeline({defaults:{ease:'power3.inOut'},onComplete:()=>g.set(outgoing,{opacity:0})})
  .fromTo(incoming,{clipPath:'inset(0% 0% 0% 100%)',opacity:.35,xPercent:3,scale:1.08},{clipPath:'inset(0% 0% 0% 0%)',opacity:1,xPercent:0,scale:1,duration:1.05},0)
  .to(outgoing,{opacity:.45,scale:1.025,duration:1.05},0);
}

export function animateModelName(root,code){
 const target=root.querySelector('[data-model-code]');if(!target)return;
 target.textContent=code;
 if(window.gsap&&motionAllowed())window.gsap.fromTo(target,{opacity:.25},{opacity:1,duration:.45,ease:'power3.out',overwrite:true});
}

export function captureGrid(){
 return motionAllowed()&&window.Flip?window.Flip.getState('.car-card'):null;
}

export function animateGrid(state){
 if(!state||!window.Flip)return;
 window.Flip.from(state,{targets:'.car-card',duration:.65,ease:'power3.inOut',scale:true,absoluteOnLeave:true,prune:true,
  onEnter:items=>window.gsap.fromTo(items,{opacity:0,y:20},{opacity:1,y:0,duration:.4,stagger:.035,clearProps:'opacity,transform'})});
}

export function mountMotion(view,app,signal){
 const g=window.gsap,ST=window.ScrollTrigger;
 const scroll=app.querySelector('[data-scroll]');
 scroll?.addEventListener('click',()=>document.getElementById(scroll.dataset.scroll)?.scrollIntoView({behavior:motionAllowed()?'smooth':'instant'}),{signal});
 const track=app.querySelector('[data-drag-gallery]');
 let dragging=null,moved=false;
 if(track){
  const bar=app.querySelector('.gallery-scrollbar');
  if(bar){bar.addEventListener('input',()=>{track.scrollLeft=Number(bar.value)/1000*(track.scrollWidth-track.clientWidth);},{signal});track.addEventListener('scroll',()=>{bar.value=String(track.scrollLeft/Math.max(1,track.scrollWidth-track.clientWidth)*1000);},{signal,passive:true});}

  track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;dragging={x:e.clientX,start:track.scrollLeft};moved=false;},{signal});
  track.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-dragging.x;if(Math.abs(dx)>6){moved=true;track.classList.add('dragging');track.setPointerCapture(e.pointerId);track.scrollLeft=dragging.start-dx;e.preventDefault();}},{signal});
  const release=()=>{dragging=null;track.classList.remove('dragging');};
  track.addEventListener('pointerup',release,{signal});track.addEventListener('pointercancel',release,{signal});track.addEventListener('lostpointercapture',release,{signal});
  track.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}},{capture:true,signal});
 }
 if(!g||!motionAllowed())return()=>{};
 if(ST)g.registerPlugin(ST);
 if(window.Flip)g.registerPlugin(window.Flip);
 document.documentElement.classList.add('experience-motion');
 const ctx=g.context(()=>{
  if(view==='home'){
   g.timeline({defaults:{ease:'power3.out'}})
    .fromTo('.home-message .title-char',{yPercent:105,opacity:0},{yPercent:0,opacity:1,duration:.9,stagger:.045},.45)
    .fromTo('.home-description',{y:20,opacity:0},{y:0,opacity:1,duration:.75},.75)
    .fromTo('.home-actions',{y:16,opacity:0},{y:0,opacity:1,duration:.7},.95)
    .fromTo('.hero-model',{y:55,opacity:0},{y:0,opacity:1,duration:1},.7)
    .fromTo('.home-foot',{y:12,opacity:0},{y:0,opacity:1,duration:.7},.95);
   if(ST){
    app.querySelectorAll('[data-reveal]').forEach(el=>g.fromTo(el,{y:32,opacity:0},{y:0,opacity:1,duration:.85,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
    g.fromTo('.story-image img',{yPercent:-7,scale:1.15},{yPercent:7,scale:1.15,ease:'none',scrollTrigger:{trigger:'.story-image',start:'top bottom',end:'bottom top',scrub:.7}});
    g.to('.hero-model',{yPercent:-28,ease:'none',scrollTrigger:{trigger:'.drive-home',start:'top top',end:'bottom top',scrub:.6}});
   }
  }else if(view==='quiz'){
   g.timeline({defaults:{ease:'power3.out'}})
    .fromTo('.config-panel h1,.config-panel .quiz-hint',{y:12,opacity:0},{y:0,opacity:1,duration:.4,stagger:.045,clearProps:'opacity,transform'},0)
    .fromTo('.option',{y:12,opacity:0},{y:0,opacity:1,duration:.38,stagger:.025,clearProps:'opacity,transform'},.07);
  }else if(view==='explore'){
   g.fromTo('.explore-grid>a',{y:55,opacity:0},{y:0,opacity:1,duration:.95,stagger:.12,ease:'power3.out',clearProps:'opacity,transform'});
  }
  if(track&&matchMedia('(hover:hover) and (pointer:fine)').matches){
   const cards=track.querySelectorAll('.gallery-car');
   cards.forEach(card=>{
    card.addEventListener('pointermove',e=>{if(dragging)return;const rect=card.getBoundingClientRect();g.to(card.querySelector('img'),{rotationY:((e.clientX-rect.left)/rect.width-.5)*5,rotationX:-((e.clientY-rect.top)/rect.height-.5)*4,scale:1.045,duration:.5,ease:'power2.out',overwrite:true});},{signal});
    card.addEventListener('pointerleave',()=>g.to(card.querySelector('img'),{rotationY:0,rotationX:0,scale:1,duration:.7,overwrite:true}),{signal});
   });
  }
 },app);
 return()=>{photoTween?.kill();ctx.revert();g.killTweensOf(app.querySelectorAll('.scene-photo,[data-model-code],.gallery-car img'));document.documentElement.classList.remove('experience-motion');};
}
