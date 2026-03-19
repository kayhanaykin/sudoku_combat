import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { device } from '../../src/utils/device';
import useFriendList from '../../src/hooks/useFriendList';
import AddFriendForm from '../molecules/AddFriendForm';
import FriendItem from '../molecules/FriendItem';

// STYLED COMPONENTS
const WidgetContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
    color: #374151;
`;

const WidgetHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid #f3f4f6;
    padding-bottom: 10px;
`;

const WidgetTitle = styled.span`
    font-size: 1.1rem;
    font-weight: 700;
    color: #15803d;
`;

const RefreshButton = styled.button`
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 1.2rem;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover
    {
        color: #4ade80;
    }
`;

const SearchForm = styled.form`
    margin-bottom: 12px;
`;

const SearchInputWrapper = styled.div`
    display: flex;
    gap: 6px;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 8px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.85rem;
    font-family: inherit;
    background: #f9fafb;
    color: #374151;
    outline: none;
    transition: all 0.2s;

    &:focus
    {
        border-color: #4ade80;
        background: #fff;
        box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.1);
    }
`;

const SearchButton = styled.button`
    padding: 8px 12px;
    background-color: #14532d;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.8rem;
    transition: background-color 0.2s;

    &:hover
    {
        background-color: #166534;
    }
`;

const StatusMessage = styled.div`
    padding: 10px;
    border-radius: 8px;
    text-align: center;
    font-size: 0.85rem;
    margin-bottom: 15px;
    font-weight: 500;
    
    background-color: ${props => props.$isError ? '#fef2f2' : '#f0fdf4'};
    color: ${props => props.$isError ? '#991b1b' : '#166534'};
`;

const FriendListScrollArea = styled.div`
    flex: 1;
    overflow-y: auto;
    padding-right: 5px;
    scrollbar-width: thin;

    &::-webkit-scrollbar
    {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb
    {
        background: #e5e7eb;
        border-radius: 10px;
    }
`;

const SectionTitle = styled.h5`
    font-size: 0.75rem;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    margin: 15px 0 8px 0;
`;

const EmptyMessage = styled.p`
    text-align: center;
    color: #9ca3af;
    margin-top: 30px;
    font-size: 0.9rem;
`;

// COMPONENT DEFINITION
const FriendListWidget = () =>
{
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    
    const {
        friends,
        loading,
        error,
        successMsg,
        addFriend,
        approveFriend,
        removeFriend,
        refresh
    } = useFriendList();

    const pendingRequests = friends.filter(f => f.status === 'pending');
    const activeFriends = friends.filter(f => f.status === 'accepted');

    const handleSearchProfile = (e) =>
    {
        e.preventDefault();
        
        if (searchInput.trim()) 
        {
            navigate(`/profile/${searchInput.trim()}`);
            setSearchInput('');
        }
    };

    return (
        <WidgetContainer>

            <WidgetHeader>
                <WidgetTitle>
                    Social Hub
                </WidgetTitle>
                <RefreshButton onClick={refresh} title="Refresh">
                    ⟳
                </RefreshButton>
            </WidgetHeader>

            <SearchForm onSubmit={handleSearchProfile}>
                <SearchInputWrapper>
                    <SearchInput
                        type="text"
                        placeholder="Search profile..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <SearchButton type="submit">
                        Go
                    </SearchButton>
                </SearchInputWrapper>
            </SearchForm>

            <AddFriendForm onAdd={addFriend} />

            {error !== null && error !== '' && 
            (
                <StatusMessage $isError={true}>
                    {error}
                </StatusMessage>
            )}

            {successMsg !== null && successMsg !== '' && 
            (
                <StatusMessage $isError={false}>
                    {successMsg}
                </StatusMessage>
            )}

            <FriendListScrollArea>
                {loading === true ? 
                (
                    <EmptyMessage>
                        Loading...
                    </EmptyMessage>
                ) : 
                (
                    <>
                        {pendingRequests.length > 0 && 
                        (
                            <>
                                <SectionTitle>
                                    Requests ({pendingRequests.length})
                                </SectionTitle>
                                {pendingRequests.map(req => (
                                    <FriendItem
                                        key={req.id}
                                        id={req.id}
                                        username={req.username}
                                        displayName={req.displayName}
                                        avatar={req.avatar}
                                        status="pending"
                                        onApprove={approveFriend}
                                        onRemove={removeFriend}
                                    />
                                ))}
                            </>
                        )}

                        <SectionTitle>
                            Friends ({activeFriends.length})
                        </SectionTitle>

                        {activeFriends.length === 0 && 
                        (
                            <EmptyMessage>
                                No active friends.
                            </EmptyMessage>
                        )}

                        {activeFriends.map(friend => (
                            <FriendItem
                                key={friend.id}
                                id={friend.id}
                                username={friend.username}
                                displayName={friend.displayName}
                                avatar={friend.avatar}
                                status="accepted"
                                isOnline={friend.is_online}
                                onRemove={removeFriend}
                            />
                        ))}
                    </>
                )}
            </FriendListScrollArea>

        </WidgetContainer>
    );
};

export default FriendListWidget;