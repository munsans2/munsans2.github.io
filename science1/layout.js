/*
 문산중학교 과학실 1 — 현장 사진과 사용자 설명 기반 임시 배치
 사진은 웹사이트에 포함하지 않습니다. 거리/치수와 번호는 임시입니다.

 좌표: x 왼쪽(-) ↔ 오른쪽(+), z 칠판/유리장 벽(-) ↔ 교실 입구측(+)
       단위는 모델링용 가상 단위(m와 비슷하게 사용), 실측 아님.
 각 cabinet의 id는 3D 관리용 가상 번호입니다.

 최초 확인(요구사항):
 - 왼쪽 높은 목재 수납장 2개, 낮은 목재 수납장 4개
 - 낮은 목재장 첫 번째: 안전용품
 - 왼쪽 벽면의 짧은 미니벽 뒤로 작은 철제 2단 수납장 2개 (기존 왼쪽 수납장과 같은 방향, 출입구 통로 확보 위해 x 임시 조정)
 - 칠판 아래쪽 대형 유리 보관장 3개 + 옆 소형 보관함 1개
 - 창가 하부 보관함 14줄 = 2줄을 1개 모듈로 해석하여 7모듈
 - 빨간 네모 위치 태블릿 보관함 1개
 - 출입문 2곳. 이전 v3 표시 원래 위치: 왼쪽 벽면 z=-4.95 및 z=5.83 (정확한 벽면 치수는 추정)
 - 목재 보관장 삭제 금지 (출입문 공간을 위해 위치 조정)
*/
window.MUNSAN_LAB_LAYOUT = {
  id: 'science1',
  name: '과학실 1',
  purpose: '생명과학 · 화학',
  room: { width: 9.2, depth: 13.0, height: 3.5 },
  doors: [
    // 이전 v3에서 표시해 주신 원래 출입문 위치로 복구: 왼쪽 벽면 뒤쪽/앞쪽
    { id:'S1-ENT1', wall:'left', center:-4.95, width:1.30, label:'출입문 1 (뒤쪽 · 원래 위치)' },
    { id:'S1-ENT2', wall:'left', center:5.83, width:1.30, label:'출입문 2 (앞쪽 · 원래 위치)' }
  ],
  windows: { wall:'right', centers:[-4.60,-1.52,1.54,4.58], width:2.0, height:1.25, sill:1.40 },
  partitions: [
    { x:-4.30, z:-3.56, width:.52, depth:.22, height:2.55, label:'왼쪽 벽면의 짧은 미니벽 (긴 분리벽 아님)' }
  ],
  desks: {
    columns:[-1.80,1.20], rows:[-3.5,-1.15,1.20,3.55],
    width:2.4,depth:1.12, chairColor:'#8d98a6'
  },
  teacher: { x:1.55, z:5.12, width:2.85, depth:1.05 },
  furniture: [
    { id:'S1-TABLET', kind:'tablet', label:'태블릿 보관함', x:3.57,z:-5.41,rot:0,width:.62,height:1.38,depth:.58, shelves:4, verified:true },
    { id:'S1-BACK-TWO-01', kind:'metal2', label:'미니벽 뒤 철제 2단 수납장 1',x:-3.52,z:-4.22,rot:90,width:.78,height:1.08,depth:.55,shelves:2,verified:true },
    { id:'S1-BACK-TWO-02', kind:'metal2', label:'미니벽 뒤 철제 2단 수납장 2',x:-3.52,z:-5.18,rot:90,width:.78,height:1.08,depth:.55,shelves:2,verified:true }
  ],
  cabinets: [
    // 왼쪽 벽면: 큰 목재 수납장 2개 (절대 삭제하지 않음)
    { id:'S1-W01',kind:'wood',label:'왼쪽 대형 목재장 1',x:-4.14,z:3.86,rot:90,width:1.24,height:2.43,depth:.63,shelves:4 },
    { id:'S1-W02',kind:'wood',label:'왼쪽 대형 목재장 2',x:-4.14,z:2.47,rot:90,width:1.24,height:2.43,depth:.63,shelves:4 },
    // 낮은 목재장 4개 / 첫 번째는 안전용품 보관함
    { id:'S1-L01',kind:'wood',label:'안전용품 보관함 (낮은장 1)',x:-4.14,z:1.03,rot:90,width:1.12,height:1.05,depth:.63,shelves:2,verifiedContents:'안전용품' },
    { id:'S1-L02',kind:'wood',label:'왼쪽 낮은 목재장 2',x:-4.14,z:-.20,rot:90,width:1.12,height:1.05,depth:.63,shelves:2 },
    { id:'S1-L03',kind:'wood',label:'왼쪽 낮은 목재장 3',x:-4.14,z:-1.43,rot:90,width:1.12,height:1.05,depth:.63,shelves:2 },
    { id:'S1-L04',kind:'wood',label:'왼쪽 낮은 목재장 4',x:-4.14,z:-2.66,rot:90,width:1.12,height:1.05,depth:.63,shelves:2 },
    // 칠판 쪽: 유리문 대형 수납장 3개 + 작은 보관함 1개
    { id:'S1-G01',kind:'glass',label:'뒤쪽 대형 유리장 1',x:-2.82,z:-6.13,rot:0,width:1.62,height:2.18,depth:.62,shelves:4 },
    { id:'S1-G02',kind:'glass',label:'뒤쪽 대형 유리장 2',x:-1.12,z:-6.13,rot:0,width:1.62,height:2.18,depth:.62,shelves:4 },
    { id:'S1-G03',kind:'glass',label:'뒤쪽 대형 유리장 3',x:.58,z:-6.13,rot:0,width:1.62,height:2.18,depth:.62,shelves:4 },
    { id:'S1-S01',kind:'wood',label:'뒤쪽 소형 보관함',x:2.40,z:-6.14,rot:0,width:1.18,height:1.08,depth:.60,shelves:2 },
    // 창가 아래: 14줄 = 2줄당 1개, 총 7개 모듈
    ...[-4.78,-3.26,-1.74,-.22,1.30,2.82,4.34].map((z,i)=>({
      id:`S1-D${String(i+1).padStart(2,'0')}`,
      kind:'drawer',label:`창가 하부장 ${i+1} (2줄)`,x:4.12,z,
      rot:-90,width:1.42,height:.88,depth:.62,shelves:3,drawerColumns:2
    }))
  ],
  inventory: [
    // 확인된 기자재 위치만 등록. 선반/수량은 확인 전이므로 입력하지 않음.
    { name:'안전용품', cabinet:'S1-L01', shelf:null, quantity:null, keywords:['보호','안전','안전장비'], verified:true },
    { name:'태블릿 보관함', cabinet:'S1-TABLET', shelf:null, quantity:null, keywords:['태블릿','충전함'], verified:true }
  ]
};
