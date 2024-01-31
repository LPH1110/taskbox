import { doc, updateDoc } from 'firebase/firestore';
import { db } from '~/firebase-config';

const addMessageToRoom = async ({ roomId, data }) => {
    try {
        const roomDoc = doc(db, 'rooms', roomId);
        await updateDoc(roomDoc, { messages: data });
    } catch (error) {
        console.error('Failed to add message to room', error);
    }
};

export default addMessageToRoom;
