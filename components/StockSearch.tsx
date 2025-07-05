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
  className?: string;
  placeholder?: string;
}

export const StockSearch: React.FC<StockSearchProps> = ({ onSelectStock, className, placeholder = "銘柄コードまたは企業名を入力" }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Geminiの提案：debounce機能でリアルタイム検索
  const debouncedQuery = useDebounce(query, 300);

  // リアルタイム検索のためのuseEffect
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setShowDropdown(false);
        setHasSearched(false);
        setSelectedIndex(-1);
        return;
      }

      if (debouncedQuery.length < 2) return; // 最低2文字で検索

      setIsLoading(true);
      setHasSearched(false);
      try {
        console.log('検索実行:', debouncedQuery); // デバッグログ
        const data = await stockAPI.searchStocks(debouncedQuery);
        console.log('検索結果:', data); // デバッグログ
        setResults(data.results);
        setShowDropdown(true);
        setHasSearched(true);
        setSelectedIndex(-1); // リセット
      } catch (error) {
        console.error('リアルタイム検索エラー:', error);
        // エラー詳細をデバッグ出力
        if (error instanceof Error) {
          console.error('エラーメッセージ:', error.message);
        }
        setResults([]);
        setShowDropdown(false);
        setHasSearched(true);
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
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectStock(results[selectedIndex].symbol);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex(prev => prev < results.length - 1 ? prev + 1 : 0);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex(prev => prev > 0 ? prev - 1 : results.length - 1);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
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
    <div className={cn("relative w-full", className)}>
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
          placeholder={placeholder}
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
      {showDropdown && (
        <Card className="absolute z-50 w-full mt-2 shadow-xl border-border/50">
          <CardContent className="p-0">
            {results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <button
                    key={result.symbol}
                    onClick={() => handleSelectStock(result.symbol)}
                    className={cn(
                      "w-full px-4 py-3 text-left transition-colors",
                      "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
                      selectedIndex === index && "bg-primary/10",
                      index !== results.length - 1 && "border-b border-border/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm tracking-wide" style={{ color: 'hsl(var(--color-foreground))' }}>
                            {result.symbol}
                          </span>
                          <Badge variant="outline" className="h-5 text-xs">
                            {result.exchange}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground truncate max-w-xs" style={{ color: 'hsl(var(--color-muted-foreground))' }}>
                          {result.name}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              hasSearched && !isLoading && (
                <div className="px-4 py-6 text-center">
                  <div className="text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm" style={{ color: 'hsl(var(--color-muted-foreground))' }}>該当する銘柄が見つかりません</p>
                    <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-muted-foreground))' }}>別のキーワードで検索してください</p>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* ローディング状態 */}
      {isLoading && (
        <Card className="absolute z-50 w-full mt-2 shadow-xl border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground" style={{ color: 'hsl(var(--color-muted-foreground))' }}>検索中...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};