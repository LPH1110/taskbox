import React from 'react';
import Header from './Header';
import Footer from './Footer';

function HomeLayout({ children }) {
    return (
        <section className="grid grid-cols-12 h-screen w-full">
            <Header />
            <section className="mt-20 col-span-12">{children}</section>
            <Footer />
        </section>
    );
}

export default HomeLayout;
