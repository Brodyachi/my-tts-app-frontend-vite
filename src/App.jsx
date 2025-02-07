import {Routes, Route} from 'react-router-dom';
import './index.css';
import Auth from './Auth';
import ChatModule from './Chat';

function App() {
    return(
        <>
        <Routes>
        <Route path="/auth" index element={<Auth></Auth>}/>
        <Route path="/chat" element={<ChatModule></ChatModule>}/>
        </Routes>
        </>
    )
}

export default App;