import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Keyword, Material, BibleMaterialLocation, Sermon, Announcement } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { exportAllData, importAllData, downloadTemplate, updateDataAndExport } from './utils/excelUtils';

import Header from './components/Header';
import KeywordMode from './components/KeywordMode';
import BibleMode from './components/BibleMode';
import SermonMode from './components/SermonMode';
import HwpConvertMode from './components/HwpConvertMode';
import AddEditMaterialModal from './components/AddEditMaterialModal';
import AddEditSermonModal from './components/AddEditSermonModal';
import SettingsModal from './components/SettingsModal';
import GoogleApiGuideModal from './components/GoogleApiGuideModal';
import GeminiApiGuideModal from './components/GeminiApiGuideModal';
import GlobalSearchResults from './components/GlobalSearchResults';
import UserGuideModal from './components/UserGuideModal';
import AnnouncementModal from './components/AnnouncementModal';

type AppMode = 'keyword' | 'bible' | 'sermon' | 'search' | 'hwp';
type FontSize = 'sm' | 'base' | 'lg' | 'xl';

interface AppData {
  keywords: Keyword[];
  bibleData: BibleMaterialLocation[];
  sermons: Sermon[];
  lastModified: string;
}

const CURRENT_ANNOUNCEMENT: Announcement | null = {
    id: 'announcement-video-guide-20240729', // Unique ID for this announcement version
    content: `**'도움말'은 시작 화면 우측 상단에 '?'를 클릭하시면 볼 수 있습니다. 꼭 읽어 주세요.**

## 🎬 사용법 영상 가이드

**1. 기본 사용법:** [영상 보기](https://youtu.be/qllvQ-X14ps?si=-oUNWR5HvC81WIN3)
**2. AI 변환 기능 사용법:** [영상 보기](https://youtu.be/5BhDQNxM14A?si=HFEYwGfOCucyh-9L)

## 자료 관리 방법은 2가지 입니다.

**1. 앱의 데이터를 엑셀 파일로 변환시켜 관리 (추천)**
이 방법으로 충분히 사용이 가능합니다. 기본적으로 하나의 편집 수단(예: 컴퓨터 또는 노트북)에서만 편집하고, 다른 기기(패드, 핸드폰)는 보기 용도로 사용하는 것을 권장합니다.

**2. Google Drive 동기화 기능 (실시간 연동)**
이 기능을 사용하면 패드, 핸드폰, 컴퓨터 등 여러 기기에서 데이터를 동기화하며 사용할 수 있습니다.

---

· 앱의 유무와 관련 없이 모든 자료는 엑셀 파일로 정리되어 자신의 컴퓨터에 안전하게 보관할 수 있으니, 마음껏 사용해 보시기 바랍니다.

· 앱 개발을 위해 사용자의 많은 피드백이 필요합니다. 책임감을 가지고 관리자의 이메일(faworsh@gmail.com)로 피드백 부탁드립니다.`,
    enabled: true,
};


const App: React.FC = () => {
  // Global State
  const [mode, setMode] = useLocalStorage<AppMode>('app-mode', 'keyword');
  const [fontSize, setFontSize] = useLocalStorage<FontSize>('font-size', 'base');
  const [useAbbreviation, setUseAbbreviation] = useLocalStorage('use-abbreviation', false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const sizeMap = {
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
    };
    document.documentElement.style.fontSize = sizeMap[fontSize];
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSize]);

  // Data State
  const [keywords, _setKeywords] = useLocalStorage<Keyword[]>('sermon-prep-keywords', []);
  const [bibleData, _setBibleData] = useLocalStorage<BibleMaterialLocation[]>('sermon-prep-bible', []);
  const [sermons, _setSermons] = useLocalStorage<Sermon[]>('sermon-prep-sermons', []);
  const [lastModified, setLastModified] = useLocalStorage('sermon-prep-last-modified', new Date().toISOString());
  const [lastSavedTimestamp, setLastSavedTimestamp] = useLocalStorage<string | null>('sermon-prep-last-saved-ts', null);

  const isBulkUpdating = useRef(false);

  const setKeywords = useCallback((value: React.SetStateAction<Keyword[]>) => {
    _setKeywords(value);
    if (!isBulkUpdating.current) {
      setLastModified(new Date().toISOString());
    }
  }, [_setKeywords, setLastModified]);

  const setBibleData = useCallback((value: React.SetStateAction<BibleMaterialLocation[]>) => {
    _setBibleData(value);
    if (!isBulkUpdating.current) {
      setLastModified(new Date().toISOString());
    }
  }, [_setBibleData, setLastModified]);

  const setSermons = useCallback((value: React.SetStateAction<Sermon[]>) => {
    _setSermons(value);
    if (!isBulkUpdating.current) {
      setLastModified(new Date().toISOString());
    }
  }, [_setSermons, setLastModified]);
  
  // API Keys
  const [apiKey, setApiKey] = useLocalStorage<string>('gdrive-api-key', '');
  const [clientId, setClientId] = useLocalStorage<string>('gdrive-client-id', '');
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string>('gemini-api-key', '');
  const [hwpConversionEnabled, setHwpConversionEnabled] = useLocalStorage<boolean>('hwp-conversion-enabled', false);

  // Modal State
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isApiGuideOpen, setIsApiGuideOpen] = useState(false);
  const [isGeminiApiGuideOpen, setIsGeminiApiGuideOpen] = useState(false);
  const [isUserGuideModalOpen, setIsUserGuideModalOpen] = useState(false);

  // Edit State
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);
  const [sermonToEdit, setSermonToEdit] = useState<Sermon | null>(null);
  const [lastAddedMaterial, setLastAddedMaterial] = useState<Omit<Material, 'id' | 'createdAt'> | null>(null);
  const [editContext, setEditContext] = useState<any>(null);

  // Keyword/Topic Mode State
  const [selectedKeywordId, setSelectedKeywordId] = useLocalStorage<string | null>('selected-keyword-id', null);

  // Bible Mode State
  const [selectedBook, setSelectedBook] = useLocalStorage<string>('selected-book', '창세기');

  // Sermon Mode State
  const [selectedSermonId, setSelectedSermonId] = useState<string | null>(null);

  // Search State
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  
  // Announcement State
  const [announcement] = useState(CURRENT_ANNOUNCEMENT);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [hiddenAnnouncements, setHiddenAnnouncements] = useLocalStorage<{ [id: string]: number }>('hidden-announcements', {});
  
  // Toast and Backup State
  const [toast, setToast] = useState<{message: string} | null>(null);
  const [importBackup, setImportBackup] = useLocalStorage<AppData | null>('sermon-prep-import-backup', null);
  const sessionAnnouncementClosed = useRef(false);
  
  // Imported file state (in-memory)
  const [originalWorkbook, setOriginalWorkbook] = useState<any | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  const isUpdateExport = !!originalWorkbook;
  
  const hasData = keywords.length > 0 || bibleData.length > 0 || sermons.length > 0;
  const isDataDirty = 
    (lastSavedTimestamp !== null && lastModified > lastSavedTimestamp) ||
    (lastSavedTimestamp === null && hasData);

  // Handle Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Close the top-most/nested modals first
        if (isGeminiApiGuideOpen) setIsGeminiApiGuideOpen(false);
        else if (isApiGuideOpen) setIsApiGuideOpen(false);
        else if (isSettingsModalOpen) setIsSettingsModalOpen(false);
        else if (isUserGuideModalOpen) setIsUserGuideModalOpen(false);
        else if (isAnnouncementModalOpen) setIsAnnouncementModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isGeminiApiGuideOpen,
    isApiGuideOpen, setIsApiGuideOpen,
    isSettingsModalOpen, setIsSettingsModalOpen,
    isUserGuideModalOpen, setIsUserGuideModalOpen,
    isAnnouncementModalOpen, setIsAnnouncementModalOpen,
  ]);

  // Switch to keyword mode if HWP conversion is disabled
  useEffect(() => {
    if (!hwpConversionEnabled && mode === 'hwp') {
      setMode('keyword');
    }
  }, [hwpConversionEnabled, mode, setMode]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000); // 5 second timeout for toast
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // Data update effect for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (['sermon-prep-keywords', 'sermon-prep-bible', 'sermon-prep-sermons'].includes(e.key || '')) {
            setLastModified(new Date().toISOString());
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setLastModified]);

  // Show announcement on app load
  useEffect(() => {
    // Clean up expired hidden announcements
    const now = Date.now();
    const updatedHiddenAnnouncements = { ...hiddenAnnouncements };
    let changed = false;
    for (const id in updatedHiddenAnnouncements) {
        if (updatedHiddenAnnouncements[id] < now) {
            delete updatedHiddenAnnouncements[id];
            changed = true;
        }
    }
    if (changed) {
        setHiddenAnnouncements(updatedHiddenAnnouncements);
    }

    if (announcement && announcement.enabled && !updatedHiddenAnnouncements[announcement.id] && !sessionAnnouncementClosed.current) {
        setIsAnnouncementModalOpen(true);
    }
  }, [announcement, hiddenAnnouncements, setHiddenAnnouncements]);

  const handleCloseAnnouncement = (hideFor7Days: boolean) => {
    if (announcement && hideFor7Days) {
      const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
      setHiddenAnnouncements(prev => ({ ...prev, [announcement.id]: expires }));
    }
    setIsAnnouncementModalOpen(false);
    sessionAnnouncementClosed.current = true;
  };
  
  const handleOpenAnnouncement = () => {
    setIsAnnouncementModalOpen(true);
  };

  // Google Drive Sync
  const gdrive = useGoogleDrive(apiKey, clientId, keywords, setKeywords, bibleData, setBibleData, sermons, setSermons, lastModified, setLastModified);

  // --- Data Handlers ---

  // Keyword Handlers
  const handleAddKeyword = (name: string) => {
    const now = new Date().toISOString();
    const newKeyword: Keyword = { id: crypto.randomUUID(), name, materials: [], createdAt: now, updatedAt: now };
    setKeywords(prev => [...prev, newKeyword]);
    setSelectedKeywordId(newKeyword.id);
  };

  const handleDeleteKeyword = (id: string) => {
    setKeywords(prev => prev.filter(k => k.id !== id));
    if (selectedKeywordId === id) {
      const remainingKeywords = keywords.filter(k => k.id !== id);
      setSelectedKeywordId(remainingKeywords.length > 0 ? remainingKeywords[0].id : null);
    }
  };

  const handleDeleteKeywordMaterial = (materialId: string, keywordId: string) => {
    setKeywords(prev => prev.map(kw => {
      if (kw.id === keywordId) {
        return { ...kw, materials: kw.materials.filter(m => m.id !== materialId), updatedAt: new Date().toISOString() };
      }
      return kw;
    }));
  };

  // Bible Handlers
  const handleDeleteBibleMaterial = (materialId: string, locationId: string) => {
    setBibleData(prev => prev.map(loc => {
        if (loc.id === locationId) {
            const updatedMaterials = loc.materials.filter(m => m.id !== materialId);
            if (updatedMaterials.length === 0) return null;
            return { ...loc, materials: updatedMaterials, updatedAt: new Date().toISOString() };
        }
        return loc;
    }).filter((loc): loc is BibleMaterialLocation => loc !== null));
  };


  // Generic Material Save Handler
  const handleSaveMaterial = (materialData: Omit<Material, 'id' | 'createdAt'>, id?: string) => {
    try {
      setLastAddedMaterial(materialData);
      const context = editContext || { mode, selectedKeywordId, selectedBook };
      
      if (context.mode === 'keyword') {
        const keywordId = context.keywordId || context.selectedKeywordId;
        if (!keywordId) return;
        setKeywords(prev => prev.map(kw => {
          if (kw.id === keywordId) {
            const now = new Date().toISOString();
            if (id) { // Editing existing material
              return {
                ...kw,
                materials: kw.materials.map(m => m.id === id ? { ...m, ...materialData } : m),
                updatedAt: now
              };
            } else { // Adding new material
              return {
                ...kw,
                materials: [...kw.materials, { ...materialData, id: crypto.randomUUID(), createdAt: now }],
                updatedAt: now
              };
            }
          }
          return kw;
        }));
      } else if (context.mode === 'bible') {
        const { book, chapterStart, verseStart, chapterEnd, verseEnd, locationId } = context;
        if (id && locationId) { // Editing
            setBibleData(prev => prev.map(loc => {
                if (loc.id === locationId) {
                    return {
                        ...loc,
                        materials: loc.materials.map(m => m.id === id ? { ...m, ...materialData } : m),
                        updatedAt: new Date().toISOString()
                    };
                }
                return loc;
            }));
        } else { // Adding
            const newMaterial: Material = { ...materialData, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
            setBibleData(prev => {
                const existingLocation = prev.find(loc => 
                    loc.book === book &&
                    loc.chapterStart === chapterStart &&
                    loc.verseStart === verseStart &&
                    loc.chapterEnd === chapterEnd &&
                    loc.verseEnd === verseEnd
                );

                if (existingLocation) {
                    return prev.map(loc => loc.id === existingLocation.id ? { ...loc, materials: [...loc.materials, newMaterial], updatedAt: new Date().toISOString() } : loc);
                } else {
                    const now = new Date().toISOString();
                    const newLocation: BibleMaterialLocation = {
                        id: crypto.randomUUID(),
                        book,
                        chapterStart,
                        verseStart,
                        chapterEnd,
                        verseEnd,
                        materials: [newMaterial],
                        createdAt: now,
                        updatedAt: now
                    };
                    return [...prev, newLocation];
                }
            });
        }
      }
      setIsMaterialModalOpen(false);
      setMaterialToEdit(null);
      setEditContext(null);
    } catch (error) {
      console.error("Error saving material:", error);
      alert("자료 저장 중 오류가 발생했습니다.");
    }
  };

  const handleOpenMaterialModal = (material: Material | null, context: any) => {
    setMaterialToEdit(material);
    setEditContext(context);
    setIsMaterialModalOpen(true);
  };
  
  // Sermon Handlers
  const handleSaveSermon = (sermonData: Omit<Sermon, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => {
    const now = new Date().toISOString();
    if (id) {
        setSermons(prev => prev.map(s => s.id === id ? { ...s, ...sermonData, updatedAt: now } : s));
    } else {
        const newSermon: Sermon = { ...sermonData, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
        setSermons(prev => [...prev, newSermon]);
    }
    setIsSermonModalOpen(false);
    setSermonToEdit(null);
  };

  const handleEditSermon = (sermon: Sermon) => {
    setSermonToEdit(sermon);
    setIsSermonModalOpen(true);
  };

  const handleDeleteSermon = (id: string) => {
      setSermons(prev => prev.filter(s => s.id !== id));
  };

  // Search Handlers
  const handleGlobalSearch = (term: string) => {
    setGlobalSearchTerm(term);
    setMode('search');
  };

  const searchResults = useMemo(() => {
    if (!globalSearchTerm) {
      return { keywords: [], bible: [], sermons: [] };
    }
    const lowerCaseTerm = globalSearchTerm.toLowerCase();
    
    const keywordResults = keywords.map(item => {
      const matchingMaterials = item.materials.filter(m =>
        m.bookTitle.toLowerCase().includes(lowerCaseTerm) ||
        m.author.toLowerCase().includes(lowerCaseTerm) ||
        m.content.toLowerCase().includes(lowerCaseTerm)
      );
      if (item.name.toLowerCase().includes(lowerCaseTerm) || matchingMaterials.length > 0) {
        return {
          ...item,
          materials: item.name.toLowerCase().includes(lowerCaseTerm) ? item.materials : matchingMaterials,
        };
      }
      return null;
    }).filter((k): k is Keyword => k !== null);

    const bibleResults = bibleData.map(location => {
        const matchingMaterials = location.materials.filter(m =>
            m.bookTitle.toLowerCase().includes(lowerCaseTerm) ||
            m.author.toLowerCase().includes(lowerCaseTerm) ||
            m.content.toLowerCase().includes(lowerCaseTerm)
        );
        if (matchingMaterials.length > 0) {
            return { ...location, materials: matchingMaterials };
        }
        return null;
    }).filter((l): l is BibleMaterialLocation => l !== null);
    
    const sermonResults = sermons.filter(sermon => 
        sermon.title.toLowerCase().includes(lowerCaseTerm) ||
        sermon.preacher.toLowerCase().includes(lowerCaseTerm) ||
        sermon.bibleReference.toLowerCase().includes(lowerCaseTerm) ||
        sermon.content.toLowerCase().includes(lowerCaseTerm)
    );

    return { keywords: keywordResults, bible: bibleResults, sermons: sermonResults };
  }, [globalSearchTerm, keywords, bibleData, sermons]);

  const handleSearchResultClick = (item: Keyword | BibleMaterialLocation | Sermon, type: 'keyword' | 'bible' | 'sermon') => {
    switch (type) {
      case 'keyword':
        setSelectedKeywordId((item as Keyword).id);
        setMode('keyword');
        break;
      case 'bible':
        setSelectedBook((item as BibleMaterialLocation).book);
        setMode('bible');
        break;
      case 'sermon':
        setSelectedSermonId((item as Sermon).id);
        setMode('sermon');
        break;
    }
    setGlobalSearchTerm('');
  };

  // Excel Handlers
  const handleExportAll = () => {
    exportAllData(keywords, bibleData, sermons);
    setLastSavedTimestamp(new Date().toISOString());
  };

  const handleUpdateAndExport = () => {
    if (originalWorkbook && originalFileName) {
        updateDataAndExport(originalWorkbook, originalFileName, keywords, bibleData, sermons);
        setLastSavedTimestamp(new Date().toISOString());
    } else {
        handleExportAll();
    }
  };
  
  const handleImportAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if(hasData && !window.confirm('현재 작업 중인 데이터가 있습니다. 파일을 가져오면 현재 데이터가 모두 사라집니다. 계속하시겠습니까?')) {
      e.target.value = ''; // Reset file input
      return;
    }
    
    setImportBackup({ keywords, bibleData, sermons, lastModified });
    
    try {
        const { workbook, keywords: newKeywords, bibleData: newBibleData, sermons: newSermons } = await importAllData(file);
        
        isBulkUpdating.current = true;
        setKeywords(newKeywords);
        setBibleData(newBibleData);
        setSermons(newSermons);
        isBulkUpdating.current = false;

        const now = new Date().toISOString();
        setLastModified(now);
        setLastSavedTimestamp(now);
        
        setOriginalWorkbook(workbook);
        setOriginalFileName(file.name);
        setToast({ message: '데이터를 성공적으로 가져왔습니다.' });
    } catch (error: any) {
        console.error(error);
        alert(error.message);
        handleRestoreFromImportBackup(false);
    } finally {
        e.target.value = '';
    }
  };

  const handleRestoreFromImportBackup = (confirm=true) => {
    if (importBackup) {
        if (!confirm || window.confirm('가장 최근에 가져오기 전 상태로 데이터를 복원하시겠습니까?')) {
            isBulkUpdating.current = true;
            setKeywords(importBackup.keywords);
            setBibleData(importBackup.bibleData);
            setSermons(importBackup.sermons);
            isBulkUpdating.current = false;
            setLastModified(importBackup.lastModified);
            setImportBackup(null);
            if (confirm) setToast({ message: '데이터가 복원되었습니다.' });
        }
    } else {
        if (confirm) alert('복원할 백업 데이터가 없습니다.');
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate();
  };

  const handleImportFromHwp = (data: any[], type: 'keyword' | 'bible' | 'sermon') => {
    setImportBackup({ keywords, bibleData, sermons, lastModified });
    
    if (type === 'keyword') {
      const newKeywords: Keyword[] = [...keywords];
      const keywordMap = new Map(newKeywords.map(k => [k.name, k]));

      (data as { keyword: string; materials: Omit<Material, 'id' | 'createdAt'>[] }[]).forEach(item => {
        const now = new Date().toISOString();
        const newMaterials = item.materials.map(m => ({ ...m, id: crypto.randomUUID(), createdAt: now }));
        
        if (keywordMap.has(item.keyword)) {
          const existing = keywordMap.get(item.keyword)!;
          existing.materials.push(...newMaterials);
          existing.updatedAt = now;
        } else {
          const newKeyword: Keyword = {
            id: crypto.randomUUID(),
            name: item.keyword,
            materials: newMaterials,
            createdAt: now,
            updatedAt: now,
          };
          newKeywords.push(newKeyword);
          keywordMap.set(item.keyword, newKeyword);
        }
      });
      setKeywords(newKeywords);
    } else if (type === 'bible') {
      setBibleData(prev => [...prev, ...data as BibleMaterialLocation[]]);
    } else if (type === 'sermon') {
      const newSermons: Sermon[] = (data as any[]).map(s => {
        const now = new Date().toISOString();
        return {
          ...s,
          id: crypto.randomUUID(),
          type: 'my',
          createdAt: now,
          updatedAt: now,
        };
      });
      setSermons(prev => [...prev, ...newSermons]);
    }
    
    setToast({ message: `변환된 ${data.length}개 항목을 추가했습니다. 변경사항을 저장하려면 '저장하기' 버튼을 누르세요.` });
  };
  
  const selectedKeyword = useMemo(() => keywords.find(k => k.id === selectedKeywordId) || null, [keywords, selectedKeywordId]);
  const materialsForBook = useMemo(() => bibleData.filter(loc => loc.book === selectedBook).sort((a,b) => a.chapterStart - b.chapterStart || (a.verseStart ?? 0) - (b.verseStart ?? 0)), [bibleData, selectedBook]);

  // Save on Ctrl+S
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
              e.preventDefault();
              handleUpdateAndExport();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUpdateAndExport]);

  return (
    <div className={`flex flex-col h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      <Header
        mode={mode}
        setMode={setMode}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenUserGuide={() => setIsUserGuideModalOpen(true)}
        onOpenAnnouncement={handleOpenAnnouncement}
        gdrive={{ ...gdrive, isReady: gdrive.isReady && !!(apiKey && clientId) }}
        onSearch={handleGlobalSearch}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isDataDirty={isDataDirty}
        onUpdate={handleUpdateAndExport}
        isUpdateExport={isUpdateExport}
        onImportAll={handleImportAll}
        hwpConversionEnabled={hwpConversionEnabled}
        apiKey={apiKey}
        clientId={clientId}
      />

      <div className={`flex flex-1 overflow-hidden transition-all duration-300`}>
        <main className="flex-1 flex flex-col overflow-hidden">
          {mode === 'keyword' && (
            <KeywordMode
              keywords={keywords}
              selectedKeyword={selectedKeyword}
              selectedKeywordId={selectedKeywordId}
              onSelectKeyword={setSelectedKeywordId}
              onAddKeyword={handleAddKeyword}
              onDeleteKeyword={handleDeleteKeyword}
              onAddMaterial={() => handleOpenMaterialModal(null, { mode: 'keyword', selectedKeywordId })}
              onEditMaterial={(material) => handleOpenMaterialModal(material, { mode: 'keyword', keywordId: selectedKeywordId })}
              onDeleteMaterial={(id) => {
                if(selectedKeywordId) {
                    handleDeleteKeywordMaterial(id, selectedKeywordId);
                }
              }}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          )}
          {mode === 'bible' && (
            <BibleMode
              selectedBook={selectedBook}
              onSelectBook={setSelectedBook}
              materialsForBook={materialsForBook}
              bibleData={bibleData}
              onUpdateBibleData={setBibleData}
              onAddMaterial={(context) => handleOpenMaterialModal(null, { mode: 'bible', ...context })}
              onEditMaterial={(material, location) => handleOpenMaterialModal(material, { mode: 'bible', locationId: location.id })}
              onDeleteMaterial={handleDeleteBibleMaterial}
              useAbbreviation={useAbbreviation}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          )}
          {mode === 'sermon' && (
            <SermonMode
              sermons={sermons}
              onAddSermon={() => {
                setSermonToEdit(null);
                setIsSermonModalOpen(true);
              }}
              onEditSermon={handleEditSermon}
              onDeleteSermon={handleDeleteSermon}
              initialSelectedSermonId={selectedSermonId}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              useAbbreviation={useAbbreviation}
            />
          )}
          {mode === 'search' && (
            <GlobalSearchResults
              results={searchResults}
              searchTerm={globalSearchTerm}
              onClick={handleSearchResultClick}
            />
          )}
          {mode === 'hwp' && (
            <HwpConvertMode
              onImportData={handleImportFromHwp}
              geminiApiKey={geminiApiKey}
              hwpConversionEnabled={hwpConversionEnabled}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
          )}
        </main>
      </div>

      {isMaterialModalOpen && (
        <AddEditMaterialModal
          isOpen={isMaterialModalOpen}
          onClose={() => {
            setIsMaterialModalOpen(false);
            setMaterialToEdit(null);
            setEditContext(null);
          }}
          onSave={handleSaveMaterial}
          materialToEdit={materialToEdit}
          lastAddedMaterial={lastAddedMaterial}
          geminiApiKey={geminiApiKey}
        />
      )}
      {isSermonModalOpen && (
        <AddEditSermonModal
          isOpen={isSermonModalOpen}
          onClose={() => {
            setIsSermonModalOpen(false);
            setSermonToEdit(null);
          }}
          onSave={handleSaveSermon}
          sermonToEdit={sermonToEdit}
          geminiApiKey={geminiApiKey}
        />
      )}
      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          fontSize={fontSize}
          setFontSize={setFontSize}
          useAbbreviation={useAbbreviation}
          setUseAbbreviation={setUseAbbreviation}
          apiKey={apiKey}
          setApiKey={setApiKey}
          clientId={clientId}
          setClientId={setClientId}
          geminiApiKey={geminiApiKey}
          setGeminiApiKey={setGeminiApiKey}
          hwpConversionEnabled={hwpConversionEnabled}
          setHwpConversionEnabled={setHwpConversionEnabled}
          onOpenApiGuide={() => setIsApiGuideOpen(true)}
          onOpenGeminiApiGuide={() => setIsGeminiApiGuideOpen(true)}
          isImportBackupAvailable={!!importBackup}
          onRestoreFromImportBackup={handleRestoreFromImportBackup}
          onExportAll={handleExportAll}
          onImportAll={handleImportAll}
          onDownloadTemplate={handleDownloadTemplate}
          isUpdateExport={isUpdateExport}
          gdrive={gdrive}
        />
      )}
      {isApiGuideOpen && <GoogleApiGuideModal isOpen={isApiGuideOpen} onClose={() => setIsApiGuideOpen(false)} />}
      {isGeminiApiGuideOpen && <GeminiApiGuideModal isOpen={isGeminiApiGuideOpen} onClose={() => setIsGeminiApiGuideOpen(false)} />}
      {isUserGuideModalOpen && <UserGuideModal isOpen={isUserGuideModalOpen} onClose={() => setIsUserGuideModalOpen(false)} />}
      {announcement && isAnnouncementModalOpen && (
        <AnnouncementModal
          isOpen={isAnnouncementModalOpen}
          onClose={handleCloseAnnouncement}
          content={announcement.content}
        />
      )}
    </div>
  );
};

export default App;