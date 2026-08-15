import Phaser from 'phaser';
import { zones, finishZone } from '../config/zones';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    const allZones = [...zones, finishZone];

    for (const zone of allZones) {
      for (const layer of zone.background) {
        const fileName = layer.key.replace(`${zone.id}-`, '');
        this.load.image(layer.key, `assets/images/zones/${zone.id}/${fileName}.png`);
      }
      const groundFileName = zone.groundKey.replace(`${zone.id}-`, '');
      this.load.image(zone.groundKey, `assets/images/zones/${zone.id}/${groundFileName}.png`);
      // TODO: เพิ่มไฟล์เสียงจริงในโฟลเดอร์ public/assets/audio/ แล้วค่อยเปิดบรรทัดล่างนี้กลับมาใช้
      // this.load.audio(zone.bgmKey, `assets/audio/${zone.bgmKey}.mp3`);
    }

    this.load.spritesheet('player-run', 'assets/images/SpriteCharacter.png', {
      frameWidth: 1023, // ความกว้างของ 1 เฟรม 
      frameHeight: 1023, // ความสูงของ 1 เฟรม
    });

    this.load.image('player-slide', 'assets/images/Slide.png');

    this.load.image('obstacle', 'assets/images/Obstacle.png');
    this.load.image('bird', 'assets/images/bird.png');

    // โหลดภาพหน้าเริ่มเกม
    this.load.image('menu-bg', 'assets/images/welcome.png'); 
    
    // โหลดภาพหน้าจบเกม (ชนสิ่งกีดขวาง)
    this.load.image('gameover-bg', 'assets/images/gameover.png');

    // --- ⚡ โหลดภาพคัตซีนทั้ง 6 ภาพจากโฟลเดอร์ cutscene ---
    this.load.image('cutscene1', 'assets/images/cutscene/cutscene1.png');
    this.load.image('cutscene2', 'assets/images/cutscene/cutscene2.png');
    this.load.image('cutscene3', 'assets/images/cutscene/cutscene3.png');
    
    this.load.image('cutscene4', 'assets/images/cutscene/cutscene4.png');
    this.load.image('cutscene5', 'assets/images/cutscene/cutscene5.png');
    this.load.image('cutscene6', 'assets/images/cutscene/cutscene6.png');
  }

  create(): void {

    this.scene.start('Menu');
  }
}