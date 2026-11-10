
/*
 문산중학교 과학실 2 배치 데이터

 기존 과학실 1과 같은 공통 3D 엔진 사용

 좌표:
 x = 왼쪽(-) / 오른쪽(+)
 z = 뒤쪽(-) / 앞쪽(+)

 실제 치수는 현장 사진 기준 임시값
*/

window.MUNSAN_LAB_LAYOUT = {

  id: 'science2',
  name: '과학실 2',
  purpose: '물리 · 화학',

  room: {
    width: 10.2,
    depth: 15.2,
    height: 3.5
  },

  // =====================================
  // 왼쪽 벽 출입문 2개
  // =====================================

  doors: [
    {
      id: 'S2-ENT1',
      wall: 'left',
      center: 5.2,
      width: 1.3,
      label: '출입문 1'
    },
    {
      id: 'S2-ENT2',
      wall: 'left',
      center: -4.2,
      width: 1.3,
      label: '출입문 2'
    }
  ],

  // =====================================
  // 오른쪽 창문
  // =====================================

  windows: {
    wall: 'right',
    centers: [-5.5, -2.2, 1.2, 4.6],
    width: 2.4,
    height: 1.25,
    sill: 1.4
  },

  partitions: [],

  // =====================================
  // 중앙 학생 실험대
  // =====================================

  desks: {
    columns: [-1.55, 1.45],
    rows: [-4.6, -1.6, 1.4, 4.4],
    width: 2.2,
    depth: 1.1
  },

  // =====================================
  // 교사용 실험대 + 컴퓨터
  // =====================================

  teacher: {
    x: 0,
    z: 5.65,
    width: 2.8,
    depth: 1.05
  },

  furniture: [],

  cabinets: [

    // ===================================
    // 왼쪽 벽
    // 24칸 목재장 → 출입문 1
    // → 유리장 4 → 철제장 2
    // → 목재장 1 → 출입문 2
    // ===================================

    {
      id: 'S2-L-24',
      kind: 'wood24',
      label: '24칸 개방형 목재 수납장',
      x: -4.73,
      z: 6.65,
      rot: 90,
      width: 1.25,
      height: 2.15,
      depth: .56,
      shelves: 6
    },

    // 출입문 1 : z = 5.2

    // 유리 수납장 4개
    {
      id: 'S2-L-G01',
      kind: 'glass',
      label: '왼쪽 유리 수납장 1',
      x: -4.75,
      z: 3.85,
      rot: 90,
      width: .96,
      height: 2.15,
      depth: .5,
      shelves: 4
    },
    {
      id: 'S2-L-G02',
      kind: 'glass',
      label: '왼쪽 유리 수납장 2',
      x: -4.75,
      z: 2.82,
      rot: 90,
      width: .96,
      height: 2.15,
      depth: .5,
      shelves: 4
    },
    {
      id: 'S2-L-G03',
      kind: 'glass',
      label: '왼쪽 유리 수납장 3',
      x: -4.75,
      z: 1.79,
      rot: 90,
      width: .96,
      height: 2.15,
      depth: .5,
      shelves: 4
    },
    {
      id: 'S2-L-G04',
      kind: 'glass',
      label: '왼쪽 유리 수납장 4',
      x: -4.75,
      z: .76,
      rot: 90,
      width: .96,
      height: 2.15,
      depth: .5,
      shelves: 4
    },

    // 왼쪽 미니 철제 서랍장 2개
    {
      id: 'S2-L-M01',
      kind: 'metal2',
      label: '왼쪽 철제 2단 서랍장 1',
      x: -4.75,
      z: -.20,
      rot: 90,
      width: .74,
      height: 1.0,
      depth: .5,
      shelves: 2
    },
    {
      id: 'S2-L-M02',
      kind: 'metal2',
      label: '왼쪽 철제 2단 서랍장 2',
      x: -4.75,
      z: -1.05,
      rot: 90,
      width: .74,
      height: 1.0,
      depth: .5,
      shelves: 2
    },

    // 목재 서랍장 1개
    {
      id: 'S2-L-W01',
      kind: 'wood',
      label: '왼쪽 목재 서랍장',
      x: -4.75,
      z: -2.25,
      rot: 90,
      width: 1.2,
      height: 1.12,
      depth: .52,
      shelves: 3
    },

    // 출입문 2 : z = -4.2

    // ===================================
    // 뒤쪽 벽
    // 동일한 철제 2단 서랍장 4개
    // ===================================

    {
      id: 'S2-B-M01',
      kind: 'metal2',
      label: '뒤쪽 철제 2단 서랍장 1',
      x: -2.55,
      z: -7.12,
      rot: 0,
      width: 1.32,
      height: 1.05,
      depth: .55,
      shelves: 2
    },
    {
      id: 'S2-B-M02',
      kind: 'metal2',
      label: '뒤쪽 철제 2단 서랍장 2',
      x: -.93,
      z: -7.12,
      rot: 0,
      width: 1.32,
      height: 1.05,
      depth: .55,
      shelves: 2
    },
    {
      id: 'S2-B-M03',
      kind: 'metal2',
      label: '뒤쪽 철제 2단 서랍장 3',
      x: .69,
      z: -7.12,
      rot: 0,
      width: 1.32,
      height: 1.05,
      depth: .55,
      shelves: 2
    },
    {
      id: 'S2-B-M04',
      kind: 'metal2',
      label: '뒤쪽 철제 2단 서랍장 4',
      x: 2.31,
      z: -7.12,
      rot: 0,
      width: 1.32,
      height: 1.05,
      depth: .55,
      shelves: 2
    },

    // ===================================
    // 오른쪽 벽
    // 2단 서랍장 8개 = 총 16칸
    // ===================================

    ...Array.from({ length: 8 }, (_, i) => ({
      id: 'S2-R-M' + String(i + 1).padStart(2, '0'),
      kind: 'metal2',
      label: '오른쪽 2단 서랍장 ' + (i + 1),
      x: 4.74,
      z: -6.25 + i * 1.72,
      rot: -90,
      width: 1.48,
      height: 1.02,
      depth: .53,
      shelves: 2
    }))
  ],

  // 추후 기자재 등록
  
  inventory: [
    {
      cabinet: 'S2-L-G04',
      shelf: 3,
      shelves: [3, 4],
      name: 'MBL 센서 보관 케이스',
      quantity: 5,
      unit: '개',
      location: '상단 2칸 혼합 보관'
    },

    ...[
      '전압 센서(MBL)',
      '전류 센서(MBL)',
      '힘 가속도 센서(MBL)',
      '무선 온도 센서(MBL)',
      '무선 산소 센서(MBL)',
      '무선 이산화탄소 센서(MBL)',
      '조도 센서(MBL)'
    ].map(name => ({
      cabinet: 'S2-L-G04',
      shelf: 3,
      shelves: [3, 4],
      name,
      quantity: null,
      unit: '개',
      location: '상단 2칸 혼합 보관',
      keywords: ['MBL', '센서']
    }))
  ]
};
