import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownRight, ArrowUpRight, BookOpen, Compass,
  HelpCircle, Info, Search, Sparkles, X, Shield, Swords,
  Scroll, Flame, Eye, Tag, ChevronRight, Layers, Filter
} from 'lucide-react';
import { daoGroups, allDao, allSpells, stats, theoryPairs } from './data.js';
import ThreeDaoScene from './ThreeDaoScene.jsx';
import './styles.css';

const iconByGroup = { 阴阳: '☯', 五德: '五', 十二炁: '炁', 三雷: '雷', 并古: '古', 独立: '剑' };

// 类别印章映射
const categoryBadge = {
  '命': { label: '命神通', cls: 'cat-ming', icon: '命' },
  '身': { label: '身神通', cls: 'cat-shen', icon: '身' },
  '术': { label: '术神通', cls: 'cat-shu', icon: '术' },
  '目': { label: '目神通', cls: 'cat-mu', icon: '目' },
  '剑': { label: '剑神通', cls: 'cat-jian', icon: '剑' },
};

const matchesDao = (dao, query) => {
  const matchDaoName = dao.name.toLowerCase().includes(query) || dao.subtitle.toLowerCase().includes(query) || dao.description.toLowerCase().includes(query);
  const matchSpells = dao.spells.some((spell) =>
    spell.name.toLowerCase().includes(query) ||
    spell.alias.toLowerCase().includes(query) ||
    spell.description.toLowerCase().includes(query) ||
    spell.cultivation.some((t) => t.toLowerCase().includes(query)) ||
    spell.combat.some((t) => t.toLowerCase().includes(query)) ||
    spell.auxiliary.some((t) => t.toLowerCase().includes(query)) ||
    spell.gongfa.some((g) => g.toLowerCase().includes(query))
  );
  return matchDaoName || matchSpells;
};

function App() {
  const [groupId, setGroupId] = useState('五德');
  const [selectedId, setSelectedId] = useState('坎水');
  const [search, setSearch] = useState('');
  const [activeSpellName, setActiveSpellName] = useState(null);
  const [spellDetailModal, setSpellDetailModal] = useState(null); // 弹窗或深度查看神通
  const [showTheory, setShowTheory] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // 神通索引区的分类筛选与搜索
  const [libraryCategory, setLibraryCategory] = useState('全部');
  const [libraryFilter, setLibraryFilter] = useState('');

  const activeGroup = daoGroups.find((group) => group.id === groupId) ?? daoGroups[1];
  const normalizedQuery = search.trim().toLowerCase();

  const visibleDaos = useMemo(() => {
    if (normalizedQuery) {
      return allDao.filter((dao) => matchesDao(dao, normalizedQuery));
    }
    return activeGroup.items;
  }, [activeGroup, normalizedQuery]);

  const selected = allDao.find((dao) => dao.id === selectedId) ?? allDao.find((dao) => dao.name === '坎水');

  // 当前选中的神通对象
  const currentActiveSpell = useMemo(() => {
    if (!selected) return null;
    return selected.spells.find((s) => s.name === activeSpellName) ?? null;
  }, [selected, activeSpellName]);

  const chooseDao = (dao) => {
    if (!dao) return;
    setSelectedId(dao.id);
    setActiveSpellName(null);
    if (dao.group !== groupId) setGroupId(dao.group);
  };

  const chooseGroup = (group) => {
    setGroupId(group.id);
    setSearch('');
    setSelectedId(group.items[0]?.id ?? selectedId);
    setActiveSpellName(null);
  };

  const chooseSpell = (name) => {
    setActiveSpellName((current) => current === name ? null : name);
  };

  const openSpellDetail = (spell, daoContext) => {
    setSpellDetailModal({
      ...spell,
      dao: daoContext ?? selected,
    });
  };

  const updateSearch = (value) => {
    setSearch(value);
    const query = value.trim().toLowerCase();
    if (!query || matchesDao(selected, query)) return;
    const firstMatch = allDao.find((dao) => matchesDao(dao, query));
    if (firstMatch) chooseDao(firstMatch);
  };

  // 神通库的过滤结果
  const filteredLibrarySpells = useMemo(() => {
    const q = libraryFilter.trim().toLowerCase();
    return allSpells.filter((s) => {
      const matchCat = libraryCategory === '全部' || (s.category && s.category.includes(libraryCategory));
      if (!matchCat) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.alias.toLowerCase().includes(q) ||
        s.daoName.toLowerCase().includes(q) ||
        s.daoGroup.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.combat.some((t) => t.toLowerCase().includes(q)) ||
        s.cultivation.some((t) => t.toLowerCase().includes(q)) ||
        s.auxiliary.some((t) => t.toLowerCase().includes(q)) ||
        s.gongfa.some((g) => g.toLowerCase().includes(q))
      );
    });
  }, [libraryCategory, libraryFilter]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="玄鉴仙族首页">
          <span className="brand-mark"><span>玄</span></span>
          <span className="brand-copy"><strong>玄鉴仙族</strong><small>THE IMMORTAL CLAN · ATLAS</small></span>
        </a>
        <nav className="top-nav" aria-label="主导航">
          <a className="nav-active" href="#atlas">道统星象</a>
          <a href="#theory">道论溯源</a>
          <a href="#library">诸脉神通库</a>
        </nav>
        <div className="top-actions">
          <div className="archive-status"><i />鉴中乾坤 · 录 {stats.totalDaos} 道 / {stats.totalSpells} 神通</div>
          <button className="icon-button help-button" onClick={() => setShowSources(true)} aria-label="关于资料与原著考据"><HelpCircle size={18} /></button>
          <button className="menu-toggle" onClick={() => setMobileNavOpen((v) => !v)} aria-label="打开导航"><span /><span /></button>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="mobile-nav">
          <a href="#atlas" onClick={() => setMobileNavOpen(false)}>道统星象</a>
          <a href="#theory" onClick={() => setMobileNavOpen(false)}>道论溯源</a>
          <a href="#library" onClick={() => setMobileNavOpen(false)}>诸脉神通库</a>
        </div>
      )}

      <section className="intro" id="top">
        <div className="intro-title">
          <div className="eyebrow"><span className="eyebrow-line" />大道有形 · 万炁归鉴 · 仙基升华</div>
          <h1>三千大道<span>观想图谱</span></h1>
          <p>贯通阴阳五德十二炁，汇录仙基神通斗法、功法与修炼精要。拨转道星，勘破大道本真。</p>
        </div>
        <div className="intro-index" aria-label="图谱统计">
          <div><strong>{stats.totalDaos}</strong><span>道统</span></div><i />
          <div><strong>{stats.totalSpells}</strong><span>神通名目</span></div><i />
          <div><strong>{stats.totalGongfa}</strong><span>宗法密卷</span></div><i />
          <div><strong>六大</strong><span>观道分野</span></div>
        </div>
      </section>

      <section className="atlas-layout" id="atlas">
        {/* 左侧道统分类选择 */}
        <aside className={`left-rail ${mobileNavOpen ? 'rail-open' : ''}`}>
          <div className="rail-heading"><span>观道法脉</span><span className="rail-heading-en">REALMS</span></div>
          <div className="group-list" role="tablist" aria-label="道统分类">
            {daoGroups.map((group) => {
              const spellCount = group.items.reduce((sum, item) => sum + item.spells.length, 0);
              return (
                <button
                  key={group.id}
                  role="tab"
                  aria-selected={group.id === groupId}
                  className={`group-option ${group.id === groupId && !normalizedQuery ? 'group-active' : ''}`}
                  onClick={() => chooseGroup(group)}
                >
                  <span className="group-glyph">{iconByGroup[group.id]}</span>
                  <span className="group-text">
                    <strong>{group.label}</strong>
                    <small>{group.kicker}</small>
                  </span>
                  <span className="group-count">{spellCount}通</span>
                </button>
              );
            })}
          </div>
          <div className="rail-note">
            <span className="note-seal">道</span>
            <div>
              <strong>道统与仙基</strong>
              <p>仙基定道途，金丹衍化神通。点击右侧神通可查阅斗法与修持词条。</p>
              <a href="#library">检索万千神通 <ArrowUpRight size={12} /></a>
            </div>
          </div>
          <div className="rail-bottom"><span className="tiny-star">✳</span>数据同步截止第一千四百九十六章</div>
        </aside>

        {/* 中间 3D 星象场景 */}
        <div className="scene-column">
          <div className="scene-heading">
            <div>
              <span className="section-index">玄鉴天道 · {activeGroup.index}</span>
              <h2>{normalizedQuery ? `道统检索 (${visibleDaos.length})` : activeGroup.title}</h2>
            </div>
            <div className="scene-tools">
              <label className="search-box">
                <Search size={15} />
                <input
                  value={search}
                  onChange={(e) => updateSearch(e.target.value)}
                  placeholder="搜寻道统 / 神通 / 功法 / 词条"
                  aria-label="搜索道统或神通"
                />
                {search && <button onClick={() => setSearch('')} aria-label="清除搜索"><X size={13} /></button>}
              </label>
              <span className="drag-hint"><Compass size={14} />拖拽星轨</span>
            </div>
          </div>

          <ThreeDaoScene
            daos={visibleDaos}
            selected={selected}
            activeSpell={activeSpellName}
            onChooseDao={chooseDao}
            onChooseSpell={chooseSpell}
            groupName={activeGroup.shortLabel}
          />

          {visibleDaos.length === 0 && <div className="scene-empty-result">太虚无此道 · 试试其他功法或神通名称</div>}

          {/* 道统切换带 */}
          <div className="dao-ribbon" aria-label="当前可选道统">
            <span className="dao-ribbon-label">诸道 / {String(visibleDaos.length).padStart(2, '0')}</span>
            <div className="dao-ribbon-scroll">
              {visibleDaos.map((dao) => (
                <button
                  key={dao.id}
                  className={selectedId === dao.id ? 'ribbon-active' : ''}
                  onClick={() => chooseDao(dao)}
                  aria-pressed={selectedId === dao.id}
                >
                  <span className="ribbon-subgroup">{dao.subGroup} · </span>
                  {dao.name}
                  <small>{dao.spells.length || '—'}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="scene-caption">
            <span>
              <Sparkles size={13} />
              {normalizedQuery ? `共探得 ${visibleDaos.length} 门相关道统` : activeGroup.description}
            </span>
            <span className="caption-right">道统入鉴 · 仙基成印 · 神通显化</span>
          </div>
        </div>

        {/* 右侧详细面板：融合「道统-神通」详尽数据 */}
        <aside className="detail-panel" aria-live="polite">
          <div className="detail-topline">
            <span>道统秘卷</span>
            <span className="detail-index">{selected?.subtitle}</span>
          </div>

          <div className="detail-emblem" style={{ '--tone': selected?.color }}>
            <span className="emblem-glyph">{selected?.glyph}</span>
          </div>

          <div className="detail-title-row">
            <div>
              <span className="detail-category">{selected?.groupLabel} · {selected?.tierLabel}</span>
              <h2>{selected?.name}</h2>
            </div>
            <button className="bookmark-button" onClick={() => setShowSources(true)} aria-label="资料来源">
              <BookOpen size={17} />
            </button>
          </div>

          <p className="detail-description">{selected?.description}</p>

          <div className="detail-divider">
            <span>所载神通（{selected?.spells.length || 0}道）</span>
            <span className="sub-hint">点击可观想剖析</span>
          </div>

          {selected?.spells.length ? (
            <div className="spell-list">
              {selected.spells.map((spell) => {
                const isSelected = activeSpellName === spell.name;
                return (
                  <div key={spell.name} className={`spell-card-wrapper ${isSelected ? 'spell-card-active' : ''}`}>
                    <button
                      className="spell-row"
                      aria-pressed={isSelected}
                      onClick={() => chooseSpell(spell.name)}
                    >
                      <i className="spell-cinnabar" aria-hidden="true" />
                      <span className="spell-name">{spell.name}</span>
                      {spell.category && spell.category.length > 0 && (
                        <div className="spell-cat-tags">
                          {spell.category.map((c) => (
                            <span key={c} className={`cat-pill ${categoryBadge[c]?.cls || ''}`}>
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      {spell.alias && <span className="spell-alias">替/下: {spell.alias}</span>}
                      <button
                        className="spell-peek-btn"
                        title="查看详细图卷"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSpellDetail(spell, selected);
                        }}
                      >
                        <ArrowUpRight size={13} />
                      </button>
                    </button>

                    {/* 如果被选中，展开该神通的精选要点 */}
                    {isSelected && (
                      <div className="spell-expanded-detail">
                        {spell.alias && (
                          <div className="expanded-row">
                            <span className="expanded-label">古称替参：</span>
                            <span className="expanded-val">{spell.alias}</span>
                          </div>
                        )}
                        {spell.gongfa && spell.gongfa.length > 0 && (
                          <div className="expanded-row">
                            <span className="expanded-label">传承功法：</span>
                            <span className="expanded-val gongfa-val">{spell.gongfa.join('、')}</span>
                          </div>
                        )}
                        {spell.combat && spell.combat.length > 0 && (
                          <div className="expanded-tags-group">
                            <span className="tags-group-title"><Swords size={11} /> 斗法词条</span>
                            <div className="tags-cloud">
                              {spell.combat.slice(0, 4).map((t) => (
                                <span key={t} className="tag-chip combat-chip">{t}</span>
                              ))}
                              {spell.combat.length > 4 && <span className="tag-chip-more">+{spell.combat.length - 4}</span>}
                            </div>
                          </div>
                        )}
                        {spell.cultivation && spell.cultivation.length > 0 && (
                          <div className="expanded-tags-group">
                            <span className="tags-group-title"><Flame size={11} /> 修炼词条</span>
                            <div className="tags-cloud">
                              {spell.cultivation.slice(0, 3).map((t) => (
                                <span key={t} className="tag-chip cult-chip">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {spell.description && (
                          <p className="expanded-desc-preview">
                            {spell.description.length > 95 ? `${spell.description.slice(0, 95)}...` : spell.description}
                          </p>
                        )}
                        <button
                          className="view-full-spell-btn"
                          onClick={() => openSpellDetail(spell, selected)}
                        >
                          阅读完整道法玄妙与介绍 <ArrowUpRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-spells">
              暂未见明确神通条目<br />
              <small>非无道也，或涉天地至隐秘事</small>
            </div>
          )}

          <div className="detail-meta">
            <div>
              <span>观道层级</span>
              <strong>{selected?.group} · {selected?.subGroup}</strong>
            </div>
            <div>
              <span>录入状态</span>
              <strong><i className="status-dot" />详录具足</strong>
            </div>
          </div>

          <button className="detail-source" onClick={() => setShowSources(true)}>
            <Info size={14} />关于考据与数据整合说明<ArrowUpRight size={13} />
          </button>
        </aside>
      </section>

      {/* 道论溯源 */}
      <section className="theory-section" id="theory">
        <div className="theory-intro">
          <div className="eyebrow"><span className="eyebrow-line" />观其大略 · 辨其异同</div>
          <h2>道论如星海，<br />纲目各有宗。</h2>
          <p>同一方乾坤天地，三玄五德各有推演。阴阳对峙、五行生克、十二炁清邃相因，此乃玄鉴修仙之无上根基。</p>
          <button className="text-link" onClick={() => setShowTheory(true)}>展开三家道论考 <ArrowUpRight size={14} /></button>
        </div>
        <div className="theory-cards">
          <TheoryCard
            title="青玄 · 阴阳六道"
            label="两仪对举 · 三阴三阳"
            mark="☯"
            text="太阳、少阳、明阳为三阳；太阴、少阴、厥阴为三阴。明阳以君驭臣制厥阴，太阴奔月化分仪，少阴水火交融。"
            foot="六道 · 体系完整"
            tone="moon"
          />
          <TheoryCard
            title="通玄 · 五德二十五现"
            label="正藏蕴变收"
            mark="五"
            text="金木水火土五行各具正、藏、蕴、变、收五现，共二十五正位；初伏仙君更借宣土空证青宣，既为第六土，亦通并古。"
            foot="二十五现 · 极变之理"
            tone="jade"
          />
          <TheoryCard
            title="清邃 · 十二炁脉"
            label="清浊相生 · 显晦之别"
            mark="炁"
            text="清炁为诸炁之首；显世八炁照临天下，谪炁华炁二道深隐不显。六组相峙互为表里，魔君亦有清邃六轮之论。"
            foot="十二炁 · 乾坤之始"
            tone="mist"
          />
        </div>
      </section>

      {/* 六组观法 */}
      <section className="pairs-section">
        <div className="pairs-heading">
          <div>
            <span className="section-index">炁机相荡 · 大道对照</span>
            <h2>大道两端 · 六组观法</h2>
          </div>
          <button className="subtle-button" onClick={() => setShowTheory(true)}>查看体系考辨 <ArrowUpRight size={13} /></button>
        </div>
        <div className="pairs-grid">
          {theoryPairs.map(([left, right, label], index) => (
            <div className="pair-card" key={left}>
              <span className="pair-mark">{String(index + 1).padStart(2, '0')}</span>
              <div className="pair-ends">
                <button onClick={() => chooseDao(allDao.find((dao) => dao.name === left))}>{left}</button>
                <span className="pair-link">— {label} —</span>
                <button onClick={() => chooseDao(allDao.find((dao) => dao.name === right))}>{right}</button>
              </div>
              <ArrowDownRight size={14} className="pair-arrow" />
            </div>
          ))}
        </div>
        <p className="pair-caveat">※「六组观法」收录经典道统对应关系，揭示阴阳两极、始末相对之哲思。</p>
      </section>

      {/* 强化优化的【神通索引与万象库】 */}
      <section className="library-section" id="library">
        <div className="library-header">
          <div>
            <span className="section-index">卷帙大典 · 录 {stats.totalSpells} 神通</span>
            <h2>诸脉神通万象库</h2>
          </div>
          <div className="library-filter-tools">
            {/* 类别筛选 */}
            <div className="category-filter-tabs">
              {['全部', '命', '身', '术', '目', '剑'].map((cat) => (
                <button
                  key={cat}
                  className={`filter-tab ${libraryCategory === cat ? 'filter-tab-active' : ''}`}
                  onClick={() => setLibraryCategory(cat)}
                >
                  {cat === '全部' ? '全部类别' : `${cat}神通`}
                </button>
              ))}
            </div>

            {/* 快捷搜索 */}
            <div className="library-search-input">
              <Search size={14} />
              <input
                value={libraryFilter}
                onChange={(e) => setLibraryFilter(e.target.value)}
                placeholder="搜索神通/古称/词条..."
              />
              {libraryFilter && <button onClick={() => setLibraryFilter('')}><X size={12} /></button>}
            </div>
          </div>
        </div>

        {/* 神通卡片网格 */}
        <div className="spells-full-grid">
          {filteredLibrarySpells.slice(0, 48).map((spell) => (
            <div
              key={`${spell.daoName}-${spell.name}`}
              className="spell-library-card"
              onClick={() => {
                const targetDao = allDao.find((d) => d.name === spell.daoName);
                openSpellDetail(spell, targetDao);
              }}
            >
              <div className="card-topline">
                <span className="card-dao-tag" style={{ '--tone': spell.daoColor }}>
                  {spell.daoName}
                </span>
                <span className="card-group-label">{spell.daoSubGroup}</span>
                {spell.category.map((c) => (
                  <span key={c} className={`card-cat-badge ${categoryBadge[c]?.cls || ''}`}>
                    {c}
                  </span>
                ))}
              </div>

              <div className="card-title-row">
                <h3>{spell.name}</h3>
                {spell.alias && <span className="card-alias">又名: {spell.alias}</span>}
              </div>

              {/* 词条预览 */}
              <div className="card-tags-row">
                {spell.combat.slice(0, 2).map((t) => (
                  <span key={t} className="card-tag tag-combat">{t}</span>
                ))}
                {spell.cultivation.slice(0, 1).map((t) => (
                  <span key={t} className="card-tag tag-cult">{t}</span>
                ))}
                {spell.auxiliary.slice(0, 1).map((t) => (
                  <span key={t} className="card-tag tag-aux">{t}</span>
                ))}
              </div>

              {spell.description ? (
                <p className="card-desc">
                  {spell.description.length > 70 ? `${spell.description.slice(0, 70)}...` : spell.description}
                </p>
              ) : (
                <p className="card-desc empty-desc">秘术玄妙，载于古传玉册，待缘者得之。</p>
              )}

              <div className="card-footer">
                <span className="card-gongfa-hint">
                  {spell.gongfa.length > 0 ? `${spell.gongfa[0]}` : '古法佚失或未载'}
                </span>
                <span className="card-detail-btn">阅览玄机 <ArrowUpRight size={12} /></span>
              </div>
            </div>
          ))}
        </div>

        {filteredLibrarySpells.length > 48 && (
          <div className="library-more-hint">
            <span>已展现前 48 道神通，可通过上方搜索框精准定位全部 {filteredLibrarySpells.length} 条神通</span>
          </div>
        )}

        {/* 传统道统分组快速定位 */}
        <div className="library-quick-groups">
          <div className="quick-groups-title">按道统原脉寻访定位：</div>
          <div className="library-grid">
            {daoGroups.map((group) => (
              <article className="library-group" key={group.id}>
                <button
                  className="library-group-head"
                  onClick={() => {
                    chooseGroup(group);
                    document.querySelector('#atlas')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="library-icon">{iconByGroup[group.id]}</span>
                  <span>
                    <strong>{group.label}</strong>
                    <small>{group.items.length} 道 · {group.kicker}</small>
                  </span>
                  <ArrowUpRight size={14} />
                </button>
                <div className="library-dao-list">
                  {group.items.map((dao) => (
                    <button
                      key={dao.id}
                      onClick={() => {
                        chooseDao(dao);
                        document.querySelector('#atlas')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <span>{dao.name}</span>
                      <small>{dao.spells.length ? `${dao.spells.length} 通` : '待考'}</small>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <span className="footer-seal">玄</span>
          <span>玄鉴仙族 · 三千大道观想图录</span>
        </div>
        <div className="footer-center">道统、仙基、神通、权柄，各循其序，各争其果。</div>
        <button onClick={() => setShowSources(true)}>资料考据说明 <ArrowUpRight size={12} /></button>
        <span className="footer-copyright">依据原著与《力量体系-仙基神通具体介绍》整理</span>
      </footer>

      {/* 神通深度详情弹窗 */}
      {spellDetailModal && (
        <Modal
          title={`神通印谱 · ${spellDetailModal.name}`}
          onClose={() => setSpellDetailModal(null)}
        >
          <div className="spell-modal-content">
            <div className="modal-spell-header">
              <div className="modal-spell-title-col">
                <div className="modal-badges">
                  <span className="modal-dao-badge">
                    {spellDetailModal.dao?.group} · {spellDetailModal.dao?.name}
                  </span>
                  {spellDetailModal.category.map((c) => (
                    <span key={c} className={`cat-pill ${categoryBadge[c]?.cls || ''}`}>
                      {categoryBadge[c]?.label || c}
                    </span>
                  ))}
                </div>
                <h2>{spellDetailModal.name}</h2>
                {spellDetailModal.alias && (
                  <div className="modal-alias">
                    <strong>下位/古称/替参：</strong>
                    <span>{spellDetailModal.alias}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 功法渊源 */}
            {(spellDetailModal.gongfa?.length > 0 || spellDetailModal.gongfaExtra?.length > 0) && (
              <div className="modal-section">
                <div className="modal-sec-title"><Scroll size={14} /> 功法源流与典册</div>
                <div className="gongfa-tags-list">
                  {spellDetailModal.gongfa.map((g) => (
                    <div key={g} className="gongfa-tag main-gongfa">{g}</div>
                  ))}
                  {spellDetailModal.gongfaExtra.map((g) => (
                    <div key={g} className="gongfa-tag sub-gongfa">{g}</div>
                  ))}
                </div>
              </div>
            )}

            {/* 斗法 / 修炼 / 辅助词条 */}
            <div className="modal-chips-grid">
              {spellDetailModal.combat?.length > 0 && (
                <div className="modal-chip-block">
                  <span className="chip-block-head"><Swords size={13} /> 斗法威能词条</span>
                  <div className="tags-cloud">
                    {spellDetailModal.combat.map((t) => (
                      <span key={t} className="tag-chip combat-chip">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {spellDetailModal.cultivation?.length > 0 && (
                <div className="modal-chip-block">
                  <span className="chip-block-head"><Flame size={13} /> 修炼进境词条</span>
                  <div className="tags-cloud">
                    {spellDetailModal.cultivation.map((t) => (
                      <span key={t} className="tag-chip cult-chip">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {spellDetailModal.auxiliary?.length > 0 && (
                <div className="modal-chip-block">
                  <span className="chip-block-head"><Sparkles size={13} /> 辅助玄妙词条</span>
                  <div className="tags-cloud">
                    {spellDetailModal.auxiliary.map((t) => (
                      <span key={t} className="tag-chip aux-chip">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 具体介绍 */}
            <div className="modal-section desc-section">
              <div className="modal-sec-title"><BookOpen size={14} /> 原文考据与玄妙详解</div>
              {spellDetailModal.description ? (
                <div className="modal-desc-box">
                  {spellDetailModal.description.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <p className="modal-desc-empty">暂无更多详细描述，此神通多见于修士口耳相传或古籍残卷。</p>
              )}
            </div>

            <div className="modal-actions-footer">
              <button
                className="locate-dao-btn"
                onClick={() => {
                  chooseDao(spellDetailModal.dao);
                  setSpellDetailModal(null);
                  document.querySelector('#atlas')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                在星盘中定位【{spellDetailModal.dao?.name}】道统 <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showSources && (
        <Modal title="道统与神通资料溯源" onClose={() => setShowSources(false)}>
          <div className="modal-copy">
            <p>
              本项目基于最新整理的<strong>《玄鉴仙族-力量体系-仙基神通具体介绍（截止一千四百九十六章）》</strong>全量数据重新架构。
              包含 56 脉大道法脉、193 门核心神通及 216 项功法修持记录。
            </p>
            <h3>数据融入说明</h3>
            <ul>
              <li><strong>层级划分</strong>：观道（阴阳、五德、十二炁、三雷、并古、独立） → 下级分类 → 道统 → 神通。</li>
              <li><strong>结构化词条</strong>：提取了「神通类别（命、身、术、目、剑）」、「斗法词条」、「修炼词条」、「辅助词条」、「下位古称替参」以及详尽的「具体介绍」。</li>
              <li><strong>三维星象与印谱</strong>：在三维太虚星盘中实时呈现道统星宿，并以符印与印谱卡片展现每一门神通的实战机制与天地异象。</li>
            </ul>
            <h3>参考资料索引</h3>
            <ul>
              <li><a href="https://9433.com.cn/wiki/道统丨神通丨仙基" target="_blank" rel="noreferrer">玄鉴仙族 Wiki · 道统丨神通丨仙基</a></li>
              <li><a href="https://9433.com.cn/wiki/修为体系" target="_blank" rel="noreferrer">玄鉴仙族 Wiki · 修为体系</a></li>
              <li>《玄鉴仙族》小说正文考据与书友整理表格</li>
            </ul>
          </div>
        </Modal>
      )}

      {showTheory && (
        <Modal title="三家道论 · 阅读纲要" onClose={() => setShowTheory(false)}>
          <div className="modal-copy">
            <h3>青玄 · 阴阳</h3>
            <p>三阳（太阳、少阳、明阳）与三阴（太阴、少阴、厥阴）。明阳尊皇，以君驭臣制衡厥阴；太阴月华，奔月化身分仪行走红尘；少阴寒燥相合，水火并驭。</p>
            <h3>通玄 · 五德二十五现</h3>
            <p>金木水火土五行各具正、藏、蕴、变、收五大意象：正位秉正统，藏位隐于密，蕴位主造化，变位主从革，收位归于合。青宣借宣土空证而出，独开一系。</p>
            <h3>清炁 · 十二炁脉</h3>
            <p>以清炁为始，分显世八炁（清、邃、紫、真、寒、晞、瑞、煞）与隐世二炁（谪、华）。互为表里阴阳，如清谪互因、寒晞推移、紫真交融、华邃枯荣。</p>
          </div>
        </Modal>
      )}
    </main>
  );
}

function TheoryCard({ title, label, mark, text, foot, tone }) {
  return (
    <article className={`theory-card theory-${tone}`}>
      <div className="theory-card-top">
        <span>{label}</span>
        <span className="theory-mark">{mark}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="theory-card-foot">
        <span><i />{foot}</span>
        <ArrowUpRight size={14} />
      </div>
    </article>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <span>{title}</span>
          <button onClick={onClose} aria-label="关闭"><X size={17} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
