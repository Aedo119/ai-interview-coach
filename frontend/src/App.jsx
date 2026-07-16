import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar        from './components/Navbar';
import Home          from './pages/Home';
import Practice      from './pages/Practice';
import Results       from './pages/Results';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Tracks        from './pages/Tracks';
import Analytics     from './pages/Analytics';
import MockInterview from './pages/MockInterview';
import MockExport    from './pages/MockExport';
import Profile       from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Export page — no navbar, print-only layout */}
            <Route path="/mock/export" element={<MockExport />} />

            {/* All other pages — with navbar */}
            <Route path="*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/"          element={<Home />}          />
                  <Route path="/practice"  element={<Practice />}      />
                  <Route path="/results"   element={<Results />}       />
                  <Route path="/login"     element={<Login />}         />
                  <Route path="/register"  element={<Register />}      />
                  <Route path="/tracks"    element={<Tracks />}        />
                  <Route path="/analytics" element={<Analytics />}     />
                  <Route path="/mock"      element={<MockInterview />} />
                  <Route path="/profile"   element={<Profile />}       />
                </Routes>
              </>
            } />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
