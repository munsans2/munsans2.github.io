

/*
  문산중학교 과학실 1 전용 기자재 3D 모형

  과학실 2·3의 common/scene.js 수정 불필요

  스크립트 실행 순서:
  three.js
  OrbitControls
  layout.js
  contents.js
  common/scene.js
*/

(() => {
  'use strict';

  const T = window.THREE;
  const layout = window.MUNSAN_LAB_LAYOUT;

  if (!T || !layout || layout.id !== 'science1') {
    return;
  }

  const cabinets = [
    ...(layout.cabinets || []),
    ...(layout.furniture || [])
  ];

  const originalAdd = T.Object3D.prototype.add;
  const completed = new Set();

  let modelCount = 0;

  // ========================================
  // 재질
  // ========================================

  const makeMat = (hex, transparent = false) =>
    new T.MeshLambertMaterial({
      color: hex,
      transparent,
      opacity: transparent ? 0.55 : 1,
      side: transparent
        ? T.DoubleSide
        : T.FrontSide,
      depthWrite: !transparent
    });

  const M = {
    white: makeMat(0xf5f6f2),
    blue: makeMat(0x2478c4),
    navy: makeMat(0x23374c),
    steel: makeMat(0x91a8b8),
    green: makeMat(0x39ad91),
    orange: makeMat(0xf2a548),
    red: makeMat(0xdb5962),
    yellow: makeMat(0xf1d467),
    violet: makeMat(0x8d73d6),
    tan: makeMat(0xc7ad83),
    black: makeMat(0x1a2533),
    glass: makeMat(0xa0e1e9, true),
    lightblue: makeMat(0xc5e8fb)
  };

  // ========================================
  // 기본 도형
  // ========================================

  function addDirect(parent, obj) {
    originalAdd.call(parent, obj);
    return obj;
  }

  function group(parent, x = 0, y = 0, z = 0) {
    const o = addDirect(parent, new T.Group());
    o.position.set(x, y, z);
    return o;
  }

  function shape(parent, geometry, mat, x, y, z) {
    const o = addDirect(
      parent,
      new T.Mesh(geometry, mat)
    );

    o.position.set(x, y, z);
    return o;
  }

  function b(p, w, h, d, x, y, z, m) {
    return shape(
      p,
      new T.BoxGeometry(w, h, d),
      m, x, y, z
    );
  }

  function cyl(p, r1, r2, h, x, y, z, m) {
    return shape(
      p,
      new T.CylinderGeometry(r1, r2, h, 14),
      m, x, y, z
    );
  }

  function ball(p, r, x, y, z, m) {
    return shape(
      p,
      new T.SphereGeometry(r, 12, 9),
      m, x, y, z
    );
  }

  function cone(p, r, h, x, y, z, m) {
    return shape(
      p,
      new T.ConeGeometry(r, h, 12),
      m, x, y, z
    );
  }

  // ========================================
  // 현미경
  // ========================================

  function microscope(p) {
    b(p, .31, .035, .25, 0, .025, 0, M.navy);
    b(p, .23, .025, .18, 0, .18, .005, M.steel);

    const arm = b(
      p, .065, .27, .06,
      .09, .275, -.05, M.white
    );

    arm.rotation.z = -.28;

    const tube = cyl(
      p, .05, .05, .17,
      -.06, .37, -.035, M.navy
    );

    tube.rotation.z = -.28;

    cyl(
      p, .026, .026, .10,
      -.075, .26, 0, M.steel
    );

    ball(p, .04, .11, .28, .065, M.blue);

    cyl(
      p, .027, .027, .025,
      -.075, .47, -.035, M.black
    );
  }

  // ========================================
  // 실험복 - 옷걸이에 걸린 3벌
  // ========================================

  function coat(p) {
    for (let i = -1; i <= 1; i++) {
      const x = i * .285;
      const sub = group(p, x, 0, 0);

      b(
        sub, .205, .31, .065,
        0, .215, 0, M.white
      );

      const l = b(
        sub, .075, .22, .07,
        -.133, .26, 0, M.lightblue
      );

      l.rotation.z = -.28;

      const r = b(
        sub, .075, .22, .07,
        .133, .26, 0, M.lightblue
      );

      r.rotation.z = .28;

      b(
        sub, .028, .24, .008,
        0, .23, .039, M.blue
      );

      b(
        sub, .10, .09, .012,
        .062, .31, .042, M.white
      );

      cyl(
        sub, .009, .009, .09,
        0, .46, 0, M.steel
      );
    }

    b(
      p, .85, .022, .03,
      0, .49, 0, M.steel
    );
  }

  // ========================================
  // 저울
  // ========================================

  function balance(p, name) {
    b(p, .34, .11, .28, 0, .06, 0, M.white);

    cyl(
      p, .12, .12, .017,
      0, .125, -.035, M.steel
    );

    if (/접시|앉은뱅이/.test(name)) {
      cyl(
        p, .10, .125, .055,
        0, .17, -.03, M.steel
      );

      b(
        p, .12, .035, .014,
        0, .065, .149, M.navy
      );
    } else {
      b(
        p, .17, .041, .013,
        0, .07, .15, M.blue
      );

      b(
        p, .14, .017, .006,
        0, .072, .16, M.lightblue
      );
    }
  }

  // ========================================
  // 온도계
  // ========================================

  function thermometer(p) {
    b(p, .26, .06, .13, 0, .03, 0, M.white);

    cyl(
      p, .018, .018, .34,
      0, .23, 0, M.steel
    );

    cyl(
      p, .008, .008, .24,
      0, .16, .020, M.red
    );

    ball(
      p, .025,
      0, .055, .025, M.red
    );

    b(
      p, .14, .055, .015,
      0, .08, .1, M.blue
    );
  }

  // ========================================
  // 유리 실험기구
  // ========================================

  function glassItem(p, name) {
    if (/삼각/.test(name)) {
      cyl(
        p, .045, .15, .31,
        0, .155, 0, M.glass
      );

      cyl(
        p, .045, .045, .045,
        0, .33, 0, M.steel
      );

    } else if (/둥근/.test(name)) {
      ball(
        p, .14,
        0, .19, 0, M.glass
      );

      cyl(
        p, .04, .04, .16,
        0, .39, 0, M.glass
      );

      if (/가지/.test(name)) {
        const branch = cyl(
          p, .017, .017, .18,
          .075, .35, 0, M.steel
        );

        branch.rotation.z = -1.1;
      }

    } else if (/부피플라스크/.test(name)) {
      ball(
        p, .12,
        0, .16, 0, M.glass
      );

      cyl(
        p, .04, .04, .19,
        0, .35, 0, M.glass
      );

    } else if (/분별깔때기/.test(name)) {
      const funnel = cone(
        p, .13, .25,
        0, .28, 0, M.glass
      );

      funnel.rotation.z = Math.PI;

      cyl(
        p, .015, .015, .21,
        0, .075, 0, M.steel
      );

    } else if (/시험관/.test(name)) {
      b(
        p, .33, .025, .15,
        0, .035, 0, M.tan
      );

      for (let i = 0; i < 4; i++) {
        const x = -.12 + i * .08;

        cyl(
          p, .023, .023, .29,
          x, .19, 0, M.glass
        );

        ball(
          p, .022,
          x, .065, 0,
          i % 2 ? M.blue : M.green
        );
      }

      b(
        p, .33, .022, .06,
        0, .28, 0, M.steel
      );

    } else if (
      /페트리|커버글라스|프레파라트/.test(name)
    ) {
      for (let i = 0; i < 3; i++) {
        cyl(
          p, .15, .15, .027,
          0, .02 + i * .046, 0, M.glass
        );
      }

    } else if (/비커|집기병/.test(name)) {
      cyl(
        p, .12, .12, .28,
        0, .14, 0, M.glass
      );

      cyl(
        p, .11, .11, .012,
        0, .06, 0, M.blue
      );

      for (let i = 0; i < 3; i++) {
        b(
          p, .035, .006, .008,
          .11, .11 + i * .055,
          .065, M.navy
        );
      }

    } else {
      cyl(
        p, .065, .065, .39,
        0, .195, 0, M.glass
      );

      cyl(
        p, .067, .067, .012,
        0, .055, 0, M.green
      );
    }
  }

  // ========================================
  // 태블릿
  // ========================================

  function tablet(p) {
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * .105;

      b(
        p, .085, .30, .033,
        x, .18, 0, M.black
      );

      b(
        p, .071, .265, .008,
        x, .18, .021, M.blue
      );

      b(
        p, .032, .032, .009,
        x, .14, .028,
        i % 2 ? M.green : M.orange
      );
    }

    b(
      p, .62, .06, .18,
      0, .045, 0, M.steel
    );
  }

  // ========================================
  // 실험키트
  // ========================================

  function kit(p) {
    b(
      p, .33, .18, .23,
      0, .10, 0, M.navy
    );

    b(
      p, .35, .025, .25,
      0, .20, 0, M.blue
    );

    b(
      p, .12, .025, .035,
      0, .105, .125, M.steel
    );
  }

  // ========================================
  // 핫플레이트
  // ========================================

  function hotplate(p) {
    b(
      p, .34, .12, .29,
      0, .06, 0, M.white
    );

    cyl(
      p, .12, .12, .015,
      0, .13, -.03, M.navy
    );

    cyl(
      p, .027, .027, .03,
      .12, .075, .14, M.orange
    );
  }

  // ========================================
  // 분자구조 모형
  // ========================================

  function molecule(p) {
    ball(
      p, .075,
      0, .28, 0, M.red
    );

    ball(
      p, .065,
      -.12, .12, 0, M.blue
    );

    ball(
      p, .065,
      .12, .12, 0, M.green
    );

    const a = b(
      p, .025, .18, .025,
      -.06, .20, 0, M.steel
    );

    a.rotation.z = -.7;

    const c = b(
      p, .025, .18, .025,
      .06, .20, 0, M.steel
    );

    c.rotation.z = .7;

    b(
      p, .33, .025, .25,
      0, .03, 0, M.tan
    );
  }

  // ========================================
  // 구급함
  // ========================================

  function medicineKit(p) {
    b(
      p, .35, .29, .23,
      0, .165, 0, M.red
    );

    b(
      p, .19, .055, .012,
      0, .18, .12, M.white
    );

    b(
      p, .055, .19, .012,
      0, .18, .128, M.white
    );

    b(
      p, .13, .036, .12,
      0, .33, 0, M.navy
    );
  }

  // ========================================
  // 보안경
  // ========================================

  function goggles(p) {
    b(
      p, .38, .07, .12,
      0, .21, 0, M.navy
    );

    for (const x of [-.105, .105]) {
      b(
        p, .145, .11, .035,
        x, .19, .04, M.lightblue
      );

      b(
        p, .015, .13, .047,
        x + (x < 0 ? -.078 : .078),
        .19, .04, M.navy
      );
    }

    b(
      p, .36, .017, .04,
      0, .265, 0, M.steel
    );
  }

  // ========================================
  // 기타 소모품 상자
  // ========================================

  function container(p, name) {
    const lid =
      /안전|장갑|마스크|채혈|해부|거즈|소방/.test(name)
        ? M.red
        : /화학|리트머스|시험지|pH|크로마토/.test(name)
          ? M.green
          : /색연필|풀|테이프|가위/.test(name)
            ? M.orange
            : M.blue;

    b(
      p, .32, .21, .25,
      0, .12, 0, M.tan
    );

    b(
      p, .34, .04, .27,
      0, .235, 0, lid
    );

    b(
      p, .17, .10, .012,
      0, .125, .13, M.white
    );

    b(
      p, .11, .015, .015,
      0, .12, .14, M.navy
    );
  }

  // ========================================
  // 기자재 종류에 따른 모형 선택
  // ========================================

  function makeModel(parent, name) {
    const p = group(parent);
    const n = String(name || '');

    if (/현미경/.test(n)) {
      microscope(p);

    } else if (/실험복/.test(n)) {
      coat(p);

    } else if (/구급함/.test(n)) {
      medicineKit(p);

    } else if (/보안경/.test(n)) {
      goggles(p);

    } else if (/저울/.test(n)) {
      balance(p, n);

    } else if (/온도계/.test(n)) {
      thermometer(p);

    } else if (
      /삼각플라스크|둥근바닥|부피플라스크|분별깔때기|시험관|페트리|커버글라스|프레파라트|비커|집기병|매스실린더/.test(n)
    ) {
      glassItem(p, n);

    } else if (/갤럭시탭|태블릿/.test(n)) {
      tablet(p);

    } else if (/핫플레이트/.test(n)) {
      hotplate(p);

    } else if (
      /분자구조|기체분자운동/.test(n)
    ) {
      molecule(p);

    } else if (
      /실험키트|불꽃반응키트/.test(n)
    ) {
      kit(p);

    } else {
      container(p, n);
    }

    return p;
  }

  // ========================================
  // 선반별 모형 배치
  // ========================================

  function populate(cabinetGroup, data) {

    // 이전 통합 코드에서 생성된 모형이
    // 남아 있으면 중복 표시 방지
    for (const child of [...cabinetGroup.children]) {
      if (
        child.userData &&
        child.userData.itemName
      ) {
        cabinetGroup.remove(child);
      }
    }

    const items = (layout.inventory || [])
      .filter(i => i.cabinet === data.id);

    if (!items.length) return;

    const shelves = Math.max(
      1,
      Number(data.shelves) || 3
    );

    const step = (data.height - .10) / shelves;

    const freeW = Math.max(
      .12, data.width - .18
    );

    const freeD = Math.max(
      .12, data.depth - .16
    );

    for (let shelf = 1; shelf <= shelves; shelf++) {

      const list = items.filter(i =>
        Array.isArray(i.shelves)
          ? i.shelves.map(Number).includes(shelf)
          : Number(i.shelf) === shelf
      );

      if (!list.length) continue;

      const cols = list.length;
      const cellW = freeW / cols;

      const maxH = Math.max(
        .2,
        step - .085
      );

      list.forEach((item, index) => {

        const model = makeModel(
          cabinetGroup,
          item.name
        );

        const naturalW =
          /실험복/.test(item.name)
            ? .95
            : /갤럭시탭/.test(item.name)
              ? .70
              : .40;

        const naturalH =
          /실험복/.test(item.name)
            ? .52
            : /현미경/.test(item.name)
              ? .52
              : .46;

        const s = Math.min(
          1.22,
          cellW / naturalW * .93,
          freeD / .33,
          maxH / naturalH
        );

        model.scale.setScalar(
          Math.max(.28, s)
        );

        model.position.set(
          -freeW / 2 +
            cellW * (index + .5),

          .095 +
            (shelf - 1) * step,

          .025
        );

        model.userData.itemName = item.name;
        model.userData.cabinetId = data.id;

        modelCount++;
      });
    }
  }

  // ========================================
  // 기존 공통 엔진과 연결
  // ========================================

  /*
    공통 엔진이 보관장을 만들 때
    마지막에 관리번호 Sprite를 추가한다.

    이 시점에는 보관장 본체·선반·문이
    이미 생성된 상태다.

    여기서 과학실 1의 보관장만 찾아
    3D 기자재를 추가한다.
  */

  T.Object3D.prototype.add = function (...objects) {

    const result = originalAdd.apply(
      this,
      objects
    );

    if (completed.size === cabinets.length) {
      return result;
    }

    if (!objects.some(
      o => o && o.isSprite
    )) {
      return result;
    }

    if (
      !this.parent ||
      !this.parent.isGroup
    ) {
      return result;
    }

    const data = cabinets.find(c =>

      !completed.has(c.id) &&

      Math.abs(
        this.position.x - Number(c.x)
      ) < .002 &&

      Math.abs(
        this.position.z - Number(c.z)
      ) < .002 &&

      Math.abs(
        this.rotation.y -
        (Number(c.rot) || 0) *
        Math.PI / 180
      ) < .002 &&

      this.children.length >= 5
    );

    if (!data) return result;

    completed.add(data.id);

    try {
      populate(this, data);
    } catch (error) {
      console.error(
        '[과학실1 3D] 모형 오류:',
        data.id,
        error
      );
    }

    // 모든 보관장 배치가 끝나면
    // Three.js 원래 함수 복구
    if (completed.size === cabinets.length) {

      T.Object3D.prototype.add = originalAdd;

      const hint =
        document.getElementById('hint');

      if (hint) {
        hint.textContent +=
          ` · 기자재 모형 ${modelCount}종`;
      }

      console.info(
        `[과학실1 3D] 보관장 ${completed.size}개 확인, 모형 ${modelCount}종`
      );
    }

    return result;
  };

  console.info(
    '[과학실1 3D] 전용 모형 확장 연결됨'
  );

})();
