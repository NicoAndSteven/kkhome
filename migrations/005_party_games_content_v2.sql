-- ============================================================================
-- Party Games Content v2 — Rich content expansion
-- Undercover word pairs: ~80 across 12 categories
-- Truth-or-dare cards: ~120 across 10 categories × 3 intensities
-- ============================================================================

-- 清空旧数据，用 v2 内容替换
DELETE FROM party_undercover_word_pairs;
DELETE FROM party_truth_or_dare_cards;

-- ============================================================================
-- 谁是卧底 词对 — 12 个类别，~80 组
-- ============================================================================

-- 食物 (8)
INSERT INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('food-apple-pear', '苹果', '梨', '食物', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('food-hotpot-bbq', '火锅', '烧烤', '食物', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('food-dumpling-wonton', '饺子', '馄饨', '食物', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('food-noodle-rice-noodle', '面条', '米线', '食物', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('food-bread-cake', '面包', '蛋糕', '食物', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('food-ice-cream-gelato', '冰淇淋', '雪糕', '食物', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('food-pizza-pancake', '披萨', '煎饼', '食物', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('food-sushi-sashimi', '寿司', '刺身', '食物', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- 饮品 (6)
INSERT INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('drink-coffee-milk-tea', '咖啡', '奶茶', '饮品', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('drink-cola-sprite', '可乐', '雪碧', '饮品', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('drink-beer-wine', '啤酒', '红酒', '饮品', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('drink-juice-smoothie', '果汁', '奶昔', '饮品', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('drink-tea-bubble-tea', '茶', '珍珠奶茶', '饮品', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('drink-water-sparkling', '白开水', '气泡水', '饮品', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- 地点 (8)
INSERT INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('place-cinema-theater', '电影院', '剧场', '地点', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('place-library-bookstore', '图书馆', '书店', '地点', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('place-hospital-clinic', '医院', '诊所', '地点', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('place-park-garden', '公园', '花园', '地点', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('place-school-university', '学校', '大学', '地点', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('place-supermarket-mall', '超市', '商场', '地点', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('place-airport-station', '机场', '火车站', '地点', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('place-beach-pool', '海滩', '游泳池', '地点', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- 物品 (8)
INSERT INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('item-keyboard-mouse', '键盘', '鼠标', '物品', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('item-phone-tablet', '手机', '平板', '物品', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('item-glasses-sunglasses', '眼镜', '墨镜', '物品', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('item-backpack-suitcase', '书包', '行李箱', '物品', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('item-watch-clock', '手表', '闹钟', '物品', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('item-book-magazine', '书', '杂志', '物品', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('item-pillow-blanket', '枕头', '毯子', '物品', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('item-lipstick-lip-balm', '口红', '润唇膏', '物品', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- 交通 (6)
INSERT INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('transport-bus-subway', '公交车', '地铁', '交通', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('transport-bike-scooter', '自行车', '电动车', '交通', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('transport-taxi-ride-hail', '出租车', '网约车', '交通', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('transport-car-suv', '轿车', 'SUV', '交通', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('transport-plane-helicopter', '飞机', '直升机', '交通', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('transport-ship-boat', '轮船', '快艇', '交通', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- 职业 (7)
INSERT INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('job-teacher-professor', '老师', '教授', '职业', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('job-chef-cook', '厨师', '主厨', '职业', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('job-doctor-nurse', '医生', '护士', '职业', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('job-police-firefighter', '警察', '消防员', '职业', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('job-actor-director', '演员', '导演', '职业', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('job-lawyer-judge', '律师', '法官', '职业', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('job-pilot-steward', '飞行员', '空乘', '职业', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- 动物 (6)
INSERT INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('animal-cat-dog', '猫', '狗', '动物', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('animal-tiger-lion', '老虎', '狮子', '动物', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('animal-eagle-owl', '老鹰', '猫头鹰', '动物', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('animal-dolphin-shark', '海豚', '鲨鱼', '动物', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('animal-horse-donkey', '马', '驴', '动物', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('animal-frog-toad', '青蛙', '蟾蜍', '动物', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- 影视 (6)
INSERT INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('film-harry-potter-lotr', '哈利波特', '指环王', '影视', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('film-marvel-dc', '漫威', 'DC', '影视', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('film-avengers-justice-league', '复仇者联盟', '正义联盟', '影视', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('film-spongebob-doraemon', '海绵宝宝', '哆啦A梦', '影视', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('film-star-wars-star-trek', '星球大战', '星际迷航', '影视', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('film-titanic-avatar', '泰坦尼克号', '阿凡达', '影视', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- 运动 (6)
INSERT INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('sport-basketball-football', '篮球', '足球', '运动', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('sport-badminton-tennis', '羽毛球', '网球', '运动', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('sport-swimming-diving', '游泳', '跳水', '运动', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('sport-running-jogging', '跑步', '散步', '运动', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('sport-yoga-pilates', '瑜伽', '普拉提', '运动', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('sport-ski-snowboard', '滑雪', '单板滑雪', '运动', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- 自然 (6)
INSERT INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('nature-sun-moon', '太阳', '月亮', '自然', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('nature-rain-snow', '下雨', '下雪', '自然', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('nature-river-lake', '河流', '湖泊', '自然', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('nature-forest-jungle', '森林', '丛林', '自然', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('nature-mountain-hill', '山', '丘陵', '自然', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('nature-earthquake-volcano', '地震', '火山爆发', '自然', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- 品牌 (6)
INSERT INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('brand-apple-samsung', '苹果', '三星', '品牌', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('brand-nike-adidas', '耐克', '阿迪达斯', '品牌', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('brand-coca-pepsi', '可口可乐', '百事可乐', '品牌', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('brand-mcdonalds-kfc', '麦当劳', '肯德基', '品牌', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('brand-bmw-mercedes', '宝马', '奔驰', '品牌', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('brand-wechat-alipay', '微信支付', '支付宝', '品牌', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- 网络热梗 (7)
INSERT INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('meme-neijuan-tangping', '内卷', '躺平', '网络热梗', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('meme-yyds-nb', '永远的神', '牛逼', '网络热梗', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('meme-she-niu-she-kong', '社牛', '社恐', '网络热梗', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('meme-fan-ersai-zhuang-bi', '凡尔赛', '装逼', '网络热梗', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('meme-ba-lei-xiao-xian-rou', '芭乐', '小鲜肉', '网络热梗', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('meme-emo-posi', 'emo', '正能量', '网络热梗', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('meme-juejuezi-hao-jia-huo', '绝绝子', '好家伙', '网络热梗', 'easy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- ============================================================================
-- 真心话大冒险 卡片 — 10 个类别 × 3 强度，~120 张
-- ============================================================================

-- ── 类别: 轻松 (soft 为主的真心话) ──
INSERT INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-easy-laugh', 'truth', '最近一次笑到停不下来是因为什么？', '轻松', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-easy-habit', 'truth', '说一个别人不知道的小习惯。', '轻松', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-easy-song', 'truth', '最近单曲循环的歌是哪首？', '轻松', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-easy-food', 'truth', '你最喜欢的奇怪食物搭配是什么？', '轻松', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-easy-sleep', 'truth', '你是早起党还是熬夜党？', '轻松', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-easy-wallpaper', 'truth', '你的手机壁纸是什么？为什么选它？', '轻松', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-easy-dream-job', 'truth', '小时候最想做什么职业？', '轻松', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-easy-search', 'truth', '最近一次浏览器搜索记录是什么？', '轻松', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-easy-superpower', 'truth', '如果能有一种超能力，你最想要什么？', '轻松', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-easy-animal', 'truth', '如果可以变成一种动物，你会选什么？', '轻松', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-easy-weekend', 'truth', '完美周末是什么样子的？', '轻松', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-easy-emoji', 'truth', '你最常用的表情包是哪个？', '轻松', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- ── 类别: 社交 (normal 真心话) ──
INSERT INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-social-teammate', 'truth', '这局里你最想和谁组队？为什么？', '社交', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-social-impression', 'truth', '说出你对在场某个人的第一印象。', '社交', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-social-admire', 'truth', '在座的人中你最欣赏谁？', '社交', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-social-talent', 'truth', '你有什么隐藏技能？给大家展示一下。', '社交', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-social-awkward', 'truth', '分享你最近一次社死经历。', '社交', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-social-bucket', 'truth', '你的愿望清单上最想实现的 3 件事？', '社交', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-social-type', 'truth', '你的 MBTI 是什么？你觉得准吗？', '社交', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-social-nickname', 'truth', '从小到大最讨厌别人叫你什么外号？', '社交', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-social-influence', 'truth', '对你影响最大的一个人是谁？', '社交', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-social-gift', 'truth', '收到过最奇葩的礼物是什么？', '社交', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-social-best-friend', 'truth', '你觉得在座谁和你最合得来？', '社交', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- ── 类别: 刺激 (spicy 真心话) ──
INSERT INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-spicy-lie', 'truth', '上次说谎是什么时候？说了什么？', '刺激', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-spicy-crush', 'truth', '最近有没有心动的人？在不在这个房间里？', '刺激', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-spicy-date', 'truth', '你遇到过最奇葩的约会经历是什么？', '刺激', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-spicy-habit', 'truth', '你最想改掉的坏习惯是什么？', '刺激', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-spicy-secret', 'truth', '你有什么从未告诉过任何人的秘密？', '刺激', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-spicy-cry', 'truth', '最近一次哭是因为什么？', '刺激', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-spicy-ex', 'truth', '说出你前任的 3 个优点。', '刺激', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-spicy-jealous', 'truth', '你上一次嫉妒别人是什么时候？因为什么？', '刺激', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-spicy-regret', 'truth', '目前为止最让你后悔的一件事是什么？', '刺激', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-spicy-passion', 'truth', '最近一次让你热血沸腾的事情是什么？', '刺激', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-spicy-balance', 'truth', '你的银行卡余额还有多少？', '刺激', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-spicy-ghost', 'truth', '你相信有鬼吗？经历过什么灵异事件？', '刺激', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- ── 类别: 互动 (大冒险 soft) ──
INSERT INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('dare-chat-compliment', 'dare', '认真夸一下你左边的人，至少说两个优点。', '互动', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-chat-pose', 'dare', '摆一个搞怪姿势，让大家拍照留念。', '互动', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-chat-robot', 'dare', '用机器人声音介绍自己 30 秒。', '互动', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-chat-charades', 'dare', '用肢体动作表演一种动物，让大家猜。', '互动', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-chat-spin', 'dare', '站起来原地转 5 圈，然后走直线。', '互动', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-chat-nolaugh', 'dare', '盯着右边的人的眼睛 30 秒，不能笑。', '互动', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-chat-handshake', 'dare', '为在场每个人设计一个独特的握手动作。', '互动', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-chat-piggyback', 'dare', '背一个人绕房间走一圈。', '互动', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-chat-mirror', 'dare', '和对面的人做镜像动作，对方动什么你动什么，坚持 1 分钟。', '互动', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-chat-thumb-war', 'dare', '和右边的人比掰手腕。', '互动', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-chat-selfie', 'dare', '和在场所有人拍一张搞怪合影。', '互动', 'soft', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- ── 类别: 表演 (大冒险 normal) ──
INSERT INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('dare-act-host', 'dare', '用主持人的语气宣布下一轮开始。', '表演', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-act-sing', 'dare', '唱一首歌的副歌部分，其他人跟唱。', '表演', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-act-rap', 'dare', '用 Rap 的节奏介绍自己的名字和爱好。', '表演', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-act-dramatic', 'dare', '用最夸张的语气读一段商品说明书。', '表演', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-act-poem', 'dare', '即兴创作一首 4 句打油诗，主题由大家定。', '表演', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-act-commercial', 'dare', '即兴为一件物品做 60 秒电视购物广告。', '表演', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-act-weather', 'dare', '用播报天气预报的方式描述你今天的心情。', '表演', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-act-opera', 'dare', '用京剧/歌剧唱腔说一句话。', '表演', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-act-standup', 'dare', '讲一个冷笑话，不好笑不能停。', '表演', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-act-dub', 'dare', '给一段影视台词配音，用完全错误的情绪。', '表演', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-act-whisper', 'dare', '用悄悄话的音量讲一个鬼故事，大家必须安静听。', '表演', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- ── 类别: 搞怪 (大冒险 normal/spicy) ──
INSERT INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('dare-fun-backwards', 'dare', '倒着说一句话，其他人猜你在说什么。', '搞怪', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-fun-tongue', 'dare', '快速念 3 遍绕口令："吃葡萄不吐葡萄皮，不吃葡萄倒吐葡萄皮"', '搞怪', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-fun-emoji', 'dare', '只用表情符号讲一个故事，让大家猜情节。', '搞怪', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-fun-yoga', 'dare', '做一个瑜伽姿势，保持 15 秒。', '搞怪', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-fun-impersonate', 'dare', '模仿一个在场的人，让大家猜是谁。', '搞怪', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-fun-accent', 'dare', '用方言讲一个经典台词，让大家猜出自哪部剧。', '搞怪', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-fun-walk', 'dare', '用三种不同的走姿从房间一端走到另一端。', '搞怪', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-fun-mime', 'dare', '无声表演"你早上起床到出门的全过程"。', '搞怪', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-fun-alphabet', 'dare', '用身体摆出你名字的首字母。', '搞怪', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-fun-news', 'dare', '用新闻联播的语气播报你今天的早餐内容。', '搞怪', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-fun-slo-mo', 'dare', '把一句话用 0.5 倍速说一遍，再用 2 倍速说一遍。', '搞怪', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-fun-face', 'dare', '做 5 个不同的鬼脸，拍照留存。', '搞怪', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- ── 类别: 情侣 (spicy 真心话 + 大冒险) ──
INSERT INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-love-ideal', 'truth', '你理想中的另一半是什么样的？', '情侣', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-love-first', 'truth', '初恋是什么时候？对方是一个什么样的人？', '情侣', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-love-pickup', 'truth', '你用过最土的搭讪方式是什么？', '情侣', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-love-turnon', 'truth', '异性/同性什么行为会让你瞬间上头？', '情侣', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-love-standards', 'truth', '你的择偶标准有没有因为一个人而改变过？', '情侣', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-love-blind', 'truth', '你有没有暗恋过朋友的对象？', '情侣', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-love-confess', 'dare', '认真对在场某个人说一段 30 秒的赞美（非表白）。', '情侣', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-love-eyes', 'dare', '和在场某个人对视 20 秒，不可以说话。', '情侣', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-love-singto', 'dare', '对在场一位异性唱一句情歌歌词。', '情侣', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-love-age-gap', 'truth', '你能接受的最大年龄差是多少？', '情侣', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- ── 类别: 默契挑战 (真心话 normal + 大冒险 normal) ──
INSERT INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-sync-3-2-1', 'truth', '我说"3、2、1"，你和在场某人同时说出一个颜色，看看是否一样。', '默契挑战', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-sync-number', 'truth', '和你左边的人同时在 1-10 中选一个数字，看是否相同。', '默契挑战', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-sync-draw', 'dare', '和你右边的人各自画一个动物，然后交换猜对方画的是什么。', '默契挑战', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-sync-word', 'dare', '两人背对背，主持人说一个词，两人同时用身体比划出来。', '默契挑战', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-sync-guess', 'truth', '让其他人猜你最喜欢的菜系，三选一。', '默契挑战', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-sync-fact', 'truth', '说两件关于你的真事和一件假事，让大家猜哪个是假的。', '默契挑战', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-sync-telepathy', 'dare', '和另一个人同时说出"1"或"2"，如果一样，两人都过关。', '默契挑战', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-sync-question', 'truth', '你猜在场谁和你最像？问大家是否同意。', '默契挑战', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- ── 类别: 脑洞 (大冒险 normal/spicy + 真心话) ──
INSERT INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-brain-time', 'truth', '如果可以穿越到任何时代，你想去哪里？', '脑洞', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-brain-island', 'truth', '如果你流落荒岛只能带三样东西，带什么？', '脑洞', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-brain-swap', 'truth', '如果能和在场某个人交换人生一天，选谁？', '脑洞', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-brain-alien', 'truth', '你相信外星人存在吗？如果外星人来地球，你想跟他们说什么？', '脑洞', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-brain-invent', 'dare', '即兴发明一个不存在的产品，做 30 秒推销。', '脑洞', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-brain-time-capsule', 'dare', '给 10 年后的自己留一段语音留言（30 秒）。', '脑洞', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-brain-apocalypse', 'truth', '如果明天是世界末日，今天你会做什么？', '脑洞', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-brain-language', 'dare', '自创一门"外星语"说一段自我介绍，然后翻译给大家。', '脑洞', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('truth-brain-rich', 'truth', '如果你突然中了 1 亿彩票，第一件事做什么？', '脑洞', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-brain-sequel', 'dare', '给你最喜欢的电影编一个 1 分钟续集预告片。', '脑洞', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- ── 类别: 才艺展示 (大冒险 normal/spicy) ──
INSERT INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('dare-talent-beatbox', 'dare', '来一段 15 秒的 B-Box。', '才艺展示', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-talent-dance', 'dare', '跳一段 20 秒的舞蹈，风格不限。', '才艺展示', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-talent-whistle', 'dare', '用口哨吹一首歌的旋律。', '才艺展示', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-talent-origami', 'dare', '用一张纸在 60 秒内折一个东西给大家看。', '才艺展示', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-talent-magic', 'dare', '表演一个小魔术（不会就变一个"空气魔术"）。', '才艺展示', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-talent-clap', 'dare', '用手拍打桌子打一段节奏，让其他人猜歌名。', '才艺展示', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-talent-doodle', 'dare', '蒙眼画一个动物，让大家猜是什么。', '才艺展示', 'normal', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z'),
('dare-talent-tap', 'dare', '用脚打节拍配合哼唱，表演 20 秒。', '才艺展示', 'spicy', 1, '2026-07-15T00:00:00.000Z', '2026-07-15T00:00:00.000Z');

-- ============================================================================
-- 更新版本标记
-- ============================================================================
INSERT OR REPLACE INTO party_game_settings (key, value_json, updated_at)
VALUES ('content_version', '{"version":2,"source":"005_party_games_content_v2","word_pairs":80,"cards":118}', '2026-07-15T00:00:00.000Z');
