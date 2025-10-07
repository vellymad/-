/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const BOOK_IMAGE_URL = 'https://github.com/vellymad/-/blob/018feba49050b0d55ec03a933faed080a75d4902/project_20250922_1112049-01.png?raw=true';
const TITLE_IMAGE_URL = 'https://github.com/vellymad/-/blob/018feba49050b0d55ec03a933faed080a75d4902/project_20250922_1210462-01.png?raw=true';

function App() {
  return (
    <main className="main-container" role="main">
      <div className="book-wrapper">
        <img src={BOOK_IMAGE_URL} alt="Старинная книга на столе" className="book-image" />
        <img src={TITLE_IMAGE_URL} alt="Сладкий Сомнум" className="game-title" />
        <nav className="buttons-container" aria-label="Главное меню">
          <button className="menu-button" aria-label="Начать игру">Начать</button>
          <button className="menu-button" aria-label="Открыть настройки">Настройки</button>
          <button className="menu-button" aria-label="Выйти из игры">Выход</button>
        </nav>
      </div>
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);