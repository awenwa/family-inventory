// utils/storage.js - 数据持久化工具
const ITEMS_KEY = 'family_inventory_items'
const CATEGORIES_KEY = 'family_inventory_categories'
const FREQ_KEY = 'family_inventory_frequency'

import { CATEGORIES } from './categories'

function init() {
  try { uni.getStorageInfoSync() } catch (e) { console.error('Storage init error:', e) }
}

function getItems() {
  try { const data = uni.getStorageSync(ITEMS_KEY); return data ? JSON.parse(data) : [] } catch (e) { return [] }
}

function setItems(items) {
  try { uni.setStorageSync(ITEMS_KEY, JSON.stringify(items)); return true } catch (e) { console.error('Set items error:', e); return false }
}

function getCategories() {
  try {
    const data = uni.getStorageSync(CATEGORIES_KEY)
    if (data) return JSON.parse(data)
    setCategories(CATEGORIES)
    return CATEGORIES
  } catch (e) { return CATEGORIES || [] }
}

function setCategories(categories) {
  try { uni.setStorageSync(CATEGORIES_KEY, JSON.stringify(categories)); return true } catch (e) { return false }
}

function getFrequency() {
  try { const data = uni.getStorageSync(FREQ_KEY); return data ? JSON.parse(data) : null } catch (e) { return null }
}

function setFrequency(freq) {
  try { uni.setStorageSync(FREQ_KEY, JSON.stringify(freq)); return true } catch (e) { return false }
}

export default {
  init, getItems, setItems, getCategories, setCategories, getFrequency, setFrequency
}
