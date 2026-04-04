import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

// --- STYLED COMPONENTS ---

const PageContainer = styled.div`
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    font-family: inherit;
    color: var(--text-dark);
`;

const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    border-bottom: 2px solid var(--primary);
    padding-bottom: 1rem;
`;

const Title = styled.h1`
    font-size: 2rem;
    color: var(--primary);
    margin: 0;
`;

const LogoutButton = styled.button`
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
`;

const TableWrapper = styled.div`
    background: var(--secondary);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    text-align: left;
`;

const Th = styled.th`
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #eee;
    background-color: #f8f9fa;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
`;

const Td = styled.td`
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #eee;
`;

const TableRow = styled.tr`
    &:hover {
        background-color: #fcfcfc;
    }
`;

const MessageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.$isError ? '#dc2626' : 'inherit'};
`;

const StatusBadge = styled.span`
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    background-color: ${props => props.$isOnline ? '#e6ffec' : '#fee2e2'};
    color: ${props => props.$isOnline ? '#059669' : '#dc2626'};
`;

// --- COMPONENT DEFINITION ---

const DebugUsersPage = () => {
    const { user, logout, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading)
            return;

        if (!user || !user.is_superuser)
        {
            window.location.href = '/';
            return;
        }

        const fetchUsers = async () => {
            try
            {
                const response = await fetch('/api/v1/user/debug-users/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok)
                {
                    const data = await response.json();
                    setUsers(data);
                }
                else
                    setError('Failed to fetch users');
            }
            catch (err)
            {
                setError('An error occurred while fetching users');
                console.error(err);
            }
            finally
            {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [authLoading, user]);

    const handleLogout = () => {
        logout();
    };

    if (loading)
        return <MessageContainer>Loading users...</MessageContainer>;

    if (error)
        return <MessageContainer $isError>{error}</MessageContainer>;

    return (
        <PageContainer>
            <Header>
                <Title>Debug Users</Title>
                <LogoutButton className="btn btn-primary" onClick={handleLogout}>
                    Logout
                </LogoutButton>
            </Header>
            <main>
                <TableWrapper>
                    <Table>
                        <thead>
                            <tr>
                                <Th>ID</Th>
                                <Th>Username</Th>
                                <Th>Display Name</Th>
                                <Th>Email</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((userData) => (
                                <TableRow key={userData.id}>
                                    <Td>{userData.id}</Td>
                                    <Td>{userData.username}</Td>
                                    <Td>{userData.display_name || '-'}</Td>
                                    <Td>{userData.email || 'N/A'}</Td>
                                </TableRow>
                            ))}
                        </tbody>
                    </Table>
                </TableWrapper>
            </main>
        </PageContainer>
    );
};

export default DebugUsersPage;