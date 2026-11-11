
/*
 문산중학교 과학준비실 기자재 3D
 파일: prep/contents.js
 기존 layout.js와 common/scene.js 수정 불필요
*/
(() => {
 'use strict';

 const T = window.THREE;
 const L = window.MUNSAN_LAB_LAYOUT;

 const status = window.MUNSAN_PREP_STATUS = {
  loaded: false,
  count: 0,
  recognized: [],
  missing: [],
  errors: []
 };

 if (!T || !T.Object3D || !L || !L.room) {
  status.errors.push(
   'Three.js 또는 prep/layout.js가 로드되지 않았습니다.'
  );
  console.error('[준비실]', status.errors[0]);
  return;
 }

 const norm = x =>
  String(x ?? '')
   .toUpperCase()
   .replace(/[^A-Z0-9]/g, '');

 const cabs = [
  ...(L.cabinets || []),
  ...(L.furniture || [])
 ];

 const byId = new Map(
  cabs.map(c => [norm(c.id), c])
 );

 const get = id => byId.get(norm(id));

 // P-F01, P-F02 위치 교체
 const f1 = get('P-F01');
 const f2 = get('P-F02');

 if (f1 && f2) {
  for (const key of ['x', 'z', 'rot']) {
   const temp = f1[key];
   f1[key] = f2[key];
   f2[key] = temp;
  }
 } else {
  status.errors.push(
   'P-F01/P-F02 위치 교체 대상 중 하나를 찾지 못함'
  );
 }

 // 기자재 등록
 const data = [];

 const push = (
  id, shelves, names,
  quantity = null, unit = '개'
 ) => {
  const c = get(id);

  if (!c) {
   if (!status.missing.includes(id)) {
    status.missing.push(id);
   }
   return;
  }

  if (!status.recognized.includes(c.id)) {
   status.recognized.push(c.id);
  }

  for (const name of names) {
   data.push({
    cabinet: c.id,
    name,
    ...(shelves.length === 1
     ? { shelf: shelves[0] }
     : { shelves: [...shelves] }),
    quantity,
    unit,
    keywords: []
   });
  }
 };

 // 선반 미지정 물품은 위쪽부터 임시 배치
 const auto = (id, names) => {
  const c = get(id);

  if (!c) {
   if (!status.missing.includes(id)) {
    status.missing.push(id);
   }
   return;
  }

  const n = Math.max(1, Number(c.shelves) || 3);

  for (let i = 0; i < names.length; i++) {
   push(id, [n - (i % n)], [names[i]]);
  }
 };

 auto('P-L01', [
  '뷰렛', '분무기', '바둑'
 ]);

 auto('P-L02', [
  '비커', '매스실린더', '유리기구'
 ]);

 auto('P-R01', [
  '거울', '검전기', '단진자실험'
 ]);

 auto('P-R02', [
  '나침판', '전압계',
  '전류계', '보일법칙실험기'
 ]);

 auto('P-R03', [
  '전등', '연직분포실험기',
  '수면파투영장치'
 ]);

 if (f1) {
  f1.shelves = Math.max(
   3, Number(f1.shelves) || 0
  );
 }

 push('P-F01', [1, 2], ['실험복']);
 push('P-F01', [3], ['조리기구']);
 auto('P-F02', ['실험키트']);

 const labels = {
  'P-L01': '뷰렛·분무기·바둑',
  'P-L02': '비커·매스실린더·유리기구',
  'P-R01': '거울·검전기·단진자',
  'P-R02': '나침판·전압계·보일법칙',
  'P-R03': '전등·연직분포·수면파',
  'P-F01': '실험복·조리기구',
  'P-F02': '실험키트'
 };

 for (const c of cabs) {
  const id = norm(c.id)
   .replace(/^P([LRF])/, 'P-$1');

  if (labels[id]) c.label = labels[id];
 }

 const modified = new Set(
  data.map(x => norm(x.cabinet))
 );

 L.inventory = (
  Array.isArray(L.inventory) ? L.inventory : []
 ).filter(
  x => !modified.has(norm(x.cabinet))
 ).concat(data);

 status.loaded = true;

 // 3D 기본 도형
 const originalAdd = T.Object3D.prototype.add;
 const done = new Set();

 const mat = (hex, trans = false) =>
  new T.MeshLambertMaterial({
   color: hex,
   transparent: trans,
   opacity: trans ? .56 : 1,
   depthWrite: !trans,
   side: trans ? T.DoubleSide : T.FrontSide
  });

 const M = {
  white: mat(0xf2f6fa),
  navy: mat(0x22384c),
  blue: mat(0x3689cf),
  cyan: mat(0x8acbdc),
  steel: mat(0x9baab7),
  red: mat(0xe15d6b),
  green: mat(0x5fb797),
  yellow: mat(0xf3d46c),
  orange: mat(0xe6a051),
  wood: mat(0xb39472),
  cream: mat(0xf1e2c9),
  glass: mat(0x9cd9e9, true),
  black: mat(0x24313a)
 };

 function mesh(p, geo, m, x, y, z) {
  const o = new T.Mesh(geo, m);
  o.position.set(x, y, z);
  originalAdd.call(p, o);
  return o;
 }

 const box = (p, w, h, d, x, y, z, m) =>
  mesh(
   p, new T.BoxGeometry(w, h, d),
   m, x, y, z
  );

 const cyl = (p, r, h, x, y, z, m) =>
  mesh(
   p, new T.CylinderGeometry(r, r, h, 14),
   m, x, y, z
  );

 const ball = (p, r, x, y, z, m) =>
  mesh(
   p, new T.SphereGeometry(r, 12, 10),
   m, x, y, z
  );

 const torus = (p, r, t, x, y, z, m) =>
  mesh(
   p, new T.TorusGeometry(r, t, 7, 20),
   m, x, y, z
  );

 function group(p) {
  const g = new T.Group();
  originalAdd.call(p, g);
  return g;
 }

 // 기자재 종류별 모형
 function make(p, name) {

  if (/실험복/.test(name)) {
   for (let i = -1; i <= 1; i++) {
    const x = i * .22;

    box(p, .16, .29, .055,
     x, .19, 0, M.white);

    const l = box(p, .055, .19, .055,
     x - .10, .24, 0, M.cyan);
    l.rotation.z = -.25;

    const r = box(p, .055, .19, .055,
     x + .10, .24, 0, M.cyan);
    r.rotation.z = .25;
   }
   box(p, .73, .016, .02,
    0, .43, 0, M.steel);

  } else if (/뷰렛/.test(name)) {
   box(p, .30, .03, .20,
    0, .02, 0, M.navy);
   cyl(p, .012, .43,
    0, .28, 0, M.glass);
   cyl(p, .016, .33,
    .12, .19, 0, M.steel);
   box(p, .22, .016, .018,
    .01, .38, 0, M.steel);
   box(p, .11, .015, .03,
    0, .10, .03, M.red);

  } else if (/분무기/.test(name)) {
   cyl(p, .10, .27,
    0, .14, 0, M.cyan);
   cyl(p, .044, .08,
    0, .32, 0, M.white);
   box(p, .19, .055, .085,
    .06, .39, 0, M.white);
   box(p, .11, .025, .03,
    .17, .40, 0, M.blue);

  } else if (/바둑/.test(name)) {
   box(p, .42, .04, .32,
    0, .04, 0, M.wood);

   for (let i = -3; i <= 3; i++) {
    box(p, .004, .003, .29,
     i * .048, .064, 0, M.navy);

    box(p, .39, .003, .004,
     0, .064, i * .042, M.navy);
   }

   for (let i = 0; i < 6; i++) {
    cyl(p, .018, .008,
     ((i % 3) - 1) * .11,
     .074,
     (Math.floor(i / 3) - .5) * .16,
     i % 2 ? M.black : M.white);
   }

  } else if (/비커/.test(name)) {
   cyl(p, .12, .28,
    0, .15, 0, M.glass);
   cyl(p, .11, .009,
    0, .05, 0, M.blue);

  } else if (/매스실린더/.test(name)) {
   cyl(p, .055, .42,
    0, .22, 0, M.glass);
   cyl(p, .11, .02,
    0, .02, 0, M.steel);

  } else if (/유리기구/.test(name)) {
   for (let i = -1; i <= 1; i++) {
    cyl(p, .06, .23 + (i + 1) * .05,
     i * .12, .16, 0, M.glass);
   }

  } else if (/거울/.test(name)) {
   box(p, .35, .31, .02,
    0, .26, 0, M.navy);
   box(p, .30, .26, .01,
    0, .26, .02, M.glass);
   cyl(p, .014, .17,
    0, .09, 0, M.steel);
   box(p, .35, .02, .22,
    0, .02, 0, M.wood);

  } else if (/검전기/.test(name)) {
   cyl(p, .11, .33,
    0, .21, 0, M.glass);
   cyl(p, .009, .34,
    0, .34, 0, M.steel);
   ball(p, .05,
    0, .51, 0, M.red);
   box(p, .025, .15, .015,
    .02, .15, 0, M.yellow);

  } else if (/단진자/.test(name)) {
   box(p, .40, .025, .25,
    0, .02, 0, M.navy);

   for (const x of [-.17, .17]) {
    cyl(p, .012, .43,
     x, .25, 0, M.steel);
   }

   box(p, .37, .015, .02,
    0, .46, 0, M.steel);

   const wire = box(
    p, .006, .30, .006,
    .05, .28, 0, M.steel
   );
   wire.rotation.z = .3;

   ball(p, .055,
    .1, .12, 0, M.blue);

  } else if (/나침판/.test(name)) {
   cyl(p, .15, .07,
    0, .06, 0, M.navy);
   cyl(p, .135, .008,
    0, .10, 0, M.cream);

   const arrow = box(
    p, .24, .008, .035,
    0, .115, 0, M.red
   );
   arrow.rotation.y = .6;

  } else if (/전압계|전류계/.test(name)) {
   box(p, .38, .25, .22,
    0, .13, 0, M.white);
   box(p, .25, .12, .015,
    0, .19, .12, M.cream);

   const d = cyl(
    p, .073, .009,
    0, .20, .133, M.steel
   );
   d.rotation.x = Math.PI / 2;

   box(p, .05, .04, .018,
    -.11, .055, .12, M.red);
   box(p, .05, .04, .018,
    .11, .055, .12, M.black);

  } else if (/보일/.test(name)) {
   box(p, .39, .03, .25,
    0, .02, 0, M.navy);
   cyl(p, .046, .35,
    -.08, .23, 0, M.glass);
   cyl(p, .03, .27,
    -.08, .34, 0, M.steel);

   const gauge = cyl(
    p, .09, .025,
    .13, .23, 0, M.steel
   );
   gauge.rotation.x = Math.PI / 2;

  } else if (/전등/.test(name)) {
   box(p, .34, .03, .23,
    0, .02, 0, M.navy);
   cyl(p, .025, .15,
    0, .12, 0, M.steel);
   ball(p, .10,
    0, .27, 0, M.yellow);

  } else if (/연직분포/.test(name)) {
   box(p, .36, .025, .24,
    0, .02, 0, M.navy);
   cyl(p, .014, .43,
    0, .25, 0, M.steel);

   for (let i = 0; i < 4; i++) {
    box(p, .23, .04, .09,
     0, .12 + i * .085, 0,
     [M.blue, M.green, M.orange, M.red][i]);
   }

  } else if (/수면파/.test(name)) {
   box(p, .43, .07, .29,
    0, .05, 0, M.navy);
   box(p, .38, .01, .24,
    0, .09, 0, M.cyan);

   for (let i = 0; i < 3; i++) {
    const ring = torus(
     p, .04 + i * .04, .006,
     0, .106, 0, M.white
    );
    ring.rotation.x = -Math.PI / 2;
   }

   box(p, .02, .30, .02,
    -.16, .25, -.09, M.steel);

  } else if (/조리기구/.test(name)) {
   box(p, .38, .03, .24,
    0, .02, 0, M.wood);
   cyl(p, .12, .10,
    -.07, .08, 0, M.steel);
   box(p, .20, .025, .035,
    .1, .09, 0, M.black);
   cyl(p, .025, .28,
    .15, .18, -.06, M.steel);

  } else {
   // 실험키트
   box(p, .35, .18, .25,
    0, .10, 0, M.navy);
   box(p, .36, .025, .26,
    0, .20, 0, M.blue);
   box(p, .15, .02, .025,
    0, .10, .14, M.steel);
  }
 }

 // 보관장 선반별 배치
 function populate(parent, c) {
  const items = data.filter(
   it => norm(it.cabinet) === norm(c.id)
  );

  if (!items.length) return;

  const n = Math.max(
   1, Number(c.shelves) || 3
  );

  const step = (Number(c.height) - .10) / n;
  const W = Math.max(.14, Number(c.width) - .16);
  const D = Math.max(.14, Number(c.depth) - .16);

  for (let s = 1; s <= n; s++) {
   const inShelf = items.filter(
    it => Array.isArray(it.shelves)
     ? it.shelves.map(Number).includes(s)
     : Number(it.shelf) === s
   );

   if (!inShelf.length) continue;

   const cols = Math.min(3, inShelf.length);
   const rowN = Math.ceil(inShelf.length / cols);
   const cellW = W / cols;
   const cellD = D / rowN;

   inShelf.forEach((it, i) => {
    const o = group(parent);

    const naturalW = /실험복/.test(it.name)
     ? .76 : .45;

    const scale = Math.max(
     .15,
     Math.min(
      1.1,
      cellW / naturalW * .9,
      cellD / .34 * .9,
      Math.max(.12, step - .09) / .50
     )
    );

    o.scale.setScalar(scale);

    o.position.set(
     -W / 2 + cellW * (i % cols + .5),
     .085 + (s - 1) * step,
     -D / 2 +
      cellD * (Math.floor(i / cols) + .5)
    );

    o.userData.prepItem = it.name;
    make(o, it.name);
    status.count++;
   });
  }
 }

 // 공통 엔진이 보관장 번호 Sprite를
 // 생성하는 시점에 준비실 모형만 추가
 T.Object3D.prototype.add = function (...objects) {
  const result = originalAdd.apply(this, objects);

  if (
   done.size >= cabs.length ||
   !objects.some(o => o && o.isSprite) ||
   !this.parent ||
   !this.parent.isGroup ||
   this.children.length < 5
  ) {
   return result;
  }

  const c = cabs.find(v =>
   !done.has(norm(v.id)) &&
   Math.abs(this.position.x - Number(v.x)) < .002 &&
   Math.abs(this.position.z - Number(v.z)) < .002 &&
   Math.abs(this.position.y) < .002 &&
   Math.abs(
    this.rotation.y -
    (Number(v.rot) || 0) * Math.PI / 180
   ) < .002
  );

  if (!c) return result;

  done.add(norm(c.id));

  try {
   populate(this, c);
  } catch (e) {
   status.errors.push(c.id + ': ' + e.message);
   console.error('[준비실]', c.id, e);
  }

  if (done.size >= cabs.length) {
   T.Object3D.prototype.add = originalAdd;

   const hint = document.getElementById('hint');

   if (hint) {
    hint.textContent +=
     ' · 준비실 모형 ' + status.count + '개';
   }
  }

  return result;
 };

 console.info(
  '[준비실] 배치 ID:', L.id,
  '등록 보관장:', status.recognized,
  '없는 번호:', status.missing,
  '기자재:', data.length
 );
})();
