// Social Media Platform Validation Utilities

export type SocialPlatform = 'TWITTER' | 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE';

interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validates a Twitter/X URL
 * Supports both twitter.com and x.com domains
 */
export function validateTwitterUrl(url: string): boolean {
    const patterns = [
        /^https:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,15}\/?$/,
    ];
    return patterns.some(pattern => pattern.test(url));
}

/**
 * Validates a Facebook URL
 * Supports both facebook.com and fb.com domains
 */
export function validateFacebookUrl(url: string): boolean {
    const patterns = [
        /^https:\/\/(www\.)?(facebook\.com|fb\.com)\/[a-zA-Z0-9.]{5,}\/?$/,
    ];
    return patterns.some(pattern => pattern.test(url));
}

/**
 * Validates an Instagram URL
 */
export function validateInstagramUrl(url: string): boolean {
    const pattern = /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}\/?$/;
    return pattern.test(url);
}

/**
 * Validates a YouTube URL
 * Supports @handle, /c/channel, and /channel/ID formats
 */
export function validateYouTubeUrl(url: string): boolean {
    const patterns = [
        /^https:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9_-]{3,30}\/?$/,
        /^https:\/\/(www\.)?youtube\.com\/c\/[a-zA-Z0-9_-]{3,100}\/?$/,
        /^https:\/\/(www\.)?youtube\.com\/channel\/[a-zA-Z0-9_-]{24}\/?$/,
    ];
    return patterns.some(pattern => pattern.test(url));
}

/**
 * Validates a URL for a specific platform
 */
export function validatePlatformUrl(platform: SocialPlatform, url: string): ValidationResult {
    if (!url) {
        return { valid: false, error: 'URL is required' };
    }

    if (!url.startsWith('https://')) {
        return { valid: false, error: 'URL must start with https://' };
    }

    let isValid = false;
    let platformName = '';

    switch (platform) {
        case 'TWITTER':
            isValid = validateTwitterUrl(url);
            platformName = 'Twitter';
            break;
        case 'FACEBOOK':
            isValid = validateFacebookUrl(url);
            platformName = 'Facebook';
            break;
        case 'INSTAGRAM':
            isValid = validateInstagramUrl(url);
            platformName = 'Instagram';
            break;
        case 'YOUTUBE':
            isValid = validateYouTubeUrl(url);
            platformName = 'YouTube';
            break;
        default:
            return { valid: false, error: 'Invalid platform' };
    }

    if (!isValid) {
        return {
            valid: false,
            error: `Please enter a valid ${platformName} URL`,
        };
    }

    return { valid: true };
}

/**
 * Extracts username/handle from a social media URL
 */
export function extractUsername(platform: SocialPlatform, url: string): string {
    try {
        let match: RegExpMatchArray | null = null;

        switch (platform) {
            case 'TWITTER':
                match = url.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/);
                break;
            case 'FACEBOOK':
                match = url.match(/(?:facebook\.com|fb\.com)\/([^\/\?]+)/);
                break;
            case 'INSTAGRAM':
                match = url.match(/instagram\.com\/([^\/\?]+)/);
                break;
            case 'YOUTUBE':
                match = url.match(/youtube\.com\/(@[^\/\?]+|c\/[^\/\?]+|channel\/[^\/\?]+)/);
                break;
        }

        return match ? match[1] : url;
    } catch {
        return url;
    }
}

/**
 * Gets the display name for a platform
 */
export function getPlatformName(platform: SocialPlatform): string {
    const names: Record<SocialPlatform, string> = {
        TWITTER: 'Twitter',
        FACEBOOK: 'Facebook',
        INSTAGRAM: 'Instagram',
        YOUTUBE: 'YouTube',
    };
    return names[platform];
}

/**
 * Gets the color for a platform
 */
export function getPlatformColor(platform: SocialPlatform): string {
    const colors: Record<SocialPlatform, string> = {
        TWITTER: '#1DA1F2',
        FACEBOOK: '#1877F2',
        INSTAGRAM: '#E4405F',
        YOUTUBE: '#FF0000',
    };
    return colors[platform];
}

/**
 * Gets placeholder text for a platform URL input
 */
export function getPlatformPlaceholder(platform: SocialPlatform): string {
    const placeholders: Record<SocialPlatform, string> = {
        TWITTER: 'https://twitter.com/username or https://x.com/username',
        FACEBOOK: 'https://facebook.com/username',
        INSTAGRAM: 'https://instagram.com/username',
        YOUTUBE: 'https://youtube.com/@channel',
    };
    return placeholders[platform];
}
