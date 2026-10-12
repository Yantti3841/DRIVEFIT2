import {catalog} from './catalog.js';
import {home,explore,showroom,quizCarousel,mountScene,disposeScene} from './scene.js';
import {defaultNeeds,recommend,priceLabel,energyLabels,bodyLabels,useLabels,priorityLabels,tradeoff,testDriveChecks} from './recommend.js';
import {testDriveMessage} from './share.js';

const app=document.querySelector('#app');
const dialog=document.querySelector('#dialog');
const compareBar=document.querySelector('#compare-bar');
const selected=new Set();
let needs=defaultNeeds(),step=0,answers={},view='home',toastTimer;
let filters={search:'',energy:'all',body:'all',budget:'all',status:'on_sale',sort:'default'};
let lastFocus=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={city:'M4 21V6h10v15M8 10h2m-2 4h2m-2 4h2M17 21V11h4v10M2 21h22',people:'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M16 11a3 3 0 1 0 0-6M3 21v-3a6 6 0 0 1 12 0v3m3-7a5 5 0 0 1 3 4v3',road:'m4 22 6-20m10 20L14 2M12 3v3m0 4v3m0 4v3',mountain:'m2 20 7-14 4 7 3-5 6 12H2m5-10 2 3 2-3',wheel:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M3 9h18M12 12v10m-5-9 5-1 5 1',seat:'M7 3v9a4 4 0 0 0 4 4h8M5 11l-2 8h17m-9-3v5',box:'m3 7 9-5 9 5v12l-9 5-9-5V7m0 0 9 5 9-5m-9 5v12',leaf:'M20 3C8 2 2 7 5 15s17 6 15-12M5 21 16 8',spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7',check:'m5 12 4 4 10-10',close:'m6 6 12 12M18 6 6 18'};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.spark}"/></svg>`;
const opt=(id,title,description='',symbol='')=>({id,title,description,symbol});
const budgetOptions=[opt('200000','20 万以内','先看官方起价'),opt('300000','20—30 万','日常与驾趣的平衡'),opt('400000','30—40 万','更多车身与动力选择'),opt('600000','40—60 万','关注空间与体验'),opt('1000000','60—100 万','从容考虑大型车'),opt('null','还没确定','先按生活需求来')];
const baseQuestions=[
 {key:'budget',short:'购车预算',title:'买车预算大概多少？',hint:'按整体预算选择；官网裸车价以外，还需预留落地费用。',options:budgetOptions},
 {key:'uses',short:'用车场景',title:'平时主要怎么用车？',hint:'最多选两项，按你真实的日常来。',multi:true,options:[opt('commute','日常通勤','上班、城市代步','city'),opt('family','接送家人','接送孩子、照顾家人','people'),opt('long','长途出行','跨城、节假日远行','road'),opt('weekend','周末出游','周边旅行、户外出行','mountain'),opt('unknown','还没想好','先看看有哪些选择')]},
 {key:'passengers',short:'乘坐需求',title:'平时通常坐几个人？',hint:'把经常同行的人一起考虑进去。',options:[opt('2','1—2 人','多数时间自己或两人'),opt('4','3—4 人','家人、朋友经常同行'),opt('5','经常坐满 5 人','后排和行李都很重要'),opt('6','需要 6 个座位','重点看三排座椅'),opt('7','需要 7 个座位','三排七座，一起出行')]},
 {key:'priorities',short:'重点偏好',title:'你最在意哪两件事？',hint:'最多选两项，先选你最在意的。',multi:true,options:[opt('drive','驾驶感受','转向、动力响应','wheel'),opt('comfort','乘坐舒适','座椅、日常路面感受','seat'),opt('space','空间实用','后排、行李装载','box'),opt('cost','使用成本','日常能源与养护','leaf'),opt('design','外观设计','车身姿态、第一眼心动','spark'),opt('unknown','不确定','先给我一些建议')]},
 {key:'energy',short:'动力偏好',title:'你对动力有偏好吗？',hint:'这里是偏好，想限定动力可在结果页调整。',options:[opt('gasoline','更倾向燃油','加油补能，长途灵活'),opt('bev','更倾向纯电','先考虑日常充电条件'),opt('phev','更倾向插混','同时考虑加油与充电'),opt('any','都可以 / 不确定','按我的需求比较')]},
];
const chargingQuestion={key:'charging',short:'充电条件',title:'平时充电方便吗？',hint:'不方便也可以考虑电车，但要先确认补能安排。',options:[opt('home','家里方便','有固定车位与充电条件'),opt('work','公司方便','工作地点能稳定补能'),opt('public','主要公共充电','需要规划时间和地点'),opt('unknown','还不确定','留到试驾前再核对')]};
const bodyQuestion={key:'body',short:'车身偏好',title:'你更偏爱哪种车身？',hint:'凭你的第一感觉选；这是偏好，不会直接排除其他车身。',options:[opt('sedan','轿车','日常、商务、家庭'),opt('suv','SUV','坐姿与空间的取舍'),opt('coupe','双门轿跑','车身姿态与运动取向'),opt('convertible','敞篷','享受开放式驾驶'),opt('any','都可以 / 不确定','给我不同的候选')]};
const questions=()=>[...baseQuestions,answers.energy==='gasoline'?bodyQuestion:chargingQuestion];
const answersComplete=()=>questions().every(q=>q.multi?answers[q.key]?.length:answers[q.key]!==undefined);
const getCar=id=>catalog.find(c=>c.id===id);

function navigate(target){if(location.hash===`#${target}`)render();else location.hash=target;}
function render(){
 const hash=location.hash.slice(1);view=['quiz','catalog','results','explore','showroom'].includes(hash)?hash:'home';
 disposeScene();
 document.body.classList.toggle('canvas-page',['home','explore','showroom'].includes(view));
 document.body.dataset.view=view;
 if(dialog.open)dialog.close();
 if(view==='results'){const missing=questions().findIndex(q=>q.multi?!answers[q.key]?.length:answers[q.key]===undefined);if(missing!==-1){step=missing;navigate('quiz');return;}syncNeeds();}
 document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===view));
 app.innerHTML=view==='home'?home():view==='explore'?explore():view==='showroom'?showroom():view==='quiz'?quiz():view==='catalog'?catalogPage():resultsPage();
 mountScene(view,app);
 updateCompare();window.scrollTo({top:0,behavior:'instant'});
 if(view==='quiz')app.querySelector('h1')?.focus({preventScroll:true});
}
function quiz(){
 const qs=questions();step=Math.min(step,qs.length-1);const q=qs[step];const chosen=answers[q.key];
 return `<section class="quiz-page"><aside class="quiz-rail" aria-label="选车进度"><div class="rail-label">YOUR NEXT DRIVE</div><div class="steps">${qs.map((x,i)=>`<div class="step-item ${i===step?'current':i<step?'done':''}" ${i===step?'aria-current="step"':''}><b>${String(i+1).padStart(2,'0')}</b><span>${x.short}</span></div>`).join('')}</div></aside><div class="quiz-main"><div class="quiz-top"><div class="quiz-counter">${String(step+1).padStart(2,'0')} / 06 · ${q.multi?'最多选两项':'选一项，即可继续'}</div><button class="restart-button" data-action="redo">重新选择</button></div><h1 tabindex="-1">${q.title}</h1><p class="quiz-hint">${q.hint}</p><div class="options">${q.options.map(o=>`<button class="option" data-answer="${o.id}" aria-pressed="${q.multi?Array.isArray(chosen)&&chosen.includes(o.id):String(chosen)===o.id}">${o.symbol?icon(o.symbol):''}<span class="option-title">${o.title}</span><span class="option-description">${o.description}</span></button>`).join('')}</div>${q.key==='budget'?'<form id="custom-budget" class="question-shortcut"><input class="custom-budget" type="number" name="budget" min="1" max="10000" step="0.1" aria-label="具体购车预算上限，万元" placeholder="或输入上限，单位万元"><button class="text-btn" type="submit">确认上限</button></form>':''}<div class="quiz-controls"><button class="text-btn" data-action="previous">${step===0?'返回首页':'上一步'}</button>${q.multi?`<button class="btn" data-action="next" ${!chosen?.length?'disabled':''}>${step===5?'查看推荐':'下一步'}</button>`:'<span class="fine">答案随时可以修改</span>'}</div></div>${quizCarousel(step)}</section>`;
}
function refreshQuiz(){disposeScene();app.innerHTML=quiz();mountScene('quiz',app);}
function answer(id){
 const q=questions()[step];
 if(q.multi){let a=answers[q.key]||[];if(a.includes(id))a=a.filter(x=>x!==id);else if(id==='unknown')a=['unknown'];else{a=a.filter(x=>x!=='unknown');if(a.length===2){toast('最多选两项，先取消一项再选择。');return;}a=[...a,id];}answers[q.key]=a;refreshQuiz();app.querySelector(`[data-answer="${id}"]`)?.focus({preventScroll:true});return;}
 if(q.key==='energy'&&answers.energy!==id){delete answers.body;delete answers.charging;}
 if(q.key==='budget')delete answers.budgetLabel;
 if(q.key==='energy')needs.energyMust=false;
 if(q.key==='body')needs.bodyMust=false;
 answers[q.key]=id;advance();
}
function advance(){if(step<questions().length-1){step++;refreshQuiz();app.querySelector('h1')?.focus({preventScroll:true});window.scrollTo(0,0);}else{syncNeeds();navigate('results');}}
function syncNeeds(){
 const budget=answers.budget==='null'?null:Number(answers.budget);
 needs={...needs,budget:Number.isFinite(budget)&&budget>0?budget:null,budgetLabel:answers.budgetLabel||budgetOptions.find(o=>o.id===String(answers.budget))?.title||'还没确定',uses:(answers.uses||[]).filter(x=>x!=='unknown'),passengers:Number(answers.passengers)||2,priorities:(answers.priorities||[]).filter(x=>x!=='unknown'),energy:answers.energy||'any',body:answers.body||'any',charging:answers.charging||'unknown'};
}
function carCard(c,rank=null){
 const isPick=rank!==null;const isSelected=selected.has(c.id);const status=c.status==='on_sale'?'':c.status==='consult'?'咨询 / 预售':'待发布 / 关注';
 return `<article class="car-card"><div class="car-art"><img src="${c.image}" alt="${esc(c.originalName)} 官方车型图" loading="lazy">${isPick?`<span class="rank-tag">${rank===0?'优先试驾':`候选 ${rank+1}`}</span>`:`<span class="car-art-label">${c.performance?'M PERFORMANCE':c.energy==='bev'?'BMW ELECTRIC':'BMW'}${status?' · '+status:''}</span>`}<button class="compare-toggle ${isSelected?'selected':''}" data-compare="${c.id}" aria-label="${isSelected?'移出':'加入'}对比：${esc(c.name)}" aria-pressed="${isSelected}">${isSelected?'已加入':'＋ 对比'}</button></div><div class="car-body"><h3>${esc(c.name)}</h3><div class="car-spec"><span>${energyLabels[c.energy]}</span><span>·</span><span>${bodyLabels[c.body]}</span>${c.status==='on_sale'?`<span>·</span><span>${c.seats} 座${/X7/.test(c.name)?'车型需确认':''}</span>`:''}</div><div class="car-price">${priceLabel(c)}<small>${c.price?'官网展示价':''}</small></div>${isPick?`<ul class="reason-list">${c.reasons.map(r=>`<li>${r}</li>`).join('')}</ul><div class="tradeoff"><strong>需要权衡</strong>${c.tradeoff}</div>`:''}<div class="card-actions"><button class="text-btn" data-detail="${c.id}">${isPick?'看试驾重点':'了解这台车'} </button><a class="text-btn" href="${c.source}" target="_blank" rel="noopener noreferrer" aria-label="在宝马官网查看${esc(c.name)}">官网 </a></div></div></article>`;
}
function filteredCars(){
 return catalog.filter(c=>(filters.status==='all'||(filters.status==='new'?c.status!=='on_sale':c.status===filters.status))&&(filters.energy==='all'||c.energy===filters.energy)&&(filters.body==='all'||(filters.body==='sport'?c.performance:c.body===filters.body))&&(filters.budget==='all'||(c.price!==null&&c.price<=Number(filters.budget)))&&(!filters.search||c.originalName.toLowerCase().includes(filters.search.toLowerCase()))).sort((a,b)=>filters.sort==='low'?(a.price??Infinity)-(b.price??Infinity):filters.sort==='high'?(b.price??-Infinity)-(a.price??-Infinity):0);
}
function selectField(name,label,opts,value){return `<div class="filter-field"><label for="filter-${name}">${label}</label><select id="filter-${name}" data-filter="${name}">${opts.map(([v,t])=>`<option value="${v}" ${value===v?'selected':''}>${t}</option>`).join('')}</select></div>`;}
function catalogPage(){
 const rows=filteredCars();
 return `<section class="page"><div class="page-heading"><div><h1>全部宝马车型。</h1><p>按价格、动力和车身筛选，再加入对比。</p></div><a class="btn small" href="#quiz">为我推荐 </a></div><div class="filters"><div class="filter-field search"><label for="car-search">搜索车型</label><input id="car-search" type="search" data-filter="search" placeholder="试试 3系、X3、i5、M…" value="${esc(filters.search)}"></div>${selectField('energy','动力类型',[['all','不限动力'],['gasoline','燃油'],['bev','纯电'],['phev','插电混动']],filters.energy)}${selectField('body','车身 / 性能',[['all','不限车身'],['sedan','轿车'],['suv','SUV'],['coupe','双门轿跑'],['convertible','敞篷'],['wagon','旅行车'],['sport','M 性能车型']],filters.body)}${selectField('budget','官网价格上限',[['all','不限价格'],['300000','30 万元'],['400000','40 万元'],['600000','60 万元'],['1000000','100 万元']],filters.budget)}${selectField('sort','排序',[['default','官网顺序'],['low','价格从低到高'],['high','价格从高到低']],filters.sort)}</div><div class="catalog-info"><div class="tabs" aria-label="销售状态"><button class="tab ${filters.status==='on_sale'?'active':''}" data-status="on_sale">在售 ${catalog.filter(c=>c.status==='on_sale').length}</button><button class="tab ${filters.status==='new'?'active':''}" data-status="new">新车 / 待发布 5</button><button class="tab ${filters.status==='all'?'active':''}" data-status="all">全部 49</button></div><span class="count" id="catalog-count">${rows.length} 款符合条件 · 2026.10.12 官网快照</span></div><div class="car-grid" id="catalog-grid">${rows.length?rows.map(c=>carCard(c)).join(''):emptyCatalog()}</div><p class="data-note">价格来自 BMW 中国官网，为车系起价或所示车型价格，非成交价。不同年款、配置与库存请向授权经销商确认。新车展示不等于已交付；图片中的选装配置可能与起价车型不同。</p></section>`;
}
function emptyCatalog(){return '<div class="empty" style="grid-column:1/-1"><h2>暂时没有符合条件的车型。</h2><p>试着减少筛选条件，或用选车助手表达你的需求。</p><button class="btn secondary" data-action="reset-filters">清除筛选</button></div>';}
function updateCatalog(){
 const rows=filteredCars();document.querySelector('#catalog-count').textContent=`${rows.length} 款符合条件 · 2026.10.12 官网快照`;
 document.querySelector('#catalog-grid').innerHTML=rows.length?rows.map(c=>carCard(c)).join(''):emptyCatalog();
}
function needsChips(){return [needs.budget?`预算上限 ${(needs.budget/10000).toFixed(1)} 万`:'预算未确定',...needs.uses.map(x=>useLabels[x]),`${needs.passengers} 人出行`,...needs.priorities.map(x=>priorityLabels[x]),needs.energy==='any'?'动力不限':energyLabels[needs.energy]+(needs.energyMust?'（必须）':'优先'),needs.body!=='any'?bodyLabels[needs.body]+(needs.bodyMust?'（必须）':'优先'):null].filter(Boolean);}
function resultsPage(){
 const {picks,total}=recommend(catalog,needs);
 return `<section class="page"><div class="page-heading"><div><h1>${picks.length?'建议先试驾这几台。':'先调整一下选择条件。'}</h1><p>${picks.length?'先看懂差异，再把感受留给试驾。':'我们会保留你的条件，不自动提高预算。'}</p></div><button class="btn secondary small" data-action="edit">调整我的需求 </button></div><div class="need-chips">${needsChips().map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="result-note">${needs.budget?'已按官方价格排除明显超预算车型；落地费用另计，具体版本仍需核价。':'预算尚未确认，当前只按需求排序，未验证价格是否适合你。'} ${needs.passengers>=6?'三排车型的座位与版本价格，请到店核对。':''}</div>${picks.length?`<div class="car-grid">${picks.map((c,i)=>carCard(c,i)).join('')}</div><div class="result-tools"><button class="btn secondary small" data-priority="space">更看重空间</button><button class="btn secondary small" data-priority="drive">更看重驾驶</button><button class="btn secondary small" data-priority="comfort">更看重舒适</button><button class="text-btn" data-action="copy-summary">复制我的需求 </button></div><div class="comparison-tip"><span>从 ${total} 个满足必要条件的车型中，为你选出不同车系的候选。</span><button class="text-btn" data-action="about">为什么这样推荐？ </button></div>`:`<div class="empty"><h2>没有同时满足条件的候选。</h2><p>${noResultReason()}</p><button class="btn" data-action="edit">主动调整条件 </button><a class="btn secondary" href="#catalog">查看全部车型</a></div>`}<p class="data-note">推荐标签是团队基于车型定位的初步判断，不是实测排名。价格与车型图来自宝马官网（2026.10.12）；配置、年款、座位和库存以意向版本为准。当前为车系层面的试驾候选推荐。</p></section>`;
}
function noResultReason(){
 if(needs.budget!==null&&needs.budget<208000)return '当前官网在售车型最低展示起价为 20.80 万元。你的预算上限低于该价格；我们不会把未经核实的折扣作为推荐依据。';
 if(needs.passengers>=6)return `你需要 ${needs.passengers} 人乘坐，但当前预算或动力、车身限定下没有合适的三排候选。请主动检查预算和必要条件。`;
 return '当前预算、座位与必要动力／车身条件的交集为空。你可以主动调整其中一项，我们会保留其他答案。';
}
function updateCompare(){
 document.body.classList.toggle('has-compare',selected.size>0);compareBar.hidden=selected.size===0;
 compareBar.innerHTML=`<span>已选 ${selected.size} 台 · 最多对比 3 台</span><button class="text-btn" data-action="clear-compare">清空</button><button class="btn small" data-action="compare" ${selected.size<2?'disabled':''}>对比看看 </button>`;
 document.querySelectorAll('[data-compare]').forEach(b=>{const yes=selected.has(b.dataset.compare);b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes));b.setAttribute('aria-label',`${yes?'移出':'加入'}对比：${getCar(b.dataset.compare).name}`);b.textContent=yes?'已加入':'＋ 对比';});
}
function showDialog(title,content){lastFocus=document.activeElement;dialog.innerHTML=`<div class="dialog-head"><h2 id="dialog-title">${title}</h2><button class="close" data-action="close" aria-label="关闭">${icon('close')}</button></div><div class="dialog-content">${content}</div>`;dialog.showModal();dialog.scrollTop=0;}
function detail(id){
 const c=getCar(id),r=recommend(catalog,needs).picks.find(x=>x.id===id);const checks=testDriveChecks(c,needs);
 showDialog(c.name,`<div class="detail-top"><div class="car-art"><img src="${c.image}" alt="${esc(c.name)} 官方图片"></div><div><div class="car-price">${priceLabel(c)}</div><p>${energyLabels[c.energy]} · ${bodyLabels[c.body]} · ${c.seats} 座${/X7/.test(c.name)?'（意向版本需核对）':''}</p><p>${c.status==='on_sale'?(r?r.reasons.join(' '):'先认识车型，再通过需求问答判断是否值得试驾。'):'官网提供咨询或关注入口；上市、交付与试驾安排请向经销商确认。'}</p><a class="source" href="${c.source}" target="_blank" rel="noopener noreferrer">查看宝马官方车型资料</a></div></div><div class="data-note">需要权衡：${r?.tradeoff||tradeoff(c,needs)}</div><h3>试驾时，重点确认这三件事。</h3><p>勾选已确认的事项，保存后可把需求直接复制给微信里的销售。</p><ol class="check-list">${checks.map((x,i)=>`<li><label><input type="checkbox" data-check="${i}" aria-label="已确认：${x.title}"><span><strong>${x.title}</strong><p>${x.text}</p></span></label></li>`).join('')}</ol><div class="dialog-actions"><button class="btn small" data-download="${id}">保存试驾清单</button><button class="btn secondary small" data-compare="${id}">${selected.has(id)?'已加入':'加入对比'}</button></div><section class="wechat-share" hidden><div class="share-heading"><div><span class="eyebrow">READY TO SEND</span><h3>把需求，带到微信里。</h3></div><span class="share-state">已生成</span></div><p>可以修改文字，再复制给销售。由你自行发送。</p><label class="fine" for="wechat-message">试驾需求文字</label><textarea id="wechat-message" rows="9"></textarea><button class="btn small" data-copy-plan="${id}">复制到微信</button><span class="copy-status" role="status"></span></section><p class="local-label">官网价格快照：${c.checkedAt} · 图片可能含选装配置 · 无真实预约</p>`);
}
function compare(){
 const cars=[...selected].map(getCar);const ranked=recommend(catalog,needs).picks;
 const row=(label,fn)=>`<tr><th scope="row">${label}</th>${cars.map(c=>`<td>${fn(c)}</td>`).join('')}</tr>`;
 showDialog('把差异放在一起看。',`<table class="compare-table"><thead><tr><th scope="col">车型</th>${cars.map(c=>`<th scope="col"><img src="${c.image}" alt="${esc(c.name)}"><strong>${c.name}</strong></th>`).join('')}</tr></thead><tbody>${row('官网价格',priceLabel)}${row('动力',c=>energyLabels[c.energy])}${row('车身',c=>bodyLabels[c.body])}${row('座位',c=>c.seats+' 座'+(/X7/.test(c.name)?'，版本需核对':''))}${row('重点核对',c=>testDriveChecks(c,needs)[0].title)}${row('取舍',c=>ranked.find(r=>r.id===c.id)?.tradeoff||tradeoff(c,needs))}${row('资料',c=>`<a class="source" href="${c.source}" target="_blank" rel="noopener noreferrer">宝马官网 </a>`)}</tbody></table><div class="data-note">比的是车型方向，不是具体配置套餐。官网起价、座位与实际意向版本需再次确认。你更在意的主观感受，请带同行人一起试乘。</div>`);
}
function edit(){
 const options=(items,current)=>items.map(([v,t])=>`<option value="${v}" ${String(current)===v?'selected':''}>${t}</option>`).join('');
 showDialog('调整需求，重新看候选。',`<form id="edit-needs"><div class="edit-grid"><label>预算上限（万元；空白代表未确定）<input type="number" name="budget" min="1" max="10000" step="0.01" value="${needs.budget?needs.budget/10000:''}"></label><label>通常乘坐人数<select name="passengers">${options([['2','1—2 人'],['4','3—4 人'],['5','5 人'],['6','6 人'],['7','7 人']],needs.passengers)}</select></label><label>动力偏好<select name="energy">${options([['any','不限'],['gasoline','燃油'],['bev','纯电'],['phev','插电混动']],needs.energy)}</select></label><label>车身偏好<select name="body">${options([['any','不限'],...Object.entries(bodyLabels)],needs.body)}</select></label><label class="checkbox-label"><input type="checkbox" name="energyMust" ${needs.energyMust?'checked':''}>动力必须符合，不接受其他动力</label><label class="checkbox-label"><input type="checkbox" name="bodyMust" ${needs.bodyMust?'checked':''}>车身必须符合，不接受其他车身</label><label>充电条件<select name="charging">${options([['home','家里方便'],['work','公司方便'],['public','主要公共充电'],['unknown','不确定']],needs.charging)}</select></label></div><div class="data-note">其他已选用途和重点偏好保持不变。预算仍按整体预算填写，官方裸车价以外需预留落地费用。</div><div class="dialog-actions"><button class="btn" type="submit">更新推荐 </button><button class="btn secondary" type="button" data-action="redo">重新回答问题</button></div></form>`);
}
function about(){
 const complete=answersComplete();if(complete)syncNeeds();
 const audit=recommend(catalog,needs),stages=complete?audit.stages:audit.stages.slice(0,2);
 showDialog('为什么，是这几台？',`<section class="evidence-intro"><span class="eyebrow">THE REASON BEHIND YOUR DRIVE</span><h3>你的选择，怎样变成候选。</h3><p>${complete?'下面是这次推荐真实经过的筛选和计分。条件不变，结果可以复核。':'先满足必要条件，再按你的偏好排序。完成问答后，这里会展示你的实际筛选过程与每台车的得分。'}</p></section><ol class="filter-funnel">${stages.map((s,i)=>`<li><span class="funnel-step">0${i+1} / ${s.label}</span><strong>${s.count}<small> 款</small></strong><div class="funnel-track"><span style="width:${s.count/catalog.length*100}%"></span></div><p>${esc(s.note)}</p></li>`).join('')}${complete?`<li class="funnel-final"><span class="funnel-step">06 / 不同车系候选</span><strong>${audit.picks.length}<small> 台</small></strong><p>按偏好排序，同车系只保留一台，最多三台。</p></li>`:'<li class="funnel-pending"><span class="funnel-step">接下来 / 按你的需求</span><strong>由你决定</strong><p>预算、人数、必要条件，然后保留不同车系的候选。</p><a class="source" href="#quiz" data-dismiss>开始回答问题</a></li>'}</ol><div class="evidence-section-title"><h3>${complete?'每一分，从哪里来。':'排序规则，先看清楚。'}</h3><span>规则匹配分 · 非测评分 / 匹配概率</span></div><div class="weight-legend"><span>第一偏好 <b>+5</b></span><span>第二偏好 <b>+3</b></span><span>每个用车场景 <b>+2</b></span><span>动力 / 车身偏好各 <b>+1</b></span><span>补能待确认 <b>−2</b></span></div>${complete&&audit.picks.length?`<div class="score-candidates">${audit.picks.map((c,i)=>`<article class="score-card"><div class="score-car"><img src="${c.image}" alt="${esc(c.name)} 官方图片"><div><span class="fine">${i===0?'优先试驾':`候选 ${i+1}`}</span><h4>${esc(c.name)}</h4></div><div class="score-total"><strong>${c.score}</strong><span>排序分</span></div></div><ul class="score-ledger">${c.scoreParts.length?c.scoreParts.map(s=>`<li><div class="score-label"><span>${esc(s.label)}</span><b>${s.points>0?'+':''}${s.points}</b></div><div class="score-track ${s.points<0?'penalty':''}"><span style="width:${Math.abs(s.points)/s.max*100}%"></span></div><small>${s.source}${s.points===0?' · 未命中标签':''}</small></li>`).join(''):'<li class="fine">尚未设定排序偏好。通过必要条件后，按官网展示价升序排列。</li>'}</ul><a class="source" href="${c.source}" target="_blank" rel="noopener noreferrer">${priceLabel(c)} · 核对官方车型资料</a></article>`).join('')}</div>`:complete?'<div class="evidence-empty">当前条件筛选后为 0 台。我们保留你的预算与必要条件，等待你主动调整。</div>':''}<p class="evidence-rule-note">只有命中标签才加分。公共充电或充电条件不明时，纯电 / 插混减 2 分；仍保留必须符合的动力。总分相同，按官方展示价升序，再按目录 ID 排序。</p><section class="source-split"><div><span class="source-dot official"></span><h4>可查的车型资料</h4><p>官方展示价、动力与车身类型来自 BMW 车型目录。座位按车型资料整理，具体版本仍需核对。</p><a class="source" href="https://www.bmw.com.cn/zh/ssl/model-finder.html" target="_blank" rel="noopener noreferrer">BMW 中国官方目录 · 2026.10.12 快照</a></div><div><span class="source-dot editorial"></span><h4>需要亲自试的判断</h4><p>驾驶、舒适、空间及场景标签由团队根据车型定位整理，暂无实测评级。推荐用于缩小试驾范围。</p><span class="fine">价格能核对，主观感受留给你。</span></div></section><details class="evidence-details"><summary>图片、三维模型与原型说明</summary><p>44 个条目有官方价格与试驾入口，5 个为咨询或关注条目，后者不参与推荐。车型图与轮播照片来自 BMW 中国官网，轮播照片于 2026.10.13 核对。图片可能含选装配置，不代表起价版本。</p><p>BMW M4 外观示意模型由 SRT Performance 制作，以 CC BY 4.0 发布；本站优化了体积并提供颜色预览，不代表具体年款或官方车漆。</p><a class="source" href="assets/models/CREDITS.txt" target="_blank" rel="noopener noreferrer">模型署名与许可</a><p>DRIVEFIT 为独立参赛原型，与宝马官方无合作或授权关系。采用可解释规则，未接入大模型或实时库存。需求仅在当前页面内使用，无登录或手机号收集。官网价不是成交价，不能保证当地现车。</p></details>`);
}
function summary(){return `DRIVEFIT · 我的宝马试驾前需求\n${needsChips().join(' / ')}\n${needs.charging==='home'?'家庭充电方便':needs.charging==='work'?'公司充电方便':needs.charging==='public'?'主要公共充电':'充电条件待确认'}\n候选：${recommend(catalog,needs).picks.map(c=>c.name).join('、')||'暂无满足条件的候选'}\n价格为官方裸车价快照，整体购车费用及具体版本需另核对。`;}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function copySummary(){try{await navigator.clipboard.writeText(summary());toast('需求摘要已复制。');}catch{showDialog('复制我的需求。',`<p>浏览器未允许自动复制。请选中文字手动复制。</p><textarea id="summary-message" class="manual-copy" rows="8" aria-label="购车需求摘要">${esc(summary())}</textarea>`);dialog.querySelector('textarea').select();}}
function savePlan(id){
 const car=getCar(id),confirmed=[...dialog.querySelectorAll('[data-check]:checked')].map(x=>Number(x.dataset.check));
 if(answersComplete())syncNeeds();
 const text=testDriveMessage(car,needs,confirmed,answersComplete());
 download(text,`DRIVEFIT-${car.name}-试驾清单.txt`);
 const panel=dialog.querySelector('.wechat-share');panel.hidden=false;panel.querySelector('textarea').value=text;
 panel.querySelector('.copy-status').textContent='';panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 toast('清单已保存，需求文字可以复制到微信。');
}
async function copyPlan(){
 const field=dialog.querySelector('#wechat-message'),status=dialog.querySelector('.copy-status');
 try{await navigator.clipboard.writeText(field.value);status.textContent='已复制，在微信聊天中粘贴即可。';toast('已复制，可到微信粘贴发送。');}
 catch{field.focus();field.select();status.textContent='请复制已选中的文字，再粘贴到微信。';toast('浏览器未允许自动复制，请手动复制选中文字。');}
}
function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3000);}

document.addEventListener('click',e=>{
 if(e.target.closest('[data-dismiss]'))dialog.close();
 const b=e.target.closest('button,[data-action]');if(!b)return;
 if(b.dataset.answer){answer(b.dataset.answer);return;}
 if(b.dataset.compare){const id=b.dataset.compare;if(selected.has(id))selected.delete(id);else if(selected.size<3)selected.add(id);else{toast('最多对比 3 台，先移除一台。');return;}updateCompare();return;}
 if(b.dataset.detail){detail(b.dataset.detail);return;}
 if(b.dataset.download){savePlan(b.dataset.download);return;}
 if(b.dataset.copyPlan){copyPlan();return;}
 if(b.dataset.priority){needs.priorities=[b.dataset.priority,...needs.priorities.filter(x=>x!==b.dataset.priority)].slice(0,2);answers.priorities=needs.priorities;app.innerHTML=resultsPage();updateCompare();toast(`已优先考虑${priorityLabels[b.dataset.priority]}。`);return;}
 if(b.dataset.status){filters.status=b.dataset.status==='new'?'new':b.dataset.status;app.innerHTML=catalogPage();updateCompare();return;}
 const action=b.dataset.action;
 if(action==='about')about();
 if(action==='close')dialog.close();
 if(action==='previous'){if(step>0){step--;refreshQuiz();app.querySelector('h1')?.focus({preventScroll:true});}else navigate('home');}
 if(action==='next')advance();
 if(action==='edit')edit();
 if(action==='redo'){dialog.close();step=0;answers={};needs=defaultNeeds();selected.clear();navigate('quiz');toast('已清空选择，从预算重新开始。');}
 if(action==='copy-summary')copySummary();
 if(action==='compare')compare();
 if(action==='clear-compare'){selected.clear();updateCompare();}
 if(action==='reset-filters'){filters={search:'',energy:'all',body:'all',budget:'all',status:'on_sale',sort:'default'};app.innerHTML=catalogPage();updateCompare();}
});
document.addEventListener('input',e=>{if(e.target.matches('[data-filter="search"]')){filters.search=e.target.value.trim();updateCatalog();}});
document.addEventListener('change',e=>{if(e.target.matches('select[data-filter]')){filters[e.target.dataset.filter]=e.target.value;updateCatalog();}});
document.addEventListener('submit',e=>{
 if(e.target.id==='custom-budget'){e.preventDefault();const value=Number(new FormData(e.target).get('budget'));if(value<=0||!Number.isFinite(value))return;answers.budget=String(Math.round(value*10000));answers.budgetLabel=`${value} 万元以内`;advance();}
 if(e.target.id==='edit-needs'){e.preventDefault();const f=new FormData(e.target);const budget=f.get('budget')===''?null:Math.round(Number(f.get('budget'))*10000);needs={...needs,budget,budgetLabel:budget?`${budget/10000} 万元以内`:'还没确定',passengers:Number(f.get('passengers')),energy:f.get('energy'),energyMust:f.has('energyMust'),body:f.get('body'),bodyMust:f.has('bodyMust'),charging:f.get('charging')};answers={...answers,budget:budget===null?'null':String(budget),budgetLabel:needs.budgetLabel,passengers:String(needs.passengers),energy:needs.energy,body:needs.body,charging:needs.charging};dialog.close();app.innerHTML=resultsPage();updateCompare();toast('已按新需求更新推荐。');}
});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});});
window.addEventListener('hashchange',render);
render();
