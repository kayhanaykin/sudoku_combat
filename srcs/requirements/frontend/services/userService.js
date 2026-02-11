import { API_BASE_URL, getCookie } from './api';

export const getUserDetails = async () =>
{
    const response = await fetch(`${API_BASE_URL}/api/v1/user/me/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok)
    {
        throw new Error('Failed to fetch user details');
    }
    return await response.json();
};

// DİKKAT: Fonksiyon adı 'updateUserProfile' (Avatar değil)
export const updateUserProfile = async (formData) =>
{
    const url = `${API_BASE_URL}/api/v1/user/profile/edit/`;

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            // Content-Type YOK! (Otomatik Boundary için)
        },
        body: formData
    });

    if (!response.ok)
    {
        const errorText = await response.text();
        try
        {
            const jsonError = JSON.parse(errorText);
            throw new Error(jsonError.detail || jsonError.error || 'Update failed');
        }
        catch (e)
        {
            throw new Error(`Server Error: ${response.status}`);
        }
    }

    return await response.json();
};