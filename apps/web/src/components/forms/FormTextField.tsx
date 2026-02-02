'use client';

import { TextField, TextFieldProps } from '@mui/material';

type FormTextFieldProps = Omit<TextFieldProps, 'size' | 'InputLabelProps'> & {
    maxLength?: number;
    showCharCount?: boolean;
};

export function FormTextField({
    maxLength,
    showCharCount = true,
    helperText,
    value,
    ...props
}: FormTextFieldProps) {
    const charCount =
        maxLength && showCharCount && typeof value === 'string'
            ? `${value.length}/${maxLength}`
            : undefined;

    const displayHelperText = helperText || charCount;

    return (
        <TextField
            size="small"
            value={value}
            helperText={displayHelperText}
            InputLabelProps={{ sx: { fontSize: '0.7rem' } }}
            inputProps={maxLength ? { maxLength } : undefined}
            {...props}
        />
    );
}
