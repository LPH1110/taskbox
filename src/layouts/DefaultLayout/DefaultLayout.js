import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components';
import './progress-overrides.scss';

function DefaultLayout({ children }) {
    return (
        <section className="flex min-h-screen">
            <section>
                <aside className="h-full">
                    <nav className="h-full border-r borer-slate-200">
                        <Sidebar />
                    </nav>
                </aside>
            </section>
            <section className="flex-1">{children}</section>
        </section>
    );
}

export default DefaultLayout;
