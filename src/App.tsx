import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Ingredients from './pages/Ingredients'
import Recipes from './pages/Recipes'
import MealLog from './pages/MealLog'
import ShoppingList from './pages/ShoppingList'

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="meal-log" element={<MealLog />} />
          <Route path="shopping-list" element={<ShoppingList />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}
