import React from 'react'
import {useNavigate } from 'react-router-dom';
import { Avatar, Container, Paper, Box, TextField, Button } from "@mui/material"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import './styles/index.css';
// import axios from 'axios'


const Login=() =>{
    const signIn = useSignIn()
    const navigate=useNavigate()


    const login=(event)=>{
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const formData = {
            name: data.get('username'),
            password: data.get('password'),
        };

        // axios.post('/api/login', formData)
        //     .then((res)=>{
        //         if(res.status === 200){
        //             if(signIn({
        //                 auth: {
        //                     token: res.data.token,
        //                     type: 'Bearer'
        //                 },
        //                 refresh: res.data.refreshToken,
        //                 userState: res.data.authUserState
        //             })){ // Only if you are using refreshToken feature
        //                 // Redirect or do-something
        //                 navigate('/')

        //             }else {
        //                 //Throw error
        //             }
        //         }
        //     })
        // localStorage.setItem('user','')

        const c = signIn({
            auth: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.dMD3MLuHTiO-Qy9PvOoMchNM4CzFIgI7jKVrRtlqlM0',
                type: 'Bearer',
            },
            
            userState: {
                name: 'React User',
                uid: 123456
            }
        })
        navigate('/');
    }

    return (
        <Container maxWidth="xs">
            <Paper elevation={10} sx={{marginTop: 8, padding: 2}}>
                <Avatar sx = {{mx:'auto', bgcolor:'secondary.main', textAlign: 'center', marginBottom: 1}}>
                    <LockOutlinedIcon/>
                </Avatar>
                {/* <Typography component="h1" variant='h5' sx={{textAlign: 'center'}}>
                    Sign in
                </Typography> */}
                <Box component='form' onSubmit={login} sx={{textAlign: 'center'}}>
                    <TextField placeholder='Enter username' fullWidth required autoFocus sx={{mb:2}} name='username'></TextField>
                    <TextField placeholder='Enter password' fullWidth required sx={{mb:2}} type='password' name='password'></TextField>
                    <Button type='submit' variant='contained' fullWidth sx={{mt:1}}>Login</Button>
                </Box>
            </Paper>
        </Container>
    )
}


export {Login};