import Phaser from 'phaser';
import ZoneManager from '../systems/ZoneManager';
// ⚡ ดึง TOTAL_DISTANCE_KM มาใช้งาน
import { zones, TOTAL_GAME_TIME_SEC, DEV_TIME_SCALE, TOTAL_DISTANCE_KM } from '../config/zones';

export default class GameScene extends Phaser.Scene {
  private zoneManager!: ZoneManager;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private isSlidingState: boolean = false;
  private timerText!: Phaser.GameObjects.Text;
  private elapsedSec = 0;
  private gameEnded = false;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private spawnTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super('Game');
  }

  create(): void {
    this.elapsedSec = 0;
    this.gameEnded = false;

    this.zoneManager = new ZoneManager(this);
    this.zoneManager.setupZoneVisuals(zones[0]);

    this.player = this.physics.add.sprite(150, 100, 'player-run');
    this.player.setDepth(20); // ★ สำคัญ: ทำให้ตัวละครอยู่หน้าพื้นหลังและพื้นวิ่งเสมอ

    this.player.setScale(0.1);

    this.player.refreshBody(); // สั่งให้อัปเดตกรอบฟิสิกส์ตามสเกลที่ถูกย่อก่อน

    // --- โค้ดใหม่: หดและเลื่อนกรอบฟิสิกส์ (กล่องม่วง) ---
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    // 1. setSize(ความกว้าง, ความสูง)
    // จากเดิมกล่องกว้างและสูง 1023x1023 เราจะบีบมันให้เล็กลง (ใส่ตัวเลขของภาพขนาดเต็มก่อนย่อนะครับ)
    // ลองใส่ความกว้างสัก 400 ความสูงสัก 600
    body.setSize(400, 680);

    // 2. setOffset(เลื่อนแกน X, เลื่อนแกน Y)
    // เลื่อนกล่องที่ถูกบีบแล้ว ให้มาครอบพอดีตัวละคร (เลื่อนขวา, เลื่อนลง)
    // ลองเลื่อนขวาสัก 300 และเลื่อนลงมาสัก 200
    body.setOffset(300, 200);
    // ---------------------------------------------

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 6 }),
      frameRate: 18,
      repeat: -1,
    });
    this.player.play('run');

    if (this.zoneManager.ground) {
      this.physics.add.collider(this.player, this.zoneManager.ground);
    }

    // --- ปรับแต่งตัวหนังสือบอกระยะทาง ---
    // --- เทคนิคตัวหนังสือคมกริบ (สร้างใหญ่ 4 เท่า แล้วย่อสเกลลง 0.25) ---
    this.timerText = this.add
      .text(16, 16, '', { 
        fontSize: '180px',         // ⚡ ใหญ่ขึ้น 4 เท่า (จาก 24px -> 96px)
        color: '#ffffff',         
        fontStyle: '900',         
        stroke: '#000000',        
        strokeThickness: 45,      // ⚡ ขอบหนาขึ้น 4 เท่า (จาก 5 -> 20)
        shadow: {                 
          offsetX: 15,             // ⚡ เงาใหญ่ขึ้น 4 เท่า (จาก 2 -> 8)
          offsetY: 8,
          color: '#000000',
          fill: true
        }
      })
      .setDepth(100)
      .setScale(0.13); // ⚡ ย่อกลับมาให้เหลือขนาดเท่าเดิมด้วย 0.25

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    // 1. สร้าง Group สำหรับเก็บสิ่งกีดขวาง
    this.obstacles = this.physics.add.group();

    // 2. สั่งให้เช็คการชนระหว่าง player กับ obstacles ถ้าชนให้เรียกฟังก์ชัน hitObstacle
    this.physics.add.collider(
      this.player,
      this.obstacles,
      this.hitObstacle,
      undefined, 
      this
    );

    // --- โค้ดใหม่: สุ่มเวลาเกิดก้อนแรก (ระหว่าง 500 - 2500 มิลลิวินาที) ---
    this.spawnTimer = this.time.addEvent({
      delay: Phaser.Math.Between(500, 2500), 
      callback: this.spawnObstacle,
      callbackScope: this
      // ⚡ สังเกตว่าเราเอา loop: true ออกไปแล้ว
    });
  }

  update(_time: number, delta: number): void {
    if (this.gameEnded) return;

    this.elapsedSec += (delta / 1000) * DEV_TIME_SCALE;

    if (this.elapsedSec >= TOTAL_GAME_TIME_SEC + 5) {
      this.finishGame(true);
      return;
    }

    // ลบสิ่งกีดขวางที่วิ่งหลุดจอด้านซ้ายไปแล้ว
    this.obstacles.getChildren().forEach((child) => {
      const obs = child as Phaser.Physics.Arcade.Sprite;
      // ถ้าตำแหน่ง X น้อยกว่า -50 (หลุดขอบซ้าย) ให้ทำลายทิ้ง
      if (obs.x < -50) {
        obs.destroy();
      }
    });

    this.zoneManager.update(this.elapsedSec);
    this.updateHUD();

    const isJumping = this.cursors.space.isDown || this.cursors.up.isDown || this.keyW.isDown;
    const isSliding = this.cursors.down.isDown || this.keyS.isDown;
    
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    // ใช้ blocked.down จะแม่นยำกว่า touching.down เวลาเปลี่ยนขนาดกล่อง
    const onGround = body.touching.down || body.blocked.down;

    // --- 1. ระบบกระโดด ---
    // (ต้องไม่ได้สไลด์อยู่ ถึงจะกระโดดได้)
    if (isJumping && onGround && !this.isSlidingState) {
      this.player.setVelocityY(-900);
    }

    // --- 2. ระบบสไลด์ และ พุ่งลงพื้น ---
    // --- 2. ระบบสไลด์ และ พุ่งลงพื้น ---
    if (isSliding) {
      if (onGround) {
        // กรณีที่ 1: อยู่บนพื้น + กดสไลด์
        if (!this.isSlidingState) {
          this.isSlidingState = true; 
          
          // ⚡ 1. หยุดเล่นอนิเมชันวิ่ง และสลับไปโชว์ภาพ Slide
          this.player.anims.stop();
          this.player.setTexture('player-slide');
          
          // ⚡ 2. ใช้สเกล 0.1 ปกติเลยครับ ไม่ต้องบีบ Y แล้ว
          this.player.setScale(0.1); 
          
          // ⚡ 3. หดกล่องม่วงให้เตี้ยลง (กว้าง 400, สูง 340) และกดให้ติดพื้น
          body.setSize(400, 340); 
          body.setOffset(300, 540); 
        }
      } else {
        // กรณีที่ 2: อยู่กลางอากาศ + กดสไลด์ -> พุ่งลงพื้น
        this.player.setVelocityY(1500); 
      }
    } else {
      // กรณีที่ 3: ปล่อยปุ่มสไลด์ -> คืนร่างเดิม
      if (this.isSlidingState) {
        this.isSlidingState = false; 
        
        // ⚡ 1. สลับภาพกลับเป็นชุดวิ่ง และสั่งให้เล่นอนิเมชันวิ่งต่อทันที
        this.player.setTexture('player-run');
        this.player.play('run', true);
        
        this.player.setScale(0.1); 
        
        // ⚡ 2. ดึงกล่องม่วงกลับมาเป็นท่ายืนปกติ (กว้าง 400, สูง 680)
        body.setSize(400, 680); 
        body.setOffset(300, 200); 
      }
    }
  }

  private updateHUD(): void {
    // ⚡ เปลี่ยนสูตรใหม่: (เวลาที่ผ่านไป / เวลาทั้งหมด) * ระยะทางทั้งหมด
    const currentDistanceKm = (this.elapsedSec / TOTAL_GAME_TIME_SEC) * TOTAL_DISTANCE_KM;
    
    // ล็อกตัวเลขไม่ให้เกิน 11 กม. และแสดงทศนิยม 2 ตำแหน่ง
    const displayDistance = Math.min(currentDistanceKm, TOTAL_DISTANCE_KM).toFixed(2);
    
    // เปลี่ยนตัวหนังสือเป็นระยะทาง
    this.timerText.setText(`ระยะทาง: ${displayDistance} / ${TOTAL_DISTANCE_KM} km`);
  }

  // เปลี่ยนเป็นรับพารามิเตอร์ isWin
  private finishGame(isWin: boolean): void {
    this.gameEnded = true;

    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    if (isWin) {
      // ⚡ ถ้าชนะเข้าเส้นชัย ให้ไปหน้า Cutscene แล้วส่งรูป 4, 5, 6 ไปให้
      this.scene.start('Cutscene', {
        images: ['cutscene4', 'cutscene5', 'cutscene6'], 
        nextScene: 'GameOver', // ดูคัตซีนจบแล้ว ค่อยเด้งไปหน้าสรุปผล
        nextSceneData: { finished: isWin, time: this.elapsedSec } 
      });
    } else {
      // ⚡ ถ้าแพ้ชนหิน ไม่ต้องดูคัตซีน เด้งไปหน้า GameOver ทันทีเลย
      this.scene.start('GameOver', { finished: isWin, time: this.elapsedSec });
    }
  }

  // ฟังก์ชันเสกสิ่งกีดขวาง
  // ฟังก์ชันเสกสิ่งกีดขวาง
  private spawnObstacle(): void {
    if (this.gameEnded) return;

    const startX = this.scale.width + 50;
    const currentZone = this.zoneManager.getZoneAt(this.elapsedSec);
    const speed = -(currentZone.scrollSpeed * 60);

// --- ระบบสุ่มเกิด: หิน 80% / นก 20% ---
// แต่ละรอบจะเกิดอย่างใดอย่างหนึ่งเท่านั้น
const spawnBird = Phaser.Math.Between(1, 100) <= 20;
const spawnRock = !spawnBird;

    // --- 1. สร้างก้อนหิน (ถ้าสุ่มได้) ---
    if (spawnRock) {
      const rockY = 315;
      const rock = this.obstacles.create(startX, rockY, 'obstacle') as Phaser.Physics.Arcade.Sprite;
      rock.setOrigin(0.5, 1);
      rock.setScale(0.03); 
      rock.setDepth(15);
      (rock.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      
      rock.refreshBody();
      const rockBody = rock.body as Phaser.Physics.Arcade.Body;
      rockBody.setSize(1548, 1048);
      rockBody.setOffset(500, 1000);
      rock.setVelocityX(speed);
    }

    // --- 2. สร้างนก (ถ้าสุ่มได้) ---
    if (spawnBird) {
      // ⚡ ความสูงของนก (เลข Y ยิ่งน้อย = ยิ่งบินสูง) 
      // ลองกะระยะดูนะครับ ถ้าตัวละครสไลด์ไม่พ้น หรือกระโดดไม่พ้น ให้มาแก้เลขนี้
      const birdY = 270; 
      
      // ⚡ ถ้าออกพร้อมหิน ให้ผลักนกถอยหลังไปอีกนิด (ผู้เล่นจะได้มีเวลากระโดดหิน แล้วลงมาสไลด์ต่อทัน)
      const birdX = spawnRock ? startX + Phaser.Math.Between(250, 400) : startX;

      const bird = this.obstacles.create(birdX, birdY, 'bird') as Phaser.Physics.Arcade.Sprite;
      bird.setOrigin(0.5, 1);
      
      // --- ปรับสเกลภาพนก ---
      // (ลองใส่ 0.1 ดูก่อน กัสสามารถปรับแก้ให้เล็ก/ใหญ่ได้ตามภาพจริงครับ)
      bird.setScale(0.29); 
      bird.setDepth(15);
      (bird.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      
      // --- ปรับกล่องฟิสิกส์นก ---
      bird.refreshBody();
      const birdBody = bird.body as Phaser.Physics.Arcade.Body;
      
      // ⚡ กัสสามารถปลดคอมเมนต์ 2 บรรทัดล่างนี้ เพื่อปรับขนาดกรอบม่วงของนกได้เลยครับ 
      birdBody.setSize(100, 100); 
      birdBody.setOffset(0, 0);
      
      bird.setVelocityX(speed * 2.5);
    }

    // --- สุ่มเวลาเกิดรอบถัดไป ---
this.spawnTimer = this.time.addEvent({
  delay: Phaser.Math.Between(1000, 2500),
  callback: this.spawnObstacle,
  callbackScope: this
});
  }

  // ฟังก์ชันเมื่อผู้เล่นชนสิ่งกีดขวาง
  private hitObstacle(): void {
    this.physics.pause(); // หยุดระบบฟิสิกส์ทั้งหมด (ตัวละครหยุดนิ่ง)
    this.player.setTint(0xff0000); // เปลี่ยนตัวละครเป็นสีแดง
    this.player.anims.stop(); // หยุดอนิเมชันวิ่ง

    // สั่งจบเกม (รอ 0.5 วินาทีแล้วเด้งไปหน้า GameOver)
    this.time.delayedCall(500, () => {
      this.finishGame(false);
    });
  }
  
}