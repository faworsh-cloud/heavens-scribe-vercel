import React, { useState } from 'react';
import { Keyword } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface TopicListProps {
  title: string;
  placeholder: string;
  newItems: Keyword[];
  oldItems: Keyword[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onAddItem: (name: string) => void;
  onDeleteItem: (id: string) => void;
}

const TopicList: React.FC<TopicListProps> = ({
  title,
  placeholder,
  newItems,
  oldItems,
  selectedItemId,
  onSelectItem,
  onAddItem,
  onDeleteItem,
}) => {
  const [newItemName, setNewItemName] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAddItem(newItemName.trim());
      setNewItemName('');
    }
  };

  const renderItem = (item: Keyword) => (
    <li key={item.id} className="group flex items-center justify-between">
      <button
        onClick={() => onSelectItem(item.id)}
        className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm truncate ${
          selectedItemId === item.id
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200 font-semibold'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        {item.name}
      </button>
      <button
        onClick={() => {
          if (window.confirm(`'${item.name}' 항목을 정말 삭제하시겠습니까? 연결된 모든 자료가 함께 삭제됩니다.`)) {
            onDeleteItem(item.id);
          }
        }}
        className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        title={`${title} 삭제`}
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </li>
  );

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{title}</h2>
      <form onSubmit={handleAddItem} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-grow w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          className="flex-shrink-0 p-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-primary-300"
          disabled={!newItemName.trim()}
          aria-label="Add"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </form>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        <ul className="space-y-1">
          {newItems.length > 0 && (
            <>
              <li>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wider">최근 작업</h3>
              </li>
              {newItems.map(renderItem)}
              <li className="py-2"><div className="border-t border-dotted border-gray-300 dark:border-gray-600" /></li>
            </>
          )}
          {oldItems.map(renderItem)}
          {newItems.length === 0 && oldItems.length === 0 && (
              <li className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                  항목이 없습니다.
              </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TopicList;
