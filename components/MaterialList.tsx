import React from 'react';
import { Keyword, Material } from '../types';
import MaterialItem from './MaterialItem';
import { PlusIcon, BookOpenIcon, KeyIcon } from './icons';
import { useI18n } from '../i18n';

interface MaterialListProps {
  selectedKeyword: Keyword | null;
  onAddMaterial: () => void;
  onEditMaterial: (material: Material) => void;
  onDeleteMaterial: (id: string) => void;
}

const MaterialList: React.FC<MaterialListProps> = ({ selectedKeyword, onAddMaterial, onEditMaterial, onDeleteMaterial }) => {
  const { t } = useI18n();
  
  if (!selectedKeyword) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800/50 rounded-lg shadow-md p-8">
        <KeyIcon className="w-16 h-16 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold">{t('keywordMode.materialList.selectKeywordTitle')}</h2>
        <p>{t('keywordMode.materialList.selectKeywordBody')}</p>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">{t('keywordMode.materialList.selectKeywordExample')}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white truncate" title={selectedKeyword.name}>
          {selectedKeyword.name}
        </h2>
        <div className="flex items-center gap-2">
            <button
              onClick={onAddMaterial}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="w-5 h-5"/>
              <span>{t('keywordMode.materialList.addMaterial')}</span>
            </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {selectedKeyword.materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
             <KeyIcon className="w-12 h-12 mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold">{t('keywordMode.materialList.noMaterialsTitle')}</h3>
            <p>{t('keywordMode.materialList.noMaterialsBody')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedKeyword.materials.map(material => (
              <MaterialItem
                key={material.id}
                material={material}
                onEdit={onEditMaterial}
                onDelete={(id) => {
                  if (window.confirm(t('common.deleteMaterialConfirm'))) {
                    onDeleteMaterial(id);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialList;
