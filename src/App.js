import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ScrollToTop } from './components';
import { UserAuth } from './contexts/AuthContext';
import updateActiveStatus from './lib/api/updateActiveStatus';
import { ProtectedRoute, publicRoutes as routes } from './routes';

function App() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const { user } = UserAuth();

    useEffect(() => {
        const updateOnlineStatus = () => {
            setIsOnline(navigator.onLine);
            updateActiveStatus({ email: user?.email, online: navigator.onLine });
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    return (
        <div className="App h-screen">
            {isOnline ? (
                <Routes>
                    {routes.map((route) => {
                        const Layout = route.layout;
                        const Component = route.component;

                        return route.protected ? (
                            <Route
                                key={route.id}
                                path={route.path}
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <ScrollToTop>
                                                <Component />
                                            </ScrollToTop>
                                        </Layout>
                                    </ProtectedRoute>
                                }
                            />
                        ) : (
                            <Route
                                key={route.id}
                                path={route.path}
                                element={
                                    <Layout>
                                        <ScrollToTop>
                                            <Component />
                                        </ScrollToTop>
                                    </Layout>
                                }
                            />
                        );
                    })}
                </Routes>
            ) : (
                <div className="h-full text-2xl flexCenter flex-col text-center">
                    You have been disconnected to Taskbox. <br /> Please check your network!
                </div>
            )}
        </div>
    );
}

export default App;
