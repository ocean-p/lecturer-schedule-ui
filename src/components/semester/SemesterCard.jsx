import { Stack, Typography } from '@mui/material'
import { red, grey, blue } from '@mui/material/colors';
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

const SemesterCard = ({semester}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if(!semester){
    return;
  }

  const toSemesterDetail = () => {
    if(location.pathname.startsWith('/lecturer')){
      navigate(`/lecturer/semester/${semester.Id}`)
    }
    else{
      navigate(`/manager/semester/${semester.Id}`)
    }
  }

  return (
    <Stack height='200px' bgcolor='white' minWidth='220px'
      borderRadius='12px' boxShadow= 'rgba(0, 0, 0, 0.24) 0px 3px 8px'
      sx={{
        '&:hover':{
          scale: '1.1', cursor: 'pointer', transition: 'all 0.2s linear'
        }}}
      onClick={toSemesterDetail}
    >
      <Stack flex={3} borderRadius='16px 16px 0 0'>
        <Stack alignItems='flex-end'>
          <Typography fontSize='14px' color='white' borderRadius='0 12px 0 0' p={0.5}
            bgcolor={semester.DateStatus === 'On Going' ? blue[700] : (semester.DateStatus === 'Close' ? grey[600] : red[600])}>
            {semester.DateStatus}
          </Typography>
        </Stack>
        <Stack alignItems='center' mt={1.5}>
         <Typography variant='h5' fontWeight={500} 
          color={semester.DateStatus === 'On Going' ? blue[700] : (semester.DateStatus === 'Close' ? grey[600] : red[600])}>
            {semester.Term}</Typography>
        </Stack>
      </Stack>
      <Stack flex={2} py={1} gap={1} alignItems='center' justifyContent='center'
        bgcolor={semester.DateStatus === 'On Going' ? blue[50] : (semester.DateStatus === 'Close' ? grey[100] : red[100])}
        borderRadius='0 0 12px 12px'
      >
        <Stack direction='row' gap={1}>
          <Typography fontWeight={500}>Start: </Typography>
          <Typography>{semester?.DateStartFormat.split('-').reverse().join('/')}</Typography>
        </Stack>
        <Stack direction='row' gap={1}>
          <Typography fontWeight={500}>End: </Typography>
          <Typography>{semester?.DateEndFormat.split('-').reverse().join('/')}</Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default SemesterCard