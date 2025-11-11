import React, { useState } from 'react';
import { Keyword } from '../types';
import { PlusIcon, TrashIcon } from './icons';
import { useI18n } from '../i18n';

interface KeywordListProps {
  newKeywords: Keyword[];
  oldKeywords: Keyword[];
  selectedKeywordId: string | null;
  onSelectKeyword: (id: string) => void;
  onAddKeyword: (name: string) => void;
  onDeleteKeyword: (id: string) => void;
}

const KeywordList: React.FC<KeywordListProps> = ({ newKeywords, oldKeywords, selectedKeywordId, onSelectKeyword, onAddKeyword, onDeleteKeyword }) => {
  const { t } = useI18n();
  const [newKeywordName, setNewKeywordName] = useState('');

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeywordName.trim()) {
      onAddKeyword(newKeywordName.trim());
      setNewKeywordName('');
    }
  };

  const renderKeywordItem = (keyword: Keyword) => (
    <li key={keyword.id} className="group">
        <button
        onClick={() => onSelectKeyword(keyword.id)}
        className={`w-full text-left px-4 py-2 rounded-md transition-colors text-sm font-medium flex justify-between items-center ${
            selectedKeywordId === keyword.id
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        >
        <span className="truncate">{keyword.name}</span>
         <span
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(t('keywordMode.deleteConfirm', { name: keyword.name }))) {
                onDeleteKeyword(keyword.id);
              }
            }}
            className="ml-2 text-gray-400 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <TrashIcon className="w-4 h-4" />
          </span>
        </button>
    </li>
  );

  return (
    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{t('keywordMode.sidebarTitle')}</h2>
      <form onSubmit={handleAddKeyword} className="flex mb-4">
        <input
          type="text"
          value={newKeywordName}
          onChange={(e) => setNewKeywordName(e.target.value)}
          placeholder={t('keywordMode.newKeywordPlaceholder')}
          className="flex-grow min-w-0 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm text-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          disabled={!newKeywordName.trim()}
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </form>
      <nav className="flex-grow overflow-y-auto pr-2 -mr-2">
        <ul className="space-y-2">
          {newKeywords.length > 0 && (
            <>
              <li>
                <h3 className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('keywordMode.recentWork')}</h3>
              </li>
              {newKeywords.map(renderKeywordItem)}
              {oldKeywords.length > 0 && (
                <li className="py-2">
                  <div className="border-t border-dotted border-gray-300 dark:border-gray-600" />
                </li>
              )}
            </>
          )}
          {oldKeywords.map(renderKeywordItem)}
        </ul>
      </nav>
    </div>
  );
};

export default KeywordList;
