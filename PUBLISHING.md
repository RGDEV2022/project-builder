# Publishing to npm

Follow these steps to publish your CLI tool to npm:

## 1. Create an npm account

If you don't have an npm account, create one at [npmjs.com](https://www.npmjs.com/signup).

## 2. Login to npm from your terminal

```bash
npm login
```

Enter your username, password, and email when prompted.

## 3. Build your project

```bash
npm run build
```

## 4. Publish to npm

```bash
npm publish
```

If this is your first time publishing this package and the name is available, it will be published to the npm registry.

## 5. Testing the published package

After publishing, you can test that it works by running:

```bash
npx create-modern-node
```

## Publishing updates

When you make changes to your package:

1. Update the version in package.json (follow semantic versioning)
2. Build the project: `npm run build`
3. Publish: `npm publish`

## Alternative: Local installation for testing

If you want others to test your package locally without publishing to npm:

1. Build your project: `npm run build`
2. Create a tarball: `npm pack`
3. Share the resulting .tgz file
4. They can install it with: `npm install -g ./create-modern-node-1.0.0.tgz`

## GitHub Repository

Consider pushing your code to GitHub so people can contribute:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/create-modern-node.git
git push -u origin main
```
