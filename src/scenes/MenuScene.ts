import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, 'menu-bg').setDisplaySize(width, height);

    this.add
      .text(width / 2, height / 2 - 40, 'Dino Run', { fontSize: '32px', color: '#000000', fontStyle: 'bold' })
      .setOrigin(0.5);

    const startText = this.add
      .text(width / 2, height / 2 + 20, 'กด SPACE เพื่อเริ่ม', { fontSize: '18px', color: '#000000', fontStyle: 'bold' })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      // ⚡ ลบ this.scene.start('Game'); ตรงนี้ออกไปเลยครับ

      // ให้เหลือแค่การเรียก Cutscene อย่างเดียว
      this.scene.start('Cutscene', { 
        images: ['cutscene1', 'cutscene2', 'cutscene3'], 
        nextScene: 'Game' // ระบบจะจัดการพาไปหน้า Game เองตอนดูรูปจบครับ
      });
    });

    this.tweens.add({
      targets: startText,
      alpha: 0.2,
      yoyo: true,
      repeat: -1,
      duration: 600,
    });
  }
}