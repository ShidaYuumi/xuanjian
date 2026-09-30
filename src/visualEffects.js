import * as THREE from 'three';

const TAU = Math.PI * 2;

// 1. 基础辉光纹理生成器
export function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.85)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.22)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 2. 篆文印相纹理
export function makeGlyphTexture(glyph, color) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, 256, 256);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.shadowColor = color;
  context.shadowBlur = 18;
  context.fillStyle = color;
  context.font = '166px "Ma Shan Zheng", "Songti SC", serif';
  context.fillText(glyph, 128, 136);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 3. 神通类别（命、身、术、目、剑）专属法印纹理
export function makeSpellCategoryTexture(category, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);

  ctx.strokeStyle = colorHex;
  ctx.fillStyle = colorHex;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cx = 64, cy = 64;

  if (category === '剑') {
    // 剑形符印：锋芒锐剑与十字剑芒
    ctx.beginPath();
    ctx.moveTo(cx, cy - 42);
    ctx.lineTo(cx + 10, cy + 18);
    ctx.lineTo(cx, cy + 12);
    ctx.lineTo(cx - 10, cy + 18);
    ctx.closePath();
    ctx.fill();

    // 剑格与剑柄
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 16);
    ctx.lineTo(cx + 18, cy + 16);
    ctx.moveTo(cx, cy + 16);
    ctx.lineTo(cx, cy + 38);
    ctx.stroke();

    // 剑环
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, TAU);
    ctx.setLineDash([6, 12]);
    ctx.stroke();
  } else if (category === '目') {
    // 目形符印：重瞳法目
    ctx.beginPath();
    ctx.ellipse(cx, cy, 44, 26, 0, 0, TAU);
    ctx.stroke();

    // 瞳孔法阵
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, TAU);
    ctx.fill();

    // 灵目神光光芒
    ctx.beginPath();
    ctx.moveTo(cx, cy - 36); ctx.lineTo(cx, cy - 28);
    ctx.moveTo(cx, cy + 36); ctx.lineTo(cx, cy + 28);
    ctx.stroke();
  } else if (category === '身') {
    // 身形符印：玄武金刚八角磐石印
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      const r = 40;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, TAU);
    ctx.fill();
  } else if (category === '命') {
    // 命形符印：长明青灯/命魂火苗
    ctx.beginPath();
    ctx.moveTo(cx, cy - 36);
    ctx.bezierCurveTo(cx + 26, cy - 10, cx + 24, cy + 24, cx, cy + 36);
    ctx.bezierCurveTo(cx - 24, cy + 24, cx - 26, cy - 10, cx, cy - 36);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy + 10, 8, 0, TAU);
    ctx.fill();
  } else {
    // 默认或“术”：八卦星象旋轮
    ctx.beginPath();
    ctx.arc(cx, cy, 42, 0, TAU);
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + Math.PI / 4;
      ctx.moveTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20);
      ctx.lineTo(cx + Math.cos(a) * 38, cy + Math.sin(a) * 38);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, TAU);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 4. 特性视觉发生器：为不同属性的道统生成独特的星核造型
export function makeElementStarMesh(dao, color, glowTexture) {
  const group = new THREE.Group();
  const element = dao.element || 'metal';

  // 中心主辉光
  const centerAura = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  centerAura.scale.set(0.65, 0.65, 1);
  group.add(centerAura);

  if (element === 'sword') {
    // 剑脉：冷冽八面剑晶核 + 十字破空剑芒
    const geom = new THREE.OctahedronGeometry(0.18, 0);
    geom.scale(0.7, 2.0, 0.7);
    const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.rotation.z = Math.PI / 4;
    group.add(mesh);

    // 锋锐十字光芒
    const cross = new THREE.Group();
    const bladeGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.48, 0, 0), new THREE.Vector3(0.48, 0, 0),
      new THREE.Vector3(0, -0.48, 0), new THREE.Vector3(0, 0.48, 0)
    ]);
    const bladeMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
    cross.add(new THREE.LineSegments(bladeGeom, bladeMat));
    cross.rotation.z = Math.PI / 4;
    group.add(cross);
    group.userData.spinType = 'sword';
  } else if (element === 'fire') {
    // 火德 / 太阳：炽烈双层光焰环 + 爆发日冕
    const innerGeom = new THREE.IcosahedronGeometry(0.16, 1);
    const innerMat = new THREE.MeshBasicMaterial({ color: '#fff5ea', transparent: true, opacity: 0.9 });
    const inner = new THREE.Mesh(innerGeom, innerMat);
    group.add(inner);

    const corona = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    }));
    corona.scale.set(1.15, 1.15, 1);
    group.add(corona);
    group.userData.spinType = 'fire';
    group.userData.corona = corona;
  } else if (element === 'water' || element === 'frost') {
    // 水德 / 寒霜：柔性水波同心环
    const ringGeom = new THREE.RingGeometry(0.18, 0.23, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    group.add(ringMesh);

    const outerRing = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.33, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    group.add(outerRing);
    group.userData.spinType = 'water';
    group.userData.rings = [ringMesh, outerRing];
  } else if (element === 'wood') {
    // 木德：翠玉六芒晶星
    const geom = new THREE.DodecahedronGeometry(0.17, 0);
    const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.8 });
    const crystal = new THREE.Mesh(geom, mat);
    group.add(crystal);
    group.userData.spinType = 'wood';
    group.userData.crystal = crystal;
  } else if (element === 'thunder') {
    // 雷脉：极性元磁双折环
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * TAU;
      const r = 0.24 + (i % 2 === 0 ? 0.08 : -0.04);
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
    group.add(line);
    group.userData.spinType = 'thunder';
    group.userData.thunderLine = line;
  } else {
    // 土德 / 默认：八面厚土玉印
    const geom = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const mat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.75 });
    const box = new THREE.Mesh(geom, mat);
    box.rotation.set(0.6, 0.6, 0);
    group.add(box);
    group.userData.spinType = 'earth';
    group.userData.box = box;
  }

  return group;
}

// 5. 登场异象发生器：当道统被点击唤醒时的专属动效
export function createEntranceEffect(dao, position) {
  const effect = new THREE.Group();
  effect.position.copy(position);
  const color = new THREE.Color(dao.color || '#d8c08a');
  const element = dao.element || 'metal';

  // 1. 基础灵力冲击扩散环
  const ringGeom = new THREE.RingGeometry(0.1, 0.16, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const shockwave = new THREE.Mesh(ringGeom, ringMat);
  effect.add(shockwave);

  // 2. 专属粒子与异象元素
  let subElements = [];

  if (element === 'thunder') {
    // 狂暴雷击电弧
    for (let i = 0; i < 4; i++) {
      const arcPts = [new THREE.Vector3(0, 0, 0)];
      const dirAngle = (i / 4) * TAU + (Math.random() - 0.5) * 0.4;
      for (let s = 1; s <= 4; s++) {
        const segDist = s * 0.4;
        arcPts.push(new THREE.Vector3(
          Math.cos(dirAngle) * segDist + (Math.random() - 0.5) * 0.25,
          Math.sin(dirAngle) * segDist + (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.2
        ));
      }
      const arcGeom = new THREE.BufferGeometry().setFromPoints(arcPts);
      const arcLine = new THREE.Line(arcGeom, new THREE.LineBasicMaterial({ color: '#f0eaff', transparent: true, opacity: 1 }));
      effect.add(arcLine);
      subElements.push(arcLine);
    }
  } else if (element === 'sword') {
    // 八方破空剑气
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      const pts = [
        new THREE.Vector3(Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0),
        new THREE.Vector3(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0)
      ];
      const swordLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
      effect.add(swordLine);
      subElements.push(swordLine);
    }
  } else if (element === 'fire') {
    // 金红烈焰喷射火羽
    const count = 18;
    const pts = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      const r = 0.2 + Math.random() * 0.8;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, (Math.random() - 0.5) * 0.3));
    }
    const pGeom = new THREE.BufferGeometry().setFromPoints(pts);
    const pMat = new THREE.PointsMaterial({ color: '#ffc17a', size: 0.06, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(pGeom, pMat);
    effect.add(particles);
    subElements.push(particles);
  }

  // 动效生命周期控制对象
  return {
    group: effect,
    life: 0,      // 0 -> 1
    duration: 0.85, // 持续 0.85 秒
    update(delta) {
      this.life += delta / this.duration;
      const progress = Math.min(1, this.life);

      // 冲击波扩散淡出
      const scale = 1 + progress * 5.2;
      shockwave.scale.set(scale, scale, 1);
      shockwave.material.opacity = Math.max(0, (1 - progress) * 0.95);

      if (element === 'thunder') {
        subElements.forEach((el) => {
          el.material.opacity = (1 - progress) * (Math.random() > 0.3 ? 1 : 0.2);
        });
      } else if (element === 'sword') {
        subElements.forEach((el) => {
          el.scale.setScalar(1 + progress * 1.8);
          el.material.opacity = Math.max(0, 1 - progress * 1.2);
        });
      } else if (element === 'fire') {
        subElements.forEach((el) => {
          el.scale.setScalar(1 + progress * 2.2);
          el.material.opacity = Math.max(0, 1 - progress);
        });
      }

      return progress >= 1; // 结束返回 true
    },
    dispose() {
      shockwave.geometry.dispose();
      shockwave.material.dispose();
      subElements.forEach((el) => {
        el.geometry?.dispose();
        el.material?.dispose();
      });
      effect.parent?.remove(effect);
    }
  };
}

// 6. 神通点击激发特效：小星宿被激活时喷薄神通神芒
export function createSpellTriggerEffect(position, colorHex, category) {
  const group = new THREE.Group();
  group.position.copy(position);
  const color = new THREE.Color(colorHex);

  // 1. 极速膨胀的光晕涟漪
  const rippleGeom = new THREE.RingGeometry(0.04, 0.08, 32);
  const rippleMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const ripple = new THREE.Mesh(rippleGeom, rippleMat);
  group.add(ripple);

  // 2. 类别专有闪烁光效
  let extra;
  if (category === '剑') {
    // 剑意贯空光柱
    const pts = [new THREE.Vector3(0, -0.6, 0), new THREE.Vector3(0, 0.6, 0)];
    extra = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 1 }));
    extra.rotation.z = Math.PI / 4;
    group.add(extra);
  } else if (category === '目') {
    // 神目光芒绽放圆
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * TAU;
      pts.push(new THREE.Vector3(Math.cos(a) * 0.35, Math.sin(a) * 0.35, 0));
    }
    extra = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 }));
    group.add(extra);
  }

  return {
    group,
    life: 0,
    duration: 0.6,
    update(delta) {
      this.life += delta / this.duration;
      const progress = Math.min(1, this.life);

      const scale = 1 + progress * 3.8;
      ripple.scale.set(scale, scale, 1);
      ripple.material.opacity = Math.max(0, 1 - progress);

      if (extra) {
        extra.scale.setScalar(1 + progress * 2.2);
        extra.material.opacity = Math.max(0, (1 - progress) * 0.9);
      }

      return progress >= 1;
    },
    dispose() {
      rippleGeom.dispose();
      rippleMat.dispose();
      if (extra) {
        extra.geometry?.dispose();
        extra.material?.dispose();
      }
      group.parent?.remove(group);
    }
  };
}
