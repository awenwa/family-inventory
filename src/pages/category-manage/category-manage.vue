<template>
<view class="page">
  <view class="page-header">
    <text class="page-title">分类管理</text>
    <text class="page-sub">可添加、删除自定义分类</text>
  </view>
  <view class="cat-list">
    <view v-for="cat in categories" :key="cat.id" class="cat-item">
      <view class="cat-left" @tap="editCat(cat.id)">
        <view class="cat-icon-wrap" :style="{background: cat.color + '30'}">
          <text class="cat-icon">{{cat.icon}}</text>
        </view>
        <view class="cat-info">
          <text class="cat-name">{{cat.name}}</text>
          <text class="cat-meta">{{cat.count || 0}} 件物品</text>
        </view>
      </view>
      <view class="cat-actions">
        <view class="act-btn" @tap="editCat(cat.id)"><text>编辑</text></view>
        <view class="act-btn danger" @tap="deleteCat(cat.id, cat.name, cat.count || 0)"><text>删除</text></view>
      </view>
    </view>
  </view>
  <view class="add-cat-btn" @tap="addCat">
    <text class="add-icon">+</text>
    <text class="add-text">添加新分类</text>
  </view>
</view>
</template>

<script>
import Storage from '../../utils/storage'

export default {
  data() { return { categories: [] } },
  onShow() { this.loadCategories() },
  methods: {
    loadCategories() {
      const app = getApp()
      const cats = Storage.getCategories()
      const stats = app.globalData.stats || {}
      this.categories = cats.map(c => ({ ...c, count: stats.byCategory ? (stats.byCategory[c.id] || 0) : 0 }))
    },
    addCat() {
      const icons = ['👕','📱','🛋️','🍳','📚','⚽','💄','🎮','🧸','📦','🎁','🌿']
      const colors = ['#E8B4B8','#7EB8D4','#B8C9A3','#E8C49A','#A8C4D4','#7AC4A8','#D4A8C8','#C4A8E8','#E8D49A','#C8C4B8']
      uni.showActionSheet({
        itemList: icons,
        success: iconRes => {
          const selectedIcon = icons[iconRes.tapIndex]
          uni.showActionSheet({
            itemList: colors.map(c => '颜色 ' + c),
            success: colorRes => {
              const selectedColor = colors[colorRes.tapIndex]
              // uni-app doesn't support editable modal, use prompt workaround
              uni.showModal({ title: '添加分类', editable: true, placeholderText: '分类名称',
                success: res => {
                  if (!res.confirm || !res.content || !res.content.trim()) return
                  const name = res.content.trim()
                  const newCat = { id: 'custom_' + Date.now(), name, icon: selectedIcon, color: selectedColor }
                  let cats = Storage.getCategories(); cats.push(newCat); Storage.setCategories(cats)
                  const app = getApp(); app.globalData.categories = cats; app.refreshStats()
                  this.loadCategories(); uni.showToast({ title: '已添加', icon: 'success' })
                }
              })
            }
          })
        }
      })
    },
    editCat(id) {
      const cat = this.categories.find(c => c.id === id)
      if (!cat) return
      uni.showModal({ title: '编辑分类', editable: true, placeholderText: '新名称', content: cat.name,
        success: res => {
          if (!res.confirm || !res.content || !res.content.trim()) return
          let cats = Storage.getCategories()
          cats = cats.map(c => c.id === id ? { ...c, name: res.content.trim() } : c)
          Storage.setCategories(cats)
          const app = getApp(); app.globalData.categories = cats; app.refreshStats()
          this.loadCategories(); uni.showToast({ title: '已更新', icon: 'success' })
        }
      })
    },
    deleteCat(id, name, count) {
      if (count > 0) { uni.showModal({ title: '无法删除', content: '「' + name + '」分类下还有 ' + count + ' 件物品，请先移至其他分类。', showCancel: false, confirmText: '知道了' }); return }
      uni.showModal({ title: '确认删除', content: '确定要删除分类「' + name + '」吗？', confirmColor: '#E05050',
        success: res => {
          if (res.confirm) {
            let cats = Storage.getCategories().filter(c => c.id !== id); Storage.setCategories(cats)
            const app = getApp(); app.globalData.categories = cats; app.refreshStats()
            this.loadCategories(); uni.showToast({ title: '已删除', icon: 'success' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
page { background: #FAFAF7; }
.page { min-height: 100vh; }
.page-header { padding: 40rpx 30rpx 20rpx; }
.page-title { display: block; font-size: 36rpx; font-weight: 700; color: #1A1A18; margin-bottom: 8rpx; }
.page-sub { display: block; font-size: 26rpx; color: #9E9E8A; }
.cat-list { padding: 0 24rpx; }
.cat-item { display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 16rpx; padding: 20rpx 24rpx; margin-bottom: 12rpx; }
.cat-left { display: flex; align-items: center; flex: 1; }
.cat-icon-wrap { width: 72rpx; height: 72rpx; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; margin-right: 20rpx; }
.cat-icon { font-size: 36rpx; }
.cat-info { flex: 1; }
.cat-name { display: block; font-size: 28rpx; font-weight: 600; color: #1A1A18; }
.cat-meta { display: block; font-size: 22rpx; color: #9E9E8A; margin-top: 4rpx; }
.cat-actions { display: flex; gap: 12rpx; }
.act-btn { padding: 10rpx 20rpx; border-radius: 100rpx; font-size: 24rpx; color: #3D7A5C; border: 1rpx solid #3D7A5C; }
.act-btn.danger { color: #E05050; border-color: #E05050; }
.add-cat-btn { display: flex; align-items: center; justify-content: center; margin: 32rpx 24rpx; padding: 24rpx; border: 2rpx dashed #3D7A5C; border-radius: 100rpx; }
.add-icon { font-size: 36rpx; color: #3D7A5C; margin-right: 10rpx; font-weight: 300; }
.add-text { font-size: 28rpx; color: #3D7A5C; font-weight: 600; }
</style>
