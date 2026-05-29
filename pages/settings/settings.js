// pages/settings/settings.js
const app = getApp();
const { CATEGORIES } = require('../../utils/categories');
const Storage = require('../../utils/storage');
const Cloud = require('../../utils/cloud');
const DEFAULT_CLOUD_ENV = 'cloud1-8gndjspe6b759566';

Page({
  data: {
    stats: { total: 0, totalValue: 0, totalValue_str: '0.00', thisMonth: 0, byCategory: {} },
    catStats: [],
    // 云同步
    cloudEnvId: '',
    cloudReady: false,
    syncing: false,
    lastSyncTime: 0,
    lastSyncTimeStr: '未同步'
  },

  onShow() {
    this.loadStats();
    this.loadCloudStatus();
  },

  loadCloudStatus() {
    const envId = Cloud.getEnvId() || DEFAULT_CLOUD_ENV;
    const ready = Cloud.isReady();
    const lastSync = Cloud.getLastSyncTime();
    const lastSyncStr = lastSync > 0
      ? new Date(lastSync).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '未同步';

    this.setData({
      cloudEnvId: envId,
      cloudReady: ready,
      syncing: Cloud.isSyncing(),
      lastSyncTime: lastSync,
      lastSyncTimeStr: lastSyncStr,
      cloudPreset: !!DEFAULT_CLOUD_ENV
    });
  },

  loadStats() {
    app.refreshStats();
    const stats = app.globalData.stats;
    stats.totalValue_str = (stats.totalValue || 0).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const maxCount = Math.max(...CATEGORIES.map(c => stats.byCategory[c.id] || 0), 1);
    const catStats = CATEGORIES.map(cat => ({
      ...cat,
      count: stats.byCategory[cat.id] || 0,
      pct: Math.round(((stats.byCategory[cat.id] || 0) / maxCount) * 100)
    }));

    this.setData({ stats, catStats });
  },

  goCat(e) {
    wx.navigateTo({ url: `/pages/category/category?id=${e.currentTarget.dataset.id}` });
  },

  // ========== 云同步 ==========

  onEnvIdInput(e) {
    this.setData({ cloudEnvId: e.detail.value.trim() });
  },

  saveCloudEnv() {
    const envId = this.data.cloudEnvId.trim();
    if (!envId) {
      wx.showModal({
        title: '提示',
        content: '输入云环境 ID 后，需要重启小程序才能生效。是否确认保存？',
        success: res => {
          if (res.confirm) {
            Cloud.setEnvId('');
            this.setData({ cloudReady: false, lastSyncTimeStr: '未同步' });
            wx.showToast({ title: '已关闭云同步', icon: 'success' });
          }
        }
      });
      return;
    }

    wx.showModal({
      title: '确认配置',
      content: `云环境 ID: ${envId}\n\n保存后需重启小程序才能生效。确认？`,
      success: res => {
        if (res.confirm) {
          Cloud.setEnvId(envId);
          wx.showToast({ title: '已保存，请重启小程序', icon: 'none', duration: 3000 });
        }
      }
    });
  },

  manualSync() {
    if (!Cloud.isReady()) {
      wx.showToast({ title: '云同步未启用', icon: 'none' });
      return;
    }
    if (Cloud.isSyncing()) {
      wx.showToast({ title: '正在同步中…', icon: 'none' });
      return;
    }

    this.setData({ syncing: true });
    Cloud.syncAll(
      app.globalData.items,
      app.globalData.categories,
      app.globalData.frequency
    ).then(res => {
      if (res.synced) {
        app.globalData.items = res.items;
        app.globalData.categories = res.categories;
        app.globalData.frequency = res.frequency;
        app.globalData.stats = app.calcStats();
        this.loadStats();
        this.loadCloudStatus();
        wx.showToast({ title: '同步成功', icon: 'success' });
      } else {
        wx.showToast({ title: '同步失败', icon: 'error' });
      }
    }).catch(() => {
      wx.showToast({ title: '同步异常', icon: 'error' });
    }).finally(() => {
      this.setData({ syncing: false });
    });
  },

  disconnectCloud() {
    wx.showModal({
      title: '断开云同步',
      content: '断开后数据仅保存在本地，不会删除云端已有数据。确认？',
      confirmColor: '#E05050',
      success: res => {
        if (res.confirm) {
          Cloud.setEnvId('');
          this.setData({ cloudReady: false, cloudEnvId: '', lastSyncTimeStr: '未同步' });
          wx.showToast({ title: '已断开', icon: 'success' });
        }
      }
    });
  },

  // ========== 工具 ==========

  exportData() {
    const items = app.globalData.items;
    const json = JSON.stringify(items, null, 2);
    const fileName = `family-inventory-${new Date().toISOString().slice(0, 10)}.json`;

    try {
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
      fs.writeFile({
        filePath,
        data: json,
        encoding: 'utf8',
        success: () => {
          wx.shareFileMessage({
            filePath,
            fileName,
            success: () => {},
            fail: () => {
              wx.openDocument({
                filePath,
                fileType: 'json',
                showMenu: true,
                success: () => {},
                fail: () => {
                  wx.showToast({ title: '导出完成', icon: 'success' });
                }
              });
            }
          });
        }
      });
    } catch (e) {
      wx.showToast({ title: '导出失败', icon: 'error' });
    }
  },

  importData() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: res => {
        const file = res.tempFiles[0];
        const fs = wx.getFileSystemManager();
        fs.readFile({
          filePath: file.path,
          encoding: 'utf8',
          success: data => {
            try {
              const items = JSON.parse(data.data);
              if (Array.isArray(items)) {
                wx.showModal({
                  title: '确认导入',
                  content: `将导入 ${items.length} 件物品，是否覆盖现有数据？`,
                  success: modal => {
                    if (modal.confirm) {
                      Storage.setItems(items);
                      app.refreshStats();
                      this.loadStats();
                      // 同步到云端
                      if (Cloud.isReady()) {
                        Cloud.pushAllItems(items);
                      }
                      wx.showToast({ title: '导入成功', icon: 'success' });
                    }
                  }
                });
              } else {
                wx.showToast({ title: '文件格式错误', icon: 'error' });
              }
            } catch (e) {
              wx.showToast({ title: 'JSON 解析失败', icon: 'error' });
            }
          }
        });
      }
    });
  },

  clearAll() {
    wx.showModal({
      title: '确认清空',
      content: '确定要删除所有物品数据吗？此操作不可撤销！',
      confirmColor: '#E05050',
      success: res => {
        if (res.confirm) {
          wx.showModal({
            title: '再次确认',
            content: '这是最后一次确认，删除后无法恢复！',
            confirmColor: '#E05050',
            success: r2 => {
              if (r2.confirm) {
                Storage.setItems([]);
                app.refreshStats();
                this.loadStats();
                // 同步清空到云端
                if (Cloud.isReady()) {
                  Cloud.pushAllItems([]);
                }
                wx.showToast({ title: '已清空', icon: 'success' });
              }
            }
          });
        }
      }
    });
  }
});
