import React from 'react';
import { Box, Typography, Paper, Chip, Stack, Zoom } from '@mui/material';
import { Verse } from '../types';
import { useApp } from '../contexts/AppContext';

interface VerseDisplayProps {
  verse: Verse | null;
  language: string;
  isMarked?: boolean;
  markingComment?: string;
  position?: 'start' | 'end';
}

const VerseDisplay: React.FC<VerseDisplayProps> = ({
  verse,
  language,
  isMarked = false,
  markingComment = '',
  position = 'start'
}) => {
  const { isPlaying, currentVerse } = useApp();
  
  if (!verse) return null;
  
  // Check if this verse is currently playing
  const isCurrentlyPlaying = isPlaying && verse.id === currentVerse;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Verse Text */}
      <Paper 
        elevation={isCurrentlyPlaying ? 4 : 2} 
        sx={{ 
          p: 3, 
          mb: 2, 
          bgcolor: isCurrentlyPlaying ? '#f0f7fb' : '#f8f9fa',
          borderLeft: isMarked ? '4px solid #e74c3c' : (isCurrentlyPlaying ? '4px solid #3498db' : 'none'),
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {isCurrentlyPlaying && (
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: '#3498db',
              color: 'white',
              padding: '4px 12px',
              borderBottomLeftRadius: 8,
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }}
          >
            NOW PLAYING
          </Box>
        )}
        
        {/* Arabic Text */}
        <Typography 
          variant="h5" 
          sx={{ 
            textAlign: 'right', 
            direction: 'rtl', 
            fontWeight: 'bold',
            color: isCurrentlyPlaying ? '#1a5d8d' : '#2c3e50',
            mb: 2
          }}
        >
          {verse.text}
        </Typography>

        {/* Transliteration */}
        {verse.transliteration && (
          <Typography 
            variant="body1" 
            sx={{ 
              fontStyle: 'italic',
              color: '#7f8c8d',
              mb: 2
            }}
          >
            {verse.transliteration}
          </Typography>
        )}

        {/* Translation */}
        {language !== 'ar' && (
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#34495e'
            }}
          >
            {verse.translations && verse.translations[language] ? 
              verse.translations[language] : 
              verse.translations && verse.translations.en ? 
              verse.translations.en : 
              'Translation not available'}
          </Typography>
        )}

        {/* Marking Comment (if marked) */}
        {isMarked && markingComment && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: '#ffe6e6', 
              borderRadius: 1,
              borderLeft: '4px solid #e74c3c'
            }}
          >
            <Typography variant="body2">{markingComment}</Typography>
          </Box>
        )}
      </Paper>

      {/* Verse Metadata */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          bgcolor: '#f8f9fa'
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
          <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
            <Typography variant="body2" fontWeight="bold">Verse:</Typography>
            <Typography variant="body2">{verse.id}</Typography>
          </Box>
          
          {verse.meta && (
            <>
              <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
                <Typography variant="body2" fontWeight="bold">Juz:</Typography>
                <Typography variant="body2">{verse.meta.juz || 'N/A'}</Typography>
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
                <Typography variant="body2" fontWeight="bold">Page:</Typography>
                <Typography variant="body2">{verse.meta.page || 'N/A'}</Typography>
              </Box>
              
              {verse.meta.sajda && (
                <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
                  <Typography variant="body2" fontWeight="bold">Sajda:</Typography>
                  <Chip 
                    label="Yes" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#e74c3c', 
                      color: 'white',
                      fontSize: '0.7rem',
                      height: '20px'
                    }} 
                  />
                </Box>
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default VerseDisplay;
