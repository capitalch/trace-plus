import React from 'react';
import { BrowserRouter, Routes, Route, } from 'react-router-dom'
import './App.scss';
import { Navigation } from './features/navigation';
import { Home } from './features/home';
import { Blogs } from './features/blogs';
import { useAppRoutes } from './app/app-routes';

function App() {
  const { getRoutes } = useAppRoutes()
  return (
    <BrowserRouter>
      <Routes>
        {getRoutes()}
        {/* <Route path='/' Component={Home} />
        <Route path='navigation' element={<Navigation />} />
        <Route path='blogs' element={<Blogs />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
