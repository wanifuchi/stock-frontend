'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearch: (query: string) => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  notifications?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  onToggleTheme, 
  isDarkMode, 
  notifications = 0 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // クライアントサイドでのみ時刻を更新
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('ja-JP'));
    };
    
    updateTime(); // 初期設定
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* 左側: モバイルメニューボタン & 検索 */}
        <div className="flex items-center space-x-4 flex-1">
          {/* モバイルメニューボタン */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* 検索バー */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="銘柄を検索 (例: AAPL, NVDA, TSLA)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "pl-10 transition-all duration-200",
                  isSearchFocused ? "ring-2 ring-blue-500" : ""
                )}
              />
            </div>
          </form>
        </div>

        {/* 右側: 通知、テーマ切り替え、ユーザー */}
        <div className="flex items-center space-x-3">
          {/* 市場ステータス */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              市場開放中
            </span>
          </div>

          {/* 通知 */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notifications > 9 ? '9+' : notifications}
              </Badge>
            )}
          </Button>

          {/* テーマ切り替え */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleTheme}
            className="hidden sm:flex"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {/* ユーザープロフィール */}
          {/* <Button variant="ghost" size="sm" className="hidden sm:flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                トレーダー
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                プロアカウント
              </p>
            </div>
          </Button> */}
        </div>
      </div>

      {/* セカンダリヘッダー（ブレッドクラムや追加情報用） */}
      <div className="px-6 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <span>最終更新: {currentTime || '--:--:--'}</span>
            <span>•</span>
            <span>データソース: リアルタイム</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 市場指標 */}
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <span className="text-gray-500 dark:text-gray-400">S&P 500:</span>
                <span className="font-medium text-green-600 dark:text-green-400">+0.45%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-500 dark:text-gray-400">NASDAQ:</span>
                <span className="font-medium text-green-600 dark:text-green-400">+0.78%</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-500 dark:text-gray-400">DOW:</span>
                <span className="font-medium text-red-600 dark:text-red-400">-0.12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};