import React from 'react';
import { Box, Typography, Paper, IconButton, Stack } from '@mui/material';
import { Verse } from '../types';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

interface MultiVerseItemProps {
  verse: Verse;
  isCurrentVerse: boolean;
  isMarked: boolean;
  onMarkVerse: () => void;
  language: string;
}

const MultiVerseItem: React.FC<MultiVerseItemProps> = ({
  verse,
  isCurrentVerse,
  isMarked,
  onMarkVerse,
  language
}) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        bgcolor: isCurrentVerse ? '#e3f2fd' : isMarked ? '#ffe6e6' : '#f8f9fa',
        borderLeft: isCurrentVerse ? '4px solid #3498db' : isMarked ? '4px solid #e74c3c' : 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        {/* Verse Number */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 'bold',
            color: '#3498db',
            minWidth: '30px',
          }}
        >
          {verse.id}
        </Typography>
        
        {/* Mark Button */}
        <IconButton
          onClick={onMarkVerse}
          size="small"
          sx={{
            ml: 'auto',
            color: isMarked ? '#e74c3c' : 'inherit'
          }}
        >
          {isMarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>
      </Box>

      {/* Arabic Text */}
      {/* Arabic Text */}
      <Typography
        variant="body1"
        sx={{
          width: '100%',
          textAlign: 'right',
          direction: 'rtl',
          fontWeight: 'medium',
          mb: 1
        }}
      >
        {verse.text}
      </Typography>

      {/* Transliteration */}
      {verse.transliteration && (
        <Typography
          variant="body2"
          sx={{
            width: '100%',
            fontStyle: 'italic',
            color: '#7f8c8d',
            mb: 1
          }}
        >
          {verse.transliteration}
        </Typography>
      )}
      
      {/* Translation */}
      {language !== 'ar' && verse.translations && (
        <Typography
          variant="body2"
          sx={{
            width: '100%',
            color: '#34495e',
          }}
        >
          {verse.translations[language] || verse.translations.en || 'Translation not available'}
        </Typography>
      )}
    </Paper>
  );
};

interface MultiVerseViewProps {
  verses: Verse[];
  currentVerse: number;
  markedVerses: {
    [verse: number]: string;
  };
  onMarkVerse: (verse: number) => void;
  language: string;
}

const MultiVerseView: React.FC<MultiVerseViewProps> = ({
  verses,
  currentVerse,
  markedVerses,
  onMarkVerse,
  language
}) => {
  // Scroll to current verse when it changes
  const currentVerseRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (currentVerseRef.current) {
      currentVerseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentVerse]);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Verses
      </Typography>

      <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
        {verses.map((verse) => (
          <div
            key={verse.id}
            ref={verse.id === currentVerse ? currentVerseRef : null}
          >
            <MultiVerseItem
              verse={verse}
              isCurrentVerse={verse.id === currentVerse}
              isMarked={!!markedVerses[verse.id]}
              onMarkVerse={() => onMarkVerse(verse.id)}
              language={language}
            />
          </div>
        ))}
      </Box>
    </Box>
  );
};

export default MultiVerseView;
