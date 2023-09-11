const LazyLoad = ({ isLoading, children }) => {
    return isLoading ? (
        <div className="relative">
            {children}
            <div className="rounded-md absolute inset-0 bg-slate-300 animate-pulse"></div>
        </div>
    ) : (
        children
    );
};

export default LazyLoad;
