import { Box, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import request from '../../utils/request';
import SubjectRequestDetail from './SubjectRequestDetail';

const SubjectRequest = ({semesterId, semesterState, scheduleId}) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isDetail, setIsDetail] = useState(false);
  const [pickedSubject, setPickedSubject] = useState({});
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [requests, setRequests] = useState([]);

  //get subject by manager's department id
  useEffect(() => {
    const getSubjects = async () => {
      try {
        const response = await request.get('Subject', {
          params: {
            DepartmentId: account.DepartmentId, sortBy: 'Id', order: 'Asc',
            pageIndex: 1, pageSize: 100
          }
        })
        if (response.data) {
          setSubjects(response.data)
        }
      }
      catch (error) {
        alert('Fail to load subjects!');
      }
    }

    getSubjects();
  }, [account.DepartmentId])

  //get all courses in semester 
  useEffect(() => {
    request.get('Course', {
      params: {SemesterId: semesterId, sortBy: 'SubjectId', order: 'Asc',
        pageIndex:1, pageSize:1000}
    }).then(res => {
      if(res.data){
        setCourses(res.data)
      }
    }).catch(err => {alert('Fail to get total courses')})
  }, [semesterId])

  //get all courses assigned in semester
  useEffect(() => {
    request.get('CourseAssign', {
      params: {ScheduleId: scheduleId, sortBy: 'CourseId', order: 'Asc',
        pageIndex:1, pageSize:1000}
    }).then(res => {
      if(res.status === 200){
        setAssignedCourses(res.data)
      }
    }).catch(err => {alert('Fail to get assigned courses')})
  }, [scheduleId, isDetail])

  //get requests have state=0, to show total not responsed request
  useEffect(() => {
    request.get('Request', {
      params: {
        DepartmentManagerId: account.Id, SemesterId: semesterId, ResponseState: 0, 
        sortBy: 'DateCreate', order: 'Des', pageIndex: 1, pageSize: 100
      }
    }).then(res => {
      if (res.data) {
        setRequests(res.data)
      }
    }).catch(err => { alert('Fail to get requests') })
  }, [account.Id, semesterId, isDetail])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const viewDetail = (subject) => {
    setPickedSubject(subject);
    setIsDetail(true)
  }

  return (
    <Stack px={9} height='90vh'>
      <Stack mb={1} direction='row' gap={1}>
        <Typography fontWeight={500}>Department: </Typography>
        <Typography>{account.DepartmentName}</Typography>
      </Stack>
      <Stack>
        <Paper sx={{ minWidth: 700, mb: 2 }}>
          <TableContainer component={Box}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className='subject-header'>Code</TableCell>
                  <TableCell className='subject-header request-border'>Name</TableCell>
                  <TableCell className='subject-header request-border' align='center'>
                    Total Courses</TableCell>
                  <TableCell className='subject-header request-border' align='center'>
                    Total Assigned Courses</TableCell>
                  <TableCell className='subject-header' align='center'>
                    Total Requests</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.length > 0 && 
                subjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(subject => (
                  <TableRow hover key={subject.Id} sx={{'&:hover':{cursor: 'pointer'}}}
                    onClick={() => viewDetail(subject)}>
                    <TableCell>{subject.Id}</TableCell>
                    <TableCell className='request-border'>{subject.SubjectName}</TableCell>
                    <TableCell className='request-border' align='center'>
                      {courses.filter(course => course.SubjectId === subject.Id).length}</TableCell>
                    <TableCell className='request-border' align='center'>
                      {assignedCourses.length > 0 && 
                        assignedCourses.filter(course => course.CourseId.split('_')[0] === subject.Id).length}
                      {assignedCourses.length === 0 && '0'} 
                    </TableCell>
                    <TableCell align='center'>
                      {requests.length > 0 &&
                        requests.filter(req => req.SubjectId === subject.Id).length}
                      {requests.length === 0 && '0'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20]} component='div'
            count={subjects.length} rowsPerPage={rowsPerPage}
            page={page} onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={<span>Rows:</span>}
            showFirstButton showLastButton
            sx={{ bgcolor: 'ghostwhite' }}
          />
        </Paper>
      </Stack>
      <SubjectRequestDetail isDetail={isDetail} setIsDetail={setIsDetail} pickedSubject={pickedSubject} 
        scheduleId={scheduleId} semesterId={semesterId} semesterState={semesterState}/>
    </Stack>
  )
}

export default SubjectRequest