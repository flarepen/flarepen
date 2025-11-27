import { useStore } from '../store';

export function toggleRightPanel() {
  useStore.setState((state) => ({
    rightPanel: {
      isOpen: !state.rightPanel.isOpen,
    },
  }));
}
