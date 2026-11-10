
/*
  문산중학교 과학실 1
  3D 배치 + 기자재 등록

  - 기존 3D 배치 유지
  - 기자재는 개별 검색 가능
  - 미확인 선반 번호는 null
  - 미확인 수량은 null
  - 현미경은 L03/L04에 2종씩 임시 배정
*/

window.MUNSAN_LAB_LAYOUT = {
  id: 'science1',
  name: '과학실 1',
  purpose: '생명과학 · 화학',

  room: {
    width: 9.2,
    depth: 13.0,
    height: 3.5
  },

  doors: [
    {
      id: 'S1-ENT1',
      wall: 'left',
      center: -4.95,
      width: 1.30,
      label: '출입문 1 (뒤쪽 · 원래 위치)'
    },
    {
      id: 'S1-ENT2',
      wall: 'left',
      center: 5.83,
      width: 1.30,
      label: '출입문 2 (앞쪽 · 원래 위치)'
    }
  ],

  windows: {
    wall: 'right',
    centers: [-4.60, -1.52, 1.54, 4.58],
    width: 2.0,
    height: 1.25,
    sill: 1.40
  },

  partitions: [
    {
      x: -4.30,
      z: -3.56,
      width: .52,
      depth: .22,
      height: 2.55,
      label: '왼쪽 벽면의 짧은 미니벽'
    }
  ],

  desks: {
    columns: [-1.80, 1.20],
    rows: [-3.5, -1.15, 1.20, 3.55],
    width: 2.4,
    depth: 1.12,
    chairColor: '#8d98a6'
  },

  teacher: {
    x: 1.55,
    z: 5.12,
    width: 2.85,
    depth: 1.05
  },

  furniture: [
    {
      id: 'S1-TABLET',
      kind: 'tablet',
      label: '태블릿 보관함',
      x: 3.57,
      z: -5.41,
      rot: 0,
      width: .62,
      height: 1.38,
      depth: .58,
      shelves: 4,
      verified: true
    },
    {
      id: 'S1-BACK-TWO-01',
      kind: 'metal2',
      label: '미니벽 뒤 철제 2단 수납장 1',
      x: -3.52,
      z: -4.22,
      rot: 90,
      width: .78,
      height: 1.08,
      depth: .55,
      shelves: 2,
      verified: true
    },
    {
      id: 'S1-BACK-TWO-02',
      kind: 'metal2',
      label: '미니벽 뒤 철제 2단 수납장 2',
      x: -3.52,
      z: -5.18,
      rot: 90,
      width: .78,
      height: 1.08,
      depth: .55,
      shelves: 2,
      verified: true
    }
  ],

  cabinets: [
    {
      id: 'S1-W01',
      kind: 'wood',
      label: '미술·색칠도구 보관장',
      x: -4.14,
      z: 3.86,
      rot: 90,
      width: 1.24,
      height: 2.43,
      depth: .63,
      shelves: 4
    },
    {
      id: 'S1-W02',
      kind: 'wood',
      label: '실험복 보관장',
      x: -4.14,
      z: 2.47,
      rot: 90,
      width: 1.24,
      height: 2.43,
      depth: .63,
      shelves: 4
    },
    {
      id: 'S1-L01',
      kind: 'wood',
      label: '안전장구 보관함',
      x: -4.14,
      z: 1.03,
      rot: 90,
      width: 1.12,
      height: 1.05,
      depth: .63,
      shelves: 2,
      verifiedContents: '안전장구'
    },
    {
      id: 'S1-L02',
      kind: 'wood',
      label: '실험키트 보관장',
      x: -4.14,
      z: -.20,
      rot: 90,
      width: 1.12,
      height: 1.05,
      depth: .63,
      shelves: 2
    },
    {
      id: 'S1-L03',
      kind: 'wood',
      label: '현미경 보관장 1',
      x: -4.14,
      z: -1.43,
      rot: 90,
      width: 1.12,
      height: 1.05,
      depth: .63,
      shelves: 2
    },
    {
      id: 'S1-L04',
      kind: 'wood',
      label: '현미경 보관장 2',
      x: -4.14,
      z: -2.66,
      rot: 90,
      width: 1.12,
      height: 1.05,
      depth: .63,
      shelves: 2
    },
    {
      id: 'S1-G01',
      kind: 'glass',
      label: '해부·채혈용품 보관장',
      x: -2.82,
      z: -6.13,
      rot: 0,
      width: 1.62,
      height: 2.18,
      depth: .62,
      shelves: 4
    },
    {
      id: 'S1-G02',
      kind: 'glass',
      label: '저울·온도계 보관장',
      x: -1.12,
      z: -6.13,
      rot: 0,
      width: 1.62,
      height: 2.18,
      depth: .62,
      shelves: 4
    },
    {
      id: 'S1-G03',
      kind: 'glass',
      label: '화학 실험용품 보관장',
      x: .58,
      z: -6.13,
      rot: 0,
      width: 1.62,
      height: 2.18,
      depth: .62,
      shelves: 4
    },
    {
      id: 'S1-S01',
      kind: 'wood',
      label: '뒤쪽 소형 보관함',
      x: 2.40,
      z: -6.14,
      rot: 0,
      width: 1.18,
      height: 1.08,
      depth: .60,
      shelves: 2
    },

    // 창가 하부장 7개: 기존 위치와 번호 유지
    ...[-4.78, -3.26, -1.74, -.22, 1.30, 2.82, 4.34]
      .map((z, i) => ({
        id: `S1-D${String(i + 1).padStart(2, '0')}`,
        kind: 'drawer',
        label: `창가 하부장 ${i + 1} (2줄)`,
        x: 4.12,
        z,
        rot: -90,
        width: 1.42,
        height: .88,
        depth: .62,
        shelves: 3,
        drawerColumns: 2
      }))
  ],

  inventory: [

    // S1-W01: 미술·색칠도구
    ...[
      '색연필',
      '색칠도구',
      '물풀'
    ].map(name => ({
      cabinet: 'S1-W01',
      name,
      shelf: null,
      quantity: null
    })),

    // S1-W02: 실험복
    {
      cabinet: 'S1-W02',
      name: '실험복',
      shelf: null,
      quantity: 30,
      unit: '개'
    },

    // S1-L01: 안전장구
    ...[
      '구급함',
      '방진마스크',
      '소방포',
      '보안경',
      '안전장갑'
    ].map(name => ({
      cabinet: 'S1-L01',
      name,
      shelf: null,
      quantity: null,
      keywords: ['안전장구', '안전용품']
    })),

    // S1-L02: 실험키트
    {
      cabinet: 'S1-L02',
      name: '실험키트',
      shelf: null,
      quantity: null
    },

    // S1-L03: 현미경 2종 임시 배정
    ...[
      '생물현미경',
      'USB현미경'
    ].map(name => ({
      cabinet: 'S1-L03',
      name,
      shelf: null,
      quantity: null,
      keywords: ['현미경']
    })),

    // S1-L04: 현미경 2종 임시 배정
    ...[
      '클립타입현미경',
      '현미경'
    ].map(name => ({
      cabinet: 'S1-L04',
      name,
      shelf: null,
      quantity: null,
      keywords: ['현미경']
    })),

    // 뒤쪽 철제장 1
    {
      cabinet: 'S1-BACK-TWO-01',
      name: '핫플레이트',
      shelf: null,
      quantity: null
    },

    // 뒤쪽 철제장 2
    {
      cabinet: 'S1-BACK-TWO-02',
      name: '실험키트',
      shelf: null,
      quantity: null
    },

    // S1-G01: 해부·채혈용품
    ...[
      '해부기',
      '거즈',
      '면봉',
      '면도',
      '알콜솜',
      '채혈용품',
      '커버글라스',
      '프레파라트'
    ].map(name => ({
      cabinet: 'S1-G01',
      name,
      shelf: null,
      quantity: null,
      keywords: ['해부용품']
    })),

    // S1-G02: 저울·온도계
    ...[
      '전자저울',
      '앉은뱅이저울',
      '접시저울',
      '드라이기',
      '기체분자운동모형',
      '적외선온도계',
      '디지털온도계',
      '탐침온도계'
    ].map(name => ({
      cabinet: 'S1-G02',
      name,
      shelf: null,
      quantity: null,
      keywords: ['저울류', '온도계류']
    })),

    // S1-G03: 화학 실험용품
    ...[
      '불꽃반응키트',
      '분자구조모형',
      '니트릴장갑',
      '크로마토그래피',
      'pH시험지',
      '리트머스시험지'
    ].map(name => ({
      cabinet: 'S1-G03',
      name,
      shelf: null,
      quantity: null
    })),

    // 태블릿 보관함
    {
      cabinet: 'S1-TABLET',
      name: '갤럭시탭(S11)',
      shelf: null,
      quantity: 8,
      unit: '대',
      keywords: ['태블릿', '갤럭시탭', 'S11']
    },

    // S1-D01: 플라스크·시험관
    ...[
      '삼각플라스크',
      '시험관',
      '분별깔때기'
    ].map(name => ({
      cabinet: 'S1-D01',
      name,
      shelf: null,
      quantity: null
    })),

    // S1-D02: 집기병·페트리접시
    ...[
      '집기병',
      '페트리접시',
      '부피플라스크'
    ].map(name => ({
      cabinet: 'S1-D02',
      name,
      shelf: null,
      quantity: null
    })),

    // S1-D03: 매스실린더·플라스크·비커
    ...[
      '매스실린더',
      '둥근바닥 플라스크',
      '가지달린둥근바닥 플라스크',
      '비커'
    ].map(name => ({
      cabinet: 'S1-D03',
      name,
      shelf: null,
      quantity: null
    })),

    // S1-D04: 소모품
    ...[
      '쿠킹호일',
      '비닐',
      '종이컵',
      '비닐장갑'
    ].map(name => ({
      cabinet: 'S1-D04',
      name,
      shelf: null,
      quantity: null
    })),

    // S1-D05: 사무용품
    ...[
      '테이프',
      '풀',
      '본드',
      '가위',
      '클립',
      '스테이플러',
      '펀치',
      '지우개'
    ].map(name => ({
      cabinet: 'S1-D05',
      name,
      shelf: null,
      quantity: null,
      keywords: ['사무용품']
    }))

    // S1-D06, S1-D07은 물품 미등록
  ]
};
/* 보관장 기자재 위치 변경 */
window.MUNSAN_LAB_LAYOUT.inventory.forEach(item => {
  if (item.cabinet === 'S1-D04') {
    item.cabinet = 'S1-D06';
  } else if (item.cabinet === 'S1-D05') {
    item.cabinet = 'S1-D07';
  }
});
