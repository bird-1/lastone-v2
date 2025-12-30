
import { GoogleGenAI, Type } from "@google/genai";
import { Grade, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.OBJECT,
      properties: {
        coveredPoints: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "从上传PDF中识别出的已练习知识点"
        },
        missingPoints: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "对比苏教版大纲后发现该学生该学期尚未覆盖或需要强化的核心知识点"
        },
        summary: { 
          type: Type.STRING,
          description: "对学生当前掌握情况的专业评价与学习建议"
        }
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
  // We use gemini-3-pro-preview for high-accuracy syllabus matching
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    你是一个深耕江苏教育的数学特级教师，对 **中国江苏苏教版 (JSJY) 数学大纲** 有极其深刻的理解。
    
    请根据上传的题目图片（可能来自多个PDF）执行以下任务：
    
    1. **知识点透视**：识别图中所有数学题目，归纳它们在苏教版大纲中对应的具体知识点。
    2. **大纲比对分析**：
       - 参考苏教版数学大纲中关于 "${grade}" 的官方要求。
       - 对比上传题目所涵盖的内容。
       - 找出该学生在 "${grade}" 这一特定学期中，根据大纲要求目前表现出“遗漏”或“练习不足”的核心知识模块。
    3. **生成查缺补漏卷**：
       - 基于发现的“遗漏知识点”，设计一套全新的 "${grade}" 提优试卷。
       - 试卷结构：5道选择题(20分)、5道填空题(20分)、6道应用题(60分)。
       - 题目风格必须贴近江苏省（如南京、苏州、无锡等市）的期末真题难度。
       - 确保包含详尽的解析，引导学生理解苏教版的典型解题思路。
    
    输出必须为严格的JSON格式。
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

  if (!response.text) throw new Error("AI未能生成有效反馈");
  return JSON.parse(response.text) as AnalysisResult;
}
