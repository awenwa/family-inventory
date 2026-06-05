<template>
<view class="page">
  <view class="steps-bar">
    <view class="step-item" :class="{active: step >= 1}">
      <view class="step-circle">{{step > 1 ? '✓' : '1'}}</view>
      <text class="step-label">基本信息</text>
    </view>
    <view class="step-line" :class="{active: step > 1}"></view>
    <view class="step-item" :class="{active: step >= 2}">
      <view class="step-circle">2</view>
      <text class="step-label">购买信息</text>
    </view>
  </view>

  <!-- 步骤1 -->
  <scroll-view scroll-y class="form-scroll" v-if="step === 1">
    <view class="form-section">
      <view class="form-group">
        <text class="form-label">物品名称 *</text>
        <input class="form-input" placeholder="输入名称后会自动推荐分类…" :value="form.name" @input="onNameInput" />
      </view>

      <view class="form-group">
        <text class="form-label">分类 *</text>
        <view v-if="form.category && form.name" class="rec-badge">
          <text class="rec-icon">✨</text>
          <text class="rec-text">已根据名称自动推荐</text>
        </view>
        <view class="pill-row">
          <view v-for="cat in catTop5" :key="cat.id"
            class="pill" :class="{'pill-sel': form.category === cat.id}"
            :style="form.category === cat.id ? 'background:' + cat.color + ';border-color:' + cat.color + ';color:#fff;font-weight:600' : ''"
            @tap="selectCat(cat.id)">
            <text>{{cat.icon}}</text>
            <text class="pill-name">{{cat.name}}</text>
          </view>
        </view>
        <view class="pill-row pill-row-bottom">
          <view class="more-btn" @tap="catExpanded = !catExpanded">
            <text>更多</text>
            <text class="arrow" :class="{up: catExpanded}">›</text>
          </view>
          <view class="add-cat-btn" @tap="showAddCat = true"><text>＋ 增加分类</text></view>
        </view>
        <view v-if="catExpanded" class="pill-row" style="margin-top:10rpx">
          <view v-for="cat in catList" :key="cat.id"
            class="pill" :class="{'pill-sel': form.category === cat.id}"
            :style="form.category === cat.id ? 'background:' + cat.color + ';border-color:' + cat.color + ';color:#fff;font-weight:600' : ''"
            @tap="selectCat(cat.id)">
            <text>{{cat.icon}}</text>
            <text class="pill-name">{{cat.name}}</text>
          </view>
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">品牌型号</text>
        <input class="form-input" placeholder="如：Apple iPhone 15 Pro" :value="form.brandModel" @input="updateField($event, 'brandModel')" />
      </view>

      <!-- 服装 -->
      <view v-if="form.category === 'clothing'" class="form-group">
        <text class="form-label">款式 *</text>
        <view class="pill-row">
          <view v-for="g in ['男款','女款','通用款']" :key="g"
            class="pill" :class="{'pill-sel': form.clothesGender === g}"
            :style="form.clothesGender === g ? 'background:#3D7A5C;border-color:#3D7A5C;color:#fff;font-weight:600' : ''"
            @tap="selectClothesGender(g)">{{g}}</view>
        </view>
        <text class="form-label" style="margin-top:28rpx">尺码</text>
        <view class="pill-row" style="margin-top:10rpx">
          <view v-for="s in clothesSizeTop5" :key="s"
            class="pill" :class="{'pill-sel': form.clothesSize === s}"
            :style="form.clothesSize === s ? 'background:#3D7A5C;border-color:#3D7A5C;color:#fff;font-weight:600' : ''"
            @tap="form.clothesSize = s">{{s}}</view>
          <view class="more-btn" @tap="clothesSizeExpanded = !clothesSizeExpanded">
            <text>更多</text><text class="arrow" :class="{up: clothesSizeExpanded}">›</text>
          </view>
        </view>
        <view v-if="clothesSizeExpanded" class="pill-row" style="margin-top:10rpx">
          <view v-for="s in clothesSizeOptions" :key="s"
            class="pill" :class="{'pill-sel': form.clothesSize === s}"
            :style="form.clothesSize === s ? 'background:#3D7A5C;border-color:#3D7A5C;color:#fff;font-weight:600' : ''"
            @tap="form.clothesSize = s">{{s}}</view>
        </view>
      </view>

      <!-- 鞋 -->
      <view v-if="form.category === 'shoes'" class="form-group">
        <text class="form-label">款式 *</text>
        <view class="pill-row">
          <view v-for="g in ['男款','女款','通用款']" :key="g"
            class="pill" :class="{'pill-sel': form.shoesGender === g}"
            :style="form.shoesGender === g ? 'background:#3D7A5C;border-color:#3D7A5C;color:#fff;font-weight:600' : ''"
            @tap="selectShoesGender(g)">{{g}}</view>
        </view>
        <text class="form-label" style="margin-top:28rpx">鞋码体系</text>
        <view class="pill-row" style="margin-top:10rpx">
          <view v-for="t in ['中国码','欧码','国际码']" :key="t"
            class="pill" :class="{'pill-sel': form.shoesSizeType === t}"
            :style="form.shoesSizeType === t ? 'background:#3D7A5C;border-color:#3D7A5C;color:#fff;font-weight:600' : ''"
            @tap="selectShoesSizeType(t)">{{t}}</view>
        </view>
        <text class="form-label" style="margin-top:28rpx">尺码</text>
        <view class="pill-row" style="margin-top:10rpx">
          <view v-for="s in shoesSizeTop5" :key="s"
            class="pill" :class="{'pill-sel': form.shoesSize === s}"
            :style="form.shoesSize === s ? 'background:#3D7A5C;border-color:#3D7A5C;color:#fff;font-weight:600' : ''"
            @tap="form.shoesSize = s">{{s}}</view>
          <view class="more-btn" @tap="shoesExpanded = !shoesExpanded">
            <text>更多</text><text class="arrow" :class="{up: shoesExpanded}">›</text>
          </view>
        </view>
        <view v-if="shoesExpanded" class="pill-row" style="margin-top:10rpx">
          <view v-for="s in shoesSizeOptions" :key="s"
            class="pill" :class="{'pill-sel': form.shoesSize === s}"
            :style="form.shoesSize === s ? 'background:#3D7A5C;border-color:#3D7A5C;color:#fff;font-weight:600' : ''"
            @tap="form.shoesSize = s">{{s}}</view>
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">颜色</text>
        <input class="form-input" placeholder="如：银色、白色、黑色" :value="form.specs.color" @input="updateSpec($event, 'color')" />
      </view>
      <view class="form-group">
        <text class="form-label">重量</text>
        <input class="form-input" placeholder="如：187g、约5kg" :value="form.specs.weight" @input="updateSpec($event, 'weight')" />
      </view>

      <view class="form-group">
        <text class="form-label">物品标签</text>
        <view v-if="availableTags.length > 0" class="tag-grid">
          <view v-for="tag in availableTags" :key="tag"
            class="tag-chip" :class="{'tag-chip-sel': inputTags.indexOf(tag) > -1}"
            :style="inputTags.indexOf(tag) > -1 ? 'background:#3D7A5C;border-color:#3D7A5C;color:#fff;font-weight:600' : ''"
            @tap="pickTag(tag)">{{tag}}</view>
        </view>
        <view class="tag-area">
          <view v-for="(tag, idx) in inputTags" :key="idx" class="input-tag">
            <text>{{tag}}</text>
            <text class="tag-del" @tap="removeTag(idx)">×</text>
          </view>
          <input v-if="inputTags.length < 5" class="tag-input" placeholder="输入后回车添加" @confirm="addTag" :value="tagInput" @input="tagInput = $event.detail.value" />
        </view>
        <text class="form-hint">从上方选择，或输入后回车添加（最多5个）</text>
      </view>

      <view class="section-divider">
        <text class="section-divider-line"></text>
        <text class="section-divider-text">购买信息</text>
        <text class="section-divider-line"></text>
      </view>

      <view class="form-group">
        <text class="form-label">购买日期 *</text>
        <picker mode="date" :value="form.purchaseDate" @change="pickDate">
          <view class="form-input form-picker">
            <text>{{form.purchaseDate || '请选择日期'}}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      <view class="form-group">
        <text class="form-label">购买价格 *</text>
        <view class="price-wrap">
          <text class="price-yuan">¥</text>
          <input class="form-input price-input" type="digit" placeholder="0.00" :value="form.price" @input="updateField($event, 'price')" />
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">购买渠道</text>
        <view class="pill-row">
          <view v-for="ch in channelTop5" :key="ch"
            class="pill" :class="{'pill-sel': form.channel === ch}"
            :style="form.channel === ch ? 'background:#3D7A5C;border-color:#3D7A5C;color:#fff;font-weight:600' : ''"
            @tap="selectChannel(ch)">{{ch}}</view>
        </view>
        <view class="pill-row pill-row-bottom" style="margin-top:10rpx">
          <view class="more-btn" @tap="channelExpanded = !channelExpanded">
            <text>更多</text><text class="arrow" :class="{up: channelExpanded}">›</text>
          </view>
        </view>
        <view v-if="channelExpanded" class="pill-row" style="margin-top:10rpx">
          <view v-for="ch in channelPresets" :key="ch"
            class="pill" :class="{'pill-sel': form.channel === ch}"
            :style="form.channel === ch ? 'background:#3D7A5C;border-color:#3D7A5C;color:#fff;font-weight:600' : ''"
            @tap="selectChannel(ch)">{{ch}}</view>
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">备注说明</text>
        <textarea class="form-textarea" placeholder="补充任何其他信息…" :value="form.remark" @input="updateField($event, 'remark')" auto-height maxlength="200" />
      </view>
    </view>
  </scroll-view>

  <!-- 步骤2：预览 -->
  <scroll-view scroll-y class="form-scroll" v-if="step === 2">
    <view class="form-section">
      <view class="preview-section">
        <text class="preview-title">📋 预览</text>
        <view class="preview-card">
          <view class="preview-top" :style="{background: selectedCatColor + '18'}">
            <text class="preview-emoji">{{selectedCatIcon}}</text>
          </view>
          <view class="preview-body">
            <text class="preview-name">{{form.name || '物品名称'}}</text>
            <text class="preview-cat">{{selectedCatName}}</text>
            <view v-if="inputTags.length > 0" class="preview-tags">
              <text v-for="tag in inputTags" :key="tag" class="preview-tag">{{tag}}</text>
            </view>
            <view class="preview-price-row">
              <text class="preview-price">¥{{form.price || '0.00'}}</text>
              <text class="preview-date">{{form.purchaseDate || '未设置日期'}}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="form-group">
        <text class="form-label">购买日期</text>
        <view class="preview-info-row"><text>{{form.purchaseDate || '—'}}</text><text class="preview-edit-link" @tap="prevStep">修改 ›</text></view>
      </view>
      <view class="form-group">
        <text class="form-label">购买价格</text>
        <view class="preview-info-row"><text class="price-big">¥{{form.price || '0.00'}}</text><text class="preview-edit-link" @tap="prevStep">修改 ›</text></view>
      </view>
      <view class="form-group">
        <text class="form-label">购买渠道</text>
        <view class="preview-info-row"><text>{{form.channel || '—'}}</text><text class="preview-edit-link" @tap="prevStep">修改 ›</text></view>
      </view>
      <view v-if="form.remark" class="form-group">
        <text class="form-label">备注</text>
        <view class="preview-info-row"><text class="preview-remark">{{form.remark}}</text><text class="preview-edit-link" @tap="prevStep">修改 ›</text></view>
      </view>
    </view>
  </scroll-view>

  <view class="bottom-bar">
    <text v-if="step > 1" class="btn-back" @tap="prevStep">← 上一步</text>
    <text v-if="step === 1" class="btn-next" @tap="nextStep">下一步 →</text>
    <text v-if="step === 2" class="btn-save" :class="{disabled: !canSave}" @tap="saveItem">保存物品</text>
  </view>

  <!-- 新增分类弹窗 -->
  <view v-if="showAddCat" class="modal-mask" @tap="showAddCat = false">
    <view class="modal-box" @tap.stop>
      <view class="modal-title">新增分类</view>
      <view class="modal-row">
        <text class="modal-label">名称</text>
        <input class="modal-input" placeholder="输入分类名称" :value="newCatName" @input="newCatName = $event.detail.value" maxlength="8" />
      </view>
      <view class="modal-row">
        <text class="modal-label">图标</text>
        <view class="icon-grid">
          <view v-for="icon in ['📦','👔','👕','👟','🔌','🏠','🍎','📚','⚽','💄','🧴','🔧','🍳','📱','🛋️','💡']" :key="icon"
            class="icon-opt" :class="{sel: newCatIcon === icon}" @tap="newCatIcon = icon">{{icon}}</view>
        </view>
      </view>
      <view class="modal-row">
        <text class="modal-label">颜色</text>
        <view class="color-grid">
          <view v-for="c in ['#4A90D9','#D4A84B','#5BAD5A','#7B6EB2','#E07B54','#E91E8C','#9E9E9E','#8D6E63','#4CAF50','#E8B4B8']" :key="c"
            class="color-opt" :class="{sel: newCatColor === c}" :style="{background: c}" @tap="newCatColor = c"></view>
        </view>
      </view>
      <view class="modal-actions">
        <text class="modal-cancel" @tap="showAddCat = false">取消</text>
        <text class="modal-confirm" @tap="confirmAddCat">确认添加</text>
      </view>
    </view>
  </view>
</view>
</template>

<script>
import Storage from '../../utils/storage'
import { genId } from '../../utils/formatters'
import { CATEGORIES, SIZE_OPTIONS, CHANNEL_PRESETS } from '../../utils/categories'

function topByFreq(freqMap, n = 5) {
  if (!freqMap || typeof freqMap !== 'object') return []
  return Object.entries(freqMap).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k)
}

function recommendCategory(name) {
  const kw = name.toLowerCase()
  const map = {
    electronics: ['手机','电脑','平板','耳机','音箱','相机','手表','充电器','数据线','键盘','鼠标','显示器','电视','switch','游戏机','iphone','ipad','mac','airpod'],
    furniture: ['床','沙发','椅子','桌子','柜子','书柜','衣柜','书架','茶几','床头柜','床垫','窗帘','灯','吸尘器','扫地机','洗衣机','冰箱','空调'],
    clothing: ['衣','裤子','裙子','衬衫','T恤','外套','大衣','毛衣','卫衣','袜子','内衣','保暖','优衣库','无印良品','zara'],
    shoes: ['鞋','靴','运动鞋','休闲鞋','皮鞋','凉鞋','拖鞋','nike','adidas','nb','newbalance','aj','椰子','vans','匡威','回力'],
    cosmetics: ['护肤','化妆品','口红','粉底','眼影','面霜','精华','洗面奶','防晒','沐浴','洗发','护发','香水'],
    books: ['书','本子','笔','笔记本','文具','钢笔','马克笔','橡皮','尺子'],
    sports: ['球','瑜伽','跑步','健身','哑铃','自行车','帐篷','背包','登山','泳镜','泳衣','滑板'],
    food: ['零食','饮料','茶叶','咖啡','牛奶','酸奶','水果','坚果','巧克力','饼干']
  }
  for (const [cat, keywords] of Object.entries(map)) {
    if (keywords.some(k => kw.includes(k))) return cat
  }
  return null
}

function getClothesOptions(gender) {
  const key = gender === '男款' ? 'men' : 'women'
  return SIZE_OPTIONS.clothes[key] || []
}
function getShoesOptions(type, gender) {
  if (type === '欧码') return SIZE_OPTIONS.shoes.eu || []
  if (type === '国际码') return SIZE_OPTIONS.shoes.us || []
  return gender === '男款' ? (SIZE_OPTIONS.shoes.men || []) : (SIZE_OPTIONS.shoes.women || [])
}

function getAvailableTags() {
  const app = getApp()
  const items = app.globalData.items || []
  const tagSet = new Set(['常用','贵重','家用','收藏','消耗品','备用'])
  items.forEach(i => (i.tags || []).forEach(t => tagSet.add(t)))
  return Array.from(tagSet)
}

export default {
  data() {
    return {
      step: 1,
      categories: [],
      catList: [],
      catTop5: [],
      catExpanded: false,
      showAddCat: false,
      clothesSizeOptions: [],
      clothesSizeTop5: [],
      clothesSizeExpanded: false,
      shoesSizeOptions: [],
      shoesSizeTop5: [],
      shoesExpanded: false,
      channelTop5: [],
      channelExpanded: false,
      channelPresets: CHANNEL_PRESETS,
      form: {
        name: '', category: '', brandModel: '',
        clothesGender: '通用款', clothesSize: '',
        shoesGender: '通用款', shoesSizeType: '中国码', shoesSize: '',
        specs: { color: '', dimension: '', weight: '', material: '' },
        tags: [], purchaseDate: '', price: '', channel: '', remark: ''
      },
      inputTags: [],
      tagInput: '',
      availableTags: [],
      selectedCatIcon: '📦',
      selectedCatName: '其他',
      selectedCatColor: '#C8C4B8',
      canSave: false,
      newCatName: '',
      newCatIcon: '📦',
      newCatColor: '#4A90D9'
    }
  },
  onLoad(options) {
    const app = getApp()
    const customCats = Storage.getCategories() || []
    const customIds = new Set(customCats.map(c => c.id))
    const builtIn = CATEGORIES.filter(c => !customIds.has(c.id))
    const allCats = customCats.length >= CATEGORIES.length ? customCats : [...builtIn, ...customCats]
    const freq = app.globalData.frequency || {}
    const availTags = getAvailableTags()
    const catTopIds = topByFreq(freq.categories || {}, 5)
    let catTop5 = catTopIds.map(id => allCats.find(c => c.id === id)).filter(Boolean)
    if (catTop5.length < 5) { for (const c of allCats) { if (catTop5.length >= 5) break; if (!catTop5.find(t => t.id === c.id)) catTop5.push(c) } }
    const channelTopIds = topByFreq(freq.channels || {}, 5)
    let channelTop5 = channelTopIds.map(id => CHANNEL_PRESETS.find(c => c === id)).filter(Boolean)
    if (channelTop5.length < 5) { for (const c of CHANNEL_PRESETS) { if (channelTop5.length >= 5) break; if (!channelTop5.includes(c)) channelTop5.push(c) } }
    const clothesOptions = getClothesOptions('通用款')
    const shoesOptions = getShoesOptions('中国码', '通用款')
    this.categories = allCats; this.catList = allCats; this.catTop5 = catTop5
    this.channelTop5 = channelTop5; this.availableTags = availTags
    this.clothesSizeOptions = clothesOptions; this.clothesSizeTop5 = clothesOptions.slice(0, 6)
    this.shoesSizeOptions = shoesOptions; this.shoesSizeTop5 = shoesOptions.slice(0, 6)

    if (options.editId) {
      const item = app.globalData.items.find(i => i.id === options.editId)
      if (item) {
        const cat = allCats.find(c => c.id === item.category) || allCats[allCats.length - 1]
        if (item.category === 'clothing') { const opts = getClothesOptions(item.clothesGender || '通用款'); this.clothesSizeOptions = opts; this.clothesSizeTop5 = opts.slice(0, 5) }
        if (item.category === 'shoes') { const opts = getShoesOptions(item.shoesSizeType || '中国码', item.shoesGender || '通用款'); this.shoesSizeOptions = opts; this.shoesSizeTop5 = opts.slice(0, 5) }
        this.form = { ...item, specs: { ...(item.specs || {}) } }
        this.inputTags = item.tags || []
        this.selectedCatIcon = cat.icon; this.selectedCatName = cat.name; this.selectedCatColor = cat.color
      }
    }
  },
  methods: {
    onNameInput(e) {
      this.form.name = e.detail.value; this.updateCanSave()
      const name = e.detail.value.trim()
      if (name.length >= 2 && !this.form.category) {
        const rec = recommendCategory(name)
        if (rec) { const cat = this.categories.find(c => c.id === rec); if (cat) { this.form.category = rec; this.selectedCatIcon = cat.icon; this.selectedCatName = cat.name; this.selectedCatColor = cat.color } }
      }
    },
    updateField(e, key) { this.form[key] = e.detail.value; this.updateCanSave() },
    updateSpec(e, key) { this.form.specs[key] = e.detail.value },
    selectCat(id) {
      const cat = this.categories.find(c => c.id === id) || this.categories[this.categories.length - 1]
      this.form.category = id; this.form.clothesGender = '通用款'; this.form.clothesSize = ''; this.form.shoesGender = '通用款'; this.form.shoesSizeType = '中国码'; this.form.shoesSize = ''
      if (id === 'clothing') { const opts = getClothesOptions('通用款'); this.clothesSizeOptions = opts; this.clothesSizeTop5 = opts.slice(0, 6) }
      if (id === 'shoes') { const opts = getShoesOptions('中国码', '通用款'); this.shoesSizeOptions = opts; this.shoesSizeTop5 = opts.slice(0, 6) }
      this.selectedCatIcon = cat.icon; this.selectedCatName = cat.name; this.selectedCatColor = cat.color
    },
    selectClothesGender(g) {
      const opts = getClothesOptions(g); this.form.clothesGender = g; this.form.clothesSize = ''
      this.clothesSizeOptions = opts; this.clothesSizeTop5 = opts.slice(0, 5); this.clothesSizeExpanded = false
    },
    selectShoesGender(g) {
      this.form.shoesGender = g; this.form.shoesSize = ''
      if (this.form.shoesSizeType === '中国码') { const opts = getShoesOptions('中国码', g); this.shoesSizeOptions = opts; this.shoesSizeTop5 = opts.slice(0, 6) }
    },
    selectShoesSizeType(t) {
      const g = this.form.shoesGender; const opts = getShoesOptions(t, g)
      this.form.shoesSizeType = t; this.form.shoesSize = ''; this.shoesSizeOptions = opts; this.shoesSizeTop5 = opts.slice(0, 6); this.shoesExpanded = false
    },
    selectChannel(ch) { this.form.channel = ch },
    addTag(e) {
      const tag = (e.detail.value || this.tagInput).trim()
      if (!tag || this.inputTags.includes(tag) || this.inputTags.length >= 5) return
      this.inputTags = [...this.inputTags, tag]; this.tagInput = ''
    },
    pickTag(tag) {
      const tags = [...this.inputTags]; const idx = tags.indexOf(tag)
      if (idx > -1) tags.splice(idx, 1); else if (tags.length < 5) tags.push(tag)
      this.inputTags = tags
    },
    removeTag(idx) { const tags = [...this.inputTags]; tags.splice(idx, 1); this.inputTags = tags },
    pickDate(e) { this.form.purchaseDate = e.detail.value; this.updateCanSave() },
    updateCanSave() { this.canSave = !!(this.form.name && this.form.purchaseDate && this.form.price) },
    nextStep() {
      if (this.step === 1) {
        if (!this.form.name.trim()) { uni.showToast({ title: '请输入物品名称', icon: 'none' }); return }
        if (!this.form.category) { uni.showToast({ title: '请选择分类', icon: 'none' }); return }
        this.step = 2; return
      }
      if (this.step === 2) {
        if (!this.form.purchaseDate) { uni.showToast({ title: '请选择购买日期', icon: 'none' }); return }
        if (!this.form.price) { uni.showToast({ title: '请输入购买价格', icon: 'none' }); return }
        this.saveItem()
      }
    },
    prevStep() { if (this.step > 1) this.step-- },
    confirmAddCat() {
      if (!this.newCatName.trim()) { uni.showToast({ title: '请输入分类名称', icon: 'none' }); return }
      const id = 'custom_' + Date.now()
      const newCat = { id, name: this.newCatName.trim(), icon: this.newCatIcon, color: this.newCatColor }
      const cats = [...this.categories, newCat]
      Storage.setCategories(cats); const app = getApp(); app.globalData.categories = cats
      this.categories = cats; this.catList = cats; this.form.category = id
      this.selectedCatIcon = this.newCatIcon; this.selectedCatName = newCat.name; this.selectedCatColor = this.newCatColor; this.showAddCat = false
      uni.showToast({ title: '分类已添加', icon: 'success' })
    },
    saveItem() {
      if (!this.form.name || !this.form.purchaseDate || !this.form.price) { uni.showToast({ title: '请填写必填项', icon: 'none' }); return }
      const app = getApp()
      const item = { ...this.form, tags: this.inputTags }
      const now = Date.now()
      let items = app.globalData.items
      item.id = genId(); item.createdAt = now; item.updatedAt = now
      items.unshift(item)
      const freq = app.globalData.frequency || { categories: {}, sizes: {}, channels: {} }
      freq.categories = freq.categories || {}; freq.sizes = freq.sizes || {}; freq.channels = freq.channels || {}
      freq.categories[this.form.category] = (freq.categories[this.form.category] || 0) + 1
      if (this.form.clothesSize) freq.sizes[this.form.clothesSize] = (freq.sizes[this.form.clothesSize] || 0) + 1
      if (this.form.shoesSize) freq.sizes[this.form.shoesSize] = (freq.sizes[this.form.shoesSize] || 0) + 1
      if (this.form.channel) freq.channels[this.form.channel] = (freq.channels[this.form.channel] || 0) + 1
      Storage.setItems(items); Storage.setFrequency(freq); app.globalData.frequency = freq; app.refreshStats()
      // Supabase sync
      const Supabase = require('../../utils/supabase.js')
      if (Supabase.isReady()) { Supabase.pushItem(item); Supabase.pushSettings(app.globalData.categories, freq) }
      uni.showToast({ title: '添加成功', icon: 'success' }); setTimeout(() => uni.navigateBack(), 1200)
    }
  }
}
</script>

<style scoped>
page { background: #FAFAF7; }
.page { min-height: 100vh; padding-bottom: 140rpx; }
.steps-bar { display: flex; align-items: center; padding: 40rpx 60rpx 32rpx; background: #fff; border-bottom: 1rpx solid #F0EDE6; }
.step-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.step-circle { width: 52rpx; height: 52rpx; border-radius: 50%; background: #E8E5DC; color: #9E9E8A; display: flex; align-items: center; justify-content: center; font-size: 24rpx; font-weight: 700; }
.step-item.active .step-circle { background: #3D7A5C; color: #fff; }
.step-label { font-size: 20rpx; color: #9E9E8A; }
.step-item.active .step-label { color: #3D7A5C; font-weight: 600; }
.step-line { flex: 1; height: 2rpx; background: #E8E5DC; margin: 0 20rpx 28rpx; }
.step-line.active { background: #3D7A5C; }
.form-scroll { height: calc(100vh - 260rpx); box-sizing: border-box; }
.form-section { padding: 32rpx 30rpx; }
.form-group { margin-bottom: 36rpx; }
.form-label { display: block; font-size: 28rpx; font-weight: 600; color: #1A1A18; margin-bottom: 16rpx; }
.form-label::before { content: ''; display: inline-block; width: 6rpx; height: 28rpx; background: #3D7A5C; border-radius: 3rpx; margin-right: 10rpx; vertical-align: middle; }
.form-input { background: #fff; border: 1rpx solid #E0DDD5; border-radius: 16rpx; padding: 18rpx 24rpx; font-size: 30rpx; color: #1A1A18; width: 100%; height: 76rpx; box-sizing: border-box; line-height: 1.4; }
.form-picker { display: flex; justify-content: space-between; align-items: center; }
.picker-arrow { font-size: 32rpx; color: #C8C4B8; }
.form-textarea { background: #fff; border: 1rpx solid #E0DDD5; border-radius: 16rpx; padding: 22rpx 24rpx; font-size: 30rpx; color: #1A1A18; width: 100%; box-sizing: border-box; min-height: 160rpx; }
.form-hint { display: block; font-size: 22rpx; color: #B8B4A8; margin-top: 10rpx; }
.pill-row { display: flex; flex-wrap: wrap; gap: 10rpx; align-items: center; }
.pill-row-bottom { border-top: 1rpx dashed #E8E5DC; padding-top: 12rpx; margin-top: 4rpx; }
.pill { display: flex; align-items: center; gap: 4rpx; padding: 10rpx 18rpx; border-radius: 100rpx; border: 1rpx solid #E0DDD5; background: #fff; font-size: 26rpx; color: #3A3A30; }
.pill.pill-sel { background: #3D7A5C !important; border-color: #3D7A5C !important; color: #fff !important; font-weight: 600; }
.pill-name { font-size: 26rpx; color: inherit; }
.more-btn { display: flex; align-items: center; gap: 4rpx; padding: 10rpx 18rpx; border-radius: 100rpx; border: 1rpx dashed #D0CCC0; background: transparent; font-size: 24rpx; color: #9E9E8A; }
.more-btn .arrow { font-size: 24rpx; display: inline-block; transition: transform 0.2s; }
.more-btn .arrow.up { transform: rotate(90deg); }
.add-cat-btn { display: flex; align-items: center; padding: 10rpx 18rpx; border-radius: 100rpx; border: 1rpx dashed #3D7A5C; font-size: 24rpx; color: #3D7A5C; font-weight: 600; }
.rec-badge { display: inline-flex; align-items: center; gap: 6rpx; background: #FFF8E6; border: 1rpx solid #F0D080; border-radius: 100rpx; padding: 6rpx 16rpx; margin-bottom: 14rpx; }
.rec-icon { font-size: 22rpx; }
.rec-text { font-size: 22rpx; color: #C88A2C; font-weight: 600; }
.tag-area { display: flex; flex-wrap: wrap; gap: 10rpx; align-items: center; background: #fff; border: 1rpx solid #E0DDD5; border-radius: 16rpx; padding: 16rpx 20rpx; min-height: 72rpx; }
.input-tag { display: flex; align-items: center; gap: 6rpx; background: #3D7A5C; color: #fff; font-size: 24rpx; padding: 8rpx 14rpx; border-radius: 100rpx; }
.tag-del { font-size: 28rpx; opacity: 0.7; }
.tag-input { font-size: 26rpx; color: #1A1A18; flex: 1; min-width: 180rpx; }
.tag-grid { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 14rpx; }
.tag-chip { padding: 8rpx 18rpx; border-radius: 100rpx; border: 1rpx solid #E0DDD5; background: #FAFAF7; font-size: 24rpx; color: #6A6A5A; }
.tag-chip.tag-chip-sel { background: #3D7A5C; color: #fff; border-color: #3D7A5C; font-weight: 600; }
.section-divider { display: flex; align-items: center; gap: 16rpx; margin: 8rpx 0 28rpx; }
.section-divider-line { flex: 1; height: 1rpx; background: #E8E5DC; }
.section-divider-text { font-size: 24rpx; color: #9E9E8A; font-weight: 600; white-space: nowrap; }
.price-wrap { display: flex; align-items: center; background: #fff; border: 1rpx solid #E0DDD5; border-radius: 16rpx; padding: 0 24rpx; overflow: hidden; }
.price-yuan { font-size: 36rpx; color: #C88A2C; font-weight: 700; margin-right: 8rpx; flex-shrink: 0; }
.price-input { border: none; padding-left: 0; }
.preview-section { margin-top: 40rpx; }
.preview-title { display: block; font-size: 28rpx; font-weight: 600; color: #1A1A18; margin-bottom: 20rpx; }
.preview-card { background: #fff; border-radius: 20rpx; overflow: hidden; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08); }
.preview-top { height: 120rpx; display: flex; align-items: center; justify-content: center; }
.preview-emoji { font-size: 60rpx; }
.preview-body { padding: 24rpx; }
.preview-name { display: block; font-size: 32rpx; font-weight: 700; color: #1A1A18; margin-bottom: 8rpx; }
.preview-cat { display: block; font-size: 24rpx; color: #9E9E8A; margin-bottom: 12rpx; }
.preview-tags { display: flex; flex-wrap: wrap; gap: 8rpx; margin-bottom: 16rpx; }
.preview-tag { font-size: 20rpx; color: #7A7A6A; background: #F0EDE6; padding: 4rpx 14rpx; border-radius: 100rpx; }
.preview-price-row { display: flex; justify-content: space-between; align-items: center; }
.preview-price { font-size: 32rpx; font-weight: 800; color: #C88A2C; }
.preview-date { font-size: 24rpx; color: #9E9E8A; }
.preview-info-row { display: flex; justify-content: space-between; align-items: flex-start; background: #fff; border: 1rpx solid #E0DDD5; border-radius: 16rpx; padding: 22rpx 24rpx; font-size: 30rpx; color: #1A1A18; }
.price-big { font-size: 38rpx; font-weight: 800; color: #C88A2C; }
.preview-edit-link { font-size: 26rpx; color: #3D7A5C; font-weight: 600; flex-shrink: 0; margin-left: 20rpx; }
.preview-remark { font-size: 28rpx; color: #6A6A5A; line-height: 1.5; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 20rpx 30rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background: rgba(250,250,247,0.95); backdrop-filter: blur(20rpx); display: flex; gap: 16rpx; border-top: 1rpx solid #F0EDE6; z-index: 100; }
.btn-back { padding: 24rpx 32rpx; background: #fff; border: 1rpx solid #E0DDD5; border-radius: 100rpx; font-size: 30rpx; color: #6A6A5A; }
.btn-next, .btn-save { flex: 1; padding: 24rpx 32rpx; background: linear-gradient(135deg, #3D7A5C, #5A9A7A); border-radius: 100rpx; font-size: 30rpx; color: #fff; text-align: center; font-weight: 600; }
.btn-save.disabled { opacity: 0.4; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; }
.modal-box { width: 600rpx; background: #fff; border-radius: 24rpx; padding: 40rpx 36rpx; box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.2); }
.modal-title { font-size: 34rpx; font-weight: 700; color: #1A1A18; text-align: center; margin-bottom: 36rpx; }
.modal-row { margin-bottom: 30rpx; }
.modal-label { display: block; font-size: 26rpx; font-weight: 600; color: #6A6A5A; margin-bottom: 14rpx; }
.modal-input { background: #FAFAF7; border: 1rpx solid #E0DDD5; border-radius: 14rpx; padding: 18rpx 22rpx; font-size: 30rpx; color: #1A1A18; width: 100%; box-sizing: border-box; height: 72rpx; }
.icon-grid { display: flex; flex-wrap: wrap; gap: 12rpx; }
.icon-opt { width: 72rpx; height: 72rpx; display: flex; align-items: center; justify-content: center; font-size: 40rpx; border-radius: 16rpx; border: 1rpx solid #E0DDD5; background: #FAFAF7; }
.icon-opt.sel { border-color: #3D7A5C; background: #E8F4EE; }
.color-grid { display: flex; flex-wrap: wrap; gap: 14rpx; }
.color-opt { width: 56rpx; height: 56rpx; border-radius: 50%; }
.color-opt.sel { transform: scale(1.2); box-shadow: 0 0 0 4rpx #fff, 0 0 0 6rpx currentColor; }
.modal-actions { display: flex; gap: 16rpx; margin-top: 36rpx; }
.modal-cancel { flex: 1; padding: 22rpx; text-align: center; font-size: 30rpx; color: #9E9E8A; border: 1rpx solid #E0DDD5; border-radius: 100rpx; }
.modal-confirm { flex: 2; padding: 22rpx; text-align: center; font-size: 30rpx; color: #fff; background: linear-gradient(135deg, #3D7A5C, #5A9A7A); border-radius: 100rpx; font-weight: 600; }
</style>
