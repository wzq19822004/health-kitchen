import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { createShoppingItem, daysUntil } from '../data/storage'

const CAT_ICONS: Record<string, string> = { '蔬菜':'🥦','肉类':'🥩','水产':'🐟','碳水':'🍚','水果':'🍎','豆蛋':'🥚','乳制品':'🥛','调味品':'🧂','其他':'📦' }
const REASON_LABELS: Record<string, string> = { 'low_stock': '库存不足', 'recipe_need': '食谱需要', 'manual': '手动添加' }
const REASON_COLORS: Record<string, string> = { 'low_stock': 'bg-orange-soft text-orange-700', 'recipe_need': 'bg-blue-soft text-blue-700', 'manual': 'bg-gray-100 text-gray-600' }

export default function ShoppingList() {
  const { data, addShoppingItem, toggleShoppingItem, deleteShoppingItem } = useApp()
  const [newItem, setNewItem] = useState('')
  const [newQty, setNewQty] = useState('')
  const [autoMode, setAutoMode] = useState(false)

  const { items, checked } = useMemo(() => {
    const i = data.shoppingList.filter(s => !s.checked)
    const c = data.shoppingList.filter(s => s.checked)
    return { items: i, checked: c }
  }, [data.shoppingList])

  function generateFromStock() {
    const existing = new Set(data.shoppingList.map(s => s.name))
    for (const ing of data.ingredients) {
      if (existing.has(ing.name)) continue
      if (ing.expiryDate && daysUntil(ing.expiryDate) <= 2 && daysUntil(ing.expiryDate) >= 0) {
        addShoppingItem(createShoppingItem(ing.name, `${ing.quantity}${ing.unit}`, ing.category, 'low_stock'))
        existing.add(ing.name)
      }
    }
    setAutoMode(true)
  }

  function addManual() {
    if (!newItem.trim()) return
    addShoppingItem(createShoppingItem(newItem.trim(), newQty || '适量', '其他', 'manual'))
    setNewItem('')
    setNewQty('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-gray-800">🛒 购物清单</h2>
        <button onClick={generateFromStock} className="text-xs bg-mint-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-mint-600">⚡ 自动生成</button>
      </div>

      {autoMode && (
        <div className="bg-yellow-soft rounded-xl p-3 text-xs text-yellow-800">
          ⚡ 已根据库存情况自动生成，可手动调整
        </div>
      )}

      <div className="bg-white rounded-xl p-3 shadow-sm flex gap-2">
        <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="添加商品..."
          className="flex-1 text-sm border border-warm-200 rounded-lg p-2.5 focus:outline-none focus:border-mint-400"
          onKeyDown={e => e.key === 'Enter' && addManual()}
        />
        <input value={newQty} onChange={e => setNewQty(e.target.value)} placeholder="数量"
          className="w-20 text-sm border border-warm-200 rounded-lg p-2.5 focus:outline-none focus:border-mint-400"
        />
        <button onClick={addManual} className="text-sm bg-mint-500 text-white px-3 rounded-lg font-medium">+</button>
      </div>

      {items.length === 0 && checked.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm">购物清单为空</p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
              <button onClick={() => toggleShoppingItem(item.id)}
                className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs hover:border-mint-500">
              </button>
              <span className="text-lg">{CAT_ICONS[item.category] || '📦'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-800">{item.name}</div>
                <div className="text-xs text-gray-400">{item.qty}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REASON_COLORS[item.reason] || ''}`}>
                {REASON_LABELS[item.reason]}
              </span>
              <button onClick={() => deleteShoppingItem(item.id)} className="text-xs text-red-400">✕</button>
            </div>
          ))}
        </div>
      )}

      {checked.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 mb-2">已购买 ({checked.length})</h3>
          <div className="space-y-1">
            {checked.map(item => (
              <div key={item.id} className="bg-white/50 rounded-xl p-3 flex items-center gap-3 opacity-60">
                <button onClick={() => toggleShoppingItem(item.id)}
                  className="w-5 h-5 rounded-full bg-mint-500 border-mint-500 flex items-center justify-center text-xs text-white">✓</button>
                <span className="text-lg">{CAT_ICONS[item.category] || '📦'}</span>
                <div className="flex-1">
                  <span className="text-sm text-gray-500 line-through">{item.name}</span>
                </div>
                <button onClick={() => deleteShoppingItem(item.id)} className="text-xs text-red-300">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
