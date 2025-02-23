# TalentBud 🚀

TalentBud is an AI-powered recruitment platform that helps companies hire smarter and move faster. Transform your recruitment process with intelligent scheduling, automated screening, and data-driven insights.

## Features ✨

- **AI Scheduling Assistant** - Eliminate back-and-forth emails with intelligent scheduling
- **Voice-Based Screening** - 24/7 AI-powered preliminary interviews
- **Smart CV Enhancement** - AI suggestions to improve candidate profiles
- **Instant Reports** - Comprehensive interview summaries and evaluations
- **Analytics Dashboard** - Data-driven hiring pipeline insights
- **Collaborative Hiring** - Team-wide feedback and evaluation sharing

## Tech Stack 🛠

- **Frontend**
  - React 19
  - React Router 7
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - Headless UI
  - Lucide Icons
  - Sonner (Toasts)
  - Recharts (Analytics)

- **Backend & Infrastructure**
  - Supabase (Auth & Database)
  - OpenAI
  - Eleven Labs (Voice AI)

- **Testing & Quality**
  - Vitest
  - Cypress
  - Testing Library
  - Biome (Linting)
  - Husky (Git Hooks)

## Getting Started 🏁

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your API keys and configuration
```

4. Start the development server:
```bash
npm run dev
```

## Development Commands 💻

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run linter
- `npm run cypress:open` - Open Cypress test runner
- `npm run cypress:run` - Run Cypress tests headlessly

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📝

This project is proprietary software. All rights reserved.

## Contact 📧

For support or inquiries, please reach out to our team.

```sh
bunx create-react-router@latest --template robipop22/dnb-stack
```

## What's in the stack

- [Vercel deployment](https://vercel.com/) with Vercel CLI
- [GitHub Actions](https://github.com/features/actions) for deploy on merge to production and staging environments (all working via branching system)
- Proposed opinionated folder structure for the project
- Mocked api request for the project and route example
- Styling with [Tailwind](https://tailwindcss.com/)
- End-to-end testing with [Cypress](https://cypress.io)
- Unit testing with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com)
- Code Formatting with [Biome](https://biomejs.dev/)
- Code Linting with [Biome](https://biomejs.dev/)
- Static Types with [TypeScript](https://typescriptlang.org)
- Pre-commit hooks using [Husky](https://typicode.github.io/husky/#/)

Not a fan of bits of the stack? Fork it, change it, and use `bunx create-react-router@latest`! Make it your own.

## Development

Make sure the dependencies are installed

```sh
bun i
```

Afterwards, start the React Router development server like so:

```sh
bun dev
```

Open up [http://localhost:3000](http://localhost:3000) and you should be ready to go!

Go to localhost:3000/books and you should see a list of books. This is a simple example of how to integrate a 3rd party API (tested, typed and mocked).

### Precommit hooks

We use **Husky** to run a pre-commit hook to lint the code.

This prevents us from having to run the linters into our pipelines. It will not let you commit if you have linting errors.

The pre-commit hook will run the following commands:

```sh
bun hook
```

You can move this step into a github action, or run it manually. But this method is faster for development as you won't have to wait for the hook to run in the pipeline.

### Relevant code

This is a basic app that contains two routes, the index for documentation and the /books as a living example of how you can integrate a 3rd party API. The data is mocked and typed and also there is a both unit tests for the client function as well as a cypress test for the respective route.

## Deployment

This stack has a github action for automated deploy on merge on the following branches: **qa**, **dev** or **main**.

You just need to specify and configure the subdomains of your app.
Also from the settings in the repository you need to add Actions secrets so that the github action can deploy your app:

- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
- VERCEL_TOKEN

If you'd like to avoid using github action deploy, you can also deploy the directory by running [Vercel CLI](https://vercel.com/cli):

```sh
npm i -g vercel
vercel
```

## GitHub Actions

We use GitHub Actions for continuous integration and deployment. Anything that gets into the `main` branch will be deployed to production after running tests/build/etc. Anything in the `dev` branch will be deployed to staging. There is a also a `qa` branch that is used for testing.

## Testing

### Cypress

We use Cypress for our End-to-End tests in this project. You'll find those in the `cypress` directory. As you make changes, add to an existing file or create a new file in the `cypress/integration/e2e` directory to test your changes.

We use [`@testing-library/cypress`](https://testing-library.com/cypress) for selecting elements on the page semantically.

To run a specific test(flow) in development, run `FLOW=books bun cypress:run:flow` which will start the dev server for the app as well as the Cypress client. Make sure the app is running.

By _flow_ we want to define some user flows that we will test. For example, if we want to test the app with a user that wants to see the list of books, we can test that by running `FLOW=books bun cypress:run:flow`.

This can be later extended to run multiple flows. Followed the provided example to extend this further.

### Vitest

For lower level tests of utilities and individual components, we use `vitest`. We have DOM-specific assertion helpers via [`@testing-library/jest-dom`](https://testing-library.com/jest-dom).

You can run the tests with `bun run test` or `bun run vitest:coverage` to also show the coverage.

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `bun lint`.

### Linting

This Project uses Biome for linting. That is configured in `biome.json`.

### Formatting

We use [Biome](https://biomejs.dev/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Biome plugin]
