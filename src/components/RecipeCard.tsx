import type { Recipe } from '../types'

const diffLabel = ['', '⭐ 简单', '⭐⭐ 中等', '⭐⭐⭐ 较难']
const diffColor = ['', '#5cb85c', '#f0ad4e', '#e74c3c']

interface Props {
  recipe: Recipe
  onClick: () => void
  cookedCount?: number
  lastCooked?: string
  matchInfo?: { match: number; total: number; missing: string[]; pct: number }
}

export default function RecipeCard({ recipe, onClick, cookedCount = 0, lastCooked, matchInfo }: Props) {
  return (
    <div onClick={onClick}
      className="bg-white rounded-xl overflow-hidden transition-all cursor-pointer active:scale-[0.98]"
      style={{
        border: '1.5px solid #E0DDD4',
        boxShadow: '0 2px 16px rgba(62,90,48,0.10)',
      }}>
      {/* Image area - exact original specs */}
      <div className="relative flex items-center justify-center"
        style={{
          height: '130px',
          background: 'linear-gradient(135deg,#E8F5D8,#C8E6A0)',
          fontSize: '3.5rem',
        }}>
        <span className="diff-badge"
          style={{ background: diffColor[recipe.difficulty] + '22', color: diffColor[recipe.difficulty] }}>
          {diffLabel[recipe.difficulty]}
        </span>
        <span className="cal-badge">🔥 {recipe.nutrition.cal}</span>
        <span>{recipe.emoji}</span>
      </div>
      {/* Body - exact padding 14px */}
      <div style={{ padding: '14px' }}>
        <h3 className="font-bold" style={{ fontSize: '0.95rem', color: '#2D3B2F', marginBottom: '6px' }}>{recipe.name}</h3>
        <div className="ingredients-list" style={{ fontSize: '0.78rem', color: '#5A6B5C', marginBottom: '8px', lineHeight: 1.6 }}>
          {recipe.ingredients.map(i => i.name).join(' · ')}
        </div>
        <div className="flex items-center gap-3" style={{ fontSize: '0.75rem', color: '#8A9B8C' }}>
          <span>⏱️ {recipe.cookTime}分钟</span>
          <span>{recipe.nutrition.protein}g蛋白 · {recipe.nutrition.carb}g碳水</span>
        </div>
      </div>
      {/* Match badge */}
      {matchInfo && matchInfo.total > 0 && (
        <div className="px-3.5 py-2" style={{borderTop:'1px solid #E0DDD4'}}>
          <span className={"tag " + (matchInfo.match >= matchInfo.total ? 'tag-green' : matchInfo.match > 0 ? 'tag-orange' : 'tag-red')}>
            {matchInfo.match >= matchInfo.total ? '✅ 食材齐全' : matchInfo.match > 0 ? '⚠️ 缺' + matchInfo.missing.length + '种食材' : '❌ 缺' + matchInfo.missing.length + '种食材'}
          </span>
        </div>
      )}
      {/* Cooked footer */}
      {cookedCount > 0 && (
        <div className="flex items-center justify-between"
          style={{
            padding: '10px 14px',
            borderTop: '1px solid #E0DDD4',
            background: '#fafafa',
          }}>
          <span className="tag tag-green">✓ 已做{cookedCount}次</span>
          {lastCooked && <span style={{ fontSize: '0.75rem', color: '#8A9B8C' }}>最近{lastCooked}</span>}
        </div>
      )}
    </div>
  )
}
