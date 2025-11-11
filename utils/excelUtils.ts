import { Keyword, BibleMaterialLocation, Sermon, Material } from '../types';
import { BIBLE_DATA } from './bibleData';

declare const XLSX: any;

const saveWorkbook = async (wb: any, fileName: string) => {
    try {
        if ((window as any).showSaveFilePicker) {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: fileName,
                types: [{
                    description: 'Excel Workbook',
                    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
                }],
            });
            
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });

            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
        } else {
            // Fallback for browsers that don't support the API
            XLSX.writeFile(wb, fileName);
        }
    } catch (err: any) {
        // Handle user cancellation of the save dialog, which throws an AbortError.
        if (err.name !== 'AbortError') {
            console.error("Error saving file:", err);
            alert("파일을 저장하는 중 오류가 발생했습니다.");
        }
    }
};

// Private helper to generate a timed filename for updates
const generateTimedFilename = (originalFilename: string): string => {
    const now = new Date();
    const timestamp = `_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
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
    
    const flattenedData = sortedKeywords.flatMap(keyword => 
        (keyword.materials.length > 0 ? keyword.materials : [{bookTitle: '', author: '', publicationInfo: '', pages: '', content: '', contentImage: null}]).map(material => ({
          '키워드': keyword.name,
          '서명': material.bookTitle,
          '저자': material.author,
          '출판사항': material.publicationInfo,
          '페이지': material.pages,
          '내용': material.content,
          '이미지 (base64)': material.contentImage || '',
        }))
      );
    return XLSX.utils.json_to_sheet(flattenedData, {header: ['키워드', '서명', '저자', '출판사항', '페이지', '내용', '이미지 (base64)']});
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

    const flattenedData = sortedBibleData.flatMap(location =>
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
          '이미지 (base64)': material.contentImage || '',
        }))
      );
      return XLSX.utils.json_to_sheet(flattenedData, {header: ['성경', '시작 장', '시작 절', '끝 장', '끝 절', '서명', '저자', '출판사항', '페이지', '내용', '이미지 (base64)']});
};

const createSermonsSheet = (sermons: Sermon[]) => {
    const sortedSermons = [...sermons].sort((a, b) => {
        const refA = parseSermonBibleReference(a.bibleReference);
        const refB = parseSermonBibleReference(b.bibleReference);

        if (refA.bookIndex !== refB.bookIndex) {
            return refA.bookIndex - refB.bookIndex;
        }
        if (refA.chapter !== refB.chapter) {
            return refA.chapter - refB.chapter;
        }
        return refA.verse - refB.verse;
    });

    const dataToExport = sortedSermons.map(sermon => ({
        '구분': sermon.type === 'my' ? '개인 설교' : '타인 설교',
        '설교 종류': sermon.style === 'topic' ? '주제 설교' : '본문 설교',
        '제목': sermon.title,
        '설교자': sermon.preacher,
        '날짜': sermon.date,
        '성경 본문': sermon.bibleReference,
        '내용': sermon.content,
      }));
      return XLSX.utils.json_to_sheet(dataToExport, {header: ['구분', '설교 종류', '제목', '설교자', '날짜', '성경 본문', '내용']});
};

// EXPORT Logic
export const exportAllData = async (keywords: Keyword[], bibleData: BibleMaterialLocation[], sermons: Sermon[]) => {
    try {
        const wb = XLSX.utils.book_new();
        
        const wsKeywords = createKeywordsSheet(keywords);
        XLSX.utils.book_append_sheet(wb, wsKeywords, "키워드 자료");

        const wsBible = createBibleSheet(bibleData);
        XLSX.utils.book_append_sheet(wb, wsBible, "성경 자료");

        const wsSermons = createSermonsSheet(sermons);
        XLSX.utils.book_append_sheet(wb, wsSermons, "설교 자료");

        await saveWorkbook(wb, `heavens_scribe_backup_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch(err) {
        console.error("Error exporting all data:", err);
        alert("데이터를 내보내는 중 오류가 발생했습니다.");
    }
};

export const updateDataAndExport = async (
    originalWorkbook: any,
    fileName: string,
    keywords: Keyword[],
    bibleData: BibleMaterialLocation[],
    sermons: Sermon[]
) => {
    try {
        const updatedWb = XLSX.utils.book_new();
        const managedSheetNames = ["키워드 자료", "성경 자료", "설교 자료"];

        // Add updated managed sheets in the specified order
        XLSX.utils.book_append_sheet(updatedWb, createKeywordsSheet(keywords), "키워드 자료");
        XLSX.utils.book_append_sheet(updatedWb, createBibleSheet(bibleData), "성경 자료");
        XLSX.utils.book_append_sheet(updatedWb, createSermonsSheet(sermons), "설교 자료");

        // Add other sheets from original workbook
        originalWorkbook.SheetNames.forEach((sheetName: string) => {
            if (!managedSheetNames.includes(sheetName)) {
                const originalSheet = originalWorkbook.Sheets[sheetName];
                XLSX.utils.book_append_sheet(updatedWb, originalSheet, sheetName);
            }
        });

        const timedFileName = generateTimedFilename(fileName);
        await saveWorkbook(updatedWb, timedFileName);
    } catch (err) {
        console.error("Error updating and exporting data:", err);
        alert("가져온 파일을 업데이트하는 중 오류가 발생했습니다.");
    }
};


export const exportSingleKeyword = async (keyword: Keyword) => {
    try {
        const wb = XLSX.utils.book_new();
        const ws = createKeywordsSheet([keyword]);
        XLSX.utils.book_append_sheet(wb, ws, keyword.name.substring(0, 31));
        await saveWorkbook(wb, `HS_키워드_${keyword.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch(err) {
        console.error("Error exporting keyword:", err);
        alert("키워드 자료를 내보내는 중 오류가 발생했습니다.");
    }
};

export const exportBibleBookData = async (bookName: string, bibleData: BibleMaterialLocation[]) => {
     try {
        const wb = XLSX.utils.book_new();
        const ws = createBibleSheet(bibleData);
        XLSX.utils.book_append_sheet(wb, ws, bookName);
        await saveWorkbook(wb, `HS_성경_${bookName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch(err) {
        console.error("Error exporting bible data:", err);
        alert("성경 자료를 내보내는 중 오류가 발생했습니다.");
    }
};

export const exportSermonsList = async (sermons: Sermon[]) => {
     try {
        const wb = XLSX.utils.book_new();
        const ws = createSermonsSheet(sermons);
        XLSX.utils.book_append_sheet(wb, ws, "설교 목록");
        await saveWorkbook(wb, `HS_설교목록_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch(err) {
        console.error("Error exporting sermons:", err);
        alert("설교 목록을 내보내는 중 오류가 발생했습니다.");
    }
};


// IMPORT Logic
const importKeywords = (sheet: any[]): Keyword[] => {
    const keywordsMap = new Map<string, Material[]>();
    sheet.forEach(row => {
      const keywordName = row['키워드'];
      if (!keywordName || !row['서명']) return; // Skip empty rows or keywords without material

      const material: Omit<Material, 'id' | 'createdAt'> = {
        bookTitle: row['서명'] || '',
        author: row['저자'] || '',
        publicationInfo: row['출판사항'] || '',
        pages: String(row['페이지'] || ''),
        content: row['내용'] || '',
        contentImage: row['이미지 (base64)'] || null,
      };

      if (!keywordsMap.has(keywordName)) {
        keywordsMap.set(keywordName, []);
      }
      keywordsMap.get(keywordName)!.push({
        ...material,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      });
    });
    // FIX: Added missing `updatedAt` property to align with the `Keyword` type definition.
    return Array.from(keywordsMap.entries()).map(([name, materials]) => ({
      id: crypto.randomUUID(),
      name,
      materials,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
};

const importBibleData = (sheet: any[]): BibleMaterialLocation[] => {
    const locationsMap = new Map<string, BibleMaterialLocation>();
    sheet.forEach(row => {
        const book = row['성경'];
        if (!book) return;

        const cs = Number(row['시작 장']);
        if (isNaN(cs) || cs <= 0) return;

        const locationKey = `${book}-${cs}-${row['시작 절'] || ''}-${row['끝 장'] || ''}-${row['끝 절'] || ''}`;

        const material: Material = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            bookTitle: row['서명'] || '',
            author: row['저자'] || '',
            publicationInfo: row['출판사항'] || '',
            pages: String(row['페이지'] || ''),
            content: row['내용'] || '',
            contentImage: row['이미지 (base64)'] || null,
        };

        if (locationsMap.has(locationKey)) {
            // FIX: Added logic to update the `updatedAt` timestamp for existing locations.
            const existingLocation = locationsMap.get(locationKey)!;
            existingLocation.materials.push(material);
            existingLocation.updatedAt = new Date().toISOString();
        } else {
            // FIX: Added missing `updatedAt` property to align with the `BibleMaterialLocation` type definition.
            locationsMap.set(locationKey, {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                book: book,
                chapterStart: cs,
                verseStart: row['시작 절'] ? Number(row['시작 절']) : undefined,
                chapterEnd: row['끝 장'] ? Number(row['끝 장']) : undefined,
                verseEnd: row['끝 절'] ? Number(row['끝 절']) : undefined,
                materials: [material],
            });
        }
    });
    return Array.from(locationsMap.values());
};

const importSermons = (sheet: any[]): Sermon[] => {
    return sheet.map(row => {
        // FIX: Explicitly type `style` to match the `Sermon` interface, resolving the type error.
        const style: 'topic' | 'expository' = row['설교 종류'] === '주제 설교' ? 'topic' : 'expository';
        return {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: (row['구분'] === '개인 설교' ? 'my' : 'other') as 'my' | 'other',
            style: style,
            title: row['제목'] || '',
            preacher: row['설교자'] || '',
            date: row['날짜'] || '',
            bibleReference: row['성경 본문'] || '',
            content: row['내용'] || '',
        };
    }).filter(s => s.title);
};

export const importAllData = (file: File): Promise<{workbook: any, keywords: Keyword[], bibleData: BibleMaterialLocation[], sermons: Sermon[]}> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });

                const importedData = {
                    keywords: [] as Keyword[],
                    bibleData: [] as BibleMaterialLocation[],
                    sermons: [] as Sermon[]
                };

                const kwSheet = workbook.Sheets["키워드 자료"];
                if (kwSheet) {
                    const jsonData = XLSX.utils.sheet_to_json(kwSheet);
                    importedData.keywords = importKeywords(jsonData);
                }

                const bibleSheet = workbook.Sheets["성경 자료"];
                if (bibleSheet) {
                    const jsonData = XLSX.utils.sheet_to_json(bibleSheet);
                    importedData.bibleData = importBibleData(jsonData);
                }

                const sermonSheet = workbook.Sheets["설교 자료"];
                if (sermonSheet) {
                    const jsonData = XLSX.utils.sheet_to_json(sermonSheet);
                    importedData.sermons = importSermons(jsonData);
                }
                
                resolve({ workbook, ...importedData });
            } catch (error) {
                console.error("Error processing excel file:", error);
                reject(new Error("파일을 처리하는 중 오류가 발생했습니다. 파일 형식이 올바른지 확인해주세요."));
            }
        };
        reader.onerror = (error) => {
            console.error("File reading error:", error);
            reject(new Error("파일을 읽는 중 오류가 발생했습니다."));
        };
    });
};

export const downloadTemplate = async () => {
    try {
        const wb = XLSX.utils.book_new();
        
        const kwHeaders = ['키워드', '서명', '저자', '출판사항', '페이지', '내용', '이미지 (base64)'];
        const wsKeywords = XLSX.utils.aoa_to_sheet([kwHeaders]);
        XLSX.utils.book_append_sheet(wb, wsKeywords, "키워드 자료");
        
        const bibleHeaders = ['성경', '시작 장', '시작 절', '끝 장', '끝 절', '서명', '저자', '출판사항', '페이지', '내용', '이미지 (base64)'];
        const wsBible = XLSX.utils.aoa_to_sheet([bibleHeaders]);
        XLSX.utils.book_append_sheet(wb, wsBible, "성경 자료");

        const sermonHeaders = ['구분', '설교 종류', '제목', '설교자', '날짜', '성경 본문', '내용'];
        const wsSermons = XLSX.utils.aoa_to_sheet([sermonHeaders]);
        XLSX.utils.book_append_sheet(wb, wsSermons, "설교 자료");

        await saveWorkbook(wb, 'heavens_scribe_template.xlsx');
    } catch(err) {
        console.error("Error downloading template:", err);
        alert("양식을 다운로드하는 중 오류가 발생했습니다.");
    }
}