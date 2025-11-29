import React, { useState, useEffect, useMemo } from 'react';
import { ICONS, TOPICS, DAILY_QUOTES } from './constants';
import { AppView, Topic, UserStats } from './types';
import ChatComponent from './components/ChatComponent';
import LessonView from './components/LessonView';
import { playTextToSpeech } from './services/geminiService';
import { Calendar, CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  // Load stats from localStorage or default
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('lumiere_user_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old stats if they don't have new fields
      return {
        streak: parsed.streak || 1,
        wordsLearned: parsed.wordsLearned || 0,
        lastStudyDate: parsed.lastStudyDate || new Date().toISOString().split('T')[0],
        dailyChallengeCompleted: parsed.dailyChallengeCompleted || false,
        lastChallengeDate: parsed.lastChallengeDate || ''
      };
    }
    return {
      streak: 1,
      wordsLearned: 0,
      lastStudyDate: new Date().toISOString().split('T')[0],
      dailyChallengeCompleted: false,
      lastChallengeDate: ''
    };
  });

  // Calculate daily content based on date
  const today = new Date().toISOString().split('T')[0];
  const dayOfYear = Math.floor(Date.now() / 86400000);
  
  const dailyQuote = useMemo(() => {
    return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  }, [dayOfYear]);

  const dailyTopic = useMemo(() => {
    return TOPICS[dayOfYear % TOPICS.length];
  }, [dayOfYear]);

  // Save stats and reset daily challenge if it's a new day
  useEffect(() => {
    if (stats.lastChallengeDate !== today) {
      setStats(prev => ({
        ...prev,
        dailyChallengeCompleted: false,
        lastChallengeDate: today
      }));
    }
    localStorage.setItem('lumiere_user_stats', JSON.stringify(stats));
  }, [stats, today]);

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentView(AppView.LESSON);
  };

  const handleLessonComplete = () => {
    setStats(prev => {
      // Calculate new streak
      let newStreak = prev.streak;
      if (prev.lastStudyDate !== today) {
         // Increment streak if it's a new day
         newStreak += 1;
      }

      // Check if this was the daily challenge topic
      const isDailyChallenge = selectedTopic?.id === dailyTopic.id;
      const completedChallenge = isDailyChallenge || prev.dailyChallengeCompleted;

      return {
        streak: newStreak,
        wordsLearned: prev.wordsLearned + 5, // Approx 5 words per lesson
        lastStudyDate: today,
        dailyChallengeCompleted: completedChallenge,
        lastChallengeDate: today
      };
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
          <div className="max-w-4xl mx-auto px-4 pb-24">
            {/* Hero Section */}
            <div className="py-8 md:py-10 text-center space-y-2">
              <h1 className="font-serif text-3xl md:text-5xl text-french-blue font-bold tracking-tight">
                Bonjour, Étudiant
              </h1>
              <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
                每天进步一点点。
              </p>
            </div>

            {/* Daily Challenge Card */}
            <div className="mb-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 opacity-90">
                  <Calendar className="w-5 h-5" />
                  <span className="font-bold text-sm tracking-wider uppercase">每日挑战 · {today}</span>
                </div>
                
                <div className="mb-6">
                  <p className="font-serif text-2xl md:text-3xl font-bold italic mb-2">"{dailyQuote.french}"</p>
                  <p className="text-white/80 text-sm md:text-base flex items-center gap-2">
                    {dailyQuote.chinese}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        playTextToSpeech(dailyQuote.french);
                      }}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                    </button>
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-indigo-100 font-bold uppercase mb-1">今日任务</p>
                      <p className="font-medium">完成《{dailyTopic.title}》课程</p>
                    </div>
                    {stats.dailyChallengeCompleted ? (
                      <div className="flex items-center gap-2 bg-green-400/20 text-green-100 px-3 py-1.5 rounded-full border border-green-400/30">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-bold">已完成</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleTopicSelect(dailyTopic)}
                        className="flex items-center gap-1 bg-white text-indigo-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
                      >
                        去完成 <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-900/20 rounded-full blur-3xl"></div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2">
                <div className="text-orange-500 bg-orange-50 p-3 rounded-full">
                  {ICONS.Award}
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-gray-800">{stats.streak} 天</div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">连续打卡</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-2">
                <div className="text-green-500 bg-green-50 p-3 rounded-full">
                  {ICONS.Heart}
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-gray-800">{stats.wordsLearned}</div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">已学单词</div>
                </div>
              </div>
            </div>

            {/* Topics Grid */}
            <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">学习主题</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic)}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-french-blue/30 transition-all flex items-center gap-4 text-left group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${topic.color}`}>
                    {topic.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 group-hover:text-french-blue transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-500">{topic.description}</p>
                  </div>
                  <div className="text-gray-300 group-hover:text-french-blue transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case AppView.LESSON:
        return selectedTopic ? (
          <LessonView 
            topic={selectedTopic} 
            onBack={() => {
              setSelectedTopic(null);
              setCurrentView(AppView.HOME);
            }}
            onComplete={handleLessonComplete}
          />
        ) : null;

      case AppView.CHAT:
        return (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <ChatComponent />
          </div>
        );
        
      case AppView.PROFILE:
        return (
          <div className="max-w-md mx-auto px-4 py-12 text-center">
             <div className="w-24 h-24 bg-french-blue rounded-full mx-auto flex items-center justify-center text-white text-3xl font-serif font-bold mb-6 shadow-lg shadow-blue-200">
               {stats.streak}
             </div>
             <h2 className="text-2xl font-bold mb-2">我的进度</h2>
             <p className="text-gray-500 mb-8">当前等级：初学者 A1</p>
             
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-gray-50">
                 <span className="text-gray-600">连续学习</span>
                 <span className="font-medium text-french-blue">{stats.streak} 天</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-gray-50">
                 <span className="text-gray-600">累计掌握单词</span>
                 <span className="font-medium">{stats.wordsLearned} 个</span>
               </div>
               <div className="flex justify-between items-center py-2">
                 <span className="text-gray-600">今日挑战</span>
                 <span className={`font-medium ${stats.dailyChallengeCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                   {stats.dailyChallengeCompleted ? '已完成' : '未完成'}
                 </span>
               </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 selection:bg-french-blue/20">
      
      {/* Top Banner */}
      <div className="h-1 bg-gradient-to-r from-french-blue to-french-red w-full"></div>
      
      {/* Main Content Area */}
      <main className="pt-4 pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 pt-2 pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button
            onClick={() => setCurrentView(AppView.HOME)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              currentView === AppView.HOME ? 'text-french-blue scale-110' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {ICONS.Learn}
            <span className="text-[10px] font-bold mt-1">学习</span>
          </button>
          
          <button
            onClick={() => setCurrentView(AppView.CHAT)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              currentView === AppView.CHAT ? 'text-french-blue scale-110' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {ICONS.Chat}
            <span className="text-[10px] font-bold mt-1">AI 聊天</span>
          </button>
          
          <button
            onClick={() => setCurrentView(AppView.PROFILE)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              currentView === AppView.PROFILE ? 'text-french-blue scale-110' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {ICONS.Profile}
            <span className="text-[10px] font-bold mt-1">我的</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;