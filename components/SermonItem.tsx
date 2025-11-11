import React from 'react';
import { Sermon } from '../types';
import { PencilIcon, TrashIcon } from './icons';
import { useI18n } from '../i18n';

interface SermonItemProps {
  sermon: Sermon;
  onEdit: (sermon: Sermon) => void;
  onDelete: (id: string) => void;
}

const SermonItem: React.FC<SermonItemProps> = ({ sermon, onEdit, onDelete }) => {
  const { t } = useI18n();
  
  return (
    <div 
        id={`sermon-${sermon.id}`} 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700 relative group cursor-pointer"
        onDoubleClick={() => onEdit(sermon)}
    >
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
                onClick={() => onEdit(sermon)}
                className="p-2 text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={t('common.edit')}
                title={t('common.edit')}
            >
                <PencilIcon className="w-5 h-5"/>
            </button>
            <button
                onClick={() => {
                    if (window.confirm(t('common.deleteSermonConfirm', { title: sermon.title }))) {
                        onDelete(sermon.id);
                    }
                }}
                className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={t('common.delete')}
                title={t('common.delete')}
            >
                <TrashIcon className="w-5 h-5"/>
            </button>
        </div>
        
        <div className="pr-16">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{sermon.title}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-2">
                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                    sermon.style === 'topic' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                }`}>
                    {sermon.style === 'topic' ? t('modals.addSermon.styleTopic') : t('modals.addSermon.styleExpository')}
                </span>
                <span>{sermon.preacher}</span>
                <span className="hidden sm:inline">|</span>
                <span>{sermon.date}</span>
                <span className="hidden sm:inline">|</span>
                <span className="font-semibold">{sermon.bibleReference}</span>
            </div>
        </div>
        
        <div className="prose prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {sermon.content}
        </div>
    </div>
  );
};

export default SermonItem;
