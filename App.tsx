import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Keyword, Material, BibleMaterialLocation, Sermon, Announcement } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { hashPin, verifyPin } from './utils/auth';
import { exportAllData, importAllData, downloadTemplate, updateDataAndExport } from './utils/excelUtils';

import Header from './components/Header';
import KeywordMode from './components/KeywordMode';
import BibleMode from './components/BibleMode';
import SermonMode from './components/SermonMode';
import HwpConvertMode from './components/HwpConvertMode';
import AddEditMaterialModal from './components/AddEditMaterialModal';
import AddEditSermonModal from './components/AddEditSermonModal';
import SettingsModal from './components/SettingsModal';
import AuthScreen from './components/AuthScreen';
import PinManagementModal from './components/PinManagementModal';
import GoogleApiGuideModal from './components/GoogleApiGuideModal';
import GlobalSearchResults from './components/GlobalSearchResults';
import UserGuideModal from './components/UserGuideModal';
import AnnouncementModal from './components/AnnouncementModal';
import AdminAuthModal from './components/AdminAuthModal';
import AdminPinModal from './components/AdminPinModal';
import AdminAnnouncementModal from './components/AdminAnnouncementModal';

type AppMode = 'keyword' | 'bible' | 'sermon' | 'search' | 'hwp';
type FontSize = 'sm' | 'base' | 'lg' | 'xl';

interface AppData {
  keywords: Keyword[];
  bibleData: BibleMaterialLocation[];
  sermons: Sermon[];
  lastModified: string;
}

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
  const [keywords, setKeywords] = useLocalStorage<Keyword[]>('sermon-prep-keywords', []);
  const [bibleData, setBibleData] = useLocalStorage<BibleMaterialLocation[]>('sermon-prep-bible', []);
  const [sermons, setSermons] = useLocalStorage<Sermon[]>('sermon-prep-sermons', []);
  const [lastModified, setLastModified] = useLocalStorage('sermon-prep-last-modified', new Date().toISOString());
  const [lastSavedTimestamp, setLastSavedTimestamp] = useLocalStorage<string | null>('sermon-prep-last-saved-ts', null);

  // User Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinHash, setPinHash] = useLocalStorage<string | null>('sermon-prep-pin', null);
  const [pinEnabled, setPinEnabled] = useLocalStorage<boolean>('sermon-prep-pin-enabled', false);
  
  // Admin Auth State
  const [adminPinHash, setAdminPinHash] = useLocalStorage<string | null>('sermon-prep-admin-pin', null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false); // Session-only
  const [pendingAdminAction, setPendingAdminAction] = useState<(() => void) | null>(null);

  // API Keys
  const [apiKey, setApiKey] = useLocalStorage<string>('gdrive-api-key', '');
  const [clientId, setClientId] = useLocalStorage<string>('gdrive-client-id', '');
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string>('gemini-api-key', '');
  const [hwpConversionEnabled, setHwpConversionEnabled] = useLocalStorage<boolean>('hwp-conversion-enabled', false);

  // Modal State
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isApiGuideOpen, setIsApiGuideOpen] = useState(false);
  const [isUserGuideModalOpen, setIsUserGuideModalOpen] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isAdminAnnouncementModalOpen, setIsAdminAnnouncementModalOpen] = useState(false);

  // Edit State
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);
  const [sermonToEdit, setSermonToEdit] = useState<Sermon | null>(null);
  const [lastAddedMaterial, setLastAddedMaterial] = useState<Omit<Material, 'id' | 'createdAt'> | null>(null);
  const [editContext, setEditContext] = useState<any>(null);

  // Keyword Mode State
  const [selectedKeywordId, setSelectedKeywordId] = useLocalStorage<string | null>('selected-keyword-id', null);

  // Bible Mode State
  const [selectedBook, setSelectedBook] = useLocalStorage<string>('selected-book', '창세기');

  // Sermon Mode State
  const [selectedSermonId, setSelectedSermonId] = useState<string | null>(null);

  // Search State
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  
  // Announcement State
  const [localAnnouncement, setLocalAnnouncement] = useLocalStorage<Announcement | null>('sermon-prep-local-announcement', {
    id: 'initial-local-announcement',
    content: '관리자가 공지사항을 설정할 수 있습니다.',
    enabled: false,
  });
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [seenAnnouncementId, setSeenAnnouncementId] = useLocalStorage<string | null>('seen-announcement-id', null);
  
  // Toast and Backup State
  const [toast, setToast] = useState<{message: string} | null>(null);
  const [importBackup, setImportBackup] = useLocalStorage<AppData | null>('sermon-prep-import-backup', null);
  
  // Imported file state (in-memory)
  const [originalWorkbook, setOriginalWorkbook] = useState<any | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);
  const isUpdateExport = !!originalWorkbook;
  
  const isDataDirty = isUpdateExport && lastSavedTimestamp !== null && lastModified > lastSavedTimestamp;

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
  
  // Data update effect
  useEffect(() => {
    const updateTimestamp = () => setLastModified(new Date().toISOString());
    const handleStorageChange = (e: StorageEvent) => {
        if (['sermon-prep-keywords', 'sermon-prep-bible', 'sermon-prep-sermons'].includes(e.key || '')) {
            updateTimestamp();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setLastModified]);

  // Show announcement on app load
  useEffect(() => {
    if (localAnnouncement && localAnnouncement.enabled && localAnnouncement.id !== seenAnnouncementId) {
      setIsAnnouncementModalOpen(true);
    }
  }, [localAnnouncement, seenAnnouncementId]);

  const handleCloseAnnouncement = () => {
    if (localAnnouncement) {
      setSeenAnnouncementId(localAnnouncement.id);
    }
    setIsAnnouncementModalOpen(false);
  };

  // Google Drive Sync
  const gdrive = useGoogleDrive(apiKey, clientId, keywords, setKeywords, bibleData, setBibleData, sermons, setSermons, lastModified, setLastModified);

  // --- Authentication Handlers (User & Admin) ---

  // User Auth
  useEffect(() => {
    if (!pinEnabled || !pinHash) {
      setIsAuthenticated(true);
    }
  }, [pinEnabled, pinHash]);

  const handlePinVerify = async (pin: string) => {
    if (pinHash && await verifyPin(pin, pinHash)) {
      setIsAuthenticated(true);
    } else {
      alert('PIN이 잘못되었습니다.');
    }
  };

  const handleSetPin = async (pin: string) => {
    const newHash = await hashPin(pin);
    setPinHash(newHash);
    setPinEnabled(true);
    setIsPinModalOpen(false);
    alert('PIN이 설정되었습니다.');
  };

  // Admin Auth
  const handleAdminAction = (action: () => void) => {
    if (isAdminAuthenticated) {
      action();
    } else if (adminPinHash) {
      setPendingAdminAction(() => action);
      setIsAdminAuthModalOpen(true);
    } else {
      alert('관리자 PIN이 설정되지 않았습니다. 설정에서 먼저 PIN을 설정해주세요.');
    }
  };

  const handleAdminPinVerify = async (pin: string) => {
    if (adminPinHash && await verifyPin(pin, adminPinHash)) {
      setIsAdminAuthenticated(true);
      setIsAdminAuthModalOpen(false);
      if (pendingAdminAction) {
        pendingAdminAction();
        setPendingAdminAction(null);
      }
    } else {
      alert('관리자 PIN이 잘못되었습니다.');
    }
  };

  const handleSetAdminPin = async (pin: string) => {
    const newHash = await hashPin(pin);
    setAdminPinHash(newHash);
    setIsAdminPinModalOpen(false);
    setIsAdminAuthenticated(true); // Automatically auth after setting a new pin
    alert('관리자 PIN이 설정되었습니다.');
  };

  const handleSaveAnnouncement = (announcement: Omit<Announcement, 'id'>) => {
    const newId = crypto.randomUUID(); // Give it a new ID on save to ensure it reappears for users
    setLocalAnnouncement({ ...announcement, id: newId });
    setIsAdminAnnouncementModalOpen(false);
    alert('공지사항이 저장되었습니다.');
  };
  

  // --- Data Handlers ---

  // Keyword Handlers
  const handleAddKeyword = (name: string) => {
    const newKeyword: Keyword = { id: crypto.randomUUID(), name, materials: [], createdAt: new Date().toISOString() };
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
        return { ...kw, materials: kw.materials.filter(m => m.id !== materialId) };
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
            return { ...loc, materials: updatedMaterials };
        }
        return loc;
    }).filter((loc): loc is BibleMaterialLocation => loc !== null));
  };


  // Generic Material Save Handler
  const handleSaveMaterial = (materialData: Omit<Material, 'id' | 'createdAt'>, id?: string) => {
    setLastAddedMaterial(materialData);
    const context = editContext || { mode, selectedKeywordId, selectedBook };
    
    if (context.mode === 'keyword') {
      const keywordId = context.keywordId || context.selectedKeywordId;
      if (!keywordId) return;
      setKeywords(prev => prev.map(kw => {
        if (kw.id === keywordId) {
          const updatedMaterials = materialToEdit
            ? kw.materials.map(m => m.id === materialToEdit.id ? { ...m, ...materialData } : m)
            : [...kw.materials, { ...materialData, id: crypto.randomUUID(), createdAt: new Date().toISOString() }];
          return { ...kw, materials: updatedMaterials };
        }
        return kw;
      }));
    } else if (context.mode === 'bible') {
       const newMaterial: Material = { ...materialData, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
       if (materialToEdit) { // Editing existing material
            setBibleData(prev => prev.map(loc => {
                if(loc.id === context.locationId) {
                    return {
                        ...loc,
                        materials: loc.materials.map(m => m.id === materialToEdit.id ? {...m, ...materialData} : m)
                    }
                }
                return loc;
            }));
       } else { // Adding new material
            const existingLocation = bibleData.find(l => 
                l.book === context.book &&
                l.chapterStart === context.chapterStart &&
                l.verseStart === context.verseStart &&
                l.chapterEnd === context.chapterEnd &&
                l.verseEnd === context.verseEnd
            );

            if (existingLocation) {
                 setBibleData(prev => prev.map(loc => loc.id === existingLocation.id ? { ...loc, materials: [...loc.materials, newMaterial] } : loc));
            } else {
                const newLocation: BibleMaterialLocation = {
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    book: context.book,
                    chapterStart: context.chapterStart,
                    verseStart: context.verseStart,
                    chapterEnd: context.chapterEnd,
                    verseEnd: context.verseEnd,
                    materials: [newMaterial]
                };
                setBibleData(prev => [...prev, newLocation]);
            }
       }
    }

    setIsMaterialModalOpen(false);
    setMaterialToEdit(null);
    setEditContext(null);
  };

  // Sermon Handlers
  const handleSaveSermon = (sermonData: Omit<Sermon, 'id' | 'createdAt'>, id?: string) => {
      if (sermonToEdit) {
          setSermons(prev => prev.map(s => s.id === sermonToEdit.id ? { ...s, ...sermonData } : s));
      } else {
          const newSermon: Sermon = { ...sermonData, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
          setSermons(prev => [...prev, newSermon]);
      }
      setIsSermonModalOpen(false);
      setSermonToEdit(null);
  };

  const handleDeleteSermon = (id: string) => {
      if(window.confirm('이 설교를 정말 삭제하시겠습니까?')) {
          setSermons(prev => prev.filter(s => s.id !== id));
          if(selectedSermonId === id) {
              setSelectedSermonId(null);
          }
      }
  };

  // HWP Import Handler
  const handleImportData = useCallback((data: any[], type: 'keyword' | 'bible' | 'sermon') => {
    if (!data || data.length === 0) {
        alert('추가할 데이터가 없습니다.');
        return;
    }

    const backupData: AppData = {
        keywords: JSON.parse(JSON.stringify(keywords)),
        bibleData: JSON.parse(JSON.stringify(bibleData)),
        sermons: JSON.parse(JSON.stringify(sermons)),
        lastModified: lastModified,
    };
    setImportBackup(backupData);
    
    let itemsAddedCount = 0;

    if (type === 'keyword') {
      type ImportedKeyword = { keyword: string; materials: Omit<Material, 'id' | 'createdAt'>[] };
      const importedKeywords = data as ImportedKeyword[];
      itemsAddedCount = importedKeywords.length;
      setKeywords(currentKeywords => {
        const keywordsMap = new Map(currentKeywords.map(k => [k.name, k]));
        
        for (const item of importedKeywords) {
          // FIX: Add type guards to safely handle potentially malformed data from AI conversion.
          if (typeof item !== 'object' || item === null || typeof item.keyword !== 'string' || !item.keyword) {
            continue;
          }

          const newMaterials = (Array.isArray(item.materials) ? item.materials : []).map((m: Omit<Material, 'id' | 'createdAt'>) => ({
            ...m,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
          }));

          if (keywordsMap.has(item.keyword)) {
            const existing = keywordsMap.get(item.keyword)!;
            existing.materials.push(...newMaterials);
          } else {
            keywordsMap.set(item.keyword, {
              id: crypto.randomUUID(),
              name: item.keyword,
              materials: newMaterials,
              createdAt: new Date().toISOString()
            });
          }
        }
        return Array.from(keywordsMap.values());
      });
    } else if (type === 'bible') {
       const importedLocations = data as BibleMaterialLocation[];
       itemsAddedCount = importedLocations.length;
       setBibleData(currentBibleData => [...currentBibleData, ...importedLocations]);
    } else if (type === 'sermon') {
      const importedSermons = (data as Omit<Sermon, 'id' | 'createdAt'>[]).map(s => ({
        ...s,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      }));
      itemsAddedCount = importedSermons.length;
      setSermons(currentSermons => [...currentSermons, ...importedSermons]);
    }
    
    setToast({ message: `${itemsAddedCount}개 항목이 추가되었습니다. 설정에서 되돌릴 수 있습니다.` });
    setMode(type);

  }, [keywords, bibleData, sermons, lastModified, setKeywords, setBibleData, setSermons, setMode, setImportBackup]);
  
  const handleRestoreFromImportBackup = () => {
    if (importBackup && window.confirm('마지막 가져오기 작업을 실행 취소하고 데이터를 이전 상태로 복원하시겠습니까?')) {
        setKeywords(importBackup.keywords);
        setBibleData(importBackup.bibleData);
        setSermons(importBackup.sermons);
        setLastModified(importBackup.lastModified);
        setImportBackup(null);
        setToast({ message: '데이터가 이전 버전으로 복원되었습니다.' });
        setIsSettingsModalOpen(false);
    }
  };

  // --- Unified Excel Handlers ---
  const handleUnifiedExport = useCallback(() => {
    if (originalWorkbook && originalFileName) {
      updateDataAndExport(originalWorkbook, originalFileName, keywords, bibleData, sermons);
    } else {
      exportAllData(keywords, bibleData, sermons);
    }
    const now = new Date().toISOString();
    setLastModified(now);
    setLastSavedTimestamp(now);
  }, [originalWorkbook, originalFileName, keywords, bibleData, sermons, setLastModified, setLastSavedTimestamp]);

  const handleDownloadTemplateFile = () => {
    downloadTemplate();
  };

  const handleImportAllData = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!window.confirm("엑셀 파일에서 모든 데이터를 가져옵니다. 현재 앱의 모든 데이터(키워드, 성경, 설교)가 덮어쓰여집니다. 계속하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
          if (event.target) event.target.value = ''; // Reset file input
          return;
      }

      try {
          const { workbook, keywords: importedKeywords, bibleData: importedBibleData, sermons: importedSermons } = await importAllData(file);
          
          setOriginalWorkbook(workbook);
          setOriginalFileName(file.name);
          
          setKeywords(importedKeywords);
          setBibleData(importedBibleData);
          setSermons(importedSermons);

          const now = new Date().toISOString();
          setLastModified(now);
          setLastSavedTimestamp(now);

          alert(`데이터 가져오기가 완료되었습니다.\n- 키워드: ${importedKeywords.length}개\n- 성경 자료: ${importedBibleData.length}개 위치\n- 설교: ${importedSermons.length}개`);
          setIsSettingsModalOpen(false);
      } catch (error: any) {
          alert(error.message || "데이터를 가져오는 중 오류가 발생했습니다.");
      } finally {
          if (event.target) event.target.value = ''; // Reset file input
      }
  };
  
  // Ctrl+S shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (isDataDirty) {
                handleUnifiedExport();
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDataDirty, handleUnifiedExport]);



  // --- Modal Openers ---
  const openAddMaterialModal = (context: any = {}) => {
    if (mode === 'keyword' && !selectedKeywordId) {
        alert('자료를 추가할 키워드를 선택해주세요.');
        return;
    }
    setMaterialToEdit(null);
    setEditContext({ mode, selectedKeywordId, ...context });
    setIsMaterialModalOpen(true);
  };

  const openEditMaterialModal = (material: Material, context: any) => {
    setMaterialToEdit(material);
    setEditContext({ mode, ...context });
    setIsMaterialModalOpen(true);
  };

  const openAddSermonModal = () => {
      setSermonToEdit(null);
      setIsSermonModalOpen(true);
  }
  
  const openEditSermonModal = (sermon: Sermon) => {
      setSermonToEdit(sermon);
      setIsSermonModalOpen(true);
  }

  // --- Search ---
  const searchResults = useMemo(() => {
    if (!globalSearchTerm) return null;
    const term = globalSearchTerm.toLowerCase();

    const keywordResults = keywords.map(k => {
        const matchingMaterials = k.materials.filter(m =>
            m.content.toLowerCase().includes(term) ||
            m.bookTitle.toLowerCase().includes(term) ||
            m.author.toLowerCase().includes(term)
        );
        if (k.name.toLowerCase().includes(term) || matchingMaterials.length > 0) {
            return { ...k, materials: k.name.toLowerCase().includes(term) ? k.materials : matchingMaterials };
        }
        return null;
    }).filter((k): k is Keyword => k !== null);

    const bibleResults = bibleData.map(l => {
        const matchingMaterials = l.materials.filter(m =>
            m.content.toLowerCase().includes(term) ||
            m.bookTitle.toLowerCase().includes(term) ||
            m.author.toLowerCase().includes(term)
        );
        if (matchingMaterials.length > 0) {
            return { ...l, materials: matchingMaterials };
        }
        return null;
    }).filter((l): l is BibleMaterialLocation => l !== null);

    const sermonResults = sermons.filter(s =>
        s.title.toLowerCase().includes(term) ||
        s.preacher.toLowerCase().includes(term) ||
        s.bibleReference.toLowerCase().includes(term) ||
        s.content.toLowerCase().includes(term)
    );

    return { keywords: keywordResults, bible: bibleResults, sermons: sermonResults };
  }, [globalSearchTerm, keywords, bibleData, sermons]);
  
  const handleGlobalSearch = (term: string) => {
    setGlobalSearchTerm(term);
    setMode('search');
  }
  
  const handleSearchResultClick = (item: any, type: 'keyword' | 'bible' | 'sermon') => {
      if (type === 'keyword') {
          setMode('keyword');
          setSelectedKeywordId(item.id);
      } else if (type === 'bible') {
          setMode('bible');
          setSelectedBook(item.book);
      } else if (type === 'sermon') {
          setMode('sermon');
          setSelectedSermonId(item.id);
      }
      setGlobalSearchTerm('');
  };


  // --- Render Logic ---
  if (pinEnabled && !isAuthenticated) {
      return <AuthScreen onPinVerify={handlePinVerify} />;
  }
    
  const selectedKeyword = useMemo(() => {
    return keywords.find(k => k.id === selectedKeywordId) || null;
  }, [keywords, selectedKeywordId]);

  const materialsForBook = useMemo(() => {
      return bibleData.filter(d => d.book === selectedBook)
            .sort((a,b) => {
                if (a.chapterStart !== b.chapterStart) return a.chapterStart - b.chapterStart;
                return (a.verseStart || 0) - (b.verseStart || 0);
            });
  }, [bibleData, selectedBook]);


  const renderMode = () => {
    switch (mode) {
      case 'keyword':
        return <KeywordMode
          keywords={keywords}
          setKeywords={setKeywords}
          selectedKeyword={selectedKeyword}
          selectedKeywordId={selectedKeywordId}
          onSelectKeyword={(id) => { setSelectedKeywordId(id); setIsSidebarOpen(false); }}
          onAddKeyword={handleAddKeyword}
          onDeleteKeyword={handleDeleteKeyword}
          onAddMaterial={openAddMaterialModal}
          onEditMaterial={(material) => openEditMaterialModal(material, { keywordId: selectedKeywordId })}
          onDeleteMaterial={(materialId: string) => selectedKeywordId && handleDeleteKeywordMaterial(materialId, selectedKeywordId)}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />;
      case 'bible':
        return <BibleMode
            selectedBook={selectedBook}
            onSelectBook={(book) => setSelectedBook(book)}
            materialsForBook={materialsForBook}
            bibleData={bibleData}
            onUpdateBibleData={setBibleData}
            onAddMaterial={(context) => openAddMaterialModal(context)}
            onEditMaterial={(material, location) => openEditMaterialModal(material, {locationId: location.id})}
            onDeleteMaterial={handleDeleteBibleMaterial}
            useAbbreviation={useAbbreviation}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
        />
      case 'sermon':
        return <SermonMode
          sermons={sermons}
          onUpdateSermons={setSermons}
          onAddSermon={openAddSermonModal}
          onEditSermon={openEditSermonModal}
          onDeleteSermon={handleDeleteSermon}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          initialSelectedSermonId={selectedSermonId}
          onSelectSermon={(id) => { setSelectedSermonId(id); setIsSidebarOpen(false); }}
        />
      case 'hwp':
        return <HwpConvertMode 
            geminiApiKey={geminiApiKey} 
            onImportData={handleImportData} 
            hwpConversionEnabled={hwpConversionEnabled}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
        />;
      case 'search':
        return searchResults && <GlobalSearchResults results={searchResults} searchTerm={globalSearchTerm} onClick={handleSearchResultClick} />;
      default:
        return null;
    }
  };

  const Toast = () => {
    if (!toast) return null;
    return (
      <div className="fixed bottom-5 right-5 bg-gray-800 text-white py-3 px-5 rounded-lg shadow-lg z-[100] animate-fade-in-up">
        <span>{toast.message}</span>
      </div>
    );
  };

  return (
    <>
      <div className={`flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans`}>
        <Header 
            mode={mode} 
            setMode={(m) => { setMode(m); setGlobalSearchTerm(''); }}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenUserGuide={() => setIsUserGuideModalOpen(true)}
            gdrive={gdrive}
            onSearch={handleGlobalSearch}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isDataDirty={isDataDirty}
            onUpdate={handleUnifiedExport}
            isUpdateExport={isUpdateExport}
            onImportAll={handleImportAllData}
            hwpConversionEnabled={hwpConversionEnabled}
            apiKey={apiKey}
            clientId={clientId}
        />
        <main className="flex flex-1 overflow-hidden">
          {renderMode()}
        </main>
      </div>
      <AddEditMaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSave={handleSaveMaterial}
        materialToEdit={materialToEdit}
        lastAddedMaterial={lastAddedMaterial}
      />
      <AddEditSermonModal 
        isOpen={isSermonModalOpen}
        onClose={() => setIsSermonModalOpen(false)}
        onSave={handleSaveSermon}
        sermonToEdit={sermonToEdit}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        useAbbreviation={useAbbreviation}
        setUseAbbreviation={setUseAbbreviation}
        onSetPin={() => setIsPinModalOpen(true)}
        pinEnabled={pinEnabled}
        setPinEnabled={setPinEnabled}
        hasPin={!!pinHash}
        onSetAdminPin={() => setIsAdminPinModalOpen(true)}
        hasAdminPin={!!adminPinHash}
        onManageAnnouncement={() => handleAdminAction(() => setIsAdminAnnouncementModalOpen(true))}
        apiKey={apiKey}
        setApiKey={setApiKey}
        clientId={clientId}
        setClientId={setClientId}
        geminiApiKey={geminiApiKey}
        setGeminiApiKey={setGeminiApiKey}
        hwpConversionEnabled={hwpConversionEnabled}
        setHwpConversionEnabled={setHwpConversionEnabled}
        onOpenApiGuide={() => setIsApiGuideOpen(true)}
        gdrive={gdrive}
        isImportBackupAvailable={!!importBackup}
        onRestoreFromImportBackup={handleRestoreFromImportBackup}
        onExportAll={handleUnifiedExport}
        onImportAll={handleImportAllData}
        onDownloadTemplate={handleDownloadTemplateFile}
        isUpdateExport={isUpdateExport}
      />
      <PinManagementModal 
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onPinSet={handleSetPin}
        pinHash={pinHash}
      />
      <GoogleApiGuideModal
        isOpen={isApiGuideOpen}
        onClose={() => setIsApiGuideOpen(false)}
      />
      <UserGuideModal
        isOpen={isUserGuideModalOpen}
        onClose={() => setIsUserGuideModalOpen(false)}
      />
      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={handleCloseAnnouncement}
        content={localAnnouncement?.content || ''}
      />
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onVerify={handleAdminPinVerify}
      />
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onPinSet={handleSetAdminPin}
        pinHash={adminPinHash}
      />
      <AdminAnnouncementModal
        isOpen={isAdminAnnouncementModalOpen}
        onClose={() => setIsAdminAnnouncementModalOpen(false)}
        onSave={handleSaveAnnouncement}
        announcement={localAnnouncement}
      />
      <Toast />
    </>
  );
};

export default App;
