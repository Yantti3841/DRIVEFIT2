import {catalog} from './catalog.js';
import {slides} from './slides.js';
import {defaultNeeds,recommend,priceLabel} from './recommend.js';
import {motionAllowed} from './motion.js';

const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initialCar=catalog.find(c=>c.id==='bmw-12');
const hasAnswer=(q,answers)=>q.multi?!!answers[q.key]?.length:answers[q.key]!==undefined;

// The live count shares the final recommendation's hard filters; soft preferences only rank.
export function quizState(answers,questions){
 const budget=answers.budget&&answers.budget!=='null'?Number(answers.budget):null;
 const needs={...defaultNeeds(),budget,passengers:Number(answers.passengers)||2,uses:(answers.uses||[]).filter(x=>x!=='unknown'),priorities:(answers.priorities||[]).filter(x=>x!=='unknown'),energy:answers.energy||'any',body:answers.body||'any',charging:answers.charging||'unknown'};
 const audit=recommend(catalog,needs);
 const summary=questions.flatMap((q,index)=>{
  if(!hasAnswer(q,answers))return [];
  const values=q.multi?answers[q.key]:[answers[q.key]];
  const label=q.key==='budget'&&answers.budgetLabel?answers.budgetLabel:values.map(v=>q.options.find(o=>o.id===String(v))?.title).filter(Boolean).join('、');
  return [{index,label}];
 });
 const cars=summary.length?audit.picks:[initialCar,catalog.find(c=>c.id==='bmw-11'),catalog.find(c=>c.id==='bmw-24')];
 return {count:audit.total,cars,summary,completed:summary.length,empty:audit.total===0};
}

const imageFor=car=>car.id===initialCar.id?slides.find(s=>s.id===car.id).src:car.image;
const isStudio=car=>car.id!==initialCar.id;
const thumb=(car,current)=>`<button class="config-thumb" data-preview-car="${car.id}" aria-label="浏览 ${escape(car.name)} 图片" aria-pressed="${car.id===current}"><img src="${car.image}" alt="" loading="lazy"><span>${escape(car.name.replace(/^BMW /,''))}</span></button>`;
const tags=state=>state.summary.length?state.summary.map(item=>`<button class="config-tag" data-step="${item.index}" aria-label="修改：${escape(item.label)}">${escape(item.label)}</button>`).join(''):'<span class="config-summary-placeholder">选完预算，你的需求会出现在这里</span>';

function stage(state){
 const car=state.cars[0]||initialCar;
 return `<section class="config-stage" aria-label="车型展示与需求反馈">
  <div class="config-stage-heading"><div><p class="config-stage-label">我的下一台宝马</p><h2 data-config-name>${escape(car.name)}</h2></div><a data-config-source href="${car.source}" target="_blank" rel="noopener noreferrer">官方车型资料</a></div>
  <div class="config-media ${isStudio(car)?'studio-photo':''}" data-config-media data-car-id="${car.id}" aria-label="车型图片展示"><img class="config-car-image is-current" data-config-photo src="${imageFor(car)}" alt="${escape(car.name)} 官方图片" fetchpriority="high"><img class="config-car-image" data-config-photo alt="" aria-hidden="true"><div class="config-image-caption"><span data-config-price>${priceLabel(car)}</span><span>官网展示价 · 具体版本另核对</span></div></div>
  <div class="config-photo-footer"><div class="config-thumbs" data-config-thumbs aria-label="浏览示例车型">${state.cars.map(c=>thumb(c,car.id)).join('')}</div><p data-config-preview-note>车型随需求更新<br>完成问答后生成最终候选</p></div>
  <aside class="config-live" aria-label="已选条件反馈"><div class="config-live-count"><strong data-config-count>${state.count}</strong><span>款符合已选必要条件</span></div><div class="config-summary"><div class="config-summary-heading"><h3>你的需求</h3><span data-config-completed>${state.completed} / 6 已选</span></div><div class="config-tags" data-config-tags>${tags(state)}</div><p class="config-count-note" data-config-count-note>${state.empty?'当前条件下暂无车型；图片为展示，不作为候选':'预算、人数决定筛选范围；用途和偏好影响排序'}</p></div></aside>
 </section>`;
}

function progress(questions,step,answers){
 return `<nav class="config-progress" aria-label="选车进度">${questions.map((q,index)=>`<button class="step-item ${index===step?'current':hasAnswer(q,answers)?'done':''}" data-step="${index}" aria-label="第 ${index+1} 题：${q.short}${hasAnswer(q,answers)?'，已答':''}" ${index===step?'aria-current="step"':''}><b>${hasAnswer(q,answers)&&index!==step?'✓':String(index+1).padStart(2,'0')}</b><span>${q.short}</span><i aria-hidden="true"></i></button>`).join('')}</nav>`;
}

export function renderQuiz({questions,step,answers,icon}){
 const q=questions[step],chosen=answers[q.key],state=quizState(answers,questions);
 return `<section class="quiz-page config-layout"><div class="config-toolbar"><a href="#home">返回首页</a><p>找到值得试驾的那几台</p></div>${stage(state)}<div class="quiz-main config-panel" data-question="${q.key}"><div class="quiz-top"><span class="quiz-counter">${String(step+1).padStart(2,'0')} / 06</span><button class="restart-button" data-action="redo">重新选择</button></div><h1 tabindex="-1">${q.title.replace('（多选）','')}</h1><p class="quiz-hint">${q.hint}</p><div class="options ${q.key==='budget'?'budget-options':''}" role="group" aria-label="${escape(q.short)}">${q.options.map(o=>`<button class="option" data-answer="${o.id}" aria-pressed="${q.multi?Array.isArray(chosen)&&chosen.includes(o.id):String(chosen)===o.id}">${o.symbol?icon(o.symbol):''}<span class="option-copy"><span class="option-title">${o.title}</span>${q.key!=='budget'?`<span class="option-description">${o.description}</span>`:''}</span><span class="option-indicator" aria-hidden="true"></span></button>`).join('')}</div>${q.key==='budget'?'<form id="custom-budget" class="question-shortcut"><label for="specific-budget">或设置具体上限</label><div><input id="specific-budget" class="custom-budget" type="number" name="budget" min="1" max="10000" step="0.1" aria-label="具体购车预算上限，万元" placeholder="输入金额"><span>万元</span><button class="text-btn" type="submit">确认</button></div></form>':''}<div class="quiz-controls"><button class="text-btn" data-action="previous">${step===0?'返回首页':'上一步'}</button>${q.multi?`<button class="btn" data-action="next" ${!chosen?.length?'disabled':''}>继续</button>`:'<span class="config-auto-note">选择后自动进入下一题</span>'}</div></div>${progress(questions,step,answers)}</section>`;
}

export function showQuizCar(root,car){
 if(!car)return;
 const frame=root.querySelector('[data-config-media]');
 frame.dataset.pendingCar=car.id;
 const commit=()=>{
  if(!frame.isConnected||frame.dataset.pendingCar!==car.id)return;
  frame.dataset.carId=car.id;
  root.querySelector('[data-config-name]').textContent=car.name;
  root.querySelector('[data-config-price]').textContent=priceLabel(car);
  root.querySelector('[data-config-source]').href=car.source;
  root.querySelectorAll('[data-preview-car]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.previewCar===car.id)));
  frame.classList.toggle('studio-photo',isStudio(car));
 };
 const current=frame.querySelector('.is-current');
 if(current.getAttribute('src')===imageFor(car)){commit();return;}
 const next=frame.querySelector('.config-car-image:not(.is-current)');
 next.src=imageFor(car);next.alt=`${car.name} 官方图片`;
 next.decode().then(()=>{
  if(!frame.isConnected||frame.dataset.pendingCar!==car.id)return;
  commit();current.classList.remove('is-current');current.setAttribute('aria-hidden','true');next.classList.add('is-current');next.removeAttribute('aria-hidden');
 }).catch(()=>{});
}

export function updateQuizPreview(root,answers,questions){
 const scrollTop=root.scrollTop;
 const state=quizState(answers,questions),count=root.querySelector('[data-config-count]');
 if(count.textContent!==String(state.count)&&motionAllowed())count.animate([{opacity:.3,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'cubic-bezier(.16,1,.3,1)'});
 count.textContent=state.count;
 root.querySelector('[data-config-tags]').innerHTML=tags(state);
 root.querySelector('[data-config-completed]').textContent=`${state.completed} / 6 已选`;
 root.querySelector('[data-config-count-note]').textContent=state.empty?'当前条件下暂无车型；图片为展示，不作为候选':'预算、人数决定筛选范围；用途和偏好影响排序';
 const car=state.cars[0]||initialCar;
 root.querySelector('[data-config-thumbs]').innerHTML=state.cars.map(c=>thumb(c,car.id)).join('');
 root.querySelector('[data-config-preview-note]').innerHTML=state.empty?'当前条件暂无候选<br>可回改预算或乘坐需求':'车型随需求更新<br>完成问答后生成最终候选';
 showQuizCar(root,car);
 root.scrollTop=scrollTop;
}
