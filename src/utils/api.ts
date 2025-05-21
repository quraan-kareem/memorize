import axios from 'axios';
import { Chapter, Verse } from '../types';

const BASE_URL = 'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist';

// Define a dictionary of reciters and their audio base URLs
export const AUDIO_BASE_URLS: { [reciter: string]: string } = {
  'Mishary Alafasy': 'https://everyayah.com/data/Alafasy_64kbps',
  'Abdullah Basfar': 'https://everyayah.com/data/Abdullah_Basfar_192kbps/',
  // Add more reciters here as needed
};

// Utility function to check if localStorage is available
export const isStorageAvailable = (type: string): boolean => {
  try {
    const storage = window[type as keyof Window];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
};

export const fetchChapters = async (): Promise<Chapter[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/chapters/index.json`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chapters:', error);
    throw error;
  }
};

export const fetchChapter = async (chapterNumber: number, language: string = 'en'): Promise<Chapter> => {
  try {
    // First get the Arabic version as base
    const arabicUrl = `${BASE_URL}/chapters/${chapterNumber}.json`;
    const arabicResponse = await axios.get(arabicUrl);
    const baseChapter = arabicResponse.data;
    
    // If language is not Arabic, fetch translations and merge
    if (language !== 'ar') {
      try {
        const translationUrl = `${BASE_URL}/chapters/${language}/${chapterNumber}.json`;
        const translationResponse = await axios.get(translationUrl);
        const translationData = translationResponse.data;
        
        // Merge translations with base chapter
        if (translationData && translationData.verses) {
          baseChapter.verses = baseChapter.verses.map((verse: Verse, index: number) => {
            const translationVerse = translationData.verses[index];
            if (translationVerse) {                return {
                    ...verse,
                    translations: {
                      ...verse.translations,
                      [language]: translationVerse.translation || translationVerse.text
                    }
                  };
            }
            return verse;
          });
        }
      } catch (translationError) {
        console.warn(`Could not fetch translation for chapter ${chapterNumber} in ${language}, falling back to English`);
        // Try to get English if the requested language fails
        if (language !== 'en') {
          try {
            const enUrl = `${BASE_URL}/chapters/en/${chapterNumber}.json`;
            const enResponse = await axios.get(enUrl);
            const enData = enResponse.data;
            
            if (enData && enData.verses) {
              baseChapter.verses = baseChapter.verses.map((verse: Verse, index: number) => {
                const enVerse = enData.verses[index];
                if (enVerse) {
                  return {
                    ...verse,
                    translations: {
                      ...verse.translations,
                      en: enVerse.translation || enVerse.text
                    }
                  };
                }
                return verse;
              });
            }
          } catch (enError) {
            console.error('Failed to fetch English translation as fallback');
          }
        }
      }
    }
    
    return baseChapter;
  } catch (error) {
    console.error(`Error fetching chapter ${chapterNumber}:`, error);
    throw error;
  }
};

export const fetchVerse = async (globalVerseNumber: number): Promise<Verse> => {
  try {
    const response = await axios.get(`${BASE_URL}/verses/${globalVerseNumber}.json`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching verse ${globalVerseNumber}:`, error);
    throw error;
  }
};

// Calculate global verse number from chapter and verse
export const getGlobalVerseNumber = (chapter: number, verse: number): number => {
  // This is a simplified approach that requires pre-calculated offsets
  // In a production app, we would use a proper mapping
  let globalVerse = verse;
  
  // Add the total verses from previous chapters
  for (let i = 1; i < chapter; i++) {
    // These are the verse counts for each chapter in the Quran
    const verseCounts = [
      7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 
      111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 
      54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 
      49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 
      44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 
      26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 
      6, 3, 5, 4, 5, 6
    ];
    
    if (i <= verseCounts.length) {
      globalVerse += verseCounts[i - 1];
    }
  }
  
  return globalVerse;
};

// Get audio URL for a specific verse
export const getAudioUrl = (chapter: number, verse: number, reciter: string = 'Alafasy_64kbps'): string => {
  // Format chapter and verse numbers with leading zeros
  const formattedChapter = chapter.toString().padStart(3, '0');
  const formattedVerse = verse.toString().padStart(3, '0');
  const baseUrl = AUDIO_BASE_URLS[reciter] || AUDIO_BASE_URLS['Alafasy_64kbps'];
  return `${baseUrl}/${formattedChapter}${formattedVerse}.mp3`;
};

// Get chapter and verse from global verse number
export const getChapterAndVerseFromGlobal = (globalVerseNumber: number): { chapter: number, verse: number } => {
  // These are the verse counts for each chapter in the Quran
  const verseCounts = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 
    111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 
    54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 
    49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 
    44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 
    26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 
    6, 3, 5, 4, 5, 6
  ];
  
  let remainingVerses = globalVerseNumber;
  let chapter = 1;
  
  for (let i = 0; i < verseCounts.length; i++) {
    if (remainingVerses <= verseCounts[i]) {
      chapter = i + 1;
      break;
    }
    remainingVerses -= verseCounts[i];
  }
  
  return { chapter, verse: remainingVerses };
};
