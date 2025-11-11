import React from 'react';
import { Material } from '../types';
import { PencilIcon, TrashIcon } from './icons';
import { useI18n } from '../i18n';

interface MaterialItemProps {
  material: Material;
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
  hideActions?: boolean;
}

const formatCitation = (material: Material) => {
    const { author, bookTitle, publicationInfo, pages } = material;
    let citation = '';
    if (author) {
        citation += `${author},`;
    }
    citation += `『${bookTitle}』`;
    if (publicationInfo) {
        citation += `(${publicationInfo})`;
    }
    if (pages) {
        citation += `, ${pages}.`;
    }
    return citation;
}

const MaterialItem: React.FC<MaterialItemProps> = ({ material, onEdit, onDelete, hideActions }) => {
  const { t } = useI18n();
  
  return (
    <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700 relative group cursor-pointer"
        onDoubleClick={() => onEdit(material)}
    >
        {!hideActions && (
          <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(material)} className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400" title={t('common.edit')}>
                  <PencilIcon className="w-5 h-5"/>
              </button>
              <button onClick={() => onDelete(material.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400" title={t('common.delete')}>
                  <TrashIcon className="w-5 h-5"/>
              </button>
          </div>
        )}
        <p className="text-md font-semibold text-gray-800 dark:text-white mb-2 pr-16">
            {formatCitation(material)}
        </p>
        {material.contentImage && (
            <div className="mb-4">
                <img src={material.contentImage} alt="Material content" className="max-w-full max-h-96 rounded-md object-contain mx-auto" />
            </div>
        )}
        {material.content && (
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {material.content}
            </div>
        )}
    </div>
  );
};

export default MaterialItem;
