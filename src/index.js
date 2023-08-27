import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GlobalStyles } from './components';
import { StoreProvider } from './store';
import { AuthContextProvider } from './contexts/AuthContext';
import { ActivityContextProvider } from './contexts/ActivityContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <React.StrictMode>
    <AuthContextProvider>
        <ActivityContextProvider>
            <StoreProvider>
                <GlobalStyles>
                    <Router>
                        <App />
                    </Router>
                </GlobalStyles>
            </StoreProvider>
        </ActivityContextProvider>
    </AuthContextProvider>,
    // </React.StrictMode>,
);

reportWebVitals();
