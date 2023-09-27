import { Stack, Typography } from '@mui/material'
import { blue } from '@mui/material/colors'
import React from 'react'

const Slot = ({ slot, isSwap, clickSlotToSwap }) => {
  const clickSlot = () => {
    if(isSwap){
      clickSlotToSwap(slot)
    }
  }

  return (
    <Stack flex={1} px={1} justifyContent='center'
      className={Object.values(slot).length === 0 ? 'timetable-slot is-sunday' : 
        (isSwap ? 'timetable-slot swap-on' : 'timetable-slot')}
      onClick={clickSlot}
    >
      <Typography fontWeight={500} fontSize='15px'>
        {slot.CourseId && slot.CourseId.split('_')[0]}
      </Typography>
      <Typography fontSize='14px'>
        {slot.CourseId && slot.CourseId.split('_')[1]}
      </Typography>
      <Stack bgcolor={blue[600]} width='90px'>
        <Typography fontSize='14px' textAlign='center' color='white'>
          {slot.Duration}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default Slot