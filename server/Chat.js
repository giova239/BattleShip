"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var chatSchema = new mongoose.Schema({
    user1: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    user2: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    messages: [{
            isFromUser1: {
                type: mongoose.SchemaTypes.Boolean,
                required: true
            },
            read: {
                type: mongoose.SchemaTypes.Boolean,
                required: true
            },
            date: {
                type: mongoose.SchemaTypes.Date,
                required: false,
                immutable: true,
                default: () => Date.now()
            },
            text: {
                type: mongoose.SchemaTypes.String,
                required: true
            }
        }]
});
// Here we add some methods to the chat Schema
//TODO
function getSchema() { return chatSchema; }
exports.getSchema = getSchema;
// Mongoose Model
var chatModel; // This is not exposed outside the model
function getModel() {
    if (!chatModel) {
        chatModel = mongoose.model('Chat', getSchema());
    }
    return chatModel;
}
exports.getModel = getModel;
function newChat(data) {
    var _chatmodel = getModel();
    var chat = new _chatmodel(data);
    return chat;
}
exports.newChat = newChat;
//# sourceMappingURL=Chat.js.map