import React from 'react';
import { Badge } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

export default function EmailStatusBadge({ hasEmail, ...props }) {
  return (
    <Badge
      color={hasEmail ? 'success' : 'error'}
      variant="dot"
      {...props}
    >
      <EmailIcon color={hasEmail ? 'success' : 'error'} />
    </Badge>
  );
}
