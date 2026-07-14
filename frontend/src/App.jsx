import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar    from './components/Navbar';
import Home      from './pages/Home';
import Practice  from './pages/Practice';
import Results   from './pages/Results';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Tracks    from './pages/Tracks';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/"          element={<Home />}      />
            <Route path="/practice"  element={<Practice />}  />
            <Route path="/results"   element={<Results />}   />
            <Route path="/login"     element={<Login />}     />
            <Route path="/register"  element={<Register />}  />
            <Route path="/tracks"    element={<Tracks />}    />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
