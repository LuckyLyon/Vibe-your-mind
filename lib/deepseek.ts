const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

if (!DEEPSEEK_API_KEY) {
  console.warn('⚠️ DEEPSEEK_API_KEY not found. AI features will be disabled.');
}

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function callDeepSeek(messages: DeepSeekMessage[]): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    return 'AI 服务未配置,请联系管理员。';
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data: DeepSeekResponse = await response.json();
    return data.choices[0]?.message?.content || 'AI 无法生成回复。';
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    return 'AI 服务暂时不可用,请稍后再试。';
  }
}

export const refineIdeaWithAI = async (rawIdea: string): Promise<string> => {
  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: '你是一个"Vibe Coding"社区的专家助手。请将用户的初步想法润色为结构清晰、激动人心的项目提案。'
    },
    {
      role: 'user',
      content: `用户的想法: "${rawIdea}"\n\n请严格使用 Markdown 格式返回，格式如下:\n\n# [项目标题]\n\n**电梯演讲**: [一句话介绍]\n\n**核心功能**:\n- [功能1]\n- [功能2]\n- [功能3]\n\n保持简洁，充满激情。直接返回 Markdown 内容，不要有其他开场白。`
    }
  ];

  return callDeepSeek(messages);
};

export const chatWithVibeBot = async (message: string): Promise<string> => {
  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: '你叫 VibeBot，是 Vibe Your Mind 社区的 AI 吉祥物。请用简短、风趣、带有极客风格(Cyberpunk/Vibe Coding)的语气回复。字数限制在 50 字以内。不要长篇大论。'
    },
    {
      role: 'user',
      content: message
    }
  ];

  return callDeepSeek(messages);
};
