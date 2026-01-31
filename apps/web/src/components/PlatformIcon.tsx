'use client';

import { SocialPlatform, getPlatformColor } from '@/utils/socialMediaValidation';
import { Box } from '@mui/material';
import TwitterIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

interface PlatformIconProps {
    platform: SocialPlatform;
    size?: number;
    colored?: boolean;
}

const iconComponents = {
    TWITTER: TwitterIcon,
    FACEBOOK: FacebookIcon,
    INSTAGRAM: InstagramIcon,
    YOUTUBE: YouTubeIcon,
};

export default function PlatformIcon({ platform, size = 24, colored = true }: PlatformIconProps) {
    const IconComponent = iconComponents[platform];
    const color = colored ? getPlatformColor(platform) : 'inherit';

    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
            }}
        >
            <IconComponent sx={{ fontSize: size, color }} />
        </Box>
    );
}
