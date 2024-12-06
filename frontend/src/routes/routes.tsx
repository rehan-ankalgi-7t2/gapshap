import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import App from '../App';
import Login from '../pages/Login';
import Notfound from '../pages/Notfound';

const adminRouter = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />
    },
    {
        path: "/about",
        element: <HomePage />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/app",
        element: <App />,
        children: [

        ]
    },
    {
        path: '*',
        element: <Notfound/>
    }
])

export default adminRouter;