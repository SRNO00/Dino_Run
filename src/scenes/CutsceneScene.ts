import Phaser from 'phaser';

interface CutsceneData {
  images: string[];       
  nextScene: string;      
  nextSceneData?: any;    
}

export default class CutsceneScene extends Phaser.Scene {
  private images: string[] = [];
  private currentIndex: number = 0;
  private currentImageObj!: Phaser.GameObjects.Image;
  private nextScene: string = '';
  private nextSceneData: any;

  constructor() {
    super('Cutscene');
  }

  create(data: CutsceneData): void {
    this.images = data.images;
    this.nextScene = data.nextScene;
    this.nextSceneData = data.nextSceneData;
    this.currentIndex = 0;

    const { width, height } = this.scale;

    // แสดงภาพแรกของคิวที่ส่งมา
    this.currentImageObj = this.add.image(width / 2, height / 2, this.images[this.currentIndex]);
    this.currentImageObj.setDisplaySize(width, height);

    this.add.text(width - 20, height - 20, 'กด SPACE เพื่อดูต่อ ►', {
      fontSize: '24px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(1, 1).setDepth(10);

    // กด SPACE เพื่อเปลี่ยนภาพ
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.currentIndex++;
      
      if (this.currentIndex < this.images.length) {
        // เปลี่ยนเป็นภาพถัดไป
        this.currentImageObj.setTexture(this.images[this.currentIndex]);
      } else {
        // รูปหมดแล้ว ไปหน้าต่อไป
        this.input.keyboard?.removeAllListeners('keydown-SPACE'); 
        this.scene.start(this.nextScene, this.nextSceneData);
      }
    });
  }
}