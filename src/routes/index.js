import {
    ForgotPassword,
    Signin,
    Signup,
    Workspaces,
    BoardDetail,
    Home,
    Overview,
    Inbox,
    Meeting,
    Issues,
    Pricing,
    Profile,
} from '~/pages';
import { DefaultLayout, WrapperLayout, HomeLayout } from '~/layouts';
import { v4 as uuidv4 } from 'uuid';
import ProtectedRoute from './ProtectedRoute';

const publicRoutes = [
    { id: uuidv4(), protected: false, path: '/', component: Home, layout: HomeLayout },
    { id: uuidv4(), protected: true, path: '/boards/:id', component: BoardDetail, layout: DefaultLayout },
    { id: uuidv4(), protected: true, path: '/workspaces', component: Workspaces, layout: DefaultLayout },
    { id: uuidv4(), protected: true, path: '/overview', component: Overview, layout: DefaultLayout },
    { id: uuidv4(), protected: true, path: '/inbox', component: Inbox, layout: DefaultLayout },
    { id: uuidv4(), protected: true, path: '/meeting', component: Meeting, layout: DefaultLayout },
    { id: uuidv4(), protected: true, path: '/issues', component: Issues, layout: DefaultLayout },
    { id: uuidv4(), protected: false, path: '/pricing', component: Pricing, layout: HomeLayout },
    { id: uuidv4(), protected: false, path: '/signin', component: Signin, layout: WrapperLayout },
    { id: uuidv4(), protected: false, path: '/signup', component: Signup, layout: WrapperLayout },
    { id: uuidv4(), protected: false, path: '/forgot-password', component: ForgotPassword, layout: WrapperLayout },
    { id: uuidv4(), protected: true, path: '/profile', component: Profile, layout: HomeLayout },
];

export { publicRoutes, ProtectedRoute };
