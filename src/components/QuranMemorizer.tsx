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
    setCurrentVerse,
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
    
    // Set current verse to the selected verse
    setCurrentVerse(verseId);
    
    // Set the marking comment to any existing comment for this verse
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
    <Container maxWidth="md" sx={{ py: 5, px: { xs: 2, sm: 3 } }}>
      <Typography 
        variant="h3" 
        component="h1" 
        align="center" 
        sx={{ 
          mb: 4, 
          fontWeight: 600, 
          color: 'primary.dark',
          fontFamily: '"Roboto", "Arial", sans-serif',
          letterSpacing: '0.5px',
          textShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
      >
        Memorize the Quraan
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 8 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Loading...</Typography>
        </Box>
      ) : (
        <>
          {/* Controls Section */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              mb: 4, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Typography 
              variant="h6" 
              component="h2" 
              sx={{ 
                mb: 3, 
                pb: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                fontWeight: 500,
                color: 'primary.main'
              }}
            >
              Configuration
            </Typography>
            
            <Stack spacing={3}>
              {/* Top Controls */}
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { 
                    xs: '1fr', 
                    sm: '1fr 1fr', 
                    md: '1fr 1fr 1fr 1fr'
                  },
                  gap: 2,
                }}
              >
                {/* Mode Selection */}
                <Box>
                  <FormControl fullWidth size="small">
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
                <Box>
                  <FormControl fullWidth size="small">
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
                <Box>
                  <FormControl fullWidth size="small" disabled>
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
                <Box>
                  <FormControl fullWidth size="small">
                    <InputLabel shrink>Chapter</InputLabel>
                    <Select
                      value={currentChapter?.id || ''}
                      label="Chapter"
                      onChange={handleChapterChange}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Select chapter' }}
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
              </Box>

              {/* Verse Range Slider (only show if chapter is selected) */}
              {currentChapter && (
                <Box 
                  sx={{ 
                    width: '100%', 
                    mt: 2, 
                    mb: 2, 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 1
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      sx={{ fontWeight: 500, color: 'primary.dark' }}
                    >
                      Selected Verses: 
                      <Box 
                        component="span" 
                        sx={{ 
                          display: 'inline-block', 
                          mx: 1, 
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: 'primary.main', 
                          color: 'white', 
                          borderRadius: '4px',
                          fontWeight: 'bold'
                        }}
                      >
                        {startVerse} - {endVerse}
                      </Box>
                      {startVerse === endVerse 
                        ? '(Single verse)' 
                        : `(${endVerse - startVerse + 1} verses)`} of {currentChapter.total_verses}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ mb: 2, display: 'block', ml: 0.5 }}
                  >
                    {startVerse === endVerse 
                      ? 'Drag slider handles to select a range of verses for memorization' 
                      : 'Playback will progress through selected range based on repeat settings'}
                  </Typography>
                  
                  <Box sx={{ px: 1.5, mt: 3, mb: 1.5 }}>
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
                      sx={{
                        '& .MuiSlider-thumb': {
                          height: 16,
                          width: 16,
                        },
                        '& .MuiSlider-track': {
                          height: 6
                        },
                        '& .MuiSlider-rail': {
                          height: 6
                        },
                        '& .MuiSlider-mark': {
                          height: 8,
                          width: 2,
                          marginTop: -1
                        }
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Repeat Selection and Playback Controls in a Grid */}
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 4,
                  mt: 1
                }}
              >
                {/* Repeat Selection */}
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      mb: 1.5, 
                      fontWeight: 500, 
                      color: 'primary.dark' 
                    }}
                  >
                    Repeat Settings
                  </Typography>
                  
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
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
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1.5, 
                      bgcolor: 'primary.50',
                      borderColor: 'primary.100' 
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ fontSize: '0.85rem' }}
                    >
                      {startVerse === endVerse 
                        ? `Will repeat this verse ${repeatCount === 0 ? 'infinitely' : repeatCount === 1 ? 'once' : `${repeatCount} times`}.`
                        : repeatCount === 0 
                          ? `Will play each verse once and loop through the entire range infinitely.` 
                          : repeatCount === 1 
                            ? `Will play each verse once through the range.` 
                            : `Will repeat each verse ${repeatCount} times before moving to the next verse.`
                      }
                    </Typography>
                  </Paper>
                </Box>

                {/* Playback Controls */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    p: 2,
                    border: '1px solid', 
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      alignSelf: 'flex-start', 
                      mb: 2, 
                      fontWeight: 500, 
                      color: 'primary.dark' 
                    }}
                  >
                    Playback Controls
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: 2, 
                      width: '100%'
                    }}
                  >
                    <IconButton 
                      disabled={!currentChapter || currentVerse <= startVerse}
                      onClick={playPrevious}
                      sx={{ 
                        p: 1.5,
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        '&:hover': { 
                          bgcolor: 'primary.dark' 
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'action.disabledBackground',
                          color: 'action.disabled'
                        }
                      }}
                    >
                      <SkipPreviousIcon />
                    </IconButton>
                    
                    <IconButton 
                      disabled={!currentChapter}
                      onClick={playPause}
                      sx={{ 
                        p: 1.5,
                        bgcolor: isPlaying ? 'secondary.main' : 'primary.main', 
                        color: 'white', 
                        '&:hover': { 
                          bgcolor: isPlaying ? 'secondary.dark' : 'primary.dark' 
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'action.disabledBackground',
                          color: 'action.disabled'
                        }
                      }}
                    >
                      {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                    
                    <IconButton 
                      disabled={!currentChapter || currentVerse >= endVerse}
                      onClick={playNext}
                      sx={{ 
                        p: 1.5,
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        '&:hover': { 
                          bgcolor: 'primary.dark' 
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'action.disabledBackground',
                          color: 'action.disabled'
                        } 
                      }}
                    >
                      <SkipNextIcon />
                    </IconButton>
                    
                    <Button 
                      variant="contained" 
                      color="error" 
                      disabled={!currentChapter || !isPlaying}
                      onClick={stop}
                      startIcon={<StopIcon />}
                      sx={{ ml: 1 }}
                    >
                      Stop
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Paper>

          {/* Teacher Controls (only in teacher mode) */}
          {mode === 'teacher' && currentChapter && (
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: 4, 
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                borderLeft: '4px solid #4caf50'  // green border for teacher's section
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2.5, 
                  color: '#2e7d32',  // darker green
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    width: 20,
                    height: 20,
                    marginRight: 1,
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M20 17a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4h16v-4zM6 7h11.17a3 3 0 0 0 5.66 0H22V5H4v14h2V7zm14-3a1 1 0 1 1-2 0 1 1 0 0 1 2 0z\' fill=\'%232e7d32\'/%3E%3C/svg%3E")',
                    backgroundSize: 'contain'
                  }
                }}
              >
                Teacher Controls
              </Typography>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 500, 
                    color: 'text.secondary' 
                  }}
                >
                  Provide feedback for verse {currentVerse}:
                </Typography>
                
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Feedback for Current Verse"
                  multiline
                  rows={3}
                  value={markingComment}
                  onChange={(e) => setMarkingComment(e.target.value)}
                  placeholder="Enter feedback for the student"
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5
                    }
                  }}
                />
                
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<EditNoteIcon />}
                  onClick={handleMarkVerse}
                  sx={{
                    fontWeight: 500,
                    boxShadow: 1,
                    px: 3
                  }}
                >
                  Mark Verse
                </Button>
              </Paper>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontSize: '0.85rem',
                  fontStyle: 'italic',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Marked verses will appear with a red border and your feedback
              </Typography>
            </Paper>
          )}

          {/* Verse Display */}
          {currentChapter && (
            <>
              {/* Current Verse Section */}
              <Paper 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  mb: 4,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    py: 1.5, 
                    px: 2, 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ fontWeight: 500 }}
                  >
                    Current Verse: {currentChapter.name} ({currentChapter.transliteration}) - {currentVerse}
                  </Typography>
                  
                  {isPlaying && (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontSize: '0.85rem',
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1
                      }}
                    >
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: '#ff5252', 
                          mr: 1,
                          animation: 'pulse 1.5s infinite ease-in-out',
                          '@keyframes pulse': {
                            '0%': { opacity: 0.6 },
                            '50%': { opacity: 1 },
                            '100%': { opacity: 0.6 }
                          }
                        }}
                      />
                      Playing
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ p: 0 }}>
                  <VerseDisplay
                    verse={getCurrentVerse()}
                    language={language}
                    isMarked={isVerseMarked(currentVerse)}
                    markingComment={getMarkingComment(currentVerse)}
                    position="start"
                  />
                </Box>
              </Paper>

              {/* End Verse Display (if different from current) */}
              {startVerse !== endVerse && (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 4,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: 'secondary.main', 
                      py: 1.5, 
                      px: 2, 
                      color: 'white'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      End Verse: {currentChapter.name} ({currentChapter.transliteration}) - {endVerse}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 0 }}>
                    <VerseDisplay
                      verse={getEndVerse()}
                      language={language}
                      isMarked={isVerseMarked(endVerse)}
                      markingComment={getMarkingComment(endVerse)}
                      position="end"
                    />
                  </Box>
                </Paper>
              )}

              {/* Multi-Verse View (only in teacher mode) */}
              {mode === 'teacher' && (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 4,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    borderLeft: '4px solid #4caf50'
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: 'success.main', 
                      py: 1.5, 
                      px: 2, 
                      color: 'white'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      All Verses in Selected Range
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 2 }}>
                    <MultiVerseView
                      verses={getFilteredVerses()}
                      currentVerse={currentVerse}
                      markedVerses={markedVerses[currentChapter.id] || {}}
                      onMarkVerse={handleOpenMarkDialog}
                      language={language}
                    />
                  </Box>
                </Paper>
              )}
            </>
          )}

          {/* Session Management - Only visible in teacher mode */}
          {mode === 'teacher' && (
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                mt: 4, 
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                bgcolor: '#fcfcfc'
              }}
            >
            <Typography 
              variant="h6" 
              component="h2"
              sx={{ 
                mb: 3, 
                pb: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                fontWeight: 500,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                  content: '""',
                  width: 18,
                  height: 18,
                  marginRight: 1,
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z\' fill=\'%233f51b5\'/%3E%3C/svg%3E")',
                  backgroundSize: 'contain'
                }
              }}
            >
              Session Management
            </Typography>
            
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 3,
                mb: 3
              }}
            >
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 500, 
                    color: 'text.secondary' 
                  }}
                >
                  Create New Session:
                </Typography>
                
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Session Name"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Enter session name"
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5
                    }
                  }}
                />
              </Box>
              
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 500, 
                    color: 'text.secondary' 
                  }}
                >
                  Load Existing Session:
                </Typography>
                
                <FormControl 
                  fullWidth 
                  size="small" 
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5
                    }
                  }}
                >
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
            </Box>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                mb: 3, 
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveSession}
                disabled={!sessionName || !currentChapter}
                sx={{ 
                  px: 3,
                  fontWeight: 500
                }}
              >
                Save Session
              </Button>
              
              <Button
                variant="contained"
                color="success"
                startIcon={<ShareIcon />}
                onClick={handleExportSession}
                disabled={!currentSession}
                sx={{ 
                  px: 3,
                  fontWeight: 500
                }}
              >
                Export Session
              </Button>
              
              <Button
                variant="contained"
                color="info"
                startIcon={<UploadIcon />}
                onClick={() => setShowImportField(!showImportField)}
                sx={{ 
                  px: 3,
                  fontWeight: 500
                }}
              >
                Import Session
              </Button>
            </Paper>
            
            {showImportField && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderColor: showImportField ? 'info.main' : 'divider', 
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 1.5, 
                    fontWeight: 500, 
                    color: 'info.dark' 
                  }}
                >
                  Import Session from URL or Data:
                </Typography>
                
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Paste Session Data or URL"
                  multiline
                  rows={3}
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste the session URL or JSON data here"
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5
                    }
                  }}
                />
                
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleImportSession}
                  disabled={!importData}
                  sx={{ 
                    px: 4,
                    fontWeight: 500
                  }}
                >
                  Import
                </Button>
              </Paper>
            )}
          </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default QuranMemorizer;
