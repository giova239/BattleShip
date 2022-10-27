"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var gameSchema = new mongoose.Schema({
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
});
// Here we add some methods to the chat Schema
//TODO
function getSchema() { return gameSchema; }
exports.getSchema = getSchema;
// Mongoose Model
var gameModel; // This is not exposed outside the model
function getModel() {
    if (!gameModel) {
        gameModel = mongoose.model('Game', getSchema());
    }
    return gameModel;
}
exports.getModel = getModel;
function newGame(data) {
    var _gamemodel = getModel();
    var game = new _gamemodel(data);
    return game;
}
exports.newGame = newGame;
//# sourceMappingURL=Game.js.map