export interface Chapter {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  total_verses: number;
  verses: Verse[];
}

export interface Verse {
  id: number;
  chapter: number;
  text: string;
  transliteration: string;
  translations: {
    [key: string]: string;
  };
  meta?: {
    juz: number;
    page: number;
    sajda?: boolean;
  };
  number?: number; // Global verse number
}

export interface SessionData {
  name: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  mode: 'student' | 'teacher';
  language: string;
  reciter: number;
  repeat: number;
  markedVerses: {
    [chapter: number]: {
      [verse: number]: string;
    };
  };
}

export type AppMode = 'student' | 'teacher';
export type Language = 'en' | 'ar' | 'bn' | 'zh' | 'es' | 'fr' | 'id' | 'ru' | 'sv' | 'tr' | 'ur';
