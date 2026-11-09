import test from 'node:test';
import assert from 'node:assert/strict';
import {quizState} from '../dist/quiz-view.js';
import {catalog} from '../dist/catalog.js';
const questions=[{key:'budget',options:[{id:'600000',title:'40—60 万'},{id:'200000',title:'20 万以内'},{id:'null',title:'还没确定'}]},{key:'uses',multi:true,options:[{id:'family',title:'家庭乘坐'}]},{key:'passengers',options:[{id:'6',title:'6 人'}]},{key:'energy',options:[{id:'bev',title:'纯电'}]}];

test('问答中的数量只取已选必要条件，场景和动力偏好不偷偷过滤',()=>{
 const before=quizState({budget:'600000'},questions);
 const after=quizState({budget:'600000',uses:['family'],energy:'bev'},questions);
 const expected=catalog.filter(c=>c.status==='on_sale'&&Number.isFinite(c.price)&&c.price>0&&c.price<=600000).length;
 assert.equal(before.count,expected);assert.equal(after.count,expected);
 assert.equal(after.completed,3);assert.match(after.summary[1].label,/家庭/);
});
test('预算不足或预算内无三排车型时显示真实的零，图片不变成候选',()=>{
 for(const answers of [{budget:'200000'},{budget:'600000',passengers:'6'}]){
  const state=quizState(answers,questions);assert.equal(state.count,0);assert.equal(state.empty,true);assert.deepEqual(state.cars,[]);
 }
});
test('初始图片不作为已完成答案，自定义预算与不确定答案保持原意',()=>{
 const initial=quizState({},questions);assert.equal(initial.count,44);assert.equal(initial.completed,0);assert.equal(initial.summary.length,0);
 const custom=quizState({budget:'350000',budgetLabel:'35 万元以内'},questions);assert.equal(custom.summary[0].label,'35 万元以内');assert.ok(custom.cars.every(c=>c.price<=350000));
 const uncertain=quizState({budget:'null'},questions);assert.equal(uncertain.count,44);assert.equal(uncertain.summary[0].label,'还没确定');
});
