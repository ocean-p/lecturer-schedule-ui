import { Close } from '@mui/icons-material'
import { Box, Button, Dialog, DialogContent, DialogTitle, FormControl, FormControlLabel, Paper, Radio, RadioGroup, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material'
import { green, grey, red } from '@mui/material/colors'
import React, { useEffect, useState } from 'react'
import { useMemo } from 'react'
import request from '../../utils/request'

const SentRequest = ({isView, setIsView, requests}) => {
  const [subs, setSubs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [value, setValue] = useState(1);
  const renderReqs = useMemo(() => {
    if(value !== 1){
      if(value === 2){
        return requests.filter(item => item.ResponseState === 1)
      }

      if(value === 3){
        return requests.filter(item => item.ResponseState === -1)
      }

      return requests.filter(item => item.ResponseState === 0)
    }
    return requests
  }, [requests, value])

  useEffect(() => {
    request.get('Subject', {
      params: {sortBy:'Id', order: 'Asc', pageIndex: 1, pageSize: 500}
    }).then(res => {
      if(res.data.length > 0){
        setSubs(res.data)
      }
    }).catch(err => {alert('Fail to get subjects')})
  }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Dialog maxWidth='lg' fullWidth={true}
      open={isView} onClose={() => setIsView(false)}>
      <DialogTitle>
        <Stack direction='row' justifyContent='space-between'>
          <Typography variant='h5' fontWeight={500}>Sent Requests</Typography>
          <Button variant='outlined' color='error' size='small' endIcon={<Close/>}
            onClick={() => setIsView(false)}>
            Close</Button>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack mb={1}>
          <FormControl margin='none'>
            <RadioGroup value={value} onChange={(e) => setValue(Number(e.target.value)) }>
              <Stack direction='row' alignItems='center' gap={1}>
                <FormControlLabel value='1' control={<Radio />} label="All" />
                <FormControlLabel value='2' control={<Radio color='success'/>} label="Accepted" />
                <FormControlLabel value='3' control={<Radio color='error'/>} label="Rejected" />
                <FormControlLabel value='4' control={<Radio color='info'/>} label="Wait for response" />
              </Stack>
            </RadioGroup>
          </FormControl>
        </Stack>
        <Paper sx={{ minWidth: 700, mb: 2 }}>
          <TableContainer component={Box}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className='subject-header'>Create At</TableCell>
                  <TableCell className='subject-header'>Subject</TableCell>
                  <TableCell className='subject-header'>Department</TableCell>
                  <TableCell className='subject-header'>Note</TableCell>
                  <TableCell className='subject-header'>Response At</TableCell>
                  <TableCell className='subject-header'>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderReqs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(req => (
                  <TableRow key={req.Id} hover>
                    <TableCell>{req.DateCreateFormat}</TableCell>
                    <TableCell>{req.SubjectId}</TableCell>
                    <TableCell>
                      {subs.length>0 && subs.find(sub => sub.Id === req.SubjectId)?.DepartmentName}
                    </TableCell>
                    <TableCell>{req.Description || '-'}</TableCell>
                    <TableCell>{req.DateResponeFormat || '-'}</TableCell>
                    <TableCell>
                      {req.ResponseState === -1 && 
                        <span style={{color: red[600], fontWeight: 500}}>Rejected</span>}
                      {req.ResponseState === 0 && 
                        <span style={{color: grey[600], fontWeight: 500}}>Wait for response</span>}
                      {req.ResponseState === 1 && 
                        <span style={{color: green[500], fontWeight: 500}}>Accepted</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10,20]}
            component='div' count={renderReqs.length}
            rowsPerPage={rowsPerPage} page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showFirstButton showLastButton
            sx={{ bgcolor: 'ghostwhite'}}
          />
        </Paper>
      </DialogContent>
    </Dialog>
  )
}

export default SentRequest