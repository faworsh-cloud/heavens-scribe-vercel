import React from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from './icons';

interface SaveFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl?: string | null;
  fileName?: string | null;
}

const SaveFileModal: React.FC<SaveFileModalProps> = ({ isOpen, onClose, fileUrl, fileName }) => {
  if (!isOpen || !fileUrl || !fileName) return null;

  const handleCopyFilename = () => {
    navigator.clipboard.writeText(fileName).then(() => {
      alert('파일 이름이 복사되었습니다.');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg transform transition-all relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                <ArrowDownTrayIcon className="h-6 w-6 text-green-600 dark:text-green-300" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">파일 저장 준비 완료</h2>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    아래 링크를 <strong className="text-primary-600 dark:text-primary-400">마우스 오른쪽 버튼으로 클릭</strong>한 후,
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    <strong className="text-primary-600 dark:text-primary-400">'다른 이름으로 링크 저장...'</strong> (Save Link As...)을 선택하여 파일을 저장하세요.
                </p>
            </div>

            <div className="mt-6">
                <a
                    href={fileUrl}
                    download={fileName}
                    className="block w-full text-center px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors break-all"
                    onClick={(e) => {
                        // Prevent direct left-click download to encourage right-clicking
                        e.preventDefault();
                        alert("왼쪽 클릭이 아닌, 마우스 오른쪽 버튼을 클릭하여 '다른 이름으로 링크 저장'을 선택해주세요.");
                    }}
                    onContextMenu={(e) => {
                        // Allow context menu to proceed
                    }}
                >
                    {fileName}
                </a>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    type="button"
                    onClick={handleCopyFilename}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                    파일 이름 복사
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gray-500 border border-transparent rounded-md shadow-sm hover:bg-gray-600"
                >
                    닫기
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SaveFileModal;
