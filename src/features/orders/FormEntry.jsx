import React from 'react';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Stack
} from '@mui/material';

export default function FormEntry({ data, fields, onChange }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Stack spacing={2}>
      {fields.map(({ name, label, type, multiline, rows }) => {
        if (type === 'checkbox') {
          return (
            <FormControlLabel
              key={name}
              control={
                <Checkbox
                  checked={!!data[name]}
                  onChange={e => handleFieldChange(name, e.target.checked)}
                />
              }
              label={label}
            />
          );
        }
        return (
          <TextField
            key={name}
            label={label}
            type={type}
            fullWidth
            multiline={multiline}
            rows={rows}
            value={data[name] || ''}
            onChange={e => handleFieldChange(name, e.target.value)}
          />
        );
      })}
    </Stack>
  );
}
