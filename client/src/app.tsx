import createCache from '@emotion/cache';
import { CacheProvider, ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { auth } from './api/auth';
import { Error404 } from './components/error404';
import { demoMode } from './config';
import { Advanced } from './modules/advanced';
import { Notification } from './modules/notification/notification';
import { RecipeSearch } from './modules/recipe/search/recipeSearch';
import { Recipe } from './modules/recipe/view/recipe';
import { ShoppingList } from './modules/shoppingList/shoppingList';
import { Nav } from './nav';
import { SignIn } from './signIn';
import { store } from './store';
import { theme } from './theme';

import './app.css';

const emotionCache = createCache({
    key: 'app',
    stylisPlugins: [],
});
emotionCache.compat = true;

const Main = styled.main`
    position: relative;
    flex: 1 1 auto;
    padding: 48px;
    overflow-y: auto;
    scrollbar-gutter: stable;

    @media (max-width: 850px) {
        padding: 24px;
    }

    @media print {
        overflow-y: visible;
        padding: 0;
    }
`;

function Content() {
    const [authenticated, setAuthenticated] = useState(auth.authenticated);

    useEffect(() => {
        return auth.authenticatedEvents.subscribe(setAuthenticated);
    }, []);

    if (!authenticated && !demoMode) {
        return <SignIn />;
    }

    return (
        <>
            <Nav />

            <Main>
                <Routes>
                    <Route path="/" element={<Navigate to="/recipes" />} />
                    <Route path="recipes" element={<RecipeSearch />} />
                    <Route path="recipes/:id" element={<Recipe />} />
                    <Route path="shopping-list" element={<ShoppingList />} />
                    <Route path="advanced" element={<Advanced />} />
                    <Route path="*" element={<Error404 />} />
                </Routes>
            </Main>
        </>
    );
}

export function App(): JSX.Element {
    return (
        <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
                <StoreProvider store={store}>
                    <Router basename={process.env.PUBLIC_PATH}>
                        <Content />

                        <Notification />
                    </Router>
                </StoreProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}
