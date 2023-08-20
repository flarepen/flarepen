# How to Develop FlarePen

## A Disclaimer

I don't know what I am doing here, seriously. So you may find some nonsense code or messy pattern in the codebase. I am just learning and making it all up as I build. And thats just how it is.

## Unit Tests

There are none, sorry!

## Debugging

Use console.log. Use browser dev-tool debugger with source maps.

## On text-render and WASM

`text-render` does nothing now, and we dont use WASM for anything. Its just an experiment I am trying out.

## Code Layout

### `/components`

All UI components.

- `/editor`: Canvas based Editor, with some extras like grid, text-input, dimension-indicator etc.
- `/icons`: All icons used
- `/sidepanel`: In early stages, options for aligning and changing element properties. Need refactoring.
- `/toolbar`: Main toolbar on the top.

Apart from above items, this module has components like a generic button, Grid switcher, theme switcher, ToolTip, UndoRedo etc ..

### `/element`

A dump of all code related to elements. Like creating new element, properties for each element, finding their bounding boxes etc. I am not yet sure if this is a right abstraction. Might clean this up. Also `ElementUtils` and related `*Utils` abstractions are weird, I know 😅.

### `/font`

We just use one monospace font now. But we probably need another one for interface text other than the diagrams drawn.

### `/state`

All state management, split into actions and store. Backed by zustand.

### Others

- `draw.ts`: Utilities to help with drawing on Canvas
- `geometry.ts`: Utilities to generate into plain text elements.
- `id.ts`: Some ID management
- `types`: All common types
- `stitches.config.ts`: Theme based colors, based on stitches and radix-colors
- `tools.ts`: Umm, this should probably go somewhere else.
