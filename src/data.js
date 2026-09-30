import rawData from '../data/道统-神通.json' with { type: 'json' };

// 道统元数据配置（字模、色系、视觉基调、介绍、层级标签等）
export const daoMetaConfig = {
  // 阴阳
  '太阳': { glyph: '日', color: '#d9ae60', tone: 'gold', tierLabel: '三阳 · 日间第一显', description: '日间第一显，诸阳景从。日月交替之际，诸阳道统皆有所应。' },
  '少阳': { glyph: '曦', color: '#c8b56e', tone: 'gold', tierLabel: '三阳 · 阳中生阴', description: '阳中生阴，阴消阳长；三阳之一，脱身如水，有变化少阳成阴之妙。' },
  '明阳': { glyph: '明', color: '#d5a558', tone: 'gold', tierLabel: '三阳 · 煌煌帝威', description: '日间第二显，兼具光明、生发与帝威之象；主六合，以君驭臣，制衡厥阴。' },
  '太阴': { glyph: '月', color: '#d5d9d0', tone: 'moon', tierLabel: '三阴 · 诸阴所宗', description: '诸阴所宗，月与道藏之象；奔月求金，避劫消灾，化分仪之身行走红尘。' },
  '少阴': { glyph: '霜', color: '#a9b9c4', tone: 'moon', tierLabel: '三阴 · 寒燥相和', description: '三阴之一，主寒却有火，主阴却燥；存性保命，驱策水火，孕养弱水。' },
  '厥阴': { glyph: '幽', color: '#a8a0ad', tone: 'moon', tierLabel: '三阴 · 玄阴之境', description: '三阴之一，避世无漏，平错劣成全阴；展开与世隔绝领域，消解明阳帝权。' },

  // 五德 · 金
  '兑金': { glyph: '兑', color: '#c8bba0', tone: 'silver', tierLabel: '金德 · 正位', description: '申酉金之正位，取秋白肃杀、秋露折毁之象；不穷之锋贯绝天地。' },
  '逍金': { glyph: '匮', color: '#c1a876', tone: 'gold', tierLabel: '金德 · 蕴位', description: '逍遥藏养之金，避世修仙；入世太深则道果难成。' },
  '齐金': { glyph: '齐', color: '#c3bd9c', tone: 'silver', tierLabel: '金德 · 收位', description: '收蓄圆满之金，汇聚精华，气象大成契合丹道；与库金相配相吸。' },
  '库金': { glyph: '库', color: '#b4bdb7', tone: 'silver', tierLabel: '金德 · 藏位', description: '潜藏受纳之金，启阵法藏秘，养金精资粮，腹存法器锐利藏锋。' },
  '庚金': { glyph: '庚', color: '#d0ad77', tone: 'gold', tierLabel: '金德 · 变位', description: '从革变革之金，知损知毁，身如飞沙去故嬗变；金煞坚不可摧，克制赤断镞。' },

  // 五德 · 木
  '正木': { glyph: '巽', color: '#8eaa83', tone: 'jade', tierLabel: '木德 · 正位', description: '甲乙木之正位，号令风雷以避火，栋梁密藏不为局势所动。' },
  '保木': { glyph: '隰', color: '#829e73', tone: 'jade', tierLabel: '木德 · 藏位', description: '藏养滋养之木，青光铺天盖地笼罩四方，隔离庇护他人抵御重伤。' },
  '集木': { glyph: '林', color: '#849b6c', tone: 'jade', tierLabel: '木德 · 收位', description: '众木成林之象，草木凝滞太虚，自动感应危机化为虚幻密林保命。' },
  '角木': { glyph: '角', color: '#91a982', tone: 'jade', tierLabel: '木德 · 藏位', description: '春木生发之象，行风孳木，重林荡漾破尽隐匿，擅长疗愈生生不息。' },
  '更木': { glyph: '更', color: '#91a080', tone: 'jade', tierLabel: '木德 · 变位', description: '木德变位，天下之易；行悖五参之一，顺应天序变迁。' },

  // 五德 · 水
  '坎水': { glyph: '坎', color: '#75a9b3', tone: 'water', tierLabel: '水德 · 正位', description: '水德正位，险峡飞瀑与浩瀚江河交叠；远钓欲念控人心智，从重险中杀出。' },
  '府水': { glyph: '府', color: '#7398a2', tone: 'water', tierLabel: '水德 · 蕴位', description: '湖泽渊薮之水，弄弱水打压法风；浩瀚虽夺于坎，仍具宿穷冬之寒煞。' },
  '合水': { glyph: '合', color: '#528d9f', tone: 'water', tierLabel: '水德 · 收位', description: '百川归流、汪洋恣肆之道；兼容并蓄，天海围困镇压，水流化身瞬移走脱。' },
  '牝水': { glyph: '牝', color: '#78949a', tone: 'water', tierLabel: '水德 · 藏位', description: '深谷玄牝、不死往生之泉；灰光昏沉潜伏销融，最善藏匿遮掩。' },
  '渌水': { glyph: '渌', color: '#7cae9c', tone: 'jade', tierLabel: '水德 · 变位', description: '清浊沉浮、洞泉夕雨；晚来之雨凝滞腐蚀，洗天地人三劫渡厄去灾。' },

  // 五德 · 火
  '离火': { glyph: '离', color: '#d07b59', tone: 'ember', tierLabel: '火德 · 正位', description: '火德正位，帝王征伐大势沛然；内孕南明心火化为心府，吞木焚金行走太虚。' },
  '真火': { glyph: '真', color: '#e18d52', tone: 'ember', tierLabel: '火德 · 正位', description: '先天治命真火，金红真火环身化雉离飞影，驰炎踏火剥夺打落敌手神通。' },
  '并火': { glyph: '乌', color: '#a85c4c', tone: 'ember', tierLabel: '火德 · 收位', description: '黑红业火升腾，身幻鸟雀极尽杀伐，焚心束命无所遁形。' },
  '牡火': { glyph: '牡', color: '#c27957', tone: 'ember', tierLabel: '火德 · 藏位', description: '阴阳受藏之火，武器附着游走煞火，五指喷涌成烈焰兵刃浪潮。' },
  '灴火': { glyph: '灴', color: '#da7652', tone: 'ember', tierLabel: '火德 · 变位', description: '升腾流变之火，沸反盈天瓦解宫宇秩序；身碎化为万千吐火头颅隔断灵识。' },

  // 五德 · 土
  '艮土': { glyph: '艮', color: '#b19c72', tone: 'earth', tierLabel: '土德 · 正位', description: '土德正位，正源山峦重叠；搬山移岭、勘测地脉，知晓天地灵根所在。' },
  '戊土': { glyph: '戊', color: '#ae916a', tone: 'earth', tierLabel: '土德 · 正位', description: '中央敦厚之土，最制仙道；彩光抚顶受击坠地，仙无漏霞光庇护众生。' },
  '归土': { glyph: '归', color: '#9d8b68', tone: 'earth', tierLabel: '土德 · 收位', description: '社稷归心之土，灰黄厚光拉隔原野；天降金环镇压万方，神速加持符箓。' },
  '宝土': { glyph: '宝', color: '#a59473', tone: 'earth', tierLabel: '土德 · 藏位', description: '藏纳生息之土，善通田事梳理地脉；藏纳宫保命吊命，以尸骨补全躯壳。' },
  '宣土': { glyph: '宣', color: '#b39a68', tone: 'earth', tierLabel: '土德 · 变位', description: '帝宣中土之道，克制巫妙；身化大如山岳的金甲法身，白气金线锁百会百穴。' },
  '青宣': { glyph: '青', color: '#7da18b', tone: 'jade', tierLabel: '土德 / 并古 · 特例', description: '初伏仙君借宣土空证而出；青金流转降妖除魔，玄羊交感天地抬举仙基。' },

  // 十二炁
  '清炁': { glyph: '清', color: '#bfd6ce', tone: 'mist', tierLabel: '十二炁 · 本始', description: '十二炁之始，统领诸法；身如满天风云聚散消散，万千白气乘风逍遥。' },
  '邃炁': { glyph: '邃', color: '#857d8c', tone: 'moon', tierLabel: '十二炁 · 邃玄', description: '玄黄邃深之炁，感应道统变幻克制之法；魔咒祸乱心神，致法力暴动灵器失效。' },
  '紫炁': { glyph: '紫', color: '#a18aa7', tone: 'moon', tierLabel: '十二炁 · 紫都', description: '清都紫微之象，经声大作打断施法缴械灵器；展开紫炁领域庇护四尊威仪炁神。' },
  '真炁': { glyph: '真', color: '#c1bca7', tone: 'silver', tierLabel: '十二炁 · 真阳', description: '抱石眠真，生机绵长肌骨还真；破虚妄通人心，随修士寿数增长愈显威能。' },
  '寒炁': { glyph: '寒', color: '#acc7cf', tone: 'water', tierLabel: '十二炁 · 寒霜', description: '清苦松香自带寒气，恶念乍起立时清听警醒；踏雪驭寒朔风加持，寿数绵延。' },
  '晞炁': { glyph: '晞', color: '#d5a875', tone: 'gold', tierLabel: '十二炁 · 晞光', description: '明阳之闰，渡阴代夜；收束光火转为遁速，议八辟结党使帝刑不加法身虚化。' },
  '瑞炁': { glyph: '瑞', color: '#d2bd82', tone: 'gold', tierLabel: '十二炁 · 祥瑞', description: '祥瑞天光之象，测算运势生死大劫；断善恶、知好歹、明祸福，吉凶洞若观火。' },
  '煞炁': { glyph: '煞', color: '#786f7a', tone: 'moon', tierLabel: '十二炁 · 煞幽', description: '无尽煞峰拔地而起，遍天煞海翻涌加持法身；身化滚滚黑煞聚散无形阻挡金德。' },
  '谪炁': { glyph: '谪', color: '#888891', tone: 'moon', tierLabel: '十二炁 · 寂灭', description: '不显世幽冥之炁，杳暝沉暗；薄虞渊深，藏壑之舟渡转生死。' },
  '华炁': { glyph: '华', color: '#cba57f', tone: 'gold', tierLabel: '十二炁 · 韶光', description: '不显世显化韶华，钟鼓齐鸣诸侯列位抵御偏转攻击；淡金光色瞬息互换身形位移。' },

  // 三雷
  '玄雷': { glyph: '玄', color: '#ada8c6', tone: 'moon', tierLabel: '三雷 · 阳雷威霆', description: '浩荡乌云降银白玄雷护体，距离愈近威能愈烈；掌中雷暴索敌眉心，破阵摧坚。' },
  '霄雷': { glyph: '霄', color: '#969ab3', tone: 'moon', tierLabel: '三雷 · 阴雷云泽', description: '气海如化雷池储蓄玄雷，紫银两气升腾流转；设坛降雷化雷为液，克制飓鬼阴风。' },
  '元雷': { glyph: '磁', color: '#aab4ae', tone: 'mist', tierLabel: '三雷 · 元磁神枢', description: '铸在魔煞之中化出元磁真光；执掌煞仪，紫府突破最合此道。' },

  // 并古
  '鸺葵': { glyph: '鸺', color: '#8d8790', tone: 'moon', tierLabel: '三巫 · 幽风鬼影', description: '枭鸺鬼魅之象，留运转法力之分身遁匿无踪；御风极速，擅炼鬼尸喜暗忌阳。' },
  '上巫': { glyph: '巫', color: '#9e826f', tone: 'earth', tierLabel: '三巫 · 鬼神大傩', description: '上古巫傩神道，视物通透；深红法光压制法躯消磨，匿气绝算博名则损。' },
  '玉真': { glyph: '玉', color: '#a5bbb1', tone: 'jade', tierLabel: '三巫 · 琼华真幻', description: '素德钟爱之所，洁白宝衣身体玉化；青玉危崖绝路难逃，白锦漫天掩人耳目。' },
  '衡祝': { glyph: '祝', color: '#c99a68', tone: 'gold', tierLabel: '二祝 · 赤虎神祀', description: '神道敕祝与赤殿玄虎之象；目射血光穿破重围，血火幽域定身重伤遮蔽玄机。' },
  '全丹': { glyph: '丹', color: '#b48c77', tone: 'ember', tierLabel: '并古 · 铅汞万象', description: '铅汞孕育用器之德，一念仿造灵器神妙；神尸脱胎避死延生，强夺万派丹器妙用。' },
  '执孛': { glyph: '孛', color: '#9d9a88', tone: 'earth', tierLabel: '并古 · 执阴渡阳', description: '主阴阳交分动荡天下，化独立行走幻身；借王威以破阵斩敌，分割太虚断绝气息。' },
  '司天': { glyph: '天', color: '#aab2be', tone: 'silver', tierLabel: '并古 · 璇玑星曜', description: '度算天象玄序，听闻百里异动；丹田炼就天司雷邸，牵动修士愈众则星图神妙愈炽。' },
  '都卫': { glyph: '卫', color: '#a89979', tone: 'earth', tierLabel: '并古 · 悬山溯流', description: '神道戍卫灵山异水，吐沉重白气化悬空巨山镇压封锁太虚；紫鱼人面漫天化水。' },

  // 独立
  '虹霞': { glyph: '霞', color: '#cc8c81', tone: 'ember', tierLabel: '独立 · 朝采落霞', description: '朝霞采露，遁光疾迅施法如风；聚虹雾迷乱敌手，霞光护体孕育山川灵机。' },
  '长庚': { glyph: '剑', color: '#c3cbd0', tone: 'silver', tierLabel: '独立 · 剑意通玄', description: '采一百二十八道剑气、一十六道剑意自成一家；容纳磅礴剑意为神通斩落万法。' },
};

// 分类体系转换：将「道统-神通.json」深度融合为项目运行时结构
const groupMeta = {
  '阴阳': {
    kicker: '三阴 · 三阳',
    title: '阴阳六道',
    shortLabel: '阴阳',
    index: '01',
    description: '三阴三阳，日月相照；阴阳权柄各循其序，进退求金各有天数。',
    color: '#d2bc86',
  },
  '五德': {
    kicker: '金 · 木 · 水 · 火 · 土',
    title: '五德五行',
    shortLabel: '五德',
    index: '02',
    description: '金木水火土，各有正藏蕴变收诸现；青宣由初伏仙君空证并古。',
    color: '#c4a56d',
  },
  '十二炁': {
    kicker: '显世八炁 · 隐世二炁',
    title: '十二炁脉',
    shortLabel: '十二炁',
    index: '03',
    description: '起于清炁，散作万千灵机；显世与隐世诸炁互为阴阳表里。',
    color: '#96afae',
  },
  '三雷': {
    kicker: '玄雷 · 霄雷 · 元雷',
    title: '三雷法脉',
    shortLabel: '三雷',
    index: '04',
    description: '玄霄主雷霆阴阳，元雷掌元磁神枢；策电降法，紫府威凛。',
    color: '#a8a9bd',
  },
  '并古': {
    kicker: '三巫 · 二祝 · 神道丹家',
    title: '并古诸脉',
    shortLabel: '并古',
    index: '05',
    description: '包容上古巫祝、神道宿卫、铅汞全丹与执孛司天，各承古脉秘传。',
    color: '#aa9a86',
  },
  '独立': {
    kicker: '虹霞 · 长庚剑意',
    title: '独立法脉',
    shortLabel: '独立',
    index: '06',
    description: '独立天地之外，以霞为遁、以剑为道；自成宗祖，不拘五行阴阳。',
    color: '#c0a18b',
  },
};

// 构造道统体系数据
export const daoGroups = rawData['观道'].map((guanDao) => {
  const meta = groupMeta[guanDao['名称']] ?? {
    kicker: '道统秘录',
    title: guanDao['名称'],
    shortLabel: guanDao['名称'],
    index: '00',
    description: '',
    color: '#a9c8b5',
  };

  const daoItems = [];
  let daoIndex = 1;

  for (const subGroup of guanDao['下级道统分类']) {
    for (const dao of subGroup['道统']) {
      // 避免并古二祝下空青宣重复覆盖五德青宣
      if (guanDao['名称'] === '并古' && dao['名称'] === '青宣' && (!dao['神通'] || dao['神通'].length === 0)) {
        continue;
      }

      const daoName = dao['名称'];
      const customMeta = daoMetaConfig[daoName] ?? {
        glyph: daoName.slice(0, 1),
        color: '#a9c8b5',
        tone: 'jade',
        tierLabel: `${guanDao['名称']} · ${subGroup['名称']}`,
        description: '道统意象与权柄随修士、果位与时代而变，具体以典籍考据为准。',
      };

      const spells = (dao['神通'] || []).map((s) => ({
        name: s['名称'],
        alias: s['下位古称别称替参'] || '',
        category: s['神通类别'] || [],
        gongfa: s['功法'] || [],
        cultivation: s['修炼词条'] || [],
        combat: s['斗法词条'] || [],
        auxiliary: s['辅助词条'] || [],
        description: s['具体介绍'] || '',
        gongfaExtra: s['功法补充'] || [],
      }));

      daoItems.push({
        id: daoName,
        code: String(daoIndex).padStart(2, '0'),
        group: guanDao['名称'],
        groupLabel: guanDao['名称'],
        subGroup: subGroup['名称'],
        groupTitle: meta.title,
        name: daoName,
        spells,
        description: customMeta.description,
        glyph: customMeta.glyph,
        color: customMeta.color,
        tone: customMeta.tone,
        tierLabel: customMeta.tierLabel,
        subtitle: `${guanDao['名称']} · ${subGroup['名称']}`,
      });

      daoIndex += 1;
    }
  }

  return {
    id: guanDao['名称'],
    label: guanDao['名称'],
    kicker: meta.kicker,
    title: meta.title,
    shortLabel: meta.shortLabel,
    index: meta.index,
    description: meta.description,
    color: meta.color,
    items: daoItems,
  };
});

export const allDao = daoGroups.flatMap((group) => group.items);

// 提取全量所有独立神通索引（包含归属道统与所有词条，供全局搜索与筛选）
export const allSpells = allDao.flatMap((dao) =>
  dao.spells.map((s) => ({
    ...s,
    daoName: dao.name,
    daoGroup: dao.group,
    daoSubGroup: dao.subGroup,
    daoColor: dao.color,
    daoTone: dao.tone,
  }))
);

// 统计数据
export const stats = {
  totalDaos: allDao.length,
  totalSpells: allSpells.length,
  totalGongfa: allSpells.reduce((acc, s) => acc + s.gongfa.length + s.gongfaExtra.length, 0),
};

export const theoryPairs = [
  ['清炁', '谪炁', '始 · 末'],
  ['寒炁', '晞炁', '寒 · 热'],
  ['紫炁', '真炁', '紫阴 · 真阳'],
  ['华炁', '邃炁', '荣 · 枯'],
  ['瑞炁', '煞炁', '福 · 祸'],
  ['太阳', '太阴', '日 · 月'],
];
