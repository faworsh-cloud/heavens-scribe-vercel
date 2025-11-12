export interface Material {
  id: string;
  bookTitle: string;
  author: string;
  publicationInfo: string;
  pages: string;
  content: string;
  createdAt: string;
}

export interface Keyword {
  id:string;
  name: string;
  materials: Material[];
  createdAt: string;
  updatedAt: string;
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
  updatedAt: string;
}

export interface Sermon {
  id: string;
  type: 'my' | 'other';
  style: 'topic' | 'expository';
  title: string;
  preacher: string;
  date: string;
  bibleReference: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface Announcement {
  id: string;
  content: string;
  enabled: boolean;
}