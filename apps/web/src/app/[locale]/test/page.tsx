import { useLocale } from 'next-intl';

export default function TestPage() {
    const locale = useLocale();
    return <div>Current Locale: {locale}</div>;
}
