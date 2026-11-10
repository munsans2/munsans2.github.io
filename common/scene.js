
/*
  문산중학교 과학실 1·2·3 공통 3D 엔진
  Three.js r128 + OrbitControls

  수정 사항
  1. 유리 수납장 문 열림 수정
  2. 보관장 선택 시 카메라 거리 조정
  3. 상세정보 글자 중복 및 겹침 방지
  4. MBL 센서 7종 및 케이스 5개 표시
  5. MBL 상단 3·4단 혼합 보관
  6. 기존 과학실 배치, 검색, 시점, 전자칠판 유지
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

  camera.position.set(10.3, 10.5, 15.3);

  const renderer = new T.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  });

  renderer.outputEncoding = T.sRGBEncoding;
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.75)
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
  orbit.minDistance = 1.5;
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

  // ========================================
  // 재질
  // ========================================

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
      color
    });
  });

  mats.glass = new T.MeshBasicMaterial({
    color: 0xa3d5e5,
    transparent: true,
    opacity: 0.28,
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

  // ========================================
  // 기본 데이터
  // ========================================

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

  // ========================================
  // 기본 도형
  // ========================================

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
    return sprite;
  }

  // ========================================
  // 벽
  // ========================================

  function segment(wall, start, end, y0, y1) {
    if (end - start <= 0.006) return;
    if (y1 - y0 <= 0.006) return;

    if (wall === 'left') {
      cube(
        stage,
        0.1, y1-y0, end-start,
        -W/2, (y0+y1)/2, (start+end)/2,
        mats.walls
      );
    }

    if (wall === 'right') {
      cube(
        stage,
        0.1, y1-y0, end-start,
        W/2, (y0+y1)/2, (start+end)/2,
        mats.walls
      );
    }

    if (wall === 'far') {
      cube(
        stage,
        end-start, y1-y0, 0.1,
        (start+end)/2, (y0+y1)/2, -D/2,
        mats.walls
      );
    }

    if (wall === 'near') {
      cube(
        stage,
        end-start, y1-y0, 0.1,
        (start+end)/2, (y0+y1)/2, D/2,
        mats.walls
      );
    }
  }

  function makeWalls() {
    cube(
      stage,
      W, 0.10, D,
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
      W / gridSize,
      1,
      D / gridSize
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
        .sort((a,b) => a.start-b.start);

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

      segment(wall, cursor, B, 0, height);
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

    for (const p of config.partitions || []) {
      cube(
        stage,
        p.width, p.height, p.depth,
        p.x, p.height/2, p.z,
        mats.walls
      );
    }
  }

  // ========================================
  // 출입문
  // ========================================

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
      pivot,
      w-0.08, 2.22, 0.05,
      (w-0.08)/2, 1.14, 0,
      mats.wood, door.id
    );

    cube(
      pivot,
      w*0.56, 1.0, 0.063,
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

  // ========================================
  // MBL 센서 3D 모형
  // 과학실 2의 S2-L-G04 전용
  // ========================================

  function makeMBLContents(group, data) {
    const h = data.height;
    const step = (h-0.10)/4;

    // 선반은 아래부터 1, 2, 3, 4단
    // 3단 및 4단에 혼합 보관

    const y3 = 0.05 + step*2 + 0.04;
    const y4 = 0.05 + step*3 + 0.04;

    const sensorTypes = [
      {name:'전압 센서(MBL)', color:0x438dd4},
      {name:'전류 센서(MBL)', color:0x46b8a2},
      {name:'힘 가속도 센서(MBL)', color:0xe6a84b},
      {name:'무선 온도 센서(MBL)', color:0xc66bc8},
      {name:'무선 산소 센서(MBL)', color:0x53a6db},
      {name:'무선 이산화탄소 센서(MBL)', color:0x7e8c9f},
      {name:'조도 센서(MBL)', color:0xe4cb4d}
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

      cube(
        model,
        0.18, 0.11, 0.13,
        0, 0.055, 0,
        mats.mblSensor
      );

      cube(
        model,
        0.13, 0.028, 0.014,
        0, 0.075, 0.073,
        accent
      );

      cube(
        model,
        0.055, 0.045, 0.035,
        0, 0.045, -0.078,
        mats.mblDark
      );
    }

    // 4단 : 케이스 3개 + 센서 4종

    for (const x of [-0.25, 0, 0.25]) {
      addCase(x, y4, -0.09, 0.72);
    }

    sensorTypes.slice(0,4).forEach((type,i) => {
      addSensor(
        -0.30+i*0.20,
        y4,
        0.12,
        type,
        0.65
      );
    });

    // 3단 : 케이스 2개 + 센서 3종

    for (const x of [-0.16, 0.16]) {
      addCase(x, y3, -0.09, 0.80);
    }

    sensorTypes.slice(4).forEach((type,i) => {
      addSensor(
        -0.23+i*0.23,
        y3,
        0.12,
        type,
        0.70
      );
    });
  }

  // ========================================
  // 보관장 생성
  // ========================================

  function cabinet(data) {
    const g = new T.Group();

    g.position.set(data.x, 0, data.z);
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
      data.kind === 'twotier' ||
      data.kind === 'wood24'
        ? mats.wood
        : data.kind === 'metal2'
          ? mats.steelLight
          : mats.white;

    // 본체

    cube(
      g, w, h, 0.055,
      0, h/2, -d/2,
      finish, id
    );

    cube(
      g, 0.078, h, d,
      -w/2, h/2, 0,
      finish, id
    );

    cube(
      g, 0.078, h, d,
      w/2, h/2, 0,
      finish, id
    );

    cube(
      g, w, 0.095, d,
      0, 0.048, 0,
      finish, id
    );

    cube(
      g, w, 0.095, d,
      0, h-0.048, 0,
      finish, id
    );

    const ys = [];
    const shelfCount = Math.max(1, n || 3);

    for (let j=1; j<shelfCount; j++) {
      const sy =
        0.05+(h-0.1)*j/shelfCount;

      cube(
        g,
        w-0.10, 0.047, d-0.10,
        0, sy, 0,
        data.kind === 'wood' ||
        data.kind === 'wood24'
          ? mats.woodLight
          : mats.white,
        id
      );

      ys.push(sy);
    }

    // 24칸 개방형 수납장 구분

    if (data.kind === 'wood24') {
      for (const x of [-w/4, 0, w/4]) {
        cube(
          g,
          0.035, h-0.12, d-0.10,
          x, h/2, 0,
          mats.woodLight,
          id
        );
      }
    }

    // MBL 모형은 지정된 장에만 생성

    if (
      config.id === 'science2' &&
      id === 'S2-L-G04'
    ) {
      makeMBLContents(g, data);
    }

    const parts = [];

    // 목재 양문형

    if (
      data.kind === 'wood' ||
      data.kind === 'twotier'
    ) {
      for (let i=0; i<2; i++) {
        const sign = i===0 ? -1 : 1;
        const p = new T.Group();

        p.position.x =
          sign*(w/2-0.035);
        p.position.z = d/2;
        g.add(p);

        cube(
          p,
          w/2-0.07,
          h-0.14,
          0.06,
          -sign*(w/4-0.035),
          h/2,
          0,
          mats.wood,
          id
        );

        cube(
          p,
          0.028, 0.18, 0.070,
          -sign*(w/2-0.13),
          h/2,
          0.058,
          mats.steel,
          id
        );

        parts.push(p);
      }
    }

    // 철제 2단 서랍장

    else if (data.kind === 'metal2') {
      for (let j=0; j<2; j++) {
        const p = new T.Group();

        p.position.set(
          0,
          (j+0.5)*h/2,
          d/2
        );

        g.add(p);

        cube(
          p,
          w-0.11,
          h/2-0.04,
          0.055,
          0, 0, 0,
          mats.steelLight,
          id
        );

        cube(
          p,
          0.23, 0.027, 0.07,
          0, 0, 0.045,
          mats.steel,
          id
        );

        parts.push(p);
      }
    }

    // 2열 3단 서랍장

    else if (data.kind === 'drawer') {
      for (let j=0; j<3; j++) {
        for (let i=0; i<2; i++) {
          const p = new T.Group();

          p.position.set(
            (i-0.5)*w/2,
            (j+0.5)*h/3,
            d/2
          );

          g.add(p);

          cube(
            p,
            w/2-0.08,
            h/3-0.027,
            0.055,
            0, 0, 0,
            mats.white,
            id
          );

          cube(
            p,
            0.18, 0.024, 0.07,
            0, 0, 0.04,
            mats.steel,
            id
          );

          parts.push(p);
        }
      }
    }

    // 유리장 및 태블릿장
    // 문을 양옆으로 이동하도록 수정

    else if (
      data.kind === 'glass' ||
      data.kind === 'tablet'
    ) {
      for (let i=0; i<2; i++) {
        const p = new T.Group();

        p.position.set(
          (i-0.5)*w/2,
          0,
          d/2
        );

        g.add(p);

        cube(
          p,
          w/2-0.06,
          h-0.13,
          0.036,
          0, h/2, 0,
          data.kind === 'tablet'
            ? mats.tablet
            : mats.glass,
          id
        );

        if (data.kind === 'glass') {
          cube(
            p,
            0.045, h-0.13, 0.035,
            -w/4+0.035,
            h/2,
            0.01,
            mats.white,
            id
          );

          cube(
            p,
            0.045, h-0.13, 0.035,
            w/4-0.035,
            h/2,
            0.01,
            mats.white,
            id
          );

          // 손잡이

          cube(
            p,
            0.025, 0.16, 0.055,
            i===0 ? w/4-0.09 : -w/4+0.09,
            h*0.50,
            0.065,
            mats.steel,
            id
          );
        }

        parts.push(p);
      }
    }

    // 관리번호 표시

    label(
      g, id,
      0, h+0.23, 0,
      1.16
    );

    // 선택 테두리

    const frame = new T.LineSegments(
      new T.EdgesGeometry(
        new T.BoxGeometry(
          w+0.15,
          h+0.16,
          d+0.15
        )
      ),
      new T.LineBasicMaterial({
        color: 0x198aff,
        depthTest: false
      })
    );

    frame.position.set(0, h/2, 0);
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
        color: 0xf5a623,
        depthTest: false
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
      progress: 0,
      target: 0,
      type: 'cabinet'
    });
  }

  // ========================================
  // 학생 실험대 및 교사용 실험대
  // ========================================

  function makeDesks() {
    const desks = config.desks;

    if (desks) {
      for (const z of desks.rows) {
        for (const x of desks.columns) {
          const g = new T.Group();

          g.position.set(x, 0, z);
          stage.add(g);

          cube(
            g,
            desks.width,
            0.075,
            desks.depth,
            0, 0.80, 0,
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
                g,
                0.07, 0.76, 0.07,
                xx, 0.38, zz,
                mats.steel
              );
            }
          }

          cube(
            g,
            desks.width*0.85,
            0.45,
            0.055,
            0, 0.52,
            -desks.depth*0.40,
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
                g,
                0.40, 0.06, 0.40,
                xx, 0.50, zc,
                mats.chair
              );

              cube(
                g,
                0.40, 0.32, 0.06,
                xx, 0.70,
                zc+side*0.17,
                mats.chair
              );

              for (const lx of [-0.13,0.13]) {
                for (const lz of [-0.13,0.13]) {
                  cube(
                    g,
                    0.035, 0.45, 0.035,
                    xx+lx,
                    0.225,
                    zc+lz,
                    mats.steel
                  );
                }
              }
            }
          }
        }
      }
    }

    const t = config.teacher;

    if (t) {
      const p = new T.Group();

      p.position.set(t.x, 0, t.z);
      stage.add(p);

      cube(
        p,
        t.width, 0.085, t.depth,
        0, 0.94, 0,
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
            p,
            0.075, 0.89, 0.075,
            xx, 0.45, zz,
            mats.steel
          );
        }
      }

      cube(
        p,
        t.width*0.82,
        0.52,
        0.08,
        0, 0.58,
        -t.depth*0.42,
        mats.white
      );

      const pcX =
        -Math.min(0.43,t.width*0.24);

      // 컴퓨터 모니터

      cube(
        p,
        0.61, 0.40, 0.065,
        pcX, 1.38, -0.08,
        mats.dark
      );

      cube(
        p,
        0.54, 0.33, 0.012,
        pcX, 1.38, -0.12,
        new T.MeshBasicMaterial({
          color: 0x245477
        })
      );

      // 받침대

      cube(
        p,
        0.045, 0.17, 0.045,
        pcX, 1.10, -0.08,
        mats.steel
      );

      cube(
        p,
        0.30, 0.025, 0.20,
        pcX, 1.01, -0.08,
        mats.steelLight
      );

      // 키보드

      cube(
        p,
        0.49, 0.025, 0.15,
        pcX, 0.995, 0.23,
        mats.steelLight
      );

      // 마우스

      cube(
        p,
        0.075, 0.035, 0.12,
        pcX+0.38, 0.995, 0.23,
        mats.white
      );

      // 본체

      cube(
        p,
        0.21, 0.42, 0.36,
        t.width*0.32,
        0.26, -0.08,
        mats.dark
      );

      label(
        p,
        '교사용 컴퓨터',
        pcX, 1.84, -0.08,
        1.25
      );
    }

    // 전자칠판

    const board = new T.Group();

    board.position.set(
      Math.min(W/2-1.85,2.0),
      0,
      D/2-0.22
    );

    stage.add(board);

    cube(
      board,
      3.05, 1.76, 0.11,
      0, 1.93, 0,
      mats.dark
    );

    cube(
      board,
      2.88, 1.59, 0.018,
      0, 1.93, -0.068,
      new T.MeshBasicMaterial({
        color: 0x1b4967,
        side: T.DoubleSide
      })
    );

    cube(
      board,
      2.55, 0.025, 0.022,
      0, 1.48, -0.082,
      mats.blue
    );

    label(
      board,
      '전자칠판',
      0, 3.10, 0,
      1.20
    );
  }

  // ========================================
  // 공간 생성
  // ========================================

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

  // ========================================
  // 카메라
  // ========================================

  const findCab = id =>
    cabinetObjects.find(c => c.id === id);

  function flyTo(pos, target) {
    transition = {
      from: camera.position.clone(),
      to: new T.Vector3(...pos),
      a: orbit.target.clone(),
      b: new T.Vector3(...target),
      t: 0
    };
  }

  const views = {
    overview: {
      pos: [10.3,10.5,15.3],
      look: [0,0.7,-0.15]
    },
    left: {
      pos: [-7.1,4.9,6.8],
      look: [-3.6,1.0,0]
    },
    back: {
      pos: [0.5,4.3,-1.2],
      look: [0,1.3,-5.9]
    },
    window: {
      pos: [7.8,4.2,3.1],
      look: [4,1.0,-0.15]
    },
    top: {
      pos: [0,17,0.01],
      look: [0,0.1,0]
    }
  };

  function setView(view) {
    const v = views[view];
    if (!v) return;

    flyTo(v.pos, v.look);

    document.querySelectorAll(
      '[data-view]'
    ).forEach(b => {
      b.classList.toggle(
        'active',
        b.dataset.view === view
      );
    });
  }

  // ========================================
  // 선반 강조
  // ========================================

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

    const shelfList = $('shelfList');

    if (shelfList) {
      Array.from(shelfList.children).forEach(
        (b,i) => {
          b.classList.toggle(
            'active',
            i === j-1
          );
        }
      );
    }
  }

  // ========================================
  // 보관장 선택
  // ========================================

  function selectObject(obj, focusItem) {
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

    // 기존보다 멀리서 보도록 조정
    // 보관장 전체가 화면에 들어오도록 함

    const distance =
      obj.height > 2 ? 4.2 : 3.2;

    const cameraY =
      obj.height > 2 ? 3.1 : 2.3;

    flyTo(
      [
        p.x+Math.sin(angle)*distance,
        cameraY,
        p.z+Math.cos(angle)*distance
      ],
      [
        p.x,
        obj.height*0.52,
        p.z
      ]
    );

    const detail = $('detail');
    if (detail) {
      detail.hidden = false;
      detail.scrollTop = 0;
    }

    const title = $('detailTitle');
    if (title) {
      title.textContent =
        obj.label || obj.id;
    }

    const verified =
      itemByCab.get(obj.id) || [];

    const isMBL =
      config.id === 'science2' &&
      obj.id === 'S2-L-G04';

    const meta = $('detailMeta');

    if (meta) {
      if (isMBL) {
        meta.textContent =
          '관리번호 S2-L-G04 · ' +
          'MBL 센서 7종 · ' +
          '보관 케이스 5개 · ' +
          '상단 3~4단 혼합 보관';
      } else {
        meta.textContent =
          `관리번호 ${obj.id} · ` +
          `${obj.shelves}단 수납장 · ` +
          (
            verified.length
              ? `등록 기자재 ${verified.length}종`
              : '내부 물품 미등록'
          );
      }
    }

    const shelfList = $('shelfList');

    if (shelfList) {
      shelfList.replaceChildren();

      for (let j=1; j<=obj.shelves; j++) {
        const button =
          document.createElement('button');

        const items = verified.filter(item => {
          if (Array.isArray(item.shelves)) {
            return item.shelves.includes(j);
          }

          return Number(item.shelf) === j;
        });

        // MBL은 상단 두 칸 혼합 보관이므로
        // 같은 긴 목록을 두 번 반복하지 않음

        if (isMBL && (j === 3 || j === 4)) {
          button.textContent =
            j + '단 · MBL 센서 및 보관 케이스 ' +
            '(상단 2칸 혼합 보관)';
        } else if (items.length) {
          button.textContent =
            j + '단 · ' +
            items.map(item => {
              const count =
                Number.isFinite(item.quantity)
                  ? ` (${item.quantity}${item.unit || '개'})`
                  : '';

              return item.name + count;
            }).join(', ');
        } else {
          button.textContent =
            j + '단 · 내부 물품 미등록';
        }

        button.onclick = () => markShelf(j);
        shelfList.append(button);
      }

      // MBL 상세 목록을 별도 표시
      // 기존 선반 버튼을 가리지 않음

      if (isMBL) {
        const heading =
          document.createElement('div');

        heading.textContent =
          '등록된 MBL 기자재';

        heading.style.fontWeight = '700';
        heading.style.fontSize = '13px';
        heading.style.marginTop = '10px';
        heading.style.marginBottom = '4px';

        shelfList.append(heading);

        const list =
          document.createElement('div');

        list.style.fontSize = '12px';
        list.style.lineHeight = '1.8';
        list.style.padding = '10px';
        list.style.borderRadius = '10px';
        list.style.background =
          'rgba(120,160,205,.10)';
        list.style.overflowWrap = 'anywhere';

        for (const item of verified) {
          const line =
            document.createElement('div');

          const count =
            Number.isFinite(item.quantity)
              ? ` · ${item.quantity}${item.unit || '개'}`
              : '';

          line.textContent =
            '• ' + item.name + count;

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
        markShelf(
          Math.max(...focusItem.shelves)
        );
      } else if (focusItem.shelf) {
        markShelf(Number(focusItem.shelf));
      }
    }

    const toggle = $('doorToggle');

    if (toggle) {
      toggle.textContent =
        obj.target > 0.3
          ? '문 닫기'
          : '보관장 문 열기';

      toggle.disabled = obj.parts.length === 0;

      if (obj.parts.length === 0) {
        toggle.textContent =
          '개방형 수납장';
      }
    }
  }

  // ========================================
  // 검색
  // ========================================

  function search() {
    const searchInput = $('search');
    const results = $('results');

    if (!searchInput || !results) return;

    const q =
      searchInput.value.trim().toLowerCase();

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

      const items =
        itemByCab.get(c.id) || [];

      return items.some(item =>
        [
          item.name,
          ...(item.keywords || [])
        ].some(word =>
          String(word).toLowerCase().includes(q)
        )
      );
    });

    results.replaceChildren();

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

      // 검색 목록에도 센서 전체 이름을
      // 한 줄에 출력하지 않음

      if (
        config.id === 'science2' &&
        c.id === 'S2-L-G04'
      ) {
        small.textContent =
          'S2-L-G04 · MBL 센서 7종 · ' +
          '케이스 5개 · 상단 2칸';
      } else {
        small.textContent =
          c.id + ' · ' +
          (
            items.length
              ? `등록 기자재 ${items.length}종`
              : '위치 확인용 보관장'
          );
      }

      button.append(strong, small);

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
          matched || null
        );
      };

      results.append(button);
    }

    if (!candidates.length) {
      const no =
        document.createElement('p');

      no.textContent =
        '일치하는 보관장이 없습니다.';

      results.append(no);
    }
  }

  // ========================================
  // 문 열기 / 닫기
  // ========================================

  function toggleDoor(obj) {
    if (!obj || !obj.parts.length) return;

    obj.target =
      obj.target > 0.5 ? 0 : 1;

    if (selected === obj) {
      const toggle = $('doorToggle');

      if (toggle) {
        toggle.textContent =
          obj.target
            ? '문 닫기'
            : '보관장 문 열기';
      }
    }
  }

  function animateDoors(dt) {
    const speed = Math.min(1, dt*7);

    for (const c of cabinetObjects) {
      c.progress +=
        (c.target-c.progress)*speed;

      // 목재 양문형

      if (
        c.kind === 'wood' ||
        c.kind === 'twotier'
      ) {
        c.parts.forEach((p,i) => {
          p.rotation.y =
            (i===0 ? -1 : 1) *
            1.35*c.progress;
        });
      }

      // 유리장: 양쪽으로 슬라이딩
      // 기존 중앙으로 모이던 문제 수정

      else if (
        c.kind === 'glass' ||
        c.kind === 'tablet'
      ) {
        c.parts.forEach((p,i) => {
          const initial =
            (i-0.5)*c.width/2;

          const direction =
            i===0 ? -1 : 1;

          p.position.x =
            initial +
            direction *
            c.width*0.40*c.progress;
        });
      }

      // 서랍장: 앞쪽으로 이동

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

  // ========================================
  // 사용자 조작
  // ========================================

  function interactions() {
    const searchInput = $('search');

    if (searchInput) {
      searchInput.addEventListener(
        'input',
        search
      );
    }

    const detailClose = $('detailClose');

    if (detailClose) {
      detailClose.onclick = () => {
        const detail = $('detail');

        if (detail) {
          detail.hidden = true;
        }

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
        if (selected) {
          toggleDoor(selected);
        }
      };
    }

    for (const b of document.querySelectorAll(
      '[data-view]'
    )) {
      b.onclick = () =>
        setView(b.dataset.view);
    }

    const reset = $('reset');

    if (reset) {
      reset.onclick = () =>
        setView('overview');
    }

    const fullscreen = $('fullscreen');

    if (fullscreen) {
      fullscreen.onclick = () => {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement
            .requestFullscreen?.();
        }
      };
    }

    const theme = $('theme');

    if (theme) {
      theme.onclick = () => {
        isDark = !isDark;

        document.body.classList.toggle(
          'dark',
          isDark
        );

        scene.background.set(
          isDark ? '#152131' : '#eaf2fa'
        );

        theme.textContent =
          isDark
            ? '☀ 주간 모드'
            : '🌙 야간 모드';
      };
    }

    // 3D 물체 클릭

    const raycaster = new T.Raycaster();
    const pointer = new T.Vector2();

    let down = null;

    renderer.domElement.addEventListener(
      'pointerdown',
      e => {
        down = {
          x: e.clientX,
          y: e.clientY
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
          pointer,
          camera
        );

        const hit =
          raycaster.intersectObjects(
            pickables,
            false
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
            door.target > 0.5 ? 0 : 1;
        }
      }
    );

    addEventListener('resize', () => {
      renderer.setSize(
        innerWidth,
        innerHeight
      );

      camera.aspect =
        innerWidth/innerHeight;

      camera.updateProjectionMatrix();
    });
  }

  // ========================================
  // 애니메이션
  // ========================================

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

      if (transition.t >= 1) {
        transition = null;
      }
    }

    orbit.update();
    renderer.render(scene,camera);
  }

  // ========================================
  // 시작
  // ========================================

  draw();
  interactions();
  search();
  frame();

})();
