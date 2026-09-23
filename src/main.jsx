import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownRight, ArrowUpRight, BookOpen, ChevronDown, Compass, Focus,
  HelpCircle, Info, Search, Sparkles, X,
} from 'lucide-react';
import { daoGroups, allDao, theoryPairs } from './data.js';
import './styles.css';

const iconByGroup = { 阴阳: '☯', 五德: '五', 十二炁: '炁', 三雷: '雷', 并古: '古', 独立: '剑' };

function App() {
  const [groupId, setGroupId] = useState('五德');
  const [selectedId, setSelectedId] = useState('坎水');
  const [search, setSearch] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeSpell, setActiveSpell] = useState(null);
  const [showTheory, setShowTheory] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const stageRef = useRef(null);
  const dragStart = useRef(null);
  const mobileLayout = window.innerWidth <= 680;

  const activeGroup = daoGroups.find((group) => group.id === groupId) ?? daoGroups[1];
  const normalizedQuery = search.trim().toLowerCase();
  const visibleDaos = useMemo(() => {
    if (normalizedQuery) {
      return allDao.filter((dao) => `${dao.name} ${dao.subtitle} ${dao.spells.map((spell) => `${spell.name} ${spell.alias ?? ''}`).join(' ')}`.toLowerCase().includes(normalizedQuery));
    }
    return activeGroup.items;
  }, [activeGroup, normalizedQuery]);
  const selected = allDao.find((dao) => dao.id === selectedId) ?? allDao.find((dao) => dao.name === '坎水');

  const chooseDao = (dao) => {
    setSelectedId(dao.id);
    setActiveSpell(null);
    if (dao.group !== groupId) setGroupId(dao.group);
  };

  const pointerDown = (event) => {
    if (event.button !== 0 || event.target.closest('button')) return;
    dragStart.current = { x: event.clientX, y: event.clientY, tilt: { ...tilt } };
    stageRef.current?.setPointerCapture?.(event.pointerId);
    setDragging(true);
  };
  const pointerMove = (event) => {
    if (!dragStart.current) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    setTilt({
      x: Math.max(-15, Math.min(15, dragStart.current.tilt.x + dy * -0.09)),
      y: Math.max(-20, Math.min(20, dragStart.current.tilt.y + dx * 0.09)),
    });
  };
  const pointerUp = () => { dragStart.current = null; setDragging(false); };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="玄鉴仙族首页">
          <span className="brand-mark"><span>玄</span></span>
          <span className="brand-copy"><strong>玄鉴仙族</strong><small>THE IMMORTAL CLAN</small></span>
        </a>
        <nav className="top-nav" aria-label="主导航">
          <a className="nav-active" href="#atlas">道统图谱</a>
          <a href="#theory">道论溯源</a>
          <a href="#library">神通索引</a>
        </nav>
        <div className="top-actions">
          <div className="archive-status"><i />鉴中天地 · 已录 58 道</div>
          <button className="icon-button help-button" onClick={() => setShowSources(true)} aria-label="关于资料"><HelpCircle size={18} /></button>
          <button className="menu-toggle" onClick={() => setMobileNavOpen((v) => !v)} aria-label="打开导航"><span /><span /></button>
        </div>
      </header>

      {mobileNavOpen && <div className="mobile-nav"><a href="#atlas" onClick={() => setMobileNavOpen(false)}>道统图谱</a><a href="#theory" onClick={() => setMobileNavOpen(false)}>道论溯源</a><a href="#library" onClick={() => setMobileNavOpen(false)}>神通索引</a></div>}

      <section className="intro" id="top">
        <div className="intro-title">
          <div className="eyebrow"><span className="eyebrow-line" />大道有形 · 万炁归鉴</div>
          <h1>三千大道<span>观想图</span></h1>
          <p>以仙基为引，照见诸天道统。拨转星盘，寻一线证道之机。</p>
        </div>
        <div className="intro-index" aria-label="图谱统计">
          <div><strong>58</strong><span>道统</span></div><i />
          <div><strong>211</strong><span>神通归属</span></div><i />
          <div><strong>三玄</strong><span>同出正始</span></div>
        </div>
      </section>

      <section className="atlas-layout" id="atlas">
        <aside className={`left-rail ${mobileNavOpen ? 'rail-open' : ''}`}>
          <div className="rail-heading"><span>观道</span><span className="rail-heading-en">PATHS</span></div>
          <div className="group-list" role="tablist" aria-label="道统分类">
            {daoGroups.map((group) => (
              <button key={group.id} role="tab" aria-selected={group.id === groupId} className={`group-option ${group.id === groupId && !normalizedQuery ? 'group-active' : ''}`} onClick={() => { setGroupId(group.id); setSearch(''); setSelectedId(group.items[0]?.id ?? selectedId); }}>
                <span className="group-glyph">{iconByGroup[group.id]}</span>
                <span className="group-text"><strong>{group.label}</strong><small>{group.kicker}</small></span>
                <span className="group-count">{String(group.items.length).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
          <div className="rail-note">
            <span className="note-seal">道</span>
            <div><strong>先筑仙基</strong><p>仙基定道途，神通自其中升华。</p><a href="#library">阅修为纪要 <ArrowUpRight size={12} /></a></div>
          </div>
          <div className="rail-bottom"><span className="tiny-star">✳</span>卷帙随正文进展整理</div>
        </aside>

        <div className="scene-column">
          <div className="scene-heading">
            <div><span className="section-index">玄鉴 · {activeGroup.index}</span><h2>{normalizedQuery ? '搜寻道统' : activeGroup.title}</h2></div>
            <div className="scene-tools">
              <label className="search-box"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="寻一脉道统 / 神通" aria-label="搜索道统或神通" />{search && <button onClick={() => setSearch('')} aria-label="清除搜索"><X size={13} /></button>}</label>
              <span className="drag-hint"><Compass size={14} />拖曳观星</span>
            </div>
          </div>
          <div className={`scene-frame ${dragging ? 'is-dragging' : ''}`} ref={stageRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}>
            <div className="scene-backdrop" />
            <div className="scene-runes rune-one">天道酬勤 · 道法自然 · 炼神返虚</div>
            <div className="scene-runes rune-two">玄鉴照诸天 · 灵炁生万法</div>
            <svg className="star-lines" viewBox="0 0 800 610" preserveAspectRatio="none" aria-hidden="true">
              <ellipse cx="400" cy="305" rx="312" ry="126" transform="rotate(-18 400 305)" />
              <ellipse cx="400" cy="305" rx="268" ry="182" transform="rotate(28 400 305)" />
              <ellipse cx="400" cy="305" rx="184" ry="250" transform="rotate(72 400 305)" />
              <path d="M112 430 C230 120 516 70 694 336" />
              <path d="M172 168 C318 360 521 456 681 193" />
              <circle cx="400" cy="305" r="5" className="svg-star" />
              <circle cx="131" cy="231" r="2" className="svg-star" />
              <circle cx="674" cy="390" r="2" className="svg-star" />
              <circle cx="516" cy="97" r="2" className="svg-star" />
            </svg>
          <div className="scene-transform" style={{ '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` }}>
              <div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orbit orbit-c" />
              <div className="globe-wrap" aria-hidden="true">
                <div className="globe-halo" />
                <div className="globe"><span className="globe-calligraphy">玄</span><i className="globe-glint" /></div>
                <div className="globe-ring ring-gold" /><div className="globe-ring ring-cyan" />
                <span className="globe-caption">玄鉴 · 太虚</span>
              </div>
              {visibleDaos.map((dao, index) => {
                const count = Math.max(visibleDaos.length, 1);
                const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
                const radius = count > 14
                  ? (index % 2 === 0 ? (mobileLayout ? 164 : 218) : (mobileLayout ? 119 : 158))
                  : count > 7 ? (mobileLayout ? 137 : 182) : (mobileLayout ? 128 : 170);
                const z = Math.sin(angle * 2.2 + index * 1.13) * 52;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius * 0.69;
                return (
                  <button key={dao.id} className={`dao-orb ${selectedId === dao.id ? 'dao-orb-active' : ''} ${selectedId === dao.id ? `tone-${dao.tone}` : ''}`} style={{ '--x': `${x}px`, '--y': `${y}px`, '--z': `${z}px`, '--tone': dao.color, '--delay': `${index * 14}ms` }} onClick={(event) => { event.stopPropagation(); chooseDao(dao); }} aria-label={`${dao.name}道统，${dao.spells.length}项神通`}>
                    <span className="dao-orb-light" /><span className="dao-orb-label">{dao.name}</span><span className="dao-orb-count">{dao.spells.length}</span>
                  </button>
                );
              })}
              {visibleDaos.length === 0 && <div className="empty-orbit">未寻得此道<br /><span>试试别的字词</span></div>}
            </div>
            <div className="scene-compass north">N<span>北辰</span></div>
            <div className="scene-coordinates"><span>观想坐标</span><strong>三界 · 太虚 · {activeGroup.shortLabel}</strong></div>
            <div className="scene-legend"><span><i className="legend-dot selected-dot" />已选道统</span><span><i className="legend-dot" />同体系道统</span></div>
            <div className="scene-vignette" />
          </div>
          <div className="scene-caption"><span><Sparkles size={13} />{normalizedQuery ? `寻得 ${visibleDaos.length} 条道统 / 神通` : activeGroup.description}</span><span className="caption-right">点击星曜 · 阅览道轨</span></div>
        </div>

        <aside className="detail-panel" aria-live="polite">
          <div className="detail-topline"><span>道统档案</span><span className="detail-index">XJ—{selected?.code ?? '01'}</span></div>
          <div className="detail-emblem" style={{ '--tone': selected?.color }}>
            <span className="emblem-orbit emblem-orbit-one" /><span className="emblem-orbit emblem-orbit-two" />
            <span className="emblem-glyph">{selected?.glyph}</span><span className="emblem-star">✳</span>
          </div>
          <div className="detail-title-row"><div><span className="detail-category">{selected?.groupLabel} · {selected?.tierLabel}</span><h2>{selected?.name}</h2></div><button className="bookmark-button" onClick={() => setShowSources(true)} aria-label="资料来源"><BookOpen size={17} /></button></div>
          <p className="detail-description">{selected?.description}</p>
          <div className="detail-divider"><span>所载神通</span><span>{String(selected?.spells.length ?? 0).padStart(2, '0')} RECORDS</span></div>
          {selected?.spells.length ? (
            <div className="spell-list">
              {selected.spells.map((spell, index) => <button key={spell.name} className={`spell-row ${activeSpell === spell.name ? 'spell-selected' : ''}`} onClick={() => setActiveSpell(activeSpell === spell.name ? null : spell.name)}><span className="spell-number">{String(index + 1).padStart(2, '0')}</span><span className="spell-name">〖{spell.name}〗</span>{spell.alias && <span className="spell-alias">又名 {spell.alias}</span>}<ArrowUpRight size={13} className="spell-arrow" /></button>)}
            </div>
          ) : <div className="no-spells">暂未见明确神通条目<br /><small>并非无道，或为秘而不宣</small></div>}
          {activeSpell && <div className="spell-note"><Sparkles size={13} /><span>「{activeSpell}」已载入观想。神通详情待原文考据补全。</span></div>}
          <div className="detail-meta"><div><span>道途归属</span><strong>{selected?.groupLabel}</strong></div><div><span>条目状态</span><strong><i className="status-dot" />已收录</strong></div></div>
          <button className="detail-source" onClick={() => setShowSources(true)}><Info size={14} />查看考据与资料来源<ArrowUpRight size={13} /></button>
        </aside>
      </section>

      <section className="theory-section" id="theory">
        <div className="theory-intro"><div className="eyebrow"><span className="eyebrow-line" />观其大略 · 辨其异同</div><h2>道论如星河，<br />各有其运行。</h2><p>同一方天地，诸家对大道本源各有诠释。此处收录常见道论脉络；归纳与推演另行标记。</p><button className="text-link" onClick={() => setShowTheory(true)}>展开道论图 <ArrowUpRight size={14} /></button></div>
        <div className="theory-cards">
          <TheoryCard title="青玄 · 阴阳论" label="两仪映照" mark="☯" text="太阳、少阳、明阳；太阴、少阴、厥阴。三阳与三阴相对而立，日月交辉，各见其权柄。" foot="六道 · 体系整理" tone="moon" />
          <TheoryCard title="通玄 · 五德五现" label="五行各有五现" mark="五" text="以正、藏、蕴、变、收观金木水火土。常见归纳为二十五现；青宣常被视作第六土，归类另有道论差异。" foot="二十五现 · 归纳模型" tone="jade" />
          <TheoryCard title="清邃 · 十二炁六行" label="清浊相生" mark="炁" text="清炁被视为诸炁之始；十二炁亦常以六组相对概念串读。‘清邃六轮’为魔君另立之说，非通行定论。" foot="十二炁 · 学说并存" tone="mist" />
        </div>
      </section>

      <section className="pairs-section">
        <div className="pairs-heading"><div><span className="section-index">炁机相荡 · 读者归纳</span><h2>十二炁 · 六组观法</h2></div><button className="subtle-button" onClick={() => setShowTheory(true)}>查看说明 <ArrowUpRight size={13} /></button></div>
        <div className="pairs-grid">{theoryPairs.map(([left, right, label], index) => <div className="pair-card" key={left}><span className="pair-mark">{String(index + 1).padStart(2, '0')}</span><div className="pair-ends"><button onClick={() => chooseDao(allDao.find((dao) => dao.name === left))}>{left}</button><span className="pair-link">— {label} —</span><button onClick={() => chooseDao(allDao.find((dao) => dao.name === right))}>{right}</button></div><ArrowDownRight size={14} className="pair-arrow" /></div>)}</div>
        <p className="pair-caveat">※「六组观法」为便于阅读的结构化归纳，不代表原文明确提出的唯一分类；清邃六轮论亦属另立道论。</p>
      </section>

      <section className="library-section" id="library">
        <div className="library-header"><div><span className="section-index">卷帙总览 · 58 道</span><h2>诸脉神通索引</h2></div><span className="library-count">可依左侧分类筛选 · 点击道统可定位</span></div>
        <div className="library-grid">{daoGroups.map((group) => <article className="library-group" key={group.id}>
          <button className="library-group-head" onClick={() => { setGroupId(group.id); setSearch(''); setSelectedId(group.items[0]?.id ?? selectedId); document.querySelector('#atlas')?.scrollIntoView({ behavior: 'smooth' }); }}><span className="library-icon">{iconByGroup[group.id]}</span><span><strong>{group.label}</strong><small>{group.items.length} 道 · {group.kicker}</small></span><ArrowUpRight size={14} /></button>
          <div className="library-dao-list">{group.items.map((dao) => <button key={dao.id} onClick={() => { chooseDao(dao); document.querySelector('#atlas')?.scrollIntoView({ behavior: 'smooth' }); }}><span>{dao.name}</span><small>{dao.spells.length ? `${dao.spells.length} 通` : '待考'}</small></button>)}</div>
        </article>)}</div>
      </section>

      <footer className="footer"><div className="footer-brand"><span className="footer-seal">玄</span><span>玄鉴仙族 · 三千大道观想图</span></div><div className="footer-center">道统、仙基、神通，各循其道，各争其果。</div><button onClick={() => setShowSources(true)}>资料说明 <ArrowUpRight size={12} /></button><span className="footer-copyright">非官方设定索引 · 仅供交流</span></footer>

      {showSources && <Modal title="资料与考据说明" onClose={() => setShowSources(false)}><div className="modal-copy"><p>本图谱根据公开道统整理资料汇编，按阴阳、五德、十二炁、三雷、并古、独立六类展示，共 58 道统。神通名称及归属按汇总索引整理；同一神通存在别名、替参或跨道统记录时，以条目所载为准。</p><ul><li><a href="https://9433.com.cn/wiki/道统丨神通丨仙基" target="_blank" rel="noreferrer">玄鉴仙族 Wiki · 道统丨神通丨仙基</a></li><li><a href="https://9433.com.cn/wiki/修为体系" target="_blank" rel="noreferrer">玄鉴仙族 Wiki · 修为体系</a></li><li><a href="https://www.bilibili.com/opus/1071630001488527367" target="_blank" rel="noreferrer">神通仙基汇总（书友整理）</a></li></ul><p>神通功效摘要未作逐条转述，避免将二手解读误作原文。六阴六阳、五德五现、十二炁六组与清邃六轮为不同层级的分类或道论；有争议处已标注为“归纳”“推演”或“待考”。资料随原作更新，欢迎以正文为准。</p></div></Modal>}
      {showTheory && <Modal title="三家道论 · 阅读说明" onClose={() => setShowTheory(false)}><div className="modal-copy"><h3>青玄 · 阴阳</h3><p>常见整理将阴阳分为三阳三阴：太阳、少阳、明阳；太阴、少阴、厥阴。各道统内部对于相生、相制与位别有各自记述，星图不将其简化为单一强弱序列。</p><h3>通玄 · 五德</h3><p>“五德五现”常用正、藏、蕴、变、收描述五行各五类位置，形成二十五现的读法。青宣因初伏仙君空证而来，也常被并古或第六土两种方式讨论，故单独标记。</p><h3>清炁 · 十二炁与六行观法</h3><p>清炁、谪炁、寒炁、晞炁、紫炁、真炁、上仪、下仪、邃炁、华炁、煞炁、瑞炁合为十二炁。将其读作“清—谪、寒—晞、紫—真、上仪—下仪、华—邃、瑞—煞”是书友常见的对照法；武阕魔君另提出清邃六轮论。两者并非同一套已定论的原文体系。</p><p>本页面的视觉连接仅用于帮助浏览，不代表道统间存在确定的修行路径或因果关系。</p></div></Modal>}
    </main>
  );
}

function TheoryCard({ title, label, mark, text, foot, tone }) {
  return <article className={`theory-card theory-${tone}`}><div className="theory-card-top"><span>{label}</span><span className="theory-mark">{mark}</span></div><h3>{title}</h3><p>{text}</p><div className="theory-card-foot"><span><i />{foot}</span><ArrowUpRight size={14} /></div></article>;
}

function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><span>{title}</span><button onClick={onClose} aria-label="关闭"><X size={17} /></button></div>{children}</section></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
