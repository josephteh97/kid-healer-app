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
  { name: '青少年心理援助热线', number: '12355', hours: '周一至周日' },
  { name: 'Samaritans of Singapore (SOS)', number: '1-767', hours: '24小时' }
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
  { name: '放松与正念', emoji: '🧘', ids: ['bodyscan', 'grounding', 'movement', 'safeplace', 'mindfuleat', 'musclerelax', 'mindfulmovement', 'calmdownmenu', 'bodycoping', 'observer', 'breathinggame', 'mindfullistening', 'calmbuddy', 'sensorycountdown', 'emotionjar', 'worryballoon'] },
  { name: '情绪认知', emoji: '🎭', ids: ['emotions', 'thermometer', 'bodymap', 'detective', 'moodchart', 'emotioncharades', 'emotionforecast', 'archaeology', 'feelingsforecast', 'vocabstory', 'emotionmapquest', 'feelingstranslator', 'mooddj', 'emotionvolume', 'feelingsmask', 'orchestra', 'abcdiary'] },
  { name: '思维训练', emoji: '🧠', ids: ['thought', 'traps', 'worrybox', 'worrysorter', 'predict', 'worrytime', 'growthmindset', 'selftalk', 'responsibilitypie', 'decisioncompass', 'thoughtbubbles', 'vendingmachine', 'shrinkray'] },
  { name: '积极行动', emoji: '🌟', ids: ['activation', 'activity', 'kindness', 'goals', 'routine', 'couragetracker', 'habitstack', 'scavengerhunt', 'microkindness', 'awe', 'couragecoin', 'dailywins', 'feelingsbingo', 'kindnessripple'] },
  { name: '自我成长', emoji: '🌱', ids: ['strengths', 'values', 'fearladder', 'problemsolve', 'psychoedu', 'memoryvault', 'skilltree', 'strengthshield', 'permissionslip', 'tradingcards', 'mirrorchallenge'] },
  { name: '创意表达', emoji: '🎨', ids: ['drawboard', 'storycreator', 'playlist', 'dreamjournal', 'timecapsule', 'futureletter', 'moodcollage'] },
  { name: '感恩与关爱', emoji: '💖', ids: ['gratitude', 'gratitudeletter', 'compassion', 'compliments', 'affirmation', 'hopejar', 'gratitudechain', 'praisejar', 'boomerang', 'gratitudeglasses'] },
  { name: '社交与支持', emoji: '👫', ids: ['social', 'peerstories', 'parentchild', 'pet', 'nature', 'socialroleplay', 'sensorytoolkit', 'supportnetwork', 'boundaries', 'conflictresolve', 'empathyglasses', 'connectioncards', 'friendshiprecipe', 'solarsystem'] },
  { name: '每日仪式', emoji: '☀️', ids: ['morningroutine', 'eveningroutine', 'routine', 'sleepcoach', 'moodinsights', 'morningcompass', 'dailyanchor'] },
  { name: '成长计划', emoji: '📅', ids: ['program', 'storyjourney', 'dailychallenge', 'streakrewards', 'milestones', 'screening'] },
  { name: '应急与安全', emoji: '🛡️', ids: ['coping', 'firstaid', 'safety', 'volcano', 'sleep', 'offlinecard', 'emotionalcpr', 'safepersoncards', 'comfortmenu', 'safesignals'] },
  { name: '记录与回顾', emoji: '📊', ids: ['jar', 'celebration', 'weekreview', 'rewards', 'achievementshare', 'timeline', 'copingreport', 'accomplishments', 'emotiontimecapsule'] },
  { name: '家长与支持', emoji: '👨‍👩‍👧', ids: ['parent', 'parentnudge', 'parentedu', 'familyboard', 'therapistreport', 'counselor', 'emotionvocab'] }
];

// ─── 8-Week Guided Program ───────────────────────────────────────────────────
const PROGRAM_WEEKS = [
  { week: 1, title: '认识情绪', emoji: '🌱', desc: '了解什么是情绪，学会给感受命名',
    lessons: ['情绪是什么？每个人都有情绪，它们是你内心的信号。', '给情绪起名字：开心、难过、焦虑、生气、平静...', '情绪没有好坏之分，每种感受都是正常的。'],
    tools: ['emotions', 'thermometer', 'bodymap'], goal: '每天记录一次心情' },
  { week: 2, title: '呼吸与放松', emoji: '🌬️', desc: '学习用呼吸和身体放松来平静自己',
    lessons: ['当我们紧张时，身体会变僵硬、呼吸变浅。', '4-4-4呼吸法：吸气4秒→屏住4秒→呼气4秒。', '身体放松：从脚趾开始，一点一点放松每个部位。'],
    tools: ['breathing', 'bodyscan', 'movement'], goal: '完成3次呼吸练习' },
  { week: 3, title: '想法与感受', emoji: '💭', desc: '发现想法如何影响你的感受',
    lessons: ['同样的事情，不同的想法会带来不同的感受。', '比如下雨了：想"糟糕"会难过，想"可以踩水坑"会开心。', '"想法捕捉器"帮你看清自己的想法。'],
    tools: ['thought', 'traps', 'detective'], goal: '捕捉3个想法' },
  { week: 4, title: '感恩与善良', emoji: '🙏', desc: '发现生活中的美好，学会善待自己和他人',
    lessons: ['每天找到一件值得感恩的小事。', '对自己温柔：犯错没关系，你正在学习。', '做一件善意的小事，会让你和别人都开心。'],
    tools: ['gratitude', 'compassion', 'kindness'], goal: '写3件感恩的事' },
  { week: 5, title: '解决问题', emoji: '🔧', desc: '学习面对困难的方法',
    lessons: ['遇到问题先深呼吸，不要着急。', '想出3个可能的解决办法，选一个试试。', '如果不行，再试另一个。寻求帮助也是一种办法！'],
    tools: ['problemsolve', 'worrysorter', 'coping'], goal: '解决1个小问题' },
  { week: 6, title: '社交连接', emoji: '👫', desc: '学习和别人建立好的关系',
    lessons: ['每个人都需要朋友和家人的支持。', '倾听别人，分享感受，是建立友谊的好方法。', '如果觉得孤独，试试跟一个信任的人聊聊。'],
    tools: ['social', 'parentchild', 'compliments'], goal: '和1个人分享感受' },
  { week: 7, title: '发现优势', emoji: '💪', desc: '找到你的闪光点和价值观',
    lessons: ['每个人都有独特的优势和才华。', '你的价值不取决于成绩或别人的评价。', '做你觉得重要的事，就是有意义的。'],
    tools: ['strengths', 'values', 'fearladder'], goal: '找到3个优势' },
  { week: 8, title: '继续前行', emoji: '🌈', desc: '回顾成长，规划未来',
    lessons: ['回顾这8周，你学到了很多！', '记住：难过的时候有工具可以帮助你。', '你比你想象的更坚强。继续前行！💪'],
    tools: ['weekreview', 'timecapsule', 'celebration'], goal: '写一封给未来的信' }
];

// ─── Risk Screening ──────────────────────────────────────────────────────────
const SCREENING_QUESTIONS = [
  { id: 'interest', text: '最近两周，你对做事情还有兴趣吗？', options: ['经常有兴趣', '有时有', '很少有', '几乎没有'] },
  { id: 'mood', text: '最近两周，你经常感到难过或不开心吗？', options: ['几乎没有', '有时候', '经常', '几乎每天'] },
  { id: 'sleep', text: '最近两周，你的睡眠怎么样？', options: ['睡得好', '有时睡不好', '经常睡不好', '几乎每天睡不好'] },
  { id: 'energy', text: '最近两周，你觉得累或没有精力吗？', options: ['不觉得', '有时候', '经常', '几乎每天'] },
  { id: 'worth', text: '你觉得自己是个好孩子吗？', options: ['是的', '大部分时候', '有时不确定', '经常觉得不是'] }
];

// ─── Sleep Coach ─────────────────────────────────────────────────────────────
const SLEEP_TIPS = [
  { emoji: '📱', tip: '睡前1小时不看手机和平板', why: '屏幕蓝光会让大脑以为还是白天' },
  { emoji: '🛁', tip: '洗个温暖的澡', why: '温水能帮助身体放松' },
  { emoji: '📖', tip: '看一本轻松的书', why: '阅读能帮助大脑安静下来' },
  { emoji: '🌡️', tip: '房间保持凉爽', why: '稍微凉一点的温度更容易入睡' },
  { emoji: '⏰', tip: '每天同一时间睡觉和起床', why: '规律作息让身体形成习惯' },
  { emoji: '🍫', tip: '睡前不喝含糖饮料', why: '糖分会让你更兴奋' }
];

const WIND_DOWN_ACTIVITIES = [
  { emoji: '🌬️', name: '腹式呼吸', duration: '3分钟' },
  { emoji: '🧘', name: '身体扫描', duration: '5分钟' },
  { emoji: '📝', name: '感恩日记', duration: '2分钟' },
  { emoji: '🎵', name: '轻柔音乐', duration: '10分钟' },
  { emoji: '🌙', name: '想象安全基地', duration: '5分钟' }
];

// ─── Story Journey ───────────────────────────────────────────────────────────
const STORY_WORLD = {
  character: { name: '小星星', emoji: '⭐', desc: '一颗迷路的小星星，需要你帮它找回光芒' },
  chapters: [
    { id: 1, title: '发现小星星', emoji: '🌑', desc: '一颗暗淡的星星掉到了地上', unlockTools: 3, reward: '小星星开始发出微光' },
    { id: 2, title: '学会呼吸', emoji: '🌬️', desc: '教小星星如何平静下来', unlockTools: 8, reward: '小星星的光变亮了一点' },
    { id: 3, title: '理解感受', emoji: '💭', desc: '小星星学会了认识自己的情绪', unlockTools: 15, reward: '小星星开始闪烁' },
    { id: 4, title: '交到朋友', emoji: '🤝', desc: '小星星遇到了其他星星朋友', unlockTools: 25, reward: '天空中多了几颗星星' },
    { id: 5, title: '克服困难', emoji: '🏔️', desc: '一场暴风雨来了，小星星要勇敢', unlockTools: 35, reward: '暴风雨过后，星空更美了' },
    { id: 6, title: '发现力量', emoji: '💪', desc: '小星星发现自己的独特力量', unlockTools: 45, reward: '小星星变成了最亮的星' },
    { id: 7, title: '回到天空', emoji: '🌟', desc: '小星星终于飞回了天空', unlockTools: 55, reward: '夜空被小星星照亮了' },
    { id: 8, title: '守护者', emoji: '🌌', desc: '小星星成为了守护其他星星的星', unlockTools: 65, reward: '你帮助小星星完成了旅程！' }
  ]
};

// ─── Micro-Moments ───────────────────────────────────────────────────────────
const MICRO_MOMENTS = [
  { hour: 8, emoji: '☀️', prompt: '早上好！深呼吸3次，开始新的一天', action: 'breathe' },
  { hour: 10, emoji: '💪', prompt: '上午加油！你现在精力怎么样？(1-5)', action: 'energy' },
  { hour: 12, emoji: '🍎', prompt: '午餐时间！慢慢吃，感受食物的味道', action: 'mindful' },
  { hour: 14, emoji: '🌿', prompt: '下午了！看看窗外，说出3样你看到的东西', action: 'ground' },
  { hour: 16, emoji: '⭐', prompt: '今天发生了什么好事？哪怕很小的也算', action: 'gratitude' },
  { hour: 20, emoji: '🌙', prompt: '准备休息了！回顾今天，给自己一个拥抱', action: 'review' }
];

// ─── Parent Education ────────────────────────────────────────────────────────
const PARENT_LESSONS = [
  { id: 'validate', emoji: '💗', title: '如何倾听和认可', content: [
    '✅ 说："我理解你很难过，这种感觉是正常的"',
    '✅ 说："谢谢你告诉我你的感受"',
    '✅ 说："我在这里陪你"',
    '❌ 不要说："别哭了，有什么好哭的"',
    '❌ 不要说："你看别人都没事"',
    '❌ 不要说："想开点就好了"'
  ]},
  { id: 'signs', emoji: '🔍', title: '识别抑郁信号', content: [
    '持续2周以上的情绪低落',
    '对以前喜欢的事情失去兴趣',
    '食欲明显增加或减少',
    '睡眠问题（失眠或嗜睡）',
    '说"我没用""没人喜欢我"等话',
    '远离朋友、不想上学',
    '⚠️ 如果出现3个以上信号，请咨询专业人士'
  ]},
  { id: 'help', emoji: '🏥', title: '何时寻求专业帮助', content: [
    '情绪问题持续超过2周',
    '影响到学习、社交或日常生活',
    '有自伤想法或行为',
    '你作为家长感到无法帮助',
    '💡 寻求帮助不是软弱，而是负责任的表现',
    '📞 可以先咨询学校心理老师或拨打心理热线'
  ]},
  { id: 'daily', emoji: '🌈', title: '日常可以做的事', content: [
    '每天花15分钟专注陪伴（放下手机）',
    '一起做一件开心的事（散步、画画、做饭）',
    '睡前聊聊天："今天有什么想跟我说的吗？"',
    '表扬努力，而不只是结果',
    '保持规律的作息和饮食',
    '自己也要照顾好自己的情绪'
  ]},
  { id: 'communicate', emoji: '🗣️', title: '有效沟通技巧', content: [
    '用"我"开头而不是"你"："我担心你"而不是"你怎么回事"',
    '问开放式问题："今天怎么样？"而不是"今天好不好？"',
    '给孩子选择权："你想先写作业还是先休息？"',
    '避免在情绪激动时谈重要话题',
    '肢体语言：蹲下来平视孩子，温柔的眼神',
    '耐心等待，不催促孩子说话'
  ]}
];

// ─── Reward Milestones ───────────────────────────────────────────────────────
const MILESTONE_REWARDS = [
  { points: 50, emoji: '🌱', title: '小小探索者', reward: '解锁"大自然"主题背景' },
  { points: 100, emoji: '🌿', title: '成长小卫士', reward: '获得"勇气勋章"' },
  { points: 200, emoji: '🌳', title: '情绪小达人', reward: '解锁"星空"主题背景' },
  { points: 500, emoji: '⭐', title: '心灵守护者', reward: '获得"荣誉证书"（可打印）' },
  { points: 1000, emoji: '🏆', title: '超级英雄', reward: '获得"阳光小屋毕业证书"' }
];

// ─── Simplified Mode ─────────────────────────────────────────────────────────
const SIMPLIFIED_TOOLS = ['breathing', 'thought', 'gratitude', 'compassion', 'grounding', 'pet', 'coping', 'safeplace'];

// ─── Daily Challenges ────────────────────────────────────────────────────────
const DAILY_CHALLENGES = [
  { emoji: '😊', text: '今天对一个人微笑', category: 'social' },
  { emoji: '🎨', text: '画一样让你开心的东西', category: 'creative' },
  { emoji: '🙏', text: '跟一个人说"谢谢"', category: 'gratitude' },
  { emoji: '🌿', text: '到外面走5分钟', category: 'nature' },
  { emoji: '💪', text: '做3次深呼吸', category: 'relaxation' },
  { emoji: '📝', text: '写下今天最好的一件事', category: 'journaling' },
  { emoji: '🤗', text: '给家人一个拥抱', category: 'social' },
  { emoji: '🎵', text: '听一首让你开心的歌', category: 'creative' },
  { emoji: '⭐', text: '说出自己的一个优点', category: 'selfesteem' },
  { emoji: '🧘', text: '闭眼安静坐1分钟', category: 'relaxation' },
  { emoji: '💌', text: '给朋友写一句鼓励的话', category: 'social' },
  { emoji: '🌈', text: '找到5样你喜欢的颜色的东西', category: 'mindfulness' },
  { emoji: '📖', text: '读一个你喜欢的故事', category: 'creative' },
  { emoji: '🐾', text: '观察一只小动物5分钟', category: 'mindfulness' },
  { emoji: '☀️', text: '对着镜子对自己笑', category: 'selfesteem' },
  { emoji: '🍎', text: '慢慢吃一样东西，感受味道', category: 'mindfulness' },
  { emoji: '💗', text: '对自己说"我今天做得很好"', category: 'selfesteem' },
  { emoji: '🌻', text: '帮家人做一件小事', category: 'kindness' },
  { emoji: '🧸', text: '抱一样让你安心的东西', category: 'comfort' },
  { emoji: '✨', text: '想象一个让你开心的地方', category: 'relaxation' },
  { emoji: '👀', text: '仔细看看天空，说出你看到什么', category: 'mindfulness' },
  { emoji: '🎯', text: '完成一件小事情', category: 'activation' },
  { emoji: '🌙', text: '睡前想3件今天感谢的事', category: 'gratitude' },
  { emoji: '🤝', text: '和一个同学聊5分钟', category: 'social' },
  { emoji: '🏃', text: '做10个开合跳', category: 'movement' },
  { emoji: '🎭', text: '对着镜子做5个不同的表情', category: 'emotion' },
  { emoji: '🗣️', text: '告诉家人你今天的感受', category: 'communication' },
  { emoji: '🌊', text: '想象你是一片平静的海洋', category: 'relaxation' },
  { emoji: '🦋', text: '找到一样你从没注意过的东西', category: 'mindfulness' },
  { emoji: '💎', text: '在日记里画一个你的心情符号', category: 'journaling' }
];

// ─── Seasonal Content ────────────────────────────────────────────────────────
const SEASONAL_CONTENT = {
  exam: { title: '考试季减压', emoji: '📝', desc: '考试快到了？别紧张，试试这些', tools: ['breathing', 'grounding', 'thought', 'coping', 'affirmation'],
    tips: ['考试不代表你的全部价值', '深呼吸可以帮助你集中注意力', '休息好比熬夜更有效'] },
  summer: { title: '暑假好心情', emoji: '☀️', desc: '假期也要保持规律哦', tools: ['nature', 'activity', 'routine', 'social', 'kindness'],
    tips: ['保持规律作息', '每天出门活动', '学一样新东西'] },
  winter: { title: '冬日温暖', emoji: '❄️', desc: '天冷了，更要照顾好自己', tools: ['compassion', 'safeplace', 'pet', 'gratitude', 'parentchild'],
    tips: ['多晒太阳', '喝杯热饮', '和家人一起做温暖的事'] },
  backtoschool: { title: '开学季', emoji: '🎒', desc: '新学期，新开始', tools: ['fearladder', 'social', 'goals', 'routine', 'affirmation'],
    tips: ['紧张是正常的', '找一个小目标', '记住你不是一个人'] },
  holiday: { title: '节日快乐', emoji: '🎉', desc: '节日期间照顾好心情', tools: ['gratitude', 'familyboard', 'parentchild', 'celebration', 'kindness'],
    tips: ['享受和家人在一起的时间', '不用跟别人比较', '做让自己开心的事'] }
};

// ─── Concerning Keywords (for journal safety check) ──────────────────────────
const CONCERN_KEYWORDS = ['不想活', '想死', '消失', '没有用', '活着没意思', '伤害自己', '太痛苦', '受不了了', '世界没有我', '不如死'];

// ─── Weather Mood Suggestions ────────────────────────────────────────────────
const WEATHER_MOODS = [
  { weather: '晴天', emoji: '☀️', suggestion: '阳光真好！去外面走走吧', tools: ['nature', 'activity', 'kindness'] },
  { weather: '雨天', emoji: '🌧️', suggestion: '下雨天适合安静地做些室内活动', tools: ['meditation', 'drawboard', 'storycreator'] },
  { weather: '阴天', emoji: '☁️', suggestion: '阴天也有它的美，试试这些放松活动', tools: ['breathing', 'bodyscan', 'mindfuleat'] }
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
  { id: 'achievementshare', emoji: '🎉', title: '分享成就', color: 'from-orange-100 to-yellow-100', desc: '展示进步' },
  { id: 'program', emoji: '📅', title: '8周计划', color: 'from-purple-100 to-pink-100', desc: 'CBT课程' },
  { id: 'screening', emoji: '📋', title: '心情体检', color: 'from-blue-100 to-cyan-100', desc: '定期评估' },
  { id: 'sleepcoach', emoji: '😴', title: '睡眠教练', color: 'from-indigo-100 to-purple-100', desc: '好好睡觉' },
  { id: 'storyjourney', emoji: '⭐', title: '星星旅程', color: 'from-indigo-100 to-blue-100', desc: '故事冒险' },
  { id: 'parentedu', emoji: '📚', title: '家长课堂', color: 'from-pink-100 to-rose-100', desc: '学习支持' },
  { id: 'familyboard', emoji: '🏡', title: '家庭留言', color: 'from-rose-100 to-pink-100', desc: '温暖留言' },
  { id: 'milestones', emoji: '🎖️', title: '里程碑', color: 'from-yellow-100 to-amber-100', desc: '积分奖励' },
  { id: 'dailychallenge', emoji: '🎯', title: '每日挑战', color: 'from-orange-100 to-yellow-100', desc: '一个小任务' },
  { id: 'timeline', emoji: '📈', title: '成长时间线', color: 'from-green-100 to-emerald-100', desc: '看到变化' },
  { id: 'counselor', emoji: '🏫', title: '咨询师看板', color: 'from-blue-100 to-cyan-100', desc: '专业报告' },
  { id: 'offlinecard', emoji: '🪪', title: '紧急卡片', color: 'from-red-100 to-pink-100', desc: '随身携带' },
  { id: 'socialroleplay', emoji: '🎭', title: '社交练习', color: 'from-purple-100 to-pink-100', desc: '角色扮演' },
  { id: 'growthmindset', emoji: '🌱', title: '成长思维', color: 'from-green-100 to-emerald-100', desc: '大脑成长' },
  { id: 'memoryvault', emoji: '💎', title: '快乐记忆', color: 'from-yellow-100 to-amber-100', desc: '收藏美好' },
  { id: 'sensorytoolkit', emoji: '🧸', title: '感官安慰', color: 'from-pink-100 to-rose-100', desc: '五感舒缓' },
  { id: 'emotioncharades', emoji: '🎮', title: '情绪猜猜', color: 'from-violet-100 to-purple-100', desc: '游戏学习' },
  { id: 'futureletter', emoji: '💌', title: '给未来的信', color: 'from-indigo-100 to-blue-100', desc: '寄给未来' },
  { id: 'mindfulmovement', emoji: '💃', title: '快乐律动', color: 'from-green-100 to-teal-100', desc: '动起来' },
  { id: 'worrytime', emoji: '🕐', title: '烦恼时间', color: 'from-blue-100 to-indigo-100', desc: '定时处理' },
  { id: 'couragetracker', emoji: '🦁', title: '勇气追踪', color: 'from-orange-100 to-yellow-100', desc: '记录勇敢' },
  { id: 'musclerelax', emoji: '🧘', title: '全身放松', color: 'from-blue-100 to-green-100', desc: '渐进放松' },
  { id: 'selftalk', emoji: '🗣️', title: '积极对话', color: 'from-green-100 to-emerald-100', desc: '转变想法' },
  { id: 'supportnetwork', emoji: '🗺️', title: '支持网络', color: 'from-blue-100 to-purple-100', desc: '信任的人' },
  { id: 'responsibilitypie', emoji: '🥧', title: '责任饼图', color: 'from-purple-100 to-indigo-100', desc: '不只是我' },
  { id: 'calmdownmenu', emoji: '🧊', title: '冷静菜单', color: 'from-cyan-100 to-blue-100', desc: '快速冷静' },
  { id: 'skilltree', emoji: '🌳', title: '技能树', color: 'from-green-100 to-emerald-100', desc: '技能进度' },
  { id: 'boundaries', emoji: '🛑', title: '边界练习', color: 'from-orange-100 to-red-100', desc: '学会说不' },
  { id: 'emotionforecast', emoji: '🔮', title: '情绪预报', color: 'from-violet-100 to-purple-100', desc: '预测vs现实' },
  { id: 'habitstack', emoji: '🧱', title: '习惯叠加', color: 'from-amber-100 to-yellow-100', desc: '小习惯' },
  { id: 'conflictresolve', emoji: '🕊️', title: '化解冲突', color: 'from-blue-100 to-cyan-100', desc: '5步和平' },
  { id: 'scavengerhunt', emoji: '🔍', title: '感恩寻宝', color: 'from-yellow-100 to-orange-100', desc: '发现美好' },
  { id: 'archaeology', emoji: '⛏️', title: '情绪考古', color: 'from-amber-100 to-yellow-100', desc: '挖掘深层' },
  { id: 'bodycoping', emoji: '🦋', title: '身体安抚', color: 'from-purple-100 to-pink-100', desc: '蝴蝶拥抱' },
  { id: 'permissionslip', emoji: '📜', title: '许可小条', color: 'from-pink-100 to-rose-100', desc: '允许自己' },
  { id: 'awe', emoji: '🤩', title: '每日惊叹', color: 'from-indigo-100 to-purple-100', desc: '发现神奇' },
  { id: 'observer', emoji: '☁️', title: '安静观察', color: 'from-blue-100 to-cyan-100', desc: '正念练习' },
  { id: 'emotionalcpr', emoji: '🚨', title: '情绪急救', color: 'from-red-100 to-pink-100', desc: 'CPR三步' },
  { id: 'strengthshield', emoji: '🛡️', title: '力量盾牌', color: 'from-green-100 to-emerald-100', desc: '心灵防护' },
  { id: 'microkindness', emoji: '🌸', title: '微小善意', color: 'from-pink-100 to-purple-100', desc: '善待自己' },
  { id: 'feelingsforecast', emoji: '🌤️', title: '心情天气', color: 'from-blue-100 to-yellow-100', desc: '预报心情' },
  { id: 'hopejar', emoji: '🫙', title: '希望罐子', color: 'from-yellow-100 to-amber-100', desc: '收集希望' },
  { id: 'breathinggame', emoji: '🎮', title: '呼吸游戏', color: 'from-cyan-100 to-blue-100', desc: '趣味呼吸' },
  { id: 'decisioncompass', emoji: '🧭', title: '决策指南针', color: 'from-indigo-100 to-purple-100', desc: '做好选择' },
  { id: 'empathyglasses', emoji: '👓', title: '共情眼镜', color: 'from-pink-100 to-rose-100', desc: '换位思考' },
  { id: 'moodcollage', emoji: '🎨', title: '心情拼贴', color: 'from-yellow-100 to-pink-100', desc: '拼出心情' },
  { id: 'vocabstory', emoji: '📖', title: '情绪词汇', color: 'from-purple-100 to-indigo-100', desc: '学新词汇' },
  { id: 'gratitudechain', emoji: '🔗', title: '感恩链条', color: 'from-green-100 to-emerald-100', desc: '串起感恩' },
  { id: 'safepersoncards', emoji: '🃏', title: '安全人物卡', color: 'from-blue-100 to-indigo-100', desc: '信任的人' },
  { id: 'morningcompass', emoji: '🌅', title: '晨间罗盘', color: 'from-orange-100 to-yellow-100', desc: '开启新天' },
  { id: 'copingreport', emoji: '📋', title: '应对报告', color: 'from-teal-100 to-cyan-100', desc: '总结应对' },
  { id: 'connectioncards', emoji: '💬', title: '连接卡片', color: 'from-rose-100 to-pink-100', desc: '聊天话题' },
  { id: 'emotionmapquest', emoji: '🗺️', title: '情绪地图', color: 'from-blue-100 to-purple-100', desc: '一天心情' },
  { id: 'comfortmenu', emoji: '🍽️', title: '安慰菜单', color: 'from-pink-100 to-orange-100', desc: '安慰自己' },
  { id: 'praisejar', emoji: '🏺', title: '表扬罐', color: 'from-yellow-100 to-amber-100', desc: '收集赞美' },
  { id: 'feelingstranslator', emoji: '🔄', title: '情绪翻译器', color: 'from-purple-100 to-pink-100', desc: '翻译行为' },
  { id: 'mindfullistening', emoji: '👂', title: '静心聆听', color: 'from-teal-100 to-cyan-100', desc: '用耳朵感受' },
  { id: 'couragecoin', emoji: '🪙', title: '勇气金币', color: 'from-amber-100 to-yellow-100', desc: '收集勇气' },
  { id: 'friendshiprecipe', emoji: '👨‍🍳', title: '友谊配方', color: 'from-green-100 to-emerald-100', desc: '交友秘方' },
  { id: 'thoughtbubbles', emoji: '💭', title: '想法气泡', color: 'from-blue-100 to-purple-100', desc: '换位思考' },
  { id: 'calmbuddy', emoji: '🧸', title: '呼吸伙伴', color: 'from-purple-100 to-pink-100', desc: '陪伴呼吸' },
  { id: 'accomplishments', emoji: '🏆', title: '成就时间线', color: 'from-indigo-100 to-purple-100', desc: '记录成就' },
  { id: 'dailywins', emoji: '🏅', title: '每日小胜利', color: 'from-yellow-100 to-amber-100', desc: '3个小赢' },
  { id: 'sensorycountdown', emoji: '5️⃣', title: '感官倒数', color: 'from-green-100 to-emerald-100', desc: '5-4-3-2-1' },
  { id: 'emotionjar', emoji: '🫧', title: '情绪瓶实验', color: 'from-purple-100 to-pink-100', desc: '摇一摇沉淀' },
  { id: 'tradingcards', emoji: '🃏', title: '优势卡牌', color: 'from-yellow-100 to-amber-100', desc: '收集力量' },
  { id: 'mooddj', emoji: '🎧', title: '心情DJ', color: 'from-purple-100 to-pink-100', desc: '混音心情' },
  { id: 'vendingmachine', emoji: '🏭', title: '想法贩卖机', color: 'from-green-100 to-emerald-100', desc: '转换想法' },
  { id: 'feelingsmask', emoji: '🎭', title: '面具画廊', color: 'from-blue-100 to-purple-100', desc: '外表与内心' },
  { id: 'dailyanchor', emoji: '⚓', title: '每日锚点', color: 'from-blue-100 to-cyan-100', desc: '今日期待' },
  { id: 'boomerang', emoji: '🪃', title: '赞美回旋', color: 'from-pink-100 to-rose-100', desc: '赞美回弹' },
  { id: 'emotionvolume', emoji: '🔊', title: '情绪音量', color: 'from-orange-100 to-red-100', desc: '调节音量' },
  { id: 'safesignals', emoji: '🤫', title: '安全暗号', color: 'from-indigo-100 to-purple-100', desc: '秘密信号' },
  { id: 'abcdiary', emoji: '📝', title: 'ABC日记', color: 'from-purple-100 to-blue-100', desc: '事件→想法→感受' },
  { id: 'worryballoon', emoji: '🎈', title: '烦恼气球', color: 'from-blue-100 to-purple-100', desc: '放飞烦恼' },
  { id: 'feelingsbingo', emoji: '🎯', title: '情绪宾果', color: 'from-green-100 to-emerald-100', desc: '一行就赢' },
  { id: 'mirrorchallenge', emoji: '🪞', title: '镜子挑战', color: 'from-yellow-100 to-amber-100', desc: '7天自信' },
  { id: 'orchestra', emoji: '🎼', title: '情绪交响乐', color: 'from-pink-100 to-purple-100', desc: '调节乐器' },
  { id: 'shrinkray', emoji: '🔫', title: '问题缩小器', color: 'from-orange-100 to-red-100', desc: '缩小问题' },
  { id: 'gratitudeglasses', emoji: '👓', title: '感恩眼镜', color: 'from-green-100 to-emerald-100', desc: '换个角度' },
  { id: 'emotiontimecapsule', emoji: '💊', title: '情绪时光机', color: 'from-indigo-100 to-purple-100', desc: '7天后打开' },
  { id: 'kindnessripple', emoji: '🌊', title: '善良涟漪', color: 'from-blue-100 to-cyan-100', desc: '善意传递' },
  { id: 'solarsystem', emoji: '☀️', title: '支持太阳系', color: 'from-indigo-100 to-purple-100', desc: '你的星球' }
];

// ─── Social Skills Role-Play ────────────────────────────────────────────────
const SOCIAL_SCENARIOS = [
  { id: 'newfriend', emoji: '👋', title: '认识新朋友', scene: '你在公园看到一个小朋友独自坐在秋千旁边。',
    choices: [
      { text: '走过去说"你好，我能和你一起玩吗？"', score: 3, feedback: '太棒了！主动友好地打招呼是交朋友的好方法。' },
      { text: '站在远处看着，希望对方先来找你', score: 1, feedback: '等待也可以，但主动一点能更快交到朋友哦。' },
      { text: '和旁边的大人说你想交朋友', score: 2, feedback: '寻求帮助也是一种方法，下次可以试试自己走过去。' }
    ] },
  { id: 'teasing', emoji: '😤', title: '被嘲笑了', scene: '有同学嘲笑你画的画不好看。',
    choices: [
      { text: '深呼吸，说"每个人画画风格不同，我喜欢我的画"', score: 3, feedback: '非常自信！表达自己的想法同时保持冷静，太厉害了。' },
      { text: '也嘲笑回去', score: 0, feedback: '嘲笑回去可能会让情况更糟。试试冷静地表达你的感受。' },
      { text: '告诉老师', score: 2, feedback: '如果持续被嘲笑，告诉大人是正确的做法。' }
    ] },
  { id: 'sharing', emoji: '🤝', title: '学会分享', scene: '你带了一盒好吃的零食，旁边的同学看起来很想吃。',
    choices: [
      { text: '问"你要不要也尝一个？"', score: 3, feedback: '主动分享会让大家都开心！你很慷慨。' },
      { text: '假装没看到', score: 1, feedback: '不想分享也没关系，但分享能带来快乐哦。' },
      { text: '等对方开口再说', score: 2, feedback: '也可以，不过主动分享会让对方觉得你很友善。' }
    ] },
  { id: 'conflict', emoji: '⚡', title: '朋友吵架了', scene: '你的两个好朋友吵架了，都想让你站在自己这边。',
    choices: [
      { text: '告诉他们"你们都是我的好朋友，我们一起想办法解决"', score: 3, feedback: '太有智慧了！不选边站，帮助他们和好是最好的方法。' },
      { text: '选一个你更好的朋友那边', score: 0, feedback: '选边站可能会伤害另一个朋友。试试帮他们和好。' },
      { text: '暂时不参与，让他们自己冷静', score: 2, feedback: '给他们空间也是一种方法，等他们冷静了再帮忙。' }
    ] },
  { id: 'askhelp', emoji: '🙋', title: '寻求帮助', scene: '数学作业有一道题你怎么都不会做。',
    choices: [
      { text: '举手问老师"这道题我不太懂，能帮我讲一下吗？"', score: 3, feedback: '寻求帮助是勇敢的表现！每个人都有不会的时候。' },
      { text: '一直自己想，想不出来就算了', score: 1, feedback: '坚持思考很好，但适时寻求帮助效率更高。' },
      { text: '偷看同桌的答案', score: 0, feedback: '抄答案学不到东西。勇敢地问老师或同学讲解吧。' }
    ] },
  { id: 'reject', emoji: '🚫', title: '被拒绝了', scene: '你邀请同学放学后一起玩，但他说没空。',
    choices: [
      { text: '说"没关系，下次有空再一起玩吧"', score: 3, feedback: '很成熟的反应！理解别人也有安排，改天再约。' },
      { text: '很难过，觉得他不喜欢你', score: 1, feedback: '被拒绝难过是正常的，但没空不代表不喜欢你哦。' },
      { text: '问问其他朋友有没有空', score: 2, feedback: '好主意！多交几个朋友，选择更多。' }
    ] }
];

// ─── Growth Mindset ─────────────────────────────────────────────────────────
const GROWTH_LESSONS = [
  { id: 'brain', emoji: '🧠', title: '大脑会长大', content: '你的大脑就像肌肉一样，越练习越强大！每次你学新东西，大脑里就会长出新的"连接线"。', exercise: '想一件你以前不会、现在学会了的事情。', affirmation: '我的大脑每天都在成长！' },
  { id: 'yet', emoji: '✨', title: '还没有≠不会', content: '"我不会"其实是"我还没学会"。加上一个"还"字，意思就完全不同了！', exercise: '把"我不会骑自行车"改成"我还不会骑自行车，但我正在学"。', affirmation: '我现在不会，但我可以学！' },
  { id: 'mistakes', emoji: '💡', title: '错误是好老师', content: '每个发明家在成功之前都失败了很多次。爱迪生试了1000多次才发明了灯泡！', exercise: '想一个你最近犯的错误，从中你学到了什么？', affirmation: '犯错让我变得更聪明！' },
  { id: 'effort', emoji: '💪', title: '努力比天赋重要', content: '研究发现，相信努力的孩子比相信天赋的孩子进步更大。因为他们更愿意尝试难的事情！', exercise: '今天做一件有点难但你想学会的事情。', affirmation: '我努力的过程比结果更重要！' },
  { id: 'feedback', emoji: '🎯', title: '建议帮我变更好', content: '当别人给你建议时，不是在说你不好，而是在帮你变得更好。就像教练帮运动员进步一样。', exercise: '今天认真听一个建议，然后试试看。', affirmation: '我欢迎建议，它帮助我成长！' }
];

// ─── Positive Memory Vault ──────────────────────────────────────────────────
const MEMORY_TAGS = [
  { emoji: '👨‍👩‍👧', label: '家人' }, { emoji: '👫', label: '朋友' }, { emoji: '🎮', label: '玩耍' },
  { emoji: '🏆', label: '成就' }, { emoji: '🌈', label: '惊喜' }, { emoji: '🎂', label: '节日' },
  { emoji: '🐾', label: '动物' }, { emoji: '🌸', label: '自然' }
];

// ─── Sensory Comfort Toolkit ────────────────────────────────────────────────
const SENSORY_ITEMS = [
  { sense: '看', emoji: '👀', items: ['看窗外的云☁️', '看喜欢的照片📸', '看鱼缸里的鱼🐠', '看彩虹🌈', '看烛光摇曳🕯️'] },
  { sense: '听', emoji: '👂', items: ['听鸟叫声🐦', '听雨声🌧️', '听喜欢的歌🎵', '听风铃🎐', '听猫咪呼噜🐱'] },
  { sense: '摸', emoji: '✋', items: ['抱软软的毛绒玩具🧸', '摸光滑的石头🪨', '揉面团或橡皮泥🎨', '泡温水🛁', '摸丝绒布料🧣'] },
  { sense: '闻', emoji: '👃', items: ['闻花香🌺', '闻刚烤好的面包🍞', '闻妈妈的香水💐', '闻新书的味道📚', '闻薰衣草🪻'] },
  { sense: '尝', emoji: '👅', items: ['喝温热的牛奶🥛', '吃巧克力🍫', '嚼薄荷糖🍬', '吃喜欢的水果🍓', '喝蜂蜜水🍯'] }
];

// ─── Emotion Charades ───────────────────────────────────────────────────────
const CHARADE_ROUNDS = [
  { type: 'guess', scenario: '小明考试得了100分，他高兴地跳了起来。', answer: '开心', options: ['开心', '难过', '害怕', '生气'] },
  { type: 'guess', scenario: '小红的冰淇淋掉在了地上。', answer: '难过', options: ['开心', '难过', '兴奋', '平静'] },
  { type: 'guess', scenario: '小刚在黑暗的房间里听到奇怪的声音。', answer: '害怕', options: ['开心', '害怕', '生气', '惊讶'] },
  { type: 'guess', scenario: '小丽的弟弟把她画了很久的画撕了。', answer: '生气', options: ['开心', '平静', '生气', '害羞'] },
  { type: 'guess', scenario: '妈妈突然出现在学校，给小明一个大大的拥抱。', answer: '惊喜', options: ['害怕', '惊喜', '难过', '无聊'] },
  { type: 'guess', scenario: '小红被选为班长，所有同学都在看她。', answer: '紧张', options: ['紧张', '生气', '难过', '无聊'] },
  { type: 'recall', prompt: '你上一次感到特别开心是什么时候？发生了什么事？', emotion: '开心' },
  { type: 'recall', prompt: '你有没有帮助过别人？那时候你是什么感觉？', emotion: '自豪' },
  { type: 'recall', prompt: '你有没有做过一件很勇敢的事？', emotion: '勇敢' },
  { type: 'recall', prompt: '上次你感到害怕是什么时候？后来怎么样了？', emotion: '害怕' }
];

// ─── Future Self Letters ────────────────────────────────────────────────────
const LETTER_PROMPTS = [
  { delay: 7, label: '一周后', emoji: '📅', hint: '一周后的你会在做什么呢？给TA写一封鼓励的信吧。' },
  { delay: 30, label: '一个月后', emoji: '🌙', hint: '一个月后的你会有什么变化？想对TA说什么？' },
  { delay: 90, label: '三个月后', emoji: '🌟', hint: '三个月后的你一定成长了很多！写下你的期待。' }
];

const FUTURE_SELF_PROMPTS = [
  '亲爱的未来的我，我想告诉你...',
  '我希望你记住，你已经...',
  '不管怎样，我相信你能...',
  '我现在最想对你说的是...'
];

// ─── Mindful Movement & Dance ───────────────────────────────────────────────
const MOVEMENT_EXERCISES = [
  { id: 'shakeoff', emoji: '🫨', title: '甩掉烦恼', duration: 60, steps: ['站起来，双脚分开', '用力甩动双手，像要把水甩干一样', '甩动双脚，跳一跳', '全身都动起来，甩掉所有烦恼！', '慢慢停下来，感受身体的轻松'] },
  { id: 'animal', emoji: '🐻', title: '动物模仿', duration: 90, steps: ['像大熊一样慢慢走路🐻', '像兔子一样跳跳跳🐰', '像蛇一样扭动身体🐍', '像大鸟一样展开翅膀🦅', '像猫咪一样伸懒腰🐱'] },
  { id: 'freeze', emoji: '🧊', title: '音乐冻结', duration: 120, steps: ['想象音乐响起，自由跳舞！', '音乐停了——定住不动！', '保持这个姿势5秒钟...', '音乐又响了，继续跳！', '再次定住！感受身体的感觉'] },
  { id: 'stretch', emoji: '🌈', title: '彩虹伸展', duration: 90, steps: ['双手慢慢举过头顶，伸向天空', '身体向左弯，像彩虹的左边', '回到中间，深呼吸', '身体向右弯，像彩虹的右边', '双手慢慢放下，感觉身体暖暖的'] },
  { id: 'tree', emoji: '🌲', title: '大树站立', duration: 60, steps: ['双脚稳稳站在地上，像树根', '慢慢举起双手，像树枝向上生长', '微微摇摆，像风吹过树梢', '想象树叶在阳光下闪闪发光', '你是一棵坚强又美丽的大树'] }
];

// ─── Worry Time Scheduler ───────────────────────────────────────────────────
const WORRY_PROCESS_OPTIONS = [
  { emoji: '🔍', label: '这个烦恼是真的吗？有证据吗？' },
  { emoji: '🛠️', label: '我能做些什么来解决它？' },
  { emoji: '🎈', label: '这个烦恼其实不太重要，可以放下' },
  { emoji: '🤝', label: '我需要找人聊聊这件事' },
  { emoji: '⏰', label: '以后再想，现在先做别的' }
];

// ─── Acts of Courage ────────────────────────────────────────────────────────
const COURAGE_CATEGORIES = [
  { emoji: '🗣️', label: '表达自己', examples: ['在课上举手发言', '告诉朋友你的想法', '说出自己的感受'] },
  { emoji: '🆕', label: '尝试新事物', examples: ['尝试一种新食物', '学一个新技能', '去一个没去过的地方'] },
  { emoji: '💪', label: '面对困难', examples: ['做一道很难的题目', '坚持练习不放弃', '独立完成一件事'] },
  { emoji: '🤝', label: '社交勇气', examples: ['主动和新同学打招呼', '邀请别人一起玩', '在别人面前表演'] },
  { emoji: '❤️', label: '情感勇气', examples: ['承认自己犯了错', '说"对不起"', '说"我需要帮助"'] }
];

// ─── Progressive Muscle Relaxation ──────────────────────────────────────────
const MUSCLE_GROUPS = [
  { id: 'hands', emoji: '✊', name: '双手', tense: '用力握拳，像在挤柠檬汁一样！使劲握...', relax: '松开！感觉手指变得软软的、暖暖的。', duration: 8 },
  { id: 'arms', emoji: '💪', name: '手臂', tense: '用力弯曲手臂，像在展示你的肌肉！使劲！', relax: '放下来，让手臂软软地垂在身体两边。', duration: 8 },
  { id: 'shoulders', emoji: '🤷', name: '肩膀', tense: '把肩膀使劲抬到耳朵旁边，缩起来！', relax: '让肩膀慢慢放下来，感觉好轻松。', duration: 8 },
  { id: 'face', emoji: '😣', name: '脸', tense: '皱起整张脸，闭紧眼睛、皱鼻子、咬牙！像吃了很酸的柠檬！', relax: '放松！让脸变得平平的、舒服的。', duration: 8 },
  { id: 'tummy', emoji: '🫃', name: '肚子', tense: '收紧肚子，像有人要碰你的肚子一样！使劲！', relax: '松开，让肚子自然地上下起伏。', duration: 8 },
  { id: 'legs', emoji: '🦵', name: '腿', tense: '把腿伸直，脚趾使劲往前勾！感觉小腿紧紧的！', relax: '放下来，让腿变得软软的，很舒服。', duration: 8 },
  { id: 'toes', emoji: '🦶', name: '脚趾', tense: '使劲卷起脚趾头，像在沙滩上抓沙子一样！', relax: '松开，感觉脚趾暖暖的、轻轻的。', duration: 8 }
];

// ─── Positive Self-Talk Coach ────────────────────────────────────────────────
const NEGATIVE_THOUGHTS = [
  { negative: '我太笨了', balanced: '我正在学习，每个人学东西的速度不一样', category: '自我评价' },
  { negative: '没有人喜欢我', balanced: '有些人喜欢我，我可以想想谁对我好', category: '社交' },
  { negative: '我什么都做不好', balanced: '我有些事做得好，有些还在学，这很正常', category: '自我评价' },
  { negative: '都是我的错', balanced: '很多事情不是一个人的错，我只需要负责我能控制的', category: '归因' },
  { negative: '事情永远不会好起来', balanced: '难过是暂时的，以前也有困难的时候，后来都过去了', category: '未来' },
  { negative: '我不够好', balanced: '我不需要完美，做我自己就已经很好了', category: '自我评价' },
  { negative: '别人都比我强', balanced: '每个人都有自己的优点，比较没有意义', category: '比较' },
  { negative: '我肯定会失败', balanced: '我还没试呢！就算失败了，也能从中学到东西', category: '未来' },
  { negative: '没有人在乎我', balanced: '有人在乎我，只是难过的时候不容易想起来', category: '社交' },
  { negative: '我不值得被爱', balanced: '每个人都值得被爱，包括我', category: '自我评价' }
];

// ─── Support Network Map ────────────────────────────────────────────────────
const NETWORK_ROLES = [
  { emoji: '👨‍👩‍👧', label: '家人', hint: '爸爸、妈妈、爷爷奶奶...' },
  { emoji: '👩‍🏫', label: '老师', hint: '班主任、喜欢的老师...' },
  { emoji: '👫', label: '朋友', hint: '好朋友、同学...' },
  { emoji: '🏥', label: '专业人士', hint: '心理老师、医生...' },
  { emoji: '🌐', label: '其他', hint: '邻居、教练、热线...' }
];

const TALK_TOPICS = ['开心的事', '难过的事', '学校的事', '害怕的事', '秘密', '求助'];

// ─── Responsibility Pie ─────────────────────────────────────────────────────
const PIE_SCENARIOS = [
  { situation: '考试没考好', factors: [
    { label: '题目很难', pct: 25 }, { label: '没复习到那个部分', pct: 20 },
    { label: '考试时太紧张', pct: 15 }, { label: '老师出题方式不同', pct: 15 },
    { label: '前一晚没睡好', pct: 15 }, { label: '我的努力不够', pct: 10 }
  ]},
  { situation: '和朋友吵架了', factors: [
    { label: '双方都有情绪', pct: 25 }, { label: '沟通方式不对', pct: 20 },
    { label: '误会了对方的意思', pct: 20 }, { label: '当时环境嘈杂', pct: 10 },
    { label: '我说了不该说的话', pct: 15 }, { label: '朋友也有责任', pct: 10 }
  ]},
  { situation: '爸妈吵架了', factors: [
    { label: '大人有自己的压力', pct: 30 }, { label: '大人沟通方式问题', pct: 25 },
    { label: '外部因素（工作等）', pct: 20 }, { label: '情绪管理', pct: 15 },
    { label: '和我无关', pct: 10 }
  ]}
];

const PIE_COLORS = ['bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400', 'bg-orange-400'];

// ─── Calm Down Menu ─────────────────────────────────────────────────────────
const CALM_STRATEGIES = [
  { emoji: '🌬️', title: '深呼吸', desc: '吸气4秒→屏住4秒→呼气4秒', category: '身体', page: 'breathing' },
  { emoji: '🧊', title: '冰水法', desc: '用冷水洗脸或握冰块', category: '身体' },
  { emoji: '🦁', title: '甩掉烦恼', desc: '站起来用力甩动手脚', category: '身体', page: 'mindfulmovement' },
  { emoji: '🌍', title: '感官着陆', desc: '5看4摸3听2闻1尝', category: '感官', page: 'grounding' },
  { emoji: '🧸', title: '安慰物品', desc: '抱紧你最喜欢的东西', category: '感官' },
  { emoji: '🎵', title: '听音乐', desc: '放一首让你平静的歌', category: '感官' },
  { emoji: '🗣️', title: '说出来', desc: '告诉信任的人你的感受', category: '社交' },
  { emoji: '✍️', title: '写下来', desc: '把烦恼写在纸上', category: '认知', page: 'journal' },
  { emoji: '🧠', title: '想法检查', desc: '这个想法是真的吗？', category: '认知', page: 'thought' },
  { emoji: '🏠', title: '安全基地', desc: '去你的想象安全地方', category: '想象', page: 'safeplace' }
];

// ─── Skill Mastery Tree ─────────────────────────────────────────────────────
const SKILL_BRANCHES = [
  { id: 'calm', emoji: '🧘', name: '平静力', skills: [
    { name: '腹式呼吸', tool: 'breathing' }, { name: '身体放松', tool: 'musclerelax' },
    { name: '感官着陆', tool: 'grounding' }, { name: '安全基地', tool: 'safeplace' }
  ]},
  { id: 'think', emoji: '🧠', name: '思考力', skills: [
    { name: '想法捕捉', tool: 'thought' }, { name: '思维陷阱', tool: 'traps' },
    { name: '责任饼图', tool: 'responsibilitypie' }, { name: '成长思维', tool: 'growthmindset' }
  ]},
  { id: 'feel', emoji: '❤️', name: '感受力', skills: [
    { name: '情绪识别', tool: 'emotions' }, { name: '身体地图', tool: 'bodymap' },
    { name: '情绪温度', tool: 'thermometer' }, { name: '情绪猜猜', tool: 'emotioncharades' }
  ]},
  { id: 'connect', emoji: '🤝', name: '连接力', skills: [
    { name: '社交练习', tool: 'socialroleplay' }, { name: '善意挑战', tool: 'kindness' },
    { name: '夸夸链', tool: 'compliments' }, { name: '边界练习', tool: 'boundaries' }
  ]},
  { id: 'grow', emoji: '🌱', name: '成长力', skills: [
    { name: '勇气追踪', tool: 'couragetracker' }, { name: '力量发现', tool: 'strengths' },
    { name: '积极自我对话', tool: 'selftalk' }, { name: '价值罗盘', tool: 'values' }
  ]}
];

// ─── Boundary Setting ───────────────────────────────────────────────────────
const BOUNDARY_SCENARIOS = [
  { emoji: '📚', title: '不想借作业', scene: '同学让你把作业给他抄。',
    good: '我可以帮你讲解，但不能直接给你抄哦。', why: '帮助别人学习是好事，但直接抄对谁都不好。' },
  { emoji: '🎮', title: '不想玩了', scene: '朋友一直让你继续玩游戏，但你已经很累了。',
    good: '我今天玩够了，想休息一下。我们明天再一起玩吧！', why: '照顾自己的身体和感受很重要。' },
  { emoji: '🤫', title: '不想说秘密', scene: '有人问你一个你不想分享的私事。',
    good: '这是我的私事，我不太想说。谢谢你理解。', why: '你有权利保护自己的隐私。' },
  { emoji: '😤', title: '被叫外号', scene: '同学给你取了一个你不喜欢的外号。',
    good: '请不要这样叫我，我不喜欢。我的名字是___。', why: '大声说出你的感受，让别人知道你的边界。' },
  { emoji: '🏃', title: '不想参加', scene: '大家要做一个你不想做的活动。',
    good: '谢谢你们邀请我，但这次我不想参加。你们玩开心！', why: '说"不"是你的权利，不需要解释太多。' },
  { emoji: '💪', title: '被迫帮忙', scene: '有人总是让你帮他做事情。',
    good: '我今天没有时间帮忙，你可以试试自己做或者问别人。', why: '帮助别人是好事，但不能总是牺牲自己。' }
];

// ─── Emotion Forecasting ────────────────────────────────────────────────────
const FORECAST_EVENTS = [
  { emoji: '📝', label: '考试' }, { emoji: '🎉', label: '聚会' }, { emoji: '🏫', label: '上学' },
  { emoji: '👥', label: '社交活动' }, { emoji: '🎭', label: '表演' }, { emoji: '🏃', label: '运动比赛' },
  { emoji: '👨‍👩‍👧', label: '家庭聚会' }, { emoji: '🆕', label: '新环境' }
];

const FORECAST_FEELINGS = [
  { emoji: '😰', label: '非常紧张', value: 1 }, { emoji: '😟', label: '有点担心', value: 2 },
  { emoji: '😐', label: '一般', value: 3 }, { emoji: '🙂', label: '还不错', value: 4 },
  { emoji: '😊', label: '很期待', value: 5 }
];

// ─── Habit Stacking ─────────────────────────────────────────────────────────
const ANCHOR_HABITS = [
  { emoji: '🪥', label: '刷牙之后' }, { emoji: '🍚', label: '吃饭之后' },
  { emoji: '🎒', label: '到学校之后' }, { emoji: '🏠', label: '回家之后' },
  { emoji: '🛏️', label: '上床之前' }, { emoji: '📖', label: '写完作业之后' }
];

const TINY_HABITS = [
  { emoji: '💪', label: '对自己说一句鼓励的话' }, { emoji: '🙏', label: '想一件感恩的事' },
  { emoji: '🌬️', label: '做3次深呼吸' }, { emoji: '😊', label: '对镜子微笑' },
  { emoji: '💧', label: '喝一杯水' }, { emoji: '🤗', label: '给家人一个拥抱' },
  { emoji: '📝', label: '写一句今天的感受' }, { emoji: '🌳', label: '看看窗外的绿色' }
];

// ─── Conflict Resolution ────────────────────────────────────────────────────
const CONFLICT_STEPS = [
  { step: 1, emoji: '❄️', title: '冷静下来', desc: '先深呼吸几次，让自己冷静。生气的时候说的话容易伤人。' },
  { step: 2, emoji: '📝', title: '描述问题', desc: '用"我觉得..."开头说出你的感受，不要用"你总是..."指责别人。' },
  { step: 3, emoji: '👂', title: '倾听对方', desc: '安静地听对方说完，不打断。试着理解对方的想法。' },
  { step: 4, emoji: '💡', title: '一起想办法', desc: '想出几个双方都能接受的解决办法。没有完美的方案，但可以妥协。' },
  { step: 5, emoji: '🤝', title: '达成共识', desc: '选一个大家都同意的方案，然后握手言和！' }
];

const CONFLICT_PRACTICES = [
  { scene: '你和弟弟都想看不同的电视节目', example: '我们可以轮流选，今天你先看，明天我选。' },
  { scene: '朋友没有邀请你参加生日派对', example: '我有点难过没被邀请。能告诉我原因吗？也许下次我们可以一起玩。' },
  { scene: '同学不小心弄坏了你的文具', example: '我的文具坏了，我很心疼。但我知道你不是故意的。下次小心一点好吗？' }
];

// ─── Gratitude Scavenger Hunt ───────────────────────────────────────────────
const SCAVENGER_HUNTS = [
  { id: 'color', emoji: '🎨', title: '颜色猎人', tasks: ['找到3个你最喜欢颜色的东西', '找一个彩虹色的东西', '找一个让你觉得温暖的颜色'] },
  { id: 'kind', emoji: '💗', title: '善意发现', tasks: ['发现一个别人的善意行为', '注意一个让你微笑的瞬间', '找到一个你觉得感恩的人'] },
  { id: 'nature', emoji: '🌿', title: '自然探险', tasks: ['找到一朵花或一片叶子', '听到一种鸟叫声', '感受阳光或微风'] },
  { id: 'sense', emoji: '👃', title: '感官冒险', tasks: ['闻到一种好闻的味道', '听到一种好听的声音', '摸到一种舒服的材质'] },
  { id: 'people', emoji: '👫', title: '人际温暖', tasks: ['跟一个人说"谢谢"', '给一个人一个微笑', '告诉一个人你喜欢他们的什么'] },
  { id: 'learn', emoji: '📚', title: '学习发现', tasks: ['发现一个你今天学到的新知识', '找到一个你觉得有趣的问题', '注意一件让你好奇的事'] },
  { id: 'home', emoji: '🏠', title: '家的温暖', tasks: ['找到家里一个让你觉得安心的角落', '发现一个家人为你做的小事', '找到一个充满回忆的物品'] }
];

// ─── Emotion Archaeology ────────────────────────────────────────────────────
const EMOTION_LAYERS = [
  { surface: '生气', emoji: '😡', beneath: [
    { emotion: '受伤', emoji: '💔', desc: '有人做了让你难受的事' },
    { emotion: '害怕', emoji: '😨', desc: '担心失去什么或被伤害' },
    { emotion: '失望', emoji: '😞', desc: '事情没有按你希望的发展' },
    { emotion: '不公平', emoji: '😤', desc: '觉得被不公平对待了' }
  ]},
  { surface: '不想做事', emoji: '😑', beneath: [
    { emotion: '害怕失败', emoji: '😰', desc: '担心做不好' },
    { emotion: '疲惫', emoji: '😩', desc: '身体或心理太累了' },
    { emotion: '无意义感', emoji: '😶', desc: '觉得做了也没用' },
    { emotion: '压力', emoji: '🤯', desc: '要做的事情太多了' }
  ]},
  { surface: '烦躁', emoji: '😤', beneath: [
    { emotion: '孤独', emoji: '🥺', desc: '觉得没人理解你' },
    { emotion: '焦虑', emoji: '😟', desc: '心里有担心的事' },
    { emotion: '委屈', emoji: '😢', desc: '觉得自己被忽视了' },
    { emotion: '疲倦', emoji: '😪', desc: '需要休息了' }
  ]},
  { surface: '哭泣', emoji: '😭', beneath: [
    { emotion: '想念', emoji: '💭', desc: '想念某个人或某段时光' },
    { emotion: '无助', emoji: '🫥', desc: '觉得自己没有办法' },
    { emotion: '感动', emoji: '🥹', desc: '被某件事触动了' },
    { emotion: '释放', emoji: '💧', desc: '哭泣是在释放压力，这没关系' }
  ]}
];

// ─── Butterfly Hug & Body-Based Coping ──────────────────────────────────────
const BODY_COPING = [
  { id: 'butterfly', emoji: '🦋', title: '蝴蝶拥抱', duration: 60,
    steps: ['双手交叉放在胸前，像蝴蝶的翅膀', '左手轻轻拍右肩', '右手轻轻拍左肩', '交替拍打，像蝴蝶扇动翅膀', '慢慢地，一下一下地拍', '感受双手带来的温暖和安全'],
    desc: '这是心理医生常用的方法，轻轻拍打能帮助大脑平静下来。' },
  { id: 'tapping', emoji: '👆', title: '轻拍放松', duration: 90,
    steps: ['用两根手指轻轻拍额头中间', '拍眉毛旁边（眼角外侧）', '拍眼睛下方的颧骨', '拍下巴', '拍锁骨下方', '每个位置拍5-7下，慢慢来'],
    desc: '穴位轻拍能帮助释放身体的紧张感。' },
  { id: 'figure8', emoji: '♾️', title: '8字呼吸', duration: 60,
    steps: ['伸出一根手指', '在空中画一个躺着的8（∞）', '画上半圈时慢慢吸气', '画下半圈时慢慢呼气', '跟着手指的移动呼吸', '重复5-8次'],
    desc: '8字运动帮助左右大脑协调工作，让你更平静。' },
  { id: 'hug', emoji: '🤗', title: '自我拥抱', duration: 45,
    steps: ['双手抱住自己的肩膀', '轻轻收紧，给自己一个温暖的拥抱', '闭上眼睛，慢慢呼吸', '对自己说"我很安全，我很好"', '保持20秒，感受温暖'],
    desc: '拥抱能刺激催产素分泌，让你感觉被爱和安全。' },
  { id: 'grounding54321', emoji: '🖐️', title: '54321着陆加强版', duration: 90,
    steps: ['找到5样你能看到的东西，说出它们的颜色', '摸4样东西，感受它们的质地', '听3种声音，辨别它们是什么', '闻2种气味', '尝1种味道（比如喝口水）', '现在，你回到了当下'],
    desc: '通过感官把注意力拉回现在，不被担忧带走。' }
];

// ─── Permission Slips ───────────────────────────────────────────────────────
const PERMISSION_TEMPLATES = [
  { emoji: '😢', text: '允许自己难过，难过是正常的感受' },
  { emoji: '😴', text: '允许自己休息，不必每分钟都在努力' },
  { emoji: '❌', text: '允许自己犯错，犯错是学习的一部分' },
  { emoji: '🙋', text: '允许自己求助，寻求帮助是勇敢的' },
  { emoji: '🐢', text: '允许自己慢慢来，不用和别人比速度' },
  { emoji: '😊', text: '允许自己开心，即使别人不开心' },
  { emoji: '🚫', text: '允许自己说"不"，你不必讨好每个人' },
  { emoji: '💤', text: '允许自己不完美，完美不存在' },
  { emoji: '🗣️', text: '允许自己表达感受，你的感受很重要' },
  { emoji: '🎮', text: '允许自己玩耍，玩耍不是浪费时间' }
];

// ─── Daily Dose of Awe ─────────────────────────────────────────────────────
const AWE_PROMPTS = [
  { emoji: '🐜', prompt: '找一只小虫子，仔细观察它有多少只脚，它在做什么？' },
  { emoji: '☁️', prompt: '抬头看看云，你能找到一朵像动物的云吗？' },
  { emoji: '🌳', prompt: '摸一摸树的树皮，感受上面的纹路，想想这棵树有多大年纪？' },
  { emoji: '✋', prompt: '仔细看看你的手掌纹路，世界上没有一模一样的掌纹！' },
  { emoji: '💧', prompt: '观察一滴水珠，它是怎么从天上落下来又蒸发回去的？' },
  { emoji: '🌅', prompt: '看看今天的天空是什么颜色，日出日落的颜色永远不会重复。' },
  { emoji: '🎵', prompt: '安静一分钟，你能听到几种不同的声音？' },
  { emoji: '🌸', prompt: '找一朵花或一片叶子，看看它的形状有多精致！' },
  { emoji: '⭐', prompt: '想一想，光从太阳到地球需要8分钟，你现在看到的阳光是8分钟前发出的！' },
  { emoji: '🫀', prompt: '把手放在心口，感受你的心跳。它从你出生起就一刻不停地工作！' }
];

// ─── Compassionate Observer ─────────────────────────────────────────────────
const OBSERVER_EXERCISES = [
  { id: 'clouds', emoji: '☁️', title: '想法云朵', duration: 120,
    guide: ['闭上眼睛，想象你躺在草地上看天空', '天空就是你的心，很大很宽广', '想法就像云朵，飘过来又飘走', '不管是什么想法，只是看着它飘过', '不需要抓住它，也不需要推开它', '就像看云一样，看着就好'] },
  { id: 'waves', emoji: '🌊', title: '感受浪花', duration: 120,
    guide: ['想象你坐在海边的岩石上', '每一个感受就像一朵浪花', '有的浪大，有的浪小', '浪花冲上来，又退回去', '不管多大的浪，最终都会退去', '你只需要安全地坐在岩石上观察'] },
  { id: 'train', emoji: '🚂', title: '思维列车', duration: 90,
    guide: ['想象你站在火车站台上', '每个想法是一节经过的车厢', '你可以看着它经过，但不用上车', '如果不小心上车了，在下一站下来就好', '回到站台，继续观察', '你不是你的想法，你是观察想法的人'] }
];

// ─── Emotional CPR ──────────────────────────────────────────────────────────
const CPR_STEPS = [
  { letter: 'C', title: '连接 Connect', emoji: '🤝', color: 'bg-blue-400',
    actions: ['找到一个你信任的人', '告诉TA"我需要有人陪"', '或者抱抱自己、抱抱毛绒玩具'],
    quick: '找人陪' },
  { letter: 'P', title: '保护 Protect', emoji: '🛡️', color: 'bg-green-400',
    actions: ['离开让你难受的地方或情况', '去一个安全的角落', '把可能伤害自己的东西移走'],
    quick: '去安全的地方' },
  { letter: 'R', title: '恢复 Restore', emoji: '💚', color: 'bg-purple-400',
    actions: ['做3次深呼吸', '用蝴蝶拥抱安慰自己', '喝一杯水，感受它的温度'],
    quick: '深呼吸+蝴蝶拥抱' }
];

// ─── Strengths Shield ───────────────────────────────────────────────────────
const SHIELD_QUADRANTS = [
  { id: 'good', emoji: '⭐', title: '我擅长的', prompt: '你做什么事情做得好？', color: 'from-yellow-200 to-amber-200' },
  { id: 'love', emoji: '❤️', title: '我热爱的', prompt: '什么事情让你充满热情？', color: 'from-pink-200 to-rose-200' },
  { id: 'others', emoji: '👏', title: '别人欣赏我的', prompt: '别人说过你什么优点？', color: 'from-blue-200 to-cyan-200' },
  { id: 'overcome', emoji: '💪', title: '我克服过的', prompt: '你战胜过什么困难？', color: 'from-green-200 to-emerald-200' }
];

// ─── Micro-Kindness Missions ────────────────────────────────────────────────
const MICRO_KINDNESS = [
  { emoji: '💧', text: '喝一杯水' }, { emoji: '🌬️', text: '做3次深呼吸' },
  { emoji: '🪟', text: '看看窗外5秒钟' }, { emoji: '🤲', text: '搓搓双手，暖暖手心' },
  { emoji: '😊', text: '对自己微笑一下' }, { emoji: '🧣', text: '穿上舒服的衣服' },
  { emoji: '🎵', text: '哼一首喜欢的歌' }, { emoji: '✍️', text: '写下此刻的一个好事' },
  { emoji: '🤗', text: '给自己一个拥抱' }, { emoji: '👀', text: '闭眼休息10秒钟' },
  { emoji: '🍎', text: '吃一口健康的食物' }, { emoji: '🌸', text: '闻一闻好闻的东西' }
];

// ─── Feelings Forecast Journal ──────────────────────────────────────────────
const WEATHER_EMOJI = [
  { emoji: '☀️', label: '晴天', desc: '心情很好' },
  { emoji: '⛅', label: '多云', desc: '还可以' },
  { emoji: '☁️', label: '阴天', desc: '有点低落' },
  { emoji: '🌧️', label: '下雨', desc: '比较难过' },
  { emoji: '⛈️', label: '暴风雨', desc: '非常难受' }
];

// ─── Hope Jar ───────────────────────────────────────────────────────────────
const HOPE_CATEGORIES = [
  { emoji: '🎯', label: '期待的事', hint: '你有什么期待的事情？（生日、旅行、见朋友...）' },
  { emoji: '💗', label: '爱我的人', hint: '谁关心你？（家人、朋友、老师、宠物...）' },
  { emoji: '🏆', label: '度过的难关', hint: '你曾经克服过什么困难？' },
  { emoji: '🌈', label: '美好的梦想', hint: '长大后你想做什么？想去哪里？' },
  { emoji: '😊', label: '开心的回忆', hint: '最近让你开心的事情是什么？' }
];

// ─── Breathing Games ────────────────────────────────────────────────────────
const BREATHING_GAMES = [
  { id: 'candles', emoji: '🕯️', title: '吹蜡烛', desc: '想象面前有生日蛋糕，深吸一口气，慢慢把蜡烛吹灭',
    rounds: 5, inhale: 3, exhale: 5, instruction: '深吸气...慢慢吹灭蜡烛...', successMsg: '蜡烛灭了！🎂' },
  { id: 'balloon', emoji: '🎈', title: '吹气球', desc: '用肚子呼吸，慢慢把气球吹大',
    rounds: 4, inhale: 4, exhale: 6, instruction: '吸满气...慢慢吹进气球...', successMsg: '气球好大！🎈' },
  { id: 'sailboat', emoji: '⛵', title: '吹帆船', desc: '吹一口长长的气，让帆船飘过水面',
    rounds: 4, inhale: 3, exhale: 7, instruction: '深吸气...轻轻吹动帆船...', successMsg: '帆船过去了！⛵' },
  { id: 'dandelion', emoji: '🌬️', title: '吹蒲公英', desc: '轻轻吹，让蒲公英种子飞向天空',
    rounds: 5, inhale: 3, exhale: 4, instruction: '吸气...轻轻吹散蒲公英...', successMsg: '种子飞起来了！🌬️' },
  { id: 'hotcocoa', emoji: '☕', title: '热可可', desc: '闻一闻热可可的香味，再轻轻吹凉它',
    rounds: 4, inhale: 4, exhale: 5, instruction: '闻一闻香味...轻轻吹凉...', successMsg: '可以喝啦！☕' }
];

// ─── Decision Compass ───────────────────────────────────────────────────────
const DECISION_QUESTIONS = [
  { emoji: '🤔', question: '我有哪些选择？' },
  { emoji: '❤️', question: '每个选择让我有什么感觉？' },
  { emoji: '👫', question: '我的好朋友会怎么建议我？' },
  { emoji: '🧭', question: '哪个选择最符合我看重的事情？' },
  { emoji: '🔮', question: '一周后的我会希望自己怎么选？' }
];

// ─── Empathy Glasses ────────────────────────────────────────────────────────
const EMPATHY_SCENARIOS = [
  { situation: '好朋友突然取消了和你的约定', perspectives: [
    { role: '你自己', emoji: '😔', thought: '我很失望，觉得朋友不在乎我' },
    { role: '朋友', emoji: '😰', thought: '也许TA家里有急事，或者身体不舒服' },
    { role: '旁观者', emoji: '🧐', thought: '取消约定不一定是因为不在乎，可能有很多原因' }
  ]},
  { situation: '老师批评了你的作业', perspectives: [
    { role: '你自己', emoji: '😢', thought: '我很难过，觉得自己做得不好' },
    { role: '老师', emoji: '👩‍🏫', thought: '我希望这个学生能做得更好，我相信TA有能力' },
    { role: '旁观者', emoji: '🧐', thought: '批评是为了帮助进步，不是否定这个人' }
  ]},
  { situation: '新同学加入了你最好朋友的小组', perspectives: [
    { role: '你自己', emoji: '😟', thought: '我怕好朋友不要我了' },
    { role: '好朋友', emoji: '😊', thought: '多一个朋友很开心，我依然喜欢原来的朋友' },
    { role: '新同学', emoji: '😳', thought: '我很紧张，希望大家能接受我' }
  ]},
  { situation: '妈妈对你发了脾气', perspectives: [
    { role: '你自己', emoji: '😢', thought: '妈妈是不是不爱我了？' },
    { role: '妈妈', emoji: '😫', thought: '今天工作压力好大，对孩子发脾气我也很后悔' },
    { role: '旁观者', emoji: '🧐', thought: '大人有时候也控制不好情绪，发脾气不代表不爱' }
  ]}
];

// ─── Mood Collage ───────────────────────────────────────────────────────────
const COLLAGE_EMOJIS = ['😊','😢','😡','😰','😌','🥰','😤','🤔','😴','🥺','💪','🌈','⛈️','☀️','🌊','🔥','❄️','🌸','💔','✨'];
const COLLAGE_WORDS = ['开心','难过','害怕','生气','平静','孤独','希望','疲惫','感恩','勇敢','迷茫','自由','压力','温暖','失望'];
const COLLAGE_COLORS = ['bg-red-300','bg-blue-300','bg-green-300','bg-yellow-300','bg-purple-300','bg-pink-300','bg-orange-300','bg-teal-300','bg-indigo-300','bg-gray-300'];

// ─── Emotion Vocabulary Stories ─────────────────────────────────────────────
const VOCAB_STORIES = [
  { word: '怅然若失', emoji: '💭', story: '小雨搬家了，到了新城市。虽然新家很好，但她总觉得少了什么。每次看到旧照片，就有一种说不出的空荡感——这就是"怅然若失"。', question: '你有没有过这种感觉？' },
  { word: '忐忑不安', emoji: '💗', story: '明天就是演讲比赛了。小明准备得很充分，但心里还是像有只小兔子在跳。手心出汗，一会儿觉得自己能行，一会儿又害怕。这种又紧张又期待的感觉，叫"忐忑不安"。', question: '你什么时候会忐忑不安？' },
  { word: '五味杂陈', emoji: '🎭', story: '小红的好朋友转学了。她既为朋友去了更好的学校开心，又为自己失去伙伴难过，还有点嫉妒，也有点不舍。这么多感觉混在一起，就叫"五味杂陈"。', question: '你有过这样复杂的感受吗？' },
  { word: '如释重负', emoji: '😮‍💨', story: '考试成绩出来了，小刚一直担心考得不好。看到及格的那一刻，感觉像放下了一块大石头，整个人轻松了。这种感觉叫"如释重负"。', question: '你最近什么时候感到如释重负？' },
  { word: '感同身受', emoji: '🤝', story: '小美看到同学摔倒哭了，虽然自己没有摔，但心里也觉得疼疼的，很想去安慰TA。能感受到别人的痛苦或快乐，就叫"感同身受"。', question: '你有过感同身受的经历吗？' },
  { word: '患得患失', emoji: '😰', story: '小华交了一个新朋友，特别开心。但每次朋友和别人玩，她就担心朋友不要她了。这种既怕失去又拼命抓住的感觉，叫"患得患失"。', question: '你理解这种感受吗？' }
];

// ─── Gratitude Chain ────────────────────────────────────────────────────────
const CHAIN_COLORS = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400'];

// ─── Safe Person Quick-Cards ────────────────────────────────────────────────
const HELP_SCRIPTS = [
  { emoji: '💬', label: '想聊聊', script: '我今天心情不太好，你有时间听我说说吗？' },
  { emoji: '🤗', label: '需要陪伴', script: '我现在有点难受，你能陪陪我吗？不用说什么，在旁边就好。' },
  { emoji: '😢', label: '很难过', script: '我很难过，不知道该怎么办。你能帮帮我吗？' },
  { emoji: '👂', label: '只想倾诉', script: '我想说说心里话。你不需要帮我解决，只是听我说就好。' },
  { emoji: '🆘', label: '紧急求助', script: '我现在很不好，我需要帮助。请来找我。' },
  { emoji: '🤔', label: '需要建议', script: '我遇到一个问题，不知道怎么选择。你能给我一些建议吗？' }
];

// ─── Morning Compass ────────────────────────────────────────────────────────
const COMPASS_FEELINGS = [
  { emoji: '😊', label: '开心' }, { emoji: '😌', label: '平静' }, { emoji: '💪', label: '自信' },
  { emoji: '🥰', label: '被爱' }, { emoji: '🌟', label: '充满希望' }, { emoji: '🧘', label: '放松' }
];

const COMPASS_ACTIONS = [
  '做3次深呼吸', '对自己说一句鼓励的话', '帮助一个人', '认真听一节课',
  '和朋友聊天', '运动10分钟', '写一件感恩的事', '尝试一件新事情'
];

// ─── Coping Report Card ────────────────────────────────────────────────────
const COPING_STRATEGIES_LIST = [
  { emoji: '🌬️', label: '深呼吸' }, { emoji: '🦋', label: '蝴蝶拥抱' },
  { emoji: '🗣️', label: '找人聊天' }, { emoji: '✍️', label: '写日记' },
  { emoji: '🎵', label: '听音乐' }, { emoji: '🏃', label: '运动' },
  { emoji: '🧘', label: '冥想' }, { emoji: '🌍', label: '感官着陆' },
  { emoji: '🤗', label: '自我拥抱' }, { emoji: '💧', label: '喝水休息' }
];

// ─── Connection Cards ───────────────────────────────────────────────────────
const CONVERSATION_CARDS = [
  { category: '有趣', emoji: '🎮', cards: ['如果你有超能力，你想要什么？', '你最想去世界的哪个地方？', '如果你是一种动物，你想当什么？', '你觉得最搞笑的事情是什么？'] },
  { category: '感受', emoji: '❤️', cards: ['今天让你微笑的事情是什么？', '你最近学会了什么新东西？', '什么事情让你觉得骄傲？', '你最喜欢和谁在一起？为什么？'] },
  { category: '深入', emoji: '🌊', cards: ['你希望别人了解你什么？', '什么事情你想做但还没勇气？', '你觉得什么是真正的勇敢？', '如果可以改变一件事，你会改变什么？'] }
];

// ─── Emotion Map Quest ──────────────────────────────────────────────────────
const TIME_SLOTS = [
  { id: 'morning', emoji: '🌅', label: '早上', hint: '起床到上学' },
  { id: 'school', emoji: '🏫', label: '上学', hint: '在学校的时候' },
  { id: 'afternoon', emoji: '☀️', label: '下午', hint: '放学后' },
  { id: 'evening', emoji: '🌙', label: '晚上', hint: '回家到睡前' }
];
const MAP_EMOTIONS = [
  { emoji: '😊', label: '开心', color: 'bg-yellow-200' },
  { emoji: '😢', label: '难过', color: 'bg-blue-200' },
  { emoji: '😠', label: '生气', color: 'bg-red-200' },
  { emoji: '😰', label: '焦虑', color: 'bg-purple-200' },
  { emoji: '😌', label: '平静', color: 'bg-green-200' },
  { emoji: '😴', label: '疲惫', color: 'bg-gray-200' },
  { emoji: '🤩', label: '兴奋', color: 'bg-orange-200' },
  { emoji: '😔', label: '孤独', color: 'bg-indigo-200' }
];

// ─── Comfort Menu ───────────────────────────────────────────────────────────
const COMFORT_APPETIZERS = [
  { emoji: '🫁', label: '深呼吸3次' },
  { emoji: '💧', label: '喝一口水' },
  { emoji: '🤗', label: '抱抱自己' },
  { emoji: '👋', label: '甩甩手' },
  { emoji: '😊', label: '对镜子微笑' }
];
const COMFORT_MAINS = [
  { emoji: '🎵', label: '听一首喜欢的歌' },
  { emoji: '🖍️', label: '画一幅画' },
  { emoji: '🚶', label: '散步5分钟' },
  { emoji: '📖', label: '读一个故事' },
  { emoji: '🧩', label: '玩一个小游戏' }
];
const COMFORT_DESSERTS = [
  { emoji: '🛁', label: '泡个热水澡' },
  { emoji: '🎬', label: '看喜欢的动画' },
  { emoji: '👨‍👩‍👧', label: '和家人聊天' },
  { emoji: '🌳', label: '去公园玩' },
  { emoji: '🍪', label: '做好吃的点心' }
];

// ─── Feelings Translator ────────────────────────────────────────────────────
const BEHAVIOR_FEELINGS = [
  { behavior: '摔门', emoji: '🚪', feelings: ['生气 — 觉得不公平', '无助 — 没人听我说', '受伤 — 感情被伤害了'] },
  { behavior: '不说话', emoji: '🤐', feelings: ['难过 — 心里很痛', '害怕 — 怕说错话', '失望 — 期望没被满足'] },
  { behavior: '哭', emoji: '😭', feelings: ['伤心 — 失去了什么', '委屈 — 被误解了', '感动 — 被温暖触动'] },
  { behavior: '发脾气', emoji: '💥', feelings: ['焦虑 — 压力太大了', '嫉妒 — 觉得不公平', '害怕 — 担心会失去'] },
  { behavior: '躲起来', emoji: '🏠', feelings: ['害羞 — 不想被注意', '疲惫 — 需要休息', '不安全 — 需要保护'] },
  { behavior: '不想上学', emoji: '📚', feelings: ['焦虑 — 担心考试或社交', '孤独 — 没有朋友', '无聊 — 觉得没意义'] }
];

// ─── Mindful Listening ──────────────────────────────────────────────────────
const LISTENING_PROMPTS = [
  '闭上眼睛，仔细听30秒，你能听到什么声音？',
  '试着找到最远处的声音，它在哪里？',
  '现在注意最近的声音，它是什么？',
  '有没有你之前没注意到的声音？',
  '哪个声音让你感到平静？'
];
const SOUND_CATEGORIES = [
  { emoji: '🐦', label: '鸟叫' },
  { emoji: '🚗', label: '车声' },
  { emoji: '💨', label: '风声' },
  { emoji: '🗣️', label: '人声' },
  { emoji: '🎵', label: '音乐' },
  { emoji: '⏰', label: '钟声' },
  { emoji: '🐕', label: '动物' },
  { emoji: '💧', label: '水声' },
  { emoji: '🍃', label: '树叶' },
  { emoji: '❓', label: '其他' }
];

// ─── Courage Coins ──────────────────────────────────────────────────────────
const COURAGE_TYPES = [
  { emoji: '🗣️', label: '勇敢说话', desc: '表达自己的想法' },
  { emoji: '🤝', label: '主动交友', desc: '和新朋友打招呼' },
  { emoji: '✋', label: '举手发言', desc: '在课堂上回答问题' },
  { emoji: '🎭', label: '尝试新事物', desc: '做没做过的事情' },
  { emoji: '💪', label: '面对困难', desc: '不放弃，坚持到底' },
  { emoji: '😊', label: '承认错误', desc: '诚实面对自己' }
];
const COIN_COLORS = ['bg-yellow-300', 'bg-amber-300', 'bg-orange-300', 'bg-yellow-400', 'bg-amber-400', 'bg-orange-400'];

// ─── Friendship Recipe ──────────────────────────────────────────────────────
const FRIENDSHIP_INGREDIENTS = [
  { emoji: '🤝', label: '信任', desc: '说到做到，保守秘密' },
  { emoji: '👂', label: '倾听', desc: '认真听朋友说话' },
  { emoji: '😊', label: '善良', desc: '对朋友温柔友善' },
  { emoji: '🤗', label: '关心', desc: '在朋友难过时陪伴' },
  { emoji: '🎉', label: '分享', desc: '分享快乐和好东西' },
  { emoji: '🙏', label: '尊重', desc: '尊重不同的想法' },
  { emoji: '😂', label: '幽默', desc: '一起笑，一起开心' },
  { emoji: '⏰', label: '耐心', desc: '友谊需要时间培养' }
];

// ─── Thought Bubbles ────────────────────────────────────────────────────────
const BUBBLE_SCENES = [
  { id: 'rain', emoji: '🌧️', scene: '下雨了，不能出去玩',
    characters: [
      { name: '小明', emoji: '👦' },
      { name: '小红', emoji: '👧' },
      { name: '妈妈', emoji: '👩' }
    ],
    example: ['太无聊了！', '可以在家画画！', '孩子们在家安全。'] },
  { id: 'test', emoji: '📝', scene: '明天要考试了',
    characters: [
      { name: '学生', emoji: '🧑‍🎓' },
      { name: '好朋友', emoji: '👫' },
      { name: '老师', emoji: '👨‍🏫' }
    ],
    example: ['我好紧张…', '我们一起复习吧！', '相信你们能做到。'] },
  { id: 'newfriend', emoji: '🏫', scene: '班上来了一位新同学',
    characters: [
      { name: '新同学', emoji: '🧒' },
      { name: '班长', emoji: '👧' },
      { name: '老师', emoji: '👩‍🏫' }
    ],
    example: ['好紧张，大家会喜欢我吗？', '我去跟新同学打招呼！', '大家欢迎新朋友。'] },
  { id: 'mistake', emoji: '😰', scene: '不小心打翻了牛奶',
    characters: [
      { name: '自己', emoji: '🧒' },
      { name: '弟弟/妹妹', emoji: '👶' },
      { name: '爸爸', emoji: '👨' }
    ],
    example: ['糟糕，我闯祸了…', '我来帮你擦！', '没关系，我们一起收拾。'] }
];

// ─── Calm Breathing Buddy ───────────────────────────────────────────────────
const BUDDY_ANIMALS = [
  { emoji: '🧸', name: '小熊', color: 'from-amber-100 to-yellow-100' },
  { emoji: '🐱', name: '小猫', color: 'from-orange-100 to-amber-100' },
  { emoji: '🐰', name: '小兔', color: 'from-pink-100 to-rose-100' },
  { emoji: '🐶', name: '小狗', color: 'from-blue-100 to-cyan-100' },
  { emoji: '🐼', name: '小熊猫', color: 'from-gray-100 to-white' }
];

// ─── Accomplishment Timeline ────────────────────────────────────────────────
const ACCOMPLISHMENT_TYPES = [
  { emoji: '⭐', label: '完成任务' },
  { emoji: '💪', label: '勇敢面对' },
  { emoji: '🤝', label: '帮助他人' },
  { emoji: '📚', label: '学到新东西' },
  { emoji: '🎨', label: '创造作品' },
  { emoji: '❤️', label: '善待自己' }
];

// ─── Sensory Countdown ──────────────────────────────────────────────────────
const SENSORY_STEPS = [
  { count: 5, sense: '看到', emoji: '👀', color: 'from-blue-200 to-cyan-200', placeholder: '我看到…' },
  { count: 4, sense: '听到', emoji: '👂', color: 'from-green-200 to-emerald-200', placeholder: '我听到…' },
  { count: 3, sense: '触摸到', emoji: '✋', color: 'from-yellow-200 to-amber-200', placeholder: '我摸到…' },
  { count: 2, sense: '闻到', emoji: '👃', color: 'from-pink-200 to-rose-200', placeholder: '我闻到…' },
  { count: 1, sense: '尝到', emoji: '👅', color: 'from-purple-200 to-indigo-200', placeholder: '我尝到…' }
];

// ─── Emotion Jar Experiment ─────────────────────────────────────────────────
const GLITTER_EMOTIONS = [
  { emoji: '😠', label: '生气', color: '#ef4444' },
  { emoji: '😰', label: '焦虑', color: '#a855f7' },
  { emoji: '😢', label: '难过', color: '#3b82f6' },
  { emoji: '😤', label: '挫败', color: '#f97316' },
  { emoji: '😔', label: '孤独', color: '#6366f1' }
];

// ─── Strength Trading Cards ─────────────────────────────────────────────────
const CARD_STRENGTHS = [
  { name: '勇气', emoji: '🦁', desc: '面对困难不退缩' },
  { name: '善良', emoji: '💝', desc: '对别人温柔友好' },
  { name: '创造力', emoji: '🎨', desc: '有很多好主意' },
  { name: '耐心', emoji: '🐢', desc: '能等待，不着急' },
  { name: '幽默', emoji: '😄', desc: '能让别人开心' },
  { name: '好奇心', emoji: '🔍', desc: '喜欢探索新事物' },
  { name: '坚持', emoji: '⛰️', desc: '不轻易放弃' },
  { name: '诚实', emoji: '⭐', desc: '说真话，守信用' },
  { name: '团队精神', emoji: '🤝', desc: '和别人合作很好' },
  { name: '感恩', emoji: '🙏', desc: '珍惜拥有的一切' }
];
const CARD_BORDERS = ['border-yellow-400', 'border-blue-400', 'border-red-400', 'border-green-400', 'border-purple-400'];

// ─── Mood DJ ────────────────────────────────────────────────────────────────
const DJ_SLIDERS = [
  { id: 'energy', label: '精力', low: '😴 低', high: '⚡ 高', color: 'accent-yellow-500' },
  { id: 'feeling', label: '心情', low: '😢 低落', high: '😊 开心', color: 'accent-green-500' },
  { id: 'calm', label: '平静', low: '😰 紧张', high: '😌 放松', color: 'accent-blue-500' }
];

// ─── Helpful Thoughts Vending Machine ───────────────────────────────────────
const NEGATIVE_COINS = [
  { thought: '没有人喜欢我', reframes: ['有些人在乎我，只是我现在看不到', '我也有让别人开心的时候', '不是每个人都不喜欢我，我有朋友和家人'] },
  { thought: '我什么都做不好', reframes: ['每个人都有擅长的事，我也一样', '做不好不代表永远做不好，我在学习', '我已经做到了很多事情'] },
  { thought: '事情永远不会好起来', reframes: ['难过的感觉会过去的，就像天气会变晴', '以前也有难过的时候，后来好了', '每一天都是新的开始'] },
  { thought: '都是我的错', reframes: ['很多事情不是一个人的错', '犯错是学习的一部分', '我可以下次做得更好，但现在不用自责'] },
  { thought: '我不够好', reframes: ['我不需要完美，我已经足够好了', '每个人都有独特的价值', '我正在努力，这就够了'] },
  { thought: '别人都比我强', reframes: ['每个人有不同的长处，比较没有意义', '我有别人没有的优点', '我只需要做最好的自己'] }
];

// ─── Feelings Mask Gallery ──────────────────────────────────────────────────
const MASK_EMOTIONS = [
  { emoji: '😊', label: '开心' }, { emoji: '😎', label: '酷' },
  { emoji: '😢', label: '难过' }, { emoji: '😠', label: '生气' },
  { emoji: '😰', label: '焦虑' }, { emoji: '😴', label: '疲惫' },
  { emoji: '🤗', label: '温暖' }, { emoji: '😔', label: '失落' },
  { emoji: '🤩', label: '兴奋' }, { emoji: '😌', label: '平静' }
];

// ─── Daily Anchor ───────────────────────────────────────────────────────────
const ANCHOR_SUGGESTIONS = [
  { emoji: '🎵', label: '听一首喜欢的歌' },
  { emoji: '🍦', label: '吃一个好吃的东西' },
  { emoji: '👫', label: '和朋友聊天' },
  { emoji: '📖', label: '读一个故事' },
  { emoji: '🎮', label: '玩一个小游戏' },
  { emoji: '🌳', label: '去外面走走' },
  { emoji: '🎨', label: '画一幅画' },
  { emoji: '🤗', label: '抱抱家人' }
];

// ─── Compliment Boomerang ───────────────────────────────────────────────────
const COMPLIMENT_STARTERS = [
  '你的笑容很温暖',
  '你很善良',
  '你做得真好',
  '你很勇敢',
  '和你在一起很开心',
  '你很有创意'
];
const BOOMERANG_FEELINGS = [
  { emoji: '😊', label: '开心' },
  { emoji: '🥰', label: '温暖' },
  { emoji: '💪', label: '有力量' },
  { emoji: '🌟', label: '有价值' },
  { emoji: '😌', label: '平静' },
  { emoji: '🤗', label: '被连接' }
];

// ─── Emotion Volume Control ─────────────────────────────────────────────────
const VOLUME_EMOTIONS = [
  { emoji: '😠', label: '生气', strategies: ['深呼吸3次', '数到10', '握拳再松开', '离开现场冷静', '说出你的感受'] },
  { emoji: '😰', label: '焦虑', strategies: ['4-4-4呼吸', '感官着陆', '告诉自己"我安全"', '动动身体', '找人聊聊'] },
  { emoji: '😢', label: '难过', strategies: ['允许自己哭', '抱抱自己', '写下感受', '听舒缓音乐', '和信任的人说'] },
  { emoji: '😤', label: '挫败', strategies: ['休息一下', '换个方法试试', '把问题分小步', '寻求帮助', '提醒自己进步'] }
];

// ─── Safe Words & Signals ───────────────────────────────────────────────────
const SIGNAL_TYPES = [
  { id: 'help', emoji: '🆘', label: '我需要帮助', desc: '当你需要大人帮忙时', color: 'from-red-100 to-pink-100' },
  { id: 'space', emoji: '🌙', label: '我需要独处', desc: '当你想安静一会儿时', color: 'from-blue-100 to-indigo-100' },
  { id: 'ok', emoji: '✅', label: '我没事', desc: '告诉别人你现在还好', color: 'from-green-100 to-emerald-100' },
  { id: 'talk', emoji: '💬', label: '我想聊聊', desc: '当你想找人说话时', color: 'from-purple-100 to-pink-100' }
];
const SIGNAL_IDEAS = [
  '竖起大拇指', '拉拉耳朵', '摸摸鼻子', '比心', '举手', '眨眨眼',
  '说"苹果"', '说"彩虹"', '说"安全"', '画一颗星星'
];

// ─── Emotion ABC Diary ──────────────────────────────────────────────────────
const ABC_EXAMPLES = [
  { a: '考试成绩不好', b: '我好笨', c: '难过、自卑', better: '一次考试不能代表我的全部，我可以下次更努力' },
  { a: '朋友没跟我玩', b: '他们不喜欢我', c: '孤独、伤心', better: '也许他们今天有别的事，我可以主动问问' },
  { a: '被老师批评', b: '我总是犯错', c: '害怕、沮丧', better: '老师批评是为了帮我进步，不代表我不好' }
];

// ─── Worry Balloon Release ──────────────────────────────────────────────────
const BALLOON_COLORS = ['bg-red-300', 'bg-blue-300', 'bg-green-300', 'bg-yellow-300', 'bg-purple-300', 'bg-pink-300'];

// ─── Feelings Bingo ─────────────────────────────────────────────────────────
const BINGO_SQUARES = [
  { emoji: '😊', label: '笑了' },
  { emoji: '💪', label: '感到骄傲' },
  { emoji: '🤝', label: '帮助了别人' },
  { emoji: '🌟', label: '尝试新事物' },
  { emoji: '🎵', label: '哼了歌' },
  { emoji: '🙏', label: '说了谢谢' },
  { emoji: '🏃', label: '动了身体' },
  { emoji: '📖', label: '学了新东西' },
  { emoji: '❤️', label: '感到被爱' }
];

// ─── Mirror Affirmation Challenge ───────────────────────────────────────────
const MIRROR_DAYS = [
  { day: 1, prompt: '对镜子说：我今天起床了，这很棒', level: '简单' },
  { day: 2, prompt: '对镜子说：我有一个很棒的笑容', level: '简单' },
  { day: 3, prompt: '对镜子说：我是一个善良的人', level: '中等' },
  { day: 4, prompt: '对镜子说：我值得被爱', level: '中等' },
  { day: 5, prompt: '对镜子说：我比我想象的更坚强', level: '挑战' },
  { day: 6, prompt: '对镜子说：我为自己感到骄傲', level: '挑战' },
  { day: 7, prompt: '对镜子说：我爱我自己', level: '勇者' }
];

// ─── Emotion Orchestra ──────────────────────────────────────────────────────
const ORCHESTRA_INSTRUMENTS = [
  { emoji: '🥁', label: '鼓（生气）', emotion: '生气', color: 'bg-red-200' },
  { emoji: '🎻', label: '小提琴（难过）', emotion: '难过', color: 'bg-blue-200' },
  { emoji: '🎺', label: '小号（兴奋）', emotion: '兴奋', color: 'bg-yellow-200' },
  { emoji: '🪈', label: '笛子（平静）', emotion: '平静', color: 'bg-green-200' },
  { emoji: '🎸', label: '吉他（焦虑）', emotion: '焦虑', color: 'bg-purple-200' },
  { emoji: '🎹', label: '钢琴（温柔）', emotion: '温柔', color: 'bg-pink-200' }
];

// ─── Problem Shrink Ray ─────────────────────────────────────────────────────
const SHRINK_QUESTIONS = [
  { emoji: '🔍', q: '这个问题里，哪个部分是你能控制的？' },
  { emoji: '👣', q: '最小的第一步是什么？' },
  { emoji: '🤝', q: '谁可以帮助你？' },
  { emoji: '⏰', q: '一年后这件事还重要吗？' },
  { emoji: '💡', q: '如果朋友遇到同样的问题，你会怎么建议？' }
];

// ─── Gratitude Glasses ──────────────────────────────────────────────────────
const ORDINARY_THINGS = [
  { thing: '我的床', emoji: '🛏️', reframe: '一个温暖舒适的地方，每天给我好好休息' },
  { thing: '我的书包', emoji: '🎒', reframe: '陪我去学校，装着我喜欢的东西' },
  { thing: '一杯水', emoji: '💧', reframe: '让我的身体保持健康，随时都能喝到' },
  { thing: '窗户', emoji: '🪟', reframe: '让我看到外面的世界，感受阳光和风' },
  { thing: '我的鞋子', emoji: '👟', reframe: '带我去任何想去的地方，保护我的脚' },
  { thing: '一支笔', emoji: '✏️', reframe: '帮我写下想法，画出梦想' }
];

// ─── Emotion Time Capsule ───────────────────────────────────────────────────
const CAPSULE_PROMPTS = [
  '现在你最强烈的感受是什么？',
  '今天发生了什么让你有这种感受？',
  '你希望7天后的自己感觉怎么样？',
  '给7天后的自己说一句话'
];

// ─── Kindness Ripple ────────────────────────────────────────────────────────
const RIPPLE_ACTS = [
  { emoji: '😊', label: '微笑' },
  { emoji: '🤗', label: '拥抱' },
  { emoji: '👋', label: '打招呼' },
  { emoji: '🎁', label: '分享东西' },
  { emoji: '👂', label: '认真倾听' },
  { emoji: '✉️', label: '写小纸条' },
  { emoji: '🙏', label: '说谢谢' },
  { emoji: '💪', label: '帮忙做事' }
];

// ─── Support Solar System ───────────────────────────────────────────────────
const PLANET_COLORS = ['bg-yellow-300', 'bg-blue-300', 'bg-red-300', 'bg-green-300', 'bg-purple-300', 'bg-orange-300', 'bg-pink-300', 'bg-cyan-300'];
const ORBIT_LABELS = ['最亲密', '很亲近', '比较亲近', '认识'];

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
  const todayKey = todayStr();
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
  const todayKey = todayStr();
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

function GuidedProgramPage({ week, progress, onComplete, onAdvance, onBack }) {
  const weekData = PROGRAM_WEEKS[week - 1];
  if (!weekData) return null;
  const weekProgress = progress[week] || { lessonsRead: [], toolsUsed: [], goalDone: false };
  const allLessonsRead = weekProgress.lessonsRead.length >= weekData.lessons.length;
  const canAdvance = allLessonsRead && weekProgress.goalDone && week < 8;

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji={weekData.emoji} title={`第${week}周：${weekData.title}`} subtitle={weekData.desc} />

      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">8周计划进度</p>
            <p className="text-2xl font-bold">第 {week} / 8 周</p>
          </div>
          <div className="flex gap-1">
            {PROGRAM_WEEKS.map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < week ? 'bg-white' : 'bg-white bg-opacity-30'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">📖 本周课程</h3>
        <div className="space-y-3">
          {weekData.lessons.map((lesson, i) => {
            const read = weekProgress.lessonsRead.includes(i);
            return (
              <button key={i} onClick={() => !read && onComplete(week, 'lesson', i)}
                className={`w-full text-left rounded-xl p-4 transition ${read ? 'bg-green-100' : 'bg-purple-50 hover:bg-purple-100'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{read ? '✅' : `${i + 1}.`}</span>
                  <p className="text-sm text-gray-700">{lesson}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">🛠️ 推荐工具</h3>
        <div className="space-y-2">
          {weekData.tools.map(toolId => {
            const tool = TOOL_PAGES.find(t => t.id === toolId);
            if (!tool) return null;
            const used = weekProgress.toolsUsed.includes(toolId);
            return (
              <div key={toolId} className={`flex items-center gap-3 rounded-xl p-3 ${used ? 'bg-green-50' : 'bg-gray-50'}`}>
                <span className="text-xl">{tool.emoji}</span>
                <span className="text-sm text-gray-700 flex-1">{tool.title}</span>
                <span className="text-xs text-gray-400">{used ? '✅ 已使用' : '待体验'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">🎯 本周目标：{weekData.goal}</h3>
        <button onClick={() => onComplete(week, 'goal')}
          className={`w-full py-3 rounded-xl font-semibold transition ${weekProgress.goalDone ? 'bg-green-100 text-green-700' : 'bg-yellow-400 text-white hover:bg-yellow-500'}`}>
          {weekProgress.goalDone ? '✅ 目标已完成！' : '标记完成'}
        </button>
      </div>

      {canAdvance && (
        <button onClick={() => onAdvance(week + 1)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition">
          进入第{week + 1}周 →
        </button>
      )}
    </div>
  );
}

function RiskScreeningPage({ history, onSubmit, onBack }) {
  const [answers, setAnswers] = useState({});
  const allAnswered = Object.keys(answers).length === SCREENING_QUESTIONS.length;

  const submit = () => {
    const score = Object.values(answers).reduce((sum, v) => sum + v, 0);
    const maxScore = SCREENING_QUESTIONS.length * 3;
    const level = score <= 3 ? 'low' : score <= 7 ? 'medium' : score <= 11 ? 'high' : 'critical';
    onSubmit({ answers, score, maxScore, level, date: new Date().toISOString() });
  };

  const levelInfo = {
    low: { emoji: '🌈', text: '你的状态看起来不错！继续保持', color: 'bg-green-100 text-green-700' },
    medium: { emoji: '💛', text: '有一些小困扰，试试工具箱里的小练习', color: 'bg-yellow-100 text-yellow-700' },
    high: { emoji: '🧡', text: '你可能需要跟信任的大人聊聊', color: 'bg-orange-100 text-orange-700' },
    critical: { emoji: '❤️', text: '请尽快告诉爸爸妈妈或老师你的感受', color: 'bg-red-100 text-red-700' }
  };

  const lastResult = history[history.length - 1];

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📋" title="心情体检" subtitle="这不是考试，没有对错，如实回答就好" />

      {lastResult && (
        <div className={`rounded-2xl p-4 ${levelInfo[lastResult.level].color}`}>
          <p className="font-semibold">{levelInfo[lastResult.level].emoji} 上次体检结果</p>
          <p className="text-sm mt-1">{levelInfo[lastResult.level].text}</p>
          <p className="text-xs mt-1 opacity-70">日期：{new Date(lastResult.date).toLocaleDateString('zh-CN')}</p>
        </div>
      )}

      <div className="space-y-4">
        {SCREENING_QUESTIONS.map((q, qi) => (
          <div key={q.id} className="bg-white rounded-2xl p-5 shadow-lg">
            <p className="font-semibold text-gray-800 mb-3">{qi + 1}. {q.text}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                  className={`w-full text-left p-3 rounded-xl transition text-sm ${answers[q.id] === oi ? 'bg-purple-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={submit} disabled={!allAnswered}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 hover:scale-105 transition">
        完成体检
      </button>

      {history.length > 1 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3">📊 历史记录</h3>
          <div className="space-y-2">
            {history.slice(-5).reverse().map((h, i) => (
              <div key={i} className={`rounded-xl p-3 ${levelInfo[h.level].color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{levelInfo[h.level].emoji} {levelInfo[h.level].text.slice(0, 15)}...</span>
                  <span className="text-xs opacity-70">{new Date(h.date).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SleepCoachPage({ log, onSave, onBack }) {
  const [bedtime, setBedtime] = useState('21:00');
  const [energy, setEnergy] = useState(3);
  const [windDownDone, setWindDownDone] = useState([]);

  const save = () => {
    onSave([...log, { date: new Date().toLocaleDateString('zh-CN'), bedtime, energy, windDown: windDownDone, timestamp: new Date().toISOString() }]);
    setBedtime('21:00'); setEnergy(3); setWindDownDone([]);
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="😴" title="睡眠教练" subtitle="好的睡眠是好心情的基础" />

      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-5 text-white shadow-lg text-center">
        <p className="text-sm opacity-90">推荐就寝时间</p>
        <p className="text-3xl font-bold my-1">21:00 - 21:30</p>
        <p className="text-xs opacity-80">小学生每天需要9-11小时睡眠</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">💡 睡眠小贴士</h3>
        <div className="space-y-3">
          {SLEEP_TIPS.map((tip, i) => (
            <div key={i} className="bg-indigo-50 rounded-xl p-3">
              <p className="font-semibold text-sm text-gray-800">{tip.emoji} {tip.tip}</p>
              <p className="text-xs text-gray-500 mt-1">原因：{tip.why}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">🌙 睡前放松活动</h3>
        <div className="space-y-2">
          {WIND_DOWN_ACTIVITIES.map((act, i) => (
            <button key={i} onClick={() => setWindDownDone(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
              className={`w-full flex items-center gap-3 rounded-xl p-3 transition ${windDownDone.includes(i) ? 'bg-green-100' : 'bg-purple-50 hover:bg-purple-100'}`}>
              <span className="text-xl">{act.emoji}</span>
              <span className="text-sm text-gray-700 flex-1">{act.name}</span>
              <span className="text-xs text-gray-400">{act.duration}</span>
              {windDownDone.includes(i) && <span>✅</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">📝 今晚记录</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">计划睡觉时间</p>
            <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
              className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">今天精力值 ({energy}/5)</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setEnergy(n)}
                  className={`w-10 h-10 rounded-full text-lg transition ${energy >= n ? 'bg-yellow-400 text-white' : 'bg-gray-100'}`}>
                  {n <= 2 ? '😴' : n <= 4 ? '😊' : '⚡'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={save}
          className="w-full mt-4 bg-indigo-500 text-white font-semibold py-3 rounded-xl hover:bg-indigo-600 transition">保存记录 🌙</button>
      </div>
    </div>
  );
}

function StoryJourneyPage({ progress, totalToolsUsed, onBack }) {
  const currentChapter = STORY_WORLD.chapters.find(c => totalToolsUsed < c.unlockTools) || STORY_WORLD.chapters[STORY_WORLD.chapters.length - 1];
  const prevChapters = STORY_WORLD.chapters.filter(c => totalToolsUsed >= c.unlockTools);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="⭐" title={`${STORY_WORLD.character.name}的旅程`} subtitle={STORY_WORLD.character.desc} />

      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-5 text-white shadow-lg text-center">
        <div className="text-5xl mb-2">{STORY_WORLD.character.emoji}</div>
        <p className="text-lg font-bold">{STORY_WORLD.character.name}</p>
        <p className="text-sm opacity-80">已使用 {totalToolsUsed} 个工具</p>
        <div className="mt-3 bg-white bg-opacity-20 rounded-full h-3">
          <div className="bg-yellow-400 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, (totalToolsUsed / 65) * 100)}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {STORY_WORLD.chapters.map(ch => {
          const unlocked = totalToolsUsed >= ch.unlockTools;
          const isCurrent = ch === currentChapter && !unlocked;
          return (
            <div key={ch.id} className={`rounded-2xl p-4 shadow ${unlocked ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : isCurrent ? 'bg-white border-2 border-purple-300' : 'bg-gray-100 opacity-50'}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{unlocked ? ch.emoji : '🔒'}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{ch.title}</p>
                  <p className="text-sm text-gray-600">{unlocked ? ch.reward : ch.desc}</p>
                  {isCurrent && <p className="text-xs text-purple-600 mt-1">还需使用 {ch.unlockTools - totalToolsUsed} 个工具解锁</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MicroMomentCard({ currentHour, log, onRespond }) {
  const todayKey = todayStr();
  const todayLog = log[todayKey] || {};
  const currentMoment = MICRO_MOMENTS.find(m => currentHour >= m.hour && currentHour < m.hour + 2 && !todayLog[m.hour]);
  if (!currentMoment) return null;

  return (
    <button onClick={() => onRespond(currentMoment.hour)}
      className="w-full bg-gradient-to-r from-cyan-100 to-blue-100 border-2 border-cyan-300 rounded-2xl p-4 text-left hover:scale-102 transition">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{currentMoment.emoji}</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-sm">{currentMoment.prompt}</p>
          <p className="text-xs text-gray-500 mt-1">点击完成</p>
        </div>
      </div>
    </button>
  );
}

function ParentEducationPage({ onBack }) {
  const [openLesson, setOpenLesson] = useState(null);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📚" title="家长课堂" subtitle="了解如何更好地帮助孩子" />

      <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-4">
        <p className="text-sm text-gray-700">💡 这些内容基于儿童心理学研究，帮助家长了解如何支持有情绪困扰的孩子。</p>
      </div>

      <div className="space-y-3">
        {PARENT_LESSONS.map(lesson => (
          <div key={lesson.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <button onClick={() => setOpenLesson(prev => prev === lesson.id ? null : lesson.id)}
              className="w-full p-5 text-left flex items-center gap-3">
              <span className="text-3xl">{lesson.emoji}</span>
              <span className="font-bold text-gray-800 flex-1">{lesson.title}</span>
              <span className="text-gray-400">{openLesson === lesson.id ? '▲' : '▼'}</span>
            </button>
            {openLesson === lesson.id && (
              <div className="px-5 pb-5 space-y-2">
                {lesson.content.map((line, i) => (
                  <p key={i} className={`text-sm ${line.startsWith('❌') ? 'text-red-600' : line.startsWith('✅') ? 'text-green-700' : line.startsWith('⚠️') || line.startsWith('💡') || line.startsWith('📞') ? 'text-orange-600 font-semibold' : 'text-gray-700'}`}>
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FamilyBoardPage({ board, onAdd, onBack }) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🏡" title="家庭留言板" subtitle="家人之间的温暖传递" />

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">📝 写一条留言</h3>
        <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="你的称呼（如：妈妈、爸爸、姐姐）"
          className="w-full p-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none mb-3" maxLength={10} />
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="写下你想对家人说的话..."
          className="w-full h-24 p-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none resize-none" maxLength={200} />
        <button onClick={() => { if (text.trim()) { onAdd({ text: text.trim(), author: author.trim() || '匿名', date: new Date().toLocaleString('zh-CN'), emoji: ['💗', '🌟', '🌈', '☀️', '🌸'][Math.floor(Math.random() * 5)] }); setText(''); setAuthor(''); } }}
          disabled={!text.trim()}
          className="w-full mt-3 bg-pink-500 text-white font-semibold py-3 rounded-xl disabled:opacity-50 hover:bg-pink-600 transition">贴到留言板 💌</button>
      </div>

      {board.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800">💌 留言 ({board.length})</h3>
          {board.slice().reverse().map((msg, i) => (
            <div key={i} className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{msg.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{msg.text}</p>
                  <p className="text-xs text-gray-500 mt-2">—— {msg.author} · {msg.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RewardMilestonesPage({ points, earned, onClaim, onBack }) {
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎖️" title="里程碑奖励" subtitle="每一步努力都值得纪念" />

      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-5 text-white shadow-lg text-center">
        <p className="text-sm opacity-90">当前积分</p>
        <p className="text-4xl font-bold my-2">{points}</p>
      </div>

      <div className="space-y-3">
        {MILESTONE_REWARDS.map(m => {
          const unlocked = points >= m.points;
          const claimed = earned.includes(m.points);
          return (
            <div key={m.points} className={`bg-white rounded-2xl p-5 shadow-lg ${!unlocked ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{unlocked ? m.emoji : '🔒'}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{m.title}</p>
                  <p className="text-sm text-gray-600">{m.reward}</p>
                  <p className="text-xs text-gray-400">{m.points} 积分</p>
                </div>
                {unlocked && !claimed && (
                  <button onClick={() => onClaim(m.points)}
                    className="bg-yellow-400 text-white px-4 py-2 rounded-xl font-semibold text-sm">领取</button>
                )}
                {claimed && <span className="text-green-500 font-semibold text-sm">✅ 已领取</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CoolDownTimer({ mood, onDone }) {
  const [seconds, setSeconds] = useState(60);
  const [phase, setPhase] = useState('inhale');
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(timerRef.current); onDone(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const cycle = seconds % 12;
    if (cycle >= 8) setPhase('inhale');
    else if (cycle >= 4) setPhase('hold');
    else setPhase('exhale');
  }, [seconds]);

  const phaseText = PHASE_TEXT;
  const circleSize = phase === 'inhale' ? 'scale-110' : phase === 'exhale' ? 'scale-90' : 'scale-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900">
      <div className="text-center text-white p-8">
        <p className="text-lg mb-2 opacity-80">先平静下来</p>
        <div className={`w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center transition-transform duration-2000 ${circleSize} shadow-2xl mb-6`}>
          <span className="text-5xl">{mood?.emoji || '🌊'}</span>
        </div>
        <p className="text-2xl font-bold mb-2">{phaseText[phase]}</p>
        <p className="text-6xl font-bold my-4">{seconds}</p>
        <p className="text-sm opacity-60">深呼吸，一切都会好起来的</p>
        <button onClick={() => { clearInterval(timerRef.current); onDone(); }}
          className="mt-8 px-6 py-3 bg-white bg-opacity-20 rounded-full text-sm hover:bg-opacity-30 transition">
          我已经平静了，跳过
        </button>
      </div>
    </div>
  );
}

function VoiceButton({ text }) {
  const speak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN'; u.rate = 0.85; u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    }
  };
  return (
    <button onClick={speak} className="inline-flex items-center gap-1 text-purple-500 hover:text-purple-700 transition" title="朗读">
      <span className="text-sm">🔊</span>
    </button>
  );
}

function DailyChallengePage({ challengesDone, onComplete, onBack }) {
  const todayKey = todayStr();
  const todayIdx = new Date().getDate() % DAILY_CHALLENGES.length;
  const todayChallenge = DAILY_CHALLENGES[todayIdx];
  const isDone = challengesDone[todayKey];

  const recentDone = Object.keys(challengesDone).sort().slice(-7);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎯" title="每日挑战" subtitle="每天一个小任务，慢慢变强" />

      <div className={`bg-gradient-to-br ${isDone ? 'from-green-400 to-emerald-400' : 'from-yellow-400 to-orange-400'} rounded-2xl p-6 text-white shadow-lg text-center`}>
        <p className="text-sm opacity-90">今日挑战</p>
        <div className="text-5xl my-3">{todayChallenge.emoji}</div>
        <p className="text-xl font-bold">{todayChallenge.text}</p>
        {!isDone ? (
          <button onClick={() => onComplete(todayKey)}
            className="mt-4 bg-white text-orange-500 font-bold px-6 py-3 rounded-xl hover:scale-105 transition">
            完成挑战！✓
          </button>
        ) : (
          <p className="mt-4 text-lg font-semibold">✅ 今天的挑战已完成！</p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">📅 最近7天</h3>
        <div className="flex gap-2 justify-center">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            const key = d.toDateString();
            const done = challengesDone[key];
            return (
              <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${done ? 'bg-green-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {d.getDate()}
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">完成了 {recentDone.length} 天</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">🎲 明天的挑战预告</h3>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <span className="text-2xl">{DAILY_CHALLENGES[(todayIdx + 1) % DAILY_CHALLENGES.length].emoji}</span>
          <p className="text-sm text-gray-600 mt-1">{DAILY_CHALLENGES[(todayIdx + 1) % DAILY_CHALLENGES.length].text}</p>
        </div>
      </div>
    </div>
  );
}

function ProgressTimelinePage({ moodHistory, toolUsageLog, streak, points, journalEntries, onBack }) {
  const weeks = [];
  const now = new Date();
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - (w * 7 + 6));
    const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() - w * 7);
    const weekMoods = moodHistory.filter(m => { const d = new Date(m.date); return d >= weekStart && d <= weekEnd; });
    const weekTools = toolUsageLog.filter(t => { const d = new Date(t.date); return d >= weekStart && d <= weekEnd; });
    const happyCount = weekMoods.filter(m => m.label === '开心' || m.label === '平静').length;
    weeks.push({ start: weekStart, moods: weekMoods, tools: weekTools, happyRatio: weekMoods.length > 0 ? Math.round((happyCount / weekMoods.length) * 100) : 0 });
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📈" title="成长时间线" subtitle="看看你这一个月的变化" />

      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-2xl font-bold">{streak}</p><p className="text-xs opacity-80">连续天数</p></div>
          <div><p className="text-2xl font-bold">{points}</p><p className="text-xs opacity-80">总积分</p></div>
          <div><p className="text-2xl font-bold">{journalEntries.length}</p><p className="text-xs opacity-80">日记数</p></div>
        </div>
      </div>

      <div className="space-y-3">
        {weeks.map((w, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-gray-800 text-sm">
                {i === 3 ? '本周' : i === 2 ? '上周' : `${3 - i}周前`}
              </p>
              <span className="text-xs text-gray-400">{w.moods.length} 次记录</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-4">
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-4 rounded-full transition-all" style={{ width: `${w.happyRatio}%` }} />
              </div>
              <span className="text-sm font-semibold text-gray-600">{w.happyRatio}%</span>
            </div>
            <div className="flex gap-1 mt-2">
              {w.moods.slice(-7).map((m, j) => <span key={j} className="text-lg">{m.emoji}</span>)}
            </div>
            <p className="text-xs text-gray-400 mt-1">使用了 {w.tools.length} 次工具</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeasonalPage({ season, onBack }) {
  const data = SEASONAL_CONTENT[season];
  if (!data) return null;

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji={data.emoji} title={data.title} subtitle={data.desc} />

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">💡 小贴士</h3>
        <div className="space-y-2">
          {data.tips.map((tip, i) => (
            <p key={i} className="text-sm text-gray-700 bg-yellow-50 rounded-xl p-3">• {tip}</p>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">🛠️ 推荐工具</h3>
        <div className="space-y-2">
          {data.tools.map(toolId => {
            const tool = TOOL_PAGES.find(t => t.id === toolId);
            if (!tool) return null;
            return (
              <div key={toolId} className={`flex items-center gap-3 bg-gradient-to-r ${tool.color} rounded-xl p-3`}>
                <span className="text-xl">{tool.emoji}</span>
                <span className="text-sm text-gray-700 flex-1">{tool.title}</span>
                <span className="text-xs text-gray-400">{tool.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CounselorDashboard({ moodHistory, toolUsageLog, journalEntries, sleepLog, screeningHistory, streak, notes, onAddNote, onBack }) {
  const [noteText, setNoteText] = useState('');

  const reportText = [
    `== 阳光小屋 - 学校心理咨询报告 ==`,
    `生成日期：${new Date().toLocaleDateString('zh-CN')}`,
    `连续使用天数：${streak}`,
    ``,
    `-- 近两周心情趋势 --`,
    moodHistory.slice(-14).map(m => `${new Date(m.date).toLocaleDateString('zh-CN')}: ${m.emoji} ${m.label}`).join('\n') || '暂无',
    ``,
    `-- 筛查记录 --`,
    screeningHistory.length > 0 ? screeningHistory.slice(-3).map(s => `${new Date(s.date).toLocaleDateString('zh-CN')}: 得分${s.score}/${s.maxScore} (${s.level})`).join('\n') : '暂无',
    ``,
    `-- 工具使用频率(近14天) --`,
    (() => { const c = {}; toolUsageLog.filter(t => new Date() - new Date(t.date) < 14*86400000).forEach(t => c[t.toolId] = (c[t.toolId]||0)+1); return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([id,n]) => { const t = TOOL_PAGES.find(p=>p.id===id); return t ? `${t.emoji} ${t.title}: ${n}次` : null; }).filter(Boolean).join('\n') || '暂无'; })(),
    ``,
    `-- 咨询师备注 --`,
    notes.length > 0 ? notes.map(n => `[${n.date}] ${n.text}`).join('\n') : '暂无备注'
  ].join('\n');

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🏫" title="学校咨询师看板" subtitle="仅限专业人员查看" />

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{reportText}</pre>
      </div>

      <button onClick={() => navigator.clipboard.writeText(reportText).catch(() => {})}
        className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition">📋 复制报告</button>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">📝 咨询师备注</h3>
        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="添加观察备注..."
          className="w-full h-20 p-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none" />
        <button onClick={() => { if (noteText.trim()) { onAddNote({ text: noteText.trim(), date: new Date().toLocaleDateString('zh-CN') }); setNoteText(''); } }}
          disabled={!noteText.trim()}
          className="w-full mt-2 bg-green-500 text-white font-semibold py-2 rounded-xl disabled:opacity-50">保存备注</button>
      </div>
    </div>
  );
}

function OfflineCardPage({ safetyPlan, userName, onBack }) {
  const cardContent = [
    `🆘 ${userName}的紧急卡片`,
    ``,
    `我的应对策略：`,
    `1. 深呼吸（吸4秒-屏4秒-呼4秒）`,
    `2. 5-4-3-2-1感官着陆`,
    `3. ${safetyPlan.strategies?.[0] || '找一个安全的地方'}`,
    ``,
    `可以找谁帮忙：`,
    safetyPlan.people?.[0]?.name ? `• ${safetyPlan.people[0].name}: ${safetyPlan.people[0].contact}` : '• 爸爸妈妈',
    ``,
    `求助热线：`,
    `• 希望24热线: 400-161-9995`,
    `• 青少年热线: 12355`,
    ``,
    `记住：这种感觉会过去的 💗`
  ].join('\n');

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🪪" title="紧急卡片" subtitle="打印或截图保存，以备不时之需" />

      <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">{cardContent}</pre>
      </div>

      <button onClick={() => navigator.clipboard.writeText(cardContent).catch(() => {})}
        className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-105 transition">
        📋 复制卡片内容
      </button>
      <p className="text-center text-xs text-gray-400">复制后可以粘贴到备忘录或打印出来随身携带</p>
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

// ─── Social Skills Role-Play ────────────────────────────────────────────────
function SocialRolePlayPage({ history, onComplete, onBack }) {
  const [current, setCurrent] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const available = SOCIAL_SCENARIOS.filter(s => !(history || []).includes(s.id));
  const scenarios = available.length > 0 ? available : SOCIAL_SCENARIOS;
  const scenario = scenarios[current % scenarios.length];

  const handleChoice = (choice) => {
    setChosen(choice);
    setScore(prev => prev + choice.score);
  };

  const handleNext = () => {
    if (current + 1 >= scenarios.length) {
      onComplete({ id: scenario.id, score, date: new Date().toLocaleDateString('zh-CN') });
      setCurrent(0); setChosen(null); setScore(0);
    } else {
      setCurrent(prev => prev + 1); setChosen(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎭" title="社交练习场" subtitle="在安全的环境里练习社交技巧" />
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{scenario.emoji}</span>
          <h3 className="font-bold text-gray-800">{scenario.title}</h3>
          <span className="ml-auto text-xs text-gray-400">{current + 1}/{scenarios.length}</span>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <p className="text-gray-700">{scenario.scene}</p>
        </div>
        <p className="text-sm font-semibold text-gray-600 mb-3">你会怎么做？</p>
        <div className="space-y-2">
          {scenario.choices.map((c, i) => (
            <button key={i} onClick={() => !chosen && handleChoice(c)}
              className={`w-full text-left rounded-xl p-4 transition ${chosen === c ? (c.score >= 2 ? 'bg-green-100 border-2 border-green-400' : 'bg-orange-100 border-2 border-orange-400') : chosen ? 'bg-gray-50 opacity-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <p className="text-sm text-gray-800">{c.text}</p>
              {chosen === c && <p className="text-xs mt-2 text-gray-600">{c.feedback}</p>}
            </button>
          ))}
        </div>
        {chosen && (
          <button onClick={handleNext} className="w-full mt-4 bg-purple-500 text-white rounded-xl py-3 font-bold hover:bg-purple-600">
            {current + 1 >= scenarios.length ? '完成练习 🎉' : '下一题 →'}
          </button>
        )}
      </div>
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-600">当前得分：<span className="font-bold text-purple-600">{score}</span> 分</p>
      </div>
    </div>
  );
}

// ─── Growth Mindset Lessons ─────────────────────────────────────────────────
function GrowthMindsetPage({ completed, onComplete, onBack }) {
  const [activeLesson, setActiveLesson] = useState(null);
  const [exerciseDone, setExerciseDone] = useState(false);

  if (activeLesson) {
    const lesson = GROWTH_LESSONS.find(l => l.id === activeLesson);
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => { setActiveLesson(null); setExerciseDone(false); }} />
        <div className="text-center">
          <div className="text-5xl mb-3">{lesson.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-800">{lesson.title}</h2>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <p className="text-gray-700 leading-relaxed mb-4">{lesson.content}</p>
          <div className="bg-yellow-50 rounded-xl p-4 mb-4">
            <p className="text-sm font-bold text-yellow-800 mb-1">🎯 小练习</p>
            <p className="text-sm text-gray-700">{lesson.exercise}</p>
          </div>
          {!exerciseDone ? (
            <button onClick={() => setExerciseDone(true)} className="w-full bg-green-500 text-white rounded-xl py-3 font-bold hover:bg-green-600">我做到了！ ✅</button>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-lg font-bold text-green-700">今日肯定</p>
                <p className="text-green-600 mt-1">{lesson.affirmation}</p>
              </div>
              <button onClick={() => { onComplete(lesson.id); setActiveLesson(null); setExerciseDone(false); }}
                className="w-full bg-purple-500 text-white rounded-xl py-3 font-bold hover:bg-purple-600">完成课程 🎉</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌱" title="成长思维" subtitle="学习让大脑越来越强大的秘密" />
      <div className="space-y-3">
        {GROWTH_LESSONS.map(lesson => {
          const done = (completed || []).includes(lesson.id);
          return (
            <button key={lesson.id} onClick={() => setActiveLesson(lesson.id)}
              className={`w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow hover:shadow-md transition ${done ? 'opacity-70' : ''}`}>
              <span className="text-3xl">{lesson.emoji}</span>
              <div className="text-left flex-1">
                <p className="font-bold text-gray-800">{lesson.title}</p>
                <p className="text-xs text-gray-500">{lesson.content.slice(0, 30)}...</p>
              </div>
              {done && <span className="text-green-500 text-lg">✅</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Positive Memory Vault ──────────────────────────────────────────────────
function MemoryVaultPage({ memories, onSave, onBack }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [tag, setTag] = useState(MEMORY_TAGS[0].label);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), detail: detail.trim(), tag, date: new Date().toLocaleDateString('zh-CN') });
    setTitle(''); setDetail(''); setTag(MEMORY_TAGS[0].label); setAdding(false);
  };

  const randomMemory = memories.length > 0 ? memories[Math.floor(Math.random() * memories.length)] : null;

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="💎" title="快乐记忆库" subtitle="收藏你最珍贵的快乐回忆" />
      {randomMemory && !adding && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-5 shadow-lg">
          <p className="text-xs text-orange-600 mb-1">✨ 随机美好记忆</p>
          <p className="font-bold text-gray-800">{randomMemory.title}</p>
          {randomMemory.detail && <p className="text-sm text-gray-600 mt-1">{randomMemory.detail}</p>}
          <p className="text-xs text-gray-400 mt-2">{randomMemory.date} · {randomMemory.tag}</p>
        </div>
      )}
      {adding ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="这个快乐记忆叫什么？"
            className="w-full border-2 border-purple-200 rounded-xl p-3 focus:border-purple-400 outline-none" />
          <textarea value={detail} onChange={e => setDetail(e.target.value)} placeholder="描述一下这个美好的瞬间..."
            className="w-full border-2 border-purple-200 rounded-xl p-3 h-24 focus:border-purple-400 outline-none" />
          <div className="flex flex-wrap gap-2">
            {MEMORY_TAGS.map(t => (
              <button key={t.label} onClick={() => setTag(t.label)}
                className={`px-3 py-1 rounded-full text-sm ${tag === t.label ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 bg-gray-200 rounded-xl py-3 font-bold text-gray-700">取消</button>
            <button onClick={handleSave} className="flex-1 bg-purple-500 text-white rounded-xl py-3 font-bold hover:bg-purple-600">保存 💎</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg hover:shadow-xl transition">+ 添加新记忆</button>
      )}
      {memories.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">我的记忆库 ({memories.length})</h3>
          {memories.slice().reverse().map((m, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow flex items-start gap-3">
              <span className="text-xl">{MEMORY_TAGS.find(t => t.label === m.tag)?.emoji || '💎'}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{m.title}</p>
                {m.detail && <p className="text-xs text-gray-500 mt-1">{m.detail}</p>}
                <p className="text-xs text-gray-400 mt-1">{m.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sensory Comfort Toolkit ────────────────────────────────────────────────
function SensoryToolkitPage({ myKit, onSave, onBack }) {
  const [kit, setKit] = useState(myKit || {});

  const toggle = (sense, item) => {
    setKit(prev => {
      const items = prev[sense] || [];
      const updated = items.includes(item) ? items.filter(i => i !== item) : [...items, item];
      return { ...prev, [sense]: updated };
    });
  };

  const totalItems = Object.values(kit).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧸" title="感官安慰包" subtitle="选择让你感到舒服的东西" />
      <div className="space-y-4">
        {SENSORY_ITEMS.map(sense => (
          <div key={sense.sense} className="bg-white rounded-2xl p-4 shadow">
            <h3 className="font-bold text-gray-800 mb-2">{sense.emoji} {sense.sense}觉</h3>
            <div className="flex flex-wrap gap-2">
              {sense.items.map(item => {
                const selected = (kit[sense.sense] || []).includes(item);
                return (
                  <button key={item} onClick={() => toggle(sense.sense, item)}
                    className={`text-xs px-3 py-2 rounded-full transition ${selected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {totalItems > 0 && (
        <button onClick={() => onSave(kit)} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg">
          保存我的安慰包 ({totalItems}个) 🧸
        </button>
      )}
    </div>
  );
}

// ─── Emotion Charades Game ──────────────────────────────────────────────────
function EmotionCharadesPage({ score: savedScore, onComplete, onBack }) {
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [recallText, setRecallText] = useState('');
  const [points, setPoints] = useState(0);
  const charade = CHARADE_ROUNDS[round % CHARADE_ROUNDS.length];

  const handleGuess = (option) => {
    setAnswer(option);
    if (option === charade.answer) setPoints(prev => prev + 10);
  };

  const handleRecallSubmit = () => {
    if (!recallText.trim()) return;
    setPoints(prev => prev + 15);
    setAnswer('done');
  };

  const handleNext = () => {
    if (round + 1 >= CHARADE_ROUNDS.length) {
      onComplete(points);
      setRound(0); setAnswer(null); setRecallText(''); setPoints(0);
    } else {
      setRound(prev => prev + 1); setAnswer(null); setRecallText('');
    }
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎮" title="情绪猜猜猜" subtitle="通过游戏认识更多情绪" />
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">第 {round + 1}/{CHARADE_ROUNDS.length} 轮</span>
        <span className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-bold text-yellow-700">⭐ {points}分</span>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        {charade.type === 'guess' ? (
          <>
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-gray-700">{charade.scenario}</p>
              <p className="text-sm font-bold text-blue-600 mt-2">这个人感觉怎么样？</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {charade.options.map(opt => (
                <button key={opt} onClick={() => !answer && handleGuess(opt)}
                  className={`rounded-xl py-3 font-bold transition ${answer ? (opt === charade.answer ? 'bg-green-400 text-white' : opt === answer ? 'bg-red-300 text-white' : 'bg-gray-100') : 'bg-gray-100 hover:bg-purple-100'}`}>
                  {opt}
                </button>
              ))}
            </div>
            {answer && (
              <p className={`text-center mt-3 font-bold ${answer === charade.answer ? 'text-green-600' : 'text-orange-600'}`}>
                {answer === charade.answer ? '答对了！🎉' : `正确答案是"${charade.answer}"，下次你一定能猜对！`}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="bg-purple-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-purple-600 font-bold mb-1">🤔 回忆时间 · {charade.emotion}</p>
              <p className="text-gray-700">{charade.prompt}</p>
            </div>
            {answer !== 'done' ? (
              <div className="space-y-3">
                <textarea value={recallText} onChange={e => setRecallText(e.target.value)} placeholder="写下你的回忆..."
                  className="w-full border-2 border-purple-200 rounded-xl p-3 h-20 outline-none focus:border-purple-400" />
                <button onClick={handleRecallSubmit} className="w-full bg-purple-500 text-white rounded-xl py-3 font-bold">提交回忆</button>
              </div>
            ) : (
              <p className="text-center text-green-600 font-bold">谢谢你的分享！🌟</p>
            )}
          </>
        )}
        {answer && (
          <button onClick={handleNext} className="w-full mt-4 bg-indigo-500 text-white rounded-xl py-3 font-bold hover:bg-indigo-600">
            {round + 1 >= CHARADE_ROUNDS.length ? '结束游戏 🏆' : '下一轮 →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Future Self Letter ─────────────────────────────────────────────────────
function FutureLetterPage({ letters, onSend, onBack }) {
  const [writing, setWriting] = useState(null);
  const [content, setContent] = useState('');
  const today = new Date();

  const deliveredLetters = (letters || []).filter(l => new Date(l.deliverDate) <= today);
  const pendingLetters = (letters || []).filter(l => new Date(l.deliverDate) > today);

  const handleSend = () => {
    if (!content.trim() || !writing) return;
    const deliverDate = new Date(today);
    deliverDate.setDate(deliverDate.getDate() + writing.delay);
    onSend({ content: content.trim(), delay: writing.label, sentDate: today.toLocaleDateString('zh-CN'), deliverDate: deliverDate.toISOString() });
    setContent(''); setWriting(null);
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="💌" title="给未来的信" subtitle="写一封信，未来的自己会收到" />
      {deliveredLetters.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-green-700">📬 已送达的信 ({deliveredLetters.length})</h3>
          {deliveredLetters.slice().reverse().map((l, i) => (
            <div key={i} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 shadow">
              <p className="text-xs text-green-600 mb-1">寄出于 {l.sentDate} · {l.delay}后送达</p>
              <p className="text-gray-800">{l.content}</p>
            </div>
          ))}
        </div>
      )}
      {writing ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <div className="text-center">
            <span className="text-3xl">{writing.emoji}</span>
            <p className="font-bold text-gray-800 mt-1">写给{writing.label}的自己</p>
            <p className="text-xs text-gray-500">{writing.hint}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">💡 写作提示：</p>
            {FUTURE_SELF_PROMPTS.map((p, i) => (
              <p key={i} className="text-xs text-gray-600">• {p}</p>
            ))}
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="亲爱的未来的我..." className="w-full border-2 border-indigo-200 rounded-xl p-3 h-32 outline-none focus:border-indigo-400" />
          <div className="flex gap-2">
            <button onClick={() => { setWriting(null); setContent(''); }} className="flex-1 bg-gray-200 rounded-xl py-3 font-bold text-gray-700">取消</button>
            <button onClick={handleSend} className="flex-1 bg-indigo-500 text-white rounded-xl py-3 font-bold hover:bg-indigo-600">寄出 📮</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 text-center">选择你想写信给什么时候的自己：</p>
          {LETTER_PROMPTS.map(lp => (
            <button key={lp.delay} onClick={() => setWriting(lp)}
              className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow hover:shadow-md transition">
              <span className="text-3xl">{lp.emoji}</span>
              <div className="text-left">
                <p className="font-bold text-gray-800">{lp.label}后的我</p>
                <p className="text-xs text-gray-500">{lp.hint}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {pendingLetters.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-indigo-700">📨 等待送达 ({pendingLetters.length})</h3>
          {pendingLetters.map((l, i) => (
            <div key={i} className="bg-indigo-50 rounded-xl p-3">
              <p className="text-xs text-indigo-600">寄出于 {l.sentDate} · {l.delay}后送达</p>
              <p className="text-xs text-gray-400">信件内容保密中... 🔒</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mindful Movement & Dance ───────────────────────────────────────────────
function DanceMovementPage({ onComplete, onBack }) {
  const [active, setActive] = useState(null);
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (active === null) return;
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(id);
  }, [active, timer]);

  if (active !== null) {
    const exercise = MOVEMENT_EXERCISES[active];
    const currentStep = exercise.steps[step];
    const isLast = step >= exercise.steps.length - 1;

    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => { setActive(null); setStep(0); setTimer(0); }} />
        <div className="text-center">
          <div className="text-5xl mb-3">{exercise.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-800">{exercise.title}</h2>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="text-6xl font-mono text-purple-600 mb-4">{fmtTime(timer)}</div>
          <div className="bg-purple-50 rounded-xl p-5 mb-4">
            <p className="text-sm text-gray-500 mb-1">第 {step + 1}/{exercise.steps.length} 步</p>
            <p className="text-lg font-bold text-gray-800">{currentStep}</p>
          </div>
          <button onClick={() => {
            if (isLast) { onComplete(exercise.id); setActive(null); setStep(0); setTimer(0); }
            else setStep(prev => prev + 1);
          }} className="w-full bg-green-500 text-white rounded-xl py-3 font-bold hover:bg-green-600">
            {isLast ? '完成！🎉' : '下一步 →'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="💃" title="快乐律动" subtitle="用身体动一动，赶走不开心" />
      <div className="space-y-3">
        {MOVEMENT_EXERCISES.map((ex, i) => (
          <button key={ex.id} onClick={() => { setActive(i); setStep(0); setTimer(ex.duration); }}
            className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow hover:shadow-md transition">
            <span className="text-3xl">{ex.emoji}</span>
            <div className="text-left flex-1">
              <p className="font-bold text-gray-800">{ex.title}</p>
              <p className="text-xs text-gray-500">{ex.steps.length}步 · {Math.floor(ex.duration / 60)}分钟</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Worry Time Scheduler ───────────────────────────────────────────────────
function WorryTimePage({ parkedWorries, processedWorries, onPark, onProcess, onBack }) {
  const [newWorry, setNewWorry] = useState('');
  const [processing, setProcessing] = useState(null);
  const [processChoice, setProcessChoice] = useState(null);

  const handlePark = () => {
    if (!newWorry.trim()) return;
    onPark({ text: newWorry.trim(), date: new Date().toLocaleDateString('zh-CN'), time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) });
    setNewWorry('');
  };

  const handleProcess = () => {
    if (!processChoice) return;
    onProcess({ ...processing, resolution: processChoice.label });
    setProcessing(null); setProcessChoice(null);
  };

  const unprocessed = (parkedWorries || []).filter(w => !(processedWorries || []).some(p => p.text === w.text && p.date === w.date));

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🕐" title="烦恼时间" subtitle="把烦恼放到专门的时间再想" />
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4">
        <p className="text-sm text-gray-600">💡 遇到烦恼？先"停一下"，把它记下来，到烦恼时间再处理。这样一天中其他时间就可以安心做别的事情。</p>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">📥 停一下，先记下来</h3>
        <div className="flex gap-2">
          <input value={newWorry} onChange={e => setNewWorry(e.target.value)} placeholder="写下你的烦恼..."
            className="flex-1 border-2 border-blue-200 rounded-xl p-3 outline-none focus:border-blue-400" />
          <button onClick={handlePark} className="bg-blue-500 text-white px-4 rounded-xl font-bold hover:bg-blue-600">记下</button>
        </div>
      </div>
      {unprocessed.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3">🕐 烦恼时间到了（{unprocessed.length}个待处理）</h3>
          {processing ? (
            <div className="space-y-3">
              <div className="bg-orange-50 rounded-xl p-3">
                <p className="text-sm text-gray-700">"{processing.text}"</p>
              </div>
              <p className="text-sm font-bold text-gray-600">想想看，你想怎么处理它？</p>
              {WORRY_PROCESS_OPTIONS.map((opt, i) => (
                <button key={i} onClick={() => setProcessChoice(opt)}
                  className={`w-full text-left rounded-xl p-3 text-sm transition ${processChoice === opt ? 'bg-purple-100 border-2 border-purple-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  {opt.emoji} {opt.label}
                </button>
              ))}
              {processChoice && (
                <button onClick={handleProcess} className="w-full bg-green-500 text-white rounded-xl py-3 font-bold">处理完毕 ✅</button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {unprocessed.map((w, i) => (
                <button key={i} onClick={() => setProcessing(w)}
                  className="w-full flex items-center gap-3 bg-orange-50 rounded-xl p-3 text-left hover:bg-orange-100 transition">
                  <span className="text-lg">😟</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{w.text}</p>
                    <p className="text-xs text-gray-400">{w.date} {w.time}</p>
                  </div>
                  <span className="text-xs text-purple-500 font-bold">处理</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {(processedWorries || []).length > 0 && (
        <div className="bg-green-50 rounded-2xl p-4">
          <h3 className="font-bold text-green-700 mb-2">✅ 已处理 ({processedWorries.length})</h3>
          {(processedWorries || []).slice(-5).reverse().map((w, i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <span className="text-xs text-green-600">✓</span>
              <span className="text-xs text-gray-600">{w.text}</span>
              <span className="text-xs text-gray-400 ml-auto">{w.resolution}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Acts of Courage Tracker ────────────────────────────────────────────────
function CourageTrackerPage({ courageLog, onAdd, onBack }) {
  const [category, setCategory] = useState(null);
  const [custom, setCustom] = useState('');

  const handleAdd = (text) => {
    onAdd({ text, category: category.label, date: new Date().toLocaleDateString('zh-CN') });
    setCategory(null); setCustom('');
  };

  const treeStage = (courageLog || []).length;
  const treeEmoji = treeStage >= 20 ? '🌳' : treeStage >= 10 ? '🌲' : treeStage >= 5 ? '🌿' : treeStage >= 1 ? '🌱' : '🫘';

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🦁" title="勇气追踪器" subtitle="记录每一个勇敢的时刻" />
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-5 text-center shadow-lg">
        <div className="text-5xl mb-2">{treeEmoji}</div>
        <p className="font-bold text-gray-800">我的勇气树</p>
        <p className="text-sm text-gray-600">{treeStage}个勇敢时刻</p>
        <div className="w-full bg-white rounded-full h-3 mt-3">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, treeStage * 5)}%` }}></div>
        </div>
      </div>
      {category ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="font-bold text-gray-800">{category.emoji} {category.label}</h3>
          <div className="space-y-2">
            {category.examples.map((ex, i) => (
              <button key={i} onClick={() => handleAdd(ex)}
                className="w-full text-left bg-yellow-50 rounded-xl p-3 text-sm text-gray-700 hover:bg-yellow-100 transition">{ex}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={custom} onChange={e => setCustom(e.target.value)} placeholder="或者写自己的勇敢时刻..."
              className="flex-1 border-2 border-yellow-200 rounded-xl p-3 outline-none text-sm focus:border-yellow-400" />
            <button onClick={() => custom.trim() && handleAdd(custom.trim())} className="bg-orange-500 text-white px-4 rounded-xl font-bold hover:bg-orange-600">记录</button>
          </div>
          <button onClick={() => setCategory(null)} className="w-full text-gray-500 text-sm">← 返回选择</button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 text-center">选择一种勇气类型：</p>
          {COURAGE_CATEGORIES.map(cat => (
            <button key={cat.label} onClick={() => setCategory(cat)}
              className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow hover:shadow-md transition">
              <span className="text-3xl">{cat.emoji}</span>
              <div className="text-left">
                <p className="font-bold text-gray-800">{cat.label}</p>
                <p className="text-xs text-gray-500">{cat.examples[0]}...</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {(courageLog || []).length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">勇气记录</h3>
          {(courageLog || []).slice().reverse().slice(0, 10).map((c, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
              <span className="text-lg">{COURAGE_CATEGORIES.find(cat => cat.label === c.category)?.emoji || '🦁'}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{c.text}</p>
                <p className="text-xs text-gray-400">{c.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Progressive Muscle Relaxation ──────────────────────────────────────────
function MuscleRelaxPage({ onComplete, onBack }) {
  const [step, setStep] = useState(-1);
  const [phase, setPhase] = useState('ready');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0 || phase === 'ready') return;
    const id = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (phase === 'tense') { setPhase('relax'); return MUSCLE_GROUPS[step].duration; }
          if (phase === 'relax') {
            if (step + 1 < MUSCLE_GROUPS.length) { setStep(s => s + 1); setPhase('tense'); return MUSCLE_GROUPS[step + 1].duration; }
            else { setPhase('done'); return 0; }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timer, phase, step]);

  const startSession = () => {
    setStep(0); setPhase('tense'); setTimer(MUSCLE_GROUPS[0].duration);
  };

  if (phase === 'done') {
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={onBack} />
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">放松完成！</h2>
          <p className="text-gray-600 mb-6">你的全身现在应该感觉暖暖的、软软的、很轻松。</p>
          <button onClick={() => { onComplete(); setStep(-1); setPhase('ready'); }}
            className="bg-green-500 text-white rounded-2xl px-8 py-4 font-bold text-lg hover:bg-green-600">太棒了！ 🎉</button>
        </div>
      </div>
    );
  }

  if (step >= 0 && phase !== 'ready') {
    const group = MUSCLE_GROUPS[step];
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => { setStep(-1); setPhase('ready'); setTimer(0); }} />
        <div className="text-center">
          <p className="text-sm text-gray-500">第 {step + 1}/{MUSCLE_GROUPS.length} 个部位</p>
          <div className="text-5xl my-3">{group.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-800">{group.name}</h2>
        </div>
        <div className={`rounded-2xl p-6 text-center shadow-lg ${phase === 'tense' ? 'bg-gradient-to-b from-orange-100 to-red-100' : 'bg-gradient-to-b from-blue-100 to-green-100'}`}>
          <p className="text-4xl font-mono font-bold mb-4">{timer}</p>
          <p className="text-lg font-bold mb-2">{phase === 'tense' ? '用力！💪' : '放松... 😌'}</p>
          <p className="text-gray-700">{phase === 'tense' ? group.tense : group.relax}</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${((step + (phase === 'relax' ? 0.5 : 0)) / MUSCLE_GROUPS.length) * 100}%` }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧘" title="全身放松操" subtitle="一个一个部位，慢慢放松" />
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <p className="text-gray-600 mb-4">我们会练习7个身体部位：先用力绷紧，然后突然放松。你会感受到紧张和放松的区别！</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {MUSCLE_GROUPS.map(g => (
            <div key={g.id} className="text-center">
              <div className="text-2xl">{g.emoji}</div>
              <p className="text-xs text-gray-500">{g.name}</p>
            </div>
          ))}
        </div>
        <button onClick={startSession} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-4 font-bold text-lg hover:shadow-lg transition">开始放松 🌈</button>
      </div>
      <div className="bg-blue-50 rounded-2xl p-4">
        <p className="text-sm text-gray-600">💡 小贴士：找一个安静舒服的地方坐下或躺下。可以闭上眼睛，跟着指示一步一步做。</p>
      </div>
    </div>
  );
}

// ─── Positive Self-Talk Coach ────────────────────────────────────────────────
function SelfTalkPage({ entries, onSave, onBack }) {
  const [current, setCurrent] = useState(0);
  const [myPositive, setMyPositive] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const thought = NEGATIVE_THOUGHTS[current % NEGATIVE_THOUGHTS.length];

  const handleSave = () => {
    const text = myPositive.trim() || thought.balanced;
    onSave({ negative: thought.negative, positive: text, category: thought.category, date: todayDate() });
    setMyPositive(''); setShowAnswer(false);
    setCurrent(prev => (prev + 1) % NEGATIVE_THOUGHTS.length);
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🗣️" title="积极自我对话" subtitle="把消极想法变成积极力量" />
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <p className="text-xs text-gray-400 mb-2">第 {current + 1}/{NEGATIVE_THOUGHTS.length} 个想法 · {thought.category}</p>
        <div className="bg-red-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-red-400 mb-1">❌ 消极想法</p>
          <p className="text-lg font-bold text-red-700">"{thought.negative}"</p>
        </div>
        <p className="text-sm font-semibold text-gray-600 mb-2">你能把它变成积极的吗？</p>
        <textarea value={myPositive} onChange={e => setMyPositive(e.target.value)}
          placeholder="试着写一个更积极、更平衡的想法..."
          className="w-full border-2 border-green-200 rounded-xl p-3 h-20 outline-none focus:border-green-400 mb-3" />
        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)} className="w-full bg-gray-100 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-200">💡 看看参考答案</button>
        ) : (
          <div className="bg-green-50 rounded-xl p-4 mb-3">
            <p className="text-xs text-green-500 mb-1">✅ 平衡的想法</p>
            <p className="text-green-700">"{thought.balanced}"</p>
          </div>
        )}
        <button onClick={handleSave} className="w-full mt-3 bg-green-500 text-white rounded-xl py-3 font-bold hover:bg-green-600">记录这个转变 🌟</button>
      </div>
      {(entries || []).length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">我的转变记录 ({entries.length})</h3>
          {(entries || []).slice().reverse().slice(0, 5).map((e, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-red-400 line-through">{e.negative}</p>
              <p className="text-sm text-green-700 font-semibold mt-1">→ {e.positive}</p>
              <p className="text-xs text-gray-400 mt-1">{e.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Support Network Map ────────────────────────────────────────────────────
function SupportNetworkPage({ network, onSave, onBack }) {
  const [editRole, setEditRole] = useState(null);
  const [name, setName] = useState('');
  const [topics, setTopics] = useState([]);

  const handleAdd = () => {
    if (!name.trim() || !editRole) return;
    const entry = { role: editRole.label, name: name.trim(), topics, emoji: editRole.emoji };
    onSave([...(network || []), entry]);
    setName(''); setTopics([]); setEditRole(null);
  };

  const handleRemove = (idx) => {
    onSave((network || []).filter((_, i) => i !== idx));
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🗺️" title="支持网络" subtitle="找到你身边可以信任的人" />
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4">
        <p className="text-sm text-gray-600">💡 每个人身边都有可以帮助自己的人。画出你的支持网络，知道不同的事情可以找谁聊。</p>
      </div>
      {editRole ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="font-bold text-gray-800">{editRole.emoji} 添加{editRole.label}</h3>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={editRole.hint}
            className="w-full border-2 border-blue-200 rounded-xl p-3 outline-none focus:border-blue-400" />
          <p className="text-sm text-gray-600">可以和TA聊什么？</p>
          <div className="flex flex-wrap gap-2">
            {TALK_TOPICS.map(t => (
              <button key={t} onClick={() => setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                className={`px-3 py-1 rounded-full text-xs ${topics.includes(t) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{t}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditRole(null); setName(''); setTopics([]); }} className="flex-1 bg-gray-200 rounded-xl py-3 font-bold text-gray-700">取消</button>
            <button onClick={handleAdd} className="flex-1 bg-blue-500 text-white rounded-xl py-3 font-bold hover:bg-blue-600">添加</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {NETWORK_ROLES.map(role => {
            const people = (network || []).filter(n => n.role === role.label);
            return (
              <div key={role.label} className="bg-white rounded-2xl p-4 shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">{role.emoji} {role.label}</h3>
                  <button onClick={() => setEditRole(role)} className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">+ 添加</button>
                </div>
                {people.length > 0 ? people.map((p, i) => {
                  const idx = (network || []).indexOf(p);
                  return (
                    <div key={i} className="flex items-center gap-2 bg-blue-50 rounded-xl p-3 mb-1">
                      <span className="font-semibold text-gray-800 flex-1">{p.name}</span>
                      <div className="flex flex-wrap gap-1">{(p.topics || []).map(t => <span key={t} className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-500">{t}</span>)}</div>
                      <button onClick={() => handleRemove(idx)} className="text-red-400 text-xs ml-1">×</button>
                    </div>
                  );
                }) : <p className="text-xs text-gray-400">{role.hint}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Responsibility Pie ─────────────────────────────────────────────────────
function ResponsibilityPiePage({ entries, onSave, onBack }) {
  const [mode, setMode] = useState('learn');
  const [activeScenario, setActiveScenario] = useState(0);
  const [customSituation, setCustomSituation] = useState('');
  const [customFactors, setCustomFactors] = useState([{ label: '', pct: 0 }]);

  const scenario = PIE_SCENARIOS[activeScenario];

  const addFactor = () => setCustomFactors(prev => [...prev, { label: '', pct: 0 }]);
  const updateFactor = (i, field, val) => setCustomFactors(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f));
  const totalPct = customFactors.reduce((sum, f) => sum + (parseInt(f.pct) || 0), 0);

  const handleSaveCustom = () => {
    if (!customSituation.trim() || customFactors.filter(f => f.label.trim()).length === 0) return;
    onSave({ situation: customSituation.trim(), factors: customFactors.filter(f => f.label.trim()), date: todayDate() });
    setCustomSituation(''); setCustomFactors([{ label: '', pct: 0 }]); setMode('learn');
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🥧" title="责任饼图" subtitle="事情的原因不只一个" />
      <div className="flex gap-2">
        <button onClick={() => setMode('learn')} className={`flex-1 py-2 rounded-xl font-bold text-sm ${mode === 'learn' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}>学习示例</button>
        <button onClick={() => setMode('create')} className={`flex-1 py-2 rounded-xl font-bold text-sm ${mode === 'create' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}>创建我的</button>
      </div>
      {mode === 'learn' ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <div className="flex gap-2 mb-4">
            {PIE_SCENARIOS.map((s, i) => (
              <button key={i} onClick={() => setActiveScenario(i)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold ${activeScenario === i ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50'}`}>{s.situation}</button>
            ))}
          </div>
          <h3 className="font-bold text-gray-800 mb-3">"{scenario.situation}" 的原因：</h3>
          <div className="space-y-2">
            {scenario.factors.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${PIE_COLORS[i % PIE_COLORS.length]} flex items-center justify-center text-white text-xs font-bold`}>{f.pct}%</div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-3 ${PIE_COLORS[i % PIE_COLORS.length]} rounded-full`} style={{ width: `${f.pct}%` }}></div>
                  </div>
                </div>
                <span className="text-sm text-gray-700 w-32 text-right">{f.label}</span>
              </div>
            ))}
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 mt-4">
            <p className="text-sm text-gray-600">💡 看到了吗？很少有事情100%是一个人的错。当你觉得"都是我的错"时，想想还有哪些其他原因。</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <input value={customSituation} onChange={e => setCustomSituation(e.target.value)} placeholder="写下让你自责的事情..."
            className="w-full border-2 border-purple-200 rounded-xl p-3 outline-none focus:border-purple-400" />
          <p className="text-sm text-gray-600">想想有哪些原因？每个原因占多少比例？</p>
          {customFactors.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input value={f.label} onChange={e => updateFactor(i, 'label', e.target.value)} placeholder={`原因${i + 1}`}
                className="flex-1 border rounded-xl p-2 text-sm outline-none" />
              <input type="number" value={f.pct} onChange={e => updateFactor(i, 'pct', e.target.value)} placeholder="%" min="0" max="100"
                className="w-16 border rounded-xl p-2 text-sm text-center outline-none" />
              <span className="text-xs text-gray-400 self-center">%</span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <button onClick={addFactor} className="text-sm text-purple-500 font-bold">+ 添加原因</button>
            <span className={`text-sm font-bold ${totalPct === 100 ? 'text-green-600' : 'text-orange-500'}`}>总计: {totalPct}%</span>
          </div>
          <button onClick={handleSaveCustom} className="w-full bg-purple-500 text-white rounded-xl py-3 font-bold hover:bg-purple-600">保存我的饼图 🥧</button>
        </div>
      )}
      {(entries || []).length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">我的饼图 ({entries.length})</h3>
          {(entries || []).slice().reverse().slice(0, 5).map((e, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
              <p className="font-semibold text-gray-800 text-sm">{e.situation}</p>
              <div className="flex flex-wrap gap-1 mt-1">{e.factors.map((f, j) => <span key={j} className="text-xs bg-purple-50 px-2 py-0.5 rounded-full">{f.label} {f.pct}%</span>)}</div>
              <p className="text-xs text-gray-400 mt-1">{e.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Calm Down Menu ─────────────────────────────────────────────────────────
function CalmDownMenuPage({ ratings, onRate, onNavigate, onBack }) {
  const [distressLevel, setDistressLevel] = useState(5);

  const sorted = [...CALM_STRATEGIES].sort((a, b) => ((ratings || {})[b.title] || 0) - ((ratings || {})[a.title] || 0));

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧊" title="冷静菜单" subtitle="选一个最适合你的冷静方法" />
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <p className="text-sm text-gray-600 mb-2">你现在有多烦躁？(1-10)</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-500">1</span>
          <input type="range" min="1" max="10" value={distressLevel} onChange={e => setDistressLevel(parseInt(e.target.value))}
            className="flex-1 accent-purple-500" />
          <span className="text-sm text-red-500">10</span>
          <span className="text-2xl ml-2">{distressLevel <= 3 ? '😌' : distressLevel <= 6 ? '😟' : '😫'}</span>
        </div>
      </div>
      <div className="space-y-2">
        {sorted.map((s, i) => {
          const rating = (ratings || {})[s.title] || 0;
          return (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
              <span className="text-2xl">{s.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm">{s.title}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-0.5">
                  {[1,2,3].map(star => (
                    <button key={star} onClick={() => onRate(s.title, star)}
                      className={`text-xs ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                  ))}
                </div>
                {s.page && <button onClick={() => onNavigate(s.page)} className="text-xs text-purple-500 font-bold">去试试</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Skill Mastery Tree ─────────────────────────────────────────────────────
function SkillTreePage({ toolUsageLog, onNavigate, onBack }) {
  const usedTools = new Set((toolUsageLog || []).map(l => l.toolId || l));

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌳" title="技能树" subtitle="看看你解锁了多少技能" />
      {SKILL_BRANCHES.map(branch => {
        const unlocked = branch.skills.filter(s => usedTools.has(s.tool)).length;
        const total = branch.skills.length;
        return (
          <div key={branch.id} className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{branch.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{branch.name}</h3>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all" style={{ width: `${(unlocked / total) * 100}%` }}></div>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-500">{unlocked}/{total}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {branch.skills.map(skill => {
                const done = usedTools.has(skill.tool);
                return (
                  <button key={skill.tool} onClick={() => onNavigate(skill.tool)}
                    className={`flex items-center gap-2 rounded-xl p-2 text-left text-sm transition ${done ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                    <span>{done ? '✅' : '🔒'}</span>
                    <span>{skill.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-600">总共解锁: <span className="font-bold text-purple-600">{SKILL_BRANCHES.reduce((sum, b) => sum + b.skills.filter(s => usedTools.has(s.tool)).length, 0)}</span> / {SKILL_BRANCHES.reduce((sum, b) => sum + b.skills.length, 0)} 技能</p>
      </div>
    </div>
  );
}

// ─── Boundary Setting ───────────────────────────────────────────────────────
function BoundaryPage({ practiced, onPractice, onBack }) {
  const [active, setActive] = useState(null);
  const [myResponse, setMyResponse] = useState('');

  if (active !== null) {
    const scenario = BOUNDARY_SCENARIOS[active];
    const done = (practiced || []).includes(scenario.title);
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => { setActive(null); setMyResponse(''); }} />
        <div className="text-center">
          <div className="text-5xl mb-3">{scenario.emoji}</div>
          <h2 className="text-xl font-bold text-gray-800">{scenario.title}</h2>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4">
          <p className="text-gray-700">{scenario.scene}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <p className="text-sm font-bold text-gray-600">你会怎么说？</p>
          <textarea value={myResponse} onChange={e => setMyResponse(e.target.value)} placeholder="写下你会怎么回应..."
            className="w-full border-2 border-orange-200 rounded-xl p-3 h-20 outline-none focus:border-orange-400" />
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs text-green-500 mb-1">💡 参考回应</p>
            <p className="text-green-700 font-semibold">"{scenario.good}"</p>
            <p className="text-xs text-gray-500 mt-2">{scenario.why}</p>
          </div>
          {!done && (
            <button onClick={() => { onPractice(scenario.title); setActive(null); setMyResponse(''); }}
              className="w-full bg-orange-500 text-white rounded-xl py-3 font-bold hover:bg-orange-600">完成练习 💪</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🛑" title="边界练习" subtitle="学会温柔而坚定地说'不'" />
      <div className="space-y-3">
        {BOUNDARY_SCENARIOS.map((s, i) => {
          const done = (practiced || []).includes(s.title);
          return (
            <button key={i} onClick={() => setActive(i)}
              className={`w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow hover:shadow-md transition ${done ? 'opacity-70' : ''}`}>
              <span className="text-3xl">{s.emoji}</span>
              <div className="text-left flex-1">
                <p className="font-bold text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500">{s.scene.slice(0, 25)}...</p>
              </div>
              {done && <span className="text-green-500">✅</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Emotion Forecasting ────────────────────────────────────────────────────
function EmotionForecastPage({ forecasts, onSave, onBack }) {
  const [step, setStep] = useState('event');
  const [event, setEvent] = useState(null);
  const [customEvent, setCustomEvent] = useState('');
  const [predicted, setPredicted] = useState(null);

  const pendingForecasts = (forecasts || []).filter(f => !f.actual);
  const completedForecasts = (forecasts || []).filter(f => f.actual);

  const handlePredict = () => {
    if (!predicted) return;
    const eventName = event?.label || customEvent.trim();
    if (!eventName) return;
    onSave({ event: eventName, predicted: predicted.label, predictedValue: predicted.value, date: todayDate() });
    setStep('event'); setEvent(null); setCustomEvent(''); setPredicted(null);
  };

  const handleActual = (forecast, actual) => {
    const updated = (forecasts || []).map(f => f === forecast ? { ...f, actual: actual.label, actualValue: actual.value } : f);
    onSave(updated, true);
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🔮" title="情绪天气预报" subtitle="预测感受 vs 实际感受" />
      {step === 'event' ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="font-bold text-gray-800">接下来有什么事情？</h3>
          <div className="grid grid-cols-4 gap-2">
            {FORECAST_EVENTS.map(e => (
              <button key={e.label} onClick={() => { setEvent(e); setStep('predict'); }}
                className="flex flex-col items-center bg-gray-50 rounded-xl p-3 hover:bg-purple-50 transition">
                <span className="text-2xl">{e.emoji}</span>
                <span className="text-xs text-gray-600 mt-1">{e.label}</span>
              </button>
            ))}
          </div>
          <input value={customEvent} onChange={e => setCustomEvent(e.target.value)} placeholder="或者输入其他事件..."
            className="w-full border rounded-xl p-3 text-sm outline-none" />
          {customEvent.trim() && (
            <button onClick={() => setStep('predict')} className="w-full bg-purple-500 text-white rounded-xl py-2 font-bold text-sm">下一步</button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="font-bold text-gray-800">你觉得"{event?.label || customEvent}"时你会怎么感觉？</h3>
          <div className="flex justify-between">
            {FORECAST_FEELINGS.map(f => (
              <button key={f.label} onClick={() => setPredicted(f)}
                className={`flex flex-col items-center p-2 rounded-xl transition ${predicted === f ? 'bg-purple-100 scale-110' : 'hover:bg-gray-50'}`}>
                <span className="text-2xl">{f.emoji}</span>
                <span className="text-xs text-gray-600 mt-1">{f.label}</span>
              </button>
            ))}
          </div>
          {predicted && (
            <button onClick={handlePredict} className="w-full bg-purple-500 text-white rounded-xl py-3 font-bold hover:bg-purple-600">记录预测 🔮</button>
          )}
        </div>
      )}
      {pendingForecasts.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">待验证 ({pendingForecasts.length})</h3>
          {pendingForecasts.map((f, i) => (
            <div key={i} className="bg-yellow-50 rounded-xl p-4">
              <p className="text-sm font-bold text-gray-800">{f.event} <span className="text-xs text-gray-400">({f.date})</span></p>
              <p className="text-xs text-gray-600">预测: {f.predicted}</p>
              <p className="text-xs text-gray-600 mt-2">实际感受是什么？</p>
              <div className="flex gap-1 mt-1">
                {FORECAST_FEELINGS.map(ff => (
                  <button key={ff.label} onClick={() => handleActual(f, ff)} className="text-lg hover:scale-125 transition">{ff.emoji}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {completedForecasts.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">预测 vs 现实</h3>
          {completedForecasts.slice().reverse().slice(0, 5).map((f, i) => {
            const better = (f.actualValue || 3) > (f.predictedValue || 3);
            return (
              <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-sm font-bold text-gray-800">{f.event}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-purple-50 px-2 py-0.5 rounded-full">预测: {f.predicted}</span>
                  <span className="text-xs">→</span>
                  <span className="text-xs bg-green-50 px-2 py-0.5 rounded-full">实际: {f.actual}</span>
                  {better && <span className="text-xs text-green-600 font-bold">比想象的好！</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Habit Stacking ─────────────────────────────────────────────────────────
function HabitStackPage({ stacks, onSave, onBack }) {
  const [anchor, setAnchor] = useState(null);
  const [habit, setHabit] = useState(null);
  const [customHabit, setCustomHabit] = useState('');
  const today = todayDate();

  const handleCreate = () => {
    const habitText = habit?.label || customHabit.trim();
    if (!anchor || !habitText) return;
    onSave([...(stacks || []), { anchor: anchor.label, habit: habitText, created: today, completions: [] }]);
    setAnchor(null); setHabit(null); setCustomHabit('');
  };

  const toggleCompletion = (idx) => {
    const updated = (stacks || []).map((s, i) => {
      if (i !== idx) return s;
      const done = (s.completions || []).includes(today);
      return { ...s, completions: done ? s.completions.filter(d => d !== today) : [...(s.completions || []), today] };
    });
    onSave(updated);
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧱" title="习惯叠加" subtitle="把好习惯绑定在日常行为上" />
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
        <p className="text-sm text-gray-600">💡 "在___之后，我会___"。把一个小小的好习惯绑在你已经有的习惯上，更容易坚持！</p>
      </div>
      {(stacks || []).length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">我的习惯叠加</h3>
          {(stacks || []).map((s, i) => {
            const doneToday = (s.completions || []).includes(today);
            const streak = (s.completions || []).length;
            return (
              <button key={i} onClick={() => toggleCompletion(i)}
                className={`w-full flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm text-left transition ${doneToday ? 'ring-2 ring-green-400' : ''}`}>
                <span className="text-2xl">{doneToday ? '✅' : '⬜'}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800"><span className="font-bold">{s.anchor}</span>，我会<span className="font-bold text-green-700">{s.habit}</span></p>
                  <p className="text-xs text-gray-400">{streak}次完成</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="font-bold text-gray-800">创建新的习惯叠加</h3>
        <div>
          <p className="text-sm text-gray-600 mb-2">在___之后...</p>
          <div className="flex flex-wrap gap-2">
            {ANCHOR_HABITS.map(a => (
              <button key={a.label} onClick={() => setAnchor(a)}
                className={`px-3 py-2 rounded-full text-sm ${anchor === a ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{a.emoji} {a.label}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-2">我会___</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {TINY_HABITS.map(h => (
              <button key={h.label} onClick={() => { setHabit(h); setCustomHabit(''); }}
                className={`px-3 py-2 rounded-full text-sm ${habit === h ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{h.emoji} {h.label}</button>
            ))}
          </div>
          <input value={customHabit} onChange={e => { setCustomHabit(e.target.value); setHabit(null); }} placeholder="或者自定义..."
            className="w-full border rounded-xl p-2 text-sm outline-none" />
        </div>
        {anchor && (habit || customHabit.trim()) && (
          <button onClick={handleCreate} className="w-full bg-green-500 text-white rounded-xl py-3 font-bold hover:bg-green-600">创建习惯 🧱</button>
        )}
      </div>
    </div>
  );
}

// ─── Conflict Resolution ────────────────────────────────────────────────────
function ConflictResolutionPage({ resolved, onResolve, onBack }) {
  const [step, setStep] = useState(0);
  const [practiceIdx, setPracticeIdx] = useState(null);
  const [myResponse, setMyResponse] = useState('');

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🕊️" title="化解冲突" subtitle="学习和平解决问题的5个步骤" />
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">5步化解法</h3>
        <div className="space-y-3">
          {CONFLICT_STEPS.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition ${step === i ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-gray-50'}`}>
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <p className="font-bold text-gray-800 text-sm">第{s.step}步: {s.title}</p>
                {step === i && <p className="text-xs text-gray-600 mt-1">{s.desc}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">练习场景</h3>
        {practiceIdx !== null ? (
          <div className="space-y-3">
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-sm text-gray-700">{CONFLICT_PRACTICES[practiceIdx].scene}</p>
            </div>
            <textarea value={myResponse} onChange={e => setMyResponse(e.target.value)} placeholder="用5步法，你会怎么做？"
              className="w-full border-2 border-blue-200 rounded-xl p-3 h-20 outline-none focus:border-blue-400" />
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-green-500 mb-1">💡 参考</p>
              <p className="text-sm text-green-700">{CONFLICT_PRACTICES[practiceIdx].example}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setPracticeIdx(null); setMyResponse(''); }} className="flex-1 bg-gray-200 rounded-xl py-2 text-sm font-bold">返回</button>
              <button onClick={() => { onResolve(CONFLICT_PRACTICES[practiceIdx].scene); setPracticeIdx(null); setMyResponse(''); }}
                className="flex-1 bg-blue-500 text-white rounded-xl py-2 text-sm font-bold">完成练习 ✅</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {CONFLICT_PRACTICES.map((p, i) => {
              const done = (resolved || []).includes(p.scene);
              return (
                <button key={i} onClick={() => setPracticeIdx(i)}
                  className={`w-full text-left bg-gray-50 rounded-xl p-3 text-sm hover:bg-blue-50 transition ${done ? 'opacity-60' : ''}`}>
                  {done && '✅ '}{p.scene}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Gratitude Scavenger Hunt ───────────────────────────────────────────────
function ScavengerHuntPage({ completedHunts, onComplete, onBack }) {
  const [activeHunt, setActiveHunt] = useState(null);
  const [checked, setChecked] = useState({});

  if (activeHunt) {
    const hunt = SCAVENGER_HUNTS.find(h => h.id === activeHunt);
    const allDone = hunt.tasks.every((_, i) => checked[i]);
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => { setActiveHunt(null); setChecked({}); }} />
        <div className="text-center">
          <div className="text-5xl mb-3">{hunt.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-800">{hunt.title}</h2>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          {hunt.tasks.map((task, i) => (
            <button key={i} onClick={() => setChecked(prev => ({ ...prev, [i]: !prev[i] }))}
              className={`w-full flex items-center gap-3 rounded-xl p-4 text-left transition ${checked[i] ? 'bg-green-50 ring-2 ring-green-300' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <span className="text-xl">{checked[i] ? '✅' : '⬜'}</span>
              <p className="text-sm text-gray-800">{task}</p>
            </button>
          ))}
        </div>
        {allDone && (
          <button onClick={() => { onComplete(hunt.id); setActiveHunt(null); setChecked({}); }}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg">完成寻宝！ 🏆</button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🔍" title="感恩寻宝" subtitle="在日常生活中发现美好" />
      <div className="space-y-3">
        {SCAVENGER_HUNTS.map(hunt => {
          const done = (completedHunts || []).includes(hunt.id);
          return (
            <button key={hunt.id} onClick={() => setActiveHunt(hunt.id)}
              className={`w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow hover:shadow-md transition ${done ? 'opacity-70' : ''}`}>
              <span className="text-3xl">{hunt.emoji}</span>
              <div className="text-left flex-1">
                <p className="font-bold text-gray-800">{hunt.title}</p>
                <p className="text-xs text-gray-500">{hunt.tasks.length}个任务</p>
              </div>
              {done && <span className="text-green-500 text-lg">✅</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Emotion Archaeology ────────────────────────────────────────────────────
function EmotionArchaeologyPage({ digs, onDig, onBack }) {
  const [activeSurface, setActiveSurface] = useState(null);
  const [revealedIdx, setRevealedIdx] = useState(-1);
  const [identified, setIdentified] = useState(null);

  if (activeSurface !== null) {
    const layer = EMOTION_LAYERS[activeSurface];
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => { setActiveSurface(null); setRevealedIdx(-1); setIdentified(null); }} />
        <div className="text-center">
          <div className="text-5xl mb-2">{layer.emoji}</div>
          <h2 className="text-xl font-bold text-gray-800">表面情绪：{layer.surface}</h2>
          <p className="text-sm text-gray-500">让我们看看下面藏着什么...</p>
        </div>
        <div className="space-y-3">
          {layer.beneath.map((b, i) => (
            <button key={i} onClick={() => { setRevealedIdx(i); setIdentified(null); }}
              className={`w-full rounded-2xl p-4 text-left transition shadow ${i <= revealedIdx ? 'bg-white' : 'bg-gradient-to-r from-amber-100 to-yellow-100'}`}>
              {i <= revealedIdx ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{b.emoji}</span>
                  <div>
                    <p className="font-bold text-gray-800">{b.emotion}</p>
                    <p className="text-xs text-gray-500">{b.desc}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-amber-600">⛏️ 点击挖掘第{i + 1}层</p>
                </div>
              )}
            </button>
          ))}
        </div>
        {revealedIdx >= 0 && (
          <div className="bg-purple-50 rounded-2xl p-4">
            <p className="text-sm font-bold text-purple-700 mb-2">你觉得哪个最像你现在的感受？</p>
            <div className="flex flex-wrap gap-2">
              {layer.beneath.slice(0, revealedIdx + 1).map((b, i) => (
                <button key={i} onClick={() => { setIdentified(b.emotion); onDig({ surface: layer.surface, deep: b.emotion, date: todayDate() }); }}
                  className={`px-3 py-2 rounded-full text-sm ${identified === b.emotion ? 'bg-purple-500 text-white' : 'bg-white text-gray-600'}`}>
                  {b.emoji} {b.emotion}
                </button>
              ))}
            </div>
            {identified && <p className="text-center text-green-600 font-bold mt-3">发现了！你的{activeSurface !== null ? layer.surface : ''}下面是{identified}。认识真正的感受是第一步！🎉</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="⛏️" title="情绪考古" subtitle="挖掘表面情绪下面藏着什么" />
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4">
        <p className="text-sm text-gray-600">💡 很多时候，我们感受到的情绪只是"表面"。下面可能藏着更真实的感受。让我们一起挖掘看看！</p>
      </div>
      <div className="space-y-3">
        {EMOTION_LAYERS.map((layer, i) => (
          <button key={i} onClick={() => setActiveSurface(i)}
            className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow hover:shadow-md transition">
            <span className="text-3xl">{layer.emoji}</span>
            <div className="text-left">
              <p className="font-bold text-gray-800">我觉得{layer.surface}</p>
              <p className="text-xs text-gray-500">点击挖掘更深的感受</p>
            </div>
            <span className="ml-auto text-gray-300">⛏️</span>
          </button>
        ))}
      </div>
      {(digs || []).length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">我的发现 ({digs.length})</h3>
          {(digs || []).slice().reverse().slice(0, 5).map((d, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-2">
              <span className="text-sm">{d.surface} → <span className="font-bold text-purple-600">{d.deep}</span></span>
              <span className="text-xs text-gray-400 ml-auto">{d.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Butterfly Hug & Body-Based Coping ──────────────────────────────────────
function BodyCopingPage({ completions, onComplete, onBack }) {
  const [active, setActive] = useState(null);
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (active === null || timer <= 0) return;
    const id = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(id);
  }, [active, timer]);

  if (active !== null) {
    const exercise = BODY_COPING[active];
    const currentStep = exercise.steps[step];
    const isLast = step >= exercise.steps.length - 1;
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => { setActive(null); setStep(0); setTimer(0); }} />
        <div className="text-center">
          <div className="text-5xl mb-2">{exercise.emoji}</div>
          <h2 className="text-xl font-bold text-gray-800">{exercise.title}</h2>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="text-4xl font-mono text-purple-600 mb-4">{fmtTime(timer)}</div>
          <div className="bg-purple-50 rounded-xl p-5 mb-4">
            <p className="text-xs text-gray-400 mb-1">第 {step + 1}/{exercise.steps.length} 步</p>
            <p className="text-lg font-bold text-gray-800">{currentStep}</p>
          </div>
          <button onClick={() => {
            if (isLast) { onComplete(exercise.id); setActive(null); setStep(0); setTimer(0); }
            else setStep(prev => prev + 1);
          }} className="w-full bg-purple-500 text-white rounded-xl py-3 font-bold hover:bg-purple-600">
            {isLast ? '完成！ 🦋' : '下一步 →'}
          </button>
        </div>
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-xs text-gray-600">{exercise.desc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🦋" title="身体安抚术" subtitle="用身体动作帮助大脑平静" />
      <div className="space-y-3">
        {BODY_COPING.map((ex, i) => {
          const done = (completions || []).includes(ex.id);
          return (
            <button key={ex.id} onClick={() => { setActive(i); setStep(0); setTimer(ex.duration); }}
              className={`w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow hover:shadow-md transition ${done ? 'ring-2 ring-green-300' : ''}`}>
              <span className="text-3xl">{ex.emoji}</span>
              <div className="text-left flex-1">
                <p className="font-bold text-gray-800">{ex.title}</p>
                <p className="text-xs text-gray-500">{ex.desc.slice(0, 30)}...</p>
              </div>
              {done && <span className="text-green-500">✅</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Permission Slips ───────────────────────────────────────────────────────
function PermissionSlipPage({ slips, onSave, onBack }) {
  const [customText, setCustomText] = useState('');

  const handleSave = (text) => {
    onSave({ text, date: todayDate() });
  };

  const handleCustom = () => {
    if (!customText.trim()) return;
    handleSave('允许自己' + customText.trim());
    setCustomText('');
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📜" title="许可小条" subtitle="给自己写一张允许的纸条" />
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4">
        <p className="text-sm text-gray-600">💡 有时候我们对自己太严格了。给自己一张"许可条"，允许自己做一个真实的人。</p>
      </div>
      <div className="space-y-2">
        {PERMISSION_TEMPLATES.map((p, i) => {
          const saved = (slips || []).some(s => s.text === p.text);
          return (
            <button key={i} onClick={() => !saved && handleSave(p.text)}
              className={`w-full flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm text-left transition ${saved ? 'ring-2 ring-green-300 bg-green-50' : 'hover:shadow-md'}`}>
              <span className="text-2xl">{p.emoji}</span>
              <p className="text-sm text-gray-800 flex-1">{p.text}</p>
              {saved ? <span className="text-green-500">📜</span> : <span className="text-xs text-purple-500 font-bold">领取</span>}
            </button>
          );
        })}
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <p className="text-sm font-bold text-gray-700 mb-2">✍️ 写一张自己的许可条</p>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500 self-center">允许自己</span>
          <input value={customText} onChange={e => setCustomText(e.target.value)} placeholder="..."
            className="flex-1 border-2 border-purple-200 rounded-xl p-2 text-sm outline-none focus:border-purple-400" />
          <button onClick={handleCustom} className="bg-purple-500 text-white px-4 rounded-xl font-bold text-sm">保存</button>
        </div>
      </div>
      {(slips || []).length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4">
          <h3 className="font-bold text-amber-700 mb-2">📜 我的许可条 ({slips.length})</h3>
          <div className="space-y-1">
            {(slips || []).slice().reverse().slice(0, 8).map((s, i) => (
              <p key={i} className="text-sm text-gray-700 bg-white rounded-lg p-2">📜 {s.text}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Daily Dose of Awe ─────────────────────────────────────────────────────
function AwePromptPage({ aweLogs, onLog, onBack }) {
  const today = todayDate();
  const todayIdx = Math.abs(new Date().getDate() % AWE_PROMPTS.length);
  const todayPrompt = AWE_PROMPTS[todayIdx];
  const doneToday = (aweLogs || []).some(l => l.date === today);
  const [reflection, setReflection] = useState('');

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🤩" title="每日惊叹" subtitle="发现世界的神奇之处" />
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6 shadow-lg text-center">
        <div className="text-5xl mb-3">{todayPrompt.emoji}</div>
        <p className="text-gray-800 font-semibold">{todayPrompt.prompt}</p>
      </div>
      {!doneToday ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <textarea value={reflection} onChange={e => setReflection(e.target.value)} placeholder="你发现了什么？写下你的感受..."
            className="w-full border-2 border-indigo-200 rounded-xl p-3 h-20 outline-none focus:border-indigo-400" />
          <button onClick={() => { if (reflection.trim()) { onLog({ prompt: todayPrompt.prompt, reflection: reflection.trim(), date: today }); setReflection(''); } }}
            className="w-full bg-indigo-500 text-white rounded-xl py-3 font-bold hover:bg-indigo-600">记录今天的惊叹 🤩</button>
        </div>
      ) : (
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-green-600 font-bold">今天的惊叹已记录！ ✅</p>
        </div>
      )}
      {(aweLogs || []).length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">惊叹日记 ({aweLogs.length})</h3>
          {(aweLogs || []).slice().reverse().slice(0, 5).map((l, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs text-indigo-500">{l.prompt}</p>
              <p className="text-sm text-gray-800 mt-1">{l.reflection}</p>
              <p className="text-xs text-gray-400 mt-1">{l.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Compassionate Observer ─────────────────────────────────────────────────
function CompassionateObserverPage({ sessions, onComplete, onBack }) {
  const [active, setActive] = useState(null);
  const [guideStep, setGuideStep] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (active === null || timer <= 0) return;
    const id = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(id);
  }, [active, timer]);

  if (active !== null) {
    const exercise = OBSERVER_EXERCISES[active];
    const guideText = exercise.guide[guideStep];
    const isLast = guideStep >= exercise.guide.length - 1;
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => { setActive(null); setGuideStep(0); setTimer(0); }} />
        <div className="text-center">
          <div className="text-5xl mb-2">{exercise.emoji}</div>
          <h2 className="text-xl font-bold text-gray-800">{exercise.title}</h2>
          <p className="text-3xl font-mono text-blue-500 mt-2">{fmtTime(timer)}</p>
        </div>
        <div className="bg-gradient-to-b from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg text-center min-h-[150px] flex items-center justify-center">
          <p className="text-lg text-gray-800 leading-relaxed">{guideText}</p>
        </div>
        <button onClick={() => {
          if (isLast) { onComplete(exercise.id); setActive(null); setGuideStep(0); setTimer(0); }
          else setGuideStep(prev => prev + 1);
        }} className="w-full bg-blue-500 text-white rounded-xl py-3 font-bold hover:bg-blue-600">
          {isLast ? '完成冥想 🧘' : '继续... →'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧘" title="安静观察者" subtitle="学习观察想法，而不被它们带走" />
      <div className="bg-blue-50 rounded-2xl p-4">
        <p className="text-sm text-gray-600">💡 你不是你的想法。想法就像天上的云、海里的浪、路过的火车——来了又走。你只需要安静地观察。</p>
      </div>
      <div className="space-y-3">
        {OBSERVER_EXERCISES.map((ex, i) => {
          const done = (sessions || []).includes(ex.id);
          return (
            <button key={ex.id} onClick={() => { setActive(i); setGuideStep(0); setTimer(ex.duration); }}
              className={`w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow hover:shadow-md transition ${done ? 'ring-2 ring-blue-300' : ''}`}>
              <span className="text-3xl">{ex.emoji}</span>
              <div className="text-left flex-1">
                <p className="font-bold text-gray-800">{ex.title}</p>
                <p className="text-xs text-gray-500">{Math.floor(ex.duration / 60)}分钟引导练习</p>
              </div>
              {done && <span className="text-blue-500">✅</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Emotional CPR ──────────────────────────────────────────────────────────
function EmotionalCPRPage({ uses, onUse, onBack }) {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🚨" title="情绪急救CPR" subtitle="紧急时刻的3个步骤" />
      <div className="bg-red-50 rounded-2xl p-4">
        <p className="text-sm text-gray-600">💡 当你感觉非常难受、快要崩溃的时候，记住这三个字母：<span className="font-bold text-red-600">C-P-R</span></p>
      </div>
      <div className="space-y-4">
        {CPR_STEPS.map((s, i) => (
          <button key={i} onClick={() => setActiveStep(activeStep === i ? null : i)}
            className="w-full bg-white rounded-2xl shadow overflow-hidden text-left">
            <div className={`${s.color} p-4 flex items-center gap-3`}>
              <span className="text-3xl bg-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-gray-800">{s.letter}</span>
              <div>
                <p className="font-bold text-white text-lg">{s.title}</p>
                <p className="text-white text-xs opacity-80">{s.quick}</p>
              </div>
              <span className="text-2xl ml-auto">{s.emoji}</span>
            </div>
            {activeStep === i && (
              <div className="p-4 space-y-2">
                {s.actions.map((a, j) => (
                  <div key={j} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                    <span className="text-green-500">•</span>
                    <p className="text-sm text-gray-700">{a}</p>
                  </div>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
      <button onClick={() => onUse({ date: todayDate() })}
        className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg">我用了CPR急救 💪</button>
      {(uses || []).length > 0 && (
        <p className="text-center text-sm text-gray-500">你已经使用了{uses.length}次CPR急救，每次都说明你在照顾自己！</p>
      )}
    </div>
  );
}

// ─── Strengths Shield ───────────────────────────────────────────────────────
function StrengthsShieldPage({ shield, onSave, onBack }) {
  const [editing, setEditing] = useState(null);
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (!input.trim() || !editing) return;
    const updated = { ...(shield || {}), [editing]: [...((shield || {})[editing] || []), input.trim()] };
    onSave(updated);
    setInput('');
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🛡️" title="力量盾牌" subtitle="建造你的心灵防护盾" />
      <div className="grid grid-cols-2 gap-3">
        {SHIELD_QUADRANTS.map(q => {
          const items = (shield || {})[q.id] || [];
          return (
            <button key={q.id} onClick={() => setEditing(editing === q.id ? null : q.id)}
              className={`bg-gradient-to-br ${q.color} rounded-2xl p-4 shadow text-left min-h-[120px] transition ${editing === q.id ? 'ring-2 ring-purple-400 scale-105' : ''}`}>
              <div className="text-2xl mb-1">{q.emoji}</div>
              <p className="font-bold text-gray-800 text-sm">{q.title}</p>
              {items.length > 0 ? items.map((item, i) => (
                <p key={i} className="text-xs text-gray-600 mt-1">• {item}</p>
              )) : <p className="text-xs text-gray-400 mt-1">{q.prompt}</p>}
            </button>
          );
        })}
      </div>
      {editing && (
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <p className="text-sm font-bold text-gray-700 mb-2">{SHIELD_QUADRANTS.find(q => q.id === editing)?.prompt}</p>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="写下来..."
              className="flex-1 border-2 border-purple-200 rounded-xl p-2 text-sm outline-none focus:border-purple-400" />
            <button onClick={handleAdd} className="bg-purple-500 text-white px-4 rounded-xl font-bold text-sm">添加</button>
          </div>
        </div>
      )}
      <div className="bg-purple-50 rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-600">当消极想法来袭时，拿出你的盾牌看看——你比你想的更强大！ 🛡️</p>
      </div>
    </div>
  );
}

// ─── Micro-Kindness to Self ─────────────────────────────────────────────────
function MicroKindnessPage({ log, onLog, onBack }) {
  const today = todayDate();
  const todayDone = (log || []).filter(l => l.date === today).map(l => l.text);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌸" title="微小善意" subtitle="对自己温柔一点点" />
      <div className="bg-pink-50 rounded-2xl p-4">
        <p className="text-sm text-gray-600">💡 照顾自己不需要做大事。一个小小的善意动作，就能让你好一点点。</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {MICRO_KINDNESS.map((k, i) => {
          const done = todayDone.includes(k.text);
          return (
            <button key={i} onClick={() => !done && onLog({ text: k.text, date: today })}
              className={`flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm text-left transition ${done ? 'bg-green-50 ring-2 ring-green-300' : 'hover:shadow-md'}`}>
              <span className="text-xl">{done ? '✅' : k.emoji}</span>
              <span className="text-xs text-gray-700">{k.text}</span>
            </button>
          );
        })}
      </div>
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-700">今天完成: <span className="font-bold text-pink-600">{todayDone.length}</span> / {MICRO_KINDNESS.length}</p>
        {todayDone.length >= 3 && <p className="text-xs text-pink-500 mt-1">你对自己真好！继续保持 🌸</p>}
      </div>
    </div>
  );
}

// ─── Feelings Forecast Journal ──────────────────────────────────────────────
function FeelingsForecastPage({ forecasts, onSave, onBack }) {
  const today = todayDate();
  const todayEntry = (forecasts || []).find(f => f.date === today);
  const [morning, setMorning] = useState(null);
  const [evening, setEvening] = useState(null);

  const handleMorning = (w) => {
    setMorning(w);
    onSave({ date: today, morning: w.label, morningEmoji: w.emoji, evening: todayEntry?.evening });
  };

  const handleEvening = (w) => {
    setEvening(w);
    onSave({ date: today, morning: todayEntry?.morning || morning?.label, morningEmoji: todayEntry?.morningEmoji || morning?.emoji, evening: w.label, eveningEmoji: w.emoji });
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌤️" title="心情天气" subtitle="每天预报你的心情天气" />
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">☀️ 早上：今天的心情预报</h3>
        <div className="flex justify-between">
          {WEATHER_EMOJI.map(w => (
            <button key={w.label} onClick={() => handleMorning(w)}
              className={`flex flex-col items-center p-2 rounded-xl transition ${(todayEntry?.morning || morning?.label) === w.label ? 'bg-blue-100 scale-110' : 'hover:bg-gray-50'}`}>
              <span className="text-2xl">{w.emoji}</span>
              <span className="text-xs text-gray-600">{w.label}</span>
            </button>
          ))}
        </div>
        {(todayEntry?.morning || morning) && <p className="text-center text-sm text-blue-600 mt-2">早上预报：{todayEntry?.morningEmoji || morning?.emoji} {todayEntry?.morning || morning?.label}</p>}
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">🌙 晚上：实际天气如何？</h3>
        <div className="flex justify-between">
          {WEATHER_EMOJI.map(w => (
            <button key={w.label} onClick={() => handleEvening(w)}
              className={`flex flex-col items-center p-2 rounded-xl transition ${(todayEntry?.evening || evening?.label) === w.label ? 'bg-purple-100 scale-110' : 'hover:bg-gray-50'}`}>
              <span className="text-2xl">{w.emoji}</span>
              <span className="text-xs text-gray-600">{w.label}</span>
            </button>
          ))}
        </div>
        {(todayEntry?.evening || evening) && <p className="text-center text-sm text-purple-600 mt-2">实际天气：{todayEntry?.eveningEmoji || evening?.emoji} {todayEntry?.evening || evening?.label}</p>}
      </div>
      {(forecasts || []).filter(f => f.morning && f.evening).length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">天气历史</h3>
          {(forecasts || []).filter(f => f.morning && f.evening).slice().reverse().slice(0, 7).map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
              <span className="text-xs text-gray-400">{f.date}</span>
              <span>{f.morningEmoji} → {f.eveningEmoji}</span>
              <span className="text-xs text-gray-500 ml-auto">{f.morning} → {f.evening}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hope Jar ───────────────────────────────────────────────────────────────
function HopeJarPage({ hopes, onAdd, onBack }) {
  const [category, setCategory] = useState(null);
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (!text.trim() || !category) return;
    onAdd({ text: text.trim(), category: category.label, emoji: category.emoji, date: todayDate() });
    setText(''); setCategory(null);
  };

  const jarFill = Math.min(100, ((hopes || []).length / 20) * 100);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🫙" title="希望罐子" subtitle="收集你的希望和力量" />
      <div className="bg-gradient-to-b from-yellow-50 to-amber-50 rounded-2xl p-5 shadow-lg text-center">
        <div className="relative inline-block">
          <div className="text-7xl">🫙</div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-300 to-amber-200 rounded-b-full opacity-60" style={{ height: `${jarFill}%` }}></div>
        </div>
        <p className="font-bold text-gray-800 mt-2">{(hopes || []).length} 个希望</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full transition-all" style={{ width: `${jarFill}%` }}></div>
        </div>
      </div>
      {category ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="font-bold text-gray-800">{category.emoji} {category.label}</h3>
          <p className="text-xs text-gray-500">{category.hint}</p>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="写下你的希望..."
            className="w-full border-2 border-amber-200 rounded-xl p-3 h-20 outline-none focus:border-amber-400" />
          <div className="flex gap-2">
            <button onClick={() => { setCategory(null); setText(''); }} className="flex-1 bg-gray-200 rounded-xl py-3 font-bold text-gray-700">取消</button>
            <button onClick={handleAdd} className="flex-1 bg-amber-500 text-white rounded-xl py-3 font-bold hover:bg-amber-600">放入罐子 🫙</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {HOPE_CATEGORIES.map(c => (
            <button key={c.label} onClick={() => setCategory(c)}
              className="w-full flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition">
              <span className="text-2xl">{c.emoji}</span>
              <div className="text-left">
                <p className="font-bold text-gray-800 text-sm">{c.label}</p>
                <p className="text-xs text-gray-500">{c.hint.slice(0, 25)}...</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {(hopes || []).length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">罐子里的希望</h3>
          {(hopes || []).slice().reverse().slice(0, 8).map((h, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm flex items-start gap-2">
              <span>{h.emoji}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{h.text}</p>
                <p className="text-xs text-gray-400">{h.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Breathing Games ────────────────────────────────────────────────────────
function BreathingGamePage({ gamesPlayed, onComplete, onBack }) {
  const [activeGame, setActiveGame] = useState(null);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState('ready');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!activeGame || phase === 'ready' || timer <= 0) return;
    const id = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (phase === 'inhale') { setPhase('exhale'); return activeGame.exhale; }
          if (phase === 'exhale') {
            if (round + 1 >= activeGame.rounds) { setPhase('done'); return 0; }
            setRound(r => r + 1); setPhase('inhale'); return activeGame.inhale;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [activeGame, phase, timer, round]);

  if (activeGame && phase === 'done') {
    return (
      <div className="p-6 space-y-5 text-center">
        <div className="text-6xl mb-4">{activeGame.emoji}</div>
        <h2 className="text-2xl font-bold text-gray-800">{activeGame.successMsg}</h2>
        <p className="text-gray-600">你完成了{activeGame.rounds}轮呼吸！</p>
        <button onClick={() => { onComplete(activeGame.id); setActiveGame(null); setRound(0); setPhase('ready'); }}
          className="bg-green-500 text-white rounded-2xl px-8 py-4 font-bold text-lg">太棒了！ 🎉</button>
      </div>
    );
  }

  if (activeGame && phase !== 'ready') {
    const progress = ((round * (activeGame.inhale + activeGame.exhale) + (phase === 'exhale' ? activeGame.inhale : 0) + (phase === 'inhale' ? activeGame.inhale - timer : activeGame.exhale - timer)) / (activeGame.rounds * (activeGame.inhale + activeGame.exhale))) * 100;
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => { setActiveGame(null); setRound(0); setPhase('ready'); }} />
        <div className="text-center">
          <div className={`text-7xl mb-4 transition-transform duration-1000 ${phase === 'inhale' ? 'scale-125' : 'scale-75'}`}>{activeGame.emoji}</div>
          <p className="text-sm text-gray-500">第 {round + 1}/{activeGame.rounds} 轮</p>
          <p className="text-4xl font-mono text-purple-600 my-3">{timer}</p>
          <p className="text-xl font-bold text-gray-800">{phase === 'inhale' ? '吸气... 🌬️' : '呼气... 💨'}</p>
          <p className="text-sm text-gray-500 mt-2">{activeGame.instruction}</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎮" title="呼吸小游戏" subtitle="用好玩的方式练习呼吸" />
      <div className="space-y-3">
        {BREATHING_GAMES.map(game => {
          const played = (gamesPlayed || []).includes(game.id);
          return (
            <button key={game.id} onClick={() => { setActiveGame(game); setRound(0); setPhase('inhale'); setTimer(game.inhale); }}
              className={`w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow hover:shadow-md transition ${played ? 'ring-2 ring-green-300' : ''}`}>
              <span className="text-3xl">{game.emoji}</span>
              <div className="text-left flex-1">
                <p className="font-bold text-gray-800">{game.title}</p>
                <p className="text-xs text-gray-500">{game.desc}</p>
              </div>
              {played && <span className="text-green-500">✅</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Decision Compass ───────────────────────────────────────────────────────
function DecisionCompassPage({ decisions, onSave, onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [topic, setTopic] = useState('');

  const handleSave = () => {
    if (!topic.trim()) return;
    onSave({ topic: topic.trim(), answers, date: todayDate() });
    setStep(0); setAnswers({}); setTopic('');
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧭" title="决定指南针" subtitle="不知道怎么选？让指南针帮你" />
      {step === 0 ? (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="font-bold text-gray-800">你在纠结什么事情？</h3>
          <textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder="写下让你犹豫不决的事情..."
            className="w-full border-2 border-blue-200 rounded-xl p-3 h-20 outline-none focus:border-blue-400" />
          {topic.trim() && <button onClick={() => setStep(1)} className="w-full bg-blue-500 text-white rounded-xl py-3 font-bold">开始思考 🧭</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{DECISION_QUESTIONS[step - 1].emoji}</span>
            <p className="font-bold text-gray-800">{DECISION_QUESTIONS[step - 1].question}</p>
          </div>
          <textarea value={answers[step] || ''} onChange={e => setAnswers(prev => ({ ...prev, [step]: e.target.value }))} placeholder="想一想，写下来..."
            className="w-full border-2 border-purple-200 rounded-xl p-3 h-20 outline-none focus:border-purple-400" />
          <div className="flex gap-2">
            {step > 1 && <button onClick={() => setStep(prev => prev - 1)} className="flex-1 bg-gray-200 rounded-xl py-3 font-bold text-gray-700">上一步</button>}
            {step < DECISION_QUESTIONS.length ? (
              <button onClick={() => setStep(prev => prev + 1)} className="flex-1 bg-purple-500 text-white rounded-xl py-3 font-bold">下一步 →</button>
            ) : (
              <button onClick={handleSave} className="flex-1 bg-green-500 text-white rounded-xl py-3 font-bold">完成思考 ✅</button>
            )}
          </div>
          <div className="flex gap-1">
            {DECISION_QUESTIONS.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${i < step ? 'bg-purple-400' : 'bg-gray-200'}`}></div>
            ))}
          </div>
        </div>
      )}
      {(decisions || []).length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">决定记录 ({decisions.length})</h3>
          {(decisions || []).slice().reverse().slice(0, 5).map((d, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
              <p className="font-semibold text-gray-800 text-sm">🧭 {d.topic}</p>
              <p className="text-xs text-gray-400">{d.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Empathy Glasses ────────────────────────────────────────────────────────
function EmpathyGlassesPage({ practiced, onPractice, onBack }) {
  const [active, setActive] = useState(null);
  const [revealed, setRevealed] = useState(0);

  if (active !== null) {
    const scenario = EMPATHY_SCENARIOS[active];
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => { setActive(null); setRevealed(0); }} />
        <PageHeader emoji="👓" title="换个角度看" subtitle="" />
        <div className="bg-orange-50 rounded-2xl p-4">
          <p className="font-bold text-gray-800">{scenario.situation}</p>
        </div>
        <div className="space-y-3">
          {scenario.perspectives.map((p, i) => (
            <button key={i} onClick={() => setRevealed(Math.max(revealed, i + 1))}
              className={`w-full rounded-2xl p-4 text-left shadow transition ${i < revealed ? 'bg-white' : 'bg-gradient-to-r from-purple-50 to-blue-50'}`}>
              {i < revealed ? (
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{p.role}的视角</p>
                    <p className="text-sm text-gray-600 mt-1">"{p.thought}"</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-purple-600">👓 点击看看{p.role}的视角</p>
              )}
            </button>
          ))}
        </div>
        {revealed >= scenario.perspectives.length && (
          <div className="space-y-3">
            <div className="bg-green-50 rounded-2xl p-4">
              <p className="text-sm text-green-700">💡 看到了吗？同样一件事，不同的人有不同的感受和想法。没有谁是"错"的。</p>
            </div>
            <button onClick={() => { onPractice(scenario.situation); setActive(null); setRevealed(0); }}
              className="w-full bg-purple-500 text-white rounded-xl py-3 font-bold">我学会了！ 👓</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="👓" title="共情眼镜" subtitle="戴上眼镜，看看别人怎么想" />
      <div className="space-y-3">
        {EMPATHY_SCENARIOS.map((s, i) => {
          const done = (practiced || []).includes(s.situation);
          return (
            <button key={i} onClick={() => setActive(i)}
              className={`w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow hover:shadow-md transition ${done ? 'opacity-70' : ''}`}>
              <span className="text-2xl">👓</span>
              <p className="text-sm text-gray-800 text-left flex-1">{s.situation}</p>
              {done && <span className="text-green-500">✅</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mood Collage Board ─────────────────────────────────────────────────────
function MoodCollagePage({ collages, onSave, onBack }) {
  const [selected, setSelected] = useState({ emojis: [], words: [], colors: [] });

  const toggle = (type, item) => {
    setSelected(prev => ({
      ...prev,
      [type]: prev[type].includes(item) ? prev[type].filter(i => i !== item) : [...prev[type], item]
    }));
  };

  const total = selected.emojis.length + selected.words.length + selected.colors.length;

  const handleSave = () => {
    if (total === 0) return;
    onSave({ ...selected, date: todayDate() });
    setSelected({ emojis: [], words: [], colors: [] });
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎨" title="心情拼图" subtitle="选择能代表你现在心情的元素" />
      <div className="bg-white rounded-2xl p-4 shadow">
        <h3 className="font-bold text-gray-800 mb-2 text-sm">选表情</h3>
        <div className="flex flex-wrap gap-2">
          {COLLAGE_EMOJIS.map(e => (
            <button key={e} onClick={() => toggle('emojis', e)}
              className={`text-2xl p-1 rounded-lg transition ${selected.emojis.includes(e) ? 'bg-purple-200 scale-125' : 'hover:bg-gray-100'}`}>{e}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow">
        <h3 className="font-bold text-gray-800 mb-2 text-sm">选词语</h3>
        <div className="flex flex-wrap gap-2">
          {COLLAGE_WORDS.map(w => (
            <button key={w} onClick={() => toggle('words', w)}
              className={`px-3 py-1 rounded-full text-sm ${selected.words.includes(w) ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{w}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow">
        <h3 className="font-bold text-gray-800 mb-2 text-sm">选颜色</h3>
        <div className="flex flex-wrap gap-2">
          {COLLAGE_COLORS.map(c => (
            <button key={c} onClick={() => toggle('colors', c)}
              className={`w-10 h-10 rounded-full ${c} transition ${selected.colors.includes(c) ? 'ring-4 ring-purple-400 scale-110' : ''}`}></button>
          ))}
        </div>
      </div>
      {total > 0 && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-700 mb-2">我的心情拼图</p>
            <div className="flex flex-wrap gap-1">
              {selected.emojis.map(e => <span key={e} className="text-2xl">{e}</span>)}
              {selected.words.map(w => <span key={w} className="bg-white px-2 py-0.5 rounded-full text-xs">{w}</span>)}
              {selected.colors.map(c => <span key={c} className={`w-6 h-6 rounded-full ${c} inline-block`}></span>)}
            </div>
          </div>
          <button onClick={handleSave} className="w-full bg-purple-500 text-white rounded-xl py-3 font-bold">保存拼图 🎨</button>
        </div>
      )}
    </div>
  );
}

// ─── Emotion Vocabulary Stories ─────────────────────────────────────────────
function VocabStoryPage({ learned, onLearn, onBack }) {
  const [active, setActive] = useState(null);

  if (active !== null) {
    const story = VOCAB_STORIES[active];
    const done = (learned || []).includes(story.word);
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => setActive(null)} />
        <div className="text-center">
          <div className="text-5xl mb-3">{story.emoji}</div>
          <h2 className="text-2xl font-bold text-purple-700">{story.word}</h2>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <p className="text-gray-700 leading-relaxed">{story.story}</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-4">
          <p className="text-sm font-bold text-yellow-800">🤔 {story.question}</p>
        </div>
        {!done && (
          <button onClick={() => { onLearn(story.word); setActive(null); }}
            className="w-full bg-purple-500 text-white rounded-xl py-3 font-bold">我学会了这个词！ 📚</button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📖" title="情绪词典" subtitle="通过故事学习高级情绪词汇" />
      <div className="space-y-3">
        {VOCAB_STORIES.map((s, i) => {
          const done = (learned || []).includes(s.word);
          return (
            <button key={i} onClick={() => setActive(i)}
              className={`w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow hover:shadow-md transition ${done ? 'ring-2 ring-green-300' : ''}`}>
              <span className="text-2xl">{s.emoji}</span>
              <div className="text-left flex-1">
                <p className="font-bold text-gray-800">{s.word}</p>
                <p className="text-xs text-gray-500">{s.story.slice(0, 30)}...</p>
              </div>
              {done && <span className="text-green-500">✅</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Gratitude Chain ────────────────────────────────────────────────────────
function GratitudeChainPage({ chain, onAdd, onBack }) {
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd({ text: text.trim(), color: CHAIN_COLORS[(chain || []).length % CHAIN_COLORS.length], date: todayDate() });
    setText('');
  };

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🔗" title="感恩链条" subtitle="每一个感恩都是一环，看你的链条有多长" />
      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="今天你感恩什么？不管多小都可以..."
          className="w-full border-2 border-amber-200 rounded-xl p-3 h-16 outline-none focus:border-amber-400" />
        <button onClick={handleAdd} className="w-full bg-amber-500 text-white rounded-xl py-3 font-bold hover:bg-amber-600">加一环 🔗</button>
      </div>
      {(chain || []).length > 0 && (
        <div>
          <p className="font-bold text-gray-700 mb-2">我的感恩链 ({chain.length}环)</p>
          <div className="flex flex-wrap gap-1">
            {(chain || []).map((link, i) => (
              <div key={i} className={`${link.color} text-white text-xs px-3 py-1 rounded-full font-bold`} title={link.text}>
                {link.text.length > 8 ? link.text.slice(0, 8) + '...' : link.text}
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1">
            {(chain || []).slice().reverse().slice(0, 5).map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${link.color}`}></div>
                <p className="text-sm text-gray-700">{link.text}</p>
                <span className="text-xs text-gray-400 ml-auto">{link.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Safe Person Quick-Cards ────────────────────────────────────────────────
function SafePersonCardsPage({ cards, onSave, onBack }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onSave([...(cards || []), { name: name.trim(), relation: relation.trim() }]);
    setName(''); setRelation(''); setEditing(false);
  };

  const handleRemove = (idx) => onSave((cards || []).filter((_, i) => i !== idx));

  const [copiedScript, setCopiedScript] = useState(null);

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📱" title="求助快捷卡" subtitle="不知道怎么开口？用这些话" />
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">我信任的人</h3>
        {(cards || []).map((c, i) => (
          <div key={i} className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 mb-2">
            <span className="text-xl">👤</span>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">{c.name}</p>
              {c.relation && <p className="text-xs text-gray-500">{c.relation}</p>}
            </div>
            <button onClick={() => handleRemove(i)} className="text-red-400 text-xs">×</button>
          </div>
        ))}
        {editing ? (
          <div className="space-y-2 mt-2">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="名字" className="w-full border rounded-xl p-2 text-sm outline-none" />
            <input value={relation} onChange={e => setRelation(e.target.value)} placeholder="关系（妈妈、老师...）" className="w-full border rounded-xl p-2 text-sm outline-none" />
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 bg-gray-200 rounded-xl py-2 text-sm font-bold">取消</button>
              <button onClick={handleAdd} className="flex-1 bg-blue-500 text-white rounded-xl py-2 text-sm font-bold">添加</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="w-full bg-blue-100 text-blue-600 rounded-xl py-2 text-sm font-bold mt-2">+ 添加信任的人</button>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="font-bold text-gray-800">📋 求助话术卡</h3>
        <p className="text-xs text-gray-500">不知道怎么说？点击复制这些话：</p>
        {HELP_SCRIPTS.map((s, i) => (
          <button key={i} onClick={() => { navigator.clipboard?.writeText(s.script).catch(() => {}); setCopiedScript(i); setTimeout(() => setCopiedScript(null), 2000); }}
            className={`w-full text-left bg-white rounded-xl p-4 shadow-sm transition ${copiedScript === i ? 'ring-2 ring-green-400 bg-green-50' : 'hover:shadow-md'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{s.emoji}</span>
              <span className="font-bold text-gray-800 text-sm">{s.label}</span>
              {copiedScript === i && <span className="text-xs text-green-600 ml-auto">已复制!</span>}
            </div>
            <p className="text-sm text-gray-600">"{s.script}"</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Morning Compass ────────────────────────────────────────────────────────
function MorningCompassPage({ entries, onSave, onBack }) {
  const today = todayDate();
  const todayEntry = (entries || []).find(e => e.date === today);
  const [feeling, setFeeling] = useState(null);
  const [action, setAction] = useState('');
  const [kindTo, setKindTo] = useState('');

  if (todayEntry) {
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={onBack} />
        <PageHeader emoji="🧭" title="今日方向" subtitle="你已经设好今天的方向了" />
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-5 shadow-lg text-center">
          <p className="text-sm text-gray-500">今天想感受</p>
          <p className="text-3xl my-2">{todayEntry.feelingEmoji}</p>
          <p className="font-bold text-gray-800 text-lg">{todayEntry.feeling}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm text-gray-600">🎯 今日行动：<span className="font-bold">{todayEntry.action}</span></p>
          <p className="text-sm text-gray-600 mt-2">💗 善待：<span className="font-bold">{todayEntry.kindTo}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧭" title="早安指南针" subtitle="1分钟设定今天的方向" />
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <p className="font-bold text-gray-800 mb-3">今天我想感受...</p>
        <div className="flex flex-wrap gap-2">
          {COMPASS_FEELINGS.map(f => (
            <button key={f.label} onClick={() => setFeeling(f)}
              className={`px-3 py-2 rounded-full text-sm ${feeling === f ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}>{f.emoji} {f.label}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <p className="font-bold text-gray-800 mb-3">今天我要做一件事...</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {COMPASS_ACTIONS.map(a => (
            <button key={a} onClick={() => setAction(a)}
              className={`px-3 py-1 rounded-full text-xs ${action === a ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{a}</button>
          ))}
        </div>
        <input value={action} onChange={e => setAction(e.target.value)} placeholder="或者自定义..." className="w-full border rounded-xl p-2 text-sm outline-none mt-1" />
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <p className="font-bold text-gray-800 mb-2">今天我要善待...</p>
        <input value={kindTo} onChange={e => setKindTo(e.target.value)} placeholder="一个人的名字（包括你自己）"
          className="w-full border-2 border-pink-200 rounded-xl p-3 outline-none focus:border-pink-400" />
      </div>
      {feeling && action && kindTo.trim() && (
        <button onClick={() => { onSave({ feeling: feeling.label, feelingEmoji: feeling.emoji, action, kindTo: kindTo.trim(), date: today }); }}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl py-4 font-bold text-lg shadow-lg">出发！ 🧭</button>
      )}
    </div>
  );
}

// ─── Coping Report Card ────────────────────────────────────────────────────
function CopingReportPage({ reports, onSave, onBack }) {
  const [emotion, setEmotion] = useState('');
  const [ratings, setRatings] = useState({});

  const handleSave = () => {
    if (!emotion.trim()) return;
    const used = Object.entries(ratings).filter(([_, v]) => v > 0).map(([k, v]) => ({ strategy: k, rating: v }));
    if (used.length === 0) return;
    onSave({ emotion: emotion.trim(), strategies: used, date: todayDate() });
    setEmotion(''); setRatings({});
  };

  const bestStrategies = {};
  (reports || []).forEach(r => {
    (r.strategies || []).forEach(s => {
      if (!bestStrategies[s.strategy] || s.rating > bestStrategies[s.strategy]) bestStrategies[s.strategy] = s.rating;
    });
  });

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📊" title="应对成绩单" subtitle="记录什么方法对你最有用" />
      <div className="bg-white rounded-2xl p-5 shadow-lg space-y-3">
        <input value={emotion} onChange={e => setEmotion(e.target.value)} placeholder="你刚才经历了什么情绪？"
          className="w-full border-2 border-blue-200 rounded-xl p-3 outline-none focus:border-blue-400" />
        <p className="text-sm font-bold text-gray-600">你用了哪些方法？效果如何？</p>
        {COPING_STRATEGIES_LIST.map(s => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="text-lg">{s.emoji}</span>
            <span className="text-sm text-gray-700 flex-1">{s.label}</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setRatings(prev => ({ ...prev, [s.label]: star }))}
                  className={`text-sm ${star <= (ratings[s.label] || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={handleSave} className="w-full bg-blue-500 text-white rounded-xl py-3 font-bold hover:bg-blue-600">保存成绩单 📊</button>
      </div>
      {Object.keys(bestStrategies).length > 0 && (
        <div className="bg-green-50 rounded-2xl p-4">
          <h3 className="font-bold text-green-700 mb-2">🏆 我的最佳方法</h3>
          {Object.entries(bestStrategies).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, rating]) => (
            <div key={name} className="flex items-center gap-2 py-1">
              <span className="text-sm">{COPING_STRATEGIES_LIST.find(s => s.label === name)?.emoji}</span>
              <span className="text-sm text-gray-700 flex-1">{name}</span>
              <span className="text-yellow-400 text-sm">{'★'.repeat(rating)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Connection Conversation Cards ──────────────────────────────────────────
function ConnectionCardsPage({ onBack }) {
  const [category, setCategory] = useState(null);
  const [cardIdx, setCardIdx] = useState(0);

  if (category) {
    const cards = category.cards;
    return (
      <div className="p-6 space-y-5">
        <BackButton onClick={() => { setCategory(null); setCardIdx(0); }} />
        <div className="text-center">
          <span className="text-3xl">{category.emoji}</span>
          <h2 className="text-xl font-bold text-gray-800 mt-2">{category.category}话题</h2>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 shadow-lg text-center min-h-[150px] flex items-center justify-center">
          <p className="text-lg font-bold text-gray-800">{cards[cardIdx % cards.length]}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCardIdx(prev => (prev - 1 + cards.length) % cards.length)}
            className="flex-1 bg-gray-200 rounded-xl py-3 font-bold">← 上一张</button>
          <button onClick={() => setCardIdx(prev => (prev + 1) % cards.length)}
            className="flex-1 bg-purple-500 text-white rounded-xl py-3 font-bold">下一张 →</button>
        </div>
        <p className="text-center text-xs text-gray-400">{cardIdx + 1} / {cards.length}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="💬" title="聊天卡片" subtitle="不知道聊什么？抽一张卡片" />
      <div className="bg-blue-50 rounded-2xl p-4">
        <p className="text-sm text-gray-600">💡 和朋友或家人在一起但不知道说什么？抽一张卡片，开始一段有趣的对话吧！</p>
      </div>
      <div className="space-y-3">
        {CONVERSATION_CARDS.map(cat => (
          <button key={cat.category} onClick={() => setCategory(cat)}
            className="w-full flex items-center gap-4 bg-white rounded-2xl p-5 shadow hover:shadow-md transition">
            <span className="text-3xl">{cat.emoji}</span>
            <div className="text-left">
              <p className="font-bold text-gray-800">{cat.category}话题</p>
              <p className="text-xs text-gray-500">{cat.cards.length}张卡片</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Emotion Map Quest ──────────────────────────────────────────────────────
function EmotionMapQuestPage({ maps, onSave, onBack }) {
  const [slots, setSlots] = useState({});
  const [notes, setNotes] = useState({});
  const allFilled = TIME_SLOTS.every(s => slots[s.id]);
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🗺️" title="情绪地图" subtitle="标记你一天中不同时段的心情" />
      <div className="space-y-3">
        {TIME_SLOTS.map(slot => (
          <div key={slot.id} className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{slot.emoji}</span>
              <div>
                <p className="font-bold text-gray-800">{slot.label}</p>
                <p className="text-xs text-gray-500">{slot.hint}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {MAP_EMOTIONS.map(e => (
                <button key={e.label} onClick={() => setSlots(prev => ({ ...prev, [slot.id]: e }))}
                  className={`px-3 py-1 rounded-full text-sm transition ${slots[slot.id]?.label === e.label ? e.color + ' ring-2 ring-offset-1 ring-gray-400 font-bold' : 'bg-gray-100'}`}>
                  {e.emoji} {e.label}
                </button>
              ))}
            </div>
            <input type="text" placeholder="发生了什么？（可选）" value={notes[slot.id] || ''}
              onChange={e => setNotes(prev => ({ ...prev, [slot.id]: e.target.value }))}
              className="w-full text-sm border rounded-lg px-3 py-2" />
          </div>
        ))}
      </div>
      {allFilled && (
        <button onClick={() => { onSave({ date: todayStr(), slots, notes }); setSlots({}); setNotes({}); }}
          className="w-full py-3 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-xl font-bold">
          保存今日情绪地图 🗺️
        </button>
      )}
      {maps.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">最近记录 ({maps.length}次)</p>
          {maps.slice(-3).reverse().map((m, i) => (
            <div key={i} className="flex gap-2 text-sm py-1 border-b last:border-0">
              {TIME_SLOTS.map(s => (
                <span key={s.id} title={s.label}>{m.slots[s.id]?.emoji || '—'}</span>
              ))}
              <span className="text-gray-400 text-xs ml-auto">{m.date?.slice(0, 10)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Comfort Menu ───────────────────────────────────────────────────────────
function ComfortMenuPage({ menu, onSave, onBack }) {
  const [picks, setPicks] = useState({ appetizer: [], main: [], dessert: [] });
  const toggle = (cat, item) => {
    setPicks(prev => {
      const arr = prev[cat];
      return { ...prev, [cat]: arr.includes(item.label) ? arr.filter(x => x !== item.label) : [...arr, item.label] };
    });
  };
  const hasPicks = picks.appetizer.length + picks.main.length + picks.dessert.length > 0;
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🍽️" title="安慰菜单" subtitle="选择能让你感觉好一点的事情" />
      <div className="bg-white rounded-xl p-4 shadow">
        <p className="font-bold text-pink-600 mb-2">🥗 开胃菜（1分钟）</p>
        <div className="flex flex-wrap gap-2">
          {COMFORT_APPETIZERS.map(item => (
            <button key={item.label} onClick={() => toggle('appetizer', item)}
              className={`px-3 py-2 rounded-lg text-sm transition ${picks.appetizer.includes(item.label) ? 'bg-pink-200 font-bold ring-2 ring-pink-400' : 'bg-pink-50'}`}>
              {item.emoji} {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow">
        <p className="font-bold text-orange-600 mb-2">🍲 主菜（5-10分钟）</p>
        <div className="flex flex-wrap gap-2">
          {COMFORT_MAINS.map(item => (
            <button key={item.label} onClick={() => toggle('main', item)}
              className={`px-3 py-2 rounded-lg text-sm transition ${picks.main.includes(item.label) ? 'bg-orange-200 font-bold ring-2 ring-orange-400' : 'bg-orange-50'}`}>
              {item.emoji} {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow">
        <p className="font-bold text-purple-600 mb-2">🍰 甜点（犒劳自己）</p>
        <div className="flex flex-wrap gap-2">
          {COMFORT_DESSERTS.map(item => (
            <button key={item.label} onClick={() => toggle('dessert', item)}
              className={`px-3 py-2 rounded-lg text-sm transition ${picks.dessert.includes(item.label) ? 'bg-purple-200 font-bold ring-2 ring-purple-400' : 'bg-purple-50'}`}>
              {item.emoji} {item.label}
            </button>
          ))}
        </div>
      </div>
      {hasPicks && (
        <button onClick={() => { onSave({ date: todayStr(), picks }); setPicks({ appetizer: [], main: [], dessert: [] }); }}
          className="w-full py-3 bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-xl font-bold">
          保存我的安慰菜单 🍽️
        </button>
      )}
      {menu.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">我的菜单 ({menu.length}份)</p>
          {menu.slice(-3).reverse().map((m, i) => (
            <div key={i} className="text-sm py-2 border-b last:border-0">
              <p className="text-gray-400 text-xs">{m.date?.slice(0, 10)}</p>
              <p>🥗 {m.picks.appetizer.join('、') || '—'}</p>
              <p>🍲 {m.picks.main.join('、') || '—'}</p>
              <p>🍰 {m.picks.dessert.join('、') || '—'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Praise Jar ─────────────────────────────────────────────────────────────
function PraiseJarPage({ praises, onAdd, onBack }) {
  const [from, setFrom] = useState('');
  const [msg, setMsg] = useState('');
  const [opened, setOpened] = useState(null);
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🏺" title="表扬罐" subtitle="收集来自他人的赞美和鼓励" />
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <p className="font-bold text-amber-600">添加一条表扬</p>
        <input type="text" placeholder="来自谁？（妈妈、老师、朋友…）" value={from}
          onChange={e => setFrom(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
        <textarea placeholder="他们说了什么好话？" value={msg}
          onChange={e => setMsg(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
        {from.trim() && msg.trim() && (
          <button onClick={() => { onAdd({ from: from.trim(), msg: msg.trim(), date: todayStr() }); setFrom(''); setMsg(''); }}
            className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-white rounded-xl font-bold">
            放进罐子 🏺
          </button>
        )}
      </div>
      {praises.length > 0 && (
        <div className="space-y-2">
          <p className="font-bold text-gray-700">罐子里有 {praises.length} 条表扬 ✨</p>
          {opened !== null ? (
            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-5 shadow text-center space-y-2">
              <p className="text-4xl">🌟</p>
              <p className="text-lg font-bold text-amber-800">"{praises[opened].msg}"</p>
              <p className="text-sm text-amber-600">—— {praises[opened].from}</p>
              <button onClick={() => setOpened(null)} className="text-sm text-amber-500 underline">关闭</button>
            </div>
          ) : (
            <button onClick={() => setOpened(Math.floor(Math.random() * praises.length))}
              className="w-full py-3 bg-gradient-to-r from-yellow-300 to-amber-300 text-amber-800 rounded-xl font-bold text-lg">
              随机打开一条 🎁
            </button>
          )}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {praises.slice(-12).map((_, i) => (
              <button key={i} onClick={() => setOpened(praises.length - 12 + i >= 0 ? praises.length - 12 + i : i)}
                className="bg-amber-100 rounded-lg p-3 text-2xl hover:scale-110 transition">⭐</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Feelings Translator ────────────────────────────────────────────────────
function FeelingsTranslatorPage({ translations, onSave, onBack }) {
  const [selected, setSelected] = useState(null);
  const [chosen, setChosen] = useState(null);
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🔄" title="情绪翻译器" subtitle="把行为翻译成真正的感受" />
      {selected === null ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 text-center">当你做这些事情时，你真正的感受是什么？</p>
          {BEHAVIOR_FEELINGS.map((bf, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className="w-full bg-white rounded-xl p-4 shadow flex items-center gap-3 hover:scale-102 transition">
              <span className="text-3xl">{bf.emoji}</span>
              <div className="text-left">
                <p className="font-bold text-gray-800">当我{bf.behavior}的时候…</p>
                <p className="text-xs text-gray-500">点击看看可能的感受</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl mb-2">{BEHAVIOR_FEELINGS[selected].emoji}</p>
            <p className="font-bold text-lg text-gray-800">当我{BEHAVIOR_FEELINGS[selected].behavior}的时候…</p>
            <p className="text-sm text-gray-500 mt-1">我真正的感受可能是：</p>
          </div>
          {BEHAVIOR_FEELINGS[selected].feelings.map((f, i) => (
            <button key={i} onClick={() => setChosen(i)}
              className={`w-full p-4 rounded-xl text-left transition ${chosen === i ? 'bg-gradient-to-r from-purple-200 to-pink-200 ring-2 ring-purple-400' : 'bg-white shadow'}`}>
              <p className="font-semibold text-gray-800">{f}</p>
            </button>
          ))}
          {chosen !== null && (
            <button onClick={() => {
              onSave({ behavior: BEHAVIOR_FEELINGS[selected].behavior, feeling: BEHAVIOR_FEELINGS[selected].feelings[chosen], date: todayStr() });
              setSelected(null); setChosen(null);
            }} className="w-full py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-bold">
              记住这个翻译 🔄
            </button>
          )}
          <button onClick={() => { setSelected(null); setChosen(null); }}
            className="w-full py-2 text-gray-500 text-sm">返回行为列表</button>
        </div>
      )}
      {translations.length > 0 && selected === null && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">我的翻译记录 ({translations.length})</p>
          {translations.slice(-5).reverse().map((t, i) => (
            <div key={i} className="text-sm py-2 border-b last:border-0">
              <p className="text-gray-600">{t.behavior} → {t.feeling}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mindful Listening ──────────────────────────────────────────────────────
function MindfulListeningPage({ logs, onSave, onBack }) {
  const [phase, setPhase] = useState('start');
  const [timer, setTimer] = useState(30);
  const [sounds, setSounds] = useState([]);
  const [prompt] = useState(() => LISTENING_PROMPTS[Math.floor(Math.random() * LISTENING_PROMPTS.length)]);
  useEffect(() => {
    if (phase !== 'listening' || timer <= 0) return;
    const id = setTimeout(() => {
      if (timer === 1) setPhase('record');
      setTimer(t => t - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [phase, timer]);
  const toggleSound = (s) => {
    setSounds(prev => prev.includes(s.label) ? prev.filter(x => x !== s.label) : [...prev, s.label]);
  };
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="👂" title="静心聆听" subtitle="用耳朵感受这个世界" />
      {phase === 'start' && (
        <div className="bg-white rounded-xl p-6 shadow text-center space-y-4">
          <p className="text-5xl">🔇</p>
          <p className="text-gray-700">{prompt}</p>
          <button onClick={() => setPhase('listening')}
            className="px-6 py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-xl font-bold">
            开始聆听 30秒 👂
          </button>
        </div>
      )}
      {phase === 'listening' && (
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-8 shadow text-center space-y-4">
          <p className="text-6xl">👂</p>
          <p className="text-4xl font-bold text-teal-600">{timer}秒</p>
          <p className="text-gray-600">安静地听…注意周围的声音</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-teal-400 h-2 rounded-full transition-all" style={{ width: `${((30 - timer) / 30) * 100}%` }} />
          </div>
        </div>
      )}
      {phase === 'record' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="font-bold text-teal-600 mb-3">你听到了什么声音？</p>
            <div className="flex flex-wrap gap-2">
              {SOUND_CATEGORIES.map(s => (
                <button key={s.label} onClick={() => toggleSound(s)}
                  className={`px-3 py-2 rounded-lg text-sm transition ${sounds.includes(s.label) ? 'bg-teal-200 font-bold ring-2 ring-teal-400' : 'bg-gray-100'}`}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>
          {sounds.length > 0 && (
            <button onClick={() => { onSave({ sounds, date: todayStr() }); setPhase('done'); }}
              className="w-full py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-xl font-bold">
              保存聆听记录 ✨
            </button>
          )}
        </div>
      )}
      {phase === 'done' && (
        <div className="bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl p-6 shadow text-center space-y-3">
          <p className="text-5xl">🎉</p>
          <p className="font-bold text-teal-700 text-lg">太棒了！</p>
          <p className="text-gray-600">你听到了 {sounds.length} 种声音</p>
          <p className="text-sm text-gray-500">当你的脑袋很吵的时候，试着安静地听听周围，让注意力回到当下。</p>
          <button onClick={() => { setPhase('start'); setSounds([]); setTimer(30); }}
            className="px-4 py-2 bg-teal-200 text-teal-700 rounded-lg text-sm">再听一次</button>
        </div>
      )}
      {logs.length > 0 && phase === 'start' && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">聆听记录 ({logs.length}次)</p>
          {logs.slice(-5).reverse().map((l, i) => (
            <p key={i} className="text-sm py-1 border-b last:border-0 text-gray-600">
              {l.sounds.join('、')} <span className="text-gray-400 text-xs ml-1">{l.date?.slice(0, 10)}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Courage Coins ──────────────────────────────────────────────────────────
function CourageCoinPage({ coins, onEarn, onBack }) {
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState('');
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🪙" title="勇气金币" subtitle="每次勇敢都值得一枚金币" />
      <div className="bg-white rounded-xl p-4 shadow">
        <p className="font-bold text-amber-600 mb-3">今天你做了什么勇敢的事？</p>
        <div className="grid grid-cols-2 gap-2">
          {COURAGE_TYPES.map((ct, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className={`p-3 rounded-xl text-left transition ${selected === i ? 'bg-amber-200 ring-2 ring-amber-400' : 'bg-amber-50'}`}>
              <p className="text-2xl">{ct.emoji}</p>
              <p className="font-bold text-sm text-gray-800">{ct.label}</p>
              <p className="text-xs text-gray-500">{ct.desc}</p>
            </button>
          ))}
        </div>
      </div>
      {selected !== null && (
        <div className="bg-white rounded-xl p-4 shadow space-y-3">
          <input type="text" placeholder="具体做了什么？" value={detail}
            onChange={e => setDetail(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          {detail.trim() && (
            <button onClick={() => {
              onEarn({ type: COURAGE_TYPES[selected].label, detail: detail.trim(), date: todayStr() });
              setSelected(null); setDetail('');
            }} className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-white rounded-xl font-bold">
              获得勇气金币 🪙
            </button>
          )}
        </div>
      )}
      {coins.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-amber-700 mb-2">我的金币 💰 {coins.length}枚</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {coins.slice(-12).map((c, i) => (
              <div key={i} className={`w-10 h-10 rounded-full ${COIN_COLORS[i % COIN_COLORS.length]} flex items-center justify-center text-lg shadow`}>🪙</div>
            ))}
          </div>
          {coins.slice(-3).reverse().map((c, i) => (
            <p key={i} className="text-sm py-1 border-b last:border-0 text-gray-600">
              {c.type}：{c.detail} <span className="text-gray-400 text-xs">{c.date?.slice(0, 10)}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Friendship Recipe ──────────────────────────────────────────────────────
function FriendshipRecipePage({ recipes, onSave, onBack }) {
  const [friendName, setFriendName] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState('');
  const toggleIngredient = (label) => {
    setIngredients(prev => prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]);
  };
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="👨‍🍳" title="友谊配方" subtitle="写一份好朋友的配方" />
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <input type="text" placeholder="这份配方是给谁的？（朋友名字）" value={friendName}
          onChange={e => setFriendName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
        <p className="font-bold text-green-600">选择配料：</p>
        <div className="flex flex-wrap gap-2">
          {FRIENDSHIP_INGREDIENTS.map(ing => (
            <button key={ing.label} onClick={() => toggleIngredient(ing.label)}
              className={`px-3 py-2 rounded-lg text-sm transition ${ingredients.includes(ing.label) ? 'bg-green-200 font-bold ring-2 ring-green-400' : 'bg-green-50'}`}>
              {ing.emoji} {ing.label}
            </button>
          ))}
        </div>
        <textarea placeholder="怎么做一个好朋友？（做法/步骤）" value={instructions}
          onChange={e => setInstructions(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
        {friendName.trim() && ingredients.length > 0 && (
          <button onClick={() => {
            onSave({ friend: friendName.trim(), ingredients, instructions: instructions.trim(), date: todayStr() });
            setFriendName(''); setIngredients([]); setInstructions('');
          }} className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl font-bold">
            保存配方 👨‍🍳
          </button>
        )}
      </div>
      {recipes.length > 0 && (
        <div className="space-y-3">
          <p className="font-bold text-gray-700">我的配方 ({recipes.length}份)</p>
          {recipes.slice(-3).reverse().map((r, i) => (
            <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow">
              <p className="font-bold text-green-700">给 {r.friend} 的友谊配方</p>
              <p className="text-sm text-gray-600">配料：{r.ingredients.join('、')}</p>
              {r.instructions && <p className="text-sm text-gray-500 mt-1">做法：{r.instructions}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Thought Bubbles ────────────────────────────────────────────────────────
function ThoughtBubblesPage({ entries, onSave, onBack }) {
  const [sceneIdx, setSceneIdx] = useState(null);
  const [bubbles, setBubbles] = useState({});
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="💭" title="想法气泡" subtitle="猜猜他们在想什么？" />
      {sceneIdx === null ? (
        <div className="space-y-3">
          {BUBBLE_SCENES.map((scene, i) => (
            <button key={i} onClick={() => setSceneIdx(i)}
              className="w-full bg-white rounded-xl p-4 shadow flex items-center gap-3 hover:scale-102 transition">
              <span className="text-3xl">{scene.emoji}</span>
              <div className="text-left">
                <p className="font-bold text-gray-800">{scene.scene}</p>
                <p className="text-xs text-gray-500">{scene.characters.map(c => c.emoji).join(' ')}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 shadow text-center">
            <p className="text-3xl">{BUBBLE_SCENES[sceneIdx].emoji}</p>
            <p className="font-bold text-gray-800 mt-2">{BUBBLE_SCENES[sceneIdx].scene}</p>
          </div>
          {BUBBLE_SCENES[sceneIdx].characters.map((char, ci) => (
            <div key={ci} className="bg-white rounded-xl p-4 shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{char.emoji}</span>
                <p className="font-bold text-gray-700">{char.name}在想：</p>
              </div>
              <input type="text" placeholder={`例如：${BUBBLE_SCENES[sceneIdx].example[ci]}`}
                value={bubbles[char.name] || ''}
                onChange={e => setBubbles(prev => ({ ...prev, [char.name]: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
          {BUBBLE_SCENES[sceneIdx].characters.every(c => bubbles[c.name]?.trim()) && (
            <button onClick={() => {
              onSave({ scene: BUBBLE_SCENES[sceneIdx].scene, bubbles: { ...bubbles }, date: todayStr() });
              setSceneIdx(null); setBubbles({});
            }} className="w-full py-3 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-xl font-bold">
              保存想法气泡 💭
            </button>
          )}
          <button onClick={() => { setSceneIdx(null); setBubbles({}); }}
            className="w-full py-2 text-gray-500 text-sm">返回场景列表</button>
        </div>
      )}
      {entries.length > 0 && sceneIdx === null && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">完成的气泡 ({entries.length}个场景)</p>
          {entries.slice(-3).reverse().map((e, i) => (
            <div key={i} className="text-sm py-2 border-b last:border-0">
              <p className="text-gray-600">{e.scene}</p>
              {Object.entries(e.bubbles).map(([name, thought]) => (
                <p key={name} className="text-gray-500 pl-2">💭 {name}: {thought}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Calm Breathing Buddy ───────────────────────────────────────────────────
function CalmBuddyPage({ sessions, onComplete, onBack }) {
  const [buddy, setBuddy] = useState(null);
  const [phase, setPhase] = useState('pick');
  const [breathPhase, setBreathPhase] = useState('in');
  const [cycles, setCycles] = useState(0);
  const [timer, setTimer] = useState(4);
  useEffect(() => {
    if (phase !== 'breathing') return;
    if (cycles >= 5) { setPhase('done'); return; }
    const id = setTimeout(() => {
      if (timer <= 1) {
        if (breathPhase === 'in') { setBreathPhase('out'); setTimer(4); }
        else { setBreathPhase('in'); setTimer(4); setCycles(c => c + 1); }
      } else {
        setTimer(t => t - 1);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [phase, breathPhase, timer, cycles]);
  const buddyScale = phase === 'breathing' ? (breathPhase === 'in' ? `scale-${100 + (4 - timer) * 10}` : `scale-${140 - (4 - timer) * 10}`) : '';
  const sizeClass = phase === 'breathing'
    ? (breathPhase === 'in' ? 'text-8xl' : 'text-6xl')
    : 'text-7xl';
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🧸" title="呼吸伙伴" subtitle="让小伙伴陪你一起呼吸" />
      {phase === 'pick' && (
        <div className="space-y-3">
          <p className="text-center text-gray-600">选一个呼吸小伙伴放在你的肚子上</p>
          <div className="grid grid-cols-3 gap-3">
            {BUDDY_ANIMALS.map((b, i) => (
              <button key={i} onClick={() => setBuddy(b)}
                className={`bg-gradient-to-br ${b.color} rounded-xl p-4 text-center transition ${buddy?.name === b.name ? 'ring-3 ring-purple-400 scale-105' : ''}`}>
                <p className="text-4xl">{b.emoji}</p>
                <p className="text-sm font-bold text-gray-700 mt-1">{b.name}</p>
              </button>
            ))}
          </div>
          {buddy && (
            <button onClick={() => { setPhase('breathing'); setCycles(0); setBreathPhase('in'); setTimer(4); }}
              className="w-full py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-bold">
              开始呼吸 🫁
            </button>
          )}
        </div>
      )}
      {phase === 'breathing' && buddy && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 shadow text-center space-y-4">
          <p className={`transition-all duration-1000 ${sizeClass}`}>{buddy.emoji}</p>
          <p className="text-2xl font-bold text-purple-600">
            {breathPhase === 'in' ? '吸气… ⬆️' : '呼气… ⬇️'}
          </p>
          <p className="text-4xl font-bold text-purple-400">{timer}</p>
          <p className="text-sm text-gray-500">第 {cycles + 1}/5 次呼吸</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-400 h-2 rounded-full transition-all" style={{ width: `${(cycles / 5) * 100}%` }} />
          </div>
          <p className="text-sm text-gray-600">
            {breathPhase === 'in' ? `看着${buddy.name}慢慢升高…` : `${buddy.name}慢慢落下…`}
          </p>
        </div>
      )}
      {phase === 'done' && buddy && (
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 shadow text-center space-y-3">
          <p className="text-6xl">{buddy.emoji}</p>
          <p className="font-bold text-purple-700 text-lg">做得真好！</p>
          <p className="text-gray-600">{buddy.name}陪你完成了5次呼吸</p>
          <button onClick={() => { onComplete({ buddy: buddy.name, date: todayStr() }); setPhase('pick'); setBuddy(null); }}
            className="px-6 py-2 bg-purple-400 text-white rounded-xl font-bold">完成 ✨</button>
        </div>
      )}
      {sessions.length > 0 && phase === 'pick' && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">呼吸记录 ({sessions.length}次)</p>
          {sessions.slice(-5).reverse().map((s, i) => (
            <p key={i} className="text-sm py-1 border-b last:border-0 text-gray-600">
              和{s.buddy}一起呼吸 <span className="text-gray-400 text-xs">{s.date?.slice(0, 10)}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Accomplishment Timeline ────────────────────────────────────────────────
function AccomplishmentTimelinePage({ entries, onAdd, onBack }) {
  const [type, setType] = useState(null);
  const [desc, setDesc] = useState('');
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🏆" title="成就时间线" subtitle="记录你的每一个闪光时刻" />
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <p className="font-bold text-indigo-600">添加一个成就</p>
        <div className="flex flex-wrap gap-2">
          {ACCOMPLISHMENT_TYPES.map((t, i) => (
            <button key={i} onClick={() => setType(t)}
              className={`px-3 py-2 rounded-lg text-sm transition ${type?.label === t.label ? 'bg-indigo-200 font-bold ring-2 ring-indigo-400' : 'bg-indigo-50'}`}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        {type && (
          <>
            <input type="text" placeholder="具体做了什么？" value={desc}
              onChange={e => setDesc(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            {desc.trim() && (
              <button onClick={() => { onAdd({ type: type.label, emoji: type.emoji, desc: desc.trim(), date: todayStr() }); setType(null); setDesc(''); }}
                className="w-full py-3 bg-gradient-to-r from-indigo-400 to-purple-400 text-white rounded-xl font-bold">
                添加到时间线 🏆
              </button>
            )}
          </>
        )}
      </div>
      {entries.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-indigo-700 mb-3">我的成就 ({entries.length}个) ✨</p>
          <div className="relative border-l-2 border-indigo-200 pl-4 space-y-4">
            {entries.slice(-10).reverse().map((e, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-6 w-4 h-4 rounded-full bg-indigo-400 border-2 border-white" />
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3">
                  <p className="font-bold text-gray-800">{e.emoji} {e.desc}</p>
                  <p className="text-xs text-gray-500">{e.type} · {e.date?.slice(0, 10)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Daily Wins ─────────────────────────────────────────────────────────────
function DailyWinsPage({ wins, onSave, onBack }) {
  const [w1, setW1] = useState('');
  const [w2, setW2] = useState('');
  const [w3, setW3] = useState('');
  const todayWins = wins.find(w => w.date === todayStr());
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🏅" title="每日小胜利" subtitle="今天有什么值得庆祝的小事？" />
      {todayWins ? (
        <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-5 shadow space-y-3">
          <p className="font-bold text-amber-700 text-center">今天的3个小胜利 🎉</p>
          {todayWins.items.map((w, i) => (
            <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-3">
              <span className="text-xl">🌟</span>
              <p className="text-gray-800">{w}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-4 shadow space-y-3">
          <p className="text-sm text-gray-600">不管多小的事，都值得庆祝！</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">1️⃣</span>
              <input type="text" placeholder="第一个小胜利" value={w1}
                onChange={e => setW1(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">2️⃣</span>
              <input type="text" placeholder="第二个小胜利" value={w2}
                onChange={e => setW2(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">3️⃣</span>
              <input type="text" placeholder="第三个小胜利" value={w3}
                onChange={e => setW3(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          {w1.trim() && w2.trim() && w3.trim() && (
            <button onClick={() => { onSave({ items: [w1.trim(), w2.trim(), w3.trim()], date: todayStr() }); setW1(''); setW2(''); setW3(''); }}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-400 text-white rounded-xl font-bold">
              记录今天的胜利 🏅
            </button>
          )}
        </div>
      )}
      {wins.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-amber-700 mb-2">胜利记录 ({wins.length}天)</p>
          {wins.slice(-5).reverse().map((w, i) => (
            <div key={i} className="py-2 border-b last:border-0">
              <p className="text-xs text-gray-400">{w.date?.slice(0, 10)}</p>
              {w.items.map((item, j) => (
                <p key={j} className="text-sm text-gray-600">🌟 {item}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sensory Countdown ──────────────────────────────────────────────────────
function SensoryCountdownPage({ logs, onSave, onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState('');
  const s = SENSORY_STEPS[step];
  const done = step >= SENSORY_STEPS.length;
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="5️⃣" title="感官倒数" subtitle="5-4-3-2-1，回到当下" />
      {!done ? (
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {SENSORY_STEPS.map((ss, i) => (
              <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < step ? 'bg-green-300 text-white' : i === step ? 'bg-gradient-to-r ' + ss.color + ' text-gray-800 ring-2 ring-gray-400' : 'bg-gray-200 text-gray-400'}`}>
                {ss.count}
              </div>
            ))}
          </div>
          <div className={`bg-gradient-to-br ${s.color} rounded-xl p-6 shadow text-center space-y-3`}>
            <p className="text-5xl">{s.emoji}</p>
            <p className="text-xl font-bold text-gray-800">说出 {s.count} 样你{s.sense}的东西</p>
          </div>
          <div className="space-y-2">
            {Array.from({ length: s.count }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${(answers[step] || [])[i] ? 'bg-green-400 text-white' : 'bg-gray-200'}`}>
                  {i + 1}
                </span>
                {(answers[step] || [])[i] ? (
                  <span className="text-sm text-gray-700">{(answers[step] || [])[i]}</span>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <input type="text" placeholder={s.placeholder} value={current}
                      onChange={e => setCurrent(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                    {current.trim() && (
                      <button onClick={() => {
                        setAnswers(prev => ({ ...prev, [step]: [...(prev[step] || []), current.trim()] }));
                        setCurrent('');
                      }} className="px-3 py-1 bg-green-400 text-white rounded-lg text-sm">+</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {(answers[step] || []).length >= s.count && (
            <button onClick={() => { setStep(prev => prev + 1); setCurrent(''); }}
              className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl font-bold">
              {step < 4 ? '下一步 →' : '完成 ✨'}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-6 shadow text-center space-y-3">
          <p className="text-5xl">🎉</p>
          <p className="font-bold text-green-700 text-lg">太棒了！你回到了当下！</p>
          <p className="text-sm text-gray-600">你用五种感官重新连接了周围的世界。</p>
          <button onClick={() => { onSave({ answers, date: todayStr() }); setStep(0); setAnswers({}); }}
            className="px-6 py-2 bg-green-400 text-white rounded-xl font-bold">保存记录</button>
        </div>
      )}
      {logs.length > 0 && !done && step === 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700">练习记录 ({logs.length}次)</p>
        </div>
      )}
    </div>
  );
}

// ─── Emotion Jar Experiment ─────────────────────────────────────────────────
function EmotionJarPage({ logs, onSave, onBack }) {
  const [emotion, setEmotion] = useState(null);
  const [phase, setPhase] = useState('pick');
  const [settling, setSettling] = useState(100);
  useEffect(() => {
    if (phase !== 'settling' || settling <= 0) return;
    const id = setTimeout(() => {
      setSettling(s => Math.max(0, s - 2));
      if (settling <= 2) setPhase('settled');
    }, 100);
    return () => clearTimeout(id);
  }, [phase, settling]);
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🫧" title="情绪瓶实验" subtitle="摇一摇，看情绪慢慢沉淀" />
      {phase === 'pick' && (
        <div className="space-y-3">
          <p className="text-center text-gray-600">你现在有什么情绪在翻涌？</p>
          <div className="flex flex-wrap justify-center gap-3">
            {GLITTER_EMOTIONS.map(e => (
              <button key={e.label} onClick={() => setEmotion(e)}
                className={`px-4 py-3 rounded-xl text-center transition ${emotion?.label === e.label ? 'ring-2 ring-gray-400 scale-105' : ''}`}
                style={{ backgroundColor: e.color + '30' }}>
                <p className="text-2xl">{e.emoji}</p>
                <p className="text-sm font-bold">{e.label}</p>
              </button>
            ))}
          </div>
          {emotion && (
            <button onClick={() => { setPhase('shaking'); setTimeout(() => { setPhase('settling'); setSettling(100); }, 2000); }}
              className="w-full py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-bold">
              摇一摇瓶子 🫧
            </button>
          )}
        </div>
      )}
      {phase === 'shaking' && (
        <div className="bg-gradient-to-b from-purple-100 to-pink-100 rounded-xl p-8 shadow text-center space-y-4 animate-pulse">
          <p className="text-7xl">🫧</p>
          <p className="text-xl font-bold text-purple-600">摇晃中…</p>
          <p className="text-gray-600">看，{emotion?.label}的颜色在瓶子里翻滚</p>
        </div>
      )}
      {(phase === 'settling' || phase === 'settled') && (
        <div className="bg-gradient-to-b from-white to-purple-50 rounded-xl p-8 shadow text-center space-y-4">
          <p className="text-7xl">🫧</p>
          <p className="font-bold text-purple-600">{phase === 'settled' ? '沉淀好了' : '正在沉淀…'}</p>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-200" style={{ width: `${100 - settling}%`, backgroundColor: emotion?.color }} />
          </div>
          <p className="text-sm text-gray-600">
            {phase === 'settled' ? '看，当你安静下来，情绪也会慢慢平静。' : '慢慢呼吸，看着颜色沉到底部…'}
          </p>
          {phase === 'settled' && (
            <button onClick={() => { onSave({ emotion: emotion?.label, date: todayStr() }); setPhase('pick'); setEmotion(null); }}
              className="px-6 py-2 bg-purple-400 text-white rounded-xl font-bold">完成 ✨</button>
          )}
        </div>
      )}
      {logs.length > 0 && phase === 'pick' && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">沉淀记录 ({logs.length}次)</p>
          {logs.slice(-5).reverse().map((l, i) => (
            <p key={i} className="text-sm py-1 border-b last:border-0 text-gray-600">
              {l.emotion} <span className="text-gray-400 text-xs">{l.date?.slice(0, 10)}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Strength Trading Cards ─────────────────────────────────────────────────
function StrengthTradingCardsPage({ cards, onCollect, onBack }) {
  const [selected, setSelected] = useState(null);
  const [power, setPower] = useState(5);
  const [story, setStory] = useState('');
  const collected = cards.map(c => c.name);
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🃏" title="优势卡牌" subtitle="收集你的力量卡片" />
      {selected === null ? (
        <div className="space-y-3">
          <p className="text-center text-gray-600">选一个你拥有的优势</p>
          <div className="grid grid-cols-2 gap-3">
            {CARD_STRENGTHS.map((cs, i) => (
              <button key={i} onClick={() => setSelected(cs)}
                className={`p-4 rounded-xl text-center transition border-2 ${collected.includes(cs.name) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
                <p className="text-3xl">{cs.emoji}</p>
                <p className="font-bold text-gray-800">{cs.name}</p>
                <p className="text-xs text-gray-500">{cs.desc}</p>
                {collected.includes(cs.name) && <p className="text-xs text-yellow-600 mt-1">✅ 已收集</p>}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-6 shadow text-center border-4 ${CARD_BORDERS[Math.floor(Math.random() * CARD_BORDERS.length)]}`}>
            <p className="text-5xl">{selected.emoji}</p>
            <p className="text-xl font-bold text-gray-800 mt-2">{selected.name}</p>
            <p className="text-sm text-gray-600">{selected.desc}</p>
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">力量等级</p>
              <input type="range" min="1" max="10" value={power} onChange={e => setPower(Number(e.target.value))}
                className="w-full" />
              <p className="text-lg font-bold text-amber-600">⚡ {power}/10</p>
            </div>
          </div>
          <textarea placeholder="写一个你展现这个优势的故事…" value={story}
            onChange={e => setStory(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
          <button onClick={() => {
            onCollect({ name: selected.name, emoji: selected.emoji, power, story: story.trim(), date: todayStr() });
            setSelected(null); setPower(5); setStory('');
          }} className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-400 text-white rounded-xl font-bold">
            收集这张卡牌 🃏
          </button>
          <button onClick={() => { setSelected(null); setStory(''); }}
            className="w-full py-2 text-gray-500 text-sm">返回</button>
        </div>
      )}
      {cards.length > 0 && selected === null && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-amber-700 mb-2">我的卡牌 ({cards.length}张)</p>
          <div className="grid grid-cols-3 gap-2">
            {cards.slice(-9).map((c, i) => (
              <div key={i} className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-2 text-center border border-yellow-300">
                <p className="text-2xl">{c.emoji}</p>
                <p className="text-xs font-bold">{c.name}</p>
                <p className="text-xs text-amber-600">⚡{c.power}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mood DJ ────────────────────────────────────────────────────────────────
function MoodDJPage({ mixes, onSave, onBack }) {
  const [sliders, setSliders] = useState({ energy: 5, feeling: 5, calm: 5 });
  const [note, setNote] = useState('');
  const moodEmoji = sliders.feeling > 7 ? '😊' : sliders.feeling > 4 ? '😐' : '😢';
  const energyEmoji = sliders.energy > 7 ? '⚡' : sliders.energy > 4 ? '🔋' : '😴';
  const calmEmoji = sliders.calm > 7 ? '😌' : sliders.calm > 4 ? '😐' : '😰';
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎧" title="心情DJ" subtitle="调节你的心情频率" />
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 shadow text-center">
        <p className="text-5xl">{moodEmoji}{energyEmoji}{calmEmoji}</p>
        <p className="text-sm text-gray-600 mt-2">你的心情混音</p>
      </div>
      <div className="space-y-4">
        {DJ_SLIDERS.map(s => (
          <div key={s.id} className="bg-white rounded-xl p-4 shadow">
            <div className="flex justify-between text-sm mb-1">
              <span>{s.low}</span>
              <span className="font-bold">{s.label}: {sliders[s.id]}</span>
              <span>{s.high}</span>
            </div>
            <input type="range" min="1" max="10" value={sliders[s.id]}
              onChange={e => setSliders(prev => ({ ...prev, [s.id]: Number(e.target.value) }))}
              className="w-full" />
          </div>
        ))}
      </div>
      <input type="text" placeholder="用一句话描述现在的感觉（可选）" value={note}
        onChange={e => setNote(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
      <button onClick={() => { onSave({ sliders: { ...sliders }, note: note.trim(), date: todayStr() }); setNote(''); }}
        className="w-full py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-bold">
        保存混音 🎧
      </button>
      {mixes.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">混音记录 ({mixes.length})</p>
          {mixes.slice(-5).reverse().map((m, i) => (
            <div key={i} className="text-sm py-2 border-b last:border-0">
              <p className="text-gray-600">精力{m.sliders.energy} 心情{m.sliders.feeling} 平静{m.sliders.calm} {m.note && `— ${m.note}`}</p>
              <p className="text-xs text-gray-400">{m.date?.slice(0, 10)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Helpful Thoughts Vending Machine ───────────────────────────────────────
function VendingMachinePage({ logs, onUse, onBack }) {
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('insert');
  const [reframe, setReframe] = useState('');
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🏭" title="想法贩卖机" subtitle="投入消极想法，得到积极想法" />
      {phase === 'insert' && (
        <div className="space-y-3">
          <p className="text-center text-gray-600">选一个经常出现在脑海里的消极想法</p>
          {NEGATIVE_COINS.map((nc, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className={`w-full p-4 rounded-xl text-left transition ${selected === i ? 'bg-red-100 ring-2 ring-red-400' : 'bg-white shadow'}`}>
              <p className="font-semibold text-gray-800">🪙 "{nc.thought}"</p>
            </button>
          ))}
          {selected !== null && (
            <button onClick={() => { setPhase('vending'); setTimeout(() => {
              const r = NEGATIVE_COINS[selected].reframes;
              setReframe(r[Math.floor(Math.random() * r.length)]);
              setPhase('result');
            }, 1500); }}
              className="w-full py-3 bg-gradient-to-r from-red-400 to-orange-400 text-white rounded-xl font-bold">
              投入消极硬币 🪙
            </button>
          )}
        </div>
      )}
      {phase === 'vending' && (
        <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl p-8 shadow text-center space-y-4 animate-pulse">
          <p className="text-7xl">🏭</p>
          <p className="text-xl font-bold text-gray-600">叮咚叮咚…</p>
          <p className="text-gray-500">贩卖机正在转换想法…</p>
        </div>
      )}
      {phase === 'result' && (
        <div className="space-y-4">
          <div className="bg-red-50 rounded-xl p-4 shadow text-center">
            <p className="text-sm text-red-400">旧想法</p>
            <p className="text-gray-500 line-through">"{NEGATIVE_COINS[selected].thought}"</p>
          </div>
          <div className="text-center text-2xl">⬇️</div>
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-6 shadow text-center">
            <p className="text-sm text-green-600">新想法 ✨</p>
            <p className="text-lg font-bold text-green-800">"{reframe}"</p>
          </div>
          <button onClick={() => {
            onUse({ negative: NEGATIVE_COINS[selected].thought, positive: reframe, date: todayStr() });
            setPhase('insert'); setSelected(null); setReframe('');
          }} className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl font-bold">
            记住新想法 💚
          </button>
          <button onClick={() => {
            const r = NEGATIVE_COINS[selected].reframes;
            setReframe(r[Math.floor(Math.random() * r.length)]);
          }} className="w-full py-2 text-green-600 text-sm">换一个想法</button>
        </div>
      )}
      {logs.length > 0 && phase === 'insert' && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">转换记录 ({logs.length})</p>
          {logs.slice(-5).reverse().map((l, i) => (
            <div key={i} className="text-sm py-2 border-b last:border-0">
              <p className="text-red-400 line-through">{l.negative}</p>
              <p className="text-green-600">→ {l.positive}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Feelings Mask Gallery ──────────────────────────────────────────────────
function FeelingsMaskPage({ masks, onSave, onBack }) {
  const [outside, setOutside] = useState([]);
  const [inside, setInside] = useState([]);
  const [phase, setPhase] = useState('outside');
  const toggleEmotion = (list, setList, label) => {
    setList(prev => prev.includes(label) ? prev.filter(x => x !== label) : prev.length < 3 ? [...prev, label] : prev);
  };
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎭" title="面具画廊" subtitle="外表和内心，可能不一样" />
      {phase === 'outside' && (
        <div className="bg-white rounded-xl p-4 shadow space-y-3">
          <p className="font-bold text-blue-600">🎭 外面的面具</p>
          <p className="text-sm text-gray-600">选择你展示给别人看的表情（最多3个）</p>
          <div className="flex flex-wrap gap-2">
            {MASK_EMOTIONS.map(e => (
              <button key={e.label} onClick={() => toggleEmotion(outside, setOutside, e.label)}
                className={`px-3 py-2 rounded-lg text-sm transition ${outside.includes(e.label) ? 'bg-blue-200 font-bold ring-2 ring-blue-400' : 'bg-blue-50'}`}>
                {e.emoji} {e.label}
              </button>
            ))}
          </div>
          {outside.length > 0 && (
            <button onClick={() => setPhase('inside')}
              className="w-full py-2 bg-blue-400 text-white rounded-xl font-bold">下一步：内心 →</button>
          )}
        </div>
      )}
      {phase === 'inside' && (
        <div className="bg-white rounded-xl p-4 shadow space-y-3">
          <p className="font-bold text-purple-600">💜 内心的感受</p>
          <p className="text-sm text-gray-600">选择你真正的感受（最多3个）</p>
          <div className="flex flex-wrap gap-2">
            {MASK_EMOTIONS.map(e => (
              <button key={e.label} onClick={() => toggleEmotion(inside, setInside, e.label)}
                className={`px-3 py-2 rounded-lg text-sm transition ${inside.includes(e.label) ? 'bg-purple-200 font-bold ring-2 ring-purple-400' : 'bg-purple-50'}`}>
                {e.emoji} {e.label}
              </button>
            ))}
          </div>
          {inside.length > 0 && (
            <button onClick={() => setPhase('compare')}
              className="w-full py-2 bg-purple-400 text-white rounded-xl font-bold">看看对比 →</button>
          )}
        </div>
      )}
      {phase === 'compare' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl">🎭</p>
              <p className="font-bold text-blue-700 text-sm">外面</p>
              <p className="text-sm">{outside.join('、')}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-3xl">💜</p>
              <p className="font-bold text-purple-700 text-sm">内心</p>
              <p className="text-sm">{inside.join('、')}</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow">
            <p className="text-sm text-gray-700">
              {outside.some(o => inside.includes(o))
                ? '你的外在和内心有相同的部分，这说明你在某些时候可以真实地表达自己。'
                : '你的外在和内心不太一样。没关系，每个人都有这样的时候。试着找一个信任的人，分享你真正的感受。'}
            </p>
          </div>
          <button onClick={() => {
            onSave({ outside, inside, date: todayStr() });
            setPhase('outside'); setOutside([]); setInside([]);
          }} className="w-full py-3 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-xl font-bold">
            保存面具 🎭
          </button>
        </div>
      )}
      {masks.length > 0 && phase === 'outside' && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">面具记录 ({masks.length})</p>
          {masks.slice(-3).reverse().map((m, i) => (
            <div key={i} className="text-sm py-2 border-b last:border-0">
              <p>🎭 外: {m.outside.join('、')} → 💜 内: {m.inside.join('、')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Daily Anchor ───────────────────────────────────────────────────────────
function DailyAnchorPage({ anchors, onSave, onBack }) {
  const [picked, setPicked] = useState(null);
  const [custom, setCustom] = useState('');
  const todayAnchor = anchors.find(a => a.date === todayStr());
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="⚓" title="每日锚点" subtitle="选一件今天值得期待的小事" />
      {todayAnchor ? (
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-6 shadow text-center space-y-3">
          <p className="text-5xl">⚓</p>
          <p className="font-bold text-blue-700 text-lg">今天的锚点</p>
          <p className="text-xl">{todayAnchor.anchor}</p>
          <p className="text-sm text-gray-600">当你觉得难过的时候，想想这件事。</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-gray-600">选一个今天可以期待的事情</p>
          <div className="grid grid-cols-2 gap-2">
            {ANCHOR_SUGGESTIONS.map((a, i) => (
              <button key={i} onClick={() => setPicked(a.label)}
                className={`p-3 rounded-xl text-center transition ${picked === a.label ? 'bg-blue-200 ring-2 ring-blue-400' : 'bg-white shadow'}`}>
                <p className="text-2xl">{a.emoji}</p>
                <p className="text-sm font-bold text-gray-700">{a.label}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="或者自己写一个…" value={custom}
              onChange={e => { setCustom(e.target.value); setPicked(null); }}
              className="flex-1 border rounded-lg px-3 py-2 text-sm" />
          </div>
          {(picked || custom.trim()) && (
            <button onClick={() => { onSave({ anchor: picked || custom.trim(), date: todayStr() }); setPicked(null); setCustom(''); }}
              className="w-full py-3 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-xl font-bold">
              设为今日锚点 ⚓
            </button>
          )}
        </div>
      )}
      {anchors.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">锚点记录 ({anchors.length}天)</p>
          {anchors.slice(-5).reverse().map((a, i) => (
            <p key={i} className="text-sm py-1 border-b last:border-0 text-gray-600">
              ⚓ {a.anchor} <span className="text-gray-400 text-xs">{a.date?.slice(0, 10)}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Compliment Boomerang ───────────────────────────────────────────────────
function ComplimentBoomerangPage({ logs, onSave, onBack }) {
  const [to, setTo] = useState('');
  const [compliment, setCompliment] = useState('');
  const [feeling, setFeeling] = useState(null);
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🪃" title="赞美回旋" subtitle="给别人赞美，感受回到自己的温暖" />
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <input type="text" placeholder="你赞美了谁？" value={to}
          onChange={e => setTo(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
        <p className="text-sm text-gray-500">你说了什么？（可以参考下面的）</p>
        <div className="flex flex-wrap gap-2">
          {COMPLIMENT_STARTERS.map(c => (
            <button key={c} onClick={() => setCompliment(c)}
              className={`px-3 py-1 rounded-full text-sm ${compliment === c ? 'bg-pink-200 ring-2 ring-pink-400' : 'bg-pink-50'}`}>
              {c}
            </button>
          ))}
        </div>
        <input type="text" placeholder="或者写你自己的赞美…" value={compliment}
          onChange={e => setCompliment(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      {to.trim() && compliment.trim() && (
        <div className="bg-white rounded-xl p-4 shadow space-y-3">
          <p className="font-bold text-pink-600">赞美别人后，你感觉怎么样？</p>
          <div className="flex flex-wrap gap-2">
            {BOOMERANG_FEELINGS.map(f => (
              <button key={f.label} onClick={() => setFeeling(f)}
                className={`px-3 py-2 rounded-lg text-sm transition ${feeling?.label === f.label ? 'bg-pink-200 ring-2 ring-pink-400 font-bold' : 'bg-pink-50'}`}>
                {f.emoji} {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {feeling && (
        <button onClick={() => {
          onSave({ to: to.trim(), compliment: compliment.trim(), feeling: feeling.label, date: todayStr() });
          setTo(''); setCompliment(''); setFeeling(null);
        }} className="w-full py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl font-bold">
          记录赞美回旋 🪃
        </button>
      )}
      {logs.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-pink-700 mb-2">赞美记录 ({logs.length})</p>
          {logs.slice(-5).reverse().map((l, i) => (
            <div key={i} className="text-sm py-2 border-b last:border-0">
              <p className="text-gray-600">对{l.to}说: "{l.compliment}"</p>
              <p className="text-pink-500">感觉: {l.feeling}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Emotion Volume Control ─────────────────────────────────────────────────
function EmotionVolumePage({ logs, onSave, onBack }) {
  const [emotion, setEmotion] = useState(null);
  const [volume, setVolume] = useState(8);
  const [strategy, setStrategy] = useState(null);
  const [newVolume, setNewVolume] = useState(null);
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🔊" title="情绪音量" subtitle="学会调节情绪的大小声" />
      {!emotion ? (
        <div className="space-y-3">
          <p className="text-center text-gray-600">你现在有什么情绪声音很大？</p>
          <div className="grid grid-cols-2 gap-3">
            {VOLUME_EMOTIONS.map((ve, i) => (
              <button key={i} onClick={() => setEmotion(ve)}
                className="bg-white rounded-xl p-4 shadow text-center hover:scale-105 transition">
                <p className="text-3xl">{ve.emoji}</p>
                <p className="font-bold text-gray-800">{ve.label}</p>
              </button>
            ))}
          </div>
        </div>
      ) : newVolume === null ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <p className="text-3xl">{emotion.emoji}</p>
            <p className="font-bold text-gray-800">{emotion.label}的音量</p>
            <input type="range" min="1" max="10" value={volume} onChange={e => setVolume(Number(e.target.value))}
              className="w-full mt-2" />
            <p className="text-2xl font-bold" style={{ color: volume > 7 ? '#ef4444' : volume > 4 ? '#f59e0b' : '#22c55e' }}>
              {'🔊'.repeat(Math.ceil(volume / 3))} {volume}/10
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="font-bold text-blue-600 mb-2">试试这些方法把音量调低：</p>
            {emotion.strategies.map((s, i) => (
              <button key={i} onClick={() => setStrategy(s)}
                className={`w-full text-left p-3 rounded-lg mb-1 text-sm transition ${strategy === s ? 'bg-blue-200 ring-2 ring-blue-400 font-bold' : 'bg-blue-50'}`}>
                {i + 1}. {s}
              </button>
            ))}
          </div>
          {strategy && (
            <div className="bg-white rounded-xl p-4 shadow text-center">
              <p className="text-sm text-gray-600 mb-2">试了"{strategy}"之后，音量变成了多少？</p>
              <input type="range" min="1" max="10" value={Math.max(1, volume - 3)}
                onChange={e => {}} className="w-full opacity-50" />
              <div className="flex justify-center gap-2 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button key={n} onClick={() => setNewVolume(n)}
                    className={`w-8 h-8 rounded-full text-sm font-bold ${n <= 3 ? 'bg-green-200' : n <= 6 ? 'bg-yellow-200' : 'bg-red-200'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-6 shadow text-center space-y-3">
          <p className="text-5xl">{newVolume < volume ? '🎉' : '💪'}</p>
          <p className="font-bold text-green-700 text-lg">
            {newVolume < volume ? `太棒了！从${volume}降到了${newVolume}！` : '没关系，有时候需要多试几次。'}
          </p>
          <p className="text-sm text-gray-600">方法：{strategy}</p>
          <button onClick={() => {
            onSave({ emotion: emotion.label, before: volume, after: newVolume, strategy, date: todayStr() });
            setEmotion(null); setVolume(8); setStrategy(null); setNewVolume(null);
          }} className="px-6 py-2 bg-green-400 text-white rounded-xl font-bold">完成 ✨</button>
        </div>
      )}
      {logs.length > 0 && !emotion && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">调节记录 ({logs.length})</p>
          {logs.slice(-5).reverse().map((l, i) => (
            <div key={i} className="text-sm py-2 border-b last:border-0">
              <p className="text-gray-600">{l.emotion}: {l.before} → {l.after} ({l.strategy})</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Safe Words & Signals ───────────────────────────────────────────────────
function SafeSignalsPage({ signals, onSave, onBack }) {
  const [entries, setEntries] = useState(signals.length > 0 ? signals[signals.length - 1].entries : {});
  const [editing, setEditing] = useState(null);
  const [word, setWord] = useState('');
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🤫" title="安全暗号" subtitle="和家人约定秘密信号" />
      <p className="text-sm text-gray-600 text-center">和爸爸妈妈一起，为每种情况约定一个暗号</p>
      <div className="space-y-3">
        {SIGNAL_TYPES.map(st => (
          <div key={st.id} className={`bg-gradient-to-r ${st.color} rounded-xl p-4 shadow`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{st.emoji}</span>
              <div>
                <p className="font-bold text-gray-800">{st.label}</p>
                <p className="text-xs text-gray-600">{st.desc}</p>
              </div>
            </div>
            {entries[st.id] ? (
              <div className="flex items-center gap-2">
                <p className="bg-white rounded-lg px-3 py-1 text-sm font-bold flex-1">暗号：{entries[st.id]}</p>
                <button onClick={() => { setEditing(st.id); setWord(entries[st.id]); }}
                  className="text-xs text-gray-500 underline">修改</button>
              </div>
            ) : editing === st.id ? (
              <div className="flex gap-2">
                <input type="text" placeholder="输入暗号…" value={word}
                  onChange={e => setWord(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                {word.trim() && (
                  <button onClick={() => { setEntries(prev => ({ ...prev, [st.id]: word.trim() })); setEditing(null); setWord(''); }}
                    className="px-3 py-1 bg-white rounded-lg text-sm font-bold">确定</button>
                )}
              </div>
            ) : (
              <div>
                <button onClick={() => setEditing(st.id)}
                  className="text-sm text-gray-600 underline">设置暗号</button>
                <div className="flex flex-wrap gap-1 mt-1">
                  {SIGNAL_IDEAS.slice(0, 5).map(idea => (
                    <button key={idea} onClick={() => { setEntries(prev => ({ ...prev, [st.id]: idea })); }}
                      className="px-2 py-1 bg-white bg-opacity-60 rounded text-xs">{idea}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {Object.keys(entries).length > 0 && (
        <button onClick={() => onSave({ entries: { ...entries }, date: todayStr() })}
          className="w-full py-3 bg-gradient-to-r from-indigo-400 to-purple-400 text-white rounded-xl font-bold">
          保存我的暗号 🤫
        </button>
      )}
    </div>
  );
}

// ─── Emotion ABC Diary ──────────────────────────────────────────────────────
function EmotionABCPage({ entries, onSave, onBack }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [better, setBetter] = useState('');
  const [showEx, setShowEx] = useState(false);
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="📝" title="情绪ABC日记" subtitle="发生了什么→我怎么想→我怎么感觉" />
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <div className="bg-red-50 rounded-lg p-3">
          <p className="font-bold text-red-600 text-sm">A — 发生了什么？</p>
          <input type="text" placeholder="例如：考试成绩不好" value={a}
            onChange={e => setA(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="font-bold text-yellow-600 text-sm">B — 我怎么想的？</p>
          <input type="text" placeholder="例如：我好笨" value={b}
            onChange={e => setB(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="font-bold text-blue-600 text-sm">C — 我的感受是？</p>
          <input type="text" placeholder="例如：难过、自卑" value={c}
            onChange={e => setC(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="font-bold text-green-600 text-sm">💡 换一个想法呢？</p>
          <input type="text" placeholder="试试更平衡的想法…" value={better}
            onChange={e => setBetter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
        </div>
      </div>
      <button onClick={() => setShowEx(!showEx)} className="text-sm text-gray-500 underline">
        {showEx ? '隐藏例子' : '看看例子 📖'}
      </button>
      {showEx && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          {ABC_EXAMPLES.map((ex, i) => (
            <div key={i} className="text-sm border-b last:border-0 pb-2">
              <p className="text-red-500">A: {ex.a}</p>
              <p className="text-yellow-600">B: {ex.b}</p>
              <p className="text-blue-500">C: {ex.c}</p>
              <p className="text-green-600">💡 {ex.better}</p>
            </div>
          ))}
        </div>
      )}
      {a.trim() && b.trim() && c.trim() && (
        <button onClick={() => {
          onSave({ a: a.trim(), b: b.trim(), c: c.trim(), better: better.trim(), date: todayStr() });
          setA(''); setB(''); setC(''); setBetter('');
        }} className="w-full py-3 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-xl font-bold">
          保存ABC日记 📝
        </button>
      )}
      {entries.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">日记记录 ({entries.length})</p>
          {entries.slice(-3).reverse().map((e, i) => (
            <div key={i} className="text-sm py-2 border-b last:border-0">
              <p className="text-red-500">A: {e.a}</p>
              <p className="text-yellow-600">B: {e.b} → 💡 {e.better || '—'}</p>
              <p className="text-blue-500">C: {e.c}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Worry Balloon Release ──────────────────────────────────────────────────
function WorryBalloonPage({ releases, onRelease, onBack }) {
  const [worry, setWorry] = useState('');
  const [phase, setPhase] = useState('write');
  const [colorIdx] = useState(() => Math.floor(Math.random() * BALLOON_COLORS.length));
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎈" title="烦恼气球" subtitle="把烦恼写在气球上，放它飞走" />
      {phase === 'write' && (
        <div className="bg-white rounded-xl p-4 shadow space-y-3">
          <p className="text-center text-gray-600">把你的烦恼写在气球上</p>
          <textarea placeholder="我的烦恼是…" value={worry}
            onChange={e => setWorry(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
          {worry.trim() && (
            <button onClick={() => setPhase('holding')}
              className="w-full py-3 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-xl font-bold">
              写在气球上 🎈
            </button>
          )}
        </div>
      )}
      {phase === 'holding' && (
        <div className="text-center space-y-4">
          <div className={`${BALLOON_COLORS[colorIdx]} w-40 h-48 rounded-full mx-auto flex items-center justify-center shadow-lg`}>
            <p className="text-sm text-white font-bold px-4 text-center">{worry}</p>
          </div>
          <p className="text-gray-600">深呼吸，准备好放手了吗？</p>
          <button onClick={() => { setPhase('releasing'); setTimeout(() => setPhase('gone'), 3000); }}
            className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl font-bold text-lg">
            放手，让它飞走 🕊️
          </button>
        </div>
      )}
      {phase === 'releasing' && (
        <div className="text-center space-y-4 animate-pulse">
          <p className="text-6xl">🎈</p>
          <p className="text-2xl text-gray-400">飞走了…</p>
          <p className="text-sm text-gray-500">看着气球越飞越远，烦恼越来越小…</p>
        </div>
      )}
      {phase === 'gone' && (
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-6 shadow text-center space-y-3">
          <p className="text-5xl">☁️</p>
          <p className="font-bold text-purple-700 text-lg">气球飞走了</p>
          <p className="text-gray-600">你的烦恼不会消失，但你学会了不紧紧抓着它。</p>
          <button onClick={() => {
            onRelease({ worry: worry.trim(), date: todayStr() });
            setPhase('write'); setWorry('');
          }} className="px-6 py-2 bg-purple-400 text-white rounded-xl font-bold">完成 ✨</button>
        </div>
      )}
      {releases.length > 0 && phase === 'write' && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">放飞了 {releases.length} 个气球 🎈</p>
          {releases.slice(-3).reverse().map((r, i) => (
            <p key={i} className="text-sm py-1 border-b last:border-0 text-gray-500">
              🎈 {r.worry} <span className="text-xs text-gray-400">{r.date?.slice(0, 10)}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Feelings Bingo ─────────────────────────────────────────────────────────
function FeelingsBingoPage({ games, onSave, onBack }) {
  const todayGame = games.find(g => g.date === todayStr());
  const [checked, setChecked] = useState(todayGame?.checked || []);
  const toggle = (idx) => setChecked(prev => prev.includes(idx) ? prev.filter(x => x !== idx) : [...prev, idx]);
  const hasLine = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    .some(line => line.every(i => checked.includes(i)));
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎯" title="情绪宾果" subtitle="完成一行就是赢！" />
      <div className="grid grid-cols-3 gap-2">
        {BINGO_SQUARES.map((sq, i) => (
          <button key={i} onClick={() => toggle(i)}
            className={`p-4 rounded-xl text-center transition border-2 ${checked.includes(i) ? 'bg-green-200 border-green-400' : 'bg-white border-gray-200'}`}>
            <p className="text-2xl">{sq.emoji}</p>
            <p className="text-xs font-bold text-gray-700">{sq.label}</p>
            {checked.includes(i) && <p className="text-green-600 text-lg">✓</p>}
          </button>
        ))}
      </div>
      {hasLine && !todayGame && (
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl p-4 shadow text-center">
          <p className="text-3xl">🎉</p>
          <p className="font-bold text-amber-700">宾果！你完成了一行！</p>
          <button onClick={() => onSave({ checked, date: todayStr() })}
            className="mt-2 px-6 py-2 bg-amber-400 text-white rounded-xl font-bold">保存今天的宾果</button>
        </div>
      )}
      {todayGame && (
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="font-bold text-green-700">今天的宾果已完成！({todayGame.checked.length}/9)</p>
        </div>
      )}
      <p className="text-center text-sm text-gray-500">完成宾果 {games.length} 次</p>
    </div>
  );
}

// ─── Mirror Affirmation Challenge ───────────────────────────────────────────
function MirrorChallengePage({ logs, onComplete, onBack }) {
  const completedDays = logs.map(l => l.day);
  const nextDay = MIRROR_DAYS.find(d => !completedDays.includes(d.day)) || null;
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🪞" title="镜子挑战" subtitle="7天，每天对自己说一句好话" />
      <div className="space-y-3">
        {MIRROR_DAYS.map(md => {
          const done = completedDays.includes(md.day);
          const isNext = nextDay?.day === md.day;
          return (
            <div key={md.day} className={`rounded-xl p-4 shadow ${done ? 'bg-green-50 border border-green-300' : isNext ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-gray-50 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${done ? 'bg-green-400 text-white' : isNext ? 'bg-yellow-400 text-white' : 'bg-gray-300 text-gray-500'}`}>
                  {done ? '✓' : md.day}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${done ? 'text-green-700' : 'text-gray-700'}`}>{md.prompt}</p>
                  <p className="text-xs text-gray-500">难度：{md.level}</p>
                </div>
                {isNext && !done && (
                  <button onClick={() => onComplete({ day: md.day, date: todayStr() })}
                    className="px-3 py-1 bg-yellow-400 text-white rounded-lg text-sm font-bold">完成</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {completedDays.length === 7 && (
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl p-4 text-center">
          <p className="text-3xl">🏆</p>
          <p className="font-bold text-amber-700">7天镜子挑战完成！你太棒了！</p>
        </div>
      )}
    </div>
  );
}

// ─── Emotion Orchestra ──────────────────────────────────────────────────────
function EmotionOrchestraPage({ performances, onSave, onBack }) {
  const [volumes, setVolumes] = useState(Object.fromEntries(ORCHESTRA_INSTRUMENTS.map(i => [i.emotion, 3])));
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🎼" title="情绪交响乐" subtitle="调节每种情绪的音量" />
      <p className="text-center text-sm text-gray-600">每种乐器代表一种情绪，调整它们的大小声</p>
      <div className="space-y-3">
        {ORCHESTRA_INSTRUMENTS.map(inst => (
          <div key={inst.emotion} className={`${inst.color} rounded-xl p-4 shadow`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{inst.emoji}</span>
              <span className="font-bold text-gray-800 text-sm">{inst.label}</span>
              <span className="ml-auto font-bold text-gray-600">{volumes[inst.emotion]}/10</span>
            </div>
            <input type="range" min="0" max="10" value={volumes[inst.emotion]}
              onChange={e => setVolumes(prev => ({ ...prev, [inst.emotion]: Number(e.target.value) }))}
              className="w-full" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 shadow text-center">
        <p className="text-sm text-gray-600 mb-2">你的交响乐</p>
        <div className="flex justify-center gap-1">
          {ORCHESTRA_INSTRUMENTS.map(inst => (
            <div key={inst.emotion} className="text-center">
              <div style={{ height: `${volumes[inst.emotion] * 8 + 10}px` }}
                className={`w-8 ${inst.color} rounded-t-lg transition-all`} />
              <p className="text-xs">{inst.emoji}</p>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => onSave({ volumes: { ...volumes }, date: todayStr() })}
        className="w-full py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl font-bold">
        保存演奏 🎼
      </button>
      {performances.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700">演奏记录 ({performances.length}次)</p>
        </div>
      )}
    </div>
  );
}

// ─── Problem Shrink Ray ─────────────────────────────────────────────────────
function ProblemShrinkRayPage({ logs, onSave, onBack }) {
  const [problem, setProblem] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState('');
  const started = problem.trim() && step > 0;
  const sizes = ['text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm'];
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🔫" title="问题缩小器" subtitle="把大问题变小！" />
      {step === 0 && (
        <div className="bg-white rounded-xl p-4 shadow space-y-3">
          <p className="text-center text-gray-600">你有什么大问题让你烦恼？</p>
          <textarea placeholder="我的问题是…" value={problem}
            onChange={e => setProblem(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
          {problem.trim() && (
            <button onClick={() => setStep(1)}
              className="w-full py-3 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-xl font-bold">
              开始缩小！🔫
            </button>
          )}
        </div>
      )}
      {started && step <= SHRINK_QUESTIONS.length && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 shadow text-center">
            <p className={`font-bold text-red-600 ${sizes[Math.min(step, sizes.length - 1)]} transition-all`}>
              {problem}
            </p>
            <p className="text-xs text-gray-500 mt-1">问题在缩小中… ({step}/{SHRINK_QUESTIONS.length})</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow space-y-3">
            <p className="text-2xl text-center">{SHRINK_QUESTIONS[step - 1].emoji}</p>
            <p className="font-bold text-gray-800 text-center">{SHRINK_QUESTIONS[step - 1].q}</p>
            <input type="text" placeholder="你的回答…" value={current}
              onChange={e => setCurrent(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            {current.trim() && (
              <button onClick={() => {
                setAnswers(prev => ({ ...prev, [step]: current.trim() }));
                setCurrent('');
                setStep(s => s + 1);
              }} className="w-full py-2 bg-orange-400 text-white rounded-xl font-bold">
                {step < SHRINK_QUESTIONS.length ? '继续缩小 →' : '完成缩小！'}
              </button>
            )}
          </div>
        </div>
      )}
      {step > SHRINK_QUESTIONS.length && (
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-6 shadow text-center space-y-3">
          <p className="text-5xl">🎉</p>
          <p className="font-bold text-green-700 text-lg">问题缩小了！</p>
          <p className="text-sm text-gray-600 line-through">{problem}</p>
          <p className="text-sm text-green-600 font-bold">第一步：{answers[2] || answers[1]}</p>
          <button onClick={() => {
            onSave({ problem: problem.trim(), answers, date: todayStr() });
            setProblem(''); setStep(0); setAnswers({});
          }} className="px-6 py-2 bg-green-400 text-white rounded-xl font-bold">保存 ✨</button>
        </div>
      )}
      {logs.length > 0 && step === 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700 mb-2">缩小了 {logs.length} 个问题</p>
          {logs.slice(-3).reverse().map((l, i) => (
            <p key={i} className="text-sm py-1 border-b last:border-0 text-gray-600">
              🔫 {l.problem} <span className="text-xs text-gray-400">{l.date?.slice(0, 10)}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Gratitude Glasses ──────────────────────────────────────────────────────
function GratitudeGlassesPage({ logs, onSave, onBack }) {
  const [wearing, setWearing] = useState(false);
  const [seen, setSeen] = useState([]);
  const [custom, setCustom] = useState('');
  const [customReframe, setCustomReframe] = useState('');
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="👓" title="感恩眼镜" subtitle="戴上眼镜，换个角度看世界" />
      {!wearing ? (
        <div className="text-center space-y-4">
          <p className="text-6xl">👓</p>
          <p className="text-gray-600">戴上感恩眼镜，普通的东西也会变得特别</p>
          <button onClick={() => setWearing(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl font-bold text-lg">
            戴上眼镜 👓
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-sm text-green-600">👓 感恩眼镜已戴上！点击看看这些东西的另一面</p>
          </div>
          {ORDINARY_THINGS.map((ot, i) => (
            <button key={i} onClick={() => setSeen(prev => prev.includes(i) ? prev : [...prev, i])}
              className={`w-full rounded-xl p-4 shadow text-left transition ${seen.includes(i) ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ot.emoji}</span>
                <div>
                  <p className="font-bold text-gray-800">{ot.thing}</p>
                  {seen.includes(i) && <p className="text-sm text-green-600 mt-1">✨ {ot.reframe}</p>}
                </div>
              </div>
            </button>
          ))}
          <div className="bg-white rounded-xl p-4 shadow space-y-2">
            <p className="font-bold text-green-600 text-sm">自己找一个：</p>
            <input type="text" placeholder="一个普通的东西" value={custom}
              onChange={e => setCustom(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            <input type="text" placeholder="用感恩眼镜看它…" value={customReframe}
              onChange={e => setCustomReframe(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          {seen.length >= 3 && (
            <button onClick={() => {
              onSave({ seen: seen.length, custom: custom.trim(), reframe: customReframe.trim(), date: todayStr() });
              setWearing(false); setSeen([]); setCustom(''); setCustomReframe('');
            }} className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl font-bold">
              摘下眼镜，保存发现 ✨
            </button>
          )}
        </div>
      )}
      {logs.length > 0 && !wearing && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-gray-700">戴了 {logs.length} 次感恩眼镜</p>
        </div>
      )}
    </div>
  );
}

// ─── Emotion Time Capsule ───────────────────────────────────────────────────
function EmotionTimeCapsulePage({ capsules, onSeal, onOpen, onBack }) {
  const [answers, setAnswers] = useState({});
  const now = Date.now();
  const sealed = capsules.filter(c => !c.opened);
  const openable = sealed.filter(c => now - c.sealedAt >= 7 * 24 * 60 * 60 * 1000);
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="💊" title="情绪时光机" subtitle="封存现在的感受，7天后打开" />
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <p className="font-bold text-indigo-600">封存一颗情绪胶囊</p>
        {CAPSULE_PROMPTS.map((p, i) => (
          <div key={i}>
            <p className="text-sm text-gray-600">{p}</p>
            <input type="text" value={answers[i] || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
        ))}
        {CAPSULE_PROMPTS.every((_, i) => answers[i]?.trim()) && (
          <button onClick={() => {
            onSeal({ answers: { ...answers }, sealedAt: now, date: todayStr() });
            setAnswers({});
          }} className="w-full py-3 bg-gradient-to-r from-indigo-400 to-purple-400 text-white rounded-xl font-bold">
            封存胶囊 💊
          </button>
        )}
      </div>
      {openable.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl p-4 shadow">
          <p className="font-bold text-amber-700">🎉 有 {openable.length} 颗胶囊可以打开了！</p>
          {openable.map((c, i) => (
            <button key={i} onClick={() => onOpen(c)}
              className="w-full mt-2 py-2 bg-amber-400 text-white rounded-lg font-bold text-sm">
              打开 {c.date} 的胶囊
            </button>
          ))}
        </div>
      )}
      {sealed.filter(c => now - c.sealedAt < 7 * 24 * 60 * 60 * 1000).length > 0 && (
        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="font-bold text-indigo-700">等待中的胶囊</p>
          {sealed.filter(c => now - c.sealedAt < 7 * 24 * 60 * 60 * 1000).map((c, i) => {
            const daysLeft = Math.ceil((7 * 24 * 60 * 60 * 1000 - (now - c.sealedAt)) / (24 * 60 * 60 * 1000));
            return <p key={i} className="text-sm text-indigo-600">💊 {c.date} — 还有{daysLeft}天</p>;
          })}
        </div>
      )}
    </div>
  );
}

// ─── Kindness Ripple ────────────────────────────────────────────────────────
function KindnessRipplePage({ ripples, onSave, onBack }) {
  const [act, setAct] = useState(null);
  const [who, setWho] = useState('');
  const [reaction, setReaction] = useState('');
  const [rippled, setRippled] = useState('');
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="🌊" title="善良涟漪" subtitle="一个善意，可以传得很远" />
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <p className="font-bold text-blue-600">你做了什么善意的事？</p>
        <div className="flex flex-wrap gap-2">
          {RIPPLE_ACTS.map(ra => (
            <button key={ra.label} onClick={() => setAct(ra)}
              className={`px-3 py-2 rounded-lg text-sm transition ${act?.label === ra.label ? 'bg-blue-200 ring-2 ring-blue-400 font-bold' : 'bg-blue-50'}`}>
              {ra.emoji} {ra.label}
            </button>
          ))}
        </div>
        {act && (
          <>
            <input type="text" placeholder="对谁做的？" value={who}
              onChange={e => setWho(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            <input type="text" placeholder="对方什么反应？" value={reaction}
              onChange={e => setReaction(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            <input type="text" placeholder="你觉得这个善意会传下去吗？怎么传？" value={rippled}
              onChange={e => setRippled(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </>
        )}
        {act && who.trim() && (
          <button onClick={() => {
            onSave({ act: act.label, who: who.trim(), reaction: reaction.trim(), rippled: rippled.trim(), date: todayStr() });
            setAct(null); setWho(''); setReaction(''); setRippled('');
          }} className="w-full py-3 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-xl font-bold">
            记录涟漪 🌊
          </button>
        )}
      </div>
      {ripples.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="font-bold text-blue-700 mb-2">涟漪记录 ({ripples.length}个) 🌊</p>
          {ripples.slice(-3).reverse().map((r, i) => (
            <div key={i} className="text-sm py-2 border-b last:border-0">
              <p className="text-gray-600">{r.act} → {r.who}</p>
              {r.reaction && <p className="text-blue-500">反应: {r.reaction}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Support Solar System ───────────────────────────────────────────────────
function SupportSolarSystemPage({ systems, onSave, onBack }) {
  const [planets, setPlanets] = useState(systems.length > 0 ? systems[systems.length - 1].planets : []);
  const [name, setName] = useState('');
  const [orbit, setOrbit] = useState(0);
  return (
    <div className="p-6 space-y-5">
      <BackButton onClick={onBack} />
      <PageHeader emoji="☀️" title="支持太阳系" subtitle="你是太阳，身边的人是你的星球" />
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 shadow text-center relative" style={{ minHeight: '250px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {ORBIT_LABELS.map((_, i) => (
            <div key={i} className="absolute rounded-full border border-indigo-400 border-opacity-30"
              style={{ width: `${(i + 1) * 50 + 30}px`, height: `${(i + 1) * 50 + 30}px` }} />
          ))}
        </div>
        <div className="relative z-10">
          <p className="text-4xl">☀️</p>
          <p className="text-yellow-300 text-xs font-bold">你</p>
        </div>
        {planets.map((p, i) => {
          const angle = (i * 137.5) * Math.PI / 180;
          const dist = (p.orbit + 1) * 28 + 20;
          return (
            <div key={i} className="absolute z-10" style={{
              left: `calc(50% + ${Math.cos(angle) * dist}px - 14px)`,
              top: `calc(50% + ${Math.sin(angle) * dist}px - 14px)`
            }}>
              <div className={`w-7 h-7 rounded-full ${PLANET_COLORS[i % PLANET_COLORS.length]} flex items-center justify-center text-xs font-bold shadow`}>
                {p.name[0]}
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <p className="font-bold text-indigo-600">添加一颗星球</p>
        <input type="text" placeholder="这个人叫什么？" value={name}
          onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
        <div className="flex gap-2">
          {ORBIT_LABELS.map((label, i) => (
            <button key={i} onClick={() => setOrbit(i)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${orbit === i ? 'bg-indigo-200 ring-2 ring-indigo-400' : 'bg-indigo-50'}`}>
              {label}
            </button>
          ))}
        </div>
        {name.trim() && (
          <button onClick={() => { setPlanets(prev => [...prev.slice(-7), { name: name.trim(), orbit }]); setName(''); }}
            className="w-full py-2 bg-indigo-400 text-white rounded-xl font-bold">添加星球 🪐</button>
        )}
      </div>
      {planets.length > 0 && (
        <>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="font-bold text-gray-700 mb-2">我的星球 ({planets.length})</p>
            {planets.map((p, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <div className={`w-5 h-5 rounded-full ${PLANET_COLORS[i % PLANET_COLORS.length]}`} />
                <span className="text-sm text-gray-700">{p.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{ORBIT_LABELS[p.orbit]}</span>
              </div>
            ))}
          </div>
          <button onClick={() => onSave({ planets, date: todayStr() })}
            className="w-full py-3 bg-gradient-to-r from-indigo-400 to-purple-400 text-white rounded-xl font-bold">
            保存太阳系 ☀️
          </button>
        </>
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
  const [programWeek, setProgramWeek] = useState(1);
  const [programProgress, setProgramProgress] = useState({});
  const [screeningHistory, setScreeningHistory] = useState([]);
  const [sleepCoachLog, setSleepCoachLog] = useState([]);
  const [storyProgress, setStoryProgress] = useState(0);
  const [microMomentLog, setMicroMomentLog] = useState({});
  const [familyBoard, setFamilyBoard] = useState([]);
  const [earnedMilestones, setEarnedMilestones] = useState([]);
  const [simplifiedMode, setSimplifiedMode] = useState(false);
  const [dailyChallengesDone, setDailyChallengesDone] = useState({});
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [counselorNotes, setCounselorNotes] = useState([]);
  const [socialRolePlayHistory, setSocialRolePlayHistory] = useState([]);
  const [growthMindsetDone, setGrowthMindsetDone] = useState([]);
  const [memoryVault, setMemoryVault] = useState([]);
  const [sensoryKit, setSensoryKit] = useState({});
  const [charadesScore, setCharadesScore] = useState(0);
  const [futureLetters, setFutureLetters] = useState([]);
  const [movementLog, setMovementLog] = useState([]);
  const [parkedWorries, setParkedWorries] = useState([]);
  const [processedWorries, setProcessedWorries] = useState([]);
  const [courageLog, setCourageLog] = useState([]);
  const [muscleRelaxCount, setMuscleRelaxCount] = useState(0);
  const [selfTalkEntries, setSelfTalkEntries] = useState([]);
  const [supportNetwork, setSupportNetwork] = useState([]);
  const [responsibilityPies, setResponsibilityPies] = useState([]);
  const [calmRatings, setCalmRatings] = useState({});
  const [boundaryPracticed, setBoundaryPracticed] = useState([]);
  const [emotionForecasts, setEmotionForecasts] = useState([]);
  const [habitStacks, setHabitStacks] = useState([]);
  const [conflictResolved, setConflictResolved] = useState([]);
  const [scavengerDone, setScavengerDone] = useState([]);
  const [archaeologyDigs, setArchaeologyDigs] = useState([]);
  const [bodyCopingDone, setBodyCopingDone] = useState([]);
  const [permissionSlips, setPermissionSlips] = useState([]);
  const [aweLogs, setAweLogs] = useState([]);
  const [observerSessions, setObserverSessions] = useState([]);
  const [cprUses, setCprUses] = useState([]);
  const [strengthsShield, setStrengthsShield] = useState({});
  const [microKindnessLog, setMicroKindnessLog] = useState([]);
  const [feelingsForecasts, setFeelingsForecasts] = useState([]);
  const [hopeJar, setHopeJar] = useState([]);
  const [breathingGamesPlayed, setBreathingGamesPlayed] = useState([]);
  const [decisionLog, setDecisionLog] = useState([]);
  const [empathyPracticed, setEmpathyPracticed] = useState([]);
  const [moodCollages, setMoodCollages] = useState([]);
  const [vocabLearned, setVocabLearned] = useState([]);
  const [gratitudeChain, setGratitudeChain] = useState([]);
  const [safePersonCards, setSafePersonCards] = useState([]);
  const [morningCompass, setMorningCompass] = useState([]);
  const [copingReports, setCopingReports] = useState([]);
  const [emotionMaps, setEmotionMaps] = useState([]);
  const [comfortMenus, setComfortMenus] = useState([]);
  const [praiseJar, setPraiseJar] = useState([]);
  const [feelingsTranslations, setFeelingsTranslations] = useState([]);
  const [listeningLogs, setListeningLogs] = useState([]);
  const [courageCoins, setCourageCoins] = useState([]);
  const [friendshipRecipes, setFriendshipRecipes] = useState([]);
  const [thoughtBubbles, setThoughtBubbles] = useState([]);
  const [calmBuddySessions, setCalmBuddySessions] = useState([]);
  const [accomplishments, setAccomplishments] = useState([]);
  const [dailyWins, setDailyWins] = useState([]);
  const [sensoryCountdowns, setSensoryCountdowns] = useState([]);
  const [emotionJarLogs, setEmotionJarLogs] = useState([]);
  const [tradingCards, setTradingCards] = useState([]);
  const [moodDJMixes, setMoodDJMixes] = useState([]);
  const [vendingMachineLogs, setVendingMachineLogs] = useState([]);
  const [feelingsMasks, setFeelingsMasks] = useState([]);
  const [dailyAnchors, setDailyAnchors] = useState([]);
  const [boomerangLogs, setBoomerangLogs] = useState([]);
  const [volumeControlLogs, setVolumeControlLogs] = useState([]);
  const [safeSignals, setSafeSignals] = useState([]);
  const [abcDiary, setAbcDiary] = useState([]);
  const [balloonReleases, setBalloonReleases] = useState([]);
  const [bingoGames, setBingoGames] = useState([]);
  const [mirrorDays, setMirrorDays] = useState([]);
  const [orchestraPerfs, setOrchestraPerfs] = useState([]);
  const [shrinkRayLogs, setShrinkRayLogs] = useState([]);
  const [gratitudeGlassesLogs, setGratitudeGlassesLogs] = useState([]);
  const [emotionTimeCapsules, setEmotionTimeCapsules] = useState([]);
  const [kindnessRipples, setKindnessRipples] = useState([]);
  const [solarSystems, setSolarSystems] = useState([]);

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
      setProgramWeek(saved.programWeek || 1);
      setProgramProgress(saved.programProgress || {});
      setScreeningHistory(saved.screeningHistory || []);
      setSleepCoachLog(saved.sleepCoachLog || []);
      setStoryProgress(saved.storyProgress || 0);
      setMicroMomentLog(saved.microMomentLog || {});
      setFamilyBoard(saved.familyBoard || []);
      setEarnedMilestones(saved.earnedMilestones || []);
      setSimplifiedMode(saved.simplifiedMode || false);
      setDailyChallengesDone(saved.dailyChallengesDone || {});
      setSelectedSeason(saved.selectedSeason || null);
      setVoiceEnabled(saved.voiceEnabled || false);
      setCounselorNotes(saved.counselorNotes || []);
      setSocialRolePlayHistory(saved.socialRolePlayHistory || []);
      setGrowthMindsetDone(saved.growthMindsetDone || []);
      setMemoryVault(saved.memoryVault || []);
      setSensoryKit(saved.sensoryKit || {});
      setCharadesScore(saved.charadesScore || 0);
      setFutureLetters(saved.futureLetters || []);
      setMovementLog(saved.movementLog || []);
      setParkedWorries(saved.parkedWorries || []);
      setProcessedWorries(saved.processedWorries || []);
      setCourageLog(saved.courageLog || []);
      setMuscleRelaxCount(saved.muscleRelaxCount || 0);
      setSelfTalkEntries(saved.selfTalkEntries || []);
      setSupportNetwork(saved.supportNetwork || []);
      setResponsibilityPies(saved.responsibilityPies || []);
      setCalmRatings(saved.calmRatings || {});
      setBoundaryPracticed(saved.boundaryPracticed || []);
      setEmotionForecasts(saved.emotionForecasts || []);
      setHabitStacks(saved.habitStacks || []);
      setConflictResolved(saved.conflictResolved || []);
      setScavengerDone(saved.scavengerDone || []);
      setArchaeologyDigs(saved.archaeologyDigs || []);
      setBodyCopingDone(saved.bodyCopingDone || []);
      setPermissionSlips(saved.permissionSlips || []);
      setAweLogs(saved.aweLogs || []);
      setObserverSessions(saved.observerSessions || []);
      setCprUses(saved.cprUses || []);
      setStrengthsShield(saved.strengthsShield || {});
      setMicroKindnessLog(saved.microKindnessLog || []);
      setFeelingsForecasts(saved.feelingsForecasts || []);
      setHopeJar(saved.hopeJar || []);
      setBreathingGamesPlayed(saved.breathingGamesPlayed || []);
      setDecisionLog(saved.decisionLog || []);
      setEmpathyPracticed(saved.empathyPracticed || []);
      setMoodCollages(saved.moodCollages || []);
      setVocabLearned(saved.vocabLearned || []);
      setGratitudeChain(saved.gratitudeChain || []);
      setSafePersonCards(saved.safePersonCards || []);
      setMorningCompass(saved.morningCompass || []);
      setCopingReports(saved.copingReports || []);
      setEmotionMaps(saved.emotionMaps || []);
      setComfortMenus(saved.comfortMenus || []);
      setPraiseJar(saved.praiseJar || []);
      setFeelingsTranslations(saved.feelingsTranslations || []);
      setListeningLogs(saved.listeningLogs || []);
      setCourageCoins(saved.courageCoins || []);
      setFriendshipRecipes(saved.friendshipRecipes || []);
      setThoughtBubbles(saved.thoughtBubbles || []);
      setCalmBuddySessions(saved.calmBuddySessions || []);
      setAccomplishments(saved.accomplishments || []);
      setDailyWins(saved.dailyWins || []);
      setSensoryCountdowns(saved.sensoryCountdowns || []);
      setEmotionJarLogs(saved.emotionJarLogs || []);
      setTradingCards(saved.tradingCards || []);
      setMoodDJMixes(saved.moodDJMixes || []);
      setVendingMachineLogs(saved.vendingMachineLogs || []);
      setFeelingsMasks(saved.feelingsMasks || []);
      setDailyAnchors(saved.dailyAnchors || []);
      setBoomerangLogs(saved.boomerangLogs || []);
      setVolumeControlLogs(saved.volumeControlLogs || []);
      setSafeSignals(saved.safeSignals || []);
      setAbcDiary(saved.abcDiary || []);
      setBalloonReleases(saved.balloonReleases || []);
      setBingoGames(saved.bingoGames || []);
      setMirrorDays(saved.mirrorDays || []);
      setOrchestraPerfs(saved.orchestraPerfs || []);
      setShrinkRayLogs(saved.shrinkRayLogs || []);
      setGratitudeGlassesLogs(saved.gratitudeGlassesLogs || []);
      setEmotionTimeCapsules(saved.emotionTimeCapsules || []);
      setKindnessRipples(saved.kindnessRipples || []);
      setSolarSystems(saved.solarSystems || []);
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
      programWeek, programProgress, screeningHistory,
      sleepCoachLog, storyProgress, microMomentLog, familyBoard, earnedMilestones,
      simplifiedMode, dailyChallengesDone, selectedSeason, voiceEnabled, counselorNotes,
      socialRolePlayHistory, growthMindsetDone, memoryVault, sensoryKit, charadesScore,
      futureLetters, movementLog, parkedWorries, processedWorries, courageLog, muscleRelaxCount,
      selfTalkEntries, supportNetwork, responsibilityPies, calmRatings,
      boundaryPracticed, emotionForecasts, habitStacks, conflictResolved, scavengerDone,
      archaeologyDigs, bodyCopingDone, permissionSlips, aweLogs, observerSessions,
      cprUses, strengthsShield, microKindnessLog, feelingsForecasts, hopeJar,
      breathingGamesPlayed, decisionLog, empathyPracticed, moodCollages, vocabLearned,
      gratitudeChain, safePersonCards, morningCompass, copingReports,
      emotionMaps, comfortMenus, praiseJar, feelingsTranslations, listeningLogs,
      courageCoins, friendshipRecipes, thoughtBubbles, calmBuddySessions, accomplishments, dailyWins,
      sensoryCountdowns, emotionJarLogs, tradingCards, moodDJMixes, vendingMachineLogs,
      feelingsMasks, dailyAnchors, boomerangLogs, volumeControlLogs, safeSignals,
      abcDiary, balloonReleases, bingoGames, mirrorDays, orchestraPerfs,
      shrinkRayLogs, gratitudeGlassesLogs, emotionTimeCapsules, kindnessRipples, solarSystems,
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
      unlockedEmotionLevel, parentNudges, sharedAchievements,
      programWeek, programProgress, screeningHistory,
      sleepCoachLog, storyProgress, microMomentLog, familyBoard, earnedMilestones,
      simplifiedMode, dailyChallengesDone, selectedSeason, voiceEnabled, counselorNotes,
      socialRolePlayHistory, growthMindsetDone, memoryVault, sensoryKit, charadesScore,
      futureLetters, movementLog, parkedWorries, processedWorries, courageLog, muscleRelaxCount,
      selfTalkEntries, supportNetwork, responsibilityPies, calmRatings,
      boundaryPracticed, emotionForecasts, habitStacks, conflictResolved, scavengerDone,
      archaeologyDigs, bodyCopingDone, permissionSlips, aweLogs, observerSessions,
      cprUses, strengthsShield, microKindnessLog, feelingsForecasts, hopeJar,
      breathingGamesPlayed, decisionLog, empathyPracticed, moodCollages, vocabLearned,
      gratitudeChain, safePersonCards, morningCompass, copingReports,
      emotionMaps, comfortMenus, praiseJar, feelingsTranslations, listeningLogs,
      courageCoins, friendshipRecipes, thoughtBubbles, calmBuddySessions, accomplishments, dailyWins,
      sensoryCountdowns, emotionJarLogs, tradingCards, moodDJMixes, vendingMachineLogs,
      feelingsMasks, dailyAnchors, boomerangLogs, volumeControlLogs, safeSignals,
      abcDiary, balloonReleases, bingoGames, mirrorDays, orchestraPerfs,
      shrinkRayLogs, gratitudeGlassesLogs, emotionTimeCapsules, kindnessRipples, solarSystems, hydrated]);

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
      if (NEGATIVE_MOODS.includes(moodData.label)) {
        setShowCoolDown(true);
      }
    }
  };

  const saveJournal = () => {
    if (currentJournal.trim()) {
      const hasConcern = CONCERN_KEYWORDS.some(kw => currentJournal.includes(kw));
      setJournalEntries(prev => [...prev, {
        date: todayDate(), time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        content: currentJournal, mood, flagged: hasConcern
      }]);
      setCurrentJournal('');
      completeActivity('journaling');
      if (hasConcern) setJournalWarning(true);
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

  const [showCoolDown, setShowCoolDown] = useState(false);
  const [journalWarning, setJournalWarning] = useState(false);

  const colorConfig = FAVORITE_COLORS.find(c => c.value === favoriteColor) || FAVORITE_COLORS[0];
  const goTools = () => setCurrentPage('tools');

  const speakText = (text) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN'; u.rate = 0.85; u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    }
  };
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
  const todayKey = todayStr();
  const morningDone = morningRoutine[todayKey]?.done;
  const eveningDone = eveningRoutine[todayKey]?.done;

  useEffect(() => {
    const totalMoodDays = new Set(moodHistory.map(m => new Date(m.date).toDateString())).size;
    const newLevel = EMOTION_LEVELS.filter(l => totalMoodDays >= l.minDays).length - 1;
    if (newLevel > unlockedEmotionLevel) setUnlockedEmotionLevel(newLevel);
  }, [moodHistory, unlockedEmotionLevel]);

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

      {showCoolDown && <CoolDownTimer mood={mood} onDone={() => setShowCoolDown(false)} />}

      {journalWarning && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-6">
          <div className="bg-white rounded-3xl p-6 shadow-2xl text-center max-w-sm">
            <div className="text-5xl mb-3">💗</div>
            <p className="text-lg font-bold text-gray-800 mb-2">我注意到你可能很难过</p>
            <p className="text-sm text-gray-600 mb-4">如果你感到很痛苦，请告诉你信任的大人。你不是一个人。</p>
            <div className="space-y-2">
              <button onClick={() => { setJournalWarning(false); setCurrentPage('sos'); }}
                className="w-full bg-red-500 text-white font-bold py-3 rounded-xl">🆘 我需要帮助</button>
              <button onClick={() => setJournalWarning(false)}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl">我只是想写下来</button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className="p-4 flex items-center justify-between">
          <div className="flex gap-1">
            <button onClick={() => setVoiceEnabled(v => !v)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${voiceEnabled ? 'bg-purple-200' : 'bg-gray-100'}`} title="语音模式">
              {voiceEnabled ? '🔊' : '🔇'}
            </button>
            <button onClick={() => setSimplifiedMode(s => !s)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${simplifiedMode ? 'bg-green-200' : 'bg-gray-100'}`} title="简洁模式">
              {simplifiedMode ? '🌱' : '🌳'}
            </button>
          </div>
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

            <MicroMomentCard currentHour={currentHour} log={microMomentLog}
              onRespond={hour => { const dk = todayStr(); setMicroMomentLog(prev => ({ ...prev, [dk]: { ...(prev[dk] || {}), [hour]: true } })); setPoints(p => p + 5); }} />

            {(screeningHistory.length === 0 || (new Date() - new Date(screeningHistory[screeningHistory.length - 1]?.date)) > 14 * 86400000) && moodHistory.length >= 3 && (
              <button onClick={() => setCurrentPage('screening')}
                className="w-full bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 rounded-2xl p-4 text-left hover:scale-102 transition">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">该做心情体检了</p>
                    <p className="text-xs text-gray-500">定期检查帮助了解自己的状态</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>
            )}

            {/* 8-Week Program card */}
            <button onClick={() => setCurrentPage('program')}
              className="w-full bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl p-4 text-left hover:scale-102 transition">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">8周成长计划</p>
                  <p className="text-xs text-gray-500">第{programWeek}周：{PROGRAM_WEEKS[programWeek - 1]?.title}</p>
                </div>
                <div className="flex gap-0.5">{PROGRAM_WEEKS.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < programWeek ? 'bg-purple-500' : 'bg-gray-300'}`} />)}</div>
              </div>
            </button>

            {/* Story Journey card */}
            <button onClick={() => setCurrentPage('storyjourney')}
              className="w-full bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl p-4 text-left hover:scale-102 transition shadow">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{STORY_WORLD.character.name}的旅程</p>
                  <p className="text-xs text-gray-500">帮{STORY_WORLD.character.name}找回光芒</p>
                </div>
                <div className="bg-indigo-200 rounded-full px-2 py-1 text-xs text-indigo-700 font-semibold">{toolUsageLog.length}/65</div>
              </div>
            </button>

            {/* Daily challenge card */}
            {!dailyChallengesDone[todayStr()] && (
              <button onClick={() => setCurrentPage('dailychallenge')}
                className="w-full bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300 rounded-2xl p-4 text-left hover:scale-102 transition">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{DAILY_CHALLENGES[new Date().getDate() % DAILY_CHALLENGES.length].emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">今日挑战</p>
                    <p className="text-xs text-gray-500">{DAILY_CHALLENGES[new Date().getDate() % DAILY_CHALLENGES.length].text}</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>
            )}

            {voiceEnabled && (
              <button onClick={() => speakText(todayAffirmation)}
                className="w-full bg-purple-100 rounded-xl p-3 text-center text-sm text-purple-700 font-semibold hover:bg-purple-200 transition">
                🔊 点击朗读今日肯定语
              </button>
            )}

            <div className="flex gap-2">
              <button onClick={() => setCurrentPage('moodinsights')} className="flex-1 bg-white rounded-xl p-3 shadow text-center hover:scale-105 transition">
                <span className="text-xl">📊</span><p className="text-xs text-gray-600 mt-1">洞察</p>
              </button>
              <button onClick={() => setCurrentPage('streakrewards')} className="flex-1 bg-white rounded-xl p-3 shadow text-center hover:scale-105 transition">
                <span className="text-xl">🏆</span><p className="text-xs text-gray-600 mt-1">成就</p>
              </button>
              <button onClick={() => setCurrentPage('milestones')} className="flex-1 bg-white rounded-xl p-3 shadow text-center hover:scale-105 transition">
                <span className="text-xl">🎖️</span><p className="text-xs text-gray-600 mt-1">里程碑</p>
              </button>
              <button onClick={() => setCurrentPage('familyboard')} className="flex-1 bg-white rounded-xl p-3 shadow text-center hover:scale-105 transition">
                <span className="text-xl">🏡</span><p className="text-xs text-gray-600 mt-1">家庭板</p>
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
            <PageHeader emoji="🧰" title={simplifiedMode ? '核心工具' : '工具箱'} subtitle={simplifiedMode ? '最适合你的工具' : '更多帮助你的小工具'} />
            {simplifiedMode ? (
              <div className="grid grid-cols-2 gap-3">
                {SIMPLIFIED_TOOLS.map(id => {
                  const tool = TOOL_PAGES.find(t => t.id === id);
                  if (!tool) return null;
                  return (
                    <button key={tool.id} onClick={() => trackAndNavigate(tool.id)}
                      className={`bg-gradient-to-br ${tool.color} rounded-xl p-5 text-left hover:scale-105 transition shadow`}>
                      <div className="text-4xl mb-2">{tool.emoji}</div>
                      <p className="font-semibold text-gray-800">{tool.title}</p>
                      <p className="text-xs text-gray-600">{tool.desc}</p>
                    </button>
                  );
                })}
              </div>
            ) : TOOL_CATEGORIES.map(cat => {
              const catTools = cat.ids.map(id => TOOL_PAGES.find(t => t.id === id)).filter(Boolean)
                .sort((a, b) => (recentToolCounts[b.id] || 0) - (recentToolCounts[a.id] || 0));
              if (catTools.length === 0) return null;
              return (
                <div key={cat.name}>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">{cat.emoji} {cat.name}</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {catTools.map(tool => (
                      <button key={tool.id} onClick={() => trackAndNavigate(tool.id)}
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

        {/* ── New Feature Pages ── */}
        {currentPage === 'dailychallenge' && (
          <DailyChallengePage challengesDone={dailyChallengesDone}
            onComplete={key => { setDailyChallengesDone(prev => ({ ...prev, [key]: true })); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'timeline' && (
          <ProgressTimelinePage moodHistory={moodHistory} toolUsageLog={toolUsageLog} streak={streak} points={points} journalEntries={journalEntries} onBack={goTools} />
        )}
        {currentPage === 'seasonal' && (
          <SeasonalPage season={selectedSeason} onBack={goTools} />
        )}
        {currentPage === 'counselor' && (
          <CounselorDashboard moodHistory={moodHistory} toolUsageLog={toolUsageLog} journalEntries={journalEntries}
            sleepLog={sleepLog} screeningHistory={screeningHistory} streak={streak}
            notes={counselorNotes} onAddNote={n => setCounselorNotes(prev => [...prev, n].slice(-50))} onBack={goTools} />
        )}
        {currentPage === 'offlinecard' && (
          <OfflineCardPage safetyPlan={safetyPlan} userName={userName} onBack={goTools} />
        )}
        {currentPage === 'socialroleplay' && (
          <SocialRolePlayPage history={socialRolePlayHistory}
            onComplete={r => { setSocialRolePlayHistory(prev => [...prev.slice(-30), r]); setPoints(p => p + 20); }}
            onBack={goTools} />
        )}
        {currentPage === 'growthmindset' && (
          <GrowthMindsetPage completed={growthMindsetDone}
            onComplete={id => { setGrowthMindsetDone(prev => prev.includes(id) ? prev : [...prev, id]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'memoryvault' && (
          <MemoryVaultPage memories={memoryVault}
            onSave={m => { setMemoryVault(prev => [...prev.slice(-50), m]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'sensorytoolkit' && (
          <SensoryToolkitPage myKit={sensoryKit} onSave={kit => { setSensoryKit(kit); setPoints(p => p + 10); }} onBack={goTools} />
        )}
        {currentPage === 'emotioncharades' && (
          <EmotionCharadesPage score={charadesScore}
            onComplete={pts => { setCharadesScore(prev => prev + pts); setPoints(p => p + pts); }}
            onBack={goTools} />
        )}
        {currentPage === 'futureletter' && (
          <FutureLetterPage letters={futureLetters}
            onSend={l => { setFutureLetters(prev => [...prev.slice(-20), l]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'mindfulmovement' && (
          <DanceMovementPage
            onComplete={id => { setMovementLog(prev => [...prev.slice(-50), { id, date: todayDate() }]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'worrytime' && (
          <WorryTimePage parkedWorries={parkedWorries} processedWorries={processedWorries}
            onPark={w => setParkedWorries(prev => [...prev.slice(-30), w])}
            onProcess={w => { setProcessedWorries(prev => [...prev.slice(-30), w]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'couragetracker' && (
          <CourageTrackerPage courageLog={courageLog}
            onAdd={c => { setCourageLog(prev => [...prev.slice(-50), c]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'musclerelax' && (
          <MuscleRelaxPage onComplete={() => { setMuscleRelaxCount(prev => prev + 1); setPoints(p => p + 15); }} onBack={goTools} />
        )}
        {currentPage === 'selftalk' && (
          <SelfTalkPage entries={selfTalkEntries}
            onSave={e => { setSelfTalkEntries(prev => [...prev.slice(-50), e]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'supportnetwork' && (
          <SupportNetworkPage network={supportNetwork} onSave={setSupportNetwork} onBack={goTools} />
        )}
        {currentPage === 'responsibilitypie' && (
          <ResponsibilityPiePage entries={responsibilityPies}
            onSave={e => { setResponsibilityPies(prev => [...prev.slice(-20), e]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'calmdownmenu' && (
          <CalmDownMenuPage ratings={calmRatings}
            onRate={(title, star) => setCalmRatings(prev => ({ ...prev, [title]: star }))}
            onNavigate={page => setCurrentPage(page)} onBack={goTools} />
        )}
        {currentPage === 'skilltree' && (
          <SkillTreePage toolUsageLog={toolUsageLog} onNavigate={page => setCurrentPage(page)} onBack={goTools} />
        )}
        {currentPage === 'boundaries' && (
          <BoundaryPage practiced={boundaryPracticed}
            onPractice={title => { setBoundaryPracticed(prev => prev.includes(title) ? prev : [...prev, title]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'emotionforecast' && (
          <EmotionForecastPage forecasts={emotionForecasts}
            onSave={(data, isUpdate) => {
              if (isUpdate) setEmotionForecasts(data);
              else setEmotionForecasts(prev => [...prev.slice(-30), data]);
              setPoints(p => p + 10);
            }} onBack={goTools} />
        )}
        {currentPage === 'habitstack' && (
          <HabitStackPage stacks={habitStacks} onSave={setHabitStacks} onBack={goTools} />
        )}
        {currentPage === 'conflictresolve' && (
          <ConflictResolutionPage resolved={conflictResolved}
            onResolve={scene => { setConflictResolved(prev => prev.includes(scene) ? prev : [...prev, scene]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'scavengerhunt' && (
          <ScavengerHuntPage completedHunts={scavengerDone}
            onComplete={id => { setScavengerDone(prev => prev.includes(id) ? prev : [...prev, id]); setPoints(p => p + 20); }}
            onBack={goTools} />
        )}
        {currentPage === 'archaeology' && (
          <EmotionArchaeologyPage digs={archaeologyDigs}
            onDig={d => { setArchaeologyDigs(prev => [...prev.slice(-30), d]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'bodycoping' && (
          <BodyCopingPage completions={bodyCopingDone}
            onComplete={id => { setBodyCopingDone(prev => prev.includes(id) ? prev : [...prev, id]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'permissionslip' && (
          <PermissionSlipPage slips={permissionSlips}
            onSave={s => { setPermissionSlips(prev => [...prev.slice(-30), s]); setPoints(p => p + 5); }}
            onBack={goTools} />
        )}
        {currentPage === 'awe' && (
          <AwePromptPage aweLogs={aweLogs}
            onLog={l => { setAweLogs(prev => [...prev.slice(-50), l]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'observer' && (
          <CompassionateObserverPage sessions={observerSessions}
            onComplete={id => { setObserverSessions(prev => prev.includes(id) ? prev : [...prev, id]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'emotionalcpr' && (
          <EmotionalCPRPage uses={cprUses}
            onUse={u => { setCprUses(prev => [...prev.slice(-20), u]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'strengthshield' && (
          <StrengthsShieldPage shield={strengthsShield} onSave={s => { setStrengthsShield(s); setPoints(p => p + 10); }} onBack={goTools} />
        )}
        {currentPage === 'microkindness' && (
          <MicroKindnessPage log={microKindnessLog}
            onLog={l => { setMicroKindnessLog(prev => [...prev.slice(-100), l]); setPoints(p => p + 5); }}
            onBack={goTools} />
        )}
        {currentPage === 'feelingsforecast' && (
          <FeelingsForecastPage forecasts={feelingsForecasts}
            onSave={(data) => {
              setFeelingsForecasts(prev => {
                const existing = prev.findIndex(f => f.date === data.date);
                if (existing >= 0) return prev.map((f, i) => i === existing ? data : f);
                return [...prev.slice(-60), data];
              });
              setPoints(p => p + 5);
            }} onBack={goTools} />
        )}
        {currentPage === 'hopejar' && (
          <HopeJarPage hopes={hopeJar}
            onAdd={h => { setHopeJar(prev => [...prev.slice(-50), h]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'breathinggame' && (
          <BreathingGamePage played={breathingGamesPlayed}
            onComplete={g => { setBreathingGamesPlayed(prev => [...prev.slice(-50), g]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'decisioncompass' && (
          <DecisionCompassPage log={decisionLog}
            onSave={d => { setDecisionLog(prev => [...prev.slice(-50), d]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'empathyglasses' && (
          <EmpathyGlassesPage practiced={empathyPracticed}
            onComplete={e => { setEmpathyPracticed(prev => [...prev.slice(-50), e]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'moodcollage' && (
          <MoodCollagePage collages={moodCollages}
            onSave={c => { setMoodCollages(prev => [...prev.slice(-30), c]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'vocabstory' && (
          <VocabStoryPage learned={vocabLearned}
            onLearn={v => { setVocabLearned(prev => [...prev.slice(-50), v]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'gratitudechain' && (
          <GratitudeChainPage chain={gratitudeChain}
            onAdd={link => { setGratitudeChain(prev => [...prev.slice(-100), link]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'safepersoncards' && (
          <SafePersonCardsPage cards={safePersonCards}
            onSave={c => setSafePersonCards(c.slice(-10))}
            onBack={goTools} />
        )}
        {currentPage === 'morningcompass' && (
          <MorningCompassPage entries={morningCompass}
            onSave={e => { setMorningCompass(prev => [...prev.slice(-60), e]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'copingreport' && (
          <CopingReportPage reports={copingReports}
            onSave={r => { setCopingReports(prev => [...prev.slice(-30), r]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'connectioncards' && (
          <ConnectionCardsPage onBack={goTools} />
        )}
        {currentPage === 'emotionmapquest' && (
          <EmotionMapQuestPage maps={emotionMaps}
            onSave={m => { setEmotionMaps(prev => [...prev.slice(-60), m]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'comfortmenu' && (
          <ComfortMenuPage menu={comfortMenus}
            onSave={m => { setComfortMenus(prev => [...prev.slice(-30), m]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'praisejar' && (
          <PraiseJarPage praises={praiseJar}
            onAdd={p => { setPraiseJar(prev => [...prev.slice(-50), p]); setPoints(p2 => p2 + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'feelingstranslator' && (
          <FeelingsTranslatorPage translations={feelingsTranslations}
            onSave={t => { setFeelingsTranslations(prev => [...prev.slice(-50), t]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'mindfullistening' && (
          <MindfulListeningPage logs={listeningLogs}
            onSave={l => { setListeningLogs(prev => [...prev.slice(-50), l]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'couragecoin' && (
          <CourageCoinPage coins={courageCoins}
            onEarn={c => { setCourageCoins(prev => [...prev.slice(-50), c]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'friendshiprecipe' && (
          <FriendshipRecipePage recipes={friendshipRecipes}
            onSave={r => { setFriendshipRecipes(prev => [...prev.slice(-20), r]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'thoughtbubbles' && (
          <ThoughtBubblesPage entries={thoughtBubbles}
            onSave={e => { setThoughtBubbles(prev => [...prev.slice(-30), e]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'calmbuddy' && (
          <CalmBuddyPage sessions={calmBuddySessions}
            onComplete={s => { setCalmBuddySessions(prev => [...prev.slice(-50), s]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'accomplishments' && (
          <AccomplishmentTimelinePage entries={accomplishments}
            onAdd={a => { setAccomplishments(prev => [...prev.slice(-100), a]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'dailywins' && (
          <DailyWinsPage wins={dailyWins}
            onSave={w => { setDailyWins(prev => [...prev.slice(-60), w]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'sensorycountdown' && (
          <SensoryCountdownPage logs={sensoryCountdowns}
            onSave={l => { setSensoryCountdowns(prev => [...prev.slice(-50), l]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'emotionjar' && (
          <EmotionJarPage logs={emotionJarLogs}
            onSave={l => { setEmotionJarLogs(prev => [...prev.slice(-50), l]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'tradingcards' && (
          <StrengthTradingCardsPage cards={tradingCards}
            onCollect={c => { setTradingCards(prev => [...prev.slice(-30), c]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'mooddj' && (
          <MoodDJPage mixes={moodDJMixes}
            onSave={m => { setMoodDJMixes(prev => [...prev.slice(-60), m]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'vendingmachine' && (
          <VendingMachinePage logs={vendingMachineLogs}
            onUse={l => { setVendingMachineLogs(prev => [...prev.slice(-50), l]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'feelingsmask' && (
          <FeelingsMaskPage masks={feelingsMasks}
            onSave={m => { setFeelingsMasks(prev => [...prev.slice(-30), m]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'dailyanchor' && (
          <DailyAnchorPage anchors={dailyAnchors}
            onSave={a => { setDailyAnchors(prev => [...prev.slice(-60), a]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'boomerang' && (
          <ComplimentBoomerangPage logs={boomerangLogs}
            onSave={l => { setBoomerangLogs(prev => [...prev.slice(-50), l]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'emotionvolume' && (
          <EmotionVolumePage logs={volumeControlLogs}
            onSave={l => { setVolumeControlLogs(prev => [...prev.slice(-50), l]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'safesignals' && (
          <SafeSignalsPage signals={safeSignals}
            onSave={s => { setSafeSignals(prev => [...prev.slice(-10), s]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'abcdiary' && (
          <EmotionABCPage entries={abcDiary}
            onSave={e => { setAbcDiary(prev => [...prev.slice(-50), e]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'worryballoon' && (
          <WorryBalloonPage releases={balloonReleases}
            onRelease={r => { setBalloonReleases(prev => [...prev.slice(-50), r]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'feelingsbingo' && (
          <FeelingsBingoPage games={bingoGames}
            onSave={g => { setBingoGames(prev => [...prev.slice(-30), g]); setPoints(p => p + 20); }}
            onBack={goTools} />
        )}
        {currentPage === 'mirrorchallenge' && (
          <MirrorChallengePage logs={mirrorDays}
            onComplete={d => { setMirrorDays(prev => [...prev.slice(-14), d]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'orchestra' && (
          <EmotionOrchestraPage performances={orchestraPerfs}
            onSave={p => { setOrchestraPerfs(prev => [...prev.slice(-30), p]); setPoints(p2 => p2 + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'shrinkray' && (
          <ProblemShrinkRayPage logs={shrinkRayLogs}
            onSave={l => { setShrinkRayLogs(prev => [...prev.slice(-30), l]); setPoints(p => p + 20); }}
            onBack={goTools} />
        )}
        {currentPage === 'gratitudeglasses' && (
          <GratitudeGlassesPage logs={gratitudeGlassesLogs}
            onSave={l => { setGratitudeGlassesLogs(prev => [...prev.slice(-30), l]); setPoints(p => p + 10); }}
            onBack={goTools} />
        )}
        {currentPage === 'emotiontimecapsule' && (
          <EmotionTimeCapsulePage capsules={emotionTimeCapsules}
            onSeal={c => { setEmotionTimeCapsules(prev => [...prev.slice(-20), c]); setPoints(p => p + 15); }}
            onOpen={c => { setEmotionTimeCapsules(prev => prev.map(p => p.sealedAt === c.sealedAt ? { ...p, opened: true } : p)); }}
            onBack={goTools} />
        )}
        {currentPage === 'kindnessripple' && (
          <KindnessRipplePage ripples={kindnessRipples}
            onSave={r => { setKindnessRipples(prev => [...prev.slice(-50), r]); setPoints(p => p + 15); }}
            onBack={goTools} />
        )}
        {currentPage === 'solarsystem' && (
          <SupportSolarSystemPage systems={solarSystems}
            onSave={s => { setSolarSystems(prev => [...prev.slice(-10), s]); setPoints(p => p + 10); }}
            onBack={goTools} />
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
        {currentPage === 'program' && (
          <GuidedProgramPage week={programWeek} progress={programProgress}
            onComplete={(w, type, idx) => {
              setProgramProgress(prev => {
                const wp = prev[w] || { lessonsRead: [], toolsUsed: [], goalDone: false };
                if (type === 'lesson') return { ...prev, [w]: { ...wp, lessonsRead: [...new Set([...wp.lessonsRead, idx])] } };
                if (type === 'goal') return { ...prev, [w]: { ...wp, goalDone: true } };
                return prev;
              });
              setPoints(p => p + 10);
            }}
            onAdvance={w => { setProgramWeek(w); setPoints(p => p + 50); }}
            onBack={goTools} />
        )}
        {currentPage === 'screening' && (
          <RiskScreeningPage history={screeningHistory}
            onSubmit={result => { setScreeningHistory(prev => [...prev, result].slice(-20)); setPoints(p => p + 20); setCurrentPage('tools'); }}
            onBack={goTools} />
        )}
        {currentPage === 'sleepcoach' && (
          <SleepCoachPage log={sleepCoachLog} onSave={log => { setSleepCoachLog(log.slice(-90)); setPoints(p => p + 10); }} onBack={goTools} />
        )}
        {currentPage === 'storyjourney' && (
          <StoryJourneyPage progress={storyProgress} totalToolsUsed={toolUsageLog.length} onBack={goTools} />
        )}
        {currentPage === 'parentedu' && (
          <ParentEducationPage onBack={goTools} />
        )}
        {currentPage === 'familyboard' && (
          <FamilyBoardPage board={familyBoard} onAdd={msg => setFamilyBoard(prev => [...prev, msg].slice(-50))} onBack={goTools} />
        )}
        {currentPage === 'milestones' && (
          <RewardMilestonesPage points={points} earned={earnedMilestones}
            onClaim={pts => setEarnedMilestones(prev => [...prev, pts])} onBack={goTools} />
        )}

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
