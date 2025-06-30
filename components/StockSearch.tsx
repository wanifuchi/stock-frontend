'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { stockAPI, StockSearchResult } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface StockSearchProps {
  onSelectStock: (symbol: string) => void;
}

export const StockSearch: React.FC<StockSearchProps> = ({ onSelectStock }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Geminiの提案：debounce機能でリアルタイム検索
  const debouncedQuery = useDebounce(query, 300);

  // リアルタイム検索のためのuseEffect
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      if (debouncedQuery.length < 2) return; // 最低2文字で検索

      setIsLoading(true);
      try {
        const data = await stockAPI.searchStocks(debouncedQuery);
        setResults(data.results);
        setShowDropdown(data.results.length > 0);
      } catch (error) {
        console.error('リアルタイム検索エラー:', error);
        setResults([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const data = await stockAPI.searchStocks(query);
      setResults(data.results);
      setShowDropdown(true);
    } catch (error) {
      console.error('検索エラー:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectStock = (symbol: string) => {
    onSelectStock(symbol);
    setShowDropdown(false);
    setQuery(symbol);
  };

  // 外部クリックでドロップダウンを閉じる
  const handleInputBlur = () => {
    // 少し遅延させてクリックイベントを先に処理
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative w-full">
      <div className="group relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder="銘柄コード、ETF、企業名を検索..."
          className={cn(
            "pl-12 h-12 text-base bg-background/50 border-border/50",
            "focus:bg-background focus:border-primary/50",
            "transition-all duration-200"
          )}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* エレガントな検索結果ドロップダウン */}
      {showDropdown && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 shadow-xl border-border/50">
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={result.symbol}
                  onClick={() => handleSelectStock(result.symbol)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors",
                    "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
                    index !== results.length - 1 && "border-b border-border/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm tracking-wide">
                          {result.symbol}
                        </span>
                        <Badge variant="outline" className="h-5 text-xs">
                          {result.exchange}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground truncate max-w-xs">
                        {result.name}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ローディング状態 */}
      {isLoading && (
        <Card className="absolute z-50 w-full mt-2 shadow-xl border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">検索中...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};