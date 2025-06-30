'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageCircle, Sparkles, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AIChatProps {
  stockSymbol: string;
  analysisData?: {
    stockInfo?: object | null;
    technicalIndicators?: object | null;
    stockAnalysis?: object | null;
  };
}

export const AIChat: React.FC<AIChatProps> = ({ stockSymbol }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `こんにちは！${stockSymbol}の分析結果についてご質問はありますか？投資戦略、リスク分析、市場トレンドなど、何でもお聞きください。`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // サジェスト質問
  const suggestedQuestions = [
    `${stockSymbol}の最適な買い時はいつですか？`,
    'この銘柄のリスクは何ですか？',
    '長期投資に適していますか？',
    '競合他社と比較してどうですか？',
    '今の価格は割安ですか？',
    '利益確定のタイミングは？'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = (userQuestion: string): string => {
    // 実際の実装では、ここでバックエンドのAI APIを呼び出します
    const responses = {
      '買い時': `${stockSymbol}の現在のテクニカル指標を見ると、RSIが適正レンジにあり、MACDも上昇トレンドを示しています。ただし、市場全体の動向も考慮し、リスク管理を徹底することをお勧めします。`,
      'リスク': `主なリスクとしては、業界特有の規制変更、競合激化、マクロ経済の影響が挙げられます。特に${stockSymbol}の場合、ボラティリティが比較的高いため、ポジションサイズの調整が重要です。`,
      '長期投資': `${stockSymbol}は長期投資の観点から興味深い銘柄です。業績の成長性、市場でのポジション、財務の健全性を総合的に評価すると、中長期的な価値向上が期待できます。`,
      '競合': '競合他社と比較すると、${stockSymbol}は技術力と市場シェアの面で優位性を持っています。ただし、新興企業の台頭には注意が必要です。',
      '割安': '現在のPERやPBRから判断すると、${stockSymbol}は適正価格からやや割安の水準にあります。ただし、業績の先行指標も併せて検討することをお勧めします。',
      '利益確定': '利益確定は投資目標によりますが、テクニカル的には目標価格に近づいた際の段階的な利確をお勧めします。また、ストップロス設定も忘れずに。'
    };

    // キーワードマッチングで適切な回答を選択
    for (const [keyword, response] of Object.entries(responses)) {
      if (userQuestion.includes(keyword)) {
        return response;
      }
    }

    return `${stockSymbol}について詳しく分析させていただきます。現在の市場状況とテクニカル指標を考慮すると、慎重なアプローチをお勧めします。より具体的な質問をいただければ、詳細な回答をご提供できます。`;
  };

  const handleSendMessage = async (message: string = inputValue) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // AIの応答をシミュレート
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: simulateAIResponse(message),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isExpanded) {
    return (
      <Card className="fixed bottom-6 right-6 z-50 w-80 shadow-xl">
        <CardHeader className="pb-3">
          <Button
            onClick={() => setIsExpanded(true)}
            className="w-full justify-start space-x-2 h-auto p-4"
            variant="ghost"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">AI投資アドバイザー</h3>
                <p className="text-sm text-muted-foreground">
                  {stockSymbol}について質問する
                </p>
              </div>
            </div>
            <Badge className="ml-auto animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              質問受付中
            </Badge>
          </Button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 h-[500px] shadow-2xl flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">AI投資アドバイザー</h3>
              <p className="text-xs text-muted-foreground">
                {stockSymbol}専門アナリスト
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsExpanded(false)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </Button>
        </div>
      </CardHeader>

      {/* チャットメッセージエリア */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full flex flex-col">
          {/* メッセージ一覧 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-2",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.type === 'ai' && (
                  <div className="p-1 bg-blue-100 rounded-full flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.type === 'user'
                      ? "bg-blue-500 text-white"
                      : "bg-muted text-foreground"
                  )}
                >
                  {message.content}
                </div>
                
                {message.type === 'user' && (
                  <div className="p-1 bg-gray-100 rounded-full flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="p-1 bg-blue-100 rounded-full">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* サジェスト質問 */}
          {messages.length <= 1 && (
            <div className="p-4 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2 flex items-center">
                <Lightbulb className="h-3 w-3 mr-1" />
                よくある質問
              </p>
              <div className="space-y-1">
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    className="block w-full text-left text-xs p-2 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 入力エリア */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="質問を入力..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};