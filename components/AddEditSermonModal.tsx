import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sermon } from '../types';
import { XMarkIcon, PhotoIcon } from './icons';

interface AddEditSermonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sermon: Omit<Sermon, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  sermonToEdit?: Sermon | null;
  geminiApiKey: string;
}

const exampleContent =
`# 서론



# 본론



# 결론

`;

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

const AddEditSermonModal: React.FC<AddEditSermonModalProps> = ({ isOpen, onClose, onSave, sermonToEdit, geminiApiKey }) => {
  const [type, setType] = useState<'my' | 'other'>('my');
  const [style, setStyle] = useState<'topic' | 'expository'>('expository');
  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('');
  const [date, setDate] = useState('');
  const [bibleReference, setBibleReference] = useState('');
  const [content, setContent] = useState('');

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);


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
    handleRemoveImage();
  }, [sermonToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert('제목과 설교 내용은 필수 항목입니다.');
      return;
    }
    onSave({ type, style, title, preacher, date, bibleReference, content }, sermonToEdit?.id);
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
        
        // If content is the placeholder, replace it. Otherwise, append.
        if (content.trim() === exampleContent.trim()) {
            setContent(extractedText);
        } else {
            setContent(prev => prev.trim() ? `${prev.trim()}\n\n${extractedText}` : extractedText);
        }
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
               <div className="flex justify-between items-center mb-1">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  설교 내용
                </label>
                 {geminiApiKey && (
                  <div className="text-right">
                    <label htmlFor={`ocr-image-upload-sermon-${sermonToEdit?.id || 'new'}`} className="cursor-pointer text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-end gap-1">
                      <PhotoIcon className="w-4 h-4" />
                      이미지에서 텍스트 추출
                      <input id={`ocr-image-upload-sermon-${sermonToEdit?.id || 'new'}`} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} disabled={isOcrLoading} />
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">파일을 드래그하거나 Ctrl+V로 붙여넣으세요</p>
                  </div>
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
                id="content" value={content} onChange={(e) => setContent(e.target.value)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
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