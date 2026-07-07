import { TruthOrDareCard, UndercoverWordPair } from './types'

export const undercoverWordPairs: UndercoverWordPair[] = [
  { id: 'fruit-apple-pear', civilianWord: '苹果', undercoverWord: '梨', category: '生活', difficulty: 'easy' },
  { id: 'drink-coffee-milk-tea', civilianWord: '咖啡', undercoverWord: '奶茶', category: '生活', difficulty: 'easy' },
  { id: 'place-cinema-theater', civilianWord: '电影院', undercoverWord: '剧场', category: '地点', difficulty: 'normal' },
  { id: 'tool-keyboard-mouse', civilianWord: '键盘', undercoverWord: '鼠标', category: '物品', difficulty: 'easy' },
  { id: 'food-hotpot-bbq', civilianWord: '火锅', undercoverWord: '烧烤', category: '食物', difficulty: 'easy' },
]

export const truthOrDareCards: TruthOrDareCard[] = [
  { id: 'truth-recent-laugh', type: 'truth', content: '最近一次笑到停不下来是因为什么？', category: '轻松', intensity: 'soft' },
  { id: 'truth-favorite-player', type: 'truth', content: '这局里你最想和谁组队？', category: '社交', intensity: 'normal' },
  { id: 'truth-hidden-habit', type: 'truth', content: '说一个你的小习惯。', category: '轻松', intensity: 'soft' },
  { id: 'dare-compliment-left', type: 'dare', content: '认真夸一下你左边的人，至少说两句。', category: '互动', intensity: 'soft' },
  { id: 'dare-pose-photo', type: 'dare', content: '摆一个胜利姿势，保持 5 秒。', category: '互动', intensity: 'soft' },
  { id: 'dare-host-voice', type: 'dare', content: '用主持人的语气宣布下一轮开始。', category: '表演', intensity: 'normal' },
]

export const getDefaultWordPair = () => undercoverWordPairs[0]

export const getCardsByType = (type: TruthOrDareCard['type']) => (
  truthOrDareCards.filter((card) => card.type === type)
)
