export interface Material {
  id: string;
  bookTitle: string;
  author: string;
  publicationInfo: string;
  pages: string;
  content: string;
  contentImage?: string | null;
  createdAt: string;
}

export interface Keyword {
  id:string;
  name: string;
  materials: Material[];
  createdAt: string;
}

export interface BibleMaterialLocation {
  id: string;
  book: string;
  chapterStart: number;
  verseStart?: number;
  chapterEnd?: number;
  verseEnd?: number;
  materials: Material[];
  createdAt: string;
}

export interface Sermon {
  id: string;
  type: 'my' | 'other';
  title: string;
  preacher: string;
  date: string;
  bibleReference: string;
  content: string;
  createdAt: string;
}