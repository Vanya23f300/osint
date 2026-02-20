'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DefaultChatTransport } from 'ai';

export default function AITestPage() {
  const [input, setInput] = useState('');
  
  const { messages, sendMessage, error, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
    }),
  });

  const isLoading = status === 'streaming';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: input }],
    });
    setInput('');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>AI SDK Test</CardTitle>
            <CardDescription>
              Test the AI SDK integration with OpenAI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Messages Display */}
            <ScrollArea className="h-[400px] w-full border rounded-lg p-4 mb-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No messages yet. Try sending a message!</p>
                  <p className="text-sm mt-2">Example: "What is OSINT?"</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </p>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.parts.map((part, index) => {
                        if (part.type === 'text') {
                          return <span key={index}>{part.text}</span>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="text-left mb-4">
                  <div className="inline-block bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
                    <p className="text-xs font-semibold mb-1">AI Assistant</p>
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Error Display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-4">
                <p className="font-semibold">Error:</p>
                <p className="text-sm">{error.message}</p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Check your OpenAI API key in .env.local
                </p>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </form>

            {/* Instructions */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-2">Test Instructions:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Try asking: "What is OSINT?"</li>
                <li>Try asking: "How should I investigate a suspicious domain?"</li>
                <li>Check if responses stream in real-time</li>
                <li>Verify the AI understands OSINT context</li>
              </ul>
              
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Make sure your OpenAI API key is set in .env.local
                </p>
                <code className="text-xs bg-background px-2 py-1 rounded mt-1 block">
                  OPENAI_API_KEY=sk-your-key-here
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
