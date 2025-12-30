
import { GoogleGenAI, Type } from "@google/genai";
import { Grade, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.OBJECT,
      properties: {
        coveredPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        summary: { type: Type.STRING }
      },
      required: ["coveredPoints", "missingPoints", "summary"]
    },
    exam: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        grade: { type: Type.STRING },
        totalPoints: { type: Type.NUMBER },
        sections: {
          type: Type.OBJECT,
          properties: {
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  content: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  points: { type: Type.NUMBER }
                }
              }
            },
            blanks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  content: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  points: { type: Type.NUMBER }
                }
              }
            },
            applications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  content: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  points: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    }
  },
  required: ["analysis", "exam"]
};

export async function analyzeAndGenerate(
  images: string[],
  grade: Grade
): Promise<AnalysisResult> {
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    你是一个精通中国教育大纲的专家。请执行以下任务：
    1. 识别并分析上传图片中的数学题目，提取其涵盖的知识点。
    2. 对比 **中国江苏苏教版 (JSJY) 数学大纲** 中关于 "${grade}" 的具体要求（请注意区分上学期或下学期），找出这些上传题目所遗漏的关键知识点。
    3. 整理一份详细的知识点覆盖与遗漏分析汇总。
    4. 参考上传题目的语言风格和难度，整理一套全新的适合 "${grade}" 学生的数学试卷。
    
    试卷结构要求（严格遵守）：
    - 5道选择题（每题4分，共20分）
    - 5道填空题（每题4分，共20分）
    - 6道应用题（每题10分，共60分）
    - 总分100分。
    
    生成要求：
    - 新试卷必须优先包含上述分析中发现的针对该学期的“遗漏知识点”。
    - 题目难度和知识点分布必须符合苏教版数学教材该学段的逻辑。
    - 确保所有题目都有详细的答案和解析。
    
    请以JSON格式返回结果。
  `;

  const parts = [
    { text: prompt },
    ...images.map(data => ({
      inlineData: {
        mimeType: 'image/jpeg',
        data
      }
    }))
  ];

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA as any,
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  return JSON.parse(response.text || '{}') as AnalysisResult;
}
