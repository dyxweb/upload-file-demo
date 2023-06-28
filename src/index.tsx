import React from 'react';
import ReactDOM from 'react-dom/client';
import styles from './index.scss';

const App = () => <div className={styles.app}>app</div>;

const root = ReactDOM.createRoot(document.getElementById('root') as Element);
root.render(<App />);
