import { useStore } from '../store';

export function toggleRightPanel() {
  useStore.setState((state) => ({
    rightPanel: {
      isOpen: !state.rightPanel.isOpen,
    },
  }));
}

export function toggleLeftPanel() {
  useStore.setState((state) => ({
    leftPanel: {
      isOpen: !state.leftPanel.isOpen,
    },
  }));
}
