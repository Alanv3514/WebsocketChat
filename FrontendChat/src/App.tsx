
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import WebSocketComponent from './components/WebSocketComponent';
import { Suspense } from 'react';
import Login from './components/Login';

function App() {
  return (
    <div className="App">
    <BrowserRouter>

            <Suspense fallback={<CircularProgress />}>
                <Routes>
                <Route path='/' element={<Login/>} />
                <Route path='/chat' element={<WebSocketComponent/>} />
                </Routes>
            </Suspense>

    </BrowserRouter>
    </div>
  );
}

export default App;