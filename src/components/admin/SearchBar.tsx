'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient, { unwrapResponse } from '@/services/axiosClient';
import type { Product } from '@/types/product.types';

// Trie Node representation
class TrieNode {
  children: { [key: string]: TrieNode } = {};
  isWord = false;
  productId?: number;
  productName?: string;
  category?: string;
}

// Trie data structure
class ProductTrie {
  root: TrieNode = new TrieNode();

  insert(name: string, id: number, category: string) {
    let current = this.root;
    const chars = name.toLowerCase();
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }
    current.isWord = true;
    current.productId = id;
    current.productName = name;
    current.category = category;
  }

  getSuggestions(prefix: string): Array<{ id: number; name: string; category: string }> {
    let current = this.root;
    const chars = prefix.toLowerCase();
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (!current.children[char]) {
        return [];
      }
      current = current.children[char];
    }

    const suggestions: Array<{ id: number; name: string; category: string }> = [];
    const queue: TrieNode[] = [current];

    while (queue.length > 0 && suggestions.length < 6) {
      const node = queue.shift()!;
      if (node.isWord && node.productId && node.productName && node.category) {
        suggestions.push({
          id: node.productId,
          name: node.productName,
          category: node.category,
        });
      }
      for (const char in node.children) {
        queue.push(node.children[char]);
      }
    }

    return suggestions;
  }
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: number; name: string; category: string }>>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trieRef = useRef<ProductTrie | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Trie and fetch data
  useEffect(() => {
    trieRef.current = new ProductTrie();

    // Fetch products to build the local index
    axiosClient.get('/products')
      .then((res) => {
        const products = unwrapResponse<Product[]>(res.data);
        const categoriesSet = new Set<string>();
        products.forEach((p) => {
          trieRef.current?.insert(p.name, p.id, p.category || 'Uncategorized');
          if (p.category) categoriesSet.add(p.category);
        });
        setCategories(Array.from(categoriesSet).slice(0, 3));
      })
      .catch((err) => console.error('Failed to index products for Trie:', err));

    // Load recent searches from localStorage
    const saved = localStorage.getItem('admin_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions on query change
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    if (trieRef.current) {
      const sugs = trieRef.current.getSuggestions(query.trim());
      setSuggestions(sugs);
    }
    setActiveIndex(-1);
  }, [query]);

  const saveSearch = (searchTerm: string) => {
    const nextHistory = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(nextHistory);
    localStorage.setItem('admin_recent_searches', JSON.stringify(nextHistory));
  };

  const handleSelectProduct = (productId: number, productName: string) => {
    saveSearch(productName);
    setQuery('');
    setIsOpen(false);
    router.push(`/admin/products?id=${productId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const itemsCount = suggestions.length + categories.length + recentSearches.length;
    if (itemsCount === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 >= itemsCount ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 < 0 ? itemsCount - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex === -1) {
        if (query.trim()) {
          saveSearch(query.trim());
          router.push(`/admin/products?search=${encodeURIComponent(query.trim())}`);
          setIsOpen(false);
        }
      } else {
        // Trigger action based on index
        let count = 0;
        
        // Check suggestions
        if (activeIndex < suggestions.length) {
          const item = suggestions[activeIndex];
          handleSelectProduct(item.id, item.name);
          return;
        }
        count += suggestions.length;

        // Check recent searches
        if (activeIndex < count + recentSearches.length) {
          const idx = activeIndex - count;
          const val = recentSearches[idx];
          saveSearch(val);
          setQuery(val);
          router.push(`/admin/products?search=${encodeURIComponent(val)}`);
          setIsOpen(false);
          return;
        }
        count += recentSearches.length;

        // Check categories
        if (activeIndex < count + categories.length) {
          const idx = activeIndex - count;
          const cat = categories[idx];
          saveSearch(cat);
          router.push(`/admin/products?category=${encodeURIComponent(cat)}`);
          setIsOpen(false);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md font-sans">
      <div className="relative">
        <input
          type="text"
          placeholder="Search products, orders, categories..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-slate-200/80 bg-[#fbfbfb] py-1.5 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-0 transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && (suggestions.length > 0 || recentSearches.length > 0 || categories.length > 0) && (
        <div className="absolute left-0 mt-1.5 w-full rounded-xl border border-slate-200/80 bg-white py-2 shadow-lg z-50 overflow-hidden text-xs">
          
          {/* Instant Product Suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-2">
              <span className="block px-3 py-1 font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
                Matching Products
              </span>
              <div className="mt-1 divide-y divide-slate-50">
                {suggestions.map((item, idx) => {
                  const isHighlighted = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectProduct(item.id, item.name)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                        isHighlighted ? 'bg-slate-50 font-semibold text-slate-950' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="line-clamp-1">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-2 border-t border-slate-50 pt-2">
              <span className="block px-3 py-1 font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
                Recent Searches
              </span>
              <div className="mt-1">
                {recentSearches.map((search, idx) => {
                  const actualIndex = suggestions.length + idx;
                  const isHighlighted = actualIndex === activeIndex;
                  return (
                    <button
                      key={search}
                      onClick={() => {
                        saveSearch(search);
                        router.push(`/admin/products?search=${encodeURIComponent(search)}`);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center gap-2 transition-colors ${
                        isHighlighted ? 'bg-slate-50 font-semibold text-slate-950' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{search}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Categories */}
          {categories.length > 0 && (
            <div className="border-t border-slate-50 pt-2">
              <span className="block px-3 py-1 font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
                Browse Categories
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5 px-3 py-1.5">
                {categories.map((cat, idx) => {
                  const actualIndex = suggestions.length + recentSearches.length + idx;
                  const isHighlighted = actualIndex === activeIndex;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        saveSearch(cat);
                        router.push(`/admin/products?category=${encodeURIComponent(cat)}`);
                        setIsOpen(false);
                      }}
                      className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all ${
                        isHighlighted
                          ? 'border-slate-900 bg-slate-900 text-white font-bold'
                          : 'border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
