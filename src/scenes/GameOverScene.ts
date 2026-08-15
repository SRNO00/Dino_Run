import Phaser from 'phaser';

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
    
    // ⚡ คำนวณระยะทางจากเวลาที่รับมา
    const distanceKm = Math.min(data.time / 60, 11).toFixed(2);

    const titleText = data.finished ? 'ถึงเส้นชัยแล้ว!' : 'เกมโอเวอร์ (ชนสิ่งกีดขวาง)';
    const titleColor = data.finished ? '#00ff00' : '#ff0000'; 

    this.add
      .text(width / 2, height / 2 - 30, titleText, { fontSize: '28px', color: titleColor, fontStyle: 'bold' })
      .setOrigin(0.5);

    // ⚡ เปลี่ยนข้อความเป็นบอกระยะทาง
    this.add
      .text(width / 2, height / 2 + 10, `ระยะทางที่วิ่งได้: ${distanceKm} กิโลเมตร`, {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold' // ใส่ตัวหนาให้ด้วยเลยครับ
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('Game');
    });
  }
}