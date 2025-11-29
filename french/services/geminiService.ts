import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonContent, MessageRole } from "../types";

// Initialize Gemini Client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Audio Utilities ---

// Singleton AudioContext to prevent "Too many AudioContexts" error in browsers
let outputAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!outputAudioContext) {
    outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  if (outputAudioContext.state === 'suspended') {
    outputAudioContext.resume();
  }
  return outputAudioContext;
}

// Utility to decode audio data for TTS
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const playTextToSpeech = async (text: string): Promise<void> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }, // 'Puck' is a good neutral voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data returned");
    }

    const ctx = getAudioContext();
    
    const audioBuffer = await decodeAudioData(
      decodeBase64(base64Audio),
      ctx,
      24000,
      1,
    );

    const outputNode = ctx.createGain();
    outputNode.connect(ctx.destination);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputNode);
    source.start();

  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};


// --- Lesson Generation ---

export const generateLesson = async (topic: string): Promise<LessonContent> => {
  const prompt = `为一名法语初学者（母语为中文）创建一节关于"${topic}"的法语课。
  请返回严格有效的 JSON 格式。
  包含以下内容：
  1. 标题和等级（初学者/中级）。
  2. 一段中文简介，解释我们将学到什么。
  3. 5个词汇，包含法语单词、中文翻译、法语例句和中文发音提示。
  4. 一个与主题相关的关键语法点（用中文解释规则，并提供示例）。
  5. 2个测试理解能力的测验问题（问题可以是法语或混合语言）。`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          level: { type: Type.STRING },
          introduction: { type: Type.STRING },
          vocabulary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                french: { type: Type.STRING },
                chinese: { type: Type.STRING },
                example: { type: Type.STRING },
                pronunciation_tip: { type: Type.STRING }
              }
            }
          },
          grammar_point: {
            type: Type.OBJECT,
            properties: {
              rule: { type: Type.STRING },
              example: { type: Type.STRING }
            }
          },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    }
  });

  if (response.text) {
    // Robust parsing: sometimes models output markdown code blocks even with responseMimeType
    const cleanJson = response.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson) as LessonContent;
  }
  throw new Error("Failed to generate lesson content");
};

// --- Chat Service ---

// We keep a simple in-memory history management here for the session
let chatSession: any = null;

export const initializeChat = async (systemInstruction: string, history: any[] = []) => {
  chatSession = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    },
    history: history
  });
};

export const sendMessageToChat = async (message: string): Promise<string> => {
  if (!chatSession) {
    // Fallback if not initialized (though UI should handle init)
    await initializeChat("你是一位乐于助人且耐心的法语语言导师，你的学生是中国人。");
  }

  const result = await chatSession.sendMessage({
    message: message
  });

  return result.text || "我没听懂，抱歉。";
};