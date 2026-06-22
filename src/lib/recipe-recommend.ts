import type { Recipe, MealLog, DailyMenu, Ingredient } from '../types'
import builtinRecipes from '../data/builtin-recipes.json'

export function getAllRecipes(customRecipes: Recipe[]): Recipe[] {
  const builtin = builtinRecipes as Recipe[]
  return [...builtin, ...customRecipes]
}

export function getCookedIds(mealLogs: MealLog[]): Set<string> {
  return new Set(mealLogs.filter(l => l.cooked).map(l => l.recipeId))
}

export function getRecipeCookCount(mealLogs: MealLog[], recipeId: string): number {
  return mealLogs.filter(l => l.recipeId === recipeId && l.cooked).length
}

export function getLastCookedDay(mealLogs: MealLog[], recipeId: string): number | null {
  const logs = mealLogs.filter(l => l.recipeId === recipeId && l.cooked).sort((a, b) => b.cookedAt!.localeCompare(a.cookedAt!))
  if (!logs.length) return null
  return Math.floor((Date.now() - new Date(logs[0].cookedAt!).getTime()) / 86400000)
}

/** Count how many recipe ingredients are available in stock */
export function getIngredientMatch(
  recipe: Recipe,
  ingredients: Ingredient[]
): { match: number; total: number; missing: string[]; pct: number } {
  const ingNames = ingredients.map(i => i.name.toLowerCase())
  // Check main ingredients (skip salt/oil/seasonings)
  const mains = recipe.ingredients.filter(i => {
    const n = i.name.toLowerCase()
    return !['盐','糖','油','生抽','老抽','醋','料酒','蚝油','豆瓣酱','番茄酱','蜂蜜','香油','花椒','八角','桂皮','姜','蒜','葱','辣椒','淀粉','水'].includes(n)
  })
  const matched: string[] = []
  const missing: string[] = []
  for (const ri of mains) {
    const found = ingNames.some(n => n.includes(ri.name) || ri.name.includes(n))
    if (found) matched.push(ri.name)
    else missing.push(ri.name)
  }
  return {
    match: matched.length,
    total: mains.length,
    missing,
    pct: mains.length === 0 ? 100 : Math.round(matched.length / mains.length * 100),
  }
}

function hasIngredients(recipe: Recipe, ingredients: Ingredient[]): boolean {
  return getIngredientMatch(recipe, ingredients).match >= Math.min(1, recipe.ingredients.length)
}

export function generateDailyMenu(
  recipes: Recipe[],
  ingredients: Ingredient[],
  mealLogs: MealLog[],
  difficultyLimit: 1 | 2 | 3 = 2,
): DailyMenu {
  let eligible = recipes.filter(r => {
    if (r.difficulty > difficultyLimit) return false
    if (r.source === 'builtin' && !hasIngredients(r, ingredients)) return false
    return true
  })
  if (eligible.length === 0) {
    eligible = recipes.filter(r => r.difficulty <= difficultyLimit)
  }

  const scored = eligible.map(r => {
    const cookedCount = getRecipeCookCount(mealLogs, r.id)
    const lastCooked = getLastCookedDay(mealLogs, r.id)
    const match = getIngredientMatch(r, ingredients)
    let score = Math.random() * 10
    // Higher ingredient match = higher score
    score += match.pct / 10
    if (cookedCount === 0) score += 8
    else if (lastCooked !== null && lastCooked > 7) score += 5
    else if (cookedCount < 3) score += 2
    return { recipe: r, score }
  })

  scored.sort((a, b) => b.score - a.score)

  const menu: DailyMenu = { breakfast: [], lunch: [], dinner: [], snack: [] }
  const maxPerMeal = { breakfast: 2, lunch: 3, dinner: 3, snack: 1 }
  const mealKey: Record<string, keyof DailyMenu> = { '早餐': 'breakfast', '午餐': 'lunch', '晚餐': 'dinner', '加餐': 'snack' }

  for (const { recipe } of scored) {
    const meal = mealKey[recipe.mealType]
    if (meal && menu[meal].length < maxPerMeal[meal]) {
      menu[meal].push(recipe)
    }
  }

  return menu
}
