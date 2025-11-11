import React from 'react';
import { Keyword, BibleMaterialLocation, Sermon } from '../types';
import MaterialItem from './MaterialItem';
import { SearchIcon } from './icons';
import { useI18n } from '../i18n';

interface SearchResults {
    keywords: Keyword[];
    bible: BibleMaterialLocation[];
    sermons: Sermon[];
}

interface GlobalSearchResultsProps {
    results: SearchResults;
    searchTerm: string;
    onClick: (item: Keyword | BibleMaterialLocation | Sermon, type: 'keyword' | 'bible' | 'sermon') => void;
}

const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({ results, searchTerm, onClick }) => {
    const { t } = useI18n();
    const totalResults = results.keywords.length + results.bible.length + results.sermons.length;
    
    const formatBibleLocation = (location: BibleMaterialLocation): string => {
        const { book, chapterStart, verseStart, chapterEnd, verseEnd } = location;
        let ref = `${book} ${chapterStart}`;
        if (verseStart !== undefined) {
          ref += `:${verseStart}`;
          const effectiveChapterEnd = chapterEnd ?? chapterStart;
          const effectiveVerseEnd = verseEnd ?? verseStart;
          if (chapterStart !== effectiveChapterEnd || verseStart !== effectiveVerseEnd) {
            if (chapterStart !== effectiveChapterEnd) {
                ref += `-${effectiveChapterEnd}:${effectiveVerseEnd}`;
            } else {
                ref += `-${effectiveVerseEnd}`;
            }
          }
        }
        return ref;
    };


    return (
        <div className="w-full p-4 sm:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    {t('bibleMode.noResultsTitle')} '<span className="text-primary-600">{searchTerm}</span>'
                </h1>

                {totalResults === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                        <SearchIcon className="w-12 h-12 mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold">{t('bibleMode.noResultsTitle')}</h3>
                        <p>{t('bibleMode.noResultsBody', { searchTerm })}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {results.keywords.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-3 pb-2 border-b-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                                    {t('hwpMode.typeKeyword')} ({results.keywords.reduce((acc, k) => acc + (k.materials.length || 1), 0)})
                                </h2>
                                <div className="space-y-4">
                                    {results.keywords.map(keyword => (
                                        <div key={keyword.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                                            <button onClick={() => onClick(keyword, 'keyword')} className="text-lg font-bold text-primary-600 dark:text-primary-400 hover:underline">
                                                {keyword.name}
                                            </button>
                                            {keyword.materials.length > 0 && (
                                                <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                                                    {keyword.materials.map(material => (
                                                        <MaterialItem 
                                                            key={material.id}
                                                            material={material}
                                                            onEdit={() => {}} 
                                                            onDelete={() => {}}
                                                            hideActions={true}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {results.bible.length > 0 && (
                             <section>
                                <h2 className="text-xl font-semibold mb-3 pb-2 border-b-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                                    {t('hwpMode.typeBible')} ({results.bible.reduce((acc, l) => acc + l.materials.length, 0)})
                                </h2>
                                <div className="space-y-4">
                                    {results.bible.map(location => (
                                         <div key={location.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                                             <button onClick={() => onClick(location, 'bible')} className="text-lg font-bold text-primary-600 dark:text-primary-400 hover:underline">
                                                {formatBibleLocation(location)}
                                            </button>
                                            <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                                                {location.materials.map(material => (
                                                    <MaterialItem 
                                                        key={material.id}
                                                        material={material}
                                                        onEdit={() => {}} 
                                                        onDelete={() => {}}
                                                        hideActions={true}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        
                        {results.sermons.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-3 pb-2 border-b-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                                    {t('hwpMode.typeSermon')} ({results.sermons.length})
                                </h2>
                                <div className="space-y-3">
                                    {results.sermons.map(sermon => (
                                        <button key={sermon.id} onClick={() => onClick(sermon, 'sermon')} className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                             <p className="font-semibold text-primary-600 dark:text-primary-300 truncate">{sermon.title}</p>
                                             <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{sermon.preacher} / {sermon.date}</p>
                                             <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{sermon.content.substring(0, 200)}</p>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                )}
            </div>
        </div>
    )
};

export default GlobalSearchResults;
