'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  AlertCircle, 
  Settings, 
  Search, 
  PieChart,
  Target,
  Shield,
  BookOpen,
  Home,
  Star,
  Globe,
  Zap,
  Bot
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Home },
    { id: 'search', label: '銘柄検索', icon: Search },
    { id: 'charts', label: '価格チャート', icon: BarChart3 },
    { id: 'technical', label: 'テクニカル分析', icon: Activity },
    { id: 'signals', label: 'シグナル', icon: Zap },
    { id: 'portfolio', label: 'ポートフォリオ', icon: PieChart },
    { id: 'watchlist', label: 'ウォッチリスト', icon: Star },
    { id: 'market', label: 'マーケット概況', icon: Globe },
    { id: 'ai-chat', label: 'AIアドバイザー', icon: Bot },
    { id: 'api-status', label: 'API状態', icon: Activity },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* ロゴエリア */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Stock Analyzer
            </h1>
            {/* <p className="text-sm text-gray-500 dark:text-gray-400">
              Advanced Trading
            </p> */}
          </div>
        </div>
      </div>

      {/* メニューアイテム */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeSection === item.id
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* フッター */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
            AI分析エンジン
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            リアルタイム稼働中
          </p>
          <div className="flex items-center mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
              オンライン
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};