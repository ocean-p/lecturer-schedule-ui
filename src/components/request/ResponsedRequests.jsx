import { Box, Dialog, DialogContent, DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { green, red } from '@mui/material/colors';
import React, { useEffect, useState } from 'react'
import request from '../../utils/request';

const ResponsedRequests = ({isResponsed, setIsResponsed, pickedSubject, semesterId, lecturers}) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if(account.Id && pickedSubject.Id && semesterId){
      request.get('Request', {
        params: {
          DepartmentManagerId: account.Id, SemesterId: semesterId, SubjectId: pickedSubject.Id,
          sortBy: 'DateCreate', order: 'Des', pageIndex: 1, pageSize: 100
        }
      }).then(res => {
        if (res.data) {
          let data = res.data;
          data = data.filter(data => data.ResponseState !== 0)
          setRequests(data)
        }
      }).catch(err => { alert('Fail to get requests') })
    }
  }, [account.Id, pickedSubject.Id, semesterId, isResponsed])

  return (
    <Dialog maxWidth='md' fullWidth={true}
      open={isResponsed} onClose={() => setIsResponsed(false)}>
      <DialogTitle>
        <Typography variant='h5' fontWeight={500}>Responsed Requests</Typography>
      </DialogTitle>
      <DialogContent>
        <Paper sx={{ minWidth: 700, mb: 2 }}>
          <TableContainer component={Box}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className='subject-header'>Create At</TableCell>
                  <TableCell className='subject-header'>Lecturer</TableCell>
                  <TableCell className='subject-header'>Department</TableCell>
                  <TableCell className='subject-header'>Note</TableCell>
                  <TableCell className='subject-header'>Response At</TableCell>
                  <TableCell className='subject-header'>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map(req => (
                  <TableRow hover key={req.Id}>
                    <TableCell>{req.DateCreateFormat}</TableCell>
                    <TableCell>{req.LecturerId} - {req.LecturerName}</TableCell>
                    <TableCell>{lecturers.find(lec => lec.Id === req.LecturerId)?.DepartmentId}</TableCell>
                    <TableCell>{req.Description}</TableCell>
                    <TableCell>{req.DateResponeFormat}</TableCell>
                    <TableCell>
                      {req.ResponseState === -1 && 
                        <Typography fontSize='15px' fontWeight={500} color={red[600]}>Rejected</Typography>}
                      {req.ResponseState === 1 && 
                        <Typography fontSize='15px' fontWeight={500} color={green[800]}>Accepted</Typography>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </DialogContent>
      
    </Dialog>
  )
}

export default ResponsedRequests