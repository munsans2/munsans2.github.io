
/*
  문산중학교 과학실 1
  기자재 3D 모형 확장 - 수정 버전

  적용 대상: science1/models.js

  기존 common/scene.js 수정 없음
  기존 science1/layout.js 수정 없음
  과학실 2·3 및 준비실 영향 없음

  중요:
  index.html에서 반드시
  layout.js -> models.js -> scene.js
  순서로 불러와야 함.
*/

(() => {
  'use strict';

  const T = window.THREE;
  const layout = window.MUNSAN_LAB_LAYOUT;

  if (!T || !layout || layout.id !== 'science1') {
    console.warn('[과학실1] 모형 데이터 준비 실패');
    return;
  }

  const cabinets = [
    ...(layout.cabinets || []),
    ...(layout.furniture || [])
  ];

  const inventory = layout.inventory || [];
  const completed = new Set();

  const originalAdd = T.Object3D.prototype.add;

  const materials = {};

  function material(color, transparent = false) {
    const key = color + '_' + transparent;

    if (!materials[key]) {
      materials[key] = new T.MeshLambertMaterial({
        color,
        transparent,
        opacity: transparent ? 0.65 : 1,
        side: transparent
          ? T.DoubleSide
          : T.FrontSide,
        depthWrite: !transparent
      });
    }

    return materials[key];
  }

  const C = {
    white: material(0xe8eef4),
    dark: material(0x26394e),
    black: material(0x142333),
    silver: material(0x94a8b9),
    blue: material(0x438fdb),
    green: material(0x52ad93),
    red: material(0xd96870),
    yellow: material(0xe7bd55),
    purple: material(0x967cd5),
    wood: material(0xbe956a),
    paper: material(0xe6d5b5),
    glass: material(0x9cd8e9, true),
    screen: material(0x63b4db)
  };

  function mesh(parent, geometry, mat, x, y, z) {
    const object = new T.Mesh(geometry, mat);
    object.position.set(x, y, z);
    originalAdd.call(parent, object);
    return object;
  }

  function box(parent, w, h, d, x, y, z, mat) {
    return mesh(
      parent,
      new T.BoxGeometry(w, h, d),
      mat, x, y, z
    );
  }

  function cylinder(parent, rt, rb, h, x, y, z, mat) {
    return mesh(
      parent,
      new T.CylinderGeometry(rt, rb, h, 16),
      mat, x, y, z
    );
  }

  function sphere(parent, r, x, y, z, mat) {
    return mesh(
      parent,
      new T.SphereGeometry(r, 14, 10),
      mat, x, y, z
    );
  }

  function newGroup(parent) {
    const group = new T.Group();
    originalAdd.call(parent, group);
    return group;
  }

  // 현미경
  function microscope(g) {
    box(g, .28, .035, .23, 0, .018, 0, C.dark);
    box(g, .20, .025, .16, 0, .15, 0, C.silver);

    const arm = box(
      g, .06, .25, .06,
      .06, .27, -.04, C.white
    );
    arm.rotation.z = -.30;

    const head = cylinder(
      g, .052, .052, .13,
      -.06, .38, -.02, C.dark
    );
    head.rotation.z = -.25;

    cylinder(
      g, .025, .025, .13,
      -.07, .28, 0, C.silver
    );

    sphere(g, .035, .07, .26, .03, C.blue);
  }

  // 저울
  function balance(g, name) {
    box(g, .31, .09, .25, 0, .045, 0, C.white);

    if (/접시|앉은뱅이/.test(name)) {
      cylinder(
        g, .12, .12, .025,
        0, .115, 0, C.silver
      );
      cylinder(
        g, .085, .115, .045,
        0, .15, 0, C.silver
      );
    } else {
      cylinder(
        g, .105, .105, .018,
        0, .10, -.025, C.silver
      );
      box(
        g, .13, .035, .012,
        0, .055, .13, C.screen
      );
    }
  }

  // 비커
  function beaker(g) {
    cylinder(
      g, .11, .105, .23,
      0, .115, 0, C.glass
    );

    cylinder(
      g, .095, .095, .012,
      0, .05, 0, C.blue
    );

    for (let i = 0; i < 3; i++) {
      box(
        g, .04, .008, .009,
        .075, .09 + i * .045, .075,
        C.dark
      );
    }
  }

  // 플라스크
  function flask(g, name) {
    if (name.includes('삼각')) {
      cylinder(
        g, .035, .115, .23,
        0, .115, 0, C.glass
      );
    } else if (name.includes('둥근')) {
      sphere(
        g, .105, 0, .13, 0, C.glass
      );
      cylinder(
        g, .035, .035, .13,
        0, .26, 0, C.glass
      );
    } else {
      cylinder(
        g, .075, .075, .21,
        0, .105, 0, C.glass
      );
      cylinder(
        g, .035, .035, .09,
        0, .255, 0, C.glass
      );
    }
  }

  // 시험관
  function testTubes(g) {
    box(
      g, .30, .025, .14,
      0, .04, 0, C.wood
    );

    for (let i = 0; i < 4; i++) {
      const x = -.105 + i * .07;

      cylinder(
        g, .022, .022, .20,
        x, .15, 0, C.glass
      );

      sphere(
        g, .022, x, .055, 0,
        i % 2 ? C.green : C.blue
      );
    }

    box(
      g, .30, .025, .07,
      0, .20, 0, C.wood
    );
  }

  // 온도계
  function thermometer(g) {
    box(
      g, .22, .045, .12,
      0, .023, 0, C.white
    );

    cylinder(
      g, .015, .015, .27,
      0, .18, 0, C.silver
    );

    cylinder(
      g, .007, .007, .18,
      0, .14, .016, C.red
    );

    sphere(
      g, .025, 0, .055, .016, C.red
    );
  }

  // 태블릿
  function tablet(g) {
    box(
      g, .24, .025, .33,
      0, .025, 0, C.black
    );

    box(
      g, .21, .005, .29,
      0, .041, 0, C.screen
    );

    for (let i = 0; i < 3; i++) {
      box(
        g, .055, .006, .055,
        0, .046, -.075 + i * .075,
        [C.blue, C.green, C.purple][i]
      );
    }
  }

  // 실험복
  function labCoat(g) {
    box(
      g, .27, .06, .21,
      0, .03, 0, C.white
    );

    box(
      g, .22, .04, .16,
      0, .08, 0, C.white
    );

    box(
      g, .05, .01, .14,
      0, .105, 0, C.silver
    );
  }

  // 핫플레이트
  function hotplate(g) {
    box(
      g, .31, .09, .26,
      0, .045, 0, C.white
    );

    cylinder(
      g, .10, .10, .015,
      0, .10, -.025, C.dark
    );

    cylinder(
      g, .02, .02, .025,
      .10, .06, .13, C.blue
    );
  }

  // 유리 실험기구
  function glassware(g, name) {
    if (name.includes('페트리')) {
      cylinder(
        g, .13, .13, .035,
        0, .025, 0, C.glass
      );

      cylinder(
        g, .14, .14, .015,
        0, .055, 0, C.glass
      );
    } else {
      cylinder(
        g, .09, .09, .20,
        0, .10, 0, C.glass
      );

      cylinder(
        g, .095, .095, .025,
        0, .21, 0, C.silver
      );
    }
  }

  // 분자 구조 모형
  function molecule(g) {
    sphere(g, .055, 0, .18, 0, C.red);
    sphere(g, .05, -.10, .08, 0, C.blue);
    sphere(g, .05, .10, .08, 0, C.green);

    const a = box(
      g, .02, .14, .02,
      -.05, .13, 0, C.silver
    );
    a.rotation.z = -.8;

    const b = box(
      g, .02, .14, .02,
      .05, .13, 0, C.silver
    );
    b.rotation.z = .8;
  }

  // 실험 키트
  function kit(g) {
    box(
      g, .31, .11, .23,
      0, .055, 0, C.dark
    );

    box(
      g, .31, .025, .23,
      0, .12, 0, C.blue
    );

    box(
      g, .09, .025, .025,
      0, .06, .125, C.silver
    );
  }

  // 일반 소모품 보관 상자
  function storageBox(g, name) {
    let accent = C.blue;

    if (/안전|구급|장갑|마스크|소방|거즈|채혈/.test(name)) {
      accent = C.red;
    } else if (/시험지|크로마토|리트머스|화학|pH/.test(name)) {
      accent = C.green;
    } else if (/색연필|풀|테이프|가위|색칠/.test(name)) {
      accent = C.yellow;
    }

    box(
      g, .28, .16, .22,
      0, .08, 0, C.paper
    );

    box(
      g, .30, .025, .24,
      0, .17, 0, accent
    );

    box(
      g, .14, .06, .01,
      0, .095, .115, C.white
    );
  }

  // 이름에 따라 3D 모형 생성
  function createItem(parent, item) {
    const name = String(item.name || '');
    const g = newGroup(parent);

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

  // 물품이 지정된 선반 확인
  function getShelves(data) {
    const count = Math.max(
      1,
      Number(data.shelves) || 3
    );

    const result = Array.from(
      { length: count },
      () => []
    );

    const items = inventory.filter(
      item => item.cabinet === data.id
    );

    const unassigned = [];

    items.forEach(item => {
      const values = Array.isArray(item.shelves)
        ? item.shelves
        : [item.shelf];

      const valid = values
        .map(Number)
        .filter(n =>
          Number.isInteger(n) &&
          n >= 1 &&
          n <= count
        );

      if (valid.length) {
        valid.forEach(n => {
          result[n - 1].push(item);
        });
      } else {
        unassigned.push(item);
      }
    });

    // 위치가 지정되지 않은 물품만 임시 배치
    unassigned.forEach((item, i) => {
      result[i % count].push(item);
    });

    return result;
  }

  // 보관장 내부 기자재 3D 배치
  function populate(group, data) {
    const count = Math.max(
      1,
      Number(data.shelves) || 3
    );

    const shelves = getShelves(data);

    const h = Number(data.height);
    const w = Number(data.width);
    const d = Number(data.depth);

    const step = (h - .10) / count;

    let total = 0;

    shelves.forEach((items, index) => {
      if (!items.length) return;

      const columns = Math.ceil(
        Math.sqrt(items.length)
      );

      const rows = Math.ceil(
        items.length / columns
      );

      const usableW = Math.max(.10, w - .18);
      const usableD = Math.max(.10, d - .18);

      const cellW = usableW / columns;
      const cellD = usableD / rows;

      const baseY = .075 + index * step;
      const availableH = Math.max(.06, step - .10);

      items.forEach((item, i) => {
        const column = i % columns;
        const row = Math.floor(i / columns);

        const x =
          -usableW / 2 +
          (column + .5) * cellW;

        const z =
          -usableD / 2 +
          (row + .5) * cellD;

        const model = createItem(group, item);

        const scale = Math.min(
          1,
          cellW / .36,
          cellD / .38,
          availableH / .47
        );

        model.scale.setScalar(
          Math.max(.10, scale)
        );

        model.position.set(x, baseY, z);

        // 기자재를 기존 보관장 클릭 대상으로
        // 오인하지 않도록 별도 owner 미지정
        model.userData.itemName = item.name;
        model.userData.cabinet = data.id;

        total++;
      });
    });

    console.info(
      '[과학실1]',
      data.id,
      '3D 기자재',
      total + '종 생성'
    );
  }

  // 핵심 수정:
  // 공통 엔진이 보관장 그룹을 stage에 추가하는
  // 순간을 감지해 해당 그룹에 기자재 삽입.
  //
  // 기존 코드와 달리 빈 그룹 여부에 의존하지 않음.

  T.Object3D.prototype.add = function (...objects) {
    const result = originalAdd.apply(this, objects);

    for (const object of objects) {
      if (!(object instanceof T.Group)) {
        continue;
      }

      // 실제 교실 stage에 배치되는
      // 보관장 그룹인지 확인
      const data = cabinets.find(c => {
        if (completed.has(c.id)) return false;

        const x = Number(c.x);
        const z = Number(c.z);
        const rotation =
          (Number(c.rot) || 0) * Math.PI / 180;

        return (
          Math.abs(object.position.x - x) < .001 &&
          Math.abs(object.position.z - z) < .001 &&
          Math.abs(object.position.y) < .001 &&
          Math.abs(object.rotation.y - rotation) < .001
        );
      });

      if (!data) continue;

      // 교실 stage 바로 아래에 있는
      // 보관장 그룹에만 적용
      if (!object.parent || object.parent !== this) {
        continue;
      }

      completed.add(data.id);

      try {
        populate(object, data);
      } catch (error) {
        console.error(
          '[과학실1] 기자재 모형 생성 오류:',
          data.id,
          error
        );
      }
    }

    return result;
  };

  console.info(
    '[과학실1] 기자재 3D 확장 엔진 연결 완료'
  );

})();
