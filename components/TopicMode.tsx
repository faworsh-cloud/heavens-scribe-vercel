import React, { useState, useMemo } from 'react';
import { Keyword, Material } from '../types';
import TopicList from './TopicList';
import MaterialList from './MaterialList';
import { SearchIcon, XMarkIcon } from './icons';

interface TopicModeProps {
  topics: Keyword[];
  selectedTopic: Keyword | null;
  selectedTopicId: string | null;
  onSelectTopic: (id: string) => void;
  onAddTopic: (name: string) => void;
  onDeleteTopic: (id: string) => void;
  onAddMaterial: () => void;
  onEditMaterial: (material: Material) => void;
  onDeleteMaterial: (id: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const TopicMode: React.FC<TopicModeProps> = ({
  topics,
  selectedTopic,
  selectedTopicId,
  onSelectTopic,
  onAddTopic,
  onDeleteTopic,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { newItems, oldItems } = useMemo(() => {
    if (topics.length === 0) {
      return { newItems: [], oldItems: [] };
    }

    const sortedByDate = [...topics].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    const mostRecentItem = sortedByDate[0];
    const otherItems = sortedByDate.slice(1);

    otherItems.sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));

    return { newItems: [mostRecentItem], oldItems: otherItems };
  }, [topics]);

  const filteredResult = useMemo(() => {
    if (!searchTerm) {
      return { newItems, oldItems };
    }

    const filterAndMap = (topic: Keyword): Keyword | null => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchingMaterials = topic.materials.filter(material =>
        material.content.toLowerCase().includes(lowerSearchTerm) ||
        material.bookTitle.toLowerCase().includes(lowerSearchTerm) ||
        material.author.toLowerCase().includes(lowerSearchTerm)
      );
      if (topic.name.toLowerCase().includes(lowerSearchTerm) || matchingMaterials.length > 0) {
        return { ...topic, materials: topic.name.toLowerCase().includes(lowerSearchTerm) ? topic.materials : matchingMaterials };
      }
      return null;
    };
    
    const filteredNew = newItems.map(filterAndMap).filter((t): t is Keyword => t !== null);
    const filteredOld = oldItems.map(filterAndMap).filter((t): t is Keyword => t !== null);

    return { newItems: filteredNew, oldItems: filteredOld };
  }, [newItems, oldItems, searchTerm]);
  
  const displayedTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    if (!searchTerm) return selectedTopic;
    
    const allFiltered = [...filteredResult.newItems, ...filteredResult.oldItems];
    return allFiltered.find(t => t.id === selectedTopicId) || null;
  }, [searchTerm, selectedTopic, selectedTopicId, filteredResult]);


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
                placeholder="주제 또는 내용 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
        </div>
        <div className="flex-1 overflow-hidden">
          <TopicList
              title="주제"
              placeholder="새 주제"
              newItems={filteredResult.newItems}
              oldItems={filteredResult.oldItems}
              selectedItemId={selectedTopicId}
              onSelectItem={onSelectTopic}
              onAddItem={onAddTopic}
              onDeleteItem={onDeleteTopic}
          />
        </div>
      </aside>
      <main className="flex-1 p-4 overflow-y-auto">
        <MaterialList
          selectedItem={displayedTopic || null}
          itemType="주제"
          onAddMaterial={onAddMaterial}
          onEditMaterial={onEditMaterial}
          onDeleteMaterial={onDeleteMaterial}
        />
      </main>
    </div>
  );
};

export default TopicMode;
