import React, { useState, useMemo } from 'react';
import { Keyword, Material } from '../types';
import KeywordList from './TopicList';
import MaterialList from './MaterialList';
import { SearchIcon, XMarkIcon } from './icons';

interface KeywordModeProps {
  keywords: Keyword[];
  setKeywords: (keywords: Keyword[]) => void;
  selectedKeyword: Keyword | null;
  selectedKeywordId: string | null;
  onSelectKeyword: (id: string) => void;
  onAddKeyword: (name: string) => void;
  onDeleteKeyword: (id: string) => void;
  onAddMaterial: () => void;
  onEditMaterial: (material: Material) => void;
  onDeleteMaterial: (id: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const KeywordMode: React.FC<KeywordModeProps> = ({
  keywords,
  selectedKeyword,
  selectedKeywordId,
  onSelectKeyword,
  onAddKeyword,
  onDeleteKeyword,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredKeywords = useMemo(() => {
    if (!searchTerm) return keywords;
    return keywords
      .map(keyword => {
        const matchingMaterials = keyword.materials.filter(material =>
          material.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.author.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (keyword.name.toLowerCase().includes(searchTerm.toLowerCase()) || matchingMaterials.length > 0) {
          // If search term matches keyword name, show all its materials. Otherwise, show only matching materials.
          return { ...keyword, materials: keyword.name.toLowerCase().includes(searchTerm.toLowerCase()) ? keyword.materials : matchingMaterials };
        }
        return null;
      })
      .filter((keyword): keyword is Keyword => keyword !== null);
  }, [keywords, searchTerm]);

  const displayedKeyword = searchTerm ? filteredKeywords.find(k => k.id === selectedKeywordId) : selectedKeyword;

  return (
    <div className="flex flex-1 overflow-hidden">
      <div
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 w-4/5 max-w-sm h-full bg-gray-100 dark:bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out p-4 flex flex-col
                         lg:relative lg:w-1/3 lg:translate-x-0 lg:flex-shrink-0
                         ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-3 right-3 p-1 text-gray-500 dark:text-gray-400 lg:hidden"
          aria-label="메뉴 닫기"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder="키워드 또는 내용 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
        </div>
        <div className="flex-1 overflow-hidden">
          <KeywordList
              keywords={filteredKeywords}
              selectedKeywordId={selectedKeywordId}
              onSelectKeyword={onSelectKeyword}
              onAddKeyword={onAddKeyword}
              onDeleteKeyword={onDeleteKeyword}
          />
        </div>
      </aside>
      <main className="flex-1 p-4 overflow-y-auto">
        <MaterialList
          selectedKeyword={displayedKeyword || null}
          onAddMaterial={onAddMaterial}
          onEditMaterial={onEditMaterial}
          onDeleteMaterial={onDeleteMaterial}
        />
      </main>
    </div>
  );
};

export default KeywordMode;