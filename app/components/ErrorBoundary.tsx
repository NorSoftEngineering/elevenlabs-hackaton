import { useRouteError } from 'react-router';

export function ErrorBoundary() {
	const error = useRouteError() as Error;

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<div className="bg-red-50 border border-red-200 rounded-lg p-6">
				<h1 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h1>
				<p className="text-red-700">{error.message}</p>
				<button
					onClick={() => window.location.reload()}
					className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
				>
					Try again
				</button>
			</div>
		</div>
	);
}
