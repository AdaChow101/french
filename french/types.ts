export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  translation?: string;
  audioUrl?: string; // We will use this for TTS state
  isAudioLoading?: boolean;
}

export interface VocabularyItem {
  french: string;
  chinese: string;
  example: string;
  pronunciation_tip?: string;
}

export interface LessonContent {
  title: string;
  level: string;
  introduction: string;
  vocabulary: VocabularyItem[];
  grammar_point: {
    rule: string;
    example: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

export enum AppView {
  HOME = 'HOME',
  LESSON = 'LESSON',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE'
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
}

export interface UserStats {
  streak: number;
  wordsLearned: number;
  lastStudyDate: string;
  dailyChallengeCompleted: boolean;
  lastChallengeDate: string;
}