export interface BackgroundLayer {
  key: string;
  scrollFactor: number;
}

export interface ZoneConfig {
  id: string;
  name: string;
  startTime: number; // เรายังใช้หน่วยเวลาในการสลับด่านอยู่ (เพราะ 60 วิ = 1 กม.)
  endTime: number;
  background: BackgroundLayer[];
  groundKey: string;
  bgmKey: string;
  scrollSpeed: number;
}

export const TOTAL_DISTANCE_KM = 11; // ระยะทางเป้าหมาย 11 กิโลเมตร
export const TOTAL_GAME_TIME_SEC = 210

export const DEV_TIME_SCALE = 1; //ปรับความเร็วเกมเช่น 30 - 50 กำลังดี พอเสพบรรยากาศ

export const zones: ZoneConfig[] = [
  {
    id: 'zone1',
    name: 'ด่านปกติ',
    startTime: 0,
    endTime: TOTAL_GAME_TIME_SEC / 2, // ครึ่งแรก (0 ถึง 5.5 กม.)
    background: [
      { key: 'zone1-Background', scrollFactor: 0 }, 
      { key: 'zone1-Far', scrollFactor: 0.2 },        
      { key: 'zone1-Middle', scrollFactor: 0.3 },     
    ],
    groundKey: 'zone1-floor', // ⚡ เปลี่ยนเป็นพิมพ์เล็กให้ปลอดภัยเวลาอัปขึ้นเว็บ
    bgmKey: 'zone1-bgm',
    scrollSpeed: 6,
  },
  {
    id: 'zone2',
    name: 'ด่านหิมะ',
    startTime: TOTAL_GAME_TIME_SEC / 2, // ครึ่งหลัง (5.5 ถึง 11 กม.)
    endTime: TOTAL_GAME_TIME_SEC,
    background: [
      { key: 'zone2-Background', scrollFactor: 0 },
      { key: 'zone2-Far', scrollFactor: 0.2 },
      { key: 'zone2-Middle', scrollFactor: 0.3 },
    ],
    groundKey: 'zone2-floor',
    bgmKey: 'zone2-bgm',
    scrollSpeed: 6,
  }
];

export const finishZone: ZoneConfig = {
  id: 'finish',
  name: 'เส้นชัย',
  startTime: TOTAL_GAME_TIME_SEC,
  endTime: Infinity,
  background: [
    { key: 'finish-bg-far', scrollFactor: 0.2 },
    { key: 'finish-bg-near', scrollFactor: 0.6 },
  ],
  groundKey: 'finish-ground',
  bgmKey: 'finish-bgm',
  scrollSpeed: 0,
};