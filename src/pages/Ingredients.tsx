import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { createIngredient, daysUntil, formatDate, now } from '../data/storage'
import { parseShoppingText } from '../lib/nlp-parser'
import type { Ingredient, IngredientCategory, Unit } from '../types'

const CATEGORIES: IngredientCategory[] = ['蔬菜','肉类','水产','碳水','水果','豆蛋','乳制品','调味品','其他']
const CAT_ICONS: Record<string, string> = { '蔬菜':'🥦','肉类':'🥩','水产':'🐟','碳水':'🍚','水果':'🍎','豆蛋':'🥚','乳制品':'🥛','调味品':'🧂','其他':'📦' }
const CAT_COLORS: Record<string, string> = {
  '蔬菜':'bg-green-soft','肉类':'bg-red-soft','水产':'bg-blue-soft','碳水':'bg-yellow-soft',
  '水果':'bg-orange-soft','豆蛋':'bg-yellow-soft','乳制品':'bg-blue-soft','调味品':'bg-gray-100','其他':'bg-gray-100'
}

interface FormData {
  name: string; category: IngredientCategory; quantity: number; unit: Unit
  calPer100g: number; expiryDate: string; note: string
}

const emptyForm = (): FormData => ({
  name: '', category: '蔬菜', quantity: 500, unit: 'g', calPer100g: 0, expiryDate: '', note: ''
})

export default function Ingredients() {
  const { data, addIngredient, updateIngredient, deleteIngredient } = useApp()
  const [catFilter, setCatFilter] = useState<IngredientCategory | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm())
  const [pasteText, setPasteText] = useState('')
  const [showBatch, setShowBatch] = useState(false)
  const [parseResult, setParseResult] = useState<{name: string; quantity: number; unit: string; category: string; defaultExpiryDays: number}[] | null>(null)

  const filtered = useMemo(() => {
    let list = data.ingredients
    if (catFilter !== 'all') list = list.filter(i => i.category === catFilter)
    return list.sort((a, b) => (a.expiryDate || '').localeCompare(b.expiryDate || ''))
  }, [data.ingredients, catFilter])

  function handlePaste() {
    if (!pasteText.trim()) return
    const parsed = parseShoppingText(pasteText)
    setParseResult(parsed.map(p => ({
      name: p.name, quantity: p.quantity, unit: p.unit,
      category: p.category, defaultExpiryDays: p.defaultExpiryDays,
    })))
  }

  function confirmParse() {
    if (!parseResult) return
    // Aggregate duplicate names
    const merged = new Map<string, { quantity: number; unit: string; category: string; days: number }>()
    for (const item of parseResult) {
      const prev = merged.get(item.name)
      if (prev) {
        prev.quantity += item.quantity
        prev.days = Math.min(prev.days, item.defaultExpiryDays)
      } else {
        merged.set(item.name, { quantity: item.quantity, unit: item.unit, category: item.category, days: item.defaultExpiryDays })
      }
    }
    const today = new Date()
    for (const [name, info] of merged) {
      const existing = data.ingredients.find(i => i.name === name)
      const expiryDate = new Date(today.getTime() + info.days * 86400000).toISOString().split('T')[0]
      if (existing) {
        updateIngredient(existing.id, { quantity: existing.quantity + info.quantity, updatedAt: now() })
      } else {
        addIngredient(createIngredient(name, info.category as IngredientCategory, info.quantity, info.unit as Unit, 0, expiryDate))
      }
    }
    setPasteText('')
    setParseResult(null)
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm())
    setShowForm(true)
  }

  function openEdit(ing: Ingredient) {
    setEditingId(ing.id)
    setForm({
      name: ing.name, category: ing.category, quantity: ing.quantity, unit: ing.unit,
      calPer100g: ing.calPer100g, expiryDate: ing.expiryDate || '', note: ing.note || ''
    })
    setShowForm(true)
  }

  function saveForm() {
    if (!form.name.trim()) return
    if (editingId) {
      updateIngredient(editingId, {
        name: form.name, category: form.category, quantity: form.quantity, unit: form.unit,
        calPer100g: form.calPer100g, expiryDate: form.expiryDate || undefined, note: form.note || undefined,
      })
    } else {
      // Merge with existing ingredient if same name
      const existing = data.ingredients.find(i => i.name === form.name)
      if (existing) {
        updateIngredient(existing.id, {
          quantity: existing.quantity + form.quantity,
          category: form.category,
          unit: form.unit,
          calPer100g: form.calPer100g || existing.calPer100g,
          expiryDate: form.expiryDate || existing.expiryDate,
          note: form.note || existing.note,
          updatedAt: now(),
        })
      } else {
        addIngredient(createIngredient(
          form.name, form.category, form.quantity, form.unit,
          form.calPer100g, form.expiryDate || undefined, form.note || undefined
        ))
      }
    }
    setShowForm(false)
  }

  function stockColor(ing: Ingredient): string {
    if (!ing.expiryDate) return 'text-gray-600'
    const d = daysUntil(ing.expiryDate)
    if (d < 0) return 'text-red-600 font-bold'
    if (d <= 3) return 'text-orange-600'
    return 'text-gray-600'
  }

  function stockLabel(ing: Ingredient): string {
    if (!ing.expiryDate) return ''
    const d = daysUntil(ing.expiryDate)
    if (d < 0) return `已过期 ${Math.abs(d)}天`
    if (d === 0) return '今天过期'
    return `还有${d}天`
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="section-card">
        <div className="section-header">
          <h2><span>🥬</span> 食材库存管理</h2>
          <button onClick={openAdd} className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full font-medium hover:bg-white/30 transition">+ 添加</button>
        </div>
        <div className="section-body">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-gray-800">🥬 食材库存</h2>
        <button onClick={openAdd} className="text-sm bg-mint-500 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-mint-600">+ 添加</button>
      </div>

      {/* Batch add toggle */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <button onClick={() => setShowBatch(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <span>📋 批量添加食材</span>
          <span className={`text-gray-400 transition-transform ${showBatch ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showBatch && (
          <div className="px-4 pb-4 border-t border-warm-200 pt-3">
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="粘贴购物清单：鸡胸肉500g 西兰花1颗 鸡蛋1板 牛奶1L"
              className="w-full text-sm border border-warm-200 rounded-lg p-2.5 resize-none h-20 focus:outline-none focus:border-mint-400"
            />
            <p className="text-xs text-gray-400 mt-1 mb-2">支持「5个苹果」「番茄x3」「鸡翅 500g」等常见格式</p>
            <button onClick={handlePaste} disabled={!pasteText.trim()}
              className="text-sm bg-mint-500 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-mint-600 disabled:opacity-50 transition">🔍 解析</button>
            {parseResult && (
              <div className="mt-3 bg-mint-50 rounded-lg p-3">
                <div className="text-xs font-bold text-mint-700 mb-1.5">📋 解析结果（共 {parseResult.length} 项）：</div>
                {parseResult.map((item, i) => (
                  <div key={i} className="text-xs text-gray-700 py-0.5">{CAT_ICONS[item.category] || '📦'} {item.name} × {item.quantity}{item.unit}</div>
                ))}
                <div className="flex gap-2 mt-2.5">
                  <button onClick={confirmParse} className="text-sm bg-mint-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-mint-700 transition">✅ 确认入库</button>
                  <button onClick={() => { setParseResult(null); setPasteText('') }} className="text-sm bg-gray-200 text-gray-600 px-4 py-1.5 rounded-lg font-medium hover:bg-gray-300 transition">清空</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setCatFilter('all')} className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${catFilter === 'all' ? 'bg-mint-500 text-white' : 'bg-white text-gray-600'}`}>全部</button>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)} className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${catFilter === cat ? 'bg-mint-500 text-white' : 'bg-white text-gray-600'}`}>{CAT_ICONS[cat]} {cat}</button>
        ))}
      </div>

      {/* Ingredient list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🥕</div>
            <p className="text-sm">还没有食材，快去添加吧</p>
          </div>
        ) : filtered.map(ing => (
          <div key={ing.id} className={`${CAT_COLORS[ing.category] || 'bg-white'} rounded-xl p-3 flex items-center gap-3`}>
            <span className="text-2xl">{CAT_ICONS[ing.category] || '📦'}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-800">{ing.name}</div>
              <div className="text-xs text-gray-500">{ing.quantity}{ing.unit} · {ing.calPer100g}kcal/100g · {ing.category}</div>
              {ing.expiryDate && (
                <div className={`text-xs mt-0.5 ${stockColor(ing)}`}>
                  {formatDate(ing.expiryDate)}到期 · {stockLabel(ing)}
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(ing)} className="text-xs bg-white border border-warm-200 px-2.5 py-1 rounded-lg text-gray-600">✏️</button>
              <button onClick={() => deleteIngredient(ing.id)} className="text-xs bg-white border border-warm-200 px-2.5 py-1 rounded-lg text-red-500">🗑️</button>
            </div>
          </div>
        ))}

        </div>
      </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-4">{editingId ? '✏️ 编辑食材' : '➕ 添加食材'}</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="食材名称" className="w-full text-sm border border-warm-200 rounded-lg p-2.5 focus:outline-none focus:border-mint-400" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value as IngredientCategory}))} className="text-sm border border-warm-200 rounded-lg p-2.5 focus:outline-none focus:border-mint-400">
                  {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
                <select value={form.unit} onChange={e => setForm(f => ({...f, unit: e.target.value as Unit}))} className="text-sm border border-warm-200 rounded-lg p-2.5 focus:outline-none focus:border-mint-400">
                  {['g','个','ml','把','颗','盒','袋','板'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: Number(e.target.value)}))} placeholder="数量" className="text-sm border border-warm-200 rounded-lg p-2.5 focus:outline-none focus:border-mint-400" />
                <input type="number" value={form.calPer100g} onChange={e => setForm(f => ({...f, calPer100g: Number(e.target.value)}))} placeholder="kcal/100g" className="text-sm border border-warm-200 rounded-lg p-2.5 focus:outline-none focus:border-mint-400" />
              </div>
              <input type="date" value={form.expiryDate} onChange={e => setForm(f => ({...f, expiryDate: e.target.value}))} className="w-full text-sm border border-warm-200 rounded-lg p-2.5 focus:outline-none focus:border-mint-400" />
              <input value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} placeholder="备注（选填）" className="w-full text-sm border border-warm-200 rounded-lg p-2.5 focus:outline-none focus:border-mint-400" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveForm} className="flex-1 bg-mint-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-mint-600">保存</button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
