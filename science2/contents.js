
/*
 문산중학교 과학실 2
 선반별 기자재 + 입체 3D 모형

 파일: science2/contents.js

 공통 엔진, 다른 과학실 코드 수정 없음.
 기존 MBL 센서와 케이스 모형 유지.
*/

(() => {
  'use strict';

  const T = window.THREE;
  const L = window.MUNSAN_LAB_LAYOUT;

  if (!T || !L || L.id !== 'science2') return;

  // ========================================
  // 1. 기자재 목록 등록
  // ========================================

  const rows = [];

  const add = (
    cabinet,
    shelves,
    names,
    quantity = null,
    unit = '개',
    keywords = []
  ) => {
    const ss = Array.isArray(shelves)
      ? shelves
      : [shelves];

    for (const name of names) {
      rows.push({
        cabinet,
        name,
        ...(ss.length === 1
          ? { shelf: ss[0] }
          : { shelves: ss }),
        quantity,
        unit,
        keywords
      });
    }
  };

  // S2-L-24
  add('S2-L-24', [1, 2, 6], ['책'],
    null, '권', ['도서', '교재']);

  add('S2-L-24', 5, ['프리즘']);

  add('S2-L-24', 4, [
    '풀', '본드', '가위', '자'
  ]);

  // S2-L-G01
  add('S2-L-G01', [1, 2], ['레고블럭'],
    null, '개', ['레고', '블록']);

  // 안전용품 3·4단 세부 위치는 임시 배치
  add('S2-L-G01', 4, [
    '구급함', '방진마스크', '보안경'
  ], null, '개', ['안전용품']);

  add('S2-L-G01', 3, [
    '안전장갑', '소방포'
  ], null, '개', ['안전용품']);

  // S2-L-G02
  add('S2-L-G02', 1, ['비열측정장치']);

  add('S2-L-G02', 2, ['오줌싸개인형'],
    null, '개', ['기체의 압력', '팽창']);

  add('S2-L-G02', 3, [
    '직류 안정화 전원장치'
  ], null, '개', [
    '전원장치',
    '직류 전원공급장치',
    'DC'
  ]);

  add('S2-L-G02', 4, ['검전기']);

  // S2-L-G03
  add('S2-L-G03', [1, 2], ['전등'],
    null, '개', ['전구', '조명']);

  add('S2-L-G03', 3, ['볼록렌즈']);
  add('S2-L-G03', 4, ['오목렌즈']);

  // S2-L-G04
  // 기존 MBL 3·4단 모형은 그대로 유지
  add('S2-L-G04', 1, ['금속추']);
  add('S2-L-G04', 2, ['시간기록계']);

  // S2-L-M01
  add('S2-L-M01', 1, ['전압계']);

  add('S2-L-M01', 2, [
    '전선', '꼬마전구'
  ]);

  // S2-L-M02
  add('S2-L-M02', 1, [
    '손전등', '건전지'
  ]);

  add('S2-L-M02', 2, ['전자기력센서']);

  // S2-L-W01
  add('S2-L-W01', [1, 2, 3], [
    '실험복'
  ], 30, '벌', ['보호복']);

  // S2-B-M01
  add('S2-B-M01', 1, ['구름발생장치']);
  add('S2-B-M01', 2, ['솔레노이드코일']);

  // S2-B-M02
  add('S2-B-M02', 1, ['용수철저울']);
  add('S2-B-M02', 2, ['소리굽쇠']);

  // S2-B-M03
  add('S2-B-M03', 1, ['거울']);
  add('S2-B-M03', 2, [
    '온도계', '용수철저울'
  ]);

  // S2-B-M04
  add('S2-B-M04', 2, [
    '광선상자', '글루건'
  ]);

  add('S2-B-M04', 1, ['사포']);

  // S2-R-M01
  add('S2-R-M01', 2, ['매스실린더']);
  add('S2-R-M01', 1, ['비커']);

  // S2-R-M02
  add('S2-R-M02', 2, ['페트리접시']);
  add('S2-R-M02', 1, [
    '깔때기', '시험관'
  ]);

  // S2-R-M03
  add('S2-R-M03', 1, ['일회용스포이트']);
  add('S2-R-M03', 2, ['세척솔']);

  // S2-R-M04
  add('S2-R-M04', 1, [
    '막자', '막자사발'
  ], null, '개', ['막자/막자사발']);

  add('S2-R-M04', 2, ['홈판']);

  // S2-R-M07
  add('S2-R-M07', 2, ['종이컵']);

  // S2-R-M08
  add('S2-R-M08', 1, [
    '목공풀', '자'
  ], null, '개', ['사무용품']);

  add('S2-R-M08', 2, [
    '테이프'
  ], null, '개', ['사무용품']);

  // ========================================
  // 2. 기존 목록과 병합
  // ========================================

  const registered = new Set(
    rows.map(r => r.cabinet)
  );

  const originalInventory =
    Array.isArray(L.inventory)
      ? L.inventory
      : [];

  L.inventory = originalInventory.filter(item => {

    if (!registered.has(item.cabinet)) {
      return true;
    }

    if (item.cabinet !== 'S2-L-G04') {
      return false;
    }

    // 기존 MBL 기자재는 보존
    return (
      /MBL|케이스|보관 케이스|센서/i.test(
        String(item.name || '')
      ) ||
      [3, 4].some(s =>
        Array.isArray(item.shelves)
          ? item.shelves.map(Number).includes(s)
          : Number(item.shelf) === s
      )
    );

  }).concat(rows);

  // 보관장 표시 이름
  const labels = {
    'S2-L-24': '책·프리즘·문구 보관장',
    'S2-L-G01': '레고·안전용품 보관장',
    'S2-L-G02': '비열·전원장치 보관장',
    'S2-L-G03': '전등·렌즈 보관장',
    'S2-L-G04': 'MBL·금속추·시간기록계 보관장',
    'S2-L-M01': '전압계·전선 보관장',
    'S2-L-M02': '손전등·전자기력센서 보관장',
    'S2-L-W01': '실험복 보관장',
    'S2-B-M01': '구름발생·솔레노이드 보관장',
    'S2-B-M02': '용수철저울·소리굽쇠 보관장',
    'S2-B-M03': '거울·온도계 보관장',
    'S2-B-M04': '광선상자·글루건 보관장',
    'S2-R-M01': '매스실린더·비커 보관장',
    'S2-R-M02': '페트리접시·시험관 보관장',
    'S2-R-M03': '스포이트·세척솔 보관장',
    'S2-R-M04': '막자·홈판 보관장',
    'S2-R-M07': '종이컵 보관장',
    'S2-R-M08': '사무용품 보관장'
  };

  const cabinets = [
    ...(L.cabinets || []),
    ...(L.furniture || [])
  ];

  for (const c of cabinets) {
    if (labels[c.id]) {
      c.label = labels[c.id];
    }
  }

  // ========================================
  // 3. Three.js 모델 기본 함수
  // ========================================

  const originalAdd = T.Object3D.prototype.add;
  const completed = new Set();

  const mat = (color, glass = false) =>
    new T.MeshLambertMaterial({
      color,
      transparent: glass,
      opacity: glass ? .50 : 1,
      depthWrite: !glass,
      side: glass
        ? T.DoubleSide
        : T.FrontSide
    });

  const M = {
    white: mat(0xf3f4f3),
    navy: mat(0x24394c),
    black: mat(0x16202d),
    blue: mat(0x267fc8),
    cyan: mat(0x71c5ec),
    silver: mat(0x95a7b7),
    red: mat(0xd9515f),
    green: mat(0x47ad78),
    yellow: mat(0xe7bc43),
    orange: mat(0xee964c),
    brown: mat(0xb58c60),
    gray: mat(0x667789),
    glass: mat(0x9ee3ef, true),
    paper: mat(0xf4e7cb),
    purple: mat(0x9b7cce)
  };

  const direct = (p, o) => {
    originalAdd.call(p, o);
    return o;
  };

  const group = p =>
    direct(p, new T.Group());

  function obj(p, geometry, material, x, y, z) {
    const v = direct(
      p,
      new T.Mesh(geometry, material)
    );

    v.position.set(x, y, z);
    return v;
  }

  const box = (p, w, h, d, x, y, z, m) =>
    obj(
      p,
      new T.BoxGeometry(w, h, d),
      m, x, y, z
    );

  const cyl = (p, top, bot, h, x, y, z, m) =>
    obj(
      p,
      new T.CylinderGeometry(top, bot, h, 16),
      m, x, y, z
    );

  const ball = (p, r, x, y, z, m) =>
    obj(
      p,
      new T.SphereGeometry(r, 14, 10),
      m, x, y, z
    );

  const torus = (p, r, t, x, y, z, m) =>
    obj(
      p,
      new T.TorusGeometry(r, t, 8, 20),
      m, x, y, z
    );

  // ========================================
  // 4. 기자재별 3D 모형
  // ========================================

  // 기본 실험키트
  function kit(p, accent = M.blue) {
    box(p, .32, .17, .24, 0, .09, 0, M.navy);
    box(p, .33, .025, .25, 0, .19, 0, accent);
    box(p, .12, .035, .02, 0, .09, .13, M.silver);
  }

  // 책
  function books(p) {
    const covers = [
      M.blue, M.red, M.green, M.orange, M.purple
    ];

    for (let i = 0; i < 5; i++) {
      box(
        p, .054, .29 - (i % 2) * .04, .23,
        -.13 + i * .066,
        .15,
        [0, .005, -.01][i % 3],
        covers[i]
      );

      box(
        p, .007, .22, .20,
        -.13 + i * .066,
        .15, .02,
        M.paper
      );
    }
  }

  // 실험복
  function coat(p) {
    for (let i = -1; i <= 1; i++) {
      const x = i * .22;

      box(
        p, .15, .27, .045,
        x, .19, 0, M.white
      );

      const a = box(
        p, .055, .19, .046,
        x - .10, .24, 0, M.cyan
      );

      a.rotation.z = -.24;

      const b = box(
        p, .055, .19, .046,
        x + .10, .24, 0, M.cyan
      );

      b.rotation.z = .24;

      box(
        p, .012, .22, .005,
        x, .19, .028, M.blue
      );
    }

    box(
      p, .76, .015, .025,
      0, .40, 0, M.silver
    );
  }

  // 직류 안정화 전원장치
  function supply(p) {
    box(
      p, .44, .29, .25,
      0, .17, 0, M.white
    );

    box(
      p, .435, .14, .012,
      0, .245, .133, M.blue
    );

    // 전압계 V, 전류계 A
    for (const x of [-.12, .12]) {
      box(
        p, .16, .085, .018,
        x, .255, .147, M.paper
      );

      box(
        p, .10, .007, .005,
        x, .255, .159, M.black
      );

      box(
        p, .006, .045, .005,
        x + .018, .253, .161, M.black
      );
    }

    // 전원 스위치
    box(
      p, .055, .07, .022,
      -.17, .115, .148, M.red
    );

    // 조절 다이얼
    for (let i = 0; i < 3; i++) {
      cyl(
        p, .026, .026, .035,
        -.07 + i * .09,
        .13, .158,
        M.green
      ).rotation.x = Math.PI / 2;
    }

    // 출력 단자
    for (let i = 0; i < 3; i++) {
      cyl(
        p, .016, .016, .025,
        .11 + i * .08,
        .09, .16,
        [M.blue, M.black, M.red][i]
      ).rotation.x = Math.PI / 2;
    }
  }

  // 렌즈·프리즘
  function lens(p, kind) {
    box(
      p, .035, .28, .05,
      0, .18, 0, M.silver
    );

    box(
      p, .27, .03, .22,
      0, .03, 0, M.gray
    );

    const disc = cyl(
      p, .125, .125, .035,
      0, .295, 0, M.glass
    );

    disc.rotation.x = Math.PI / 2;

    torus(
      p, .125, .013,
      0, .295, .025, M.blue
    );

    if (kind === 'prism') {
      const prism = obj(
        p,
        new T.CylinderGeometry(.13, .13, .24, 3),
        M.glass,
        0, .20, 0
      );

      prism.rotation.z = Math.PI / 2;
    }
  }

  // 비커·시험관·깔때기·페트리접시
  function glassware(p, kind) {
    if (kind === 'dish') {
      for (let i = 0; i < 3; i++) {
        cyl(
          p, .145, .145, .025,
          0, .04 + i * .047, 0,
          M.glass
        );
      }

    } else if (kind === 'tube') {
      for (let i = 0; i < 4; i++) {
        cyl(
          p, .027, .027, .30,
          -.12 + i * .08,
          .19, 0, M.glass
        );
      }

      box(
        p, .35, .025, .13,
        0, .045, 0, M.brown
      );

      box(
        p, .35, .02, .055,
        0, .29, 0, M.silver
      );

    } else if (kind === 'funnel') {
      const funnel = obj(
        p,
        new T.ConeGeometry(.14, .25, 16),
        M.glass,
        0, .29, 0
      );

      funnel.rotation.z = Math.PI;

      cyl(
        p, .018, .018, .19,
        0, .08, 0, M.silver
      );

    } else {
      const isCylinder = kind === 'cylinder';

      cyl(
        p,
        isCylinder ? .07 : .12,
        isCylinder ? .07 : .12,
        isCylinder ? .35 : .25,
        0,
        isCylinder ? .20 : .14,
        0,
        M.glass
      );

      cyl(
        p, .065, .065, .01,
        0, .08, 0, M.blue
      );
    }
  }

  // 전압계·비열측정장치
  function meter(p) {
    box(
      p, .38, .26, .22,
      0, .14, 0, M.white
    );

    box(
      p, .29, .14, .015,
      0, .185, .12, M.paper
    );

    const gauge = cyl(
      p, .075, .075, .01,
      0, .19, .135, M.silver
    );

    gauge.rotation.x = Math.PI / 2;

    box(
      p, .08, .018, .02,
      0, .12, .15, M.black
    );
  }

  // 용수철저울
  function springScale(p) {
    box(
      p, .22, .035, .17,
      0, .025, 0, M.silver
    );

    cyl(
      p, .016, .016, .42,
      0, .30, 0, M.gray
    );

    for (let i = 0; i < 5; i++) {
      torus(
        p, .045, .007,
        0, .15 + i * .046, 0,
        M.blue
      );
    }

    cyl(
      p, .01, .01, .16,
      0, .10, 0, M.red
    );
  }

  // 전등·꼬마전구
  function bulb(p) {
    box(
      p, .28, .045, .23,
      0, .025, 0, M.navy
    );

    cyl(
      p, .045, .045, .09,
      0, .09, 0, M.silver
    );

    ball(
      p, .09,
      0, .195, 0, M.yellow
    );
  }

  // 솔레노이드코일·전자기력센서
  function coil(p) {
    box(
      p, .32, .03, .20,
      0, .03, 0, M.gray
    );

    cyl(
      p, .045, .045, .29,
      0, .15, 0, M.brown
    ).rotation.z = Math.PI / 2;

    for (let i = -4; i <= 4; i++) {
      const ring = torus(
        p, .052, .009,
        i * .029, .15, 0,
        M.orange
      );

      ring.rotation.y = Math.PI / 2;
    }
  }

  // 소리굽쇠
  function tuningFork(p) {
    box(
      p, .30, .025, .18,
      0, .025, 0, M.brown
    );

    cyl(
      p, .015, .015, .16,
      0, .14, 0, M.silver
    );

    for (const x of [-.065, .065]) {
      box(
        p, .022, .24, .022,
        x, .33, 0, M.silver
      );
    }

    box(
      p, .15, .018, .022,
      0, .20, 0, M.silver
    );
  }

  // 구름발생장치
  function cloudChamber(p) {
    box(
      p, .36, .035, .27,
      0, .025, 0, M.navy
    );

    cyl(
      p, .14, .14, .32,
      0, .20, 0, M.glass
    );

    for (let i = 0; i < 4; i++) {
      ball(
        p, .04,
        -.075 + i * .05,
        .23 + (i % 2) * .07,
        0, M.white
      );
    }

    cyl(
      p, .026, .026, .09,
      .13, .41, 0, M.blue
    );
  }

  // 검전기
  function electroscope(p) {
    box(
      p, .30, .025, .25,
      0, .025, 0, M.brown
    );

    cyl(
      p, .012, .012, .32,
      0, .23, 0, M.silver
    );

    ball(
      p, .048,
      0, .37, 0, M.red
    );
  }

  // 시간기록계
  function tickerTimer(p) {
    box(
      p, .40, .12, .27,
      0, .07, 0, M.blue
    );

    box(
      p, .24, .018, .28,
      0, .145, 0, M.silver
    );

    cyl(
      p, .07, .07, .07,
      .10, .20, 0, M.gray
    ).rotation.x = Math.PI / 2;

    box(
      p, .16, .008, .06,
      -.11, .155, .15, M.paper
    );
  }

  // 구급함·안전용품
  function safety(p, name) {
    if (name === '구급함') {
      box(
        p, .34, .27, .20,
        0, .15, 0, M.red
      );

      box(
        p, .18, .045, .012,
        0, .17, .107, M.white
      );

      box(
        p, .045, .18, .012,
        0, .17, .114, M.white
      );

    } else if (name === '보안경') {
      for (const x of [-.10, .10]) {
        box(
          p, .17, .12, .04,
          x, .17, 0, M.glass
        );
      }

      box(
        p, .40, .025, .04,
        0, .24, 0, M.navy
      );

    } else {
      kit(p, M.red);
    }
  }

  // 레고블럭
  function lego(p) {
    const colors = [
      M.red, M.blue, M.yellow, M.green
    ];

    for (let i = 0; i < 4; i++) {
      const x = ((i % 2) - .5) * .19;
      const z = (Math.floor(i / 2) - .5) * .13;

      box(
        p, .16, .10, .12,
        x, .09, z, colors[i]
      );

      for (const xx of [-.04, .04]) {
        cyl(
          p, .022, .022, .02,
          x + xx, .15, z,
          colors[i]
        );
      }
    }
  }

  // 손전등
  function torch(p) {
    box(
      p, .30, .08, .12,
      0, .09, 0, M.blue
    );

    cyl(
      p, .10, .065, .08,
      .19, .09, 0, M.silver
    ).rotation.z = Math.PI / 2;

    ball(
      p, .065,
      .23, .09, 0, M.yellow
    );
  }

  // 일반 기자재 상자
  function generic(p, name) {
    const accent =
      /풀|본드|테이프|종이컵|가위|자|사포/.test(name)
        ? M.orange
        : M.blue;

    box(
      p, .33, .20, .25,
      0, .12, 0, M.paper
    );

    box(
      p, .34, .035, .26,
      0, .235, 0, accent
    );

    box(
      p, .16, .09, .013,
      0, .13, .133, M.white
    );
  }

  // ========================================
  // 5. 기자재 이름으로 모형 선택
  // ========================================

  function make(p, name) {

    if (/책/.test(name)) {
      books(p);

    } else if (/실험복/.test(name)) {
      coat(p);

    } else if (/레고/.test(name)) {
      lego(p);

    } else if (/전원장치/.test(name)) {
      supply(p);

    } else if (
      /볼록렌즈|오목렌즈|프리즘/.test(name)
    ) {
      lens(
        p,
        /프리즘/.test(name)
          ? 'prism'
          : 'lens'
      );

    } else if (
      /비커|매스실린더|페트리접시|깔때기|시험관/.test(name)
    ) {
      const kind =
        /페트리/.test(name) ? 'dish' :
        /시험관/.test(name) ? 'tube' :
        /깔때기/.test(name) ? 'funnel' :
        /매스실린더/.test(name) ? 'cylinder' :
        'beaker';

      glassware(p, kind);

    } else if (
      /전압계|비열측정/.test(name)
    ) {
      meter(p);

    } else if (/용수철저울/.test(name)) {
      springScale(p);

    } else if (/소리굽쇠/.test(name)) {
      tuningFork(p);

    } else if (
      /전등|꼬마전구/.test(name)
    ) {
      bulb(p);

    } else if (
      /솔레노이드|전자기력센서/.test(name)
    ) {
      coil(p);

    } else if (/구름발생/.test(name)) {
      cloudChamber(p);

    } else if (/검전기/.test(name)) {
      electroscope(p);

    } else if (/시간기록계/.test(name)) {
      tickerTimer(p);

    } else if (/손전등/.test(name)) {
      torch(p);

    } else if (
      /안전장갑|소방포|구급함|방진마스크|보안경/.test(name)
    ) {
      safety(p, name);

    } else if (/광선상자/.test(name)) {
      kit(p, M.yellow);

    } else if (/금속추/.test(name)) {
      for (let i = 0; i < 3; i++) {
        cyl(
          p,
          .05 + i * .012,
          .05 + i * .012,
          .10,
          -.10 + i * .10,
          .07, 0,
          M.silver
        );
      }

    } else if (/거울/.test(name)) {
      box(
        p, .32, .29, .022,
        0, .22, 0, M.silver
      );

      box(
        p, .26, .23, .01,
        0, .22, .015, M.glass
      );

      box(
        p, .29, .03, .20,
        0, .035, 0, M.navy
      );

    } else if (/건전지/.test(name)) {
      for (let i = 0; i < 3; i++) {
        cyl(
          p, .045, .045, .27,
          -.11 + i * .11,
          .15, 0, M.blue
        );

        cyl(
          p, .024, .024, .018,
          -.11 + i * .11,
          .30, 0, M.silver
        );
      }

    } else if (/온도계/.test(name)) {
      cyl(
        p, .014, .014, .33,
        0, .21, 0, M.silver
      );

      cyl(
        p, .006, .006, .24,
        0, .16, .015, M.red
      );

      ball(
        p, .028,
        0, .047, 0, M.red
      );

    } else {
      generic(p, name);
    }
  }

  // ========================================
  // 6. 선반별 3D 모형 배치
  // ========================================

  let modelCount = 0;

  function populate(parent, c) {
    const items = L.inventory.filter(
      i => i.cabinet === c.id
    );

    const n = Math.max(
      1,
      Number(c.shelves) || 3
    );

    const step =
      (Number(c.height) - .10) / n;

    const availW = Math.max(
      .12,
      Number(c.width) - .18
    );

    const availD = Math.max(
      .12,
      Number(c.depth) - .16
    );

    for (let shelf = 1; shelf <= n; shelf++) {

      // 기존 MBL 모형 생성 부분과 겹치지 않음
      if (
        c.id === 'S2-L-G04' &&
        shelf >= 3
      ) {
        continue;
      }

      const listed = items.filter(i =>
        Array.isArray(i.shelves)
          ? i.shelves.map(Number).includes(shelf)
          : Number(i.shelf) === shelf
      );

      if (!listed.length) continue;

      const cols = Math.min(3, listed.length);
      const rowCount = Math.ceil(
        listed.length / cols
      );

      const cellW = availW / cols;
      const cellD = availD / rowCount;

      listed.forEach((item, i) => {
        const p = group(parent);
        const nm = String(item.name || '');

        const naturalW =
          /실험복/.test(nm) ? .80 :
          /책/.test(nm) ? .40 :
          .44;

        const naturalH =
          /실험복/.test(nm) ? .43 : .48;

        const scale = Math.max(
          .18,
          Math.min(
            1.15,
            cellW / naturalW * .90,
            cellD / .34 * .90,
            (step - .075) / naturalH
          )
        );

        p.scale.setScalar(scale);

        p.position.set(
          -availW / 2 +
            cellW * (i % cols + .5),

          .085 + (shelf - 1) * step,

          -availD / 2 +
            cellD * (Math.floor(i / cols) + .5)
        );

        p.userData.lab2Item = nm;
        p.userData.cabinet = c.id;

        make(p, nm);

        modelCount++;
      });
    }
  }

  // ========================================
  // 7. 기존 공통 3D 엔진과 연결
  // ========================================

  /*
   과학실 1에서 정상 작동한 방식과 동일.

   common/scene.js가 보관장의 번호 Sprite를
   추가하는 순간을 찾아 내부 기자재를 생성함.

   기존 보관장 위치, 문, 카메라, MBL 코드는
   수정하지 않음.
  */

  T.Object3D.prototype.add = function (...objects) {
    const result = originalAdd.apply(
      this,
      objects
    );

    if (
      completed.size >= cabinets.length ||
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
      !completed.has(v.id) &&

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

    completed.add(c.id);

    try {
      populate(this, c);
    } catch (error) {
      console.error(
        '[과학실2 기자재]',
        c.id,
        error
      );
    }

    if (completed.size >= cabinets.length) {
      T.Object3D.prototype.add = originalAdd;

      const hint =
        document.getElementById('hint');

      if (hint) {
        hint.textContent +=
          ` · 기자재 모형 ${modelCount}종`;
      }

      console.info(
        '[과학실2] 보관장',
        completed.size,
        '개 · 추가 모형',
        modelCount,
        '개'
      );
    }

    return result;
  };

  console.info(
    '[과학실2] 기자재 목록',
    rows.length,
    '종 등록 · MBL 기존 모형 유지'
  );

})();
