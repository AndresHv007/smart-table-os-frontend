import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TableScreen from './components/TableScreen';
import MobileScreen from './components/MobileScreen';
import ErrorBoundary from './ErrorBoundary';
import { ToastProvider } from './components/ui/LiquidToast';

function App() {
  return (
    <Router>
      <div className="w-screen h-[100dvh] bg-[#050811] text-slate-100 overflow-hidden">
        <ErrorBoundary>
          <ToastProvider>
            <Routes>
              {/* Default route is the table (host) */}
              <Route path="/" element={<TableScreen />} />
              {/* Mobile route for players */}
              <Route path="/mobile" element={<MobileScreen />} />
            </Routes>
          </ToastProvider>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
