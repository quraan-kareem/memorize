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
    <Box sx={{ mb: 3, position: 'relative' }}>
      {/* Verse Text */}
      <Paper 
        elevation={isCurrentlyPlaying ? 4 : 2} 
        sx={{ 
          p: { xs: 2.5, sm: 3 }, 
          mb: 2, 
          bgcolor: isCurrentlyPlaying ? '#f0f7fb' : '#f8f9fa',
          borderLeft: isMarked ? '4px solid #e74c3c' : (isCurrentlyPlaying ? '4px solid #3498db' : 'none'),
          borderRadius: '8px',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isCurrentlyPlaying 
            ? '0 6px 12px rgba(52, 152, 219, 0.15)' 
            : isMarked 
              ? '0 6px 12px rgba(231, 76, 60, 0.1)' 
              : '0 4px 8px rgba(0,0,0,0.05)'
        }}
      >
        {isCurrentlyPlaying && (
          <Zoom in={isCurrentlyPlaying}>
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
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&::before': {
                  content: '""',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  display: 'inline-block',
                  animation: 'pulse 1.5s infinite ease-in-out',
                },
                '@keyframes pulse': {
                  '0%': { opacity: 0.6 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.6 }
                }
              }}
            >
              NOW PLAYING
            </Box>
          </Zoom>
        )}
        
        {/* Arabic Text */}
        <Typography 
          variant="h5" 
          sx={{ 
            textAlign: 'right', 
            direction: 'rtl', 
            fontWeight: 'bold',
            color: isCurrentlyPlaying ? '#1a5d8d' : '#2c3e50',
            mb: 2.5,
            lineHeight: 1.7,
            fontFamily: '"Traditional Arabic", "Scheherazade", serif',
            fontSize: { xs: '1.5rem', sm: '1.8rem' }
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
              mb: 2.5,
              lineHeight: 1.6,
              fontSize: '1.05rem',
              borderTop: '1px solid',
              borderColor: 'rgba(0,0,0,0.06)',
              pt: 1.5
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
              color: '#34495e',
              lineHeight: 1.6,
              fontSize: '1rem',
              borderTop: verse.transliteration ? 'none' : '1px solid',
              borderColor: 'rgba(0,0,0,0.06)',
              pt: verse.transliteration ? 0 : 1.5
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
              mt: 3, 
              p: 2, 
              bgcolor: '#ffe6e6', 
              borderRadius: 1,
              borderLeft: '4px solid #e74c3c',
              boxShadow: 'inset 0 2px 4px rgba(231, 76, 60, 0.1)'
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#c0392b',
                fontStyle: 'italic',
                position: 'relative',
                pl: 0.5
              }}
            >
              {markingComment}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Verse Metadata */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2.5,
          bgcolor: '#f9fafb',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={{ xs: 2, sm: 3 }} 
          flexWrap="wrap"
          divider={
            <Box 
              component="span" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                borderRight: '1px solid',
                borderColor: 'divider',
                my: 1
              }}
            />
          }
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flex: 1
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary', 
                fontSize: '0.75rem', 
                mb: 0.5 
              }}
            >
              Verse Number
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                color: 'primary.dark' 
              }}
            >
              {verse.id}
            </Typography>
          </Box>
          
          {verse.meta && (
            <>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flex: 1
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary', 
                    fontSize: '0.75rem', 
                    mb: 0.5 
                  }}
                >
                  Juz
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary' 
                  }}
                >
                  {verse.meta.juz || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flex: 1
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary', 
                    fontSize: '0.75rem', 
                    mb: 0.5 
                  }}
                >
                  Page
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary' 
                  }}
                >
                  {verse.meta.page || 'N/A'}
                </Typography>
              </Box>
              
              {verse.meta.sajda && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flex: 1
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary', 
                      fontSize: '0.75rem', 
                      mb: 0.5 
                    }}
                  >
                    Sajda
                  </Typography>
                  <Chip 
                    label="Yes" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#e74c3c', 
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.7rem',
                      height: '22px',
                      px: 0.5
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
