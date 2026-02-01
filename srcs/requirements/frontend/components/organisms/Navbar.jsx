import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import NavButton from '../atoms/NavButton';
import Logo from '../atoms/Logo';
import Login from '../molecules/Login'; 
import SignUp from '../molecules/Signup'; 
import '../../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const openLogin = () => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
  };

  const openSignUp = () => {
    setIsLoginOpen(false);
    setIsSignUpOpen(true);
  };

  return (
    <>
      <nav className="o-navbar">
        <div className="navbar-logo-container">
          <Logo />
        </div>
        
        <div className="navbar-actions">
          {user ? (
            <NavButton 
              variant="primary" 
              onClick={() => navigate('/profile')}
            >
              Profile
            </NavButton>
          ) : (
            <>
              <NavButton 
                variant="secondary" 
                onClick={openLogin}
              >
                Log In
              </NavButton>
              
              <NavButton 
                variant="primary" 
                onClick={openSignUp}
              >
                Sign Up
              </NavButton>
            </>
          )}
        </div>
      </nav>

      {!user && (
        <>
          <Login 
            isOpen={isLoginOpen} 
            onClose={() => setIsLoginOpen(false)} 
          />

          <SignUp 
            isOpen={isSignUpOpen} 
            onClose={() => setIsSignUpOpen(false)}
            onSwitchToLogin={openLogin}
          />
        </>
      )}
    </>
  );
};

export default Navbar;