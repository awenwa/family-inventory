<template>
<view class="page" v-if="item">
  <view class="detail-header" :style="{background: item.category_color + '18'}">
    <view class="header-icon">{{item.category_icon}}</view>
    <view class="header-info">
      <text class="header-name">{{item.name}}</text>
      <text class="header-cat">{{item.category_name}}</text>
    </view>
    <view class="header-edit" @tap="goEdit"><text>编辑</text></view>
  </view>

  <view class="price-card">
    <view class="price-main"><text class="price-label">购买价格</text><text class="price-val">¥{{price_str}}</text></view>
    <view class="price-sep"></view>
    <view class="price-main"><text class="price-label">购买日期</text><text class="price-val date">{{date_str}}</text></view>
    <view class="price-sep"></view>
    <view class="price-main"><text class="price-label">已持有</text><text class="price-val highlight">{{age}}</text></view>
  </view>

  <view class="info-group">
    <text class="group-title">📝 规格参数</text>
    <view class="info-list">
      <view v-if="item.brandDisplay" class="info-row"><text class="info-key">品牌型号</text><text class="info-val">{{item.brandDisplay}}</text></view>
      <view v-if="item.specs.color" class="info-row"><text class="info-key">颜色</text><text class="info-val">{{item.specs.color}}</text></view>
      <view v-if="item.specs.dimension" class="info-row"><text class="info-key">尺寸/容量</text><text class="info-val">{{item.specs.dimension}}</text></view>
      <view v-if="item.specs.weight" class="info-row"><text class="info-key">重量</text><text class="info-val">{{item.specs.weight}}</text></view>
      <view v-if="item.specs.material" class="info-row"><text class="info-key">材质/面料</text><text class="info-val">{{item.specs.material}}</text></view>
      <view v-if="item.clothesSize" class="info-row"><text class="info-key">尺码</text><text class="info-val">{{item.clothesSize}}</text></view>
      <view v-if="item.shoesSize" class="info-row"><text class="info-key">鞋码</text><text class="info-val">{{item.shoesSize}}</text></view>
      <view v-if="!item.brandDisplay && !item.specs.color && !item.specs.dimension && !item.specs.weight && !item.specs.material && !item.clothesSize && !item.shoesSize" class="info-empty"><text>暂无规格参数</text></view>
    </view>
  </view>

  <view class="info-group">
    <text class="group-title">🛒 购买信息</text>
    <view class="info-list">
      <view class="info-row"><text class="info-key">购买渠道</text><text class="info-val">{{item.channel || '未记录'}}</text></view>
    </view>
  </view>

  <view v-if="item.remark" class="info-group">
    <text class="group-title">💬 备注</text>
    <view class="remark-card">{{item.remark}}</view>
  </view>

  <view v-if="item.tags && item.tags.length > 0" class="info-group">
    <text class="group-title">🏷️ 标签</text>
    <view class="tag-row">
      <text v-for="tag in item.tags" :key="tag" class="tag-chip">{{tag}}</text>
    </view>
  </view>

  <view class="bottom-actions">
    <view class="action-btn danger" @tap="deleteItem"><text>🗑 删除此物品</text></view>
  </view>
</view>
</template>

<script>
import { getCategoryById } from '../../utils/categories'
import Storage from '../../utils/storage'
import { formatDate } from '../../utils/formatters'

export default {
  data() {
    return { item: null, price_str: '', date_str: '', age: '' }
  },
  onLoad(options) { this.loadItem(options.id) },
  onShow() { if (this.item) this.loadItem(this.item.id) },
  methods: {
    loadItem(id) {
      const app = getApp()
      const items = app.globalData.items
      const item = items.find(i => i.id === id)
      if (!item) { uni.showToast({ title: '物品不存在', icon: 'error' }); setTimeout(() => uni.navigateBack(), 1000); return }
      const cat = getCategoryById(item.category)
      const price = parseFloat(item.price) || 0
      const specs = item.specs || {}
      const brandDisplay = item.brandModel || [specs.brand, specs.model].filter(Boolean).join(' ') || ''
      this.item = { ...item, category_name: cat.name, category_icon: cat.icon, category_color: cat.color, brandDisplay, specs }
      this.price_str = price.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      this.date_str = formatDate(item.purchaseDate)
      this.age = this.calcAge(item.purchaseDate)
    },
    calcAge(dateStr) {
      if (!dateStr) return '未知'
      const d = new Date(dateStr); const now = new Date(); const diff = now - d; const days = Math.floor(diff / (1000*60*60*24))
      if (days < 1) return '今天'; if (days < 7) return days + '天'; if (days < 30) return Math.floor(days/7) + '周'; if (days < 365) return Math.floor(days/30) + '个月'
      const y = Math.floor(days/365); const m = Math.floor((days%365)/30); return m > 0 ? y + '年' + m + '月' : y + '年'
    },
    goEdit() { uni.navigateTo({ url: '/pages/item-add/item-add?editId=' + this.item.id }) },
    deleteItem() {
      uni.showModal({ title: '确认删除', content: '确定要删除「' + this.item.name + '」吗？此操作不可撤销。', confirmColor: '#E05050', success: res => {
        if (res.confirm) {
          const app = getApp(); let items = app.globalData.items; const delId = this.item.id
          items = items.filter(i => i.id !== delId); Storage.setItems(items); app.refreshStats()
          uni.showToast({ title: '已删除', icon: 'success' }); setTimeout(() => uni.navigateBack(), 1000)
        }
      }})
    }
  }
}
</script>

<style scoped>
page { background: #FAFAF7; }
.page { min-height: 100vh; padding-bottom: 120rpx; }
.detail-header { display: flex; align-items: center; padding: 40rpx; }
.header-icon { font-size: 80rpx; margin-right: 24rpx; }
.header-info { flex: 1; }
.header-name { display: block; font-size: 36rpx; font-weight: 700; color: #1A1A18; margin-bottom: 8rpx; }
.header-cat { display: block; font-size: 26rpx; color: #9E9E8A; }
.header-edit { padding: 12rpx 24rpx; background: #3D7A5C; color: #fff; border-radius: 100rpx; font-size: 26rpx; font-weight: 600; }
.price-card { display: flex; background: #fff; border-radius: 20rpx; padding: 28rpx; margin: 24rpx 30rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.price-main { flex: 1; text-align: center; }
.price-label { display: block; font-size: 22rpx; color: #9E9E8A; margin-bottom: 8rpx; }
.price-val { display: block; font-size: 32rpx; font-weight: 700; color: #1A1A18; }
.price-val.date { font-size: 26rpx; }
.price-val.highlight { color: #3D7A5C; }
.price-sep { width: 1rpx; background: #F0EDE6; margin: 0 16rpx; }
.info-group { margin: 0 30rpx 24rpx; }
.group-title { display: block; font-size: 28rpx; font-weight: 700; color: #1A1A18; margin-bottom: 16rpx; }
.info-list { background: #fff; border-radius: 20rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 22rpx 28rpx; border-bottom: 1rpx solid #F2F0EB; }
.info-row:last-child { border-bottom: none; }
.info-key { font-size: 26rpx; color: #9E9E8A; }
.info-val { font-size: 26rpx; color: #1A1A18; font-weight: 500; text-align: right; max-width: 60%; }
.info-empty { padding: 30rpx; text-align: center; color: #9E9E8A; font-size: 26rpx; }
.remark-card { background: #fff; border-radius: 20rpx; padding: 24rpx 28rpx; font-size: 28rpx; color: #3A3A30; line-height: 1.6; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04); }
.tag-row { display: flex; flex-wrap: wrap; gap: 10rpx; }
.tag-chip { font-size: 24rpx; color: #7A7A6A; background: #F0EDE6; padding: 8rpx 18rpx; border-radius: 100rpx; }
.bottom-actions { padding: 40rpx 30rpx; }
.action-btn { padding: 24rpx; border-radius: 100rpx; text-align: center; font-size: 28rpx; font-weight: 600; }
.action-btn.danger { color: #E05050; border: 1rpx solid #E05050; }
</style>
