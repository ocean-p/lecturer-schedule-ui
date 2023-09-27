import {Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import request from '../../utils/request';
import AcceptModal from '../request/AcceptModal';
import RejectModal from '../request/RejectModal';
import ResponsedRequests from '../request/ResponsedRequests';

const SubjectRequestDetail = ({ isDetail, setIsDetail, pickedSubject, scheduleId, semesterId, semesterState }) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [lecturers, setLecturers] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pickedRequest, setPickedRequest] = useState({});
  const [isAccept, setIsAccept] = useState(false);
  const [isReject, setIsReject] = useState(false);
  const [afterSave, setAfterSave] = useState(false);
  const [inSideLecs, setInSideLecs] = useState([]);
  const [outSideLecs, setOutSideLecs] = useState([]);
  const [isResponsed, setIsResponsed] = useState(false);

  useEffect(() => {
    request.get('CourseAssign', {
      params: {ScheduleId: scheduleId, sortBy: 'LecturerId', order: 'Asc',
        pageIndex:1, pageSize:1000}
    }).then(res => {
      if(res.status === 200){
        setAssignedCourses(res.data)
      }
    }).catch(err => {alert('Fail to get assigned courses')})
  }, [scheduleId, afterSave])

  useEffect(() => {
    request.get('Request', {
      params: {
        DepartmentManagerId: account.Id, SemesterId: semesterId, SubjectId: pickedSubject.Id,
        ResponseState: 0, sortBy: 'DateCreate', order: 'Des', pageIndex: 1, pageSize: 100
      }
    }).then(res => {
      if (res.data) {
        setRequests(res.data)
      }
    }).catch(err => { alert('Fail to get requests') })
  }, [account.Id, semesterId, pickedSubject.Id, afterSave])

  useEffect(() => {
    request.get('User', {
      params: {RoleIDs:'LC', sortBy:'Id', order: 'Asc', 
        pageIndex: 1, pageSize:100}
    }).then(res => {
      if(res.status === 200){
        setLecturers(res.data)
      }
    }).catch(err => {alert('Fail to get info of lecturer')})
  }, [])

  useEffect(() => {
    if(pickedSubject.Id && semesterId){
      request.get(`CourseAssign/GetUserAssignOutDepartment/${pickedSubject.Id}&${semesterId}`)
      .then(res => {
        if(res.status === 200){
          setOutSideLecs(res.data)
        }
      })
      .catch(err => {alert('Fail to get external number')})

      request.get(`CourseAssign/GetUserAssignInDepartment/${pickedSubject.Id}&${semesterId}`)
      .then(res => {
        if(res.status === 200){
          setInSideLecs(res.data)
        }
      })
      .catch(err => {alert('Fail to get internal number')})
    }
  }, [pickedSubject.Id, semesterId, afterSave])

  const acceptRequest = (req) => {
    setPickedRequest(req)
    setIsAccept(true)
  }

  const rejectRequest = (req) => {
    setPickedRequest(req)
    setIsReject(true)
  }
  
  const handleAfterSave = (content) => {
    if(content){
      setAfterSave(prev => !prev)
      toast.success(content, {
        position: "top-right", autoClose: 3000,
        hideProgressBar: false, closeOnClick: true,
        pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
  }

  return (
    <Dialog maxWidth='lg' fullWidth={true}
      open={isDetail} onClose={() => setIsDetail(false)}>
      <DialogTitle>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={2}>
          <Typography variant='h5' fontWeight={500}>
            Subject Detail
          </Typography>
          <Button size='small' color='error' variant='outlined' endIcon={<Close/>}
            onClick={() => setIsDetail(false)}>Close</Button>
        </Stack>
        <Stack>
          <Typography><span style={{fontWeight: 500}}>Department:</span> {pickedSubject.DepartmentName}</Typography>
          <Typography><span style={{fontWeight: 500}}>Subject:</span> {pickedSubject.Id} - {pickedSubject.SubjectName}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{height: '90vh'}}>
        {requests.length > 0 && <>
          <Stack mb={1}>
            <Typography fontWeight={500}>Requests of Lecturers: {requests.length}</Typography>
          </Stack>
          <Paper sx={{ minWidth: 700, mb: 4 }}>
            <TableContainer component={Box}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell className='subject-header'>Create At</TableCell>
                    <TableCell className='subject-header'>Lecturer</TableCell>
                    <TableCell className='subject-header'>Department</TableCell>
                    <TableCell className='subject-header request-border' align='center'>Assigned Courses</TableCell>
                    {semesterState === 3 &&
                      <TableCell className='subject-header' align='center'>Action</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map(req => (
                    <TableRow hover key={req.Id}>
                      <TableCell>{req.DateCreateFormat}</TableCell>
                      <TableCell>{req.LecturerId} - {lecturers.find(lec => lec.Id === req.LecturerId)?.Name}</TableCell>
                      <TableCell>{lecturers.find(lec => lec.Id === req.LecturerId)?.DepartmentId} {' '}
                      {lecturers.find(lec => lec.Id === req.LecturerId)?.DepartmentId !== account.DepartmentId && '(External)'}</TableCell>
                      <TableCell align='center' className='request-border'>
                        {assignedCourses.length>0 && assignedCourses.filter(item => (item.LecturerId === req.LecturerId
                          && item.CourseId.split('_')[0] === pickedSubject.Id)).length}
                        {assignedCourses.length === 0 && '0'}
                      </TableCell>
                      {semesterState === 3 && 
                        <TableCell align='center'>
                          <Tooltip title='Accept' placement='top' arrow>
                            <IconButton color='success' size='small'
                              onClick={() => acceptRequest(req)}>
                              <Check />
                            </IconButton>
                          </Tooltip>
                          <span>|</span>
                          <Tooltip title='Reject' placement='top' arrow>
                            <IconButton color='error' size='small'
                              onClick={() => rejectRequest(req)}>
                              <Close />
                            </IconButton>
                          </Tooltip>
                        </TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>}
        <Stack mb={1} direction='row' alignItems='center' justifyContent='space-between'>
          <Typography fontWeight={500}>Assigned Lecturers: {inSideLecs.length + outSideLecs.length}</Typography>
          <Button variant='outlined' size='small' onClick={() => setIsResponsed(true)}>
            Responsed Requests
          </Button>
        </Stack>
        <Paper sx={{ minWidth: 700, mb: 2 }}>
          <TableContainer component={Box}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className='subject-header'>Lecturer</TableCell>
                  <TableCell className='subject-header'>Department</TableCell>
                  <TableCell className='subject-header' align='center'>Assigned Courses</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inSideLecs.map(lec => (
                  <TableRow hover key={lec.Id}>
                    <TableCell>{lec.Id} - {lec.Name}</TableCell>
                    <TableCell>{lec.DepartmentId} - {lec.DepartmentName}</TableCell>
                    <TableCell align='center'>
                      {assignedCourses.length>0 && assignedCourses.filter(item => (item.LecturerId === lec.Id
                        && item.CourseId.split('_')[0] === pickedSubject.Id)).length}
                    </TableCell>
                  </TableRow>
                ))}
                {outSideLecs.map(lec => (
                  <TableRow hover key={lec.Id}>
                    <TableCell>{lec.Id} - {lec.Name}</TableCell>
                    <TableCell>{lec.DepartmentId} - {lec.DepartmentName} (External)</TableCell>
                    <TableCell align='center'>
                      {assignedCourses.length>0 && assignedCourses.filter(item => (item.LecturerId === lec.Id
                        && item.CourseId.split('_')[0] === pickedSubject.Id)).length}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </DialogContent>
      <AcceptModal isAccept={isAccept} setIsAccept={setIsAccept} selectedRequest={pickedRequest} 
        handleAfterSave={handleAfterSave}/>

      <RejectModal isReject={isReject} setIsReject={setIsReject} selectedRequest={pickedRequest}
        handleAfterSave={handleAfterSave}/>

      <ResponsedRequests isResponsed={isResponsed} setIsResponsed={setIsResponsed} 
        pickedSubject={pickedSubject} semesterId={semesterId} lecturers={lecturers}/>
      <ToastContainer/>
    </Dialog>
  )
}

export default SubjectRequestDetail