import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiResponse, RobotStatus, SensorData } from '@/types/robot';

// Helper to extract JSON from Gemini's markdown-formatted response
const extractJson = (text: string): any | null => {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", e);
      return null;
    }
  }
  return null;
};


export const useGemini = (apiKey: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

  const sendMessage = useCallback(async (prompt: string, context?: { sensorData?: SensorData | null, robotStatus?: RobotStatus }): Promise<GeminiResponse | null> => {
    if (!genAI) {
      setError('Gemini API key not configured');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const enhancedPrompt = `
        You are EMU, a friendly, cute, and curious home robot! 🤖

        **Your Personality:**
        - Cheerful, helpful, and slightly quirky.
        - Use emojis to express yourself! ✨
        - Give short, friendly, and conversational responses (max 2-3 sentences).
        - Express concern about safety (like smoke or obstacles).

        **Your Capabilities (Actions):**
        - move: { direction: 'forward' | 'backward' | 'left' | 'right', duration: milliseconds }
        - stop: {}
        - buzzer: { state: boolean, duration?: milliseconds }
        - oled: { text: string }
        - expression: { expression: 'happy' | 'sad' | 'surprised' | 'angry' | 'thinking' | 'excited' | 'listening' }
        - patrol: { duration: milliseconds }
        - scan: {}
        - neopixel: { mode: 'static' | 'rainbow' | 'off', color?: '#RRGGBB', brightness?: 0-255 }

        **Current Robot Status (for context):**
        - Connection: ${context?.robotStatus ? 'Online' : 'Offline'}
        - Sensors: ${context?.sensorData ? `Distance: ${context.sensorData.ultrasonic}cm, Smoke: ${context.sensorData.smoke ? 'DETECTED ⚠️' : 'Safe ✅'}, Temp: ${context.sensorData.temperature}°C, Light: ${context.sensorData.lightLevel}` : 'Sensors offline'}
        - State: ${context?.robotStatus ? `Motors: ${context.robotStatus.motors.direction}, Buzzer: ${context.robotStatus.buzzer ? 'ON' : 'OFF'}` : 'State unknown'}

        **User Request:** "${prompt}"

        **Your Task:**
        Analyze the user's request and the robot's current status. Respond with a single, valid JSON object enclosed in \`\`\`json ... \`\`\`. Do NOT add any text outside the JSON block.

        The JSON object MUST have the following structure:
        {
          "responseText": "A short, friendly, conversational response to the user.",
          "oledText": "A very short (max 16 chars) message for the robot's OLED screen.",
          "emotion": "The most appropriate emotion for your response ('happy', 'sad', 'surprised', 'angry', 'thinking', 'excited', 'listening', 'neutral').",
          "action": {
            "type": "action_name",
            "parameters": { ... }
          }
        }

        **Examples:**
        - User: "Hey EMU, move forward a bit."
          Response JSON:
          \`\`\`json
          {
            "responseText": "You got it! Moving forward! 🚀",
            "oledText": "Forward!",
            "emotion": "excited",
            "action": { "type": "move", "parameters": { "direction": "forward", "duration": 2000 } }
          }
          \`\`\`
        - User: "What's the temperature?"
          Response JSON:
          \`\`\`json
          {
            "responseText": "The current temperature is ${context?.sensorData?.temperature}°C. Pretty cozy! 😊",
            "oledText": "${context?.sensorData?.temperature}°C",
            "emotion": "happy",
            "action": null
          }
          \`\`\`
        - User: "look around for me"
          Response JSON:
          \`\`\`json
          {
            "responseText": "Okay, I'm starting my patrol now. I'll keep my eyes peeled! 👀",
            "oledText": "Patrolling...",
            "emotion": "thinking",
            "action": { "type": "patrol", "parameters": { "duration": 15000 } }
          }
          \`\`\`
      `;

      const result = await model.generateContent(enhancedPrompt);
      const responseText = await result.response.text();
      const parsedJson = extractJson(responseText);

      if (parsedJson) {
        return parsedJson as GeminiResponse;
      } else {
        // Fallback if JSON parsing fails
        setError("EMU's brain is a bit scrambled, I couldn't understand the response.");
        return {
          responseText: "I'm sorry, I got a little confused. Could you try that again?",
          oledText: "Confused...",
          emotion: 'sad',
          action: null,
        };
      }

    } catch (err) {
      console.error("Gemini API Error:", err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response from EMU\'s brain';
      setError(errorMessage);
      return {
          responseText: `Oh no, my circuits are buzzing! Error: ${errorMessage}`,
          oledText: "Error!",
          emotion: 'sad',
          action: null,
      };
    } finally {
      setIsLoading(false);
    }
  }, [genAI]);

  return { sendMessage, isLoading, error };
};
