import {Box, Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, TablePagination, Select, MenuItem, Button
} from '@mui/material';
import { Send } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import RequestModal from '../department/RequestModal';
import { green, grey, red } from '@mui/material/colors';
import {HashLoader} from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import request from '../../utils/request';
import './Subject.css';
import SentRequest from '../request/SentRequest';

const ExternalSubject = ({ semesterId, semesterState }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isRequest, setIsRequest] = useState(false);
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loadSubject, setLoadSubject] = useState(false);
  const [requests, setRequests] = useState([]);
  const [isView, setIsView] = useState(false)

  //get Department to get Department Group --> list department in group
  useEffect(() => {
    const getDepartments = async () => {
      try {
        const response = await request.get(`Department/${account.DepartmentId}`);
        const departmentRes = await request.get('Department', {
          params: { DepartmentGroupId: response.data.DepartmentGroupId,
            sortBy:'Id', order: 'Asc', pageIndex: 1, pageSize: 100}
        })
        if(departmentRes.data.length > 0){
          let data = departmentRes.data
          data = data.filter(item => item.Id !== account.DepartmentId)
          setDepartments(data)
          setSelectedDepartment(data[0]?.Id)
        }
      }
      catch (error) {
        alert('Fail to get Department!')
      }
    }

    getDepartments();
  }, [account.DepartmentId])

  //get Subject by selected department
  useEffect(() => {
    setLoadSubject(true)
    const getSubjects = async () => {
      try {
        const response = await request.get('Subject', {
          params: { DepartmentId: selectedDepartment, sortBy:'Id', 
            order: 'Asc', pageIndex: 1, pageSize: 1000}
        })
        if (response.data) {
          setSubjects(response.data)
          setLoadSubject(false);
        }
      }
      catch (error) {
        alert('Fail to load subjects!');
        setLoadSubject(false);
      }
    }

    if(selectedDepartment) getSubjects();
  }, [selectedDepartment])

  //get requests
  useEffect(() => {
    if(semesterId){
      request.get('Request', {
        params: {
          LecturerId: account.Id, SemesterId: semesterId, 
          sortBy: 'DateCreate', order: 'Des', pageIndex: 1, pageSize: 100
        }
      }).then(res => {
        if (res.data) {
          setRequests(res.data)
        }
      }).catch(err => { alert('Fail to get requests') })
    }
  }, [account.Id, semesterId, isRequest])

  //set rows = subject.length
  useEffect(() => {
    if (subjects.length > 0) {
      setRowsPerPage(subjects.length)
    }
  }, [subjects])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelect = (e) => {
    setSelectedDepartment(e.target.value)
    setPage(0);
  }

  const sendRequest = (status) => {
    if(status){
      toast.success('Send successfully', {
        position: "top-right", autoClose: 3000,
        hideProgressBar: false, closeOnClick: true,
        pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
    else{
      toast.error('Fail to send request', {
        position: "top-right", autoClose: 3000,
        hideProgressBar: false, closeOnClick: true,
        pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
  }

  return (
    <Stack height='90vh'>
      <Stack direction='row' alignItems='center' justifyContent='space-between'
        px={9} mb={1}>
        <Stack direction='row' alignItems='center' gap={1}>
          <Typography fontWeight={500}>Department:</Typography>
          <Select color='success' size='small'
            value={selectedDepartment} onChange={handleSelect}>
            {departments.map(department => (
              <MenuItem value={department.Id} key={department.Id}>
                {department.DepartmentName}
              </MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack direction='row' alignItems='center' gap={2}>
          <Button variant='contained' color='warning'
            onClick={() => setIsView(true)}>Sent Requests</Button>
          <Button variant='contained' endIcon={<Send/>} 
            onClick={() => setIsRequest(true)} disabled={(semesterState===2) ? false : true}>
            Request</Button>
        </Stack>
      </Stack>
      <Stack px={9}>
        {loadSubject && <HashLoader size={30} color={green[600]}/>}
        {!loadSubject && <Paper sx={{ minWidth: 700, mb: 2 }}>
          <TableContainer component={Box} sx={{ overflow: 'auto' }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className='subject-header'>Code</TableCell>
                  <TableCell className='subject-header request-border'>Name</TableCell>
                  <TableCell className='subject-header' align='center'>
                    Request Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((subject) => (
                    <TableRow key={subject.Id} hover>
                      <TableCell>{subject.Id}</TableCell>
                      <TableCell className='request-border'>{subject.SubjectName}</TableCell>
                      <TableCell align='center'>
                        {requests.find(item => item.SubjectId === subject.Id)?.ResponseState === -1 &&
                          <Typography fontSize='15px' color={red[600]} fontWeight={500}>Rejected</Typography>}
                        {requests.find(item => item.SubjectId === subject.Id)?.ResponseState === 0 &&
                          <Typography fontSize='15px' color={grey[600]} fontWeight={500}>Wait for response</Typography>}
                        {requests.find(item => item.SubjectId === subject.Id)?.ResponseState === 1 &&
                          <Typography fontSize='15px' color={green[500]} fontWeight={500}>Accepted</Typography>}
                        {requests.find(item => item.SubjectId === subject.Id) === undefined && '-'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, subjects.length]}
            component='div'
            count={subjects.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showFirstButton
            showLastButton
            sx={{
              bgcolor: 'ghostwhite'
            }}
          />
        </Paper>}
      </Stack>
      <SentRequest isView={isView} setIsView={setIsView} requests={requests}/>
      <RequestModal isRequest={isRequest} setIsRequest={setIsRequest} requests={requests}
        semesterId={semesterId} sendRequest={sendRequest}/>
      <ToastContainer />
    </Stack>
  )
}

export default ExternalSubject