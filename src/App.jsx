import React, { useState, useEffect } from 'react';
import { Heart, Sun, Cloud, Star, Music, BookOpen, Smile, Award, Calendar, TrendingUp } from 'lucide-react';

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

  const moods = [
    { emoji: '😊', label: '开心', color: 'bg-yellow-400' },
    { emoji: '😌', label: '平静', color: 'bg-blue-400' },
    { emoji: '😔', label: '难过', color: 'bg-gray-400' },
    { emoji: '😰', label: '焦虑', color: 'bg-purple-400' },
    { emoji: '😡', label: '生气', color: 'bg-red-400' }
  ];

  const activities = [
    { id: 'meditation', icon: Cloud, title: '冥想放松', duration: '5分钟', color: 'bg-blue-500' },
    { id: 'breathing', icon: Heart, title: '呼吸练习', duration: '3分钟', color: 'bg-pink-500' },
    { id: 'journaling', icon: BookOpen, title: '情绪日记', duration: '10分钟', color: 'bg-purple-500' },
    { id: 'activity', icon: Star, title: '快乐活动', duration: '15分钟', color: 'bg-yellow-500' }
  ];

  const breathingExercises = [
    { name: '腹式呼吸', description: '深深吸气4秒，屏息4秒，呼气4秒' },
    { name: '彩虹呼吸', description: '想象吸入彩虹的颜色，呼出灰色的烦恼' },
    { name: '泡泡呼吸', description: '像吹泡泡一样慢慢呼气' }
  ];

  const meditationThemes = [
    { title: '森林漫步', description: '想象在安静的森林里散步' },
    { title: '海边听浪', description: '听着海浪的声音放松身心' },
    { title: '云朵旅行', description: '躺在柔软的云朵上旅行' }
  ];

  const happyActivities = [
    '画一幅画', '听喜欢的音乐', '和朋友聊天', '玩喜欢的游戏',
    '看有趣的视频', '做手工', '读一本书', '户外散步'
  ];

  const completeActivity = (activityId) => {
    if (!dailyProgress[activityId]) {
      setDailyProgress({...dailyProgress, [activityId]: true});
      setPoints(points + 10);
      
      const completedCount = Object.values({...dailyProgress, [activityId]: true}).filter(Boolean).length;
      if (completedCount === 4) {
        setStreak(streak + 1);
        setPoints(points + 30);
      }
    }
  };

  const saveMood = (moodData) => {
    setMood(moodData);
    setPoints(points + 5);
  };

  const saveJournal = () => {
    if (currentJournal.trim()) {
      setJournalEntries([...journalEntries, {
        date: new Date().toLocaleDateString('zh-CN'),
        content: currentJournal,
        mood: mood
      }]);
      setCurrentJournal('');
      completeActivity('journaling');
    }
  };

  const HomePage = () => (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">你好！小朋友</h2>
            <p className="opacity-90">今天感觉怎么样？</p>
          </div>
          <Sun className="w-16 h-16" />
        </div>
        
        <div className="flex gap-2 justify-center mt-4">
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
            return (
              <div
                key={activity.id}
                className={`${activity.color} rounded-xl p-4 text-white relative overflow-hidden`}
              >
                {dailyProgress[activity.id] && (
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                )}
                <Icon className="w-8 h-8 mb-2" />
                <p className="font-semibold text-sm">{activity.title}</p>
                <p className="text-xs opacity-80">{activity.duration}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8" />
          <div>
            <p className="text-sm opacity-90">连续打卡</p>
            <p className="text-2xl font-bold">{streak} 天</p>
          </div>
        </div>
      </div>
    </div>
  );

  const BreathingPage = () => (
    <div className="p-6 space-y-6">
      <div className="text-center mb-6">
        <Heart className="w-16 h-16 mx-auto text-pink-500 mb-3" />
        <h2 className="text-2xl font-bold text-gray-800">呼吸练习</h2>
        <p className="text-gray-600 mt-2">让我们一起深呼吸，放松心情</p>
      </div>

      {breathingExercises.map((exercise, idx) => (
        <div key={idx} className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{exercise.name}</h3>
          <p className="text-gray-700 mb-4">{exercise.description}</p>
          <button
            onClick={() => completeActivity('breathing')}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition"
          >
            开始练习
          </button>
        </div>
      ))}
    </div>
  );

  const MeditationPage = () => (
    <div className="p-6 space-y-6">
      <div className="text-center mb-6">
        <Cloud className="w-16 h-16 mx-auto text-blue-500 mb-3" />
        <h2 className="text-2xl font-bold text-gray-800">冥想时光</h2>
        <p className="text-gray-600 mt-2">找一个安静的地方，让心灵休息</p>
      </div>

      {meditationThemes.map((theme, idx) => (
        <div key={idx} className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{theme.title}</h3>
          <p className="text-gray-700 mb-4">{theme.description}</p>
          <button
            onClick={() => completeActivity('meditation')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition"
          >
            开始冥想
          </button>
        </div>
      ))}
    </div>
  );

  const JournalPage = () => (
    <div className="p-6 space-y-6">
      <div className="text-center mb-6">
        <BookOpen className="w-16 h-16 mx-auto text-purple-500 mb-3" />
        <h2 className="text-2xl font-bold text-gray-800">情绪日记</h2>
        <p className="text-gray-600 mt-2">写下你的感受，释放你的情绪</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <textarea
          value={currentJournal}
          onChange={(e) => setCurrentJournal(e.target.value)}
          placeholder="今天发生了什么？你有什么感受？写下来吧..."
          className="w-full h-40 p-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
        />
        <button
          onClick={saveJournal}
          className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-xl transition"
        >
          保存日记
        </button>
      </div>

      {journalEntries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800">历史记录</h3>
          {journalEntries.slice(-3).reverse().map((entry, idx) => (
            <div key={idx} className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{entry.date}</span>
                {entry.mood && <span className="text-2xl">{entry.mood.emoji}</span>}
              </div>
              <p className="text-gray-800">{entry.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ActivityPage = () => (
    <div className="p-6 space-y-6">
      <div className="text-center mb-6">
        <Star className="w-16 h-16 mx-auto text-yellow-500 mb-3" />
        <h2 className="text-2xl font-bold text-gray-800">快乐活动</h2>
        <p className="text-gray-600 mt-2">选一个让你开心的活动吧！</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {happyActivities.map((activity, idx) => (
          <button
            key={idx}
            onClick={() => completeActivity('activity')}
            className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-6 hover:shadow-lg transition"
          >
            <p className="text-lg font-semibold text-gray-800">{activity}</p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gradient-to-b from-blue-50 to-purple-50 min-h-screen">
      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ☀️ 阳光小屋
          </h1>
        </div>
      </div>

      <div className="pb-20">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'breathing' && <BreathingPage />}
        {currentPage === 'meditation' && <MeditationPage />}
        {currentPage === 'journal' && <JournalPage />}
        {currentPage === 'activity' && <ActivityPage />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around py-3 px-2">
        <button
          onClick={() => setCurrentPage('home')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${currentPage === 'home' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'}`}
        >
          <Sun className="w-6 h-6" />
          <span className="text-xs">首页</span>
        </button>
        <button
          onClick={() => setCurrentPage('breathing')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${currentPage === 'breathing' ? 'text-pink-600 bg-pink-50' : 'text-gray-600'}`}
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs">呼吸</span>
        </button>
        <button
          onClick={() => setCurrentPage('meditation')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${currentPage === 'meditation' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
        >
          <Cloud className="w-6 h-6" />
          <span className="text-xs">冥想</span>
        </button>
        <button
          onClick={() => setCurrentPage('journal')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${currentPage === 'journal' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'}`}
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-xs">日记</span>
        </button>
        <button
          onClick={() => setCurrentPage('activity')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${currentPage === 'activity' ? 'text-yellow-600 bg-yellow-50' : 'text-gray-600'}`}
        >
          <Star className="w-6 h-6" />
          <span className="text-xs">活动</span>
        </button>
      </div>
    </div>
  );
}