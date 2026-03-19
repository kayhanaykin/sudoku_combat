import React, { useState } from 'react';
import styled from 'styled-components';
import { device } from '../../src/utils/device';
import ActionBtn from '../atoms/ActionBtn';

// STYLED COMPONENTS
const FormWrapper = styled.form`
    display: flex;
    gap: 8px;
    margin-bottom: 15px;

    @media ${device.mobileL}
    {
        gap: 6px;
        margin-bottom: 10px;
    }
`;

const InputField = styled.input`
    flex: 1;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
    color: #374151;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s;

    &:focus
    {
        border-color: #16d65d;
        background: #fff;
        box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.1);
    }

    @media ${device.mobileL}
    {
        padding: 8px 10px;
        font-size: 0.85rem;
    }
`;

const SubmitButton = styled(ActionBtn)`
    background: #16d65d;
    align-items: normal;
    color: white;
    border: none;
    padding: 3px 16px;
    border-radius: 8px;
    font-size: 1.4rem;
    box-shadow: none;
    cursor: pointer;

    &:hover:not(:disabled)
    {
        background: #22c55e;
        transform: translateY(-0.1vmin);
        box-shadow: 0.1vmin 0.3vmin 0.8vmin rgba(34, 197, 94, 0.3);
    }

    @media ${device.mobileL}
    {
        padding: 3px 12px;
        font-size: 1.1rem;
    }
`;

// COMPONENT DEFINITION
const AddFriendForm = ({ onAdd }) => 
{
    const [username, setUsername] = useState('');

    const handleSubmit = (e) => 
    {
        e.preventDefault();
        
        if (username.trim() === '')
            return;
        
        onAdd(username).then((success) => 
        {
            if (success === true)
                setUsername('');
        });
    };

    return (
        <FormWrapper onSubmit={handleSubmit}>
            
            <InputField
                type="text"
                placeholder="Username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            
            <SubmitButton>
                +
            </SubmitButton>

        </FormWrapper>
    );
};

export default AddFriendForm;