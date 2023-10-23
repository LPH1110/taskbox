import React from 'react';
import Header from './Header';

function HomeLayout({ children }) {
    return (
        <section className="grid grid-cols-12 h-screen w-full">
            <Header />
            <section className="mt-20 md:m-0 col-span-12">{children}</section>
        </section>
    );
}

export default HomeLayout;
