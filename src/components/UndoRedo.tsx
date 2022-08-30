export interface UndoRedoProps {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

export function UndoRedo({ canUndo, canRedo, undo, redo }: UndoRedoProps): JSX.Element {
  return (
    <div style={{ right: '0', position: 'absolute', padding: '4px' }}>
      <button disabled={!canUndo} onClick={undo}>
        Undo
      </button>
      <button disabled={!canRedo} onClick={redo}>
        Redo
      </button>
    </div>
  );
}
