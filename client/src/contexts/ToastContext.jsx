import React, { useState, useRef, useCallback, useMemo, createContext, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';

const ToastDispatchContext = createContext(null);
const ToastStateContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastDispatchContext);
    if (ctx === null) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
};

const useToasts = () => {
    const ctx = useContext(ToastStateContext);
    if (ctx === null) throw new Error('useToasts must be used within a ToastProvider (ToastContainer should be rendered inside it)');
    return ctx;
};

export const ToastContainer = React.memo(function ToastContainer() {
    const toasts = useToasts();

    const portalRoot = typeof document !== 'undefined' ? document.getElementById('toast-root') : null;
    if (!portalRoot) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('ToastContainer: missing #toast-root element in DOM. Create <div id="toast-root"></div> in index.html');
        }
        return null;
    }
    return ReactDOM.createPortal(
        <div className="toast-container" aria-live="polite" aria-atomic="false">
            {toasts.map(t => (
                <div key={t.id} className={`toast ${t.type || 'info'}`} role="status" aria-label={t.type || 'info'}>
                    {t.message}
                </div>
            ))}
        </div>,
        portalRoot
    );
});

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef(new Map());

    const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = makeId();
        setToasts(prev => [...prev, { id, message, type }]);

        const timer = setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
            timersRef.current.delete(id);
        }, duration);

        timersRef.current.set(id, timer);
        return id;
    }, []);

    const hideToast = useCallback((id) => {
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        return () => {
            timersRef.current.forEach(timer => clearTimeout(timer));
            timersRef.current.clear();
        };
    }, []);

    const dispatchValue = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);
    const stateValue = useMemo(() => toasts, [toasts]);

    return (
        <ToastDispatchContext.Provider value={dispatchValue}>
            <ToastStateContext.Provider value={stateValue}>
                {children}
            </ToastStateContext.Provider>
        </ToastDispatchContext.Provider>
    );
};