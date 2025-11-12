import React, { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ChevronDownIcon } from './icons';
import { UserProfile } from '../types';

type FontSize = 'sm' | 'base' | 'lg' | 'xl';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  useAbbreviation: boolean;
  setUseAbbreviation: (value: boolean) => void;
  onSetPin: () => void;
  pinEnabled: boolean;
  setPinEnabled: (enabled: boolean) => void;
  hasPin: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  clientId: string;
  setClientId: (id: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  hwpConversionEnabled: boolean;
  setHwpConversionEnabled: (enabled: boolean) => void;
  onOpenApiGuide: () => void;
  isImportBackupAvailable: boolean;
  onRestoreFromImportBackup: () => void;
  onExportAll: () => void;
  onImportAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  isUpdateExport: boolean;
  gdrive: {
    isSignedIn: boolean;
    isReady: boolean;
    syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
    driveFileName: string | null;
    handleSignIn: (onSuccess?: () => void) => void;
    handleSignOut: () => void;
    syncData: () => void;
    isBackupAvailable: boolean;
    restoreFromBackup: () => void;
    userProfile: UserProfile | null;
  };
}

const fontSizes: { key: FontSize; label: string }[] = [
  { key: 'sm', label: '작게' },
  { key: 'base', label: '기본' },
  { key: 'lg', label: '크게' },
  { key: 'xl', label: '아주 크게' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    fontSize, 
    setFontSize, 
    useAbbreviation, 
    setUseAbbreviation,
    onSetPin,
    pinEnabled,
    setPinEnabled,
    hasPin,
    apiKey,
    setApiKey,
    clientId,
    setClientId,
    geminiApiKey,
    setGeminiApiKey,
    hwpConversionEnabled,
    setHwpConversionEnabled,
    onOpenApiGuide,
    isImportBackupAvailable,
    onRestoreFromImportBackup,
    onExportAll,
    onImportAll,
    onDownloadTemplate,
    isUpdateExport,
    gdrive
}) => {
    const [localApiKey, setLocalApiKey] = useState(apiKey);
    const [localClientId, setLocalClientId] = useState(clientId);
    const [localGeminiApiKey, setLocalGeminiApiKey] = useState(geminiApiKey);
    const [isGeminiSettingsExpanded, setIsGeminiSettingsExpanded] = useState(false);


    useEffect(() => {
        if(isOpen) {
            setLocalApiKey(apiKey);
            setLocalClientId(clientId);
            setLocalGeminiApiKey(geminiApiKey);
        }
    }, [isOpen, apiKey, clientId, geminiApiKey]);

    const handleApiSave = () => {
        setApiKey(localApiKey);
        setClientId(localClientId);
        alert('API 정보가 저장되었습니다. 앱을 새로고침하여 적용해주세요.');
        onClose();
    };

    const handleGeminiApiSave = () => {
        setGeminiApiKey(localGeminiApiKey);
        alert('Gemini API 키가 저장되었습니다.');
    };

    const syncStatusText: Record<typeof gdrive.syncStatus, string> = {
        idle: '준비됨',
        syncing: '동기화 중...',
        synced: '동기화 완료',
        error: '오류 발생',
    };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg transform transition-all relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">설정</h2>
        
        <div className="space-y-6 overflow-y-auto pr-2 -mr-2">
          {/* Data Management */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">데이터 관리</h3>
            <div className="space-y-2 bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                {isImportBackupAvailable ? (
                    <>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            데이터를 잘못 가져온 경우, 가장 최근에 가져오기 전 상태로 복원할 수 있습니다.
                        </p>
                        <button 
                            onClick={onRestoreFromImportBackup} 
                            className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md shadow-sm hover:bg-yellow-600"
                        >
                            가져오기 이전으로 복원
                        </button>
                    </>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        현재 되돌릴 수 있는 데이터 가져오기 작업이 없습니다.
                    </p>
                )}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                  <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">통합 데이터 관리</h4>
                  <div className="mt-2 mb-3 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg flex items-start gap-3">
                      <InformationCircleIcon className="w-5 h-5 text-blue-500 dark:text-blue-300 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-700 dark:text-blue-200">
                          <p className="font-semibold">파일 저장 위치 안내</p>
                          <p>파일이 저장되는 위치는 웹 브라우저의 설정에 따라 결정됩니다.</p>
                          <p className="mt-1">
                              <strong>팁:</strong> 매번 저장 위치를 선택하려면, 브라우저 설정에서 '다운로드 전에 각 파일의 저장 위치 확인' 옵션을 켜주세요.
                          </p>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <button
                          onClick={onDownloadTemplate}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                          <ArrowDownTrayIcon className="w-5 h-5"/>
                          템플릿 파일 다운로드
                      </button>
                      <button
                          onClick={onExportAll}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                          <ArrowDownTrayIcon className="w-5 h-5"/>
                          {isUpdateExport ? '가져온 파일에 업데이트' : '전체 데이터 내보내기'}
                      </button>
                      <label className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                          <ArrowUpTrayIcon className="w-5 h-5"/>
                          전체 데이터 가져오기
                          <input type="file" accept=".xlsx, .xls" className="hidden" onChange={onImportAll} />
                      </label>
                  </div>
                </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Display Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">화면</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">글자 크기</label>
                <div className="flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                  {fontSizes.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFontSize(key)}
                      className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                        fontSize === key
                          ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                    <label htmlFor="useAbbreviation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">성경 약어 사용</label>
                    <button
                        type="button" id="useAbbreviation" onClick={() => setUseAbbreviation(!useAbbreviation)}
                        className={`${useAbbreviation ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                        role="switch" aria-checked={useAbbreviation}
                    >
                        <span aria-hidden="true" className={`${useAbbreviation ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                    </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">성경 목록을 약어(예: 창)로 표시하여 간결하게 봅니다.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Security Settings */}
           <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">보안</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">사용자 PIN 잠금</span>
                <button
                  type="button" onClick={() => setPinEnabled(!pinEnabled)} disabled={!hasPin}
                  className={`${pinEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  role="switch" aria-checked={pinEnabled}
                >
                  <span aria-hidden="true" className={`${pinEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                </button>
              </div>
               <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">PIN을 먼저 설정해야 잠금 기능을 사용할 수 있습니다.</p>
              <button onClick={onSetPin} className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
                {hasPin ? '사용자 PIN 변경' : '사용자 PIN 설정'}
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

           {/* Drive Sync Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Google Drive 동기화</h3>
            <div className="space-y-4 bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">API 키</label>
                <input id="api-key" type="password" value={localApiKey} onChange={(e) => setLocalApiKey(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm" />
              </div>
              <div>
                <label htmlFor="client-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">클라이언트 ID</label>
                <input id="client-id" type="password" value={localClientId} onChange={(e) => setLocalClientId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm" />
              </div>
              <div className="flex justify-between items-center gap-2 flex-wrap">
                 <button onClick={onOpenApiGuide} className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    <InformationCircleIcon className="w-4 h-4" />
                    <span>발급 방법 안내</span>
                 </button>
                 <button onClick={handleApiSave} className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                    API 정보 저장
                </button>
              </div>
               <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
               <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <p><strong>상태:</strong> {gdrive.isSignedIn ? `연결됨 (${syncStatusText[gdrive.syncStatus]})` : '연결되지 않음'}</p>
                    {gdrive.isSignedIn && <p><strong>파일:</strong> {gdrive.driveFileName || '파일을 찾는 중...'}</p>}
               </div>
               <div className="grid grid-cols-2 gap-2 pt-2">
                    {gdrive.isSignedIn ? 
                        <button onClick={gdrive.handleSignOut} className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600">
                           연결 끊기
                        </button>
                        :
                        <button onClick={() => gdrive.handleSignIn(gdrive.syncData)} disabled={!gdrive.isReady} className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 disabled:bg-gray-400">
                           연결 및 동기화
                        </button>
                    }
                    <button onClick={gdrive.syncData} disabled={!gdrive.isSignedIn || gdrive.syncStatus === 'syncing'} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50">
                        지금 동기화
                    </button>
                    {gdrive.isBackupAvailable && (
                        <button onClick={gdrive.restoreFromBackup} className="col-span-2 px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-300 rounded-md shadow-sm hover:bg-yellow-400">
                            동기화 전 백업 복원
                        </button>
                    )}
               </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
          
          {/* AI (Gemini) API Settings */}
          <div>
            <button
                onClick={() => setIsGeminiSettingsExpanded(!isGeminiSettingsExpanded)}
                className="w-full flex justify-between items-center text-left text-lg font-medium text-gray-800 dark:text-white"
                aria-expanded={isGeminiSettingsExpanded}
            >
                <span>AI 변환 기능 (Gemini)</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isGeminiSettingsExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isGeminiSettingsExpanded && (
                <div className="mt-3 space-y-4 bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">HWP 자동 변환 기능 사용</span>
                      <button
                        type="button" onClick={() => setHwpConversionEnabled(!hwpConversionEnabled)}
                        className={`${hwpConversionEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                        role="switch" aria-checked={hwpConversionEnabled}
                      >
                        <span aria-hidden="true" className={`${hwpConversionEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        HWP 변환 기능을 사용하려면 Google AI Studio에서 발급받은 Gemini API 키가 필요합니다. 이 키에 대한 사용 비용은 사용자에게 직접 청구됩니다.
                    </p>
                    <div>
                        <label htmlFor="gemini-api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gemini API 키</label>
                        <input id="gemini-api-key" type="password" value={localGeminiApiKey} onChange={(e) => setLocalGeminiApiKey(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm" />
                    </div>
                    <div className="flex justify-between items-center gap-2 flex-wrap">
                        <a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                            <InformationCircleIcon className="w-4 h-4" />
                            <span>Gemini API 키 발급 방법</span>
                        </a>
                        <button onClick={handleGeminiApiSave} className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                            Gemini 키 저장
                        </button>
                    </div>
                </div>
            )}
           </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SettingsModal;