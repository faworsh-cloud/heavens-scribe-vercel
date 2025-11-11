import React, { useState, useEffect } from 'react';
import { Sermon } from '../types';
import { XMarkIcon } from './icons';

interface AddEditSermonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sermon: Omit<Sermon, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  sermonToEdit?: Sermon | null;
}

const exampleContent =
`# 서론



# 본론



# 결론

`;

const AddEditSermonModal: React.FC<AddEditSermonModalProps> = ({ isOpen, onClose, onSave, sermonToEdit }) => {
  const [type, setType] = useState<'my' | 'other'>('my');
  const [style, setStyle] = useState<'topic' | 'expository'>('expository');
  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('');
  const [date, setDate] = useState('');
  const [bibleReference, setBibleReference] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (sermonToEdit) {
      setType(sermonToEdit.type);
      setStyle(sermonToEdit.style || 'expository');
      setTitle(sermonToEdit.title);
      setPreacher(sermonToEdit.preacher);
      setDate(sermonToEdit.date);
      setBibleReference(sermonToEdit.bibleReference);
      setContent(sermonToEdit.content);
    } else {
      // Reset form with example content
      setType('my');
      setStyle('expository');
      setTitle('');
      setPreacher('');
      setDate('');
      setBibleReference('');
      setContent(exampleContent);
    }
  }, [sermonToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert('제목과 설교 내용은 필수 항목입니다.');
      return;
    }
    onSave({ type, style, title, preacher, date, bibleReference, content }, sermonToEdit?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl transform transition-all relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{sermonToEdit ? '설교 수정' : '새 설교 추가'}</h2>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="space-y-4 overflow-y-auto pr-2 -mr-2 flex-grow">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">구분</label>
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('my')}
                  className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                    type === 'my'
                      ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  개인 설교
                </button>
                <button
                  type="button"
                  onClick={() => setType('other')}
                  className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                    type === 'other'
                      ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  타인 설교
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">설교 종류</label>
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setStyle('expository')}
                  className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                    style === 'expository'
                      ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  본문 설교
                </button>
                <button
                  type="button"
                  onClick={() => setStyle('topic')}
                  className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                    style === 'topic'
                      ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  주제 설교
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">제목</label>
              <input
                id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label htmlFor="preacher" className="block text-sm font-medium text-gray-700 dark:text-gray-300">설교자</label>
                <input
                  id="preacher" type="text" value={preacher} onChange={(e) => setPreacher(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">날짜</label>
                <input
                  id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

             <div>
              <label htmlFor="bibleReference" className="block text-sm font-medium text-gray-700 dark:text-gray-300">성경 본문</label>
              <input
                id="bibleReference" type="text" value={bibleReference} onChange={(e) => setBibleReference(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                placeholder="예: 요한복음 3:16-21"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                설교 내용
              </label>
              <textarea
                id="content" value={content} onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3 flex-shrink-0">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              설교 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditSermonModal;