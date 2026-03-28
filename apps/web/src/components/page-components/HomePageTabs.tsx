'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
} from '@mui/material';
import { useTranslations } from 'next-intl';

/* ─────────────────────────────────────────────
   Progress Bar (Kept, but thinner and subtle)
───────────────────────────────────────────── */
function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                setProgress((window.scrollY / totalHeight) * 100);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Box
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: 2,
                width: `${progress}%`,
                bgcolor: '#999999', // Subtle gray
                transition: 'width 0.1s ease',
                zIndex: 1400,
            }}
        />
    );
}

/* ─────────────────────────────────────────────
   Editorial Section Header (Clean, no chips)
───────────────────────────────────────────── */
interface SectionHeaderProps {
    title: string;
    id?: string;
}
function SectionHeader({ title, id }: SectionHeaderProps) {
    return (
        <Box
            id={id}
            sx={{
                mt: { xs: 4, sm: 5 },
                mb: 2,
                pb: 1,
                borderBottom: '1px solid #eaeaea',
            }}
        >
            <Typography
                component="h2"
                sx={{
                    fontSize: { xs: 22, sm: 26 },
                    fontWeight: 700,
                    color: '#1a1a1a',
                    lineHeight: 1.35,
                }}
            >
                {title}
            </Typography>
        </Box>
    );
}

/* ─────────────────────────────────────────────
   Sub-section heading (h3)
───────────────────────────────────────────── */
function SubHeading({ children, id }: { children: React.ReactNode; id?: string }) {
    return (
        <Typography
            component="h3"
            id={id}
            sx={{
                fontSize: { xs: 19, sm: 21 },
                fontWeight: 700,
                color: '#2e2e2e',
                mt: 4,
                mb: 2,
            }}
        >
            {children}
        </Typography>
    );
}

/* ─────────────────────────────────────────────
   Editorial Pull-Quote (Minimalist left border)
───────────────────────────────────────────── */
interface PullQuoteProps {
    children: React.ReactNode;
    attribution?: string;
    center?: boolean;
}
function EditorialQuote({ children, attribution, center = false }: PullQuoteProps) {
    return (
        <Box
            component="blockquote"
            sx={{
                my: 3,
                py: center ? 2 : 1.5,
                px: center ? 0 : 3,
                mx: center ? 0 : { xs: 1, sm: 2 },
                textAlign: center ? 'center' : 'left',
                borderLeft: center ? 'none' : '3px solid #cccccc',
                bgcolor: center ? 'transparent' : '#fafafa',
            }}
        >
            <Typography
                sx={{
                    fontSize: { xs: 19, sm: 21 },
                    fontWeight: 600,
                    fontStyle: 'italic',
                    color: '#333',
                    lineHeight: 1.75,
                }}
            >
                "{children}"
            </Typography>
            {attribution && (
                <Typography
                    sx={{
                        mt: 1,
                        fontSize: 14,
                        color: '#666',
                        textAlign: center ? 'center' : 'left',
                        fontWeight: 500,
                    }}
                >
                    — {attribution}
                </Typography>
            )}
        </Box>
    );
}

/* ─────────────────────────────────────────────
   Body paragraph (Tighter sizing, NO BOLD)
───────────────────────────────────────────── */
function Para({ children }: { children: React.ReactNode }) {
    return (
        <Typography
            component="p"
            sx={{
                fontSize: { xs: 17, sm: 18 },
                lineHeight: 1.9,
                color: '#2e2e2e',
                mb: 2.5,
                fontFamily: "'Noto Sans Telugu', 'Mandali', Georgia, serif",
                fontWeight: 400,
            }}
        >
            {children}
        </Typography>
    );
}

/* ─────────────────────────────────────────────
   Clean Numbered List Items
───────────────────────────────────────────── */
function ListItemText({ title, description }: { title: string; description: string }) {
    return (
        <Box component="li" sx={{ mb: 1.5, pl: 1 }}>
            <Typography component="div" sx={{ fontSize: { xs: 17, sm: 18 }, lineHeight: 1.9, color: '#2e2e2e' }}>
                <Box component="strong" sx={{ color: '#1a1a1a', mr: 1, fontWeight: 700 }}>
                    {title}:
                </Box>
                {description}
            </Typography>
        </Box>
    );
}

/* ─────────────────────────────────────────────
   MAIN: RenderOriginal — Editorial Style
───────────────────────────────────────────── */
function RenderOriginal() {
    return (
        <Box
            component="article"
            sx={{
                '& *': { fontFamily: "'Noto Sans Telugu', 'Mandali', Georgia, serif" },
                maxWidth: { xs: '100%', md: 800, lg: 950 },
                mx: 'auto',
                px: { xs: 2, sm: 3, md: 4 }
            }}
        >
            <ReadingProgress />

            {/* ── Salutation ── */}
            <Box sx={{ mb: 4, mt: 1 }}>
                <Typography component="p" sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 20 }, color: '#1a1a1a' }}>
                    ప్రియమైన జననేత,
                </Typography>
                <Typography component="p" sx={{ fontWeight: 600, fontSize: { xs: 16, sm: 17 }, color: '#333333' }}>
                    జనసేన అధినేత శ్రీ పవన్ కళ్యాణ్ గారికి నమస్కారం 🙏
                </Typography>
            </Box>

            {/* § 1 */}
            <SectionHeader title="బలిదానాల తో స్వాతంత్రం - స్వదేశీ పాలకులతో దోపిడి గా రూపాంతరం." id="section-1" />
            <Para>
                200 సంవత్సరాలు బ్రిటిష్ వారిచే దోపిడికి గురైన నా భారతదేశానికి స్వాతంత్ర్యం వచ్చి 79 సంవత్సరాలు అయ్యింది అని మనం చెబుతున్నాం.
            </Para>

            <Para>
                గత 79 సంవత్సరాలుగా బ్రిటిష్ వారి దోపిడి మరియు నా దేశ ప్రజల హక్కుల హననం రూపాంతరం చెంది ఈ దేశ రాష్ట్ర నాయకుల దోపిడి, హక్కుల హననంగా మారిపోయాయి.
            </Para>
            <Para>
                ప్రజల పట్ల నిర్లక్ష్యం రోజురోజుకు రెట్టింపు అవుతూ చివరకు ఆ దోపిడి చేసే వాళ్లే చట్టసభల్లో కూర్చుని దోపిడిని న్యాయబద్ధం చేసే స్థాయికి దేశ రాష్ట్ర రాజకీయాలు దిగజారాయి.
            </Para>
            <Para>
                ఎంతలా పరిస్థితి మారిపోయింది అంటే — నా దేశంలో తల్లి తండ్రులు వారి పిల్లలను క్రమశిక్షణలో పెట్టడానికి రాజకీయాలను ఒక విషంలా చూపిస్తూ రాజకీయాలకు దూరంగా ఉండాలని నిర్దేశిస్తున్నారు.
            </Para>
            <Para>
                కాల క్రమేణ రాజకీయాలను ఒక వర్ణానికి లేదా రెండు మూడు వర్గాలకు మాత్రమే సొంతమైన వ్యవస్థగా మార్చేశారు.
            </Para>

            <EditorialQuote attribution="చే గువేరా">
                నా హక్కు తొక్కబడినప్పుడు, నా మనుగడనే ప్రశ్నార్థకం చేసినప్పుడు – నాకు యుద్ధమే శరణ్యం.
                స్వేచ్ఛ కోసం చేసే యుద్ధంలో నేను మరణించినా నేను విజేతనే.
            </EditorialQuote>

            {/* § 2 */}
            <SectionHeader title="ఉద్యమాలు — అణచివేతలో చిక్కుకున్న గొంతులు" id="section-2" />
            <Para>
                ఈ భావజాలాన్ని పుణికిపుచ్చుకున్న కమ్యూనిస్టు ఉద్యమాలను కూడా ఈ అవినీతి రాజకీయ నాయకులు మీడియా నియంత్రణ ద్వారా ప్రజల మనస్సులను వక్రీకరించి కమ్యునిజం సోషలిజాన్ని తాలూకు భావజాలాన్ని సమూలంగా నిర్వీర్యం చేశారు.
            </Para>
            <Para>
                ఇక పోతే ఉద్యమ బాటలో ప్రాణాలను లెక్కచేయకుండా, సుఖాలను పక్కన పెట్టి అడవి దారి పట్టిన నక్సలైట్లు, మావోయిస్టులను కూడా MLA, MP దోపిడీలకు అడ్డుగా ఉన్నారని ఎన్కౌంటర్లు పేరుతో చంపుతుంటే...
            </Para>
            <Para>
                ప్రతిపక్ష పాత్ర పోషించాల్సిన ప్రతిపక్ష పార్టీలు అధికార పక్ష దోపిడీలను నిశితంగా పరిశీలిస్తూ, దోపిడి ఎలా చేయాలో నైపుణ్యం పెంచుకుంటూ ఉంటే —
            </Para>
            <Para>
                వీళ్ల ముందు బ్రిటిష్ వాళ్లు దేవుళ్లలా కనిపించే పరిస్థితి వచ్చింది.
            </Para>

            {/* § 3 */}
            <SectionHeader title="చీకటిలో ఆశాకిరణం — జనసేన ఆవిర్భావం" id="section-3" />
            <Para>
                రాజ్యాంగానికి అసలైన శక్తి ప్రతిపక్ష పాత్రలోనే ఉంటుంది. అలాంటిది అప్పుడే అడ్డదిడ్డంగా రెండు ముక్కలు చేసిన ఆంధ్రప్రదేశ్ — మన తెలుగు తల్లి కన్నీటితో రోదిస్తున్న సమయంలో వినిపించిన ఒకే ఒక్క గొంతు:
            </Para>

            <EditorialQuote center>
                జనసేన — ఇది సామాన్యుడి సేన. ✊
            </EditorialQuote>

            <Para>
                ఈ తరం యువతను రాజకీయాల గురించి ఆలోచింపజేసిన పార్టీ — జనసేన.
            </Para>
            <Para>
                ఓటుకు నోటు ఒక హక్కులా మారిపోయిన సమయంలో అది చట్టవిరుద్ధం అని చెప్పి, గత దశాబ్దాలుగా మా ఓట్లను సంతలో గొర్రెల్లా కొంటున్నారని మాకు అర్థమయ్యేలా చేసిన నాయకుడు మీరు.
            </Para>

            <SubHeading>మధ్యతరగతి బాధలు అణిచివేత - జనసేన ధైర్యం & తిరుగుబాటు</SubHeading>
            <Para>
                ప్రజా సమస్యల మీద ప్రభుత్వ అధికారులకు అర్జీలు ఇవ్వవచ్చు అని, మన స్థానిక సమస్యలను మనమే స్థానిక ప్రభుత్వ అధికారుల వద్దకు వెళ్లి పరిష్కరించుకోవాలి అని మీరు చెప్పినప్పుడు మాకు ఒక కొత్త అవగాహన వచ్చింది.
            </Para>
            <Para>
                దశాబ్దాలుగా ప్రతి చిన్న ప్రభుత్వ కార్యాలయంలో పని కోసం స్థానిక నాయకుడి చుట్టూ తిరిగి బ్రతిమలాడి వారి గుమ్మాల ముందు నిలబడి, వారు వచ్చినప్పుడు మాత్రమే ప్రభుత్వ కార్యాలయాలకు వెళ్లాలి అనే పరిస్థితి ఉండేది.
            </Para>
            <Para>
                అలాంటి పరిస్థితిలో ఉన్న మా లాంటి మధ్యతరగతి కుటుంబాలకు మీరు ఇచ్చిన ధైర్యంతో మేము మొదటిసారి స్థానిక నాయకుడు లేకుండానే — స్థానిక సమస్య, అది స్థానిక నాయకుడే కారణమైన సమస్య అయినా సరే — నేరుగా స్థానిక ప్రభుత్వ అధికారికి అర్జీ ఇవ్వగలిగాము.
            </Para>

            <EditorialQuote>
                అది నిజంగా ప్రజాస్వామ్యాన్ని బలపరిచే ఒక పెద్ద మార్పు.
                దశాబ్దాలుగా బానిసత్వ గోడలను బద్దలు కొట్టిన సంఘటన.
            </EditorialQuote>

            <Para>
                మీరు పార్టీ స్థాపించి రాజ్యాంగ భావజాలాన్ని పార్టీ ద్వారా మాకు పంచినప్పుడే — మీరు ఒక వ్యక్తిగా, ఒక శక్తిగా గెలిచారు.
            </Para>

            {/* § 4 */}
            <SectionHeader title="కళ్యాణ్ గారికి ఒక జనసైనికుడి విన్నపం" id="section-4" />
            <SubHeading id="sub-4-1">ఫీడ్‌బ్యాక్ విధానం</SubHeading>
            <Para>
                అధిష్టాన నాయకత్వానికి గ్రౌండ్ స్థాయి కార్యకర్తల ఫీడ్‌బ్యాక్ లేకపోతే నిజమైన పరిస్థితి అధిష్టానానికి కనిపించదు.
            </Para>
            <Para>
                జనసైనికులు దశాబ్దాలుగా ఎన్నో పెద్ద సమస్యలపై పోరాటాలు చేశారు. అవి సాధారణ సమస్యలు కాదు — నాయకత్వం దృష్టికి తప్పనిసరిగా చేరాల్సిన సమస్యలు.
            </Para>
            <Para>
                కానీ ఇప్పుడు ఆ సమస్యలు మీ వరకు తీసుకువచ్చే స్పష్టమైన మార్గం లేకపోవడం నిజంగా జనసైనికుల దురదృష్టం.
            </Para>

            <SubHeading id="sub-4-2">ప్రతిజ్ఞలు మరియు వాస్తవం</SubHeading>
            <Para>
                మధ్యతరగతి కుటుంబాల్లో పుట్టిన మా లాంటి యువకులకు అప్పులు, బాధలు మరియు అణిచివేతలు ఎక్కువ.
                అయినా కూడా ఆ బాధ్యతల మధ్య సమయం కేటాయించి మేము గొంతెత్తి ప్రజా సమస్యలపై పోరాటాలు చేశాము.
            </Para>
            <Para>
                అప్పుడు మేము ప్రజల మధ్య చెప్పిన మాట ఒకటే — "మేము అధికారంలోకి వస్తే ఈ సమస్యలకు పరిష్కార మార్గాన్ని చూపుతాము అని"
            </Para>
            <Para>
                కానీ ఇప్పుడు ఒక బాధాకరమైన వాస్తవం కనిపిస్తోంది. మనం అధికారంలోకి వచ్చిన వెంటనే మా గొంతు మూగబోయినట్టుగా అనిపిస్తోంది.
            </Para>

            {/* § 5 */}
            <SectionHeader title="పార్టీ నిర్మాణ రీఫార్మ్" id="section-5" />
            <SubHeading id="sub-5-1">అధికారం మరియు శక్తి విభజన</SubHeading>
            <Para>
                పొత్తు ద్వారా అధికారంలోకి వచ్చిన మనం, మన పార్టీ ప్రాథమిక హక్కు అయిన పవర్ షేరింగ్ లో కూడా ఆశించిన స్థాయిలో ఫలితం కనిపించలేదు.
            </Para>
            <Para>
                మమ్మల్ని చూసి ఓటు వేసిన ప్రజలు ఇప్పుడు మా పరిస్థితి చూసి ప్రశ్నిస్తున్నారు.
            </Para>
            <Para>
                రాష్ట్ర స్థాయిలో జనసేనకు దక్కిన నామినేటెడ్ పదవుల్లో చాలా మంది నియోజకవర్గ స్థాయిలో పనిచేసిన నాయకులు కాకుండా, ప్రజలకు దూరంగా AC గదుల్లో పని చేస్తూ జీతాలు తీసుకుంటున్న నాయకులకు దక్కినట్లు కనిపిస్తోంది.
            </Para>

            <SubHeading id="sub-5-2">నాయకత్వం ఎంపిక</SubHeading>
            <Para>
                రాకరాక వచ్చిన ఈ అవకాశంలో ఉద్యమాల ద్వారా ఎదిగిన అర్హులైన జనసేన నాయకులు ఎంతో మంది ఉన్నా — వారు మీ దృష్టిలో లేకపోవడం పార్టీ పారదర్శకతపై సందేహాలు కలిగిస్తోంది.
            </Para>

            <EditorialQuote>
                సామెత: "చీమలు పెట్టిన పుట్టలు పాములకు ఇళ్లు అయినట్టు."
            </EditorialQuote>

            <Para>
                సామాన్యులు తమ పాకెట్ మనీ పెట్టుబడిగా పెట్టి నిర్మించిన పార్టీ అధికారంలోకి వచ్చిన తర్వాత, ఆ సామాన్యులు కాకుండా పెద్దవారు ముందుకు వచ్చి పదవులు పొందడం బాధాకరం.
            </Para>
            <Para>
                ఇంకా ఒక బాధాకరమైన విషయం ఏమిటంటే — రాష్ట్రంలో జనసేన నాయకులపై దాడులు జరిగినా, గాయపడినా వారిని పట్టించుకునే పరిస్థితి కనిపించడం లేదు.
            </Para>

            {/* § 6 */}
            <SectionHeader title="పార్టీ బలోపేతానికి కీలక సూచనలు" id="section-6" />
            <Para>
                పార్టీ సంస్థాగత నిర్మాణాన్ని బలపరచడానికి ఈ క్రింది మార్పులు తక్షణమే అవసరం:
            </Para>
            <Box component="ul" sx={{ pl: { xs: 2.5, sm: 3 }, m: 0, mt: 2 }}>
                <ListItemText title="కమిటీల రద్దు" description="రాష్ట్ర వ్యాప్తంగా ఉన్న కమిటీలను రద్దు చేయాలి." />
                <ListItemText title="ఇన్‌చార్జ్ నియామకం" description="ప్రతి నియోజకవర్గానికి ఒక ఇన్‌చార్జ్‌ను నియమించాలి." />
                <ListItemText title="జోనల్ హెడ్ వ్యవస్థ" description="నియోజకవర్గాల నుండి వచ్చే సమస్యలను సమీక్షించే విధంగా జోనల్ హెడ్ వ్యవస్థ ఏర్పాటు చేయాలి." />
                <ListItemText title="డైరెక్ట్ రిపోర్టింగ్" description="జోనల్ హెడ్‌లు సేకరించిన నివేదికలు నేరుగా మీకు చేరే విధంగా వ్యవస్థ ఉండాలి." />
                <ListItemText title="మిత్రపక్ష సమన్వయం" description="TDP రాష్ట్ర కార్యాలయం నుండి వారి ఎమ్మెల్యేలకు అధికారికంగా జనసేన నియోజకవర్గ ఇన్‌చార్జ్‌లతో కలిసి పనిచేయాలని సూచించే లేఖ ఇవ్వాలి." />
            </Box>

            {/* § 7 */}
            <SectionHeader title="విప్లవం మరియు మార్పు" id="section-7" />
            <Para>
                కాలంతో పాటు మార్పు అవసరం.
            </Para>

            <EditorialQuote attribution="డాక్టర్ బి.ఆర్. అంబేడ్‌కర్">
                The devil always lies in the intention.
            </EditorialQuote>

            <Para>
                మీరు నడిచే దారి మాకు రహదారి. మీ నినాదం ఏదైనా మాకు ఆనందమే.
            </Para>

            <EditorialQuote center>
                ఆంధ్రప్రదేశ్‌కు పవన్ కళ్యాణ్ లాంటి డబ్బు, పదవి వ్యామోహం లేని నాయకుడు ఇప్పటివరకు రాలేదు — భవిష్యత్తులో కూడా రావడం కష్టం.
            </EditorialQuote>

            <Para>
                అలాంటి నాయకత్వం మరింత బలంగా ఉండాలని ఒక సాధారణ జనసైనికుడిగా కోరుకుంటున్నాను.
            </Para>

            <Para>
                ఈ లేఖ అసహనం కాదు.

            </Para>
            <Para>
                ఈ లేఖ తిరుగుబాటు కాదు.
            </Para>
            <Para>
                ఈ లేఖ నేల గొంతు.
            </Para>
            <Para>
                ఈ లేఖ నమ్మకం మిగిలి ఉన్నందుకే రాసిన విన్నపం.
            </Para>
  <Para>విప్లవం వర్దెల్లాలి</Para>
            

            <Typography
                component="p"
                sx={{
                    mt: 6,
                    fontWeight: 700,
                    textAlign: 'right',
                    whiteSpace: 'pre-line',
                    fontSize: { xs: 18, sm: 20 },
                    color: '#1a1a1a',
                }}
            >
                జై హింద్{'\n'}జై జనసేన ✊
            </Typography>
        </Box>
    );
}


/* ─────────────────────────────────────────────
   HomePageTabs — export
───────────────────────────────────────────── */
export function HomePageTabs() {
    return (
        <Box sx={{ mb: 4 }}>
            <RenderOriginal />
        </Box>
    );
}
