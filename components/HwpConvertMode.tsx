import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { DocumentArrowRightIcon, ArrowDownTrayIcon, PlusIcon, TrashIcon, Cog6ToothIcon } from './icons';
import { BibleMaterialLocation, Material, Sermon } from '../types';

declare const XLSX: any;

type ConversionType = 'keyword' | 'bible' | 'sermon';

interface HwpConvertModeProps {
    onImportData: (data: any[], type: ConversionType) => void;
    geminiApiKey: string;
    hwpConversionEnabled: boolean;
    onOpenSettings: () => void;
}

const HwpConvertMode: React.FC<HwpConvertModeProps> = ({ onImportData, geminiApiKey, hwpConversionEnabled, onOpenSettings }) => {
    const [conversionType, setConversionType] = useState<ConversionType>('keyword');
    const [hwpContent, setHwpContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any[] | null>(null);

    if (!hwpConversionEnabled) {
        return (
          <div className="flex-1 p-4 sm:p-6 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
            <div className="text-center max-w-lg p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Cog6ToothIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">HWP 변환 기능이 비활성화되었습니다.</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                이 기능을 사용하려면 설정에서 'HWP 자동 변환 기능 사용' 옵션을 켜주세요.
              </p>
              <button
                onClick={onOpenSettings}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700"
              >
                설정으로 이동
              </button>
            </div>
          </div>
        );
      }

    const handleConvert = async () => {
        if (!geminiApiKey) {
            setError('Gemini API 키가 설정되지 않았습니다. 우측 상단 설정 아이콘(⚙️)을 클릭하여 API 키를 입력해주세요.');
            return;
        }

        if (!hwpContent.trim()) {
            setError('변환할 내용을 입력해주세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setPreviewData(null);

        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });

            let schema: any;
            let prompt: string;

            const keywordSchema = {
                type: Type.ARRAY,
                description: "입력된 텍스트에서 추출된 키워드별 자료 목록입니다.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        keyword: { type: Type.STRING, description: "자료의 핵심 키워드. 여러 단어는 쉼표로 구분될 수 있습니다 (예: '갈망, 목마름')." },
                        materials: {
                            type: Type.ARRAY,
                            description: "해당 키워드와 관련된 서적 자료 및 인용문 목록입니다.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    bookTitle: { type: Type.STRING, description: "참고 서적의 제목." },
                                    author: { type: Type.STRING, description: "저자 이름. 책 제목 옆 괄호 안에 있는 경우가 많습니다." },
                                    publicationInfo: { type: Type.STRING, description: "출판 정보. 텍스트에 명시되어 있지 않으면 생략합니다." },
                                    pages: { type: Type.STRING, description: "인용된 페이지 번호 (예: '72-75p')." },
                                    content: { type: Type.STRING, description: "인용문 내용. 인용문이 없는 경우 이 필드를 생략하거나 빈 문자열로 둡니다. 소주제가 있는 경우, '소주제: [소주제 내용]' 형식으로 내용의 맨 앞에 추가합니다." },
                                },
                                required: ["bookTitle", "pages"]
                            }
                        }
                    },
                    required: ["keyword", "materials"]
                }
            };

            const bibleSchema = {
                 type: Type.OBJECT,
                properties: {
                    materials: {
                        type: Type.ARRAY,
                        description: "성경 구절별로 정리된 자료 목록입니다.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                book: { type: Type.STRING, description: "성경 책 이름 (예: 창세기)." },
                                chapterStart: { type: Type.NUMBER, description: "시작 장." },
                                verseStart: { type: Type.NUMBER, description: "시작 절 (선택 사항)." },
                                chapterEnd: { type: Type.NUMBER, description: "끝 장 (선택 사항)." },
                                verseEnd: { type: Type.NUMBER, description: "끝 절 (선택 사항)." },
                                bookTitle: { type: Type.STRING, description: "참고 서적 제목." },
                                author: { type: Type.STRING, description: "참고 서적 저자." },
                                publicationInfo: { type: Type.STRING, description: "출판 정보." },
                                pages: { type: Type.STRING, description: "페이지 번호." },
                                content: { type: Type.STRING, description: "인용 내용. 없는 경우 생략합니다." },
                            },
                            required: ["book", "chapterStart", "bookTitle"]
                        }
                    }
                }
            };

            const sermonSchema = {
                type: Type.OBJECT,
                properties: {
                    style: { type: Type.STRING, description: "설교의 종류. 'topic' (주제 설교) 또는 'expository' (본문 설교) 중 하나. 텍스트 내용을 바탕으로 판단합니다. 본문 구절을 순서대로 깊이 있게 다루면 'expository', 특정 주제를 중심으로 여러 구절을 인용하면 'topic'입니다." },
                    title: { type: Type.STRING, description: "설교의 제목." },
                    preacher: { type: Type.STRING, description: "설교자 이름." },
                    date: { type: Type.STRING, description: "설교 날짜 (YYYY-MM-DD 형식)." },
                    bibleReference: { type: Type.STRING, description: "설교의 주요 성경 본문 (예: 요한복음 3:16-21)." },
                    content: { type: Type.STRING, description: "설교의 전체 내용. 서론, 본론, 결론을 포함." },
                },
                required: ["style", "title", "content"]
            };

            switch(conversionType) {
                case 'keyword':
                    schema = keywordSchema;
                    prompt = `당신은 설교 준비 자료를 구조화하는 전문가입니다. 사용자가 '키워드 자료'로 분류한 텍스트를 분석하여 JSON으로 변환합니다.

**작업 지시:**
1.  **키워드 그룹핑:** 텍스트는 '가', '나', '다' 와 같은 한글 자음과 번호(예: '1. 간증')로 구성된 여러 키워드 그룹을 포함합니다. 각 키워드 그룹을 식별하고, 해당 키워드에 속한 모든 자료를 함께 처리합니다.
2.  **자료 목록 생성 (materials):** 각 키워드에 대해, 연결된 참고 서적 및 인용문을 분석하여 'materials' 배열을 생성합니다. 각 material 객체는 다음 정보를 포함해야 합니다:
    - \`bookTitle\`: 책 제목.
    - \`author\`: 저자. 보통 책 제목 옆 괄호 안에 있습니다.
    - \`publicationInfo\`: 출판 정보. 명시되어 있지 않으면 생략합니다.
    - \`pages\`: 페이지 정보.
    - \`content\`: 인용문 내용.
        - 자료 앞에 붙는 소주제(예: "간증이 필요한 이유)")가 있다면, "소주제: [소주제 내용]\\n\\n" 형식으로 \`content\` 필드의 맨 앞에 추가합니다.
        - 대괄호 \`[]\`로 둘러싸인 인용문 내용은 소주제 뒤에 추가합니다.
        - 인용문이 없는 참고 자료의 경우, \`content\` 필드는 소주제만 포함하거나, 소주제도 없으면 빈 문자열로 둡니다.
3.  **한 줄에 여러 자료 처리:** 한 줄에 여러 개의 참고 서적이 쉼표로 구분되어 나열될 수 있습니다 (예: '책1(저자1)1p, 책2(저자2)2p'). 각각을 별개의 material 객체로 분리하여 처리해야 합니다. 각 객체는 인용문(\`content\`)이 없습니다.

**규칙:**
- 텍스트 전체를 분석하여 모든 키워드와 관련 자료를 추출해야 합니다.
- \`keyword\` 필드에는 '1. 간증'에서 숫자와 점을 제외한 '간증'만 포함되어야 합니다.
- 필수 정보(\`bookTitle\`, \`pages\`)가 없는 자료는 결과에 포함하지 마세요.
- 최종 출력은 제공된 JSON 스키마를 완벽하게 준수해야 합니다.

---
**사용자 제공 텍스트:**
${hwpContent}`;
                    break;
                case 'bible':
                    schema = bibleSchema;
                    prompt = `당신은 설교 준비 자료를 구조화하는 전문가입니다. 사용자가 '성경 자료'로 분류한 텍스트를 분석하여 JSON으로 변환합니다.
                    
                    **작업 지시:**
                    1.  **자료 목록 생성 (materials):** 텍스트는 성경 책과 장으로 그룹화되어 있으며, 각 그룹 아래에는 성경 구절과 관련된 참고 서적 목록이 있습니다. 이 구조를 분석하여 각 참고 서적을 개별 자료로 추출합니다.
                    2.  각 자료에서 다음 정보를 추출하여 배열에 객체로 추가합니다.
                        - 성경 위치: \`book\` (예: '마태복음'), \`chapterStart\`, \`verseStart\` 등을 성경 구절(예: '1-17)', '14-15)')에서 정확히 파싱합니다. 전체 텍스트의 맥락(예: '마태복음 1장')을 활용하여 \`book\`과 \`chapterStart\`를 결정하세요.
                        - 참고 서적 정보: \`bookTitle\`, \`author\`, \`pages\`를 추출합니다.
                        - \`content\`: 참고 서적 정보 뒤에 인용문이 있을 경우, 해당 내용을 추출합니다. **인용문이 없다면 이 필드를 생략하거나 빈 문자열로 두세요.**

                    **규칙:**
                    - 성경 구절과 참고 서적 정보를 명확하게 분리하여 인식해야 합니다.
                    - 필수 정보(\`book\`, \`chapterStart\`, \`bookTitle\`)가 없는 자료는 결과에 포함하지 마세요.
                    - 최종 출력은 제공된 JSON 스키마를 완벽하게 준수해야 합니다.

                    ---
                    **사용자 제공 텍스트:**
                    ${hwpContent}`;
                    break;
                case 'sermon':
                    schema = sermonSchema;
                    prompt = `당신은 설교 준비 자료를 구조화하는 전문가입니다. 사용자가 '설교문'으로 분류한 텍스트를 분석하여 JSON으로 변환합니다.

                    **작업 지시:**
                    1.  **설교 정보 추출:** 텍스트에서 다음 메타데이터를 식별하고 추출합니다.
                        - \`style\`: 설교의 종류를 판단합니다. 본문을 순차적으로 깊이 있게 해설하면 'expository'(본문 설교), 특정 주제를 중심으로 여러 성경 구절을 인용하면 'topic'(주제 설교)으로 설정합니다.
                        - \`title\`: 설교 제목
                        - \`preacher\`: 설교자
                        - \`date\`: 설교 날짜 (YYYY-MM-DD 형식으로 변환 시도)
                        - \`bibleReference\`: 주요 성경 본문
                    2.  **설교 내용 정리 (content):** 메타데이터를 제외한 나머지 텍스트 전체를 설교 내용으로 정리합니다.

                    **규칙:**
                    - 메타데이터가 명확하지 않을 경우, 비워둘 수 있지만 \`style\`, \`title\`, \`content\`는 필수입니다.
                    - 최종 출력은 제공된 JSON 스키마를 완벽하게 준수해야 합니다.

                    ---
                    **사용자 제공 텍스트:**
                    ${hwpContent}`;
                    break;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });

            const text = response.text;
            if (!text || text.trim() === '') {
                setError("AI가 유효한 응답을 생성하지 못했습니다. 입력 내용을 확인하고 다시 시도해주세요.");
                setIsLoading(false);
                return;
            }
            const jsonStr = text.trim();
            const data = JSON.parse(jsonStr);
            
            let parsedData;
            if (conversionType === 'keyword') {
                parsedData = data || [];
            } else if (conversionType === 'bible') {
                const rawMaterials = data.materials || [];
                const locationsMap = new Map<string, BibleMaterialLocation>();
                rawMaterials.forEach((item: any) => {
                    const locationKey = `${item.book}-${item.chapterStart}-${item.verseStart || ''}-${item.chapterEnd || ''}-${item.verseEnd || ''}`;
                    const material: Omit<Material, 'id' | 'createdAt'> = {
                        bookTitle: item.bookTitle || '',
                        author: item.author || '',
                        publicationInfo: item.publicationInfo || '',
                        pages: String(item.pages || ''),
                        content: item.content || '',
                    };
                    
                    if (locationsMap.has(locationKey)) {
                        // FIX: Added logic to update the `updatedAt` timestamp for existing locations.
                        const existingLocation = locationsMap.get(locationKey)!;
                        existingLocation.materials.push({ ...material, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
                        existingLocation.updatedAt = new Date().toISOString();
                    } else {
                        // FIX: Added missing `updatedAt` property to align with the `BibleMaterialLocation` type definition.
                        locationsMap.set(locationKey, {
                          id: crypto.randomUUID(),
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          book: item.book,
                          chapterStart: item.chapterStart,
                          verseStart: item.verseStart,
                          chapterEnd: item.chapterEnd,
                          verseEnd: item.verseEnd,
                          materials: [{ ...material, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
                        });
                    }
                });
                parsedData = Array.from(locationsMap.values());
            } else if (conversionType === 'sermon') {
                parsedData = data ? [data] : [];
            }
            setPreviewData(parsedData);
            setHwpContent('');

        } catch (e) {
            console.error("Conversion failed:", e);
            setError("변환에 실패했습니다. 내용을 조금 수정하거나 나누어서 다시 시도해보세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!previewData) return;

        try {
            const workbook = XLSX.utils.book_new();
            let worksheet;
            let fileName = `heavens_scribe_converted_${conversionType}_${new Date().toISOString().split('T')[0]}.xlsx`;

            if (conversionType === 'keyword' && previewData.length > 0) {
                const flattenedData = previewData.flatMap((keywordItem: any) => 
                    (keywordItem.materials || []).map((material: any) => ({
                        '키워드': keywordItem.keyword || '',
                        '서명': material.bookTitle || '',
                        '저자': material.author || '',
                        '출판사항': material.publicationInfo || '',
                        '페이지': material.pages || '',
                        '내용': material.content || '',
                    }))
                );
                worksheet = XLSX.utils.json_to_sheet(flattenedData);
                XLSX.utils.book_append_sheet(workbook, worksheet, "키워드 자료");
            } else if (conversionType === 'bible' && previewData.length > 0) {
                 const bibleData = (previewData as BibleMaterialLocation[]).flatMap(location =>
                    location.materials.map(material => ({
                        '성경': location.book,
                        '시작 장': location.chapterStart,
                        '시작 절': location.verseStart || '',
                        '끝 장': location.chapterEnd || '',
                        '끝 절': location.verseEnd || '',
                        '서명': material.bookTitle,
                        '저자': material.author,
                        '출판사항': material.publicationInfo,
                        '페이지': material.pages,
                        '내용': material.content,
                    }))
                  );
                worksheet = XLSX.utils.json_to_sheet(bibleData);
                XLSX.utils.book_append_sheet(workbook, worksheet, "성경 자료");
            } else if (conversionType === 'sermon' && previewData.length > 0) {
                const sermonData = previewData.map(item => ({
                    '구분': 'my',
                    '설교 종류': item.style === 'topic' ? '주제 설교' : '본문 설교',
                    '제목': item.title || '',
                    '설교자': item.preacher || '',
                    '날짜': item.date || '',
                    '성경 본문': item.bibleReference || '',
                    '내용': item.content || '',
                }));
                 worksheet = XLSX.utils.json_to_sheet(sermonData);
                 XLSX.utils.book_append_sheet(workbook, worksheet, "설교 자료");
            }

            if (workbook.SheetNames.length === 0) {
                setError("변환된 데이터가 없어 파일을 생성할 수 없습니다.");
                return;
            }

            XLSX.writeFile(workbook, fileName);

        } catch (err) {
            console.error("Error creating excel file:", err);
            setError("엑셀 파일을 생성하는 중 오류가 발생했습니다.");
        }
    };

    const handleAddToApp = () => {
        if (previewData && previewData.length > 0) {
            if (window.confirm(`${previewData.length}개의 항목을 앱에 추가하시겠습니까? (키워드의 경우, 기존 키워드에 자료가 병합됩니다.)`)) {
                onImportData(previewData, conversionType);
                setPreviewData(null); // Clear preview after import
            }
        }
    };

    const getPlaceholderText = () => {
        switch(conversionType) {
            case 'keyword': return "하나의 키워드에 대한 책 인용문들을 붙여넣으세요...\n\n예시)\n존 스토트, 『현대 사회 문제와 기독교적 답변』(IVP, 2015), p. 23.\n'내용...'";
            case 'bible': return "성경 구절별 주석 또는 참고 자료들을 붙여넣으세요...\n\n예시)\n마태복음 1장\n1-17)IVP성경난제주석(월터 카이저외)42-43p\n14-15) 복음이란 무엇인가?(김세윤) 16-17p";
            case 'sermon': return "설교문 전체를 붙여넣으세요...\n\n예시)\n제목: 사랑\n설교자: OOO\n날짜: 2023-01-01\n본문: 요일 4:7-8\n\n(서론)\n사랑하는 성도 여러분...";
            default: return "이곳에 한글 파일 내용을 붙여넣으세요...";
        }
    };
    
    // --- Preview Edit Handlers ---
    const handlePreviewChange = (path: (string | number)[], value: any) => {
        setPreviewData(currentData => {
            if (!currentData) return null;
            const newData = JSON.parse(JSON.stringify(currentData)); // Deep copy
            let current = newData;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return newData;
        });
    };

    const handlePreviewDelete = (path: (string | number)[]) => {
        if (!window.confirm('이 항목을 삭제하시겠습니까?')) return;
        setPreviewData(currentData => {
            if (!currentData) return null;
            const newData = JSON.parse(JSON.stringify(currentData));
            let current = newData;
            for (let i = 0; i < path.length - 2; i++) {
                current = current[path[i]];
            }
            const lastKey = path[path.length - 2];
            const indexToDelete = path[path.length - 1] as number;
            
            if (Array.isArray(current[lastKey])) {
                (current[lastKey] as any[]).splice(indexToDelete, 1);
            }
            // If deleting a keyword or location leaves it with no materials, delete the parent
            if (path.includes('materials') && current[lastKey].length === 0) {
               // Special case for root items
               if (path.length === 2) {
                   newData.splice(path[0] as number, 1);
               }
            }


            return newData;
        });
    };


    const renderPreview = () => {
        if (!previewData) return null;

        switch (conversionType) {
            case 'keyword':
                return (
                    <div className="space-y-6">
                        {previewData.map((item, kwIndex) => (
                            <div key={kwIndex} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex justify-between items-center mb-3">
                                    <input
                                        type="text"
                                        value={item.keyword}
                                        onChange={(e) => handlePreviewChange([kwIndex, 'keyword'], e.target.value)}
                                        className="text-lg font-bold p-2 border-b-2 border-transparent focus:border-primary-500 bg-transparent focus:outline-none w-full"
                                    />
                                    <button onClick={() => handlePreviewDelete([kwIndex])} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                                <div className="space-y-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                                    {(item.materials || []).map((mat: any, matIndex: number) => (
                                        <div key={matIndex} className="p-3 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 relative group">
                                            <button onClick={() => handlePreviewDelete([kwIndex, 'materials', matIndex])} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-4 h-4"/></button>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                <input value={mat.bookTitle} onChange={e => handlePreviewChange([kwIndex, 'materials', matIndex, 'bookTitle'], e.target.value)} placeholder="서명" className="w-full p-1 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none" />
                                                <input value={mat.author} onChange={e => handlePreviewChange([kwIndex, 'materials', matIndex, 'author'], e.target.value)} placeholder="저자" className="w-full p-1 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none" />
                                                <input value={mat.publicationInfo} onChange={e => handlePreviewChange([kwIndex, 'materials', matIndex, 'publicationInfo'], e.target.value)} placeholder="출판사항" className="w-full p-1 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none" />
                                                <input value={mat.pages} onChange={e => handlePreviewChange([kwIndex, 'materials', matIndex, 'pages'], e.target.value)} placeholder="페이지" className="w-full p-1 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none" />
                                            </div>
                                            <textarea value={mat.content} onChange={e => handlePreviewChange([kwIndex, 'materials', matIndex, 'content'], e.target.value)} placeholder="내용" rows={3} className="w-full p-1 mt-2 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none text-sm" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'bible':
                return (
                    <div className="space-y-4">
                        {(previewData as BibleMaterialLocation[]).map((loc, locIndex) => (
                             <div key={loc.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <p className="font-bold text-lg mb-2">{`${loc.book} ${loc.chapterStart}:${loc.verseStart || ''}`}</p>
                                <div className="space-y-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                                    {loc.materials.map((mat, matIndex) => (
                                         <div key={mat.id} className="p-3 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 relative group">
                                            <button onClick={() => handlePreviewDelete([locIndex, 'materials', matIndex])} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-4 h-4"/></button>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                <input value={mat.bookTitle} onChange={e => handlePreviewChange([locIndex, 'materials', matIndex, 'bookTitle'], e.target.value)} placeholder="서명" className="w-full p-1 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none" />
                                                <input value={mat.author} onChange={e => handlePreviewChange([locIndex, 'materials', matIndex, 'author'], e.target.value)} placeholder="저자" className="w-full p-1 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none" />
                                                <input value={mat.pages} onChange={e => handlePreviewChange([locIndex, 'materials', matIndex, 'pages'], e.target.value)} placeholder="페이지" className="w-full p-1 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none" />
                                            </div>
                                            <textarea value={mat.content} onChange={e => handlePreviewChange([locIndex, 'materials', matIndex, 'content'], e.target.value)} placeholder="내용" rows={3} className="w-full p-1 mt-2 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none text-sm" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'sermon':
                return (
                     <div className="space-y-4">
                        {(previewData as Partial<Sermon>[]).map((sermon, index) => (
                             <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-3">
                                <input value={sermon.title} onChange={e => handlePreviewChange([index, 'title'], e.target.value)} placeholder="제목" className="w-full p-2 text-lg font-bold bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <input value={sermon.preacher} onChange={e => handlePreviewChange([index, 'preacher'], e.target.value)} placeholder="설교자" className="w-full p-2 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none" />
                                     <input value={sermon.date} type="date" onChange={e => handlePreviewChange([index, 'date'], e.target.value)} placeholder="날짜" className="w-full p-2 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none" />
                                </div>
                                 <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => handlePreviewChange([index, 'style'], 'expository')}
                                        className={`flex-1 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                            sermon.style === 'expository' ? 'bg-white dark:bg-gray-800 shadow' : ''
                                        }`}
                                    >
                                        본문 설교
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handlePreviewChange([index, 'style'], 'topic')}
                                        className={`flex-1 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                            sermon.style === 'topic' ? 'bg-white dark:bg-gray-800 shadow' : ''
                                        }`}
                                    >
                                        주제 설교
                                    </button>
                                </div>
                                 <input value={sermon.bibleReference} onChange={e => handlePreviewChange([index, 'bibleReference'], e.target.value)} placeholder="성경 본문" className="w-full p-2 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none" />
                                <textarea value={sermon.content} onChange={e => handlePreviewChange([index, 'content'], e.target.value)} placeholder="설교 내용" rows={15} className="w-full p-2 bg-transparent rounded focus:bg-gray-100 dark:focus:bg-gray-700 outline-none" />
                            </div>
                        ))}
                    </div>
                );
            default: return null;
        }
    }


    return (
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">HWP 자료 자동 변환</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        변환할 자료 유형을 선택하고 내용을 붙여넣으면 AI가 앱 형식에 맞게 정리합니다.
                    </p>
                </div>

                {!geminiApiKey && (
                  <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 rounded-md">
                      <p className="font-bold">API 키 필요</p>
                      <p>HWP 변환 기능을 사용하려면 Gemini API 키가 필요합니다. 우측 상단의 설정 아이콘(⚙️)을 클릭하여 API 키를 등록해주세요.</p>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
                     <div>
                        <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                           1. 변환할 자료 유형 선택
                        </label>
                         <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                            <button
                                onClick={() => setConversionType('keyword')}
                                disabled={isLoading}
                                className={`flex-1 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                    conversionType === 'keyword'
                                    ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                키워드 자료
                            </button>
                            <button
                                onClick={() => setConversionType('bible')}
                                disabled={isLoading}
                                className={`flex-1 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                    conversionType === 'bible'
                                    ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                성경 자료
                            </button>
                            <button
                                onClick={() => setConversionType('sermon')}
                                disabled={isLoading}
                                className={`flex-1 px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                    conversionType === 'sermon'
                                    ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-300 shadow'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                설교문
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="hwp-content" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                           2. 내용 붙여넣기
                        </label>
                        <textarea
                            id="hwp-content"
                            rows={15}
                            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder={getPlaceholderText()}
                            value={hwpContent}
                            onChange={(e) => setHwpContent(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mt-4 text-center">
                        <button
                            onClick={handleConvert}
                            disabled={isLoading || !hwpContent.trim()}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 <span>변환 중...</span>
                                </>
                            ) : (
                                <>
                                 <DocumentArrowRightIcon className="w-6 h-6"/>
                                 <span>변환하기</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-200 rounded-md">
                        <p className="font-bold">오류</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {previewData && (
                    <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">미리보기 및 수정</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        AI가 변환한 결과입니다. 내용을 확인하고 필요하면 수정한 후 앱에 추가하거나 엑셀로 다운로드하세요.
                      </p>
                      <div className="max-h-[60vh] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        {renderPreview()}
                      </div>
                      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5"/>
                            <span>엑셀로 다운로드</span>
                        </button>
                        <button
                            onClick={handleAddToApp}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <PlusIcon className="w-5 h-5"/>
                            <span>앱에 추가하기</span>
                        </button>
                      </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HwpConvertMode;