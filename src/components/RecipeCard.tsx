import type { Recipe } from '../types'

const diffLabel = ['', '⭐简单', '⭐⭐中等', '⭐⭐⭐较难']
const diffColor = ['', 'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700', 'bg-red-100 text-red-700']
const mealLabel: Record<string, string> = { '早餐': '🌅', '午餐': '☀️', '晚餐': '🌙', '加餐': '🍎' }

interface Props {
  recipe: Recipe
  onClick: () => void
  cookedCount?: number
  lastCooked?: string
}

export default function RecipeCard({ recipe, onClick, cookedCount = 0, lastCooked }: Props) {
  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-warm-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
      <div className="bg-gradient-to-br from-mint-50 to-mint-100 h-24 flex items-center justify-center text-4xl relative">
        <span className={diffColor[recipe.difficulty] + ' absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium'}>
          {diffLabel[recipe.difficulty]}
        </span>
        <span className="absolute top-2 right-2 bg-white/80 rounded-full px-2 py-0.5 text-xs font-bold text-mint-700">
          🔥 {recipe.nutrition.cal}
        </span>
        <span>{recipe.emoji}</span>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-gray-800 mb-1">{recipe.name}</h3>
        <div className="text-xs text-gray-500 mb-2 line-clamp-2">
          {recipe.ingredients.map(i => i.name).join(' · ')}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>⏱️ {recipe.cookTime}分钟</span>
          <span>{mealLabel[recipe.mealType] || '🍽️'} {recipe.mealType}</span>
        </div>
        {cookedCount > 0 && (
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <span className="text-mint-600">✓ 已做{cookedCount}次</span>
            {lastCooked && <span className="text-gray-400">最近{lastCooked}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
