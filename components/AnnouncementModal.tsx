import React, { useState } from 'react';
import { XMarkIcon } from './icons';
import { useI18n } from '../i18n';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: (hideFor7Days: boolean) => void;
  content: string;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ isOpen, onClose, content }) => {
  const { t } = useI18n();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg transform transition-all relative max-h-[90vh] flex flex-col">
        <button type="button" onClick={() => onClose(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex-shrink-0">{t('modals.announcement.title')}</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none flex-grow overflow-y-auto pr-4 -mr-4 whitespace-pre-wrap">
          {content.split('\n').map((line, index) => {
            if (line.startsWith('## ')) {
              return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
            }
            if (line.startsWith('**') && line.endsWith('**')) {
              return <p key={index} className="font-bold">{line.substring(2, line.length - 2)}</p>;
            }
            if (line === '---') {
              return <hr key={index} className="my-4" />;
            }
            return <p key={index}>{line}</p>;
          })}
        </div>
        <div className="mt-6 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center">
                <input
                    id="dont-show-again"
                    name="dont-show-again"
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="dont-show-again" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    {t('modals.announcement.hideFor7Days')}
                </label>
            </div>
            <button
              type="button"
              onClick={() => onClose(dontShowAgain)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t('modals.announcement.confirm')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
