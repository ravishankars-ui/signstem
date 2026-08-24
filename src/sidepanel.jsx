import React from 'react';
import { createRoot } from 'react-dom/client';
import { LiveRecognitionPanel } from './components/LiveRecognitionPanel';

const root = createRoot(document.getElementById('root'));
root.render(<LiveRecognitionPanel />);
