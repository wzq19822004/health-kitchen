import type { ParsedIngredient, IngredientCategory, Unit } from '../types'

const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = {
  '蔬菜': ['白菜', '青菜', '菠菜', '西蓝花', '西兰花', '花菜', '包菜', '生菜', '油菜', '空心菜', '韭菜', '芹菜', '番茄', '西红柿', '黄瓜', '冬瓜', '南瓜', '丝瓜', '苦瓜', '茄子', '萝卜', '胡萝卜', '土豆', '藕', '豆芽', '洋葱', '蒜苔', '四季豆', '豆角', '豌豆', '玉米', '辣椒', '青椒'],
  '豆蛋': ['鸡蛋', '鸭蛋', '豆腐', '腐竹', '豆干', '毛豆', '豌豆', '黄豆', '绿豆', '红豆', '豆浆'],
  '乳制品': ['牛奶', '酸奶', '芝士', '奶酪', '黄油', '奶油'],
  '肉类': ['猪肉', '牛肉', '羊肉', '排骨', '里脊', '五花肉', '瘦肉', '肉丝', '肉末', '鸡腿', '鸡翅', '鸡胸', '鸭肉'],
  '水产': ['鱼', '虾', '蟹', '鲈鱼', '草鱼', '鲫鱼', '带鱼', '三文鱼', '鳕鱼', '蛤蜊', '花甲', '鱿鱼', '鲍鱼'],
  '碳水': ['米', '面', '面条', '粉', '馒头', '面包', '燕麦', '红薯', '紫薯', '山药', '芋头', '小米', '大米', '糯米'],
  '水果': ['苹果', '香蕉', '橙子', '橘子', '葡萄', '草莓', '蓝莓', '西瓜', '哈密瓜', '火龙果', '芒果', '猕猴桃', '梨', '桃', '柠檬'],
  '调味品': ['盐', '糖', '生抽', '老抽', '醋', '料酒', '蚝油', '豆瓣酱', '番茄酱', '蜂蜜', '香油', '花椒', '八角', '桂皮', '姜', '蒜', '葱', '辣椒'],
  '其他': ['干货', '木耳', '香菇', '紫菜', '海带', '粉丝', '枸杞', '红枣', '莲子', '银耳'],
}

const UNIT_ALIASES: Record<string, { unit: Unit; multiplier?: number }> = {
  'g': { unit: 'g' }, '克': { unit: 'g' },
  '斤': { unit: 'g', multiplier: 500 },
  '公斤': { unit: 'g', multiplier: 1000 },
  'kg': { unit: 'g', multiplier: 1000 },
  'ml': { unit: 'ml' }, '毫升': { unit: 'ml' },
  'l': { unit: 'ml', multiplier: 1000 },
  '升': { unit: 'ml', multiplier: 1000 },
  '个': { unit: '个' }, '颗': { unit: '个' }, '枚': { unit: '个' },
  '把': { unit: '把' }, '根': { unit: '把' },
  '袋': { unit: '袋' }, '包': { unit: '袋' },
  '盒': { unit: '盒' }, '板': { unit: '板' },
  '只': { unit: '个' },
}

const DEFAULT_EXPIRY: Record<IngredientCategory, number> = {
  '蔬菜': 5, '肉类': 3, '水产': 2, '碳水': 30, '水果': 7,
  '豆蛋': 14, '乳制品': 7, '调味品': 180, '其他': 30,
}

function detectCategory(name: string): IngredientCategory {
  let best: IngredientCategory = '其他'
  let bestLen = 0
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (name.includes(kw) && kw.length > bestLen) {
        best = cat as IngredientCategory
        bestLen = kw.length
      }
    }
  }
  return best
}

function parseQuantity(input: string): { quantity: number; unit: Unit } | null {
  const match = input.match(/(\d+\.?\d*)\s*([a-zA-Z\u4e00-\u9fa5]+)?/)
  if (!match) return null
  const qty = parseFloat(match[1])
  const unitStr = (match[2] || '').toLowerCase()
  
  if (!unitStr) return { quantity: qty, unit: 'g' }
  
  const alias = UNIT_ALIASES[unitStr]
  if (alias) {
    const multiplier = alias.multiplier || 1
    return { quantity: qty * multiplier, unit: alias.unit }
  }
  
  return { quantity: qty, unit: 'g' }
}

export function parseShoppingText(text: string): ParsedIngredient[] {
  // Remove common noise
  let clean = text.replace(/[（(][^)）]*[)）]/g, '') // remove parenthetical notes
  // Split by separators
  const separators = /[,，、\s\n\r]+/
  const items = clean.split(separators).filter((s: string) => s.trim())
  
  return items.map((item: string) => {
    const nameMatch = item.match(/^([a-zA-Z\u4e00-\u9fff]+)/)
    if (!nameMatch) return null
    const name = nameMatch[1]
    const rest = item.slice(name.length).trim()
    
    const qty = parseQuantity(rest)
    const category = detectCategory(name)
    
    return {
      name,
      quantity: qty?.quantity || 500,
      unit: qty?.unit || 'g',
      category,
      defaultExpiryDays: DEFAULT_EXPIRY[category],
    }
  }).filter((item): item is ParsedIngredient => item !== null)
}

export async function parseWithAI(text: string, apiKey?: string): Promise<ParsedIngredient[]> {
  if (!apiKey) return parseShoppingText(text)
  
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '将购物文本转为JSON数组，字段：name, quantity(数字), unit(g/个/ml/把/袋/盒), category(蔬菜/肉类/水产/碳水/水果/豆蛋/乳制品/调味品/其他), defaultExpiryDays(数字)。只输出JSON，不要多余文字。' },
          { role: 'user', content: text },
        ],
        temperature: 0,
      }),
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    if (Array.isArray(parsed)) return parsed
    return parseShoppingText(text)
  } catch {
    return parseShoppingText(text)
  }
}
