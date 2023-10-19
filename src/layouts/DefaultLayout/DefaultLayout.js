import { Sidebar } from '../components';
import './progress-overrides.scss';

function DefaultLayout({ children }) {
    return (
        <div className="flex h-full">
            <div className="hidden md:block">
                <aside className="h-full">
                    <nav className="h-full border-r borer-slate-200">
                        <Sidebar />
                    </nav>
                </aside>
            </div>
            <div className="flex-1 bg-slate-100">{children}</div>
        </div>
    );
}

export default DefaultLayout;
