import { Box, Container, Typography } from '@mui/material';

export default function MessageToJanasainiksPage() {
    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
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
                    Message to Janasainiks: Building a Stronger Movement Together
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
                        Dear Janasainiks, you are the backbone of our movement. Your dedication, sacrifice, and unwavering commitment to the cause of people's welfare form the foundation upon which we build our vision for a better society. This message is a recognition of your efforts and a call to strengthen our collective resolve in the face of challenges.
                    </Typography>

                    <Typography component="p">
                        The role you play goes far beyond traditional political activism. You are community organizers, problem solvers, and bridges between leadership and the people. Every day, you work tirelessly to understand the concerns of ordinary citizens, to mobilize support for positive change, and to ensure that the voice of the common person is heard in the corridors of power.
                    </Typography>

                    <Typography component="p">
                        In recent times, we have witnessed unprecedented challenges to grassroots democratic participation. The obstacles you face—whether they are logistical, political, or personal—are real and significant. Yet, your resilience in the face of these challenges is what gives our movement its strength and credibility. Your commitment inspires others to join the cause and reinforces the belief that positive change is possible.
                    </Typography>

                    <Typography component="p">
                        As we move forward, it is essential that we strengthen our organizational structures and support systems. This means creating better channels of communication between different levels of our movement, ensuring that resources reach those who need them most, and establishing mechanisms for feedback and continuous improvement. Your input in shaping these systems is not just welcome—it is essential.
                    </Typography>

                    <Typography component="p">
                        Training and capacity building must be a priority. We recognize that effective grassroots work requires a diverse set of skills—from community organizing and public speaking to conflict resolution and digital communication. We are committed to providing you with the training, tools, and resources necessary to excel in your role and to grow as leaders in your own right.
                    </Typography>

                    <Typography component="p">
                        The safety and security of every Janasainik is of paramount importance. No one should have to face threats, harassment, or violence for their political beliefs or activities. We are working to establish stronger support networks, legal assistance programs, and rapid response mechanisms to ensure that you can carry out your work without fear. Your safety is not negotiable, and we will stand firmly against any attempts to intimidate or harm our workers.
                    </Typography>

                    <Typography component="p">
                        Communication is the lifeblood of any successful movement. We need to ensure that information flows freely and accurately between all levels of our organization. This means not just top-down directives, but also bottom-up feedback. Your observations from the field, your understanding of local issues, and your insights into community dynamics are invaluable. We must create formal channels for this information to reach decision-makers and influence our strategies.
                    </Typography>

                    <Typography component="p">
                        Unity in diversity is our strength. Our movement brings together people from different backgrounds, regions, and walks of life. This diversity is not a weakness to be managed but a strength to be celebrated. It gives us a broader perspective, helps us understand different viewpoints, and makes our movement more representative of the society we seek to serve. Let us embrace this diversity and learn from each other.
                    </Typography>

                    <Typography component="p">
                        Transparency and accountability must guide all our actions. As representatives of a people's movement, we must hold ourselves to the highest standards of integrity and ethical conduct. This means being honest about our challenges, transparent about our resources, and accountable for our decisions. When we make mistakes—and we will—we must acknowledge them, learn from them, and do better.
                    </Typography>

                    <Typography component="p">
                        The digital age presents both opportunities and challenges for grassroots organizing. Social media and digital tools can amplify our message and help us reach more people, but they also come with risks of misinformation and digital harassment. We need to develop digital literacy among our workers, establish guidelines for online conduct, and create support systems for those who face online abuse.
                    </Typography>

                    <Typography component="p">
                        Remember that sustainable activism requires taking care of yourself. Burnout is real, and the emotional toll of political work can be significant. It is not selfish to prioritize your mental and physical health—it is necessary. Take breaks when you need them, seek support when you're struggling, and remember that this is a marathon, not a sprint. We need you to be in this for the long haul.
                    </Typography>

                    <Typography component="p">
                        Your families and loved ones also make sacrifices for this movement. The time you spend in meetings, rallies, and community work is time away from them. We acknowledge this sacrifice and are grateful for their support. We must also ensure that our movement creates space for family life and personal commitments, recognizing that balanced, fulfilled individuals make the most effective activists.
                    </Typography>

                    <Typography component="p">
                        As we look to the future, let us remember why we started this journey. It was not for personal gain or political power, but for the welfare of the people, for justice, and for a better society. These ideals must continue to guide us, even when the path is difficult and the obstacles seem insurmountable. Our commitment to these principles is what sets us apart and gives our movement its moral authority.
                    </Typography>

                    <Typography component="p">
                        The road ahead will not be easy. We will face opposition, setbacks, and moments of doubt. But together, united in our purpose and committed to our values, there is no challenge we cannot overcome. Your courage, dedication, and hard work are the driving force of this movement. You are not just workers or volunteers—you are leaders, changemakers, and the hope for a better tomorrow.
                    </Typography>

                    <Typography component="p">
                        To every Janasainik reading this: thank you. Thank you for your service, your sacrifice, and your unwavering belief in our shared vision. Together, we will build a movement that truly serves the people, that stands up for justice, and that creates lasting positive change in our society. The future we dream of is possible, and it will be built by people like you, one community at a time, one conversation at a time, one act of service at a time. Stay strong, stay united, and let us march forward together toward the future we deserve.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
