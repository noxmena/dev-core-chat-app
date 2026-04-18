import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/DevCoreAuthContext';
import { AuthGuard } from './components/chat/AuthGuard';
import { SignIn } from './pages/SignIn';
import { Chat } from './pages/Chat';
import { Settings } from './pages/Settings';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            
            <Route 
              path="/chat" 
              element={
                <AuthGuard>
                  <Chat />
                </AuthGuard>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <AuthGuard>
                  <Settings />
                </AuthGuard>
              } 
            />
            
            {/* Auto-redirect */}
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}
