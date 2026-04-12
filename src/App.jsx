import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Sun, Cloud, Star, BookOpen, Award, TrendingUp, Phone, Play, Pause, RotateCcw, Trash2, Brain, Sparkles, Activity, Shield, Users, Moon, Smile, ChevronLeft, Lock, BarChart3, Menu } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'healing-kids-app-v3';
const DEFAULT_PROGRESS = { meditation: false, journaling: false, breathing: false, activity: false };
const NEGATIVE_MOODS = ['难过', '焦虑', '生气'];

const MOODS = [
  { emoji: '😊', label: '开心', color: 'bg-yellow-400' },
  { emoji: '😌', label: '平静', color: 'bg-blue-400' },
  { emoji: '😔', label: '难过', color: 'bg-gray-400' },
  { emoji: '😰', label: '焦虑', color: 'bg-purple-400' },
  { emoji: '😡', label: '生气', color: 'bg-red-400' }
];

const DAILY_ACTIVITIES = [
  { id: 'meditation', icon: Cloud, title: '冥想放松', duration: '5分钟', color: 'bg-blue-500', page: 'meditation' },
  { id: 'breathing', icon: Heart, title: '呼吸练习', duration: '3分钟', color: 'bg-pink-500', page: 'breathing' },
  { id: 'journaling', icon: BookOpen, title: '情绪日记', duration: '10分钟', color: 'bg-purple-500', page: 'journal' },
  { id: 'activity', icon: Star, title: '快乐活动', duration: '15分钟', color: 'bg-yellow-500', page: 'activity' }
];

const ENCOURAGEMENTS = [
  '你做得真棒！🌟', '每一小步都很重要 💪', '你比你想象的更坚强 💖',
  '今天的你值得被爱 🌈', '慢慢来，一切都会好起来 ☀️'
];

const JOURNAL_PROMPTS = [
  '今天发生了什么让你开心的事？', '有什么事情让你感到困扰吗？',
  '今天你最感谢的一件事是什么？', '如果可以对自己说一句话，你想说什么？',
  '今天你最喜欢的一个瞬间是什么？'
];

const HAPPY_ACTIVITIES = [
  { emoji: '🎨', label: '画一幅画' }, { emoji: '🎵', label: '听喜欢的音乐' },
  { emoji: '💬', label: '和朋友聊天' }, { emoji: '🎮', label: '玩喜欢的游戏' },
  { emoji: '📺', label: '看有趣的视频' }, { emoji: '✂️', label: '做手工' },
  { emoji: '📚', label: '读一本书' }, { emoji: '🌳', label: '户外散步' },
  { emoji: '🐶', label: '和宠物玩' }, { emoji: '🤗', label: '拥抱家人' }
];

const MEDITATION_THEMES = [
  { title: '🌲 森林漫步', description: '想象在安静的森林里散步，听着鸟儿歌唱，脚下是柔软的落叶...', duration: 180 },
  { title: '🌊 海边听浪', description: '坐在温暖的沙滩上，听着海浪一遍又一遍地拍打着海岸...', duration: 180 },
  { title: '☁️ 云朵旅行', description: '躺在柔软的云朵上，飘向蓝蓝的天空，烦恼都留在了下面...', duration: 240 },
  { title: '⭐ 星空冥想', description: '仰望夜空中闪烁的星星，感受宇宙的平静和温柔...', duration: 240 }
];

const HOTLINES = [
  { name: '北京心理危机研究与干预中心', number: '010-82951332', hours: '24小时' },
  { name: '希望24热线', number: '400-161-9995', hours: '24小时' },
  { name: '青少年心理援助热线', number: '12355', hours: '周一至周日' }
];

const BREATHING_PHASES = [
  { name: 'inhale', duration: 4 }, { name: 'hold', duration: 4 }, { name: 'exhale', duration: 4 }
];

const PHASE_TEXT = { ready: '准备开始', inhale: '慢慢吸气...', hold: '屏住呼吸...', exhale: '慢慢呼气...' };

const AFFIRMATIONS = [
  '我是独一无二的，我有自己的闪光点 ✨',
  '我值得被爱，被关心，被温柔对待 💗',
  '今天的我比昨天更勇敢了一点 🦁',
  '犯错没关系，每个人都在学习 📖',
  '我的感受很重要，表达它们是勇敢的 🗣️',
  '我不需要完美，做自己就很棒 🌟',
  '困难是暂时的，我有能力度过 💪',
  '世界上有很多人爱着我 🌈',
  '我可以慢慢来，不用着急 🐢',
  '每一天都是新的开始 🌅',
  '我的笑容可以温暖别人 😊',
  '我很特别，这个世界需要我 🌍',
  '害怕的时候深呼吸，我会没事的 🌬️',
  '我可以寻求帮助，这不是软弱 🤝',
  '我已经很努力了，为自己骄傲 🏆'
];

const ACTIVATION_ACTIVITIES = [
  { emoji: '💧', label: '喝一杯水', difficulty: 'easy' },
  { emoji: '🪟', label: '打开窗户呼吸新鲜空气', difficulty: 'easy' },
  { emoji: '🧹', label: '整理书桌', difficulty: 'easy' },
  { emoji: '🚶', label: '在家走动5分钟', difficulty: 'easy' },
  { emoji: '🌳', label: '去户外散步15分钟', difficulty: 'medium' },
  { emoji: '📞', label: '给朋友发一条消息', difficulty: 'medium' },
  { emoji: '🎨', label: '画一幅画或做手工', difficulty: 'medium' },
  { emoji: '📚', label: '读一个故事', difficulty: 'medium' },
  { emoji: '🏃', label: '做30分钟运动', difficulty: 'hard' },
  { emoji: '👋', label: '约朋友出去玩', difficulty: 'hard' },
  { emoji: '🎵', label: '学一首新歌', difficulty: 'hard' },
  { emoji: '🍳', label: '帮家人做一顿饭', difficulty: 'hard' }
];

const BODY_PARTS = [
  { name: '头部', emoji: '🧠', instruction: '轻轻转动头部，感受脖子的放松' },
  { name: '肩膀', emoji: '💪', instruction: '耸起肩膀到耳朵，保持5秒，然后放下' },
  { name: '手臂', emoji: '🤲', instruction: '伸直双臂，握紧拳头5秒，然后松开' },
  { name: '肚子', emoji: '🫁', instruction: '深吸一口气让肚子鼓起来，慢慢呼气' },
  { name: '腿部', emoji: '🦵', instruction: '绷紧大腿肌肉5秒，然后完全放松' },
  { name: '脚', emoji: '🦶', instruction: '用力弯曲脚趾5秒，然后伸展开' }
];

const PSYCHO_ED_TOPICS = [
  {
    title: '什么是抑郁？',
    emoji: '🧩',
    content: '抑郁就像天空被厚厚的云遮住了，太阳还在那里，只是暂时看不见。当一个人感到抑郁时，可能会觉得很累、不想做事、不开心，甚至觉得什么都没意思。这不是你的错，就像感冒一样，它是一种需要被关心和治疗的状态。'
  },
  {
    title: '这不是你的错',
    emoji: '💝',
    content: '有些小朋友会觉得"是不是我不够好才会这样"。答案是：绝对不是！抑郁不是因为你做了什么不好的事，也不是因为你不够坚强。它就像身体生病一样，任何人都可能遇到，重要的是寻求帮助。'
  },
  {
    title: '很多人和你一样',
    emoji: '🤝',
    content: '你知道吗？在全世界，大约每5个小朋友中就有1个曾经感到过非常难过和低落。你不是一个人在面对这些，很多小朋友都有过和你一样的感受。'
  },
  {
    title: '它会好起来的',
    emoji: '🌈',
    content: '就像下雨天不会永远下雨一样，这种难过的感觉也不会一直持续。通过和信任的人聊天、做让自己开心的事、学习新的方法来管理情绪，你会慢慢感觉好起来的。很多曾经感到抑郁的小朋友，后来都变得更快乐、更坚强了。'
  },
  {
    title: '什么时候要告诉大人？',
    emoji: '🗣️',
    content: '如果你连续好几天都觉得很难过、不想吃东西、睡不着觉、不想和任何人说话，或者觉得什么都没意思，请一定要告诉爸爸妈妈、老师或者其他你信任的大人。他们会帮助你，这是最勇敢的事情。'
  }
];

// ─── New Feature Constants ──────────────────────────────────────────────────

const EMOTION_WHEEL = [
  { category: '开心', emoji: '😊', color: 'bg-yellow-100', words: [
    { word: '快乐', desc: '感到愉悦和满足' }, { word: '兴奋', desc: '对某事充满期待和激动' },
    { word: '自豪', desc: '为自己做到的事感到骄傲' }, { word: '感恩', desc: '觉得被关心，心里暖暖的' },
    { word: '满足', desc: '觉得现在的一切刚刚好' }, { word: '希望', desc: '相信好的事情会发生' }
  ]},
  { category: '难过', emoji: '😢', color: 'bg-blue-100', words: [
    { word: '失望', desc: '期待的事没有发生' }, { word: '孤独', desc: '觉得没有人陪伴' },
    { word: '委屈', desc: '觉得被误解或不公平' }, { word: '想念', desc: '想念不在身边的人或事' },
    { word: '无助', desc: '觉得不知道该怎么办' }, { word: '心痛', desc: '心里像被刺了一下' }
  ]},
  { category: '害怕', emoji: '😨', color: 'bg-purple-100', words: [
    { word: '紧张', desc: '身体发紧，心跳加快' }, { word: '担心', desc: '一直在想不好的事会不会发生' },
    { word: '恐惧', desc: '感到非常害怕' }, { word: '不安', desc: '坐不住，心里七上八下' },
    { word: '羞怯', desc: '不好意思，不敢说话或做事' }, { word: '焦虑', desc: '总觉得有什么不好的事要发生' }
  ]},
  { category: '生气', emoji: '😤', color: 'bg-red-100', words: [
    { word: '愤怒', desc: '非常非常生气' }, { word: '烦躁', desc: '什么都觉得不顺心' },
    { word: '嫉妒', desc: '看到别人有而自己没有' }, { word: '不满', desc: '觉得事情不应该这样' },
    { word: '受伤', desc: '别人的话或行为让你难受' }, { word: '厌烦', desc: '不想再继续了' }
  ]},
  { category: '平静', emoji: '😌', color: 'bg-green-100', words: [
    { word: '放松', desc: '身体和心情都很舒服' }, { word: '安心', desc: '觉得一切都很安全' },
    { word: '好奇', desc: '想要了解更多' }, { word: '专注', desc: '全部注意力都在一件事上' },
    { word: '勇敢', desc: '虽然害怕但还是去做' }, { word: '温暖', desc: '心里暖暖的，很舒服' }
  ]}
];

const STRENGTHS_QUESTIONS = [
  { q: '你最喜欢做什么事？', emoji: '🌟', options: ['画画/手工', '运动/跳舞', '读书/写作', '帮助别人', '探索新事物', '和朋友玩'] },
  { q: '别人最常夸你什么？', emoji: '💪', options: ['很聪明', '很善良', '很勇敢', '很有创意', '很有耐心', '很搞笑'] },
  { q: '遇到困难时你通常会？', emoji: '🧩', options: ['想办法解决', '找人帮忙', '不放弃继续试', '换个方式做', '先冷静想想', '鼓励自己'] },
  { q: '你觉得自己像哪种动物？', emoji: '🐾', options: ['狮子(勇敢)', '海豚(聪明)', '小狗(友善)', '猫头鹰(智慧)', '蝴蝶(自由)', '蜜蜂(勤劳)'] },
  { q: '和朋友在一起时你喜欢？', emoji: '👫', options: ['当领导组织', '听别人说话', '讲笑话逗大家', '帮助需要帮助的人', '想出好点子', '默默支持大家'] }
];

const STRENGTH_CARDS = {
  '画画/手工': { title: '创造力', emoji: '🎨', desc: '你有丰富的想象力和创造力！' },
  '运动/跳舞': { title: '活力', emoji: '⚡', desc: '你充满能量，身体很棒！' },
  '读书/写作': { title: '智慧', emoji: '📖', desc: '你热爱学习，是个小小思想家！' },
  '帮助别人': { title: '善良', emoji: '💝', desc: '你有一颗温暖的心，总想帮助别人！' },
  '探索新事物': { title: '好奇心', emoji: '🔍', desc: '你对世界充满好奇，勇于探索！' },
  '和朋友玩': { title: '社交力', emoji: '🤝', desc: '你擅长与人相处，大家都喜欢你！' },
  '很聪明': { title: '聪慧', emoji: '🧠', desc: '你思维敏捷，学东西很快！' },
  '很善良': { title: '仁爱', emoji: '💗', desc: '你总是关心别人的感受！' },
  '很勇敢': { title: '勇气', emoji: '🦁', desc: '面对困难你不退缩！' },
  '很有创意': { title: '创新', emoji: '💡', desc: '你总能想到别人想不到的好主意！' },
  '很有耐心': { title: '耐心', emoji: '🐢', desc: '你能坚持做好每一件事！' },
  '很搞笑': { title: '幽默', emoji: '😄', desc: '你能给周围的人带来快乐！' },
  '想办法解决': { title: '解决力', emoji: '🔧', desc: '你是解决问题的小高手！' },
  '找人帮忙': { title: '合作力', emoji: '🤲', desc: '你知道什么时候该寻求帮助！' },
  '不放弃继续试': { title: '坚持', emoji: '💎', desc: '你有不放弃的精神！' },
  '换个方式做': { title: '灵活', emoji: '🌊', desc: '你善于变通，总能找到新路！' },
  '先冷静想想': { title: '冷静', emoji: '🧊', desc: '你能在压力下保持冷静！' },
  '鼓励自己': { title: '自信', emoji: '🌟', desc: '你相信自己，能给自己力量！' },
  '狮子(勇敢)': { title: '勇敢', emoji: '🦁', desc: '你像狮子一样勇敢无畏！' },
  '海豚(聪明)': { title: '聪明', emoji: '🐬', desc: '你像海豚一样聪明机灵！' },
  '小狗(友善)': { title: '友善', emoji: '🐶', desc: '你像小狗一样忠诚友善！' },
  '猫头鹰(智慧)': { title: '智慧', emoji: '🦉', desc: '你像猫头鹰一样充满智慧！' },
  '蝴蝶(自由)': { title: '自由', emoji: '🦋', desc: '你像蝴蝶一样追求美好！' },
  '蜜蜂(勤劳)': { title: '勤劳', emoji: '🐝', desc: '你像蜜蜂一样勤劳努力！' },
  '当领导组织': { title: '领导力', emoji: '👑', desc: '你天生是领导者！' },
  '听别人说话': { title: '倾听', emoji: '👂', desc: '你是最好的倾听者！' },
  '讲笑话逗大家': { title: '快乐使者', emoji: '🎉', desc: '你是团队的开心果！' },
  '帮助需要帮助的人': { title: '关怀', emoji: '🫂', desc: '你总是关心需要帮助的人！' },
  '想出好点子': { title: '创意大师', emoji: '💡', desc: '你是点子王！' },
  '默默支持大家': { title: '守护者', emoji: '🛡️', desc: '你是大家的坚强后盾！' }
};

const REWARD_ITEMS = [
  { id: 'theme_ocean', emoji: '🌊', name: '海洋主题', cost: 50, type: 'theme' },
  { id: 'theme_forest', emoji: '🌲', name: '森林主题', cost: 50, type: 'theme' },
  { id: 'theme_space', emoji: '🚀', name: '太空主题', cost: 50, type: 'theme' },
  { id: 'badge_star', emoji: '⭐', name: '超级之星徽章', cost: 30, type: 'badge' },
  { id: 'badge_heart', emoji: '💖', name: '爱心勇士徽章', cost: 30, type: 'badge' },
  { id: 'badge_brain', emoji: '🧠', name: '智慧达人徽章', cost: 30, type: 'badge' },
  { id: 'game_puzzle', emoji: '🧩', name: '解锁拼图小游戏', cost: 80, type: 'game' },
  { id: 'game_coloring', emoji: '🎨', name: '解锁涂色小游戏', cost: 80, type: 'game' },
  { id: 'avatar_crown', emoji: '👑', name: '皇冠装饰', cost: 60, type: 'avatar' },
  { id: 'avatar_wings', emoji: '🪽', name: '翅膀装饰', cost: 60, type: 'avatar' },
  { id: 'sticker_pack1', emoji: '🏅', name: '勇气贴纸包', cost: 20, type: 'sticker' },
  { id: 'sticker_pack2', emoji: '🌈', name: '彩虹贴纸包', cost: 20, type: 'sticker' }
];

const PEER_STORIES = [
  {
    name: '小明', age: 10, emoji: '👦',
    story: '去年我经常觉得很难过，不想去学校，也不想和同学玩。后来妈妈带我去看了一位很温柔的医生，她教我用深呼吸来让自己平静下来。我还开始每天写日记，把心里的话都写下来。慢慢地，我发现难过的日子越来越少了。现在我有了两个好朋友，我们经常一起画画。',
    tip: '勇敢地告诉大人你的感受，他们会帮助你的。'
  },
  {
    name: '小花', age: 11, emoji: '👧',
    story: '我曾经因为转学到新学校感到非常孤独和害怕。每天都在想以前的朋友，晚上也睡不好觉。老师发现了我的变化，鼓励我加入了学校的手工社团。在那里我学会了折纸和编织，还认识了和我一样喜欢手工的小伙伴。现在回想起来，那段难过的时光也让我变得更坚强了。',
    tip: '找到一件你喜欢做的事，它会帮你交到新朋友。'
  },
  {
    name: '小杰', age: 9, emoji: '👦',
    story: '爸爸妈妈离婚的时候，我觉得是自己的错。我变得很爱生气，在学校也和同学吵架。后来学校的心理老师告诉我，大人的事不是小朋友的错。她教我在生气的时候数到10，或者用力捏一个压力球。我现在知道了，爸爸妈妈虽然分开住，但他们都很爱我。',
    tip: '大人的问题不是你的错，你值得被爱。'
  },
  {
    name: '小雨', age: 12, emoji: '👧',
    story: '我曾经因为学习成绩不好而特别自卑，觉得自己什么都做不好。有一次美术课上，老师夸我的画很有创意，我才发现原来我也有擅长的事。我开始用画画来表达心情，难过的时候就画画，生气的时候也画画。现在我的画还在学校展览了呢！每个人都有自己的闪光点。',
    tip: '每个人都有自己的特长，找到你的闪光点。'
  }
];

const PARENT_CHILD_DATA = [
  {
    title: '一起做饭', emoji: '🍳', duration: '30-60分钟',
    steps: ['一起选一个简单的食谱', '让孩子帮忙洗菜或搅拌', '一起品尝成果'],
    prompts: ['你觉得今天做的菜好吃吗？', '你最想学做什么菜？', '我们下次试试新食谱好吗？']
  },
  {
    title: '户外散步', emoji: '🚶', duration: '20-30分钟',
    steps: ['选一条熟悉或新的路线', '边走边观察周围的自然', '可以收集落叶或石头作纪念'],
    prompts: ['你今天在学校看到了什么有趣的事？', '如果可以去任何地方，你想去哪里？', '你最近有什么开心的事想分享吗？']
  },
  {
    title: '睡前故事时光', emoji: '📚', duration: '15-20分钟',
    steps: ['选一本孩子喜欢的书', '轮流朗读或一起讨论', '聊聊故事里的人物和感受'],
    prompts: ['你最喜欢故事里的哪个角色？为什么？', '如果你是主人公，你会怎么做？', '这个故事让你想到了什么？']
  },
  {
    title: '画画/手工时间', emoji: '🎨', duration: '30分钟',
    steps: ['准备画笔、纸张或手工材料', '各自画一幅画，然后互相分享', '把作品贴在家里展示'],
    prompts: ['你画的是什么？告诉我这个故事', '你今天心情怎么样？可以用颜色表达吗？', '你最喜欢什么颜色？为什么？']
  },
  {
    title: '棋盘游戏', emoji: '🎲', duration: '30-45分钟',
    steps: ['选一个适合年龄的棋盘游戏', '耐心解释规则', '享受游戏过程，不只关注输赢'],
    prompts: ['你觉得这个游戏有趣吗？', '你想教我玩你在学校学到的游戏吗？', '输了的时候你有什么感觉？']
  },
  {
    title: '感恩分享', emoji: '🙏', duration: '10分钟',
    steps: ['每人说出今天感恩的三件事', '认真倾听对方的分享', '给对方一个拥抱'],
    prompts: ['今天最让你开心的事是什么？', '你最感谢谁？为什么？', '你觉得我们家最棒的地方是什么？']
  }
];

const NATURE_ACTIVITIES = [
  { emoji: '🌳', label: '在公园散步', minutes: 20, points: 10 },
  { emoji: '🌺', label: '观察花朵和植物', minutes: 15, points: 8 },
  { emoji: '🐦', label: '听鸟儿唱歌', minutes: 10, points: 5 },
  { emoji: '☀️', label: '晒太阳', minutes: 15, points: 8 },
  { emoji: '🌧️', label: '听雨声', minutes: 10, points: 5 },
  { emoji: '⭐', label: '看星星/月亮', minutes: 10, points: 5 },
  { emoji: '🍃', label: '收集树叶', minutes: 20, points: 10 },
  { emoji: '🪨', label: '在小溪边玩', minutes: 30, points: 15 },
  { emoji: '🌱', label: '种一颗种子', minutes: 15, points: 10 },
  { emoji: '🐛', label: '观察小昆虫', minutes: 10, points: 5 }
];

// ─── Batch 3 Constants ──────────────────────────────────────────────────────

const ROUTINE_SLOTS = [
  { period: '早上', emoji: '🌅', suggestions: ['刷牙洗脸', '吃早餐', '整理书包', '做呼吸练习', '对自己说一句鼓励的话'] },
  { period: '下午', emoji: '☀️', suggestions: ['写作业', '运动30分钟', '和朋友玩', '画画或做手工', '读一本书'] },
  { period: '晚上', emoji: '🌙', suggestions: ['和家人吃饭', '洗澡', '写日记', '做冥想', '按时上床睡觉'] }
];

const COPING_CARDS = {
  '生气': [
    { emoji: '🧊', tip: '握一块冰，感受冷冷的感觉' },
    { emoji: '🏃', tip: '跑几圈或做10个跳跃' },
    { emoji: '🔢', tip: '从10倒数到1' },
    { emoji: '🎨', tip: '用力在纸上画你的怒气' },
    { emoji: '🧸', tip: '紧紧抱住你的枕头或玩偶' }
  ],
  '难过': [
    { emoji: '🤗', tip: '找一个人抱一抱' },
    { emoji: '📞', tip: '给你最好的朋友打电话' },
    { emoji: '🎵', tip: '听一首你喜欢的歌' },
    { emoji: '📝', tip: '写下你的感受' },
    { emoji: '🐶', tip: '和宠物待在一起' }
  ],
  '焦虑': [
    { emoji: '👃', tip: '做5次深呼吸：吸4秒，屏4秒，呼4秒' },
    { emoji: '👀', tip: '5-4-3-2-1：看5样东西，摸4样，听3样' },
    { emoji: '🦶', tip: '感受你的双脚踩在地上' },
    { emoji: '💧', tip: '慢慢喝一杯水' },
    { emoji: '🌳', tip: '想象你最喜欢的安全地方' }
  ],
  '孤独': [
    { emoji: '💌', tip: '给朋友写一封信或发一条消息' },
    { emoji: '📚', tip: '读一个有趣的故事' },
    { emoji: '🎮', tip: '做一件你擅长的事' },
    { emoji: '🪟', tip: '去外面走走，看看周围的人' },
    { emoji: '📖', tip: '看看伙伴故事，你不是一个人' }
  ]
};

const KINDNESS_MISSIONS = [
  { emoji: '😊', mission: '对一个人微笑' },
  { emoji: '🙏', mission: '对帮助你的人说谢谢' },
  { emoji: '🎨', mission: '给家人画一幅画' },
  { emoji: '🤝', mission: '帮同学拿一样东西' },
  { emoji: '💬', mission: '主动和一个人打招呼' },
  { emoji: '🧹', mission: '帮家人做一件家务' },
  { emoji: '📝', mission: '给朋友写一张鼓励的小纸条' },
  { emoji: '🍎', mission: '和别人分享你的零食' },
  { emoji: '👂', mission: '认真听一个人说完他的话' },
  { emoji: '🌺', mission: '夸一个人今天做得好的事' },
  { emoji: '🚪', mission: '帮别人开一次门' },
  { emoji: '📞', mission: '给想念的人打一个电话' },
  { emoji: '🎁', mission: '做一个小手工送给别人' },
  { emoji: '💗', mission: '告诉一个人你喜欢他/她' }
];

const COMPASSION_EXERCISES = [
  {
    title: '给自己写一封信', emoji: '💌',
    instruction: '想象你最好的朋友正在经历你一样的事。你会对他/她说什么？现在，把这些话写给自己。',
    prompt: '亲爱的自己...'
  },
  {
    title: '温暖的拥抱', emoji: '🤗',
    instruction: '双手交叉放在胸前，轻轻抱住自己。感受这个温暖的拥抱，对自己说："我值得被爱。"',
    prompt: null
  },
  {
    title: '你不是一个人', emoji: '🌍',
    instruction: '世界上有很多很多小朋友和你有一样的感受。想象他们都在你身边，大家手牵手。你不是一个人在面对这些。',
    prompt: null
  },
  {
    title: '三句话练习', emoji: '✨',
    instruction: '闭上眼睛，在心里对自己说三句话：\n1. "这一刻很难受"\n2. "很多人和我一样"\n3. "我要对自己好一点"',
    prompt: null
  }
];

const GROUNDING_STEPS = [
  { sense: '看', count: 5, emoji: '👀', instruction: '看看周围，找到5样你能看见的东西', color: 'bg-blue-100' },
  { sense: '摸', count: 4, emoji: '✋', instruction: '摸摸周围，找到4样你能触碰的东西', color: 'bg-green-100' },
  { sense: '听', count: 3, emoji: '👂', instruction: '安静一下，找到3种你能听到的声音', color: 'bg-yellow-100' },
  { sense: '闻', count: 2, emoji: '👃', instruction: '闻一闻，找到2种你能闻到的气味', color: 'bg-orange-100' },
  { sense: '尝', count: 1, emoji: '👅', instruction: '感受一下，找到1种你能尝到的味道', color: 'bg-pink-100' }
];

// ─── Batch 4 Constants ──────────────────────────────────────────────────────

const STORY_CHARACTERS = [
  { emoji: '🐰', name: '小兔子' }, { emoji: '🐻', name: '小熊' },
  { emoji: '🦊', name: '小狐狸' }, { emoji: '🐱', name: '小猫咪' },
  { emoji: '🐶', name: '小狗狗' }, { emoji: '🦁', name: '小狮子' }
];

const STORY_PROBLEMS = [
  '在新学校没有朋友', '考试考得不好很难过', '爸爸妈妈总是吵架',
  '被同学笑话了', '觉得自己什么都做不好', '晚上总是睡不着觉'
];

const STORY_HELPERS = [
  { emoji: '🧙', name: '智慧老人' }, { emoji: '🧚', name: '小精灵' },
  { emoji: '🌟', name: '魔法星星' }, { emoji: '🦋', name: '蝴蝶朋友' }
];

const STORY_ENDINGS = [
  '发现了自己隐藏的力量，变得更勇敢了',
  '交到了一个真正的好朋友',
  '学会了用新的方式看待困难',
  '发现原来很多人都在关心自己'
];

const NATURE_SOUNDS = [
  { emoji: '🌧️', name: '雨声', desc: '轻柔的雨滴声' },
  { emoji: '🌊', name: '海浪', desc: '海浪拍打沙滩' },
  { emoji: '🐦', name: '鸟鸣', desc: '清晨的鸟叫声' },
  { emoji: '🌲', name: '森林', desc: '风吹过树叶' },
  { emoji: '🦗', name: '虫鸣', desc: '夏夜的虫鸣声' },
  { emoji: '🔥', name: '篝火', desc: '温暖的火焰声' }
];

const PET_ACTIONS = [
  { id: 'feed', emoji: '🍎', label: '喂食', need: 'hunger', message: '你好好吃饭了！小伙伴也饱饱的 😊' },
  { id: 'walk', emoji: '🚶', label: '散步', need: 'exercise', message: '你运动了！小伙伴也变得精神了 💪' },
  { id: 'sleep', emoji: '😴', label: '睡觉', need: 'rest', message: '你好好休息了！小伙伴也睡得香 💤' },
  { id: 'play', emoji: '🎮', label: '玩耍', need: 'fun', message: '你做了开心的事！小伙伴也好开心 🎉' },
  { id: 'talk', emoji: '💬', label: '聊天', need: 'social', message: '你和别人交流了！小伙伴也不孤单了 💗' }
];

const PET_TYPES = [
  { emoji: '🐱', name: '小猫咪' }, { emoji: '🐶', name: '小狗狗' },
  { emoji: '🐰', name: '小兔子' }, { emoji: '🐼', name: '小熊猫' },
  { emoji: '🐨', name: '小考拉' }, { emoji: '🦊', name: '小狐狸' }
];

const VALUES_CARDS = [
  { emoji: '👫', value: '友谊', desc: '和朋友在一起，互相关心' },
  { emoji: '📚', value: '学习', desc: '探索新知识，变得更聪明' },
  { emoji: '👨‍👩‍👧', value: '家人', desc: '和家人在一起，感到温暖' },
  { emoji: '🎨', value: '创造', desc: '画画、做手工、发明新东西' },
  { emoji: '💪', value: '勇气', desc: '面对害怕的事，不退缩' },
  { emoji: '🤝', value: '善良', desc: '帮助别人，让世界更好' },
  { emoji: '🏃', value: '运动', desc: '让身体动起来，变得强壮' },
  { emoji: '🌳', value: '自然', desc: '亲近大自然，感受美好' },
  { emoji: '😄', value: '快乐', desc: '寻找开心的事，享受生活' },
  { emoji: '🧩', value: '挑战', desc: '解决难题，突破自己' }
];

const YOGA_POSES = [
  { name: '大山式', emoji: '🏔️', instruction: '双脚站稳，双手举过头顶，想象自己是一座大山，稳稳地站着。深吸一口气，感受自己的力量。', thought: '我像大山一样稳定和坚强' },
  { name: '大树式', emoji: '🌳', instruction: '单脚站立，另一只脚放在小腿上，双手合十在胸前或举过头顶。像大树一样扎根。', thought: '我像大树一样扎根大地' },
  { name: '小猫式', emoji: '🐱', instruction: '四肢着地，吸气时抬头翘臀（牛式），呼气时低头弓背（猫式）。慢慢做5次。', thought: '我的身体柔软又灵活' },
  { name: '蝴蝶式', emoji: '🦋', instruction: '坐下来，脚掌相对，膝盖向两边打开。轻轻上下摆动膝盖，像蝴蝶扇翅膀。', thought: '我像蝴蝶一样自由美丽' },
  { name: '小狗式', emoji: '🐶', instruction: '双手和双脚撑地，臀部抬高，身体像一个倒V字。深呼吸5次。', thought: '我充满活力和能量' },
  { name: '星星式', emoji: '⭐', instruction: '双脚分开站立，双手张开，像一颗大星星。深呼吸，感受身体的每一个部分。', thought: '我是一颗闪亮的星星' }
];

const DETECTIVE_SCENARIOS = [
  { situation: '你的好朋友今天没有和你说话', thoughts: ['她不喜欢我了', '她可能心情不好', '她可能在忙别的事'], bodyFeelings: ['胸口闷闷的', '肚子不舒服', '头有点痛'] },
  { situation: '老师在全班面前批评了你', thoughts: ['我太笨了', '老师讨厌我', '我下次可以做得更好'], bodyFeelings: ['脸变红了', '想哭', '手心出汗'] },
  { situation: '你被选为最后一个加入队伍', thoughts: ['没有人想要我', '我运动不好', '他们只是不了解我'], bodyFeelings: ['喉咙紧紧的', '肩膀很沉', '想要跑走'] },
  { situation: '爸妈说今天不能出去玩', thoughts: ['他们不爱我', '他们可能有原因', '也许明天可以'], bodyFeelings: ['很生气', '眼睛酸酸的', '全身没力气'] }
];

// ─── Batch 5 Constants ──────────────────────────────────────────────────────

const DRAWING_COLORS = [
  { color: '#ef4444', label: '生气', emoji: '😡' },
  { color: '#3b82f6', label: '难过', emoji: '😢' },
  { color: '#eab308', label: '开心', emoji: '😊' },
  { color: '#22c55e', label: '平静', emoji: '😌' },
  { color: '#a855f7', label: '害怕', emoji: '😨' },
  { color: '#f97316', label: '焦虑', emoji: '😰' },
  { color: '#ec4899', label: '爱', emoji: '💗' },
  { color: '#000000', label: '其他', emoji: '✏️' }
];

const BODY_EMOTION_ZONES = [
  { id: 'head', name: '头部', top: '5%', left: '38%', w: '24%', h: '15%' },
  { id: 'chest', name: '胸口', top: '25%', left: '33%', w: '34%', h: '15%' },
  { id: 'stomach', name: '肚子', top: '42%', left: '35%', w: '30%', h: '13%' },
  { id: 'hands', name: '手', top: '45%', left: '15%', w: '15%', h: '10%' },
  { id: 'hands2', name: '手', top: '45%', left: '70%', w: '15%', h: '10%' },
  { id: 'legs', name: '腿', top: '60%', left: '33%', w: '34%', h: '20%' },
  { id: 'throat', name: '喉咙', top: '20%', left: '40%', w: '20%', h: '6%' }
];

const BODY_SENSATIONS = ['紧绷', '发热', '发冷', '刺痛', '沉重', '空洞', '颤抖', '麻木', '蝴蝶飞', '打结'];

const THINKING_TRAPS = [
  { name: '全有全无怪', emoji: '⚫⚪', desc: '只看到黑和白，没有中间地带', example: '"我考了95分，不是100分，所以我失败了"', fix: '想想中间的灰色地带' },
  { name: '读心术', emoji: '🔮', desc: '以为自己知道别人在想什么', example: '"他没跟我说话，一定是讨厌我"', fix: '你不是真的能读心，问问对方' },
  { name: '预言家', emoji: '🎱', desc: '预测最坏的结果一定会发生', example: '"明天的演讲我一定会出丑"', fix: '最坏的结果很少会发生' },
  { name: '怪罪磁铁', emoji: '🧲', desc: '把所有坏事都怪在自己身上', example: '"爸妈吵架一定是因为我不好"', fix: '很多事不是你的错' },
  { name: '放大镜', emoji: '🔍', desc: '把坏事放大，把好事缩小', example: '"一个人不喜欢我=没人喜欢我"', fix: '坏事只是一小部分' },
  { name: '应该怪', emoji: '📏', desc: '对自己有太多"应该"', example: '"我应该永远开心，不应该难过"', fix: '没有人能做到所有的"应该"' }
];

const FEAR_LEVELS = ['一点点害怕 😟', '有点害怕 😰', '比较害怕 😨', '很害怕 😱', '非常害怕 🫣'];

const SAFE_PLACE_LOCATIONS = [
  { emoji: '🏖️', name: '温暖的沙滩' }, { emoji: '🏡', name: '树屋' },
  { emoji: '☁️', name: '柔软的云朵' }, { emoji: '🌲', name: '安静的森林' },
  { emoji: '🏔️', name: '山顶' }, { emoji: '🌌', name: '星空下' }
];

const SAFE_PLACE_ELEMENTS = [
  { emoji: '🐶', name: '小狗陪伴' }, { emoji: '🧸', name: '毛绒玩具' },
  { emoji: '🎵', name: '轻柔音乐' }, { emoji: '🕯️', name: '温暖的光' },
  { emoji: '🌺', name: '花的香气' }, { emoji: '☕', name: '热巧克力' },
  { emoji: '📚', name: '喜欢的书' }, { emoji: '🤗', name: '好朋友' },
  { emoji: '🧣', name: '柔软毯子' }, { emoji: '🌈', name: '彩虹' }
];

const FAVORITE_COLORS = [
  { name: '天空蓝', value: 'blue', bg: 'bg-blue-400', gradient: 'from-blue-50 to-cyan-50' },
  { name: '樱花粉', value: 'pink', bg: 'bg-pink-400', gradient: 'from-pink-50 to-rose-50' },
  { name: '薄荷绿', value: 'green', bg: 'bg-green-400', gradient: 'from-green-50 to-emerald-50' },
  { name: '阳光黄', value: 'yellow', bg: 'bg-yellow-400', gradient: 'from-yellow-50 to-amber-50' },
  { name: '星空紫', value: 'purple', bg: 'bg-purple-400', gradient: 'from-purple-50 to-violet-50' },
  { name: '暖橙色', value: 'orange', bg: 'bg-orange-400', gradient: 'from-orange-50 to-amber-50' }
];

const GUIDED_PATHWAYS = {
  '开心': {
    title: '保持好心情',
    emoji: '🌈',
    desc: '你今天心情不错！试试这些让快乐延续的活动',
    tools: ['gratitude', 'kindness', 'celebration', 'compliments', 'nature']
  },
  '平静': {
    title: '深度放松',
    emoji: '🍃',
    desc: '平静的时候最适合深入探索自己',
    tools: ['meditation', 'values', 'dreamjournal', 'mindfuleat', 'bodyscan']
  },
  '难过': {
    title: '温柔疗愈',
    emoji: '💗',
    desc: '难过的时候，让我们一步步好起来',
    tools: ['breathing', 'compassion', 'safeplace', 'pet', 'peerstories']
  },
  '焦虑': {
    title: '平复焦虑',
    emoji: '🌊',
    desc: '深呼吸，我们一起把焦虑赶走',
    tools: ['grounding', 'breathing', 'worrysorter', 'movement', 'worrybox']
  },
  '生气': {
    title: '冷静下来',
    emoji: '🧊',
    desc: '生气是正常的，让我们学会管理它',
    tools: ['volcano', 'breathing', 'grounding', 'thought', 'coping']
  }
};

const TOOL_CATEGORIES = [
  { name: '放松与正念', emoji: '🧘', ids: ['bodyscan', 'grounding', 'movement', 'safeplace', 'mindfuleat'] },
  { name: '情绪认知', emoji: '🎭', ids: ['emotions', 'thermometer', 'bodymap', 'detective', 'moodchart'] },
  { name: '思维训练', emoji: '🧠', ids: ['thought', 'traps', 'worrybox', 'worrysorter', 'predict'] },
  { name: '积极行动', emoji: '🌟', ids: ['activation', 'activity', 'kindness', 'goals', 'routine'] },
  { name: '自我成长', emoji: '🌱', ids: ['strengths', 'values', 'fearladder', 'problemsolve', 'psychoedu'] },
  { name: '创意表达', emoji: '🎨', ids: ['drawboard', 'storycreator', 'playlist', 'dreamjournal', 'timecapsule'] },
  { name: '感恩与关爱', emoji: '💖', ids: ['gratitude', 'gratitudeletter', 'compassion', 'compliments', 'affirmation'] },
  { name: '社交与支持', emoji: '👫', ids: ['social', 'peerstories', 'parentchild', 'pet', 'nature'] },
  { name: '每日仪式', emoji: '☀️', ids: ['morningroutine', 'eveningroutine', 'routine', 'streakrewards', 'moodinsights'] },
  { name: '应急与安全', emoji: '🛡️', ids: ['coping', 'firstaid', 'safety', 'volcano', 'sleep'] },
  { name: '记录与回顾', emoji: '📊', ids: ['jar', 'celebration', 'weekreview', 'rewards', 'achievementshare'] },
  { name: '家长与支持', emoji: '👨‍👩‍👧', ids: ['parent', 'parentnudge', 'therapistreport', 'emotionvocab'] }
];

// ─── Streak Rewards ──────────────────────────────────────────────────────────
const STREAK_BADGES = [
  { days: 3, emoji: '🌱', title: '小种子', desc: '连续3天打卡' },
  { days: 7, emoji: '🌿', title: '小树苗', desc: '连续7天打卡' },
  { days: 14, emoji: '🌳', title: '小树', desc: '连续14天打卡' },
  { days: 30, emoji: '🌲', title: '大树', desc: '连续30天打卡' },
  { days: 60, emoji: '🏔️', title: '高山', desc: '连续60天打卡' },
  { days: 100, emoji: '⭐', title: '超级星', desc: '连续100天打卡' }
];

const AVATAR_ACCESSORIES = [
  { id: 'hat1', emoji: '🎩', name: '小礼帽', cost: 50 },
  { id: 'crown', emoji: '👑', name: '小皇冠', cost: 100 },
  { id: 'glasses', emoji: '🕶️', name: '墨镜', cost: 30 },
  { id: 'bow', emoji: '🎀', name: '蝴蝶结', cost: 40 },
  { id: 'flower', emoji: '🌸', name: '花朵', cost: 20 },
  { id: 'star', emoji: '🌟', name: '星星', cost: 60 },
  { id: 'rainbow', emoji: '🌈', name: '彩虹', cost: 80 },
  { id: 'heart', emoji: '💎', name: '宝石', cost: 120 }
];

// ─── Morning & Evening Routines ──────────────────────────────────────────────
const MORNING_STEPS = [
  { id: 'mood', emoji: '😊', title: '记录心情', desc: '今天醒来感觉怎么样？' },
  { id: 'affirmation', emoji: '💪', title: '今日肯定', desc: '给自己一句鼓励的话' },
  { id: 'intention', emoji: '🎯', title: '今日小目标', desc: '今天想做一件什么事？' }
];

const EVENING_STEPS = [
  { id: 'gratitude', emoji: '🙏', title: '感恩时刻', desc: '今天最感谢的一件事' },
  { id: 'breathing', emoji: '🌬️', title: '睡前呼吸', desc: '3次深呼吸，放松身体' },
  { id: 'review', emoji: '📝', title: '一天回顾', desc: '今天过得怎么样？' }
];

// ─── Expanded Emotions ───────────────────────────────────────────────────────
const EMOTION_LEVELS = [
  { level: 0, label: '基础', minDays: 0, emotions: [
    { emoji: '😊', label: '开心' }, { emoji: '😌', label: '平静' }, { emoji: '😔', label: '难过' },
    { emoji: '😰', label: '焦虑' }, { emoji: '😡', label: '生气' }
  ]},
  { level: 1, label: '进阶', minDays: 3, emotions: [
    { emoji: '😤', label: '沮丧' }, { emoji: '🥰', label: '感动' }, { emoji: '😳', label: '害羞' },
    { emoji: '🤔', label: '困惑' }, { emoji: '😮', label: '惊讶' }
  ]},
  { level: 2, label: '高级', minDays: 7, emotions: [
    { emoji: '😞', label: '失望' }, { emoji: '🥺', label: '委屈' }, { emoji: '😤', label: '嫉妒' },
    { emoji: '🤗', label: '感恩' }, { emoji: '😶', label: '孤独' }
  ]},
  { level: 3, label: '专家', minDays: 14, emotions: [
    { emoji: '💪', label: '自豪' }, { emoji: '😣', label: '内疚' }, { emoji: '🫣', label: '尴尬' },
    { emoji: '🥱', label: '无聊' }, { emoji: '🤩', label: '兴奋' }
  ]}
];

// ─── Parent Nudge Templates ──────────────────────────────────────────────────
const NUDGE_TEMPLATES = [
  { emoji: '💗', text: '我注意到你今天好像有点安静，想不想一起试试小工具？' },
  { emoji: '🌟', text: '你最近做得很棒！我为你骄傲！' },
  { emoji: '🤗', text: '不管怎样，我都爱你。想聊聊吗？' },
  { emoji: '🎉', text: '今天一起做个亲子活动怎么样？' },
  { emoji: '☀️', text: '新的一天，你准备好了吗？我会一直在你身边。' },
  { emoji: '🌈', text: '心情不好的时候，记得深呼吸。我相信你可以的！' }
];

const TABS = [
  { id: 'home', icon: Sun, label: '首页', activeClass: 'text-purple-600 bg-purple-50' },
  { id: 'breathing', icon: Heart, label: '呼吸', activeClass: 'text-pink-600 bg-pink-50' },
  { id: 'meditation', icon: Cloud, label: '冥想', activeClass: 'text-blue-600 bg-blue-50' },
  { id: 'journal', icon: BookOpen, label: '日记', activeClass: 'text-purple-600 bg-purple-50' },
  { id: 'tools', icon: Menu, label: '工具箱', activeClass: 'text-green-600 bg-green-50' }
];

const TOOL_PAGES = [
  { id: 'activity', emoji: '⭐', title: '快乐活动', color: 'from-yellow-100 to-orange-100', desc: '做开心的事' },
  { id: 'thought', emoji: '🧠', title: '想法捕捉器', color: 'from-teal-100 to-cyan-100', desc: 'CBT认知练习' },
  { id: 'gratitude', emoji: '🙏', title: '三件好事', color: 'from-amber-100 to-yellow-100', desc: '感恩练习' },
  { id: 'activation', emoji: '🎯', title: '行为激活', color: 'from-green-100 to-emerald-100', desc: '小目标挑战' },
  { id: 'psychoedu', emoji: '📚', title: '心理小课堂', color: 'from-blue-100 to-indigo-100', desc: '了解自己' },
  { id: 'safety', emoji: '🛡️', title: '安全计划', color: 'from-red-100 to-pink-100', desc: '我的安全网' },
  { id: 'social', emoji: '👫', title: '社交连接', color: 'from-purple-100 to-pink-100', desc: '和别人在一起' },
  { id: 'sleep', emoji: '🌙', title: '睡眠管家', color: 'from-indigo-100 to-purple-100', desc: '好好睡觉' },
  { id: 'bodyscan', emoji: '🧘', title: '身体放松', color: 'from-emerald-100 to-teal-100', desc: '渐进式放松' },
  { id: 'affirmation', emoji: '💖', title: '肯定卡片', color: 'from-pink-100 to-rose-100', desc: '每日鼓励' },
  { id: 'parent', emoji: '👨‍👩‍👧', title: '家长看板', color: 'from-gray-100 to-slate-100', desc: '需要PIN码' },
  { id: 'moodchart', emoji: '📊', title: '心情图表', color: 'from-cyan-100 to-blue-100', desc: '活动与心情' },
  { id: 'worrybox', emoji: '📦', title: '烦恼盒子', color: 'from-orange-100 to-amber-100', desc: '管理焦虑' },
  { id: 'strengths', emoji: '💪', title: '力量卡片', color: 'from-yellow-100 to-amber-100', desc: '发现优势' },
  { id: 'emotions', emoji: '🎭', title: '情绪词汇', color: 'from-violet-100 to-purple-100', desc: '认识感受' },
  { id: 'rewards', emoji: '🏪', title: '奖励商店', color: 'from-yellow-100 to-orange-100', desc: '兑换积分' },
  { id: 'problemsolve', emoji: '🔧', title: '问题解决', color: 'from-sky-100 to-blue-100', desc: '4步解决法' },
  { id: 'peerstories', emoji: '📖', title: '伙伴故事', color: 'from-violet-100 to-pink-100', desc: '康复故事' },
  { id: 'parentchild', emoji: '👪', title: '亲子活动', color: 'from-pink-100 to-rose-100', desc: '一起互动' },
  { id: 'nature', emoji: '🌿', title: '自然处方', color: 'from-green-100 to-emerald-100', desc: '户外时间' },
  { id: 'therapist', emoji: '🏥', title: '心理师桥梁', color: 'from-blue-100 to-cyan-100', desc: '导出报告' },
  { id: 'routine', emoji: '📋', title: '日常计划', color: 'from-purple-100 to-pink-100', desc: '规律生活' },
  { id: 'thermometer', emoji: '🌡️', title: '情绪温度', color: 'from-orange-100 to-red-100', desc: '强度评分' },
  { id: 'coping', emoji: '🃏', title: '应急卡片', color: 'from-red-100 to-orange-100', desc: '即时应对' },
  { id: 'jar', emoji: '🫙', title: '成就瓶', color: 'from-amber-100 to-yellow-100', desc: '收集美好' },
  { id: 'compassion', emoji: '💗', title: '自我关怀', color: 'from-pink-100 to-rose-100', desc: '温柔对己' },
  { id: 'goals', emoji: '🪨', title: '目标石头', color: 'from-sky-100 to-blue-100', desc: '小步前进' },
  { id: 'grounding', emoji: '🌍', title: '感官着陆', color: 'from-blue-100 to-green-100', desc: '回到当下' },
  { id: 'predict', emoji: '🔮', title: '心情预测', color: 'from-violet-100 to-purple-100', desc: '预测vs现实' },
  { id: 'kindness', emoji: '🌻', title: '善意挑战', color: 'from-yellow-100 to-green-100', desc: '每日善行' },
  { id: 'weekreview', emoji: '📮', title: '每周回顾', color: 'from-indigo-100 to-purple-100', desc: '回顾成长' },
  { id: 'storycreator', emoji: '📝', title: '故事创作', color: 'from-purple-100 to-indigo-100', desc: '写勇气故事' },
  { id: 'playlist', emoji: '🎵', title: '心情歌单', color: 'from-pink-100 to-purple-100', desc: '音乐治愈' },
  { id: 'pet', emoji: '🐾', title: '小伙伴', color: 'from-yellow-100 to-orange-100', desc: '虚拟陪伴' },
  { id: 'values', emoji: '🧭', title: '价值罗盘', color: 'from-purple-100 to-blue-100', desc: '重要的事' },
  { id: 'timecapsule', emoji: '💌', title: '时间胶囊', color: 'from-indigo-100 to-blue-100', desc: '给未来的信' },
  { id: 'volcano', emoji: '🌋', title: '愤怒火山', color: 'from-red-100 to-orange-100', desc: '管理怒气' },
  { id: 'worrysorter', emoji: '🗂️', title: '烦恼分类', color: 'from-green-100 to-blue-100', desc: '能改变vs放下' },
  { id: 'movement', emoji: '🧘', title: '正念运动', color: 'from-green-100 to-teal-100', desc: '瑜伽放松' },
  { id: 'detective', emoji: '🔍', title: '情绪侦探', color: 'from-yellow-100 to-orange-100', desc: '想法→感受' },
  { id: 'celebration', emoji: '🎊', title: '庆祝墙', color: 'from-pink-100 to-purple-100', desc: '骄傲时刻' },
  { id: 'drawboard', emoji: '🎨', title: '情绪画板', color: 'from-purple-100 to-pink-100', desc: '画出感受' },
  { id: 'bodymap', emoji: '🫀', title: '身体地图', color: 'from-pink-100 to-red-100', desc: '感受在哪' },
  { id: 'traps', emoji: '🪤', title: '思维陷阱', color: 'from-yellow-100 to-orange-100', desc: '认知偏差' },
  { id: 'fearladder', emoji: '🪜', title: '勇气阶梯', color: 'from-yellow-100 to-amber-100', desc: '克服害怕' },
  { id: 'gratitudeletter', emoji: '💌', title: '感恩信', color: 'from-amber-100 to-yellow-100', desc: '写封感谢' },
  { id: 'firstaid', emoji: '🧰', title: '急救箱', color: 'from-red-100 to-pink-100', desc: '专属工具' },
  { id: 'dreamjournal', emoji: '🌙', title: '梦境日记', color: 'from-indigo-100 to-blue-100', desc: '记录梦境' },
  { id: 'mindfuleat', emoji: '🍎', title: '正念进食', color: 'from-green-100 to-lime-100', desc: '用心感受' },
  { id: 'compliments', emoji: '🔗', title: '夸夸链', color: 'from-pink-100 to-yellow-100', desc: '互相夸奖' },
  { id: 'safeplace', emoji: '🏠', title: '安全基地', color: 'from-blue-100 to-purple-100', desc: '想象安全' },
  { id: 'morningroutine', emoji: '🌅', title: '早安仪式', color: 'from-yellow-100 to-orange-100', desc: '开启新一天' },
  { id: 'eveningroutine', emoji: '🌙', title: '晚安仪式', color: 'from-indigo-100 to-purple-100', desc: '温暖入睡' },
  { id: 'streakrewards', emoji: '🏆', title: '成就奖励', color: 'from-yellow-100 to-amber-100', desc: '徽章装饰' },
  { id: 'moodinsights', emoji: '📊', title: '心情洞察', color: 'from-cyan-100 to-blue-100', desc: '情绪模式' },
  { id: 'emotionvocab', emoji: '🎭', title: '情绪词汇', color: 'from-violet-100 to-purple-100', desc: '扩展词汇' },
  { id: 'parentnudge', emoji: '💌', title: '温柔提醒', color: 'from-pink-100 to-rose-100', desc: '家长消息' },
  { id: 'therapistreport', emoji: '📋', title: '每周报告', color: 'from-blue-100 to-cyan-100', desc: '分享咨询师' },
  { id: 'achievementshare', emoji: '🎉', title: '分享成就', color: 'from-orange-100 to-yellow-100', desc: '展示进步' }
];

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const todayStr = () => new Date().toDateString();
const todayDate = () => new Date().toLocaleDateString('zh-CN');

// ─── Persistence ─────────────────────────────────────────────────────────────

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const today = todayStr();
    if (data.lastDate !== today) {
      data.dailyProgress = { ...DEFAULT_PROGRESS };
      const last = new Date(data.lastDate);
      const diff = Math.round((new Date(today) - last) / 86400000);
      if (diff > 1) data.streak = 0;
      data.lastDate = today;
    }
    return data;
  } catch (e) { return null; }
};

const saveState = (state) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
};

// ─── Extracted Components ────────────────────────────────────────────────────

function PageHeader({ emoji, title, subtitle }) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-2">{emoji}</div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-gray-600 mb-4 hover:text-gray-800">
      <ChevronLeft className="w-5 h-5" /> 返回
    </button>
  );
}

function MorningRoutinePage({ routine, onSave, onBack, userName }) {
  const todayKey = new Date().toDateString();
  const todayData = routine[todayKey] || {};
  const [moodPick, setMoodPick] = useState(todayData.mood || null);
  const [intention, setIntention] = useState(todayData.intention || '');
  const completed = Object.keys(todayData).length >= 2;

  const save = () => {
    onSave({ ...routine, [todayKey]: { mood: moodPick, intention, done: true, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) } });
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌅" title="早安仪式" subtitle={`${userName}，新的一天开始啦！`} />

      <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-5 shadow">
        <h3 className="font-bold text-gray-800 mb-3">{MORNING_STEPS[0].emoji} {MORNING_STEPS[0].title}</h3>
        <p className="text-sm text-gray-600 mb-3">{MORNING_STEPS[0].desc}</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {MOODS.map(m => (
            <button key={m.label} onClick={() => setMoodPick(m)}
              className={`p-3 rounded-full transition ${moodPick?.label === m.label ? 'ring-4 ring-yellow-400 scale-110 bg-yellow-200' : 'bg-white hover:scale-105'}`}>
              <span className="text-2xl">{m.emoji}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-5 shadow">
        <h3 className="font-bold text-gray-800 mb-2">{MORNING_STEPS[1].emoji} {MORNING_STEPS[1].title}</h3>
        <p className="text-center text-lg font-semibold text-purple-700 my-3">
          {AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length]}
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-5 shadow">
        <h3 className="font-bold text-gray-800 mb-2">{MORNING_STEPS[2].emoji} {MORNING_STEPS[2].title}</h3>
        <p className="text-sm text-gray-600 mb-3">{MORNING_STEPS[2].desc}</p>
        <input type="text" value={intention} onChange={e => setIntention(e.target.value)} placeholder="比如：今天要对同学微笑..."
          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none" maxLength={50} />
      </div>

      <button onClick={save} disabled={!moodPick}
        className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition">
        {completed ? '✅ 今天已完成' : '完成早安仪式 ☀️'}
      </button>
    </div>
  );
}

function EveningRoutinePage({ routine, onSave, onBack, userName }) {
  const todayKey = new Date().toDateString();
  const todayData = routine[todayKey] || {};
  const [gratitudeText, setGratitudeText] = useState(todayData.gratitude || '');
  const [reviewText, setReviewText] = useState(todayData.review || '');
  const [breathsDone, setBreathsDone] = useState(todayData.breaths || 0);

  const save = () => {
    onSave({ ...routine, [todayKey]: { gratitude: gratitudeText, review: reviewText, breaths: breathsDone, done: true, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) } });
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌙" title="晚安仪式" subtitle={`${userName}，辛苦了一天`} />

      <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl p-5 shadow">
        <h3 className="font-bold text-gray-800 mb-2">{EVENING_STEPS[0].emoji} {EVENING_STEPS[0].title}</h3>
        <p className="text-sm text-gray-600 mb-3">{EVENING_STEPS[0].desc}</p>
        <textarea value={gratitudeText} onChange={e => setGratitudeText(e.target.value)} placeholder="今天最感谢的一件事..."
          className="w-full h-20 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none" />
      </div>

      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-5 shadow">
        <h3 className="font-bold text-gray-800 mb-2">{EVENING_STEPS[1].emoji} {EVENING_STEPS[1].title}</h3>
        <p className="text-sm text-gray-600 mb-3">做3次深呼吸，点击计数</p>
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => setBreathsDone(n)}
              className={`w-14 h-14 rounded-full text-2xl transition ${breathsDone >= n ? 'bg-indigo-500 text-white scale-110' : 'bg-white border-2 border-indigo-200'}`}>
              {breathsDone >= n ? '✓' : n}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-5 shadow">
        <h3 className="font-bold text-gray-800 mb-2">{EVENING_STEPS[2].emoji} {EVENING_STEPS[2].title}</h3>
        <p className="text-sm text-gray-600 mb-3">{EVENING_STEPS[2].desc}</p>
        <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="今天过得怎么样呢..."
          className="w-full h-20 p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none" />
      </div>

      <button onClick={save}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition">
        完成晚安仪式 🌙
      </button>
    </div>
  );
}

function StreakRewardsPage({ streak, points, ownedAccessories, equippedAccessory, onBuy, onEquip, onBack }) {
  const earnedBadges = STREAK_BADGES.filter(b => streak >= b.days);
  const nextBadge = STREAK_BADGES.find(b => streak < b.days);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🏆" title="成就与奖励" subtitle="你的努力值得被看见" />

      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-5 text-white shadow-lg text-center">
        <p className="text-sm opacity-90">当前连续打卡</p>
        <p className="text-4xl font-bold my-2">{streak} 天</p>
        <p className="text-sm opacity-90">积分：{points} 分</p>
        {nextBadge && <p className="text-xs mt-2 opacity-80">再坚持 {nextBadge.days - streak} 天解锁 {nextBadge.emoji} {nextBadge.title}</p>}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">🏅 成长徽章</h3>
        <div className="grid grid-cols-3 gap-3">
          {STREAK_BADGES.map(badge => {
            const earned = streak >= badge.days;
            return (
              <div key={badge.days} className={`rounded-xl p-3 text-center ${earned ? 'bg-yellow-100' : 'bg-gray-100 opacity-50'}`}>
                <div className="text-3xl mb-1">{earned ? badge.emoji : '🔒'}</div>
                <p className="text-xs font-semibold text-gray-700">{badge.title}</p>
                <p className="text-xs text-gray-500">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">🎁 装饰商店</h3>
        <div className="grid grid-cols-2 gap-3">
          {AVATAR_ACCESSORIES.map(acc => {
            const owned = ownedAccessories.includes(acc.id);
            const equipped = equippedAccessory === acc.id;
            return (
              <button key={acc.id} onClick={() => owned ? onEquip(acc.id) : (points >= acc.cost && onBuy(acc.id, acc.cost))}
                className={`rounded-xl p-4 text-center transition hover:scale-105 ${equipped ? 'bg-purple-200 ring-2 ring-purple-400' : owned ? 'bg-green-100' : points >= acc.cost ? 'bg-white border-2 border-gray-200' : 'bg-gray-100 opacity-50'}`}>
                <div className="text-3xl mb-1">{acc.emoji}</div>
                <p className="text-sm font-semibold text-gray-700">{acc.name}</p>
                <p className="text-xs text-gray-500">{owned ? (equipped ? '已佩戴' : '点击佩戴') : `${acc.cost} 分`}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MoodInsightsPage({ moodHistory, toolUsageLog, onBack }) {
  const last7 = moodHistory.slice(-7);
  const last14 = moodHistory.slice(-14);
  const moodCounts = {};
  last14.forEach(m => { moodCounts[m.label] = (moodCounts[m.label] || 0) + 1; });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  const weekdayMoods = {};
  last14.forEach(m => {
    const day = new Date(m.date).getDay();
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const name = dayNames[day];
    if (!weekdayMoods[name]) weekdayMoods[name] = [];
    weekdayMoods[name].push(m.label);
  });

  const happyDays = Object.entries(weekdayMoods).filter(([, moods]) =>
    moods.filter(m => m === '开心' || m === '平静').length > moods.length / 2
  ).map(([day]) => day);

  const toolCounts = {};
  toolUsageLog.forEach(t => { toolCounts[t.toolId] = (toolCounts[t.toolId] || 0) + 1; });
  const topTools = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📊" title="心情洞察" subtitle="了解你的情绪模式" />

      {moodHistory.length < 7 ? (
        <div className="bg-yellow-100 rounded-2xl p-5 text-center">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-gray-700 font-semibold">再记录 {7 - moodHistory.length} 天心情</p>
          <p className="text-sm text-gray-500">就能看到你的心情模式啦！</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-3">📈 最近两周心情</h3>
            <div className="flex gap-1 flex-wrap mb-3">
              {last14.map((m, i) => <span key={i} className="text-2xl" title={new Date(m.date).toLocaleDateString('zh-CN')}>{m.emoji}</span>)}
            </div>
            {topMood && <p className="text-sm text-gray-600">你最常见的心情是 <b>{topMood[0]}</b>（{topMood[1]}次）</p>}
          </div>

          {happyDays.length > 0 && (
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-5 shadow">
              <h3 className="font-bold text-gray-800 mb-2">🌟 快乐日子</h3>
              <p className="text-sm text-gray-700">你通常在 <b>{happyDays.join('、')}</b> 心情更好</p>
              <p className="text-xs text-gray-500 mt-1">想想这些日子你做了什么开心的事？</p>
            </div>
          )}

          {topTools.length > 0 && (
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-5 shadow">
              <h3 className="font-bold text-gray-800 mb-2">💝 你最爱用的工具</h3>
              <div className="space-y-2">
                {topTools.map(([toolId, count]) => {
                  const tool = TOOL_PAGES.find(t => t.id === toolId);
                  return tool ? (
                    <div key={toolId} className="flex items-center gap-3">
                      <span className="text-xl">{tool.emoji}</span>
                      <span className="text-sm text-gray-700 flex-1">{tool.title}</span>
                      <span className="text-xs text-gray-400">使用 {count} 次</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmotionVocabPage({ unlockedLevel, moodHistory, onBack }) {
  const totalDays = new Set(moodHistory.map(m => new Date(m.date).toDateString())).size;

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎭" title="情绪词汇库" subtitle="认识更多情绪，更好地表达自己" />

      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg text-center">
        <p className="text-sm opacity-90">你的情绪词汇量</p>
        <p className="text-4xl font-bold my-2">{EMOTION_LEVELS.slice(0, unlockedLevel + 1).reduce((sum, l) => sum + l.emotions.length, 0)} 个</p>
        <p className="text-xs opacity-80">已记录心情 {totalDays} 天</p>
      </div>

      {EMOTION_LEVELS.map((level, idx) => {
        const unlocked = idx <= unlockedLevel;
        return (
          <div key={idx} className={`bg-white rounded-2xl p-5 shadow-lg ${!unlocked ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">Lv.{idx + 1} {level.label}</h3>
              {unlocked ? <span className="text-green-500 text-sm font-semibold">✅ 已解锁</span> :
                <span className="text-gray-400 text-sm">🔒 需要 {level.minDays} 天</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {level.emotions.map(e => (
                <span key={e.label} className={`px-3 py-2 rounded-full text-sm ${unlocked ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                  {unlocked ? e.emoji : '❓'} {e.label}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ParentNudgePage({ nudges, onSend, onBack }) {
  const [customMsg, setCustomMsg] = useState('');

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="💌" title="温柔提醒" subtitle="给孩子发一条温暖的消息" />

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">📝 快捷消息</h3>
        <div className="space-y-2">
          {NUDGE_TEMPLATES.map((t, i) => (
            <button key={i} onClick={() => onSend(t.text)}
              className="w-full text-left bg-pink-50 rounded-xl p-3 hover:bg-pink-100 transition">
              <span className="mr-2">{t.emoji}</span>
              <span className="text-sm text-gray-700">{t.text}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">✏️ 自定义消息</h3>
        <textarea value={customMsg} onChange={e => setCustomMsg(e.target.value)} placeholder="写一条温暖的消息..."
          className="w-full h-24 p-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none resize-none" maxLength={100} />
        <button onClick={() => { if (customMsg.trim()) { onSend(customMsg.trim()); setCustomMsg(''); } }} disabled={!customMsg.trim()}
          className="w-full mt-3 bg-pink-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50 hover:bg-pink-600 transition">发送消息 💗</button>
      </div>

      {nudges.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3">📮 已发送 ({nudges.length})</h3>
          <div className="space-y-2">
            {nudges.slice(-5).reverse().map((n, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-700">{n.text}</p>
                <p className="text-xs text-gray-400 mt-1">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TherapistReportPage({ moodHistory, toolUsageLog, journalEntries, sleepLog, streak, onBack }) {
  const last7Moods = moodHistory.slice(-7);
  const last7Sleep = sleepLog.slice(-7);
  const toolCounts = {};
  toolUsageLog.filter(t => {
    const d = new Date(t.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).forEach(t => { toolCounts[t.toolId] = (toolCounts[t.toolId] || 0) + 1; });

  const reportText = [
    `== 阳光小屋 - 每周报告 ==`,
    `日期：${new Date().toLocaleDateString('zh-CN')}`,
    `连续打卡：${streak} 天`,
    ``,
    `-- 本周心情 --`,
    last7Moods.length > 0 ? last7Moods.map(m => `${new Date(m.date).toLocaleDateString('zh-CN')}: ${m.emoji} ${m.label}`).join('\n') : '暂无数据',
    ``,
    `-- 工具使用 --`,
    Object.entries(toolCounts).length > 0 ?
      Object.entries(toolCounts).sort((a, b) => b[1] - a[1]).map(([id, cnt]) => {
        const tool = TOOL_PAGES.find(t => t.id === id);
        return tool ? `${tool.emoji} ${tool.title}: ${cnt}次` : null;
      }).filter(Boolean).join('\n') : '暂无数据',
    ``,
    `-- 睡眠记录 --`,
    last7Sleep.length > 0 ? last7Sleep.map(s => `${s.date}: ${s.quality}/5 ${s.bedtime || ''}`).join('\n') : '暂无数据',
    ``,
    `-- 日记数量 --`,
    `本周写了 ${journalEntries.filter(j => { const d = new Date(j.date); const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7); return d >= weekAgo; }).length} 篇日记`
  ].join('\n');

  const copyReport = () => {
    navigator.clipboard.writeText(reportText).catch(() => {});
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📋" title="每周报告" subtitle="可以分享给心理老师或咨询师" />

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{reportText}</pre>
      </div>

      <button onClick={copyReport}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition">
        📋 复制报告内容
      </button>
      <p className="text-center text-xs text-gray-400">复制后可以粘贴到微信或邮件发给咨询师</p>
    </div>
  );
}

function AchievementSharePage({ streak, points, achievements, moodHistory, onShare, onBack }) {
  const milestones = [
    streak >= 3 && { emoji: '🔥', text: `连续打卡 ${streak} 天！` },
    points >= 100 && { emoji: '💰', text: `已获得 ${points} 积分！` },
    moodHistory.length >= 7 && { emoji: '📊', text: `已记录 ${moodHistory.length} 次心情！` },
    achievements.length >= 5 && { emoji: '🫙', text: `收集了 ${achievements.length} 个成就！` }
  ].filter(Boolean);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎉" title="分享成就" subtitle="让家人看到你的进步" />

      {milestones.length === 0 ? (
        <div className="bg-yellow-100 rounded-2xl p-5 text-center">
          <p className="text-3xl mb-2">🌱</p>
          <p className="text-gray-700 font-semibold">继续加油！</p>
          <p className="text-sm text-gray-500">完成更多活动来解锁成就卡片</p>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((m, i) => (
            <div key={i} className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-5 shadow flex items-center gap-4">
              <span className="text-4xl">{m.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{m.text}</p>
                <p className="text-xs text-gray-500">来自阳光小屋</p>
              </div>
              <button onClick={() => onShare(m.text)}
                className="bg-orange-500 text-white text-xs px-3 py-2 rounded-lg font-semibold">分享</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [color, setColor] = useState(null);
  const [liked, setLiked] = useState('');

  const finish = () => {
    onComplete({ userName: name.trim() || '小朋友', favoriteColor: color || 'blue', liked: liked.trim() });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-50 to-pink-50 p-6">
      {step === 0 && (
        <div className="w-full text-center space-y-6 animate-fade-in">
          <div className="text-7xl">🏠</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">欢迎来到阳光小屋</h1>
          <p className="text-gray-600 text-lg">这里是属于你的安全小天地</p>
          <p className="text-gray-500">在这里，你可以探索自己的感受，学习让自己开心的小方法</p>
          <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
            <p className="text-gray-700 font-semibold">你叫什么名字？</p>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="输入你的名字或昵称"
              className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none text-center text-lg" maxLength={20} />
          </div>
          <button onClick={() => setStep(1)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-2xl text-lg shadow-lg hover:scale-105 transition">
            下一步 →
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="w-full text-center space-y-6 animate-fade-in">
          <div className="text-5xl">🎨</div>
          <h2 className="text-2xl font-bold text-gray-800">选一个你喜欢的颜色</h2>
          <p className="text-gray-500">我们会用它来装饰你的小屋</p>
          <div className="grid grid-cols-3 gap-3">
            {FAVORITE_COLORS.map(c => (
              <button key={c.value} onClick={() => setColor(c.value)}
                className={`rounded-2xl p-4 transition hover:scale-105 ${color === c.value ? 'ring-4 ring-purple-400 scale-110' : 'shadow'}`}>
                <div className={`w-12 h-12 rounded-full ${c.bg} mx-auto mb-2`}></div>
                <p className="text-sm font-semibold text-gray-700">{c.name}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl">← 上一步</button>
            <button onClick={() => setStep(2)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition">
              下一步 →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="w-full text-center space-y-6 animate-fade-in">
          <div className="text-5xl">⭐</div>
          <h2 className="text-2xl font-bold text-gray-800">最后一个问题</h2>
          <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
            <p className="text-gray-700 font-semibold">你最喜欢做什么？</p>
            <input type="text" value={liked} onChange={e => setLiked(e.target.value)} placeholder="比如：画画、听音乐、看书..."
              className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none text-center" maxLength={30} />
          </div>
          <p className="text-gray-400 text-sm">（可以跳过，以后再填也行）</p>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl">← 上一步</button>
            <button onClick={finish}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition">
              开始探索！🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BreathingPage({ onComplete }) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState('ready');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null);
  const cbRef = useRef(onComplete);
  cbRef.current = onComplete;

  useEffect(() => {
    if (!active) return;
    let phaseIdx = 0;
    let secs = BREATHING_PHASES[0].duration;
    setPhase(BREATHING_PHASES[0].name);
    setCount(secs);
    timerRef.current = setInterval(() => {
      secs -= 1;
      if (secs <= 0) {
        phaseIdx = (phaseIdx + 1) % BREATHING_PHASES.length;
        if (phaseIdx === 0) setCycles(c => c + 1);
        secs = BREATHING_PHASES[phaseIdx].duration;
        setPhase(BREATHING_PHASES[phaseIdx].name);
      }
      setCount(secs);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [active]);

  useEffect(() => {
    if (cycles >= 3 && active) { setActive(false); cbRef.current(); }
  }, [cycles, active]);

  const circleScale = phase === 'inhale' ? 'scale-150' : phase === 'exhale' ? 'scale-75' : 'scale-100';

  return (
    <div className="p-6 space-y-6">
      <PageHeader emoji="💗" title="呼吸练习" subtitle="让我们一起深呼吸，放松心情" />
      <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-8 flex flex-col items-center">
        <div className="h-64 flex items-center justify-center">
          <div className={`w-40 h-40 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-4xl transition-transform duration-[4000ms] ease-in-out ${circleScale} shadow-2xl`}>
            {active ? count : '💗'}
          </div>
        </div>
        <p className="text-xl font-bold text-gray-800 mt-4">{PHASE_TEXT[phase]}</p>
        <p className="text-sm text-gray-600 mt-1">完成 {cycles} / 3 轮</p>
        <div className="flex gap-3 mt-6">
          {!active ? (
            <button onClick={() => { setCycles(0); setActive(true); }} className="bg-pink-500 text-white font-semibold px-8 py-3 rounded-full flex items-center gap-2">
              <Play className="w-5 h-5" /> 开始
            </button>
          ) : (
            <button onClick={() => setActive(false)} className="bg-gray-500 text-white font-semibold px-8 py-3 rounded-full flex items-center gap-2">
              <Pause className="w-5 h-5" /> 暂停
            </button>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow">
        <h3 className="font-bold text-gray-800 mb-2">💡 小提示</h3>
        <p className="text-sm text-gray-700">找一个舒服的姿势坐好，跟着圆圈一起呼吸。完成 3 轮就可以获得积分哦！</p>
      </div>
    </div>
  );
}

function MeditationPage({ onComplete }) {
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);
  const cbRef = useRef(onComplete);
  cbRef.current = onComplete;

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setRunning(false); cbRef.current(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  if (selected && (running || timeLeft > 0)) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-br from-blue-200 to-cyan-200 rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">{selected.title}</h2>
          <p className="text-gray-700 mb-6">{selected.description}</p>
          <div className="text-6xl font-bold text-blue-700 my-8 tabular-nums">{fmtTime(timeLeft)}</div>
          <div className="flex gap-3 justify-center">
            {running ? (
              <button onClick={() => { setRunning(false); clearInterval(timerRef.current); }} className="bg-gray-500 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2"><Pause className="w-5 h-5" /> 暂停</button>
            ) : (
              <button onClick={() => setRunning(true)} className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2"><Play className="w-5 h-5" /> 继续</button>
            )}
            <button onClick={() => { setSelected(null); setTimeLeft(0); setRunning(false); }} className="bg-white text-gray-700 px-6 py-3 rounded-full font-semibold flex items-center gap-2"><RotateCcw className="w-5 h-5" /> 返回</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <PageHeader emoji="☁️" title="冥想时光" subtitle="选一个主题，让心灵休息" />
      {MEDITATION_THEMES.map((theme, idx) => (
        <div key={idx} className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-5 shadow">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{theme.title}</h3>
          <p className="text-gray-700 mb-4 text-sm">{theme.description}</p>
          <button onClick={() => { setSelected(theme); setTimeLeft(theme.duration); setRunning(true); }} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition">
            开始冥想 ({Math.round(theme.duration / 60)} 分钟)
          </button>
        </div>
      ))}
    </div>
  );
}

function ThoughtCatcherPage({ entries, onSave, onBack }) {
  const [step, setStep] = useState(0);
  const [negative, setNegative] = useState('');
  const [evidence, setEvidence] = useState('');
  const [reframe, setReframe] = useState('');

  const save = () => {
    if (negative.trim() && reframe.trim()) {
      onSave({ date: todayDate(), negative, evidence, reframe });
      setStep(0); setNegative(''); setEvidence(''); setReframe('');
    }
  };

  const prompts = [
    { q: '你现在脑海里有什么不好的想法？', hint: '比如："没有人喜欢我"、"我什么都做不好"', value: negative, set: setNegative },
    { q: '有什么证据证明这个想法是真的吗？有没有相反的证据？', hint: '想想有没有人对你好过？你有没有做成过什么事？', value: evidence, set: setEvidence },
    { q: '如果你的好朋友这样想，你会怎么对他/她说？', hint: '试着用同样温柔的话对自己说', value: reframe, set: setReframe }
  ];

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧠" title="想法捕捉器" subtitle="抓住消极想法，换一种方式思考" />

      {step < 3 ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex gap-1 mb-2">
            {[0, 1, 2].map(i => <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-teal-500' : 'bg-gray-200'}`} />)}
          </div>
          <p className="font-semibold text-gray-800">{prompts[step].q}</p>
          <p className="text-sm text-gray-500">{prompts[step].hint}</p>
          <textarea value={prompts[step].value} onChange={e => prompts[step].set(e.target.value)} placeholder="写下你的想法..." className="w-full h-28 p-3 border-2 border-teal-200 rounded-xl focus:border-teal-500 focus:outline-none resize-none" />
          <div className="flex gap-3">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold">上一步</button>}
            {step < 2 ? (
              <button onClick={() => prompts[step].value.trim() && setStep(step + 1)} disabled={!prompts[step].value.trim()} className="flex-1 bg-teal-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">下一步</button>
            ) : (
              <button onClick={save} disabled={!reframe.trim()} className="flex-1 bg-teal-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">完成</button>
            )}
          </div>
        </div>
      ) : null}

      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800">历史记录</h3>
          {entries.slice(-5).reverse().map((e, i) => (
            <div key={i} className="bg-teal-50 rounded-xl p-4 space-y-2">
              <p className="text-xs text-gray-500">{e.date}</p>
              <p className="text-sm text-gray-700"><span className="font-semibold text-red-600">消极想法：</span>{e.negative}</p>
              <p className="text-sm text-gray-700"><span className="font-semibold text-green-600">新的想法：</span>{e.reframe}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GratitudePage({ entries, onSave, onBack }) {
  const [items, setItems] = useState(['', '', '']);
  const todayDone = entries.some(e => e.date === todayDate());

  const save = () => {
    const filled = items.filter(i => i.trim());
    if (filled.length >= 1) {
      onSave({ date: todayDate(), items: filled });
      setItems(['', '', '']);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🙏" title="三件好事" subtitle="每天写下让你感恩的事" />

      {!todayDone ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <p className="text-sm text-gray-600">今天有什么值得感谢的事？哪怕是很小的事也可以。</p>
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xl">{['1️⃣', '2️⃣', '3️⃣'][idx]}</span>
              <input value={item} onChange={e => { const n = [...items]; n[idx] = e.target.value; setItems(n); }} placeholder={`第${idx + 1}件好事...`} className="flex-1 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:outline-none" />
            </div>
          ))}
          <button onClick={save} disabled={!items.some(i => i.trim())} className="w-full bg-amber-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">保存</button>
        </div>
      ) : (
        <div className="bg-amber-50 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-2">🌟</div>
          <p className="font-semibold text-gray-800">今天已经完成了！</p>
          <p className="text-sm text-gray-600 mt-1">明天再来记录更多好事吧</p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800">过去的好事</h3>
          {entries.slice(-7).reverse().map((e, i) => (
            <div key={i} className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">{e.date}</p>
              {e.items.map((item, j) => <p key={j} className="text-sm text-gray-700">✨ {item}</p>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivationPage({ log, onComplete, onBack }) {
  const diffLabels = { easy: '简单', medium: '中等', hard: '挑战' };
  const diffColors = { easy: 'bg-green-100 border-green-300', medium: 'bg-yellow-100 border-yellow-300', hard: 'bg-red-100 border-red-300' };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎯" title="行为激活" subtitle="选一个小目标，从简单开始" />
      <p className="text-sm text-gray-600 bg-green-50 rounded-xl p-3">抑郁会让人不想动。但哪怕做一件小事，也能让心情好一点。从绿色开始试试吧！</p>

      {['easy', 'medium', 'hard'].map(diff => (
        <div key={diff} className="space-y-2">
          <h3 className="font-semibold text-gray-700">{diffLabels[diff]} {diff === 'easy' ? '🟢' : diff === 'medium' ? '🟡' : '🔴'}</h3>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVATION_ACTIVITIES.filter(a => a.difficulty === diff).map((act, idx) => {
              const done = log.some(l => l.label === act.label && l.date === todayDate());
              return (
                <button key={idx} onClick={() => !done && onComplete({ date: todayDate(), label: act.label, difficulty: diff })}
                  className={`${diffColors[diff]} border-2 rounded-xl p-3 text-left transition ${done ? 'opacity-50' : 'hover:scale-105'}`}>
                  <div className="text-2xl mb-1">{act.emoji}</div>
                  <p className="text-xs font-semibold text-gray-800">{act.label}</p>
                  {done && <p className="text-xs text-green-600 mt-1">✅ 已完成</p>}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {log.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="font-bold text-gray-800 mb-2">完成记录 ({log.length})</h3>
          <div className="flex flex-wrap gap-1">
            {log.slice(-20).map((l, i) => <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{l.label}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

function PsychoeduPage({ onBack }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📚" title="心理小课堂" subtitle="用简单的方式了解自己" />
      {PSYCHO_ED_TOPICS.map((topic, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow overflow-hidden">
          <button onClick={() => setOpen(open === idx ? null : idx)} className="w-full p-4 text-left flex items-center gap-3">
            <span className="text-2xl">{topic.emoji}</span>
            <span className="font-semibold text-gray-800 flex-1">{topic.title}</span>
            <span className="text-gray-400">{open === idx ? '▲' : '▼'}</span>
          </button>
          {open === idx && (
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-700 leading-relaxed">{topic.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SafetyPlanPage({ plan, onSave, onBack }) {
  const [warnings, setWarnings] = useState(plan.warnings || ['']);
  const [strategies, setStrategies] = useState(plan.strategies || ['']);
  const [people, setPeople] = useState(plan.people || [{ name: '', contact: '' }]);
  const [reasons, setReasons] = useState(plan.reasons || ['']);

  const save = () => {
    onSave({
      warnings: warnings.filter(w => w.trim()),
      strategies: strategies.filter(s => s.trim()),
      people: people.filter(p => p.name.trim()),
      reasons: reasons.filter(r => r.trim())
    });
  };

  const addItem = (arr, setArr, template) => setArr([...arr, template]);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🛡️" title="我的安全计划" subtitle="当感觉不好时，可以看看这里" />

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-5">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">⚠️ 我注意到的危险信号</h3>
          <p className="text-xs text-gray-500 mb-2">当你开始有这些感觉时，就是该寻求帮助的时候</p>
          {warnings.map((w, i) => (
            <input key={i} value={w} onChange={e => { const n = [...warnings]; n[i] = e.target.value; setWarnings(n); }} placeholder="比如：连续几天不想说话..." className="w-full p-2 mb-2 border rounded-lg text-sm focus:border-red-400 focus:outline-none" />
          ))}
          <button onClick={() => addItem(warnings, setWarnings, '')} className="text-xs text-red-500">+ 添加</button>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">💡 我可以自己做的事</h3>
          {strategies.map((s, i) => (
            <input key={i} value={s} onChange={e => { const n = [...strategies]; n[i] = e.target.value; setStrategies(n); }} placeholder="比如：深呼吸、听音乐..." className="w-full p-2 mb-2 border rounded-lg text-sm focus:border-blue-400 focus:outline-none" />
          ))}
          <button onClick={() => addItem(strategies, setStrategies, '')} className="text-xs text-blue-500">+ 添加</button>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">👥 我可以找的人</h3>
          {people.map((p, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={p.name} onChange={e => { const n = [...people]; n[i] = { ...n[i], name: e.target.value }; setPeople(n); }} placeholder="名字" className="flex-1 p-2 border rounded-lg text-sm focus:border-green-400 focus:outline-none" />
              <input value={p.contact} onChange={e => { const n = [...people]; n[i] = { ...n[i], contact: e.target.value }; setPeople(n); }} placeholder="电话" className="flex-1 p-2 border rounded-lg text-sm focus:border-green-400 focus:outline-none" />
            </div>
          ))}
          <button onClick={() => addItem(people, setPeople, { name: '', contact: '' })} className="text-xs text-green-500">+ 添加</button>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">💖 我继续前进的理由</h3>
          {reasons.map((r, i) => (
            <input key={i} value={r} onChange={e => { const n = [...reasons]; n[i] = e.target.value; setReasons(n); }} placeholder="比如：我的小狗需要我..." className="w-full p-2 mb-2 border rounded-lg text-sm focus:border-pink-400 focus:outline-none" />
          ))}
          <button onClick={() => addItem(reasons, setReasons, '')} className="text-xs text-pink-500">+ 添加</button>
        </div>

        <button onClick={save} className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold">保存安全计划</button>
      </div>
    </div>
  );
}

function SocialPage({ log, onSave, onBack }) {
  const [person, setPerson] = useState('');
  const [what, setWhat] = useState('');
  const suggestions = ['和家人一起吃饭', '给朋友发消息', '对同学微笑', '拥抱一个人', '一起玩游戏', '一起散步'];

  const save = () => {
    if (person.trim()) {
      onSave({ date: todayDate(), person, activity: what || '聊天' });
      setPerson(''); setWhat('');
    }
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="👫" title="社交连接" subtitle="和别人在一起会让心情变好" />

      <div className="bg-purple-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 抑郁会让人想一个人待着。但和别人在一起，哪怕只是待在旁边，都会有帮助。</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
        <p className="font-semibold text-gray-800">今天你和谁在一起了？</p>
        <input value={person} onChange={e => setPerson(e.target.value)} placeholder="名字..." className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none" />
        <p className="font-semibold text-gray-800">你们做了什么？</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setWhat(s)} className={`text-xs px-3 py-1.5 rounded-full border ${what === s ? 'bg-purple-500 text-white border-purple-500' : 'border-purple-200 text-gray-700'}`}>{s}</button>
          ))}
        </div>
        <input value={what} onChange={e => setWhat(e.target.value)} placeholder="或者写下其他的..." className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none" />
        <button onClick={save} disabled={!person.trim()} className="w-full bg-purple-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">记录</button>
      </div>

      {log.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">社交记录</h3>
          {log.slice(-10).reverse().map((l, i) => (
            <div key={i} className="bg-purple-50 rounded-xl p-3 flex justify-between items-center">
              <div><p className="text-sm font-semibold text-gray-800">👤 {l.person}</p><p className="text-xs text-gray-600">{l.activity}</p></div>
              <p className="text-xs text-gray-400">{l.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SleepPage({ log, onSave, onBack }) {
  const [quality, setQuality] = useState(null);
  const [bedtime, setBedtime] = useState('');
  const todayDone = log.some(l => l.date === todayDate());
  const qualities = [
    { emoji: '😴', label: '很好', value: 5 },
    { emoji: '🙂', label: '还行', value: 3 },
    { emoji: '😵', label: '很差', value: 1 }
  ];

  const save = () => {
    if (quality) {
      onSave({ date: todayDate(), quality: quality.value, qualityLabel: quality.label, bedtime: bedtime || '不确定' });
      setQuality(null); setBedtime('');
    }
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌙" title="睡眠管家" subtitle="好的睡眠让心情更好" />

      <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
        <p className="font-semibold text-gray-800">💡 睡前小贴士</p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• 睡前1小时放下手机和平板</li>
          <li>• 每天同一时间上床睡觉</li>
          <li>• 睡前可以做呼吸练习或听故事</li>
          <li>• 保持房间安静、黑暗、凉爽</li>
        </ul>
      </div>

      {!todayDone ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="font-semibold text-gray-800">昨晚睡得怎么样？</p>
          <div className="flex gap-3 justify-center">
            {qualities.map(q => (
              <button key={q.value} onClick={() => setQuality(q)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition ${quality?.value === q.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                <span className="text-3xl">{q.emoji}</span>
                <span className="text-sm mt-1">{q.label}</span>
              </button>
            ))}
          </div>
          <p className="font-semibold text-gray-800">昨晚几点睡的？</p>
          <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
          <button onClick={save} disabled={!quality} className="w-full bg-indigo-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">记录</button>
        </div>
      ) : (
        <div className="bg-indigo-50 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="font-semibold text-gray-800">今天已经记录过了</p>
        </div>
      )}

      {log.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">睡眠记录</h3>
          <div className="flex gap-1">
            {log.slice(-14).map((l, i) => (
              <div key={i} className="flex-1 text-center" title={l.date}>
                <div className={`h-8 rounded ${l.quality >= 4 ? 'bg-green-400' : l.quality >= 2 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                <p className="text-xs text-gray-400 mt-1">{l.qualityLabel?.[0]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BodyScanPage({ onBack }) {
  const [current, setCurrent] = useState(-1);
  const [done, setDone] = useState(false);

  const next = () => {
    if (current < BODY_PARTS.length - 1) setCurrent(current + 1);
    else setDone(true);
  };

  if (done) {
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={onBack} />
        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800">做得真棒！</h2>
          <p className="text-gray-600 mt-2">你已经完成了全身放松练习</p>
          <p className="text-sm text-gray-500 mt-1">感觉身体是不是轻松了一些？</p>
          <button onClick={() => { setCurrent(-1); setDone(false); }} className="mt-6 bg-teal-500 text-white px-8 py-3 rounded-full font-semibold">再做一次</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧘" title="身体放松" subtitle="从头到脚，慢慢放松每个部位" />

      {current === -1 ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg text-center space-y-4">
          <p className="text-gray-700">找一个舒服的姿势坐好或躺下。我们会从头到脚，一个一个部位地放松。</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {BODY_PARTS.map((bp, i) => <span key={i} className="text-2xl">{bp.emoji}</span>)}
          </div>
          <button onClick={next} className="bg-teal-500 text-white px-8 py-3 rounded-full font-semibold">开始放松</button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-8 text-center space-y-4">
          <div className="flex justify-center gap-1">
            {BODY_PARTS.map((_, i) => <div key={i} className={`w-3 h-3 rounded-full ${i <= current ? 'bg-teal-500' : 'bg-white'}`} />)}
          </div>
          <div className="text-6xl">{BODY_PARTS[current].emoji}</div>
          <h3 className="text-2xl font-bold text-gray-800">{BODY_PARTS[current].name}</h3>
          <p className="text-gray-700">{BODY_PARTS[current].instruction}</p>
          <p className="text-sm text-gray-500">保持5秒...然后慢慢放松</p>
          <button onClick={next} className="bg-teal-500 text-white px-8 py-3 rounded-full font-semibold">
            {current < BODY_PARTS.length - 1 ? '下一个部位' : '完成'}
          </button>
        </div>
      )}
    </div>
  );
}

function AffirmationPage({ favorites, onToggleFav, onBack }) {
  const todayIdx = new Date().getDate() % AFFIRMATIONS.length;
  const todayCard = AFFIRMATIONS[todayIdx];

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="💖" title="肯定卡片" subtitle="每天一句温暖的话" />

      <div className="bg-gradient-to-br from-pink-200 to-rose-200 rounded-3xl p-8 text-center shadow-lg">
        <p className="text-xl font-bold text-gray-800 leading-relaxed">{todayCard}</p>
        <button onClick={() => onToggleFav(todayCard)}
          className={`mt-4 px-4 py-2 rounded-full text-sm font-semibold ${favorites.includes(todayCard) ? 'bg-pink-500 text-white' : 'bg-white text-pink-500'}`}>
          {favorites.includes(todayCard) ? '❤️ 已收藏' : '🤍 收藏'}
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="font-bold text-gray-800">更多肯定卡片</h3>
        <div className="grid grid-cols-1 gap-2">
          {AFFIRMATIONS.filter((_, i) => i !== todayIdx).map((a, i) => (
            <div key={i} className="bg-pink-50 rounded-xl p-4 flex items-center justify-between">
              <p className="text-sm text-gray-800 flex-1">{a}</p>
              <button onClick={() => onToggleFav(a)} className="ml-2 text-lg">{favorites.includes(a) ? '❤️' : '🤍'}</button>
            </div>
          ))}
        </div>
      </div>

      {favorites.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">我的收藏 ({favorites.length})</h3>
          {favorites.map((f, i) => (
            <div key={i} className="bg-pink-100 rounded-xl p-3 text-sm text-gray-800">❤️ {f}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function ParentDashboard({ moodHistory, journalEntries, sleepLog, socialLog, activationLog, streak, points, onBack }) {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const PARENT_PIN = '1234';

  if (!unlocked) {
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={onBack} />
        <PageHeader emoji="👨‍👩‍👧" title="家长看板" subtitle="输入PIN码查看孩子的情况" />
        <div className="bg-white rounded-2xl p-5 shadow-lg text-center space-y-4">
          <Lock className="w-12 h-12 mx-auto text-gray-400" />
          <p className="text-sm text-gray-600">默认PIN: 1234（请在实际使用时修改）</p>
          <input type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="输入4位PIN码" className="w-32 mx-auto block text-center p-3 border-2 rounded-xl text-2xl tracking-widest focus:border-blue-500 focus:outline-none" />
          <button onClick={() => pin === PARENT_PIN && setUnlocked(true)}
            className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold">确认</button>
        </div>
      </div>
    );
  }

  const last7Moods = moodHistory.slice(-7);
  const negativeMoods = last7Moods.filter(m => NEGATIVE_MOODS.includes(m.label));
  const consecutiveNeg = (() => {
    let count = 0;
    for (let i = moodHistory.length - 1; i >= 0; i--) {
      if (NEGATIVE_MOODS.includes(moodHistory[i].label)) count++;
      else break;
    }
    return count;
  })();

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📊" title="家长看板" subtitle="了解孩子的心理健康状况" />

      {consecutiveNeg >= 3 && (
        <div className="bg-red-100 border-2 border-red-300 rounded-2xl p-4">
          <p className="font-bold text-red-800">⚠️ 需要关注</p>
          <p className="text-sm text-red-700 mt-1">孩子连续 {consecutiveNeg} 天选择了消极情绪。建议主动和孩子聊聊，或考虑寻求专业帮助。</p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow space-y-3">
        <h3 className="font-bold text-gray-800">📈 基本数据</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-purple-50 rounded-xl p-3"><p className="text-2xl font-bold text-purple-600">{streak}</p><p className="text-xs text-gray-600">连续天数</p></div>
          <div className="bg-yellow-50 rounded-xl p-3"><p className="text-2xl font-bold text-yellow-600">{points}</p><p className="text-xs text-gray-600">总积分</p></div>
          <div className="bg-blue-50 rounded-xl p-3"><p className="text-2xl font-bold text-blue-600">{journalEntries.length}</p><p className="text-xs text-gray-600">日记数</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow space-y-3">
        <h3 className="font-bold text-gray-800">😊 最近7天心情</h3>
        <div className="flex gap-1 justify-center">
          {last7Moods.map((m, i) => <span key={i} className="text-3xl" title={new Date(m.date).toLocaleDateString('zh-CN')}>{m.emoji}</span>)}
        </div>
        <p className="text-sm text-gray-600 text-center">
          消极情绪: {negativeMoods.length}/7天 {negativeMoods.length >= 4 ? '⚠️' : negativeMoods.length >= 2 ? '💛' : '💚'}
        </p>
      </div>

      {sleepLog.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow space-y-2">
          <h3 className="font-bold text-gray-800">🌙 最近睡眠</h3>
          {sleepLog.slice(-5).reverse().map((s, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{s.date}</span>
              <span>{s.qualityLabel} | 睡觉时间: {s.bedtime}</span>
            </div>
          ))}
        </div>
      )}

      {socialLog.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow space-y-2">
          <h3 className="font-bold text-gray-800">👫 社交活动</h3>
          <p className="text-sm text-gray-600">最近7天: {socialLog.filter(l => { const d = new Date(l.date); const w = Date.now() - 7 * 86400000; return d >= w; }).length} 次社交互动</p>
        </div>
      )}

      <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
        <h3 className="font-bold text-gray-800">💡 建议对话开场白</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• "我注意到你最近好像有些心事，想聊聊吗？"</li>
          <li>• "不管发生什么，爸爸/妈妈永远爱你。"</li>
          <li>• "你今天在学校有什么开心的事吗？"</li>
          <li>• "如果你不想说话也没关系，我就在这里陪你。"</li>
        </ul>
      </div>
    </div>
  );
}

// ─── New Feature Components ─────────────────────────────────────────────────

function MoodChartPage({ moodHistory, activationLog, onBack }) {
  const last14 = moodHistory.slice(-14);
  const moodScore = { '开心': 5, '平静': 4, '生气': 2, '焦虑': 2, '难过': 1 };

  const activityCounts = {};
  activationLog.forEach(l => {
    activityCounts[l.label] = (activityCounts[l.label] || { count: 0, totalMood: 0 });
    activityCounts[l.label].count++;
    const dayMood = moodHistory.find(m => new Date(m.date).toLocaleDateString('zh-CN') === l.date);
    if (dayMood) activityCounts[l.label].totalMood += (moodScore[dayMood.label] || 3);
  });

  const topActivities = Object.entries(activityCounts)
    .map(([label, data]) => ({ label, count: data.count, avgMood: data.count > 0 ? (data.totalMood / data.count).toFixed(1) : 0 }))
    .sort((a, b) => b.avgMood - a.avgMood)
    .slice(0, 5);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📊" title="心情-活动关联" subtitle="看看什么活动让你更开心" />

      <div className="bg-white rounded-2xl p-4 shadow">
        <h3 className="font-bold text-gray-800 mb-3">最近14天心情趋势</h3>
        <div className="flex items-end gap-1 h-32">
          {last14.map((m, i) => {
            const score = moodScore[m.label] || 3;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className={`w-full rounded-t ${score >= 4 ? 'bg-green-400' : score >= 3 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ height: `${score * 20}%` }} />
                <span className="text-xs mt-1">{m.emoji}</span>
              </div>
            );
          })}
        </div>
        {last14.length === 0 && <p className="text-sm text-gray-500 text-center py-4">还没有足够的数据，继续记录心情吧！</p>}
      </div>

      {topActivities.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="font-bold text-gray-800 mb-3">🏆 让你心情最好的活动</h3>
          {topActivities.map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
              <span className="text-lg font-bold text-gray-400">#{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{a.label}</p>
                <p className="text-xs text-gray-500">做了{a.count}次</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">心情分 {a.avgMood}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 多做让你心情变好的活动，少做让你心情变差的事。这就是"行为激活"的秘密！</p>
      </div>
    </div>
  );
}

function WorryBoxPage({ entries, onSave, onBack }) {
  const [worry, setWorry] = useState('');
  const [phase, setPhase] = useState('write');
  const [timer, setTimer] = useState(600);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setRunning(false); setPhase('done'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const addWorry = () => {
    if (worry.trim()) {
      onSave({ date: todayDate(), worry: worry.trim() });
      setWorry('');
    }
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📦" title="烦恼盒子" subtitle="把烦恼放进盒子里，它们不会一直跟着你" />

      <div className="bg-orange-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 心理学家说，每天给自己10分钟"烦恼时间"，其他时间不去想它，焦虑会慢慢减少。</p>
      </div>

      {phase === 'write' && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="font-semibold text-gray-800">写下你的烦恼，然后"放进盒子"</p>
          <textarea value={worry} onChange={e => setWorry(e.target.value)} placeholder="我在担心..."
            className="w-full h-24 p-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none" />
          <button onClick={addWorry} disabled={!worry.trim()} className="w-full bg-orange-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">
            📦 放进盒子
          </button>
          <button onClick={() => { setTimer(600); setRunning(true); setPhase('timer'); }}
            className="w-full bg-white border-2 border-orange-300 text-orange-600 py-3 rounded-xl font-semibold">
            ⏰ 开始10分钟烦恼时间
          </button>
        </div>
      )}

      {phase === 'timer' && (
        <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl p-8 text-center space-y-4">
          <p className="text-gray-700">这是你的烦恼时间，可以想你担心的事</p>
          <div className="text-5xl font-bold text-orange-600 tabular-nums">{fmtTime(timer)}</div>
          <p className="text-sm text-gray-600">时间到了之后，试着把烦恼留在这里</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { clearInterval(timerRef.current); setRunning(false); setPhase('done'); }}
              className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold">结束烦恼时间</button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <p className="text-xl font-bold text-gray-800">烦恼时间结束了！</p>
          <p className="text-gray-700">现在去做一些让你开心的事吧。烦恼已经放进盒子里了。</p>
          <button onClick={() => setPhase('write')} className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold">
            好的！
          </button>
        </div>
      )}

      {entries.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">📦 盒子里的烦恼 ({entries.length})</h3>
          {entries.slice(-8).reverse().map((e, i) => (
            <div key={i} className="bg-orange-50 rounded-xl p-3 flex justify-between items-center">
              <p className="text-sm text-gray-700 flex-1">{e.worry}</p>
              <p className="text-xs text-gray-400 ml-2">{e.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StrengthsFinderPage({ strengths, onSave, onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  const answer = (option) => {
    const next = [...answers, option];
    setAnswers(next);
    if (step < STRENGTHS_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const cards = next.map(a => STRENGTH_CARDS[a]).filter(Boolean);
      onSave(cards);
    }
  };

  if (strengths.length > 0) {
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={onBack} />
        <PageHeader emoji="💪" title="我的力量卡" subtitle="这些是你的超能力！" />
        <div className="grid grid-cols-2 gap-3">
          {strengths.map((s, i) => (
            <div key={i} className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl p-4 text-center shadow-lg border-2 border-yellow-300">
              <div className="text-4xl mb-2">{s.emoji}</div>
              <p className="font-bold text-gray-800">{s.title}</p>
              <p className="text-xs text-gray-600 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
        <button onClick={() => { setStep(0); setAnswers([]); onSave([]); }}
          className="w-full bg-white border-2 border-amber-300 text-amber-600 py-3 rounded-xl font-semibold">重新发现我的力量</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="💪" title="力量发现器" subtitle="回答几个问题，发现你的超能力" />
      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex gap-1 mb-2">
          {STRENGTHS_QUESTIONS.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-amber-500' : 'bg-gray-200'}`} />)}
        </div>
        <div className="text-4xl text-center">{STRENGTHS_QUESTIONS[step].emoji}</div>
        <p className="font-semibold text-gray-800 text-center text-lg">{STRENGTHS_QUESTIONS[step].q}</p>
        <div className="grid grid-cols-2 gap-2">
          {STRENGTHS_QUESTIONS[step].options.map((opt, i) => (
            <button key={i} onClick={() => answer(opt)}
              className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-xl p-3 text-sm font-semibold text-gray-800 transition">
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmotionBuilderPage({ log, onSave, onBack }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const [learned, setLearned] = useState(log);

  const learnWord = (word) => {
    if (!learned.includes(word)) {
      const next = [...learned, word];
      setLearned(next);
      onSave(next);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎭" title="情绪词汇表" subtitle="学会更多描述感受的词语" />

      <div className="bg-white rounded-2xl p-4 shadow">
        <p className="text-sm text-gray-600 mb-3">已学会 {learned.length}/{EMOTION_WHEEL.reduce((s, c) => s + c.words.length, 0)} 个情绪词</p>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all" style={{ width: `${(learned.length / EMOTION_WHEEL.reduce((s, c) => s + c.words.length, 0)) * 100}%` }} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {EMOTION_WHEEL.map((cat, i) => (
          <button key={i} onClick={() => setSelectedCat(selectedCat === i ? null : i)}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition ${selectedCat === i ? 'bg-purple-500 text-white' : cat.color + ' text-gray-800'}`}>
            {cat.emoji} {cat.category}
          </button>
        ))}
      </div>

      {selectedCat !== null && (
        <div className="space-y-2">
          {EMOTION_WHEEL[selectedCat].words.map((w, i) => {
            const isLearned = learned.includes(w.word);
            return (
              <div key={i} className={`rounded-xl p-4 ${isLearned ? 'bg-green-50 border-2 border-green-200' : EMOTION_WHEEL[selectedCat].color + ' border-2 border-transparent'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{w.word} {isLearned && '✅'}</p>
                    <p className="text-sm text-gray-600">{w.desc}</p>
                  </div>
                  {!isLearned && (
                    <button onClick={() => learnWord(w.word)}
                      className="bg-purple-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold">学会了</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RewardStorePage({ points, purchased, onPurchase, onBack }) {
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🏪" title="奖励商店" subtitle="用积分换取有趣的奖励" />

      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 text-white text-center shadow-lg">
        <p className="text-sm opacity-90">我的积分</p>
        <p className="text-4xl font-bold">{points} ⭐</p>
      </div>

      {purchased.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow">
          <h3 className="font-bold text-gray-800 mb-2">🎁 我的收藏</h3>
          <div className="flex gap-2 flex-wrap">
            {purchased.map((id, i) => {
              const item = REWARD_ITEMS.find(r => r.id === id);
              return item ? <span key={i} className="text-2xl" title={item.name}>{item.emoji}</span> : null;
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {REWARD_ITEMS.map(item => {
          const owned = purchased.includes(item.id);
          const canAfford = points >= item.cost;
          return (
            <div key={item.id} className={`bg-white rounded-xl p-4 shadow text-center ${owned ? 'opacity-60' : ''}`}>
              <div className="text-4xl mb-2">{item.emoji}</div>
              <p className="text-sm font-semibold text-gray-800">{item.name}</p>
              <p className="text-xs text-gray-500 mb-2">{item.cost} ⭐</p>
              {owned ? (
                <span className="text-xs text-green-600 font-semibold">✅ 已拥有</span>
              ) : (
                <button onClick={() => canAfford && onPurchase(item.id, item.cost)}
                  disabled={!canAfford}
                  className={`text-xs px-4 py-1.5 rounded-full font-semibold ${canAfford ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {canAfford ? '兑换' : '积分不够'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProblemSolvingPage({ entries, onSave, onBack }) {
  const [step, setStep] = useState(0);
  const [problem, setProblem] = useState('');
  const [solutions, setSolutions] = useState(['', '', '']);
  const [chosen, setChosen] = useState(-1);

  const save = () => {
    if (problem.trim() && chosen >= 0) {
      onSave({ date: todayDate(), problem, solutions: solutions.filter(s => s.trim()), chosen: solutions[chosen] });
      setStep(0); setProblem(''); setSolutions(['', '', '']); setChosen(-1);
    }
  };

  const steps = [
    { title: '问题是什么？', desc: '描述你遇到的问题' },
    { title: '想想办法', desc: '尽量想出3个不同的解决方法' },
    { title: '选一个试试', desc: '哪个方法你觉得最好？' },
    { title: '完成！', desc: '记住：没有完美的答案，试试看就好' }
  ];

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🔧" title="问题解决站" subtitle="4步法帮你解决问题" />

      <div className="flex gap-1">
        {steps.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-blue-500' : 'bg-gray-200'}`} />)}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
        <p className="font-semibold text-gray-800">{steps[step].title}</p>
        <p className="text-sm text-gray-500">{steps[step].desc}</p>

        {step === 0 && (
          <>
            <textarea value={problem} onChange={e => setProblem(e.target.value)} placeholder="我遇到的问题是..."
              className="w-full h-24 p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none" />
            <button onClick={() => problem.trim() && setStep(1)} disabled={!problem.trim()}
              className="w-full bg-blue-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">下一步</button>
          </>
        )}

        {step === 1 && (
          <>
            {solutions.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <input value={s} onChange={e => { const n = [...solutions]; n[i] = e.target.value; setSolutions(n); }}
                  placeholder={`方法 ${i + 1}...`} className="flex-1 p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none" />
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold">上一步</button>
              <button onClick={() => solutions.some(s => s.trim()) && setStep(2)} disabled={!solutions.some(s => s.trim())}
                className="flex-1 bg-blue-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">下一步</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {solutions.filter(s => s.trim()).map((s, i) => (
              <button key={i} onClick={() => setChosen(solutions.indexOf(s))}
                className={`w-full text-left p-3 rounded-xl border-2 transition ${chosen === solutions.indexOf(s) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <p className="text-sm font-semibold text-gray-800">{s}</p>
              </button>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold">上一步</button>
              <button onClick={save} disabled={chosen < 0}
                className="flex-1 bg-blue-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">完成</button>
            </div>
          </>
        )}
      </div>

      {entries.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">解决记录</h3>
          {entries.slice(-5).reverse().map((e, i) => (
            <div key={i} className="bg-blue-50 rounded-xl p-4 space-y-1">
              <p className="text-xs text-gray-500">{e.date}</p>
              <p className="text-sm text-gray-800"><span className="font-semibold">问题：</span>{e.problem}</p>
              <p className="text-sm text-green-700"><span className="font-semibold">方案：</span>{e.chosen}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PeerStoriesPage({ onBack }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📖" title="伙伴故事" subtitle="看看其他小朋友是怎么走过来的" />

      <div className="bg-purple-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 这些故事来自和你一样曾经感到难过的小朋友。他们现在都好多了，你也会的！</p>
      </div>

      {PEER_STORIES.map((story, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow overflow-hidden">
          <button onClick={() => setOpen(open === idx ? null : idx)} className="w-full p-4 text-left flex items-center gap-3">
            <span className="text-3xl">{story.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{story.name}的故事</p>
              <p className="text-xs text-gray-500">{story.age}岁</p>
            </div>
            <span className="text-gray-400">{open === idx ? '▲' : '▼'}</span>
          </button>
          {open === idx && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-sm text-gray-700 leading-relaxed">{story.story}</p>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-700">💚 {story.name}想对你说：</p>
                <p className="text-sm text-green-600">{story.tip}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ParentChildPage({ onBack }) {
  const [selected, setSelected] = useState(null);

  if (selected !== null) {
    const act = PARENT_CHILD_DATA[selected];
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => setSelected(null)} />
        <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-6 text-center">
          <div className="text-5xl mb-3">{act.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-800">{act.title}</h2>
          <p className="text-sm text-gray-600 mt-1">⏰ {act.duration}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow space-y-3">
          <h3 className="font-bold text-gray-800">📝 怎么做</h3>
          {act.steps.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
              <p className="text-sm text-gray-700">{s}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow space-y-3">
          <h3 className="font-bold text-gray-800">💬 可以聊的话题</h3>
          {act.prompts.map((p, i) => (
            <div key={i} className="bg-pink-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">"{p}"</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="👨‍👩‍👧" title="亲子活动" subtitle="和爸爸妈妈一起做有趣的事" />

      <div className="bg-pink-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 和家人一起活动不仅好玩，还能让你们更亲近。选一个活动，邀请爸爸妈妈一起做吧！</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PARENT_CHILD_DATA.map((act, i) => (
          <button key={i} onClick={() => setSelected(i)}
            className="bg-white rounded-xl p-4 shadow text-center hover:scale-105 transition">
            <div className="text-4xl mb-2">{act.emoji}</div>
            <p className="text-sm font-semibold text-gray-800">{act.title}</p>
            <p className="text-xs text-gray-500">{act.duration}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function NaturePage({ log, onSave, onBack }) {
  const weekTotal = log.filter(l => {
    const d = new Date(l.date);
    return Date.now() - d.getTime() < 7 * 86400000;
  }).reduce((s, l) => s + l.minutes, 0);

  const goalMinutes = 120;

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌿" title="自然处方" subtitle="大自然是最好的医生" />

      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-5 text-center">
        <p className="text-sm text-gray-600">本周户外时间</p>
        <p className="text-4xl font-bold text-green-600">{weekTotal} 分钟</p>
        <div className="w-full bg-white rounded-full h-4 mt-3">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all"
            style={{ width: `${Math.min(100, (weekTotal / goalMinutes) * 100)}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-2">目标：每周{goalMinutes}分钟 ({Math.round((weekTotal / goalMinutes) * 100)}%)</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow">
        <h3 className="font-bold text-gray-800 mb-3">🌱 户外活动</h3>
        <div className="grid grid-cols-2 gap-2">
          {NATURE_ACTIVITIES.map((act, i) => {
            const doneToday = log.some(l => l.label === act.label && l.date === todayDate());
            return (
              <button key={i} onClick={() => !doneToday && onSave({ date: todayDate(), label: act.label, minutes: act.minutes, points: act.points })}
                className={`bg-green-50 border-2 border-green-200 rounded-xl p-3 text-left transition ${doneToday ? 'opacity-50' : 'hover:scale-105'}`}>
                <div className="text-2xl mb-1">{act.emoji}</div>
                <p className="text-xs font-semibold text-gray-800">{act.label}</p>
                <p className="text-xs text-gray-500">{act.minutes}分钟 +{act.points}分</p>
                {doneToday && <p className="text-xs text-green-600">✅ 今天已做</p>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-green-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">🌳 研究表明，每周在大自然中度过120分钟可以显著改善心情和减少焦虑。即使只是看看窗外的树也有帮助！</p>
      </div>
    </div>
  );
}

function TherapistBridgePage({ moodHistory, journalEntries, sleepLog, activationLog, socialLog, streak, points, onBack }) {
  const [copied, setCopied] = useState(false);

  const generateReport = () => {
    const last30Moods = moodHistory.slice(-30);
    const moodCounts = {};
    last30Moods.forEach(m => { moodCounts[m.label] = (moodCounts[m.label] || 0) + 1; });

    const avgSleep = sleepLog.length > 0
      ? (sleepLog.slice(-14).reduce((s, l) => s + l.quality, 0) / Math.min(14, sleepLog.length)).toFixed(1)
      : '无数据';

    let report = `===== 阳光小屋 - 心理健康报告 =====\n`;
    report += `生成日期: ${todayDate()}\n\n`;

    report += `📊 基本数据:\n`;
    report += `- 连续使用: ${streak} 天\n`;
    report += `- 总积分: ${points}\n`;
    report += `- 日记数量: ${journalEntries.length}\n`;
    report += `- 活动完成: ${activationLog.length} 次\n`;
    report += `- 社交记录: ${socialLog.length} 次\n\n`;

    report += `😊 近30天心情分布:\n`;
    Object.entries(moodCounts).forEach(([label, count]) => {
      report += `- ${label}: ${count} 天 (${Math.round(count / last30Moods.length * 100)}%)\n`;
    });
    report += `\n`;

    report += `🌙 近14天平均睡眠质量: ${avgSleep}/5\n\n`;

    if (journalEntries.length > 0) {
      report += `📝 最近5篇日记摘要:\n`;
      journalEntries.slice(-5).forEach(e => {
        report += `[${e.date}] ${e.content.slice(0, 50)}${e.content.length > 50 ? '...' : ''}\n`;
      });
    }

    report += `\n===== 报告结束 =====`;
    return report;
  };

  const copyReport = () => {
    const report = generateReport();
    navigator.clipboard.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🏥" title="心理师桥梁" subtitle="生成报告分享给心理咨询师" />

      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 这份报告可以帮助心理咨询师更快了解你的情况。你可以把它复制下来，发给爸爸妈妈或直接带给咨询师。</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="font-bold text-gray-800">报告预览</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{streak}</p>
            <p className="text-xs text-gray-600">连续天数</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">{journalEntries.length}</p>
            <p className="text-xs text-gray-600">日记数</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{activationLog.length}</p>
            <p className="text-xs text-gray-600">活动次数</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{socialLog.length}</p>
            <p className="text-xs text-gray-600">社交次数</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-600">近期心情:</p>
          <div className="flex gap-1 flex-wrap">
            {moodHistory.slice(-14).map((m, i) => <span key={i} className="text-2xl">{m.emoji}</span>)}
          </div>
        </div>

        <button onClick={copyReport}
          className={`w-full py-3 rounded-xl font-semibold transition ${copied ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
          {copied ? '✅ 已复制到剪贴板！' : '📋 复制完整报告'}
        </button>
      </div>

      <div className="bg-yellow-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">⚠️ 这份报告只包含你在App中记录的数据。专业评估需要面对面的心理咨询。</p>
      </div>
    </div>
  );
}

// ─── Batch 3 Components ─────────────────────────────────────────────────────

function RoutineBuilderPage({ routine, onSave, onBack }) {
  const todayKey = todayDate();
  const todayRoutine = routine[todayKey] || { '早上': [], '下午': [], '晚上': [] };
  const [completed, setCompleted] = useState(todayRoutine._completed || []);

  const addTask = (period, task) => {
    if (!task.trim()) return;
    const updated = { ...todayRoutine, [period]: [...(todayRoutine[period] || []), task] };
    updated._completed = completed;
    onSave({ ...routine, [todayKey]: updated });
  };

  const toggleComplete = (task) => {
    const next = completed.includes(task) ? completed.filter(t => t !== task) : [...completed, task];
    setCompleted(next);
    const updated = { ...todayRoutine, _completed: next };
    onSave({ ...routine, [todayKey]: updated });
  };

  const allTasks = [...(todayRoutine['早上'] || []), ...(todayRoutine['下午'] || []), ...(todayRoutine['晚上'] || [])];
  const progress = allTasks.length > 0 ? Math.round((completed.length / allTasks.length) * 100) : 0;

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📋" title="日常计划表" subtitle="有规律的生活让心情更稳定" />

      {allTasks.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-gray-700">今日完成度</p>
            <p className="text-sm font-bold text-purple-600">{progress}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {ROUTINE_SLOTS.map((slot, si) => (
        <div key={si} className="bg-white rounded-2xl p-4 shadow space-y-3">
          <h3 className="font-bold text-gray-800">{slot.emoji} {slot.period}</h3>

          {(todayRoutine[slot.period] || []).map((task, ti) => (
            <button key={ti} onClick={() => toggleComplete(task)}
              className={`w-full text-left p-3 rounded-xl border-2 transition flex items-center gap-2 ${completed.includes(task) ? 'border-green-300 bg-green-50 line-through text-gray-400' : 'border-gray-200'}`}>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${completed.includes(task) ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                {completed.includes(task) && '✓'}
              </span>
              <span className="text-sm">{task}</span>
            </button>
          ))}

          <div className="flex gap-1 flex-wrap">
            {slot.suggestions.filter(s => !(todayRoutine[slot.period] || []).includes(s)).map((s, i) => (
              <button key={i} onClick={() => addTask(slot.period, s)}
                className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200 hover:bg-purple-100">+ {s}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmotionThermometerPage({ log, onSave, onBack }) {
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const todayDone = log.some(l => l.date === todayDate());

  const colors = ['bg-green-400', 'bg-green-400', 'bg-yellow-300', 'bg-yellow-300', 'bg-yellow-400', 'bg-orange-400', 'bg-orange-400', 'bg-red-400', 'bg-red-500', 'bg-red-600'];
  const labels = ['很平静', '平静', '还好', '还好', '有一点', '比较强', '比较强', '很强', '非常强', '爆发了'];

  const save = () => {
    if (emotion.trim()) {
      onSave({ date: todayDate(), emotion, intensity, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) });
      setEmotion(''); setIntensity(5);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌡️" title="情绪温度计" subtitle="感受有多强烈？给它打个分" />

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
        <p className="font-semibold text-gray-800">你现在有什么感受？</p>
        <input value={emotion} onChange={e => setEmotion(e.target.value)} placeholder="比如：生气、紧张、难过..."
          className="w-full p-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:outline-none" />

        <p className="font-semibold text-gray-800">强烈程度：{intensity}/10 — {labels[intensity - 1]}</p>

        <div className="flex items-end gap-1 h-32 justify-center">
          {Array.from({ length: 10 }, (_, i) => (
            <button key={i} onClick={() => setIntensity(i + 1)}
              className={`w-7 rounded-t transition-all ${i < intensity ? colors[i] : 'bg-gray-200'}`}
              style={{ height: `${(i + 1) * 10}%` }} />
          ))}
        </div>

        <input type="range" min="1" max="10" value={intensity} onChange={e => setIntensity(Number(e.target.value))}
          className="w-full" />

        <button onClick={save} disabled={!emotion.trim()}
          className="w-full bg-orange-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">记录</button>
      </div>

      {log.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">情绪记录</h3>
          {log.slice(-10).reverse().map((l, i) => (
            <div key={i} className="bg-orange-50 rounded-xl p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${colors[l.intensity - 1]} flex items-center justify-center text-white text-xs font-bold`}>{l.intensity}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{l.emotion}</p>
                <p className="text-xs text-gray-500">{l.date} {l.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CopingCardsPage({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [cardIdx, setCardIdx] = useState(0);
  const emotions = Object.keys(COPING_CARDS);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🃏" title="应急卡片" subtitle="难受的时候，翻一张卡片试试" />

      <div className="flex gap-2 justify-center flex-wrap">
        {emotions.map(e => (
          <button key={e} onClick={() => { setSelected(e); setCardIdx(0); }}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition ${selected === e ? 'bg-red-500 text-white' : 'bg-red-50 text-gray-800 border border-red-200'}`}>
            {e}
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl p-8 text-center space-y-4 min-h-[200px] flex flex-col items-center justify-center">
          <div className="text-5xl">{COPING_CARDS[selected][cardIdx].emoji}</div>
          <p className="text-lg font-bold text-gray-800">{COPING_CARDS[selected][cardIdx].tip}</p>
          <div className="flex gap-3">
            <button onClick={() => setCardIdx((cardIdx - 1 + COPING_CARDS[selected].length) % COPING_CARDS[selected].length)}
              className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">← 上一张</button>
            <button onClick={() => setCardIdx((cardIdx + 1) % COPING_CARDS[selected].length)}
              className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">下一张 →</button>
          </div>
          <p className="text-xs text-gray-500">{cardIdx + 1} / {COPING_CARDS[selected].length}</p>
        </div>
      )}

      {!selected && (
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-sm text-gray-700">💡 选择你现在的感受，我会给你一些马上可以做的事情来帮助你。</p>
        </div>
      )}
    </div>
  );
}

function AchievementJarPage({ achievements, onSave, onBack }) {
  const [text, setText] = useState('');
  const [shaking, setShaking] = useState(false);
  const [randomItem, setRandomItem] = useState(null);

  const add = () => {
    if (text.trim()) {
      onSave([...achievements, { text: text.trim(), date: todayDate() }]);
      setText('');
    }
  };

  const shakeJar = () => {
    if (achievements.length === 0) return;
    setShaking(true);
    setTimeout(() => {
      setRandomItem(achievements[Math.floor(Math.random() * achievements.length)]);
      setShaking(false);
    }, 1000);
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🫙" title="成就瓶" subtitle="收集美好的记忆和成就" />

      <div className={`bg-gradient-to-b from-amber-100 to-amber-200 rounded-3xl p-6 text-center ${shaking ? 'animate-bounce' : ''}`}>
        <div className="text-6xl mb-2">🫙</div>
        <p className="text-lg font-bold text-gray-800">我的成就瓶</p>
        <p className="text-sm text-gray-600">{achievements.length} 颗弹珠</p>
        <div className="flex flex-wrap gap-1 justify-center mt-3">
          {achievements.slice(-20).map((_, i) => (
            <span key={i} className="text-lg">{['🔴', '🟡', '🟢', '🔵', '🟣'][i % 5]}</span>
          ))}
        </div>
        {achievements.length > 0 && (
          <button onClick={shakeJar} className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-full font-semibold text-sm">
            🔮 摇一摇，看一个美好记忆
          </button>
        )}
      </div>

      {randomItem && (
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">✨</div>
          <p className="text-gray-800 font-semibold">{randomItem.text}</p>
          <p className="text-xs text-gray-500 mt-2">{randomItem.date}</p>
          <button onClick={() => setRandomItem(null)} className="mt-3 text-sm text-amber-600 font-semibold">关闭</button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
        <p className="font-semibold text-gray-800">添加一颗弹珠</p>
        <p className="text-xs text-gray-500">写下一件你做到的事、别人夸你的话、或一个美好的记忆</p>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="今天我..."
          className="w-full h-20 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none" />
        <button onClick={add} disabled={!text.trim()} className="w-full bg-amber-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">
          放进瓶子 🫙
        </button>
      </div>

      {achievements.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">最近添加</h3>
          {achievements.slice(-5).reverse().map((a, i) => (
            <div key={i} className="bg-amber-50 rounded-xl p-3">
              <p className="text-sm text-gray-800">✨ {a.text}</p>
              <p className="text-xs text-gray-400">{a.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SelfCompassionPage({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [letter, setLetter] = useState('');
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={onBack} />
        <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">💗</div>
          <h2 className="text-2xl font-bold text-gray-800">你做得很好</h2>
          <p className="text-gray-600 mt-2">对自己温柔一点，你值得被爱。</p>
          <button onClick={() => { setDone(false); setSelected(null); setLetter(''); }}
            className="mt-6 bg-pink-500 text-white px-8 py-3 rounded-full font-semibold">再练习一次</button>
        </div>
      </div>
    );
  }

  if (selected !== null) {
    const ex = COMPASSION_EXERCISES[selected];
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => setSelected(null)} />
        <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-6 text-center">
          <div className="text-5xl mb-3">{ex.emoji}</div>
          <h2 className="text-xl font-bold text-gray-800">{ex.title}</h2>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{ex.instruction}</p>
          {ex.prompt && (
            <>
              <textarea value={letter} onChange={e => setLetter(e.target.value)} placeholder={ex.prompt}
                className="w-full h-32 p-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none resize-none" />
            </>
          )}
          <button onClick={() => setDone(true)}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold">
            {ex.prompt ? '完成' : '我做到了 ✨'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="💗" title="自我关怀" subtitle="学会对自己温柔一点" />
      <div className="bg-pink-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 我们常常对别人很温柔，却对自己很严格。试试像对待好朋友一样对待自己。</p>
      </div>
      {COMPASSION_EXERCISES.map((ex, i) => (
        <button key={i} onClick={() => setSelected(i)}
          className="w-full bg-white rounded-2xl p-4 shadow text-left flex items-center gap-3 hover:scale-105 transition">
          <span className="text-3xl">{ex.emoji}</span>
          <div>
            <p className="font-semibold text-gray-800">{ex.title}</p>
            <p className="text-xs text-gray-500">{ex.instruction.slice(0, 30)}...</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function GoalStonesPage({ goals, onSave, onBack }) {
  const [goalText, setGoalText] = useState('');
  const [steps, setSteps] = useState(['', '', '']);
  const currentGoal = goals.length > 0 ? goals[goals.length - 1] : null;
  const showForm = !currentGoal || currentGoal.completed;

  const createGoal = () => {
    if (goalText.trim() && steps.some(s => s.trim())) {
      onSave([...goals, {
        goal: goalText, steps: steps.filter(s => s.trim()),
        completedSteps: [], completed: false, date: todayDate()
      }]);
      setGoalText(''); setSteps(['', '', '']);
    }
  };

  const toggleStep = (stepIdx) => {
    const updated = [...goals];
    const g = { ...updated[updated.length - 1] };
    if (g.completedSteps.includes(stepIdx)) {
      g.completedSteps = g.completedSteps.filter(i => i !== stepIdx);
    } else {
      g.completedSteps = [...g.completedSteps, stepIdx];
    }
    if (g.completedSteps.length === g.steps.length) g.completed = true;
    updated[updated.length - 1] = g;
    onSave(updated);
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🪨" title="目标小石头" subtitle="一步一步，踩着石头过河" />

      {!showForm && currentGoal && (
        <>
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-600">本周目标</p>
            <p className="text-xl font-bold text-gray-800 mt-1">🎯 {currentGoal.goal}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              {currentGoal.steps.map((_, i) => {
                const done = currentGoal.completedSteps.includes(i);
                return (
                  <React.Fragment key={i}>
                    {i > 0 && <div className={`flex-1 h-1 mx-1 rounded ${done || currentGoal.completedSteps.includes(i - 1) ? 'bg-blue-400' : 'bg-gray-200'}`} />}
                    <button onClick={() => toggleStep(i)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${done ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {done ? '✓' : i + 1}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
            {currentGoal.steps.map((s, i) => (
              <div key={i} className={`p-3 rounded-lg mb-2 ${currentGoal.completedSteps.includes(i) ? 'bg-blue-50 line-through text-gray-400' : 'bg-gray-50'}`}>
                <p className="text-sm">石头 {i + 1}: {s}</p>
              </div>
            ))}
          </div>

          {currentGoal.completed && (
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-bold text-gray-800">目标达成！你太厉害了！</p>
              <button onClick={() => {}} className="mt-3 text-sm text-blue-600 font-semibold"
                onClickCapture={() => { const updated = [...goals]; updated[updated.length - 1].completed = true; onSave(updated); }}>
                设置新目标
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="font-semibold text-gray-800">设一个小目标</p>
          <input value={goalText} onChange={e => setGoalText(e.target.value)} placeholder="这周我想..."
            className="w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none" />
          <p className="font-semibold text-gray-800">分成几步来做：</p>
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">{i + 1}</span>
              <input value={s} onChange={e => { const n = [...steps]; n[i] = e.target.value; setSteps(n); }}
                placeholder={`第${i + 1}步...`} className="flex-1 p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none" />
            </div>
          ))}
          <button onClick={createGoal} disabled={!goalText.trim() || !steps.some(s => s.trim())}
            className="w-full bg-blue-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">开始挑战</button>
        </div>
      )}
    </div>
  );
}

function SensoryGroundingPage({ onBack }) {
  const [step, setStep] = useState(-1);
  const [inputs, setInputs] = useState([[], [], [], [], []]);
  const [done, setDone] = useState(false);

  const addInput = (stepIdx, val) => {
    if (!val.trim()) return;
    const next = [...inputs];
    if (next[stepIdx].length < GROUNDING_STEPS[stepIdx].count) {
      next[stepIdx] = [...next[stepIdx], val];
      setInputs(next);
    }
  };

  const stepComplete = step >= 0 && inputs[step].length >= GROUNDING_STEPS[step].count;

  const nextStep = () => {
    if (step < GROUNDING_STEPS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  if (done) {
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={onBack} />
        <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-gray-800">你回到了当下</h2>
          <p className="text-gray-600 mt-2">做得很好！现在你可以感受到脚踩在地上、空气进入鼻子。你是安全的。</p>
          <button onClick={() => { setStep(-1); setDone(false); setInputs([[], [], [], [], []]); }}
            className="mt-6 bg-blue-500 text-white px-8 py-3 rounded-full font-semibold">再做一次</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌍" title="感官着陆" subtitle="用5种感官，把自己拉回当下" />

      {step === -1 ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg text-center space-y-4">
          <p className="text-gray-700">当你感到焦虑或不安时，这个练习可以帮助你回到当下。</p>
          <div className="flex justify-center gap-3">
            {GROUNDING_STEPS.map((s, i) => <span key={i} className="text-2xl">{s.emoji}</span>)}
          </div>
          <button onClick={() => setStep(0)} className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold">开始练习</button>
        </div>
      ) : (
        <div className={`${GROUNDING_STEPS[step].color} rounded-3xl p-6 space-y-4`}>
          <div className="flex gap-1 justify-center">
            {GROUNDING_STEPS.map((_, i) => <div key={i} className={`w-3 h-3 rounded-full ${i <= step ? 'bg-blue-500' : 'bg-white'}`} />)}
          </div>
          <div className="text-center">
            <div className="text-5xl mb-2">{GROUNDING_STEPS[step].emoji}</div>
            <p className="text-xl font-bold text-gray-800">{GROUNDING_STEPS[step].sense} — 找{GROUNDING_STEPS[step].count}样</p>
            <p className="text-sm text-gray-600 mt-1">{GROUNDING_STEPS[step].instruction}</p>
          </div>

          <div className="space-y-2">
            {inputs[step].map((val, i) => (
              <div key={i} className="bg-white rounded-lg p-2 text-sm text-gray-800">✅ {val}</div>
            ))}
            {inputs[step].length < GROUNDING_STEPS[step].count && (
              <input placeholder={`第${inputs[step].length + 1}样...`}
                onKeyDown={e => { if (e.key === 'Enter') { addInput(step, e.target.value); e.target.value = ''; } }}
                className="w-full p-3 bg-white rounded-xl focus:outline-none" />
            )}
          </div>

          {stepComplete && (
            <button onClick={nextStep} className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold">
              {step < GROUNDING_STEPS.length - 1 ? '下一步' : '完成'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MoodPredictionPage({ predictions, onSave, onBack }) {
  const [activity, setActivity] = useState('');
  const [predicted, setPredicted] = useState(3);
  const [pending, setPending] = useState(null);
  const [actual, setActual] = useState(3);

  const pendingPrediction = predictions.find(p => p.actual === null && p.date === todayDate()) || pending;

  const predict = () => {
    if (!activity.trim()) return;
    const entry = { date: todayDate(), activity, predicted, actual: null };
    setPending(entry);
    setActivity('');
  };

  const report = () => {
    const entry = { ...(pendingPrediction), actual };
    const updated = predictions.filter(p => !(p.actual === null && p.date === todayDate()));
    onSave([...updated, entry]);
    setPending(null);
  };

  const completed = predictions.filter(p => p.actual !== null);
  const avgDiff = completed.length > 0
    ? (completed.reduce((s, p) => s + (p.actual - p.predicted), 0) / completed.length).toFixed(1)
    : null;

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🔮" title="心情预测" subtitle="做之前猜猜，做完看看对不对" />

      {avgDiff !== null && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-600">你的预测平均偏差</p>
          <p className="text-2xl font-bold text-purple-600">{Number(avgDiff) > 0 ? '+' : ''}{avgDiff}</p>
          <p className="text-xs text-gray-500 mt-1">
            {Number(avgDiff) > 0 ? '你每次都比预想的开心！事情没那么糟糕吧？😊' : Number(avgDiff) < -0.5 ? '试试不同的活动，找到更让你开心的事！' : '你很了解自己！'}
          </p>
        </div>
      )}

      {!pendingPrediction ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="font-semibold text-gray-800">你接下来要做什么？</p>
          <input value={activity} onChange={e => setActivity(e.target.value)} placeholder="比如：去公园散步..."
            className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none" />
          <p className="font-semibold text-gray-800">你觉得做完之后心情会怎样？</p>
          <div className="flex gap-2 justify-center">
            {moodEmojis.map((e, i) => (
              <button key={i} onClick={() => setPredicted(i + 1)}
                className={`text-3xl p-2 rounded-full transition ${predicted === i + 1 ? 'bg-purple-100 ring-2 ring-purple-400 scale-110' : ''}`}>{e}</button>
            ))}
          </div>
          <button onClick={predict} disabled={!activity.trim()}
            className="w-full bg-purple-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">记录预测</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-sm text-gray-600">你预测做完 <span className="font-bold">{pendingPrediction.activity}</span> 后心情是：</p>
            <p className="text-2xl text-center mt-1">{moodEmojis[pendingPrediction.predicted - 1]}</p>
          </div>
          <p className="font-semibold text-gray-800">做完了吗？实际心情怎样？</p>
          <div className="flex gap-2 justify-center">
            {moodEmojis.map((e, i) => (
              <button key={i} onClick={() => setActual(i + 1)}
                className={`text-3xl p-2 rounded-full transition ${actual === i + 1 ? 'bg-green-100 ring-2 ring-green-400 scale-110' : ''}`}>{e}</button>
            ))}
          </div>
          <button onClick={report} className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold">记录实际心情</button>
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">历史记录</h3>
          {completed.slice(-5).reverse().map((p, i) => (
            <div key={i} className="bg-purple-50 rounded-xl p-3 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{p.activity}</p>
                <p className="text-xs text-gray-500">{p.date}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">预测</p>
                <span className="text-xl">{moodEmojis[p.predicted - 1]}</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="text-center">
                <p className="text-xs text-gray-400">实际</p>
                <span className="text-xl">{moodEmojis[p.actual - 1]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KindnessPage({ log, onSave, onBack }) {
  const todayMission = KINDNESS_MISSIONS[new Date().getDate() % KINDNESS_MISSIONS.length];
  const todayDone = log.some(l => l.date === todayDate());
  const totalDone = log.length;

  const complete = (mission) => {
    onSave([...log, { date: todayDate(), mission }]);
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌻" title="善意挑战" subtitle="小小善意，大大快乐" />

      <div className="bg-gradient-to-br from-yellow-100 to-green-100 rounded-3xl p-6 text-center">
        <p className="text-sm text-gray-600">今日善意挑战</p>
        <div className="text-5xl my-3">{todayMission.emoji}</div>
        <p className="text-lg font-bold text-gray-800">{todayMission.mission}</p>
        {!todayDone ? (
          <button onClick={() => complete(todayMission.mission)}
            className="mt-4 bg-green-500 text-white px-6 py-3 rounded-full font-semibold">我做到了！ 🎉</button>
        ) : (
          <p className="mt-4 text-green-600 font-semibold">✅ 今天已完成，你真棒！</p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow">
        <h3 className="font-bold text-gray-800 mb-2">🏅 善意统计</h3>
        <p className="text-sm text-gray-600">你一共完成了 <span className="font-bold text-green-600">{totalDone}</span> 次善意挑战</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {log.slice(-14).map((_, i) => <span key={i} className="text-lg">🌻</span>)}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow space-y-2">
        <h3 className="font-bold text-gray-800">更多善意任务</h3>
        <div className="grid grid-cols-2 gap-2">
          {KINDNESS_MISSIONS.filter(m => m.mission !== todayMission.mission).slice(0, 6).map((m, i) => (
            <button key={i} onClick={() => !todayDone && complete(m.mission)}
              disabled={todayDone}
              className="bg-green-50 border border-green-200 rounded-xl p-3 text-left text-xs disabled:opacity-50">
              <span className="text-xl">{m.emoji}</span>
              <p className="mt-1 text-gray-800">{m.mission}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-green-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 研究发现，做善事的人比不做的人更快乐。善意不仅帮助了别人，更帮助了你自己！</p>
      </div>
    </div>
  );
}

function WeeklyReviewPage({ moodHistory, journalEntries, activationLog, points, onSave, reviews, onBack }) {
  const [best, setBest] = useState('');
  const [hard, setHard] = useState('');
  const [learned, setLearned] = useState('');
  const [nextWeek, setNextWeek] = useState('');

  const weekNum = Math.ceil((new Date().getDate()) / 7);
  const weekKey = `${todayDate().slice(0, 7)}-W${weekNum}`;
  const alreadyDone = reviews.some(r => r.weekKey === weekKey);

  const last7Moods = moodHistory.slice(-7);
  const last7Activities = activationLog.filter(l => {
    const d = new Date(l.date);
    return Date.now() - d.getTime() < 7 * 86400000;
  }).length;

  const save = () => {
    if (best.trim()) {
      onSave([...reviews, { weekKey, date: todayDate(), best, hard, learned, nextWeek }]);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📮" title="每周回顾" subtitle="回头看看，你这周很棒" />

      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-5">
        <h3 className="font-bold text-gray-800 mb-3">📊 本周数据</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded-xl p-3"><p className="text-xl font-bold text-purple-600">{last7Moods.length}</p><p className="text-xs text-gray-600">心情记录</p></div>
          <div className="bg-white rounded-xl p-3"><p className="text-xl font-bold text-green-600">{last7Activities}</p><p className="text-xs text-gray-600">完成活动</p></div>
          <div className="bg-white rounded-xl p-3"><p className="text-xl font-bold text-yellow-600">{points}</p><p className="text-xs text-gray-600">总积分</p></div>
        </div>
        {last7Moods.length > 0 && (
          <div className="flex gap-1 justify-center mt-3">
            {last7Moods.map((m, i) => <span key={i} className="text-2xl">{m.emoji}</span>)}
          </div>
        )}
      </div>

      {!alreadyDone ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <p className="font-semibold text-gray-800">⭐ 这周最开心的事</p>
            <textarea value={best} onChange={e => setBest(e.target.value)} placeholder="这周最让我开心的是..."
              className="w-full h-16 p-3 mt-1 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">💪 这周最大的挑战</p>
            <textarea value={hard} onChange={e => setHard(e.target.value)} placeholder="这周对我来说最难的是..."
              className="w-full h-16 p-3 mt-1 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">📖 这周我学到了</p>
            <textarea value={learned} onChange={e => setLearned(e.target.value)} placeholder="我学到了..."
              className="w-full h-16 p-3 mt-1 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">🎯 下周我想试试</p>
            <textarea value={nextWeek} onChange={e => setNextWeek(e.target.value)} placeholder="下周我想..."
              className="w-full h-16 p-3 mt-1 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none" />
          </div>
          <button onClick={save} disabled={!best.trim()} className="w-full bg-indigo-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">
            生成每周明信片 📮
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-100 to-pink-100 rounded-3xl p-6 space-y-3 border-2 border-indigo-200">
          <p className="text-center text-sm text-gray-500">📮 本周明信片</p>
          {reviews.filter(r => r.weekKey === weekKey).map((r, i) => (
            <div key={i} className="space-y-2">
              <p className="text-sm"><span className="font-bold">⭐ 最开心：</span>{r.best}</p>
              {r.hard && <p className="text-sm"><span className="font-bold">💪 挑战：</span>{r.hard}</p>}
              {r.learned && <p className="text-sm"><span className="font-bold">📖 学到：</span>{r.learned}</p>}
              {r.nextWeek && <p className="text-sm"><span className="font-bold">🎯 下周：</span>{r.nextWeek}</p>}
            </div>
          ))}
          <p className="text-center text-gray-600 font-semibold mt-2">你这周做得很棒！🌟</p>
        </div>
      )}

      {reviews.length > 1 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">过去的明信片</h3>
          {reviews.slice(0, -1).reverse().slice(0, 4).map((r, i) => (
            <div key={i} className="bg-indigo-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">{r.date}</p>
              <p className="text-sm text-gray-800">⭐ {r.best}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Batch 4 Components ─────────────────────────────────────────────────────

function StoryCreatorPage({ stories, onSave, onBack }) {
  const [step, setStep] = useState(0);
  const [character, setCharacter] = useState(null);
  const [problem, setProblem] = useState('');
  const [helper, setHelper] = useState(null);
  const [ending, setEnding] = useState('');
  const [customProblem, setCustomProblem] = useState('');

  const save = () => {
    const story = {
      date: todayDate(), character, problem: problem || customProblem,
      helper, ending
    };
    onSave([...stories, story]);
    setStep(5);
  };

  const reset = () => { setStep(0); setCharacter(null); setProblem(''); setHelper(null); setEnding(''); setCustomProblem(''); };
  const lastStory = step === 5 ? stories[stories.length - 1] : null;

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📝" title="故事创作家" subtitle="创造一个属于你的勇气故事" />

      {step < 5 && (
        <div className="flex gap-1">{[0,1,2,3].map(i => <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-purple-500' : 'bg-gray-200'}`} />)}</div>
      )}

      {step === 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="font-semibold text-gray-800">选一个主角</p>
          <div className="grid grid-cols-3 gap-3">
            {STORY_CHARACTERS.map((c, i) => (
              <button key={i} onClick={() => { setCharacter(c); setStep(1); }}
                className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center hover:scale-105 transition">
                <div className="text-4xl">{c.emoji}</div>
                <p className="text-xs mt-1 font-semibold">{c.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="font-semibold text-gray-800">{character.emoji} {character.name}遇到了什么困难？</p>
          <div className="space-y-2">
            {STORY_PROBLEMS.map((p, i) => (
              <button key={i} onClick={() => { setProblem(p); setStep(2); }}
                className={`w-full text-left p-3 rounded-xl border-2 transition ${problem === p ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                <p className="text-sm text-gray-800">{p}</p>
              </button>
            ))}
          </div>
          <input value={customProblem} onChange={e => setCustomProblem(e.target.value)} placeholder="或者写一个自己的..."
            className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none" />
          {customProblem.trim() && <button onClick={() => { setProblem(customProblem); setStep(2); }} className="w-full bg-purple-500 text-white py-2 rounded-xl font-semibold">下一步</button>}
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="font-semibold text-gray-800">谁来帮助{character.name}？</p>
          <div className="grid grid-cols-2 gap-3">
            {STORY_HELPERS.map((h, i) => (
              <button key={i} onClick={() => { setHelper(h); setStep(3); }}
                className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center hover:scale-105 transition">
                <div className="text-3xl">{h.emoji}</div>
                <p className="text-xs mt-1 font-semibold">{h.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="font-semibold text-gray-800">故事的结局是什么？</p>
          {STORY_ENDINGS.map((e, i) => (
            <button key={i} onClick={() => { setEnding(e); }}
              className={`w-full text-left p-3 rounded-xl border-2 transition ${ending === e ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
              <p className="text-sm text-gray-800">{character.name}{e}</p>
            </button>
          ))}
          {ending && <button onClick={save} className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold">完成故事</button>}
        </div>
      )}

      {step === 5 && lastStory && (
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 space-y-3 border-2 border-purple-200">
          <p className="text-center text-lg font-bold text-gray-800">📖 {lastStory.character.name}的故事</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            从前有一只{lastStory.character.emoji}{lastStory.character.name}，
            它{lastStory.problem}。
            它感到很难过，不知道该怎么办。
            有一天，{lastStory.helper.emoji}{lastStory.helper.name}来到了它身边，
            给了它勇气和力量。
            最后，{lastStory.character.name}{lastStory.ending}。
          </p>
          <p className="text-center text-gray-600 font-semibold">🌟 你也有这样的力量！</p>
          <button onClick={reset} className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold">再写一个故事</button>
        </div>
      )}

      {stories.length > 0 && step !== 5 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">我的故事集 ({stories.length})</h3>
          {stories.slice(-3).reverse().map((s, i) => (
            <div key={i} className="bg-purple-50 rounded-xl p-3">
              <p className="text-sm text-gray-800">{s.character.emoji} {s.character.name}的故事</p>
              <p className="text-xs text-gray-500">{s.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MoodPlaylistPage({ playlists, onSave, onBack }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [songName, setSongName] = useState('');
  const moods = [
    { label: '难过时听', emoji: '😢', color: 'bg-blue-100' },
    { label: '需要能量', emoji: '⚡', color: 'bg-yellow-100' },
    { label: '想要平静', emoji: '😌', color: 'bg-green-100' },
    { label: '开心时听', emoji: '😊', color: 'bg-pink-100' }
  ];

  const addSong = () => {
    if (!songName.trim() || !selectedMood) return;
    const updated = { ...playlists };
    if (!updated[selectedMood]) updated[selectedMood] = [];
    updated[selectedMood] = [...updated[selectedMood], songName.trim()];
    onSave(updated);
    setSongName('');
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎵" title="心情歌单" subtitle="用音乐治愈心情" />

      <div className="bg-white rounded-2xl p-4 shadow">
        <h3 className="font-bold text-gray-800 mb-3">🎧 自然声音</h3>
        <div className="grid grid-cols-3 gap-2">
          {NATURE_SOUNDS.map((s, i) => (
            <div key={i} className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-2xl">{s.emoji}</div>
              <p className="text-xs font-semibold mt-1">{s.name}</p>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {moods.map((m, i) => (
          <button key={i} onClick={() => setSelectedMood(m.label)}
            className={`px-3 py-2 rounded-full text-sm font-semibold transition ${selectedMood === m.label ? 'bg-purple-500 text-white' : m.color + ' text-gray-800'}`}>
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <p className="font-semibold text-gray-800">🎵 {selectedMood}的歌</p>
          {(playlists[selectedMood] || []).map((song, i) => (
            <div key={i} className="bg-purple-50 rounded-lg p-2 text-sm text-gray-800 flex items-center gap-2">
              <span>🎶</span> {song}
            </div>
          ))}
          <div className="flex gap-2">
            <input value={songName} onChange={e => setSongName(e.target.value)} placeholder="添加一首歌..."
              className="flex-1 p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none" />
            <button onClick={addSong} disabled={!songName.trim()} className="bg-purple-500 disabled:bg-gray-300 text-white px-4 rounded-xl font-semibold">+</button>
          </div>
        </div>
      )}

      <div className="bg-purple-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 当你难过时，听一首让你感到被理解的歌。当你需要能量时，听一首让你想跳舞的歌！音乐是最好的情绪调节器之一。</p>
      </div>
    </div>
  );
}

function VirtualPetPage({ pet, onSave, onBack }) {
  const [message, setMessage] = useState('');

  const selectPet = (p) => {
    onSave({ type: p, happiness: 50, actions: [], lastDate: todayDate() });
  };

  if (!pet || !pet.type) {
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={onBack} />
        <PageHeader emoji="🐾" title="小伙伴" subtitle="选一个小伙伴陪伴你" />
        <div className="grid grid-cols-3 gap-3">
          {PET_TYPES.map((p, i) => (
            <button key={i} onClick={() => selectPet(p)}
              className="bg-white rounded-2xl p-5 shadow text-center hover:scale-105 transition">
              <div className="text-5xl">{p.emoji}</div>
              <p className="text-sm font-semibold mt-2">{p.name}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const todayActions = pet.actions.filter(a => a.date === todayDate());
  const happiness = Math.min(100, 50 + todayActions.length * 10);
  const happyEmoji = happiness >= 80 ? '😊' : happiness >= 50 ? '🙂' : '😔';

  const doAction = (action) => {
    if (todayActions.some(a => a.id === action.id)) return;
    setMessage(action.message);
    setTimeout(() => setMessage(''), 3000);
    onSave({ ...pet, happiness, actions: [...pet.actions, { ...action, date: todayDate() }] });
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji={pet.type.emoji} title={pet.type.name} subtitle="照顾好自己，小伙伴也会开心" />

      <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-6 text-center">
        <div className="text-7xl mb-2">{pet.type.emoji}</div>
        <p className="text-lg font-bold text-gray-800">{pet.type.name} {happyEmoji}</p>
        <div className="w-full bg-white rounded-full h-4 mt-3">
          <div className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 h-4 rounded-full transition-all"
            style={{ width: `${happiness}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-1">心情值: {happiness}/100</p>
      </div>

      {message && (
        <div className="bg-green-100 border-2 border-green-300 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-green-700">{message}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow">
        <h3 className="font-bold text-gray-800 mb-3">照顾{pet.type.name}</h3>
        <div className="grid grid-cols-5 gap-2">
          {PET_ACTIONS.map((a, i) => {
            const done = todayActions.some(ta => ta.id === a.id);
            return (
              <button key={i} onClick={() => doAction(a)}
                className={`rounded-xl p-3 text-center transition ${done ? 'bg-green-100 opacity-60' : 'bg-gray-50 hover:bg-gray-100'}`}>
                <div className="text-2xl">{a.emoji}</div>
                <p className="text-xs mt-1">{a.label}</p>
                {done && <p className="text-xs text-green-600">✓</p>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-yellow-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 {pet.type.name}的心情取决于你照顾自己的方式。吃饭、运动、休息、玩耍、和别人聊天——每做一件，{pet.type.name}就更开心！</p>
      </div>
    </div>
  );
}

function ValuesCompassPage({ values, onSave, onBack }) {
  const [selected, setSelected] = useState(values || []);

  const toggle = (value) => {
    const next = selected.includes(value) ? selected.filter(v => v !== value) : selected.length < 5 ? [...selected, value] : selected;
    setSelected(next);
    onSave(next);
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧭" title="价值罗盘" subtitle="发现对你最重要的事" />

      <div className="bg-white rounded-2xl p-4 shadow">
        <p className="text-sm text-gray-600 mb-3">选择对你来说最重要的{selected.length < 3 ? '（选3-5个）' : ` ${selected.length}/5`}</p>
        <div className="grid grid-cols-2 gap-2">
          {VALUES_CARDS.map((v, i) => {
            const isSelected = selected.includes(v.value);
            return (
              <button key={i} onClick={() => toggle(v.value)}
                className={`rounded-xl p-4 text-left transition border-2 ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                <div className="text-2xl mb-1">{v.emoji}</div>
                <p className="text-sm font-bold text-gray-800">{v.value}</p>
                <p className="text-xs text-gray-600">{v.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {selected.length >= 3 && (
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-5 text-center">
          <p className="text-sm text-gray-600">你的核心价值</p>
          <div className="flex gap-2 justify-center mt-2 flex-wrap">
            {selected.map((v, i) => {
              const card = VALUES_CARDS.find(c => c.value === v);
              return <span key={i} className="bg-white px-3 py-1 rounded-full text-sm font-semibold shadow">{card?.emoji} {v}</span>;
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3">做符合这些价值的事，会让你感到更有意义和更快乐 ✨</p>
        </div>
      )}
    </div>
  );
}

function TimeCapsulePage({ capsules, onSave, onBack }) {
  const [letter, setLetter] = useState('');
  const [openIdx, setOpenIdx] = useState(null);

  const save = () => {
    if (!letter.trim()) return;
    onSave([...capsules, { date: todayDate(), letter: letter.trim(), opened: false }]);
    setLetter('');
  };

  const openCapsule = (idx) => {
    const updated = [...capsules];
    updated[idx] = { ...updated[idx], opened: true };
    onSave(updated);
    setOpenIdx(idx);
  };

  const unopened = capsules.filter(c => !c.opened);
  const opened = capsules.filter(c => c.opened);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="💌" title="时间胶囊" subtitle="给未来的自己写一封信" />

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
        <p className="font-semibold text-gray-800">写给未来难过时的自己</p>
        <p className="text-xs text-gray-500">当你以后感到难过时，可以打开这封信，读到今天的自己给你的鼓励。</p>
        <textarea value={letter} onChange={e => setLetter(e.target.value)}
          placeholder="亲爱的未来的我，我想对你说..."
          className="w-full h-28 p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none" />
        <button onClick={save} disabled={!letter.trim()} className="w-full bg-indigo-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">
          封存胶囊 💌
        </button>
      </div>

      {unopened.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">📬 未开封的胶囊 ({unopened.length})</h3>
          {unopened.map((c, i) => {
            const realIdx = capsules.indexOf(c);
            return (
              <div key={i} className="bg-indigo-50 rounded-xl p-4 flex items-center justify-between">
                <div><p className="text-sm font-semibold text-gray-800">💌 来自 {c.date} 的自己</p></div>
                <button onClick={() => openCapsule(realIdx)} className="bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold">打开</button>
              </div>
            );
          })}
        </div>
      )}

      {openIdx !== null && capsules[openIdx]?.opened && (
        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300 rounded-2xl p-5">
          <p className="text-xs text-gray-500 mb-2">来自 {capsules[openIdx].date} 的信</p>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{capsules[openIdx].letter}</p>
          <button onClick={() => setOpenIdx(null)} className="mt-3 text-sm text-indigo-600 font-semibold">关闭</button>
        </div>
      )}

      {opened.length > 0 && openIdx === null && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">📖 已读的信 ({opened.length})</h3>
          {opened.slice(-3).reverse().map((c, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">{c.date}</p>
              <p className="text-sm text-gray-700">{c.letter.slice(0, 50)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AngerVolcanoPage({ onBack }) {
  const [level, setLevel] = useState(0);
  const levels = [
    { name: '平静', emoji: '😊', color: 'bg-green-400', triggers: '一切正常', strategies: '继续保持！' },
    { name: '有点烦', emoji: '😐', color: 'bg-yellow-300', triggers: '小事情让你不太舒服', strategies: '深呼吸3次，喝口水' },
    { name: '生气了', emoji: '😠', color: 'bg-orange-400', triggers: '有人做了让你不高兴的事', strategies: '离开现场，数到10' },
    { name: '很生气', emoji: '😡', color: 'bg-red-400', triggers: '感觉被不公平对待', strategies: '用力握拳再松开，做5次深呼吸' },
    { name: '要爆发', emoji: '🌋', color: 'bg-red-600', triggers: '怒火已经到了顶点', strategies: '马上找一个安全的地方，对枕头喊叫，或者找大人帮忙' }
  ];

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌋" title="愤怒火山" subtitle="了解你的怒气等级" />

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <p className="font-semibold text-gray-800 mb-3">你现在的怒气在哪个等级？</p>
        <div className="flex flex-col-reverse gap-1">
          {levels.map((l, i) => (
            <button key={i} onClick={() => setLevel(i)}
              className={`p-3 rounded-lg text-left transition flex items-center gap-3 ${level === i ? l.color + ' text-white' : 'bg-gray-50'}`}>
              <span className="text-2xl">{l.emoji}</span>
              <div>
                <p className={`text-sm font-bold ${level === i ? 'text-white' : 'text-gray-800'}`}>{l.name}</p>
                <p className={`text-xs ${level === i ? 'text-white opacity-80' : 'text-gray-500'}`}>{l.triggers}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={`${levels[level].color} rounded-2xl p-5 text-white text-center`}>
        <div className="text-5xl mb-2">{levels[level].emoji}</div>
        <p className="text-lg font-bold">等级 {level}: {levels[level].name}</p>
        <p className="mt-2 text-sm opacity-90">💡 应对方法:</p>
        <p className="font-semibold mt-1">{levels[level].strategies}</p>
      </div>

      <div className="bg-orange-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">🌋 生气是正常的感受！重要的是学会在火山爆发前用好的方式处理它。越早发现自己在变生气，越容易控制。</p>
      </div>
    </div>
  );
}

function WorrySorterPage({ sorted, onSave, onBack }) {
  const [worry, setWorry] = useState('');
  const [dragging, setDragging] = useState(null);

  const addWorry = (type) => {
    if (!worry.trim()) return;
    const entry = { text: worry.trim(), type, date: todayDate(), action: '' };
    onSave([...sorted, entry]);
    setWorry('');
  };

  const setAction = (idx, action) => {
    const updated = [...sorted];
    updated[idx] = { ...updated[idx], action };
    onSave(updated);
  };

  const canControl = sorted.filter(s => s.type === 'can');
  const cantControl = sorted.filter(s => s.type === 'cant');

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🗂️" title="烦恼分类器" subtitle="分清哪些能改变，哪些要放下" />

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
        <p className="font-semibold text-gray-800">写下一个烦恼</p>
        <input value={worry} onChange={e => setWorry(e.target.value)} placeholder="我在担心..."
          className="w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none" />
        {worry.trim() && (
          <div className="flex gap-3">
            <button onClick={() => addWorry('can')} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold text-sm">
              ✅ 我能做些什么
            </button>
            <button onClick={() => addWorry('cant')} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm">
              🍃 我没法控制
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-2xl p-4 space-y-2">
          <h3 className="font-bold text-green-700 text-sm">✅ 能做些什么 ({canControl.length})</h3>
          {canControl.slice(-5).reverse().map((s, i) => {
            const realIdx = sorted.indexOf(s);
            return (
              <div key={i} className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-800">{s.text}</p>
                {!s.action ? (
                  <input placeholder="行动计划..." onBlur={e => setAction(realIdx, e.target.value)}
                    className="w-full text-xs mt-1 p-1 border rounded focus:outline-none" />
                ) : (
                  <p className="text-xs text-green-600 mt-1">📝 {s.action}</p>
                )}
              </div>
            );
          })}
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
          <h3 className="font-bold text-blue-700 text-sm">🍃 放下它 ({cantControl.length})</h3>
          {cantControl.slice(-5).reverse().map((s, i) => (
            <div key={i} className="bg-white rounded-lg p-2">
              <p className="text-xs text-gray-800 line-through opacity-60">{s.text}</p>
              <p className="text-xs text-blue-500">🍃 已放下</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 很多烦恼来自我们没法控制的事。把它们分开，你就知道该把精力放在哪里了。</p>
      </div>
    </div>
  );
}

function MindfulMovementPage({ onBack }) {
  const [current, setCurrent] = useState(-1);
  const [done, setDone] = useState(false);

  const next = () => {
    if (current < YOGA_POSES.length - 1) setCurrent(current + 1);
    else setDone(true);
  };

  if (done) {
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={onBack} />
        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-gray-800">做得太棒了！</h2>
          <p className="text-gray-600 mt-2">你的身体和心灵都得到了放松</p>
          <button onClick={() => { setCurrent(-1); setDone(false); }} className="mt-6 bg-green-500 text-white px-8 py-3 rounded-full font-semibold">再做一次</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧘" title="正念运动" subtitle="简单的动作，大大的放松" />

      {current === -1 ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg text-center space-y-4">
          <p className="text-gray-700">跟着做一些简单的动作，配合呼吸，让身体和心灵都放松下来。</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {YOGA_POSES.map((p, i) => <span key={i} className="text-2xl">{p.emoji}</span>)}
          </div>
          <button onClick={next} className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold">开始练习</button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl p-6 text-center space-y-4">
          <div className="flex justify-center gap-1">
            {YOGA_POSES.map((_, i) => <div key={i} className={`w-3 h-3 rounded-full ${i <= current ? 'bg-green-500' : 'bg-white'}`} />)}
          </div>
          <div className="text-6xl">{YOGA_POSES[current].emoji}</div>
          <h3 className="text-2xl font-bold text-gray-800">{YOGA_POSES[current].name}</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{YOGA_POSES[current].instruction}</p>
          <div className="bg-white rounded-xl p-3">
            <p className="text-sm text-green-700 font-semibold">💚 心里默念："{YOGA_POSES[current].thought}"</p>
          </div>
          <button onClick={next} className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold">
            {current < YOGA_POSES.length - 1 ? '下一个动作' : '完成'}
          </button>
        </div>
      )}
    </div>
  );
}

function EmotionDetectivePage({ cases, onSave, onBack }) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [thought, setThought] = useState(-1);
  const [feeling, setFeelings] = useState('');
  const [body, setBody] = useState(-1);

  const scene = DETECTIVE_SCENARIOS[sceneIdx];

  const solve = () => {
    onSave([...cases, {
      date: todayDate(), situation: scene.situation,
      thought: scene.thoughts[thought], feeling, body: scene.bodyFeelings[body]
    }]);
    setStep(3);
  };

  const nextCase = () => {
    setSceneIdx((sceneIdx + 1) % DETECTIVE_SCENARIOS.length);
    setStep(0); setThought(-1); setFeelings(''); setBody(-1);
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🔍" title="情绪侦探" subtitle="探索想法、感受和身体的联系" />

      {step < 3 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-800">📋 情况：</p>
          <p className="text-sm text-gray-700 mt-1">{scene.situation}</p>
        </div>
      )}

      {step === 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <p className="font-semibold text-gray-800">🧠 你可能会怎么想？</p>
          {scene.thoughts.map((t, i) => (
            <button key={i} onClick={() => setThought(i)}
              className={`w-full text-left p-3 rounded-xl border-2 transition ${thought === i ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <p className="text-sm text-gray-800">{t}</p>
            </button>
          ))}
          {thought >= 0 && <button onClick={() => setStep(1)} className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold">下一步</button>}
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <p className="font-semibold text-gray-800">💗 这让你有什么感受？</p>
          <input value={feeling} onChange={e => setFeelings(e.target.value)} placeholder="比如：难过、生气、害怕..."
            className="w-full p-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none" />
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold">上一步</button>
            <button onClick={() => feeling.trim() && setStep(2)} disabled={!feeling.trim()} className="flex-1 bg-pink-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">下一步</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <p className="font-semibold text-gray-800">🦴 身体有什么感觉？</p>
          {scene.bodyFeelings.map((b, i) => (
            <button key={i} onClick={() => setBody(i)}
              className={`w-full text-left p-3 rounded-xl border-2 transition ${body === i ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
              <p className="text-sm text-gray-800">{b}</p>
            </button>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold">上一步</button>
            {body >= 0 && <button onClick={solve} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold">完成分析</button>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-gradient-to-br from-yellow-100 to-green-100 rounded-3xl p-6 space-y-3 text-center">
          <div className="text-5xl">🔍</div>
          <p className="text-lg font-bold text-gray-800">侦探报告</p>
          <div className="text-left space-y-2 bg-white rounded-xl p-4">
            <p className="text-sm"><span className="font-bold text-blue-600">🧠 想法：</span>{scene.thoughts[thought]}</p>
            <p className="text-sm"><span className="font-bold text-pink-600">💗 感受：</span>{feeling}</p>
            <p className="text-sm"><span className="font-bold text-green-600">🦴 身体：</span>{scene.bodyFeelings[body]}</p>
          </div>
          <p className="text-sm text-gray-700">看到了吗？想法影响感受，感受影响身体。换一种想法，感受和身体反应也会不一样！</p>
          <button onClick={nextCase} className="bg-yellow-500 text-white px-6 py-3 rounded-full font-semibold">下一个案例</button>
        </div>
      )}

      <div className="bg-yellow-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 想法→感受→身体，这三个是连在一起的。当你发现自己难受时，试着找找是什么想法让你有这种感觉，然后换一种想法看看！</p>
      </div>
    </div>
  );
}

function CelebrationWallPage({ wall, onSave, onBack }) {
  const [text, setText] = useState('');
  const [isParent, setIsParent] = useState(false);
  const stickers = ['⭐', '🌟', '💪', '🏆', '🎉', '💖', '🌈', '👑'];

  const addPost = (sticker) => {
    if (sticker) {
      onSave([...wall, { type: 'sticker', content: sticker, from: isParent ? 'parent' : 'kid', date: todayDate() }]);
    }
  };

  const addMessage = () => {
    if (!text.trim()) return;
    onSave([...wall, { type: 'message', content: text.trim(), from: isParent ? 'parent' : 'kid', date: todayDate() }]);
    setText('');
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎊" title="庆祝墙" subtitle="记录值得骄傲的时刻" />

      <div className="flex gap-2 justify-center">
        <button onClick={() => setIsParent(false)}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${!isParent ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
          👦 我是孩子
        </button>
        <button onClick={() => setIsParent(true)}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${isParent ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
          👨‍👩‍👧 我是家长
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
        <p className="font-semibold text-gray-800">{isParent ? '给孩子贴一个鼓励' : '记录一个骄傲时刻'}</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {stickers.map((s, i) => (
            <button key={i} onClick={() => addPost(s)} className="text-3xl p-2 hover:scale-125 transition">{s}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder={isParent ? '写一句鼓励的话...' : '我今天做到了...'}
            className="flex-1 p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none" />
          <button onClick={addMessage} disabled={!text.trim()} className="bg-purple-500 disabled:bg-gray-300 text-white px-4 rounded-xl font-semibold">发</button>
        </div>
      </div>

      <div className="space-y-2">
        {wall.slice(-15).reverse().map((post, i) => (
          <div key={i} className={`rounded-xl p-3 ${post.from === 'parent' ? 'bg-pink-50 border-l-4 border-pink-400' : 'bg-purple-50 border-l-4 border-purple-400'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">{post.from === 'parent' ? '👨‍👩‍👧 爸爸/妈妈' : '👦 我自己'}</span>
              <span className="text-xs text-gray-400">{post.date}</span>
            </div>
            {post.type === 'sticker' ? (
              <p className="text-4xl text-center mt-1">{post.content}</p>
            ) : (
              <p className="text-sm text-gray-800 mt-1">{post.content}</p>
            )}
          </div>
        ))}
        {wall.length === 0 && <p className="text-sm text-gray-500 text-center py-4">墙上还没有内容，来贴第一个吧！</p>}
      </div>
    </div>
  );
}

// ─── Batch 5 Components ─────────────────────────────────────────────────────

function DrawingBoardPage({ gallery, onSave, onBack }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const lastPos = useRef(null);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: (touch.clientX - rect.left) * (canvas.width / rect.width), y: (touch.clientY - rect.top) * (canvas.height / rect.height) };
  };

  const startDraw = (e) => { e.preventDefault(); setDrawing(true); lastPos.current = getPos(e); };
  const endDraw = () => { setDrawing(false); lastPos.current = null; };
  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveDrawing = () => {
    const data = canvasRef.current.toDataURL('image/png', 0.5);
    onSave([...gallery, { date: todayDate(), image: data, color }]);
    clearCanvas();
  };

  useEffect(() => {
    if (canvasRef.current) clearCanvas();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎨" title="情绪画板" subtitle="用颜色和线条表达你的感受" />

      <div className="flex gap-1 flex-wrap justify-center">
        {DRAWING_COLORS.map((c, i) => (
          <button key={i} onClick={() => setColor(c.color)}
            className={`w-8 h-8 rounded-full border-2 transition ${color === c.color ? 'border-gray-800 scale-125' : 'border-gray-300'}`}
            style={{ backgroundColor: c.color }} title={c.label} />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden touch-none">
        <canvas ref={canvasRef} width={320} height={320}
          className="w-full cursor-crosshair"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">细</span>
        <input type="range" min="2" max="20" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="flex-1" />
        <span className="text-xs text-gray-500">粗</span>
      </div>

      <div className="flex gap-3">
        <button onClick={clearCanvas} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold">清空</button>
        <button onClick={saveDrawing} className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-semibold">保存到画廊</button>
      </div>

      {gallery.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">🖼️ 我的画廊 ({gallery.length})</h3>
          <div className="grid grid-cols-3 gap-2">
            {gallery.slice(-6).reverse().map((g, i) => (
              <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
                <img src={g.image} alt="drawing" className="w-full h-20 object-cover" />
                <p className="text-xs text-gray-500 text-center py-1">{g.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BodyEmotionMapPage({ maps, onSave, onBack }) {
  const [selectedZone, setSelectedZone] = useState(null);
  const [emotion, setEmotion] = useState('');
  const [sensation, setSensation] = useState('');
  const [todayMap, setTodayMap] = useState({});

  const saveZone = () => {
    if (!selectedZone || !emotion.trim()) return;
    const updated = { ...todayMap, [selectedZone]: { emotion, sensation } };
    setTodayMap(updated);
    onSave([...maps.filter(m => m.date !== todayDate()), { date: todayDate(), zones: updated }]);
    setSelectedZone(null); setEmotion(''); setSensation('');
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🫀" title="身体情绪地图" subtitle="感受在身体的哪里？" />

      <div className="bg-white rounded-2xl p-4 shadow-lg relative" style={{ height: '300px' }}>
        <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20">🧍</div>
        {BODY_EMOTION_ZONES.map((zone) => {
          const data = todayMap[zone.id];
          return (
            <button key={zone.id} onClick={() => setSelectedZone(zone.id)}
              className={`absolute rounded-xl border-2 transition hover:bg-opacity-50 ${data ? 'bg-red-200 border-red-400' : selectedZone === zone.id ? 'bg-blue-200 border-blue-400' : 'bg-gray-100 border-gray-200 bg-opacity-50'}`}
              style={{ top: zone.top, left: zone.left, width: zone.w, height: zone.h }}>
              <span className="text-xs font-semibold">{data ? data.emotion : zone.name}</span>
            </button>
          );
        })}
      </div>

      {selectedZone && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <p className="font-semibold text-gray-800">在{BODY_EMOTION_ZONES.find(z => z.id === selectedZone)?.name}感受到什么？</p>
          <input value={emotion} onChange={e => setEmotion(e.target.value)} placeholder="什么情绪？比如：紧张、难过..."
            className="w-full p-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none" />
          <p className="text-sm text-gray-600">什么感觉？</p>
          <div className="flex gap-1 flex-wrap">
            {BODY_SENSATIONS.map((s, i) => (
              <button key={i} onClick={() => setSensation(s)}
                className={`text-xs px-2 py-1 rounded-full border ${sensation === s ? 'bg-pink-500 text-white' : 'border-pink-200 text-gray-700'}`}>{s}</button>
            ))}
          </div>
          <button onClick={saveZone} disabled={!emotion.trim()} className="w-full bg-pink-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">标记</button>
        </div>
      )}

      <div className="bg-pink-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 每种情绪都会在身体的某个地方出现。紧张时肚子可能打结，生气时头可能发热。认识这些信号，能帮你更早发现自己的感受。</p>
      </div>
    </div>
  );
}

function ThinkingTrapsPage({ caught, onSave, onBack }) {
  const [open, setOpen] = useState(null);
  const [myThought, setMyThought] = useState('');
  const [selectedTrap, setSelectedTrap] = useState(null);

  const catchTrap = () => {
    if (!myThought.trim() || selectedTrap === null) return;
    onSave([...caught, { date: todayDate(), thought: myThought, trap: THINKING_TRAPS[selectedTrap].name }]);
    setMyThought(''); setSelectedTrap(null);
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🪤" title="思维陷阱" subtitle="学会发现脑海里的小怪兽" />

      <div className="space-y-2">
        {THINKING_TRAPS.map((trap, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow overflow-hidden">
            <button onClick={() => setOpen(open === idx ? null : idx)} className="w-full p-4 text-left flex items-center gap-3">
              <span className="text-2xl">{trap.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{trap.name}</p>
                <p className="text-xs text-gray-500">{trap.desc}</p>
              </div>
              <span className="text-gray-400">{open === idx ? '▲' : '▼'}</span>
            </button>
            {open === idx && (
              <div className="px-4 pb-4 space-y-2">
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-700"><span className="font-bold">例子：</span>{trap.example}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-700"><span className="font-bold">破解：</span>{trap.fix}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
        <p className="font-semibold text-gray-800">🪤 抓住一个思维陷阱</p>
        <input value={myThought} onChange={e => setMyThought(e.target.value)} placeholder="你脑海里的想法..."
          className="w-full p-3 border-2 border-yellow-200 rounded-xl focus:border-yellow-500 focus:outline-none" />
        <div className="flex gap-1 flex-wrap">
          {THINKING_TRAPS.map((t, i) => (
            <button key={i} onClick={() => setSelectedTrap(i)}
              className={`text-xs px-2 py-1 rounded-full border ${selectedTrap === i ? 'bg-yellow-500 text-white' : 'border-yellow-200 text-gray-700'}`}>{t.name}</button>
          ))}
        </div>
        <button onClick={catchTrap} disabled={!myThought.trim() || selectedTrap === null}
          className="w-full bg-yellow-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">抓住它！</button>
      </div>

      {caught.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">抓到的陷阱 ({caught.length})</h3>
          {caught.slice(-5).reverse().map((c, i) => (
            <div key={i} className="bg-yellow-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">{c.date} — 🪤 {c.trap}</p>
              <p className="text-sm text-gray-800">{c.thought}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FearLadderPage({ ladders, onSave, onBack }) {
  const [fear, setFear] = useState('');
  const [rungs, setRungs] = useState(['', '', '', '', '']);
  const currentLadder = ladders.length > 0 ? ladders[ladders.length - 1] : null;
  const showForm = !currentLadder || currentLadder.completed;

  const create = () => {
    if (!fear.trim() || !rungs.some(r => r.trim())) return;
    onSave([...ladders, { fear, rungs: rungs.filter(r => r.trim()), climbed: [], completed: false, date: todayDate() }]);
    setFear(''); setRungs(['', '', '', '', '']);
  };

  const climb = (idx) => {
    const updated = [...ladders];
    const l = { ...updated[updated.length - 1] };
    if (!l.climbed.includes(idx)) {
      l.climbed = [...l.climbed, idx];
      if (l.climbed.length === l.rungs.length) l.completed = true;
      updated[updated.length - 1] = l;
      onSave(updated);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🪜" title="勇气阶梯" subtitle="一步一步，慢慢克服害怕" />

      {!showForm && currentLadder && (
        <>
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 text-center">
            <p className="text-sm text-gray-600">我要克服的</p>
            <p className="text-lg font-bold text-gray-800">😨 {currentLadder.fear}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg space-y-2">
            {currentLadder.rungs.slice().reverse().map((rung, displayIdx) => {
              const realIdx = currentLadder.rungs.length - 1 - displayIdx;
              const done = currentLadder.climbed.includes(realIdx);
              const canClimb = realIdx === 0 || currentLadder.climbed.includes(realIdx - 1);
              return (
                <button key={realIdx} onClick={() => canClimb && climb(realIdx)}
                  className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition ${done ? 'bg-green-100 border-green-300' : canClimb ? 'border-yellow-300 hover:bg-yellow-50' : 'border-gray-200 opacity-50'}`}>
                  <span className="text-sm">{FEAR_LEVELS[Math.min(realIdx, FEAR_LEVELS.length - 1)]}</span>
                  <span className="text-sm font-semibold text-gray-800 flex-1">{rung}</span>
                  {done && <span>✅</span>}
                </button>
              );
            })}
          </div>
          {currentLadder.completed && (
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <p className="font-bold text-gray-800">你征服了害怕！太勇敢了！</p>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="font-semibold text-gray-800">你害怕什么？</p>
          <input value={fear} onChange={e => setFear(e.target.value)} placeholder="比如：在全班面前说话..."
            className="w-full p-3 border-2 border-yellow-200 rounded-xl focus:border-yellow-500 focus:outline-none" />
          <p className="font-semibold text-gray-800">从最不害怕到最害怕，写出步骤：</p>
          {rungs.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-16">{FEAR_LEVELS[i]?.split(' ')[0]}</span>
              <input value={r} onChange={e => { const n = [...rungs]; n[i] = e.target.value; setRungs(n); }}
                placeholder={`第${i + 1}步...`} className="flex-1 p-2 border-2 border-yellow-200 rounded-lg focus:border-yellow-500 focus:outline-none text-sm" />
            </div>
          ))}
          <button onClick={create} disabled={!fear.trim() || !rungs.some(r => r.trim())}
            className="w-full bg-yellow-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">开始爬梯子</button>
        </div>
      )}
    </div>
  );
}

function GratitudeLetterPage({ letters, onSave, onBack }) {
  const [to, setTo] = useState('');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (!to.trim() || !content.trim()) return;
    onSave([...letters, { date: todayDate(), to: to.trim(), content: content.trim() }]);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={onBack} />
        <div className="bg-gradient-to-br from-amber-100 to-pink-100 rounded-3xl p-8 text-center border-2 border-amber-200">
          <div className="text-5xl mb-3">💌</div>
          <p className="text-xl font-bold text-gray-800">信写好了！</p>
          <p className="text-gray-600 mt-2">如果可以的话，把这封信读给{to}听，效果会更好哦！</p>
          <button onClick={() => { setSaved(false); setTo(''); setContent(''); }}
            className="mt-4 bg-amber-500 text-white px-6 py-3 rounded-full font-semibold">再写一封</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="💌" title="感恩信" subtitle="给重要的人写一封感谢信" />

      <div className="bg-amber-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 研究发现，写一封感恩的信并读给对方听，是提升幸福感最有效的方法之一。效果可以持续好几周！</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e5e7eb 28px)', backgroundPosition: '0 40px' }}>
        <div>
          <p className="font-semibold text-gray-800">写给谁？</p>
          <input value={to} onChange={e => setTo(e.target.value)} placeholder="爸爸/妈妈/老师/朋友..."
            className="w-full p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:outline-none mt-1" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">你想对他/她说什么？</p>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="亲爱的____，我想谢谢你..."
            className="w-full h-40 p-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none mt-1" />
        </div>
        <button onClick={save} disabled={!to.trim() || !content.trim()}
          className="w-full bg-amber-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">完成 💌</button>
      </div>

      {letters.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">写过的信 ({letters.length})</h3>
          {letters.slice(-3).reverse().map((l, i) => (
            <div key={i} className="bg-amber-50 rounded-xl p-3">
              <p className="text-sm font-semibold text-gray-800">给{l.to}的信</p>
              <p className="text-xs text-gray-500">{l.date}</p>
              <p className="text-xs text-gray-700 mt-1">{l.content.slice(0, 60)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FirstAidKitPage({ kit, onSave, allTools, onBack, onNavigate }) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(kit || []);
  const availableTools = allTools.filter(t => !['parent', 'firstaid'].includes(t.id));

  const save = () => { onSave(selected); setEditing(false); };
  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 6 ? [...prev, id] : prev);
  };

  if (editing || kit.length === 0) {
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={onBack} />
        <PageHeader emoji="🧰" title="情绪急救箱" subtitle="选择最适合你的工具（最多6个）" />
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-sm text-gray-700">💡 选择在你难受时最有用的工具。当你需要帮助时，打开急救箱就能快速找到它们。</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {availableTools.map(tool => (
            <button key={tool.id} onClick={() => toggle(tool.id)}
              className={`rounded-xl p-3 text-left transition border-2 ${selected.includes(tool.id) ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
              <span className="text-2xl">{tool.emoji}</span>
              <p className="text-xs font-semibold text-gray-800 mt-1">{tool.title}</p>
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <button onClick={save} className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold">
            保存急救箱 ({selected.length}/6)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧰" title="情绪急救箱" subtitle="你的专属应急工具" />
      <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl p-6 text-center">
        <div className="text-5xl mb-2">🧰</div>
        <p className="text-gray-700">难受的时候，打开急救箱</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {kit.map(id => {
          const tool = allTools.find(t => t.id === id);
          if (!tool) return null;
          return (
            <button key={id} onClick={() => onNavigate(id)}
              className={`bg-gradient-to-br ${tool.color} rounded-xl p-4 text-left hover:scale-105 transition shadow`}>
              <div className="text-3xl mb-2">{tool.emoji}</div>
              <p className="font-semibold text-sm text-gray-800">{tool.title}</p>
            </button>
          );
        })}
      </div>
      <button onClick={() => setEditing(true)} className="w-full bg-white border-2 border-red-300 text-red-600 py-3 rounded-xl font-semibold">
        编辑急救箱
      </button>
    </div>
  );
}

function DreamJournalPage({ dreams, onSave, onBack }) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const moods = ['😊 愉快', '😨 害怕', '😢 难过', '😵 奇怪', '😌 平静'];

  const save = () => {
    if (!content.trim()) return;
    onSave([...dreams, { date: todayDate(), content: content.trim(), mood }]);
    setContent(''); setMood('');
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌙" title="梦境日记" subtitle="记录你的梦，了解你的内心" />

      <div className="bg-indigo-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">💡 梦常常反映我们白天的感受。记录梦境可以帮助你更好地了解自己的内心世界。醒来后马上记录，否则很快就会忘记！</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
        <p className="font-semibold text-gray-800">昨晚做了什么梦？</p>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="我梦见了..."
          className="w-full h-28 p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none" />
        <p className="font-semibold text-gray-800">梦里的感觉</p>
        <div className="flex gap-2 flex-wrap">
          {moods.map((m, i) => (
            <button key={i} onClick={() => setMood(m)}
              className={`text-xs px-3 py-1.5 rounded-full border ${mood === m ? 'bg-indigo-500 text-white' : 'border-indigo-200 text-gray-700'}`}>{m}</button>
          ))}
        </div>
        <button onClick={save} disabled={!content.trim()} className="w-full bg-indigo-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">记录梦境</button>
      </div>

      {dreams.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">梦境记录 ({dreams.length})</h3>
          {dreams.slice(-5).reverse().map((d, i) => (
            <div key={i} className="bg-indigo-50 rounded-xl p-3">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{d.date}</p>
                {d.mood && <span className="text-xs">{d.mood}</span>}
              </div>
              <p className="text-sm text-gray-800 mt-1">{d.content.slice(0, 80)}{d.content.length > 80 ? '...' : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MindfulEatingPage({ log, onSave, onBack }) {
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState({ see: '', smell: '', touch: '', taste: '', feel: '' });

  const steps = [
    { key: 'see', emoji: '👀', title: '看一看', instruction: '仔细看看你面前的食物。它是什么颜色？什么形状？有没有什么你以前没注意到的？', placeholder: '我看到...' },
    { key: 'smell', emoji: '👃', title: '闻一闻', instruction: '把食物拿到鼻子前，慢慢闻一闻。你闻到了什么气味？', placeholder: '我闻到...' },
    { key: 'touch', emoji: '✋', title: '摸一摸', instruction: '用手指轻轻触碰食物。它是什么感觉？滑的？粗的？软的？硬的？', placeholder: '我摸到...' },
    { key: 'taste', emoji: '👅', title: '尝一尝', instruction: '放一小口到嘴里，先不要嚼。感受它在舌头上的味道。然后慢慢嚼，注意味道的变化。', placeholder: '我尝到...' },
    { key: 'feel', emoji: '💗', title: '感受', instruction: '吃完后，感受一下身体。你的肚子感觉怎样？心情有变化吗？', placeholder: '我感受到...' }
  ];

  const save = () => {
    onSave([...log, { date: todayDate(), notes }]);
    setStep(0); setNotes({ see: '', smell: '', touch: '', taste: '', feel: '' });
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🍎" title="正念进食" subtitle="慢慢吃，用心感受" />

      {step < 5 ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex gap-1">{steps.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-green-500' : 'bg-gray-200'}`} />)}</div>
          <div className="text-center">
            <div className="text-5xl mb-2">{steps[step].emoji}</div>
            <h3 className="text-xl font-bold text-gray-800">{steps[step].title}</h3>
          </div>
          <p className="text-sm text-gray-700">{steps[step].instruction}</p>
          <textarea value={notes[steps[step].key]} onChange={e => setNotes({ ...notes, [steps[step].key]: e.target.value })}
            placeholder={steps[step].placeholder}
            className="w-full h-20 p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none resize-none" />
          <div className="flex gap-3">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold">上一步</button>}
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold">下一步</button>
            ) : (
              <button onClick={save} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold">完成</button>
            )}
          </div>
        </div>
      ) : null}

      <div className="bg-green-50 rounded-xl p-4">
        <p className="text-sm text-gray-700">🍎 正念进食可以用任何食物来练习——一颗葡萄干、一块巧克力、一口米饭。关键是慢慢来，用心感受。</p>
      </div>

      {log.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-800">练习记录 ({log.length})</h3>
          {log.slice(-3).reverse().map((l, i) => (
            <div key={i} className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">{l.date}</p>
              {Object.entries(l.notes).filter(([_, v]) => v).map(([k, v]) => (
                <p key={k} className="text-xs text-gray-700">• {v}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComplimentChainPage({ chain, onSave, onBack }) {
  const [text, setText] = useState('');
  const isForSelf = chain.length % 2 === 0;

  const add = () => {
    if (!text.trim()) return;
    onSave([...chain, { text: text.trim(), type: isForSelf ? 'self' : 'other', date: todayDate() }]);
    setText('');
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🔗" title="夸夸链" subtitle="夸自己一句，再夸别人一句" />

      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-600">夸夸链长度</p>
        <p className="text-3xl font-bold text-purple-600">{chain.length} 🔗</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
        <p className="font-semibold text-gray-800">{isForSelf ? '🌟 夸夸自己' : '💗 夸夸别人'}</p>
        <p className="text-sm text-gray-600">{isForSelf ? '写一句你喜欢自己的地方' : '写一句你想对别人说的好话'}</p>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder={isForSelf ? '我很棒因为...' : '我想对____说...'}
          className="w-full h-20 p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none" />
        <button onClick={add} disabled={!text.trim()} className="w-full bg-purple-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">
          添加一环 🔗
        </button>
      </div>

      {chain.length > 0 && (
        <div className="space-y-1">
          <h3 className="font-bold text-gray-800">我的夸夸链</h3>
          {chain.slice(-10).reverse().map((c, i) => (
            <div key={i} className={`rounded-xl p-3 flex items-center gap-2 ${c.type === 'self' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-pink-50 border-l-4 border-pink-400'}`}>
              <span className="text-lg">{c.type === 'self' ? '🌟' : '💗'}</span>
              <p className="text-sm text-gray-800 flex-1">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SafePlacePage({ place, onSave, onBack }) {
  const [step, setStep] = useState(place ? 3 : 0);
  const [location, setLocation] = useState(place?.location || null);
  const [elements, setElements] = useState(place?.elements || []);
  const [description, setDescription] = useState(place?.description || '');

  const save = () => {
    onSave({ location, elements, description });
    setStep(3);
  };

  const toggleElement = (el) => {
    setElements(prev => prev.includes(el.name) ? prev.filter(e => e !== el.name) : prev.length < 5 ? [...prev, el.name] : prev);
  };

  if (step === 3 && (place || location)) {
    const p = place || { location, elements, description };
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={onBack} />
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-6 text-center space-y-3">
          <div className="text-6xl">{p.location?.emoji || '🏠'}</div>
          <h2 className="text-2xl font-bold text-gray-800">我的安全基地</h2>
          <p className="text-lg text-gray-700">{p.location?.name || '我的安全地方'}</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {(p.elements || []).map((el, i) => {
              const item = SAFE_PLACE_ELEMENTS.find(e => e.name === el);
              return <span key={i} className="bg-white px-3 py-1 rounded-full text-sm shadow">{item?.emoji} {el}</span>;
            })}
          </div>
          {p.description && <p className="text-sm text-gray-600 italic mt-2">"{p.description}"</p>}
          <p className="text-xs text-gray-500 mt-3">闭上眼睛，深呼吸，想象自己就在这里。你是安全的。💗</p>
        </div>
        <button onClick={() => { setStep(0); setLocation(null); setElements([]); setDescription(''); }}
          className="w-full bg-white border-2 border-purple-300 text-purple-600 py-3 rounded-xl font-semibold">重新设计安全基地</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🏠" title="安全基地" subtitle="设计一个只属于你的安全地方" />

      <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-purple-500' : 'bg-gray-200'}`} />)}</div>

      {step === 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="font-semibold text-gray-800">选一个地方</p>
          <div className="grid grid-cols-3 gap-3">
            {SAFE_PLACE_LOCATIONS.map((loc, i) => (
              <button key={i} onClick={() => { setLocation(loc); setStep(1); }}
                className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center hover:scale-105 transition">
                <div className="text-3xl">{loc.emoji}</div>
                <p className="text-xs mt-1 font-semibold">{loc.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="font-semibold text-gray-800">在你的{location?.name}里加些什么？（最多5个）</p>
          <div className="grid grid-cols-2 gap-2">
            {SAFE_PLACE_ELEMENTS.map((el, i) => (
              <button key={i} onClick={() => toggleElement(el)}
                className={`rounded-xl p-3 text-left border-2 transition ${elements.includes(el.name) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                <span className="text-xl">{el.emoji}</span>
                <p className="text-xs font-semibold mt-1">{el.name}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} disabled={elements.length === 0}
            className="w-full bg-purple-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold">下一步</button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <p className="font-semibold text-gray-800">描述一下你的安全基地</p>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="在这里，我可以看到...听到...感觉到..."
            className="w-full h-28 p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none" />
          <button onClick={save} className="w-full bg-purple-500 text-white py-3 rounded-xl font-semibold">完成 ✨</button>
        </div>
      )}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function HealingKidsApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mood, setMood] = useState(null);
  const [dailyProgress, setDailyProgress] = useState({ ...DEFAULT_PROGRESS });
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [journalEntries, setJournalEntries] = useState([]);
  const [currentJournal, setCurrentJournal] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // New feature state
  const [thoughtEntries, setThoughtEntries] = useState([]);
  const [gratitudeEntries, setGratitudeEntries] = useState([]);
  const [activationLog, setActivationLog] = useState([]);
  const [safetyPlan, setSafetyPlan] = useState({ warnings: [''], strategies: [''], people: [{ name: '', contact: '' }], reasons: [''] });
  const [socialLog, setSocialLog] = useState([]);
  const [sleepLog, setSleepLog] = useState([]);
  const [affirmationFavs, setAffirmationFavs] = useState([]);
  // Batch 2 state
  const [worryEntries, setWorryEntries] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [emotionLog, setEmotionLog] = useState([]);
  const [purchasedRewards, setPurchasedRewards] = useState([]);
  const [problemEntries, setProblemEntries] = useState([]);
  const [natureLog, setNatureLog] = useState([]);
  // Batch 3 state
  const [routineData, setRoutineData] = useState({});
  const [thermometerLog, setThermometerLog] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [goalData, setGoalData] = useState([]);
  const [moodPredictions, setMoodPredictions] = useState([]);
  const [kindnessLog, setKindnessLog] = useState([]);
  const [weeklyReviews, setWeeklyReviews] = useState([]);
  // Batch 4 state
  const [storyEntries, setStoryEntries] = useState([]);
  const [playlistData, setPlaylistData] = useState({});
  const [petData, setPetData] = useState(null);
  const [valuesData, setValuesData] = useState([]);
  const [capsules, setCapsules] = useState([]);
  const [worrySorted, setWorrySorted] = useState([]);
  const [detectiveCases, setDetectiveCases] = useState([]);
  const [celebrationWall, setCelebrationWall] = useState([]);
  // Batch 5 state
  const [drawingGallery, setDrawingGallery] = useState([]);
  const [bodyEmotionMaps, setBodyEmotionMaps] = useState([]);
  const [thinkingTrapsCaught, setThinkingTrapsCaught] = useState([]);
  const [fearLadders, setFearLadders] = useState([]);
  const [gratitudeLetters, setGratitudeLetters] = useState([]);
  const [firstAidKit, setFirstAidKit] = useState([]);
  const [dreamJournal, setDreamJournal] = useState([]);
  const [mindfulEatingLog, setMindfulEatingLog] = useState([]);
  const [complimentChain, setComplimentChain] = useState([]);
  const [safePlace, setSafePlace] = useState(null);
  // Onboarding state
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [userName, setUserName] = useState('小朋友');
  const [favoriteColor, setFavoriteColor] = useState('blue');
  const [userLiked, setUserLiked] = useState('');
  // Engagement & smart features
  const [toolUsageLog, setToolUsageLog] = useState([]);
  const [morningRoutine, setMorningRoutine] = useState({});
  const [eveningRoutine, setEveningRoutine] = useState({});
  const [ownedAccessories, setOwnedAccessories] = useState([]);
  const [equippedAccessory, setEquippedAccessory] = useState(null);
  const [unlockedEmotionLevel, setUnlockedEmotionLevel] = useState(0);
  const [parentNudges, setParentNudges] = useState([]);
  const [sharedAchievements, setSharedAchievements] = useState([]);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setMood(saved.mood || null);
      setDailyProgress(saved.dailyProgress || { ...DEFAULT_PROGRESS });
      setPoints(saved.points || 0);
      setStreak(saved.streak || 0);
      setJournalEntries(saved.journalEntries || []);
      setMoodHistory(saved.moodHistory || []);
      setThoughtEntries(saved.thoughtEntries || []);
      setGratitudeEntries(saved.gratitudeEntries || []);
      setActivationLog(saved.activationLog || []);
      setSafetyPlan(saved.safetyPlan || { warnings: [''], strategies: [''], people: [{ name: '', contact: '' }], reasons: [''] });
      setSocialLog(saved.socialLog || []);
      setSleepLog(saved.sleepLog || []);
      setAffirmationFavs(saved.affirmationFavs || []);
      setWorryEntries(saved.worryEntries || []);
      setStrengths(saved.strengths || []);
      setEmotionLog(saved.emotionLog || []);
      setPurchasedRewards(saved.purchasedRewards || []);
      setProblemEntries(saved.problemEntries || []);
      setNatureLog(saved.natureLog || []);
      setRoutineData(saved.routineData || {});
      setThermometerLog(saved.thermometerLog || []);
      setAchievements(saved.achievements || []);
      setGoalData(saved.goalData || []);
      setMoodPredictions(saved.moodPredictions || []);
      setKindnessLog(saved.kindnessLog || []);
      setWeeklyReviews(saved.weeklyReviews || []);
      setStoryEntries(saved.storyEntries || []);
      setPlaylistData(saved.playlistData || {});
      setPetData(saved.petData || null);
      setValuesData(saved.valuesData || []);
      setCapsules(saved.capsules || []);
      setWorrySorted(saved.worrySorted || []);
      setDetectiveCases(saved.detectiveCases || []);
      setCelebrationWall(saved.celebrationWall || []);
      setDrawingGallery(saved.drawingGallery || []);
      setBodyEmotionMaps(saved.bodyEmotionMaps || []);
      setThinkingTrapsCaught(saved.thinkingTrapsCaught || []);
      setFearLadders(saved.fearLadders || []);
      setGratitudeLetters(saved.gratitudeLetters || []);
      setFirstAidKit(saved.firstAidKit || []);
      setDreamJournal(saved.dreamJournal || []);
      setMindfulEatingLog(saved.mindfulEatingLog || []);
      setComplimentChain(saved.complimentChain || []);
      setSafePlace(saved.safePlace || null);
      setOnboardingDone(saved.onboardingDone || false);
      setUserName(saved.userName || '小朋友');
      setFavoriteColor(saved.favoriteColor || 'blue');
      setUserLiked(saved.userLiked || '');
      setToolUsageLog(saved.toolUsageLog || []);
      setMorningRoutine(saved.morningRoutine || {});
      setEveningRoutine(saved.eveningRoutine || {});
      setOwnedAccessories(saved.ownedAccessories || []);
      setEquippedAccessory(saved.equippedAccessory || null);
      setUnlockedEmotionLevel(saved.unlockedEmotionLevel || 0);
      setParentNudges(saved.parentNudges || []);
      setSharedAchievements(saved.sharedAchievements || []);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({
      mood, dailyProgress, points, streak, journalEntries, moodHistory,
      thoughtEntries, gratitudeEntries, activationLog, safetyPlan, socialLog, sleepLog, affirmationFavs,
      worryEntries, strengths, emotionLog, purchasedRewards, problemEntries, natureLog,
      routineData, thermometerLog, achievements, goalData, moodPredictions, kindnessLog, weeklyReviews,
      storyEntries, playlistData, petData, valuesData, capsules, worrySorted, detectiveCases, celebrationWall,
      drawingGallery, bodyEmotionMaps, thinkingTrapsCaught, fearLadders, gratitudeLetters, firstAidKit, dreamJournal, mindfulEatingLog, complimentChain, safePlace,
      onboardingDone, userName, favoriteColor, userLiked,
      toolUsageLog, morningRoutine, eveningRoutine, ownedAccessories, equippedAccessory,
      unlockedEmotionLevel, parentNudges, sharedAchievements,
      lastDate: todayStr()
    });
  }, [mood, dailyProgress, points, streak, journalEntries, moodHistory,
      thoughtEntries, gratitudeEntries, activationLog, safetyPlan, socialLog, sleepLog, affirmationFavs,
      worryEntries, strengths, emotionLog, purchasedRewards, problemEntries, natureLog,
      routineData, thermometerLog, achievements, goalData, moodPredictions, kindnessLog, weeklyReviews,
      storyEntries, playlistData, petData, valuesData, capsules, worrySorted, detectiveCases, celebrationWall,
      drawingGallery, bodyEmotionMaps, thinkingTrapsCaught, fearLadders, gratitudeLetters, firstAidKit, dreamJournal, mindfulEatingLog, complimentChain, safePlace,
      onboardingDone, userName, favoriteColor, userLiked,
      toolUsageLog, morningRoutine, eveningRoutine, ownedAccessories, equippedAccessory,
      unlockedEmotionLevel, parentNudges, sharedAchievements, hydrated]);

  const completeActivity = useCallback((activityId) => {
    setDailyProgress(prev => {
      if (prev[activityId]) return prev;
      const next = { ...prev, [activityId]: true };
      const completedCount = Object.values(next).filter(Boolean).length;
      setPoints(p => p + 10 + (completedCount === 4 ? 30 : 0));
      if (completedCount === 4) {
        setStreak(s => s + 1);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
      return next;
    });
  }, []);

  const saveMood = (moodData) => {
    const isFirst = !mood || mood.label !== moodData.label;
    setMood(moodData);
    if (isFirst) {
      setPoints(p => p + 5);
      setMoodHistory(h => [...h, { date: new Date().toISOString(), label: moodData.label, emoji: moodData.emoji }].slice(-30));
    }
  };

  const saveJournal = () => {
    if (currentJournal.trim()) {
      setJournalEntries(prev => [...prev, {
        date: todayDate(), time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        content: currentJournal, mood
      }]);
      setCurrentJournal('');
      completeActivity('journaling');
    }
  };

  const toggleAffirmationFav = (text) => {
    setAffirmationFavs(prev => prev.includes(text) ? prev.filter(f => f !== text) : [...prev, text]);
  };

  const handleOnboardingComplete = (data) => {
    setUserName(data.userName);
    setFavoriteColor(data.favoriteColor);
    setUserLiked(data.liked);
    setOnboardingDone(true);
    setPoints(p => p + 20);
  };

  const colorConfig = FAVORITE_COLORS.find(c => c.value === favoriteColor) || FAVORITE_COLORS[0];
  const goTools = () => setCurrentPage('tools');
  const trackAndNavigate = (pageId) => {
    setToolUsageLog(prev => [...prev.slice(-200), { toolId: pageId, date: new Date().toISOString() }]);
    setCurrentPage(pageId);
  };
  const encouragement = ENCOURAGEMENTS[new Date().getDate() % ENCOURAGEMENTS.length];
  const needsSupport = mood && NEGATIVE_MOODS.includes(mood.label);
  const journalPrompt = JOURNAL_PROMPTS[new Date().getDate() % JOURNAL_PROMPTS.length];
  const recentJournals = journalEntries.slice(-10).reverse();
  const todayAffirmation = AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];

  // ── Smart Home: time-based and adaptive suggestions ──
  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 18;
  const isMorning = currentHour < 12;
  const todayKey = new Date().toDateString();
  const morningDone = morningRoutine[todayKey]?.done;
  const eveningDone = eveningRoutine[todayKey]?.done;

  // Emotion level auto-unlock
  const totalMoodDays = new Set(moodHistory.map(m => new Date(m.date).toDateString())).size;
  const newLevel = EMOTION_LEVELS.filter(l => totalMoodDays >= l.minDays).length - 1;
  if (newLevel > unlockedEmotionLevel) {
    setUnlockedEmotionLevel(newLevel);
  }

  // Adaptive: find most-used tool categories
  const recentToolCounts = {};
  toolUsageLog.slice(-50).forEach(t => { recentToolCounts[t.toolId] = (recentToolCounts[t.toolId] || 0) + 1; });

  // Low mood alert: 3+ days of negative mood
  const last3Moods = moodHistory.slice(-3);
  const persistentLowMood = last3Moods.length >= 3 && last3Moods.every(m => NEGATIVE_MOODS.includes(m.label));

  // Unread parent nudges
  const unreadNudges = parentNudges.filter(n => !n.read);

  if (!onboardingDone && hydrated) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className={`max-w-md mx-auto bg-gradient-to-b ${colorConfig.gradient || 'from-blue-50 to-purple-50'} min-h-screen relative`}>
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center animate-bounce">
            <div className="text-6xl mb-2">🎉</div>
            <p className="text-2xl font-bold text-purple-600">太棒了！</p>
            <p className="text-gray-700">你完成了今天所有的活动</p>
          </div>
        </div>
      )}

      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className="p-4 flex items-center justify-between">
          <div className="w-10"></div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">☀️ 阳光小屋</h1>
          <button onClick={() => setCurrentPage('help')} className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200" title="寻求帮助">
            <Heart className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>

      <div className="pb-24">
        {/* ── Home ── */}
        {currentPage === 'home' && (
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div><h2 className="text-2xl font-bold">你好！{userName}</h2><p className="opacity-90">今天感觉怎么样？</p></div>
                <Sun className="w-16 h-16" />
              </div>
              <div className="flex gap-2 justify-center mt-4 flex-wrap">
                {MOODS.map((m) => (
                  <button key={m.label} onClick={() => saveMood(m)}
                    className={`${mood?.label === m.label ? 'ring-4 ring-white scale-110' : ''} transition-all p-3 rounded-full bg-white bg-opacity-20 hover:scale-105`}>
                    <span className="text-3xl">{m.emoji}</span>
                  </button>
                ))}
              </div>
              {mood && <p className="text-center mt-3 text-sm">今天你感到{mood.label} {mood.emoji}</p>}
            </div>

            {mood && GUIDED_PATHWAYS[mood.label] && (
              <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{GUIDED_PATHWAYS[mood.label].emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{GUIDED_PATHWAYS[mood.label].title}</h3>
                    <p className="text-sm text-gray-500">{GUIDED_PATHWAYS[mood.label].desc}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {GUIDED_PATHWAYS[mood.label].tools.map((toolId, idx) => {
                    const tool = TOOL_PAGES.find(t => t.id === toolId);
                    if (!tool && toolId === 'breathing') return (
                      <button key={toolId} onClick={() => setCurrentPage('breathing')}
                        className="w-full flex items-center gap-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-3 hover:scale-102 transition text-left">
                        <span className="text-xl w-8 text-center">❤️</span>
                        <div className="flex-1"><p className="font-semibold text-sm text-gray-800">呼吸练习</p></div>
                        <span className="text-xs text-gray-400">步骤 {idx + 1}</span>
                      </button>
                    );
                    if (!tool && toolId === 'meditation') return (
                      <button key={toolId} onClick={() => setCurrentPage('meditation')}
                        className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 hover:scale-102 transition text-left">
                        <span className="text-xl w-8 text-center">☁️</span>
                        <div className="flex-1"><p className="font-semibold text-sm text-gray-800">冥想放松</p></div>
                        <span className="text-xs text-gray-400">步骤 {idx + 1}</span>
                      </button>
                    );
                    if (!tool) return null;
                    return (
                      <button key={toolId} onClick={() => setCurrentPage(toolId)}
                        className={`w-full flex items-center gap-3 bg-gradient-to-r ${tool.color} rounded-xl p-3 hover:scale-102 transition text-left`}>
                        <span className="text-xl w-8 text-center">{tool.emoji}</span>
                        <div className="flex-1"><p className="font-semibold text-sm text-gray-800">{tool.title}</p><p className="text-xs text-gray-500">{tool.desc}</p></div>
                        <span className="text-xs text-gray-400">步骤 {idx + 1}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-center text-xs text-gray-400 mt-3">按顺序试试，每一步都会帮到你</p>
              </div>
            )}

            {needsSupport && (
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 rounded-2xl p-4">
                <p className="text-gray-800 font-semibold mb-2">💗 感到{mood.label}是没关系的</p>
                <p className="text-sm text-gray-700 mb-3">这些感受都是正常的。试试下面的小练习，会帮助你感觉好一些。</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage('breathing')} className="flex-1 bg-pink-500 text-white py-2 rounded-lg text-sm font-semibold">呼吸练习</button>
                  <button onClick={() => setCurrentPage('thought')} className="flex-1 bg-teal-500 text-white py-2 rounded-lg text-sm font-semibold">想法捕捉</button>
                  <button onClick={() => setCurrentPage('help')} className="flex-1 bg-purple-500 text-white py-2 rounded-lg text-sm font-semibold">寻求帮助</button>
                </div>
              </div>
            )}

            {/* Morning/Evening Routine Card */}
            {isMorning && !morningDone && (
              <button onClick={() => setCurrentPage('morningroutine')}
                className="w-full bg-gradient-to-r from-yellow-300 to-orange-300 rounded-2xl p-4 shadow-lg text-left hover:scale-102 transition">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌅</span>
                  <div className="flex-1">
                    <p className="font-bold text-white text-lg">早安仪式</p>
                    <p className="text-sm text-white opacity-90">开始新的一天吧！</p>
                  </div>
                  <span className="text-white text-2xl">→</span>
                </div>
              </button>
            )}
            {isEvening && !eveningDone && (
              <button onClick={() => setCurrentPage('eveningroutine')}
                className="w-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl p-4 shadow-lg text-left hover:scale-102 transition">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌙</span>
                  <div className="flex-1">
                    <p className="font-bold text-white text-lg">晚安仪式</p>
                    <p className="text-sm text-white opacity-90">回顾今天，准备好好休息</p>
                  </div>
                  <span className="text-white text-2xl">→</span>
                </div>
              </button>
            )}

            {/* Unread parent nudge */}
            {unreadNudges.length > 0 && (
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-300 rounded-2xl p-4">
                <p className="font-semibold text-gray-800 mb-1">💌 来自家人的消息</p>
                <p className="text-sm text-gray-700">{unreadNudges[unreadNudges.length - 1].text}</p>
                <button onClick={() => setParentNudges(prev => prev.map(n => ({ ...n, read: true })))}
                  className="text-xs text-pink-600 mt-2 font-semibold">标记已读</button>
              </div>
            )}

            {/* Persistent low mood alert */}
            {persistentLowMood && (
              <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 rounded-2xl p-4">
                <p className="font-semibold text-gray-800 mb-1">💝 我注意到你最近心情不太好</p>
                <p className="text-sm text-gray-700 mb-3">连续几天心情低落是很常见的。如果你愿意，可以跟信任的大人聊聊。</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage('sos')} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold">紧急帮助</button>
                  <button onClick={() => setCurrentPage('peerstories')} className="flex-1 bg-purple-500 text-white py-2 rounded-lg text-sm font-semibold">伙伴故事</button>
                </div>
              </div>
            )}

            {/* Daily affirmation card */}
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-4 shadow">
              <p className="text-center text-gray-800 font-semibold">{todayAffirmation}</p>
            </div>

            {/* Smart quick access row */}
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage('moodinsights')} className="flex-1 bg-white rounded-xl p-3 shadow text-center hover:scale-105 transition">
                <span className="text-xl">📊</span><p className="text-xs text-gray-600 mt-1">心情洞察</p>
              </button>
              <button onClick={() => setCurrentPage('streakrewards')} className="flex-1 bg-white rounded-xl p-3 shadow text-center hover:scale-105 transition">
                <span className="text-xl">🏆</span><p className="text-xs text-gray-600 mt-1">成就奖励</p>
              </button>
              <button onClick={() => setCurrentPage('emotionvocab')} className="flex-1 bg-white rounded-xl p-3 shadow text-center hover:scale-105 transition">
                <span className="text-xl">🎭</span><p className="text-xs text-gray-600 mt-1">情绪词汇</p>
              </button>
              <button onClick={() => setCurrentPage('achievementshare')} className="flex-1 bg-white rounded-xl p-3 shadow text-center hover:scale-105 transition">
                <span className="text-xl">🎉</span><p className="text-xs text-gray-600 mt-1">分享成就</p>
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800">今日进度</h3>
                <div className="flex items-center gap-2"><Award className="w-5 h-5 text-yellow-500" /><span className="font-bold text-yellow-600">{points}分</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DAILY_ACTIVITIES.map((activity) => {
                  const Icon = activity.icon;
                  const done = dailyProgress[activity.id];
                  return (
                    <button key={activity.id} onClick={() => setCurrentPage(activity.page)}
                      className={`${activity.color} rounded-xl p-4 text-white relative overflow-hidden text-left hover:scale-105 transition ${done ? 'opacity-80' : ''}`}>
                      {done && <div className="absolute top-2 right-2 bg-white rounded-full p-1"><Star className="w-4 h-4 text-yellow-500 fill-current" /></div>}
                      <Icon className="w-8 h-8 mb-2" /><p className="font-semibold text-sm">{activity.title}</p><p className="text-xs opacity-80">{activity.duration}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                <div className="flex-1"><p className="text-sm opacity-90">连续打卡</p><p className="text-2xl font-bold">{streak} 天</p></div>
                <div className="text-right text-sm opacity-90"><p>{encouragement}</p></div>
              </div>
            </div>

            {moodHistory.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-3">最近心情</h3>
                <div className="flex gap-1 flex-wrap">
                  {moodHistory.slice(-14).map((h, i) => <span key={i} className="text-2xl" title={new Date(h.date).toLocaleDateString('zh-CN')}>{h.emoji}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Core Pages ── */}
        {currentPage === 'breathing' && <BreathingPage onComplete={() => completeActivity('breathing')} />}
        {currentPage === 'meditation' && <MeditationPage onComplete={() => completeActivity('meditation')} />}

        {currentPage === 'journal' && (
          <div className="p-6 space-y-5">
            <PageHeader emoji="📝" title="情绪日记" subtitle="写下你的感受，释放你的情绪" />
            <div className="bg-purple-100 rounded-xl p-4"><p className="text-sm text-purple-900">💭 今日提示：{journalPrompt}</p></div>
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <textarea value={currentJournal} onChange={(e) => setCurrentJournal(e.target.value)} placeholder="写下你的感受吧..."
                className="w-full h-40 p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none" />
              <button onClick={saveJournal} disabled={!currentJournal.trim()}
                className="w-full mt-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition">保存日记</button>
            </div>
            {journalEntries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-800">历史记录 ({journalEntries.length})</h3>
                {recentJournals.map((entry, revIdx) => {
                  const origIdx = journalEntries.length - 1 - revIdx;
                  return (
                    <div key={origIdx} className="bg-purple-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">{entry.date} {entry.time}</span>
                        <div className="flex items-center gap-2">
                          {entry.mood && <span className="text-2xl">{entry.mood.emoji}</span>}
                          <button onClick={() => setJournalEntries(prev => prev.filter((_, i) => i !== origIdx))} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{entry.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tools Hub ── */}
        {currentPage === 'tools' && (
          <div className="p-6 space-y-5">
            <PageHeader emoji="🧰" title="工具箱" subtitle="更多帮助你的小工具" />
            {TOOL_CATEGORIES.map(cat => {
              const catTools = cat.ids.map(id => TOOL_PAGES.find(t => t.id === id)).filter(Boolean);
              if (catTools.length === 0) return null;
              return (
                <div key={cat.name}>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">{cat.emoji} {cat.name}</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {catTools.map(tool => (
                      <button key={tool.id} onClick={() => setCurrentPage(tool.id)}
                        className={`bg-gradient-to-br ${tool.color} rounded-xl p-4 text-left hover:scale-105 transition shadow`}>
                        <div className="text-3xl mb-2">{tool.emoji}</div>
                        <p className="font-semibold text-sm text-gray-800">{tool.title}</p>
                        <p className="text-xs text-gray-600">{tool.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Tool Pages ── */}
        {currentPage === 'activity' && (
          <div className="p-6 space-y-5">
            <BackButton onClick={goTools} />
            <PageHeader emoji="⭐" title="快乐活动" subtitle="选一个让你开心的活动！" />
            <div className="grid grid-cols-2 gap-3">
              {HAPPY_ACTIVITIES.map((activity, idx) => (
                <button key={idx} onClick={() => completeActivity('activity')}
                  className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-5 hover:scale-105 transition shadow">
                  <div className="text-4xl mb-2">{activity.emoji}</div>
                  <p className="text-sm font-semibold text-gray-800">{activity.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'thought' && (
          <ThoughtCatcherPage entries={thoughtEntries} onSave={e => { setThoughtEntries(prev => [...prev, e]); setPoints(p => p + 15); }} onBack={goTools} />
        )}
        {currentPage === 'gratitude' && (
          <GratitudePage entries={gratitudeEntries} onSave={e => { setGratitudeEntries(prev => [...prev, e]); setPoints(p => p + 10); }} onBack={goTools} />
        )}
        {currentPage === 'activation' && (
          <ActivationPage log={activationLog} onComplete={e => { setActivationLog(prev => [...prev, e]); setPoints(p => p + (e.difficulty === 'easy' ? 5 : e.difficulty === 'medium' ? 10 : 20)); }} onBack={goTools} />
        )}
        {currentPage === 'psychoedu' && <PsychoeduPage onBack={goTools} />}
        {currentPage === 'safety' && <SafetyPlanPage plan={safetyPlan} onSave={setSafetyPlan} onBack={goTools} />}
        {currentPage === 'social' && (
          <SocialPage log={socialLog} onSave={e => { setSocialLog(prev => [...prev, e]); setPoints(p => p + 10); }} onBack={goTools} />
        )}
        {currentPage === 'sleep' && (
          <SleepPage log={sleepLog} onSave={e => { setSleepLog(prev => [...prev, e]); setPoints(p => p + 5); }} onBack={goTools} />
        )}
        {currentPage === 'bodyscan' && <BodyScanPage onBack={goTools} />}
        {currentPage === 'affirmation' && <AffirmationPage favorites={affirmationFavs} onToggleFav={toggleAffirmationFav} onBack={goTools} />}
        {currentPage === 'parent' && (
          <ParentDashboard moodHistory={moodHistory} journalEntries={journalEntries} sleepLog={sleepLog}
            socialLog={socialLog} activationLog={activationLog} streak={streak} points={points} onBack={goTools} />
        )}
        {currentPage === 'moodchart' && <MoodChartPage moodHistory={moodHistory} activationLog={activationLog} onBack={goTools} />}
        {currentPage === 'worrybox' && (
          <WorryBoxPage entries={worryEntries} onSave={e => { setWorryEntries(prev => [...prev, e]); setPoints(p => p + 5); }} onBack={goTools} />
        )}
        {currentPage === 'strengths' && <StrengthsFinderPage strengths={strengths} onSave={setStrengths} onBack={goTools} />}
        {currentPage === 'emotions' && (
          <EmotionBuilderPage log={emotionLog} onSave={next => { setEmotionLog(next); if (next.length > emotionLog.length) setPoints(p => p + 3); }} onBack={goTools} />
        )}
        {currentPage === 'rewards' && (
          <RewardStorePage points={points} purchased={purchasedRewards}
            onPurchase={(id, cost) => { setPurchasedRewards(prev => [...prev, id]); setPoints(p => p - cost); }} onBack={goTools} />
        )}
        {currentPage === 'problemsolve' && (
          <ProblemSolvingPage entries={problemEntries} onSave={e => { setProblemEntries(prev => [...prev, e]); setPoints(p => p + 15); }} onBack={goTools} />
        )}
        {currentPage === 'peerstories' && <PeerStoriesPage onBack={goTools} />}
        {currentPage === 'parentchild' && <ParentChildPage onBack={goTools} />}
        {currentPage === 'nature' && (
          <NaturePage log={natureLog} onSave={e => { setNatureLog(prev => [...prev, e]); setPoints(p => p + e.points); }} onBack={goTools} />
        )}
        {currentPage === 'therapist' && (
          <TherapistBridgePage moodHistory={moodHistory} journalEntries={journalEntries} sleepLog={sleepLog}
            activationLog={activationLog} socialLog={socialLog} streak={streak} points={points} onBack={goTools} />
        )}
        {currentPage === 'routine' && <RoutineBuilderPage routine={routineData} onSave={setRoutineData} onBack={goTools} />}
        {currentPage === 'thermometer' && (
          <EmotionThermometerPage log={thermometerLog} onSave={e => { setThermometerLog(prev => [...prev, e]); setPoints(p => p + 5); }} onBack={goTools} />
        )}
        {currentPage === 'coping' && <CopingCardsPage onBack={goTools} />}
        {currentPage === 'jar' && (
          <AchievementJarPage achievements={achievements} onSave={a => { setAchievements(a); if (a.length > achievements.length) setPoints(p => p + 5); }} onBack={goTools} />
        )}
        {currentPage === 'compassion' && <SelfCompassionPage onBack={goTools} />}
        {currentPage === 'goals' && <GoalStonesPage goals={goalData} onSave={setGoalData} onBack={goTools} />}
        {currentPage === 'grounding' && <SensoryGroundingPage onBack={goTools} />}
        {currentPage === 'predict' && (
          <MoodPredictionPage predictions={moodPredictions} onSave={setMoodPredictions} onBack={goTools} />
        )}
        {currentPage === 'kindness' && (
          <KindnessPage log={kindnessLog} onSave={l => { setKindnessLog(l); if (l.length > kindnessLog.length) setPoints(p => p + 10); }} onBack={goTools} />
        )}
        {currentPage === 'weekreview' && (
          <WeeklyReviewPage moodHistory={moodHistory} journalEntries={journalEntries} activationLog={activationLog}
            points={points} reviews={weeklyReviews} onSave={setWeeklyReviews} onBack={goTools} />
        )}
        {currentPage === 'storycreator' && (
          <StoryCreatorPage stories={storyEntries} onSave={s => { setStoryEntries(s); if (s.length > storyEntries.length) setPoints(p => p + 15); }} onBack={goTools} />
        )}
        {currentPage === 'playlist' && <MoodPlaylistPage playlists={playlistData} onSave={setPlaylistData} onBack={goTools} />}
        {currentPage === 'pet' && <VirtualPetPage pet={petData} onSave={setPetData} onBack={goTools} />}
        {currentPage === 'values' && <ValuesCompassPage values={valuesData} onSave={setValuesData} onBack={goTools} />}
        {currentPage === 'timecapsule' && (
          <TimeCapsulePage capsules={capsules} onSave={c => { setCapsules(c); if (c.length > capsules.length) setPoints(p => p + 10); }} onBack={goTools} />
        )}
        {currentPage === 'volcano' && <AngerVolcanoPage onBack={goTools} />}
        {currentPage === 'worrysorter' && <WorrySorterPage sorted={worrySorted} onSave={setWorrySorted} onBack={goTools} />}
        {currentPage === 'movement' && <MindfulMovementPage onBack={goTools} />}
        {currentPage === 'detective' && (
          <EmotionDetectivePage cases={detectiveCases} onSave={c => { setDetectiveCases(c); if (c.length > detectiveCases.length) setPoints(p => p + 10); }} onBack={goTools} />
        )}
        {currentPage === 'celebration' && <CelebrationWallPage wall={celebrationWall} onSave={setCelebrationWall} onBack={goTools} />}
        {currentPage === 'drawboard' && (
          <DrawingBoardPage gallery={drawingGallery} onSave={g => { setDrawingGallery(g); if (g.length > drawingGallery.length) setPoints(p => p + 10); }} onBack={goTools} />
        )}
        {currentPage === 'bodymap' && (
          <BodyEmotionMapPage maps={bodyEmotionMaps} onSave={setBodyEmotionMaps} onBack={goTools} />
        )}
        {currentPage === 'traps' && (
          <ThinkingTrapsPage caught={thinkingTrapsCaught} onSave={c => { setThinkingTrapsCaught(c); if (c.length > thinkingTrapsCaught.length) setPoints(p => p + 10); }} onBack={goTools} />
        )}
        {currentPage === 'fearladder' && <FearLadderPage ladders={fearLadders} onSave={setFearLadders} onBack={goTools} />}
        {currentPage === 'gratitudeletter' && (
          <GratitudeLetterPage letters={gratitudeLetters} onSave={l => { setGratitudeLetters(l); if (l.length > gratitudeLetters.length) setPoints(p => p + 15); }} onBack={goTools} />
        )}
        {currentPage === 'firstaid' && (
          <FirstAidKitPage kit={firstAidKit} onSave={setFirstAidKit} allTools={TOOL_PAGES} onBack={goTools} onNavigate={setCurrentPage} />
        )}
        {currentPage === 'dreamjournal' && (
          <DreamJournalPage dreams={dreamJournal} onSave={d => { setDreamJournal(d); if (d.length > dreamJournal.length) setPoints(p => p + 5); }} onBack={goTools} />
        )}
        {currentPage === 'mindfuleat' && (
          <MindfulEatingPage log={mindfulEatingLog} onSave={l => { setMindfulEatingLog(l); if (l.length > mindfulEatingLog.length) setPoints(p => p + 10); }} onBack={goTools} />
        )}
        {currentPage === 'compliments' && (
          <ComplimentChainPage chain={complimentChain} onSave={c => { setComplimentChain(c); if (c.length > complimentChain.length) setPoints(p => p + 5); }} onBack={goTools} />
        )}
        {currentPage === 'safeplace' && <SafePlacePage place={safePlace} onSave={setSafePlace} onBack={goTools} />}

        {/* ── Help ── */}
        {currentPage === 'morningroutine' && (
          <MorningRoutinePage routine={morningRoutine} onSave={r => { setMorningRoutine(r); setPoints(p => p + 15); }} onBack={goTools} userName={userName} />
        )}
        {currentPage === 'eveningroutine' && (
          <EveningRoutinePage routine={eveningRoutine} onSave={r => { setEveningRoutine(r); setPoints(p => p + 15); }} onBack={goTools} userName={userName} />
        )}
        {currentPage === 'streakrewards' && (
          <StreakRewardsPage streak={streak} points={points} ownedAccessories={ownedAccessories} equippedAccessory={equippedAccessory}
            onBuy={(id, cost) => { setOwnedAccessories(prev => [...prev, id]); setPoints(p => p - cost); }}
            onEquip={id => setEquippedAccessory(prev => prev === id ? null : id)}
            onBack={goTools} />
        )}
        {currentPage === 'moodinsights' && (
          <MoodInsightsPage moodHistory={moodHistory} toolUsageLog={toolUsageLog} onBack={goTools} />
        )}
        {currentPage === 'emotionvocab' && (
          <EmotionVocabPage unlockedLevel={unlockedEmotionLevel} moodHistory={moodHistory} onBack={goTools} />
        )}
        {currentPage === 'parentnudge' && (
          <ParentNudgePage nudges={parentNudges} onSend={text => setParentNudges(prev => [...prev, { text, time: new Date().toLocaleString('zh-CN') }])} onBack={goTools} />
        )}
        {currentPage === 'therapistreport' && (
          <TherapistReportPage moodHistory={moodHistory} toolUsageLog={toolUsageLog} journalEntries={journalEntries} sleepLog={sleepLog} streak={streak} onBack={goTools} />
        )}
        {currentPage === 'achievementshare' && (
          <AchievementSharePage streak={streak} points={points} achievements={achievements} moodHistory={moodHistory}
            onShare={text => setSharedAchievements(prev => [...prev, { text, date: new Date().toLocaleString('zh-CN') }])} onBack={goTools} />
        )}

        {currentPage === 'sos' && (
          <div className="p-6 space-y-5">
            <BackButton onClick={() => setCurrentPage('home')} />
            <div className="text-center">
              <div className="text-5xl mb-2">🆘</div>
              <h2 className="text-2xl font-bold text-red-600">紧急帮助</h2>
              <p className="text-gray-600 mt-1">深呼吸，我在这里陪你</p>
            </div>

            <button onClick={() => setCurrentPage('breathing')}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-2xl p-5 shadow-lg text-left hover:scale-102 transition">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌬️</span>
                <div><p className="font-bold text-lg">立刻呼吸</p><p className="text-sm opacity-90">4-4-4 呼吸法，马上平静下来</p></div>
              </div>
            </button>

            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-5 shadow">
              <h3 className="font-bold text-gray-800 mb-3">🌍 5-4-3-2-1 着陆练习</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">👀 说出你看到的 <b>5</b> 样东西</p>
                <p className="text-gray-700">✋ 摸一摸 <b>4</b> 样东西</p>
                <p className="text-gray-700">👂 听 <b>3</b> 种声音</p>
                <p className="text-gray-700">👃 闻 <b>2</b> 种气味</p>
                <p className="text-gray-700">👅 尝 <b>1</b> 种味道</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-5 shadow">
              <h3 className="font-bold text-gray-800 mb-3">💚 对自己说</h3>
              <div className="space-y-2">
                <p className="text-center text-gray-700 font-semibold">"这种感觉会过去的"</p>
                <p className="text-center text-gray-700 font-semibold">"我很安全"</p>
                <p className="text-center text-gray-700 font-semibold">"我不是一个人"</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3"><Phone className="w-5 h-5 text-green-600" /> 求助热线</h3>
              <div className="space-y-3">
                {HOTLINES.map(h => (
                  <div key={h.number} className="bg-green-50 rounded-xl p-3">
                    <p className="font-semibold text-sm text-gray-800">{h.name}</p>
                    <p className="text-lg font-bold text-green-700">{h.number}</p>
                    <p className="text-xs text-gray-500">{h.hours}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCurrentPage('grounding')} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold">感官着陆</button>
              <button onClick={() => setCurrentPage('coping')} className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold">应急卡片</button>
              <button onClick={() => setCurrentPage('safeplace')} className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-semibold">安全基地</button>
            </div>
          </div>
        )}

        {currentPage === 'help' && (
          <div className="p-6 space-y-5">
            <PageHeader emoji="❤️" title="我需要帮助" subtitle="你不是一个人，总有人愿意倾听" />
            <div className="bg-gradient-to-br from-red-100 to-pink-100 border-2 border-red-200 rounded-2xl p-5">
              <h3 className="font-bold text-gray-800 mb-3">💝 你可以这样做</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 告诉信任的爸爸妈妈、老师或家人</li>
                <li>• 深呼吸，试试呼吸练习</li>
                <li>• 写下你的感受在日记里</li>
                <li>• 做一件让你开心的小事</li>
                <li>• 记住：这种感觉会过去的</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Phone className="w-5 h-5 text-green-600" /> 心理援助热线</h3>
              <div className="space-y-3">
                {HOTLINES.map(h => (
                  <div key={h.number} className="bg-green-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-800">{h.name}</p>
                    <p className="text-lg font-bold text-green-700">{h.number}</p>
                    <p className="text-xs text-gray-600">{h.hours}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-5">
              <p className="text-center text-gray-800 font-semibold">🌈 你值得被爱和关心</p>
              <p className="text-center text-sm text-gray-600 mt-2">无论发生什么，你都是特别的、重要的。</p>
            </div>
          </div>
        )}
      </div>

      {/* ── SOS Floating Button ── */}
      {currentPage !== 'sos' && currentPage !== 'help' && (
        <button onClick={() => setCurrentPage('sos')}
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center z-20 hover:scale-110 transition animate-pulse"
          title="紧急帮助">
          <span className="text-white text-2xl">🆘</span>
        </button>
      )}

      {/* ── Bottom Navigation ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around py-2 px-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id || (tab.id === 'tools' && TOOL_PAGES.some(t => t.id === currentPage));
          return (
            <button key={tab.id} onClick={() => setCurrentPage(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${isActive ? tab.activeClass : 'text-gray-500'}`}>
              <Icon className="w-6 h-6" /><span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
