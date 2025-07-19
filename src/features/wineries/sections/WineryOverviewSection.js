import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Link,
  Tooltip
} from '@mui/material';

export default function WineryOverviewSection({ winery, setEditMode }) {
  const handleOpenEdit = () => setEditMode('info');

  if (!winery) {
    return <Typography variant="h6">Δεν βρέθηκαν στοιχεία οινοποιείου.</Typography>;
  }

  return (
    <Card
      onClick={handleOpenEdit}
      sx={{
        mb: 3,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: 'white !important',
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardContent sx={{ backgroundColor: 'white', p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h5"
          component="div"
          gutterBottom
          sx={{ color: '#a52a2a', fontWeight: 'bold', wordBreak: 'break-word' }}
        >
          {winery.name || 'Μη διαθέσιμο όνομα'}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Αριστερά */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ fontSize: 22, mr: 1 }}>📍</Typography>
              <Typography variant="body1" color="text.secondary">
                {winery.location || 'Άγνωστη Πόλη'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ fontSize: 22, mr: 1 }}>🗺️</Typography>
              <Typography variant="body1" color="text.secondary">
                {winery.county || 'Άγνωστος Νομός'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ fontSize: 22, mr: 1 }}>🌍</Typography>
              <Typography variant="body1" color="text.secondary">
                {winery.geographicArea || 'Άγνωστη Περιοχή'}
              </Typography>
            </Box>
          </Grid>

          {/* Δεξιά */}
          <Grid item xs={12} md={6}>
            {(winery.contactInfo?.email?.length > 0
              ? winery.contactInfo.email.slice(0, 2)
              : [null]
            ).map((email, idx) =>
              email ? (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Typography sx={{ fontSize: 22, mr: 1 }}>📧</Typography>
                  <Tooltip title={email}>
                    <Link
                      href={`mailto:${email}`}
                      underline="hover"
                      color="text.secondary"
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                    >
                      {email}
                    </Link>
                  </Tooltip>
                </Box>
              ) : null
            )}

            {(winery.contactInfo?.phone?.length > 0
              ? winery.contactInfo.phone.slice(0, 2)
              : [null]
            ).map((phone, idx) =>
              phone ? (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Typography sx={{ fontSize: 22, mr: 1 }}>📞</Typography>
                  <Tooltip title={phone}>
                    <Link
                      href={`tel:${phone}`}
                      underline="hover"
                      color="text.secondary"
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                    >
                      {phone}
                    </Link>
                  </Tooltip>
                </Box>
              ) : null
            )}

            {winery.contactInfo?.website && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={{ fontSize: 22, mr: 1 }}>🌐</Typography>
                <Tooltip title={winery.contactInfo.website}>
                  <Link
                    href={
                      winery.contactInfo.website.startsWith('http')
                        ? winery.contactInfo.website
                        : `https://${winery.contactInfo.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    color="primary"
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                  >
                    {winery.contactInfo.website}
                  </Link>
                </Tooltip>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
