import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Ingredient, Recipe, MealLog, ShoppingItem, DailyMenu, AppData } from '../types'
import { loadData, saveData, now } from '../data/storage'

interface AppContextType {
  data: AppData
  addIngredient: (ing: Ingredient) => void
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void
  deleteIngredient: (id: string) => void
  addMealLog: (log: MealLog) => void
  updateMealLog: (id: string, updates: Partial<MealLog>) => void
  toggleCooked: (id: string) => void
  deleteMealLog: (id: string) => void
  addShoppingItem: (item: ShoppingItem) => void
  toggleShoppingItem: (id: string) => void
  deleteShoppingItem: (id: string) => void
  addCustomRecipe: (recipe: Recipe) => void
  deleteCustomRecipe: (id: string) => void
  setCurrentMenu: (menu: DailyMenu | null) => void
}

const AppCtx = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => { saveData(data) }, [data])

  const addIngredient = useCallback((ing: Ingredient) =>
    setData(d => ({ ...d, ingredients: [...d.ingredients, ing] })), [])
  const updateIngredient = useCallback((id: string, updates: Partial<Ingredient>) =>
    setData(d => ({ ...d, ingredients: d.ingredients.map(i => i.id === id ? { ...i, ...updates, updatedAt: now() } : i) })), [])
  const deleteIngredient = useCallback((id: string) =>
    setData(d => ({ ...d, ingredients: d.ingredients.filter(i => i.id !== id) })), [])
  const addMealLog = useCallback((log: MealLog) =>
    setData(d => ({ ...d, mealLogs: [...d.mealLogs, log] })), [])
  const updateMealLog = useCallback((id: string, updates: Partial<MealLog>) =>
    setData(d => ({ ...d, mealLogs: d.mealLogs.map(l => l.id === id ? { ...l, ...updates } : l) })), [])
  const toggleCooked = useCallback((id: string) =>
    setData(d => ({ ...d, mealLogs: d.mealLogs.map(l => l.id === id ? { ...l, cooked: !l.cooked, cookedAt: !l.cooked ? now() : undefined } : l) })), [])
  const deleteMealLog = useCallback((id: string) =>
    setData(d => ({ ...d, mealLogs: d.mealLogs.filter(l => l.id !== id) })), [])
  const addShoppingItem = useCallback((item: ShoppingItem) =>
    setData(d => ({ ...d, shoppingList: [...d.shoppingList, item] })), [])
  const toggleShoppingItem = useCallback((id: string) =>
    setData(d => ({ ...d, shoppingList: d.shoppingList.map(s => s.id === id ? { ...s, checked: !s.checked } : s) })), [])
  const deleteShoppingItem = useCallback((id: string) =>
    setData(d => ({ ...d, shoppingList: d.shoppingList.filter(s => s.id !== id) })), [])
  const addCustomRecipe = useCallback((recipe: Recipe) =>
    setData(d => ({ ...d, customRecipes: [...d.customRecipes, recipe] })), [])
  const deleteCustomRecipe = useCallback((id: string) =>
    setData(d => ({ ...d, customRecipes: d.customRecipes.filter(r => r.id !== id) })), [])
  const setCurrentMenu = useCallback((menu: DailyMenu | null) =>
    setData(d => ({ ...d, currentMenu: menu })), [])

  return (
    <AppCtx value={{
      data, addIngredient, updateIngredient, deleteIngredient,
      addMealLog, updateMealLog, toggleCooked, deleteMealLog,
      addShoppingItem, toggleShoppingItem, deleteShoppingItem,
      addCustomRecipe, deleteCustomRecipe, setCurrentMenu,
    }}>
      {children}
    </AppCtx>
  )
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
