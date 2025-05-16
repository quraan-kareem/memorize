import React from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
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
      elevation={isCurrentVerse ? 2 : 1}
      sx={{
        p: 2.5,
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        bgcolor: isCurrentVerse ? '#e3f2fd' : isMarked ? '#fff5f5' : '#f8f9fa',
        borderLeft: isCurrentVerse ? '4px solid #3498db' : isMarked ? '4px solid #e74c3c' : 'none',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        transform: isCurrentVerse ? 'translateY(-2px)' : 'none',
        boxShadow: isCurrentVerse 
          ? '0 4px 12px rgba(52, 152, 219, 0.15)' 
          : isMarked 
            ? '0 3px 10px rgba(231, 76, 60, 0.1)' 
            : '0 2px 5px rgba(0,0,0,0.03)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isCurrentVerse && (
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '3px',
            backgroundColor: '#3498db',
            animation: 'pulse-horizontal 2s infinite ease-in-out',
            '@keyframes pulse-horizontal': {
              '0%': { opacity: 0.6 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.6 }
            }
          }}
        />
      )}
    
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {/* Verse Number */}
        <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: isCurrentVerse ? '#3498db' : 'rgba(52, 152, 219, 0.1)',
            mr: 1.5
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: isCurrentVerse ? 'white' : '#3498db',
            }}
          >
            {verse.id}
          </Typography>
        </Box>
        
        {/* Mark Button */}
        <IconButton
          onClick={onMarkVerse}
          size="small"
          sx={{
            ml: 'auto',
            color: isMarked ? '#e74c3c' : 'inherit',
            '&:hover': {
              backgroundColor: isMarked ? 'rgba(231, 76, 60, 0.08)' : 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          {isMarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>
      </Box>

      {/* Arabic Text */}
      <Typography
        variant="body1"
        sx={{
          width: '100%',
          textAlign: 'right',
          direction: 'rtl',
          fontWeight: 'medium',
          mb: 1.5,
          fontFamily: '"Traditional Arabic", "Scheherazade", serif',
          lineHeight: 1.7,
          fontSize: '1.2rem',
          color: '#15384f',
          borderBottom: '1px solid',
          borderColor: 'rgba(0,0,0,0.06)',
          pb: 1.5
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
            mb: 1.5,
            lineHeight: 1.5,
            fontSize: '0.9rem',
            letterSpacing: '0.01em'
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
            lineHeight: 1.5,
            fontSize: '0.9rem',
            background: 'linear-gradient(to right, rgba(247, 249, 252, 0.8), transparent)',
            p: 1,
            borderRadius: 1
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
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (currentVerseRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = currentVerseRef.current;
      
      // Calculate the scroll position to center the element
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.offsetHeight;
      
      const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);
      
      container.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
      });
    }
  }, [currentVerse]);

  return (
    <Box sx={{ mt: 3 }}>
      {/* Section Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          justifyContent: 'space-between'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 500,
            color: 'success.dark',
            display: 'flex',
            alignItems: 'center',
            '&::before': {
              content: '""',
              width: 16,
              height: 16,
              marginRight: 1,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z\' fill=\'%232e7d32\'/%3E%3C/svg%3E")',
              backgroundSize: 'contain'
            }
          }}
        >
          All Verses in Range
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            display: 'inline-flex',
            alignItems: 'center',
            bgcolor: 'background.paper',
            px: 1.5,
            py: 0.5,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            fontSize: '0.75rem',
            fontWeight: 500
          }}
        >
          {verses.length} verse{verses.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Verses Container */}
      <Box 
        ref={scrollContainerRef}
        sx={{ 
          maxHeight: '500px', 
          overflowY: 'auto', 
          pr: 1,
          borderRadius: 2,
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
          '&::-webkit-scrollbar': {
            width: '8px',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a8a8a8'
          }
        }}
      >
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
      
      {/* Helpful Instruction */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          bgcolor: 'rgba(46, 125, 50, 0.05)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'success.dark',
            fontSize: '0.85rem',
            fontStyle: 'italic',
            textAlign: 'center'
          }}
        >
          Click the bookmark icon on any verse to add your feedback
        </Typography>
      </Box>
    </Box>
  );
};

export default MultiVerseView;
