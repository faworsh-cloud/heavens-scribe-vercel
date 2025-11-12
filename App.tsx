import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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

type AppMode = 'keyword' | 'bible' | 'sermon' | 'search' | 'hwp';
type FontSize = 'sm' | 'base' | 'lg' | 'xl';

interface AppData {
  keywords: Keyword[];
  bibleData: BibleMaterialLocation[];
  sermons: Sermon[];
  lastModified: string;
}

const CURRENT_ANNOUNCEMENT: Announcement | null = {
    id: 'announcement-help-guide-20240728', // Unique ID for this announcement version
    content: `**'도움말'은 시작 화면 우측 상단에 '?'를 클릭하시면 볼 수 있습니다. 꼭 읽어 주세요.**

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


  // User Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinHash, setPinHash] = useLocalStorage<string | null>('sermon-prep-pin', null);
  const [pinEnabled, setPinEnabled] = useLocalStorage<boolean>('sermon-prep-pin-enabled', false);
  
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
        if (isApiGuideOpen) setIsApiGuideOpen(false);
        else if (isPinModalOpen) setIsPinModalOpen(false);
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
    isApiGuideOpen, setIsApiGuideOpen,
    isPinModalOpen, setIsPinModalOpen,
    isSettingsModalOpen, setIsSettingsModalOpen,
    isUserGuideModalOpen, setIsUserGuideModalOpen,
    isAnnouncementModalOpen, setIsAnnouncementModalOpen
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
        setKeywords