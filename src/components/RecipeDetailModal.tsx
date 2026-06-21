import type { Recipe } from '../types'

const diffLabel = ['', '⭐ 简单', '⭐⭐ 中等', '⭐⭐⭐ 较难']

interface Props {
  recipe: Recipe | null
  onClose: () => void
}

export default function RecipeDetailModal({ recipe, onClose }: Props) {
  if (!recipe) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-warm-100 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-bold text-lg">{recipe.emoji} {recipe.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="p-4 space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-mint-100 text-mint-700 px-3 py-1 rounded-full font-medium">🔥 {recipe.nutrition.cal} kcal</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">{diffLabel[recipe.difficulty]}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">⏱️ {recipe.cookTime}分钟</span>
            {recipe.tags.map(t => (
              <span key={t} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">{t}</span>
            ))}
          </div>
          {/* Nutrition */}
          <div className="grid grid-cols-4 gap-2 bg-mint-50 rounded-xl p-3 text-center text-sm">
            <div><div className="font-bold text-mint-700">{recipe.nutrition.cal}</div><div className="text-xs text-gray-500">热量</div></div>
            <div><div className="font-bold text-mint-700">{recipe.nutrition.protein}g</div><div className="text-xs text-gray-500">蛋白质</div></div>
            <div><div className="font-bold text-mint-700">{recipe.nutrition.carb}g</div><div className="text-xs text-gray-500">碳水</div></div>
            <div><div className="font-bold text-mint-700">{recipe.nutrition.fat}g</div><div className="text-xs text-gray-500">脂肪</div></div>
          </div>
          {/* Ingredients */}
          <div>
            <h3 className="font-bold text-sm text-gray-700 mb-2">🥘 食材</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.ingredients.map(i => (
                <span key={i.name} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{i.name} {i.qty}</span>
              ))}
            </div>
          </div>
          {/* Steps */}
          <div>
            <h3 className="font-bold text-sm text-gray-700 mb-2">👩‍🍳 步骤</h3>
            <ol className="space-y-2">
              {recipe.steps.map((s, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="font-bold text-mint-600 min-w-[1.2rem]">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
