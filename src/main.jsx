import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight, BookOpen, Compass,
  HelpCircle, Info, Search, Sparkles, X, Swords,
  Scroll, Flame, ChevronRight, ChevronLeft, ChevronDown, Eye, Filter
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
  const matchDaoName =
    dao.name.toLowerCase().includes(query) ||
    dao.subtitle.toLowerCase().includes(query) ||
    dao.description.toLowerCase().includes(query);
  const matchSpells = dao.spells.some(
    (spell) =>
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
  const [spellDetailModal, setSpellDetailModal] = useState(null);
  const [showTheory, setShowTheory] = useState(false);
  const [showSources, setShowSources] = useState(false);

  // 悬浮挂件状态：左上角观道盘、右上角道统秘卷
  const [realmMenuOpen, setRealmMenuOpen] = useState(false);
  const [scrollOpen, setScrollOpen] = useState(false);

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

  // 选择道统时：更新选中并自动唤出秘卷（保持星图为主，秘卷就绪）
  const chooseDao = (dao) => {
    if (!dao) return;
    setSelectedId(dao.id);
    setActiveSpellName(null);
    if (dao.group !== groupId) setGroupId(dao.group);
    setScrollOpen(true);
  };

  const chooseGroup = (group) => {
    setGroupId(group.id);
    setSearch('');
    setSelectedId(group.items[0]?.id ?? selectedId);
    setActiveSpellName(null);
    setRealmMenuOpen(false);
  };

  // 点击神通时：必定展开右侧道统秘卷并高亮该神通
  const chooseSpell = (name) => {
    setActiveSpellName((current) => {
      const next = current === name ? null : name;
      if (next) setScrollOpen(true);
      return next;
    });
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
        s.gongfa.some((g) => g.toLowerCase().includes(query))
      );
    });
  }, [libraryCategory, libraryFilter]);

  return (
    <main className="app-shell full-star-universe">
      {/* 满屏沉浸式 3D 星象天地 */}
      <section className="universe-canvas-container" id="atlas">
        <ThreeDaoScene
          daos={visibleDaos}
          selected={selected}
          activeSpell={activeSpellName}
          onChooseDao={chooseDao}
          onChooseSpell={chooseSpell}
          groupName={activeGroup.shortLabel}
        />
      </section>

      {/* 顶部极简透明灵息栏 */}
      <header className="celestial-topbar">
        <a className="brand" href="#top" aria-label="玄鉴仙族">
          <span className="brand-mark"><span>玄</span></span>
          <span className="brand-copy">
            <strong>玄鉴仙族</strong>
            <small>THE IMMORTAL CLAN · CELESTIAL ATLAS</small>
          </span>
        </a>

        {/* 顶部居中快捷检索 */}
        <div className="celestial-search">
          <Search size={14} className="search-icon" />
          <input
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="搜寻道统 / 神通 / 功法 / 词条..."
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="清除搜索">
              <X size={12} />
            </button>
          )}
        </div>

        <div className="celestial-actions">
          <div className="archive-chip">
            <i />
            <span>三千大道 · 录 {stats.totalDaos}道 / {stats.totalSpells}神通</span>
          </div>
          <button className="icon-badge-btn" onClick={() => setShowSources(true)} title="典籍与考据">
            <HelpCircle size={16} />
          </button>
          <a className="icon-badge-btn" href="#library" title="直达神通万象库">
            <Scroll size={16} />
          </a>
        </div>
      </header>

      {/* 左上角悬浮：「观道法脉」收拢罗盘与折叠菜单 */}
      <div className={`celestial-realm-anchor ${realmMenuOpen ? 'anchor-expanded' : ''}`}>
        <button
          className="realm-compass-toggle"
          onClick={() => setRealmMenuOpen(!realmMenuOpen)}
          aria-expanded={realmMenuOpen}
          title="切换观道法脉"
        >
          <div className="compass-inner">
            <span className="compass-glyph">{iconByGroup[groupId]}</span>
            <div className="compass-text">
              <span className="compass-sub">观道法脉</span>
              <strong>{activeGroup.title}</strong>
            </div>
            <ChevronDown size={14} className={`compass-arrow ${realmMenuOpen ? 'arrow-up' : ''}`} />
          </div>
        </button>

        {/* 下拉展开的法脉选择列表 */}
        {realmMenuOpen && (
          <div className="realm-menu-popover">
            <div className="popover-head">
              <span>观道分野</span>
              <small>六大宗系</small>
            </div>
            <div className="realm-grid-options">
              {daoGroups.map((group) => {
                const isCurrent = group.id === groupId;
                const spellCount = group.items.reduce((sum, item) => sum + item.spells.length, 0);
                return (
                  <button
                    key={group.id}
                    className={`realm-item-btn ${isCurrent ? 'realm-item-active' : ''}`}
                    onClick={() => chooseGroup(group)}
                  >
                    <span className="item-glyph">{iconByGroup[group.id]}</span>
                    <div className="item-info">
                      <strong>{group.label}</strong>
                      <small>{group.kicker}</small>
                    </div>
                    <span className="item-count">{spellCount}通</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 底部悬浮：当前法脉下的诸道微型星轨切换带 */}
      <div className="celestial-bottom-ribbon">
        <div className="ribbon-inner">
          <div className="ribbon-tag">
            <span>{activeGroup.shortLabel}</span>
            <small>{visibleDaos.length}道</small>
          </div>
          <div className="ribbon-dao-scroller">
            {visibleDaos.map((dao) => {
              const isSelected = selectedId === dao.id;
              return (
                <button
                  key={dao.id}
                  className={`ribbon-dao-chip ${isSelected ? 'chip-active' : ''}`}
                  onClick={() => chooseDao(dao)}
                  style={{ '--chip-color': dao.color }}
                >
                  <span className="chip-dot" />
                  <span className="chip-sub">{dao.subGroup}</span>
                  <span className="chip-name">{dao.name}</span>
                  <span className="chip-num">{dao.spells.length || 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 右上角悬浮挂件：「道统秘卷」收拢触发钮 */}
      <div className={`celestial-scroll-anchor ${scrollOpen ? 'scroll-is-open' : ''}`}>
        <button
          className="scroll-toggle-btn"
          onClick={() => setScrollOpen(!scrollOpen)}
          aria-expanded={scrollOpen}
          title={scrollOpen ? '收拢道统秘卷' : '展阅道统秘卷'}
        >
          <div className="toggle-seal" style={{ borderColor: selected?.color, color: selected?.color }}>
            <span>{selected?.glyph || '道'}</span>
          </div>
          <div className="toggle-label">
            <span className="toggle-title">道统秘卷</span>
            <span className="toggle-sub">{selected?.name} · {activeSpellName ? `【${activeSpellName}】` : `${selected?.spells.length}神通`}</span>
          </div>
          <span className="toggle-arrow">
            <ChevronDown size={16} className={scrollOpen ? 'arrow-up' : ''} />
          </span>
        </button>

        {/* 与「观道法脉」一致的下拉展开秘卷 */}
        <aside className={`celestial-drawer-panel ${scrollOpen ? 'drawer-active' : ''}`}>
          <div className="drawer-header">
            <div className="drawer-topline">
              <span className="drawer-badge">道统秘卷</span>
              <span className="drawer-subgroup">{selected?.subtitle}</span>
            </div>
            <button className="drawer-close" onClick={() => setScrollOpen(false)} title="收拢秘卷">
              <X size={16} />
            </button>
          </div>

          <div className="drawer-content-scroll">
            {/* 道统徽相 */}
            <div className="drawer-dao-hero" style={{ '--dao-tone': selected?.color }}>
              <div className="hero-emblem">
                <span className="emblem-glyph">{selected?.glyph}</span>
              </div>
              <div className="hero-titles">
                <span className="hero-tier">{selected?.groupLabel} · {selected?.tierLabel}</span>
                <h2>{selected?.name}</h2>
              </div>
            </div>

            <p className="drawer-dao-desc">{selected?.description}</p>

            {/* 神通精细列表 */}
            <div className="drawer-spells-header">
              <span>所载神通（{selected?.spells.length || 0}道）</span>
              <small>点击小星或条目可启闭观想</small>
            </div>

            {selected?.spells.length ? (
              <div className="drawer-spell-list">
                {selected.spells.map((spell) => {
                  const isSelected = activeSpellName === spell.name;
                  return (
                    <div
                      key={spell.name}
                      className={`drawer-spell-card ${isSelected ? 'card-awakened' : ''}`}
                    >
                      <button
                        className="drawer-spell-item"
                        onClick={() => chooseSpell(spell.name)}
                      >
                        <i className="spell-cinnabar" />
                        <span className="spell-item-name">{spell.name}</span>
                        {spell.category && spell.category.length > 0 && (
                          <div className="spell-cat-tags">
                            {spell.category.map((c) => (
                              <span key={c} className={`cat-pill ${categoryBadge[c]?.cls || ''}`}>
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                        {spell.alias && <span className="spell-alias">替: {spell.alias}</span>}
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

                      {/* 选中的神通展开深度剖析 */}
                      {isSelected && (
                        <div className="drawer-spell-expanded">
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
                                {spell.combat.length > 4 && (
                                  <span className="tag-chip-more">+{spell.combat.length - 4}</span>
                                )}
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
                              {spell.description.length > 95
                                ? `${spell.description.slice(0, 95)}...`
                                : spell.description}
                            </p>
                          )}
                          <button
                            className="view-full-spell-btn"
                            onClick={() => openSpellDetail(spell, selected)}
                          >
                            查阅完整秘要与仙基渊源 <ArrowUpRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="drawer-no-spells">
                暂未显化明确神通名目<br />
                <small>或涉天地至高秘辛，留待后考</small>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 辅助区域（向下滑动浏览：道论溯源、诸脉神通万象库） */}
      <div className="celestial-auxiliary-container">
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
                  <button onClick={() => { chooseDao(allDao.find((dao) => dao.name === left)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{left}</button>
                  <span className="pair-link">— {label} —</span>
                  <button onClick={() => { chooseDao(allDao.find((dao) => dao.name === right)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{right}</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 诸脉神通万象库 */}
        <section className="library-section" id="library">
          <div className="library-header">
            <div>
              <span className="section-index">卷帙大典 · 录 {stats.totalSpells} 神通</span>
              <h2>诸脉神通万象库</h2>
            </div>
            <div className="library-filter-tools">
              <div className="library-category-bar">
                {['全部', '命', '身', '术', '目', '剑'].map((cat) => (
                  <button
                    key={cat}
                    className={`cat-filter-btn ${libraryCategory === cat ? 'active' : ''}`}
                    onClick={() => setLibraryCategory(cat)}
                  >
                    {cat === '全部' ? '全部神通' : `${cat}神通`}
                  </button>
                ))}
              </div>
              <div className="library-search-input">
                <Search size={14} />
                <input
                  value={libraryFilter}
                  onChange={(e) => setLibraryFilter(e.target.value)}
                  placeholder="在神通库中检索词条、功法或别称..."
                />
                {libraryFilter && <button onClick={() => setLibraryFilter('')}><X size={12} /></button>}
              </div>
            </div>
          </div>

          <div className="library-grid">
            {filteredLibrarySpells.map((s) => (
              <div
                key={`${s.daoName}-${s.name}`}
                className="library-spell-card"
                onClick={() => openSpellDetail(s, allDao.find((d) => d.name === s.daoName))}
              >
                <div className="lib-card-top">
                  <span className="lib-dao-tag" style={{ color: s.daoColor }}>
                    {s.daoName} · {s.daoSubGroup}
                  </span>
                  <div className="lib-cat-tags">
                    {s.category?.map((c) => (
                      <span key={c} className={`cat-pill ${categoryBadge[c]?.cls || ''}`}>{c}</span>
                    ))}
                  </div>
                </div>
                <h3 className="lib-spell-name">{s.name}</h3>
                {s.alias && <div className="lib-alias">替/下：{s.alias}</div>}
                <p className="lib-desc">{s.description}</p>
                {s.combat && s.combat.length > 0 && (
                  <div className="lib-tags">
                    {s.combat.slice(0, 3).map((t) => (
                      <span key={t} className="tag-chip combat-chip">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <footer className="footer-bar">
          <p>《玄鉴仙族》道统神通星象图谱 · 鉴中乾坤，万法归源</p>
          <p className="footer-sub">数据依托小说原著梳理，截止第 1496 章</p>
        </footer>
      </div>

      {/* 神通深度全景弹窗 */}
      {spellDetailModal && (
        <div className="modal-overlay" onClick={() => setSpellDetailModal(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-head-titles">
                <span className="modal-sub">
                  {spellDetailModal.dao?.group} · {spellDetailModal.dao?.name}
                </span>
                <h2>{spellDetailModal.name}</h2>
              </div>
              <button onClick={() => setSpellDetailModal(null)} aria-label="关闭">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {spellDetailModal.alias && (
                <div className="modal-info-block">
                  <strong>【古称与下位替参】</strong>
                  <p>{spellDetailModal.alias}</p>
                </div>
              )}
              {spellDetailModal.gongfa && spellDetailModal.gongfa.length > 0 && (
                <div className="modal-info-block">
                  <strong>【契合功法与传承】</strong>
                  <p>{spellDetailModal.gongfa.join('、')}</p>
                </div>
              )}
              {spellDetailModal.combat && spellDetailModal.combat.length > 0 && (
                <div className="modal-info-block">
                  <strong>【斗法特性与妙用】</strong>
                  <div className="tags-cloud" style={{ marginTop: 6 }}>
                    {spellDetailModal.combat.map((t) => (
                      <span key={t} className="tag-chip combat-chip">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {spellDetailModal.cultivation && spellDetailModal.cultivation.length > 0 && (
                <div className="modal-info-block">
                  <strong>【修炼要旨】</strong>
                  <div className="tags-cloud" style={{ marginTop: 6 }}>
                    {spellDetailModal.cultivation.map((t) => (
                      <span key={t} className="tag-chip cult-chip">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="modal-info-block">
                <strong>【典籍详细介绍】</strong>
                <p className="modal-long-desc">{spellDetailModal.description || '暂无详尽原著记载。'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 考据说明弹窗 */}
      {showSources && (
        <div className="modal-overlay" onClick={() => setShowSources(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>典籍考据说明</h2>
              <button onClick={() => setShowSources(false)} aria-label="关闭"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>本法脉星象图谱整理自季越人所著仙侠小说《玄鉴仙族》，梳理了自三阳三阴、五行五德至十二炁脉的上百道仙基道统与神通名目。</p>
              <p>道统与神通之强弱变化随修士果位与天序更替而变，诸般玄妙皆在鉴中。</p>
            </div>
          </div>
        </div>
      )}

      {/* 三家道论考弹窗 */}
      {showTheory && (
        <div className="modal-overlay" onClick={() => setShowTheory(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>三家道论源流考</h2>
              <button onClick={() => setShowTheory(false)} aria-label="关闭"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <h3>一、青玄论 · 阴阳六道</h3>
              <p>青玄门下尊日月交替，立太阳、少阳、明阳以主白天，太阴、少阴、厥阴以治幽夜。六道互为权衡，进退求金。</p>
              <h3>二、通玄论 · 五德二十五现</h3>
              <p>通玄峰以金木水火土五行为天枢，各列正、藏、蕴、变、收五相。宣土更由初伏仙君衍出青宣，道通并古。</p>
              <h3>三、清邃论 · 十二炁脉</h3>
              <p>上古真仙以清炁为诸法源头，化演八大显世之炁与两道隐世幽炁。阴阳清邃互为转运，贯通修士周天。</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function TheoryCard({ title, label, mark, text, foot, tone }) {
  return (
    <article className="theory-card" style={{ '--tone': `var(--${tone}, #c2a66b)` }}>
      <div className="theory-card-top">
        <span className="theory-card-mark">{mark}</span>
        <div className="theory-card-title">
          <span>{label}</span>
          <h3>{title}</h3>
        </div>
      </div>
      <p>{text}</p>
      <div className="theory-card-foot">
        <i />
        <span>{foot}</span>
      </div>
    </article>
  );
}

createRoot(document.getElementById('root')).render(<App />);
