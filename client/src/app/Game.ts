export interface Game {
    _id: any,
    user1: string,
    user2: string,
    board1: boolean[][],
    board2: boolean[][],
    moves: string[],
    isUser1Connected: boolean,
    isUser2Connected: boolean
}

// User defined type guard
// Type checking cannot be performed during the execution (we don't have the Message interface anyway)
// but we can create a function to check if the supplied parameter is compatible with a given type
//
// A better approach is to use JSON schema
//
export function isChat(arg: any): arg is Game {
    return arg && arg.user1 && typeof(arg.user1) === 'string' &&
           arg.user2 && typeof(arg.user2) === 'string' &&
           arg.board1 && Array.isArray(arg.board1) &&
           arg.board2 && Array.isArray(arg.board2) &&
           arg.moves && Array.isArray(arg.moves)
}

