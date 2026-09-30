import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  makeGlowTexture,
  makeGlyphTexture,
  makeSpellCategoryTexture,
  makeElementStarMesh,
  createEntranceEffect,
  createSpellTriggerEffect,
} from './visualEffects.js';

const TAU = Math.PI * 2;
const palette = {
  water: '#68c5d8', jade: '#8ec788', gold: '#f6c15c', ember: '#f26e47',
  earth: '#cfb177', moon: '#b9aed0', silver: '#e6ded0', mist: '#bfebe1',
};

function line(points, color, opacity = 0.3) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
  );
}

function ring(radius, color, opacity = 0.6, tube = 0.008) {
  return new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 4, 128),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
  );
}

function disposeTree(root) {
  if (!root) return;
  root.traverse((object) => {
    object.geometry?.dispose();
    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((mat) => {
        if (mat.map && mat.map !== root.userData.sharedGlow) {
          mat.map.dispose();
        }
        mat.dispose();
      });
    }
  });
  root.parent?.remove(root);
}

// 椭圆星轨排列算法
function daoPositions(count) {
  return Array.from({ length: count }, (_, index) => {
    const crowded = count > 16;
    const outerCount = crowded ? Math.ceil(count * 0.62) : count;
    const outer = index < outerCount;
    const localIndex = outer ? index : index - outerCount;
    const ringCount = outer ? outerCount : count - outerCount;
    const angle = (localIndex / ringCount) * TAU - Math.PI / 2 + (outer ? 0 : Math.PI / ringCount);
    const radiusX = outer ? (crowded ? 4.35 : 3.95) : 3.25;
    const radiusY = outer ? (crowded ? 3.05 : 2.75) : 2.5;
    return new THREE.Vector3(
      Math.cos(angle) * radiusX,
      Math.sin(angle) * radiusY,
      -0.25 + Math.sin(angle * 2 + index) * 0.18 - (outer ? 0 : 0.1)
    );
  });
}

// 神通排列：环绕在中心道统周围的星宿
function spellPositions(count) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * TAU - (count === 2 ? Math.PI : Math.PI / 2);
    const dist = count > 6 ? 1.95 : 1.75;
    return new THREE.Vector3(
      Math.cos(angle) * dist,
      Math.sin(angle) * (dist * 0.88),
      0.65 + Math.sin(index * 2.5) * 0.15
    );
  });
}

// 核心法鉴轮盘
function makeHeart(glowTexture) {
  const heart = new THREE.Group();
  const aura = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: '#9c3b32',
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  aura.scale.set(3.8, 3.8, 1);
  aura.position.z = -0.4;
  heart.add(aura);

  const face = new THREE.Mesh(new THREE.CircleGeometry(0.98, 96), new THREE.MeshBasicMaterial({ color: '#071614' }));
  face.position.z = 0.05;
  heart.add(face);

  const faceWash = new THREE.Mesh(
    new THREE.CircleGeometry(0.92, 96),
    new THREE.MeshBasicMaterial({ color: '#9c3b32', transparent: true, opacity: 0.08, depthWrite: false })
  );
  faceWash.position.z = 0.06;
  heart.add(faceWash);

  const outer = ring(1.05, '#c6b48a', 0.75, 0.01);
  outer.position.z = 0.09;
  const inner = ring(0.76, '#9c3b32', 0.58, 0.007);
  inner.position.z = 0.1;
  heart.add(outer, inner);

  const orbitA = ring(1.32, '#c6b48a', 0.25, 0.005);
  orbitA.rotation.set(0.62, 0.08, 0);
  const orbitB = ring(1.2, '#6f8f86', 0.18, 0.004);
  orbitB.rotation.set(-0.48, 0.2, 0.2);
  heart.add(orbitA, orbitB);

  heart.userData = { aura, faceWash, orbitA, orbitB, sharedGlow: glowTexture };
  return heart;
}

// 道统节点：根据五行/阴阳特性专属构造
function makeDaoNode(dao, position, glowTexture) {
  const group = new THREE.Group();
  const tone = new THREE.Color(palette[dao.tone] ?? dao.color);

  // 专属特性星体
  const starMesh = makeElementStarMesh(dao, tone, glowTexture);
  group.add(starMesh);

  // 点击拾取热区
  const target = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
  target.userData.dao = dao;
  group.add(target);

  group.position.copy(position);
  group.userData = { starMesh, target, sharedGlow: glowTexture, dao };
  return group;
}

// 神通节点：带有其类别专属法印（命/身/术/目/剑）
function makeSpellNode(spell, index, position, colorHex, glowTexture) {
  const group = new THREE.Group();
  const cat = (spell.category && spell.category[0]) || '术';

  // 法印贴图
  const catTexture = makeSpellCategoryTexture(cat, colorHex);
  const seal = new THREE.Mesh(
    new THREE.PlaneGeometry(0.36, 0.36),
    new THREE.MeshBasicMaterial({
      map: catTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  seal.position.z = 0.05;
  group.add(seal);

  // 背景微光
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  glow.scale.set(0.42, 0.42, 1);
  group.add(glow);

  // 拾取热区
  const target = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
  target.userData.spell = spell.name;
  group.add(target);

  group.position.copy(position);
  group.userData = { seal, glow, target, sharedGlow: glowTexture, category: cat, colorHex };
  return group;
}

// 深空浩渺星尘
function makeStars() {
  const positions = [];
  let seed = 88;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let index = 0; index < 450; index += 1) {
    positions.push((random() - 0.5) * 16, (random() - 0.5) * 11, -3.8 - random() * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: '#ded7b8',
      size: 0.02,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
      depthWrite: false,
    })
  );
}

export default function ThreeDaoScene({
  daos,
  selected,
  activeSpell,
  onChooseDao,
  onChooseSpell,
  groupName,
}) {
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const labelRefs = useRef(new Map());
  const spellRefs = useRef(new Map());
  const runtimeRef = useRef(null);
  const callbacksRef = useRef({ onChooseDao, onChooseSpell });
  const pointerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [supported, setSupported] = useState(true);

  const positions = useMemo(() => daoPositions(daos.length), [daos]);
  const spells = selected?.spells ?? [];
  callbacksRef.current = { onChooseDao, onChooseSpell };

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setSupported(false);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    const field = new THREE.Group();
    scene.add(field);

    const glow = makeGlowTexture();
    const heart = makeHeart(glow);
    field.add(heart);

    const stars = makeStars();
    scene.add(stars);

    const ambient = new THREE.AmbientLight('#d8ede5', 1.8);
    const key = new THREE.PointLight('#caede0', 25, 10);
    key.position.set(-2, 3, 4);
    const rim = new THREE.PointLight('#f6be82', 16, 9);
    rim.position.set(2, -2, 2);
    scene.add(ambient, key, rim);

    const activeEffects = [];

    const runtime = {
      renderer,
      scene,
      camera,
      field,
      heart,
      stars,
      glow,
      daoNodes: [],
      spellNodes: [],
      targets: [],
      activeEffects,
      rotation: { x: -0.04, y: -0.16 },
      targetRotation: { x: -0.04, y: -0.16 },
      width: 1,
      height: 1,
      motion: true,
      lastTime: 0,
    };
    runtimeRef.current = runtime;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function layoutLabels() {
      camera.updateMatrixWorld();
      field.updateWorldMatrix(true, true);
      const place = (map, nodes, push) => {
        nodes.forEach((node) => {
          const key = node.userData.labelKey;
          const element = map.get(key);
          if (!element) return;
          const point = new THREE.Vector3();
          node.getWorldPosition(point);
          point.project(camera);
          const visible = point.z < 1 && point.z > -1 && Math.abs(point.x) < 0.95 && Math.abs(point.y) < 0.95;
          const sx = (point.x * 0.5 + 0.5) * runtime.width;
          const sy = (-point.y * 0.5 + 0.5) * runtime.height;
          const dx = sx - runtime.width / 2;
          const dy = sy - runtime.height / 2;
          const length = Math.hypot(dx, dy) || 1;
          element.style.transform = `translate3d(${sx + (dx / length) * push}px, ${sy + (dy / length) * push}px, 0) translate(-50%, -50%)`;
          element.style.opacity = visible ? String(THREE.MathUtils.clamp(1.3 - Math.max(0, -node.position.z) * 0.45, 0.4, 1)) : '0';
          element.style.pointerEvents = visible ? '' : 'none';
        });
      };
      place(labelRefs.current, runtime.daoNodes, 20);
      place(spellRefs.current, runtime.spellNodes, 12);
    }

    function draw(time = 0) {
      const delta = runtime.lastTime ? Math.min((time - runtime.lastTime) * 0.001, 0.06) : 0;
      runtime.lastTime = time;

      if (runtime.motion && delta) {
        runtime.rotation.y += (runtime.targetRotation.y - runtime.rotation.y) * Math.min(1, delta * 5);
        runtime.rotation.x += (runtime.targetRotation.x - runtime.rotation.x) * Math.min(1, delta * 5);

        // 旋转背景星盘与光辉
        heart.userData.orbitA.rotation.z += delta * 0.12;
        heart.userData.orbitB.rotation.z -= delta * 0.09;

        // 驱动特效动画
        for (let i = activeEffects.length - 1; i >= 0; i--) {
          const ef = activeEffects[i];
          const finished = ef.update(delta);
          if (finished) {
            ef.dispose();
            activeEffects.splice(i, 1);
          }
        }

        // 驱动道统特性星体内部微自转
        runtime.daoNodes.forEach((node) => {
          const star = node.userData.starMesh;
          if (star?.userData?.spinType === 'sword') {
            star.rotation.z += delta * 0.4;
          } else if (star?.userData?.spinType === 'fire') {
            const scale = 1.1 + Math.sin(time * 0.004) * 0.1;
            star.userData.corona.scale.set(scale, scale, 1);
          } else if (star?.userData?.spinType === 'water') {
            star.rotation.z -= delta * 0.3;
          } else if (star?.userData?.spinType === 'wood') {
            star.userData.crystal.rotation.x += delta * 0.5;
            star.userData.crystal.rotation.y += delta * 0.4;
          } else if (star?.userData?.spinType === 'thunder') {
            star.userData.thunderLine.rotation.z += delta * 0.8;
          }
        });

        // 驱动神通小星微浮动
        runtime.spellNodes.forEach((node, idx) => {
          node.position.z = 0.65 + Math.sin(time * 0.002 + idx * 1.5) * 0.08;
          node.userData.seal.rotation.z += delta * 0.25;
        });

        if (runtime.manifestGroup?.userData.stamp > 0) {
          runtime.manifestGroup.userData.stamp = Math.max(0, runtime.manifestGroup.userData.stamp - delta * 1.8);
          runtime.manifestGroup.scale.setScalar(1 + runtime.manifestGroup.userData.stamp * 0.35);
        }
      } else {
        runtime.rotation.x = runtime.targetRotation.x;
        runtime.rotation.y = runtime.targetRotation.y;
      }

      field.rotation.set(runtime.rotation.x, runtime.rotation.y, 0);
      layoutLabels();
      renderer.render(scene, camera);
    }
    runtime.draw = draw;

    function resize() {
      const width = frame.clientWidth;
      const height = frame.clientHeight;
      if (!width || !height) return;
      runtime.width = width;
      runtime.height = height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const narrow = window.matchMedia('(max-width: 768px)').matches;
      field.scale.setScalar(Math.min(1.15, Math.max(narrow ? 0.72 : 0.65, width / (narrow ? 560 : 780))));
      renderer.setSize(width, height, false);
      draw(performance.now());
    }

    const observer = new ResizeObserver(resize);
    observer.observe(frame);

    const updateMotion = () => {
      runtime.motion = !motionQuery.matches;
      renderer.setAnimationLoop(runtime.motion && !document.hidden ? draw : null);
      runtime.lastTime = 0;
      draw(performance.now());
    };

    motionQuery.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateMotion);
    updateMotion();
    resize();

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateMotion);
      renderer.setAnimationLoop(null);
      runtimeRef.current = null;
      activeEffects.forEach((ef) => ef.dispose());
      if (runtime.daoGroup) disposeTree(runtime.daoGroup);
      if (runtime.spellGroup) disposeTree(runtime.spellGroup);
      if (runtime.manifestGroup) disposeTree(runtime.manifestGroup);
      if (runtime.selectedTrace) disposeTree(runtime.selectedTrace);
      if (runtime.selectionGroup) disposeTree(runtime.selectionGroup);
      disposeTree(heart);
      disposeTree(stars);
      glow.dispose();
      renderer.dispose();
    };
  }, []);

  // 更新道统节点
  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    if (runtime.daoGroup) disposeTree(runtime.daoGroup);

    const group = new THREE.Group();
    group.userData.sharedGlow = runtime.glow;
    const nodes = daos.map((dao, index) => {
      const node = makeDaoNode(dao, positions[index], runtime.glow);
      node.userData.labelKey = dao.id;
      group.add(node);
      return node;
    });

    runtime.field.add(group);
    runtime.daoGroup = group;
    runtime.daoNodes = nodes;
    runtime.targets = [
      ...nodes.map((n) => n.userData.target),
      ...runtime.spellNodes.map((n) => n.userData.target),
    ];
    runtime.draw(performance.now());
  }, [daos, positions]);

  // 当选中道统改变时：触发专属登场特效 + 展开神通星宿
  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime || !selected) return;

    if (runtime.spellGroup) disposeTree(runtime.spellGroup);
    if (runtime.manifestGroup) {
      disposeTree(runtime.manifestGroup);
      runtime.manifestGroup = null;
    }
    if (runtime.selectionGroup) disposeTree(runtime.selectionGroup);
    if (runtime.selectedTrace) {
      disposeTree(runtime.selectedTrace);
      runtime.selectedTrace = null;
    }

    const color = new THREE.Color(palette[selected.tone] ?? selected.color);
    const colorHex = selected.color || palette[selected.tone] || '#c8b56e';

    // 1. 触发道统专属登场特效
    const selectedNode = runtime.daoNodes.find(
      (node) => node.userData.target.userData.dao.id === selected.id
    );
    if (selectedNode) {
      const effect = createEntranceEffect(selected, selectedNode.position);
      runtime.field.add(effect.group);
      runtime.activeEffects.push(effect);

      // 灵光丝线连向法鉴核心
      const start = selectedNode.position.clone();
      const end = start.clone().setZ(0).normalize().multiplyScalar(1.08);
      end.z = 0.1;
      const control = start.clone().lerp(end, 0.52);
      control.z = 0.6;
      const trace = line(new THREE.QuadraticBezierCurve3(start, control, end).getPoints(40), color, 0.4);
      runtime.field.add(trace);
      runtime.selectedTrace = trace;
    }

    // 2. 依次展现所属神通星宿
    const group = new THREE.Group();
    group.userData.sharedGlow = runtime.glow;
    const nodes = spellPositions(spells.length).map((position, index) => {
      const node = makeSpellNode(spells[index], index, position, colorHex, runtime.glow);
      node.userData.labelKey = spells[index].name;
      group.add(node);

      // 从法鉴延伸向神通的星宿链
      const start = new THREE.Vector3(position.x * 0.65, position.y * 0.65, 0.12);
      const curve = new THREE.QuadraticBezierCurve3(
        start,
        new THREE.Vector3(position.x * 0.82, position.y * 0.82, 0.55),
        position
      );
      const trace = line(curve.getPoints(24), color, 0.28);
      group.add(trace);
      return node;
    });

    runtime.field.add(group);
    runtime.spellGroup = group;
    runtime.spellNodes = nodes;
    runtime.targets = [
      ...runtime.daoNodes.map((n) => n.userData.target),
      ...nodes.map((n) => n.userData.target),
    ];

    // 3. 核心法鉴显化道统篆文
    const selection = new THREE.Group();
    const glyphTexture = makeGlyphTexture(selected.glyph, colorHex);
    const glyph = new THREE.Mesh(
      new THREE.PlaneGeometry(0.96, 0.96),
      new THREE.MeshBasicMaterial({
        map: glyphTexture,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    glyph.position.z = 0.16;
    selection.add(glyph);

    runtime.heart.userData.faceWash.material.color.copy(color);
    runtime.heart.userData.aura.material.color.copy(color);
    runtime.heart.add(selection);
    selection.userData = { glyph, sharedGlow: runtime.glow };
    runtime.selectionGroup = selection;

    // 高亮当前选中的道统节点
    runtime.daoNodes.forEach((node) => {
      const active = node.userData.target.userData.dao.id === selected.id;
      node.scale.setScalar(active ? 1.28 : 1);
    });

    runtime.draw(performance.now());
  }, [daos, selected, spells]);

  // 当点击神通时：激发神通呈现动画
  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    if (runtime.manifestGroup) {
      disposeTree(runtime.manifestGroup);
      runtime.manifestGroup = null;
    }

    if (runtime.selectionGroup) {
      runtime.selectionGroup.userData.glyph.material.opacity = activeSpell ? 0.22 : 0.95;
    }

    runtime.spellNodes.forEach((node) => {
      const active = node.userData.labelKey === activeSpell;
      node.userData.glow.material.opacity = active ? 0.85 : 0.25;
      node.scale.setScalar(active ? 1.25 : 1);
    });

    if (activeSpell) {
      const node = runtime.spellNodes.find((item) => item.userData.labelKey === activeSpell);
      const colorHex = selected?.color || '#f6c15c';
      const category = node?.userData.category || '术';

      // 触发神通微观激发动画
      if (node) {
        const triggerEffect = createSpellTriggerEffect(node.position, colorHex, category);
        runtime.field.add(triggerEffect.group);
        runtime.activeEffects.push(triggerEffect);
      }

      // 法鉴核心显化神通首字神印
      const manifest = new THREE.Group();
      const glyphTexture = makeGlyphTexture(activeSpell.slice(0, 1), colorHex);
      const glyph = new THREE.Mesh(
        new THREE.PlaneGeometry(1.08, 1.08),
        new THREE.MeshBasicMaterial({
          map: glyphTexture,
          transparent: true,
          opacity: 1,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      glyph.position.z = 0.28;
      manifest.add(glyph);

      const seal = ring(0.64, colorHex, 0.85, 0.012);
      seal.position.z = 0.24;
      manifest.add(seal);

      if (node) {
        const start = new THREE.Vector3().copy(node.position);
        const arc = new THREE.QuadraticBezierCurve3(
          start,
          new THREE.Vector3(start.x * 0.35, start.y * 0.35, 0.95),
          new THREE.Vector3(0, 0, 0.35)
        );
        manifest.add(line(arc.getPoints(36), colorHex, 0.7));
      }

      manifest.userData = { stamp: runtime.motion ? 1 : 0, sharedGlow: runtime.glow };
      manifest.scale.setScalar(runtime.motion ? 1.35 : 1);
      runtime.field.add(manifest);
      runtime.manifestGroup = manifest;
    }

    runtime.draw(performance.now());
  }, [activeSpell, selected]);

  function onPointerDown(event) {
    if (event.button !== 0 || event.target.closest('button')) return;
    pointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      moved: false,
      rotation: { ...runtimeRef.current?.targetRotation },
    };
    frameRef.current?.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    const pointer = pointerRef.current;
    const runtime = runtimeRef.current;
    if (!pointer || !runtime) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (Math.hypot(dx, dy) > 4) {
      pointer.moved = true;
      setDragging(true);
    }
    if (pointer.moved) {
      runtime.targetRotation.y = pointer.rotation.y + dx * 0.0045;
      runtime.targetRotation.x = THREE.MathUtils.clamp(pointer.rotation.x + dy * 0.0025, -0.4, 0.4);
      if (!runtime.motion) runtime.draw(performance.now());
    }
  }

  function onPointerUp(event) {
    const pointer = pointerRef.current;
    const runtime = runtimeRef.current;
    pointerRef.current = null;
    setDragging(false);
    if (!pointer || pointer.moved || !runtime || event.type === 'pointercancel') return;
    const bounds = frameRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, runtime.camera);
    runtime.field.updateWorldMatrix(true, true);
    const hit = raycaster.intersectObjects(runtime.targets, false)[0]?.object;
    if (hit?.userData.dao) callbacksRef.current.onChooseDao(hit.userData.dao);
    if (hit?.userData.spell) callbacksRef.current.onChooseSpell(hit.userData.spell);
  }

  return (
    <div
      className={`scene-frame ${dragging ? 'is-dragging' : ''}`}
      ref={frameRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="scene-backdrop" aria-hidden="true">
        <div className="astrolabe-disk">
          <span className="disk-meridian" />
          <span className="disk-equator" />
          <span className="disk-inner" />
        </div>
      </div>
      <div className="scene-runes rune-one" aria-hidden="true">太虚为镜 · 万法有迹</div>
      <div className="scene-runes rune-two" aria-hidden="true">一念观道 · 百炁朝元</div>
      <canvas ref={canvasRef} className="three-canvas" aria-label="全屏三维道统星象图" />
      {!supported && (
        <div className="scene-fallback">
          此处无法开启三维观想<br />
          <small>仍可从道统列表与秘卷中继续查阅</small>
        </div>
      )}
      {supported && (
        <div className="scene-labels" aria-label="星图中的道统">
          {daos.map((dao, index) => (
            <button
              key={dao.id}
              ref={(node) => {
                if (node) labelRefs.current.set(dao.id, node);
                else labelRefs.current.delete(dao.id);
              }}
              className={`dao-marker ${dao.id === selected?.id ? 'dao-marker-active' : ''} ${
                daos.length > 14 && index % 3 && dao.id !== selected?.id ? 'dao-marker-mobile-hidden' : ''
              }`}
              style={{ '--tone': palette[dao.tone] ?? dao.color }}
              aria-label={`${dao.name}道统，${dao.spells.length}项神通`}
              onClick={() => onChooseDao(dao)}
            >
              <span>{dao.name}</span>
            </button>
          ))}
        </div>
      )}
      {supported && (
        <div className="scene-labels spell-labels" aria-label="所选道统的神通">
          {spells.map((spell) => (
            <button
              key={spell.name}
              ref={(node) => {
                if (node) spellRefs.current.set(spell.name, node);
                else spellRefs.current.delete(spell.name);
              }}
              className={`spell-seal ${activeSpell === spell.name ? 'spell-seal-active' : ''}`}
              style={{ '--tone': palette[selected.tone] ?? selected.color }}
              onClick={() => onChooseSpell(spell.name)}
              aria-label={`${spell.name}神通${activeSpell === spell.name ? '，正在观想' : ''}`}
            >
              <b aria-hidden="true">{spell.name.slice(0, 1)}</b>
              <em>{spell.name.slice(1)}</em>
            </button>
          ))}
        </div>
      )}
      <div className="heart-title" aria-hidden="true">
        <span>{activeSpell ? `${selected?.name} · 神通观想` : selected?.tierLabel}</span>
        <strong>{activeSpell ?? selected?.name}</strong>
        <small>
          {activeSpell
            ? '法印已启 · 再点可收起'
            : spells.length
            ? `${spells.length} 道神通 · 万象生法`
            : '神通待考 · 道韵犹存'}
        </small>
      </div>
      <div className="scene-coordinates">
        <strong>玄鉴 · 太虚 · {groupName}</strong>
      </div>
      <div className="scene-instruction">拨转星图 · 点星宿与法印</div>
      <div className="scene-vignette" aria-hidden="true" />
    </div>
  );
}
