import { Keyword, BibleMaterialLocation, Sermon, Material } from '../types';
import { BIBLE_DATA } from './bibleData';

declare const XLSX: any;

// FIX: Add type definitions for File System Access API to avoid TypeScript errors.
declare global {
    interface Window {
        showSaveFilePicker?(options?: {
            suggestedName?: string,
            types?: {
                description: string,
                accept: { [mimeType: string]: string[] }
            }[]
        }): Promise<FileSystemFileHandle>;
    }
    interface FileSystemFileHandle {
        createWritable(): Promise<FileSystemWritableFileStream>;
    }
    interface FileSystemWritableFileStream {
        write(data: any): Promise<void>;
        close(): Promise<void>;
    }
}

const MAX_CELL_LENGTH = 32000; // Excel cell character limit is 32,767


const getTimestamp = (): string => {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
};

const saveWorkbookToFile = async (wb: any, fileName: string) => {
    try {
        // Check for File System Access API support
        if (window.showSaveFilePicker) {
            const handle = await window.showSaveFilePicker({
                suggestedName: fileName,
                types: [{
                    description: 'Excel Workbook',
                    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
                }],
            });
            // Convert workbook to a Blob
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: "application/octet-stream" });

            // Write the file
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
        } else {
            // Fallback for browsers that don't support the API
            console.warn('File System Access API is not supported. Falling back to direct download.');
            XLSX.writeFile(wb, fileName);
        }
    } catch (err: any) {
        // Gracefully handle user cancellation
        if (err.name === 'AbortError') {
            console.log('User cancelled the file saving process.');
            return;
        }
        // Handle other errors, including security errors in iframes
        console.error("Error using showSaveFilePicker:", err);
        alert("파일 저장 대화상자를 열 수 없습니다. 브라우저의 기본 다운로드 방식으로 파일을 저장합니다.");
        // Fallback to direct download
        try {
            XLSX.writeFile(wb, fileName);
        } catch (fallbackErr) {
            console.error("Fallback save failed:", fallbackErr);
            alert("파일을 저장하는 중 오류가 발생했습니다.");
        }
    }
};


// Private helper to generate a timed filename for updates
const generateTimedFilename = (originalFilename: string): string => {
    const timestamp = `_${getTimestamp()}`;
    const parts = originalFilename.split('.');
    const extension = parts.pop();
    if (!extension) return `${originalFilename}${timestamp}`; // Handle files without extension
    const baseName = parts.join('.');
    return `${baseName}${timestamp}.${extension}`;
};

// --- Sorting helpers for Bible and Sermon data ---
const allBooks = [...BIBLE_DATA.oldTestament, ...BIBLE_DATA.newTestament];
const bookOrderMap = new Map<string, number>();
allBooks.forEach((book, index) => {
    bookOrderMap.set(book.name, index);
    bookOrderMap.set(book.abbr, index);
});

const getBookIndex = (bookName: string): number => {
    return bookOrderMap.get(bookName) ?? Infinity;
};

// For Sermon data sheet (parses string reference)
const allBookNamesForRegex = allBooks
    .flatMap(b => [b.name, b.abbr])
    .sort((a, b) => b.length - a.length); // Match longer names first

const bookNameRegexPart = allBookNamesForRegex.join('|');
// Captures: 1. book name, 2. chapter, 3. starting verse
const sermonRefRegex = new RegExp(`^(${bookNameRegexPart})\\s*(\\d+)(?:[:장절편]\\s*(\\d+))?.*`);

function parseSermonBibleReference(ref: string): { bookIndex: number, chapter: number, verse: number } {
    const defaultSort = { bookIndex: 999, chapter: 999, verse: 999 };
    if (!ref) {
        return defaultSort;
    }
    // Handle multiple references by sorting by the first one
    const firstRef = ref.trim().split(/[,;]/)[0];
    const match = firstRef.match(sermonRefRegex);
    if (!match) {
        return defaultSort;
    }
    const [, bookStr, chapterStr, verseStr] = match;
    const bookIndex = bookOrderMap.get(bookStr) ?? 999;
    const chapter = parseInt(chapterStr, 10);
    const verse = verseStr ? parseInt(verseStr, 10) : 0; // Use 0 for verse if not present
    return { bookIndex, chapter, verse };
}


// Private sheet creation functions
const createKeywordsSheet = (keywords: Keyword[]) => {
    const sortedKeywords = [...keywords].sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
    
    let maxChunks = 1;
    sortedKeywords.forEach(k => {
        k.materials.forEach(m => {
            if (m.contentImage) {
                const chunks = Math.ceil(m.contentImage.length / MAX_CELL_LENGTH);
                if (chunks > maxChunks) {
                    maxChunks = chunks;
                }
            }
        });
    });

    const headers = ['키워드', '서명', '저자', '출판사항', '페이지', '내용'];
    for (let i = 1; i <= maxChunks; i++) {
        headers.push(`이미지_${i}`);
    }

    const flattenedData = sortedKeywords.flatMap(keyword => {
        if (keyword.materials.length === 0) {
            return [{ '키워드': keyword.name }];
        }
        return keyword.materials.map(material => {
            const row: { [key: string]: any } = {
                '키워드': keyword.name,
                '서명': material.bookTitle,
                '저자': material.author,
                '출판사항': material.publicationInfo,
                '페이지': material.pages,
                '내용': material.content,
            };

            if (material.contentImage) {
                for (let i = 0; i < maxChunks; i++) {
                    const chunk = material.contentImage.substring(i * MAX_CELL_LENGTH, (i + 1) * MAX_CELL_LENGTH);
                    if (chunk) {
                        row[`이미지_${i + 1}`] = chunk;
                    }
                }
            }
            return row;
        });
    });

    return XLSX.utils.json_to_sheet(flattenedData, { header: headers });
};

const createBibleSheet = (bibleData: BibleMaterialLocation[]) => {
    const sortedBibleData = [...bibleData].sort((a, b) => {
        const bookIndexA = getBookIndex(a.book);
        const bookIndexB = getBookIndex(b.book);
    
        if (bookIndexA !== bookIndexB) {
            return bookIndexA - bookIndexB;
        }
        
        if (a.chapterStart !== b.chapterStart) {
            return a.chapterStart - b.chapterStart;
        }
    
        const verseStartA = a.verseStart ?? 0;
        const verseStartB = b.verseStart ?? 0;
    
        return verseStartA - verseStartB;
    });

    let maxChunks = 1;
    sortedBibleData.forEach(loc => {
        loc.materials.forEach(m => {
            if (m.contentImage) {
                const chunks = Math.ceil(m.contentImage.length / MAX_CELL_LENGTH);
                if (chunks > maxChunks) {
                    maxChunks = chunks;
                }
            }
        });
    });

    const headers = ['성경', '시작 장', '시작 절', '끝 장', '끝 절', '서명', '저자', '출판사항', '페이지', '내용'];
    for (let i = 1; i <= maxChunks; i++) {
        headers.push(`이미지_${i}`);
    }

    const flattenedData = sortedBibleData.flatMap(location =>
        location.materials.map(material => {
            const row: { [key: string]: any } = {
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
            };

            if (material.contentImage) {
                for (let i = 0; i < maxChunks; i++) {
                    const chunk = material.contentImage.substring(i * MAX_CELL_LENGTH, (i + 1) * MAX_CELL_LENGTH);
                    if (chunk) {
                        row[`이미지_${i + 1}`] = chunk;
                    }
                }
            }
            return row;
        })
    );
    return XLSX.utils.json_to_sheet(flattenedData, { header: headers });
};

const createSermonsSheet = (sermons: Sermon[]) => {
    const sortedSermons = [...sermons].sort((a, b) => {
        const refA = parseSermonBibleReference(a.bibleReference);
        const refB = parseSermonBibleReference(b.bibleReference);
        // FIX: The sort function must return a number. Added comparison logic.
        if (refA.bookIndex !== refB.bookIndex) {
            return refA.bookIndex - refB.bookIndex;
        }
        if (refA.chapter !== refB.chapter) {
            return refA.chapter - refB.chapter;
        }
        return refA.verse - refB.verse;
    });

    const flattenedData = sortedSermons.map(sermon => ({
        '구분': sermon.type,
        '설교 종류': sermon.style,
        '제목': sermon.title,
        '설교자': sermon.preacher,
        '날짜': sermon.date,
        '성경 본문': sermon.bibleReference,
        '내용': sermon.content,
    }));
    return XLSX.utils.json_to_sheet(flattenedData, {header: ['구분', '설교 종류', '제목', '설교자', '날짜', '성경 본문', '내용']});
};

// FIX: Export functions so they can be imported in App.tsx
export const exportAllData = (keywords: Keyword[], bibleData: BibleMaterialLocation[], sermons: Sermon[]) => {
    const wb = XLSX.utils.book_new();
    const keywordSheet = createKeywordsSheet(keywords);
    XLSX.utils.book_append_sheet(wb, keywordSheet, "키워드 자료");
    const bibleSheet = createBibleSheet(bibleData);
    XLSX.utils.book_append_sheet(wb, bibleSheet, "성경 자료");
    const sermonSheet = createSermonsSheet(sermons);
    XLSX.utils.book_append_sheet(wb, sermonSheet, "설교 자료");

    const fileName = `heaven_scribe_export_${getTimestamp()}.xlsx`;
    saveWorkbookToFile(wb, fileName);
};

export const updateDataAndExport = (workbook: any, fileName: string, keywords: Keyword[], bibleData: BibleMaterialLocation[], sermons: Sermon[]) => {
    const wb = XLSX.utils.book_new();
    
    const keywordSheet = createKeywordsSheet(keywords);
    XLSX.utils.book_append_sheet(wb, keywordSheet, "키워드 자료");
    const bibleSheet = createBibleSheet(bibleData);
    XLSX.utils.book_append_sheet(wb, bibleSheet, "성경 자료");
    const sermonSheet = createSermonsSheet(sermons);
    XLSX.utils.book_append_sheet(wb, sermonSheet, "설교 자료");

    const newFileName = generateTimedFilename(fileName);
    saveWorkbookToFile(wb, newFileName);
};

export const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    const keywordSheet = XLSX.utils.json_to_sheet([], {header: ['키워드', '서명', '저자', '출판사항', '페이지', '내용', '이미지_1']});
    XLSX.utils.book_append_sheet(wb, keywordSheet, "키워드 자료");

    const bibleSheet = XLSX.utils.json_to_sheet([], {header: ['성경', '시작 장', '시작 절', '끝 장', '끝 절', '서명', '저자', '출판사항', '페이지', '내용', '이미지_1']});
    XLSX.utils.book_append_sheet(wb, bibleSheet, "성경 자료");

    const sermonSheet = XLSX.utils.json_to_sheet([], {header: ['구분', '설교 종류', '제목', '설교자', '날짜', '성경 본문', '내용']});
    XLSX.utils.book_append_sheet(wb, sermonSheet, "설교 자료");

    const fileName = "heaven_scribe_template.xlsx";
    saveWorkbookToFile(wb, fileName);
};

export const importAllData = (file: File): Promise<{ workbook: any; keywords: Keyword[]; bibleData: BibleMaterialLocation[]; sermons: Sermon[]; }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                
                // Keywords
                const keywordSheet = workbook.Sheets["키워드 자료"];
                const keywordJson: any[] = keywordSheet ? XLSX.utils.sheet_to_json(keywordSheet) : [];
                const keywordMap = new Map<string, Material[]>();
                keywordJson.forEach(row => {
                    const keywordName = row['키워드']?.toString().trim();
                    if (!keywordName) return;

                    if (!keywordMap.has(keywordName)) {
                        keywordMap.set(keywordName, []);
                    }

                    const imageChunks: string[] = [];
                    Object.keys(row).forEach(key => {
                        if (key.startsWith('이미지_')) {
                            const index = parseInt(key.split('_')[1], 10) - 1;
                            if (!isNaN(index) && row[key]) {
                                imageChunks[index] = row[key];
                            }
                        }
                    });
                    const contentImage = imageChunks.length > 0 ? imageChunks.join('') : (row['이미지 (base64)'] || null);

                    keywordMap.get(keywordName)!.push({
                        id: crypto.randomUUID(),
                        bookTitle: row['서명'] || '',
                        author: row['저자'] || '',
                        publicationInfo: row['출판사항'] || '',
                        pages: String(row['페이지'] || ''),
                        content: row['내용'] || '',
                        contentImage: contentImage,
                        createdAt: new Date().toISOString()
                    });
                });
                const keywords: Keyword[] = Array.from(keywordMap.entries()).map(([name, materials]) => {
                    const now = new Date().toISOString();
                    return {
                        id: crypto.randomUUID(),
                        name,
                        materials,
                        createdAt: now,
                        updatedAt: now
                    };
                });

                // Bible data
                const bibleSheet = workbook.Sheets["성경 자료"];
                const bibleJson: any[] = bibleSheet ? XLSX.utils.sheet_to_json(bibleSheet) : [];
                const locationMap = new Map<string, BibleMaterialLocation>();
                bibleJson.forEach(row => {
                    const book = row['성경']?.toString().trim();
                    if (!book) return;

                    const cs = parseInt(row['시작 장'], 10);
                    if (isNaN(cs)) return;
                    
                    const vs = row['시작 절'] ? parseInt(row['시작 절'], 10) : undefined;
                    const ce = row['끝 장'] ? parseInt(row['끝 장'], 10) : undefined;
                    const ve = row['끝 절'] ? parseInt(row['끝 절'], 10) : undefined;
                    
                    const locationKey = `${book}-${cs}-${vs || ''}-${ce || ''}-${ve || ''}`;

                    const imageChunks: string[] = [];
                    Object.keys(row).forEach(key => {
                        if (key.startsWith('이미지_')) {
                            const index = parseInt(key.split('_')[1], 10) - 1;
                            if (!isNaN(index) && row[key]) {
                                imageChunks[index] = row[key];
                            }
                        }
                    });
                    const contentImage = imageChunks.length > 0 ? imageChunks.join('') : (row['이미지 (base64)'] || null);

                    const material: Material = {
                        id: crypto.randomUUID(),
                        bookTitle: row['서명'] || '',
                        author: row['저자'] || '',
                        publicationInfo: row['출판사항'] || '',
                        pages: String(row['페이지'] || ''),
                        content: row['내용'] || '',
                        contentImage: contentImage,
                        createdAt: new Date().toISOString()
                    };

                    if (locationMap.has(locationKey)) {
                        locationMap.get(locationKey)!.materials.push(material);
                        locationMap.get(locationKey)!.updatedAt = new Date().toISOString();
                    } else {
                        const now = new Date().toISOString();
                        locationMap.set(locationKey, {
                            id: crypto.randomUUID(),
                            book,
                            chapterStart: cs,
                            verseStart: vs,
                            chapterEnd: ce,
                            verseEnd: ve,
                            materials: [material],
                            createdAt: now,
                            updatedAt: now
                        });
                    }
                });
                const bibleData: BibleMaterialLocation[] = Array.from(locationMap.values());
                
                // Sermons
                const sermonSheet = workbook.Sheets["설교 자료"];
                const sermonJson: any[] = sermonSheet ? XLSX.utils.sheet_to_json(sermonSheet) : [];
                const sermons: Sermon[] = sermonJson.map(row => {
                    const now = new Date().toISOString();
                    let date = row['날짜'] || '';
                    if (typeof date === 'number') {
                        // Excel date number to JS Date
                        const jsDate = new Date(Date.UTC(1899, 11, 30 + date));
                        date = jsDate.toISOString().split('T')[0];
                    }
                    
                    // FIX: Explicitly define types for `type` and `style` to match the Sermon interface,
                    // resolving a type inference issue where they were being widened to `string`.
                    const sermonType: 'my' | 'other' = row['구분'] === 'other' ? 'other' : 'my';
                    const sermonStyle: 'topic' | 'expository' = row['설교 종류'] === 'topic' || row['설교 종류'] === '주제 설교' ? 'topic' : 'expository';

                    return {
                        id: crypto.randomUUID(),
                        type: sermonType,
                        style: sermonStyle,
                        title: row['제목'] || '',
                        preacher: row['설교자'] || '',
                        date,
                        bibleReference: row['성경 본문'] || '',
                        content: row['내용'] || '',
                        createdAt: now,
                        updatedAt: now
                    };
                }).filter(s => s.title); // Filter out empty rows

                resolve({ workbook, keywords, bibleData, sermons });

            } catch (error) {
                console.error("Error reading excel file:", error);
                reject(new Error("엑셀 파일을 읽는 중 오류가 발생했습니다. 파일 형식이 올바른지 확인해주세요."));
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsBinaryString(file);
    });
};