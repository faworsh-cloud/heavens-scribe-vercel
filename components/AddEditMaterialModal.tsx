import React, { useState, useEffect, useCallback } from 'react';
import { Material } from '../types';
import { XMarkIcon } from './icons';

interface AddEditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: Omit<Material, 'id' | 'createdAt'>, id?: string) => void;
  materialToEdit?: Material | null;
  lastAddedMaterial?: Omit<Material, 'id' | 'createdAt'> | null;
}

const AddEditMaterialModal: React.FC<AddEditMaterialModalProps> = ({ isOpen, onClose, onSave, materialToEdit, lastAddedMaterial }) => {
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publicationInfo, setPublicationInfo] = useState('');
  const [pages, setPages] = useState('');
  const [content, setContent] = useState('');
  const [contentImage, setContentImage] = useState<string | null>(null);
  const [shouldUseLast, setShouldUseLast] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (materialToEdit) {
      setBookTitle(materialToEdit.bookTitle);
      setAuthor(materialToEdit.author);
      setPublicationInfo(materialToEdit.publicationInfo);
      setPages(materialToEdit.pages);
      setContent(materialToEdit.content);
      setContentImage(materialToEdit.contentImage || null);
    } else {
      setBookTitle('');
      setAuthor('');
      setPublicationInfo('');
      setPages('');
      setContent('');
      setContentImage(null);
    }
    setShouldUseLast(false);
  }, [materialToEdit, isOpen]);
  
  const toggleUseLastInfo = useCallback(() => {
    setShouldUseLast(prevShouldUseLast => {
        const nextShouldUseLast = !prevShouldUseLast;
        if (nextShouldUseLast && lastAddedMaterial) {
            setBookTitle(lastAddedMaterial.bookTitle);
            setAuthor(lastAddedMaterial.author);
            setPublicationInfo(lastAddedMaterial.publicationInfo);
            setPages(lastAddedMaterial.pages);
            setContent(lastAddedMaterial.content);
            setContentImage(lastAddedMaterial.contentImage || null);
        } else if (!materialToEdit) {
            setBookTitle('');
            setAuthor('');
            setPublicationInfo('');
            setPages('');
            setContent('');
            setContentImage(null);
        }
        return nextShouldUseLast;
    });
  }, [lastAddedMaterial, materialToEdit]);

  const useLastInfoExceptContent = useCallback(() => {
    if (lastAddedMaterial) {
        setBookTitle(lastAddedMaterial.bookTitle);
        setAuthor(lastAddedMaterial.author);
        setPublicationInfo(lastAddedMaterial.publicationInfo);
        setPages(lastAddedMaterial.pages);
        setContent('');
        setContentImage(null);
        setShouldUseLast(true);
    }
  }, [lastAddedMaterial]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1' && !materialToEdit && lastAddedMaterial) {
        e.preventDefault();
        toggleUseLastInfo();
      }
      if (e.key === 'F2' && !materialToEdit && lastAddedMaterial) {
        e.preventDefault();
        useLastInfoExceptContent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, materialToEdit, lastAddedMaterial, toggleUseLastInfo, useLastInfoExceptContent]);


  const processFile = (file: File | null | undefined) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setContentImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle || (content.trim() === '' && !contentImage)) {
      alert('서명과 내용 또는 이미지는 필수 항목입니다.');
      return;
    }
    onSave({ bookTitle, author, publicationInfo, pages, content, contentImage }, materialToEdit?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl transform transition-all relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{materialToEdit ? '자료 수정' : '새 자료 추가'}</h2>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 -mr-2">
          <div className="space-y-4">
            {!materialToEdit && lastAddedMaterial && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shouldUseLast}
                    onChange={toggleUseLastInfo}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  이전 정보 불러오기
                  <span className="text-xs text-gray-500 dark:text-gray-400">(F1: 전체, F2: 내용 제외)</span>
                </label>
              </div>
            )}
            <div>
              <label htmlFor="bookTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">서명</label>
              <input
                id="bookTitle"
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">저자</label>
                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label htmlFor="pages" className="block text-sm font-medium text-gray-700 dark:text-gray-300">페이지</label>
                <input
                  id="pages"
                  type="text"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
             <div>
              <label htmlFor="publicationInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">출판사항</label>
              <input
                id="publicationInfo"
                type="text"
                value={publicationInfo}
                onChange={(e) => setPublicationInfo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                placeholder="예: 서울 : 기독교문서선교회, 1998"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                인용 / 내용
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                required={!contentImage}
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    이미지 첨부
                </label>
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md transition-colors ${isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}`}
                >
                    <div className="space-y-1 text-center">
                        {contentImage ? (
                            <div>
                                <img src={contentImage} alt="Preview" className="mx-auto max-h-40 rounded-md" />
                                <button type="button" onClick={() => { setContentImage(null); (document.getElementById('image-upload') as HTMLInputElement).value = ''; }} className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline">
                                    이미지 삭제
                                </button>
                            </div>
                        ) : (
                            <>
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <label htmlFor="image-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                        <span>파일 업로드</span>
                                        <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                    <p className="pl-1">또는 파일을 끌어다 놓으세요</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              자료 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditMaterialModal;