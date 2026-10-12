import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../dist/catalog.js';
import {defaultNeeds,recommend} from '../dist/recommend.js';
import {testDriveMessage} from '../dist/share.js';

test('可视化筛选数量与必要条件的实际交集一致',()=>{
 const n={...defaultNeeds(),budget:400000,passengers:5,energy:'bev',energyMust:true};
 const r=recommend(catalog,n),sale=catalog.filter(c=>c.status==='on_sale'&&c.price>0);
 const affordable=sale.filter(c=>c.price<=n.budget),seated=affordable.filter(c=>c.seats>=5),valid=seated.filter(c=>c.energy==='bev');
 assert.deepEqual(r.stages.map(x=>x.count),[49,44,affordable.length,seated.length,valid.length]);
 assert.equal(r.total,valid.length);
 assert.ok(r.picks.every(c=>valid.some(v=>v.id===c.id)));
});
test('排序分能由逐项依据重新加总；未命中偏好不加分',()=>{
 for(const charging of ['home','public']){
  const n={...defaultNeeds(),priorities:['space','drive'],uses:['family','commute'],energy:'bev',body:'sedan',charging};
  for(const c of recommend(catalog,n).picks){
   assert.equal(c.scoreParts.reduce((sum,s)=>sum+s.points,0),c.score);
   assert.equal(c.scoreParts[0].points,c.priorityTags.includes('space')?5:0);
   assert.equal(c.scoreParts[1].points,c.priorityTags.includes('drive')?3:0);
   const penalty=c.scoreParts.find(s=>s.points<0);
   assert.equal(Boolean(penalty),charging==='public'&&['bev','phev'].includes(c.energy));
  }
 }
});
test('空结果的筛选轨迹保留真实的零，不凑候选',()=>{
 const r=recommend(catalog,{...defaultNeeds(),budget:200000,passengers:7});
 assert.deepEqual(r.stages.map(x=>x.count),[49,44,0,0,0]);assert.equal(r.picks.length,0);
});
test('微信需求只包含选定车、真实预算和清单确认状态',()=>{
 const n={...defaultNeeds(),budget:380000,passengers:4,uses:['family'],priorities:['comfort','space'],energy:'gasoline'};
 const c=catalog.find(x=>x.name==='BMW 3系'),text=testDriveMessage(c,n,[0]);
 assert.match(text,/试驾 BMW 3系/);assert.match(text,/预算上限 38 万元/);
 assert.match(text,/通常 3—4 人乘坐/);assert.match(text,/最在意乘坐舒适，其次是空间实用/);
 assert.equal((text.match(/已初步确认/g)||[]).length,1);assert.match(text,/完整落地报价/);
 assert.ok(text.includes(c.source));assert.doesNotMatch(text,/候选：|BMW X3|预约成功|已提交/);
});
test('未确定预算与未完成问答不虚构需求',()=>{
 const c=catalog.find(x=>x.name==='BMW i5');
 assert.match(testDriveMessage(c,defaultNeeds()),/预算还未确定/);
 const partial=testDriveMessage(c,defaultNeeds(),[],false);
 assert.match(partial,/购车需求还未完整确定/);assert.doesNotMatch(partial,/通常.*人乘坐|预算上限/);
});
