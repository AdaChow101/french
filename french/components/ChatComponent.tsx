import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Sparkles, Trash2 } from 'lucide-react';
import { ChatMessage, MessageRole } from '../types';
import { sendMessageToChat, playTextToSpeech, initializeChat } from '../services/geminiService';

const STORAGE_KEY = 'lumiere_chat_history';

const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return [{
      id: '1',
      role: MessageRole.MODEL,
      text: "Bonjour ! Je suis ton professeur de français. Comment ça va aujourd'hui ?",
      translation: "你好！我是你的法语老师。今天过得怎么样？"
    }];
  });
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-save messages to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Re-initialize chat session context if we have history
  useEffect(() => {
    const initSession = async () => {
       // Convert UI messages to Gemini history format
       // Gemini expects: { role: 'user' | 'model', parts: [{ text: '...' }] }
       const historyForGemini = messages.map(msg => ({
         role: msg.role,
         parts: [{ text: msg.text }]
       }));

       await initializeChat(
         "你是一位乐于助人且耐心的法语语言导师，你的学生是中国人。请主要用简单的法语回复，如果概念复杂或用户要求翻译，可以使用中文解释。温和地纠正用户的语法错误。保持对话流畅。",
         historyForGemini
       );
    };
    initSession();
    // We only want to run this on mount to restore the session from localStorage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: inputText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToChat(inputText);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: responseText,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: "Désolé, j'ai eu un problème de connexion. Réessayons. (抱歉，连接出现问题，请重试。)",
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    try {
      await playTextToSpeech(text);
    } catch (err) {
      console.error("Failed to play audio", err);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('确定要清除聊天记录吗？')) {
      const initial = [{
        id: Date.now().toString(),
        role: MessageRole.MODEL,
        text: "Bonjour ! Recommençons. De quoi veux-tu parler ?",
        translation: "你好！我们重新开始。你想聊些什么？"
      }];
      setMessages(initial);
      initializeChat("你是一位乐于助人且耐心的法语语言导师，你的学生是中国人。请主要用简单的法语回复，如果概念复杂或用户要求翻译，可以使用中文解释。温和地纠正用户的语法错误。保持对话流畅。", []);
    }
  };

  return (
    // Use 'dvh' (dynamic viewport height) for mobile browsers to handle address bar resizing
    <div className="flex flex-col h-[calc(100dvh-140px)] md:h-[600px] max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-french-blue to-blue-600 p-4 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg">AI 导师</h2>
            <p className="text-xs text-blue-100 opacity-90">练习你的法语口语</p>
          </div>
        </div>
        <button 
          onClick={handleClearChat}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-blue-100 hover:text-white"
          title="清除聊天"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.role === MessageRole.USER
                  ? 'bg-french-blue text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
              }`}
            >
              <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              
              {msg.role === MessageRole.MODEL && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
                  <button 
                    onClick={() => handleSpeak(msg.text)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-french-blue"
                    aria-label="Listen"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  {msg.translation && (
                    <span className="text-xs text-gray-400 italic">{msg.translation}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex items-center gap-2">
              <div className="w-2 h-2 bg-french-blue rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-french-blue rounded-full animate-bounce [animation-delay:-.3s]" />
              <div className="w-2 h-2 bg-french-blue rounded-full animate-bounce [animation-delay:-.5s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-full border border-gray-200 focus-within:border-french-blue focus-within:ring-1 focus-within:ring-french-blue transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入你的消息..."
            className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-gray-800 placeholder-gray-400 text-base"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-french-blue text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;