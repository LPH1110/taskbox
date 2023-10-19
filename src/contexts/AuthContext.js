import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '~/firebase-config';
import { saveUser } from '~/lib/actions';
import updateActiveStatus from '~/lib/api/updateActiveStatus';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState({});

    useEffect(() => {
        const unsubsribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            console.log('User', currentUser);

            if (currentUser) {
                saveUser(currentUser);
                updateActiveStatus({ email: currentUser?.email, online: true });
                localStorage.setItem(currentUser.email, currentUser.uid);
            }
        });

        return () => unsubsribe();
    }, [user]);

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const signin = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const createUser = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const logOut = () => {
        console.log(user);
        updateActiveStatus({ email: user?.email, online: false });
        signOut(auth);
    };

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    return (
        <AuthContext.Provider value={{ resetPassword, signin, googleSignIn, logOut, user, createUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext);
};
