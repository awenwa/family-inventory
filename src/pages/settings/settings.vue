<template>
<view class="page">
  <view class="stat-overview">
    <text class="stat-title">📊 资产总览</text>
    <view class="stat-grid">
      <view class="stat-cell"><text class="stat-n">{{stats.total}}</text><text class="stat-k">物品总数</text></view>
      <view class="stat-cell"><text class="stat-n">¥{{stats.totalValue_str}}</text><text class="stat-k">累计价值</text></view>
      <view class="stat-cell"><text class="stat-n">{{stats.thisMonth}}</text><text class="stat-k">本月新增</text></view>
    </view>
  </view>

  <view class="section">
    <text class="sec-title">☁️ 云同步 (Supabase)</text>
    <view class="cloud-card">
      <view class="cloud-status">
        <view class="cloud-dot" :class="supabaseReady ? 'online' : 'offline'"></view>
        <text class="cloud-status-text">{{supabaseReady ? '已连接' : '未连接'}}</text>
        <text v-if="supabaseReady" class="cloud-sync-time">上次同步: {{lastSyncTimeStr}}</text>
      </view>
      <view v-if="!supabaseReady" class="cloud-config">
        <view class="cloud-row">
          <text class="cloud-label">Supabase URL</text>
          <input class="cloud-input" placeholder="https://xxx.supabase.co" :value="supabaseUrl" @input="onUrlInput" />
        </view>
        <view class="cloud-row">
          <text class="cloud-label">Anon Key</text>
          <input class="cloud-input" placeholder="eyJhbGciOi..." :value="supabaseKey" @input="onKeyInput" />
        </view>
        <view class="cloud-row">
          <text class="cloud-label">用户 ID</text>
          <input class="cloud-input" placeholder="自定义用户标识" :value="supabaseUserId" @input="onUserIdInput" />
        </view>
        <view class="cloud-btn primary" @tap="connectSupabase"><text>连接</text></view>
      </view>
      <view v-else class="cloud-actions">
        <view class="cloud-btn primary" @tap="manualSync"><text>{{syncing ? '同步中…' : '立即同步'}}</text></view>
        <view class="cloud-btn danger" @tap="disconnectSupabase"><text>断开</text></view>
      </view>
      <view class="cloud-hint"><text class="cloud-hint-text">💡 配置 Supabase 免费实例即可实现跨设备同步。数据存储在你自己的云端数据库中。</text></view>
    </view>
  </view>

  <view class="section">
    <text class="sec-title">📁 分类统计</text>
    <view class="cat-stats">
      <view v-for="cat in catStats" :key="cat.id" class="cat-stat-row" @tap="goCat(cat.id)">
        <text class="cs-icon">{{cat.icon}}</text>
        <text class="cs-name">{{cat.name}}</text>
        <text class="cs-bar-wrap"><text class="cs-bar" :style="{width: cat.pct + '%', background: cat.color}"></text></text>
        <text class="cs-count">{{cat.count}}</text>
      </view>
    </view>
  </view>

  <view class="section">
    <text class="sec-title">🛠 工具</text>
    <view class="action-list">
      <view class="action-item" @tap="exportData">
        <text class="ai-icon">📤</text>
        <view class="ai-body"><text class="ai-name">导出数据</text><text class="ai-sub">将全部物品导出为 JSON</text></view>
        <text class="ai-arrow">›</text>
      </view>
      <view class="action-item" @tap="importData">
        <text class="ai-icon">📥</text>
        <view class="ai-body"><text class="ai-name">导入数据</text><text class="ai-sub">从 JSON 文件恢复物品数据</text></view>
        <text class="ai-arrow">›</text>
      </view>
      <view class="action-item danger" @tap="clearAll">
        <text class="ai-icon">🗑</text>
        <view class="ai-body"><text class="ai-name">清空数据</text><text class="ai-sub">删除全部物品（不可恢复）</text></view>
        <text class="ai-arrow">›</text>
      </view>
    </view>
  </view>

  <view class="section">
    <text class="sec-title">ℹ️ 关于</text>
    <view class="about-card">
      <text class="about-name">家庭用品管理</text>
      <text class="about-ver">版本 2.0.0 (uni-app)</text>
      <text class="about-desc">记录家庭物品，理清家底，避免重复购置。</text>
    </view>
  </view>
</view>
</template>

<script>
import { CATEGORIES } from '../../utils/categories'
import Storage from '../../utils/storage'
import { isReady, getConfig, setConfig, clearConfig, getLastSyncTime, syncAll } from '../../utils/supabase'

export default {
  data() {
    return {
      stats: { total: 0, totalValue: 0, totalValue_str: '0.00', thisMonth: 0, byCategory: {} },
      catStats: [],
      supabaseReady: false,
      supabaseUrl: '',
      supabaseKey: '',
      supabaseUserId: '',
      syncing: false,
      lastSyncTimeStr: '未同步'
    }
  },
  onShow() { this.loadStats(); this.loadCloudStatus() },
  methods: {
    loadStats() {
      const app = getApp(); app.refreshStats()
      const stats = { ...app.globalData.stats }
      stats.totalValue_str = (stats.totalValue || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      const maxCount = Math.max(...CATEGORIES.map(c => stats.byCategory[c.id] || 0), 1)
      this.stats = stats
      this.catStats = CATEGORIES.map(cat => ({ ...cat, count: stats.byCategory[cat.id] || 0, pct: Math.round(((stats.byCategory[cat.id] || 0) / maxCount) * 100) }))
    },
    loadCloudStatus() {
      const cfg = getConfig()
      this.supabaseReady = isReady()
      if (cfg) { this.supabaseUrl = cfg.url; this.supabaseKey = cfg.key; this.supabaseUserId = cfg.userId }
      const lastSync = getLastSyncTime()
      this.lastSyncTimeStr = lastSync > 0 ? new Date(lastSync).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '未同步'
    },
    onUrlInput(e) { this.supabaseUrl = e.detail.value },
    onKeyInput(e) { this.supabaseKey = e.detail.value },
    onUserIdInput(e) { this.supabaseUserId = e.detail.value },
    connectSupabase() {
      if (!this.supabaseUrl.trim() || !this.supabaseKey.trim()) { uni.showToast({ title: '请填写 URL 和 Key', icon: 'none' }); return }
      setConfig(this.supabaseUrl.trim(), this.supabaseKey.trim(), this.supabaseUserId.trim() || 'default')
      this.supabaseReady = true
      uni.showToast({ title: '已连接', icon: 'success' })
      this.manualSync()
    },
    manualSync() {
      if (!isReady()) { uni.showToast({ title: '云同步未启用', icon: 'none' }); return }
      if (this.syncing) { uni.showToast({ title: '正在同步中…', icon: 'none' }); return }
      this.syncing = true
      const app = getApp()
      syncAll(app.globalData.items, app.globalData.categories, app.globalData.frequency).then(res => {
        if (res.synced) {
          app.globalData.items = res.items; app.globalData.categories = res.categories; app.globalData.frequency = res.frequency; app.globalData.stats = app.calcStats()
          this.loadStats(); this.loadCloudStatus(); uni.showToast({ title: '同步成功', icon: 'success' })
        } else { uni.showToast({ title: '同步失败', icon: 'error' }) }
      }).catch(() => { uni.showToast({ title: '同步异常', icon: 'error' }) }).finally(() => { this.syncing = false })
    },
    disconnectSupabase() {
      uni.showModal({ title: '断开云同步', content: '断开后数据仅保存在本地，不会删除云端已有数据。确认？', confirmColor: '#E05050',
        success: res => { if (res.confirm) { clearConfig(); this.supabaseReady = false; this.lastSyncTimeStr = '未同步'; uni.showToast({ title: '已断开', icon: 'success' }) } }
      })
    },
    goCat(id) { uni.navigateTo({ url: '/pages/category/category?id=' + id }) },
    exportData() {
      const app = getApp(); const items = app.globalData.items; const json = JSON.stringify(items, null, 2)
      // uni-app file export
      const fs = uni.getFileSystemManager()
      const filePath = `${wx.env.USER_DATA_PATH}/family-inventory-${new Date().toISOString().slice(0,10)}.json`
      fs.writeFile({ filePath, data: json, encoding: 'utf8', success: () => { uni.showToast({ title: '导出成功', icon: 'success' }) }, fail: () => { uni.showToast({ title: '导出失败', icon: 'error' }) } })
    },
    importData() {
      uni.chooseMessageFile({ count: 1, type: 'file', extension: ['json'],
        success: res => {
          const file = res.tempFiles[0]
          const fs = uni.getFileSystemManager()
          fs.readFile({ filePath: file.path, encoding: 'utf8', success: data => {
            try {
              const items = JSON.parse(data.data)
              if (Array.isArray(items)) {
                uni.showModal({ title: '确认导入', content: '将导入 ' + items.length + ' 件物品，是否覆盖现有数据？',
                  success: modal => { if (modal.confirm) { Storage.setItems(items); const app = getApp(); app.refreshStats(); this.loadStats(); uni.showToast({ title: '导入成功', icon: 'success' }) } }
                })
              } else { uni.showToast({ title: '文件格式错误', icon: 'error' }) }
            } catch (e) { uni.showToast({ title: 'JSON 解析失败', icon: 'error' }) }
          }})
        }
      })
    },
    clearAll() {
      uni.showModal({ title: '确认清空', content: '确定要删除所有物品数据吗？此操作不可撤销！', confirmColor: '#E05050',
        success: res => { if (res.confirm) {
          uni.showModal({ title: '再次确认', content: '这是最后一次确认，删除后无法恢复！', confirmColor: '#E05050',
            success: r2 => { if (r2.confirm) { Storage.setItems([]); const app = getApp(); app.refreshStats(); this.loadStats(); uni.showToast({ title: '已清空', icon: 'success' }) } }
          })
        }}
      })
    }
  }
}
</script>

<style scoped>
page { background: #FAFAF7; }
.page { min-height: 100vh; padding-bottom: 40rpx; }
.stat-overview { background: #fff; margin: 24rpx; border-radius: 20rpx; padding: 30rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.stat-title { display: block; font-size: 30rpx; font-weight: 700; color: #1A1A18; margin-bottom: 24rpx; }
.stat-grid { display: flex; }
.stat-cell { flex: 1; text-align: center; }
.stat-n { display: block; font-size: 36rpx; font-weight: 800; color: #3D7A5C; margin-bottom: 6rpx; }
.stat-k { display: block; font-size: 22rpx; color: #9E9E8A; }
.section { margin: 24rpx; }
.sec-title { display: block; font-size: 30rpx; font-weight: 700; color: #1A1A18; margin-bottom: 16rpx; }
.cloud-card { background: #fff; border-radius: 20rpx; padding: 28rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.cloud-status { display: flex; align-items: center; margin-bottom: 20rpx; }
.cloud-dot { width: 16rpx; height: 16rpx; border-radius: 50%; margin-right: 10rpx; }
.cloud-dot.online { background: #5BAD5A; }
.cloud-dot.offline { background: #9E9E8A; }
.cloud-status-text { font-size: 28rpx; font-weight: 600; color: #1A1A18; }
.cloud-sync-time { font-size: 24rpx; color: #9E9E8A; margin-left: 16rpx; }
.cloud-config { margin-top: 16rpx; }
.cloud-row { margin-bottom: 16rpx; }
.cloud-label { display: block; font-size: 24rpx; color: #6A6A5A; margin-bottom: 8rpx; font-weight: 600; }
.cloud-input { background: #FAFAF7; border: 1rpx solid #E0DDD5; border-radius: 12rpx; padding: 16rpx 20rpx; font-size: 26rpx; color: #1A1A18; width: 100%; box-sizing: border-box; }
.cloud-actions { display: flex; gap: 12rpx; margin-top: 16rpx; }
.cloud-btn { padding: 16rpx 28rpx; border-radius: 100rpx; text-align: center; font-size: 26rpx; font-weight: 600; }
.cloud-btn.primary { background: #3D7A5C; color: #fff; }
.cloud-btn.danger { border: 1rpx solid #E05050; color: #E05050; }
.cloud-hint { margin-top: 16rpx; }
.cloud-hint-text { font-size: 22rpx; color: #9E9E8A; line-height: 1.6; }
.cat-stats { background: #fff; border-radius: 20rpx; padding: 20rpx 24rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.cat-stat-row { display: flex; align-items: center; padding: 12rpx 0; }
.cs-icon { font-size: 28rpx; margin-right: 12rpx; }
.cs-name { font-size: 26rpx; color: #3A3A30; width: 100rpx; }
.cs-bar-wrap { flex: 1; height: 12rpx; background: #F0EDE6; border-radius: 6rpx; margin: 0 16rpx; overflow: hidden; }
.cs-bar { height: 100%; border-radius: 6rpx; display: block; }
.cs-count { font-size: 24rpx; color: #9E9E8A; font-weight: 600; width: 48rpx; text-align: right; }
.action-list { background: #fff; border-radius: 20rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.action-item { display: flex; align-items: center; padding: 24rpx 28rpx; border-bottom: 1rpx solid #F2F0EB; }
.action-item:last-child { border-bottom: none; }
.ai-icon { font-size: 32rpx; margin-right: 20rpx; }
.ai-body { flex: 1; }
.ai-name { display: block; font-size: 28rpx; font-weight: 600; color: #1A1A18; }
.ai-sub { display: block; font-size: 22rpx; color: #9E9E8A; margin-top: 4rpx; }
.ai-arrow { font-size: 28rpx; color: #C8C4B8; }
.action-item.danger .ai-name { color: #E05050; }
.about-card { background: #fff; border-radius: 20rpx; padding: 30rpx; text-align: center; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.about-name { display: block; font-size: 32rpx; font-weight: 700; color: #1A1A18; margin-bottom: 8rpx; }
.about-ver { display: block; font-size: 24rpx; color: #9E9E8A; margin-bottom: 12rpx; }
.about-desc { display: block; font-size: 26rpx; color: #6A6A5A; line-height: 1.6; }
</style>
