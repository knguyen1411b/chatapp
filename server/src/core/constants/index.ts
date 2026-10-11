export const COOKIE_KEYS = {
    ACCESS_TOKEN: 'chat_access',
    REFRESH_TOKEN: 'chat_refresh'
} as const

export const TOKEN_EXPIRY = {
    ACCESS_TOKEN_MS: 15 * 60 * 1000, // 15 mins
    REFRESH_TOKEN_DAYS: 7,
    REFRESH_TOKEN_MS: 7 * 24 * 60 * 60 * 1000,
    PASSWORD_RESET_MS: 30 * 60 * 1000 // 30 mins
} as const

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 50,
    MIN_PAGE_SIZE: 1,
    MAX_PAGE_SIZE: 100
} as const

export const SOCKET_EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    PRESENCE_SET: 'presence:set',
    PRESENCE_UPDATE: 'presence:update',
    CONVERSATION_JOIN: 'conversation:join',
    CONVERSATION_ERROR: 'conversation:error',
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',
    TYPING_UPDATE: 'typing:update',
    MESSAGE_NEW: 'message:new',
    MESSAGE_UPDATED: 'message:updated'
} as const
