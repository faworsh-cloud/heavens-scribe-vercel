import React from 'react';
import { XMarkIcon } from './icons';
import { useI18n } from '../i18n';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl transform transition-all relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex-shrink-0">{t('modals.userGuide.title')}</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none flex-grow overflow-y-auto pr-4 -mr-4">
            <p>{t('modals.userGuide.welcome')}</p>

            <h4 dangerouslySetInnerHTML={{ __html: t('modals.userGuide.coreConceptTitle') }} />
            <p dangerouslySetInnerHTML={{ __html: t('modals.userGuide.coreConceptBody') }} />
            
            <h4>
                <strong>{t('modals.userGuide.workflowTitle')}</strong>
                <code className="ml-2 text-xs">{t('modals.userGuide.workflowSteps')}</code>
            </h4>

            <ol>
                <li>
                    <strong>{t('modals.userGuide.step1Title')}</strong> <span dangerouslySetInnerHTML={{ __html: t('modals.userGuide.step1Body') }} />
                    <br/>
                    <small>{t('modals.userGuide.step1Note')}</small>
                </li>
                <li>
                    <strong>{t('modals.userGuide.step2Title')}</strong> {t('modals.userGuide.step2Body')}
                </li>
                <li>
                    <strong>{t('modals.userGuide.step3Title')}</strong> <span dangerouslySetInnerHTML={{ __html: t('modals.userGuide.step3Body') }} />
                    <br/>
                    <strong className="text-red-600">{t('modals.userGuide.step3Note')}</strong>
                </li>
            </ol>
            
            <h4>{t('modals.userGuide.featuresTitle')}</h4>
            <ul>
                <li dangerouslySetInnerHTML={{ __html: t('modals.userGuide.featureGlobalSearch') }} />
                <li dangerouslySetInnerHTML={{ __html: t('modals.userGuide.featureDoubleClick') }} />
                <li dangerouslySetInnerHTML={{ __html: t('modals.userGuide.featureKeywordMode') }} />
                <li dangerouslySetInnerHTML={{ __html: t('modals.userGuide.featureBibleMode') }} />
                <li dangerouslySetInnerHTML={{ __html: t('modals.userGuide.featureSermonMode') }} />
            </ul>

            <h4>{t('modals.userGuide.advancedFeaturesTitle')}</h4>
            <ul>
                 <li dangerouslySetInnerHTML={{ __html: t('modals.userGuide.featureHwpConvert') }} />
                 <li>
                    <span dangerouslySetInnerHTML={{ __html: t('modals.userGuide.featureGdriveSync') }} />
                    <br/>
                    <small>{t('modals.userGuide.featureGdriveSyncNote')}</small>
                </li>
            </ul>

            <h4>{t('modals.userGuide.otherSettingsTitle')}</h4>
            <ul>
                <li dangerouslySetInnerHTML={{ __html: t('modals.userGuide.settingsDisplay') }} />
                <li dangerouslySetInnerHTML={{ __html: t('modals.userGuide.settingsSecurity') }} />
                <li dangerouslySetInnerHTML={{ __html: t('modals.userGuide.settingsApi') }} />
            </ul>
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

export default UserGuideModal;
