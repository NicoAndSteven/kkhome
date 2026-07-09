import { TruthOrDareCard, UndercoverWordPair } from './types'

export const undercoverWordPairs: UndercoverWordPair[] = [
  // 食物
  { id: 'fruit-apple-pear', civilianWord: '苹果', undercoverWord: '梨', category: '食物', difficulty: 'easy' },
  { id: 'food-hotpot-bbq', civilianWord: '火锅', undercoverWord: '烧烤', category: '食物', difficulty: 'easy' },
  { id: 'food-dumpling-wonton', civilianWord: '饺子', undercoverWord: '馄饨', category: '食物', difficulty: 'normal' },
  { id: 'food-noodle-rice-noodle', civilianWord: '面条', undercoverWord: '米线', category: '食物', difficulty: 'easy' },
  { id: 'food-bread-cake', civilianWord: '面包', undercoverWord: '蛋糕', category: '食物', difficulty: 'easy' },
  { id: 'food-ice-cream-gelato', civilianWord: '冰淇淋', undercoverWord: '雪糕', category: '食物', difficulty: 'normal' },
  { id: 'food-pizza-pancake', civilianWord: '披萨', undercoverWord: '煎饼', category: '食物', difficulty: 'normal' },
  // 饮品
  { id: 'drink-coffee-milk-tea', civilianWord: '咖啡', undercoverWord: '奶茶', category: '饮品', difficulty: 'easy' },
  { id: 'drink-cola-sprite', civilianWord: '可乐', undercoverWord: '雪碧', category: '饮品', difficulty: 'easy' },
  { id: 'drink-beer-wine', civilianWord: '啤酒', undercoverWord: '红酒', category: '饮品', difficulty: 'normal' },
  { id: 'drink-juice-smoothie', civilianWord: '果汁', undercoverWord: '奶昔', category: '饮品', difficulty: 'normal' },
  // 地点
  { id: 'place-cinema-theater', civilianWord: '电影院', undercoverWord: '剧场', category: '地点', difficulty: 'normal' },
  { id: 'place-library-bookstore', civilianWord: '图书馆', undercoverWord: '书店', category: '地点', difficulty: 'normal' },
  { id: 'place-hospital-clinic', civilianWord: '医院', undercoverWord: '诊所', category: '地点', difficulty: 'normal' },
  { id: 'place-park-garden', civilianWord: '公园', undercoverWord: '花园', category: '地点', difficulty: 'easy' },
  { id: 'place-school-university', civilianWord: '学校', undercoverWord: '大学', category: '地点', difficulty: 'easy' },
  { id: 'place-supermarket-mall', civilianWord: '超市', undercoverWord: '商场', category: '地点', difficulty: 'normal' },
  // 物品
  { id: 'tool-keyboard-mouse', civilianWord: '键盘', undercoverWord: '鼠标', category: '物品', difficulty: 'easy' },
  { id: 'tool-phone-tablet', civilianWord: '手机', undercoverWord: '平板', category: '物品', difficulty: 'easy' },
  { id: 'tool-glasses-sunglasses', civilianWord: '眼镜', undercoverWord: '墨镜', category: '物品', difficulty: 'normal' },
  { id: 'tool-backpack-suitcase', civilianWord: '书包', undercoverWord: '行李箱', category: '物品', difficulty: 'normal' },
  // 交通
  { id: 'transport-bus-subway', civilianWord: '公交车', undercoverWord: '地铁', category: '交通', difficulty: 'normal' },
  { id: 'transport-bike-scooter', civilianWord: '自行车', undercoverWord: '电动车', category: '交通', difficulty: 'normal' },
  { id: 'transport-taxi-ride-hail', civilianWord: '出租车', undercoverWord: '网约车', category: '交通', difficulty: 'normal' },
  // 职业
  { id: 'job-teacher-professor', civilianWord: '老师', undercoverWord: '教授', category: '职业', difficulty: 'normal' },
  { id: 'job-chef-cook', civilianWord: '厨师', undercoverWord: '主厨', category: '职业', difficulty: 'easy' },
  { id: 'job-doctor-nurse', civilianWord: '医生', undercoverWord: '护士', category: '职业', difficulty: 'easy' },
  { id: 'job-police-firefighter', civilianWord: '警察', undercoverWord: '消防员', category: '职业', difficulty: 'normal' },
  // 动物
  { id: 'animal-cat-dog', civilianWord: '猫', undercoverWord: '狗', category: '动物', difficulty: 'easy' },
  { id: 'animal-tiger-lion', civilianWord: '老虎', undercoverWord: '狮子', category: '动物', difficulty: 'normal' },
  { id: 'animal-eagle-owl', civilianWord: '老鹰', undercoverWord: '猫头鹰', category: '动物', difficulty: 'normal' },
]

export const truthOrDareCards: TruthOrDareCard[] = [
  // 真心话 - 轻松
  { id: 'truth-recent-laugh', type: 'truth', content: '最近一次笑到停不下来是因为什么？', category: '轻松', intensity: 'soft' },
  { id: 'truth-hidden-habit', type: 'truth', content: '说一个别人不知道的小习惯。', category: '轻松', intensity: 'soft' },
  { id: 'truth-favorite-song', type: 'truth', content: '最近单曲循环的歌是哪首？', category: '轻松', intensity: 'soft' },
  { id: 'truth-weird-food', type: 'truth', content: '你最喜欢的奇怪食物搭配是什么？', category: '轻松', intensity: 'soft' },
  { id: 'truth-early-bird', type: 'truth', content: '你是早起党还是熬夜党？', category: '轻松', intensity: 'soft' },
  { id: 'truth-phone-wallpaper', type: 'truth', content: '你的手机壁纸是什么？为什么选它？', category: '轻松', intensity: 'soft' },
  { id: 'truth-dream-job-child', type: 'truth', content: '小时候最想做什么职业？', category: '轻松', intensity: 'soft' },
  { id: 'truth-last-search', type: 'truth', content: '最近一次搜索记录是什么？', category: '轻松', intensity: 'soft' },
  // 真心话 - 社交
  { id: 'truth-favorite-player', type: 'truth', content: '这局里你最想和谁组队？', category: '社交', intensity: 'normal' },
  { id: 'truth-first-impression', type: 'truth', content: '说出你对在场某个人的第一印象。', category: '社交', intensity: 'normal' },
  { id: 'truth-most-admire', type: 'truth', content: '在座的人中你最欣赏谁？为什么？', category: '社交', intensity: 'normal' },
  { id: 'truth-secret-talent', type: 'truth', content: '你有什么隐藏技能？展示一下。', category: '社交', intensity: 'normal' },
  { id: 'truth-embarrassing-moment', type: 'truth', content: '分享你最近一次社死经历。', category: '社交', intensity: 'normal' },
  { id: 'truth-bucket-list', type: 'truth', content: '你的愿望清单上最想实现的 3 件事？', category: '社交', intensity: 'soft' },
  // 真心话 - 刺激
  { id: 'truth-last-lie', type: 'truth', content: '上次说谎是什么时候？说了什么？', category: '刺激', intensity: 'spicy' },
  { id: 'truth-crush', type: 'truth', content: '最近有没有心动的人？', category: '刺激', intensity: 'spicy' },
  { id: 'truth-worst-date', type: 'truth', content: '你遇到过最奇葩的约会经历是什么？', category: '刺激', intensity: 'spicy' },
  { id: 'truth-bad-habit', type: 'truth', content: '你最想改掉的坏习惯是什么？', category: '刺激', intensity: 'spicy' },
  // 大冒险 - 轻松互动
  { id: 'dare-compliment-left', type: 'dare', content: '认真夸一下你左边的人，至少说两个优点。', category: '互动', intensity: 'soft' },
  { id: 'dare-pose-photo', type: 'dare', content: '摆一个搞怪姿势，让大家拍照留念。', category: '互动', intensity: 'soft' },
  { id: 'dare-robot-dance', type: 'dare', content: '用机器人声音介绍自己 30 秒。', category: '互动', intensity: 'soft' },
  { id: 'dare-charades', type: 'dare', content: '用肢体动作表演一种动物，让大家猜。', category: '互动', intensity: 'soft' },
  { id: 'dare-stand-up', type: 'dare', content: '站起来原地转 5 圈，然后走直线。', category: '互动', intensity: 'soft' },
  { id: 'dare-handstand', type: 'dare', content: '和家人打一个视频电话，坚持1分钟不笑。', category: '互动', intensity: 'soft' },
  // 大冒险 - 表演
  { id: 'dare-host-voice', type: 'dare', content: '用主持人的语气宣布下一轮开始。', category: '表演', intensity: 'normal' },
  { id: 'dare-sing-chorus', type: 'dare', content: '唱一首歌的副歌部分，其他人跟唱。', category: '表演', intensity: 'normal' },
  { id: 'dare-rap-name', type: 'dare', content: '用 Rap 的节奏介绍自己的名字和爱好。', category: '表演', intensity: 'normal' },
  { id: 'dare-dramatic-reading', type: 'dare', content: '用最夸张的语气读一段新闻标题。', category: '表演', intensity: 'normal' },
  { id: 'dare-impersonate', type: 'dare', content: '模仿一个在场的人，让大家猜是谁。', category: '表演', intensity: 'spicy' },
  { id: 'dare-poem', type: 'dare', content: '即兴创作一首 4 句的打油诗。', category: '表演', intensity: 'normal' },
  // 大冒险 - 搞怪
  { id: 'dare-backwards-speak', type: 'dare', content: '倒着说一句话，其他人猜你在说什么。', category: '搞怪', intensity: 'normal' },
  { id: 'dare-tongue-twister', type: 'dare', content: '快速念 3 遍绕口令："吃葡萄不吐葡萄皮"', category: '搞怪', intensity: 'normal' },
  { id: 'dare-emoji-story', type: 'dare', content: '只用表情符号讲一个故事，让大家猜。', category: '搞怪', intensity: 'normal' },
  { id: 'dare-hold-pose', type: 'dare', content: '做一个瑜伽姿势，保持 15 秒。', category: '搞怪', intensity: 'normal' },
]

export const getDefaultWordPair = () => undercoverWordPairs[0]

export const getCardsByType = (type: TruthOrDareCard['type']) => (
  truthOrDareCards.filter((card) => card.type === type)
)
