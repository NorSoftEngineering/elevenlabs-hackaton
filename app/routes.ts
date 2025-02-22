import { type RouteConfig, index, route } from '@react-router/dev/routes';

// Define your routes with type safety
export default [
	index('./screens/home.tsx'),
	route('login', './screens/login.tsx'),
	route('auth/google/callback', './routes/auth.google.callback.tsx'),

	route('edge', './screens/edge.tsx'),
	route('edgestream', './screens/edgestream.tsx'),
	route('node', './screens/node.tsx'),
	route('nodestream', './screens/nodestream.tsx'),
] satisfies RouteConfig;
