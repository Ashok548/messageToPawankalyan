'use client';

import { Box, Container, Typography, Divider } from '@mui/material';
import { motion } from 'framer-motion';

export default function WhyJoinJanaSenaPage() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa', pb: 8 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    color: 'white',
                    py: { xs: 6, md: 10 },
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="lg">
                    <motion.div {...fadeInUp}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: '2rem', md: '3.5rem' },
                                mb: 2,
                                background: 'linear-gradient(90deg, #fff 0%, #E31E24 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Why Join JanaSena
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 400,
                                fontSize: { xs: '1.1rem', md: '1.5rem' },
                                color: 'rgba(255, 255, 255, 0.9)',
                                maxWidth: '800px',
                                mx: 'auto',
                            }}
                        >
                            A Movement for People-First Politics
                        </Typography>
                    </motion.div>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ mt: 6 }}>
                {/* Introduction */}
                <motion.div {...fadeInUp}>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.125rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                            mb: 6,
                            textAlign: 'center',
                            fontStyle: 'italic',
                        }}
                    >
                        JanaSena is not just a political party—it is a commitment to the people,
                        a promise to serve with integrity, and a vision for a just and equitable society.
                    </Typography>
                </motion.div>

                {/* JanaSena Ideology */}
                <Section
                    title="Our Ideology"
                    content={[
                        "JanaSena stands firmly on the principles of democratic socialism, where the welfare of every citizen is paramount. We believe in a society where opportunities are not privileges of the few, but rights of the many.",
                        "Our ideology is rooted in the belief that governance must be transparent, accountable, and people-centric. We envision a political system where leaders are servants of the people, not masters.",
                        "We champion the cause of social justice, economic empowerment, and environmental sustainability. Every policy, every decision, every action is guided by one question: Does this serve the people?"
                    ]}
                />

                <Divider sx={{ my: 6 }} />

                {/* Values & Principles */}
                <Section
                    title="Our Core Values"
                    content={[
                        {
                            heading: "Transparency & Accountability",
                            text: "We believe in open governance where every decision is made in the light of public scrutiny. Leaders must be accountable to the people they serve."
                        },
                        {
                            heading: "Social Justice",
                            text: "Equality is not negotiable. We stand for the rights of marginalized communities, ensuring that every voice is heard and every person is treated with dignity."
                        },
                        {
                            heading: "Economic Empowerment",
                            text: "True freedom comes from economic independence. We work towards creating opportunities for employment, entrepreneurship, and sustainable livelihoods for all."
                        },
                        {
                            heading: "Environmental Responsibility",
                            text: "We recognize our duty to protect the environment for future generations. Sustainable development is not an option—it is a necessity."
                        }
                    ]}
                />

                <Divider sx={{ my: 6 }} />

                {/* About Pawan Kalyan Garu */}
                <Box sx={{ mb: 6 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 3,
                            color: '#E31E24',
                        }}
                    >
                        Leadership with Purpose: Pawan Kalyan Garu
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                            mb: 3,
                        }}
                    >
                        Pawan Kalyan garu's journey from the world of cinema to public service is a testament
                        to his unwavering commitment to the people. He chose to step away from the comfort of
                        stardom to address the real issues facing ordinary citizens.
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                            mb: 3,
                        }}
                    >
                        His leadership is defined not by rhetoric, but by action. He has consistently stood
                        with farmers, workers, and marginalized communities, fighting for their rights and dignity.
                        His vision is clear: a society where governance is transparent, leaders are accountable,
                        and every citizen has the opportunity to thrive.
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                            mb: 3,
                        }}
                    >
                        What sets him apart is his authenticity. He speaks the language of the people, understands
                        their struggles, and works tirelessly to bring about meaningful change. His dedication to
                        public service is not driven by personal ambition, but by a genuine desire to serve.
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                        }}
                    >
                        Under his leadership, JanaSena has become a platform for honest politics, where integrity
                        is valued over opportunism, and service is prioritized over self-interest. He embodies the
                        values that JanaSena stands for—courage, compassion, and commitment to the people.
                    </Typography>
                </Box>

                <Divider sx={{ my: 6 }} />

                {/* Relevance Today */}
                <Section
                    title="Why JanaSena Matters Today"
                    content={[
                        "In an era where politics is often reduced to power games and personal gains, JanaSena offers an alternative—a movement grounded in principles, driven by purpose, and focused on people.",
                        "We face challenges that require bold leadership and innovative solutions: economic inequality, environmental degradation, social injustice, and erosion of democratic values. JanaSena is committed to addressing these challenges head-on.",
                        "Our relevance lies in our refusal to compromise on our values. We will not engage in divisive politics. We will not make empty promises. We will work, every single day, to build a society that is just, equitable, and prosperous for all."
                    ]}
                />

                <Divider sx={{ my: 6 }} />

                {/* Vision for the Future */}
                <Section
                    title="Our Vision for the Future"
                    content={[
                        "We envision a future where governance is participatory, where citizens are not mere spectators but active participants in shaping their destiny.",
                        "We dream of a society where education is accessible to all, healthcare is a right, and employment opportunities are abundant. Where farmers are respected, workers are valued, and entrepreneurs are supported.",
                        "We aspire to build a state—and eventually a nation—where corruption is a thing of the past, where leaders are chosen for their integrity, and where policies are designed to uplift the marginalized.",
                        "This is not a distant dream. This is the future we are working towards, one step at a time, one policy at a time, one community at a time."
                    ]}
                />

                <Divider sx={{ my: 6 }} />

                {/* Closing Message */}
                <Box
                    sx={{
                        backgroundColor: '#f5f5f5',
                        borderLeft: '4px solid #E31E24',
                        p: 4,
                        borderRadius: 1,
                        mt: 6,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            mb: 2,
                            color: '#1a1a1a',
                        }}
                    >
                        A Call to Reflection
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                        }}
                    >
                        JanaSena is more than a political party. It is a movement of people who believe in
                        the power of honest politics, who refuse to accept the status quo, and who are willing
                        to work for a better tomorrow. We invite you to reflect on what kind of society you
                        want to live in, and what kind of politics you want to support. The choice is yours,
                        and the future is ours to build—together.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

// Section Component
function Section({ title, content }: { title: string; content: (string | { heading: string; text: string })[] }) {
    return (
        <Box sx={{ mb: 6 }}>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 700,
                    mb: 3,
                    color: '#E31E24',
                }}
            >
                {title}
            </Typography>
            {content.map((item, index) => (
                typeof item === 'string' ? (
                    <Typography
                        key={index}
                        variant="body1"
                        sx={{
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                            mb: 3,
                        }}
                    >
                        {item}
                    </Typography>
                ) : (
                    <Box key={index} sx={{ mb: 3 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                mb: 1,
                                color: '#1a1a1a',
                            }}
                        >
                            {item.heading}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: '1.0625rem',
                                lineHeight: 1.8,
                                color: 'text.secondary',
                            }}
                        >
                            {item.text}
                        </Typography>
                    </Box>
                )
            ))}
        </Box>
    );
}
