
/*
 문산중학교 과학실 3
 공통 scene.js용 전체 배치 데이터

 x: 왼쪽(-) / 오른쪽(+)
 z: 뒤쪽(-) / 앞쪽(+)

 모든 치수는 임시 모델링 좌표.
 실제 사진을 기준으로 추후 조정 가능.
*/

window.MUNSAN_LAB_LAYOUT = {

 id:'science3',
 name:'과학실 3',
 purpose:'지구과학',

 room:{
  width:10.2,
  depth:15.2,
  height:3.5
 },

 // 왼쪽 벽 출입문
 doors:[
  {
   id:'S3-ENT1',
   wall:'left',
   center:5.85,
   width:1.30,
   label:'과학실 3 출입문 1'
  },
  {
   id:'S3-ENT2',
   wall:'left',
   center:-5.75,
   width:1.30,
   label:'과학실 3 출입문 2'
  }
 ],

 // 오른쪽 창문
 windows:{
  wall:'right',
  centers:[-5.4,-2.0,1.4,4.8],
  width:2.3,
  height:1.25,
  sill:1.45
 },

 // 오른쪽 벽 미니벽
 partitions:[
  {
   x:4.43,
   z:-4.55,
   width:.72,
   depth:.22,
   height:2.55,
   label:'오른쪽 창가 미니벽'
  }
 ],

 // 학생 실험대
 // 사진상 정확한 수량 미확인: 임시 배치
 desks:{
  columns:[-1.65,1.35],
  rows:[-4.4,-1.45,1.50,4.45],
  width:2.25,
  depth:1.10
 },

 // 교사용 컴퓨터가 있는 앞쪽 책상
 teacher:{
  x:1.15,
  z:5.95,
  width:2.8,
  depth:1.05
 },

 furniture:[],

 cabinets:[

  // ==================================
  // 왼쪽 벽
  //
  // 출입문 1
  // 8칸 미니 개방형 선반
  // 2칸 목재장 4개
  // 대형 목재장 2개
  // 출입문 2
  // ==================================

  {
   id:'S3-L-OPEN8',
   kind:'drawer',
   label:'왼쪽 8칸 미니 개방형 선반 (임시 외형)',
   x:-4.73,
   z:4.55,
   rot:90,
   width:.95,
   height:1.02,
   depth:.55,
   shelves:3
  },

  {
   id:'S3-L-W01',
   kind:'wood',
   label:'왼쪽 낮은 목재장 1 (2칸)',
   x:-4.73,
   z:3.42,
   rot:90,
   width:1.02,
   height:1.05,
   depth:.58,
   shelves:2
  },
  {
   id:'S3-L-W02',
   kind:'wood',
   label:'왼쪽 낮은 목재장 2 (2칸)',
   x:-4.73,
   z:2.31,
   rot:90,
   width:1.02,
   height:1.05,
   depth:.58,
   shelves:2
  },
  {
   id:'S3-L-W03',
   kind:'wood',
   label:'왼쪽 낮은 목재장 3 (2칸)',
   x:-4.73,
   z:1.20,
   rot:90,
   width:1.02,
   height:1.05,
   depth:.58,
   shelves:2
  },
  {
   id:'S3-L-W04',
   kind:'wood',
   label:'왼쪽 낮은 목재장 4 (2칸)',
   x:-4.73,
   z:.09,
   rot:90,
   width:1.02,
   height:1.05,
   depth:.58,
   shelves:2
  },

  {
   id:'S3-L-TALL01',
   kind:'wood',
   label:'왼쪽 대형 목재 수납장 1',
   x:-4.73,
   z:-1.35,
   rot:90,
   width:1.50,
   height:2.40,
   depth:.62,
   shelves:4
  },
  {
   id:'S3-L-TALL02',
   kind:'wood',
   label:'왼쪽 대형 목재 수납장 2',
   x:-4.73,
   z:-3.02,
   rot:90,
   width:1.50,
   height:2.40,
   depth:.62,
   shelves:4
  },

  // ==================================
  // 뒤쪽 벽
  // 유리장 2개 + 6칸 서랍장
  // ==================================

  {
   id:'S3-B-G01',
   kind:'glass',
   label:'뒤쪽 대형 유리 수납장 1',
   x:-3.20,
   z:-7.20,
   rot:0,
   width:1.60,
   height:2.35,
   depth:.60,
   shelves:4
  },
  {
   id:'S3-B-G02',
   kind:'glass',
   label:'뒤쪽 대형 유리 수납장 2',
   x:-1.48,
   z:-7.20,
   rot:0,
   width:1.60,
   height:2.35,
   depth:.60,
   shelves:4
  },

  {
   id:'S3-B-D01',
   kind:'drawer',
   label:'뒤쪽 2열 × 3단 미니 서랍장 (6칸)',
   x:.40,
   z:-7.20,
   rot:0,
   width:1.50,
   height:1.05,
   depth:.58,
   shelves:3
  },

  // 수도시설은 공통 엔진에서 별도 모델이
  // 지원되지 않으므로 위치 정보만 등록.
  // 뒤쪽 오른편 수도·싱크대 위치
  {
   id:'S3-B-SINK',
   kind:'wood',
   label:'뒤쪽 수도 및 싱크대 위치 (임시 모델)',
   x:2.10,
   z:-7.20,
   rot:0,
   width:1.35,
   height:.90,
   depth:.60,
   shelves:2
  },

  // ==================================
  // 오른쪽 벽
  // 6칸 서랍장 1개
  // 미니벽
  // 6칸 서랍장 7개
  // 총 8개 = 48칸
  // ==================================

  {
   id:'S3-R-D01',
   kind:'drawer',
   label:'오른쪽 6칸 서랍장 1 (미니벽 이전)',
   x:4.70,
   z:-6.00,
   rot:-90,
   width:1.30,
   height:.96,
   depth:.55,
   shelves:3
  },

  {
   id:'S3-R-D02',
   kind:'drawer',
   label:'오른쪽 6칸 서랍장 2',
   x:4.70,
   z:-3.65,
   rot:-90,
   width:1.30,
   height:.96,
   depth:.55,
   shelves:3
  },
  {
   id:'S3-R-D03',
   kind:'drawer',
   label:'오른쪽 6칸 서랍장 3',
   x:4.70,
   z:-2.22,
   rot:-90,
   width:1.30,
   height:.96,
   depth:.55,
   shelves:3
  },
  {
   id:'S3-R-D04',
   kind:'drawer',
   label:'오른쪽 6칸 서랍장 4',
   x:4.70,
   z:-.79,
   rot:-90,
   width:1.30,
   height:.96,
   depth:.55,
   shelves:3
  },
  {
   id:'S3-R-D05',
   kind:'drawer',
   label:'오른쪽 6칸 서랍장 5',
   x:4.70,
   z:.64,
   rot:-90,
   width:1.30,
   height:.96,
   depth:.55,
   shelves:3
  },
  {
   id:'S3-R-D06',
   kind:'drawer',
   label:'오른쪽 6칸 서랍장 6',
   x:4.70,
   z:2.07,
   rot:-90,
   width:1.30,
   height:.96,
   depth:.55,
   shelves:3
  },
  {
   id:'S3-R-D07',
   kind:'drawer',
   label:'오른쪽 6칸 서랍장 7',
   x:4.70,
   z:3.50,
   rot:-90,
   width:1.30,
   height:.96,
   depth:.55,
   shelves:3
  },
  {
   id:'S3-R-D08',
   kind:'drawer',
   label:'오른쪽 6칸 서랍장 8',
   x:4.70,
   z:4.93,
   rot:-90,
   width:1.30,
   height:.96,
   depth:.55,
   shelves:3
  }

 ],

 inventory:[]

};
