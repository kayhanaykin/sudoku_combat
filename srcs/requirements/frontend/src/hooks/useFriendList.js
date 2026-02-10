import { useState, useEffect, useCallback } from 'react';

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '')
  {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++)
    {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '='))
      {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const useFriendList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const API_URL = '/api/v1/user/friends/';

  const fetchFriends = useCallback(async () => {
    try
    {
      setLoading(true);
      const response = await fetch(API_URL);
      if (response.ok)
      {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.friends || []);
        setFriends(list);
      }
    }
    catch (err)
    {
      console.error("Fetch error:", err);
    }
    finally
    {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const performAction = async (payload) => {
    setError(null);
    setSuccessMsg(null);
    
    const csrftoken = getCookie('csrftoken'); 

    try
    {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok || response.status === 201)
      {
        setSuccessMsg(result.message || 'Success');
        fetchFriends();
        setTimeout(() => setSuccessMsg(null), 3000);
        return true;
      }
      else
      {
        setError(result.error || result.message || 'Operation Failed');
        setTimeout(() => setError(null), 3000);
        return false;
      }
    }
    catch (err)
    {
      setError('Network Error');
      return false;
    }
  };

  return {
    friends,
    loading,
    error,
    successMsg,
    addFriend: (username) => performAction({ action: 'send', target_username: username }),
    approveFriend: (relId) => performAction({ action: 'approve', rel_id: relId }),
    removeFriend: (relId) => performAction({ action: 'remove', rel_id: relId }),
    refresh: fetchFriends
  };
};

export default useFriendList;