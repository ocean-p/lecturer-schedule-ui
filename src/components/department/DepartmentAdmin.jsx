import { Add, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import {Box, Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, Tooltip
} from '@mui/material';
import { green } from '@mui/material/colors';
import {HashLoader} from 'react-spinners'
import { ToastContainer, toast } from 'react-toastify';
import React, { useState, useEffect } from 'react'
import request from '../../utils/request';
import Title from '../title/Title'
import DepartmentCreate from './DepartmentCreate';
import DepartmentEdit from './DepartmentEdit';
import DeleteModal from '../priority/DeleteModal';
import AlertComponent from '../alert/Alert';

const DepartmentAdmin = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isCreate, setIsCreate] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [pickedDepart, setPickedDepart] = useState({})
  const [isDelete, setIsDelete] = useState(false);
  const [contentDel, setContentDel] = useState('');
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [contentAlert, setContentAlert] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);

  //get all departments
  useEffect(() => {
    setLoading(true)
    request.get('Department', {
      params: {sortBy: 'Id', order: 'Asc',
        pageIndex: 1, pageSize: 100
      }
    }).then(res => {
      if (res.data) {
        setDepartments(res.data);
        setLoading(false)
      }
    }).catch(err => {
      alert('Fail to load departments')
      setLoading(false)
    })
  }, [reload])

  //get managers
  useEffect(() => {
    request.get('User', {
      params:{RoleIDs: 'DMA',pageIndex: 1, pageSize: 100}
    }).then(res => {
      if(res.data){
        setManagers(res.data)
      }
    }).catch(err => {
      alert('Fail to load managers')
    })
  }, [])

  //get subjects
  useEffect(() => {
    request.get('Subject', {params: {pageIndex: 1, pageSize: 500}})
      .then(res => {
        if (res.data.length > 0) {
          setSubjects(res.data)
        }
      })
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

  const clickCreate = () => {
    const number = semesters.filter(item => item.State >= 2 && item.State <= 5).length
    if(number > 0){
      setContentAlert('The system is having semesters in schedule generating process.')
      setIsAlert(true)
      return
    }

    setIsCreate(true)
  }

  const afterCreate = (status) => {
    if (status) {
      setReload(pre => !pre)
      toast.success('Create successfully', {
        position: "top-right", autoClose: 3000,
        hideProgressBar: false, closeOnClick: true,
        pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
  }

  const clickEdit = (depart) => {
    const number = semesters.filter(item => item.State >= 2 && item.State <= 5).length
    if(number > 0){
      setContentAlert('The system is having semesters in schedule generating process.')
      setIsAlert(true)
      return
    }

    setPickedDepart(depart)
    setIsEdit(true)
  }

  const afterEdit = (status) => {
    if (status) {
      setReload(pre => !pre)
      toast.success('Edit successfully', {
        position: "top-right", autoClose: 3000,
        hideProgressBar: false, closeOnClick: true,
        pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
  }

  const clickDelete = (depart) =>{
    const subjectNumber = subjects.filter(item => item.DepartmentId === depart.Id).length
    if(subjectNumber > 0){
      setContentAlert(`Department: ${depart.DepartmentName} is having subjects.`)
      setIsAlert(true)
      return
    }

    setPickedDepart(depart)
    setContentDel(`department: ${depart.Id}`)
    setIsDelete(true)
  }
  
  const saveDelete = () => {
    if(pickedDepart.Id){
      request.delete(`Department/${pickedDepart.Id}`)
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
    }
  }

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Stack mt={1} mb={4} px={9}>
        <Title title='Department' subTitle='List of all departments' />
      </Stack>
      <Stack px={9} alignItems='flex-end' mb={1}>
        <Button size='small' variant='contained' endIcon={<Add/>} onClick={clickCreate}>
          Create
        </Button>
      </Stack>
      {loading && <Stack px={9}><HashLoader size={30} color={green[600]}/></Stack>}
      {!loading && <Stack px={9} mb={2}>
        <Paper sx={{ minWidth: 700 }}>
          <TableContainer component={Box}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className='subject-header'>Code</TableCell>
                  <TableCell className='subject-header'>Name</TableCell>
                  <TableCell className='subject-header'>Manager</TableCell>
                  <TableCell className='subject-header request-border'>Group</TableCell>
                  <TableCell className='subject-header' align='center'>Option</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(department => (
                    <TableRow key={department.Id} hover>
                      <TableCell>{department.Id}</TableCell>
                      <TableCell>{department.DepartmentName}</TableCell>
                      <TableCell>
                        {managers.find(manager => manager.DepartmentId === department.Id)?.Name}
                      </TableCell>
                      <TableCell className='request-border'>{department.DepartmentGroupId}</TableCell>
                      <TableCell align='center'>
                        <Tooltip title='Edit' placement='top' arrow>
                          <IconButton size='small' color='primary' onClick={() => clickEdit(department)}>
                            <EditOutlined/>
                          </IconButton>
                        </Tooltip>
                        <span>|</span>
                        <Tooltip title='Delete' placement='top' arrow>
                          <IconButton size='small' color='error' onClick={() => clickDelete(department)}>
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
            rowsPerPageOptions={[10, 20]}
            component='div'
            count={departments.length}
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
      <DepartmentCreate isCreate={isCreate} setIsCreate={setIsCreate} afterCreate={afterCreate}
        departs={departments}/>
      <DepartmentEdit isEdit={isEdit} setIsEdit={setIsEdit} pickedDepart={pickedDepart}
        afterEdit={afterEdit}/>
      <DeleteModal isDelete={isDelete} setIsDelete={setIsDelete} contentDelete={contentDel}
        saveDelete={saveDelete}/>
      <AlertComponent isAlert={isAlert} setIsAlert={setIsAlert} contentAlert={contentAlert}/>
      <ToastContainer/>
    </Stack>
  )
}

export default DepartmentAdmin