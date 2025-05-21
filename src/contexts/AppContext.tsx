import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { AppMode, Chapter, Language, SessionData } from '../types';
import { fetchChapter, fetchChapters, getAudioUrl, isStorageAvailable } from '../utils/api';

interface AppContextType {
  // App state
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  setCurrentChapter: (chapter: number) => void;
  
  // Verse selection and playback
  startVerse: number;
  endVerse: number;
  setVerseRange: (start: number, end: number) => void;
  currentVerse: number;
  setCurrentVerse: (verse: number) => void;
  
  // Audio control
  isPlaying: boolean;
  repeatCount: number;
  setRepeatCount: (count: number) => void;
  playPause: () => void;
  stop: () => void;
  playPrevious: () => void;
  playNext: () => void;
  reciter: string;
  setReciter: (reciter: string) => void;
  
  // Teacher mode
  markedVerses: {
    [chapter: number]: {
      [verse: number]: string;
    };
  };
  markVerse: (chapter: number, verse: number, comment: string) => void;
  
  // Session management
  sessions: SessionData[];
  currentSession: string | null;
  saveSession: (name: string) => void;
  loadSession: (name: string) => void;
  exportSession: () => string;
  importSession: (data: string) => void;
  
  // Loading states
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Global error handler
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error caught:', event.error);
      // Prevent app from crashing completely
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // App state
  const [mode, setMode] = useState<AppMode>('student');
  const [language, setLanguage] = useState<Language>('en');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapterState] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Verse selection and playback
  const [startVerse, setStartVerse] = useState(1);
  const [endVerse, setEndVerse] = useState(5);
  const [currentVerse, setCurrentVerse] = useState(1);
  
  // Audio control
  const [howl, setHowl] = useState<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0); // 0 = infinite
  const [currentRepeats, setCurrentRepeats] = useState(0);
  const [reciter, setReciter] = useState<string>('Abdullah Basfar');
  
  // Use ref for functions to avoid dependency cycles
  const handlePlaybackEndRef = useRef<() => void>(() => {});
  const loadAudioRef = useRef<(chapter: number, verse: number) => Howl>(() => new Howl({src: ['']}));
  
  // Teacher mode
  const [markedVerses, setMarkedVerses] = useState<{
    [chapter: number]: {
      [verse: number]: string;
    };
  }>({});
  
  // Session management
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  
  // Load chapters on initial render
  useEffect(() => {
    const loadChapters = async () => {
      try {
        const data = await fetchChapters();
        setChapters(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load chapters:', error);
        setIsLoading(false);
      }
    };
    
    loadChapters();
    
    // Load saved sessions and marked verses from localStorage
    if (isStorageAvailable('localStorage')) {
      try {
        const savedSessions = localStorage.getItem('quran-memorizer-sessions');
        if (savedSessions) {
          setSessions(JSON.parse(savedSessions));
        }
        
        // Load marked verses from localStorage
        const savedMarkedVerses = localStorage.getItem('quran-memorizer-marked-verses');
        if (savedMarkedVerses) {
          setMarkedVerses(JSON.parse(savedMarkedVerses));
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
    
    // Check for session in URL
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionParam = urlParams.get('session');
      
      if (sessionParam) {
        try {
          const sessionData = JSON.parse(decodeURIComponent(sessionParam));
          if (sessionData && sessionData.name && sessionData.chapter) {
            // Add the session from URL
            setSessions(prev => {
              // Check if session with same name already exists
              const exists = prev.some(s => s.name === sessionData.name);
              if (exists) {
                // Add with modified name
                const newName = `${sessionData.name} (Imported)`;
                const updatedSession = { ...sessionData, name: newName };
                return [...prev, updatedSession];
              }
              return [...prev, sessionData];
            });
            
            // We'll handle loading the session in a separate useEffect
            const savedSessionName = sessionData.name;
            // Store the session name to load in sessionStorage 
            sessionStorage.setItem('sessionToLoad', savedSessionName);
          }
        } catch (parseError) {
          console.error('Failed to parse session from URL', parseError);
        }
      }
    } catch (error) {
      console.error('Error checking session in URL:', error);
    }
  }, []);
  
  // Save sessions to localStorage when they change
  useEffect(() => {
    if (isStorageAvailable('localStorage')) {
      try {
        localStorage.setItem('quran-memorizer-sessions', JSON.stringify(sessions));
      } catch (error) {
        console.error('Failed to save sessions to localStorage:', error);
      }
    }
  }, [sessions]);
  
  // Save marked verses to localStorage when they change
  useEffect(() => {
    if (isStorageAvailable('localStorage')) {
      try {
        localStorage.setItem('quran-memorizer-marked-verses', JSON.stringify(markedVerses));
      } catch (error) {
        console.error('Failed to save marked verses to localStorage:', error);
      }
    }
  }, [markedVerses]);
  
  // Handle loading session from URL after sessions are loaded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const sessionToLoad = sessionStorage.getItem('sessionToLoad');
    if (sessionToLoad && sessions.length > 0) {
      // Find the session in our loaded sessions
      const session = sessions.find(s => s.name === sessionToLoad);
      if (session) {
        // Load the session
        loadSession(sessionToLoad);
        // Clear the stored name to prevent reloading
        sessionStorage.removeItem('sessionToLoad');
      }
    }
  }, [sessions]);
  
  // Monitor verse range and current verse to ensure proper playback
  useEffect(() => {
    console.log(`Verse range changed or current verse updated: ${startVerse}-${endVerse}, current: ${currentVerse}`);
    
    // Reset repeats counter when current verse changes
    setCurrentRepeats(0);
    
    // Ensure current verse is within range
    if (currentVerse < startVerse) {
      console.log(`Current verse ${currentVerse} is below range start ${startVerse}, adjusting`);
      setCurrentVerse(startVerse);
    } else if (currentVerse > endVerse) {
      console.log(`Current verse ${currentVerse} is above range end ${endVerse}, adjusting`);
      setCurrentVerse(endVerse);
    }
    
    // If playing, ensure we're playing the correct verse
    if (isPlaying && currentChapter && loadAudioRef.current) {
      console.log(`Updating audio to play current verse ${currentVerse}`);
      const freshHowl = loadAudioRef.current(currentChapter.id, currentVerse);
      freshHowl.play();
    }
  }, [startVerse, endVerse, currentVerse, isPlaying, currentChapter]);

  // Refetch chapter when language changes to update translation
  useEffect(() => {
    if (currentChapter) {
      fetchChapter(currentChapter.id, language).then((data) => {
        setCurrentChapterState(data);
      });
    }
  }, [language]);
  
  // Set current chapter
  const setCurrentChapter = async (chapterNumber: number) => {
    setIsLoading(true);
    try {
      const data = await fetchChapter(chapterNumber, language);
      if (data && data.verses) {
        setCurrentChapterState(data);
        
        // Reset verse range to first 5 verses (or fewer if the chapter has less than 5 verses)
        setStartVerse(1);
        const defaultEndVerse = Math.min(5, data.total_verses);
        setEndVerse(defaultEndVerse);
        setCurrentVerse(1);
        
        // Stop any playing audio
        stop();
      } else {
        console.error(`No verses found for chapter ${chapterNumber}`);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error(`Failed to load chapter ${chapterNumber}:`, error);
      setIsLoading(false);
    }
  };
  
  // Set verse range
  const setVerseRange = (start: number, end: number) => {
    console.log(`Setting verse range: ${start}-${end}`);
    
    // Stop any playing audio first to avoid race conditions
    howl?.stop();
    howl?.unload();
    setIsPlaying(false);
    
    // Reset repeats counter
    setCurrentRepeats(0);
    
    // Update verse range state
    setStartVerse(start);
    setEndVerse(end);
    setCurrentVerse(start);
    
    // Pre-load the audio for the first verse in the range
    if (currentChapter) {
      // Small delay to ensure state updates have completed
      setTimeout(() => {
        const freshHowl = loadAudioRef.current(currentChapter.id, start);
        console.log(`Preloaded audio for chapter ${currentChapter.id}, verse ${start}`);
      }, 100);
    }
  };
  
  // Audio playback functions
  const loadAudio = useCallback((chapter: number, verse: number) => {
    console.log(`Loading audio for chapter ${chapter}, verse ${verse}, reciter ${reciter}`);
    
    // Stop any existing audio
    if (howl) {
      howl.stop();
      howl.unload(); // Properly clean up the previous audio
    }
    
    // Create new Howl instance with better error handling
    const newHowl = new Howl({
      src: [getAudioUrl(chapter, verse, reciter)],
      html5: true,
      onend: handlePlaybackEndRef.current,
      onload: () => {
        console.log(`Successfully loaded audio for chapter ${chapter}, verse ${verse}, reciter ${reciter}`);
      },
      onloaderror: (id, error) => {
        console.error(`Error loading audio for chapter ${chapter}, verse ${verse}, reciter ${reciter}:`, error);
        // Attempt recovery if loading fails
        setTimeout(() => {
          console.log(`Attempting to reload audio for chapter ${chapter}, verse ${verse}, reciter ${reciter}`);
          newHowl.load();
        }, 1000);
      },
      onplayerror: (id, error) => {
        console.error(`Error playing audio for chapter ${chapter}, verse ${verse}, reciter ${reciter}:`, error);
        // Attempt recovery if playback fails
        if (isPlaying) {
          setTimeout(() => {
            console.log(`Attempting to replay audio for chapter ${chapter}, verse ${verse}, reciter ${reciter}`);
            newHowl.play();
          }, 1000);
        }
      }
    });
    
    // Update state with the new Howl instance
    setHowl(newHowl);
    return newHowl;
  }, [howl, isPlaying, reciter]);
  
  // Store loadAudio in ref
  loadAudioRef.current = loadAudio;
  
  const playPause = () => {
    if (!currentChapter) return;
    
    if (isPlaying) {
      howl?.pause();
      setIsPlaying(false);
    } else {
      // Always ensure we're playing the right verse
      // This fixes issues where the slider changed the verse but the audio wasn't updated
      const newHowl = loadAudio(currentChapter.id, currentVerse);
      newHowl.play();
      setIsPlaying(true);
    }
  };
  
  const stop = () => {
    howl?.stop();
    setIsPlaying(false);
    setCurrentRepeats(0);
  };
  
  const playPrevious = () => {
    if (!currentChapter || currentVerse <= startVerse) return;
    
    const prevVerse = currentVerse - 1;
    setCurrentVerse(prevVerse);
    setCurrentRepeats(0);
    
    // Load and play the previous verse
    const newHowl = loadAudioRef.current(currentChapter.id, prevVerse);
    newHowl.play();
    setIsPlaying(true);
  };
  
  const playNext = () => {
    if (!currentChapter || currentVerse >= endVerse) return;
    
    const nextVerse = currentVerse + 1;
    setCurrentVerse(nextVerse);
    setCurrentRepeats(0);
    
    // Load and play the next verse
    const newHowl = loadAudioRef.current(currentChapter.id, nextVerse);
    newHowl.play();
    setIsPlaying(true);
  };
  
  // This function handles what happens when a verse finishes playing
  const handlePlaybackEnd = useCallback(() => {
    if (!currentChapter) return;
    
    console.log(`Playback ended - Current verse: ${currentVerse}, Start: ${startVerse}, End: ${endVerse}, Current repeats: ${currentRepeats}, Repeat count: ${repeatCount}`);
    
    // Create a function to handle the next action directly, rather than relying on state updates
    const handleNextAction = () => {
      // Make sure we're using the latest state values
      const latestChapter = currentChapter;
      const verseToPlay = currentVerse;
      const latestStartVerse = startVerse;
      const latestEndVerse = endVerse;
      const timesRepeated = currentRepeats + 1; // Increment repeat count
      
      // Single verse mode
      if (latestStartVerse === latestEndVerse) {
        if (repeatCount === 0 || timesRepeated < repeatCount) {
          // Still need to repeat this verse
          console.log(`Single verse mode: Repeating verse ${verseToPlay}, repeat ${timesRepeated}/${repeatCount === 0 ? 'infinite' : repeatCount}`);
          setCurrentRepeats(timesRepeated);
          
          // Create fresh audio to avoid any stale references
          const freshHowl = new Howl({
            src: [getAudioUrl(latestChapter.id, verseToPlay, reciter)],
            html5: true,
            onend: handlePlaybackEndRef.current,
            onloaderror: () => console.error(`Error loading audio for verse ${verseToPlay}`),
            onplayerror: () => console.error(`Error playing audio for verse ${verseToPlay}`)
          });
          setHowl(freshHowl);
          freshHowl.play();
        } else {
          // Reached max repeats for single verse
          console.log(`Single verse mode: Reached max repeats (${repeatCount}) for verse ${verseToPlay}, stopping playback`);
          stop();
        }
        return;
      }
      
      // Range mode (multiple verses selected)
      console.log(`Range mode - Verse ${verseToPlay}, Repeats: ${timesRepeated}, RepeatCount: ${repeatCount}`);
      
      // Decide what to do next based on repeat count
      if (repeatCount <= 1) {
        // For repeatCount=0 or repeatCount=1, play each verse once then move to next
        console.log(`Range mode: Moving to next verse after playing verse ${verseToPlay} once`);
        proceedToNextVerse(latestChapter.id, verseToPlay, latestStartVerse, latestEndVerse);
      } else {
        // For repeatCount>1, play each verse multiple times
        setCurrentRepeats(timesRepeated);
        console.log(`Range mode: Verse ${verseToPlay} played ${timesRepeated}/${repeatCount} times`);
        
        if (timesRepeated >= repeatCount) {
          // We've played this verse enough times, move to next
          console.log(`Range mode: Completed ${repeatCount} repeats for verse ${verseToPlay}, moving to next verse`);
          proceedToNextVerse(latestChapter.id, verseToPlay, latestStartVerse, latestEndVerse);
        } else {
          // Not done repeating this verse yet
          console.log(`Range mode: Replaying verse ${verseToPlay}, repeat ${timesRepeated}/${repeatCount}`);
          
          // Create fresh audio to avoid any stale references
          const freshHowl = new Howl({
            src: [getAudioUrl(latestChapter.id, verseToPlay, reciter)],
            html5: true,
            onend: handlePlaybackEndRef.current,
            onloaderror: () => console.error(`Error loading audio for verse ${verseToPlay}`),
            onplayerror: () => console.error(`Error playing audio for verse ${verseToPlay}`)
          });
          setHowl(freshHowl);
          freshHowl.play();
        }
      }
    };
    
    // Execute immediately to avoid state timing issues
    handleNextAction();
  }, [currentChapter, currentVerse, startVerse, endVerse, currentRepeats, repeatCount, reciter, stop]);
  
  // Helper function to handle moving to the next verse or looping back
  const proceedToNextVerse = (chapterId: number, currentVerseNum: number, rangeStart: number, rangeEnd: number) => {
    console.log(`Proceeding from verse ${currentVerseNum} in range ${rangeStart}-${rangeEnd}`);
    
    // Reset repeat counter for the new verse
    setCurrentRepeats(0);
    
    // If we haven't reached the end of the range yet
    if (currentVerseNum < rangeEnd) {
      // Move to next verse
      const nextVerse = currentVerseNum + 1;
      console.log(`Moving from verse ${currentVerseNum} to next verse ${nextVerse}`);
      setCurrentVerse(nextVerse);
      
      // Load and play the next verse - create fresh Howl to avoid stale references
      const freshHowl = new Howl({
        src: [getAudioUrl(chapterId, nextVerse, reciter)],
        html5: true,
        onend: handlePlaybackEndRef.current,
        onloaderror: () => console.error(`Error loading audio for verse ${nextVerse}`),
        onplayerror: () => console.error(`Error playing audio for verse ${nextVerse}`)
      });
      setHowl(freshHowl);
      freshHowl.play();
    } else {
      // We've reached the end of the range
      if (repeatCount === 0) {
        // Loop back to start for infinite range repeat
        console.log(`Reached end of range (${rangeEnd}), looping back to start (${rangeStart})`);
        setCurrentVerse(rangeStart);
        
        // Create fresh Howl to avoid stale references
        const freshHowl = new Howl({
          src: [getAudioUrl(chapterId, rangeStart, reciter)],
          html5: true,
          onend: handlePlaybackEndRef.current,
          onloaderror: () => console.error(`Error loading audio for verse ${rangeStart}`),
          onplayerror: () => console.error(`Error playing audio for verse ${rangeStart}`)
        });
        setHowl(freshHowl);
        freshHowl.play();
      } else {
        // Stop playback when we've completed the range
        console.log(`Completed full range playback from ${rangeStart} to ${rangeEnd}, stopping`);
        stop();
      }
    }
  };
  
  // Teacher mode functions
  const markVerse = (chapter: number, verse: number, comment: string) => {
    setMarkedVerses(prev => ({
      ...prev,
      [chapter]: {
        ...(prev[chapter] || {}),
        [verse]: comment
      }
    }));
  };
  
  // Session management functions
  const saveSession = (name: string) => {
    if (!currentChapter) return;
    
    const sessionData: SessionData = {
      name,
      chapter: currentChapter.id,
      startVerse,
      endVerse,
      mode,
      language,
      reciter,
      repeat: repeatCount,
      markedVerses
    };
    
    // Check if session with this name already exists
    const existingIndex = sessions.findIndex(s => s.name === name);
    
    if (existingIndex >= 0) {
      // Update existing session
      const updatedSessions = [...sessions];
      updatedSessions[existingIndex] = sessionData;
      setSessions(updatedSessions);
    } else {
      // Add new session
      setSessions(prev => [...prev, sessionData]);
    }
    
    setCurrentSession(name);
  };
  
  const loadSession = (name: string) => {
    const session = sessions.find(s => s.name === name);
    if (!session) return;
    
    setMode(session.mode as AppMode);
    setLanguage(session.language as Language);
    setReciter(session.reciter || 'Alafasy_64kbps');
    setRepeatCount(session.repeat);
    setMarkedVerses(session.markedVerses);
    setCurrentSession(name);
    
    // Load chapter first - but we need to handle setting verse range after chapter is loaded
    setCurrentChapter(session.chapter);
    
    // Store the desired verse range for restoration after chapter loads
    const desiredStartVerse = session.startVerse;
    const desiredEndVerse = session.endVerse;
    
    // Force update for verse range after a small delay to ensure chapter is loaded
    setTimeout(() => {
      // Ensure we restore the saved verse range
      setVerseRange(desiredStartVerse, desiredEndVerse);
      // Also explicitly set current verse to start verse
      setCurrentVerse(desiredStartVerse);
    }, 500);
  };
  
  const exportSession = () => {
    if (!currentSession) return '';
    
    const session = sessions.find(s => s.name === currentSession);
    if (!session) return '';
    
    return JSON.stringify(session);
  };
  
  const importSession = (data: string) => {
    try {
      const session = JSON.parse(data) as SessionData;
      
      // Validate session data
      if (!session.name || !session.chapter) {
        throw new Error('Invalid session data');
      }
      
      // Add to sessions
      setSessions(prev => [...prev, session]);
      
      // Load the imported session
      setMode(session.mode as AppMode);
      setLanguage(session.language as Language);
      setReciter(session.reciter || 'Alafasy_64kbps');
      setRepeatCount(session.repeat);
      setMarkedVerses(session.markedVerses);
      setCurrentSession(session.name);
      
      // Load chapter and set verse range
      setCurrentChapter(session.chapter);
      setVerseRange(session.startVerse, session.endVerse);
    } catch (error) {
      console.error('Failed to import session:', error);
    }
  };
  
  // Update the handlePlaybackEnd ref after the function is defined
  handlePlaybackEndRef.current = handlePlaybackEnd;

  const value: AppContextType = {
    mode,
    setMode,
    language,
    setLanguage,
    chapters,
    currentChapter,
    setCurrentChapter,
    startVerse,
    endVerse,
    setVerseRange,
    currentVerse,
    setCurrentVerse,
    isPlaying,
    repeatCount,
    setRepeatCount,
    playPause,
    stop,
    playPrevious,
    playNext,
    reciter,
    setReciter,
    markedVerses,
    markVerse,
    sessions,
    currentSession,
    saveSession,
    loadSession,
    exportSession,
    importSession,
    isLoading
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
