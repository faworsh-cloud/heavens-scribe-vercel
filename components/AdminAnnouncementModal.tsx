import React, { useState, useEffect } from 'react';
import { Announcement } from '../types';
import { XMarkIcon } from './icons';

interface AdminAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (announcement: Omit<Announcement, 'id'>) => void;
  announcement: Announcement | null;
}

const AdminAnnouncementModal: React.FC<AdminAnnouncementModalProps> = ({ isOpen, onClose, onSave, announcement }) => {
  const [content, setContent] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isOpen && announcement) {
      setContent(announcement.content);
      setEnabled(announcement.enabled);
    } else if (isOpen) {
      setContent('');
      setEnabled(false);
    }
  }, [isOpen, announcement]);

  const handleSave = () => {
    onSave({
      content,
      enabled
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl transform transition-all relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">공지사항 관리</h2>
        
        <div className="space-y-4 flex-grow flex flex-col">
          <div className="flex justify-between items-center">
            <label htmlFor="announcement-enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">공지 활성화</label>
            <button
                type="button" id="announcement-enabled" onClick={() => setEnabled(!enabled)}
                className={`${enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                role="switch" aria-checked={enabled}
            >
                <span aria-hidden="true" className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
            </button>
          </div>

          <div>
            <label htmlFor="announcement-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              공지 내용
            </label>
            <textarea
              id="announcement-content" value={content} onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">
            취소
          </button>
          <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncementModal;
