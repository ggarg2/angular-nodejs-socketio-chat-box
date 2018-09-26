import {User} from './user';
import {Action} from './action';

export interface Message {
    id?: number;
    from?: User;
    content?: any;
    action?: any;
    to?: User;
    isNew?: boolean;
    isTyping?: boolean;
}
