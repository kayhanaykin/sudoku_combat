import { API_BASE_URL } from './api';
import { getCookie } from './api';


export const getUserDetails = async () => {
  const url = `${API_BASE_URL}/api/v1/user/me/`;

  try
  {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
    });

    if (!response.ok)
        throw new Error(`User fetch failed: ${response.status}`);

    const data = await response.json();

    return {
      id: data.id,
      username: data.username,
      nickname: data.display_name || data.username, 
      email: data.email || "No email info", 

      avatar: data.avatar ? `${API_BASE_URL}${data.avatar}` : null,
      isOnline: data.is_online,
      isProfileComplete: data.is_profile_complete
    };

  }
  catch (error)
  {
    console.error("Network error user details:", error);
    return null;
  }
};

