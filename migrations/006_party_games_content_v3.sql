-- ============================================================================
-- Party Games Content v3 — Massive content drop
-- ~160 undercover word pairs across 18 categories
-- ~220 truth-or-dare cards across 12 categories x 3 intensities
-- Uses INSERT OR IGNORE — safe to run on top of existing data
-- ============================================================================

-- ============================================================================
-- 谁是卧底 — 18 类别 / ~160 组
-- ============================================================================

-- 食物 (12)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('food-hot-dry-noodle-reganmian', '热干面', '燃面', '食物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('food-stinky-tofu-durian', '臭豆腐', '榴莲', '食物', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('food-mooncake-zongzi', '月饼', '粽子', '食物', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('food-fried-chicken-roast-duck', '炸鸡', '烤鸭', '食物', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('food-spaghetti-udon', '意面', '乌冬面', '食物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('food-chocolate-candy', '巧克力', '奶糖', '食物', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('food-hamburger-sandwich', '汉堡', '三明治', '食物', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('food-tofu-pudding', '豆腐脑', '布丁', '食物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('food-malatang-maocai', '麻辣烫', '冒菜', '食物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('food-chips-fries', '薯片', '薯条', '食物', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('food-bubble-tea-milk-tea', '珍珠奶茶', '丝袜奶茶', '食物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('food-hotpot-dry-pot', '火锅', '干锅', '食物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 饮品 (8)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('drink-latte-cappuccino', '拿铁', '卡布奇诺', '饮品', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('drink-soymilk-almond-milk', '豆浆', '杏仁奶', '饮品', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('drink-yakult-probiotic', '养乐多', '益生菌饮料', '饮品', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('drink-hot-chocolate-milo', '热巧克力', '美禄', '饮品', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('drink-coconut-water-coconut-milk', '椰子水', '椰奶', '饮品', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('drink-whiskey-brandy', '威士忌', '白兰地', '饮品', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('drink-green-tea-matcha', '绿茶', '抹茶', '饮品', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('drink-soda-tonic', '苏打水', '汤力水', '饮品', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 地点 (10)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('place-zoo-aquarium', '动物园', '水族馆', '地点', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('place-museum-gallery', '博物馆', '美术馆', '地点', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('place-stadium-gym', '体育场', '健身房', '地点', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('place-hotel-hostel', '酒店', '青年旅舍', '地点', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('place-cafe-teahouse', '咖啡馆', '茶馆', '地点', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('place-church-temple', '教堂', '寺庙', '地点', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('place-bank-atm', '银行', 'ATM', '地点', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('place-pharmacy-hospital', '药店', '医院', '地点', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('place-bar-nightclub', '酒吧', '夜店', '地点', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('place-laundry-dry-cleaner', '洗衣店', '干洗店', '地点', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 物品 (10)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('item-umbrella-raincoat', '雨伞', '雨衣', '物品', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('item-fan-ac', '电风扇', '空调', '物品', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('item-candle-lamp', '蜡烛', '台灯', '物品', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('item-scissors-knife', '剪刀', '美工刀', '物品', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('item-mirror-window', '镜子', '窗户', '物品', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('item-toothbrush-toothpaste', '牙刷', '牙膏', '物品', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('item-pen-pencil', '钢笔', '铅笔', '物品', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('item-wallet-card-holder', '钱包', '卡包', '物品', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('item-headphone-earbuds', '头戴耳机', '入耳耳机', '物品', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('item-camera-camcorder', '相机', '摄像机', '物品', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 交通 (8)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('transport-train-high-speed-rail', '火车', '高铁', '交通', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('transport-escalator-elevator', '扶梯', '直梯', '交通', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('transport-cable-car-gondola', '缆车', '观光车', '交通', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('transport-tram-light-rail', '有轨电车', '轻轨', '交通', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('transport-ferry-bridge', '渡轮', '大桥', '交通', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('transport-sedan-sports-car', '轿车', '跑车', '交通', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('transport-truck-van', '卡车', '面包车', '交通', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('transport-rocket-space-shuttle', '火箭', '航天飞机', '交通', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 职业 (10)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('job-architect-designer', '建筑师', '设计师', '职业', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('job-barber-hairstylist', '理发师', '造型师', '职业', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('job-librarian-archivist', '图书管理员', '档案管理员', '职业', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('job-photographer-videographer', '摄影师', '摄像师', '职业', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('job-writer-editor', '作家', '编辑', '职业', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('job-accountant-auditor', '会计', '审计', '职业', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('job-dentist-orthodontist', '牙医', '正畸医生', '职业', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('job-baker-pastry-chef', '面包师', '甜点师', '职业', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('job-psychologist-psychiatrist', '心理咨询师', '精神科医生', '职业', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('job-mechanic-engineer', '技工', '工程师', '职业', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 动物 (10)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('animal-penguin-puffin', '企鹅', '海鹦', '动物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('animal-crocodile-alligator', '鳄鱼', '短吻鳄', '动物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('animal-butterfly-moth', '蝴蝶', '飞蛾', '动物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('animal-bee-wasp', '蜜蜂', '黄蜂', '动物', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('animal-seal-sea-lion', '海豹', '海狮', '动物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('animal-parrot-cockatoo', '鹦鹉', '凤头鹦鹉', '动物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('animal-hamster-guinea-pig', '仓鼠', '豚鼠', '动物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('animal-deer-antelope', '鹿', '羚羊', '动物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('animal-rabbit-hare', '兔子', '野兔', '动物', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('animal-gecko-salamander', '壁虎', '蝾螈', '动物', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 影视 (10)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('film-iron-man-batman', '钢铁侠', '蝙蝠侠', '影视', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('film-game-of-thrones-house-of-dragon', '权力的游戏', '龙之家族', '影视', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('film-breaking-bad-better-call-saul', '绝命毒师', '风骚律师', '影视', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('film-toy-story-shrek', '玩具总动员', '怪物史莱克', '影视', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('film-inception-interstellar', '盗梦空间', '星际穿越', '影视', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('film-friends-big-bang-theory', '老友记', '生活大爆炸', '影视', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('film-naruto-one-piece', '火影忍者', '海贼王', '影视', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('film-joker-batman-villain', '小丑', '谜语人', '影视', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('film-squid-game-alice-in-borderland', '鱿鱼游戏', '弥留之国的爱丽丝', '影视', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('film-la-la-land-greatest-showman', '爱乐之城', '马戏之王', '影视', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 运动 (10)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('sport-boxing-mma', '拳击', '综合格斗', '运动', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('sport-surfing-windsurfing', '冲浪', '帆板', '运动', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('sport-fencing-kendo', '击剑', '剑道', '运动', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('sport-golf-mini-golf', '高尔夫', '迷你高尔夫', '运动', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('sport-skateboard-rollerblade', '滑板', '轮滑', '运动', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('sport-bowling-curling', '保龄球', '冰壶', '运动', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('sport-marathon-triathlon', '马拉松', '铁人三项', '运动', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('sport-archery-shooting', '射箭', '射击', '运动', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('sport-parkour-free-running', '跑酷', '自由奔跑', '运动', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('sport-pingpong-table-tennis', '乒乓球', '桌球', '运动', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 自然 (10)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('nature-fog-haze', '雾', '霾', '自然', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('nature-sunrise-sunset', '日出', '日落', '自然', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('nature-waterfall-fountain', '瀑布', '喷泉', '自然', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('nature-glacier-iceberg', '冰川', '冰山', '自然', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('nature-cave-tunnel', '洞穴', '隧道', '自然', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('nature-oasis-desert', '绿洲', '沙漠', '自然', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('nature-reef-atoll', '珊瑚礁', '环礁', '自然', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('nature-lightning-thunder', '闪电', '打雷', '自然', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('nature-prairie-savanna', '草原', '稀树草原', '自然', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('nature-spring-geyser', '温泉', '间歇泉', '自然', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 品牌 (10)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('brand-chanel-dior', '香奈儿', '迪奥', '品牌', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('brand-tesla-nio', '特斯拉', '蔚来', '品牌', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('brand-starbucks-luckin', '星巴克', '瑞幸', '品牌', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('brand-google-baidu', '谷歌', '百度', '品牌', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('brand-netflix-disney-plus', '奈飞', '迪士尼+', '品牌', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('brand-nintendo-playstation', '任天堂', 'PlayStation', '品牌', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('brand-uniqlo-zara', '优衣库', 'ZARA', '品牌', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('brand-dji-gopro', '大疆', 'GoPro', '品牌', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('brand-xiaomi-huawei', '小米', '华为', '品牌', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('brand-ikea-muji', '宜家', '无印良品', '品牌', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 网络热梗 (10)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('meme-guo-jiang-bu-kan', '郭靖', '步惊云', '网络热梗', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('meme-hong-wen-ke-ji', '鸿蒙', '科技', '网络热梗', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('meme-pao-mo-jing-ji', '泡沫', '经济', '网络热梗', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('meme-da-call-ying-yuan', '打call', '应援', '网络热梗', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('meme-po-fang-le-mu', '破防', '泪目', '网络热梗', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('meme-bai-lan-zhi-yu', '摆烂', '治愈', '网络热梗', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('meme-gan-fan-ren-chi-huo', '干饭人', '吃货', '网络热梗', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('meme-qiao-hei-ban-ke-dai-biao', '敲黑板', '划重点', '网络热梗', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('meme-you-shou-jiu-xing-can-fei', '有手就行', '残废', '网络热梗', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('meme-jia-de-fan-jiu-shi-xiang', '假的', '反向实锤', '网络热梗', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 节日 (8)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('festival-spring-festival-lunar-new-year', '春节', '农历新年', '节日', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('festival-mid-autumn-lantern', '中秋', '元宵', '节日', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('festival-christmas-thanksgiving', '圣诞', '感恩节', '节日', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('festival-dragon-boat-qingming', '端午', '清明', '节日', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('festival-valentine-qixi', '情人节', '七夕', '节日', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('festival-halloween-easter', '万圣节', '复活节', '节日', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('festival-new-year-eve-countdown', '跨年夜', '倒计时', '节日', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('festival-double-eleven-618', '双十一', '618', '节日', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 游戏 (8)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('game-lol-dota', '英雄联盟', 'DOTA', '游戏', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('game-minecraft-terraria', '我的世界', '泰拉瑞亚', '游戏', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('game-werewolf-avalon', '狼人杀', '阿瓦隆', '游戏', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('game-pubg-apex', '吃鸡', 'Apex英雄', '游戏', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('game-genshin-impact-honkai-star-rail', '原神', '崩坏星穹铁道', '游戏', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('game-monopoly-catan', '大富翁', '卡坦岛', '游戏', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('game-tetris-puyopuyo', '俄罗斯方块', '噗哟噗哟', '游戏', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('game-chess-go', '国际象棋', '围棋', '游戏', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 音乐 (6)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('music-guitar-ukulele', '吉他', '尤克里里', '音乐', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('music-piano-keyboard', '钢琴', '电子琴', '音乐', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('music-rock-hiphop', '摇滚', '嘻哈', '音乐', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('music-drum-bass', '鼓', '贝斯', '音乐', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('music-concert-music-festival', '演唱会', '音乐节', '音乐', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('music-vinyl-cd', '黑胶唱片', 'CD', '音乐', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 文学 (6)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('book-harry-potter-percy-jackson', '哈利波特', '波西杰克逊', '文学', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('book-romance-mystery', '言情小说', '悬疑小说', '文学', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('book-poem-essay', '诗歌', '散文', '文学', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('book-diary-autobiography', '日记', '自传', '文学', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('book-comic-graphic-novel', '漫画', '图像小说', '文学', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('book-fairytale-fable', '童话', '寓言', '文学', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- 科技 (6)
INSERT OR IGNORE INTO party_undercover_word_pairs (id, civilian_word, undercover_word, category, difficulty, enabled, created_at, updated_at) VALUES
('tech-ai-robot', '人工智能', '机器人', '科技', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('tech-vr-ar', 'VR', 'AR', '科技', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('tech-bluetooth-wifi', '蓝牙', 'WiFi', '科技', 'easy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('tech-drone-robot-vacuum', '无人机', '扫地机器人', '科技', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('tech-bitcoin-ethereum', '比特币', '以太坊', '科技', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('tech-3d-print-laser-cut', '3D打印', '激光切割', '科技', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ============================================================================
-- 真心话大冒险 — 12 类别 x 3 强度 / ~220 张
-- ============================================================================

-- ── 轻松 · soft 真心话 (16) ──
INSERT OR IGNORE INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-easy-movie', 'truth', '最近看的一部电影是什么？打几分？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-pet', 'truth', '如果可以养任何宠物（不考虑现实），会养什么？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-weather', 'truth', '你最喜欢的天气是什么？下雨天还是大晴天？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-color', 'truth', '最喜欢的颜色是什么？为什么？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-breakfast', 'truth', '今天早餐吃了什么？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-season', 'truth', '四季里最喜欢哪个季节？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-hometown-food', 'truth', '你家乡最有名的小吃是什么？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-sport', 'truth', '最喜欢的运动是什么？经常做吗？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-app', 'truth', '手机上用得最多的 App 是哪个？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-cuisine', 'truth', '最喜欢的菜系是什么？（川菜/粤菜/日料/西餐等）', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-bedtime', 'truth', '平时几点睡觉？熬夜一般是因为什么？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-transport', 'truth', '日常通勤用什么交通工具？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-coffee-tea', 'truth', '你是咖啡党还是奶茶党？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-game', 'truth', '最近在玩什么游戏？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-book', 'truth', '最近在读什么书？（或者最近一本读完的书）', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-easy-city', 'truth', '最想去哪个城市旅游？', '轻松', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ── 社交 · normal 真心话 (20) ──
INSERT OR IGNORE INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-social-choose-one', 'truth', '在场选一个人当你的室友，你选谁？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-strength', 'truth', '你觉得在场谁最靠谱？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-funny', 'truth', '在场谁最会讲笑话？请他现场来一个。', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-same', 'truth', '你觉得在场谁和你最像？哪里像？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-superpower', 'truth', '如果在场的人组一个超级英雄团队，每个人是什么角色？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-zodiac', 'truth', '你信星座吗？觉得自己星座的特征准不准？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-advice', 'truth', '你给过别人最好的一条建议是什么？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-friend-criteria', 'truth', '交朋友你最看重什么品质？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-text-last', 'truth', '你发的最后一条微信是什么内容？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-live-without', 'truth', '如果只能保留一个社交 App，你会选哪个？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-change-one', 'truth', '你最想改变自己性格中的哪一点？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-handle-conflict', 'truth', '你通常怎么处理人际冲突？冷战还是直接说？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-charity', 'truth', '如果你有 100 万必须捐出去，你会捐给哪个领域？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-party-trick', 'truth', '你有什么聚会必杀技？（比如一个魔术、一个笑话）', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-text-mistake', 'truth', '有没有发错消息给错误的人的尴尬经历？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-phone-photos', 'truth', '你手机相册里最多的三类照片是什么？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-proud', 'truth', '最近让你最骄傲的一件事是什么？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-influence-person', 'truth', '除了家人，对你影响最大的一个人是谁？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-ideal-party', 'truth', '你理想中的 party 是什么样子的？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-social-old-friend', 'truth', '最近一次联系老朋友是什么时候？说了什么？', '社交', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ── 刺激 · spicy 真心话 (20) ──
INSERT OR IGNORE INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-spicy-phone-unlock', 'truth', '你的手机密码是多少？（可以不说）或者有什么特殊含义？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-screenshot', 'truth', '你手机里最后一张截图是什么？给大家看看。', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-stalk', 'truth', '你有没有偷偷搜索过某个人？搜了什么？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-drunk', 'truth', '你喝醉后做过最离谱的事是什么？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-dream', 'truth', '最近做过最奇怪的梦是什么？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-skip-work', 'truth', '你有没有装病逃过课/逃过班？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-steal', 'truth', '小时候偷过东西吗？（偷爸妈的钱也算）', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-awkward-call', 'truth', '有没有接过特别尴尬的电话？什么内容？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-ugly-cry', 'truth', '最近一次嚎啕大哭是因为什么？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-cheat', 'truth', '考试/比赛你有没有作弊过？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-flirt', 'truth', '你用过最土的撩人手段是什么？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-last-angry', 'truth', '最近一次真的生气是因为什么？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-prank', 'truth', '你做过最过分的恶作剧是什么？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-revenge', 'truth', '你有没有报复过别人？怎么报复的？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-nickname', 'truth', '你给朋友/同事起过什么外号？（他们不知道的）', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-secret-admire', 'truth', '有没有暗恋过老师/上司？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-wildest-thing', 'truth', '你做过最大胆的事情是什么？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-insecurity', 'truth', '你对自己最不满意的地方是什么？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-last-fight', 'truth', '最近一次和人吵架是因为什么？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-spicy-social-media-time', 'truth', '你每天刷短视频/社交媒体的真实时长是多少？', '刺激', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ── 互动 · soft 大冒险 (18) ──
INSERT OR IGNORE INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('dare-interact-highfive', 'dare', '和在场每个人击掌并说一句鼓励的话。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-secret-handshake', 'dare', '和你右边的人设计一个专属的握手动作。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-group-hug', 'dare', '组织一次全员拥抱（可以拒绝）。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-rock-paper', 'dare', '和在场每个人玩一局石头剪刀布。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-bow', 'dare', '对在场每个人用不同的方式鞠躬问好。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-leader', 'dare', '带领大家做一套 30 秒的拉伸操。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-telephone', 'dare', '发起一轮"传话游戏"，从你开始说一句悄悄话传到最后一个。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-simon-says', 'dare', '当一轮"Simon says"的主持人，给出 5 个指令。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-give-name', 'dare', '给在场每个人起一个可爱的外号，并解释为什么。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-count-off', 'dare', '让所有人按生日月份从小到大站好，不能说话只能比划。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-toast', 'dare', '用饮料和大家碰杯，说一段 30 秒的祝酒词。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-copycat', 'dare', '选一个人，接下来两轮模仿他的说话方式和动作。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-draw-partner', 'dare', '和右边的人合作画一幅画，各自只能用一只手。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-balance', 'dare', '头顶一本书从房间一头走到另一头，其他人可以干扰（不能碰）。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-slow-clap', 'dare', '带领大家做一次"慢动作鼓掌"，从慢到快再到慢。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-echo', 'dare', '选一个人当"回声"，他说的每句话你都要重复最后三个字，坚持 1 分钟。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-survey', 'dare', '快速做一个"在场所有人左手还是右手写字"的调查并公布结果。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-interact-king', 'dare', '当 1 分钟的"国王/女王"，可以给在场任何人下三个无害的命令。', '互动', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ── 表演 · normal 大冒险 (20) ──
INSERT OR IGNORE INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('dare-act-auctioneer', 'dare', '用拍卖师的语速介绍一件你身上的物品。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-silent-movie', 'dare', '用默片风格表演"刚到派对现场"的过程（夸张肢体+字幕卡）。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-animal-kingdom', 'dare', '模仿三种动物的叫声和走路姿势，让大家猜。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-bedtime-story', 'dare', '用讲睡前故事的语气念一段说明书。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-chef-show', 'dare', '即兴做一段"美食节目"：用夸张的语言描述怎么泡一碗方便面。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-sports-commentator', 'dare', '用体育解说的语气描述刚才一轮游戏中发生了什么。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-hero-speech', 'dare', '发表一段 30 秒的"决战前鼓舞士气"演讲。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-baby-talk', 'dare', '用婴儿的语气介绍自己 30 秒。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-elevator-pitch', 'dare', '60 秒即兴路演：把"空气"当作一款产品来推销。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-radio-dj', 'dare', '当 1 分钟的电台 DJ，介绍下一首歌并为在场某人点歌。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-fitness-coach', 'dare', '当 30 秒的健身教练，带领大家做一组动作。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-asmr', 'dare', '用 ASMR 的方式（轻声细语）讲 30 秒的话。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-emperor', 'dare', '用皇帝批奏折的语气点评在场每个人的今日穿搭。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-documentary', 'dare', '用动物世界纪录片的语气解说"人类在聚会上都在干什么"。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-rap-battle', 'dare', '和在场某个人来一段 30 秒的即兴 Rap battle（不限内容，押韵即可）。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-trailer', 'dare', '为一个"平凡日常"（比如刷牙）做一段好莱坞大片预告片配音。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-pro-wrestling', 'dare', '模仿一段职业摔跤手的出场秀（进场+挑衅+胜利姿势）。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-game-show', 'dare', '主持一轮 60 秒的"猜词游戏"，出 3 个词让在场的人猜。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-ghost-story', 'dare', '关灯（或用手机手电筒照脸），讲一个 30 秒的恐怖故事。', '表演', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-act-opinion-anchor', 'dare', '用新闻评论员的语气评论一道菜/一杯饮料的"社会意义"。', '表演', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ── 搞怪 · normal/spicy 大冒险 (20) ──
INSERT OR IGNORE INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('dare-fun-invisible-chair', 'dare', '做 30 秒的"坐空气椅子"（靠墙深蹲的变体，不要真的靠墙）。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-nose-whistle', 'dare', '捏住鼻子唱"小星星"第一段。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-serious-gibberish', 'dare', '用最严肃的表情说一段完全没意义的"火星语"，其他人必须认真点头。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-laughing-contest', 'dare', '和在场某个人对视，谁先笑谁输，输了继续罚。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-socks', 'dare', '如果你穿着袜子，把袜子脱下来套在手上当手套，保持 2 轮。', '搞怪', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-toothpaste-ad', 'dare', '用牙膏广告的笑容露出所有牙齿，说"你看我的牙白不白"。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-floor-is-lava', 'dare', '大喊"地板是岩浆！"并马上站到最近的家具上，坚持 20 秒。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-conspiracy', 'dare', '即兴编一个荒诞的"阴谋论"（比如"冰箱其实是时光机"），认真地讲给大家听。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-backwards-day', 'dare', '接下来 2 轮，把"是"说成"不是"，把"好"说成"不好"。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-narrate-self', 'dare', '用第三人称旁白的方式讲述自己接下来 1 分钟的一举一动。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-chicken-dance', 'dare', '跳一段 15 秒的"小鸡舞"（手臂当翅膀，膝盖弯着走）。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-object-ode', 'dare', '对你身边最近的一件物品朗诵一首即兴的"颂歌"（至少 4 句）。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-pillow-fight', 'dare', '用一个靠垫和空气进行 15 秒的枕头大战。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-alien-arrival', 'dare', '表演"外星人第一次来到地球"，对身边 3 样日常物品表示极度好奇。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-ventriloquist', 'dare', '拿一个水瓶/杯子当"人偶"，表演 30 秒的腹语对话。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-worst-dancer', 'dare', '跳 20 秒"你见过最差的舞蹈"（故意乱跳但要认真）。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-feature-creature', 'dare', '把在场某个人的某个特征极度夸张化地表演出来（善意调侃）。', '搞怪', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-staring-contest', 'dare', '选一个无生命的物体（比如墙上的钟），盯着它"深情凝视"30 秒，不准笑。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-wrong-answers', 'dare', '接下来 3 个问你的问题，你都必须回答一个"明显错误但好笑的答案"。', '搞怪', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-fun-sock-puppet', 'dare', '用一只袜子做手偶，让它介绍在场每个人。', '搞怪', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ── 情侣 · normal/spicy (20) ──
INSERT OR IGNORE INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-love-type', 'truth', '你的理想型是什么样的？用三个词描述。', '情侣', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-love-red-flag', 'truth', '恋爱中你最不能容忍的"红线"是什么？', '情侣', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-love-song', 'truth', '有没有一首歌让你想起某个人？', '情侣', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-love-proposal', 'truth', '你理想中的求婚场景是什么样子的？', '情侣', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-love-ex-count', 'truth', '你谈过几次恋爱？最短的一次多久？', '情侣', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-love-pickup-line', 'truth', '你觉得最油腻的搭讪开场白是什么？念一遍。', '情侣', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-love-breakup', 'truth', '你最惨的一次分手经历是什么样的？', '情侣', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-love-text-screenshot', 'truth', '你最后一条跟异性/对象的聊天记录是什么？念最后一行。', '情侣', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-love-celebrity', 'truth', '你的"明星 crush"是谁？如果在场有人长得像他/她，指出来。', '情侣', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-love-rose', 'dare', '用嘴叼着一朵花（或用纸折一朵），送给在场一位异性/同性，并说一句赞美。', '情侣', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-love-sketch', 'dare', '在 30 秒内画出你理想型的简笔画，给大家看。', '情侣', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-love-poem', 'dare', '即兴写一首 4 行"情诗"送给在场某个人（可以是搞笑风格）。', '情侣', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-love-serenade', 'dare', '对在场某个人唱一句情歌歌词，然后解释为什么选这句。', '情侣', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-love-green-flag', 'truth', '你觉得什么样的行为/特质会让你觉得"这个人是 green flag"？', '情侣', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-love-pda', 'truth', '你能接受的最大程度的公开亲昵行为是什么？', '情侣', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-love-love-letter', 'dare', '用 60 秒口述一封"情书"，对象由大家指定（可以是物品/宠物）。', '情侣', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-love-compromise', 'truth', '在感情里你愿意为对方改变什么？有什么绝对不改的？', '情侣', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-love-crush-sign', 'truth', '你喜欢一个人时会有什么"信号"？（比如话变多、变少、紧张等）', '情侣', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-love-impression', 'dare', '模仿你心目中"最土的表白"场景，表演出来。', '情侣', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-love-pickup-challenge', 'dare', '用一句"土味情话"对在场某人表白，要求对方忍住不笑。', '情侣', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ── 默契挑战 · normal (15) ──
INSERT OR IGNORE INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-sync-movie', 'truth', '你和右边的人同时说出最喜欢的电影，看是否一样。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-sync-food', 'truth', '和左边的人同时说出最讨厌的食物，看是否一样。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-sync-animal', 'truth', '三秒后一起学一种动物叫。看能不能学成同一种。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-sync-mirror', 'dare', '和右边的人面对面，一人做动作，另一人镜像模仿，坚持 30 秒。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-sync-blind', 'dare', '蒙眼，听从某个人的指令走 10 步（其他人可以给假指令干扰）。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-sync-top3', 'truth', '说出你心目中的 Top 3 歌手/乐队，看在场有没有人和你完全一致。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-sync-taboo', 'dare', '两个人玩"禁词游戏"：选一个词，谁先说谁输，输的人罚。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-sync-categories', 'dare', '和对面的人玩"类别接龙"：主持人给一个类别（比如"水果"），两人交替说，谁说重或卡住谁输。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-sync-same-moment', 'truth', '和左边的人各自说出"现在最想吃的东西"，看是不是同一个。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-sync-build', 'dare', '两个人用给定材料（纸杯、纸等）在 60 秒内合作搭一个塔。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-sync-finish-sentence', 'truth', '主持人说前半句，你和指定的人同时说后半句。看默契度。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-sync-mime', 'dare', '一个人用肢体描述一个词，另一个人猜。必须在 30 秒内猜对 3 个。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-sync-birthday', 'truth', '在场谁的生日离你最近？跟 TA 确认一下。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-sync-song-duet', 'dare', '和另一个人合唱一首大家都会的歌（副歌部分就可以）。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-sync-countdown', 'truth', '主持人倒数 3-2-1，你和另一个人同时指向在场某个人。看是否指向同一个。', '默契挑战', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ── 脑洞 · normal (16) ──
INSERT OR IGNORE INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-brain-parallel', 'truth', '如果你能去平行宇宙看看另一个自己，你最想知道什么？', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-brain-immortal', 'truth', '如果你可以永生但必须每 100 年换一个身份，你会选择怎样的生活？', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-brain-new-color', 'truth', '给一种不存在的颜色命名并描述它看起来是什么感觉。', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-brain-invent-law', 'truth', '如果你可以制定一条全世界都必须遵守的法律，你会定什么？', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-brain-talk-to-animal', 'truth', '如果能跟一种动物对话，你选哪种？问它什么问题？', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-brain-new-word', 'dare', '发明一个中文新词，定义它，并用它造三个句子。', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-brain-super-villain', 'dare', '用 30 秒介绍你的"超级反派"人设：你的超能力、弱点、邪恶计划。', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-brain-machine', 'dare', '设计一个"世界上最没用的机器"并解释它的功能。', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-brain-spell', 'truth', '如果你能施展一个"弱魔法"（不能改变世界但能方便生活），是什么？', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-brain-historical-dinner', 'truth', '如果你可以和任何三个历史人物共进晚餐，选谁？聊什么？', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-brain-spell-cast', 'dare', '给自己想一个"魔法咒语"和对应的"手势"，现场演示。', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-brain-dystopia', 'truth', '你读过/看过最可怕的"反乌托邦"设定是什么？你觉得它有可能成真吗？', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-brain-riddle', 'dare', '现场编一个谜语，让在场的人猜。', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-brain-dream-house', 'truth', '描述你的"梦中情房"：不限预算，不限地点。', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-brain-mascot', 'dare', '给这个聚会设计一个"吉祥物"，画出它的样子或用语言描述。', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-brain-fusion', 'truth', '如果可以把两种动物"融合"成一种新物种，你选哪两种？叫什么名字？', '脑洞', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ── 才艺展示 · normal/spicy 大冒险 (20) ──
INSERT OR IGNORE INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('dare-talent-handstand', 'dare', '尝试倒立/靠墙倒立 10 秒（安全第一）。', '才艺展示', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-juggle', 'dare', '用三个小球（或团成球的纸团）尝试抛接 10 次。', '才艺展示', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-tongue-roll', 'dare', '展示一个"你独有的身体特技"（卷舌/动耳朵/劈叉等）。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-one-leg', 'dare', '单脚站立闭眼 30 秒。（其他人可以制造声音干扰）', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-snap', 'dare', '用打响指/拍手/拍桌子打出一段 15 秒的节奏。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-accent', 'dare', '用至少三种不同的方言/口音说同一句话。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-portrait', 'dare', '30 秒内给在场某个人画一幅速写肖像（画得越像越好，不像也行）。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-harmonica', 'dare', '用一把梳子和一张纸做一个"梳子口琴"，吹一段旋律。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-expressions', 'dare', '在 20 秒内做出 7 种不同的情绪表情（喜怒哀乐惊恐厌）。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-plank', 'dare', '做平板支撑，同时回答在场人提的 5 个问题。', '才艺展示', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-coin-trick', 'dare', '表演一个硬币魔术（或者手指小技巧）。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-paper-plane', 'dare', '折一个纸飞机，让它飞得尽可能远。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-alphabet-burp', 'dare', '一口气从 A 念到 Z（英文），中间不能换气。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-head-voice', 'dare', '用假声/头声唱一句你最熟悉的歌词。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-rubik', 'dare', '如果你会玩魔方（或任何益智玩具），展示一下。不会的话就尝试还原一面。', '才艺展示', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-pen-spin', 'dare', '尝试转笔 10 秒（掉了也没关系）。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-echo-location', 'dare', '闭眼，让一个人在你周围某个位置拍手，你指向声音来源。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-mnemonic', 'dare', '在 30 秒内记住 10 个随机中文词，然后复述出来。', '才艺展示', 'spicy', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-puppeteer', 'dare', '用两根手指在桌子上表演"小人走路" 20 秒，配上台词。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('dare-talent-water-sound', 'dare', '用手指沾水在杯沿上"唱歌"（或者用嘴模仿水滴声）。', '才艺展示', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ── 回忆杀 · normal 真心话 (16) ──
INSERT OR IGNORE INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-memory-childhood-game', 'truth', '你小时候最喜欢的游戏是什么？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-school-lunch', 'truth', '上学时最喜欢学校食堂的哪道菜？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-first-internet', 'truth', '你第一次上网/用电脑是几岁？做了什么？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-first-phone', 'truth', '你第一部手机是什么牌子的？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-teacher', 'truth', '你印象最深的一位老师是谁？为什么？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-best-gift', 'truth', '你收到过最难忘的礼物是什么？谁送的？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-scared', 'truth', '你童年时最怕什么？（比如怕黑、怕某种动物）', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-vacation', 'truth', '你印象最深的一次家庭旅行是去哪？发生了什么？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-song', 'truth', '哪首歌最能让你回到某个特定的时刻？是什么时刻？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-cartoon', 'truth', '你童年最爱的动画片是什么？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-smell', 'truth', '有没有一种气味能让你瞬间回到某个记忆场景？是什么气味？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-summer', 'truth', '你记忆中最美好的一个夏天发生了什么？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-parent-advice', 'truth', '父母/长辈跟你说过最让你记住的一句话是什么？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-first-job', 'truth', '你的第一份工作/兼职是什么？学到了什么？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-photo', 'truth', '你最喜欢的一张老照片是什么样的？描述一下。', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-memory-belief', 'truth', '小时候深信不疑但长大后发现是假的一件事是什么？', '回忆杀', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ── 快问快答 · soft/normal 真心话 (20) ──
INSERT OR IGNORE INTO party_truth_or_dare_cards (id, type, content, category, intensity, enabled, created_at, updated_at) VALUES
('truth-quick-sweet-salty', 'truth', '甜党和咸党你站哪边？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-dog-cat', 'truth', '狗派还是猫派？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-mountain-beach', 'truth', '山还是海？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-morning-night', 'truth', '早起型还是夜猫子型？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-in-out', 'truth', '内向还是外向？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-plan-spontaneous', 'truth', '计划派还是说走就走派？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-text-call', 'truth', '喜欢发文字还是打语音/电话？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-hot-cold', 'truth', '怕冷还是怕热？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-shower-morning-night', 'truth', '早上洗澡还是晚上洗澡？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-toilet-paper-over-under', 'truth', '卫生纸朝外放还是朝里放？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-pineapple-pizza', 'truth', '披萨上放不放菠萝？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-socks-sandals', 'truth', '穿袜子配凉鞋你觉得OK吗？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-cilantro', 'truth', '香菜好吃还是该灭绝？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-fork-spoon-chopsticks', 'truth', '如果有且只能选一种餐具用一辈子，选什么？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-shoes-off', 'truth', '进别人家会主动脱鞋吗？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-left-right', 'truth', '你是左撇子还是右撇子？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-aisle-window', 'truth', '飞机上选靠窗还是靠过道？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-spicy-level', 'truth', '你能吃到多辣？（微辣/中辣/特辣/变态辣）', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-ghost-alien', 'truth', '你更相信有鬼还是外星人？', '快问快答', 'soft', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z'),
('truth-quick-weird-collection', 'truth', '你有没有什么奇怪的收藏爱好？', '快问快答', 'normal', 1, '2026-07-16T00:00:00.000Z', '2026-07-16T00:00:00.000Z');

-- ============================================================================
-- 更新版本标记
-- ============================================================================
INSERT OR REPLACE INTO party_game_settings (key, value_json, updated_at)
VALUES ('content_version', '{"version":3,"source":"005_party_games_content_v3","word_pairs":160,"cards":220,"categories_undercover":18,"categories_truth_or_dare":12}', '2026-07-16T00:00:00.000Z');
