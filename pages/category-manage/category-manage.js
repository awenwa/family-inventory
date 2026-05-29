// pages/category-manage/category-manage.js
const app = getApp();
const Storage = require('../../utils/storage');

Page({
  data: { categories: [] },

  onShow() {
    this.loadCategories();
  },

  loadCategories() {
    const cats = Storage.getCategories();
    const stats = app.globalData.stats || {};
    const catsWithCount = cats.map(c => ({
      ...c,
      count: stats.byCategory ? (stats.byCategory[c.id] || 0) : 0
    }));
    this.setData({ categories: catsWithCount });
  },

  addCat() {
    const icons = ['👕', '📱', '🛋️', '🍳', '📚', '⚽', '💄', '🎮', '🧸', '📦', '🎁', '🌿'];
    const colors = ['#E8B4B8', '#7EB8D4', '#B8C9A3', '#E8C49A', '#A8C4D4', '#7AC4A8', '#D4A8C8', '#C4A8E8', '#E8D49A', '#C8C4B8'];

    wx.showActionSheet({
      itemList: icons,
      success: iconRes => {
        const selectedIcon = icons[iconRes.tapIndex];
        wx.showActionSheet({
          itemList: colors.map(c => `颜色 ${c}`),
          success: colorRes => {
            const selectedColor = colors[colorRes.tapIndex];
            wx.showModal({
              title: '添加分类',
              editable: true,
              placeholderText: '分类名称',
              success: res => {
                if (!res.confirm || !res.content.trim()) return;
                const name = res.content.trim();
                const newCat = {
                  id: 'custom_' + Date.now(),
                  name,
                  icon: selectedIcon,
                  color: selectedColor
                };
                let cats = Storage.getCategories();
                cats.push(newCat);
                Storage.setCategories(cats);
                app.globalData.categories = cats;
                app.refreshStats();
                this.loadCategories();
                wx.showToast({ title: '已添加', icon: 'success' });
              }
            });
          }
        });
      }
    });
  },

  editCat(e) {
    const id = e.currentTarget.dataset.id;
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return;

    wx.showModal({
      title: '编辑分类',
      editable: true,
      placeholderText: '新名称',
      content: cat.name,
      success: res => {
        if (!res.confirm || !res.content.trim()) return;
        const name = res.content.trim();
        let cats = Storage.getCategories();
        cats = cats.map(c => c.id === id ? { ...c, name } : c);
        Storage.setCategories(cats);
        app.globalData.categories = cats;
        app.refreshStats();
        this.loadCategories();
        wx.showToast({ title: '已更新', icon: 'success' });
      }
    });
  },

  deleteCat(e) {
    const id = e.currentTarget.dataset.id;
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return;

    if (cat.count > 0) {
      wx.showModal({
        title: '无法删除',
        content: `「${cat.name}」分类下还有 ${cat.count} 件物品，请先移至其他分类。`,
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除分类「${cat.name}」吗？`,
      confirmColor: '#E05050',
      success: res => {
        if (res.confirm) {
          let cats = Storage.getCategories().filter(c => c.id !== id);
          Storage.setCategories(cats);
          app.globalData.categories = cats;
          app.refreshStats();
          this.loadCategories();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
