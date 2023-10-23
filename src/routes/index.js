import { v4 as uuidv4 } from 'uuid';
import { DefaultLayout, HomeLayout, WrapperLayout } from '~/layouts';
import {
    BoardDetail,
    ForgotPassword,
    Home,
    Inbox,
    Issues,
    NotFound,
    Pricing,
    Profile,
    Signin,
    Signup,
    UndevelopedSite,
    Workspaces,
} from '~/pages';
import ProtectedRoute from './ProtectedRoute';

const publicRoutes = [
    { id: uuidv4(), protected: false, path: '/', component: Home, layout: HomeLayout },
    { id: uuidv4(), protected: true, path: '/boards/:title', component: BoardDetail, layout: DefaultLayout },
    { id: uuidv4(), protected: true, path: '/workspaces', component: Workspaces, layout: DefaultLayout },
    { id: uuidv4(), protected: true, path: '/overview', component: UndevelopedSite, layout: DefaultLayout },
    { id: uuidv4(), protected: true, path: '/inbox', component: Inbox, layout: DefaultLayout },
    { id: uuidv4(), protected: true, path: '/meeting', component: UndevelopedSite, layout: DefaultLayout },
    { id: uuidv4(), protected: true, path: '/issues', component: Issues, layout: DefaultLayout },
    { id: uuidv4(), protected: false, path: '/pricing', component: Pricing, layout: HomeLayout },
    { id: uuidv4(), protected: false, path: '/signin', component: Signin, layout: WrapperLayout },
    { id: uuidv4(), protected: false, path: '/signup', component: Signup, layout: WrapperLayout },
    { id: uuidv4(), protected: false, path: '/forgot-password', component: ForgotPassword, layout: WrapperLayout },
    { id: uuidv4(), protected: true, path: '/profile', component: UndevelopedSite, layout: HomeLayout },
    { id: uuidv4(), protected: true, path: '/not-found', component: NotFound, layout: DefaultLayout },
];

export { ProtectedRoute, publicRoutes };
