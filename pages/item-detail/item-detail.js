// pages/item-detail/item-detail.js
const app = getApp();
const { CATEGORIES, getCategoryById } = require('../../utils/categories');
const Storage = require('../../utils/storage');
const Cloud = require('../../utils/cloud');
const { formatDate } = require('../../utils/formatters');

Page({
  data: { item: null, price_str: '', date_str: '', age: '' },

  onLoad(options) {
    this.loadItem(options.id);
  },

  onShow() {
    if (this.data.item) {
      this.loadItem(this.data.item.id);
    }
  },

  loadItem(id) {
    const items = app.globalData.items;
    const item = items.find(i => i.id === id);
    if (!item) {
      wx.showToast({ title: '物品不存在', icon: 'error' });
      setTimeout(() => wx.navigateBack(), 1000);
      return;
    }
    const cat = getCategoryById(item.category);
    const price = parseFloat(item.price) || 0;
    const age = this.calcAge(item.purchaseDate);

    // 兼容旧数据：brandModel 或 specs.brand/specs.model
    const specs = item.specs || {};
    const brandDisplay = item.brandModel || [specs.brand, specs.model].filter(Boolean).join(' ') || '';

    this.setData({
      item: {
        ...item,
        category_name: cat.name,
        category_icon: cat.icon,
        category_color: cat.color,
        brandDisplay,
        specs
      },
      price_str: price.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      date_str: formatDate(item.purchaseDate),
      age
    });
  },

  calcAge(dateStr) {
    if (!dateStr) return '未知';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return '今天';
    if (days < 7) return `${days}天`;
    if (days < 30) return `${Math.floor(days / 7)}周`;
    if (days < 365) return `${Math.floor(days / 30)}个月`;
    const y = Math.floor(days / 365);
    const m = Math.floor((days % 365) / 30);
    return m > 0 ? `${y}年${m}月` : `${y}年`;
  },

  goEdit() {
    wx.navigateTo({ url: `/pages/item-add/item-add?editId=${this.data.item.id}` });
  },

  deleteItem() {
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${this.data.item.name}」吗？此操作不可撤销。`,
      confirmColor: '#E05050',
      success: res => {
        if (res.confirm) {
          let items = app.globalData.items;
          const delId = this.data.item.id;
          items = items.filter(i => i.id !== delId);
          Storage.setItems(items);
          app.refreshStats();
          // 云端同步删除
          if (Cloud.isReady()) {
            Cloud.removeItem(delId);
          }
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1000);
        }
      }
    });
  }
});
