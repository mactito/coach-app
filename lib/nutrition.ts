export type Meal = { id: string; day: number; position: number; title: string; description: string; protein: number; carbs: number; fat: number }
export type Target = { kcal: number; protein: number; carbs: number; fat: number }
export const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
export const FULL = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
export const kcal = (m: { protein: number; carbs: number; fat: number }) => m.protein * 4 + m.carbs * 4 + m.fat * 9
export const DEFAULT_TARGET: Target = { kcal: 2200, protein: 160, carbs: 240, fat: 70 }
// Monday = 0, in Italian time
export const todayIndex = () => (new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' })).getDay() + 6) % 7
