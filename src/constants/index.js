import {
    ArrowPathRoundedSquareIcon,
    CalendarDaysIcon,
    ChatBubbleOvalLeftIcon,
    ClipboardDocumentIcon,
    Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'uuid';

export const colorThumbnails = [
    {
        uid: uuidv4(),
        thumbnailURL: 'https://trello.com/assets/707f35bc691220846678.svg',
    },
    {
        uid: uuidv4(),
        thumbnailURL: 'https://trello.com/assets/d106776cb297f000b1f4.svg',
    },
    {
        uid: uuidv4(),
        thumbnailURL: 'https://trello.com/assets/8ab3b35f3a786bb6cdac.svg',
    },
    {
        uid: uuidv4(),
        thumbnailURL: 'https://trello.com/assets/a7c521b94eb153008f2d.svg',
    },
    {
        uid: uuidv4(),
        thumbnailURL: 'https://trello.com/assets/aec98becb6d15a5fc95e.svg',
    },
];

export const columns = {
    'column-1': {
        id: 'column-1',
        title: 'Todo',
        taskIds: ['task-1', 'task-2', 'task-3'],
    },
};

export const tasks = {
    'task-1': {
        id: 'task-1',
        content: 'Doing homework',
        reference: 'Todo',
    },
    'task-2': {
        id: 'task-1',
        content: 'Take out the trash',
        reference: 'Todo',
    },
    'task-3': {
        id: 'task-1',
        content: 'Charge my phone',
        reference: 'Todo',
    },
};

export const menuItems = [
    {
        id: uuidv4(),
        title: 'Overview',
        icon: <Squares2X2Icon className="w-5 h-5" />,
        path: '/overview',
    },
    {
        id: uuidv4(),
        title: 'Workspaces',
        icon: <ClipboardDocumentIcon className="w-5 h-5" />,
        path: '/workspaces',
    },
    {
        id: uuidv4(),
        title: 'Inbox',
        icon: <ChatBubbleOvalLeftIcon className="w-5 h-5" />,
        path: '/inbox',
    },
    {
        id: uuidv4(),
        title: 'Meeting',
        icon: <CalendarDaysIcon className="w-5 h-5" />,
        path: '/meeting',
    },
    {
        id: uuidv4(),
        title: 'Issues',
        icon: <ArrowPathRoundedSquareIcon className="w-5 h-5" />,
        path: '/issues',
    },
];

export const columnOrder = ['column-1'];
