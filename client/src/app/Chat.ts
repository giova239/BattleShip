// A message has some text content, a list of tags and a timestamp
//
export interface Chat {
    user1: string,
    user2: string,
    messages: string[]
}

// User defined type guard
// Type checking cannot be performed during the execution (we don't have the Message interface anyway)
// but we can create a function to check if the supplied parameter is compatible with a given type
//
// A better approach is to use JSON schema
//
export function isChat(arg: any): arg is Chat {
    return arg && arg.user1 && typeof(arg.user1) === 'string' &&
           arg.user2 && typeof(arg.user2) === 'string' &&
           arg.messages && Array.isArray(arg.messages)
}

