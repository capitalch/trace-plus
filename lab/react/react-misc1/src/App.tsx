import React from 'react';
import { BrowserRouter, Routes, } from 'react-router-dom'
import './App.scss';
import { useAppRoutes } from './app/app-routes';

function App() {
  const { getRoutes } = useAppRoutes()
  return (
  
    <BrowserRouter>
      <Routes>
        {getRoutes()}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
