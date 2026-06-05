<template>
<view class="page">
  <view class="search-box">
    <view class="search-inner">
      <text class="search-icon">🔍</text>
      <input class="search-input" placeholder="搜索物品名称、标签、品牌…" placeholder-class="search-placeholder" :value="keyword" @input="onInput" @confirm="doSearch" confirm-type="search" focus="true" />
      <text v-if="keyword" class="search-clear" @tap="clearSearch">✕</text>
    </view>
  </view>

  <view v-if="keyword" class="result-area">
    <view v-if="results.length > 0" class="result-list">
      <view v-for="item in results" :key="item.id" class="result-item" @tap="goDetail(item.id)">
        <view class="result-icon" :style="{background: item.category_color + '22'}">
          <text>{{item.category_icon}}</text>
        </view>
        <view class="result-body">
          <view class="result-name-row">
            <text class="result-name">{{item.name}}</text>
            <text class="result-price">¥{{item.price_str}}</text>
          </view>
          <view class="result-meta">
            <text>{{item.category_name}}</text>
            <text class="dot">·</text>
            <text>{{item.specs.brand || ''}}</text>
          </view>
          <view v-if="item.tags.length > 0" class="result-tags">
            <text v-for="tag in item.tags" :key="tag" class="result-tag">{{tag}}</text>
          </view>
        </view>
        <text class="result-arrow">›</text>
      </view>
    </view>
    <view v-else class="no-result">
      <text class="no-icon">🔭</text>
      <text class="no-t">没有找到 "{{keyword}}"</text>
      <text class="no-sub">换个关键词试试</text>
    </view>
  </view>

  <view v-if="!keyword" class="hot-area">
    <view class="section">
      <text class="sec-title">热门分类</text>
      <view class="hot-cats">
        <view v-for="cat in categories" :key="cat.id" class="hot-cat" :style="{background: cat.color + '18', borderColor: cat.color + '44'}" @tap="goCategory(cat.id)">
          <text class="hot-cat-icon">{{cat.icon}}</text>
          <text class="hot-cat-name">{{cat.name}}</text>
        </view>
      </view>
    </view>
    <view v-if="history.length > 0" class="section">
      <view class="sec-header">
        <text class="sec-title">搜索历史</text>
        <text class="sec-clear" @tap="clearHistory">清除</text>
      </view>
      <view class="history-tags">
        <text v-for="h in history" :key="h" class="history-tag" @tap="useHistory(h)">{{h}}</text>
      </view>
    </view>
    <view class="section">
      <text class="sec-title">全部物品</text>
    </view>
    <view class="quick-grid">
      <view v-for="item in recentItems" :key="item.id" class="quick-card" @tap="goDetail(item.id)">
        <text class="quick-emoji">{{item.category_icon}}</text>
        <text class="quick-name">{{item.name}}</text>
      </view>
    </view>
  </view>
</view>
</template>

<script>
import { CATEGORIES } from '../../utils/categories'

export default {
  data() {
    return {
      keyword: '',
      results: [],
      history: [],
      categories: CATEGORIES.slice(0, 6),
      recentItems: [],
      loading: false
    }
  },
  onLoad() {
    const history = uni.getStorageSync('search_history') || []
    this.history = history.slice(0, 10)
    this.loadRecent()
  },
  onShow() { this.loadRecent() },
  methods: {
    loadRecent() {
      const app = getApp()
      const items = app.globalData.items.slice(0, 20).map(item => {
        const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1]
        return { ...item, category_icon: cat.icon, category_color: cat.color, category_name: cat.name }
      })
      this.recentItems = items
    },
    onInput(e) {
      this.keyword = e.detail.value
      if (e.detail.value.length > 0) this.doSearch()
      else this.results = []
    },
    doSearch() {
      const kw = this.keyword.trim().toLowerCase()
      if (!kw) return
      let history = [kw, ...this.history.filter(h => h !== kw)].slice(0, 10)
      uni.setStorageSync('search_history', history)
      this.history = history
      const app = getApp()
      const items = app.globalData.items
      const results = items.filter(item => {
        const name = (item.name || '').toLowerCase()
        const brandModel = (item.brandModel || '').toLowerCase()
        const specs = item.specs || {}
        const tags = (item.tags || []).join(' ').toLowerCase()
        const channel = (item.channel || '').toLowerCase()
        const remark = (item.remark || '').toLowerCase()
        return name.includes(kw) || brandModel.includes(kw) || tags.includes(kw) || channel.includes(kw) || remark.includes(kw) || (specs.brand || '').toLowerCase().includes(kw) || (specs.model || '').toLowerCase().includes(kw)
      }).map(item => {
        const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1]
        return { ...item, category_name: cat.name, category_icon: cat.icon, category_color: cat.color, price_str: (parseFloat(item.price) || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
      })
      this.results = results
    },
    clearSearch() { this.keyword = ''; this.results = [] },
    clearHistory() { uni.removeStorageSync('search_history'); this.history = [] },
    useHistory(word) { this.keyword = word; this.doSearch() },
    goDetail(id) { uni.navigateTo({ url: '/pages/item-detail/item-detail?id=' + id }) },
    goCategory(id) { uni.navigateTo({ url: '/pages/category/category?id=' + id }) }
  }
}
</script>

<style scoped>
page { background: #FAFAF7; }
.page { min-height: 100vh; }
.search-box { padding: 16rpx 24rpx; background: #fff; border-bottom: 1rpx solid #F0EDE6; display: flex; align-items: center; }
.search-inner { flex: 1; display: flex; align-items: center; background: #F2F0EB; border-radius: 100rpx; padding: 14rpx 24rpx; }
.search-icon { font-size: 28rpx; margin-right: 10rpx; }
.search-input { flex: 1; font-size: 28rpx; color: #1A1A18; }
.search-placeholder { color: #B8B4A8; }
.search-clear { font-size: 28rpx; color: #9E9E8A; padding: 0 10rpx; }
.result-area { padding: 20rpx 24rpx; }
.result-list { background: #fff; border-radius: 20rpx; overflow: hidden; }
.result-item { display: flex; align-items: center; padding: 24rpx; border-bottom: 1rpx solid #F2F0EB; }
.result-item:last-child { border-bottom: none; }
.result-icon { width: 80rpx; height: 80rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center; margin-right: 20rpx; font-size: 36rpx; flex-shrink: 0; }
.result-body { flex: 1; overflow: hidden; }
.result-name-row { display: flex; justify-content: space-between; align-items: center; }
.result-name { font-size: 28rpx; font-weight: 600; color: #1A1A18; }
.result-price { font-size: 26rpx; font-weight: 600; color: #C88A2C; }
.result-meta { font-size: 22rpx; color: #9E9E8A; margin-top: 4rpx; }
.dot { margin: 0 4rpx; }
.result-tags { display: flex; flex-wrap: wrap; gap: 6rpx; margin-top: 8rpx; }
.result-tag { font-size: 20rpx; color: #7A7A6A; background: #F0EDE6; padding: 2rpx 10rpx; border-radius: 100rpx; }
.result-arrow { font-size: 28rpx; color: #C8C4B8; margin-left: 12rpx; }
.no-result { text-align: center; padding: 120rpx 40rpx; }
.no-icon { display: block; font-size: 100rpx; margin-bottom: 24rpx; }
.no-t { display: block; font-size: 30rpx; font-weight: 600; color: #3A3A30; margin-bottom: 12rpx; }
.no-sub { display: block; font-size: 26rpx; color: #9E9E8A; }
.hot-area { padding: 20rpx 24rpx; }
.section { margin-bottom: 32rpx; }
.sec-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.sec-title { display: block; font-size: 28rpx; font-weight: 700; color: #1A1A18; margin-bottom: 16rpx; }
.sec-clear { font-size: 26rpx; color: #9E9E8A; }
.hot-cats { display: flex; flex-wrap: wrap; gap: 12rpx; }
.hot-cat { display: flex; align-items: center; gap: 8rpx; padding: 14rpx 22rpx; border-radius: 100rpx; border: 1rpx solid; }
.hot-cat-icon { font-size: 28rpx; }
.hot-cat-name { font-size: 26rpx; color: #3A3A30; font-weight: 500; }
.history-tags { display: flex; flex-wrap: wrap; gap: 10rpx; }
.history-tag { font-size: 24rpx; color: #6A6A5A; background: #F2F0EB; padding: 10rpx 20rpx; border-radius: 100rpx; }
.quick-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.quick-card { display: flex; align-items: center; gap: 12rpx; width: calc(50% - 8rpx); background: #fff; border-radius: 16rpx; padding: 20rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.quick-emoji { font-size: 36rpx; }
.quick-name { font-size: 26rpx; color: #1A1A18; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
