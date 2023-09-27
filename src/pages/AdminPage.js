import { Box, Stack } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Leftbar from '../components/leftbar/Leftbar'
import Navbar from '../components/navbar/Navbar'
import { useGoogleAuth } from '../utils/googleAuth'
import request from '../utils/request'
import {adminTabs} from '../utils/adminTab';

const AdminPage = () => {
  const navigate = useNavigate();
  const [isExtend, setIsExtend] = useState(true);
  const { isSignedIn, googleUser, isInitialized } = useGoogleAuth();
  const [data, setData] = useState(JSON.parse(localStorage.getItem('web-user')));

  useEffect(() => {
    if(isInitialized){
      if (isSignedIn) {
        request.get(`User/email/${googleUser.profileObj.email}`)
        .then(res => {
          if(res.data){
            if(res.data.RoleIDs.includes('AD')){
              setData(localStorage.setItem('web-user', JSON.stringify(res.data)))
            }else{navigate('/');}
          }
        }).catch(err => {navigate('/');})
      }
      else{navigate('/')}
    }
  }, [isSignedIn, googleUser, navigate, isInitialized])

  return (
    <Box height='100vh'>
      <Navbar isExtend={isExtend} setIsExtend={setIsExtend}/>
      <Stack direction='row'>
        {data !== null && 
          <>
            <Leftbar isExtend={isExtend} user={'admin'} tabs={adminTabs}/>
            <Outlet/>
          </>
        }
      </Stack>
    </Box>
  )
}

export default AdminPage