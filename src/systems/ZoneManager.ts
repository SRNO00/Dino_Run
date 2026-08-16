import type Phaser from 'phaser';
import { zones, TOTAL_GAME_TIME_SEC, type ZoneConfig } from '../config/zones';

interface ActiveLayer {
  tile: Phaser.GameObjects.TileSprite;
  speed: number;
}

export default class ZoneManager {
  private scene: Phaser.Scene;
  private currentZoneId: string | null = null;
  private backgroundLayers: ActiveLayer[] = [];
  public ground: Phaser.GameObjects.TileSprite | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  getZoneAt(timeSec: number): ZoneConfig {
    if (timeSec >= TOTAL_GAME_TIME_SEC) return zones[zones.length - 1];
    return zones.find((z) => timeSec >= z.startTime && timeSec < z.endTime) ?? zones[0];
  }

  update(elapsedSec: number): void {
    const zone = this.getZoneAt(elapsedSec);
    if (zone.id !== this.currentZoneId) {
      this.transitionTo(zone);
    }
    for (const layer of this.backgroundLayers) {
      layer.tile.tilePositionX += layer.speed;
    }
    if (this.ground) {
      const gScale = this.ground.tileScaleX;
      // หารสเกลเพื่อให้พื้นวิ่งเร็วเท่าสิ่งกีดขวางเป๊ะๆ
      this.ground.tilePositionX += (zone.scrollSpeed / gScale); 
    }
  }

  private transitionTo(zone: ZoneConfig): void {
    this.currentZoneId = zone.id;
    const cam = this.scene.cameras.main;

    cam.fadeOut(250, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => {
      this.setupZoneVisuals(zone);
      cam.fadeIn(250, 0, 0, 0);
    });

    // เล่นเพลงประจำโซน เฉพาะตอนที่มีไฟล์เสียงโหลดสำเร็จแล้วเท่านั้น
    // (ตอนนี้ยังไม่มีไฟล์เสียงจริง เลยข้ามไปก่อน จะได้ไม่ error)
    if (zone.bgmKey && this.scene.cache.audio.exists(zone.bgmKey)) {
      this.scene.sound.stopAll();
      this.scene.sound.play(zone.bgmKey, { loop: true, volume: 0.5 });
    }
  }

  setupZoneVisuals(zone: ZoneConfig): void {
    this.currentZoneId = zone.id;

    for (const layer of this.backgroundLayers) {
      layer.tile.destroy();
    }
    this.backgroundLayers = [];

    const { width, height } = this.scene.scale;

    // 1. จัดการภาพพื้นหลัง
    zone.background.forEach((layerData, i) => {
      const tile = this.scene.add
        .tileSprite(width / 2, height / 2, width, height, layerData.key)
        .setDepth(i);
        
      const texHeight = this.scene.textures.get(layerData.key).get().height;
      const scale = height / texHeight; 
      tile.setTileScale(scale, scale);

      this.backgroundLayers.push({
        tile,
        // เอาความเร็ว หารด้วย scale เพื่อชดเชยให้ภาพที่ถูกย่อเลื่อนเร็วขึ้น
        speed: (zone.scrollSpeed * layerData.scrollFactor) / scale, 
      });
    });

    // 2. จัดการภาพพื้นดิน (Ground) ให้ยืดหยุ่นเหมือนฉากหลัง
    const gTexHeight = this.scene.textures.get(zone.groundKey).get().height;
    const gScale = height / gTexHeight; // คำนวณสเกลให้พอดีจอ

    if (this.ground) {
      this.ground.setTexture(zone.groundKey);
      this.ground.setTileScale(gScale, gScale);
    } else {
      // วาดเต็มจอไปเลย
      this.ground = this.scene.add
        .tileSprite(width / 2, height / 2, width, height, zone.groundKey)
        .setDepth(10);
      this.ground.setTileScale(gScale, gScale);
      this.scene.physics.add.existing(this.ground, true);
    }

    // 3. ปรับกรอบฟิสิกส์ (กล่องม่วง) ของพื้นให้อยู่แค่ขอบล่างสุด
    const groundBody = this.ground.body as Phaser.Physics.Arcade.StaticBody;
    const dirtHeight = 85; // ⚡ ความหนาของดิน ถ้าเหยียบแล้วลอยไป ให้เพิ่มเลขนี้ ถ้าจมไปให้ลดเลขนี้ครับ
    groundBody.setSize(width, dirtHeight);
    groundBody.setOffset(0, height - dirtHeight); // ดันกล่องม่วงไปติดขอบล่างจอ
  }
}