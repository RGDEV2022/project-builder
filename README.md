# create-nodex

A CLI tool to create modern Node.js projects with TypeScript support.

## Features

- TypeScript or JavaScript project setup
- Hot reload development environment
- Jest testing integration
- Modern ES modules
- Clean project structure
- Add features like Express easily

## Installation

Install globally:

```bash
npm install -g create-nodex
```

Or use directly with npx:

```bash
npx create-nodex
```

## Usage

### Creating a new project

```bash
create-nodex [project-name]
```

- If `[project-name]` is provided, the project will be created with default settings (TypeScript, Hot Reload, Testing).
- If `[project-name]` is omitted, you will be prompted interactively to configure your project:
  - Project name
  - TypeScript or JavaScript
  - Hot reloading
  - Testing setup

### Adding features to an existing project

Navigate to your project directory created with `create-nodex`:

```bash
cd my-project
```

Then, use the `add` command:

**Add Express:**

```bash
create-nodex add express
```

This will:

- Add `express` dependency.
- Add a basic `src/server.ts` (or `src/server.js`) file with GET and POST examples.
- Add `dev:server` and `start:server` scripts to your `package.json`.
- Install the new dependencies.

After adding Express, you can run the server with:

```bash
npm run dev:server
```

The server will be available at `http://localhost:3000`.

## Example

**Interactive Setup:**

```bash
# Create a new project interactively
npx create-nodex
# Answer the prompts (e.g., project name: my-express-app)
cd my-express-app

# Add Express
create-nodex add express

# Run the development server
npm run dev:server
```

**Direct Setup with Default Options:**

```bash
# Create a new project directly with default options
create-nodex my-ts-app
cd my-ts-app

# Add Express
create-nodex add express

# Run the development server
npm run dev:server
```

## Project Structure

The generated project will have the following structure:

```
my-project/
├── src/
│   ├── index.ts (or index.js)
│   └── server.ts (if Express added)
├── package.json
├── nodemon.json (if hot-reload enabled)
├── tsconfig.json (for TypeScript projects)
├── .gitignore
└── README.md
```

## License

MIT
