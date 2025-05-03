import {Routes, Route, Navigate} from 'react-router-dom';
import './index.css';
import Auth from './Auth';
import ChatModule from './Chat';
import ProfileModule from './Profile';

function App() {
    return(
        <>
        <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" index element={<Auth></Auth>}/>
        <Route path="/chat" element={<ChatModule></ChatModule>}/>
        <Route path="/profile" element={<ProfileModule></ProfileModule>}/>
        </Routes>
        </>
    )
}

export default App;