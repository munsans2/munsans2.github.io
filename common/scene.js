
/*
 문산중학교 3D 과학실 공통 엔진

 Three.js r128 + OrbitControls

 기존 기능:
 - 과학실 1, 2, 3 공통 배치
 - 보관장 검색 및 선택
 - 보관장 문 열기
 - 선반 강조
 - 교사용 컴퓨터 / 전자칠판
 - 주간 / 야간 모드

 추가 기능:
 - 과학실 2 S2-L-G04
 - MBL 센서 7종 모형
 - 보관 케이스 5개
 - 상단 3단, 4단 혼합 보관
*/

(() => {
'use strict';

const config = window.MUNSAN_LAB_LAYOUT;
const $ = id => document.getElementById(id);

if (!config || !window.THREE || !THREE.OrbitControls) {
  const notice = $('notice');
  if (notice) {
    notice.style.display = 'block';
    notice.textContent =
      '3D 엔진을 불러오지 못했습니다. 파일 경로를 확인하세요.';
  }
  return;
}

const T = window.THREE;
const W = config.room.width;
const D = config.room.depth;
const H = config.room.height;

const scene = new T.Scene();
scene.background = new T.Color('#eaf2fa');

const camera = new T.PerspectiveCamera(
  43,
  innerWidth / innerHeight,
  0.1,
  120
);

camera.position.set(10, 10, 15);

const renderer = new T.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});

renderer.outputEncoding = T.sRGBEncoding;
renderer.setPixelRatio(
  Math.min(devicePixelRatio || 1, 1.75)
);
renderer.setSize(innerWidth, innerHeight);

document.body.insertBefore(
  renderer.domElement,
  document.body.firstChild
);

const orbit = new T.OrbitControls(
  camera,
  renderer.domElement
);

orbit.enableDamping = true;
orbit.dampingFactor = 0.075;
orbit.maxPolarAngle = Math.PI / 2 - 0.02;
orbit.minDistance = 1.25;
orbit.maxDistance = 36;
orbit.target.set(0, 0.72, 0);
orbit.update();

scene.add(
  new T.HemisphereLight(
    0xffffff,
    0xc1c9d4,
    1.04
  )
);

const lamp = new T.DirectionalLight(
  0xffffff,
  0.77
);
lamp.position.set(-7, 13, 10);
scene.add(lamp);

// =====================================
// 재질
// =====================================

const colors = {
  floor: '#dce3e8',
  walls: '#f4f6f7',
  trim: '#c7a47c',
  wood: '#a97d50',
  woodLight: '#cba37a',
  white: '#eef2f4',
  steel: '#798b9d',
  steelLight: '#c9d3db',
  counter: '#f7f8fa',
  chair: '#8393a3',
  dark: '#243549',
  board: '#2e725b',
  tablet: '#677f95',
  blue: '#308ddd'
};

const mats = {};

Object.entries(colors).forEach(([key, color]) => {
  mats[key] = new T.MeshLambertMaterial({
    color: color
  });
});

mats.glass = new T.MeshBasicMaterial({
  color: 0xa3d5e5,
  transparent: true,
  opacity: 0.55,
  depthWrite: false,
  side: T.DoubleSide
});

mats.window = new T.MeshBasicMaterial({
  color: 0xc2e4f2,
  transparent: true,
  opacity: 0.42,
  depthWrite: false,
  side: T.DoubleSide
});

// MBL 전용 재질

mats.mblCase = new T.MeshLambertMaterial({
  color: 0x344c65
});

mats.mblLid = new T.MeshLambertMaterial({
  color: 0x547793
});

mats.mblSensor = new T.MeshLambertMaterial({
  color: 0xe5edf4
});

mats.mblDark = new T.MeshLambertMaterial({
  color: 0x25394e
});

// =====================================
// 기본 변수
// =====================================

const stage = new T.Group();
scene.add(stage);

const pickables = [];
const cabinetObjects = [];
const doorObjects = [];
const itemByCab = new Map();

for (const item of config.inventory || []) {
  if (!itemByCab.has(item.cabinet)) {
    itemByCab.set(item.cabinet, []);
  }

  itemByCab.get(item.cabinet).push(item);
}

let selected = null;
let transition = null;
let isDark = false;

// =====================================
// 기본 도형
// =====================================

function cube(
  parent, w, h, d,
  x, y, z,
  material, owner
) {
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

function label(
  parent, text,
  x, y, z,
  width = 1.17
) {
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

  ctx.fillText(
    String(text).slice(0, 22),
    256, 54, 474
  );

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
}

// =====================================
// 벽
// =====================================

function segment(wall, start, end, y0, y1) {
  if (end - start <= 0.006) return;
  if (y1 - y0 <= 0.006) return;

  if (wall === 'left') {
    cube(
      stage, 0.1, y1-y0, end-start,
      -W/2, (y0+y1)/2, (start+end)/2,
      mats.walls
    );
  }

  if (wall === 'right') {
    cube(
      stage, 0.1, y1-y0, end-start,
      W/2, (y0+y1)/2, (start+end)/2,
      mats.walls
    );
  }

  if (wall === 'far') {
    cube(
      stage, end-start, y1-y0, 0.1,
      (start+end)/2, (y0+y1)/2, -D/2,
      mats.walls
    );
  }

  if (wall === 'near') {
    cube(
      stage, end-start, y1-y0, 0.1,
      (start+end)/2, (y0+y1)/2, D/2,
      mats.walls
    );
  }
}

function makeWalls() {
  cube(
    stage, W, 0.10, D,
    0, -0.08, 0,
    mats.floor
  );

  const gridSize = Math.max(W, D);

  const grid = new T.GridHelper(
    gridSize,
    Math.floor(gridSize * 2),
    0xcbd5df,
    0xcbd5df
  );

  grid.scale.set(
    W/gridSize,
    1,
    D/gridSize
  );

  grid.position.y = 0.004;
  stage.add(grid);

  for (const wall of [
    'left', 'right', 'far', 'near'
  ]) {
    const A =
      wall === 'left' || wall === 'right'
        ? -D/2
        : -W/2;

    const B = -A;

    const height =
      wall === 'near' ? 1.10 :
      wall === 'left' ? 1.15 :
      wall === 'right' ? 1.05 : H;

    const cuts = (config.doors || [])
      .filter(p => p.wall === wall)
      .map(p => ({
        start: p.center - p.width/2,
        end: p.center + p.width/2
      }))
      .sort((a,b) => a.start - b.start);

    let cursor = A;

    for (const cut of cuts) {
      segment(
        wall,
        cursor,
        cut.start,
        0,
        height
      );

      cursor = Math.max(cursor, cut.end);
    }

    segment(
      wall,
      cursor,
      B,
      0,
      height
    );
  }

  // 뒤쪽 게시판

  cube(
    stage,
    W*0.47, 0.93, 0.065,
    0.48, 2.88, -D/2+0.075,
    mats.board
  );

  cube(
    stage,
    W*0.47+0.10, 0.045, 0.12,
    0.48, 3.38, -D/2+0.04,
    mats.trim
  );

  // 창문

  const win = config.windows;

  if (win) {
    for (const z of win.centers || []) {
      cube(
        stage,
        0.035, win.height, win.width,
        W/2-0.11,
        win.sill+win.height/2,
        z,
        mats.window
      );

      for (const dz of [
        -win.width/2,
        0,
        win.width/2
      ]) {
        cube(
          stage,
          0.09, win.height+0.09, 0.055,
          W/2-0.14,
          win.sill+win.height/2,
          z+dz,
          mats.trim
        );
      }

      cube(
        stage,
        0.10, 0.07, win.width,
        W/2-0.14,
        win.sill,
        z,
        mats.trim
      );

      cube(
        stage,
        0.10, 0.07, win.width,
        W/2-0.14,
        win.sill+win.height,
        z,
        mats.trim
      );
    }
  }

  // 구획벽

  for (const p of config.partitions || []) {
    cube(
      stage,
      p.width, p.height, p.depth,
      p.x, p.height/2, p.z,
      mats.walls
    );
  }
}

// =====================================
// 출입문
// =====================================

function makeDoor(door) {
  const group = new T.Group();
  stage.add(group);

  if (door.wall === 'left') {
    group.position.set(
      -W/2+0.08, 0, door.center
    );
    group.rotation.y = Math.PI/2;
  } else if (door.wall === 'right') {
    group.position.set(
      W/2-0.08, 0, door.center
    );
    group.rotation.y = -Math.PI/2;
  } else if (door.wall === 'far') {
    group.position.set(
      door.center, 0, -D/2+0.08
    );
  } else {
    group.position.set(
      door.center, 0, D/2-0.08
    );
    group.rotation.y = Math.PI;
  }

  const w = door.width;

  cube(
    group, 0.075, 2.35, 0.10,
    -w/2, 1.175, 0,
    mats.trim
  );

  cube(
    group, 0.075, 2.35, 0.10,
    w/2, 1.175, 0,
    mats.trim
  );

  cube(
    group, w+0.07, 0.10, 0.12,
    0, 2.35, 0,
    mats.trim
  );

  const pivot = new T.Group();
  pivot.position.set(-w/2, 0, 0.045);
  group.add(pivot);

  cube(
    pivot, w-0.08, 2.22, 0.05,
    (w-0.08)/2, 1.14, 0,
    mats.wood, door.id
  );

  cube(
    pivot, w*0.56, 1.0, 0.063,
    (w-0.08)/2, 1.55, 0.035,
    mats.glass, door.id
  );

  doorObjects.push({
    id: door.id,
    name: door.label || door.id,
    pivot,
    progress: 0.55,
    target: 0.55
  });

  label(
    group,
    door.label || '출입문',
    0, 2.65, 0, 1.25
  );
}

// =====================================
// MBL 전용 3D 모형
// =====================================

function makeMBLContents(group, data) {
  const w = data.width;
  const h = data.height;
  const d = data.depth;

  const step = (h-0.10)/4;

  // 3단과 4단의 바닥 높이
  const y3 = 0.05 + step*2;
  const y4 = 0.05 + step*3;

  const sensorTypes = [
    {name:'전압', color:0x438dd4},
    {name:'전류', color:0x46b8a2},
    {name:'힘 가속도', color:0xe6a84b},
    {name:'무선 온도', color:0xc66bc8},
    {name:'무선 산소', color:0x53a6db},
    {name:'무선 이산화탄소', color:0x7e8c9f},
    {name:'조도', color:0xe4cb4d}
  ];

  function addCase(x, baseY, z, scale) {
    const model = new T.Group();

    model.position.set(x, baseY, z);
    model.scale.setScalar(scale);
    group.add(model);

    cube(
      model,
      0.30, 0.13, 0.23,
      0, 0.065, 0,
      mats.mblCase
    );

    cube(
      model,
      0.30, 0.035, 0.23,
      0, 0.145, 0,
      mats.mblLid
    );

    cube(
      model,
      0.095, 0.025, 0.035,
      0, 0.065, 0.135,
      mats.steel
    );
  }

  function addSensor(
    x, baseY, z,
    sensorType, scale
  ) {
    const model = new T.Group();

    model.position.set(x, baseY, z);
    model.scale.setScalar(scale);
    group.add(model);

    const accent = new T.MeshLambertMaterial({
      color: sensorType.color
    });

    // 센서 본체

    cube(
      model,
      0.18, 0.11, 0.13,
      0, 0.055, 0,
      mats.mblSensor
    );

    // 색상 구분 표시

    cube(
      model,
      0.13, 0.028, 0.014,
      0, 0.075, 0.073,
      accent
    );

    // 연결 포트

    cube(
      model,
      0.055, 0.045, 0.035,
      0, 0.045, -0.078,
      mats.mblDark
    );
  }

  // ===================================
  // 4단 : 케이스 3개 + 센서 4종
  // ===================================

  const upperCases = [-0.25, 0, 0.25];

  for (const x of upperCases) {
    addCase(
      x,
      y4+0.05,
      -0.09,
      0.72
    );
  }

  sensorTypes.slice(0,4).forEach((type,i) => {
    addSensor(
      -0.30+i*0.20,
      y4+0.05,
      0.12,
      type,
      0.65
    );
  });

  // ===================================
  // 3단 : 케이스 2개 + 센서 3종
  // ===================================

  for (const x of [-0.16,0.16]) {
    addCase(
      x,
      y3+0.05,
      -0.09,
      0.80
    );
  }

  sensorTypes.slice(4).forEach((type,i) => {
    addSensor(
      -0.23+i*0.23,
      y3+0.05,
      0.12,
      type,
      0.70
    );
  });
}

// =====================================
// 보관장
// =====================================

function cabinet(data) {
  const g = new T.Group();

  g.position.set(
    data.x, 0, data.z
  );

  g.rotation.y =
    (data.rot || 0)*Math.PI/180;

  stage.add(g);

  const id = data.id;
  const w = data.width;
  const h = data.height;
  const d = data.depth;
  const n = data.shelves;

  const finish =
    data.kind === 'wood' ||
    data.kind === 'twotier'
      ? mats.wood
      : data.kind === 'metal2'
      ? mats.steelLight
      : mats.white;

  cube(
    g,w,h,0.055,
    0,h/2,-d/2,
    finish,id
  );

  cube(
    g,0.078,h,d,
    -w/2,h/2,0,
    finish,id
  );

  cube(
    g,0.078,h,d,
    w/2,h/2,0,
    finish,id
  );

  cube(
    g,w,0.095,d,
    0,0.048,0,
    finish,id
  );

  cube(
    g,w,0.095,d,
    0,h-0.048,0,
    finish,id
  );

  const ys = [];
  const shelfCount = Math.max(1,n || 3);

  for (let j=1;j<shelfCount;j++) {
    const sy =
      0.05+(h-0.1)*j/shelfCount;

    cube(
      g,
      w-0.10,0.047,d-0.10,
      0,sy,0,
      data.kind==='wood'
        ? mats.woodLight
        : mats.white,
      id
    );

    ys.push(sy);
  }

  // 과학실 2 MBL 전용
  // 다른 보관장에는 생성하지 않음

  if (
    config.id === 'science2' &&
    id === 'S2-L-G04'
  ) {
    makeMBLContents(g,data);
  }

  const parts = [];

  // 목재장

  if (
    data.kind === 'wood' ||
    data.kind === 'twotier'
  ) {
    for (let i=0;i<2;i++) {
      const sign = i===0 ? -1 : 1;

      const p = new T.Group();

      p.position.x =
        sign*(w/2-0.035);

      p.position.z = d/2;
      g.add(p);

      cube(
        p,w/2-0.07,h-0.14,0.06,
        -sign*(w/4-0.035),h/2,0,
        mats.wood,id
      );

      cube(
        p,0.028,0.18,0.070,
        -sign*(w/2-0.13),h/2,0.058,
        mats.steel,id
      );

      parts.push(p);
    }
  }

  // 철제 2단 서랍장

  else if (data.kind === 'metal2') {
    for (let j=0;j<2;j++) {
      const p = new T.Group();

      p.position.set(
        0,(j+0.5)*h/2,d/2
      );

      g.add(p);

      cube(
        p,w-0.11,h/2-0.04,0.055,
        0,0,0,
        mats.steelLight,id
      );

      cube(
        p,0.23,0.027,0.07,
        0,0,0.045,
        mats.steel,id
      );

      parts.push(p);
    }
  }

  // 2열 3단 서랍장

  else if (data.kind === 'drawer') {
    for (let j=0;j<3;j++) {
      for (let i=0;i<2;i++) {
        const p = new T.Group();

        p.position.set(
          (i-0.5)*w/2,
          (j+0.5)*h/3,
          d/2
        );

        g.add(p);

        cube(
          p,w/2-0.08,h/3-0.027,0.055,
          0,0,0,
          mats.white,id
        );

        cube(
          p,0.18,0.024,0.07,
          0,0,0.04,
          mats.steel,id
        );

        parts.push(p);
      }
    }
  }

  // 유리장 및 태블릿장

  else if (
    data.kind === 'glass' ||
    data.kind === 'tablet'
  ) {
    for (let i=0;i<2;i++) {
      const p = new T.Group();

      p.position.set(
        (i-0.5)*w/2,
        0,
        d/2
      );

      g.add(p);

      cube(
        p,w/2-0.06,h-0.13,0.036,
        0,h/2,0,
        data.kind==='tablet'
          ? mats.tablet
          : mats.glass,
        id
      );

      if (data.kind === 'glass') {
        cube(
          p,0.045,h-0.13,0.035,
          -w/4+0.035,h/2,0.01,
          mats.white,id
        );

        cube(
          p,0.045,h-0.13,0.035,
          w/4-0.035,h/2,0.01,
          mats.white,id
        );
      }

      parts.push(p);
    }
  }

  // 보관장 번호

  label(
    g,id,
    0,h+0.23,0,
    1.16
  );

  // 선택 강조 테두리

  const frame = new T.LineSegments(
    new T.EdgesGeometry(
      new T.BoxGeometry(
        w+0.15,
        h+0.16,
        d+0.15
      )
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

  // 선반 강조

  const highlight = new T.LineSegments(
    new T.EdgesGeometry(
      new T.BoxGeometry(
        w-0.085,
        0.10,
        d-0.085
      )
    ),
    new T.LineBasicMaterial({
      color:0xf5a623,
      depthTest:false
    })
  );

  highlight.visible = false;
  highlight.renderOrder = 16;
  g.add(highlight);

  cabinetObjects.push({
    ...data,
    g,
    parts,
    ys,
    frame,
    highlight,
    progress:0,
    target:0,
    type:'cabinet'
  });
}

// =====================================
// 학생 실험대
// =====================================

function makeDesks() {
  const desks = config.desks;

  if (desks) {
    for (const z of desks.rows) {
      for (const x of desks.columns) {
        const g = new T.Group();

        g.position.set(x,0,z);
        stage.add(g);

        cube(
          g,
          desks.width,0.075,desks.depth,
          0,0.80,0,
          mats.counter
        );

        for (const xx of [
          -desks.width*0.43,
          desks.width*0.43
        ]) {
          for (const zz of [
            -desks.depth*0.37,
            desks.depth*0.37
          ]) {
            cube(
              g,0.07,0.76,0.07,
              xx,0.38,zz,
              mats.steel
            );
          }
        }

        cube(
          g,
          desks.width*0.85,
          0.45,0.055,
          0,0.52,-desks.depth*0.40,
          mats.white
        );

        for (const xx of [
          -desks.width*0.28,
          desks.width*0.28
        ]) {
          for (const side of [-1,1]) {
            const zc =
              side*desks.depth*0.78;

            cube(
              g,0.40,0.06,0.40,
              xx,0.50,zc,
              mats.chair
            );

            cube(
              g,0.40,0.32,0.06,
              xx,0.70,zc+side*0.17,
              mats.chair
            );

            for (const lx of [-0.13,0.13]) {
              for (const lz of [-0.13,0.13]) {
                cube(
                  g,0.035,0.45,0.035,
                  xx+lx,0.225,zc+lz,
                  mats.steel
                );
              }
            }
          }
        }
      }
    }
  }

  // ===================================
  // 교사용 실험대 + 컴퓨터
  // ===================================

  const t = config.teacher;

  if (t) {
    const p = new T.Group();

    p.position.set(t.x,0,t.z);
    stage.add(p);

    cube(
      p,t.width,0.085,t.depth,
      0,0.94,0,
      mats.white
    );

    for (const xx of [
      -t.width*0.44,
      t.width*0.44
    ]) {
      for (const zz of [
        -t.depth*0.40,
        t.depth*0.40
      ]) {
        cube(
          p,0.075,0.89,0.075,
          xx,0.45,zz,
          mats.steel
        );
      }
    }

    cube(
      p,t.width*0.82,0.52,0.08,
      0,0.58,-t.depth*0.42,
      mats.white
    );

    const pcX =
      -Math.min(0.43,t.width*0.24);

    // 모니터

    cube(
      p,0.61,0.40,0.065,
      pcX,1.38,-0.08,
      mats.dark
    );

    cube(
      p,0.54,0.33,0.012,
      pcX,1.38,-0.12,
      new T.MeshBasicMaterial({
        color:0x245477
      })
    );

    // 받침대

    cube(
      p,0.045,0.17,0.045,
      pcX,1.10,-0.08,
      mats.steel
    );

    cube(
      p,0.30,0.025,0.20,
      pcX,1.01,-0.08,
      mats.steelLight
    );

    // 키보드

    cube(
      p,0.49,0.025,0.15,
      pcX,0.995,0.23,
      mats.steelLight
    );

    // 마우스

    cube(
      p,0.075,0.035,0.12,
      pcX+0.38,0.995,0.23,
      mats.white
    );

    // 본체

    cube(
      p,0.21,0.42,0.36,
      t.width*0.32,0.26,-0.08,
      mats.dark
    );

    label(
      p,'교사용 컴퓨터',
      pcX,1.84,-0.08,1.25
    );
  }

  // ===================================
  // 전자칠판
  // ===================================

  const board = new T.Group();

  board.position.set(
    Math.min(W/2-1.85,2.0),
    0,
    D/2-0.22
  );

  stage.add(board);

  cube(
    board,3.05,1.76,0.11,
    0,1.93,0,
    mats.dark
  );

  cube(
    board,2.88,1.59,0.018,
    0,1.93,-0.068,
    new T.MeshBasicMaterial({
      color:0x1b4967,
      side:T.DoubleSide
    })
  );

  cube(
    board,2.55,0.025,0.022,
    0,1.48,-0.082,
    mats.blue
  );

  label(
    board,'전자칠판',
    0,3.10,0,1.20
  );
}

// =====================================
// 전체 공간 생성
// =====================================

function draw() {
  makeWalls();

  for (const d of config.doors || []) {
    makeDoor(d);
  }

  for (const c of config.cabinets || []) {
    cabinet(c);
  }

  for (const c of config.furniture || []) {
    cabinet(c);
  }

  makeDesks();
}

// =====================================
// 카메라 이동
// =====================================

const findCab = id =>
  cabinetObjects.find(c => c.id === id);

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
    look:[0,0.7,-0.15]
  },
  left:{
    pos:[-7.1,4.9,6.8],
    look:[-3.6,1.0,0]
  },
  back:{
    pos:[0.5,4.3,-1.2],
    look:[0,1.3,-5.9]
  },
  window:{
    pos:[7.8,4.2,3.1],
    look:[4,1.0,-0.15]
  },
  top:{
    pos:[0,17,0.01],
    look:[0,0.1,0]
  }
};

function setView(view) {
  const v = views[view];
  if (!v) return;

  flyTo(v.pos,v.look);

  document.querySelectorAll(
    '[data-view]'
  ).forEach(b => {
    b.classList.toggle(
      'active',
      b.dataset.view === view
    );
  });
}

// =====================================
// 선반 강조
// =====================================

function markShelf(j) {
  if (!selected) return;

  const ys = [
    0.06,
    ...selected.ys,
    selected.height-0.06
  ];

  if (j < 1 || j >= ys.length) return;

  selected.highlight.visible = true;

  selected.highlight.position.set(
    0,
    (ys[j-1]+ys[j])/2,
    0
  );

  Array.from(
    $('shelfList').children
  ).forEach((b,i) => {
    b.classList.toggle(
      'active',
      i === j-1
    );
  });
}

// =====================================
// 보관장 선택
// =====================================

function selectObject(obj,focusItem) {
  if (!obj) return;

  if (selected) {
    selected.frame.visible = false;
    selected.highlight.visible = false;
  }

  selected = obj;
  obj.frame.visible = true;

  const p = obj.g.position;
  const angle =
    (obj.rot || 0)*Math.PI/180;

  const distance =
    obj.height > 2 ? 2.7 : 2.0;

  flyTo(
    [
      p.x+Math.sin(angle)*distance,
      p.y+obj.height*0.68+1.35,
      p.z+Math.cos(angle)*distance
    ],
    [
      p.x,
      obj.height*0.52,
      p.z
    ]
  );

  $('detail').hidden = false;
  $('detailTitle').textContent =
    obj.label || obj.id;

  const verified =
    itemByCab.get(obj.id) || [];

  const contents = verified.length
    ? verified.map(v => v.name).join(', ')
    : '등록된 기자재 없음';

  $('detailMeta').textContent =
    `관리번호 ${obj.id} · ` +
    `${obj.shelves}단(임시) · ` +
    `${contents} · 실측 전 배치`;

  $('shelfList').replaceChildren();

  for (let j=1;j<=obj.shelves;j++) {
    const button =
      document.createElement('button');

    const names = verified
      .filter(item => {
        if (Array.isArray(item.shelves)) {
          return item.shelves.includes(j);
        }
        return Number(item.shelf) === j;
      })
      .map(item => {
        const count =
          Number.isFinite(item.quantity)
            ? ` (${item.quantity}${item.unit || '개'})`
            : '';

        return item.name + count;
      })
      .join(', ');

    button.textContent =
      j+'단 · '+
      (names || '내부 물품 미등록');

    button.onclick = () => markShelf(j);

    $('shelfList').append(button);
  }

  if (focusItem) {
    if (
      Array.isArray(focusItem.shelves) &&
      focusItem.shelves.length
    ) {
      markShelf(
        Math.max(...focusItem.shelves)
      );
    } else if (focusItem.shelf) {
      markShelf(Number(focusItem.shelf));
    }
  }

  $('doorToggle').textContent =
    obj.target > 0.3
      ? '문 닫기'
      : '보관장 문 열기';
}

// =====================================
// 검색
// =====================================

function search() {
  const q =
    $('search').value.trim().toLowerCase();

  const candidates = cabinetObjects.filter(c => {
    if (!q) return true;

    const basic = [
      c.id,
      c.label,
      c.verifiedContents || ''
    ];

    if (
      basic.some(s =>
        String(s).toLowerCase().includes(q)
      )
    ) {
      return true;
    }

    const items = itemByCab.get(c.id) || [];

    return items.some(item =>
      [
        item.name,
        ...(item.keywords || [])
      ].some(word =>
        String(word).toLowerCase().includes(q)
      )
    );
  });

  $('results').replaceChildren();

  for (const c of candidates) {
    const button =
      document.createElement('button');

    const strong =
      document.createElement('strong');

    strong.textContent =
      c.label || c.id;

    const small =
      document.createElement('small');

    const items =
      itemByCab.get(c.id) || [];

    small.textContent =
      c.id+' · '+
      (
        items.map(i => i.name).join(', ') ||
        '위치 확인용 보관장'
      );

    button.append(strong,small);

    button.onclick = () => {
      const matched = q
        ? items.find(item =>
            [
              item.name,
              ...(item.keywords || [])
            ].some(word =>
              String(word).toLowerCase().includes(q)
            )
          )
        : null;

      selectObject(
        c,
        matched || items[0]
      );
    };

    $('results').append(button);
  }

  if (!candidates.length) {
    const no = document.createElement('p');

    no.textContent =
      '일치하는 보관장이 없습니다.';

    $('results').append(no);
  }
}

// =====================================
// 문 열기 / 닫기
// =====================================

function toggleDoor(obj) {
  obj.target = obj.target > 0.5 ? 0 : 1;

  if (selected === obj) {
    $('doorToggle').textContent =
      obj.target
        ? '문 닫기'
        : '보관장 문 열기';
  }
}

function animateDoors(dt) {
  const speed = Math.min(1,dt*7);

  for (const c of cabinetObjects) {
    c.progress +=
      (c.target-c.progress)*speed;

    if (
      c.kind === 'wood' ||
      c.kind === 'twotier'
    ) {
      c.parts.forEach((p,i) => {
        p.rotation.y =
          (i===0 ? 1 : -1) *
          1.35*c.progress;
      });
    }

    else if (
      c.kind === 'glass' ||
      c.kind === 'tablet'
    ) {
      c.parts.forEach((p,i) => {
        p.position.x =
          (i-0.5)*c.width/2 +
          (i===0 ? 1 : -1) *
          c.width*0.40*c.progress;
      });
    }

    else if (
      c.kind === 'drawer' ||
      c.kind === 'metal2'
    ) {
      c.parts.forEach(p => {
        p.position.z =
          c.depth/2 +
          c.progress*0.38;
      });
    }
  }

  for (const d of doorObjects) {
    d.progress +=
      (d.target-d.progress)*speed;

    d.pivot.rotation.y =
      -d.progress*1.25;
  }
}

// =====================================
// 사용자 조작
// =====================================

function interactions() {
  $('search').addEventListener(
    'input',search
  );

  $('detailClose').onclick = () => {
    $('detail').hidden = true;

    if (selected) {
      selected.frame.visible = false;
      selected.highlight.visible = false;
    }

    selected = null;
  };

  $('doorToggle').onclick = () => {
    if (selected) toggleDoor(selected);
  };

  for (const b of document.querySelectorAll(
    '[data-view]'
  )) {
    b.onclick = () =>
      setView(b.dataset.view);
  }

  $('reset').onclick = () =>
    setView('overview');

  $('fullscreen').onclick = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement
        .requestFullscreen?.();
    }
  };

  $('theme').onclick = () => {
    isDark = !isDark;

    document.body.classList.toggle(
      'dark',isDark
    );

    scene.background.set(
      isDark ? '#152131' : '#eaf2fa'
    );

    $('theme').textContent =
      isDark
        ? '☀ 주간 모드'
        : '🌙 야간 모드';
  };

  const raycaster = new T.Raycaster();
  const pointer = new T.Vector2();

  let down = null;

  renderer.domElement.addEventListener(
    'pointerdown',
    e => {
      down = {
        x:e.clientX,
        y:e.clientY
      };
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

      if (dd > 6) return;

      const rect =
        renderer.domElement.getBoundingClientRect();

      pointer.set(
        ((e.clientX-rect.left)/rect.width)*2-1,
        -((e.clientY-rect.top)/rect.height)*2+1
      );

      raycaster.setFromCamera(
        pointer,camera
      );

      const hit =
        raycaster.intersectObjects(
          pickables,false
        )[0];

      if (!hit) return;

      const id =
        hit.object.userData.owner;

      const cab = findCab(id);

      if (cab) {
        selectObject(cab);
        return;
      }

      const door =
        doorObjects.find(o => o.id===id);

      if (door) {
        door.target =
          door.target>0.5 ? 0 : 1;
      }
    }
  );

  addEventListener('resize',() => {
    renderer.setSize(
      innerWidth,innerHeight
    );

    camera.aspect =
      innerWidth/innerHeight;

    camera.updateProjectionMatrix();
  });
}

// =====================================
// 애니메이션
// =====================================

const clock = new T.Clock();

function frame() {
  requestAnimationFrame(frame);

  const dt = Math.min(
    0.05,
    clock.getDelta()
  );

  animateDoors(dt);

  if (transition) {
    transition.t = Math.min(
      1,
      transition.t+dt*1.7
    );

    const r =
      1-Math.pow(1-transition.t,3);

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

// =====================================
// 시작
// =====================================

draw();
interactions();
search();
frame();

})();
