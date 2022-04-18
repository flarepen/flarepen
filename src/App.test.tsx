import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders canvas', () => {
  render(<App />);
  const canvasElement = screen.getByLabelText(/ascii canvas/i);
  expect(canvasElement).toBeInTheDocument();
});
