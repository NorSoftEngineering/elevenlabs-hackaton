import { Link, useRouteError } from 'react-router';

type ErrorDisplay = {
	status?: number;
	title: string;
	message: string;
};

function getErrorDisplay(error: unknown): ErrorDisplay {
	if (error instanceof Error) {
		if (error.message.includes('Not authenticated')) {
			return {
				status: 401,
				title: 'Not authenticated',
				message: 'Please log in to access this page',
			};
		}
		if (error.message.includes('Not authorized')) {
			return {
				status: 403,
				title: 'Not authorized',
				message: "You don't have permission to access this page",
			};
		}
		return {
			title: 'Unexpected Error',
			message: error.message,
		};
	}
	return {
		title: 'Something went wrong',
		message: 'An unexpected error occurred. Please try again later.',
	};
}

export default function ErrorScreen() {
	const error = useRouteError();
	const { status, title, message } = getErrorDisplay(error);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 text-center">
				<div>
					{status && <h1 className="text-9xl font-extrabold text-gray-900">{status}</h1>}
					<h2 className="mt-6 text-3xl font-bold text-gray-900">{title}</h2>
					<p className="mt-2 text-sm text-gray-600">{message}</p>
				</div>
				<div className="flex justify-center space-x-4">
					<button
						onClick={() => window.location.reload()}
						className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Try again
					</button>
					<Link
						to="/"
						className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Go back home
					</Link>
				</div>
			</div>
		</div>
	);
}
