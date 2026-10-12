import {catalog} from './catalog.js';

export const slides=[
 {id:'bmw-12',src:'assets/scene-2.jpg',position:'45% 55%'},
 {id:'bmw-11',src:'assets/interior.jpg',position:'50% 60%'},
 {id:'bmw-15',src:'assets/slide-15.webp',position:'50% 55%'},
 {id:'bmw-04',src:'assets/slide-4.webp',position:'50% 60%'},
 {id:'bmw-22',src:'assets/slide-22.webp',position:'50% 55%'},
 {id:'bmw-24',src:'assets/slide-24.webp',position:'50% 55%'},
 {id:'bmw-25',src:'assets/slide-25.webp',position:'50% 55%'},
 {id:'bmw-34',src:'assets/slide-34.webp',position:'50% 55%'},
].map(s=>({...s,name:catalog.find(c=>c.id===s.id).name,source:catalog.find(c=>c.id===s.id).source}));
