import { type RouteConfig, index, route } from '@react-router/dev/routes';

// Define your routes with type safety
export default [
	index('./screens/home.tsx'),
	route('login', './screens/login.tsx'),
	route('auth/google/callback', './routes/auth.google.callback.tsx'),
	// Role selection ()
	route('role-selection', './screens/role-selection.tsx'),

	// Interview join route
	route('interview/join/:token', './screens/interview.join.tsx'),

	// Protected dashboard routes (for interviewers)
	route('dashboard', './routes/protected.interviewer.tsx', [
		index('./screens/dashboard.tsx'),
		route('orgs', './screens/dashboard/orgs.tsx'),
		route('orgs/new', './screens/orgs.new.tsx'),
		route('orgs/:slug/settings', './screens/orgs.settings.tsx'),
		route('orgs/:slug/members', './screens/orgs.members.tsx'),
		// Interview management routes
		route('interviews', './screens/interviewer/interviews.tsx'),
		route('interviews/new', './screens/interviewer/interview.new.tsx'),
		route('interviews/:id', './screens/interviewer/interview.tsx'),
		route('interviews/:id/invite', './screens/interviewer/interview.invite.tsx'),

		// Analytics routes
		route('analytics', './screens/interviewer/analytics/analytics.tsx'),
	]),

	// Candidate routes
	route('candidate', './routes/protected.candidate.tsx', [
		route('dashboard', './screens/candidate/dashboard.tsx'),
		route('interviews', './screens/candidate/interviews.tsx'),
		route('profile', './screens/candidate/profile.tsx'),
		route('profile/edit', './screens/candidate/profile.edit.tsx'),
		route('interviews/:id', './screens/candidate/interview.tsx'),
	]),
	route('agent', './routes/protected.agent.tsx'),
	route('auth/signout', './routes/auth.signout.tsx'),

	// 404 catch-all route
	route('*', './screens/404.tsx'),
] satisfies RouteConfig;
