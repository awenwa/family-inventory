<template>
<view class="page">
  <view class="cat-bar-wrap">
    <view class="cat-bar">
      <scroll-view scroll-x class="cat-scroll" :scroll-into-view="'cat-' + activeCat" scroll-with-animation>
        <view
          v-for="cat in categories" :key="cat.id"
          :id="'cat-' + cat.id"
          class="cat-tab" :class="{active: activeCat === cat.id}"
          :style="activeCat === cat.id ? 'background:' + cat.color + ';color:#fff;border-color:' + cat.color : ''"
          @tap="switchCat(cat.id)"
        >
          <text>{{cat.icon}}</text>
          <text class="tab-name">{{cat.name}}</text>
        </view>
      </scroll-view>
    </view>
    <view class="manage-btn" @tap="goManage"><text>管理</text></view>
  </view>

  <view class="list-area">
    <view class="toolbar">
      <text class="toolbar-count">{{displayItems.length}} 件物品</text>
      <view class="sort-group">
        <text class="sort-label">排序:</text>
        <text v-for="opt in sortOptions" :key="opt.key"
          class="sort-btn" :class="{'sort-active': sortKey === opt.key}"
          @tap="setSort(opt.key)">{{opt.label}}</text>
      </view>
    </view>

    <view v-if="displayItems.length > 0" class="grid">
      <view v-for="item in displayItems" :key="item.id" class="grid-item" @tap="goDetail(item.id)">
        <view class="card">
          <view class="card-top" :style="{background: item.category_color + '18'}">
            <text class="card-emoji">{{item.category_icon}}</text>
            <view class="card-tags">
              <text v-for="tag in item.tags" :key="tag" class="tag">{{tag}}</text>
            </view>
          </view>
          <view class="card-body">
            <text class="card-name">{{item.name}}</text>
            <view class="card-meta">
              <text class="card-color">{{item.specs.color || ''}}</text>
              <text v-if="item.specs.color && item.specs.model" class="card-dot">·</text>
              <text class="card-model">{{item.specs.model || ''}}</text>
            </view>
            <view class="card-footer">
              <text class="card-price">¥{{item.price_str}}</text>
              <text class="card-date">{{item.dateDiff}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty">
      <text class="empty-icon">📭</text>
      <text class="empty-t">该分类下暂无物品</text>
      <text class="empty-sub">点击右下角按钮添加</text>
    </view>
  </view>

  <view class="fab" @tap="goAdd"><text class="fab-plus">+</text></view>
</view>
</template>

<script>
import { CATEGORIES } from '../../utils/categories'
import { dateDiff } from '../../utils/formatters'

export default {
  data() {
    const cats = CATEGORIES.map(c => ({ ...c, count: 0 }))
    return {
      categories: [{ id: 'all', name: '全部', icon: '📦', color: '#7A7A6A', count: 0 }, ...cats],
      activeCat: 'all',
      displayItems: [],
      sortKey: 'date',
      sortOptions: [
        { key: 'date', label: '时间' },
        { key: 'price', label: '价格' },
        { key: 'name', label: '名称' }
      ]
    }
  },
  onShow() { this.loadData() },
  methods: {
    loadData() {
      const app = getApp()
      app.refreshStats()
      const items = app.globalData.items
      const stats = app.globalData.stats
      const cats = this.categories.map(c => {
        if (c.id === 'all') return { ...c, count: items.length }
        return { ...c, count: stats.byCategory[c.id] || 0 }
      })
      this.categories = cats
      this.filterAndSort()
    },
    switchCat(id) { this.activeCat = id; this.filterAndSort() },
    setSort(key) { this.sortKey = key; this.filterAndSort() },
    filterAndSort() {
      const { activeCat, sortKey } = this
      const app = getApp()
      const items = app.globalData.items
      const categories = CATEGORIES
      let filtered = activeCat === 'all' ? [...items] : items.filter(i => i.category === activeCat)
      filtered = filtered.map(item => {
        const cat = categories.find(c => c.id === item.category) || categories[categories.length - 1]
        return {
          ...item, category_name: cat.name, category_icon: cat.icon, category_color: cat.color,
          dateDiff: dateDiff(item.purchaseDate),
          price_str: (parseFloat(item.price) || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
      })
      if (sortKey === 'date') filtered.sort((a, b) => { const da = a.purchaseDate ? new Date(a.purchaseDate) : 0; const db = b.purchaseDate ? new Date(b.purchaseDate) : 0; return db - da })
      else if (sortKey === 'price') filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))
      else if (sortKey === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name, 'zh'))
      this.displayItems = filtered
    },
    goDetail(id) { uni.navigateTo({ url: '/pages/item-detail/item-detail?id=' + id }) },
    goAdd() { uni.navigateTo({ url: '/pages/item-add/item-add' }) },
    goManage() { uni.navigateTo({ url: '/pages/category-manage/category-manage' }) }
  }
}
</script>

<style scoped>
page { background: #FAFAF7; }
.page { min-height: 100vh; padding-bottom: 120rpx; }
.cat-bar-wrap { background: #fff; border-bottom: 1rpx solid #F0EDE6; position: sticky; top: 0; z-index: 10; display: flex; align-items: center; }
.cat-bar { flex: 1; padding: 20rpx 0 16rpx; min-width: 0; background: #fff; }
.manage-btn { padding: 20rpx 28rpx; font-size: 28rpx; color: #3D7A5C; font-weight: 700; flex-shrink: 0; border-left: 1rpx solid #F0EDE6; }
.cat-scroll { white-space: nowrap; padding: 0 20rpx; }
.cat-tab { display: inline-flex; align-items: center; gap: 6rpx; padding: 10rpx 22rpx; border-radius: 100rpx; margin: 0 6rpx; font-size: 26rpx; color: #6A6A5A; border: 1rpx solid #E8E5DC; background: #fff; white-space: nowrap; }
.cat-tab.active { font-weight: 600; }
.tab-name { font-size: 26rpx; }
.toolbar { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 30rpx 16rpx; }
.toolbar-count { font-size: 26rpx; color: #9E9E8A; }
.sort-group { display: flex; align-items: center; gap: 16rpx; }
.sort-label { font-size: 24rpx; color: #9E9E8A; }
.sort-btn { font-size: 24rpx; color: #9E9E8A; padding: 4rpx 12rpx; border-radius: 8rpx; }
.sort-active { color: #3D7A5C; font-weight: 600; }
.grid { padding: 0 20rpx; display: flex; flex-wrap: wrap; gap: 20rpx; }
.grid-item { width: calc(50% - 10rpx); }
.card { background: #fff; border-radius: 20rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05); }
.card-top { height: 140rpx; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 20rpx; }
.card-emoji { font-size: 60rpx; line-height: 1; }
.card-tags { display: flex; flex-wrap: wrap; gap: 6rpx; justify-content: center; margin-top: 8rpx; }
.tag { font-size: 18rpx; color: #7A7A6A; background: rgba(0,0,0,0.06); padding: 2rpx 10rpx; border-radius: 100rpx; }
.card-body { padding: 20rpx; }
.card-name { display: block; font-size: 28rpx; font-weight: 600; color: #1A1A18; margin-bottom: 8rpx; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-meta { display: flex; align-items: center; margin-bottom: 12rpx; }
.card-color, .card-model { font-size: 22rpx; color: #9E9E8A; }
.card-dot { font-size: 22rpx; color: #C8C4B8; margin: 0 4rpx; }
.card-footer { display: flex; justify-content: space-between; align-items: center; }
.card-price { font-size: 28rpx; font-weight: 700; color: #C88A2C; }
.card-date { font-size: 22rpx; color: #9E9E8A; }
.empty { text-align: center; padding: 120rpx 40rpx; }
.empty-icon { display: block; font-size: 100rpx; margin-bottom: 24rpx; }
.empty-t { display: block; font-size: 30rpx; font-weight: 600; color: #3A3A30; margin-bottom: 12rpx; }
.empty-sub { display: block; font-size: 26rpx; color: #9E9E8A; }
.fab { position: fixed; bottom: 180rpx; right: 40rpx; width: 112rpx; height: 112rpx; background: linear-gradient(135deg, #3D7A5C, #5A9A7A); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 32rpx rgba(61,122,92,0.45); z-index: 100; }
.fab-plus { font-size: 56rpx; color: #fff; font-weight: 300; line-height: 1; }
</style>
