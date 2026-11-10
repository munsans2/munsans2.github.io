/*
 문산중학교 3D 과학실 공통 엔진
 과학실 2·3 / 준비실도 각각의 layout.js만 작성하여 재사용할 수 있습니다.
 Three.js r128 + OrbitControls (CDN). 사진/텍스처 파일은 쓰지 않습니다.
*/
(() => {
 'use strict';
 const config = window.MUNSAN_LAB_LAYOUT;
 const $ = id => document.getElementById(id);
 if (!config || !window.THREE || !THREE.OrbitControls) {
  $('notice').style.display = 'block';
  $('notice').textContent = '3D 엔진을 불러오지 못했습니다. 인터넷 연결과 layout.js 경로를 확인하세요.';
  return;
 }
 const W=config.room.width, D=config.room.depth, H=config.room.height;
 const T=window.THREE;
 const scene=new T.Scene();scene.background=new T.Color('#eaf2fa');
 const camera=new T.PerspectiveCamera(43, innerWidth/innerHeight,.1,120);
 camera.position.set(10,10,15);
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.outputEncoding=T.sRGBEncoding;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
 renderer.setSize(innerWidth,innerHeight);
 renderer.setClearColor('#eaf2fa');
 document.body.insertBefore(renderer.domElement,document.body.firstChild);
 const orbit=new T.OrbitControls(camera,renderer.domElement);
 orbit.enableDamping=true;orbit.dampingFactor=.075;
 orbit.maxPolarAngle=Math.PI/2-.02;
 orbit.minDistance=1.25;orbit.maxDistance=36;
 orbit.target.set(0,.72,0);
 orbit.update();
 scene.add(new T.HemisphereLight(0xffffff,0xc1c9d4,1.04));
 const lamp=new T.DirectionalLight(0xffffff,.77);lamp.position.set(-7,13,10);scene.add(lamp);
 const mats={};
 const colors={floor:'#dce3e8',grid:'#cad5df',walls:'#f4f6f7',window:'#aed2e5',trim:'#c7a47c',wood:'#a97d50',woodLight:'#cba37a',white:'#eef2f4',glass:'#bfdde5',steel:'#798b9d',steelLight:'#c9d3db',counter:'#f7f8fa',chair:'#8393a3',dark:'#243549',board:'#2e725b',tablet:'#677f95',blue:'#308ddd'};
 Object.entries(colors).forEach(([k,v])=>mats[k]=new T.MeshLambertMaterial({color:v}));
 mats.glass=new T.MeshBasicMaterial({color:0xa3d5e5,transparent:true,opacity:.55,depthWrite:false,side:T.DoubleSide});
 mats.window=new T.MeshBasicMaterial({color:0xc2e4f2,transparent:true,opacity:.42,depthWrite:false,side:T.DoubleSide});
 const stage=new T.Group();scene.add(stage);
 const pickables=[];const cabinetObjects=[];const doorObjects=[];
 const itemByCab=new Map();
 for(const item of config.inventory||[]){
  if(!itemByCab.has(item.cabinet))itemByCab.set(item.cabinet,[]);
  itemByCab.get(item.cabinet).push(item);
 }
 let selected=null,transition=null,isDark=false;
 function cube(parent,w,h,d,x,y,z,m,owner){
  const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),m);
  mesh.position.set(x,y,z); parent.add(mesh);
  if(owner){mesh.userData.owner=owner;pickables.push(mesh);}
  return mesh;
 }
 function label(parent,text,x,y,z,width=1.17){
  const c=document.createElement('canvas');c.width=512;c.height=108;
  const ctx=c.getContext('2d');
  ctx.fillStyle='rgba(255,255,255,.93)';ctx.fillRect(7,8,498,92);
  ctx.strokeStyle='#bfd0df';ctx.lineWidth=5;ctx.strokeRect(7,8,498,92);
  ctx.font='bold 36px sans-serif';ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillStyle='#344a62';
  ctx.fillText(text.length>13?text.substring(0,13):text,256,54,474);
  const tex=new T.CanvasTexture(c);tex.minFilter=T.LinearFilter;
  const s=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  s.position.set(x,y,z);s.scale.set(width,.25,1);s.renderOrder=900;parent.add(s);
 }
 function segment(wall,start,end,y0,y1){
  if(end-start<=.006||y1-y0<=.006)return;
  if(wall==='left')cube(stage,.1,y1-y0,end-start,-W/2,(y0+y1)/2,(start+end)/2,mats.walls);
  if(wall==='right')cube(stage,.1,y1-y0,end-start,W/2,(y0+y1)/2,(start+end)/2,mats.walls);
  if(wall==='far')cube(stage,end-start,y1-y0,.1,(start+end)/2,(y0+y1)/2,-D/2,mats.walls);
  if(wall==='near')cube(stage,end-start,y1-y0,.1,(start+end)/2,(y0+y1)/2,D/2,mats.walls);
 }
 function makeWalls(){
  cube(stage,W,.10,D,0,-.08,0,mats.floor);
  const grid=new T.GridHelper(Math.max(W,D),Math.floor(Math.max(W,D)*2),0xcbd5df,0xcbd5df);
  grid.scale.set(W/Math.max(W,D),1,D/Math.max(W,D));grid.position.y=.004;stage.add(grid);
  // 실측되지 않은 출입구는 데이터를 기준으로 통로를 비워 두고 문틀을 만듭니다.
  for(const wall of ['left','right','far','near']){
   // near 면은 3D 내부 관찰을 위해 기본적으로 낮게 절개합니다.
   const A=wall==='left'||wall==='right'?-D/2:-W/2;
   const B=-A;
   const h=wall==='near'?1.10:wall==='left'?1.15:wall==='right'?1.05:H;
   const cuts=(config.doors||[]).filter(p=>p.wall===wall)
     .map(p=>({start:p.center-p.width/2,end:p.center+p.width/2}))
     .sort((a,b)=>a.start-b.start);
   let cursor=A;
   for(const cut of cuts){
    segment(wall,cursor,cut.start,0,h);
    cursor=Math.max(cursor,cut.end);
   }
   segment(wall,cursor,B,0,h);
   if(wall==='near'||wall==='left'||wall==='right'){
    // 컷어웨이: 실내가 막혀 보이지 않도록 벽 윗부분을 열어 둠
    // 오른쪽 창문은 아래에서 별도 얇은 유리 프레임으로 시각화
   }
  }
  // 과학실 칠판 쪽 게시판 (유리장보다 높은 곳)
  cube(stage,W*.47,.93,.065,.48,2.88,-D/2+.075,mats.board);
  cube(stage,W*.47+.10,.045,.12,.48,3.38,-D/2+.04,mats.trim);
  // 오른쪽 창문: 기존 오른쪽 벽을 시각적으로 투명창으로 보이는 구조로 표현
  const window=config.windows;
  if(window){
   for(const z of window.centers){
    cube(stage,.035,window.height,window.width,W/2-.11,window.sill+window.height/2,z,mats.window);
    for(const dz of [-window.width/2,0,window.width/2]){
     cube(stage,.09,window.height+.09,.055,W/2-.14,window.sill+window.height/2,z+dz,mats.trim);
    }
    cube(stage,.10,.07,window.width,W/2-.14,window.sill,z,mats.trim);
    cube(stage,.10,.07,window.width,W/2-.14,window.sill+window.height,z,mats.trim);
   }
  }
  // 구획벽(사물함 2개가 그 너머에 있음)
  for(const p of config.partitions||[]){
   cube(stage,p.width,p.height,p.depth,p.x,p.height/2,p.z,mats.walls);
  }
 }
 function makeDoor(door){
  const group=new T.Group();stage.add(group);
  const side=door.wall;
  if(side==='left'){group.position.set(-W/2+.08,0,door.center);group.rotation.y=Math.PI/2;}
  else if(side==='right'){group.position.set(W/2-.08,0,door.center);group.rotation.y=-Math.PI/2;}
  else if(side==='far'){group.position.set(door.center,0,-D/2+.08);group.rotation.y=0;}
  else{group.position.set(door.center,0,D/2-.08);group.rotation.y=Math.PI;}
  const w=door.width;
  cube(group,.075,2.35,.10,-w/2,1.175,0,mats.trim);
  cube(group,.075,2.35,.10,w/2,1.175,0,mats.trim);
  cube(group,w+.07,.10,.12,0,2.35,0,mats.trim);
  const pivot=new T.Group();pivot.position.set(-w/2,0,.045);group.add(pivot);
  cube(pivot,w-.08,2.22,.05,(w-.08)/2,1.14,0,mats.wood,door.id);
  cube(pivot,w*.56,1.0,.063,(w-.08)/2,1.55,.035,mats.glass,door.id);
  const node={id:door.id,name:door.label||door.id,type:'door',pivot,progress:.55,target:.55};doorObjects.push(node);
  label(group,door.label||'출입문',0,2.65,0,1.25);
 }
 function cabinet(data){
  const g=new T.Group();g.position.set(data.x,0,data.z);g.rotation.y=(data.rot||0)*Math.PI/180;stage.add(g);
  const {id,width:w,height:h,depth:d,shelves:n}=data;
  const finish=data.kind==='wood'||data.kind==='twotier'?mats.wood:data.kind==='metal2'?mats.steelLight:mats.white;
  cube(g,w,h,.055,0,h/2,-d/2,finish,id);
  cube(g,.078,h,d,-w/2,h/2,0,finish,id);
  cube(g,.078,h,d,w/2,h/2,0,finish,id);
  cube(g,w,.095,d,0,.048,0,finish,id);
  cube(g,w,.095,d,0,h-.048,0,finish,id);
  const ys=[];const shelfCount=Math.max(1,n||3);
  for(let j=1;j<shelfCount;j++){
   const sy=.05+(h-.1)*j/shelfCount;
   cube(g,w-.10,.047,d-.10,0,sy,0,data.kind==='wood'?mats.woodLight:mats.white,id);
   ys.push(sy);
  }
  const parts=[];
  if(data.kind==='wood'||data.kind==='twotier'){
   for(let i=0;i<2;i++){
    const sign=i===0?-1:1;
    const p=new T.Group();p.position.x=sign*(w/2-.035);p.position.z=d/2;g.add(p);
    cube(p,w/2-.07,h-.14,.06,-sign*(w/4-.035),h/2,0,mats.wood,id);
    cube(p,.028,.18,.070,-sign*(w/2-.13),h/2,.058,mats.steel,id);
    parts.push(p);
   }
  }else if(data.kind==='metal2'){
   // 작은 철제 수납장: 좌측 기존 목재장과 같은 방향(rot:90)
   // 위/아래 2단 서랍, 앞쪽으로 당겨 열기
   for(let j=0;j<2;j++){
    const p=new T.Group();p.position.set(0,(j+.5)*h/2,d/2);g.add(p);
    cube(p,w-.11,h/2-.04,.055,0,0,0,mats.steelLight,id);
    cube(p,.23,.027,.07,0,0,.045,mats.steel,id);
    parts.push(p);
   }
  }else if(data.kind==='drawer'){
   // 14줄/2 = 7모듈. 각 모듈에 2줄씩 보이게 2열 정면 구성
   for(let j=0;j<3;j++)for(let i=0;i<2;i++){
    const p=new T.Group();p.position.set((i-.5)*w/2,(j+.5)*h/3,d/2);g.add(p);
    cube(p,w/2-.08,h/3-.027,.055,0,0,0,mats.white,id);
    cube(p,.18,.024,.07,0,0,.04,mats.steel,id);
    parts.push(p);
   }
  }else if(data.kind==='glass'||data.kind==='tablet'){
   for(let i=0;i<2;i++){
    const p=new T.Group();p.position.set((i-.5)*w/2,0,d/2);g.add(p);
    cube(p,w/2-.06,h-.13,.036,0,h/2,0,data.kind==='tablet'?mats.tablet:mats.glass,id);
    if(data.kind==='glass'){
     cube(p,.045,h-.13,.035,-w/4+.035,h/2,.01,mats.white,id);
     cube(p,.045,h-.13,.035,w/4-.035,h/2,.01,mats.white,id);
    }
    parts.push(p);
   }
  }
  // 3D 이름 라벨
  label(g,id,0,h+.23,0,1.16);
  const frame=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(w+.15,h+.16,d+.15)),new T.LineBasicMaterial({color:0x198aff,depthTest:false}));
  frame.position.set(0,h/2,0);frame.visible=false;frame.renderOrder=15;g.add(frame);
  const highlight=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(w-.085,.10,d-.085)),new T.LineBasicMaterial({color:0xf5a623,depthTest:false}));
  highlight.visible=false;highlight.renderOrder=16;g.add(highlight);
  const obj={...data,g,parts,ys,frame,highlight,progress:0,target:0,type:'cabinet'};
  cabinetObjects.push(obj);
 }
 function makeDesks(){
  const desks=config.desks;
  for(const z of desks.rows)for(const x of desks.columns){
   const g=new T.Group();g.position.set(x,0,z);stage.add(g);
   cube(g,desks.width,.075,desks.depth,0,.80,0,mats.counter);
   for(const xx of [-desks.width*.43,desks.width*.43])for(const zz of [-desks.depth*.37,desks.depth*.37]){
    cube(g,.07,.76,.07,xx,.38,zz,mats.steel);
   }
   cube(g,desks.width*.85,.45,.055,0,.52,-desks.depth*.40,mats.white);
   for(const xx of [-desks.width*.28,desks.width*.28])for(const side of [-1,1]){
    const zc=side*desks.depth*.78;
    cube(g,.40,.06,.40,xx,.50,zc,mats.chair);
    cube(g,.40,.32,.06,xx,.70,zc+side*.17,mats.chair);
    for(const lx of [-.13,.13])for(const lz of [-.13,.13]){
     cube(g,.035,.45,.035,xx+lx,.225,zc+lz,mats.steel);
    }
   }
  }
 
  // 교사용 실험대 + 컴퓨터
  const t = config.teacher;

  if (t) {
    const p = new T.Group();
    p.position.set(t.x, 0, t.z);
    stage.add(p);

    // 기존 교사용 실험대
    cube(p, t.width, .085, t.depth,
         0, .94, 0, mats.white);

    for (const xx of [-t.width*.44, t.width*.44]) {
      for (const zz of [-t.depth*.40, t.depth*.40]) {
        cube(p, .075, .89, .075,
             xx, .45, zz, mats.steel);
      }
    }

    cube(p, t.width*.82, .52, .08,
         0, .58, -t.depth*.42, mats.white);

    // 교사용 컴퓨터
    const pcX = -Math.min(.43, t.width*.24);

    // 모니터 테두리
    cube(p, .61, .40, .065,
         pcX, 1.38, -.08, mats.dark);

    // 모니터 화면
    cube(p, .54, .33, .012,
         pcX, 1.38, -.12,
         new T.MeshBasicMaterial({
           color: 0x245477
         }));

    // 모니터 받침대
    cube(p, .045, .17, .045,
         pcX, 1.10, -.08, mats.steel);

    cube(p, .30, .025, .20,
         pcX, 1.01, -.08, mats.steelLight);

    // 키보드
    cube(p, .49, .025, .15,
         pcX, .995, .23, mats.steelLight);

    // 마우스
    cube(p, .075, .035, .12,
         pcX+.38, .995, .23, mats.white);

    // 컴퓨터 본체
    cube(p, .21, .42, .36,
         t.width*.32, .26, -.08, mats.dark);

    label(p, '교사용 컴퓨터',
          pcX, 1.84, -.08, 1.25);
  }

  // 전자칠판
  const board = new T.Group();

  // 교사 앞쪽 벽면 임시 위치
  board.position.set(
    Math.min(W/2-1.85, 2.0),
    0,
    D/2-.22
  );

  stage.add(board);

  // 전자칠판 외곽
  cube(board, 3.05, 1.76, .11,
       0, 1.93, 0, mats.dark);

  // 전자칠판 화면
  cube(board, 2.88, 1.59, .018,
       0, 1.93, -.068,
       new T.MeshBasicMaterial({
         color: 0x1b4967,
         side: T.DoubleSide
       }));

  // 화면 하단 표시선
  cube(board, 2.55, .025, .022,
       0, 1.48, -.082, mats.blue);

  label(board, '전자칠판',
        0, 3.10, 0, 1.20);
}

 function draw(){
  makeWalls();
  for(const d of config.doors||[])makeDoor(d);
  for(const c of config.cabinets||[])cabinet(c);
  for(const c of config.furniture||[])cabinet(c);
  makeDesks();
 }
 const allObjects=()=>cabinetObjects;
 const findCab=id=>cabinetObjects.find(c=>c.id===id);
 function flyTo(pos,target){
  transition={from:camera.position.clone(),to:new T.Vector3(...pos),a:orbit.target.clone(),b:new T.Vector3(...target),t:0};
 }
 const views={
  overview:{pos:[10.3,10.5,15.3],look:[0,.7,-.15]},
  left:{pos:[-7.1,4.9,6.8],look:[-3.6,1.0,0]},
  back:{pos:[.5,4.3,-1.2],look:[0,1.3,-5.9]},
  window:{pos:[7.8,4.2,3.1],look:[4,1.0,-.15]},
  top:{pos:[0,17,.01],look:[0,.1,0]}
 };
 function setView(view){
  const v=views[view];if(!v)return;
  flyTo(v.pos,v.look);
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 }
 function selectObject(obj,focusItem){
  if(!obj)return;
  if(selected)selected.frame.visible=false;
  if(selected)selected.highlight.visible=false;
  selected=obj;obj.frame.visible=true;
  const p=obj.g.position;
  const angle=(obj.rot||0)*Math.PI/180;
  const distance=obj.height>2?2.7:2.0;
  flyTo([p.x+Math.sin(angle)*distance,p.y+obj.height*.68+1.35,p.z+Math.cos(angle)*distance],[p.x,obj.height*.52,p.z]);
  $('detail').hidden=false;$('detailTitle').textContent=obj.label||obj.id;
  const verified=(itemByCab.get(obj.id)||[]);
  const contents=verified.length?verified.map(v=>v.name).join(', '):'등록된 기자재 없음';
  $('detailMeta').textContent=`관리번호 ${obj.id} · ${obj.shelves}단(임시) · ${contents} · 실측 전 배치`;
  $('shelfList').replaceChildren();
  for(let j=1;j<=obj.shelves;j++){
   const b=document.createElement('button');b.textContent=j+'단 · '+(verified.filter(v=>v.shelf===j).map(v=>v.name).join(', ')||'내부 물품 미등록');
   b.onclick=()=>markShelf(j);$('shelfList').append(b);
  }
  if(focusItem && focusItem.shelf)markShelf(focusItem.shelf);
  $('doorToggle').textContent=obj.target>0.3?'문 닫기':'보관장 문 열기';
 }
 function markShelf(j){
  if(!selected)return;
  selected.highlight.visible=true;
  const ys=[.06,...selected.ys,selected.height-.06];
  selected.highlight.position.set(0,(ys[j-1]+ys[j])/2,0);
  Array.from($('shelfList').children).forEach((b,i)=>b.classList.toggle('active',i===j-1));
 }
 function search(){
  const q=$('search').value.trim().toLowerCase();
  const candidates=allObjects().filter(c=>!q||[c.id,c.label,c.verifiedContents||''].some(s=>String(s).toLowerCase().includes(q))||
    (itemByCab.get(c.id)||[]).some(i=>[i.name,...(i.keywords||[])].some(word=>word.toLowerCase().includes(q))));
  $('results').replaceChildren();
  for(const c of candidates){
   const b=document.createElement('button');const strong=document.createElement('strong');strong.textContent=c.label||c.id;
   const sm=document.createElement('small');sm.textContent=c.id+' · '+((itemByCab.get(c.id)||[]).map(i=>i.name).join(', ')||'위치 확인용 보관장');
   b.append(strong,sm);b.onclick=()=>{const i=(itemByCab.get(c.id)||[])[0];selectObject(c,i);};$('results').append(b);
  }
  if(!candidates.length){const no=document.createElement('p');no.textContent='일치하는 보관장이 없습니다.';$('results').append(no);}
 }
 function toggleDoor(obj){obj.target=obj.target>.5?0:1;
  if(selected===obj)$('doorToggle').textContent=obj.target?'문 닫기':'보관장 문 열기';}
 function animateDoors(dt){
  const speed=Math.min(1,dt*7);
  for(const c of cabinetObjects){
   c.progress+=(c.target-c.progress)*speed;
   if(c.kind==='wood'||c.kind==='twotier'){
    c.parts.forEach((p,i)=>p.rotation.y=(i===0?1:-1)*1.35*c.progress);
   }else if(c.kind==='glass'||c.kind==='tablet'){
    c.parts.forEach((p,i)=>p.position.x=(i-.5)*c.width/2 + (i===0?1:-1)*c.width*.40*c.progress);
   }else if(c.kind==='drawer'||c.kind==='metal2'){
    c.parts.forEach(p=>p.position.z=c.depth/2+c.progress*.38);
   }
  }
  for(const d of doorObjects){d.progress+=(d.target-d.progress)*speed;d.pivot.rotation.y=-d.progress*1.25;}
 }
 function interactions(){
  $('search').addEventListener('input',search);
  $('detailClose').onclick=()=>{$('detail').hidden=true;if(selected){selected.frame.visible=false;selected.highlight.visible=false;}selected=null;};
  $('doorToggle').onclick=()=>{if(selected)toggleDoor(selected);};
  for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>setView(b.dataset.view);
  $('reset').onclick=()=>setView('overview');
  $('fullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();
  $('theme').onclick=()=>{isDark=!isDark;document.body.classList.toggle('dark',isDark);scene.background.set(isDark?'#152131':'#eaf2fa');$('theme').textContent=isDark?'☀ 주간 모드':'🌙 야간 모드';};
  const raycaster=new T.Raycaster();const pointer=new T.Vector2();let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
  renderer.domElement.addEventListener('pointerup',e=>{
   if(!down)return;
   const dd=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;
   if(dd>6)return;
   pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);
   raycaster.setFromCamera(pointer,camera);
   const hit=raycaster.intersectObjects(pickables,false)[0];
   if(!hit)return;
   const id=hit.object.userData.owner;
   const cab=findCab(id);
   if(cab){selectObject(cab);return;}
   const door=doorObjects.find(o=>o.id===id);
   if(door)door.target=door.target>.5?0:1;
  });
  addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
 }
 const clock=new T.Clock();
 function frame(){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,clock.getDelta());
  animateDoors(dt);
  if(transition){
   transition.t=Math.min(1,transition.t+dt*1.7);
   const r=1-(1-transition.t)**3;
   camera.position.copy(transition.from).lerp(transition.to,r);
   orbit.target.copy(transition.a).lerp(transition.b,r);
   if(transition.t>=1)transition=null;
  }
  orbit.update();renderer.render(scene,camera);
 }
 draw();interactions();search();frame();
})();
