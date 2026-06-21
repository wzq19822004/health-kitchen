export interface Utensil {
  id: string
  name: string
  icon: string
  note: string
}

export const UTENSILS: Utensil[] = [
  { id: 'pan', name: '炒锅', icon: '🍳', note: '炒菜必备' },
  { id: 'wok', name: '平底锅', icon: '🥘', note: '煎蛋/烙饼' },
  { id: 'pot', name: '汤锅', icon: '🫕', note: '煲汤/煮面' },
  { id: 'steamer', name: '蒸锅', icon: '♨️', note: '蒸鱼/馒头' },
  { id: 'rice-cooker', name: '电饭煲', icon: '🍚', note: '煮饭/煮粥' },
  { id: 'oven', name: '烤箱', icon: '🔥', note: '烘焙/烤制' },
  { id: 'microwave', name: '微波炉', icon: '📡', note: '加热/解冻' },
  { id: 'air-fryer', name: '空气炸锅', icon: '🔄', note: '无油炸制' },
  { id: 'blender', name: '料理机', icon: '⚡', note: '打碎/搅拌' },
  { id: 'slow-cooker', name: '电炖锅', icon: '⏱️', note: '慢炖/煲汤' },
  { id: 'pressure-cooker', name: '高压锅', icon: '💨', note: '快速炖煮' },
  { id: 'toaster', name: '吐司机', icon: '🍞', note: '烤面包' },
  { id: 'knife', name: '菜刀', icon: '🔪', note: '切菜' },
  { id: 'cutting-board', name: '砧板', icon: '🪵', note: '切菜垫板' },
  { id: 'scale', name: '厨房秤', icon: '⚖️', note: '称量食材' },
]
