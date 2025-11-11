import React, { useState, useMemo, useEffect } from 'react';
import { Sermon } from '../types';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, MicrophoneIcon, XMarkIcon } from './icons';

interface SermonModeProps {
  sermons: Sermon[];
  onUpdateSermons: (sermons: Sermon[]) => void;
  onAddSermon: () => void;
  onEditSermon: (sermon: Sermon) => void;
  onDeleteSermon: (id: string) => void;
  initialSelectedSermonId?: string | null;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onSelectSermon: (id: string) => void;
}

const SermonMode: React.FC<SermonModeProps> = ({
  sermons,
  onAddSermon,
  onEditSermon,
  onDeleteSermon,
  initialSelectedSermonId,
  isSidebarOpen,
  setIsSidebarOpen,
  onSelectSermon,
}) => {
  const [sermonType, setSermonType] = useState<'my' | 'other'>('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSermonId, setSelectedSermonId] = useState<string | null>(initialSelectedSermonId);

  useEffect(() => {
    if (initialSelectedSermonId) {
        const sermonExists = sermons.some(s => s.id === initialSelectedSermonId);
        if (sermonExists) {
            setSelectedSermonId(initialSelectedSermonId);
        }
    }
  }, [initialSelectedSermonId, sermons]);

  const filteredSermons = useMemo(() => {
    return sermons
      .filter(s => s.type === sermonType)
      .filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.preacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.bibleReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
  }, [sermons, sermonType, searchTerm]);

  const selectedSermon = useMemo(() => {
    return sermons.find(s => s.id === selectedSermonId) || null;
  }, [sermons, selectedSermonId]);

  // Select the first sermon in the list if none is selected
  useEffect(() => {
    if (!selectedSermonId && filteredSermons.length > 0) {
      setSelectedSermonId(filteredSermons[0].id);
    } else if (filteredSermons.length === 0) {
      setSelectedSermonId(null);
    }
  }, [filteredSermons, selectedSermonId]);

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
        <div className="flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">설교 자료</h2>
                <button
                    onClick={onAddSermon}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    <PlusIcon className="w-4 h-4"/>
                    <span>새 설교 추가</span>
                </button>
            </div>
            <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mb-4">
                <button
                  onClick={() => setSermonType('my')}
                  className={`flex-1 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                    sermonType === 'my'
                      ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  개인 설교
                </button>
                <button
                  onClick={() => setSermonType('other')}
                  className={`flex-1 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                    sermonType === 'other'
                      ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  타인 설교
                </button>
            </div>
            <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="제목, 설교자, 내용 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 mt-4">
            <ul className="space-y-2">
                {filteredSermons.map(sermon => (
                    <li key={sermon.id}>
                        <button
                            onClick={() => onSelectSermon(sermon.id)}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                                selectedSermonId === sermon.id
                                ? 'bg-primary-100 dark:bg-primary-900/50'
                                : 'bg-white dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <p className="font-semibold text-gray-800 dark:text-primary-200 truncate">{sermon.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{sermon.preacher}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sermon.date}</p>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
        {selectedSermon ? (
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex-shrink-0 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{selectedSermon.title}</h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                            <span>{selectedSermon.preacher}</span>
                            <span>|</span>
                            <span>{selectedSermon.date}</span>
                             <span>|</span>
                            <span>{selectedSermon.bibleReference}</span>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => onEditSermon(selectedSermon)} className="p-2 text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <PencilIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => onDeleteSermon(selectedSermon.id)} className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>
            <div className="prose prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap flex-grow overflow-y-auto">
                {selectedSermon.content}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-8">
            <MicrophoneIcon className="w-16 h-16 mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold">설교를 선택하세요</h2>
            <p>왼쪽 목록에서 설교를 선택하여 내용을 보거나 새 설교를 추가하세요.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SermonMode;