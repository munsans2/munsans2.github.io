
/*
 문산중학교 과학준비실
 배치 데이터

 x: 왼쪽(-) / 오른쪽(+)
 z: 안쪽(-) / 출입문(+)

 사진을 바탕으로 한 임시 치수
*/

window.PREP_LAYOUT = {
  name: "과학준비실",

  room: {
    width: 7.8,
    depth: 9.2,
    height: 3.2
  },

  door: {
    x: -2.15,
    width: 1.25
  },

  window: {
    x: -0.65,
    width: 2.0,
    height: 1.25
  },

  cabinets: [
    // 왼쪽 벽: 출입문에서 안쪽으로
    {
      id: "P-L01",
      name: "왼쪽 2×2 대형 수납장 1",
      kind: "large",
      x: -3.56, z: 1.30,
      rot: 90,
      width: 1.35, depth: 0.56,
      height: 2.10
    },
    {
      id: "P-L02",
      name: "왼쪽 2×2 대형 수납장 2",
      kind: "large",
      x: -3.56, z: -0.20,
      rot: 90,
      width: 1.35, depth: 0.56,
      height: 2.10
    },
   
{
  id: "P-CHEM",
  name: "시약보관함 1",
  kind: "chemical",
  x: -3.56, z: -3.32,
  rot: 90,
  width: 1.35, depth: 0.62,
  height: 2.35
},
{
  id: "P-CHEM02",
  name: "시약보관함 2",
  kind: "chemical",
  x: -3.56, z: -1.90,
  rot: 90,
  width: 1.35, depth: 0.62,
  height: 2.35
},


    // 안쪽 벽
    {
      id: "P-FRIDGE",
      name: "냉장고",
      kind: "fridge",
      x: -1.65, z: -4.14,
      rot: 0,
      width: 0.85, depth: 0.72,
      height: 2.02
    },
    {
      id: "P-WASTE",
      name: "폐수통 보관함",
      kind: "waste",
      x: 1.55, z: -4.18,
      rot: 0,
      width: 1.20, depth: 0.60,
      height: 0.95
    },

    // 오른쪽 벽: 안쪽 끝부터
    {
      id: "P-R01",
      name: "오른쪽 2×2 대형 수납장 1",
      kind: "large",
      x: 3.57, z: -3.70,
      rot: -90,
      width: 1.55, depth: 0.56,
      height: 2.10
    },
    {
      id: "P-R02",
      name: "오른쪽 2×2 대형 수납장 2",
      kind: "large",
      x: 3.57, z: -2.06,
      rot: -90,
      width: 1.55, depth: 0.56,
      height: 2.10
    },
    {
      id: "P-R03",
      name: "오른쪽 2×2 대형 수납장 3",
      kind: "large",
      x: 3.57, z: -0.42,
      rot: -90,
      width: 1.55, depth: 0.56,
      height: 2.10
    },

    // 출입문 오른쪽
    {
      id: "P-F01",
      name: "출입문 오른쪽 대형 수납장",
      kind: "large",
      x: 1.20, z: 4.18,
      rot: 180,
      width: 1.35, depth: 0.56,
      height: 2.10
    },
    {
      id: "P-F02",
      name: "출입문 오른쪽 미니 목재 서랍장",
      kind: "wood",
      x: 2.75, z: 4.18,
      rot: 180,
      width: 1.15, depth: 0.55,
      height: 0.95
    }
  ]
};
