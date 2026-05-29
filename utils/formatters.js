// utils/formatters.js - 格式化工具函数

/**
 * 格式化日期为中文格式
 */
function formatDate(dateStr) {
  if (!dateStr) return '未知时间';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

/**
 * 计算日期差距（人性化）
 */
function dateDiff(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return '今天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
}

/**
 * 格式化金额
 */
function formatMoney(price) {
  const num = parseFloat(price);
  if (isNaN(num)) return '¥--';
  return '¥' + num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * 生成唯一ID
 */
function genId() {
  return 'item_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * 截断文本
 */
function truncate(str, len = 20) {
  if (!str) return '';
  return str.length > len ? str.substr(0, len) + '…' : str;
}

module.exports = {
  formatDate,
  dateDiff,
  formatMoney,
  genId,
  truncate
};
