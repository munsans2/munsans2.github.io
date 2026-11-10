
/*
 문산중학교 과학실 공통 3D 엔진
 Three.js r128 + OrbitControls

 - 과학실 1·2·3 기존 layout.js 사용
 - 기자재 검색 및 보관장 이동
 - 과학실 1 기자재 3D 모형 표시
 - 과학실 2 MBL 센서 7종, 케이스 5개 유지
 - 보관장 문 열기/닫기
 - 선반 및 전체 기자재 목록 표시
 - 교실, 실험대, 교사용 컴퓨터, 전자칠판 유지
*/

(() => {
  'use strict';

  const cfg = window.MUNSAN_LAB_LAYOUT;
  const $ = id => document.getElementById(id);

  if (!cfg || !window.THREE || !THREE.OrbitControls) {
    const notice = $('notice');
    if (notice) {
      notice.style.display = 'block';
      notice.textContent = '3D 엔진을 불러오지 못했습니다.';
    }
    return;
  }

  const T = THREE;
  const W = cfg.room.width;
  const D = cfg.room.depth;
  const H = cfg.room.height;

  const scene = new T.Scene();
  scene.background = new T.Color('#eaf2fa');

  const camera = new T.PerspectiveCamera(
    43, innerWidth / innerHeight, 0.1, 120
  );
  camera.position.set(10.3, 10.5, 15.3);

  const renderer = new T.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  });

  renderer.outputEncoding = T.sRGBEncoding;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  document.body.insertBefore(renderer.domElement, document.body.firstChild);

  const orbit = new T.OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.075;
  orbit.maxPolarAngle = Math.PI / 2 - 0.02;
  orbit.minDistance = 1.5;
  orbit.maxDistance = 36;
  orbit.target.set(0, 0.72, 0);
  orbit.update();

  scene.add(new T.HemisphereLight(0xffffff, 0xc1c9d4, 1.04));

  const lamp = new T.DirectionalLight(0xffffff, 0.77);
  lamp.position.set(-7, 13, 10);
  scene.add(lamp);

  const mat = color => new T.MeshLambertMaterial({color});

  const m = {
    floor: mat('#dce3e8'),
    wall: mat('#f4f6f7'),
    trim: mat('#c7a47c'),
    wood: mat('#a97d50'),
    woodLight: mat('#cba37a'),
    white: mat('#eef2f4'),
    steel: mat('#798b9d'),
    steelLight: mat('#c9d3db'),
    counter: mat('#f7f8fa'),
    chair: mat('#8393a3'),
    dark: mat('#243549'),
    board: mat('#2e725b'),
    tablet: mat('#677f95'),
    blue: mat('#308ddd'),
    red: mat('#d35c58'),
    green: mat('#58a887'),
    yellow: mat('#e8bd58'),
    purple: mat('#a38bc9'),
    orange: mat('#e4a36c'),
    paper: mat('#f8f4e9'),
    black: mat('#303b48')
  };

  m.glass = new T.MeshBasicMaterial({
    color: 0xa3d5e5,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    side: T.DoubleSide
  });

  m.window = new T.MeshBasicMaterial({
    color: 0xc2e4f2,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    side: T.DoubleSide
  });

  const stage = new T.Group();
  scene.add(stage);

  const pickables = [];
  const cabinets = [];
  const doors = [];
  const itemByCab = new Map();

  for (const item of cfg.inventory || []) {
    if (!itemByCab.has(item.cabinet)) {
      itemByCab.set(item.cabinet, []);
    }
    itemByCab.get(item.cabinet).push(item);
  }

  let selected = null;
  let transition = null;
  let isDark = false;

  // ==========================================
  // 기본 3D 도형
  // ==========================================

  function cube(parent, w, h, d, x, y, z, material, owner) {
    const mesh = new T.Mesh(
      new T.BoxGeometry(w, h, d),
      material
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);

    if (owner) {
      mesh.userData.owner = owner;
      pickables.push(mesh);
    }
    return mesh;
  }

  function cylinder(parent, rt, rb, h, x, y, z, material, sides = 12) {
    const mesh = new T.Mesh(
      new T.CylinderGeometry(rt, rb, h, sides),
      material
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function sphere(parent, r, x, y, z, material) {
    const mesh = new T.Mesh(
      new T.SphereGeometry(r, 12, 8),
      material
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function label(parent, text, x, y, z, width = 1.17) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 108;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,.93)';
    ctx.fillRect(7, 8, 498, 92);
    ctx.strokeStyle = '#bfd0df';
    ctx.lineWidth = 5;
    ctx.strokeRect(7, 8, 498, 92);
    ctx.font = 'bold 36px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#344a62';
    ctx.fillText(String(text).slice(0, 22), 256, 54, 474);

    const texture = new T.CanvasTexture(canvas);
    texture.minFilter = T.LinearFilter;

    const sprite = new T.Sprite(
      new T.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      })
    );

    sprite.position.set(x, y, z);
    sprite.scale.set(width, 0.25, 1);
    sprite.renderOrder = 900;
    parent.add(sprite);
    return sprite;
  }

  // ==========================================
  // 교실 벽, 출입문, 창문
  // ==========================================

  function wallSegment(wall, a, b, y0, y1) {
    if (b - a <= 0.006 || y1 - y0 <= 0.006) return;

    if (wall === 'left' || wall === 'right') {
      cube(
        stage, .1, y1-y0, b-a,
        wall === 'left' ? -W/2 : W/2,
        (y0+y1)/2, (a+b)/2, m.wall
      );
    } else {
      cube(
        stage, b-a, y1-y0, .1,
        (a+b)/2, (y0+y1)/2,
        wall === 'far' ? -D/2 : D/2,
        m.wall
      );
    }
  }

  function makeWalls() {
    cube(stage, W, .1, D, 0, -.08, 0, m.floor);

    const size = Math.max(W, D);
    const grid = new T.GridHelper(
      size, Math.floor(size*2), 0xcbd5df, 0xcbd5df
    );
    grid.scale.set(W/size, 1, D/size);
    grid.position.y = .004;
    stage.add(grid);

    for (const wall of ['left','right','far','near']) {
      const A = wall === 'left' || wall === 'right' ? -D/2 : -W/2;
      const B = -A;
      const height =
        wall === 'near' ? 1.10 :
        wall === 'left' ? 1.15 :
        wall === 'right' ? 1.05 : H;

      const cuts = (cfg.doors || [])
        .filter(p => p.wall === wall)
        .map(p => ({
          start: p.center - p.width/2,
          end: p.center + p.width/2
        }))
        .sort((a,b) => a.start-b.start);

      let cursor = A;
      for (const cut of cuts) {
        wallSegment(wall, cursor, cut.start, 0, height);
        cursor = Math.max(cursor, cut.end);
      }
      wallSegment(wall, cursor, B, 0, height);
    }

    cube(stage, W*.47, .93, .065,
      .48, 2.88, -D/2+.075, m.board);

    cube(stage, W*.47+.1, .045, .12,
      .48, 3.38, -D/2+.04, m.trim);

    const win = cfg.windows;
    if (win) {
      for (const z of win.centers || []) {
        cube(stage, .035, win.height, win.width,
          W/2-.11, win.sill+win.height/2, z, m.window);

        for (const dz of [-win.width/2, 0, win.width/2]) {
          cube(stage, .09, win.height+.09, .055,
            W/2-.14, win.sill+win.height/2, z+dz, m.trim);
        }

        for (const y of [win.sill, win.sill+win.height]) {
          cube(stage, .1, .07, win.width,
            W/2-.14, y, z, m.trim);
        }
      }
    }

    for (const p of cfg.partitions || []) {
      cube(stage, p.width, p.height, p.depth,
        p.x, p.height/2, p.z, m.wall);
    }
  }

  function makeDoor(door) {
    const g = new T.Group();
    stage.add(g);

    if (door.wall === 'left') {
      g.position.set(-W/2+.08, 0, door.center);
      g.rotation.y = Math.PI/2;
    } else if (door.wall === 'right') {
      g.position.set(W/2-.08, 0, door.center);
      g.rotation.y = -Math.PI/2;
    } else if (door.wall === 'far') {
      g.position.set(door.center, 0, -D/2+.08);
    } else {
      g.position.set(door.center, 0, D/2-.08);
      g.rotation.y = Math.PI;
    }

    const w = door.width;
    cube(g, .075, 2.35, .1, -w/2, 1.175, 0, m.trim);
    cube(g, .075, 2.35, .1, w/2, 1.175, 0, m.trim);
    cube(g, w+.07, .1, .12, 0, 2.35, 0, m.trim);

    const pivot = new T.Group();
    pivot.position.set(-w/2, 0, .045);
    g.add(pivot);

    cube(pivot, w-.08, 2.22, .05,
      (w-.08)/2, 1.14, 0, m.wood, door.id);

    cube(pivot, w*.56, 1, .063,
      (w-.08)/2, 1.55, .035, m.glass, door.id);

    doors.push({
      id: door.id,
      pivot,
      progress: .55,
      target: .55
    });

    label(g, door.label || '출입문', 0, 2.65, 0, 1.25);
  }

  // ==========================================
  // 기자재 3D 모형
  // ==========================================

  function makeItemModel(parent, item, x, y, z, scale) {
    const g = new T.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(scale);
    parent.add(g);

    const name = String(item.name || '');
    const has = word => name.toLowerCase().includes(word.toLowerCase());

    // 현미경
    if (has('현미경')) {
      cube(g, .22, .035, .19, 0, .018, 0, m.dark);
      cube(g, .045, .23, .045, .06, .15, -.04, m.steel);
      cube(g, .15, .025, .13, -.015, .15, .025, m.steelLight);
      cylinder(g, .035, .035, .18, -.06, .29, -.04, m.black);
      cylinder(g, .045, .045, .035, -.06, .39, -.04, m.dark);
      sphere(g, .055, .08, .24, -.04, m.white);
    }

    // 전자저울 / 접시저울
    else if (has('저울')) {
      cube(g, .28, .08, .23, 0, .04, 0, m.steelLight);
      cube(g, .14, .035, .025, 0, .055, .12, m.blue);
      cylinder(g, .105, .105, .015, 0, .09, -.02, m.steel);
      if (!has('전자')) {
        cylinder(g, .012, .012, .20, 0, .19, -.02, m.steel);
        cube(g, .30, .025, .025, 0, .29, -.02, m.dark);
      }
    }

    // 플라스크
    else if (has('플라스크')) {
      const round = has('둥근바닥');
      if (round) {
        sphere(g, .105, 0, .12, 0, m.glass);
      } else {
        cylinder(g, .035, .11, .19, 0, .11, 0, m.glass);
      }
      cylinder(g, .035, .035, .10, 0, .26, 0, m.glass);
      cylinder(g, .044, .044, .015, 0, .32, 0, m.steelLight);
      if (has('가지달린')) {
        const branch = cylinder(g, .014, .014, .13,
          .09, .25, 0, m.glass);
        branch.rotation.z = Math.PI/2;
      }
    }

    // 비커
    else if (has('비커')) {
      cylinder(g, .105, .095, .22, 0, .12, 0, m.glass);
      cylinder(g, .11, .11, .015, 0, .23, 0, m.steelLight);
    }

    // 매스실린더
    else if (has('매스실린더')) {
      cube(g, .14, .025, .14, 0, .013, 0, m.steelLight);
      cylinder(g, .042, .042, .31, 0, .17, 0, m.glass);
    }

    // 시험관
    else if (has('시험관')) {
      cube(g, .28, .025, .12, 0, .02, 0, m.wood);
      for (const xx of [-.09, 0, .09]) {
        cylinder(g, .025, .025, .25, xx, .15, 0, m.glass);
      }
    }

    // 페트리접시
    else if (has('페트리접시')) {
      for (let i=0; i<3; i++) {
        cylinder(g, .12, .12, .035, 0, .025+i*.045, 0, m.glass);
      }
    }

    // 집기병
    else if (has('집기병')) {
      cylinder(g, .085, .085, .24, 0, .13, 0, m.glass);
      cylinder(g, .10, .10, .018, 0, .26, 0, m.steelLight);
    }

    // 깔때기
    else if (has('깔때기')) {
      cylinder(g, .12, .025, .13, 0, .23, 0, m.glass);
      cylinder(g, .018, .018, .15, 0, .10, 0, m.glass);
    }

    // 실험복
    else if (has('실험복')) {
      cube(g, .23, .36, .045, 0, .22, 0, m.white);
      cube(g, .095, .27, .045, -.16, .23, 0, m.white);
      cube(g, .095, .27, .045, .16, .23, 0, m.white);
      cube(g, .025, .30, .015, 0, .22, .03, m.steelLight);
      cube(g, .10, .035, .02, 0, .41, 0, m.white);
    }

    // 태블릿
    else if (has('갤럭시탭') || has('태블릿')) {
      cube(g, .22, .31, .022, 0, .17, 0, m.dark);
      cube(g, .19, .27, .025, 0, .17, .013, m.blue);
      cube(g, .08, .02, .012, 0, .045, .03, m.steelLight);
    }

    // 핫플레이트
    else if (has('핫플레이트')) {
      cube(g, .29, .075, .25, 0, .04, 0, m.white);
      cylinder(g, .095, .095, .012, 0, .085, 0, m.dark);
      cylinder(g, .018, .018, .025, .11, .045, .125, m.red);
    }

    // 온도계
    else if (has('온도계')) {
      cube(g, .075, .28, .055, 0, .15, 0, m.white);
      cube(g, .045, .075, .012, 0, .20, .035, m.blue);
      cylinder(g, .012, .012, .10, 0, .34, 0, m.steel);
    }

    // 보안경
    else if (has('보안경')) {
      cube(g, .28, .075, .055, 0, .14, 0, m.glass);
      cube(g, .025, .09, .07, -.15, .14, 0, m.dark);
      cube(g, .025, .09, .07, .15, .14, 0, m.dark);
    }

    // 구급함
    else if (has('구급함')) {
      cube(g, .28, .23, .16, 0, .12, 0, m.white);
      cube(g, .055, .14, .012, 0, .13, .09, m.red);
      cube(g, .14, .055, .012, 0, .13, .095, m.red);
      cube(g, .10, .035, .05, 0, .25, 0, m.steel);
    }

    // 소방포
    else if (has('소방포')) {
      cube(g, .24, .22, .08, 0, .12, 0, m.red);
      cube(g, .16, .035, .015, 0, .17, .048, m.white);
    }

    // 장갑
    else if (has('장갑')) {
      for (const xx of [-.09, .09]) {
        cube(g, .12, .18, .035, xx, .13, 0, m.blue);
        for (let i=0; i<4; i++) {
          cube(g, .024, .09, .028,
            xx-.04+i*.027, .25, 0, m.blue);
        }
      }
    }

    // 색연필
    else if (has('색연필')) {
      for (let i=0; i<7; i++) {
        const palette = [
          m.red, m.orange, m.yellow, m.green,
          m.blue, m.purple, m.wood
        ];
        cylinder(g, .012, .012, .27,
          -.105+i*.035, .15, 0, palette[i], 6);
      }
    }

    // 실험키트
    else if (has('실험키트') || has('키트')) {
      cube(g, .31, .15, .23, 0, .08, 0, m.blue);
      cube(g, .31, .025, .23, 0, .17, 0, m.steelLight);
      cube(g, .12, .035, .025, 0, .09, .13, m.dark);
    }

    // 기타 기자재: 보관 상자 모형
    else {
      const palette = [
        m.blue, m.green, m.orange, m.purple,
        m.yellow, m.steelLight
      ];
      const hash = Array.from(name).reduce(
        (sum, c) => sum + c.charCodeAt(0), 0
      );
      const color = palette[hash % palette.length];

      cube(g, .27, .15, .21, 0, .08, 0, color);
      cube(g, .27, .025, .21, 0, .17, 0, m.white);
      cube(g, .14, .035, .012, 0, .10, .113, m.paper);
    }

    // 기자재 모형 클릭 시 보관장 선택
    g.traverse(obj => {
      if (obj.isMesh) {
        obj.userData.itemName = name;
      }
    });

    return g;
  }

  // ==========================================
  // 과학실 1 기자재 자동 배치
  // ==========================================

  function makeInventoryContents(group, data) {
    const items = itemByCab.get(data.id) || [];
    if (!items.length) return;

    const n = Math.max(1, data.shelves || 3);
    const h = data.height;
    const w = data.width;
    const d = data.depth;

    const shelfHeight = (h-.10)/n;

    // 표시용 모형은 수납장 내부 공간에 맞춰 축소
    const scale = Math.min(
      1,
      Math.max(.36, w/.95),
      Math.max(.36, shelfHeight/.45)
    );

    const slots = Array.from({length:n}, () => []);

    items.forEach((item, index) => {
      let shelf = Number(item.shelf);

      if (!Number.isInteger(shelf) || shelf < 1 || shelf > n) {
        shelf = index % n + 1;
      }

      slots[shelf-1].push(item);
    });

    slots.forEach((list, shelfIndex) => {
      if (!list.length) return;

      const baseY = .075 + shelfIndex*shelfHeight;
      const columns = Math.min(4, list.length);
      const rows = Math.ceil(list.length/columns);

      list.forEach((item, index) => {
        const col = index % columns;
        const row = Math.floor(index/columns);

        const x = columns === 1
          ? 0
          : -w*.35 + col*(w*.70/(columns-1));

        const z = rows === 1
          ? 0
          : -d*.22 + row*(d*.44/Math.max(1,rows-1));

        const countScale = Math.min(
          1,
          3/Math.max(3, list.length)
        );

        makeItemModel(
          group,
          item,
          x,
          baseY,
          z,
          scale*countScale
        );
      });
    });
  }

  // ==========================================
  // 과학실 2 MBL 센서 전용 모형
  // ==========================================

  function makeMBLContents(group, data) {
    const h = data.height;
    const step = (h-.10)/4;
    const y3 = .05 + step*2 + .04;
    const y4 = .05 + step*3 + .04;

    function addCase(x,y,z,scale) {
      const g = new T.Group();
      g.position.set(x,y,z);
      g.scale.setScalar(scale);
      group.add(g);

      cube(g,.30,.13,.23,0,.065,0,m.dark);
      cube(g,.30,.035,.23,0,.145,0,m.blue);
      cube(g,.095,.025,.035,0,.065,.135,m.steel);
    }

    function addSensor(x,y,z,color,scale) {
      const g = new T.Group();
      g.position.set(x,y,z);
      g.scale.setScalar(scale);
      group.add(g);

      cube(g,.18,.11,.13,0,.055,0,m.white);
      cube(g,.13,.028,.014,0,.075,.073,mat(color));
      cube(g,.055,.045,.035,0,.045,-.078,m.dark);
    }

    const sensorColors = [
      0x438dd4, 0x46b8a2, 0xe6a84b,
      0xc66bc8, 0x53a6db, 0x7e8c9f,
      0xe4cb4d
    ];

    for (const x of [-.25,0,.25]) {
      addCase(x,y4,-.09,.72);
    }

    sensorColors.slice(0,4).forEach((color,i) => {
      addSensor(-.30+i*.20,y4,.12,color,.65);
    });

    for (const x of [-.16,.16]) {
      addCase(x,y3,-.09,.80);
    }

    sensorColors.slice(4).forEach((color,i) => {
      addSensor(-.23+i*.23,y3,.12,color,.70);
    });
  }

  // ==========================================
  // 보관장 생성
  // ==========================================

  function makeCabinet(data) {
    const g = new T.Group();
    g.position.set(data.x,0,data.z);
    g.rotation.y = (data.rot || 0)*Math.PI/180;
    stage.add(g);

    const id = data.id;
    const w = data.width;
    const h = data.height;
    const d = data.depth;
    const n = Math.max(1,data.shelves || 3);

    const finish =
      ['wood','twotier','wood24'].includes(data.kind)
        ? m.wood
        : data.kind === 'metal2'
          ? m.steelLight
          : m.white;

    cube(g,w,h,.055,0,h/2,-d/2,finish,id);
    cube(g,.078,h,d,-w/2,h/2,0,finish,id);
    cube(g,.078,h,d,w/2,h/2,0,finish,id);
    cube(g,w,.095,d,0,.048,0,finish,id);
    cube(g,w,.095,d,0,h-.048,0,finish,id);

    const ys = [];

    for (let j=1;j<n;j++) {
      const sy = .05+(h-.1)*j/n;
      cube(
        g,w-.10,.047,d-.10,0,sy,0,
        ['wood','wood24'].includes(data.kind)
          ? m.woodLight : m.white,
        id
      );
      ys.push(sy);
    }

    if (data.kind === 'wood24') {
      for (const x of [-w/4,0,w/4]) {
        cube(g,.035,h-.12,d-.10,x,h/2,0,m.woodLight,id);
      }
    }

    // 과학실 1: 등록 기자재 3D 표시
    if (cfg.id === 'science1') {
      makeInventoryContents(g,data);
    }

    // 과학실 2: 기존 MBL 모형 유지
    if (cfg.id === 'science2' && id === 'S2-L-G04') {
      makeMBLContents(g,data);
    }

    const parts = [];

    if (data.kind === 'wood' || data.kind === 'twotier') {
      for (let i=0;i<2;i++) {
        const sign = i===0 ? -1 : 1;
        const p = new T.Group();
        p.position.x = sign*(w/2-.035);
        p.position.z = d/2;
        g.add(p);

        cube(
          p,w/2-.07,h-.14,.06,
          -sign*(w/4-.035),h/2,0,m.wood,id
        );

        cube(
          p,.028,.18,.07,
          -sign*(w/2-.13),h/2,.058,m.steel,id
        );
        parts.push(p);
      }
    }

    else if (data.kind === 'metal2') {
      for (let j=0;j<2;j++) {
        const p = new T.Group();
        p.position.set(0,(j+.5)*h/2,d/2);
        g.add(p);

        cube(p,w-.11,h/2-.04,.055,0,0,0,m.steelLight,id);
        cube(p,.23,.027,.07,0,0,.045,m.steel,id);
        parts.push(p);
      }
    }

    else if (data.kind === 'drawer') {
      for (let j=0;j<3;j++) {
        for (let i=0;i<2;i++) {
          const p = new T.Group();
          p.position.set((i-.5)*w/2,(j+.5)*h/3,d/2);
          g.add(p);

          cube(
            p,w/2-.08,h/3-.027,.055,
            0,0,0,m.white,id
          );
          cube(p,.18,.024,.07,0,0,.04,m.steel,id);
          parts.push(p);
        }
      }
    }

    else if (data.kind === 'glass' || data.kind === 'tablet') {
      for (let i=0;i<2;i++) {
        const p = new T.Group();
        p.position.set((i-.5)*w/2,0,d/2);
        g.add(p);

        cube(
          p,w/2-.06,h-.13,.036,
          0,h/2,0,
          data.kind === 'tablet' ? m.tablet : m.glass,
          id
        );

        if (data.kind === 'glass') {
          cube(
            p,.045,h-.13,.035,
            -w/4+.035,h/2,.01,m.white,id
          );
          cube(
            p,.045,h-.13,.035,
            w/4-.035,h/2,.01,m.white,id
          );
          cube(
            p,.025,.16,.055,
            i===0 ? w/4-.09 : -w/4+.09,
            h*.50,.065,m.steel,id
          );
        }

        parts.push(p);
      }
    }

    label(g,id,0,h+.23,0,1.16);

    const frame = new T.LineSegments(
      new T.EdgesGeometry(
        new T.BoxGeometry(w+.15,h+.16,d+.15)
      ),
      new T.LineBasicMaterial({
        color:0x198aff,
        depthTest:false
      })
    );
    frame.position.set(0,h/2,0);
    frame.visible = false;
    frame.renderOrder = 15;
    g.add(frame);

    const highlight = new T.LineSegments(
      new T.EdgesGeometry(
        new T.BoxGeometry(w-.085,.10,d-.085)
      ),
      new T.LineBasicMaterial({
        color:0xf5a623,
        depthTest:false
      })
    );
    highlight.visible = false;
    highlight.renderOrder = 16;
    g.add(highlight);

    cabinets.push({
      ...data,
      g,parts,ys,frame,highlight,
      progress:0,
      target:0,
      type:'cabinet'
    });
  }

  // ==========================================
  // 학생 실험대
  // ==========================================

  function makeDesks() {
    const desks = cfg.desks;

    if (desks) {
      for (const z of desks.rows) {
        for (const x of desks.columns) {
          const g = new T.Group();
          g.position.set(x,0,z);
          stage.add(g);

          cube(
            g,desks.width,.075,desks.depth,
            0,.80,0,m.counter
          );

          for (const xx of [
            -desks.width*.43,
            desks.width*.43
          ]) {
            for (const zz of [
              -desks.depth*.37,
              desks.depth*.37
            ]) {
              cube(g,.07,.76,.07,xx,.38,zz,m.steel);
            }
          }

          cube(
            g,desks.width*.85,.45,.055,
            0,.52,-desks.depth*.40,m.white
          );

          for (const xx of [
            -desks.width*.28,
            desks.width*.28
          ]) {
            for (const side of [-1,1]) {
              const zc = side*desks.depth*.78;

              cube(g,.40,.06,.40,xx,.50,zc,m.chair);
              cube(
                g,.40,.32,.06,
                xx,.70,zc+side*.17,m.chair
              );

              for (const lx of [-.13,.13]) {
                for (const lz of [-.13,.13]) {
                  cube(
                    g,.035,.45,.035,
                    xx+lx,.225,zc+lz,m.steel
                  );
                }
              }
            }
          }
        }
      }
    }

    // 교사용 실험대와 컴퓨터
    const t = cfg.teacher;

    if (t) {
      const p = new T.Group();
      p.position.set(t.x,0,t.z);
      stage.add(p);

      cube(p,t.width,.085,t.depth,0,.94,0,m.white);

      for (const xx of [-t.width*.44,t.width*.44]) {
        for (const zz of [-t.depth*.40,t.depth*.40]) {
          cube(p,.075,.89,.075,xx,.45,zz,m.steel);
        }
      }

      cube(
        p,t.width*.82,.52,.08,
        0,.58,-t.depth*.42,m.white
      );

      const pcX = -Math.min(.43,t.width*.24);

      cube(p,.61,.40,.065,pcX,1.38,-.08,m.dark);
      cube(
        p,.54,.33,.012,pcX,1.38,-.12,
        new T.MeshBasicMaterial({color:0x245477})
      );
      cube(p,.045,.17,.045,pcX,1.10,-.08,m.steel);
      cube(p,.30,.025,.20,pcX,1.01,-.08,m.steelLight);
      cube(p,.49,.025,.15,pcX,.995,.23,m.steelLight);
      cube(p,.075,.035,.12,pcX+.38,.995,.23,m.white);
      cube(p,.21,.42,.36,t.width*.32,.26,-.08,m.dark);

      label(p,'교사용 컴퓨터',pcX,1.84,-.08,1.25);
    }

    // 전자칠판
    const board = new T.Group();
    board.position.set(
      Math.min(W/2-1.85,2.0),0,D/2-.22
    );
    stage.add(board);

    cube(board,3.05,1.76,.11,0,1.93,0,m.dark);
    cube(
      board,2.88,1.59,.018,0,1.93,-.068,
      new T.MeshBasicMaterial({
        color:0x1b4967,
        side:T.DoubleSide
      })
    );
    cube(board,2.55,.025,.022,0,1.48,-.082,m.blue);
    label(board,'전자칠판',0,3.10,0,1.20);
  }

  // ==========================================
  // 공간 생성
  // ==========================================

  function draw() {
    makeWalls();

    for (const d of cfg.doors || []) {
      makeDoor(d);
    }

    for (const c of cfg.cabinets || []) {
      makeCabinet(c);
    }

    for (const c of cfg.furniture || []) {
      makeCabinet(c);
    }

    makeDesks();
  }

  // ==========================================
  // 카메라 이동
  // ==========================================

  const findCab = id => cabinets.find(c => c.id === id);

  function flyTo(pos,target) {
    transition = {
      from:camera.position.clone(),
      to:new T.Vector3(...pos),
      a:orbit.target.clone(),
      b:new T.Vector3(...target),
      t:0
    };
  }

  const views = {
    overview:{
      pos:[10.3,10.5,15.3],
      look:[0,.7,-.15]
    },
    left:{
      pos:[-7.1,4.9,6.8],
      look:[-3.6,1,0]
    },
    back:{
      pos:[.5,4.3,-1.2],
      look:[0,1.3,-5.9]
    },
    window:{
      pos:[7.8,4.2,3.1],
      look:[4,1,-.15]
    },
    top:{
      pos:[0,17,.01],
      look:[0,.1,0]
    }
  };

  function setView(view) {
    const v = views[view];
    if (!v) return;

    flyTo(v.pos,v.look);

    document.querySelectorAll('[data-view]').forEach(b => {
      b.classList.toggle(
        'active',
        b.dataset.view === view
      );
    });
  }

  // ==========================================
  // 선반 강조
  // ==========================================

  function markShelf(j) {
    if (!selected) return;

    const ys = [
      .06,
      ...selected.ys,
      selected.height-.06
    ];

    if (j<1 || j>=ys.length) return;

    selected.highlight.visible = true;
    selected.highlight.position.set(
      0,(ys[j-1]+ys[j])/2,0
    );

    const shelfList = $('shelfList');

    if (shelfList) {
      Array.from(shelfList.querySelectorAll(
        '[data-shelf]'
      )).forEach(b => {
        b.classList.toggle(
          'active',
          Number(b.dataset.shelf) === j
        );
      });
    }
  }

  // ==========================================
  // 보관장 상세정보
  // ==========================================

  function selectObject(obj,focusItem) {
    if (!obj) return;

    if (selected) {
      selected.frame.visible = false;
      selected.highlight.visible = false;
    }

    selected = obj;
    obj.frame.visible = true;

    const p = obj.g.position;
    const angle = (obj.rot || 0)*Math.PI/180;
    const distance = obj.height > 2 ? 4.2 : 3.2;
    const cameraY = obj.height > 2 ? 3.1 : 2.3;

    flyTo(
      [
        p.x+Math.sin(angle)*distance,
        cameraY,
        p.z+Math.cos(angle)*distance
      ],
      [p.x,obj.height*.52,p.z]
    );

    const detail = $('detail');
    if (detail) {
      detail.hidden = false;
      detail.scrollTop = 0;
    }

    const title = $('detailTitle');
    if (title) {
      title.textContent = obj.label || obj.id;
    }

    const items = itemByCab.get(obj.id) || [];
    const isMBL =
      cfg.id === 'science2' &&
      obj.id === 'S2-L-G04';

    const meta = $('detailMeta');

    if (meta) {
      if (isMBL) {
        meta.textContent =
          '관리번호 S2-L-G04 · MBL 센서 7종 · ' +
          '보관 케이스 5개 · 상단 3~4단 혼합 보관';
      } else {
        meta.textContent =
          `관리번호 ${obj.id} · ` +
          `${obj.shelves}단 수납장 · ` +
          (
            items.length
              ? `등록 기자재 ${items.length}종`
              : '내부 물품 미등록'
          );
      }
    }

    const shelfList = $('shelfList');

    if (shelfList) {
      shelfList.replaceChildren();

      for (let j=1;j<=obj.shelves;j++) {
        const button = document.createElement('button');
        button.dataset.shelf = j;

        const shelfItems = items.filter(item => {
          if (Array.isArray(item.shelves)) {
            return item.shelves.includes(j);
          }
          return item.shelf != null &&
            Number(item.shelf) === j;
        });

        if (isMBL && (j===3 || j===4)) {
          button.textContent =
            `${j}단 · MBL 센서 및 보관 케이스 (혼합 보관)`;
        } else if (shelfItems.length) {
          button.textContent =
            `${j}단 · ` +
            shelfItems.map(item => {
              const count = Number.isFinite(item.quantity)
                ? ` (${item.quantity}${item.unit || '개'})`
                : '';
              return item.name+count;
            }).join(', ');
        } else {
          button.textContent =
            `${j}단 · 위치별 물품 미지정`;
        }

        button.onclick = () => markShelf(j);
        shelfList.append(button);
      }

      // 선반 미지정 물품도 반드시 목록에 표시
      if (items.length) {
        const heading = document.createElement('div');
        heading.textContent = '등록 기자재 전체 목록';
        heading.style.fontWeight = '700';
        heading.style.fontSize = '13px';
        heading.style.marginTop = '14px';
        heading.style.marginBottom = '6px';
        shelfList.append(heading);

        const list = document.createElement('div');
        list.style.padding = '10px';
        list.style.borderRadius = '10px';
        list.style.background = 'rgba(120,160,205,.10)';
        list.style.fontSize = '12px';
        list.style.lineHeight = '1.8';
        list.style.overflowWrap = 'anywhere';

        for (const item of items) {
          const line = document.createElement('div');
          const count = Number.isFinite(item.quantity)
            ? ` · ${item.quantity}${item.unit || '개'}`
            : '';

          line.textContent = `• ${item.name}${count}`;
          list.append(line);
        }

        shelfList.append(list);
      }
    }

    if (focusItem) {
      if (
        Array.isArray(focusItem.shelves) &&
        focusItem.shelves.length
      ) {
        markShelf(Math.max(...focusItem.shelves));
      } else if (focusItem.shelf != null) {
        markShelf(Number(focusItem.shelf));
      }
    }

    const toggle = $('doorToggle');
    if (toggle) {
      toggle.disabled = obj.parts.length === 0;
      toggle.textContent = obj.parts.length === 0
        ? '개방형 수납장'
        : obj.target > .3
          ? '문 닫기'
          : '보관장 문 열기';
    }
  }

  // ==========================================
  // 기자재 검색
  // ==========================================

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\s+/g,'');
  }

  function search() {
    const input = $('search');
    const results = $('results');
    if (!input || !results) return;

    const q = normalize(input.value);

    const candidates = cabinets.filter(c => {
      if (!q) return true;

      const basic = [
        c.id,c.label,c.verifiedContents || ''
      ];

      if (basic.some(s => normalize(s).includes(q))) {
        return true;
      }

      return (itemByCab.get(c.id) || []).some(item =>
        [
          item.name,
          ...(item.keywords || [])
        ].some(word => normalize(word).includes(q))
      );
    });

    results.replaceChildren();

    for (const c of candidates) {
      const button = document.createElement('button');
      button.type = 'button';

      const strong = document.createElement('strong');
      strong.textContent = c.label || c.id;

      const small = document.createElement('small');
      const items = itemByCab.get(c.id) || [];

      if (
        cfg.id === 'science2' &&
        c.id === 'S2-L-G04'
      ) {
        small.textContent =
          'S2-L-G04 · MBL 센서 7종 · 케이스 5개';
      } else {
        small.textContent =
          `${c.id} · ` +
          (
            items.length
              ? `등록 기자재 ${items.length}종`
              : '위치 확인용 보관장'
          );
      }

      button.append(strong,small);

      button.onclick = () => {
        const matched = q
          ? items.find(item =>
              [
                item.name,
                ...(item.keywords || [])
              ].some(word => normalize(word).includes(q))
            )
          : null;

        selectObject(c,matched || null);
      };

      results.append(button);
    }

    if (!candidates.length) {
      const no = document.createElement('p');
      no.textContent = '일치하는 보관장이 없습니다.';
      results.append(no);
    }
  }

  // ==========================================
  // 보관장 문 열기/닫기
  // ==========================================

  function toggleDoor(obj) {
    if (!obj || !obj.parts.length) return;

    obj.target = obj.target > .5 ? 0 : 1;

    if (selected === obj && $('doorToggle')) {
      $('doorToggle').textContent =
        obj.target ? '문 닫기' : '보관장 문 열기';
    }
  }

  function animateDoors(dt) {
    const speed = Math.min(1,dt*7);

    for (const c of cabinets) {
      c.progress += (c.target-c.progress)*speed;

      if (
        c.kind === 'wood' ||
        c.kind === 'twotier'
      ) {
        c.parts.forEach((p,i) => {
          p.rotation.y =
            (i===0 ? -1 : 1)*1.35*c.progress;
        });
      }

      else if (
        c.kind === 'glass' ||
        c.kind === 'tablet'
      ) {
        c.parts.forEach((p,i) => {
          const initial = (i-.5)*c.width/2;
          const direction = i===0 ? -1 : 1;

          p.position.x =
            initial + direction*c.width*.40*c.progress;
        });
      }

      else if (
        c.kind === 'drawer' ||
        c.kind === 'metal2'
      ) {
        c.parts.forEach(p => {
          p.position.z =
            c.depth/2+c.progress*.38;
        });
      }
    }

    for (const d of doors) {
      d.progress += (d.target-d.progress)*speed;
      d.pivot.rotation.y = -d.progress*1.25;
    }
  }

  // ==========================================
  // 사용자 조작
  // ==========================================

  function interactions() {
    const input = $('search');
    if (input) {
      input.addEventListener('input',search);
    }

    const detailClose = $('detailClose');

    if (detailClose) {
      detailClose.onclick = () => {
        const detail = $('detail');
        if (detail) detail.hidden = true;

        if (selected) {
          selected.frame.visible = false;
          selected.highlight.visible = false;
        }
        selected = null;
      };
    }

    const doorToggle = $('doorToggle');
    if (doorToggle) {
      doorToggle.onclick = () => {
        if (selected) toggleDoor(selected);
      };
    }

    document.querySelectorAll('[data-view]').forEach(b => {
      b.onclick = () => setView(b.dataset.view);
    });

    const reset = $('reset');
    if (reset) {
      reset.onclick = () => setView('overview');
    }

    const fullscreen = $('fullscreen');
    if (fullscreen) {
      fullscreen.onclick = () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen?.();
        }
      };
    }

    const theme = $('theme');
    if (theme) {
      theme.onclick = () => {
        isDark = !isDark;
        document.body.classList.toggle('dark',isDark);

        scene.background.set(
          isDark ? '#152131' : '#eaf2fa'
        );

        theme.textContent =
          isDark ? '☀ 주간 모드' : '🌙 야간 모드';
      };
    }

    // 3D 물체 클릭
    const raycaster = new T.Raycaster();
    const pointer = new T.Vector2();
    let down = null;

    renderer.domElement.addEventListener(
      'pointerdown',
      e => {
        down = {x:e.clientX,y:e.clientY};
      }
    );

    renderer.domElement.addEventListener(
      'pointerup',
      e => {
        if (!down) return;

        const dd = Math.hypot(
          e.clientX-down.x,
          e.clientY-down.y
        );

        down = null;
        if (dd>6) return;

        const rect =
          renderer.domElement.getBoundingClientRect();

        pointer.set(
          ((e.clientX-rect.left)/rect.width)*2-1,
          -((e.clientY-rect.top)/rect.height)*2+1
        );

        raycaster.setFromCamera(pointer,camera);

        const hit = raycaster.intersectObjects(
          pickables,false
        )[0];

        if (!hit) return;

        const id = hit.object.userData.owner;
        const cab = findCab(id);

        if (cab) {
          selectObject(cab);
          return;
        }

        const door = doors.find(o => o.id===id);
        if (door) {
          door.target = door.target>.5 ? 0 : 1;
        }
      }
    );

    addEventListener('resize',() => {
      renderer.setSize(innerWidth,innerHeight);
      camera.aspect = innerWidth/innerHeight;
      camera.updateProjectionMatrix();
    });
  }

  // ==========================================
  // 애니메이션
  // ==========================================

  const clock = new T.Clock();

  function frame() {
    requestAnimationFrame(frame);

    const dt = Math.min(.05,clock.getDelta());
    animateDoors(dt);

    if (transition) {
      transition.t = Math.min(
        1,transition.t+dt*1.7
      );

      const r = 1-Math.pow(1-transition.t,3);

      camera.position
        .copy(transition.from)
        .lerp(transition.to,r);

      orbit.target
        .copy(transition.a)
        .lerp(transition.b,r);

      if (transition.t>=1) {
        transition = null;
      }
    }

    orbit.update();
    renderer.render(scene,camera);
  }

  // ==========================================
  // 시작
  // ==========================================

  draw();
  interactions();
  search();
  frame();

})();


draw();
interactions();

// 메인 화면 검색어 자동 전달
const params = new URLSearchParams(window.location.search);
const incomingSearch = params.get('search') || '';

const roomSearch = document.getElementById('search');

if (roomSearch && incomingSearch.trim()) {
  roomSearch.value = incomingSearch.trim();
}

search();
frame();
