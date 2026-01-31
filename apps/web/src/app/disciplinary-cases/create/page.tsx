'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    TextField,
    MenuItem,
    Button,
    Stack,
    Alert,
    CircularProgress,
    Autocomplete
} from '@mui/material';
import { CloudUpload, Save, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { CREATE_DISCIPLINARY_CASE } from '@/graphql/disciplinary-cases';
import { IssueCategory, IssueSource } from '@/components/ui/case-status-badge';
import { gql } from '@apollo/client';

// Query to fetch approved leaders for selection
const GET_LEADERS_FOR_SELECT = gql`
  query GetLeadersForSelect {
    leaders {
      id
      name
      district
      partyPosition
    }
  }
`;

export default function CreateDisciplinaryCasePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        leaderId: '',
        leaderName: '', // Fallback or autofilled
        position: '',
        constituency: '',
        issueCategory: '',
        issueDescription: '',
        issueSource: '',
    });

    // Separate state for file inputs
    const [evidenceFiles, setEvidenceFiles] = useState<FileList | null>(null);
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { data: leadersData, loading: leadersLoading } = useQuery(GET_LEADERS_FOR_SELECT);
    const [createCase, { loading: creating }] = useMutation(CREATE_DISCIPLINARY_CASE);

    const handleLeaderChange = (_: any, newValue: any) => {
        if (newValue) {
            setFormData({
                ...formData,
                leaderId: newValue.id,
                leaderName: newValue.name,
                position: newValue.partyPosition || 'Leader',
                constituency: newValue.district || '',
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const convertFilesToBase64 = (files: FileList): Promise<string[]> => {
        return Promise.all(
            Array.from(files).map(file => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            }))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.leaderId) {
            setError('Please select a leader');
            return;
        }

        try {
            // Convert images to base64 for upload
            let imageUrls: string[] = [];
            if (imageFiles) {
                imageUrls = await convertFilesToBase64(imageFiles);
            }

            let evidenceUrls: string[] = [];
            if (evidenceFiles) {
                evidenceUrls = await convertFilesToBase64(evidenceFiles);
            }

            // Note: Evidence docs handling would typically go to a separate storage service
            // For this implementation plan, we'll focus on the images integration

            await createCase({
                variables: {
                    input: {
                        leaderId: formData.leaderId,
                        leaderName: formData.leaderName,
                        position: formData.position,
                        constituency: formData.constituency,
                        issueCategory: formData.issueCategory,
                        issueDescription: formData.issueDescription,
                        issueSource: formData.issueSource,
                        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
                        evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined
                    }
                }
            });

            router.push('/disciplinary-cases');
        } catch (err: any) {
            setError(err.message || 'Failed to create case');
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => router.push('/disciplinary-cases')}
                sx={{ mb: 2 }}
            >
                Cancel
            </Button>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                    Initiate Disciplinary Case
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Create a new official record for a disciplinary issue. This will be visible only to administrators initially.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Subject Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Subject Details</Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Autocomplete
                                options={leadersData?.leaders || []}
                                getOptionLabel={(option: any) => `${option.name} (${option.district})`}
                                loading={leadersLoading}
                                onChange={handleLeaderChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Leader"
                                        required
                                        helperText="Search by name"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Position"
                                name="position"
                                value={formData.position}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Constituency / District"
                                name="constituency"
                                value={formData.constituency}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        {/* Issue Details */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Case Information</Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Issue Category"
                                name="issueCategory"
                                value={formData.issueCategory}
                                onChange={handleInputChange}
                                required
                            >
                                {Object.keys(IssueCategory).map((cat) => (
                                    <MenuItem key={cat} value={cat}>{cat.replace(/_/g, ' ')}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Issue Source"
                                name="issueSource"
                                value={formData.issueSource}
                                onChange={handleInputChange}
                                required
                            >
                                {Object.keys(IssueSource).map((src) => (
                                    <MenuItem key={src} value={src}>{src.replace(/_/g, ' ')}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={6}
                                label="Detailed Description"
                                name="issueDescription"
                                value={formData.issueDescription}
                                onChange={handleInputChange}
                                required
                                helperText="Provide a neutral, factual description of the incident or issue."
                            />
                        </Grid>

                        {/* Evidence Upload */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Evidence</Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                fullWidth
                                sx={{ height: 56 }}
                            >
                                Upload Photos
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setImageFiles(e.target.files)}
                                />
                            </Button>
                            {imageFiles && (
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                    {imageFiles.length} photo(s) selected
                                </Typography>
                            )}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                fullWidth
                                sx={{ height: 56 }}
                                fullWidth
                                sx={{ height: 56 }}
                            >
                                Upload Documents (PDF/Doc)
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={(e) => setEvidenceFiles(e.target.files)}
                                />
                            </Button>
                            {evidenceFiles && (
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                    {evidenceFiles.length} file(s) selected
                                </Typography>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                                <Button variant="outlined" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={creating ? <CircularProgress size={20} /> : <Save />}
                                    disabled={creating}
                                    sx={{ minWidth: 150 }}
                                >
                                    {creating ? 'Creating...' : 'Create Case'}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}
