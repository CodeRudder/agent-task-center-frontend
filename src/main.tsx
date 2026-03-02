import React from 'react';
import ReactDOM from 'react-dom/client';
import type { RouterProvider } from 'react-router-dom';
import type { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { router } from './router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <RouterProvider router={router} />
    </ConfigProvider>
  </React.StrictMode>
);
