import { FoodItem } from './types'

export interface RecipeGroup {
  category: string   // 'vegetable' | 'meat' | 'soup' | 'staple' | 'cold' | 'seafood' | 'hotpot'
  label: string      // Chinese label for UI
  items: string[]
}

const RECIPE_GROUPS: RecipeGroup[] = [
  {
    category: 'vegetable', label: '素菜',
    items: [
      '番茄炒蛋', '酸辣土豆丝', '手撕包菜', '干煸四季豆', '地三鲜',
      '清炒时蔬', '蒜蓉空心菜', '蚝油生菜', '蒜蓉西兰花', '醋溜白菜',
      '鱼香茄子', '麻婆豆腐', '家常豆腐', '红烧茄子', '香煎豆腐',
      '蒜蓉豆角', '清炒荷兰豆', '香菇油菜', '腐乳通菜', '炝炒圆白菜',
      '干锅花菜', '素炒杏鲍菇', '虎皮青椒', '松仁玉米', '拔丝地瓜',
      '蜜汁南瓜', '荷塘小炒', '丝瓜炒蛋', '韭菜炒蛋', '葱烧豆腐',
    ],
  },
  {
    category: 'meat', label: '肉菜',
    items: [
      '红烧肉', '糖醋排骨', '可乐鸡翅', '回锅肉', '宫保鸡丁',
      '鱼香肉丝', '青椒肉丝', '木须肉', '土豆烧牛肉', '西红柿牛腩',
      '红烧排骨', '酱香鸡腿', '蜜汁鸡翅', '蒜香排骨', '椒盐排骨',
      '水煮肉片', '辣子鸡丁', '啤酒鸭', '红烧鸡块', '粉蒸肉',
      '梅菜扣肉', '红烧猪蹄', '卤牛肉', '葱爆羊肉', '京酱肉丝',
      '菠萝咕咾肉', '小炒肉', '干锅肥肠', '孜然牛肉', '糖醋里脊',
      '蒜蓉蒸排骨', '黑椒牛柳', '酱爆肉丁', '蒜香鸡翅', '豉汁蒸排骨',
    ],
  },
  {
    category: 'soup', label: '汤类',
    items: [
      '紫菜蛋花汤', '番茄蛋汤', '玉米排骨汤', '酸辣汤', '冬瓜排骨汤',
      '萝卜丝鲫鱼汤', '豆腐青菜汤', '菌菇汤', '紫菜虾皮汤', '番茄肉丸汤',
      '白菜豆腐汤', '味增汤', '南瓜浓汤', '花蛤冬瓜汤', '番茄牛腩汤',
      '海带排骨汤', '山药排骨汤', '莲藕排骨汤', '疙瘩汤', '豆腐鱼头汤',
    ],
  },
  {
    category: 'staple', label: '主食',
    items: [
      '蛋炒饭', '炒面', '煮面条', '炒河粉', '煎饺',
      '扬州炒饭', '西红柿鸡蛋面', '葱油拌面', '担担面', '酸辣粉',
      '肉酱意面', '炒米粉', '炒年糕', '焖饭', '煲仔饭',
      '炒饼', '汤圆', '饺子', '馄饨', '热干面',
      '炸酱面', '麻辣拌面', '葱油面', '阳春面', '麻辣烫',
    ],
  },
  {
    category: 'cold', label: '凉菜',
    items: [
      '凉拌黄瓜', '皮蛋豆腐', '口水鸡', '凉拌木耳', '凉拌海带丝',
      '凉拌皮蛋', '蒜泥白肉', '凉拌豆皮', '红油耳丝', '凉拌三丝',
      '凉拌藕片', '拍黄瓜', '凉拌西红柿', '手撕鸡', '夫妻肺片',
      '凉拌菠菜', '柠檬鸡爪', '凉拌金针菇', '凉拌粉丝', '葱油鸡',
    ],
  },
  {
    category: 'seafood', label: '海鲜',
    items: [
      '清蒸鲈鱼', '红烧鱼块', '酸菜鱼', '水煮鱼', '糖醋鱼',
      '椒盐虾', '白灼虾', '蒜蓉粉丝蒸扇贝', '葱姜炒蟹', '辣炒花蛤',
      '红烧带鱼', '油焖大虾', '蒜蓉生蚝', '干煎带鱼', '葱油鲈鱼',
    ],
  },
  {
    category: 'hotpot', label: '火锅/特色',
    items: [
      '麻辣火锅', '清汤火锅', '番茄火锅', '寿喜锅', '部队锅',
      '椰子鸡火锅', '粥底火锅', '涮羊肉', '串串香', '冒菜',
    ],
  },
]

/** Build a flat array of all recipe names indexed by their global position */
const FLAT_RECIPES: Array<{ id: string; name: string; category: string }> = []
for (const group of RECIPE_GROUPS) {
  for (const name of group.items) {
    FLAT_RECIPES.push({ id: `builtin-${FLAT_RECIPES.length}`, name, category: group.category })
  }
}

/** Build the full evening FoodItem list: builtins (with disabled status) + user custom items */
export function buildEveningItems(custom: FoodItem[], disabledIds: string[]): FoodItem[] {
  const builtins: FoodItem[] = FLAT_RECIPES.map(r => ({
    id: r.id,
    name: r.name,
    source: 'builtin' as const,
    disabled: disabledIds.includes(r.id),
  }))
  return [...builtins, ...custom.map(c => ({ ...c, disabled: false }))]
}

export function getRecipeGroups(): RecipeGroup[] {
  return RECIPE_GROUPS
}

/** Flat array of all built-in recipes with id (used in FoodManager for toggling) */
export function getFlatRecipes(): Array<{ id: string; name: string; category: string }> {
  return FLAT_RECIPES
}
