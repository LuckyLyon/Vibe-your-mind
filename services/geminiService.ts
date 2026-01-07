
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const refineIdeaWithAI = async (rawIdea: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Configuration Error: API Key missing.";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一个"Vibe Coding"社区的专家助手。
      用户有一个初步的想法："${rawIdea}"。
      请将其润色为一个结构清晰、激动人心的项目提案，适用于 Vibe Coding 社区。
      
      请严格使用 Markdown 格式返回，格式如下：
      # [项目标题]
      
      **电梯演讲**：[一句话介绍]
      
      **核心功能**：
      - [功能1]
      - [功能2]
      - [功能3]
      
      保持简洁，充满激情。直接返回 Markdown 内容，不要有其他开场白。`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    return response.text || "Could not generate idea refinement.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 正在喝咖啡，请稍后再试。";
  }
};

export const chatWithVibeBot = async (message: string): Promise<string> => {
    const client = getClient();
    if (!client) return "VibeBot 离线中 (API Key Missing)";
  
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你叫 VibeBot，是 Vibe Your Mind 社区的 AI 吉祥物。
        用户在群聊里对你说："${message}"。
        
        请用简短、风趣、带有极客风格（Cyberpunk/Vibe Coding）的语气回复。
        字数限制在 50 字以内。不要长篇大论。
        如果用户问技术问题，给出一个充满哲理或幽默的简短回答。`,
      });
      return response.text || "SYSTEM_ERROR: Vibe overloaded.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "我的连接被宇宙射线干扰了...";
    }
  };
