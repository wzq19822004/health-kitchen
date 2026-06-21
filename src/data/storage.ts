import type { Ingredient, MealLog, ShoppingItem, AppData } from '../types'

const STORAGE_KEY = 'health_kitchen_data'

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function now(): string {
  return new Date().toISOString()
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    ingredients: [],
    customRecipes: [],
    mealLogs: [],
    shoppingList: [],
    currentMenu: null,
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

export function createIngredient(
  name: string,
  category: Ingredient['category'],
  quantity: number,
  unit: Ingredient['unit'],
  calPer100g: number,
  expiryDate?: string,
  note?: string,
): Ingredient {
  return {
    id: genId(),
    name, category, quantity, unit,
    purchaseDate: today(),
    calPer100g,
    expiryDate,
    note,
    createdAt: now(),
    updatedAt: now(),
  }
}

export function createMealLog(
  recipeId: string,
  recipeName: string,
  mealType: MealLog['mealType'],
  date: string,
): MealLog {
  return {
    id: genId(),
    date,
    mealType,
    recipeId,
    recipeName,
    cooked: false,
  }
}

export function createShoppingItem(
  name: string,
  qty: string,
  category: ShoppingItem['category'],
  reason: ShoppingItem['reason'],
): ShoppingItem {
  return {
    id: genId(),
    name, qty, category, reason,
    checked: false,
    createdAt: now(),
  }
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function daysUntil(dateStr: string): number {
  const d = new Date(dateStr)
  const n = new Date()
  n.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - n.getTime()) / 86400000)
}
