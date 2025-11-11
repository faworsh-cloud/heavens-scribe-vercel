import React, { useState, useRef, useMemo } from 'react';
import { BibleMaterialLocation, Material } from '../types';
import { BIBLE_DATA } from '../utils/bibleData';
import MaterialItem from './MaterialItem';
import { PlusIcon, BookOpenIcon, SearchIcon, XMarkIcon } from './icons';

interface BibleModeProps {
  selectedBook: string;
  onSelectBook: (book: string) => void;
  materialsForBook: BibleMaterialLocation[];
  bibleData: BibleMaterialLocation[];
  onUpdateBibleData: (data: BibleMaterialLocation[]) => void;
  onAddMaterial: (context: { book: string; chapterStart: number; verseStart?: number; chapterEnd?: number; verseEnd?: number; }) => void;
  onEditMaterial: (material: Material, location: BibleMaterialLocation) => void;
  onDeleteMaterial: (materialId: string, locationId: string) => void;
  useAbbreviation: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const formatLocation = (location: BibleMaterialLocation): string => {
    const { chapterStart, verseStart, chapterEnd, verseEnd } = location;

    if (verseStart === undefined) {
      return `${chapterStart}장`; // Chapter only
    }

    const effectiveChapterEnd = chapterEnd ?? chapterStart;
    const effectiveVerseEnd = verseEnd ?? verseStart;

    if (chapterStart === effectiveChapterEnd) {
      if (verseStart === effectiveVerseEnd) {
        return `${chapterStart}:${verseStart}`; // C:V
      }
      return `${chapterStart}:${verseStart}-${effectiveVerseEnd}`; // C:V1-V2
    }

    return `${chapterStart}:${verseStart}-${effectiveChapterEnd}:${effectiveVerseEnd}`; // C1:V1-C2:V2
};


const BibleMode: React.FC<BibleModeProps> = ({
  selectedBook,
  onSelectBook,
  materialsForBook,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  useAbbreviation,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [locationInput, setLocationInput] = useState('');
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const oldTestamentRef = useRef<HTMLDivElement>(null);
  const newTestamentRef = useRef<HTMLDivElement>(null);

  const handleBookClick = (bookName: string) => {
    onSelectBook(bookName);
    setExpandedBook(bookName === expandedBook ? null : bookName);
  };
  
  const handleChapterClick = (chapter: number) => {
    const element = document.getElementById(`chapter-scroll-target-${chapter}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsSidebarOpen(false);
  };


  const handleAddMaterialClick = () => {
    const input = locationInput.trim();
    let match;
    let context: Parameters<typeof onAddMaterial>[0] | null = null;

    // C1:V1-C2:V2 (e.g., 1:3-2:5)
    match = input.match(/^(\d+):(\d+)-(\d+):(\d+)$/);
    if (match) {
        const [, cs, vs, ce, ve] = match.map(Number);
        if (cs > 0 && vs > 0 && ce > 0 && ve > 0 && (cs < ce || (cs === ce && vs <= ve))) {
            context = { book: selectedBook, chapterStart: cs, verseStart: vs, chapterEnd: ce, verseEnd: ve };
        }
    }

    // C:V1-V2 (e.g., 1:3-5)
    if (!context) {
        match = input.match(/^(\d+):(\d+)-(\d+)$/);
        if (match) {
            const [, cs, vs, ve] = match.map(Number);
            if (cs > 0 && vs > 0 && ve > 0 && vs <= ve) {
                context = { book: selectedBook, chapterStart: cs, verseStart: vs, verseEnd: ve };
            }
        }
    }

    // C:V (e.g., 1:3)
    if (!context) {
        match = input.match(/^(\d+):(\d+)$/);
        if (match) {
            const [, cs, vs] = match.map(Number);
            if (cs > 0 && vs > 0) {
                context = { book: selectedBook, chapterStart: cs, verseStart: vs, verseEnd: vs };
            }
        }
    }

    // C (e.g., 1)
    if (!context) {
        match = input.match(/^(\d+)$/);
        if (match) {
            const [, cs] = match.map(Number);
            if (cs > 0) {
                context = { book: selectedBook, chapterStart: cs };
            }
        }
    }

    if (context) {
        onAddMaterial(context);
        setLocationInput('');
    } else {
        alert('유효한 형식이 아닙니다. 예: 1, 1:3, 1:3-5, 1:3-2:5');
    }
  };
  
  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ block: 'start' });
  };
  
  const filteredMaterialsForBook = useMemo(() => {
    if (!searchTerm) {
        return materialsForBook;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return materialsForBook
        .map(location => {
            const matchingMaterials = location.materials.filter(material =>
                material.content.toLowerCase().includes(lowercasedSearchTerm) ||
                material.bookTitle.toLowerCase().includes(lowercasedSearchTerm) ||
                material.author.toLowerCase().includes(lowercasedSearchTerm)
            );

            if (matchingMaterials.length > 0) {
                return { ...location, materials: matchingMaterials };
            }
            return null;
        })
        .filter((location): location is BibleMaterialLocation => location !== null);
  }, [materialsForBook, searchTerm]);


  const materialsByChapter = useMemo(() => {
    return filteredMaterialsForBook.reduce((acc, location) => {
      const chapter = location.chapterStart;
      if (!acc[chapter]) {
        acc[chapter] = [];
      }
      acc[chapter].push(location);
      return acc;
    }, {} as Record<number, BibleMaterialLocation[]>);
  }, [filteredMaterialsForBook]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 w-4/5 max-w-xs h-full bg-white dark:bg-gray-800 z-40 transform transition-transform duration-300 ease-in-out p-4 flex-shrink-0 shadow-lg
                         lg:relative lg:w-1/4 lg:h-auto lg:translate-x-0 lg:shadow-md lg:dark:bg-gray-800/50
                         ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">성경</h2>
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 text-gray-500 dark:text-gray-400 lg:hidden"
                    aria-label="메뉴 닫기"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="본문 내용 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
            <div className="flex space-x-2 mb-4">
                <button
                    onClick={() => scrollTo(oldTestamentRef)}
                    className="flex-1 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900"
                >
                    구약
                </button>
                <button
                    onClick={() => scrollTo(newTestamentRef)}
                    className="flex-1 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900"
                >
                    신약
                </button>
            </div>
            <nav className="flex-grow overflow-y-auto pr-2 -mr-2">
            <ul className="space-y-1">
                <div ref={oldTestamentRef}>
                  <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 px-3 py-2">구약</h3>
                  {BIBLE_DATA.oldTestament.map(book => (
                      <li key={book.name} className="break-inside-avoid">
                          <button
                          onClick={() => handleBookClick(book.name)}
                          className={`w-full px-3 py-1.5 rounded-md transition-colors flex justify-between items-center ${
                              selectedBook === book.name
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200 font-semibold'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          } ${useAbbreviation ? 'text-lg font-bold' : 'text-sm text-left'}`}
                          >
                          <span>{useAbbreviation ? book.abbr : book.name}</span>
                          </button>
                          {expandedBook === book.name && (
                            <div className="grid grid-cols-5 gap-1 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-b-md">
                                {Array.from({ length: book.chapters }, (_, i) => i + 1).map(chap => (
                                <button
                                    key={chap}
                                    onClick={() => handleChapterClick(chap)}
                                    className="aspect-square flex items-center justify-center rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/50"
                                >
                                    {chap}
                                </button>
                                ))}
                            </div>
                          )}
                      </li>
                  ))}
                </div>
                <div className="pt-2" ref={newTestamentRef}>
                   <h3 className="text-xl font-bold text-red-800 dark:text-red-300 px-3 py-2">신약</h3>
                    {BIBLE_DATA.newTestament.map(book => (
                        <li key={book.name} className="break-inside-avoid">
                            <button
                            onClick={() => handleBookClick(book.name)}
                            className={`w-full px-3 py-1.5 rounded-md transition-colors flex justify-between items-center ${
                                selectedBook === book.name
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200 font-semibold'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            } ${useAbbreviation ? 'text-lg font-bold' : 'text-sm text-left'}`}
                            >
                            <span>{useAbbreviation ? book.abbr : book.name}</span>
                            </button>
                            {expandedBook === book.name && (
                                <div className="grid grid-cols-5 gap-1 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-b-md">
                                {Array.from({ length: book.chapters }, (_, i) => i + 1).map(chap => (
                                    <button
                                    key={chap}
                                    onClick={() => handleChapterClick(chap)}
                                    className="aspect-square flex items-center justify-center rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/50"
                                    >
                                    {chap}
                                    </button>
                                ))}
                                </div>
                            )}
                        </li>
                    ))}
                </div>
            </ul>
            </nav>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedBook}</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">새 자료 추가</h3>
            <div className="flex flex-wrap items-end gap-3">
                <div className="flex-grow">
                  <label htmlFor="locationInput" className="sr-only">본문</label>
                  <input
                    id="locationInput"
                    type="text"
                    placeholder="예: 1, 1:3, 1:3-5, 1:3-2:5"
                    value={locationInput}
                    onChange={e => setLocationInput(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                </div>
              <button
                onClick={handleAddMaterialClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="w-5 h-5"/>
                <span>자료 추가</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">장, 장:절, 장:절-절, 장:절-장:절 형식으로 입력할 수 있습니다.</p>
          </div>

          {materialsForBook.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
              <BookOpenIcon className="w-12 h-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold">아직 자료가 없습니다</h3>
              <p>위에서 본문을 입력하고 "자료 추가"를 클릭하여 첫 자료를 추가하세요.</p>
            </div>
          ) : filteredMaterialsForBook.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
              <SearchIcon className="w-12 h-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold">검색 결과가 없습니다</h3>
              <p>'{searchTerm}'에 대한 검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* FIX: Explicitly type map parameters to fix type inference issue on `locations`. */}
              {Object.entries(materialsByChapter).map(([chapter, locations]: [string, BibleMaterialLocation[]]) => (
                <div key={chapter} id={`chapter-scroll-target-${chapter}`}>
                   <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 sticky top-0 bg-gray-50 dark:bg-gray-800/50 py-2 -my-2 z-10 border-b-2 border-primary-200 dark:border-primary-800">
                    {chapter}장
                  </h3>
                  <div className="space-y-4">
                    {locations.map((location: BibleMaterialLocation) => (
                        <div key={location.id}>
                             <h4 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                {formatLocation(location)}
                            </h4>
                            {location.materials.map(material => (
                               <MaterialItem
                                  key={material.id}
                                  material={material}
                                  onEdit={() => onEditMaterial(material, location)}
                                  onDelete={(id) => {
                                    if (window.confirm('이 자료를 정말 삭제하시겠습니까?')) {
                                      onDeleteMaterial(id, location.id);
                                    }
                                  }}
                                />
                            ))}
                        </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BibleMode;
