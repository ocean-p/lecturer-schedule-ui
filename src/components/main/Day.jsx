import { Stack, Typography } from '@mui/material'
import { green } from '@mui/material/colors'
import React from 'react'
import Slot from './Slot'

const Day = ({ day, date, slots, isSwap, clickSlotToSwap }) => {
  return (
    <Stack flex={1}>
      <Stack flex={0.8} alignItems='center' justifyContent='center'
        color='white' bgcolor={green[600]}
        sx={{
          borderRight: '1px solid #e3e3e3',
          borderBottom: '1px solid #e3e3e3',
        }}
      >
        <Typography className='time-title'>{day}</Typography>
        <Typography fontSize='14px'>{date}</Typography>
      </Stack>
      <Stack flex={9}>
        {
          day === 'SUN' ? (
            <>
              <Stack flex={1} className='timetable-slot is-sunday'></Stack>
              <Stack flex={1} className='timetable-slot is-sunday'></Stack>
              <Stack flex={1} className='timetable-slot is-sunday'></Stack>
              <Stack flex={1} className='timetable-slot is-sunday'></Stack>
              <Stack flex={1} className='timetable-slot is-sunday'></Stack>
              <Stack flex={1} className='timetable-slot is-sunday'></Stack>
            </>
          ) : (
            <>
              {renderSlots.map(item => (
                <Slot key={item.id} isSwap={isSwap} clickSlotToSwap={clickSlotToSwap}
                  slot={slots.find((slot) => slot.SlotNumber === item.slot) || {}}/>
              ))}
              {/* <Slot slot={slots.find((slot) => slot.SlotNumber === 1) || {}}/>
              <Slot slot={slots.find((slot) => slot.SlotNumber === 2) || {}}/>
              <Slot slot={slots.find((slot) => slot.SlotNumber === 3) || {}}/>
              <Slot slot={slots.find((slot) => slot.SlotNumber === 4) || {}}/>
              <Slot slot={slots.find((slot) => slot.SlotNumber === 5) || {}}/>
              <Slot slot={slots.find((slot) => slot.SlotNumber === 6) || {}}/> */}
            </>
          )
        }
      </Stack>
    </Stack>
  )
}

export default Day

const renderSlots = [
  {id:1, slot:1},
  {id:2, slot:2},
  {id:3, slot:3},
  {id:4, slot:4},
  {id:5, slot:5},
  {id:6, slot:6},
]
