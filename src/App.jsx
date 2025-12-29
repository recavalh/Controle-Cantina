import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CantinaProvider } from './context/CantinaContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';

function App() {
  return (
    <CantinaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentDetails />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CantinaProvider>
  );
}

export default App;
