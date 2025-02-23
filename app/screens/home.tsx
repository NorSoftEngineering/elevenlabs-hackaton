import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
	ArrowRight,
	Bot,
	Calendar,
	ChevronRight,
	Clock,
	FileText,
	LineChart,
	Mic,
	Sparkles,
	Star,
	Users,
	X,
	Zap,
} from 'lucide-react';
import { Fragment, useState } from 'react';
import { Link } from 'react-router';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';

interface VideoModalProps {
	isOpen: boolean;
	onClose: () => void;
}

function VideoModal({ isOpen, onClose }: VideoModalProps) {
	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={onClose}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/70" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
								<button
									onClick={onClose}
									className="absolute -top-12 right-0 text-white hover:text-white/80 transition-colors"
								>
									<X className="h-8 w-8" />
								</button>
								<div className="aspect-video w-full">
									<iframe
										width="100%"
										height="100%"
										src="https://www.youtube.com/embed/N5XgMituaKk"
										title="TalentBud Demo"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
										className="rounded-lg"
									/>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}

interface Testimonial {
	name: string;
	role: string;
	image: string;
	quote: string;
}

export default function LandingPage() {
	const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
	const testimonials: Testimonial[] = [
		{
			name: 'Sarah Chen',
			role: 'Head of Talent, TechCorp',
			image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&h=200&fit=crop',
			quote:
				'TalentBud has cut our hiring time in half. The AI scheduling and screening are game-changers for our recruitment process.',
		},
		{
			name: 'Marcus Rodriguez',
			role: 'HR Director, InnovateCo',
			image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop',
			quote:
				'The voice-based screening saved us countless hours. We can now focus on meaningful interactions with top candidates.',
		},
		{
			name: 'Emily Watson',
			role: 'Recruiting Manager, StartupX',
			image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop',
			quote:
				"The analytics dashboard gives us incredible insights. We've improved our hiring success rate by 40% since using TalentBud.",
		},
	];

	return (
		<div className="flex flex-col min-h-screen bg-white">
			{/* Header */}
			<header className="fixed top-0 w-full z-100 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
				<div className="container flex h-20 items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="relative">
							<div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#4A90E2] to-[#7FB3FF] blur-lg opacity-40" />
							<img src="/talentbud-logo.png" alt="logo" className="h-8 w-8 text-[#4A90E2] relative" />
						</div>
						<span className="text-xl font-bold bg-gradient-to-r from-[#4A90E2] to-[#7FB3FF] bg-clip-text text-transparent">
							TalentBud
						</span>
					</div>
					<nav className="hidden md:flex gap-8"></nav>
					<div className="flex items-center gap-4">
						<Link to="/login">
							<Button variant="ghost" className="font-medium">
								Sign In
							</Button>
						</Link>
						<Link to="/login">
							<Button className="font-medium bg-gradient-to-r from-[#4A90E2] to-[#7FB3FF] hover:opacity-90 transition-opacity">
								Get Started
							</Button>
						</Link>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative pt-32 pb-20 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-[#C7E0FF]/20 to-transparent" />
				<motion.div
					initial={{ opacity: 0, x: -100, scale: 0.9 }}
					animate={{ opacity: 0.2, x: 0, scale: 1 }}
					transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
					className="absolute top-1/2 -left-64 w-96 h-96 bg-[#4A90E2]/20 rounded-full blur-3xl"
				/>
				<motion.div
					initial={{ opacity: 0, x: 100, scale: 0.9 }}
					animate={{ opacity: 0.2, x: 0, scale: 1 }}
					transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
					className="absolute top-1/2 -right-64 w-96 h-96 bg-[#FFD166]/20 rounded-full blur-3xl"
				/>

				<div className="container relative">
					<div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
							<Badge
								variant="secondary"
								className="bg-white shadow-xl shadow-blue-100 border-slate-200/60 px-6 py-2 rounded-full"
							>
								<Sparkles className="h-4 w-4 text-[#FFD166] mr-2" />
								<span className="text-slate-800">AI-Powered Recruitment Platform</span>
							</Badge>
						</motion.div>

						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
						>
							Hire Smarter,{' '}
							<span className="bg-gradient-to-r from-[#4A90E2] to-[#7FB3FF] bg-clip-text text-transparent">
								Move Faster
							</span>
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
							className="text-xl text-slate-600 max-w-2xl"
						>
							Transform your recruitment process with AI-powered scheduling, intelligent screening, and automated
							feedback. The future of hiring is here.
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.6 }}
							className="flex gap-6 mt-4"
						>
							<Link to="/login">
								<Button
									size="lg"
									className="bg-gradient-to-r from-[#4A90E2] to-[#7FB3FF] hover:opacity-90 transition-opacity h-14 px-8 rounded-full text-lg cursor-pointer"
								>
									Start Free Trial
									<ArrowRight className="ml-2 h-5 w-5" />
								</Button>
							</Link>
							<Button
								size="lg"
								variant="outline"
								className="h-14 px-8 rounded-full text-lg border-slate-300 hover:bg-slate-100/80"
								onClick={() => setIsVideoModalOpen(true)}
							>
								Watch Demo
							</Button>
						</motion.div>

						<VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.8 }}
							className="grid grid-cols-3 gap-8 mt-12 w-full"
						>
							{[
								{ number: '85%', label: 'Time Saved' },
								{ number: '2.5x', label: 'Faster Hiring' },
								{ number: '93%', label: 'Satisfaction Rate' },
							].map((stat, index) => (
								<motion.div
									key={index}
									className="flex flex-col items-center gap-2"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
								>
									<span className="text-4xl font-bold bg-gradient-to-r from-[#4A90E2] to-[#7FB3FF] bg-clip-text text-transparent">
										{stat.number}
									</span>
									<span className="text-slate-600">{stat.label}</span>
								</motion.div>
							))}
						</motion.div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="py-32 relative">
				<div className="container">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{ duration: 0.5, delay: 0.5 }}
						className="text-center mb-20"
					>
						<Badge variant="secondary" className="bg-white shadow-lg shadow-blue-100 px-6 py-2 rounded-full mb-6">
							<Zap className="h-4 w-4 text-[#FFD166] mr-2" />
							<span className="text-slate-800">Powerful Features</span>
						</Badge>
						<h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
							Every Tool You Need to Hire Better
						</h2>
						<p className="text-slate-600 max-w-2xl mx-auto text-lg">
							Our AI agents handle the complexity, so you can focus on what matters most - finding the right talent
						</p>
					</motion.div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								icon: Calendar,
								title: 'AI Scheduling Assistant',
								description:
									'Eliminate back-and-forth emails with intelligent scheduling that finds the perfect time for everyone',
								gradient: 'from-[#4A90E2] to-[#7FB3FF]',
							},
							{
								icon: Mic,
								title: 'Voice-Based Screening',
								description: 'Conduct preliminary interviews through our AI voice agent, available 24/7',
								gradient: 'from-[#7FB3FF] to-[#C7E0FF]',
							},
							{
								icon: FileText,
								title: 'Smart CV Enhancement',
								description: "Get AI-powered suggestions to improve candidates' CVs and increase their chances",
								gradient: 'from-[#FFD166] to-[#FFE4A0]',
							},
							{
								icon: Clock,
								title: 'Instant Reports',
								description: 'Receive comprehensive interview summaries and candidate evaluations immediately',
								gradient: 'from-[#4A90E2] to-[#7FB3FF]',
							},
							{
								icon: LineChart,
								title: 'Analytics Dashboard',
								description: 'Track your hiring pipeline and make data-driven decisions with real-time insights',
								gradient: 'from-[#7FB3FF] to-[#C7E0FF]',
							},
							{
								icon: Users,
								title: 'Collaborative Hiring',
								description: 'Keep your entire hiring team aligned with shared feedback and evaluations',
								gradient: 'from-[#FFD166] to-[#FFE4A0]',
							},
						].map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.2 }}
								transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
							>
								<Card className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/60 backdrop-blur-sm border-slate-200/60 group">
									<div className="relative w-fit mb-6">
										<motion.div
											initial={{ scale: 0.8, opacity: 0 }}
											whileInView={{ scale: 1, opacity: 0.4 }}
											viewport={{ once: true, amount: 0.2 }}
											transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
											className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} blur-lg`}
										/>
										<div className={`relative bg-gradient-to-r ${feature.gradient} p-3 rounded-2xl`}>
											<feature.icon className="h-7 w-7 text-white" />
										</div>
									</div>
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true, amount: 0.2 }}
										transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
									>
										<h3 className="font-semibold text-xl mb-3 text-slate-800">{feature.title}</h3>
										<p className="text-slate-600 leading-relaxed">{feature.description}</p>
									</motion.div>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* How it Works */}
			<section id="how-it-works" className="py-32 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
				<div className="absolute inset-0 bg-grid-slate-200/60 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
				<div className="container relative">
					<div className="text-center mb-20">
						<Badge variant="secondary" className="bg-white shadow-lg shadow-blue-100 px-6 py-2 rounded-full mb-6">
							<Clock className="h-4 w-4 text-[#4A90E2] mr-2" />
							<span className="text-slate-800">Simple Process</span>
						</Badge>
						<h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
							How TalentBud Works
						</h2>
						<p className="text-slate-600 max-w-2xl mx-auto text-lg">
							A streamlined process that saves time for both recruiters and candidates
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-12">
						{[
							{
								step: '01',
								title: 'Create Profile',
								description: 'Candidates create profiles and upload their CVs for AI-powered enhancement',
							},
							{
								step: '02',
								title: 'AI Screening',
								description: 'Complete voice-based preliminary interviews at your convenience',
							},
							{
								step: '03',
								title: 'Smart Matching',
								description: 'Get matched with the perfect opportunities based on skills and preferences',
							},
						].map((step, index) => (
							<div key={index} className="relative group">
								<div className="bg-white rounded-2xl p-8 shadow-lg shadow-blue-100/50 border border-slate-200/60 relative z-10">
									<div className="text-5xl font-bold bg-gradient-to-r from-[#4A90E2] to-[#7FB3FF] bg-clip-text text-transparent mb-6">
										{step.step}
									</div>
									<h3 className="text-xl font-semibold mb-3 text-slate-800">{step.title}</h3>
									<p className="text-slate-600">{step.description}</p>
								</div>
								{index < 2 && (
									<ChevronRight className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 text-[#4A90E2] z-20" />
								)}
								<div className="absolute inset-0 bg-gradient-to-r from-[#4A90E2]/10 to-[#7FB3FF]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
				<div className="absolute inset-0 bg-grid-slate-200/60 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
				<div className="container relative">
					<div className="text-center mb-20">
						<Badge variant="secondary" className="bg-white shadow-lg shadow-blue-100 px-6 py-2 rounded-full mb-6">
							<Star className="h-4 w-4 text-[#FFD166] mr-2" />
							<span className="text-slate-800">Success Stories</span>
						</Badge>
						<h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
							What Our Clients Say
						</h2>
						<p className="text-slate-600 max-w-2xl mx-auto text-lg">
							Join hundreds of companies that have transformed their hiring process with TalentBud
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{testimonials.map((testimonial, index) => (
							<Card
								key={index}
								className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-slate-200/60"
							>
								<div className="flex items-center gap-4 mb-6">
									<div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-r from-[#4A90E2] to-[#7FB3FF]">
										<img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
									</div>
									<div>
										<h4 className="font-semibold text-slate-800">{testimonial.name}</h4>
										<p className="text-sm text-slate-600">{testimonial.role}</p>
									</div>
								</div>
								<blockquote className="text-slate-600 leading-relaxed italic">"{testimonial.quote}"</blockquote>
								<div className="flex gap-1 mt-6">
									{Array.from({ length: 5 }).map((_, i) => (
										<Star key={i} className="h-5 w-5 fill-[#FFD166] text-[#FFD166]" />
									))}
								</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Demo Video CTA */}
			<section className="py-32 bg-slate-50 relative overflow-hidden">
				<div className="absolute inset-0 bg-grid-slate-200/60 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
				<div className="container relative">
					<div className="flex flex-col lg:flex-row items-center gap-12">
						<div className="flex-1 text-left">
							<Badge variant="secondary" className="bg-white shadow-lg shadow-blue-100 px-6 py-2 rounded-full mb-6">
								<Bot className="h-4 w-4 text-[#4A90E2] mr-2" />
								<span className="text-slate-800">See it in Action</span>
							</Badge>
							<h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
								Watch How TalentBud <br />
								Transforms Hiring
							</h2>
							<p className="text-lg text-slate-600 mb-8">
								Get a firsthand look at our AI-powered platform. See how TalentBud streamlines your recruitment process
								from start to finish.
							</p>
							<Button
								size="lg"
								onClick={() => setIsVideoModalOpen(true)}
								className="bg-gradient-to-r from-[#4A90E2] to-[#7FB3FF] hover:opacity-90 transition-opacity h-14 px-8 rounded-full text-lg"
							>
								Watch Demo Video
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
						</div>
						<div className="flex-1">
							<div className="relative group cursor-pointer" onClick={() => setIsVideoModalOpen(true)}>
								<div className="absolute inset-0 bg-gradient-to-r from-[#4A90E2] to-[#7FB3FF] rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
										<div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-[#4A90E2] border-b-[12px] border-b-transparent ml-1" />
									</div>
								</div>
								<img
									src="https://img.youtube.com/vi/N5XgMituaKk/maxresdefault.jpg"
									alt="TalentBud Demo Preview"
									className="w-full rounded-2xl shadow-2xl"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-32">
				<div className="container">
					<Card className="relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-[#4A90E2] to-[#7FB3FF]" />
						<div className="absolute inset-0 bg-grid-white/10" />
						<div className="relative p-12 md:p-16 text-center text-white">
							<Badge
								variant="secondary"
								className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-6 py-2 rounded-full mb-8"
							>
								<Sparkles className="h-4 w-4 text-[#FFD166] mr-2" />
								<span>Limited Time Offer</span>
							</Badge>

							<h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Hiring?</h2>
							<p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
								Join forward-thinking companies using TalentBud to revolutionize their recruitment process
							</p>

							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link to="/login">
									<Button
										size="lg"
										className="bg-white text-[#4A90E2] hover:bg-white/90 transition-colors h-14 px-8 rounded-full text-lg"
									>
										Get Started Now
										<ArrowRight className="ml-2 h-5 w-5" />
									</Button>
								</Link>
							</div>
						</div>
					</Card>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-slate-200/60 py-16 bg-slate-50/50">
				<div className="container">
					<div className="flex items-center justify-between gap-8">
						<div className="flex items-center gap-8">
							<div className="flex items-center gap-2">
								<Bot className="h-6 w-6 text-[#4A90E2]" />
								<span className="font-bold bg-gradient-to-r from-[#4A90E2] to-[#7FB3FF] bg-clip-text text-transparent">
									TalentBud
								</span>
							</div>
							<p className="text-slate-600 text-sm">Transforming recruitment with the power of AI</p>
						</div>

						<div className="text-sm text-slate-600">© {new Date().getFullYear()} TalentBud. All rights reserved.</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
