import {Routes, Route, Navigate} from 'react-router-dom';
import { useState } from 'react';
import './index.css';
import Auth from './Auth';
import ChatModule from './Chat';
import ProfileModule from './Profile';

function App() {
    const [theme, setTheme] = useState('light');

    return(
        <>
        <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" index element={<Auth theme={theme} setTheme={setTheme}></Auth>}/>
        <Route path="/chat" element={<ChatModule theme={theme} setTheme={setTheme}></ChatModule>}/>
        <Route path="/profile" element={<ProfileModule theme={theme} setTheme={setTheme}></ProfileModule>}/>
        </Routes>
        </>
    )
}

export default App;