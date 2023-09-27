import { Add, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Box, Button, IconButton, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, 
  TableHead, TablePagination, TableRow, Tooltip, Typography } from '@mui/material'
import { green } from '@mui/material/colors';
import {HashLoader} from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import request from '../../utils/request';
import DeleteModal from '../priority/DeleteModal';
import Title from '../title/Title'
import SubjectCreate from './SubjectCreate';
import SubjectEdit from './SubjectEdit';
import AlertComponent from '../alert/Alert';

const SubjectAdmin = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isCreate, setIsCreate] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [pickedSubject, setPickedSubject] = useState({});
  const [isDelete, setIsDelete] = useState(false);
  const [contentDel, setContentDel] = useState('');
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isAlert, setIsAlert] = useState(false);
  const [contentAlert, setContentAlert] = useState('');
  const [semesters, setSemesters] = useState([]);

  //get all departments
  useEffect(() => {
    request.get('Department', {
      params: { sortBy: 'Id', order:'Asc',
        pageIndex: 1, pageSize: 100
      }
    }).then(res => {
      if(res.data.length > 0){
        setDepartments(res.data);
        setSelectedDepartment(res.data[0].Id)
      }
    }).catch(err => {
      alert('Fail to load departments')
    })
  }, [])

  //get subjects by departments
  useEffect(() => {
    setLoading(true)
    if(selectedDepartment){
      request.get('Subject', {
        params: {DepartmentId: selectedDepartment, sortBy: 'Id', order:'Asc',
          pageIndex: 1, pageSize: 1000
        }
      })
      .then(res => {
        if(res.data){
          setSubjects(res.data);
          setLoading(false)
        }
      })
      .catch(err => {
        alert('Fail to load subjects')
        setLoading(false)
      })
    }
  }, [selectedDepartment, reload])

  //get all courses
  useEffect(() => {
    request.get('Course', {params: {pageIndex: 1, pageSize: 1000}})
    .then(res => {
      if(res.data.length > 0){
        setCourses(res.data)
      }
    })
    .catch(err => {})
  }, [])

  //get semesters
  useEffect(() => {
    request.get('Semester', {params: {pageIndex: 1, pageSize: 100}})
    .then(res => {
      if(res.data.length > 0){
        setSemesters(res.data)
      }
    })
  }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectDepartment = (event) => {
    setSelectedDepartment(event.target.value);
    setPage(0);
  };

  const clickCreate = () => {
    const number = semesters.filter(item => item.State >= 2 && item.State <= 5).length
    if(number > 0){
      setContentAlert('The system is having semesters in schedule generating process.')
      setIsAlert(true)
      return
    }

    setIsCreate(true);
  }

  const afterCreate = (status) => {
    if(status){
      setReload(pre => !pre)
      toast.success('Create successfully', {
        position: "top-right", autoClose: 3000,
        hideProgressBar: false, closeOnClick: true,
        pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
  }

  const clickEdit = (subject) => {
    const number = semesters.filter(item => item.State >= 2 && item.State <= 5).length
    if(number > 0){
      setContentAlert('The system is having semesters in schedule generating process.')
      setIsAlert(true)
      return
    }

    setPickedSubject(subject)
    setIsEdit(true);
  }

  const afterEdit = (status) => {
    if(status){
      setReload(pre => !pre)
      toast.success('Edit successfully', {
        position: "top-right", autoClose: 3000,
        hideProgressBar: false, closeOnClick: true,
        pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
  }

  const clickDelete = (subject) => {
    const courseNumber = courses.filter(item => item.SubjectId === subject.Id)
    if(courseNumber.length > 0){
      setContentAlert(`Subject: ${subject.Id} is having courses.`)
      setIsAlert(true)
      return
    }

    setPickedSubject(subject)
    setContentDel(`subject: ${subject.Id}`)
    setIsDelete(true)
  }

  const saveDelete = () => {
    if(pickedSubject.Id){
      request.delete(`Subject/${pickedSubject.Id}`)
      .then(res => {
        if(res.status === 200){
          setIsDelete(false)
          setReload(pre => !pre)
          toast.success('Delete successfully', {
            position: "top-right", autoClose: 3000,
            hideProgressBar: false, closeOnClick: true,
            pauseOnHover: true, draggable: true,
            progress: undefined, theme: "light",
          });
        }
      })
      .catch(err => {})
    }
  }

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Stack mt={1} mb={4} px={9}>
        <Title title='Subject' subTitle='List of all subjects'/>
      </Stack>
      <Stack px={9} direction='row' alignItems='center' mb={2} justifyContent='space-between'>
        <Stack direction='row' alignItems='center' gap={1}>
          <Typography fontWeight={500}>Department:</Typography>
          <Select color='success' size='small'
            value={selectedDepartment} onChange={handleSelectDepartment}>
            {departments.map(department => (
              <MenuItem key={department.Id} value={department.Id}>
                {department.DepartmentName}
              </MenuItem>
            ))}
          </Select>
        </Stack>
        <Button size='small' variant='contained' endIcon={<Add/>} onClick={clickCreate}>
          Create
        </Button>
      </Stack>
      {loading && <Stack px={9}><HashLoader size={30} color={green[600]}/></Stack>}
      {!loading && <Stack px={9} mb={2}>
        <Paper sx={{ minWidth: 700 }}>
          <TableContainer component={Box}
            sx={{ overflow: 'auto' }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className='subject-header'>Code </TableCell>
                  <TableCell className='subject-header'>Name</TableCell>
                  <TableCell className='subject-header request-border'>Department</TableCell>
                  <TableCell className='subject-header' align='center'>Option</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((subject) => (
                    <TableRow key={subject.Id} hover>
                      <TableCell>{subject.Id}</TableCell>
                      <TableCell>{subject.SubjectName}</TableCell>
                      <TableCell className='request-border'>{subject.DepartmentName}</TableCell>
                      <TableCell align='center'>
                        <Tooltip title='Edit' placement='top' arrow>
                          <IconButton size='small' color='primary' onClick={() => clickEdit(subject)}>
                            <EditOutlined/>
                          </IconButton>
                        </Tooltip>
                        <span>|</span>
                        <Tooltip title='Delete' placement='top' arrow>
                          <IconButton size='small' color='error' onClick={() => clickDelete(subject)}>
                            <DeleteOutlined/>
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10,20]}
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
        </Paper>
      </Stack>}
      <SubjectCreate isCreate={isCreate} setIsCreate={setIsCreate} afterCreate={afterCreate}
        departments={departments}/>
      <SubjectEdit isEdit={isEdit} setIsEdit={setIsEdit} pickedSubject={pickedSubject}
        afterEdit={afterEdit} departments={departments}/>
      <DeleteModal isDelete={isDelete} setIsDelete={setIsDelete} contentDelete={contentDel}
        saveDelete={saveDelete}/>
      <AlertComponent isAlert={isAlert} setIsAlert={setIsAlert} contentAlert={contentAlert}/>
      <ToastContainer/>
    </Stack>
  )
}

export default SubjectAdmin