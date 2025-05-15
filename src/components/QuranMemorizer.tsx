import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Slider, 
  Button, 
  TextField, 
  Paper, 
  IconButton,
  SelectChangeEvent,
  CircularProgress,
  Stack
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import StopIcon from '@mui/icons-material/Stop';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import UploadIcon from '@mui/icons-material/Upload';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useApp } from '../contexts/AppContext';
import VerseDisplay from './VerseDisplay';
import MultiVerseView from './MultiVerseView';
import { Language } from '../types';

const QuranMemorizer: React.FC = () => {
  const {
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
    isPlaying,
    repeatCount,
    setRepeatCount,
    playPause,
    stop,
    playPrevious,
    playNext,
    markedVerses,
    markVerse,
    sessions,
    currentSession,
    saveSession,
    loadSession,
    exportSession,
    importSession,
    isLoading
  } = useApp();

  // Local state
  const [markingComment, setMarkingComment] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [importData, setImportData] = useState('');
  const [showImportField, setShowImportField] = useState(false);

  // Handle chapter selection
  const handleChapterChange = (event: SelectChangeEvent<number>) => {
    const chapterNumber = Number(event.target.value);
    setCurrentChapter(chapterNumber);
  };

  // Handle mode selection
  const handleModeChange = (event: SelectChangeEvent<string>) => {
    setMode(event.target.value as 'student' | 'teacher');
  };

  // Handle language selection
  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    setLanguage(event.target.value as Language);
  };

  // Handle verse range selection
  const handleRangeChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setVerseRange(newValue[0], newValue[1]);
    }
  };

  // Handle repeat selection
  const handleRepeatChange = (event: SelectChangeEvent<number>) => {
    setRepeatCount(Number(event.target.value));
  };

  // Handle marking a verse
  const handleMarkVerse = () => {
    if (!currentChapter) return;
    markVerse(currentChapter.id, currentVerse, markingComment);
    setMarkingComment('');
  };

  // Handle opening verse marking dialog
  const handleOpenMarkDialog = (verseId: number) => {
    // In a more complex app, this would open a dialog
    // For now, we'll just set the current verse and focus the comment field
    if (!currentChapter) return;
    
    const existingComment = markedVerses[currentChapter.id]?.[verseId] || '';
    setMarkingComment(existingComment);
  };

  // Handle saving session
  const handleSaveSession = () => {
    if (!sessionName) return;
    saveSession(sessionName);
    setSessionName('');
  };

  // Handle loading session
  const handleLoadSession = (event: SelectChangeEvent<string>) => {
    const name = event.target.value;
    if (!name) return;
    loadSession(name);
  };

  // Handle exporting session
  const handleExportSession = () => {
    const data = exportSession();
    if (!data) return;
    
    try {
      // Create URL hash data for sharing
      const encoded = encodeURIComponent(data);
      const url = `${window.location.origin}${window.location.pathname}?session=${encoded}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(url)
        .then(() => {
          alert('Session URL copied to clipboard! You can share this URL with others.');
        })
        .catch(err => {
          console.error('Failed to copy URL to clipboard', err);
          
          // Fallback: create a blob and download it
          const blob = new Blob([data], { type: 'application/json' });
          const fileUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = fileUrl;
          a.download = `${currentSession || 'quran-session'}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(fileUrl);
        });
    } catch (error) {
      console.error('Error exporting session:', error);
      alert('Failed to export session. Please try again.');
    }
  };

  // Handle importing session
  const handleImportSession = () => {
    if (!importData) return;
    
    try {
      // Check if the input is a URL first
      if (importData.includes('session=')) {
        const url = new URL(importData);
        const sessionParam = url.searchParams.get('session');
        if (sessionParam) {
          const decodedData = decodeURIComponent(sessionParam);
          importSession(decodedData);
        } else {
          throw new Error('No session data found in URL');
        }
      } else {
        // Assume it's raw JSON
        importSession(importData);
      }
      
      setImportData('');
      setShowImportField(false);
      
    } catch (error) {
      console.error('Failed to import session:', error);
      alert('Failed to import session. Please check your data format and try again.');
    }
  };

  // Get current verse object
  const getCurrentVerse = () => {
    if (!currentChapter) return null;
    return currentChapter.verses.find(v => v.id === currentVerse) || null;
  };

  // Get end verse object (if different from current)
  const getEndVerse = () => {
    if (!currentChapter || startVerse === endVerse) return null;
    return currentChapter.verses.find(v => v.id === endVerse) || null;
  };

  // Get filtered verses for multi-verse view
  const getFilteredVerses = () => {
    if (!currentChapter) return [];
    return currentChapter.verses.filter(v => v.id >= startVerse && v.id <= endVerse);
  };

  // Check if a verse is marked
  const isVerseMarked = (verseId: number) => {
    if (!currentChapter) return false;
    return !!markedVerses[currentChapter.id]?.[verseId];
  };

  // Get marking comment for a verse
  const getMarkingComment = (verseId: number) => {
    if (!currentChapter) return '';
    return markedVerses[currentChapter.id]?.[verseId] || '';
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Memorize the Quraan
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Controls Section */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Stack spacing={2}>
              {/* Top Controls */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                {/* Mode Selection */}
                <Box sx={{ minWidth: '200px', flex: 1 }}>
                  <FormControl fullWidth size="small" margin="normal">
                    <InputLabel>Mode</InputLabel>
                    <Select
                      value={mode}
                      label="Mode"
                      onChange={handleModeChange}
                    >
                      <MenuItem value="student">Student Mode</MenuItem>
                      <MenuItem value="teacher">Teacher Mode</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Language Selection */}
                <Box sx={{ minWidth: '200px', flex: 1 }}>
                  <FormControl fullWidth size="small" margin="normal">
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={language}
                      label="Language"
                      onChange={handleLanguageChange}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="ar">Arabic</MenuItem>
                      <MenuItem value="bn">Bengali</MenuItem>
                      <MenuItem value="zh">Chinese</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="id">Indonesian</MenuItem>
                      <MenuItem value="ru">Russian</MenuItem>
                      <MenuItem value="sv">Swedish</MenuItem>
                      <MenuItem value="tr">Turkish</MenuItem>
                      <MenuItem value="ur">Urdu</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Reciter Selection (disabled for now) */}
                <Box sx={{ minWidth: '200px', flex: 1 }}>
                  <FormControl fullWidth size="small" margin="normal" disabled>
                    <InputLabel>Reciter</InputLabel>
                    <Select
                      value={0}
                      label="Reciter"
                    >
                      <MenuItem value={0}>Mishary Rashid Alafasy</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Chapter Selection */}
                <Box sx={{ minWidth: '200px', flex: 1 }}>
                  <FormControl fullWidth size="small" margin="normal">
                    <InputLabel>Chapter</InputLabel>
                    <Select
                      value={currentChapter?.id || ''}
                      label="Chapter"
                      onChange={handleChapterChange}
                      displayEmpty
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300
                          }
                        }
                      }}
                    >
                      <MenuItem value="" disabled>Select a chapter</MenuItem>
                      {chapters.map(chapter => (
                        <MenuItem key={chapter.id} value={chapter.id}>
                          {chapter.id}. {chapter.transliteration}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>

              {/* Verse Range Slider (only show if chapter is selected) */}
              {currentChapter && (
                <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Selected Verses: {startVerse} - {endVerse} {startVerse === endVerse ? '(Single verse)' : `(${endVerse - startVerse + 1} verses)`} of {currentChapter.total_verses} total
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {startVerse === endVerse 
                      ? 'Drag slider handles to select a range of verses for memorization' 
                      : 'Playback will progress through selected range based on repeat settings'}
                  </Typography>
                  <Slider
                    value={[startVerse, endVerse]}
                    onChange={handleRangeChange}
                    onChangeCommitted={(event, newValue) => {
                      // This ensures the range change is only applied when the user finishes dragging
                      if (Array.isArray(newValue)) {
                        console.log(`Range changed to: ${newValue[0]}-${newValue[1]}`);
                        setVerseRange(newValue[0], newValue[1]);
                      }
                    }}
                    min={1}
                    max={currentChapter.total_verses}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: Math.ceil(currentChapter.total_verses * 0.25), label: Math.ceil(currentChapter.total_verses * 0.25).toString() },
                      { value: Math.floor(currentChapter.total_verses / 2), label: Math.floor(currentChapter.total_verses / 2).toString() },
                      { value: Math.floor(currentChapter.total_verses * 0.75), label: Math.floor(currentChapter.total_verses * 0.75).toString() },
                      { value: currentChapter.total_verses, label: currentChapter.total_verses.toString() }
                    ]}
                    valueLabelDisplay="auto"
                    disableSwap
                  />
                </Box>
              )}

              {/* Repeat Selection */}
              <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Repeat Playback</InputLabel>
                  <Select
                    value={repeatCount}
                    label="Repeat Playback"
                    onChange={handleRepeatChange}
                  >
                    <MenuItem value={0}>Replay Forever</MenuItem>
                    <MenuItem value={1}>Play Once</MenuItem>
                    <MenuItem value={2}>Replay 2 Times</MenuItem>
                    <MenuItem value={3}>Replay 3 Times</MenuItem>
                    <MenuItem value={4}>Replay 4 Times</MenuItem>
                    <MenuItem value={5}>Replay 5 Times</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {startVerse === endVerse 
                    ? `Will repeat this verse ${repeatCount === 0 ? 'infinitely' : repeatCount === 1 ? 'once' : `${repeatCount} times`}.`
                    : repeatCount === 0 
                      ? `Will play each verse once and loop through the entire range infinitely.` 
                      : repeatCount === 1 
                        ? `Will play each verse once through the range.` 
                        : `Will repeat each verse ${repeatCount} times before moving to the next verse.`
                  }
                </Typography>
              </Box>

              {/* Playback Controls */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                <IconButton 
                  color="primary" 
                  disabled={!currentChapter || currentVerse <= startVerse}
                  onClick={playPrevious}
                  sx={{ bgcolor: 'primary.light', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}
                >
                  <SkipPreviousIcon />
                </IconButton>
                
                <IconButton 
                  color="primary" 
                  disabled={!currentChapter}
                  onClick={playPause}
                  sx={{ bgcolor: 'primary.light', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}
                >
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                
                <IconButton 
                  color="primary" 
                  disabled={!currentChapter || currentVerse >= endVerse}
                  onClick={playNext}
                  sx={{ bgcolor: 'primary.light', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}
                >
                  <SkipNextIcon />
                </IconButton>
                
                <Button 
                  variant="contained" 
                  color="secondary" 
                  disabled={!currentChapter || !isPlaying}
                  onClick={stop}
                  startIcon={<StopIcon />}
                >
                  Stop
                </Button>
              </Box>
            </Stack>
          </Paper>

          {/* Teacher Controls (only in teacher mode) */}
          {mode === 'teacher' && currentChapter && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Teacher Controls
              </Typography>
              
              <TextField
                fullWidth
                label="Feedback for Current Verse"
                multiline
                rows={2}
                value={markingComment}
                onChange={(e) => setMarkingComment(e.target.value)}
                placeholder="Enter feedback for the student"
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditNoteIcon />}
                onClick={handleMarkVerse}
              >
                Mark Verse
              </Button>
            </Paper>
          )}

          {/* Verse Display */}
          {currentChapter && (
            <>
              {/* Current Verse Display */}
              <VerseDisplay
                verse={getCurrentVerse()}
                language={language}
                isMarked={isVerseMarked(currentVerse)}
                markingComment={getMarkingComment(currentVerse)}
                position="start"
              />

              {/* End Verse Display (if different from current) */}
              {startVerse !== endVerse && (
                <VerseDisplay
                  verse={getEndVerse()}
                  language={language}
                  isMarked={isVerseMarked(endVerse)}
                  markingComment={getMarkingComment(endVerse)}
                  position="end"
                />
              )}

              {/* Multi-Verse View (only in teacher mode) */}
              {mode === 'teacher' && (
                <MultiVerseView
                  verses={getFilteredVerses()}
                  currentVerse={currentVerse}
                  markedVerses={markedVerses[currentChapter.id] || {}}
                  onMarkVerse={handleOpenMarkDialog}
                  language={language}
                />
              )}
            </>
          )}

          {/* Session Management */}
          <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Session Management
            </Typography>
            
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                  <TextField
                    fullWidth
                    label="Session Name"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="Enter session name"
                    size="small"
                  />
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Saved Sessions</InputLabel>
                    <Select
                      value={currentSession || ''}
                      label="Saved Sessions"
                      onChange={handleLoadSession}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>Select a saved session</MenuItem>
                      {sessions.map(session => (
                        <MenuItem key={session.name} value={session.name}>
                          {session.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSession}
                  disabled={!sessionName || !currentChapter}
                >
                  Save Session
                </Button>
                
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ShareIcon />}
                  onClick={handleExportSession}
                  disabled={!currentSession}
                >
                  Export Session
                </Button>
                
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<UploadIcon />}
                  onClick={() => setShowImportField(!showImportField)}
                >
                  Import Session
                </Button>
              </Box>
              
              {showImportField && (
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    label="Paste Session Data"
                    multiline
                    rows={3}
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  
                  <Button
                    variant="contained"
                    onClick={handleImportSession}
                    disabled={!importData}
                  >
                    Import
                  </Button>
                </Box>
              )}
            </Stack>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default QuranMemorizer;
