import React from 'react'
import {Navigate, Outlet} from 'react-router-dom'


const useAuth=()=>{
    const user=localStorage.getItem('user')
    return user ? true : false
}


const ProtectedRoutes=(props) =>{
    const auth=useAuth()
    return auth?<Outlet/>: <Navigate to="/login"/>
}


export default ProtectedRoutes;