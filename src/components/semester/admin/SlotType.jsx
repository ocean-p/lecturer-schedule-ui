import {
  Box, Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import request from '../../../utils/request';

const SlotType = ({ semesterId }) => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (semesterId) {
      request.get('SlotType', {
        params: {
          SemesterId: semesterId, sortBy: 'DayOfWeekAndTimeStart', order: 'Asc',
          pageIndex: 1, pageSize: 100,
        }
      })
        .then(res => {
          if (res.status === 200) {
            setSlots(res.data)
          }
        })
        .catch(err => {
          alert('Fail to load slot!')
        })
    }
  }, [semesterId])

  return (
    <Stack height='90vh' mt={4} px={9}>
      <Stack mb={2}>
        <Paper sx={{ minWidth: 700 }}>
          <TableContainer component={Box}
            sx={{ overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size='small' className='subject-header'>Code</TableCell>
                  <TableCell size='small' className='subject-header'>Day of Week</TableCell>
                  <TableCell size='small' className='subject-header'>Duration</TableCell>
                  <TableCell size='small' className='subject-header'>Number</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slots.map(slot => (
                  <TableRow key={slot.Id}>
                    <TableCell size='small'>{slot.SlotTypeCode}</TableCell>
                    <TableCell size='small'>{slot.ConvertDateOfWeek}</TableCell>
                    <TableCell size='small'>{slot.Duration}</TableCell>
                    <TableCell size='small'>{slot.SlotNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>
    </Stack>
  )
}

export default SlotType