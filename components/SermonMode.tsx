import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Sermon } from '../types';
import { PlusIcon, SearchIcon, XMarkIcon, MicrophoneIcon } from './icons';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { BIBLE_DATA } from '../utils/bibleData';
import SermonItem from './SermonItem';

// --- Bible Reference Parsing Logic ---
const allBooks = [...BIBLE_DATA.oldTestament, ...BIBLE_DATA.newTestament];
const allBookNamesForRegex = allBooks
    .flatMap(b => [b.name, b.abbr])
    .sort((a, b) => b.length - a.length);

const bookNameRegexPart = allBookNamesForRegex.join('|');
const sermonRefRegex = new RegExp(`^(${bookNameRegexPart})\\s*(\\d+)(?:[:장절편]\\s*(\\d+))?.*`);

interface ParsedRef {
  book: string | null;
  chapter: number;
  verse: number;
}

function parseSermonBibleReference(ref: string): ParsedRef {
    const defaultResult = { book: null, chapter: 999, verse: 999 };
    if (!ref) return defaultResult;
    
    const firstRef = ref.trim().split(/[,;]/)[0];
    const match = firstRef.match(sermonRefRegex);
    if (!match) return defaultResult;

    const [, bookStr, chapterStr, verseStr] = match;
    const bookInfo = allBooks.find(b => b.name === bookStr || b.abbr === bookStr);

    return {
        book: bookInfo ? bookInfo.name : null,
        chapter: parseInt(chapterStr, 10),
        verse: verseStr ? parseInt(verseStr, 10) : 0,
    };
}

// --- Component ---
interface SermonModeProps {
  sermons: Sermon[];
  onAddSermon: () => void;
  onEditSermon: (sermon: Sermon) => void;
  onDeleteSermon: (id: string) => void;
  initialSelectedSermonId?: string | null;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  useAbbreviation: boolean;
}

const SermonMode: React.FC<SermonModeProps> = ({
  sermons,
  onAddSermon,
  onEditSermon,
  onDeleteSermon,
  initialSelectedSermonId,
  isSidebarOpen,
  setIsSidebarOpen,
  useAbbreviation,
}) => {
  const [sermonType, setSermonType] = useState<'my' | 'other'>('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useLocalStorage<string>('selected-sermon-book', '마태복음');
  const [scrollToSermonId, setScrollToSermonId] = useState<string | null>(null);
  const oldTestamentRef = useRef<HTMLDivElement>(null);
  const newTestamentRef = useRef<HTMLDivElement>(null);

  const mostRecentSermon = useMemo(() => {
    if (sermons.length === 0) return null;
    return [...sermons].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
    })[0];
  }, [sermons]);

  // Handle navigation from global search
  useEffect(() => {
    if (initialSelectedSermonId) {
        const sermon = sermons.find(s => s.id === initialSelectedSermonId);
        if (sermon) {
            const parsedRef = parseSermonBibleReference(sermon.bibleReference);
            if (parsedRef.book) {
                setSelectedBook(parsedRef.book);
                // Use a timeout to ensure the DOM is updated before scrolling
                setTimeout(() => setScrollToSermonId(sermon.id), 0);
            }
        }
    }
  }, [initialSelectedSermonId, sermons, setSelectedBook]);

  // Effect to perform the scroll and highlight
  useEffect(() => {
    if (scrollToSermonId) {
        const element = document.getElementById(`sermon-${scrollToSermonId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-sermon');
            setTimeout(() => {
                element.classList.remove('highlight-sermon');
            }, 2000); // Highlight duration
        }
        setScrollToSermonId(null); // Reset after scroll attempt
    }
  }, [scrollToSermonId]);

  const groupedAndSortedSermons = useMemo(() => {
    const filtered = sermons
      .filter(s => s.type === sermonType)
      .filter(s => {
          if (!searchTerm) return true;
          const term = searchTerm.toLowerCase();
          return s.title.toLowerCase().includes(term) ||
                 s.preacher.toLowerCase().includes(term) ||
                 s.bibleReference.toLowerCase().includes(term) ||
                 s.content.toLowerCase().includes(term)
      });
      
    const forBook = filtered.filter(s => {
        // If there's a search term, show all results regardless of selected book.
        // Otherwise, filter by the selected book.
        if (searchTerm) return true;
        const parsed = parseSermonBibleReference(s.bibleReference);
        return parsed.book === selectedBook;
    });

    const groupedByChapter = forBook.reduce((acc, sermon) => {
        const { chapter } = parseSermonBibleReference(sermon.bibleReference);
        const key = chapter === 999 ? "기타" : `${chapter}장`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(sermon);
        return acc;
    }, {} as Record<string, Sermon[]>);

    const sortedChapters = Object.keys(groupedByChapter).sort((a, b) => {
        if (a === "기타") return 1;
        if (b === "기타") return -1;
        return parseInt(a, 10) - parseInt(b, 10);
    });
    
    const finalResult: [string, Sermon[]][] = sortedChapters.map(chapterKey => {
        const sermonsInChapter = groupedByChapter[chapterKey];
        sermonsInChapter.sort((a, b) => {
            const verseA = parseSermonBibleReference(a.bibleReference).verse;
            const verseB = parseSermonBibleReference(b.bibleReference).verse;
            return verseA - verseB;
        });
        return [chapterKey, sermonsInChapter];
    });

    return finalResult;
  }, [sermons, sermonType, searchTerm, selectedBook]);
  
  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ block: 'start' });
  };
  
  const handleBookClick = (bookName: string) => {
    setSelectedBook(bookName);
    setSearchTerm(''); // Clear search when a book is clicked
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 w-4/5 max-w-xs h-full bg-white dark:bg-gray-800 z-40 transform transition-transform duration-300 ease-in-out p-4 flex-shrink-0 shadow-lg
                         lg:relative lg:w-1/4 lg:h-auto lg:translate-x-0 lg:shadow-md lg:dark:bg-gray-800/50
                         ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">설교</h2>
                 <button
                    onClick={onAddSermon}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    <PlusIcon className="w-4 h-4"/>
                    <span>새 설교</span>
                </button>
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 text-gray-500 dark:text-gray-400 lg:hidden"
                    aria-label="메뉴 닫기"
                >
                    <XMarkIcon className="w-6 h-6" />
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
                    placeholder="전체 설교 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
             <div className="flex space-x-2 my-2">
                <button onClick={() => scrollTo(oldTestamentRef)} className="flex-1 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900">구약</button>
                <button onClick={() => scrollTo(newTestamentRef)} className="flex-1 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900">신약</button>
            </div>
            <nav className="flex-grow overflow-y-auto pr-2 -mr-2">
                <ul className="space-y-1">
                    {mostRecentSermon && (
                        <>
                            <li>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wider">최근 작업</h3>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        const parsedRef = parseSermonBibleReference(mostRecentSermon.bibleReference);
                                        if (parsedRef.book) {
                                            handleBookClick(parsedRef.book);
                                            setTimeout(() => setScrollToSermonId(mostRecentSermon.id), 0);
                                        }
                                    }}
                                    className="w-full px-3 py-2 rounded-md transition-colors text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <span className="font-semibold text-sm truncate">{mostRecentSermon.title}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">{mostRecentSermon.bibleReference}</span>
                                </button>
                            </li>
                            <li className="py-2"><div className="border-t border-dotted border-gray-300 dark:border-gray-600" /></li>
                        </>
                    )}
                    <div ref={oldTestamentRef}>
                        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 px-3 py-2">구약</h3>
                        {BIBLE_DATA.oldTestament.map(book => (
                            <li key={book.name}>
                                <button onClick={() => handleBookClick(book.name)} className={`w-full px-3 py-1.5 rounded-md transition-colors text-left ${selectedBook === book.name && !searchTerm ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} ${useAbbreviation ? 'text-lg font-bold' : 'text-sm'}`}>
                                    {useAbbreviation ? book.abbr : book.name}
                                </button>
                            </li>
                        ))}
                    </div>
                    <div className="pt-2" ref={newTestamentRef}>
                        <h3 className="text-xl font-bold text-red-800 dark:text-red-300 px-3 py-2">신약</h3>
                        {BIBLE_DATA.newTestament.map(book => (
                            <li key={book.name}>
                                <button onClick={() => handleBookClick(book.name)} className={`w-full px-3 py-1.5 rounded-md transition-colors text-left ${selectedBook === book.name && !searchTerm ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} ${useAbbreviation ? 'text-lg font-bold' : 'text-sm'}`}>
                                    {useAbbreviation ? book.abbr : book.name}
                                </button>
                            </li>
                        ))}
                    </div>
                </ul>
            </nav>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {searchTerm ? `'${searchTerm}' 검색 결과` : selectedBook}
            </h2>
            {groupedAndSortedSermons.length > 0 ? (
                <div className="space-y-6">
                    {groupedAndSortedSermons.map(([chapterKey, sermonsInChapter]) => (
                        <div key={chapterKey}>
                            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 sticky top-0 bg-gray-50 dark:bg-gray-800/50 py-2 -my-2 z-10 border-b-2 border-primary-200 dark:border-primary-800">
                                {chapterKey}
                            </h3>
                            <div className="space-y-4">
                                {sermonsInChapter.map(sermon => (
                                    <SermonItem
                                        key={sermon.id}
                                        sermon={sermon}
                                        onEdit={onEditSermon}
                                        onDelete={onDeleteSermon}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-8 min-h-[50vh]">
                    <MicrophoneIcon className="w-16 h-16 mb-4 text-gray-400" />
                    <h2 className="text-xl font-semibold">설교 자료가 없습니다</h2>
                    <p>{searchTerm ? `검색어 '${searchTerm}'에 해당하는 설교가 없습니다.` : `${selectedBook}에 대한 설교 자료가 없습니다. '새 설교 추가' 버튼으로 자료를 추가해 보세요.`}</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default SermonMode;