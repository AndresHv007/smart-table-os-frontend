import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TableScreen from './components/TableScreen';
import MobileScreen from './components/MobileScreen';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <Router>
      <div className="w-screen h-[100dvh] bg-gray-900 text-white overflow-hidden">
        <ErrorBoundary>
          <Routes>
            {/* Default route is the table (host) */}
            <Route path="/" element={<TableScreen />} />
            {/* Mobile route for players */}
            <Route path="/mobile" element={<MobileScreen />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
