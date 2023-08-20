# FlarePen

Web based editor for sketching ASCII diagrams

## Development

### Initial Setup

1. Install NVM
2. Install Node v18
3. Install wasm-pack - `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`
4. `yarn install` to install dependencies

### Build package

```sh
yarn build
```

This builds the `text-render` wasm package and the `web` webapp package.

### Run local dev server

```sh
yarn start
```

Starts local server at [http://localhost:5173/](http://localhost:5173/)
