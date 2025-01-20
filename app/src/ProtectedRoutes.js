import React from 'react'
import {Navigate, Outlet} from 'react-router-dom'
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

const ProtectedRoutes=(props) =>{
    const auth=useAuthUser() ? true : false
    return auth?<Outlet/>: <Navigate to="/login"/>
}


export default ProtectedRoutes;