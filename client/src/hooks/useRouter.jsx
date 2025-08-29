import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';

const RouterContext = createContext();

export const useRouter = () => useContext(RouterContext);

const isBrowser = typeof window !== 'undefined' && !!window;

const normalizePath = (p = '') => {
    const raw = isBrowser ? String(p || window.location.pathname || '') : String(p || '');
    return raw.replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '');
};

const splitPath = (p = '') => {
    const normalized = normalizePath(p);
    return normalized === '' ? [] : normalized.split('/');
};

export const CustomRouterProvider = ({ children }) => {
    const initialPath = isBrowser ? window.location.pathname : '/';
    const initialState = isBrowser ? window.history.state : null;

    const [route, setRoute] = useState(initialPath);
    const [locationState, setLocationState] = useState(initialState);

    useEffect(() => {
        if (!isBrowser) return undefined;

        const handlePopState = (event) => {
            setRoute(window.location.pathname);
            setLocationState(event.state ?? null);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = useCallback((path, state = {}, { replace = false } = {}) => {
        if (!isBrowser) return;
        const finalPath = String(path || '/');
        if (replace) {
            window.history.replaceState(state, '', finalPath);
        } else {
            window.history.pushState(state, '', finalPath);
        }
        setRoute(finalPath);
        setLocationState(state ?? null);
    }, []);

    const getParams = useCallback((pattern, path = route) => {
        const patternParts = splitPath(pattern);
        const pathParts = splitPath(path);
        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            const p = patternParts[i];
            if (p && p.startsWith(':')) {
                const key = p.slice(1);
                params[key] = pathParts[i] ?? undefined;
            }
        }
        return params;
    }, [route]);

    const matchRoute = useCallback((pattern, path = route) => {
        const patternParts = splitPath(pattern);
        const pathParts = splitPath(path);

        if (patternParts.length !== pathParts.length) return false;
        for (let i = 0; i < patternParts.length; i++) {
            const pp = patternParts[i];
            const ap = pathParts[i];
            if (!pp) continue;
            if (pp.startsWith(':')) continue; // param -> accept any
            if (pp !== ap) return false;
        }
        return true;
    }, [route]);

    const contextValue = useMemo(() => ({
        route,
        navigate,
        getParams,
        matchRoute,
        locationState,
    }), [route, navigate, getParams, matchRoute, locationState]);

    return (
        <RouterContext.Provider value={contextValue}>
            {children}
        </RouterContext.Provider>
    );
};
