import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, Cog6ToothIcon, GoogleDriveIcon, XMarkIcon, Bars3Icon, ArrowUpTrayIcon, QuestionMarkCircleIcon, EnvelopeIcon } from './icons';
import { UserProfile } from '../types';

interface HeaderProps {
  mode: 'keyword' | 'bible' | 'sermon' | 'search' | 'hwp';
  setMode: (mode: 'keyword' | 'bible' | 'sermon' | 'hwp') => void;
  onOpenSettings: () => void;
  onOpenUserGuide: () => void;
  gdrive: {
    isSignedIn: boolean;
    syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
    handleSignIn: () => void;
    handleSignOut: () => void;
    syncData: () => void;
    userProfile: UserProfile | null;
  };
  onSearch: (term: string) => void;
  onToggleSidebar: () => void;
  isDataDirty: boolean;
  onUpdate: () => void;
  isUpdateExport: boolean;
  onImportAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hwpConversionEnabled: boolean;
  apiKey: string;
  clientId: string;
}

const Header: React.FC<HeaderProps> = ({ mode, setMode, onOpenSettings, onOpenUserGuide, gdrive, onSearch, onToggleSidebar, isDataDirty, onUpdate, isUpdateExport, onImportAll, hwpConversionEnabled, apiKey, clientId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const isDriveConfigured = !!(apiKey && clientId);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      if (isMobileSearchOpen) {
        setIsMobileSearchOpen(false);
      }
    }
  };

  useEffect(() => {
    if (mode !== 'search') {
        setSearchTerm('');
    }
  }, [mode]);
  
  useEffect(() => {
    if (isMobileSearchOpen) {
      mobileSearchInputRef.current?.focus();
    }
  }, [isMobileSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setIsProfileOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, []);


  const syncIndicatorColor = {
    idle: 'text-gray-400',
    syncing: 'text-yellow-400 animate-pulse',
    synced: 'text-green-400',
    error: 'text-red-400',
  };
  
  const mailtoHref = `mailto:faworsh@gmail.com?subject=${encodeURIComponent("Heaven's Scribe 피드백")}&body=${encodeURIComponent("앱 사용 중 발견한 문제점이나 개선 아이디어를 자유롭게 작성해주세요.\n\n")}`;


  return (
    <header className="relative bg-white dark:bg-gray-800 shadow-md p-3 flex justify-between items-center z-10 flex-shrink-0">
      {isMobileSearchOpen && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 flex items-center p-3 z-20 sm:hidden">
            <form onSubmit={handleSearchSubmit} className="relative flex-grow">
                <input
                    ref={mobileSearchInputRef}
                    type="search"
                    placeholder="전체 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-full bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
            </form>
            <button 
                onClick={() => setIsMobileSearchOpen(false)} 
                className="p-2 ml-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="검색 닫기"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none lg:hidden"
          aria-label="메뉴 열기"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400 hidden sm:block">Heaven's scribe</h1>
      </div>

      <nav className="hidden md:flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 px-1 rounded-full">
        <button onClick={() => setMode('keyword')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${mode === 'keyword' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          키워드
        </button>
        <button onClick={() => setMode('bible')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${mode === 'bible' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          성경
        </button>
        <button onClick={() => setMode('sermon')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${mode === 'sermon' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          설교
        </button>
        {hwpConversionEnabled && (
            <button onClick={() => setMode('hwp')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${mode === 'hwp' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            HWP 변환
            </button>
        )}
      </nav>
      {/* Mobile nav */}
      <div className="md:hidden">
         <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="block w-full pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
        >
            <option value="keyword">키워드</option>
            <option value="bible">성경</option>
            <option value="sermon">설교</option>
            {hwpConversionEnabled && <option value="hwp">HWP 변환</option>}
        </select>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {isDataDirty ? (
          <button
            onClick={onUpdate}
            className="animate-pulse flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            title="엑셀 파일을 최신 내용으로 업데이트 (Ctrl+S)"
          >
            <ArrowUpTrayIcon className="w-5 h-5"/>
            <span className="hidden sm:inline">파일 업데이트</span>
            <span className="hidden lg:inline text-xs">(Ctrl+S)</span>
          </button>
        ) : !isUpdateExport && (
            <label
              className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              title="시작하려면 엑셀 파일에서 데이터를 가져오세요."
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
              <span className="hidden sm:inline">전체 데이터 가져오기</span>
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={onImportAll} />
            </label>
        )}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
          <input
            type="search"
            placeholder="전체 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-32 sm:w-48 pl-9 pr-3 py-2 text-sm border rounded-full bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400" />
          </div>
        </form>
        
        <button
          onClick={() => setIsMobileSearchOpen(true)}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none sm:hidden"
          aria-label="검색"
        >
          <SearchIcon className="w-6 h-6" />
        </button>

        {isDriveConfigured && (
            <button
                onClick={gdrive.syncData}
                disabled={!gdrive.isSignedIn}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                title={gdrive.isSignedIn ? 'Google Drive에 지금 동기화' : '로그인하여 동기화 활성화'}
            >
                <GoogleDriveIcon className={`w-5 h-5 ${gdrive.isSignedIn ? syncIndicatorColor[gdrive.syncStatus] : 'text-gray-400'}`}/>
            </button>
        )}
        <a
          href={mailtoHref}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          aria-label="피드백 보내기"
          title="피드백 보내기"
        >
          <EnvelopeIcon className="w-6 h-6" />
        </a>
        <button
          onClick={onOpenUserGuide}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          aria-label="사용 설명서"
        >
          <QuestionMarkCircleIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          aria-label="설정"
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </button>

        {isDriveConfigured && (
            <div className="relative">
                {gdrive.userProfile ? (
                    <button onClick={() => setIsProfileOpen(prev => !prev)} className="flex items-center focus:outline-none">
                        <img src={gdrive.userProfile.picture} alt="User profile" className="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-primary-500" />
                    </button>
                ) : (
                    <button onClick={() => gdrive.handleSignIn()} className="px-3 py-1.5 text-sm font-semibold rounded-full transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600">
                        로그인
                    </button>
                )}
                {isProfileOpen && gdrive.userProfile && (
                    <div ref={profileMenuRef} className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{gdrive.userProfile.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{gdrive.userProfile.email}</p>
                            </div>
                            <button 
                                onClick={() => { gdrive.handleSignOut(); setIsProfileOpen(false); }} 
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;
