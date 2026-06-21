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
  const days = Math.floor((Date.now() - new Date(logs[0].cookedAt!).getTime()) / 86400000)
  return days
}

function hasIngredients(recipe: Recipe, ingredients: Ingredient[]): boolean {
  const ingNames = ingredients.map(i => i.name.toLowerCase())
  const mainIngs = recipe.ingredients.slice(0, 3)
  return mainIngs.some(ri => ingNames.some(n => n.includes(ri.name) || ri.name.includes(n)))
}

export function generateDailyMenu(
  recipes: Recipe[],
  ingredients: Ingredient[],
  mealLogs: MealLog[],
  difficultyLimit: 1 | 2 | 3 = 2,
): DailyMenu {
  const eligible = recipes.filter(r => {
    if (r.difficulty > difficultyLimit) return false
    if (r.source === 'builtin' && !hasIngredients(r, ingredients)) return false
    return true
  })

  const scored = eligible.map(r => {
    const cookedCount = getRecipeCookCount(mealLogs, r.id)
    const lastCooked = getLastCookedDay(mealLogs, r.id)
    let score = Math.random() * 10
    if (cookedCount === 0) score += 8
    else if (lastCooked !== null && lastCooked > 7) score += 5
    else if (cookedCount < 3) score += 2
    return { recipe: r, score }
  })

  scored.sort((a, b) => b.score - a.score)

  const menu: DailyMenu = { breakfast: [], lunch: [], dinner: [], snack: [] }
  const maxPerMeal = { breakfast: 2, lunch: 3, dinner: 3, snack: 1 }

  for (const { recipe } of scored) {
    const meal = recipe.mealType as keyof DailyMenu
    if (menu[meal].length < maxPerMeal[meal]) {
      menu[meal].push(recipe)
    }
  }

  return menu
}
