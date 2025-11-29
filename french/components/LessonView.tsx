import React, { useState, useEffect } from 'react';
import { generateLesson, playTextToSpeech } from '../services/geminiService';
import { LessonContent, Topic } from '../types';
import { ArrowLeft, Book, Volume2, Check, X, GraduationCap, ChevronRight, Loader2 } from 'lucide-react';

interface LessonViewProps {
  topic: Topic;
  onBack: () => void;
  onComplete: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ topic, onBack, onComplete }) => {
  const [content, setContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0); // 0: Intro, 1: Vocab, 2: Grammar, 3: Quiz
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({});
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const data = await generateLesson(topic.title);
        setContent(data);
      } catch (err) {
        setError('无法加载课程。请检查您的 API 密钥。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [topic]);

  const handleSpeak = (text: string) => {
    playTextToSpeech(text);
  };

  const handleFinish = () => {
    if (!isCompleted && content && Object.keys(quizAnswers).length === content.quiz.length) {
      onComplete();
      setIsCompleted(true);
    }
    onBack();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 text-french-blue animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">AI 正在为您生成课程...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={onBack} className="text-french-blue underline">返回</button>
      </div>
    );
  }

  const steps = [
    { title: '介绍', icon: <Book className="w-4 h-4" /> },
    { title: '词汇', icon: <Volume2 className="w-4 h-4" /> },
    { title: '语法', icon: <GraduationCap className="w-4 h-4" /> },
    { title: '测验', icon: <Check className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100 p-4 mb-6">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-french-blue mb-2 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回
        </button>
        <h1 className="text-2xl font-serif font-bold text-gray-900">{content.title}</h1>
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-between mt-4 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10" />
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`flex flex-col items-center gap-1 bg-white px-2 ${index <= activeStep ? 'text-french-blue' : 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                index === activeStep ? 'border-french-blue bg-blue-50' : 
                index < activeStep ? 'border-french-blue bg-french-blue text-white' : 'border-gray-200'
              }`}>
                {index < activeStep ? <Check className="w-4 h-4" /> : step.icon}
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Areas */}
      <div className="px-4">
        
        {/* Intro */}
        {activeStep === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
              <h3 className="text-lg font-bold text-french-blue mb-2">欢迎！</h3>
              <p className="text-gray-700 leading-relaxed text-lg">{content.introduction}</p>
            </div>
            <button 
              onClick={() => setActiveStep(1)}
              className="w-full py-4 bg-french-blue text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              开始学习 <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Vocabulary */}
        {activeStep === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold mb-4">关键词</h3>
            <div className="grid gap-4">
              {content.vocabulary.map((word, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-french-blue/30 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xl font-bold text-french-blue">{word.french}</h4>
                      <p className="text-gray-500">{word.chinese}</p>
                    </div>
                    <button 
                      onClick={() => handleSpeak(word.french)}
                      className="p-2 bg-gray-50 text-gray-400 hover:text-french-blue hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mt-2">
                    <p className="italic">"{word.example}"</p>
                  </div>
                  {word.pronunciation_tip && (
                    <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                      <span className="font-bold">提示:</span> {word.pronunciation_tip}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveStep(2)}
              className="w-full py-4 mt-6 bg-french-blue text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              继续 <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Grammar */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">语法点</h3>
              </div>
              <p className="text-gray-800 text-lg leading-relaxed mb-4">{content.grammar_point.rule}</p>
              <div className="bg-white/60 p-4 rounded-xl border border-orange-100">
                <p className="text-orange-700 font-medium">示例：</p>
                <p className="text-xl text-gray-800 mt-1">{content.grammar_point.example}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveStep(3)}
              className="w-full py-4 bg-french-blue text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              进行测验 <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Quiz */}
        {activeStep === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {content.quiz.map((q, qIdx) => (
              <div key={qIdx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="font-medium text-lg mb-4 text-gray-800">{qIdx + 1}. {q.question}</h4>
                <div className="space-y-3">
                  {q.options.map((option, oIdx) => {
                    const isSelected = quizAnswers[qIdx] === oIdx;
                    const isCorrect = q.correctIndex === oIdx;
                    const showResult = quizAnswers[qIdx] !== undefined;
                    
                    let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all ";
                    
                    if (showResult) {
                      if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700";
                      else if (isSelected) btnClass += "border-red-300 bg-red-50 text-red-700";
                      else btnClass += "border-gray-100 opacity-50";
                    } else {
                      btnClass += "border-gray-100 hover:border-french-blue hover:bg-blue-50";
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={showResult}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                        className={btnClass}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showResult && isCorrect && <Check className="w-5 h-5 text-green-600" />}
                          {showResult && isSelected && !isCorrect && <X className="w-5 h-5 text-red-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {Object.keys(quizAnswers).length === content.quiz.length && (
               <div className="bg-green-100 text-green-800 p-4 rounded-xl text-center font-bold animate-bounce">
                 太棒了！课程完成。
               </div>
            )}

            <button 
              onClick={handleFinish}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium shadow-lg hover:bg-gray-800 transition-all"
            >
              完成课程
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default LessonView;