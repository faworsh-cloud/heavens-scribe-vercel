import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';
import { useI18n } from '../i18n';

interface GoogleApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleApiGuideModal: React.FC<GoogleApiGuideModalProps> = ({ isOpen, onClose }) => {
    const { t } = useI18n();
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        if (isOpen) {
            setOrigin(window.location.origin);
        }
    }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl transform transition-all relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex-shrink-0">{t('modals.apiGuide.title')}</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none flex-grow overflow-y-auto pr-4 -mr-4">
            <p dangerouslySetInnerHTML={{ __html: t('modals.apiGuide.intro') }} />

            <h4>{t('modals.apiGuide.step1Title')}</h4>
            <ol>
                {/* FIX: Cast options to `any` to satisfy the `t` function's original type signature while allowing `returnObjects`. The `t` function itself is updated to handle this. */}
                {(t('modals.apiGuide.step1', { returnObjects: true } as any) as unknown as string[]).map((item, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
            </ol>

            <h4>{t('modals.apiGuide.step2Title')}</h4>
            <ol>
                {(t('modals.apiGuide.step2', { returnObjects: true } as any) as unknown as string[]).map((item, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
            </ol>
            
            <h4>{t('modals.apiGuide.step3Title')}</h4>
            <ol>
                {(t('modals.apiGuide.step3', { returnObjects: true } as any) as unknown as string[]).map((item, index) => (
                    index === 6 ? 
                    <li key={index}>{item}<br /><code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-red-600">{origin}</code></li> :
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
            </ol>
            
            <h4>{t('modals.apiGuide.step4Title')}</h4>
            <ol>
                <li dangerouslySetInnerHTML={{ __html: t('modals.apiGuide.step4_1') }} />
                <li dangerouslySetInnerHTML={{ __html: t('modals.apiGuide.step4_2') }} />
                <li>
                    {t('modals.apiGuide.step4_3_list_title')}
                    <ul>
                        {(t('modals.apiGuide.step4_3_list', { returnObjects: true } as any) as unknown as string[]).map((item, index) => (
                            <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </ul>
                </li>
                 <li dangerouslySetInnerHTML={{ __html: t('modals.apiGuide.step4_4') }} />
                 <li dangerouslySetInnerHTML={{ __html: t('modals.apiGuide.step4_5') }} />
                 <li dangerouslySetInnerHTML={{ __html: t('modals.apiGuide.step4_6') }} />
                 <li dangerouslySetInnerHTML={{ __html: t('modals.apiGuide.step4_7') }} />
                 <li dangerouslySetInnerHTML={{ __html: t('modals.apiGuide.step4_8') }} />
                 <li dangerouslySetInnerHTML={{ __html: t('modals.apiGuide.step4_9') }} />
                <li>
                    {t('modals.apiGuide.step4_10_list_title')}
                     <ul>
                        {(t('modals.apiGuide.step4_10_list', { returnObjects: true } as any) as unknown as string[]).map((item, index) => (
                             index === 2 ?
                             <li key={index}>{item}<br/><code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-red-600">{origin}</code></li> :
                             <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </ul>
                </li>
                 <li dangerouslySetInnerHTML={{ __html: t('modals.apiGuide.step4_11') }} />
                 <li dangerouslySetInnerHTML={{ __html: t('modals.apiGuide.step4_12') }} />
            </ol>

        </div>
        <div className="mt-6 flex justify-end flex-shrink-0">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                {t('common.close')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleApiGuideModal;
