
/*
 * 문산중학교 과학실 3
 * 기자재 3D 모형 + 선반 검색
 *
 * 파일: science3/contents.js
 * 공통 엔진 수정 없음
 */

(() => {
  'use strict';

  const T = window.THREE;
  const L = window.MUNSAN_LAB_LAYOUT;

  if (!T || !L || L.id !== 'science3') return;

  // ========================================
  // 1. S3-B-SINK 삭제
  // ========================================

  const isSink = c =>
    String(c && c.id || '').toUpperCase() ===
    'S3-B-SINK';

  for (const key of ['cabinets', 'furniture']) {
    if (Array.isArray(L[key])) {
      L[key] = L[key].filter(c => !isSink(c));
    }
  }

  // ========================================
  // 2. 기자재 목록
  // ========================================

  const items = [];

  function add(
    id,
    shelf,
    names,
    quantity = null,
    unit = '개',
    keywords = []
  ) {
    const shelves = Array.isArray(shelf)
      ? shelf
      : [shelf];

    for (const name of names) {
      items.push({
        cabinet: id,
        name,
        ...(shelves.length === 1
          ? { shelf: shelves[0] }
          : { shelves }),
        quantity,
        unit,
        keywords: [...keywords]
      });
    }
  }

  // 왼쪽 목재 보관장

  add('S3-L-W01', 2, [
    '암석표본'
  ], null, '세트', ['암석']);

  add('S3-L-W02', 2, [
    '화석표본',
    '광물표본'
  ], null, '세트', ['표본']);

  add('S3-L-W03', 1, [
    '조흔판'
  ], null, '개', ['광물']);

  add('S3-L-W04', [1, 2], [
    '보드게임'
  ]);

  // 선반 미지정: 1단 임시 배치

  add('S3-L-TALL01', 1, [
    '동아리용품'
  ], null, '개', ['동아리']);

  add('S3-L-TALL02', 1, [
    '실험복'
  ], 30, '개', ['보호복']);

  // 뒤쪽 유리장 1
  // 안전용품 1·2단의 세부 배치는 임시 구분

  add('S3-B-G01', 1, [
    '구급함',
    '방진마스크'
  ], null, '개', ['안전용품']);

  add('S3-B-G01', 2, [
    '보안경',
    '소방포'
  ], null, '개', ['안전용품']);

  add('S3-B-G01', 3, [
    '달 위상변화 키트'
  ], null, '개', ['달', '달의 위상']);

  add('S3-B-G01', 4, [
    '태양필터'
  ], null, '개', ['태양 관측']);

  // 뒤쪽 유리장 2

  add('S3-B-G02', 1, [
    '천체동아리조끼'
  ], null, '개', ['조끼', '천체동아리']);

  add('S3-B-G02', 2, [
    '카메라',
    '촬영용품',
    '인화지'
  ], null, '개', ['사진', '천체사진']);

  add('S3-B-G02', 3, [
    '별자리 보기판'
  ], null, '개', ['별자리']);

  add('S3-B-G02', 4, [
    '천체관련키트'
  ], null, '개', ['천체', '천문']);

  // 천체망원경 부품

  add('S3-B-D01', [1, 2], [
    '천체망원경부품',
    '천체관련용품'
  ], null, '개', ['망원경', '천체']);

  // 오른쪽 보관장

  add('S3-R-D01', 2, [
    '공구세트'
  ]);

  add('S3-R-D01', 1, [
    '테이프'
  ]);

  add('S3-R-D05', 1, [
    '색연필'
  ]);

  add('S3-R-D06', 1, [
    '빨대'
  ]);

  add('S3-R-D06', 2, [
    '코르크연마기'
  ]);

  add('S3-R-D06', 3, [
    '풀',
    '자',
    '가위'
  ], null, '개', ['사무용품']);

  add('S3-R-D07', 1, [
    '물감'
  ]);

  add('S3-R-D07', 2, [
    '색연필'
  ]);

  add('S3-R-D07', 3, [
    '미술용품'
  ]);

  add('S3-R-D08', 1, [
    'OHP필름'
  ], null, '장', ['오에이치피']);

  add('S3-R-D08', 2, [
    '방안지'
  ], null, '장', ['모눈종이']);

  add('S3-R-D08', 3, [
    '매직'
  ], null, '개', ['네임펜']);

  // ========================================
  // 3. 기존 기자재 데이터 병합
  // ========================================

  const ids = new Set(
    items.map(x => x.cabinet)
  );

  const oldInventory = Array.isArray(L.inventory)
    ? L.inventory
    : [];

  L.inventory = oldInventory.filter(x =>

    !ids.has(
      String(x.cabinet || '').toUpperCase()
    ) &&

    !isSink({
      id: x.cabinet
    })

  ).concat(items);

  const cabinets = [
    ...(L.cabinets || []),
    ...(L.furniture || [])
  ];

  const names = {
    'S3-L-W01': '암석표본 보관장',
    'S3-L-W02': '화석·광물표본 보관장',
    'S3-L-W03': '조흔판 보관장',
    'S3-L-W04': '보드게임 보관장',
    'S3-L-TALL01': '동아리용품 보관장',
    'S3-L-TALL02': '실험복 보관장',
    'S3-B-G01': '안전용품·천문키트 보관장',
    'S3-B-G02': '천체동아리·카메라 보관장',
    'S3-B-D01': '천체망원경 부품 보관장',
    'S3-R-D01': '공구·테이프 보관장',
    'S3-R-D05': '색연필 보관장',
    'S3-R-D06': '빨대·코르크연마기 보관장',
    'S3-R-D07': '미술용품 보관장',
    'S3-R-D08': 'OHP필름·방안지·매직 보관장'
  };

  cabinets.forEach(c => {
    if (names[c.id]) {
      c.label = names[c.id];
    }

    const maxShelf = Math.max(
      0,
      ...items
        .filter(i => i.cabinet === c.id)
        .flatMap(i => i.shelves || [i.shelf])
        .map(Number)
        .filter(Number.isFinite)
    );

    if (maxShelf > (Number(c.shelves) || 0)) {
      c.shelves = maxShelf;
    }
  });

  // ========================================
  // 4. Three.js 기본 도형
  // ========================================

  const originalAdd = T.Object3D.prototype.add;
  const done = new Set();

  let modelCount = 0;

  function color(hex, transparent = false) {
    return new T.MeshLambertMaterial({
      color: hex,
      transparent,
      opacity: transparent ? .62 : 1,
      depthWrite: !transparent,
      side: transparent
        ? T.DoubleSide
        : T.FrontSide
    });
  }

  const M = {
    white: color(0xf0f4f5),
    cream: color(0xe9dbc6),
    dark: color(0x25384e),
    gray: color(0x77899b),
    steel: color(0x9babb8),
    blue: color(0x267dcc),
    sky: color(0x7ac4ed),
    red: color(0xdc6265),
    green: color(0x4eab87),
    yellow: color(0xedd35c),
    orange: color(0xf3a151),
    purple: color(0x9375ce),
    brown: color(0xa88564),
    rock: color(0x777774),
    black: color(0x182638),
    glass: color(0x9cdaee, true),
    film: color(0xd8f3fa, true)
  };

  function place(p, geo, material, x, y, z) {
    const mesh = new T.Mesh(
      geo,
      material
    );

    mesh.position.set(x, y, z);
    originalAdd.call(p, mesh);

    return mesh;
  }

  const b = (p, w, h, d, x, y, z, m) =>
    place(
      p,
      new T.BoxGeometry(w, h, d),
      m, x, y, z
    );

  const cy = (p, r, h, x, y, z, m, n = 16) =>
    place(
      p,
      new T.CylinderGeometry(r, r, h, n),
      m, x, y, z
    );

  const ball = (p, r, x, y, z, m) =>
    place(
      p,
      new T.SphereGeometry(r, 12, 9),
      m, x, y, z
    );

  const torus = (p, r, t, x, y, z, m) =>
    place(
      p,
      new T.TorusGeometry(r, t, 8, 18),
      m, x, y, z
    );

  const g = p => {
    const obj = new T.Group();
    originalAdd.call(p, obj);
    return obj;
  };

  // ========================================
  // 5. 암석·광물·화석표본
  // ========================================

  function specimens(p, kind) {
    b(
      p, .40, .025, .28,
      0, .015, 0, M.brown
    );

    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * .13;

      if (kind === 'fossil') {
        b(
          p, .105, .11, .11,
          x, .077, 0, M.rock
        );

        torus(
          p, .038, .010,
          x, .105, .063, M.cream
        );

      } else if (kind === 'mineral') {
        const crystal = place(
          p,
          new T.OctahedronGeometry(.075),
          [M.sky, M.purple, M.green][i],
          x, .115, 0
        );

        crystal.rotation.z = i * .3;

      } else {
        const rock = place(
          p,
          new T.DodecahedronGeometry(.079),
          [M.rock, M.brown, M.gray][i],
          x, .105, 0
        );

        rock.rotation.set(
          .2 + i * .3,
          .3,
          i * .2
        );
      }
    }
  }

  // 조흔판
  function streak(p) {
    b(
      p, .40, .035, .29,
      0, .035, 0, M.white
    );

    for (let i = 0; i < 4; i++) {
      b(
        p, .22, .005, .012,
        0, .058, -.09 + i * .055,
        [M.red, M.brown, M.gray, M.black][i]
      );
    }
  }

  // 보드게임
  function boardGame(p) {
    b(
      p, .43, .08, .32,
      0, .05, 0, M.blue
    );

    b(
      p, .40, .012, .29,
      0, .10, 0, M.cream
    );

    for (let i = 0; i < 4; i++) {
      cy(
        p, .025, .06,
        -.13 + i * .09, .14, -.02,
        [M.red, M.green, M.yellow, M.purple][i]
      );
    }
  }

  // ========================================
  // 6. 실험복·동아리 조끼
  // ========================================

  function coat(p, vest = false) {
    for (let i = -1; i <= 1; i++) {
      const x = i * .23;

      b(
        p, .15, .28, .047,
        x, .19, 0,
        vest ? M.orange : M.white
      );

      const left = b(
        p, .055, .18, .045,
        x - .11, .24, 0,
        vest ? M.orange : M.sky
      );

      left.rotation.z = -.2;

      const right = b(
        p, .055, .18, .045,
        x + .11, .24, 0,
        vest ? M.orange : M.sky
      );

      right.rotation.z = .2;

      b(
        p, .016, .17, .007,
        x, .20, .029,
        vest ? M.yellow : M.blue
      );
    }

    b(
      p, .73, .016, .025,
      0, .41, 0, M.steel
    );
  }

  // ========================================
  // 7. 안전용품·일반 키트
  // ========================================

  function kit(p, m = M.blue) {
    b(
      p, .36, .19, .25,
      0, .11, 0, M.dark
    );

    b(
      p, .37, .027, .26,
      0, .22, 0, m
    );

    b(
      p, .13, .022, .025,
      0, .12, .14, M.steel
    );
  }

  function firstAid(p) {
    b(
      p, .33, .29, .22,
      0, .165, 0, M.red
    );

    b(
      p, .17, .045, .012,
      0, .17, .116, M.white
    );

    b(
      p, .045, .17, .012,
      0, .17, .121, M.white
    );
  }

  function goggles(p) {
    for (const x of [-.10, .10]) {
      b(
        p, .17, .12, .035,
        x, .17, .03, M.glass
      );
    }

    b(
      p, .40, .025, .04,
      0, .235, 0, M.dark
    );
  }

  // ========================================
  // 8. 달 위상변화 키트
  // ========================================

  function moonKit(p) {
    b(
      p, .52, .025, .26,
      0, .02, 0, M.dark
    );

    for (let i = 0; i < 6; i++) {
      const x = -.21 + i * .084;

      ball(
        p, .035,
        x, .095, 0, M.gray
      );

      b(
        p, .012 + i * .008, .064, .005,
        x + .012, .095, .032, M.yellow
      );
    }
  }

  // 태양필터
  function solarFilter(p) {
    b(
      p, .32, .025, .25,
      0, .02, 0, M.gray
    );

    cy(
      p, .015, .22,
      0, .15, 0, M.steel
    );

    torus(
      p, .13, .018,
      0, .27, 0, M.orange
    );

    cy(
      p, .12, .012,
      0, .27, 0, M.black
    ).rotation.x = Math.PI / 2;
  }

  // ========================================
  // 9. 카메라·촬영용품
  // ========================================

  function camera(p) {
    b(
      p, .36, .22, .20,
      0, .16, 0, M.black
    );

    b(
      p, .15, .055, .13,
      -.09, .29, 0, M.gray
    );

    cy(
      p, .085, .11,
      .075, .17, .12, M.steel
    ).rotation.x = Math.PI / 2;

    cy(
      p, .057, .015,
      .075, .17, .187, M.sky
    ).rotation.x = Math.PI / 2;
  }

  function paper(p, transparent = false) {
    for (let i = 0; i < 4; i++) {
      b(
        p, .36, .005, .27,
        0, .035 + i * .02, 0,
        transparent ? M.film : M.cream
      );
    }
  }

  // 별자리 보기판
  function starChart(p) {
    b(
      p, .42, .035, .31,
      0, .025, 0, M.dark
    );

    cy(
      p, .15, .016,
      0, .055, 0, M.blue
    );

    for (let i = 0; i < 8; i++) {
      const a = i * 2.4;

      ball(
        p, .015,
        Math.cos(a) * .105,
        .075,
        Math.sin(a) * .105,
        M.yellow
      );
    }
  }

  // 천체망원경 부품
  function telescope(p) {
    b(
      p, .35, .023, .25,
      0, .025, 0, M.gray
    );

    cy(
      p, .018, .19,
      0, .14, 0, M.steel
    );

    cy(
      p, .065, .31,
      0, .29, 0, M.white
    ).rotation.z = Math.PI / 2;

    torus(
      p, .065, .012,
      .16, .29, 0, M.black
    ).rotation.y = Math.PI / 2;
  }

  // ========================================
  // 10. 공구·사무용품·미술용품
  // ========================================

  function tools(p) {
    kit(p, M.orange);

    b(
      p, .32, .016, .028,
      0, .245, .03, M.steel
    );

    b(
      p, .020, .14, .026,
      -.09, .29, .03, M.steel
    );
  }

  function tape(p) {
    b(
      p, .31, .025, .21,
      0, .025, 0, M.brown
    );

    torus(
      p, .095, .035,
      0, .15, 0, M.yellow
    ).rotation.x = Math.PI / 2;
  }

  function pencils(p) {
    b(
      p, .33, .025, .19,
      0, .02, 0, M.brown
    );

    const colors = [
      M.red, M.blue, M.green,
      M.yellow, M.orange, M.purple
    ];

    for (let i = 0; i < 6; i++) {
      cy(
        p, .014, .30,
        -.13 + i * .052,
        .19, 0, colors[i]
      );
    }
  }

  function straw(p) {
    b(
      p, .32, .025, .21,
      0, .02, 0, M.cream
    );

    for (let i = 0; i < 5; i++) {
      cy(
        p, .012, .28,
        -.12 + i * .06,
        .18, 0,
        i % 2 ? M.red : M.sky
      );
    }
  }

  function grinder(p) {
    b(
      p, .40, .11, .27,
      0, .065, 0, M.gray
    );

    cy(
      p, .115, .065,
      0, .15, 0, M.orange
    );

    b(
      p, .095, .12, .08,
      -.12, .18, -.05, M.dark
    );
  }

  function paint(p) {
    const colors = [
      M.red, M.blue, M.yellow, M.green
    ];

    for (let i = 0; i < 4; i++) {
      const x = -.135 + i * .09;

      cy(
        p, .044, .18,
        x, .11, 0, colors[i]
      );

      cy(
        p, .045, .021,
        x, .215, 0, M.white
      );
    }
  }

  function markers(p) {
    const colors = [
      M.black, M.red, M.blue,
      M.green, M.purple
    ];

    for (let i = 0; i < 5; i++) {
      const x = -.13 + i * .065;

      cy(
        p, .022, .30,
        x, .17, 0, colors[i]
      );

      cy(
        p, .023, .05,
        x, .31, 0, M.gray
      );
    }
  }

  function generic(p, name) {
    const accent =
      /안전|방진|소방/.test(name)
        ? M.red
        : /미술|색|풀|사무/.test(name)
          ? M.orange
          : M.blue;

    kit(p, accent);
  }

  // ========================================
  // 11. 기자재 이름 → 3D 모형
  // ========================================

  function make(p, name) {

    if (/암석표본/.test(name)) {
      specimens(p, 'rock');

    } else if (/화석표본/.test(name)) {
      specimens(p, 'fossil');

    } else if (/광물표본/.test(name)) {
      specimens(p, 'mineral');

    } else if (/조흔판/.test(name)) {
      streak(p);

    } else if (/보드게임/.test(name)) {
      boardGame(p);

    } else if (/실험복/.test(name)) {
      coat(p);

    } else if (/천체동아리조끼/.test(name)) {
      coat(p, true);

    } else if (/구급함/.test(name)) {
      firstAid(p);

    } else if (/보안경/.test(name)) {
      goggles(p);

    } else if (/달 위상/.test(name)) {
      moonKit(p);

    } else if (/태양필터/.test(name)) {
      solarFilter(p);

    } else if (/카메라/.test(name)) {
      camera(p);

    } else if (/인화지|OHP필름/.test(name)) {
      paper(p, /OHP/.test(name));

    } else if (/방안지/.test(name)) {
      paper(p);

    } else if (/별자리 보기판/.test(name)) {
      starChart(p);

    } else if (/천체망원경부품/.test(name)) {
      telescope(p);

    } else if (/공구세트/.test(name)) {
      tools(p);

    } else if (/테이프/.test(name)) {
      tape(p);

    } else if (/색연필/.test(name)) {
      pencils(p);

    } else if (/빨대/.test(name)) {
      straw(p);

    } else if (/코르크연마기/.test(name)) {
      grinder(p);

    } else if (/물감/.test(name)) {
      paint(p);

    } else if (/매직/.test(name)) {
      markers(p);

    } else {
      generic(p, name);
    }
  }

  // ========================================
  // 12. 보관장 선반별 3D 배치
  // ========================================

  function populate(parent, cabinet) {
    const relevant = items.filter(
      i => i.cabinet === cabinet.id
    );

    if (!relevant.length) return;

    const n = Math.max(
      1,
      Number(cabinet.shelves) || 3
    );

    const h = Number(cabinet.height) || 1.2;
    const w = Number(cabinet.width) || 1.0;
    const d = Number(cabinet.depth) || .60;

    const step = (h - .10) / n;
    const usableW = Math.max(.12, w - .16);
    const usableD = Math.max(.12, d - .16);

    for (let shelf = 1; shelf <= n; shelf++) {

      const list = relevant.filter(i =>
        Array.isArray(i.shelves)
          ? i.shelves.map(Number).includes(shelf)
          : Number(i.shelf) === shelf
      );

      if (!list.length) continue;

      const cols = Math.min(3, list.length);
      const rows = Math.ceil(
        list.length / cols
      );

      const cellW = usableW / cols;
      const cellD = usableD / rows;

      list.forEach((item, index) => {

        const parentG = g(parent);
        const name = String(item.name || '');

        const width =
          /실험복|조끼/.test(name)
            ? .76 : .50;

        const height =
          /실험복|조끼/.test(name)
            ? .44 : .48;

        const scale = Math.max(
          .17,
          Math.min(
            1.13,
            cellW / width * .90,
            cellD / .37 * .90,
            Math.max(.14, step - .10) / height
          )
        );

        parentG.scale.setScalar(scale);

        parentG.position.set(
          -usableW / 2 +
            cellW * (index % cols + .5),

          .085 + (shelf - 1) * step,

          -usableD / 2 +
            cellD *
            (Math.floor(index / cols) + .5)
        );

        parentG.userData.s3Item = name;

        make(parentG, name);

        modelCount++;
      });
    }
  }

  // ========================================
  // 13. 기존 공통 엔진과 연결
  // ========================================

  /*
    과학실 1·2에서 사용한 방식과 동일.

    공통 엔진이 보관장 번호 Sprite를
    추가할 때만 해당 보관장을 찾는다.

    공통 엔진 파일은 수정하지 않는다.
  */

  T.Object3D.prototype.add = function (...objects) {

    const result = originalAdd.apply(
      this,
      objects
    );

    if (
      done.size >= cabinets.length ||
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

      !done.has(v.id) &&

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

    done.add(c.id);

    try {
      populate(this, c);
    } catch (error) {
      console.error(
        '[과학실3 모형]',
        c.id,
        error
      );
    }

    if (done.size === cabinets.length) {
      T.Object3D.prototype.add = originalAdd;

      const hint =
        document.getElementById('hint');

      if (hint) {
        hint.textContent +=
          ` · 기자재 모형 ${modelCount}개`;
      }

      console.info(
        '[과학실3] 모형 배치 완료:',
        modelCount,
        '개'
      );
    }

    return result;
  };

  console.info(
    '[과학실3] 등록된 기자재:',
    items.length,
    '개 항목 / S3-B-SINK 삭제 설정'
  );

})();
