import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const TAU = Math.PI * 2;
const palette = {
  water: '#75b9c8', jade: '#9ebd91', gold: '#e0ba73', ember: '#e59067',
  earth: '#c8ab79', moon: '#b8b6d0', silver: '#c9d5d0', mist: '#a9d9cc',
};

function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(.17, 'rgba(255,255,255,.72)');
  gradient.addColorStop(.48, 'rgba(255,255,255,.18)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function makeGlyphTexture(glyph, color) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, 256, 256);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.shadowColor = color;
  context.shadowBlur = 12;
  context.fillStyle = color;
  context.font = '166px "Ma Shan Zheng", "Songti SC", serif';
  context.fillText(glyph, 128, 136);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function line(points, color, opacity = .3) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
}

function ring(radius, color, opacity = .6, tube = .008) {
  return new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 4, 128),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  );
}

function disposeTree(root) {
  root.traverse((object) => {
    object.geometry?.dispose();
    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (material.map && material.map !== root.userData.sharedGlow) material.map.dispose();
        material.dispose();
      });
    }
  });
  root.parent?.remove(root);
}

function daoPositions(count) {
  return Array.from({ length: count }, (_, index) => {
    const crowded = count > 16;
    const outerCount = crowded ? Math.ceil(count * .62) : count;
    const outer = index < outerCount;
    const localIndex = outer ? index : index - outerCount;
    const ringCount = outer ? outerCount : count - outerCount;
    const angle = (localIndex / ringCount) * TAU - Math.PI / 2 + (outer ? 0 : Math.PI / ringCount);
    const radiusX = outer ? (crowded ? 4.05 : 3.73) : 3.15;
    const radiusY = outer ? (crowded ? 2.86 : 2.64) : 2.48;
    return new THREE.Vector3(
      Math.cos(angle) * radiusX,
      Math.sin(angle) * radiusY,
      -.32 + Math.sin(angle * 2 + index) * .2 - (outer ? 0 : .12),
    );
  });
}

function spellPositions(count) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * TAU - (count === 2 ? Math.PI : Math.PI / 2);
    return new THREE.Vector3(Math.cos(angle) * 1.72, Math.sin(angle) * 1.52, .75 + Math.sin(index * 2.7) * .12);
  });
}

function makeHeart(glowTexture) {
  const heart = new THREE.Group();
  const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: '#9c3b32', transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false }));
  aura.scale.set(3.4, 3.4, 1);
  aura.position.z = -.4;
  heart.add(aura);

  const face = new THREE.Mesh(new THREE.CircleGeometry(.96, 96), new THREE.MeshBasicMaterial({ color: '#071614' }));
  face.position.z = .06;
  heart.add(face);
  const faceWash = new THREE.Mesh(new THREE.CircleGeometry(.9, 96), new THREE.MeshBasicMaterial({ color: '#9c3b32', transparent: true, opacity: .07, depthWrite: false }));
  faceWash.position.z = .07;
  heart.add(faceWash);

  const outer = ring(1.02, '#c6b48a', .72, .01);
  outer.position.z = .1;
  const inner = ring(.74, '#9c3b32', .55, .006);
  inner.position.z = .11;
  heart.add(outer, inner);

  const orbitA = ring(1.28, '#c6b48a', .22, .005);
  orbitA.rotation.set(.62, .08, 0);
  const orbitB = ring(1.16, '#6f8f86', .16, .004);
  orbitB.rotation.set(-.48, .2, .2);
  heart.add(orbitA, orbitB);

  heart.userData = { aura, faceWash, orbitA, orbitB, sharedGlow: glowTexture };
  return heart;
}

function makeAspect(tone, color) {
  const group = new THREE.Group();
  if (tone === 'water' || tone === 'mist' || tone === 'moon') {
    const points = [];
    for (let step = 0; step <= 80; step += 1) {
      const angle = step / 80 * TAU;
      const radius = 1.18 + Math.sin(angle * (tone === 'water' ? 3 : 2)) * .04;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * (tone === 'moon' ? .9 : 1), -.04));
    }
    group.add(line(points, color, .32));
  } else {
    for (let index = 0; index < 7; index += 1) {
      const angle = index / 7 * TAU;
      const isFlame = tone === 'ember';
      const isLeaf = tone === 'jade';
      const crystal = new THREE.Mesh(
        isFlame ? new THREE.ConeGeometry(.05, .22, 4) : new THREE.OctahedronGeometry(.06),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .55, side: THREE.DoubleSide }),
      );
      if (!isFlame) crystal.scale.set(isLeaf ? .6 : .45, isLeaf ? 1.8 : 1.6, .35);
      crystal.rotation.z = angle - Math.PI / 2;
      crystal.position.set(Math.cos(angle) * 1.16, Math.sin(angle) * 1.16, -.06);
      group.add(crystal);
    }
  }
  return group;
}

function makeDaoNode(dao, position, glowTexture) {
  const group = new THREE.Group();
  const tone = new THREE.Color(palette[dao.tone] ?? dao.color);
  const seed = [...dao.name].reduce((sum, glyph) => sum + glyph.charCodeAt(0), 0);
  const count = seed % 2 === 0 ? 3 : 2;
  const stars = [];
  for (let index = 0; index < count; index += 1) {
    const angle = ((seed * (index + 3)) % 360) / 360 * TAU;
    const radius = index === 0 ? 0 : .38 + (seed % 5) * .04 + index * .08;
    const star = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: tone,
      transparent: true,
      opacity: index === 0 ? .82 : .46,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    const size = index === 0 ? .48 : .26;
    star.scale.set(size, size, 1);
    star.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * .82, index * .03);
    group.add(star);
    stars.push(star);
  }
  const link = line(stars.map((star) => star.position.clone()), tone, .4);
  group.add(link);
  const target = new THREE.Mesh(new THREE.SphereGeometry(.4, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
  target.userData.dao = dao;
  group.add(target);
  group.position.copy(position);
  group.userData = { stars, link, target, sharedGlow: glowTexture, seed };
  return group;
}

function makeSpellNode(spell, index, position, color, glowTexture) {
  const group = new THREE.Group();
  const pin = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color,
    transparent: true,
    opacity: .34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  pin.scale.set(.22, .22, 1);
  const target = new THREE.Mesh(new THREE.SphereGeometry(.3, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
  target.userData.spell = spell.name;
  group.add(pin, target);
  group.position.copy(position);
  group.userData = { pin, target, seed: index * 1.39, sharedGlow: glowTexture };
  return group;
}

function makeStars() {
  const positions = [];
  let seed = 72;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let index = 0; index < 330; index += 1) {
    positions.push((random() - .5) * 13, (random() - .5) * 9, -3.5 - random() * 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#d8d0a6', size: .018, transparent: true, opacity: .7, sizeAttenuation: true, depthWrite: false }));
}

export default function ThreeDaoScene({ daos, selected, activeSpell, onChooseDao, onChooseSpell, groupName }) {
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
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      setSupported(false);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
    camera.position.set(0, 0, 10.8);
    const field = new THREE.Group();
    scene.add(field);
    const glow = makeGlowTexture();
    const heart = makeHeart(glow);
    heart.scale.setScalar(1.16);
    field.add(heart);
    const stars = makeStars();
    scene.add(stars);
    const ambient = new THREE.AmbientLight('#c9dfd4', 1.8);
    const key = new THREE.PointLight('#b6e0cf', 28, 9);
    key.position.set(-2, 3, 4);
    const rim = new THREE.PointLight('#eab676', 18, 8);
    rim.position.set(2, -2, 2);
    scene.add(ambient, key, rim);

    const runtime = { renderer, scene, camera, field, heart, stars, glow, daoNodes: [], spellNodes: [], targets: [], rotation: { x: -.04, y: -.16 }, targetRotation: { x: -.04, y: -.16 }, width: 1, height: 1, motion: true, lastTime: 0 };
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
          const visible = point.z < 1 && point.z > -1 && Math.abs(point.x) < .95 && Math.abs(point.y) < .95;
          const sx = (point.x * .5 + .5) * runtime.width;
          const sy = (-point.y * .5 + .5) * runtime.height;
          const dx = sx - runtime.width / 2;
          const dy = sy - runtime.height / 2;
          const length = Math.hypot(dx, dy) || 1;
          element.style.transform = `translate3d(${sx + (dx / length) * push}px, ${sy + (dy / length) * push}px, 0) translate(-50%, -50%)`;
          element.style.opacity = visible ? String(THREE.MathUtils.clamp(1.3 - Math.max(0, -node.position.z) * .45, .5, 1)) : '0';
          element.style.pointerEvents = visible ? '' : 'none';
        });
      };
      place(labelRefs.current, runtime.daoNodes, 18);
      place(spellRefs.current, runtime.spellNodes, 0);
    }

    function draw(time = 0) {
      const seconds = time * .001;
      const delta = runtime.lastTime ? Math.min((time - runtime.lastTime) * .001, .06) : 0;
      runtime.lastTime = time;
      if (runtime.motion && delta) {
        runtime.rotation.y += (runtime.targetRotation.y - runtime.rotation.y) * Math.min(1, delta * 5);
        runtime.rotation.x += (runtime.targetRotation.x - runtime.rotation.x) * Math.min(1, delta * 5);
        if (runtime.manifestGroup?.userData.stamp > 0) {
          runtime.manifestGroup.userData.stamp = Math.max(0, runtime.manifestGroup.userData.stamp - delta * 1.7);
          runtime.manifestGroup.scale.setScalar(1 + runtime.manifestGroup.userData.stamp * .32);
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
      const narrow = window.matchMedia('(max-width: 680px)').matches;
      field.scale.setScalar(Math.min(1, Math.max(narrow ? .77 : .56, width / (narrow ? 540 : 620))));
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
    const updateVisibility = () => {
      renderer.setAnimationLoop(runtime.motion && !document.hidden ? draw : null);
      runtime.lastTime = 0;
      if (!document.hidden) draw(performance.now());
    };
    motionQuery.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    updateMotion();
    resize();

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
      renderer.setAnimationLoop(null);
      runtimeRef.current = null;
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

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    if (runtime.daoGroup) disposeTree(runtime.daoGroup);
    const group = new THREE.Group();
    group.userData.sharedGlow = runtime.glow;
    const nodes = daos.map((dao, index) => {
      const node = makeDaoNode(dao, positions[index], runtime.glow);
      node.userData.labelKey = dao.id;
      node.userData.homeY = node.position.y;
      group.add(node);
      return node;
    });
    runtime.field.add(group);
    runtime.daoGroup = group;
    runtime.daoNodes = nodes;
    runtime.targets = [...nodes.map((node) => node.userData.target), ...runtime.spellNodes.map((node) => node.userData.target)];
    runtime.draw(performance.now());
  }, [daos, positions]);

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
    const selectedNode = runtime.daoNodes.find((node) => node.userData.target.userData.dao.id === selected.id);
    if (selectedNode) {
      const start = selectedNode.position.clone();
      const end = start.clone().setZ(0).normalize().multiplyScalar(1.06);
      end.z = .1;
      const control = start.clone().lerp(end, .52);
      control.z = .55;
      const trace = line(new THREE.QuadraticBezierCurve3(start, control, end).getPoints(40), color, .36);
      runtime.field.add(trace);
      runtime.selectedTrace = trace;
    }
    const group = new THREE.Group();
    group.userData.sharedGlow = runtime.glow;
    const nodes = spellPositions(spells.length).map((position, index) => {
      const node = makeSpellNode(spells[index], index, position, color, runtime.glow);
      node.userData.labelKey = spells[index].name;
      node.userData.homeY = node.position.y;
      group.add(node);
      const start = new THREE.Vector3(position.x * .68, position.y * .68, .12);
      const curve = new THREE.QuadraticBezierCurve3(start, new THREE.Vector3(position.x * .84, position.y * .84, .55), position);
      const trace = line(curve.getPoints(20), color, .23);
      group.add(trace);
      return node;
    });
    runtime.field.add(group);
    runtime.spellGroup = group;
    runtime.spellNodes = nodes;
    runtime.targets = [...runtime.daoNodes.map((node) => node.userData.target), ...nodes.map((node) => node.userData.target)];

    const selection = new THREE.Group();
    const glyphTexture = makeGlyphTexture(selected.glyph, '#d4533c');
    const glyph = new THREE.Mesh(new THREE.PlaneGeometry(.92, .92), new THREE.MeshBasicMaterial({ map: glyphTexture, transparent: true, opacity: .94, depthWrite: false, side: THREE.DoubleSide }));
    glyph.position.z = .16;
    selection.add(glyph);
    const aspect = makeAspect(selected.tone, color);
    selection.add(aspect);
    runtime.heart.userData.faceWash.material.color.copy(color);
    runtime.heart.userData.aura.material.color.copy(color);
    runtime.heart.add(selection);
    selection.userData = { glyph, aspect, sharedGlow: runtime.glow };
    runtime.selectionGroup = selection;
    runtime.daoNodes.forEach((node) => {
      const active = node.userData.target.userData.dao.id === selected.id;
      node.userData.stars.forEach((star, index) => {
        star.material.opacity = active ? (index === 0 ? 1 : .82) : (index === 0 ? .5 : .28);
        const size = active ? (index === 0 ? .68 : .36) : (index === 0 ? .48 : .26);
        star.scale.set(size, size, 1);
      });
      node.userData.link.material.opacity = active ? .88 : .28;
      node.scale.setScalar(active ? 1.18 : 1);
    });
    runtime.draw(performance.now());
  }, [daos, selected, spells]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    if (runtime.manifestGroup) {
      disposeTree(runtime.manifestGroup);
      runtime.manifestGroup = null;
    }
    if (runtime.selectionGroup) runtime.selectionGroup.userData.glyph.material.opacity = activeSpell ? .18 : .94;
    runtime.spellNodes.forEach((node) => {
      const active = node.userData.labelKey === activeSpell;
      node.userData.pin.material.opacity = active ? .72 : .2;
    });
    if (activeSpell) {
      const manifest = new THREE.Group();
      const glyphTexture = makeGlyphTexture(activeSpell.slice(0, 1), '#d4533c');
      const glyph = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), new THREE.MeshBasicMaterial({ map: glyphTexture, transparent: true, opacity: 1, depthWrite: false, side: THREE.DoubleSide }));
      glyph.position.z = .29;
      manifest.add(glyph);
      const seal = ring(.62, '#9c3b32', .8, .012);
      seal.position.z = .24;
      manifest.add(seal);
      const node = runtime.spellNodes.find((item) => item.userData.labelKey === activeSpell);
      if (node) {
        const start = new THREE.Vector3().copy(node.position);
        const arc = new THREE.QuadraticBezierCurve3(start, new THREE.Vector3(start.x * .35, start.y * .35, .9), new THREE.Vector3(0, 0, .36));
        manifest.add(line(arc.getPoints(36), '#c6b48a', .55));
      }
      manifest.userData = { stamp: runtime.motion ? 1 : 0, sharedGlow: runtime.glow };
      manifest.scale.setScalar(runtime.motion ? 1.32 : 1);
      runtime.field.add(manifest);
      runtime.manifestGroup = manifest;
    }
    runtime.draw(performance.now());
  }, [activeSpell, selected]);

  function onPointerDown(event) {
    if (event.button !== 0 || event.target.closest('button')) return;
    pointerRef.current = { x: event.clientX, y: event.clientY, moved: false, rotation: { ...runtimeRef.current?.targetRotation } };
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
      runtime.targetRotation.y = pointer.rotation.y + dx * .0045;
      runtime.targetRotation.x = THREE.MathUtils.clamp(pointer.rotation.x + dy * .0025, -.38, .38);
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
    const mouse = new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, runtime.camera);
    runtime.field.updateWorldMatrix(true, true);
    const hit = raycaster.intersectObjects(runtime.targets, false)[0]?.object;
    if (hit?.userData.dao) callbacksRef.current.onChooseDao(hit.userData.dao);
    if (hit?.userData.spell) callbacksRef.current.onChooseSpell(hit.userData.spell);
  }

  return (
    <div className={`scene-frame ${dragging ? 'is-dragging' : ''}`} ref={frameRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <div className="scene-backdrop" aria-hidden="true">
        <div className="astrolabe-disk"><span className="disk-meridian" /><span className="disk-equator" /><span className="disk-inner" /></div>
      </div>
      <div className="scene-runes rune-one" aria-hidden="true">太虚为镜 · 万法有迹</div>
      <div className="scene-runes rune-two" aria-hidden="true">一念观道 · 百炁朝元</div>
      <canvas ref={canvasRef} className="three-canvas" aria-label="可拖动的三维道统星图" />
      {!supported && <div className="scene-fallback">此处无法开启三维观想<br /><small>仍可从下方道统与右侧神通继续查阅</small></div>}
      {supported && <div className="scene-labels" aria-label="星图中的道统">
        {daos.map((dao, index) => <button
          key={dao.id}
          ref={(node) => { if (node) labelRefs.current.set(dao.id, node); else labelRefs.current.delete(dao.id); }}
          className={`dao-marker ${dao.id === selected?.id ? 'dao-marker-active' : ''} ${daos.length > 12 && index % 3 && dao.id !== selected?.id ? 'dao-marker-mobile-hidden' : ''}`}
          style={{ '--tone': palette[dao.tone] ?? dao.color }}
          aria-label={`${dao.name}道统，${dao.spells.length}项神通`}
          onClick={() => onChooseDao(dao)}
        ><span>{dao.name}</span></button>)}
      </div>}
      {supported && <div className="scene-labels spell-labels" aria-label="所选道统的神通">
        {spells.map((spell, index) => <button
          key={spell.name}
          ref={(node) => { if (node) spellRefs.current.set(spell.name, node); else spellRefs.current.delete(spell.name); }}
          className={`spell-seal ${activeSpell === spell.name ? 'spell-seal-active' : ''}`}
          style={{ '--tone': palette[selected.tone] ?? selected.color }}
          onClick={() => onChooseSpell(spell.name)}
          aria-label={`${spell.name}神通${activeSpell === spell.name ? '，正在观想' : ''}`}
        ><b aria-hidden="true">{spell.name.slice(0, 1)}</b><em>{spell.name.slice(1)}</em></button>)}
      </div>}
      <div className="heart-title" aria-hidden="true"><span>{activeSpell ? `${selected?.name} · 神通观想` : selected?.tierLabel}</span><strong>{activeSpell ?? selected?.name}</strong><small>{activeSpell ? '法印已启 · 再点可收起' : spells.length ? `${spells.length} 道神通 · 万象生法` : '神通待考 · 道韵犹存'}</small></div>
      <div className="scene-coordinates"><strong>玄鉴 · 太虚 · {groupName}</strong></div>
      <div className="scene-instruction">拨转星图 · 点星宿与符印</div>
      <div className="scene-vignette" aria-hidden="true" />
    </div>
  );
}
