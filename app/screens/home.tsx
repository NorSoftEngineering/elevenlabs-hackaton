import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router';

export const meta = () => [
	{
		title: 'TalentBud - Transform Your Interview Process',
	},
	{
		charset: 'utf-8',
	},
	{
		name: 'viewport',
		content: 'width=device-width, initial-scale=1.0',
	},
	{
		name: 'description',
		content: 'AI-powered interview platform for comprehensive job insights and candidate assessment',
	},
];

const Home = () => (
	<>
		<Helmet>
			<script type="application/ld+json">
				{JSON.stringify({
					'@context': 'https://schema.org',
					'@type': 'SoftwareApplication',
					name: 'TalentBud',
					applicationCategory: 'Technical Interview Platform',
					offers: {
						'@type': 'Offer',
						price: '0',
						priceCurrency: 'USD',
					},
				})}
			</script>
		</Helmet>

		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex-shrink-0">
							<Link to="/" className="text-2xl font-bold text-brand-primary">
								TalentBud
							</Link>
						</div>
						<div className="hidden md:flex items-center space-x-8">
							<Link to="/features" className="text-gray-700 hover:text-brand-primary">
								Features
							</Link>
							<Link to="/pricing" className="text-gray-700 hover:text-brand-primary">
								Pricing
							</Link>
							<Link to="/about" className="text-gray-700 hover:text-brand-primary">
								About
							</Link>
							<Link
								to="/login"
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90"
							>
								Sign In
							</Link>
						</div>
					</div>
				</div>
			</nav>

			{/* Main Content Container */}
			<main className="relative">
				{/* Hero Section */}
				<section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
					{/* Background gradient */}
					<div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-white to-brand-secondary/5" />

					<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
							{/* Left column - Text content */}
							<div className="max-w-lg sm:max-w-xl lg:max-w-none">
								<motion.h1
									className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5 }}
								>
									Transform Your <span className="text-brand-primary">Interview Process</span>
								</motion.h1>
								<motion.p
									className="mt-6 text-xl text-gray-600"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.2 }}
								>
									Engage in AI-driven conversations for comprehensive job insights and candidate assessment
								</motion.p>
								<motion.div
									className="mt-10 flex items-center gap-x-6"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.4 }}
								>
									<Link
										to="/signup"
										className="rounded-md bg-brand-primary px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
									>
										Start Free Trial (Orgs)
									</Link>
									<Link
										to="/login"
										className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-brand-primary ring-1 ring-brand-primary/20 hover:bg-gray-50"
									>
										Candidate Login
									</Link>
								</motion.div>
							</div>

							{/* Right column - Animated dashboard preview */}
							<div className="relative lg:mt-0">
								<motion.div
									className="relative"
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.7, delay: 0.3 }}
								>
									{/* AI Chat interface preview */}
									<div className="overflow-hidden rounded-xl bg-gray-900 shadow-2xl ring-1 ring-gray-400/10">
										<div className="flex items-center gap-x-4 border-b border-gray-500/30 bg-gray-800/50 px-4 py-2.5">
											<div className="flex gap-x-2">
												<div className="h-3 w-3 rounded-full bg-red-500" />
												<div className="h-3 w-3 rounded-full bg-yellow-500" />
												<div className="h-3 w-3 rounded-full bg-green-500" />
											</div>
											<div className="flex-1 text-sm font-medium text-gray-300">AI Interview Session</div>
										</div>
										<div className="p-4">
											<pre className="text-sm text-green-400">
												<code>{`AI: Tell me about a challenging project you've worked on.

Candidate: I led the migration of our monolithic 
application to a microservices architecture...

AI: That's interesting. What specific challenges 
did you face during this migration?

// Interview Progress: 65%
// Topics Covered: 7/10
// Engagement Score: High`}</code>
											</pre>
										</div>
									</div>

									{/* Heatmap overlay */}
									<motion.div
										className="absolute -right-4 -bottom-4 w-2/3"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.5, delay: 1 }}
									>
										<div className="overflow-hidden rounded-xl bg-white/90 backdrop-blur shadow-xl ring-1 ring-gray-400/10 p-4">
											<div className="text-sm font-medium text-gray-900 mb-2">Performance Heatmap</div>
											<div className="grid grid-cols-7 gap-1">
												{Array.from({ length: 35 }).map((_, i) => (
													<div
														key={i}
														className={`h-4 rounded ${
															Math.random() > 0.5 ? 'bg-brand-primary/80' : 'bg-brand-primary/20'
														}`}
													/>
												))}
											</div>
										</div>
									</motion.div>
								</motion.div>
							</div>
						</div>
					</div>
				</section>

				{/* Technical Differentiators Section */}
				<section className="relative py-24 sm:py-32">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-2xl lg:max-w-none">
							<div className="text-center">
								<motion.h2
									className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5 }}
								>
									AI-Powered Interview Excellence
								</motion.h2>
								<motion.p
									className="mt-4 text-lg text-gray-600"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.2 }}
								>
									Our platform combines advanced AI capabilities with human-centric insights for comprehensive candidate
									assessment
								</motion.p>
							</div>

							<motion.div
								className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.4 }}
							>
								{/* AI Conversations Card */}
								<div className="relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/10">
									<div className="p-6">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
											<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
												/>
											</svg>
										</div>
										<h3 className="mt-4 text-lg font-semibold text-gray-900">AI-Powered Conversations</h3>
										<p className="mt-2 text-gray-600">
											Dynamic AI interviews adapt to candidate responses for deeper insights
										</p>
										<div className="mt-4 rounded-lg bg-gray-50 p-4">
											<div className="text-sm text-gray-700">
												<span className="font-medium">Features:</span>
												<ul className="mt-2 list-disc pl-5 space-y-1">
													<li>Natural language processing</li>
													<li>Context-aware follow-ups</li>
													<li>Multi-role expertise</li>
												</ul>
											</div>
										</div>
									</div>
								</div>

								{/* Real-time Feedback Card */}
								<div className="relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/10">
									<div className="p-6">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
											<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
												/>
											</svg>
										</div>
										<h3 className="mt-4 text-lg font-semibold text-gray-900">Real-Time Feedback</h3>
										<p className="mt-2 text-gray-600">Instant insights and analysis during the interview process</p>
										<div className="mt-4 rounded-lg bg-gray-50 p-4">
											<div className="text-sm text-gray-700">
												<span className="font-medium">Includes:</span>
												<ul className="mt-2 list-disc pl-5 space-y-1">
													<li>Sentiment analysis</li>
													<li>Response quality metrics</li>
													<li>Engagement scoring</li>
												</ul>
											</div>
										</div>
									</div>
								</div>

								{/* Comprehensive Coverage Card */}
								<div className="relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/10">
									<div className="p-6">
										<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
											<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
												/>
											</svg>
										</div>
										<h3 className="mt-4 text-lg font-semibold text-gray-900">Role Coverage</h3>
										<p className="mt-2 text-gray-600">Comprehensive interview templates for various positions</p>
										<div className="mt-4 rounded-lg bg-gray-50 p-4">
											<div className="text-sm text-gray-700">
												<span className="font-medium">Roles:</span>
												<ul className="mt-2 list-disc pl-5 space-y-1">
													<li>Technical positions</li>
													<li>Management roles</li>
													<li>Specialized domains</li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</motion.div>

							{/* Flow Diagram */}
							<motion.div
								className="mt-20 rounded-2xl bg-gray-50 p-8"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.7, delay: 0.6 }}
							>
								<h3 className="text-lg font-semibold text-gray-900 mb-6">Integrated Assessment Flow</h3>
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									{[
										{ title: 'AI Conversations', icon: '🤖' },
										{ title: 'Real-Time Feedback', icon: '👥' },
										{ title: 'Comprehensive Coverage', icon: '📊' },
										{ title: 'Skill Insights', icon: '🛠️' },
									].map((step, _index) => (
										<div key={step.title} className="flex items-center">
											<div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-brand-primary text-white text-2xl">
												{step.icon}
											</div>
											<div className="ml-4 flex-1">
												<p className="text-sm font-medium text-gray-900">{step.title}</p>
											</div>
											{_index < 3 && (
												<div className="hidden md:block flex-shrink-0 w-8 h-8 ml-4">
													<svg
														className="w-full h-full text-gray-400"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
													</svg>
												</div>
											)}
										</div>
									))}
								</div>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Trust Elements Section */}
				<section className="relative py-24 bg-gray-50 sm:py-32">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-2xl lg:max-w-none">
							<div className="text-center">
								<motion.h2
									className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5 }}
								>
									Trusted by Industry Leaders
								</motion.h2>
								<motion.p
									className="mt-4 text-lg text-gray-600"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.2 }}
								>
									See how our AI-powered platform is revolutionizing the interview process
								</motion.p>
							</div>

							{/* Security Badges */}
							<motion.div
								className="mt-16 flex flex-wrap justify-center gap-8"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.4 }}
							>
								{[
									{
										name: 'SOC2',
										icon: (
											<svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={1.5}
													d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
												/>
											</svg>
										),
									},
									{
										name: 'GDPR',
										icon: (
											<svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={1.5}
													d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"
												/>
											</svg>
										),
									},
									{
										name: 'ISO27001',
										icon: (
											<svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={1.5}
													d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
												/>
											</svg>
										),
									},
								].map(badge => (
									<div key={badge.name} className="flex flex-col items-center">
										<div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md text-brand-primary">
											{badge.icon}
										</div>
										<p className="mt-3 text-sm font-medium text-gray-900">{badge.name}</p>
									</div>
								))}
							</motion.div>

							{/* Ethics Statement */}
							<motion.div
								className="mt-16 rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.8 }}
							>
								<div className="flex items-start">
									<div className="flex-shrink-0">
										<div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
											<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
												/>
											</svg>
										</div>
									</div>
									<div className="ml-4">
										<h3 className="text-lg font-semibold text-gray-900">Our Ethics Commitment</h3>
										<p className="mt-2 text-gray-600">
											We never use interview data for black-box hiring algorithms. Your performance data belongs to you
											and is only used for the specific interview process you're participating in.
										</p>
										<div className="mt-4 flex items-center gap-4">
											<span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
												<svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
													<circle cx="4" cy="4" r="3" />
												</svg>
												Transparent AI
											</span>
											<span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
												<svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
													<circle cx="4" cy="4" r="3" />
												</svg>
												Data Control
											</span>
											<span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
												<svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
													<circle cx="4" cy="4" r="3" />
												</svg>
												Fair Assessment
											</span>
										</div>
									</div>
								</div>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Benefits Grid Section */}
				<section className="relative py-24 sm:py-32">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-2xl lg:max-w-none">
							{/* Candidate Benefits */}
							<div className="lg:text-center">
								<motion.h2
									className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5 }}
								>
									Built for Both Sides of the Interview
								</motion.h2>
							</div>

							{/* Candidate Grid */}
							<div className="mt-16">
								<motion.h3
									className="text-xl font-semibold text-gray-900 mb-8"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.2 }}
								>
									For Candidates
								</motion.h3>
								<motion.div
									className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.4 }}
								>
									{[
										{
											title: 'Natural Conversations',
											description:
												'Experience human-like interviews with our advanced AI that adapts to your responses',
											icon: (
												<svg
													className="h-6 w-6"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth="1.5"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
													/>
												</svg>
											),
										},
										{
											title: 'Instant Feedback',
											description: 'Get real-time insights on your responses and detailed performance analytics',
											icon: (
												<svg
													className="h-6 w-6"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth="1.5"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
													/>
												</svg>
											),
										},
										{
											title: 'Skill Development',
											description: 'Identify and improve your strengths with AI-powered skill gap analysis',
											icon: (
												<svg
													className="h-6 w-6"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth="1.5"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
													/>
												</svg>
											),
										},
									].map((benefit, _index) => (
										<div
											key={benefit.title}
											className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
										>
											<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
												{benefit.icon}
											</div>
											<h4 className="mt-4 text-lg font-semibold text-gray-900">{benefit.title}</h4>
											<p className="mt-2 text-gray-600">{benefit.description}</p>
										</div>
									))}
								</motion.div>
							</div>

							{/* Interviewer Grid */}
							<div className="mt-24">
								<motion.h3
									className="text-xl font-semibold text-gray-900 mb-8"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.6 }}
								>
									For Interviewers
								</motion.h3>
								<motion.div
									className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.8 }}
								>
									{[
										{
											title: 'AI Co-Interviewer',
											description: 'Let our AI handle initial screenings and assist during live interviews',
											icon: (
												<svg
													className="h-6 w-6"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth="1.5"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
													/>
												</svg>
											),
										},
										{
											title: 'Smart Analytics',
											description: 'Get comprehensive insights and AI-generated candidate assessments',
											icon: (
												<svg
													className="h-6 w-6"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth="1.5"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
													/>
												</svg>
											),
										},
										{
											title: 'Bias Prevention',
											description: 'AI-powered alerts and suggestions to maintain objective assessments',
											icon: (
												<svg
													className="h-6 w-6"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth="1.5"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
													/>
												</svg>
											),
										},
									].map((benefit, _index) => (
										<div
											key={benefit.title}
											className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
										>
											<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
												{benefit.icon}
											</div>
											<h4 className="mt-4 text-lg font-semibold text-gray-900">{benefit.title}</h4>
											<p className="mt-2 text-gray-600">{benefit.description}</p>
										</div>
									))}
								</motion.div>
							</div>
						</div>
					</div>
				</section>

				{/* Social Proof Section */}
				<section className="relative py-24 bg-gray-50 sm:py-32">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-2xl lg:max-w-none">
							<div className="text-center">
								<motion.h2
									className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5 }}
								>
									Trusted by Industry Leaders
								</motion.h2>
								<motion.p
									className="mt-4 text-lg text-gray-600"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.2 }}
								>
									See how our AI-powered platform is revolutionizing the interview process
								</motion.p>
							</div>

							<motion.div
								className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.4 }}
							>
								{[
									{
										quote:
											"The AI interviewer helped us standardize our process and reduce bias. We've seen a 40% improvement in candidate quality scores.",
										author: 'Sarah Chen',
										title: 'Head of Talent Acquisition',
										company: 'TechCorp Inc.',
										image: 'https://randomuser.me/api/portraits/women/32.jpg',
									},
									{
										quote:
											"The platform's ability to conduct initial technical screenings has saved our engineering team countless hours while maintaining high standards.",
										author: 'Michael Rodriguez',
										title: 'CTO',
										company: 'InnovateSoft',
										image: 'https://randomuser.me/api/portraits/men/45.jpg',
									},
									{
										quote:
											"We've reduced our time-to-hire by 50% while gathering more comprehensive candidate insights through AI-driven conversations.",
										author: 'Emily Thompson',
										title: 'HR Director',
										company: 'FutureTech',
										image: 'https://randomuser.me/api/portraits/women/68.jpg',
									},
								].map((testimonial, _index) => (
									<motion.div
										key={testimonial.author}
										className="relative rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5, delay: 0.4 + _index * 0.2 }}
									>
										<div className="flex items-center gap-x-4 border-b border-gray-900/5 pb-8">
											<img
												src={testimonial.image}
												alt={testimonial.author}
												className="h-12 w-12 rounded-full bg-gray-50"
											/>
											<div className="text-sm leading-6">
												<div className="font-semibold text-gray-900">{testimonial.author}</div>
												<div className="text-gray-600">{testimonial.title}</div>
												<div className="text-brand-primary">{testimonial.company}</div>
											</div>
										</div>
										<div className="mt-8">
											<div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
												<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
													<path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
												</svg>
											</div>
											<blockquote className="mt-6 text-gray-600">{testimonial.quote}</blockquote>
										</div>
									</motion.div>
								))}
							</motion.div>

							{/* Stats */}
							<motion.div
								className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-3 bg-gray-900/5"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.7, delay: 0.6 }}
							>
								{[
									{ value: '40%', label: 'Reduction in False Negatives' },
									{ value: '50%', label: 'Faster Time-to-Hire' },
									{ value: '93%', label: 'Candidate Satisfaction' },
								].map((stat, _index) => (
									<div key={stat.label} className="bg-white px-4 py-8">
										<motion.dt
											className="text-2xl font-bold tracking-tight text-brand-primary"
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.5, delay: 0.8 + _index * 0.1 }}
										>
											{stat.value}
										</motion.dt>
										<motion.dd
											className="mt-1 text-sm text-gray-600"
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.5, delay: 0.9 + _index * 0.1 }}
										>
											{stat.label}
										</motion.dd>
									</div>
								))}
							</motion.div>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="relative py-24 sm:py-32">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-2xl text-center">
							<motion.h2
								className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
							>
								Ready to Transform Your Interview Process?
							</motion.h2>
							<motion.p
								className="mt-4 text-lg text-gray-600"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}
							>
								Join leading companies in adopting AI-powered interviews
							</motion.p>
							<motion.div
								className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.4 }}
							>
								<Link
									to="/signup"
									className="inline-flex items-center justify-center rounded-md bg-brand-primary px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
								>
									Start Free Trial
									<svg className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
										<path
											fillRule="evenodd"
											d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
											clipRule="evenodd"
										/>
									</svg>
								</Link>
								<Link
									to="/demo"
									className="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-lg font-semibold text-brand-primary ring-1 ring-brand-primary/20 hover:bg-gray-50"
								>
									Schedule Demo
									<svg className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
										<path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
										<path
											fillRule="evenodd"
											d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
											clipRule="evenodd"
										/>
									</svg>
								</Link>
							</motion.div>
							<motion.div
								className="mt-8 flex items-center justify-center gap-x-6 text-sm font-medium text-gray-900"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.5, delay: 0.6 }}
							>
								<div className="flex items-center">
									<svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
											clipRule="evenodd"
										/>
									</svg>
									<span className="ml-2">No credit card required</span>
								</div>
								<div className="flex items-center">
									<svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
											clipRule="evenodd"
										/>
									</svg>
									<span className="ml-2">14-day free trial</span>
								</div>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="bg-gray-900" aria-labelledby="footer-heading">
					<h2 id="footer-heading" className="sr-only">
						Footer
					</h2>
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="py-16">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
								<div className="space-y-8">
									<div className="text-2xl font-bold text-white">TalentBud</div>
									<p className="text-sm leading-6 text-gray-300">
										AI-powered interview platform transforming candidate assessment through intelligent conversations.
									</p>
									<div className="flex space-x-6">
										<a href="#" className="text-gray-400 hover:text-gray-300">
											<span className="sr-only">Twitter</span>
											<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
												<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
											</svg>
										</a>
										<a href="#" className="text-gray-400 hover:text-gray-300">
											<span className="sr-only">GitHub</span>
											<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
												<path
													fillRule="evenodd"
													d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.688.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0021 12.017C22 6.484 17.522 2 12 2z"
													clipRule="evenodd"
												/>
											</svg>
										</a>
										<a href="#" className="text-gray-400 hover:text-gray-300">
											<span className="sr-only">LinkedIn</span>
											<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
												<path
													fillRule="evenodd"
													d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
													clipRule="evenodd"
												/>
											</svg>
										</a>
									</div>
								</div>

								<div>
									<h3 className="text-sm font-semibold leading-6 text-white">Platform</h3>
									<ul role="list" className="mt-6 space-y-4">
										<li>
											<Link to="/features" className="text-sm leading-6 text-gray-300 hover:text-white">
												AI Capabilities
											</Link>
										</li>
										<li>
											<Link to="/pricing" className="text-sm leading-6 text-gray-300 hover:text-white">
												Pricing
											</Link>
										</li>
										<li>
											<Link to="/integrations" className="text-sm leading-6 text-gray-300 hover:text-white">
												HR Integrations
											</Link>
										</li>
										<li>
											<Link to="/security" className="text-sm leading-6 text-gray-300 hover:text-white">
												AI Ethics & Security
											</Link>
										</li>
									</ul>
								</div>

								<div>
									<h3 className="text-sm font-semibold leading-6 text-white">Resources</h3>
									<ul role="list" className="mt-6 space-y-4">
										<li>
											<Link to="/about" className="text-sm leading-6 text-gray-300 hover:text-white">
												About Us
											</Link>
										</li>
										<li>
											<Link to="/blog" className="text-sm leading-6 text-gray-300 hover:text-white">
												AI Interview Blog
											</Link>
										</li>
										<li>
											<Link to="/research" className="text-sm leading-6 text-gray-300 hover:text-white">
												Research Papers
											</Link>
										</li>
										<li>
											<Link to="/help" className="text-sm leading-6 text-gray-300 hover:text-white">
												Help Center
											</Link>
										</li>
									</ul>
								</div>

								<div>
									<h3 className="text-sm font-semibold leading-6 text-white">Compliance</h3>
									<ul role="list" className="mt-6 space-y-4">
										<li>
											<Link to="/privacy" className="text-sm leading-6 text-gray-300 hover:text-white">
												Privacy & AI
											</Link>
										</li>
										<li>
											<Link to="/terms" className="text-sm leading-6 text-gray-300 hover:text-white">
												Terms of Service
											</Link>
										</li>
										<li>
											<Link to="/ai-ethics" className="text-sm leading-6 text-gray-300 hover:text-white">
												AI Ethics Policy
											</Link>
										</li>
										<li>
											<Link to="/bias" className="text-sm leading-6 text-gray-300 hover:text-white">
												Bias Prevention
											</Link>
										</li>
									</ul>
								</div>
							</div>
						</div>

						<div className="border-t border-gray-700/25 pt-8 pb-12">
							<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
								<p className="text-xs leading-5 text-gray-400">
									&copy; {new Date().getFullYear()} TalentBud. AI-powered interviews with human insight.
								</p>
								<div className="flex gap-8">
									<Link to="/accessibility" className="text-xs leading-5 text-gray-400 hover:text-gray-300">
										Accessibility
									</Link>
									<Link to="/ai-status" className="text-xs leading-5 text-gray-400 hover:text-gray-300">
										AI System Status
									</Link>
									<Link to="/data-preferences" className="text-xs leading-5 text-gray-400 hover:text-gray-300">
										Data Preferences
									</Link>
								</div>
							</div>
						</div>
					</div>
				</footer>
			</main>
		</div>
	</>
);

export default Home;
