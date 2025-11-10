import React, { useState, useEffect } from 'react';
import { SearchIcon, Cog6ToothIcon, GoogleDriveIcon, XMarkIcon, Bars3Icon, ArrowUpTrayIcon, QuestionMarkCircleIcon } from './icons';

interface HeaderProps {
  mode: 'keyword' | 'bible' | 'sermon' | 'search' | 'hwp';
  setMode: (mode: 'keyword' | 'bible' | 'sermon' | 'hwp') => void;
  onOpenSettings: () => void;
  onOpenUserGuide: () => void;
  gdrive: {
    isSignedIn: boolean;
    syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
    handleSignIn: () => void;
    syncData: () => void;
  };
  onSearch: (term: string) => void;
  onToggleSidebar: () => void;
  isDataDirty: boolean;
  onUpdate: () => void;
  isUpdateExport: boolean;
  onImportAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ mode, setMode, onOpenSettings, onOpenUserGuide, gdrive, onSearch, onToggleSidebar, isDataDirty, onUpdate, isUpdateExport, onImportAll }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  useEffect(() => {
      if (mode !== 'search') {
          setSearchTerm('');
      }
  }, [mode]);

  const syncIndicatorColor = {
    idle: 'text-gray-400',
    syncing: 'text-yellow-400 animate-pulse',
    synced: 'text-green-400',
    error: 'text-red-400',
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-3 flex justify-between items-center z-10 flex-shrink-0">
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

      <nav className="hidden md:flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-full">
        <button onClick={() => setMode('keyword')} className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === 'keyword' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          키워드
        </button>
        <button onClick={() => setMode('bible')} className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === 'bible' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          성경
        </button>
        <button onClick={() => setMode('sermon')} className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === 'sermon' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          설교
        </button>
        <button onClick={() => setMode('hwp')} className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === 'hwp' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          HWP 변환
        </button>
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
            <option value="hwp">HWP 변환</option>
        </select>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
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
            onClick={gdrive.isSignedIn ? gdrive.syncData : gdrive.handleSignIn}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            title={gdrive.isSignedIn ? 'Google Drive에 지금 동기화' : 'Google Drive에 연결'}
        >
            <GoogleDriveIcon className={`w-5 h-5 ${gdrive.isSignedIn ? syncIndicatorColor[gdrive.syncStatus] : 'text-gray-400'}`}/>
        </button>
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
      </div>
    </header>
  );
};

export default Header;
