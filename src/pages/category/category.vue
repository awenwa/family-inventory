<template>
<view class="page">
  <view class="cat-header" :style="{background: catColor + '18'}">
    <text class="cat-icon">{{catIcon}}</text>
    <view class="cat-info">
      <text class="cat-name">{{catName}}</text>
      <text class="cat-total">¥{{totalValue_str}}</text>
    </view>
  </view>
  <view v-if="items.length > 0" class="item-list">
    <view v-for="item in items" :key="item.id" class="item-row" @tap="goDetail(item.id)">
      <view class="item-body">
        <text class="item-name">{{item.name}}</text>
        <text class="item-meta">{{item.date_str}} · {{item.specs.brand || ''}}</text>
      </view>
      <text class="item-price">¥{{item.price_str}}</text>
    </view>
  </view>
  <view v-else class="empty">
    <text class="empty-icon">📭</text>
    <text class="empty-text">暂无物品</text>
  </view>
  <view class="fab" @tap="goAdd"><text class="fab-plus">+</text></view>
</view>
</template>

<script>
import { CATEGORIES } from '../../utils/categories'
import { formatDate } from '../../utils/formatters'

export default {
  data() { return { catId: '', catName: '', catIcon: '', catColor: '', items: [], totalValue_str: '0.00' } },
  onLoad(options) {
    const id = options.id || 'other'
    this.catId = id
    const cat = CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
    this.catName = cat.name; this.catIcon = cat.icon; this.catColor = cat.color
    this.loadItems()
  },
  onShow() { this.loadItems() },
  methods: {
    loadItems() {
      const app = getApp()
      const items = app.globalData.items.filter(i => i.category === this.catId).map(item => ({
        ...item, price_str: (parseFloat(item.price) || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), date_str: formatDate(item.purchaseDate)
      })).sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
      const total = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0)
      this.items = items; this.totalValue_str = total.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    goDetail(id) { uni.navigateTo({ url: '/pages/item-detail/item-detail?id=' + id }) },
    goAdd() { uni.navigateTo({ url: '/pages/item-add/item-add' }) }
  }
}
</script>

<style scoped>
page { background: #FAFAF7; }
.page { min-height: 100vh; padding-bottom: 120rpx; }
.cat-header { display: flex; align-items: center; padding: 40rpx; }
.cat-icon { font-size: 80rpx; margin-right: 24rpx; }
.cat-info { flex: 1; }
.cat-name { display: block; font-size: 36rpx; font-weight: 700; color: #1A1A18; }
.cat-total { display: block; font-size: 28rpx; color: #C88A2C; margin-top: 8rpx; }
.item-list { background: #fff; margin: 20rpx 24rpx; border-radius: 20rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.item-row { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 28rpx; border-bottom: 1rpx solid #F2F0EB; }
.item-row:last-child { border-bottom: none; }
.item-body { flex: 1; }
.item-name { display: block; font-size: 28rpx; font-weight: 600; color: #1A1A18; margin-bottom: 4rpx; }
.item-meta { display: block; font-size: 22rpx; color: #9E9E8A; }
.item-price { font-size: 28rpx; font-weight: 700; color: #C88A2C; }
.empty { text-align: center; padding: 120rpx 40rpx; }
.empty-icon { display: block; font-size: 80rpx; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: #9E9E8A; }
.fab { position: fixed; bottom: 180rpx; right: 40rpx; width: 112rpx; height: 112rpx; background: linear-gradient(135deg, #3D7A5C, #5A9A7A); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8rpx 32rpx rgba(61,122,92,0.45); z-index: 100; }
.fab-plus { font-size: 56rpx; color: #fff; font-weight: 300; }
</style>
