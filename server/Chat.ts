
import mongoose = require('mongoose');

export interface Chat extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId,
    user1: mongoose.Schema.Types.ObjectId,
    user2: mongoose.Schema.Types.ObjectId,
    messages: {
        isFromUser1: boolean,
        date: Date
        text: string,
    }[]
}

var chatSchema = new mongoose.Schema( {
    user1: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    user2: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    messages: [{
        isFromUser1:{
            type: mongoose.SchemaTypes.Boolean,
            required: true
        },
        date:{
            type: mongoose.SchemaTypes.Date,
            required: false,
            immutable: true,
            default: () => Date.now()
        },
        text:{
            type: mongoose.SchemaTypes.String,
            required: true
        }
    }]
})

// Here we add some methods to the chat Schema

//TODO

export function getSchema() { return chatSchema; }

// Mongoose Model
var chatModel;  // This is not exposed outside the model
export function getModel() : mongoose.Model< Chat >  { // Return Model as singleton
    if( !chatModel ) {
        chatModel = mongoose.model('Chat', getSchema() )
    }
    return chatModel;
}

export function newChat( data ): Chat {
    var _chatmodel = getModel();
    var chat = new _chatmodel( data );

    return chat;
}