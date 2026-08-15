import Phaser from 'phaser';
import BootScene from '../scenes/BootScene';
import PreloadScene from '../scenes/PreloadScene';
import MenuScene from '../scenes/MenuScene';
import GameScene from '../scenes/GameScene';
import GameOverScene from '../scenes/GameOverScene';
import CutsceneScene from '../scenes/CutsceneScene';

// --- โค้ดใหม่: คำนวณความกว้างเกม ให้พอดีกับสัดส่วนหน้าจอ (Aspect Ratio) ของผู้เล่น ---
const screenRatio = window.innerWidth / window.innerHeight;
const gameHeight = 400; // ล็อคความสูงระบบฟิสิกส์ไว้ที่เดิม
const gameWidth = gameHeight * screenRatio; // ความกว้างจะยืดออกตามจอจริง

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: gameWidth,     // ดึงค่าความกว้างที่ยืดหยุ่นมาใช้
  height: gameHeight,
  parent: 'app',        // ★ แก้ให้ตรงกับ id="app" ในไฟล์ HTML แล้วครับ

  
  
  antialias: true, // เปิดระบบลบรอยหยัก (Smoothing)
  

  physics: {
    default: 'arcade',
    arcade: { gravity: {x: 0 , y: 2200 }, debug: false }, // (ถ้าภาพเป๊ะแล้ว เปลี่ยน debug เป็น false ได้เลยนะครับ)
  },
  scale: {
    mode: Phaser.Scale.FIT, // ระบบจะขยายเกมให้เต็มจอพอดี โดยไม่มีขอบดำ!
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene,CutsceneScene, MenuScene, GameScene, GameOverScene],
};