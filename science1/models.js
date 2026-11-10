
/*
  문산중학교 과학실 1
  기자재 3D 모형 확장 기능

  - common/scene.js 수정 없음
  - science1/layout.js 수정 없음
  - 기존 3D 보관장 위치 유지
  - 등록 기자재를 선반별로 시각화
  - 실제 물품의 정밀 복제품이 아닌 간략 모형
  - 다른 과학실에는 적용되지 않음
*/

(() => {
  'use strict';

  const T = window.THREE;
  const layout = window.MUNSAN_LAB_LAYOUT;

  if (!T || !layout || layout.id !== 'science1') {
    return;
  }

  const allCabinets = [
    ...(layout.cabinets || []),
    ...(layout.furniture || [])
  ];

  const inventory = layout.inventory || [];

  const originalAdd = T.Group.prototype.add;

  const materialCache = new Map();

  function mat(color, transparent = false) {
    const key = color + ':' + transparent;

    if (!materialCache.has(key)) {
      materialCache.set(
        key,
        new T.MeshLambertMaterial({
          color,
          transparent,
          opacity: transparent ? 0.48 : 1,
          side: transparent ? T.DoubleSide : T.FrontSide,
          depthWrite: !transparent
        })
      );
    }

    return materialCache.get(key);
  }

  const M = {
    white: mat(0xeaf0f5),
    silver: mat(0x9aaebe),
    dark: mat(0x293d52),
    blue: mat(0x438fd6),
    cyan: mat(0x76c9d9),
    green: mat(0x55aa8d),
    yellow: mat(0xe9bf5c),
    red: mat(0xd96d72),
    purple: mat(0x947bd2),
    wood: mat(0xc59c70),
    paper: mat(0xf6e7c9),
    glass: mat(0xb4e4ef, true),
    screen: mat(0x5b9bc9),
    black: mat(0x172536)
  };

  function addMesh(parent, geometry, material, x, y, z) {
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    originalAdd.call(parent, mesh);
    return mesh;
  }

  function box(parent, w, h, d, x, y, z, material) {
    return addMesh(
      parent,
      new T.BoxGeometry(w, h, d),
      material,
      x, y, z
    );
  }

  function cylinder(parent, rt, rb, h, x, y, z, material) {
    return addMesh(
      parent,
      new T.CylinderGeometry(rt, rb, h, 16),
      material,
      x, y, z
    );
  }

  function sphere(parent, r, x, y, z, material) {
    return addMesh(
      parent,
      new T.SphereGeometry(r, 12, 8),
      material,
      x, y, z
    );
  }

  function tube(parent, r, h, x, y, z, material) {
    return cylinder(parent, r, r, h, x, y, z, material);
  }

  function modelGroup(parent) {
    const g = new T.Group();
    originalAdd.call(parent, g);
    return g;
  }

  // 현미경
  function microscope(g) {
    box(g, .25, .035, .20, 0, .018, 0, M.dark);
    box(g, .07, .19, .07, .055, .12, -.035, M.silver);
    box(g, .22, .022, .17, 0, .15, 0, M.dark);

    const arm = box(
      g, .055, .27, .055,
      -.045, .27, -.035, M.white
    );
    arm.rotation.z = -.35;

    const head = cylinder(
      g, .052, .052, .11,
      -.075, .39, -.015, M.dark
    );
    head.rotation.z = -.35;

    tube(g, .025, .13, -.075, .29, .015, M.silver);
    cylinder(g, .035, .035, .025, -.075, .22, .015, M.black);
    sphere(g, .035, .055, .26, .02, M.blue);
  }

  // 전자저울, 접시저울
  function balance(g, name) {
    box(g, .30, .09, .23, 0, .045, 0, M.white);

    if (name.includes('접시') || name.includes('앉은뱅이')) {
      cylinder(g, .11, .11, .025, 0, .105, 0, M.silver);
      cylinder(g, .075, .11, .035, 0, .14, 0, M.silver);
    } else {
      cylinder(g, .105, .105, .018, 0, .10, -.025, M.silver);
      box(g, .13, .035, .012, 0, .055, .122, M.screen);
    }
  }

  // 비커
  function beaker(g) {
    cylinder(g, .115, .105, .22, 0, .11, 0, M.glass);
    cylinder(g, .085, .085, .008, 0, .035, 0, M.cyan);

    for (let i = 0; i < 3; i++) {
      box(
        g, .045, .007, .008,
        .07, .08 + i * .045, .075,
        M.blue
      );
    }
  }

  // 삼각플라스크, 둥근바닥 플라스크
  function flask(g, name) {
    if (name.includes('삼각')) {
      cylinder(g, .035, .115, .22, 0, .11, 0, M.glass);
    } else if (name.includes('둥근')) {
      sphere(g, .105, 0, .13, 0, M.glass);
      tube(g, .035, .13, 0, .26, 0, M.glass);
    } else {
      cylinder(g, .075, .075, .22, 0, .11, 0, M.glass);
      tube(g, .038, .09, 0, .265, 0, M.glass);
    }
  }

  // 시험관
  function testTubes(g) {
    box(g, .30, .025, .13, 0, .04, 0, M.wood);

    for (let i = 0; i < 4; i++) {
      const x = -.105 + i * .07;
      tube(g, .021, .20, x, .145, 0, M.glass);
      sphere(g, .022, x, .045, 0, M.cyan);
    }

    box(g, .30, .02, .06, 0, .19, 0, M.wood);
  }

  // 온도계
  function thermometer(g) {
    box(g, .23, .055, .12, 0, .028, 0, M.white);
    tube(g, .015, .28, 0, .20, 0, M.silver);
    sphere(g, .028, 0, .07, 0, M.red);
    tube(g, .007, .18, 0, .18, .016, M.red);
  }

  // 태블릿
  function tablet(g) {
    const device = box(
      g, .24, .016, .34,
      0, .025, 0, M.black
    );
    device.rotation.y = .10;

    box(g, .21, .004, .30, 0, .035, 0, M.screen);
    box(g, .065, .005, .045, 0, .038, -.07, M.blue);
    box(g, .065, .005, .045, 0, .038, 0, M.green);
    box(g, .065, .005, .045, 0, .038, .07, M.purple);
  }

  // 실험복
  function labCoat(g) {
    box(g, .25, .065, .20, 0, .035, 0, M.white);
    box(g, .19, .04, .14, 0, .085, 0, M.white);
    box(g, .045, .014, .13, 0, .109, .02, M.silver);
  }

  // 보관 상자
  function storageBox(g, name) {
    const lower = name.toLowerCase();

    const accent =
      /안전|장갑|구급|마스크|소방|거즈|채혈/.test(name)
        ? M.red
        : /화학|시험지|크로마토|리트머스|ph/.test(lower)
          ? M.green
          : /색연필|색칠|풀|가위|테이프/.test(name)
            ? M.yellow
            : M.blue;

    box(g, .28, .17, .21, 0, .09, 0, M.paper);
    box(g, .30, .025, .23, 0, .19, 0, accent);
    box(g, .13, .065, .009, 0, .105, .111, M.white);
  }

  // 실험 키트
  function kit(g) {
    box(g, .31, .11, .23, 0, .055, 0, M.dark);
    box(g, .31, .025, .23, 0, .12, 0, M.blue);
    box(g, .09, .025, .025, 0, .055, .125, M.silver);
  }

  // 핫플레이트
  function hotplate(g) {
    box(g, .30, .09, .26, 0, .045, 0, M.white);
    cylinder(g, .095, .095, .012, 0, .095, -.025, M.dark);
    cylinder(g, .022, .022, .022, .10, .055, .13, M.blue);
  }

  // 유리병, 집기병, 페트리접시
  function glassware(g, name) {
    if (name.includes('페트리')) {
      cylinder(g, .13, .13, .035, 0, .025, 0, M.glass);
      cylinder(g, .14, .14, .015, 0, .052, 0, M.glass);
    } else {
      cylinder(g, .09, .09, .20, 0, .10, 0, M.glass);
      cylinder(g, .095, .095, .025, 0, .21, 0, M.silver);
    }
  }

  // 분자 구조 모형
  function molecule(g) {
    sphere(g, .055, 0, .17, 0, M.red);
    sphere(g, .05, -.105, .08, 0, M.blue);
    sphere(g, .05, .105, .08, 0, M.green);

    const left = box(
      g, .025, .15, .025,
      -.052, .125, 0, M.silver
    );
    left.rotation.z = -.85;

    const right = box(
      g, .025, .15, .025,
      .052, .125, 0, M.silver
    );
    right.rotation.z = .85;
  }

  // 물품 이름에 따른 모형 선택
  function createModel(parent, name) {
    const g = modelGroup(parent);

    if (/현미경/.test(name)) {
      microscope(g);
    } else if (/저울/.test(name)) {
      balance(g, name);
    } else if (/비커|매스실린더/.test(name)) {
      beaker(g);
    } else if (/플라스크/.test(name)) {
      flask(g, name);
    } else if (/시험관/.test(name)) {
      testTubes(g);
    } else if (/온도계/.test(name)) {
      thermometer(g);
    } else if (/갤럭시탭|태블릿/.test(name)) {
      tablet(g);
    } else if (/실험복/.test(name)) {
      labCoat(g);
    } else if (/핫플레이트/.test(name)) {
      hotplate(g);
    } else if (/실험키트|불꽃반응키트/.test(name)) {
      kit(g);
    } else if (/페트리접시|집기병|커버글라스/.test(name)) {
      glassware(g, name);
    } else if (/분자구조|기체분자운동/.test(name)) {
      molecule(g);
    } else {
      storageBox(g, name);
    }

    return g;
  }

  // 기자재가 실제로 차지하는 높이의 대략적 기준
  function modelHeight(name) {
    if (/현미경/.test(name)) return .45;
    if (/온도계/.test(name)) return .35;
    if (/분자구조|기체분자운동/.test(name)) return .25;
    if (/플라스크/.test(name)) return .35;
    if (/시험관/.test(name)) return .25;
    return .23;
  }

  // 지정된 선반별 물품 목록 구성
  function getShelfItems(data) {
    const count = Math.max(1, data.shelves || 3);

    const result = Array.from(
      { length: count },
      () => []
    );

    const items = inventory.filter(
      item => item.cabinet === data.id
    );

    const unassigned = [];

    items.forEach(item => {
      const shelves = Array.isArray(item.shelves)
        ? item.shelves
        : [item.shelf];

      const valid = shelves
        .map(Number)
        .filter(n =>
          Number.isInteger(n) &&
          n >= 1 &&
          n <= count
        );

      if (valid.length) {
        valid.forEach(n => result[n - 1].push(item));
      } else {
        unassigned.push(item);
      }
    });

    // 선반 정보가 없는 물품만 임시 분산
    unassigned.forEach((item, i) => {
      result[i % count].push(item);
    });

    return result;
  }

  // 보관장 내부 기자재 배치
  function populateCabinet(group, data) {
    const count = Math.max(1, data.shelves || 3);

    const shelfItems = getShelfItems(data);

    const usableHeight = data.height - .10;
    const step = usableHeight / count;

    shelfItems.forEach((items, shelfIndex) => {
      if (!items.length) return;

      const baseY = .05 + shelfIndex * step + .025;
      const availableHeight = step - .07;

      // 한 선반에 많은 물품이 있어도
      // 모두 표시하도록 격자형 배치
      const columns = Math.max(
        1,
        Math.ceil(Math.sqrt(items.length))
      );

      const rows = Math.ceil(items.length / columns);

      const innerWidth = Math.max(.10, data.width - .18);
      const innerDepth = Math.max(.10, data.depth - .15);

      const cellW = innerWidth / columns;
      const cellD = innerDepth / rows;

      items.forEach((item, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);

        const x =
          -innerWidth / 2 +
          cellW * (col + .5);

        const z =
          -innerDepth / 2 +
          cellD * (row + .5);

        const model = createModel(group, item.name);

        const scale = Math.min(
          1,
          cellW / .37,
          cellD / .39,
          availableHeight / modelHeight(item.name)
        );

        model.scale.setScalar(
          Math.max(.12, scale)
        );

        model.position.set(x, baseY, z);
      });
    });
  }

  // 기존 엔진의 보관장 생성 시점에만
  // 해당 보관장 내부에 모형을 삽입
  const populated = new Set();

  T.Group.prototype.add = function (...objects) {
    const result = originalAdd.apply(this, objects);

    for (const object of objects) {
      if (!(object instanceof T.Group)) continue;

      // 비어 있는 그룹만 검사
      if (object.children.length !== 0) continue;

      const data = allCabinets.find(c =>
        Math.abs(object.position.x - c.x) < .0001 &&
        Math.abs(object.position.z - c.z) < .0001 &&
        Math.abs(object.position.y) < .0001 &&
        Math.abs(
          object.rotation.y -
          (c.rot || 0) * Math.PI / 180
        ) < .0001
      );

      if (!data || populated.has(data.id)) continue;

      populated.add(data.id);

      try {
        populateCabinet(object, data);
      } catch (error) {
        console.error(
          '[과학실1 기자재 모형 오류]',
          data.id,
          error
        );
      }
    }

    return result;
  };

  console.info(
    '[과학실1] 기자재 3D 모형 기능 준비 완료'
  );

})();
