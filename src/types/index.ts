export type IngredientCategory =
  | '蔬菜' | '肉类' | '水产' | '碳水' | '水果'
  | '豆蛋' | '乳制品' | '调味品' | '其他'

export type Unit = 'g' | '个' | 'ml' | '把' | '颗' | '盒' | '袋' | '板'

export type MealType = '早餐' | '午餐' | '晚餐' | '加餐'

export type Difficulty = 1 | 2 | 3

export type RecipeSource = 'builtin' | 'custom' | 'imported'

export type ShoppingReason = 'low_stock' | 'recipe_need' | 'manual'

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  quantity: number
  unit: Unit
  expiryDate?: string
  purchaseDate: string
  calPer100g: number
  note?: string
  createdAt: string
  updatedAt: string
}

export interface RecipeIngredient {
  name: string
  qty: string
}

export interface Nutrition {
  cal: number
  protein: number
  carb: number
  fat: number
}

export interface Recipe {
  id: string
  name: string
  mealType: MealType
  difficulty: Difficulty
  ingredients: RecipeIngredient[]
  steps: string[]
  cookTime: number
  nutrition: Nutrition
  tags: string[]
  emoji: string
  source: RecipeSource
  sourceUrl?: string
}

export interface MealLog {
  id: string
  date: string
  mealType: MealType
  recipeId: string
  recipeName: string
  cooked: boolean
  cookedAt?: string
  photoId?: string
  rating?: 1 | 2 | 3 | 4 | 5
  note?: string
}

export interface ShoppingItem {
  id: string
  name: string
  qty: string
  category: IngredientCategory
  reason: ShoppingReason
  checked: boolean
  createdAt: string
}

export interface ParsedIngredient {
  name: string
  quantity: number
  unit: Unit
  category: IngredientCategory
  defaultExpiryDays: number
}

export interface DailyMenu {
  breakfast: Recipe[]
  lunch: Recipe[]
  dinner: Recipe[]
  snack: Recipe[]
}

export interface AppData {
  ingredients: Ingredient[]
  customRecipes: Recipe[]
  mealLogs: MealLog[]
  shoppingList: ShoppingItem[]
  currentMenu: DailyMenu | null
}
