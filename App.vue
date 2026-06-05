<script>
import Storage from './utils/storage'
import { DEMO_ITEMS, CATEGORIES } from './utils/categories'

const DATA_VERSION = 4

export default {
  globalData: {
    items: [],
    categories: [],
    stats: {},
    frequency: null,
    supabaseReady: false
  },

  onLaunch() {
    Storage.init()

    const savedVersion = uni.getStorageSync('data_version') || 0
    if (savedVersion < DATA_VERSION) {
      uni.removeStorageSync('family_inventory_items')
      uni.removeStorageSync('family_inventory_categories')
      uni.removeStorageSync('family_inventory_frequency')
      uni.setStorageSync('data_version', DATA_VERSION)
    }

    const items = Storage.getItems()
    if (items.length === 0) {
      Storage.setItems(DEMO_ITEMS)
      this.globalData.items = DEMO_ITEMS
    } else {
      this.globalData.items = items
    }

    this.globalData.categories = Storage.getCategories()
    this.globalData.stats = this.calcStats()
    this.globalData.frequency = Storage.getFrequency() || this.buildFrequency()

    // Check Supabase config
    const Supabase = require('./utils/supabase.js')
    if (Supabase.isReady()) {
      this.globalData.supabaseReady = true
      this.backgroundSync()
    }
  },

  methods: {
    backgroundSync() {
      const Supabase = require('./utils/supabase.js')
      Supabase.syncAll(
        this.globalData.items,
        this.globalData.categories,
        this.globalData.frequency
      ).then(res => {
        if (res.synced) {
          this.globalData.items = res.items
          this.globalData.categories = res.categories
          this.globalData.frequency = res.frequency
          this.globalData.stats = this.calcStats()
          console.log('[App] Supabase sync complete')
        }
      }).catch(e => {
        console.error('[App] Sync error:', e)
      })
    },

    calcStats() {
      const items = this.globalData.items
      const total = items.length
      const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
      const now = new Date()
      const thisMonth = items.filter(item => {
        if (!item.purchaseDate) return false
        const d = new Date(item.purchaseDate)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      }).length
      const byCategory = {}
      items.forEach(item => {
        const cat = item.category || 'other'
        byCategory[cat] = (byCategory[cat] || 0) + 1
      })
      return { total, totalValue, thisMonth, byCategory }
    },

    buildFrequency() {
      const items = this.globalData.items
      const freq = { categories: {}, sizes: {}, channels: {} }
      items.forEach(item => {
        if (item.category) freq.categories[item.category] = (freq.categories[item.category] || 0) + 1
        if (item.clothesSize) freq.sizes[item.clothesSize] = (freq.sizes[item.clothesSize] || 0) + 1
        if (item.shoesSize) freq.sizes[item.shoesSize] = (freq.sizes[item.shoesSize] || 0) + 1
        if (item.channel) freq.channels[item.channel] = (freq.channels[item.channel] || 0) + 1
      })
      return freq
    },

    refreshStats() {
      this.globalData.stats = this.calcStats()
      this.globalData.items = Storage.getItems()
      this.globalData.categories = Storage.getCategories()
      this.globalData.frequency = Storage.getFrequency() || this.buildFrequency()
    }
  }
}
</script>

<style>
page {
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
  background: #FAFAF7;
  color: #1A1A18;
  font-size: 28rpx;
  line-height: 1.5;
}
view, text { box-sizing: border-box; }
button::after { border: none; }
button { background: transparent; padding: 0; margin: 0; border-radius: 0; line-height: inherit; font-size: inherit; color: inherit; }
</style>
