import { useLottie } from 'lottie-react';
import { useEffect, useState } from 'react';

interface LottieAnimationProps {
	isSpeaking: boolean;
}

export function LottieAnimation({ isSpeaking }: LottieAnimationProps) {
	const [animationData, setAnimationData] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	// Always initialize useLottie with empty or actual animation data
	const options = {
		animationData: animationData || {},
		loop: true,
		autoplay: true,
	};

	const { View, setSpeed } = useLottie(options, {
		width: '100%',
		height: '100%',
		maxWidth: '400px',
		maxHeight: '400px',
	});

	// Update speed when isSpeaking changes
	useEffect(() => {
		if (animationData) {
			setSpeed(isSpeaking ? 1.5 : 0.5);
		}
	}, [isSpeaking, setSpeed, animationData]);

	// Fetch animation data
	useEffect(() => {
		fetch('https://lottie.host/1ece3092-e831-4884-ad00-aec167ceb148/xRPKWByRvj.json')
			.then(res => res.json())
			.then(data => {
				setAnimationData(data);
				setError(null);
			})
			.catch(err => {
				console.error('Failed to load animation:', err);
				setError('Failed to load animation');
			});
	}, []);

	if (error) {
		return <div className="w-full h-full flex items-center justify-center text-brand-primary">{error}</div>;
	}

	if (!animationData) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary" />
			</div>
		);
	}

	return <div className="w-full h-full flex items-center justify-center">{View}</div>;
}
