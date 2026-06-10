export interface FoodItem {
  id: string
  name: string
  source: 'user' | 'builtin'
  disabled?: boolean
}

export interface EveningData {
  custom: FoodItem[]
  disabledIds: string[]
}

export interface WheelResult {
  item: FoodItem
  timestamp: string
  period: 'noon' | 'evening'
}

export type Period = 'noon' | 'evening'
