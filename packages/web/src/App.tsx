import React from 'react';
import { Timer } from './components/Timer';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-light">
      <Timer />
    </div>
  );
}; 