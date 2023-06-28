/**
 * route配置
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import BigFileUpload from './pages/bigFileUpload';
import BigFileProgressUpload from './pages/bigFileProgressUpload';

function Layout() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">大文件上传</Link>
          </li>
          <li>
            <Link to="/progress">大文件上传(进度条显示)</Link>
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
          <Route path="/progress" element={<BigFileProgressUpload />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
