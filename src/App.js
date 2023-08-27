import React, { useEffect, useState } from 'react';
import { publicRoutes as routes, ProtectedRoute } from './routes';
import { Routes, Route } from 'react-router-dom';
import { ScrollToTop, Modal } from './components';

function App() {
    return (
        <div className="App min-h-screen">
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
        </div>
    );
}

export default App;
