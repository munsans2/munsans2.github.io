
/*
 문산중학교 과학준비실 전용
 보관장별 기자재 검색 / 선반별 3D 모형
 P-F01·P-F02 위치 교체

 파일: prep/contents.js

 실행 순서:
 Three.js → OrbitControls → layout.js
 → contents.js → common/scene.js

 다른 과학실 및 공통 엔진은 수정하지 않음.
*/

(() => {
  'use strict';

  const T = window.THREE;
  const L = window.MUNSAN_LAB_LAYOUT;

  if (!T || !L || String(L.id).toLowerCase() !== 'prep') {
    return;
  }

  const norm = v =>
    String(v || '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

  const cabinets = [
    ...(L.cabinets || []),
    ...(L.furniture || [])
  ];

  const byId = new Map(
    cabinets.map(c => [norm(c.id), c])
  );

  const find = id => byId.get(norm(id));

  // ========================================
  // 1. P-F01, P-F02 위치 교체
  // ========================================

  const front1 = find('P-F01');
  const front2 = find('P-F02');

  if (front1 && front2) {
    for (const key of ['x', 'z', 'rot']) {
      const before = front1[key];
      front1[key] = front2[key];
      front2[key] = before;
    }

    console.info(
      '[준비실] P-F01 ↔ P-F02 위치 교체 완료'
    );
  } else {
    console.warn(
      '[준비실] P-F01 또는 P-F02를 찾지 못했습니다.'
    );
  }

  // ========================================
  // 2. 기자재 목록 등록
  // ========================================

  /*
   선반이 명시되지 않은 물품은
   위쪽 선반부터 임시 배치한다.

   P-F01은 사용자가 지정한
   1단·2단 실험복, 3단 조리기구를 따른다.
  */

  const specs = [
    [
      'P-L01',
      [
        ['뷰렛'],
        ['분무기'],
        ['바둑']
      ]
    ],
    [
      'P-L02',
      [
        ['비커'],
        ['매스실린더'],
        ['유리기구']
      ]
    ],
    [
      'P-R01',
      [
        ['거울'],
        ['검전기'],
        ['단진자실험']
      ]
    ],
    [
      'P-R02',
      [
        ['나침판'],
        [['전압계', '전류계']],
        ['보일법칙실험기']
      ]
    ],
    [
      'P-R03',
      [
        ['전등'],
        ['연직분포실험기'],
        ['수면파투영장치']
      ]
    ],
    [
      'P-F01',
      [
        ['실험복', [1, 2]],
        ['조리기구', [3]]
      ]
    ],
    [
      'P-F02',
      [
        ['실험키트']
      ]
    ]
  ];

  const labels = {
    'P-L01': '뷰렛·분무기·바둑 보관장',
    'P-L02': '비커·매스실린더·유리기구 보관장',
    'P-R01': '거울·검전기·단진자 보관장',
    'P-R02': '나침판·전압계·보일법칙 보관장',
    'P-R03': '전등·연직분포·수면파 보관장',
    'P-F01': '실험복·조리기구 보관장',
    'P-F02': '실험키트 보관장'
  };

  const newItems = [];
  const updatedIds = new Set();

  for (const [id, entries] of specs) {
    const c = find(id);

    if (!c) {
      console.warn(
        '[준비실] 보관장 번호 확인 필요:',
        id
      );
      continue;
    }

    updatedIds.add(norm(c.id));
    c.label = labels[id];

    if (id === 'P-F01') {
      c.shelves = Math.max(
        3,
        Number(c.shelves) || 0
      );
    }

    const n = Math.max(
      1,
      Number(c.shelves) || 3
    );

    entries.forEach((entry, i) => {
      const names = Array.isArray(entry[0])
        ? entry[0]
        : [entry[0]];

      const specified = Array.isArray(entry[1]);

      const shelves = specified
        ? entry[1]
        : [Math.max(1, n - (i % n))];

      names.forEach(name => {
        newItems.push({
          cabinet: c.id,
          name,

          ...(shelves.length === 1
            ? { shelf: shelves[0] }
            : { shelves }),

          quantity: null,

          keywords: specified
            ? []
            : ['선반 임시 배치'],

          provisionalShelf: !specified
        });
      });
    });
  }

  const previous = Array.isArray(L.inventory)
    ? L.inventory
    : [];

  L.inventory = previous.filter(
    i => !updatedIds.has(norm(i.cabinet))
  ).concat(newItems);

  // ========================================
  // 3. Three.js 재질
  // ========================================

  const originalAdd = T.Object3D.prototype.add;
  const done = new Set();

  let placed = 0;

  const color = (hex, transparent = false) =>
    new T.MeshLambertMaterial({
      color: hex,
      transparent,
      opacity: transparent ? .56 : 1,
      depthWrite: !transparent,

      side: transparent
        ? T.DoubleSide
        : T.FrontSide
    });

  const M = {
    white: color(0xf4f5f6),
    navy: color(0x23364e),
    black: color(0x162332),
    blue: color(0x327ccc),
    cyan: color(0x8dd5e7),
    silver: color(0x98a9b7),
    red: color(0xe05d67),
    green: color(0x55aa87),
    orange: color(0xe6a04c),
    brown: color(0xa78560),
    cream: color(0xf0e5cf),
    yellow: color(0xe9d35e),
    glass: color(0x9ddde8, true),
    darkGlass: color(0x668ba9, true)
  };

  // ========================================
  // 4. 기본 3D 도형
  // ========================================

  function shape(p, geometry, material, x, y, z) {
    const o = new T.Mesh(
      geometry,
      material
    );

    o.position.set(x, y, z);
    originalAdd.call(p, o);

    return o;
  }

  const box = (p, w, h, d, x, y, z, m) =>
    shape(
      p,
      new T.BoxGeometry(w, h, d),
      m, x, y, z
    );

  const cyl = (p, a, b, h, x, y, z, m) =>
    shape(
      p,
      new T.CylinderGeometry(a, b, h, 16),
      m, x, y, z
    );

  const ball = (p, r, x, y, z, m) =>
    shape(
      p,
      new T.SphereGeometry(r, 16, 12),
      m, x, y, z
    );

  function modelGroup(p) {
    const g = new T.Group();
    originalAdd.call(p, g);
    return g;
  }

  // ========================================
  // 5. 뷰렛
  // ========================================

  function burette(p) {
    box(
      p, .30, .025, .18,
      0, .02, 0, M.navy
    );

    cyl(
      p, .015, .015, .42,
      0, .26, 0, M.glass
    );

    cyl(
      p, .023, .023, .045,
      0, .075, 0, M.blue
    );

    box(
      p, .12, .018, .020,
      0, .085, .023, M.silver
    );

    cyl(
      p, .012, .012, .33,
      .12, .20, -.06, M.silver
    );

    box(
      p, .21, .015, .018,
      .01, .36, -.06, M.silver
    );
  }

  // ========================================
  // 6. 분무기
  // ========================================

  function spray(p) {
    cyl(
      p, .095, .10, .28,
      0, .15, 0, M.cyan
    );

    cyl(
      p, .041, .041, .055,
      0, .31, 0, M.white
    );

    box(
      p, .18, .07, .095,
      .06, .37, 0, M.white
    );

    box(
      p, .11, .025, .03,
      .16, .38, 0, M.navy
    );

    box(
      p, .025, .10, .025,
      .035, .30, .07, M.blue
    );
  }

  // ========================================
  // 7. 바둑판
  // ========================================

  function baduk(p) {
    box(
      p, .40, .04, .32,
      0, .05, 0, M.brown
    );

    for (let i = -3; i <= 3; i++) {
      box(
        p, .005, .002, .28,
        i * .047, .073, 0, M.navy
      );

      box(
        p, .36, .002, .005,
        0, .073, i * .04, M.navy
      );
    }

    for (const [x, z, m] of [
      [-.07, -.04, M.black],
      [0, 0, M.white],
      [.06, .06, M.black],
      [-.09, .08, M.white]
    ]) {
      cyl(
        p, .019, .019, .012,
        x, .08, z, m
      );
    }
  }

  // ========================================
  // 8. 비커
  // ========================================

  function beaker(p) {
    cyl(
      p, .115, .105, .27,
      0, .15, 0, M.glass
    );

    cyl(
      p, .100, .100, .015,
      0, .065, 0, M.blue
    );

    for (let i = 0; i < 3; i++) {
      box(
        p, .035, .006, .008,
        .096, .12 + i * .06,
        .067, M.navy
      );
    }
  }

  // ========================================
  // 9. 매스실린더
  // ========================================

  function cylinder(p) {
    cyl(
      p, .055, .055, .40,
      0, .23, 0, M.glass
    );

    cyl(
      p, .11, .11, .016,
      0, .026, 0, M.silver
    );

    for (let i = 0; i < 6; i++) {
      box(
        p, .030, .007, .010,
        .047, .11 + i * .044,
        .035, M.blue
      );
    }
  }

  // ========================================
  // 10. 유리기구
  // ========================================

  function glassSet(p) {
    for (let i = 0; i < 3; i++) {
      const x = -.12 + i * .12;

      cyl(
        p,
        .030 + i * .012,
        .050 + i * .016,
        .22 + i * .04,
        x, .15, 0,
        M.glass
      );
    }
  }

  // ========================================
  // 11. 거울
  // ========================================

  function mirror(p) {
    box(
      p, .37, .30, .018,
      0, .25, 0, M.navy
    );

    box(
      p, .32, .25, .01,
      0, .25, .014, M.glass
    );

    cyl(
      p, .015, .015, .19,
      0, .075, 0, M.silver
    );

    box(
      p, .32, .023, .18,
      0, .023, 0, M.brown
    );
  }

  // ========================================
  // 12. 검전기
  // ========================================

  function electroscope(p) {
    box(
      p, .29, .025, .24,
      0, .025, 0, M.brown
    );

    cyl(
      p, .11, .11, .30,
      0, .20, 0, M.glass
    );

    cyl(
      p, .010, .010, .30,
      0, .34, 0, M.silver
    );

    ball(
      p, .043,
      0, .49, 0, M.red
    );

    const leaf = box(
      p, .014, .15, .010,
      .030, .18, 0, M.yellow
    );

    leaf.rotation.z = .35;
  }

  // ========================================
  // 13. 단진자 실험장치
  // ========================================

  function pendulum(p) {
    box(
      p, .40, .03, .24,
      0, .02, 0, M.navy
    );

    for (const x of [-.16, .16]) {
      cyl(
        p, .012, .012, .43,
        x, .25, 0, M.silver
      );
    }

    box(
      p, .35, .018, .025,
      0, .45, 0, M.silver
    );

    const wire = box(
      p, .008, .30, .008,
      .055, .295, 0, M.silver
    );

    wire.rotation.z = .35;

    ball(
      p, .055,
      .10, .135, 0, M.blue
    );
  }

  // ========================================
  // 14. 나침판
  // ========================================

  function compass(p) {
    cyl(
      p, .15, .15, .07,
      0, .06, 0, M.navy
    );

    cyl(
      p, .13, .13, .01,
      0, .10, 0, M.cream
    );

    const needle = box(
      p, .23, .006, .035,
      0, .115, 0, M.red
    );

    needle.rotation.y = .7;

    ball(
      p, .014,
      0, .13, 0, M.silver
    );
  }

  // ========================================
  // 15. 전압계·전류계
  // ========================================

  function meter(p, kind) {
    box(
      p, .37, .26, .22,
      0, .14, 0, M.white
    );

    box(
      p, .27, .12, .014,
      0, .20, .118, M.cream
    );

    const gauge = cyl(
      p, .07, .07, .01,
      0, .19, .129, M.silver
    );

    gauge.rotation.x = Math.PI / 2;

    const needle = box(
      p, .105, .007, .007,
      .008, .20, .14, M.navy
    );

    needle.rotation.z = .25;

    box(
      p, .047, .05, .014,
      -.095, .06, .12, M.red
    );

    box(
      p, .047, .05, .014,
      .095, .06, .12,
      kind === '전류계' ? M.blue : M.black
    );
  }

  // ========================================
  // 16. 보일법칙 실험기
  // ========================================

  function boyle(p) {
    box(
      p, .39, .035, .23,
      0, .03, 0, M.navy
    );

    cyl(
      p, .045, .045, .33,
      -.075, .24, 0, M.glass
    );

    cyl(
      p, .03, .03, .30,
      -.075, .31, 0, M.silver
    );

    ball(
      p, .045,
      -.075, .45, 0, M.red
    );

    const gauge = cyl(
      p, .080, .080, .028,
      .12, .22, .02, M.silver
    );

    gauge.rotation.x = Math.PI / 2;

    box(
      p, .012, .22, .012,
      .12, .13, 0, M.blue
    );
  }

  // ========================================
  // 17. 전등
  // ========================================

  function lamp(p) {
    box(
      p, .33, .035, .23,
      0, .025, 0, M.navy
    );

    cyl(
      p, .028, .028, .12,
      0, .10, 0, M.silver
    );

    cyl(
      p, .065, .065, .09,
      0, .19, 0, M.silver
    );

    ball(
      p, .095,
      0, .29, 0, M.yellow
    );
  }

  // ========================================
  // 18. 연직분포 실험기
  // ========================================

  function vertical(p) {
    box(
      p, .36, .035, .23,
      0, .025, 0, M.navy
    );

    cyl(
      p, .012, .012, .42,
      0, .25, 0, M.silver
    );

    for (let i = 0; i < 4; i++) {
      box(
        p, .22, .06, .09,
        0, .12 + i * .09, 0,
        [
          M.blue,
          M.green,
          M.yellow,
          M.red
        ][i]
      );
    }
  }

  // ========================================
  // 19. 수면파투영장치
  // ========================================

  function ripple(p) {
    box(
      p, .42, .065, .28,
      0, .045, 0, M.navy
    );

    box(
      p, .36, .012, .23,
      0, .085, 0, M.cyan
    );

    for (let i = 0; i < 3; i++) {
      const ring = shape(
        p,
        new T.TorusGeometry(
          .045 + i * .040,
          .008, 6, 20
        ),
        M.white,
        0, .097, 0
      );

      ring.rotation.x = -Math.PI / 2;
    }

    box(
      p, .023, .33, .023,
      -.15, .24, -.08, M.silver
    );

    box(
      p, .16, .05, .08,
      -.15, .42, -.08, M.blue
    );
  }

  // ========================================
  // 20. 실험복
  // ========================================

  function coat(p) {
    for (let i = -1; i <= 1; i++) {
      const x = i * .21;

      box(
        p, .16, .29, .055,
        x, .19, 0, M.white
      );

      const left = box(
        p, .052, .20, .056,
        x - .105, .235, 0, M.cyan
      );

      left.rotation.z = -.25;

      const right = box(
        p, .052, .20, .056,
        x + .105, .235, 0, M.cyan
      );

      right.rotation.z = .25;

      box(
        p, .010, .21, .009,
        x, .20, .035, M.blue
      );
    }

    box(
      p, .72, .018, .025,
      0, .43, 0, M.silver
    );
  }

  // ========================================
  // 21. 조리기구
  // ========================================

  function utensils(p) {
    box(
      p, .37, .025, .24,
      0, .025, 0, M.brown
    );

    cyl(
      p, .115, .115, .07,
      -.07, .085, 0, M.silver
    );

    box(
      p, .22, .025, .04,
      .11, .09, 0, M.navy
    );

    cyl(
      p, .034, .034, .27,
      .16, .20, -.08, M.silver
    );

    ball(
      p, .055,
      .16, .08, -.08, M.white
    );
  }

  // ========================================
  // 22. 실험키트
  // ========================================

  function kit(p) {
    box(
      p, .35, .18, .25,
      0, .10, 0, M.navy
    );

    box(
      p, .36, .03, .26,
      0, .205, 0, M.blue
    );

    box(
      p, .13, .02, .04,
      0, .095, .14, M.silver
    );
  }

  // ========================================
  // 23. 기자재 이름 → 3D 모형
  // ========================================

  function make(p, name) {
    if (/뷰렛/.test(name)) {
      burette(p);
    } else if (/분무기/.test(name)) {
      spray(p);
    } else if (/바둑/.test(name)) {
      baduk(p);
    } else if (/비커/.test(name)) {
      beaker(p);
    } else if (/매스실린더/.test(name)) {
      cylinder(p);
    } else if (/유리기구/.test(name)) {
      glassSet(p);
    } else if (/거울/.test(name)) {
      mirror(p);
    } else if (/검전기/.test(name)) {
      electroscope(p);
    } else if (/단진자/.test(name)) {
      pendulum(p);
    } else if (/나침판/.test(name)) {
      compass(p);
    } else if (/전압계|전류계/.test(name)) {
      meter(p, name);
    } else if (/보일/.test(name)) {
      boyle(p);
    } else if (/전등/.test(name)) {
      lamp(p);
    } else if (/연직분포/.test(name)) {
      vertical(p);
    } else if (/수면파/.test(name)) {
      ripple(p);
    } else if (/실험복/.test(name)) {
      coat(p);
    } else if (/조리기구/.test(name)) {
      utensils(p);
    } else {
      kit(p);
    }
  }

  // ========================================
  // 24. 선반별 모형 배치
  // ========================================

  function populate(parent, c) {
    const records = newItems.filter(
      i => norm(i.cabinet) === norm(c.id)
    );

    if (!records.length) return;

    const n = Math.max(
      1,
      Number(c.shelves) || 3
    );

    const h = Number(c.height) || 1;
    const w = Number(c.width) || 1;
    const d = Number(c.depth) || .60;

    const step = (h - .10) / n;

    const usableW = Math.max(
      .14, w - .16
    );

    const usableD = Math.max(
      .14, d - .16
    );

    for (let s = 1; s <= n; s++) {
      const onShelf = records.filter(
        i => Array.isArray(i.shelves)
          ? i.shelves.map(Number).includes(s)
          : Number(i.shelf) === s
      );

      if (!onShelf.length) continue;

      const cols = Math.min(
        3,
        onShelf.length
      );

      const rows = Math.ceil(
        onShelf.length / cols
      );

      const cellW = usableW / cols;
      const cellD = usableD / rows;

      for (let i = 0; i < onShelf.length; i++) {
        const item = onShelf[i];
        const p = modelGroup(parent);

        const width = /실험복/.test(item.name)
          ? .75
          : .45;

        const scale = Math.max(
          .15,
          Math.min(
            1.10,
            cellW / width * .90,
            cellD / .34 * .90,
            Math.max(.12, step - .09) / .50
          )
        );

        p.scale.setScalar(scale);

        p.position.set(
          -usableW / 2 +
            cellW * (i % cols + .5),

          .085 + (s - 1) * step,

          -usableD / 2 +
            cellD *
            (Math.floor(i / cols) + .5)
        );

        p.userData.prepItem = item.name;

        make(p, item.name);

        placed++;
      }
    }
  }

  // ========================================
  // 25. 기존 공통 엔진과 연결
  // ========================================

  /*
   과학실 1·2·3과 동일한 방식.

   common/scene.js가 보관장 번호
   Sprite를 추가하는 시점에만 작동.

   기존 엔진 파일을 수정하지 않음.
  */

  T.Object3D.prototype.add = function (...objects) {
    const result = originalAdd.apply(
      this,
      objects
    );

    if (
      done.size === cabinets.length ||
      !objects.some(o => o && o.isSprite)
    ) {
      return result;
    }

    if (
      !this.parent ||
      !this.parent.isGroup ||
      this.children.length < 5
    ) {
      return result;
    }

    const c = cabinets.find(v =>
      !done.has(norm(v.id)) &&

      Math.abs(
        this.position.x - Number(v.x)
      ) < .002 &&

      Math.abs(
        this.position.z - Number(v.z)
      ) < .002 &&

      Math.abs(this.position.y) < .002 &&

      Math.abs(
        this.rotation.y -
        (Number(v.rot) || 0) *
          Math.PI / 180
      ) < .002
    );

    if (!c) return result;

    done.add(norm(c.id));

    try {
      populate(this, c);
    } catch (err) {
      console.error(
        '[준비실 3D]',
        c.id,
        err
      );
    }

    if (done.size === cabinets.length) {
      T.Object3D.prototype.add = originalAdd;

      const hint =
        document.getElementById('hint');

      if (hint) {
        hint.textContent +=
          ` · 기자재 모형 ${placed}개`;
      }

      console.info(
        '[준비실 3D] 보관장',
        done.size,
        '개 / 모형',
        placed,
        '개'
      );
    }

    return result;
  };

  console.info(
    '[준비실] 기자재 등록',
    newItems.length,
    '종 / 보관장',
    updatedIds.size,
    '개'
  );

})();
