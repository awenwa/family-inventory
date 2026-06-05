<template>
<view class="page">
  <!-- 顶部欢迎 -->
  <view class="hero">
    <view class="hero-inner">
      <text class="hero-date">{{today}}</text>
      <text class="hero-greeting">{{greeting}}</text>
      <text class="hero-sub">记录生活，理清家底</text>
    </view>
    <view class="hero-wave"></view>
  </view>

  <!-- 统计卡片 -->
  <view class="stats-row">
    <view class="stat-card primary" @tap="goBrowse">
      <text class="stat-num">{{stats.total}}</text>
      <text class="stat-label">件物品</text>
      <view class="stat-icon">📦</view>
    </view>
    <view class="stat-card accent" @tap="goBrowse">
      <text class="stat-num">¥{{stats.totalValue_str}}</text>
      <text class="stat-label">总价值</text>
      <view class="stat-icon">💰</view>
    </view>
    <view class="stat-card secondary" @tap="goBrowse">
      <text class="stat-num">{{stats.thisMonth}}</text>
      <text class="stat-label">本月新增</text>
      <view class="stat-icon">📆</view>
    </view>
  </view>

  <!-- 最近添加 -->
  <view class="section">
    <view class="section-header">
      <text class="section-title">最近添加</text>
      <text class="section-more" @tap="goBrowse">查看全部 ›</text>
    </view>

    <view v-if="recentItems.length > 0" class="item-list">
      <view 
        v-for="item in recentItems" 
        :key="item.id" 
        class="item-row"
        @tap="goDetail(item.id)"
      >
        <view class="item-icon-wrap" :style="{background: item.category_color + '22'}">
          <text class="item-icon">{{item.category_icon}}</text>
        </view>
        <view class="item-info">
          <text class="item-name">{{item.name}}</text>
          <text class="item-meta">{{item.category_name}} · {{item.dateDiff}}</text>
        </view>
        <view class="item-right">
          <text class="item-price">¥{{item.price_str}}</text>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">🏠</text>
      <text class="empty-text">还没有物品\n点击下方按钮添加第一件</text>
    </view>
  </view>

  <!-- 分类概览 -->
  <view class="section">
    <view class="section-header">
      <text class="section-title">分类概览</text>
      <text class="section-more" @tap="goBrowse">全部分类 ›</text>
    </view>
    <view class="category-grid">
      <view 
        v-for="cat in categories" 
        :key="cat.id" 
        class="category-chip"
        :style="{background: cat.color + '18', borderColor: cat.color + '44'}"
        @tap="goCategory(cat.id)"
      >
        <text class="chip-icon">{{cat.icon}}</text>
        <text class="chip-name">{{cat.name}}</text>
        <text class="chip-count" :style="{color: cat.color}">{{cat.count || 0}}</text>
      </view>
    </view>
  </view>

  <!-- 底部浮动按钮 -->
  <view class="fab" @tap="goAdd">
    <text class="fab-plus">+</text>
  </view>
</view>
</template>

<script>
import { CATEGORIES } from '../../utils/categories'
import { dateDiff } from '../../utils/formatters'
import Storage from '../../utils/storage'

export default {
  data() {
    return {
      stats: { total: 0, totalValue: 0, totalValue_str: '0.00', thisMonth: 0 },
      recentItems: [],
      categories: [],
      today: '',
      greeting: ''
    }
  },

  onLoad() {
    this.initGreeting()
  },

  onShow() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData()
    uni.stopPullDownRefresh()
  },

  methods: {
    initGreeting() {
      const now = new Date()
      const h = now.getHours()
      const date = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
      let greeting = '晚上好'
      if (h >= 5 && h < 12) greeting = '早上好'
      else if (h >= 12 && h < 18) greeting = '下午好'
      this.today = date
      this.greeting = greeting
    },

    loadData() {
      const app = getApp()
      app.refreshStats()

      const items = app.globalData.items
      const stats = { ...app.globalData.stats }
      const categories = CATEGORIES

      stats.totalValue_str = (stats.totalValue || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })

      const recent = [...items]
        .sort((a, b) => {
          const da = a.purchaseDate ? new Date(a.purchaseDate) : 0
          const db = b.purchaseDate ? new Date(b.purchaseDate) : 0
          return db - da
        })
        .slice(0, 5)
        .map(item => {
          const cat = categories.find(c => c.id === item.category) || categories[categories.length - 1]
          return {
            ...item,
            category_name: cat.name,
            category_icon: cat.icon,
            category_color: cat.color,
            dateDiff: dateDiff(item.purchaseDate),
            price_str: (parseFloat(item.price) || 0).toLocaleString('zh-CN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          }
        })

      const catsWithCount = categories.map(cat => ({
        ...cat,
        count: items.filter(i => i.category === cat.id).length
      }))

      this.stats = stats
      this.recentItems = recent
      this.categories = catsWithCount
    },

    goAdd() {
      uni.navigateTo({ url: '/pages/item-add/item-add' })
    },

    goDetail(id) {
      uni.navigateTo({ url: `/pages/item-detail/item-detail?id=${id}` })
    },

    goBrowse() {
      uni.switchTab({ url: '/pages/browse/browse' })
    },

    goCategory(id) {
      uni.navigateTo({ url: `/pages/category/category?id=${id}` })
    }
  }
}
</script>

<style scoped>
page { background: #FAFAF7; font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; }
.page { min-height: 100vh; padding-bottom: 120rpx; }

.hero { background: linear-gradient(145deg, #3D7A5C 0%, #5A9A7A 50%, #7ABA9A 100%); padding: 60rpx 40rpx 80rpx; position: relative; overflow: hidden; }
.hero-inner { position: relative; z-index: 1; }
.hero-date { display: block; font-size: 24rpx; color: rgba(255,255,255,0.7); margin-bottom: 8rpx; letter-spacing: 1rpx; }
.hero-greeting { display: block; font-size: 52rpx; font-weight: 700; color: #fff; letter-spacing: -0.5rpx; margin-bottom: 12rpx; }
.hero-sub { display: block; font-size: 26rpx; color: rgba(255,255,255,0.65); }
.hero-wave { position: absolute; bottom: -2rpx; left: 0; right: 0; height: 40rpx; background: #FAFAF7; border-radius: 50% 50% 0 0; }

.stats-row { display: flex; gap: 20rpx; padding: 0 30rpx; margin-top: -30rpx; position: relative; z-index: 2; }
.stat-card { flex: 1; background: #fff; border-radius: 20rpx; padding: 28rpx 20rpx 24rpx; text-align: center; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.06); position: relative; overflow: hidden; }
.stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4rpx; }
.primary::before { background: #3D7A5C; }
.accent::before { background: #E8A84C; }
.secondary::before { background: #7EB8D4; }
.stat-num { display: block; font-size: 40rpx; font-weight: 800; color: #1A1A18; margin-bottom: 6rpx; line-height: 1.1; }
.primary .stat-num { color: #3D7A5C; }
.accent .stat-num { color: #C88A2C; }
.secondary .stat-num { color: #5A8AAA; }
.stat-label { display: block; font-size: 22rpx; color: #9E9E8A; }
.stat-icon { position: absolute; right: 16rpx; bottom: 16rpx; font-size: 40rpx; opacity: 0.12; }

.section { padding: 40rpx 30rpx 0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.section-title { font-size: 32rpx; font-weight: 700; color: #1A1A18; }
.section-more { font-size: 26rpx; color: #3D7A5C; }

.item-list { background: #fff; border-radius: 20rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.item-row { display: flex; align-items: center; padding: 28rpx; border-bottom: 1rpx solid #F2F0EB; }
.item-row:last-child { border-bottom: none; }
.item-icon-wrap { width: 88rpx; height: 88rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 24rpx; }
.item-icon { font-size: 40rpx; }
.item-info { flex: 1; overflow: hidden; }
.item-name { display: block; font-size: 30rpx; font-weight: 600; color: #1A1A18; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6rpx; }
.item-meta { display: block; font-size: 24rpx; color: #9E9E8A; }
.item-right { display: flex; align-items: center; flex-shrink: 0; margin-left: 16rpx; }
.item-price { font-size: 28rpx; font-weight: 600; color: #C88A2C; margin-right: 8rpx; }
.item-arrow { font-size: 28rpx; color: #C8C4B8; }

.empty-state { background: #fff; border-radius: 20rpx; padding: 60rpx 40rpx; text-align: center; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.empty-icon { display: block; font-size: 80rpx; margin-bottom: 20rpx; }
.empty-text { display: block; font-size: 28rpx; color: #9E9E8A; line-height: 1.8; }

.category-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.category-chip { display: flex; align-items: center; padding: 16rpx 24rpx; border-radius: 100rpx; border: 1rpx solid; gap: 8rpx; }
.chip-icon { font-size: 28rpx; }
.chip-name { font-size: 26rpx; color: #3A3A30; font-weight: 500; }
.chip-count { font-size: 22rpx; font-weight: 700; margin-left: 4rpx; }

.fab { position: fixed; bottom: 180rpx; right: 40rpx; width: 112rpx; height: 112rpx; background: linear-gradient(135deg, #3D7A5C, #5A9A7A); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 32rpx rgba(61, 122, 92, 0.45); z-index: 100; }
.fab-plus { font-size: 56rpx; color: #fff; font-weight: 300; line-height: 1; }
</style>
