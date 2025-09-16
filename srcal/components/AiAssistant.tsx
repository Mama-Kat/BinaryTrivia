import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";

interface AiAssistantProps {
  onClose: () => void;
  ai: GoogleGenAI;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const quickQuestions = [
    'What is the quadratic formula?',
    'Solve 2x + 5 = 15 for x.',
    'Explain the Pythagorean theorem.',
    'How do I calculate the area of a circle?',
];

const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <p className="whitespace-pre-wrap">
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </p>
    );
};

export const AiAssistant: React.FC<AiAssistantProps> = ({ onClose, ai }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chatSession = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: "You are a helpful and friendly math assistant. Your goal is to help users understand mathematical concepts. When asked to solve a problem, provide a clear, step-by-step explanation. Format your answers clearly, using markdown for things like code blocks for equations or lists for steps. Use **text** for bolding."
            },
        });
        setChat(chatSession);
        setMessages([{ role: 'model', text: 'Hello! How can I help you with math today?' }]);
    }, [ai]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading || !chat) return;

        const userMessage: Message = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const stream = await chat.sendMessageStream({ message: messageText });
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                const chunkText = chunk.text.replace(/\$/g, ''); // Remove '$' symbols
                modelResponse += chunkText;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Gemini API error in chat:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(userInput);
        setUserInput('');
    };

    const handleQuickQuestionClick = (question: string) => {
        sendMessage(question);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 font-mono">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 w-full max-w-2xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Math Assistant</h2>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-900 dark:hover:text-white">&times;</button>
                </div>
                <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-lg px-4 py-2 rounded-lg shadow ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                                <SimpleMarkdown text={msg.text} />
                            </div>
                        </div>
                    ))}
                     {isLoading && messages[messages.length - 1].role === 'user' && (
                        <div className="flex justify-start">
                             <div className="max-w-lg px-4 py-2 rounded-lg shadow bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
                                <span className="animate-pulse">...</span>
                             </div>
                        </div>
                    )}
                </div>
                
                {messages.length === 1 && !isLoading && (
                    <div className="flex flex-wrap gap-2 p-2 justify-center flex-shrink-0 my-2">
                        {quickQuestions.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickQuestionClick(q)}
                                className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="mt-auto flex-shrink-0 pt-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask a math question..."
                            disabled={isLoading}
                            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 border-2 border-transparent focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !userInput.trim()}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-5 rounded-lg transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                           Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};