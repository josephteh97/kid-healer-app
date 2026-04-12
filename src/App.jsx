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
  { id: 'parent', emoji: '👨‍👩‍👧', title: '家长看板', color: 'from-gray-100 to-slate-100', desc: '需要PIN码' }
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
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({
      mood, dailyProgress, points, streak, journalEntries, moodHistory,
      thoughtEntries, gratitudeEntries, activationLog, safetyPlan, socialLog, sleepLog, affirmationFavs,
      lastDate: todayStr()
    });
  }, [mood, dailyProgress, points, streak, journalEntries, moodHistory,
      thoughtEntries, gratitudeEntries, activationLog, safetyPlan, socialLog, sleepLog, affirmationFavs, hydrated]);

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

  const goTools = () => setCurrentPage('tools');
  const encouragement = ENCOURAGEMENTS[new Date().getDate() % ENCOURAGEMENTS.length];
  const needsSupport = mood && NEGATIVE_MOODS.includes(mood.label);
  const journalPrompt = JOURNAL_PROMPTS[new Date().getDate() % JOURNAL_PROMPTS.length];
  const recentJournals = journalEntries.slice(-10).reverse();
  const todayAffirmation = AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];

  return (
    <div className="max-w-md mx-auto bg-gradient-to-b from-blue-50 to-purple-50 min-h-screen relative">
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
                <div><h2 className="text-2xl font-bold">你好！小朋友</h2><p className="opacity-90">今天感觉怎么样？</p></div>
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

            {/* Daily affirmation card */}
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-4 shadow">
              <p className="text-center text-gray-800 font-semibold">{todayAffirmation}</p>
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
            <div className="grid grid-cols-2 gap-3">
              {TOOL_PAGES.map(tool => (
                <button key={tool.id} onClick={() => setCurrentPage(tool.id)}
                  className={`bg-gradient-to-br ${tool.color} rounded-xl p-4 text-left hover:scale-105 transition shadow`}>
                  <div className="text-3xl mb-2">{tool.emoji}</div>
                  <p className="font-semibold text-sm text-gray-800">{tool.title}</p>
                  <p className="text-xs text-gray-600">{tool.desc}</p>
                </button>
              ))}
            </div>
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

        {/* ── Help ── */}
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
