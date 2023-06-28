/**
 * route配置
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import BigFileUpload from './pages/bigFileUpload';

function Layout() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">大文件上传</Link>
          </li>
        </ul>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<BigFileUpload />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
