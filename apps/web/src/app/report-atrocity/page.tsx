'use client';

import { Box, Container, Typography, TextField, MenuItem, Button, Alert, Card, CardMedia, IconButton, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';
import { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CREATE_ATROCITY = gql`
    mutation CreateAtrocity($input: CreateAtrocityInput!) {
        createAtrocity(input: $input) {
            id
            leaderName
            state
            district
        }
    }
`;

// Sample data - replace with actual data from API
const STATES = ['Andhra Pradesh'];
const DISTRICTS = [
    "Alluri Sitharama Raju",
    "Anakapalli",
    "Anantapur",
    "Annamayya",
    "Bapatla",
    "Chittoor",
    "Dr. B. R. Ambedkar Konaseema",
    "East Godavari",
    "Eluru",
    "Guntur",
    "Kakinada",
    "Krishna",
    "Kurnool",
    "Nandyal",
    "NTR",
    "Palnadu",
    "Parvathipuram Manyam",
    "Prakasam",
    "Sri Potti Sriramulu Nellore",
    "Sri Sathya Sai",
    "Srikakulam",
    "Tirupati",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari",
    "YSR Kadapa"
];

const CONSTITUENCIES = [
    "Achanta",
    "Addanki",
    "Adoni",
    "Alamuru",
    "Allagadda",
    "Alur",
    "Amadalavalasa",
    "Amalapuram",
    "Anakapalli",
    "Anantapur Urban",
    "Anantapur Rural",
    "Anaparthy",
    "Araku Valley",
    "Atmakur",
    "Avanigadda",
    "Bapatla",
    "Bhimavaram",
    "Bhimili",
    "Bobbili",
    "Chandragiri",
    "Cheepurupalli",
    "Chilakaluripet",
    "Chintalapudi",
    "Chirala",
    "Chittoor",
    "Chodavaram",
    "Darsi",
    "Denduluru",
    "Dharmavaram",
    "Dhone",
    "Elamanchili",
    "Eluru",
    "Etcherla",
    "Gajapathinagaram",
    "Gannavaram",
    "Giddalur",
    "Gopalapuram",
    "Gudivada",
    "Gudur",
    "Guntakal",
    "Guntur East",
    "Guntur West",
    "Gurazala",
    "Hindupur",
    "Ichchapuram",
    "Jaggampeta",
    "Jaggayyapeta",
    "Jammalamadugu",
    "Kadapa",
    "Kadiri",
    "Kaikalur",
    "Kakinada City",
    "Kakinada Rural",
    "Kandukur",
    "Kanigiri",
    "Kavali",
    "Kodumur",
    "Kodur",
    "Kondapi",
    "Kothapeta",
    "Kovur",
    "Kovvur",
    "Kuppam",
    "Kurnool",
    "Kurupam",
    "Macherla",
    "Machilipatnam",
    "Madanapalle",
    "Mandapeta",
    "Markapuram",
    "Mangalagiri",
    "Medakonduru",
    "Mummidivaram",
    "Mydukur",
    "Nagari",
    "Nandyal",
    "Narasannapeta",
    "Narasapuram",
    "Narasaraopet",
    "Nellimarla",
    "Nellore City",
    "Nellore Rural",
    "Nidadavole",
    "Nuzvid",
    "Ongole",
    "Paderu",
    "Palakonda",
    "Palasa",
    "Palnadu",
    "Pamarru",
    "Parvathipuram",
    "Pathapatnam",
    "Payakaraopet",
    "Pedakurapadu",
    "Pedana",
    "Penamaluru",
    "Penukonda",
    "Pithapuram",
    "Polavaram",
    "Ponnur",
    "Prathipadu",
    "Proddatur",
    "Pulivendula",
    "Punganur",
    "Puthalapattu",
    "Pydibhimavaram",
    "Rajahmundry City",
    "Rajahmundry Rural",
    "Rajampet",
    "Rajanagaram",
    "Ramachandrapuram",
    "Ramagundam",
    "Rampachodavaram",
    "Rayachoti",
    "Rayadurg",
    "Razole",
    "Repalle",
    "Salur",
    "Santhanuthalapadu",
    "Sarvepalli",
    "Sattenapalli",
    "Singarayakonda",
    "Srikakulam",
    "Srisailam",
    "Srungavarapukota",
    "Sullurpeta",
    "Tadepalli",
    "Tadepalligudem",
    "Tadikonda",
    "Tanuku",
    "Tenali",
    "Thamballapalle",
    "Tirupati",
    "Tuni",
    "Udayagiri",
    "Unguturu",
    "Uravakonda",
    "Vemuru",
    "Venkatagiri",
    "Vijayawada Central",
    "Vijayawada East",
    "Vijayawada West",
    "Vinukonda",
    "Visakhapatnam East",
    "Visakhapatnam North",
    "Visakhapatnam South",
    "Visakhapatnam West",
    "Vizianagaram",
    "Yemmiganur",
    "Yerragondapalem",
    "Yuvathapalli"
];


interface ImageFile {
    file: File;
    preview: string;
    base64: string;
}

export default function ReportAtrocityPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        atrocityType: 'TO_JSP_LEADER',
        leaderName: '',
        atrocityBy: '',
        atrocityByOther: '',
        state: '',
        district: '',
        constituency: '',
        mandal: '',
        village: '',
        position: '',
        subject: '',
        description: '',
    });

    const [images, setImages] = useState<ImageFile[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [mutationError, setMutationError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [createAtrocity, { loading }] = useMutation(CREATE_ATROCITY);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };
            // If atrocity type changes to TO_JANASENA_PARTY, set leaderName to "Janasena Party"
            if (field === 'atrocityType' && value === 'TO_JANASENA_PARTY') {
                updated.leaderName = 'Janasena Party';
            } else if (field === 'atrocityType' && value === 'TO_JSP_LEADER') {
                // Clear leader name when switching back to TO_JSP_LEADER
                updated.leaderName = '';
            }
            // Clear atrocityByOther when atrocityBy changes to non-Others
            if (field === 'atrocityBy' && value !== 'Others') {
                updated.atrocityByOther = '';
            }
            return updated;
        });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
        // Clear mutation error when user makes changes
        if (mutationError) {
            setMutationError(null);
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        // Clear previous errors
        setErrors((prev) => ({ ...prev, images: '' }));

        // Check if adding these files would exceed the limit
        if (images.length + files.length > 2) {
            setErrors((prev) => ({ ...prev, images: 'Maximum 2 images allowed' }));
            return;
        }

        const newImages: ImageFile[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors((prev) => ({ ...prev, images: 'Only image files are allowed' }));
                continue;
            }

            // Validate file size (500KB = 512000 bytes)
            if (file.size > 512000) {
                setErrors((prev) => ({
                    ...prev,
                    images: `Image "${file.name}" exceeds 500KB limit (${(file.size / 1024).toFixed(2)}KB)`,
                }));
                continue;
            }

            try {
                const base64 = await convertToBase64(file);
                newImages.push({
                    file,
                    preview: URL.createObjectURL(file),
                    base64,
                });
            } catch (error) {
                console.error('Error converting file to base64:', error);
            }
        }

        setImages((prev) => [...prev, ...newImages]);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages((prev) => {
            const newImages = [...prev];
            // Revoke object URL to prevent memory leaks
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
        // Clear error if exists
        if (errors.images) {
            setErrors((prev) => ({ ...prev, images: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        // Leader name: max 100 characters
        if (!formData.leaderName.trim()) {
            newErrors.leaderName = 'Leader name is required';
        } else if (formData.leaderName.length > 100) {
            newErrors.leaderName = 'Leader name must be 100 characters or less';
        }

        // Atrocity By: required
        if (!formData.atrocityBy) {
            newErrors.atrocityBy = 'Please select who committed the atrocity';
        }

        // Atrocity By Other: required if Others is selected
        if (formData.atrocityBy === 'Others' && !formData.atrocityByOther.trim()) {
            newErrors.atrocityByOther = 'Please specify the party/group';
        }

        // Location fields
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.district) newErrors.district = 'District is required';
        if (!formData.constituency) newErrors.constituency = 'Constituency is required';
        if (!formData.mandal) newErrors.mandal = 'Mandal is required';
        // Village is optional - no validation required


        // Position: max 100 characters (only required if not TO_JANASENA_PARTY)
        if (formData.atrocityType !== 'TO_JANASENA_PARTY') {
            if (!formData.position.trim()) {
                newErrors.position = 'Position is required';
            } else if (formData.position.length > 100) {
                newErrors.position = 'Position must be 100 characters or less';
            }
        }

        // Subject: optional, max 200 characters
        if (formData.subject && formData.subject.length > 200) {
            newErrors.subject = 'Subject must be 200 characters or less';
        }

        // Description: max 2000 characters
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length > 2000) {
            newErrors.description = 'Description must be 2000 characters or less';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMutationError(null); // Clear previous error
        if (!validate()) return;

        try {
            const result = await createAtrocity({
                variables: {
                    input: {
                        atrocityType: formData.atrocityType,
                        leaderName: formData.leaderName,
                        atrocityBy: formData.atrocityBy === 'Others' ? formData.atrocityByOther : formData.atrocityBy,
                        state: formData.state,
                        district: formData.district,
                        constituency: formData.constituency,
                        mandal: formData.mandal,
                        village: formData.village,
                        position: formData.atrocityType === 'TO_JANASENA_PARTY' ? undefined : formData.position,
                        subject: formData.subject || undefined,
                        description: formData.description,
                        images: images.map((img) => img.base64),
                    },
                },
            });

            // Check for errors in response
            if (result.errors && result.errors.length > 0) {
                const errorMessages = result.errors.map((err) => err.message).join(', ');
                setMutationError(errorMessages);
                return;
            }

            // Check if mutation returned data successfully
            if (result.data) {
                // Clean up object URLs
                images.forEach((img) => URL.revokeObjectURL(img.preview));

                // Navigate back to atrocities list
                router.push('/atrocities-to-janasainiks');
            }
        } catch (err: unknown) {
            console.error('Error creating atrocity:', err);
            // Extract and display the error message
            if (err instanceof Error) {
                setMutationError(err.message);
            } else {
                setMutationError('Failed to submit report. Please try again.');
            }
        }
    };

    return (
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#fafafa', position: 'relative' }}>
            {/* Back Button - Absolutely positioned outside container */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.back()}
                sx={{
                    position: { xs: 'static', md: 'absolute' },
                    left: { md: 32 },
                    ml: { xs: 2, md: 0 },
                    mt: { xs: 2, md: 2 },
                    mb: { xs: 2, md: 0 },
                }}
            >
                Back
            </Button>

            <Container maxWidth={false} sx={{ mt: { xs: 0, md: 4 }, pb: 4, px: { xs: 2, sm: 3 }, maxWidth: '900px', mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
                        Report Atrocity
                    </Typography>
                    <Typography color="text.secondary">
                        Document incidents of violence, harassment, and injustice
                    </Typography>
                </Box>

                {/* Form Container with Shadow */}
                <Box
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        p: { xs: 3, sm: 4 },
                    }}
                >
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {mutationError && (
                            <Alert severity="error" onClose={() => setMutationError(null)}>
                                {mutationError}
                            </Alert>
                        )}

                        {/* Atrocity Type - Centered */}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <FormControl component="fieldset" size="small">
                                <FormLabel component="legend" sx={{ textAlign: 'center' }}>Atrocity Type</FormLabel>
                                <RadioGroup
                                    row
                                    value={formData.atrocityType}
                                    onChange={(e) => handleChange('atrocityType', e.target.value)}
                                    sx={{ justifyContent: 'center' }}
                                >
                                    <FormControlLabel
                                        value="TO_JSP_LEADER"
                                        control={<Radio />}
                                        label="To JSP Leader"
                                    />
                                    <FormControlLabel
                                        value="TO_JANASENA_PARTY"
                                        control={<Radio />}
                                        label="To Janasena Party"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Box>

                        {/* Leader Name */}
                        <TextField
                            size="small"
                            label=" Name"
                            value={formData.leaderName}
                            onChange={(e) => handleChange('leaderName', e.target.value)}
                            error={!!errors.leaderName}
                            helperText={errors.leaderName || `${formData.leaderName.length}/100`}
                            fullWidth
                            required
                            disabled={formData.atrocityType === 'TO_JANASENA_PARTY'}
                            InputLabelProps={{ sx: { fontSize: '0.7rem' } }}
                        />

                        {/* Atrocity By */}
                        <TextField
                            size="small"
                            select
                            label="Atrocity By"
                            value={formData.atrocityBy}
                            onChange={(e) => handleChange('atrocityBy', e.target.value)}
                            error={!!errors.atrocityBy}
                            helperText={errors.atrocityBy}
                            fullWidth
                            required
                            InputLabelProps={{ sx: { fontSize: '0.7rem' } }}
                        >
                            <MenuItem value="TDP">TDP</MenuItem>
                            <MenuItem value="JSP">JSP</MenuItem>
                            <MenuItem value="BJP">BJP</MenuItem>
                            <MenuItem value="YSRCP">YSRCP</MenuItem>
                            <MenuItem value="Others">Others</MenuItem>
                        </TextField>

                        {/* Atrocity By Other (conditional) */}
                        {formData.atrocityBy === 'Others' && (
                            <TextField
                                size="small"
                                label="Specify Party/Group"
                                value={formData.atrocityByOther}
                                onChange={(e) => handleChange('atrocityByOther', e.target.value)}
                                error={!!errors.atrocityByOther}
                                helperText={errors.atrocityByOther}
                                fullWidth
                                required
                                InputLabelProps={{ sx: { fontSize: '0.7rem' } }}
                            />
                        )}

                        {/* Location Dropdowns */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField
                                size="small"
                                select
                                label="State"
                                value={formData.state}
                                onChange={(e) => handleChange('state', e.target.value)}
                                error={!!errors.state}
                                helperText={errors.state}
                                required
                                InputLabelProps={{ sx: { fontSize: '0.7rem' } }}
                            >
                                {STATES.map((state) => (
                                    <MenuItem key={state} value={state}>
                                        {state}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                size="small"
                                select
                                label="District"
                                value={formData.district}
                                onChange={(e) => handleChange('district', e.target.value)}
                                error={!!errors.district}
                                helperText={errors.district}
                                required
                                InputLabelProps={{ sx: { fontSize: '0.7rem' } }}
                            >
                                {DISTRICTS.map((district) => (
                                    <MenuItem key={district} value={district}>
                                        {district}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                size="small"
                                select
                                label="Constituency"
                                value={formData.constituency}
                                onChange={(e) => handleChange('constituency', e.target.value)}
                                error={!!errors.constituency}
                                helperText={errors.constituency}
                                required
                                InputLabelProps={{ sx: { fontSize: '0.7rem' } }}
                            >
                                {CONSTITUENCIES.map((constituency) => (
                                    <MenuItem key={constituency} value={constituency}>
                                        {constituency}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                size="small"
                                label="Mandal"
                                value={formData.mandal}
                                onChange={(e) => handleChange('mandal', e.target.value)}
                                error={!!errors.mandal}
                                helperText={errors.mandal}
                                required
                                InputLabelProps={{ sx: { fontSize: '0.7rem' } }}
                            />
                        </Box>

                        <TextField
                            size="small"
                            label="Village (Optional)"
                            value={formData.village}
                            onChange={(e) => handleChange('village', e.target.value)}
                            error={!!errors.village}
                            helperText={errors.village}
                            fullWidth
                            InputLabelProps={{ sx: { fontSize: '0.7rem' } }}
                        />

                        {/* Position - Hidden when TO_JANASENA_PARTY */}
                        {formData.atrocityType !== 'TO_JANASENA_PARTY' && (
                            <TextField
                                size="small"
                                label="Position in Party"
                                value={formData.position}
                                onChange={(e) => handleChange('position', e.target.value)}
                                error={!!errors.position}
                                helperText={errors.position || `${formData.position.length}/100`}
                                fullWidth
                                required
                                InputLabelProps={{ sx: { fontSize: '0.7rem' } }}
                            />
                        )}

                        {/* Subject */}
                        <TextField
                            size="small"
                            label="Subject (Optional)"
                            value={formData.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                            error={!!errors.subject}
                            helperText={errors.subject || `${formData.subject.length}/200`}
                            fullWidth
                            inputProps={{ maxLength: 200 }}
                            InputLabelProps={{ sx: { fontSize: '0.7rem' } }}
                        />

                        {/* Description */}
                        <TextField
                            size="small"
                            label="Description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            error={!!errors.description}
                            helperText={errors.description || `${formData.description.length}/2000`}
                            multiline
                            rows={4}
                            fullWidth
                            required
                            InputLabelProps={{ sx: { fontSize: '0.7rem' } }}
                        />

                        {/* Image Upload */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Attach Images (Max 2, each max 500KB)
                            </Typography>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />

                            <Button
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={images.length >= 2}
                                fullWidth
                            >
                                {images.length >= 2 ? 'Maximum images reached' : 'Choose Images'}
                            </Button>

                            {errors.images && (
                                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                    {errors.images}
                                </Typography>
                            )}

                            {/* Image Previews */}
                            {images.length > 0 && (
                                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    {images.map((image, index) => (
                                        <Card key={index} sx={{ position: 'relative', width: 150, height: 150 }}>
                                            <CardMedia
                                                component="img"
                                                image={image.preview}
                                                alt={`Preview ${index + 1}`}
                                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <IconButton
                                                onClick={() => handleRemoveImage(index)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                                    color: 'white',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                                                    },
                                                }}
                                                size="small"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 4,
                                                    left: 4,
                                                    right: 4,
                                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                                    color: 'white',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    fontSize: '0.7rem',
                                                }}
                                            >
                                                {(image.file.size / 1024).toFixed(2)} KB
                                            </Typography>
                                        </Card>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        {/* Submit Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => router.back()}
                                disabled={loading}
                                fullWidth
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                fullWidth
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
