import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { API_BASE_URL } from '../../services/api';
import { getUserDetails } from '../../services/userService';
import FriendListWidget from '../organisms/FriendListWidget';
import Login from './Login';
import SignUp from './Signup';
import '../../styles/Navbar.css';

const Navbar = () =>
{
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [dbUser, setDbUser] = useState(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFriendsOpen, setIsFriendsOpen] = useState(false);
    
    const dropdownRef = useRef(null);
    const friendsRef = useRef(null);

    const BASE_URL = 'https://localhost:8443';

    useEffect(() =>
    {
        const fetchLatestDetails = async () =>
        {
            if (user)
            {
                try 
                {
                    const data = await getUserDetails();
                    if (data)
                    {
                        setDbUser(data);
                    }
                }
                catch (error)
                {
                    console.error(error);
                }
            }
        };
        fetchLatestDetails();
    }, [user]);

    useEffect(() =>
    {
        const handleClickOutside = (event) =>
        {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target))
            {
                setIsDropdownOpen(false);
            }
            if (friendsRef.current && !friendsRef.current.contains(event.target))
            {
                setIsFriendsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () =>
    {
        await logout();
        setIsDropdownOpen(false);
        setIsFriendsOpen(false);
        navigate('/');
    };

    const getUserDisplayData = () =>
    {
        const source = dbUser || (user?.user ? user.user : user);
        
        if (!user)
        {
            return { 
                name: 'Guest', 
                avatar: "https://ui-avatars.com/api/?background=random&name=Guest" 
            };
        }

        const username = source?.username || 'user';
        const displayName = source?.display_name || source?.nickname || username;
        const avatar = source?.avatar;

        let avatarSrc;
        if (avatar)
        {
            avatarSrc = avatar.startsWith('http') ? avatar : `${BASE_URL}${avatar}`;
        }
        else
        {
            avatarSrc = "https://ui-avatars.com/api/?background=random&name=" + username;
        }

        return { name: displayName, username, avatar: avatarSrc };
    };

    const { name, username, avatar } = getUserDisplayData();

    return (
        <>
            <nav className="navbar">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <a href="/">Sudoku42</a>
                </div>
                
                <div className="auth-buttons">
                    {user ? (
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            
                            <div className="friends-dropdown-container" ref={friendsRef}>
                                <button 
                                    type="button"
                                    className="friends-trigger-btn"
                                    onClick={() => { setIsFriendsOpen(!isFriendsOpen); setIsDropdownOpen(false); }}
                                >
                                    👥 Friends
                                </button>

                                {isFriendsOpen && (
                                    <div className="nav-friends-dropdown-menu">
                                        <div className="navbar-widget-wrapper">
                                            <FriendListWidget />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="profile-dropdown-container" ref={dropdownRef}>
                                <button 
                                    type="button"
                                    className="profile-trigger-btn" 
                                    onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsFriendsOpen(false); }}
                                >
                                    <img 
                                        src={avatar} 
                                        alt={username} 
                                        className="nav-avatar-img"
                                        onError={(e) => { e.target.src = "https://ui-avatars.com/api/?background=random&name=" + username; }} 
                                    />
                                    <span className="nav-display-name">{name}</span>
                                </button>

                                {isDropdownOpen && (
                                    <div className="nav-profile-dropdown-menu">
                                        <div className="dropdown-user-info">
                                            <strong>{name}</strong>
                                            <span>@{username}</span>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-menu-item" onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}>
                                            👤 Profile Details
                                        </button>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-menu-item logout-action" onClick={handleLogout}>
                                            Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <button className="btn btn-secondary" onClick={() => setIsLoginOpen(true)}>
                                Log In
                            </button>
                            <button className="btn btn-primary" onClick={() => setIsSignUpOpen(true)}>
                                Sign Up
                            </button>
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
                        onSwitchToLogin={() => { setIsSignUpOpen(false); setIsLoginOpen(true); }}
                    />
                </>
            )}
        </>
    );
};

export default Navbar;