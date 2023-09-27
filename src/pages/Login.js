import { Stack, Typography } from '@mui/material'
import { green, red } from '@mui/material/colors'
import { gapi } from 'gapi-script'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import fptlogo from '../images/FPT-logo.webp'
import googleIcon from '../images/google.png'
import { useGoogleAuth } from '../utils/googleAuth'
import request from '../utils/request'
import { ClipLoader } from 'react-spinners';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, isSignedIn, googleUser, signOut, isInitialized } = useGoogleAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  console.log(gapi);

  useEffect(() => {
    if(isInitialized){
      if (isSignedIn) {
        //setIsLoading(true)
        navigate('/lecturer')
        // request.post(`Token/Login?email=${googleUser?.profileObj?.email}`)
        //   .then(res => {
        //     if (res.status === 200) {
        //       const accessKey = res.data.access_token
        //       request.get(`UserAuthen/email/${googleUser?.profileObj?.email}`, {
        //         headers: {Authorization: `Bearer ${accessKey}`}
        //       }).then(res => {
        //         setIsLoading(false)
        //         if (res.data.RoleIDs.includes('LC')) {
        //           navigate('/lecturer')
        //         }
        //         else if (res.data.RoleIDs.includes('DMA')) {
        //           navigate('/manager')
        //         }
        //         else {
        //           navigate('/admin')
        //         }
        //       }).catch(err => {
        //         signOut();
        //         if (err?.response?.data?.status === 404) {
        //           setError('This email can not be signed in.')
        //         }
        //         else {
        //           setError('Fail to sign in.')
        //         }
        //         setIsLoading(false)
        //       })
        //     }
        //   })
        //   .catch(err => {
        //     signOut();
        //     if (err?.response?.data?.status === 404) {
        //       setError('This email can not be signed in.')
        //     }
        //     else {
        //       setError('Fail to sign in.')
        //     }
        //     setIsLoading(false)
        //   })
      }
      // else{
      //   navigate('/')
      // }
    }
    
  }, [isSignedIn, googleUser, signOut, navigate, isInitialized])

  return (
    <Stack height='100vh' bgcolor='lightblue'
      justifyContent='center' alignItems='center'
      sx={{ background: `linear-gradient(90deg, ${green[600]} 0%, ${green[500]} 100%)`}}
    >
      <Stack height='60vh' width='70vw' bgcolor='white'
        direction='row' py={4} borderRadius='12px'
        boxShadow="rgba(0, 0, 0, 0.24) 0px 3px 8px"
      >
        {/**left side */}
        <Stack flex={1} justifyContent='center'
          gap={2} px={4} direction='column'>
          <Stack alignItems='center'>
            <img src={fptlogo} alt="" width='140px' />
          </Stack>
          <Typography textAlign='center' variant='h4'
            letterSpacing='1px' color={green[600]}
            fontWeight='500'
            sx={{wordSpacing: '4px'}}>
            FPT Lecturer Scheduler
          </Typography>
        </Stack>

        {/**right side */}
        <Stack flex={1} justifyContent='center'
          gap={4} alignItems='center'
          borderLeft='2px solid lightgray'
          px={4}>
          <Typography textAlign='center' variant='h5'>
            Sign In
          </Typography>
          {
            isLoading ? (
              <Stack bgcolor='#4285f4' width='240px' height='40px'
                alignItems='center' justifyContent='center'>
                <ClipLoader size={30} color='white'/>
              </Stack>
            ) : (
              <Stack>
                <Stack bgcolor='#4285f4' width='240px' height='40px'
                  direction='row' alignItems='center'
                  justifyContent='flex-start'
                  pl='2px' gap={1.2}
                  sx={{
                    transition: 'all 0.2s linear',
                    '&:hover': {
                      bgcolor: '#1565c0',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={signIn}
                >
                  <Stack bgcolor='white' height='36px'
                    width='36px' justifyContent='center'
                    alignItems='center'>
                    <img src={googleIcon} alt="" width='24px' />
                  </Stack>
                  <Typography color='white'>Sign in email @fpt.edu.vn</Typography>
                </Stack>
                {error && <Typography textAlign='center' mt={1} variant='subtitle1' color={red[600]}>
                  *{error}</Typography>}
              </Stack>
            )
          }
        </Stack>
      </Stack>
    </Stack>
  )
}

export default Login