
export enum AppView {
  FOREST = 'FOREST',
  CHAT = 'CHAT',
  ARCHIVE = 'ARCHIVE',
  MARKET = 'MARKET'
}

// 情绪标签枚举 - 用于树木多样性系统
export enum EmotionTag {
  ANGER = 'anger',        // 愤怒
  SADNESS = 'sadness',    // 悲伤
  ANXIETY = 'anxiety',    // 焦虑
  STRESS = 'stress',      // 压力
  JOY = 'joy',            // 喜悦
  PEACE = 'peace',        // 平静
  GRATITUDE = 'gratitude', // 感恩
  GROWTH = 'growth',      // 成长
  FLEXIBILITY = 'flexibility', // 灵活
  CLARITY = 'clarity',    // 清晰
  PATIENCE = 'patience',  // 耐心
  RESILIENCE = 'resilience' // 韧性
}

// 树种稀有度
export enum TreeRarity {
  COMMON = 'common',      // 普通 - 免费解锁
  RARE = 'rare',          // 稀有 - 付费解锁
  EPIC = 'epic',          // 史诗 - 活动/成就解锁
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Wisdom {
  id: string;
  title: string; // The "Mindset" name
  situation: string; // Brief summary of the issue
  insight: string; // The core logic/philosophy extracted
  date: string;
}

// 扩展树木类型枚举 - 支持多样性系统
export type TreeType =
  | 'oak'        // 橡树 - 坚韧，默认树种
  | 'willow'     // 柳树 - 柔韧，对应悲伤
  | 'pine'       // 松树 - 耐力，对应愤怒
  | 'cherry'     // 樱花 - 友谊，社交解锁
  | 'maple'      // 枫树 - 变化，对应焦虑
  | 'bamboo'     // 竹子 - 灵活，对应压力
  | 'lotus'      // 莲花 - 超脱，内购解锁 (稀有)
  | 'olive'      // 橄榄 - 和平，内购解锁 (稀有)
  | 'bonsai'     // 盆栽 - 精致，内购解锁 (稀有)
  | 'redwood';   // 红杉 - 韧性，内购解锁 (稀有)

// 树种配置接口
export interface TreeSpeciesConfig {
  type: TreeType;
  displayName: string;
  emotionTags: EmotionTag[];
  rarity: TreeRarity;
  growthMultiplier: number; // 生长速度乘数 (1.0为基础)
  fruitYield: number; // 每次结果产量
  unlockCondition: 'free' | 'purchase' | 'social' | 'achievement';
  colorPalette: {
    sapling: string;
    growing: string;
    mature: string;
    fruiting: string;
    trunk: string;
    fruit: string;
  };
  purchaseId?: string; // 对应内购商品ID
}

export interface Tree {
  id: string;
  wisdomId: string;
  stage: 'sapling' | 'growing' | 'mature' | 'fruiting';
  plantedAt: number;
  stageStartedAt: number; // Timestamp when the current stage began
  lastWatered: number;
  type: TreeType; // 使用扩展的树木类型
  speciesConfig: TreeSpeciesConfig; // 树种配置快照
  hasProduced?: boolean; // Track if the current fruiting has been counted in stats
  customName?: string; // 用户自定义树名（可选）
}

export interface CommunityFruit {
  id: string;
  author: string;
  insight: string;
  cost: number; // 1 fruit
}

// 树种配置数据库
export const TREE_SPECIES_DB: Record<TreeType, TreeSpeciesConfig> = {
  oak: {
    type: 'oak',
    displayName: '坚韧橡树',
    emotionTags: [EmotionTag.STRESS, EmotionTag.GROWTH],
    rarity: TreeRarity.COMMON,
    growthMultiplier: 1.0,
    fruitYield: 1,
    unlockCondition: 'free',
    colorPalette: {
      sapling: '#10B981',
      growing: '#059669',
      mature: '#047857',
      fruiting: '#065F46',
      trunk: '#795548',
      fruit: '#FB923C'
    }
  },
  willow: {
    type: 'willow',
    displayName: '柔韧柳树',
    emotionTags: [EmotionTag.SADNESS, EmotionTag.PEACE],
    rarity: TreeRarity.COMMON,
    growthMultiplier: 1.0,
    fruitYield: 1,
    unlockCondition: 'free',
    colorPalette: {
      sapling: '#38BDF8',
      growing: '#0EA5E9',
      mature: '#0284C7',
      fruiting: '#0369A1',
      trunk: '#A1887F',
      fruit: '#FBBF24'
    }
  },
  pine: {
    type: 'pine',
    displayName: '耐力松树',
    emotionTags: [EmotionTag.ANGER, EmotionTag.GROWTH],
    rarity: TreeRarity.COMMON,
    growthMultiplier: 1.0,
    fruitYield: 1,
    unlockCondition: 'free',
    colorPalette: {
      sapling: '#22C55E',
      growing: '#16A34A',
      mature: '#15803D',
      fruiting: '#166534',
      trunk: '#5D4037',
      fruit: '#F97316'
    }
  },
  cherry: {
    type: 'cherry',
    displayName: '友谊樱花',
    emotionTags: [EmotionTag.JOY, EmotionTag.GRATITUDE],
    rarity: TreeRarity.COMMON,
    growthMultiplier: 0.8, // 生长稍快
    fruitYield: 2, // 友谊树产量更高
    unlockCondition: 'social', // 通过社交交换解锁
    colorPalette: {
      sapling: '#F472B6',
      growing: '#EC4899',
      mature: '#DB2777',
      fruiting: '#BE185D',
      trunk: '#8D6E63',
      fruit: '#F59E0B'
    }
  },
  maple: {
    type: 'maple',
    displayName: '变化枫树',
    emotionTags: [EmotionTag.ANXIETY, EmotionTag.GROWTH],
    rarity: TreeRarity.COMMON,
    growthMultiplier: 1.0,
    fruitYield: 1,
    unlockCondition: 'free',
    colorPalette: {
      sapling: '#F97316',
      growing: '#EA580C',
      mature: '#C2410C',
      fruiting: '#9A3412',
      trunk: '#6D4C41',
      fruit: '#EAB308'
    }
  },
  bamboo: {
    type: 'bamboo',
    displayName: '灵巧竹子',
    emotionTags: [EmotionTag.STRESS, EmotionTag.FLEXIBILITY],
    rarity: TreeRarity.COMMON,
    growthMultiplier: 1.2, // 生长更快
    fruitYield: 1,
    unlockCondition: 'free',
    colorPalette: {
      sapling: '#84CC16',
      growing: '#65A30D',
      mature: '#4D7C0F',
      fruiting: '#3F6212',
      trunk: '#4A7C59',
      fruit: '#84CC16'
    }
  },
  lotus: {
    type: 'lotus',
    displayName: '超脱莲花',
    emotionTags: [EmotionTag.PEACE, EmotionTag.CLARITY],
    rarity: TreeRarity.RARE,
    growthMultiplier: 1.5, // 生长较慢但稀有
    fruitYield: 3, // 产量更高
    unlockCondition: 'purchase',
    purchaseId: 'lotus_seed',
    colorPalette: {
      sapling: '#C084FC',
      growing: '#A855F7',
      mature: '#9333EA',
      fruiting: '#7E22CE',
      trunk: '#BA68C8',
      fruit: '#D8B4FE'
    }
  },
  olive: {
    type: 'olive',
    displayName: '和平橄榄',
    emotionTags: [EmotionTag.PEACE, EmotionTag.GRATITUDE],
    rarity: TreeRarity.RARE,
    growthMultiplier: 1.3,
    fruitYield: 2,
    unlockCondition: 'purchase',
    purchaseId: 'olive_sapling',
    colorPalette: {
      sapling: '#A3E635',
      growing: '#84CC16',
      mature: '#65A30D',
      fruiting: '#4D7C0F',
      trunk: '#8BC34A',
      fruit: '#D9F99D'
    }
  },
  bonsai: {
    type: 'bonsai',
    displayName: '精致盆栽',
    emotionTags: [EmotionTag.PATIENCE, EmotionTag.GROWTH],
    rarity: TreeRarity.RARE,
    growthMultiplier: 0.7, // 生长很慢，体现耐心
    fruitYield: 2,
    unlockCondition: 'purchase',
    purchaseId: 'bonsai_kit',
    colorPalette: {
      sapling: '#6EE7B7',
      growing: '#34D399',
      mature: '#10B981',
      fruiting: '#059669',
      trunk: '#795548',
      fruit: '#FDE68A'
    }
  },
  redwood: {
    type: 'redwood',
    displayName: '坚韧红杉',
    emotionTags: [EmotionTag.RESILIENCE, EmotionTag.GROWTH],
    rarity: TreeRarity.RARE,
    growthMultiplier: 2.0, // 生长很慢但最终巨大
    fruitYield: 3,
    unlockCondition: 'purchase',
    purchaseId: 'redwood_seed',
    colorPalette: {
      sapling: '#DC2626',
      growing: '#B91C1C',
      mature: '#991B1B',
      fruiting: '#7F1D1D',
      trunk: '#4A2511',
      fruit: '#FCA5A5'
    }
  }
};

// 免费用户默认解锁的树种
export const FREE_UNLOCKED_SPECIES: TreeType[] = ['oak', 'willow', 'pine', 'maple', 'bamboo'];
