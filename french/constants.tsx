import React from 'react';
import { Topic } from './types';
import { BookOpen, MessageCircle, User, Award, Coffee, Plane, Heart, Home, ShoppingBag, Briefcase } from 'lucide-react';

export const TOPICS: Topic[] = [
  { id: 'greetings', title: '问候语', description: '你好，再见和基础表达', emoji: '👋', color: 'bg-blue-100 text-blue-600' },
  { id: 'cafe', title: '在咖啡馆', description: '点餐和饮料', emoji: '🥐', color: 'bg-orange-100 text-orange-600' },
  { id: 'travel', title: '旅行', description: '问路和车票', emoji: '🚆', color: 'bg-green-100 text-green-600' },
  { id: 'shopping', title: '购物', description: '服装和价格', emoji: '🛍️', color: 'bg-purple-100 text-purple-600' },
  { id: 'family', title: '家庭', description: '谈论家人和亲戚', emoji: '👨‍👩‍👧', color: 'bg-pink-100 text-pink-600' },
  { id: 'work', title: '工作', description: '职业和办公室', emoji: '💼', color: 'bg-slate-100 text-slate-600' },
];

export const ICONS = {
  Learn: <BookOpen className="w-6 h-6" />,
  Chat: <MessageCircle className="w-6 h-6" />,
  Profile: <User className="w-6 h-6" />,
  Award: <Award className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Plane: <Plane className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Shopping: <ShoppingBag className="w-5 h-5" />,
  Work: <Briefcase className="w-5 h-5" />
};

export const DAILY_QUOTES = [
  { french: "Petit à petit, l'oiseau fait son nid.", chinese: "积少成多 (小鸟一点点筑巢)。" },
  { french: "C'est la vie.", chinese: "这就是生活。" },
  { french: "Vouloir, c'est pouvoir.", chinese: "有志者事竟成。" },
  { french: "La vie est belle.", chinese: "生活是美好的。" },
  { french: "Après la pluie, le beau temps.", chinese: "雨过天晴。" },
  { french: "Mieux vaut tard que jamais.", chinese: "迟做总比不做好。" },
  { french: "L'habit ne fait pas le moine.", chinese: "人不可貌相。" },
  { french: "Qui vivra verra.", chinese: "日久见人心 (走着瞧)。" }
];