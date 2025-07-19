import React from 'react';
import { Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function ReminderBadge({ hasReminder, ...props }) {
  return (
    <Badge
      color={hasReminder ? 'warning' : 'default'}
      variant={hasReminder ? 'dot' : undefined}
      {...props}
    >
      <NotificationsIcon color={hasReminder ? 'warning' : 'disabled'} />
    </Badge>
  );
}
