import { API_BASE_URL, getCookie } from './api';

export const getUserDetails = async () => {
  const url = `${API_BASE_URL}/api/user/profile/edit/`;
  const infoUrl = `${API_BASE_URL}/api/v1/user/me/`; 

  try
  {
    const response = await fetch(infoUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
    });

    if (!response.ok)
      throw new Error(`Fetch failed: ${response.status}`);

    const data = await response.json();

    return {
      id: data.id,
      username: data.username,
      nickname: data.display_name || data.username,
      email: data.email,
      avatar: data.avatar ? `${API_BASE_URL}${data.avatar}` : null,
      isOnline: data.is_online,
    };
  }
  catch (error)
  {
    console.error("User details error:", error);
    return null;
  }
};

export const updateUserAvatar = async (file) => {
  const url = `${API_BASE_URL}/api/user/profile/edit/`; 

  const formData = new FormData();
  formData.append('avatar', file);

  try
  {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: formData,
    });

    if (!response.ok)
    {
        const errText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();

    if (data.status === 'success')
    {
      return {
        success: true,
        avatar: `${API_BASE_URL}${data.new_avatar_url}`
      };
    }
    return { success: false };
  }
  catch (error)
  {
    console.error("Avatar upload error:", error);
    throw error;
  }
};