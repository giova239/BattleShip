
import mongoose = require('mongoose');

export interface Game extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    user1: mongoose.Schema.Types.ObjectId,
    user2: mongoose.Schema.Types.ObjectId,
    board1: boolean[][],
    board2: boolean[][],
    moves: string[],
    isUser1Connected: boolean,
    isUser2Connected: boolean
}

var gameSchema = new mongoose.Schema( {
    user1: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    user2: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    board1: [[{
        type: mongoose.SchemaTypes.Boolean
    }]],
    board2: [[{
        type: mongoose.SchemaTypes.Boolean
    }]],
    moves: [{
        type: mongoose.SchemaTypes.String
    }],
    isUser1Connected: {
        type: mongoose.SchemaTypes.Boolean,
        default: false
    },
    isUser2Connected: {
        type: mongoose.SchemaTypes.Boolean,
        default: false
    },
})

// Here we add some methods to the chat Schema

//TODO

export function getSchema() { return gameSchema; }

// Mongoose Model
var gameModel;  // This is not exposed outside the model
export function getModel() : mongoose.Model< Game >  { // Return Model as singleton
    if( !gameModel ) {
        gameModel = mongoose.model('Game', getSchema() )
    }
    return gameModel;
}

export function newGame( data ): Game {
    var _gamemodel = getModel();
    var game = new _gamemodel( data );

    return game;
}