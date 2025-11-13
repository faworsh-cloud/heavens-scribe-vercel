import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Material } from '../types';
import { XMarkIcon, PhotoIcon } from './icons';

interface AddEditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: Omit<Material, 'id' | 'createdAt'>, id?: string) => void;
  materialToEdit?: Material | null;
  lastAddedMaterial?: Omit<Material, 'id' | 'createdAt'> | null;
  geminiApiKey: string;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const AddEditMaterialModal: React.FC<AddEditMaterialModalProps> = ({ isOpen, onClose, onSave, materialToEdit, lastAddedMaterial, geminiApiKey }) => {
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publicationInfo, setPublicationInfo] = useState('');
  const [pages, setPages] = useState('');
  const [content, setContent] = useState('');
  const [shouldUseLast, setShouldUseLast] = useState(false);

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);


  useEffect(() => {
    if (materialToEdit) {
      setBookTitle(materialToEdit.bookTitle);
      setAuthor(materialToEdit.author);
      setPublicationInfo(materialToEdit.publicationInfo);
      setPages(materialToEdit.pages);
      setContent(materialToEdit.content);
    } else {
      setBookTitle('');
      setAuthor('');
      setPublicationInfo('');
      setPages('');
      setContent('');
    }
    setShouldUseLast(false);
    handleRemoveImage();
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
        } else if (!materialToEdit) {
            setBookTitle('');
            setAuthor('');
            setPublicationInfo('');
            setPages('');
            setContent('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle || content.trim() === '') {
      alert('서명과 내용은 필수 항목입니다.');
      return;
    }
    onSave({ bookTitle, author, publicationInfo, pages, content }, materialToEdit?.id);
  };
  
    // --- OCR Handlers ---
  const handleFile = useCallback((file: File | undefined | null) => {
    if (file && file.type.startsWith('image/')) {
        setUploadedImage(file);
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
        setImagePreviewUrl(URL.createObjectURL(file));
        setOcrError(null);
    } else if (file) {
        setOcrError('이미지 파일(jpg, png 등)을 선택해주세요.');
    }
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (event: ClipboardEvent) => {
        if (isOcrLoading) return;
        const items = event.clipboardData?.items;
        if (!items) return;

        let imageFile: File | null = null;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                const blob = items[i].getAsFile();
                if (blob) {
                    const extension = blob.type.split('/')[1] || 'png';
                    imageFile = new File([blob], `pasted-image-${Date.now()}.${extension}`, { type: blob.type });
                    break; 
                }
            }
        }
        
        if (imageFile) {
            event.preventDefault();
            handleFile(imageFile);
        }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, handleFile, isOcrLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0]);
      e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      if (isOcrLoading) return;
      handleFile(e.dataTransfer.files?.[0]);
  };

  const handleRemoveImage = () => {
      if (imagePreviewUrl) {
          URL.revokeObjectURL(imagePreviewUrl);
      }
      setUploadedImage(null);
      setImagePreviewUrl(null);
      setOcrError(null);
  };

  const handleOcr = async () => {
    if (!uploadedImage) {
        setOcrError('먼저 이미지 파일을 업로드해주세요.');
        return;
    }
    if (!geminiApiKey) {
        setOcrError('Gemini API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.');
        return;
    }

    setIsOcrLoading(true);
    setOcrError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const base64Data = await blobToBase64(uploadedImage);
        
        const imagePart = {
            inlineData: {
                mimeType: uploadedImage.type,
                data: base64Data,
            },
        };

        const textPart = {
            text: "Extract all Korean text from the image. Preserve the original line breaks and formatting as much as possible."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const extractedText = response.text;
        setContent(prev => prev.trim() ? `${prev.trim()}\n\n${extractedText}` : extractedText);
        handleRemoveImage();

    } catch (e) {
        console.error("OCR failed:", e);
        setOcrError("이미지에서 텍스트를 추출하는 데 실패했습니다.");
    } finally {
        setIsOcrLoading(false);
    }
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
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  인용 / 내용
                </label>
                {geminiApiKey && (
                  <label htmlFor={`ocr-image-upload-material-${materialToEdit?.id || 'new'}`} className="cursor-pointer text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                    <PhotoIcon className="w-4 h-4" />
                    이미지에서 텍스트 추출
                    <input id={`ocr-image-upload-material-${materialToEdit?.id || 'new'}`} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} disabled={isOcrLoading} />
                  </label>
                )}
              </div>
              
              {imagePreviewUrl && (
                  <div className="p-3 my-2 border rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="relative group max-w-xs mx-auto">
                          <img src={imagePreviewUrl} alt="Preview" className="rounded-md max-h-40 w-auto mx-auto" />
                          <button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="이미지 제거">
                              <XMarkIcon className="w-3 h-3"/>
                          </button>
                      </div>
                      <div className="mt-3 text-center">
                          <button
                              type="button"
                              onClick={handleOcr}
                              disabled={isOcrLoading}
                              className="inline-flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                          >
                              {isOcrLoading ? (
                                  <>
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span>추출 중...</span>
                                  </>
                              ) : (
                                  <span>텍스트 추출</span>
                              )}
                          </button>
                      </div>
                      {ocrError && <p className="text-xs text-red-500 text-center mt-2">{ocrError}</p>}
                  </div>
              )}

              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                rows={8}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-gray-100"
                required
              />
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