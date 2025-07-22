import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useRobot } from '@/context/RobotContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const AIChat: React.FC = () => {
  const { 
    gemini, 
    voiceCommand, 
    clearVoiceCommand, 
    sendMessage: sendWsMessage, 
    setRobotExpression,
    addLog
  } = useRobot();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m EMU. Say "Hey EMU" to wake me up, then give a command!',
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message?: string) => {
    const textToSend = message || inputValue;
    if (!textToSend.trim() || gemini.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setRobotExpression('thinking');
    addLog(`User asked: "${textToSend}"`);

    const response = await gemini.sendMessage(textToSend);
    
    if (response) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.responseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      
      if (response.emotion) {
        setRobotExpression(response.emotion);
      }
      
      if (response.oledText) {
        sendWsMessage({ type: 'command', data: { action: 'oled', text: response.oledText } });
      }

      if (response.action) {
        sendWsMessage({ type: 'command', data: { ...response.action.parameters, action: response.action.type } });
        addLog(`AI action: ${response.action.type}`);
      }
    } else if (gemini.error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I'm having trouble thinking: ${gemini.error}`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setRobotExpression('sad');
      addLog(`AI Error: ${gemini.error}`);
    }
  };

  useEffect(() => {
    if (voiceCommand) {
      handleSend(voiceCommand);
      clearVoiceCommand();
    }
  }, [voiceCommand, clearVoiceCommand]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-full bg-slate-900/50 neon-border flex flex-col">
      <div className="p-4 border-b border-blue-500/30">
        <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
          <Bot className="w-5 h-5" />EMU Assistant
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`rounded-lg p-3 ${message.sender === 'user' ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30' : 'bg-purple-600/20 text-purple-100 border border-purple-500/30'}`}>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {gemini.isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center"><Bot className="w-4 h-4" /></div>
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-purple-200">EMU is thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-blue-500/30">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Chat with EMU..."
            className="flex-1 bg-slate-800/50 border-blue-500/30 text-white placeholder-slate-400"
            disabled={gemini.isLoading}
          />
          <Button onClick={() => handleSend()} disabled={!inputValue.trim() || gemini.isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {gemini.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
};
