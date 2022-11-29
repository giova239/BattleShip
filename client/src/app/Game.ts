export interface Game {
    _id: any,
    user1: string,
    user2: string,
    board1: boolean[][],
    board2: boolean[][],
    moves: string[],
    isUser1Connected: boolean,
    isUser2Connected: boolean,
    isUser1Turn: boolean
}