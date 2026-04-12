import React, { useState, useEffect, useRef } from 'react';
import { Heart, Sun, Cloud, Star, BookOpen, Award, TrendingUp, Phone, Play, Pause, RotateCcw, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'healing-kids-app-v2';

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Reset daily progress if day changed
    const today = new Date().toDateString();
    if (data.lastDate !== today) {
      data.dailyProgress = { meditation: false, journaling: false, breathing: false, activity: false };
      // streak break: if last date wasn't yesterday, reset streak
      const last = new Date(data.lastDate);
      const diff = Math.round((new Date(today) - last) / 86400000);
      if (diff > 1) data.streak = 0;
      data.lastDate = today;
    }
    return data;
  } catch (e) {
    return null;
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
};

export default function HealingKidsApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mood, setMood] = useState(null);
  const [dailyProgress, setDailyProgress] = useState({
    meditation: false,
    journaling: false,
    breathing: false,
    activity: false
  });
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [journalEntries, setJournalEntries] = useState([]);
  const [currentJournal, setCurrentJournal] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setMood(saved.mood || null);
      setDailyProgress(saved.dailyProgress || { meditation: false, journaling: false, breathing: false, activity: false });
      setPoints(saved.points || 0);
      setStreak(saved.streak || 0);
      setJournalEntries(saved.journalEntries || []);
      setMoodHistory(saved.moodHistory || []);
    }
    setHydrated(true);
  }, []);

  // Save on change
  useEffect(() => {
    if (!hydrated) return;
    saveState({
      mood, dailyProgress, points, streak, journalEntries, moodHistory,
      lastDate: new Date().toDateString()
    });
  }, [mood, dailyProgress, points, streak, journalEntries, moodHistory, hydrated]);

  const moods = [
    { emoji: '😊', label: '开心', color: 'bg-yellow-400' },
    { emoji: '😌', label: '平静', color: 'bg-blue-400' },
    { emoji: '😔', label: '难过', color: 'bg-gray-400' },
    { emoji: '😰', label: '焦虑', color: 'bg-purple-400' },
    { emoji: '😡', label: '生气', color: 'bg-red-400' }
  ];

  const activities = [
    { id: 'meditation', icon: Cloud, title: '冥想放松', duration: '5分钟', color: 'bg-blue-500', page: 'meditation' },
    { id: 'breathing', icon: Heart, title: '呼吸练习', duration: '3分钟', color: 'bg-pink-500', page: 'breathing' },
    { id: 'journaling', icon: BookOpen, title: '情绪日记', duration: '10分钟', color: 'bg-purple-500', page: 'journal' },
    { id: 'activity', icon: Star, title: '快乐活动', duration: '15分钟', color: 'bg-yellow-500', page: 'activity' }
  ];

  const encouragements = [
    '你做得真棒！🌟',
    '每一小步都很重要 💪',
    '你比你想象的更坚强 💖',
    '今天的你值得被爱 🌈',
    '慢慢来，一切都会好起来 ☀️'
  ];

  const completeActivity = (activityId) => {
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
  };

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
        date: new Date().toLocaleDateString('zh-CN'),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        content: currentJournal,
        mood: mood
      }]);
      setCurrentJournal('');
      completeActivity('journaling');
    }
  };

  const deleteJournal = (idx) => {
    setJournalEntries(prev => prev.filter((_, i) => i !== idx));
  };

  // --- Pages ---

  const HomePage = () => {
    const encouragement = encouragements[new Date().getDate() % encouragements.length];
    const needsSupport = mood && ['难过', '焦虑', '生气'].includes(mood.label);
    return (
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">你好！小朋友</h2>
              <p className="opacity-90">今天感觉怎么样？</p>
            </div>
            <Sun className="w-16 h-16" />
          </div>

          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => saveMood(m)}
                className={`${mood?.label === m.label ? 'ring-4 ring-white scale-110' : ''} transition-all p-3 rounded-full bg-white bg-opacity-20 hover:scale-105`}
              >
                <span className="text-3xl">{m.emoji}</span>
              </button>
            ))}
          </div>
          {mood && (
            <p className="text-center mt-3 text-sm">今天你感到{mood.label} {mood.emoji}</p>
          )}
        </div>

        {needsSupport && (
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 rounded-2xl p-4">
            <p className="text-gray-800 font-semibold mb-2">💗 感到{mood.label}是没关系的</p>
            <p className="text-sm text-gray-700 mb-3">
              这些感受都是正常的。试试下面的小练习，会帮助你感觉好一些。如果需要，也可以告诉信任的大人。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage('breathing')}
                className="flex-1 bg-pink-500 text-white py-2 rounded-lg text-sm font-semibold"
              >
                呼吸练习
              </button>
              <button
                onClick={() => setCurrentPage('help')}
                className="flex-1 bg-purple-500 text-white py-2 rounded-lg text-sm font-semibold"
              >
                寻求帮助
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800">今日进度</h3>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-yellow-600">{points}分</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {activities.map((activity) => {
              const Icon = activity.icon;
              const done = dailyProgress[activity.id];
              return (
                <button
                  key={activity.id}
                  onClick={() => setCurrentPage(activity.page)}
                  className={`${activity.color} rounded-xl p-4 text-white relative overflow-hidden text-left hover:scale-105 transition ${done ? 'opacity-80' : ''}`}
                >
                  {done && (
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </div>
                  )}
                  <Icon className="w-8 h-8 mb-2" />
                  <p className="font-semibold text-sm">{activity.title}</p>
                  <p className="text-xs opacity-80">{activity.duration}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            <div className="flex-1">
              <p className="text-sm opacity-90">连续打卡</p>
              <p className="text-2xl font-bold">{streak} 天</p>
            </div>
            <div className="text-right text-sm opacity-90">
              <p>{encouragement}</p>
            </div>
          </div>
        </div>

        {moodHistory.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-3">最近心情</h3>
            <div className="flex gap-1 flex-wrap">
              {moodHistory.slice(-14).map((h, i) => (
                <span key={i} className="text-2xl" title={new Date(h.date).toLocaleDateString('zh-CN')}>{h.emoji}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Interactive breathing animation
  const BreathingPage = () => {
    const [active, setActive] = useState(false);
    const [phase, setPhase] = useState('ready'); // inhale, hold, exhale
    const [count, setCount] = useState(4);
    const [cycles, setCycles] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
      if (!active) return;
      const phases = [
        { name: 'inhale', label: '吸气', duration: 4 },
        { name: 'hold', label: '屏息', duration: 4 },
        { name: 'exhale', label: '呼气', duration: 4 }
      ];
      let phaseIdx = 0;
      let secs = phases[0].duration;
      setPhase(phases[0].name);
      setCount(secs);
      timerRef.current = setInterval(() => {
        secs -= 1;
        if (secs <= 0) {
          phaseIdx = (phaseIdx + 1) % phases.length;
          if (phaseIdx === 0) setCycles(c => c + 1);
          secs = phases[phaseIdx].duration;
          setPhase(phases[phaseIdx].name);
        }
        setCount(secs);
      }, 1000);
      return () => clearInterval(timerRef.current);
    }, [active]);

    useEffect(() => {
      if (cycles >= 3 && active) {
        setActive(false);
        completeActivity('breathing');
      }
    }, [cycles, active]);

    const phaseText = { ready: '准备开始', inhale: '慢慢吸气...', hold: '屏住呼吸...', exhale: '慢慢呼气...' }[phase];
    const circleScale = phase === 'inhale' ? 'scale-150' : phase === 'exhale' ? 'scale-75' : 'scale-100';

    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <Heart className="w-12 h-12 mx-auto text-pink-500 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">呼吸练习</h2>
          <p className="text-gray-600 mt-1">让我们一起深呼吸，放松心情</p>
        </div>

        <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-8 flex flex-col items-center">
          <div className="h-64 flex items-center justify-center">
            <div
              className={`w-40 h-40 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-4xl transition-transform duration-[4000ms] ease-in-out ${circleScale} shadow-2xl`}
            >
              {active ? count : '💗'}
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800 mt-4">{phaseText}</p>
          <p className="text-sm text-gray-600 mt-1">完成 {cycles} / 3 轮</p>

          <div className="flex gap-3 mt-6">
            {!active ? (
              <button
                onClick={() => { setCycles(0); setActive(true); }}
                className="bg-pink-500 text-white font-semibold px-8 py-3 rounded-full flex items-center gap-2"
              >
                <Play className="w-5 h-5" /> 开始
              </button>
            ) : (
              <button
                onClick={() => setActive(false)}
                className="bg-gray-500 text-white font-semibold px-8 py-3 rounded-full flex items-center gap-2"
              >
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
  };

  // Meditation with timer
  const MeditationPage = () => {
    const [selected, setSelected] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [running, setRunning] = useState(false);
    const timerRef = useRef(null);

    const themes = [
      { title: '🌲 森林漫步', description: '想象在安静的森林里散步，听着鸟儿歌唱，脚下是柔软的落叶...', duration: 180 },
      { title: '🌊 海边听浪', description: '坐在温暖的沙滩上，听着海浪一遍又一遍地拍打着海岸...', duration: 180 },
      { title: '☁️ 云朵旅行', description: '躺在柔软的云朵上，飘向蓝蓝的天空，烦恼都留在了下面...', duration: 240 },
      { title: '⭐ 星空冥想', description: '仰望夜空中闪烁的星星，感受宇宙的平静和温柔...', duration: 240 }
    ];

    useEffect(() => {
      if (!running) return;
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setRunning(false);
            completeActivity('meditation');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }, [running]);

    const start = (theme) => {
      setSelected(theme);
      setTimeLeft(theme.duration);
      setRunning(true);
    };

    const stop = () => {
      setRunning(false);
      clearInterval(timerRef.current);
    };

    const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    if (selected && (running || timeLeft > 0)) {
      return (
        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-blue-200 to-cyan-200 rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{selected.title}</h2>
            <p className="text-gray-700 mb-6">{selected.description}</p>
            <div className="text-6xl font-bold text-blue-700 my-8 tabular-nums">{fmt(timeLeft)}</div>
            <div className="flex gap-3 justify-center">
              {running ? (
                <button onClick={stop} className="bg-gray-500 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2">
                  <Pause className="w-5 h-5" /> 暂停
                </button>
              ) : (
                <button onClick={() => setRunning(true)} className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2">
                  <Play className="w-5 h-5" /> 继续
                </button>
              )}
              <button onClick={() => { setSelected(null); setTimeLeft(0); setRunning(false); }} className="bg-white text-gray-700 px-6 py-3 rounded-full font-semibold flex items-center gap-2">
                <RotateCcw className="w-5 h-5" /> 返回
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-4">
        <div className="text-center mb-4">
          <Cloud className="w-12 h-12 mx-auto text-blue-500 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">冥想时光</h2>
          <p className="text-gray-600 mt-1">选一个主题，让心灵休息</p>
        </div>

        {themes.map((theme, idx) => (
          <div key={idx} className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-5 shadow">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{theme.title}</h3>
            <p className="text-gray-700 mb-4 text-sm">{theme.description}</p>
            <button
              onClick={() => start(theme)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition"
            >
              开始冥想 ({Math.round(theme.duration / 60)} 分钟)
            </button>
          </div>
        ))}
      </div>
    );
  };

  const JournalPage = () => {
    const prompts = [
      '今天发生了什么让你开心的事？',
      '有什么事情让你感到困扰吗？',
      '今天你最感谢的一件事是什么？',
      '如果可以对自己说一句话，你想说什么？',
      '今天你最喜欢的一个瞬间是什么？'
    ];
    const prompt = prompts[new Date().getDate() % prompts.length];

    return (
      <div className="p-6 space-y-5">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto text-purple-500 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">情绪日记</h2>
          <p className="text-gray-600 mt-1">写下你的感受，释放你的情绪</p>
        </div>

        <div className="bg-purple-100 rounded-xl p-4">
          <p className="text-sm text-purple-900">💭 今日提示：{prompt}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <textarea
            value={currentJournal}
            onChange={(e) => setCurrentJournal(e.target.value)}
            placeholder="写下你的感受吧..."
            className="w-full h-40 p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
          />
          <button
            onClick={saveJournal}
            disabled={!currentJournal.trim()}
            className="w-full mt-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition"
          >
            保存日记
          </button>
        </div>

        {journalEntries.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">历史记录 ({journalEntries.length})</h3>
            {[...journalEntries].reverse().slice(0, 10).map((entry, revIdx) => {
              const origIdx = journalEntries.length - 1 - revIdx;
              return (
                <div key={origIdx} className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{entry.date} {entry.time}</span>
                    <div className="flex items-center gap-2">
                      {entry.mood && <span className="text-2xl">{entry.mood.emoji}</span>}
                      <button onClick={() => deleteJournal(origIdx)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{entry.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const ActivityPage = () => {
    const happyActivities = [
      { emoji: '🎨', label: '画一幅画' },
      { emoji: '🎵', label: '听喜欢的音乐' },
      { emoji: '💬', label: '和朋友聊天' },
      { emoji: '🎮', label: '玩喜欢的游戏' },
      { emoji: '📺', label: '看有趣的视频' },
      { emoji: '✂️', label: '做手工' },
      { emoji: '📚', label: '读一本书' },
      { emoji: '🌳', label: '户外散步' },
      { emoji: '🐶', label: '和宠物玩' },
      { emoji: '🤗', label: '拥抱家人' }
    ];

    return (
      <div className="p-6 space-y-5">
        <div className="text-center">
          <Star className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">快乐活动</h2>
          <p className="text-gray-600 mt-1">选一个让你开心的活动！</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {happyActivities.map((activity, idx) => (
            <button
              key={idx}
              onClick={() => completeActivity('activity')}
              className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-5 hover:scale-105 transition shadow"
            >
              <div className="text-4xl mb-2">{activity.emoji}</div>
              <p className="text-sm font-semibold text-gray-800">{activity.label}</p>
            </button>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-gray-700">
          💡 完成一个活动后，记得点击它打卡获得积分哦！
        </div>
      </div>
    );
  };

  const HelpPage = () => (
    <div className="p-6 space-y-5">
      <div className="text-center">
        <Heart className="w-12 h-12 mx-auto text-red-500 mb-2" />
        <h2 className="text-2xl font-bold text-gray-800">我需要帮助</h2>
        <p className="text-gray-600 mt-1">你不是一个人，总有人愿意倾听</p>
      </div>

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
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-600" /> 心理援助热线
        </h3>
        <div className="space-y-3">
          <div className="bg-green-50 rounded-xl p-4">
            <p className="font-semibold text-gray-800">北京心理危机研究与干预中心</p>
            <p className="text-lg font-bold text-green-700">010-82951332</p>
            <p className="text-xs text-gray-600">24小时</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="font-semibold text-gray-800">希望24热线</p>
            <p className="text-lg font-bold text-green-700">400-161-9995</p>
            <p className="text-xs text-gray-600">24小时</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="font-semibold text-gray-800">青少年心理援助热线</p>
            <p className="text-lg font-bold text-green-700">12355</p>
            <p className="text-xs text-gray-600">周一至周日</p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 rounded-2xl p-5">
        <p className="text-center text-gray-800 font-semibold">🌈 你值得被爱和关心</p>
        <p className="text-center text-sm text-gray-600 mt-2">无论发生什么，你都是特别的、重要的。</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'home', icon: Sun, label: '首页', color: 'purple' },
    { id: 'breathing', icon: Heart, label: '呼吸', color: 'pink' },
    { id: 'meditation', icon: Cloud, label: '冥想', color: 'blue' },
    { id: 'journal', icon: BookOpen, label: '日记', color: 'purple' },
    { id: 'activity', icon: Star, label: '活动', color: 'yellow' }
  ];

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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ☀️ 阳光小屋
          </h1>
          <button
            onClick={() => setCurrentPage('help')}
            className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200"
            title="寻求帮助"
          >
            <Heart className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>

      <div className="pb-24">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'breathing' && <BreathingPage />}
        {currentPage === 'meditation' && <MeditationPage />}
        {currentPage === 'journal' && <JournalPage />}
        {currentPage === 'activity' && <ActivityPage />}
        {currentPage === 'help' && <HelpPage />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around py-2 px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentPage(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${active ? `text-${tab.color}-600 bg-${tab.color}-50` : 'text-gray-500'}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
