import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, Cog6ToothIcon, GoogleDriveIcon, XMarkIcon, Bars3Icon, ArrowUpTrayIcon, QuestionMarkCircleIcon, EnvelopeIcon, ExclamationCircleIcon } from './icons';
import { UserProfile } from '../types';

interface HeaderProps {
  mode: 'keyword' | 'bible' | 'sermon' | 'search' | 'hwp';
  setMode: (mode: 'keyword' | 'bible' | 'sermon' | 'hwp') => void;
  onOpenSettings: () => void;
  onOpenUserGuide: () => void;
  onOpenAnnouncement: () => void;
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

const Header: React.FC<HeaderProps> = ({ mode, setMode, onOpenSettings, onOpenUserGuide, onOpenAnnouncement, gdrive, onSearch, onToggleSidebar, isDataDirty, onUpdate, isUpdateExport, onImportAll, hwpConversionEnabled, apiKey, clientId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const feedbackMenuRef = useRef<HTMLDivElement>(null);

  const isDriveConfigured = !!(apiKey && clientId);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setIsProfileOpen(false);
        }
        if (feedbackMenuRef.current && !feedbackMenuRef.current.contains(event.target as Node)) {
            setIsFeedbackOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFeedbackOpen) setIsFeedbackOpen(false);
        if (isProfileOpen) setIsProfileOpen(false);
      }
    };

    if (isFeedbackOpen || isProfileOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFeedbackOpen, isProfileOpen, setIsFeedbackOpen, setIsProfileOpen]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('faworsh@gmail.com').then(() => {
        alert('이메일 주소가 복사되었습니다.');
        setIsFeedbackOpen(false);
    }).catch(err => {
        console.error('Failed to copy email: ', err);
        alert('이메일 주소 복사에 실패했습니다.');
    });
  };

  const syncIndicatorColor = {
    idle: 'text-gray-400',
    syncing: 'text-yellow-400 animate-pulse',
    synced: 'text-green-400',
    error: 'text-red-400',
  };
  
  const GDriveButtons = () => (
    <>
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

      {isDriveConfigured && (
          <div className="relative">
              {gdrive.userProfile ? (
                  <button onClick={() => setIsProfileOpen(prev => !prev)} className="flex items-center focus:outline-none">
                      <img src={gdrive.userProfile.picture} alt="User profile" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-primary-500" />
                  </button>
              ) : (
                  <button onClick={() => gdrive.handleSignIn()} className="px-2 py-1 sm:px-3 sm:py-1.5 text-sm font-semibold rounded-full transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600">
                      로그인
                  </button>
              )}
              {isProfileOpen && gdrive.userProfile && (
                  <div ref={profileMenuRef} className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
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
    </>
  );


  return (
    <header className="relative bg-white dark:bg-gray-800 shadow-md p-2 sm:p-3 z-10 flex-shrink-0 flex flex-col gap-y-2">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center space-x-1 sm:space-x-2">
            <button
            onClick={onToggleSidebar}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none lg:hidden"
            aria-label="메뉴 열기"
            >
            <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400 hidden sm:block">Heaven's Scribe</h1>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
            {!isUpdateExport && (
                <label
                className="cursor-pointer flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                title="시작하려면 엑셀 파일에서 데이터를 가져오세요."
                >
                <ArrowUpTrayIcon className="w-5 h-5" />
                <span className="hidden sm:inline whitespace-nowrap">전체 데이터 가져오기</span>
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={onImportAll} />
                </label>
            )}
            
            <GDriveButtons />
            <button
            onClick={onOpenAnnouncement}
            className="p-2 rounded-full text-green-500 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="공지사항"
            title="공지사항"
            >
            <ExclamationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
            onClick={onOpenUserGuide}
            className="p-2 rounded-full text-pink-500 dark:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="도움말"
            title="도움말"
            >
            <QuestionMarkCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="설정"
            title="설정"
            >
            <Cog6ToothIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="relative">
            <button
                onClick={() => setIsFeedbackOpen(prev => !prev)}
                className="p-2 rounded-full text-yellow-500 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="피드백 보내기"
                title="피드백 보내기"
            >
                <EnvelopeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            {isFeedbackOpen && (
                <div ref={feedbackMenuRef} className="absolute right-0 mt-2 w-64 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                <div className="p-4">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2">관리자 이메일</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded-md break-all">
                        faworsh@gmail.com
                    </p>
                    <button
                    onClick={handleCopyEmail}
                    className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                    주소 복사
                    </button>
                </div>
                </div>
            )}
            </div>
        </div>
      </div>
      
      <div className="w-full flex flex-col items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
                <input
                    type="search"
                    placeholder="전체 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-sm border rounded-full bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
            </form>
            <div className="flex items-center justify-center flex-wrap gap-2">
                <nav className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 px-1 rounded-full">
                    <button onClick={() => setMode('keyword')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${mode === 'keyword' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                    키워드
                    </button>
                    <button onClick={() => setMode('bible')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${mode === 'bible' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                    성경
                    </button>
                    <button onClick={() => setMode('sermon')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${mode === 'sermon' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                    설교
                    </button>
                    {hwpConversionEnabled && (
                        <button onClick={() => setMode('hwp')} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${mode === 'hwp' ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        HWP 변환
                        </button>
                    )}
                </nav>
                <button
                    onClick={onUpdate}
                    className="px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap bg-red-500 text-white shadow hover:bg-red-600"
                    title={isDataDirty ? "변경사항 저장 (Ctrl+S)" : "변경사항이 없습니다"}
                >
                    저장하기
                </button>
            </div>
      </div>
    </header>
  );
};

export default Header;