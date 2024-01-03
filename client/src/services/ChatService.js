import { io } from "socket.io-client";


const getUserToken = async () => {
  const token = localStorage.getItem("token");
  return token;
};

export const initiateSocketConnection = async () => {
  const token = await getUserToken();

  const socket = io('', {
    auth: {
      token,
    },
  });

  return socket;
};

let socket;

export const connectToSocket = async () => {
  socket = await initiateSocketConnection();
  return socket;
};

const createHeader = async () => {
  const token = await getUserToken();

  const payloadHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  return payloadHeader;
};

export const handleRequest = async (url, method, data) => {
  const header = await createHeader();

  try {
    const response = await fetch(url, {
      method,
      headers: header.headers,
      body: data && JSON.stringify(data),
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      alert('Session expired. Please log in again.');

      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(error);
  }
};

export const getAllUsers = async () => {
  return handleRequest(`/user`, 'GET');
};

// export const getUser = async (userId) => {
//   return handleRequest(`/user/${userId}`, 'GET');
// };

export const getUsers = async (users) => {
  return handleRequest(`/user/users`, 'GET', users);
};

// export const getChatRooms = async (userId) => {
//   return handleRequest(`/room/${userId}`, 'GET');
// };

// export const getChatRoomOfUsers = async (firstUserId, secondUserId) => {
//   return handleRequest(`/room/${firstUserId}/${secondUserId}`, 'GET');
// };

export const createChatRoom = async (members) => {
  return handleRequest(`/room`, 'POST', members);
};

export const getMessagesOfChatRoom = async (chatRoomId) => {
  return handleRequest(`/message/room/${chatRoomId}`, 'GET');
};

export const getPrivateMessages = async (senderId, receiverId) => {
  return handleRequest(`/message/user/${senderId}/${receiverId}`, 'GET');
};

export const getAllChatRoomUsers = async (chatRoomId) => {
  return handleRequest(`/chat-room/${chatRoomId}/users`, 'GET');
};

export const sendMessage = async (messageBody) => {
  return handleRequest(`/message`, 'POST', messageBody);
};

export const joinChatRoom = async (roomId, userId) => {
  return handleRequest(`/chat-room/${roomId}/join/${userId}`, 'POST');
};