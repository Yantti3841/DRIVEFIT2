import {energyLabels,bodyLabels,useLabels,priorityLabels,priceLabel,testDriveChecks} from './recommend.js';

export function testDriveMessage(car,needs,confirmed=[],complete=true){
 const requirements=complete?[
  needs.budget===null?'预算还未确定':`整体购车预算上限 ${Number((needs.budget/10000).toFixed(2))} 万元`,
  needs.uses.length?needs.uses.map(x=>useLabels[x]).join('、'):null,
  `通常 ${needs.passengers===2?'1—2':needs.passengers===4?'3—4':needs.passengers} 人乘坐`,
  needs.priorities.length?`最在意${needs.priorities.map(x=>priorityLabels[x]).join('，其次是')}`:null,
  needs.energy!=='any'?`${energyLabels[needs.energy]}${needs.energyMust?'是必要条件':'优先'}`:null,
  needs.body!=='any'?`${bodyLabels[needs.body]}${needs.bodyMust?'是必要条件':'优先'}`:null,
  ['bev','phev'].includes(car.energy)?({home:'家里充电方便',work:'公司充电方便',public:'主要使用公共充电',unknown:'充电条件待确认'}[needs.charging]):null,
 ].filter(Boolean).join('；'):'购车需求还未完整确定，想先了解这台车。';
 const checks=testDriveChecks(car,needs);
 return `您好，我想了解并安排试驾 ${car.name}。\n\n我的需求：${requirements}${complete?'。':''}\n\n试驾重点：\n${checks.map((x,i)=>`${i+1}. ${x.title}${confirmed.includes(i)?'（已初步确认，现场再体验）':''}：${x.text}`).join('\n')}\n\n请帮我确认意向年款、座位与具体配置，提供完整落地报价，并告知是否有试驾车、可预约的时间。\n\n官网展示价：${priceLabel(car)}（${car.checkedAt} 快照，具体版本另核价）。\n车型资料：${car.source}`;
}
