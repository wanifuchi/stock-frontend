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
  
  // 銘柄が変更されたらチャットをリセット
  useEffect(() => {
    setMessages([
      {
        id: Date.now().toString(),
        type: 'ai',
        content: `こんにちは！${stockSymbol}の分析結果についてご質問はありますか？投資戦略、リスク分析、市場トレンドなど、何でもお聞きください。`,
        timestamp: new Date()
      }
    ]);
    setInputValue('');
    setIsLoading(false);
  }, [stockSymbol]);

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

  const simulateAIResponse = async (userQuestion: string): Promise<string> => {
    try {
      // バックエンドから最新の分析データを取得
      const [stockResponse, analysisResponse, indicatorsResponse] = await Promise.all([
        fetch(`/api/stocks/${stockSymbol}`).catch(() => null),
        fetch(`/api/stocks/${stockSymbol}/analysis`).catch(() => null),
        fetch(`/api/stocks/${stockSymbol}/indicators`).catch(() => null)
      ]);

      const stockData = stockResponse?.ok ? await stockResponse.json() : null;
      const analysisData = analysisResponse?.ok ? await analysisResponse.json() : null;
      const indicatorsData = indicatorsResponse?.ok ? await indicatorsResponse.json() : null;

      // 分析データに基づいて文脈に適した回答を生成
      const generateContextualResponse = (keyword: string): string => {
        const currentPrice = stockData?.current_price || 0;
        const changePercent = stockData?.change_percent || 0;
        const recommendation = analysisData?.analysis?.recommendation || 'HOLD';
        const confidence = analysisData?.analysis?.confidence || 0.5;
        const reasoning = analysisData?.analysis?.reasoning || [];
        const rsi = indicatorsData?.rsi || 50;

        switch (keyword) {
          case '買い時':
            if (recommendation === 'BUY') {
              return `${stockSymbol}の分析結果では、現在「買い推奨」となっています（信頼度${Math.round(confidence * 100)}%）。${reasoning.slice(0, 2).join('、')}。RSI値${rsi}とMACDの状況も買いシグナルを支持しています。ただし、リスク管理として適切なポジションサイズで投資することをお勧めします。`;
            } else if (recommendation === 'SELL') {
              return `現在の分析では${stockSymbol}は「売り推奨」となっており、買い時ではないかもしれません。${reasoning[0]}。市場環境が改善するまで様子見をお勧めします。`;
            } else {
              return `${stockSymbol}は現在「様子見」となっています。${reasoning[0]}。明確な買いシグナルが出るまで待機することをお勧めします。`;
            }

          case 'リスク':
            const volatilityRisk = changePercent > 3 || changePercent < -3 ? 'ボラティリティが高く、短期的な価格変動リスクがあります。' : '';
            return `${stockSymbol}の主なリスクとして、${reasoning.filter((r: string) => r.includes('リスク') || r.includes('不確実')).join('、')}が挙げられます。${volatilityRisk} 現在の価格変動率は${changePercent.toFixed(2)}%で、適切なストップロス設定が重要です。`;

          case '長期投資':
            if (confidence > 0.7) {
              return `${stockSymbol}は長期投資に適した銘柄と考えられます。分析信頼度が${Math.round(confidence * 100)}%と高く、${reasoning.find((r: string) => r.includes('期待') || r.includes('成長')) || '基本的なファンダメンタルズが良好'}です。ただし、定期的な見直しをお勧めします。`;
            } else {
              return `${stockSymbol}の長期投資については慎重な検討が必要です。現在の分析では不確定要素が多く、より明確なトレンドが確立されるまで待つことをお勧めします。`;
            }

          case '競合':
            return `${stockSymbol}の競合分析では、現在の市場ポジションと${reasoning.find((r: string) => r.includes('センチメント') || r.includes('動向')) || 'テクニカル指標の状況'}を考慮する必要があります。業界全体の動向と併せて評価することが重要です。`;

          case '割安':
            if (recommendation === 'BUY' && changePercent < 0) {
              return `現在の分析では${stockSymbol}は割安水準にある可能性があります。価格が${changePercent.toFixed(2)}%下落している中で買い推奨が出ており、${reasoning[0]}。ただし、さらなる下落リスクも考慮してください。`;
            } else if (changePercent > 5) {
              return `${stockSymbol}は最近${changePercent.toFixed(2)}%上昇しており、割安とは言えない水準かもしれません。現在の価格が適正かどうか慎重に判断する必要があります。`;
            } else {
              return `${stockSymbol}の現在価格$${currentPrice}は、テクニカル分析の観点から適正レンジにあると考えられます。${reasoning[0]}`;
            }

          case '利益確定':
            const targetPrice = analysisData?.analysis?.target_price;
            if (targetPrice && recommendation === 'BUY') {
              return `${stockSymbol}の目標価格は$${targetPrice}に設定されています。現在価格$${currentPrice}から${Math.round((targetPrice - currentPrice) / currentPrice * 100)}%の上昇余地があります。段階的な利益確定戦略をお勧めします。`;
            } else {
              return `現在の市況では${stockSymbol}の明確な利益確定タイミングは示されていません。${reasoning[0]}。リスク管理を優先してください。`;
            }

          default:
            return `${stockSymbol}の現在の状況：価格$${currentPrice}（${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%）、推奨${recommendation}、信頼度${Math.round(confidence * 100)}%。${reasoning[0]}`;
        }
      };

      // キーワードマッチングで適切な回答を選択
      const keywords = ['買い時', 'リスク', '長期投資', '競合', '割安', '利益確定'];
      for (const keyword of keywords) {
        if (userQuestion.includes(keyword)) {
          return generateContextualResponse(keyword);
        }
      }

      // PBRに関する特別な対応
      if (userQuestion.includes('PBR') || userQuestion.includes('価格純資産倍率')) {
        return `${stockSymbol}のPBR分析について、現在の株価$${stockData?.current_price || 'N/A'}とテクニカル指標から判断すると、${analysisData?.analysis?.reasoning?.[0] || 'バリュエーションの詳細分析が必要'}です。PBRが割安水準にある場合は投資機会となりますが、業績動向も併せて検討することが重要です。`;
      }

      // デフォルト回答
      return `${stockSymbol}について分析いたします。現在価格$${stockData?.current_price || 'N/A'}、推奨${analysisData?.analysis?.recommendation || 'N/A'}。${analysisData?.analysis?.reasoning?.[0] || '詳細な分析を実施中です。'}より具体的な質問をいただければ、詳細な回答をご提供できます。`;

    } catch (error) {
      console.error('AI response generation error:', error);
      return `申し訳ございません。${stockSymbol}の最新データの取得に問題が発生しました。しばらく時間をおいてから再度お試しください。`;
    }
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

    try {
      // AIの応答を非同期で取得
      const aiResponse = await simulateAIResponse(message);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `申し訳ございません。回答の生成中にエラーが発生しました。再度お試しください。`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isExpanded) {
    return (
      <Card className="fixed bottom-6 right-6 z-50 w-80 shadow-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3 bg-white dark:bg-gray-900">
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
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI投資アドバイザー</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
    <Card className="fixed bottom-6 right-6 z-50 w-96 h-[500px] shadow-2xl flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI投資アドバイザー</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
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
      <CardContent className="flex-1 overflow-hidden p-0 bg-gray-50 dark:bg-gray-900">
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
          {/* メッセージ一覧 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
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
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 shadow-sm"
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
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 shadow-sm">
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
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                <Lightbulb className="h-3 w-3 mr-1" />
                よくある質問
              </p>
              <div className="space-y-1">
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    className="block w-full text-left text-xs p-2 rounded hover:bg-white dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 入力エリア */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
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