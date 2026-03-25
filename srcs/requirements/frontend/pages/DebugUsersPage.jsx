import React, { useEffect, useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import '../styles/DebugUsersPage.css';

const DebugUsersPage = () => {
    const { user, logout, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user || !user.is_superuser) {
            window.location.href = '/';
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await fetch('https://localhost:8443/api/v1/user/debug-users/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                } else {
                    setError('Failed to fetch users');
                }
            } catch (err) {
                setError('An error occurred while fetching users');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleLogout = () => {
        logout();
    };

    if (loading) return <div className="debug-loading">Loading users...</div>;
    if (error) return <div className="debug-error">{error}</div>;

    return (
        <div className="debug-page-container">
            <header className="debug-header">
                <h1>Debug Users</h1>
                <button className="btn btn-primary logout-btn" onClick={handleLogout}>Logout</button>
            </header>
            <main className="debug-content">
                <div className="debug-table-wrapper">
                    <table className="debug-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Display Name</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.display_name || '-'}</td>
                                    <td>{user.email || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default DebugUsersPage;
