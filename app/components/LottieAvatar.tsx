import { Suspense, lazy } from 'react';
import { ClientOnly } from './ClientOnly';

interface LottieAvatarProps {
	isSpeaking: boolean;
}

const LottieAnimation = lazy(() => import('./LottieAnimation').then(mod => ({ default: mod.LottieAnimation })));

const LoadingSpinner = () => (
	<div className="w-full h-full flex items-center justify-center">
		<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary" />
	</div>
);

export function LottieAvatar(props: LottieAvatarProps) {
	return (
		<ClientOnly fallback={<LoadingSpinner />}>
			<Suspense fallback={<LoadingSpinner />}>
				<LottieAnimation {...props} />
			</Suspense>
		</ClientOnly>
	);
}
