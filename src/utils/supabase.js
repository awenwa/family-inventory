// utils/supabase.js - Supabase REST API sync manager
const SUPABASE_URL_KEY = 'family_inventory_supabase_url';
const SUPABASE_KEY_KEY = 'family_inventory_supabase_key';
const SUPABASE_USER_KEY = 'family_inventory_user_id';
const SYNC_TIME_KEY = 'family_inventory_last_sync';

let config = null;

function getConfig() {
  if (config) return config;
  const url = uni.getStorageSync(SUPABASE_URL_KEY);
  const key = uni.getStorageSync(SUPABASE_KEY_KEY);
  const userId = uni.getStorageSync(SUPABASE_USER_KEY);
  if (!url || !key) return null;
  config = { url: url.replace(/\/$/, ''), key, userId };
  return config;
}

function setConfig(url, key, userId) {
  uni.setStorageSync(SUPABASE_URL_KEY, url);
  uni.setStorageSync(SUPABASE_KEY_KEY, key);
  uni.setStorageSync(SUPABASE_USER_KEY, userId || 'default');
  config = { url: url.replace(/\/$/, ''), key, userId: userId || 'default' };
  return true;
}

function clearConfig() {
  uni.removeStorageSync(SUPABASE_URL_KEY);
  uni.removeStorageSync(SUPABASE_KEY_KEY);
  uni.removeStorageSync(SUPABASE_USER_KEY);
  config = null;
}

function isReady() { return !!getConfig(); }

function getLastSyncTime() { return uni.getStorageSync(SYNC_TIME_KEY) || 0; }

async function request(method, table, data = null, query = '') {
  const cfg = getConfig();
  if (!cfg) return null;
  const url = `${cfg.url}/rest/v1/${table}${query}`;
  const headers = {
    'apikey': cfg.key,
    'Authorization': `Bearer ${cfg.key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  if (method === 'GET') headers['Prefer'] = 'count=exact';
  
  return new Promise((resolve) => {
    uni.request({
      url, method, data, header: headers,
      success: (res) => resolve(res.statusCode >= 200 && res.statusCode < 300 ? res.data : null),
      fail: () => resolve(null)
    });
  });
}

async function pullItems() {
  const cfg = getConfig();
  if (!cfg) return null;
  const data = await request('GET', 'items', null, `?user_id=eq.${cfg.userId}&order=updated_at.desc&limit=1000`);
  return data;
}

async function pushItem(item) {
  const cfg = getConfig();
  if (!cfg) return false;
  const row = {
    user_id: cfg.userId,
    name: item.name,
    category: item.category,
    specs: JSON.stringify(item.specs || {}),
    purchase_date: item.purchaseDate || null,
    price: parseFloat(item.price) || 0,
    channel: item.channel || '',
    remark: item.remark || '',
    tags: JSON.stringify(item.tags || []),
    photos: JSON.stringify(item.photos || []),
    style: item.style || '',
    clothes_size: item.clothesSize || '',
    shoes_size: item.shoesSize || '',
    clothes_gender: item.clothesGender || '',
    shoes_gender: item.shoesGender || '',
    shoes_size_type: item.shoesSizeType || '',
    brand_model: item.brandModel || '',
    updated_at: new Date().toISOString()
  };
  const existing = await request('GET', 'items', null, `?id=eq.${item.id}&select=id`);
  if (existing && existing.length > 0) {
    await request('PATCH', 'items', row, `?id=eq.${item.id}`);
  } else {
    row.id = item.id;
    row.created_at = new Date().toISOString();
    await request('POST', 'items', row);
  }
  return true;
}

async function removeItem(id) {
  const cfg = getConfig();
  if (!cfg) return false;
  await request('DELETE', 'items', null, `?id=eq.${id}&user_id=eq.${cfg.userId}`);
  return true;
}

async function pullSettings() {
  const cfg = getConfig();
  if (!cfg) return null;
  const data = await request('GET', 'user_settings', null, `?user_id=eq.${cfg.userId}&limit=1`);
  return data && data.length > 0 ? data[0] : null;
}

async function pushSettings(categories, frequency) {
  const cfg = getConfig();
  if (!cfg) return false;
  const row = {
    user_id: cfg.userId,
    categories: JSON.stringify(categories || []),
    frequency: JSON.stringify(frequency || {}),
    updated_at: new Date().toISOString()
  };
  const existing = await pullSettings();
  if (existing) {
    await request('PATCH', 'user_settings', row, `?id=eq.${existing.id}`);
  } else {
    await request('POST', 'user_settings', row);
  }
  return true;
}

async function syncAll(localItems, localCategories, localFrequency) {
  const cfg = getConfig();
  if (!cfg) return { items: localItems, categories: localCategories, frequency: localFrequency, synced: false };
  
  try {
    const cloudItems = await pullItems();
    const cloudSettings = await pullSettings();
    
    if ((!cloudItems || cloudItems.length === 0) && !cloudSettings) {
      // Push all local data
      for (const item of localItems) await pushItem(item);
      await pushSettings(localCategories, localFrequency);
      uni.setStorageSync(SYNC_TIME_KEY, Date.now());
      return { items: localItems, categories: localCategories, frequency: localFrequency, synced: true };
    }
    
    // Merge items
    let mergedItems = localItems;
    if (cloudItems && cloudItems.length > 0) {
      const localMap = {};
      localItems.forEach(item => { localMap[String(item.id)] = item; });
      const cloudMap = {};
      cloudItems.forEach(doc => {
        const clean = {
          id: doc.id,
          name: doc.name, category: doc.category,
          specs: typeof doc.specs === 'string' ? JSON.parse(doc.specs) : (doc.specs || {}),
          purchaseDate: doc.purchase_date, price: doc.price,
          channel: doc.channel, remark: doc.remark,
          tags: typeof doc.tags === 'string' ? JSON.parse(doc.tags) : (doc.tags || []),
          photos: typeof doc.photos === 'string' ? JSON.parse(doc.photos) : (doc.photos || []),
          brandModel: doc.brand_model || '',
          clothesGender: doc.clothes_gender || '',
          clothesSize: doc.clothes_size || '',
          shoesGender: doc.shoes_gender || '',
          shoesSize: doc.shoes_size || '',
          shoesSizeType: doc.shoes_size_type || '',
          updatedAt: doc.updated_at, createdAt: doc.created_at
        };
        cloudMap[String(doc.id)] = clean;
      });
      
      const allIds = new Set([...Object.keys(localMap), ...Object.keys(cloudMap)]);
      mergedItems = [];
      for (const id of allIds) {
        const local = localMap[id];
        const cloud = cloudMap[id];
        if (local && !cloud) mergedItems.push(local);
        else if (!local && cloud) mergedItems.push(cloud);
        else {
          const lt = local.updatedAt || local.createdAt || 0;
          const ct = cloud.updatedAt || cloud.createdAt || 0;
          mergedItems.push(ct > lt ? cloud : local);
        }
      }
    }
    
    // Merge settings
    let mergedCategories = localCategories;
    let mergedFrequency = localFrequency;
    if (cloudSettings) {
      if (cloudSettings.categories) {
        mergedCategories = typeof cloudSettings.categories === 'string' 
          ? JSON.parse(cloudSettings.categories) : cloudSettings.categories;
      }
      if (cloudSettings.frequency) {
        mergedFrequency = typeof cloudSettings.frequency === 'string'
          ? JSON.parse(cloudSettings.frequency) : cloudSettings.frequency;
      }
    }
    
    // Push merged
    for (const item of mergedItems) await pushItem(item);
    await pushSettings(mergedCategories, mergedFrequency);
    uni.setStorageSync(SYNC_TIME_KEY, Date.now());
    
    return { items: mergedItems, categories: mergedCategories, frequency: mergedFrequency, synced: true };
  } catch (e) {
    console.error('[Supabase] Sync failed:', e);
    return { items: localItems, categories: localCategories, frequency: localFrequency, synced: false };
  }
}

export {
  getConfig, setConfig, clearConfig, isReady, getLastSyncTime,
  pullItems, pushItem, removeItem, pullSettings, pushSettings, syncAll
};
