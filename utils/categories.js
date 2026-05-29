// utils/categories.js - 分类配置、尺码选项、购买渠道预设

const CATEGORIES = [
  { id: 'electronics', name: '数码电子', icon: '🔌', color: '#4A90D9' },
  { id: 'furniture',   name: '家具家居', icon: '🏠', color: '#D4A84B' },
  { id: 'clothing',    name: '服装配饰', icon: '👕', color: '#E8B4B8', hasSize: true, sizeType: 'clothes' },
  { id: 'shoes',       name: '鞋靴箱包', icon: '👟', color: '#8D6E63', hasSize: true, sizeType: 'shoes' },
  { id: 'food',        name: '食品饮料', icon: '🍎', color: '#5BAD5A' },
  { id: 'books',       name: '图书文具', icon: '📚', color: '#7B6EB2' },
  { id: 'sports',      name: '运动户外', icon: '⚽', color: '#4CAF50' },
  { id: 'cosmetics',   name: '护肤美妆', icon: '💄', color: '#E91E8C' },
  { id: 'daily',       name: '日用百货', icon: '🧴', color: '#9E9E9E' },
  { id: 'tools',       name: '工具配件', icon: '🔧', color: '#8D6E63' },
  { id: 'other',       name: '其他',     icon: '📦', color: '#BDBDBD' },
];

// 尺码选项
const SIZE_OPTIONS = {
  clothes: {
    // 女装尺码（155/80A ~ 185/120A）
    women: [
      '155/80A(XS)', '155/80A(S)', '160/80A(S)', '160/84A(M)', '165/84A(M)',
      '165/88A(L)', '170/88A(L)', '170/92A(XL)', '175/92A(XL)', '175/96A(2XL)',
      '180/100A(2XL)', '180/104A(3XL)', '185/104A(3XL)', '185/108A(4XL)', '190/112A(5XL)',
      '均码', '加大码(3XL)', '加大码(4XL)', '加大码(5XL)'
    ],
    // 男装尺码（165/84A ~ 210/124A）
    men: [
      '165/84A(XS)', '165/88A(S)', '170/88A(S)', '170/92A(M)', '175/92A(M)',
      '175/96A(L)', '180/96A(L)', '180/100A(XL)', '185/100A(XL)', '185/104A(2XL)',
      '190/104A(2XL)', '190/108A(3XL)', '195/108A(3XL)', '195/112A(4XL)', '200/112A(4XL)',
      '200/116A(5XL)', '205/120A(5XL)', '210/124A(6XL)',
      '均码', '加大码(3XL)', '加大码(4XL)', '加大码(5XL)'
    ],
  },
  shoes: {
    // 女鞋尺码 - 中国码 30~44
    women:  ['30', '31', '32', '33', '34', '35', '35.5', '36', '36.5', '37', '37.5', '38', '38.5', '39', '39.5', '40', '41', '42', '43', '44'],
    // 男鞋尺码 - 中国码 38~50
    men:    ['38', '38.5', '39', '39.5', '40', '40.5', '41', '41.5', '42', '42.5', '43', '43.5', '44', '44.5', '45', '45.5', '46', '47', '48', '49', '50'],
    // 欧码 34~49
    eu:     ['EU34', 'EU34.5', 'EU35', 'EU35.5', 'EU36', 'EU36.5', 'EU37', 'EU37.5', 'EU38', 'EU38.5', 'EU39', 'EU39.5', 'EU40', 'EU40.5', 'EU41', 'EU41.5', 'EU42', 'EU42.5', 'EU43', 'EU43.5', 'EU44', 'EU44.5', 'EU45', 'EU45.5', 'EU46', 'EU47', 'EU48', 'EU49'],
    // 美码 4~14（男女混用提示）
    us:     ['US4', 'US4.5', 'US5', 'US5.5', 'US6', 'US6.5', 'US7', 'US7.5', 'US8', 'US8.5', 'US9', 'US9.5', 'US10', 'US10.5', 'US11', 'US11.5', 'US12', 'US12.5', 'US13', 'US13.5', 'US14'],
  }
};

// 购买渠道预设
const CHANNEL_PRESETS = [
  '天猫', '淘宝', '京东', '拼多多', '唯品会', '抖音商城',
  '小红书', '得物', '亚马逊', '1688', '宜家', '苏宁易购',
  '品牌官网', '品牌旗舰店', '线下门店', '二手平台', '其他'
];

// 示例数据（首次使用的引导数据）
const DEMO_ITEMS = [
  {
    id: 'demo_001',
    name: 'iPhone 15 Pro',
    category: 'electronics',
    specs: {
      brand: 'Apple',
      model: 'A3104',
      color: '原色钛金属',
      storage: '256GB',
      weight: '187g'
    },
    purchaseDate: '2024-01-15',
    price: '7999',
    channel: 'Apple官网',
    location: '书房抽屉',
    remark: '银色盒子还在',
    tags: ['手机', '数码', '贵重'],
    photos: []
  },
  {
    id: 'demo_002',
    name: '索尼 WH-1000XM5',
    category: 'electronics',
    specs: {
      brand: 'Sony',
      model: 'WH-1000XM5',
      color: '铂金银',
      weight: '250g'
    },
    purchaseDate: '2024-03-20',
    price: '2699',
    channel: '京东',
    location: '客厅电视柜',
    remark: '降噪效果很好',
    tags: ['耳机', '降噪', '音频'],
    photos: []
  },
  {
    id: 'demo_003',
    name: '宜家马尔姆六斗柜',
    category: 'furniture',
    specs: {
      brand: '宜家 IKEA',
      model: 'MALM 马尔姆',
      color: 'Oak veneer / white',
      dimensions: '80×48×123cm',
      weight: '约45kg'
    },
    purchaseDate: '2023-06-10',
    price: '1299',
    channel: '宜家',
    location: '卧室靠墙',
    remark: '需定期检查螺丝',
    tags: ['收纳', '卧室', '实木'],
    photos: []
  },
  {
    id: 'demo_004',
    name: '博世 Serie 4 洗衣机',
    category: 'furniture',
    specs: {
      brand: 'Bosch/博世',
      model: 'WAU28TH0HW',
      color: '白色',
      capacity: '9kg',
      dimensions: '85×60×59cm'
    },
    purchaseDate: '2023-11-01',
    price: '3899',
    channel: '苏宁易购',
    location: '卫生间干区',
    remark: '带烘干功能',
    tags: ['家电', '洗衣机', '生活'],
    photos: []
  },
  {
    id: 'demo_005',
    name: '优衣库 HEATTECH 保暖内衣',
    category: 'clothing',
    specs: {
      brand: '优衣库 UNIQLO',
      model: 'HEATTECH Extra Warm',
      color: '黑色',
      size: 'M',
      material: '69%棉 31%聚酯纤维'
    },
    purchaseDate: '2024-10-15',
    price: '199',
    channel: '天猫',
    location: '衣柜第二层',
    remark: '买了三套换洗',
    tags: ['内衣', '保暖', '冬季'],
    photos: []
  },
  {
    id: 'demo_006',
    name: 'Nike Air Max 270',
    category: 'shoes',
    specs: {
      brand: 'Nike',
      model: 'CD0310-001',
      color: '黑/白',
      size: '42',
      sizeType: 'shoes'
    },
    purchaseDate: '2024-06-01',
    price: '1099',
    channel: '得物',
    location: '鞋柜右侧',
    remark: '跑步用，已磨损',
    tags: ['运动', '跑步', 'Nike'],
    photos: []
  },
  {
    id: 'demo_007',
    name: '任天堂 Switch OLED',
    category: 'electronics',
    specs: {
      brand: 'Nintendo',
      model: 'HAC-001-01(OD)',
      color: '白色',
      storage: '64GB',
      weight: '约420g'
    },
    purchaseDate: '2024-02-14',
    price: '2599',
    channel: '天猫',
    location: '客厅茶几抽屉',
    remark: '配了Pro手柄',
    tags: ['游戏机', '掌机', '娱乐'],
    photos: []
  }
];

function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

function formatPrice(price) {
  return parseFloat(price).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

module.exports = {
  CATEGORIES,
  SIZE_OPTIONS,
  CHANNEL_PRESETS,
  DEMO_ITEMS,
  getCategoryById,
  formatPrice
};
