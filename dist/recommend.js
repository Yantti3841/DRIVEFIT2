export const energyLabels={gasoline:'燃油',bev:'纯电',phev:'插电混动'};
export const bodyLabels={sedan:'轿车',suv:'SUV',coupe:'双门轿跑',convertible:'敞篷',wagon:'旅行车'};
export const useLabels={commute:'日常通勤',family:'接送家人',long:'长途出行',weekend:'周末出游'};
export const priorityLabels={drive:'驾驶感受',comfort:'乘坐舒适',space:'空间实用',cost:'使用成本',design:'外观设计'};
export const defaultNeeds=()=>({budget:null,budgetLabel:'还没确定',uses:[],passengers:2,priorities:[],energy:'any',energyMust:false,body:'any',bodyMust:false,charging:'unknown'});
export const priceLabel=c=>c.price?`${(c.price/10000).toFixed(2)} 万元${c.priceIsFrom?'起':''}`:'售价待公布';
export function recommend(catalog,needs){
 const stages=[{label:'官网目录',count:catalog.length,note:'包含咨询与待发布条目'}];
 let candidates=catalog;
 const filter=(label,note,predicate)=>{candidates=candidates.filter(predicate);stages.push({label,note,count:candidates.length});};
 filter('可推荐条目','有官方售价与试驾入口',c=>c.status==='on_sale'&&Number.isFinite(c.price)&&c.price>0);
 filter('预算范围',needs.budget===null?'未设上限，不按价格排除':`官网价 ≤ ${(needs.budget/10000).toFixed(1)} 万；落地费用另计`,c=>needs.budget===null||c.price<=needs.budget);
 filter('座位需求',`至少 ${needs.passengers} 座；版本需核对`,c=>c.seats>=needs.passengers);
 filter('必要条件',[needs.energyMust&&needs.energy!=='any'?energyLabels[needs.energy]+'必须符合':'',needs.bodyMust&&needs.body!=='any'?bodyLabels[needs.body]+'必须符合':''].filter(Boolean).join(' · ')||'动力与车身为软偏好',c=>(!needs.energyMust||needs.energy==='any'||c.energy===needs.energy)&&(!needs.bodyMust||needs.body==='any'||c.body===needs.body));
 const rows=candidates.map(c=>{
  const reasons=[],scoreParts=[];let score=0;
  const add=(label,points,max,source)=>{score+=points;scoreParts.push({label,points,max,source});};
  for(const [index,p] of needs.priorities.entries()){const points=c.priorityTags.includes(p)?(index===0?5:3):0;add(`${index===0?'第一':'第二'}偏好 · ${priorityLabels[p]}`,points,index===0?5:3,'团队定位标签');if(points)reasons.push(priorityReason(c,p));}
  for(const u of needs.uses){const points=c.useTags.includes(u)?2:0;add(useLabels[u],points,2,'团队场景标签');if(points)reasons.push(useReason(c,u));}
  if(needs.energy!=='any'){const points=c.energy===needs.energy?1:0;add(energyLabels[needs.energy]+'动力',points,1,'车型动力类型');if(points)reasons.push(`符合你偏好的${energyLabels[c.energy]}动力。`);}
  if(needs.body!=='any'){const points=c.body===needs.body?1:0;add(bodyLabels[needs.body]+'车身',points,1,'车型车身类型');if(points)reasons.push(`符合你偏好的${bodyLabels[c.body]}车身。`);}
  if(['public','unknown'].includes(needs.charging)&&['bev','phev'].includes(c.energy))add('补能需额外确认',-2,2,'你的充电条件');
  if(!reasons.length)reasons.push('通过目前的预算、座位和必要条件筛选，值得进一步了解。');
  return {...c,score,scoreParts,reasons:[...new Set(reasons)].slice(0,2),tradeoff:tradeoff(c,needs)};
 }).sort((a,b)=>b.score-a.score||a.price-b.price||a.id.localeCompare(b.id));
 const seen=new Set();const picks=[];
 for(const c of rows){if(seen.has(c.group))continue;seen.add(c.group);picks.push(c);if(picks.length===3)break;}
 return {picks,total:rows.length,stages};
}
function priorityReason(c,p){
 return {drive:c.performance?'M 性能定位契合你对驾驶感受的关注，建议亲自体验。':'运动取向值得你重点体验转向与动力响应。',comfort:'列入舒适取向候选，建议与你的同行人一起试乘。',space:`${bodyLabels[c.body]}车身适合进一步核对后排与行李装载。`,cost:'纯电动力值得结合充电条件和实际电价核算日常成本。',design:`${bodyLabels[c.body]}的造型取向契合你对外观的关注。`}[p];
}
function useReason(c,u){return {commute:'列入日常通勤候选，重点核对停车和低速使用感受。',family:'列入家庭使用候选，重点体验后排进出与乘坐。',long:'列入长途候选，重点核对座椅、行李和补能安排。',weekend:'适合纳入周末出行候选，试驾时带上你的真实需求。'}[u];}
export function tradeoff(c,n){
 if(['bev','phev'].includes(c.energy)&&['public','unknown'].includes(n.charging))return '充电条件还需确认；先规划常用补能地点，再做决定。';
 if(n.body!=='any'&&c.body!==n.body)return `满足必要条件，但车身不是你优先考虑的${bodyLabels[n.body]}。`;
 if(n.energy!=='any'&&c.energy!==n.energy)return `动力类型与你的${energyLabels[n.energy]}偏好不同，可作为对照试驾。`;
 if(c.body==='coupe'||c.body==='convertible')return '后排进出和行李装载要亲自确认，尤其是多人出行。';
 if(c.performance)return '性能取向的悬架、轮胎与日常成本，需要一起权衡。';
 if(c.body==='suv'&&!c.compact)return '车身和停车空间需现场核对，别只看乘坐空间。';
 const missing=n.priorities.find(p=>!c.priorityTags.includes(p));
 if(missing)return `对“${priorityLabels[missing]}”的匹配还不明确，建议列为试驾重点。`;
 return '车系起价不代表具体配置，舒适程度和配置仍需到店确认。';
}
export function testDriveChecks(c,n){
 const checks=[];
 if(['bev','phev'].includes(c.energy)&&['public','unknown'].includes(n.charging))checks.push({title:'先确认常用补能地点',text:'充电条件尚未确认。核对常用路线的补能地点和时间，再体验低速与能量回收感受。'});
 if(n.uses.includes('family')||n.passengers>=3||n.priorities.includes('comfort'))checks.push({title:'让同行的人坐一次后排',text:'体验进出便利、腿部空间与路面起伏；有儿童座椅就一起带去。'});
 if(n.priorities.includes('drive')||c.performance)checks.push({title:'体验真实的日常驾驶',text:'在合法、安全路况下感受转向、低速响应与制动，不需要极限驾驶。'});
 if(n.priorities.includes('space')||n.uses.includes('weekend')||n.uses.includes('long'))checks.push({title:'把行李需求带到现场',text:'核对常用行李、婴儿车的装载与后排使用，不只看参数。'});
 if(['bev','phev'].includes(c.energy)&&!['public','unknown'].includes(n.charging))checks.push({title:'确认你的补能方式',text:'核对家或公司充电条件，询问常用路线补能；体验低速与能量回收感受。'});
 checks.push({title:'试一次停车与低速转弯',text:'核对视野、停车空间，确认辅助功能是否属于意向版本。'});
 checks.push({title:'核对具体版本与落地费用',text:'确认年款、座位、标配与选装，取得书面报价；官网起价不是成交价。'});
 return checks.slice(0,3);
}
