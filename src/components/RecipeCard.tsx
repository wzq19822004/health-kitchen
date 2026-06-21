import type { Recipe } from '../types'

const diffLabel = ['', '⭐ 简单', '⭐⭐ 中等', '⭐⭐⭐ 较难']
const diffColor = ['', '#5cb85c', '#f0ad4e', '#e74c3c']

interface Props {
  recipe: Recipe
  onClick: () => void
  cookedCount?: number
  lastCooked?: string
}

export default function RecipeCard({ recipe, onClick, cookedCount = 0, lastCooked }: Props) {
  return (
    <div onClick={onClick} className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer active:scale-[0.98] hover:-translate-y-1" style={{borderColor:'#E0DDD4'}}>
      {/* Image area with badges */}
      <div className="relative h-24 flex items-center justify-center text-4xl" style={{background: 'linear-gradient(135deg,#E8F5D8,#C8E6A0)'}}>
        <span className="diff-badge" style={{background: diffColor[recipe.difficulty] + '22', color: diffColor[recipe.difficulty]}}>
          {diffLabel[recipe.difficulty]}
        </span>
        <span className="cal-badge">🔥 {recipe.nutrition.cal}</span>
        <span>{recipe.emoji}</span>
      </div>
      {/* Body */}
      <div className="p-3.5">
        <h3 className="font-bold text-sm" style={{color:'#2D3B2F'}}>{recipe.name}</h3>
        <div className="text-xs mt-1.5" style={{color:'#5A6B5C'}}>
          {recipe.ingredients.map(i => i.name).join(' · ')}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs" style={{color:'#8A9B8C'}}>
          <span>⏱️ {recipe.cookTime}分钟</span>
          <span>{recipe.nutrition.protein}g蛋白 · {recipe.nutrition.carb}g碳水</span>
        </div>
      </div>
      {/* Meta footer */}
      {cookedCount > 0 && (
        <div className="border-t px-3.5 py-2 flex items-center justify-between" style={{borderColor:'#E0DDD4', background:'#FAFAF5'}}>
          <span className="tag tag-green">✓ 已做{cookedCount}次</span>
          {lastCooked && <span className="text-xs" style={{color:'#8A9B8C'}}>最近{lastCooked}</span>}
        </div>
      )}
    </div>
  )
}
