import {catalog} from './catalog.js';

export const slides=[
 {id:'bmw-12',code:'THE 4',src:'assets/scene-2.jpg',position:'45% 55%'},
 {id:'bmw-34',code:'THE M4',src:'assets/slide-34.webp',position:'50% 55%'},
 {id:'bmw-11',code:'THE 3',src:'assets/interior.jpg',position:'50% 60%'},
 {id:'bmw-15',code:'THE 5',src:'assets/slide-15.webp',position:'50% 55%'},
 {id:'bmw-04',code:'THE i5',src:'assets/slide-4.webp',position:'50% 60%'},
 {id:'bmw-22',code:'THE X1',src:'assets/slide-22.webp',position:'50% 55%'},
 {id:'bmw-24',code:'THE X3',src:'assets/slide-24.webp',position:'50% 55%'},
 {id:'bmw-25',code:'THE X5',src:'assets/slide-25.webp',position:'50% 55%'},
].map(s=>({...s,name:catalog.find(c=>c.id===s.id).name,source:catalog.find(c=>c.id===s.id).source}));
