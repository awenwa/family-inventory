// app.js
const Storage = require('./utils/storage');
const Cloud = require('./utils/cloud');
const { DEMO_ITEMS, CATEGORIES } = require('./utils/categories');

const DATA_VERSION = 3; // 云同步升级时递增

App({
  globalData: {
    items: [],
    categories: [],
    stats: {},
    frequency: null,
    cloudReady: false
  },

  onLaunch() {
    Storage.init();

    // 版本检查
    const savedVersion = wx.getStorageSync('data_version') || 0;
    if (savedVersion < DATA_VERSION) {
      wx.removeStorageSync('family_inventory_items');
      wx.removeStorageSync('family_inventory_categories');
      wx.removeStorageSync('family_inventory_frequency');
      wx.setStorageSync('data_version', DATA_VERSION);
    }

    // 加载本地数据（立即渲染）
    const items = Storage.getItems();
    if (items.length === 0) {
      Storage.setItems(DEMO_ITEMS);
      this.globalData.items = DEMO_ITEMS;
    } else {
      this.globalData.items = items;
    }

    this.globalData.categories = Storage.getCategories();
    this.globalData.stats = this.calcStats();
    this.globalData.frequency = Storage.getFrequency() || this.buildFrequency();

    // 初始化云开发 + 后台同步
    Cloud.init().then(ok => {
      this.globalData.cloudReady = ok;
      if (ok) {
        this.backgroundSync();
      }
    });
  },

  /**
   * 后台静默同步（不阻塞 UI）
   */
  backgroundSync() {
    Cloud.syncAll(
      this.globalData.items,
      this.globalData.categories,
      this.globalData.frequency
    ).then(res => {
      if (res.synced) {
        this.globalData.items = res.items;
        this.globalData.categories = res.categories;
        this.globalData.frequency = res.frequency;
        this.globalData.stats = this.calcStats();
        console.log('[App] 云同步完成');
      }
    }).catch(e => {
      console.error('[App] 云同步异常:', e);
    });
  },

  calcStats() {
    const items = this.globalData.items;
    const total = items.length;
    const totalValue = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);
    const thisMonth = items.filter(item => {
      if (!item.purchaseDate) return false;
      const d = new Date(item.purchaseDate);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const byCategory = {};
    items.forEach(item => {
      const cat = item.category || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });
    return { total, totalValue, thisMonth, byCategory };
  },

  buildFrequency() {
    const items = this.globalData.items;
    const freq = { categories: {}, sizes: {}, channels: {} };
    items.forEach(item => {
      if (item.category) freq.categories[item.category] = (freq.categories[item.category] || 0) + 1;
      if (item.clothesSize) freq.sizes[item.clothesSize] = (freq.sizes[item.clothesSize] || 0) + 1;
      if (item.shoesSize) freq.sizes[item.shoesSize] = (freq.sizes[item.shoesSize] || 0) + 1;
      if (item.channel) freq.channels[item.channel] = (freq.channels[item.channel] || 0) + 1;
    });
    return freq;
  },

  refreshStats() {
    this.globalData.stats = this.calcStats();
    this.globalData.items = Storage.getItems();
    this.globalData.categories = Storage.getCategories();
    this.globalData.frequency = Storage.getFrequency() || this.buildFrequency();
  }
});
