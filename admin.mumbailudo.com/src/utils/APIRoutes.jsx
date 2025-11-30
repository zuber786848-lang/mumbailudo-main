export const host = "http://localhost:3000";

// export const baseUrl = "http://localhost:8080/api";
// export const socketUrl = "ws://localhost:8080";

// Production
export const baseUrl = "https://api.mumbailudo.com/api";
export const socketUrl = "wss://api.mumbailudo.com";

export const loginRoute = `${host}/api/auth/login`;
export const registerRoute = `${host}/api/auth/register`;
export const logoutRoute = `${host}/api/auth/logout`;
export const allUsersRoute = `${host}/api/auth/allusers`;
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getmsg`;
export const setAvatarRoute = `${host}/api/auth/setavatar`;

export const createGameRoute = `${host}/api/game/game`;
export const openGameRoute = `${host}/api/game/game`;
export const deleteGameRoute = `${host}/api/game/game`;
