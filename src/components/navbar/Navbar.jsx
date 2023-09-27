import React, { useEffect, useState } from 'react';
import { Reorder, AccountBox, Logout, Key } from '@mui/icons-material';
import { Avatar, Box, Divider, Menu, MenuItem, Snackbar, Stack, Typography } from '@mui/material'
import { useGoogleAuth } from '../../utils/googleAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import request from '../../utils/request';

const Navbar = ({ isExtend, setIsExtend }) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const location = useLocation();
  const  navigate = useNavigate();
  const { signOut, googleUser } = useGoogleAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [isCopied, setIsCopied] = useState(false)
  const [key, setKey] = useState('')
  
  useEffect(() => {
    if(googleUser){
      request.post(`Token/Login?email=${googleUser?.profileObj?.email}`)
      .then(res => {
        if(res.status === 200 || res.status === 201){
          setKey(`${res.data.refresh_token}`)
        }
      })
      .catch(err => {alert('Fail to get key')})
    }
  }, [googleUser])

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async() => {
    setAnchorEl(null);
    await signOut();
    navigate('/')
    localStorage.removeItem('web-user')
    request.delete(`Token/DeleteRefreshToken/${key}`)
  }

  const handleCopyKey = () => {
    setIsCopied(true);
    setAnchorEl(null);
    navigator.clipboard.writeText(key)
  }

  const goToProfile = () => {
    setAnchorEl(null)
    const url = location.pathname
    if(url.startsWith('/lecturer')){
      navigate('/lecturer/profile')
    }
    else if(url.startsWith('/manager')){
      navigate('/manager/profile')
    }
    else{
      navigate('/admin/profile')
    }
  }

  return (
    <Box bgcolor='white' px={4} py={1}
      sx={{
        position: 'sticky',
        top: '0',
        borderBottom: '1px solid lightgray'
      }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Stack direction='row' alignItems='center'>
          <Reorder
            sx={{
              mr: '36px',
              '&:hover': {
                color: 'success.main',
                cursor: 'pointer'
              }
            }}
            onClick={() => setIsExtend(!isExtend)}
          />
          <Stack bgcolor='success.main' color='white'
            width='48px' height='48px'
            alignItems='center' justifyContent='center'
            borderRadius='20%'>
            <Typography fontWeight='bold'>FLS</Typography>
          </Stack>
          <Typography variant='h5' ml='4px'>FPT Lecturer Scheduler</Typography>
        </Stack>

        <Stack direction='row' alignItems='center' gap={4}>
          <Typography>
            <span style={{fontWeight: 500}}> 
            {location.pathname.startsWith('/lecturer') && 'Lecturer'}
            {location.pathname.startsWith('/manager') && 'Department Manager'}
            {location.pathname.startsWith('/admin') && 'Admin'}:</span> {googleUser?.profileObj?.email}
          </Typography>
          <Avatar
            src={googleUser && googleUser?.profileObj?.imageUrl}
            sx={{
              '&:hover': {
                cursor: 'pointer',
                boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px'
              }
            }}
            onClick={handleClick}
          />
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={goToProfile}>
              <AccountBox sx={{ mr: 1 }} /> Profile
            </MenuItem>
            {account?.RoleIDs && account.RoleIDs.includes('AD') && 
            key && <MenuItem onClick={handleCopyKey}>
              <Key sx={{ mr: 1 }} /> Token Key
            </MenuItem>}
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <Logout sx={{ mr: 1, color: 'gray' }} />  Logout
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
      <Snackbar open={isCopied}
        autoHideDuration={2000}
        onClose={() => setIsCopied(false)}
        message="Token Key is copied."
      />
    </Box>
  )
}

export default Navbar