'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { stockAPI, StockSearchResult } from '@/lib/api';

interface StockSearchProps {
  onSelectStock: (symbol: string) => void;
}

export const StockSearch: React.FC<StockSearchProps> = ({ onSelectStock }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="銘柄コードまたは企業名を入力"
            className="w-full px-4 py-3 pr-12 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* 検索結果ドロップダウン */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          {results.map((result) => (
            <button
              key={result.symbol}
              onClick={() => handleSelectStock(result.symbol)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{result.symbol}</span>
                  <span className="text-gray-500 ml-2">{result.name}</span>
                </div>
                <span className="text-sm text-gray-400">{result.exchange}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ローディング表示 */}
      {isLoading && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-center text-gray-500">検索中...</div>
        </div>
      )}
    </div>
  );
};