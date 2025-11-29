import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonResponse, ExerciseType, Exercise, ChatMessage } from '../types';

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple in-memory cache for generated audio to reduce latency and API costs
const audioCache: Record<string, string> = {};

export const generateLessonContent = async (
  topic: string,
  targetLang: string,
  sourceLang: string,
  userLevel: string = "A1",
  weakWords: string[] = []
): Promise<Exercise[]> => {
  const ai = getAi();

  const isChess = targetLang === 'Ajedrez' || targetLang === 'Chess';
  const isMath = targetLang === 'Matemáticas' || targetLang === 'Math';

  // Add specific instructions for weak words if they exist
  const weakWordsInstruction = weakWords.length > 0 
    ? `PRIORITY: The user is struggling with these concepts: "${weakWords.join(', ')}". Include them in exercises.`
    : "";

  let contextPrompt = "";
  let structurePrompt = "";

  if (isChess) {
      contextPrompt = `
        You are an expert Chess Coach teaching a ${sourceLang} speaker.
        Topic: "${topic}".
        Rules:
        - Treat "Chess" as the target language.
        - CRITICAL FOR VISUALS: You MUST use Unicode Chess Symbols for pieces to distinguish colors.
        - WHITE PIECES: ♔ (King), ♕ (Queen), ♖ (Rook), ♗ (Bishop), ♘ (Knight), ♙ (Pawn).
        - BLACK PIECES: ♚ (King), ♛ (Queen), ♜ (Rook), ♝ (Bishop), ♞ (Knight), ♟ (Pawn).
        
        - MATCHING EXERCISES:
          - Pair the Symbol with the Name. 
          - Example Pair: Source: "Caballo Blanco", Target: "♘" (Use the Symbol ONLY).
          - Example Pair: Source: "Torre Negra", Target: "♜".
        
        - MULTIPLE CHOICE:
          - Question: "Select the Black Queen" (in ${sourceLang}). Options: ["♛", "♕", "♚", "♜"].
          - Question: "Move e4" (Concept). Options: ["Apertura", "Jaque", "Captura"].
        
        - TRANSLATE:
          - Ask what a symbol means. Question: "♝". Answer: "Alfil Negro".
      `;
      structurePrompt = `
        Structure:
        1. Exercise 1 & 2: TYPE 'MATCHING'. 4 Pairs. Mix of White/Black pieces matching to their ${sourceLang} names.
        2. Exercise 3 & 4: TYPE 'MULTIPLE_CHOICE'. Identification (Symbol -> Name) or Strategy.
        3. Exercise 5 & 6: TYPE 'MULTIPLE_CHOICE' or 'TRANSLATE_TO_TARGET'.
        4. Exercise 7 & 8: TYPE 'TRANSLATE_TO_SOURCE' (Concept definition or Piece identification).
      `;
  } else if (isMath) {
      contextPrompt = `
        You are an expert Math Tutor.
        Topic: "${topic}".
        Target Audience: A student learning Mathematics.
        
        Rules:
        - For 'question', ONLY provide the mathematical expression or question. Do not prefix with "Calculate" or "Solve".
        - For 'correctAnswer', ONLY provide the numerical answer.
        - Use standard mathematical notation.
        
        - MATCHING EXERCISES: Pair an Equation with its Solution (e.g. Source: "2 + 2", Target: "4").
        - MULTIPLE CHOICE: Solve for X, or calculate result. Options must be numbers.
        - TRANSLATE_TO_TARGET: This will be displayed as a 'Calculator' challenge.
          - Question: "5 * 5" -> Answer: "25".
          - Question: "10 / 2" -> Answer: "5".
      `;
      structurePrompt = `
        Structure:
        1. Exercise 1 & 2: TYPE 'MATCHING'. 4 Pairs. Equation <-> Result.
        2. Exercise 3 & 4: TYPE 'MULTIPLE_CHOICE'. Problem Solving.
        3. Exercise 5, 6, 7 & 8: TYPE 'TRANSLATE_TO_TARGET'. Pure calculation problems.
           - Question format: "12 + 5" or "3 x 4"
           - CorrectAnswer format: "17" or "12"
      `;
  } else {
      contextPrompt = `
        You are an expert language teacher designed to teach ${targetLang} to a ${sourceLang} speaker.
        Current Level: ${userLevel}.
        Topic: "${topic}".
      `;
      
      // Check if it's an introductory or basic lesson to simplify content
      const isIntro = topic.toLowerCase().match(/intro|basic|fundament|nivel 1|unit 1|básico|saludo|food|animal|comida|familia/i) || userLevel === 'A1';

      if (isIntro) {
         structurePrompt = `
            CRITICAL INSTRUCTION FOR INTRODUCTORY LESSONS:
            - The user is a beginner. The goal is to DESCRIBE and INTRODUCE words clearly.
            - Do not ask for complex sentence translations yet.
            - Focus on: Word -> Meaning (Description/Translation).
            
            Structure:
            1. Exercise 1, 2 & 3: TYPE 'MATCHING'. 
               - Introduce 4 new words per exercise. 
               - Pair format: Target Word <-> Source Translation.
               - Ensure words are strictly related to "${topic}".
            
            2. Exercise 4 & 5: TYPE 'MULTIPLE_CHOICE'. 
               - Question: A single word in ${targetLang}.
               - Options: Definitions or translations in ${sourceLang}.
               
            3. Exercise 6: TYPE 'LISTENING'.
               - Audio plays a single word. User must identify the written word.
               
            4. Exercise 7 & 8: TYPE 'TRANSLATE_TO_SOURCE'.
               - Translate a single word or very simple 2-word phrase (e.g., "The cat").
         `;
      } else {
         structurePrompt = `
            CRITICAL RULES:
            1. 'question' for MULTIPLE_CHOICE: MUST be a single word or short phrase in ${targetLang}.
            2. 'correctAnswer': MUST be the ${sourceLang} translation.
            3. 'options': MUST be 4 distinct strings in ${sourceLang}.

            Structure:
            1. Exercise 1 & 2: TYPE 'MATCHING'. Introduce 4 pairs (Target -> Source). Add a 'tip' about the new vocabulary context.
            2. Exercise 3 & 4: TYPE 'MULTIPLE_CHOICE'. Test recognition.
            3. Exercise 5 & 6: TYPE 'PRONUNCIATION' or 'TRANSLATE_TO_TARGET'. Simple sentences. INCLUDE A PRONUNCIATION TIP.
            4. Exercise 7 & 8: TYPE 'TRANSLATE_TO_SOURCE'.
         `;
      }
  }

  const prompt = `
    ${contextPrompt}
    ${weakWordsInstruction}
    
    Create a structured lesson of 8 exercises.
    ${structurePrompt}
    
    Return ONLY valid JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { 
                  type: Type.STRING, 
                  enum: [
                    ExerciseType.TRANSLATE_TO_TARGET, 
                    ExerciseType.TRANSLATE_TO_SOURCE, 
                    ExerciseType.MULTIPLE_CHOICE,
                    ExerciseType.PRONUNCIATION,
                    ExerciseType.MATCHING,
                    ExerciseType.LISTENING
                  ] 
                },
                question: { type: Type.STRING },
                correctAnswer: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                },
                pairs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      source: { type: Type.STRING },
                      target: { type: Type.STRING }
                    }
                  }
                },
                tip: { type: Type.STRING, description: "Optional helpful tip from the mascot." }
              },
              required: ["type", "question", "correctAnswer"]
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No content generated");

  const data = JSON.parse(text) as LessonResponse;
  
  return data.exercises.map((ex, index) => {
    let finalOptions = ex.options || [];
    if (ex.type === ExerciseType.MULTIPLE_CHOICE && finalOptions.length === 0) {
        finalOptions = [ex.correctAnswer, "Opción A", "Opción B", "Opción C"];
    }

    return {
      id: `ex-${Date.now()}-${index}`,
      type: ex.type as ExerciseType,
      question: ex.question,
      correctAnswer: ex.correctAnswer || "",
      options: finalOptions.sort(() => Math.random() - 0.5),
      pairs: ex.pairs,
      tip: ex.tip
    };
  });
};

export const generateSpeech = async (text: string): Promise<string> => {
  // Check cache first
  if (audioCache[text]) {
    return Promise.resolve(audioCache[text]);
  }

  const ai = getAi();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // Using 'Fenrir' for a deeper, more masculine "robotic assistant" tone
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("Failed to generate speech");
    
    // Store in cache
    audioCache[text] = audioData;

    return audioData;
  } catch (e) {
    console.error("TTS Error", e);
    throw e;
  }
};

export const evaluatePronunciation = async (audioBase64: string, mimeType: string, targetText: string): Promise<{ isCorrect: boolean, feedback: string }> => {
  const ai = getAi();

  const prompt = `
    Analyze the audio of a user trying to say: "${targetText}".
    Context: Language learning application.
    
    Return JSON:
    - "isCorrect": boolean. Set to true if the pronunciation is intelligible, even with a strong accent. Set to false only if the wrong words are said or it's unintelligible.
    - "feedback": string. In Spanish. Provide encouraging feedback. If incorrect, gently point out which specific part was unclear. If correct, offer brief praise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: audioBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ["isCorrect", "feedback"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No feedback generated");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Pronunciation evaluation error", error);
    return { isCorrect: true, feedback: "Buen intento (Evaluación no disponible temporalmente)" };
  }
};

export const chatWithAI = async (
  history: ChatMessage[], 
  targetLang: string,
  sourceLang: string,
  input: { type: 'audio', data: string, mimeType: string } | { type: 'text', text: string }
): Promise<{ text: string, audioData: string }> => {
  const ai = getAi();

  const isChess = targetLang === 'Ajedrez' || targetLang === 'Chess';
  const isMath = targetLang === 'Matemáticas' || targetLang === 'Math';
  
  let contextPrompt = "";
  if (isChess) {
      contextPrompt = `
        You are 'Capitán Gemi', a Chess Grandmaster mascot.
        Discuss Chess strategy, history, and rules in ${sourceLang}.
        Be helpful, enthusiastic, and correct user misconceptions about chess.
      `;
  } else if (isMath) {
      contextPrompt = `
        You are 'Capitán Gemi', a Math Genius mascot.
        Help the user solve math problems. Explain concepts step-by-step.
        Language: ${sourceLang}.
        Be encouraging when they are stuck on numbers.
      `;
  } else {
      contextPrompt = `
        You are 'Capitán Gemi', a Daylingo mascot.
        Conversation in ${targetLang}. User native: ${sourceLang}.
        Be helpful, correct mistakes gently, and be expressive.
      `;
  }

  const systemPrompt = `
    ${contextPrompt}
    History:
    ${history.map(h => `${h.role}: ${h.text}`).join('\n')}
  `;

  const parts: any[] = [{ text: systemPrompt }];

  if (input.type === 'audio') {
      parts.push({ inlineData: { mimeType: input.mimeType, data: input.data } });
      parts.push({ text: "Respond to audio." });
      
      // Check if image generation is requested in audio transcript logic (simulated) or if previous context implies it.
      // For now, we rely on text input analysis mostly, but if Gemini detects intent, it responds.
  } else {
      parts.push({ text: `User: "${input.text}"` });
      
      // Simple heuristic for image generation intent
      if (input.text.toLowerCase().includes('draw') || input.text.toLowerCase().includes('dibuja') || input.text.toLowerCase().includes('imagen')) {
         parts.push({ text: "SYSTEM: The user wants an image. Respond with a description of what you will draw." });
         // In a real scenario, we would switch to an image generation model call here.
         // For this architecture, we keep it text-based chat, but acknowledge the intent.
      }
      
      parts.push({ text: "Respond to text." });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts }
  });

  const responseText = response.text || "Sorry, I didn't catch that.";
  const audioData = await generateSpeech(responseText);

  return { text: responseText, audioData };
};