import Phaser from 'phaser';
// ⚡ 1. เพิ่มบรรทัดนี้ เพื่อดึงตัวแปรมาใช้
import { TOTAL_GAME_TIME_SEC, TOTAL_DISTANCE_KM } from '../config/zones'; 

interface GameOverData {
  finished: boolean;
  time: number;
}

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: GameOverData): void {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, 'gameover-bg').setDisplaySize(width, height);
    
    // ⚡ 2. แก้สูตรคำนวณให้เป็นแบบเดียวกับที่ใช้ในหน้าเกม
    const currentDistanceKm = (data.time / TOTAL_GAME_TIME_SEC) * TOTAL_DISTANCE_KM;
    const distanceKm = Math.min(currentDistanceKm, TOTAL_DISTANCE_KM).toFixed(2);

    const titleText = data.finished ? 'ถึงเส้นชัยแล้ว!' : 'เกมโอเวอร์ (ชนสิ่งกีดขวาง)';
    const titleColor = data.finished ? '#00ff00' : '#ff0000'; 

    this.add
      .text(width / 2, height / 2 - 30, titleText, { fontSize: '28px', color: titleColor, fontStyle: 'bold' })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 10, `ระยะทางที่วิ่งได้: ${distanceKm} กิโลเมตร`, {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold' 
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('Game');
    });
  }
}