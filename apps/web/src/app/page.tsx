import { Box, Container, Typography } from '@mui/material';

export default function HomePage() {
    return (
        <Box
            component="main"
            sx={{
                minHeight: 'calc(100vh - 48px)',
                backgroundColor: '#fafafa',
                py: { xs: 4, sm: 6 },
            }}
        >
            <Container
                maxWidth={false}
                sx={{
                    maxWidth: 680,
                    px: { xs: 3, sm: 4 },
                }}
            >
                {/* Article Title */}
                <Typography
                    component="h1"
                    sx={{
                        fontSize: { xs: 28, sm: 36, md: 42 },
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: '#1a1a1a',
                        mb: 2,
                        letterSpacing: '-0.02em',
                    }}
                >
                    The Future of Democratic Engagement: A Message to Pawan Kalyan
                </Typography>

                {/* Article Metadata */}
                <Typography
                    sx={{
                        fontSize: 14,
                        color: 'text.secondary',
                        mb: 5,
                    }}
                >
                    Published on January 24, 2026
                </Typography>

                {/* Article Body */}
                <Box
                    sx={{
                        '& p': {
                            fontSize: { xs: 17, sm: 18 },
                            lineHeight: 1.7,
                            color: '#2e2e2e',
                            mb: 3,
                            fontFamily: 'Georgia, serif',
                        },
                    }}
                >
                    <Typography component="p">
                        In the evolving landscape of Indian politics, the role of grassroots movements and direct citizen engagement has never been more critical. As we stand at the crossroads of traditional governance and modern democratic participation, it becomes imperative to examine how leaders can effectively bridge the gap between policy and people.
                    </Typography>

                    <Typography component="p">
                        The concept of political accountability has undergone a significant transformation in recent years. No longer are citizens content with passive participation limited to casting votes every five years. Instead, there is a growing demand for continuous dialogue, transparent decision-making, and responsive governance that adapts to the real-time needs of the population.
                    </Typography>

                    <Typography component="p">
                        This shift in expectations has been particularly evident in the way political movements organize themselves. The traditional top-down approach, where directives flow from leadership to followers, is gradually giving way to more collaborative models. These new frameworks emphasize horizontal communication, where ideas and feedback flow freely between all levels of the organization.
                    </Typography>

                    <Typography component="p">
                        Technology has played a pivotal role in enabling this transformation. Social media platforms, mobile applications, and digital communication tools have democratized access to information and created new channels for civic participation. Citizens can now voice their concerns, share their experiences, and contribute to policy discussions in ways that were unimaginable just a decade ago.
                    </Typography>

                    <Typography component="p">
                        However, with these opportunities come significant challenges. The digital divide remains a stark reality in many parts of the country, where access to technology and internet connectivity is limited. Ensuring that democratic participation remains inclusive and accessible to all segments of society, regardless of their technological literacy or economic status, is a challenge that must be addressed head-on.
                    </Typography>

                    <Typography component="p">
                        The role of political workers, often referred to as Janasainiks in certain movements, cannot be understated in this context. These dedicated individuals serve as the crucial link between leadership and the broader population. They are the ones who translate political vision into ground-level action, who listen to the concerns of ordinary citizens, and who mobilize communities around shared goals and aspirations.
                    </Typography>

                    <Typography component="p">
                        Yet, the challenges faced by these grassroots workers are often overlooked in mainstream political discourse. From facing harassment and intimidation to dealing with resource constraints and organizational inefficiencies, the obstacles they encounter can be formidable. Creating support systems and protective mechanisms for these frontline workers is not just a matter of organizational efficiency—it is a moral imperative.
                    </Typography>

                    <Typography component="p">
                        The question of political violence and atrocities against party workers is particularly troubling. In a healthy democracy, political competition should be robust but civil, passionate but peaceful. When political workers face physical threats, legal harassment, or systematic intimidation, it undermines the very foundations of democratic participation and creates a chilling effect that discourages civic engagement.
                    </Typography>

                    <Typography component="p">
                        Addressing these issues requires a multi-faceted approach. Legal frameworks must be strengthened to protect political workers from harassment and violence. Law enforcement agencies must be trained to handle political disputes with impartiality and professionalism. And political leaders themselves must set the tone by condemning violence and intimidation, regardless of which party or ideology is responsible.
                    </Typography>

                    <Typography component="p">
                        Beyond protection, there is also a need for empowerment. Political workers should have access to training programs that enhance their skills in community organizing, conflict resolution, and effective communication. They should be equipped with the tools and resources necessary to carry out their work efficiently and safely. And they should be given a meaningful voice in shaping the strategies and policies of the movements they serve.
                    </Typography>

                    <Typography component="p">
                        The relationship between political leadership and grassroots workers is fundamentally one of mutual dependence. Leaders depend on workers to implement their vision and connect with voters. Workers depend on leaders to provide direction, resources, and support. When this relationship is healthy and balanced, it creates a powerful force for positive change. When it becomes dysfunctional or exploitative, it leads to disillusionment and organizational decay.
                    </Typography>

                    <Typography component="p">
                        Transparency and accountability must flow in both directions. Just as citizens have the right to hold their elected representatives accountable, political workers should be able to hold their leadership accountable for promises made and resources committed. Creating formal mechanisms for feedback, grievance redressal, and participatory decision-making can help ensure that this accountability is real and meaningful.
                    </Typography>

                    <Typography component="p">
                        The future of democratic politics in India will be shaped by how well we address these fundamental questions of participation, protection, and empowerment. It will depend on our ability to create political movements that are not just effective at winning elections, but also at fostering genuine civic engagement and social transformation.
                    </Typography>

                    <Typography component="p">
                        As we look ahead, the path forward requires courage, creativity, and commitment. It requires leaders who are willing to listen as much as they speak, who value the contributions of every worker and supporter, and who understand that true political power comes not from domination but from service. It requires workers who are informed, engaged, and empowered to be agents of change in their communities.
                    </Typography>

                    <Typography component="p">
                        The message to political leaders is clear: invest in your people, protect your workers, and create systems that enable genuine democratic participation. The message to political workers is equally important: stay committed to your values, demand the support and protection you deserve, and never lose sight of the larger purpose that brought you into public service. Together, through mutual respect and shared commitment, we can build a political culture that truly serves the people and strengthens our democracy for generations to come.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
