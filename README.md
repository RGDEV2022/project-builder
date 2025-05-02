# create-nodex

A CLI tool to create modern Node.js projects with TypeScript support.

## Features

- TypeScript or JavaScript project setup
- Hot reload development environment
- Jest testing integration
- Modern ES modules
- Clean project structure

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

```bash
create-nodex
```

Then follow the interactive prompts to configure your project:

- Project name
- TypeScript or JavaScript
- Hot reloading
- Testing setup

## Example

```bash
npx create-nodex
# Answer the prompts
cd my-project
npm run dev
```

## Project Structure

The generated project will have the following structure:

```
my-project/
├── src/
│   └── index.ts (or index.js)
├── package.json
├── tsconfig.json (for TypeScript projects)
├── .gitignore
└── README.md
```

## License

MIT
