import { Beenhere, ManageAccountsOutlined, Check, MoreHoriz } from '@mui/icons-material'
import { Box, Button, IconButton, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from '@mui/material'
import { green, grey, red } from '@mui/material/colors';
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import request from '../../../utils/request';
import ConfirmSchedule from './ConfirmSchedule';
import Alert from '../../alert/Alert';
import { HashLoader } from 'react-spinners';

const LecturerList = ({ handleSelect, admin, scheduleId, isSelected, semester, myCourseGroup, setReloadConfirm, refresh }) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDepartment, setSelectedDepartment] = useState(account.DepartmentId);
  const [departments, setDepartments] = useState([]);
  const [lecturers, setlecturers] = useState([]);
  const [assignCourses, setAssignCourses] = useState([]);
  const [lecCourseGroups, setLecCourseGroups] = useState([]);
  const [isConfirm, setIsConfirm] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [contentAlert, setContentAlert] = useState('');
  const [load, setLoad] = useState(false)

  //get departments
  useEffect(() => {
    const getDepartments = async () => {
      try {
        if (admin) {
          const departmentList = await request.get('Department', {
            params: {
              sortBy: 'Id', order: 'Asc', pageIndex: 1, pageSize: 1000
            }
          })
          if (departmentList.data) {
            setDepartments(departmentList.data)
            setSelectedDepartment(departmentList.data[0]?.Id)
          }
        }
        else {
          const response = await request.get(`Department/${account.DepartmentId}`);
          const departmentList = await request.get('Department', {
            params: {
              DepartmentGroupId: response.data.DepartmentGroupId,
              sortBy: 'Id', order: 'Asc', pageIndex: 1, pageSize: 1000
            }
          })
          if (departmentList.data) {
            setDepartments(departmentList.data)
          }
        }
      }
      catch (error) {
        alert('Fail to get Department!')
      }
    }
    getDepartments();
  }, [account.DepartmentId, admin])

  //get lecturers by department
  useEffect(() => {
    setLoad(true)
    if(selectedDepartment){
      request.get('User', {
        params: {DepartmentId: selectedDepartment, RoleIDs: 'LC', sortBy: 'DepartmentId', 
          order: 'Asc', pageIndex: 1, pageSize: 500
        }
      }).then(res => {
        if (res.data) {
          setlecturers(res.data)
          setLoad(false)
        }
      }).catch(err => {alert('Fail to load lecturers'); setLoad(false)})
    }
  }, [selectedDepartment])

  //set rows equal lecturers length
  useEffect(() => {
    if (lecturers.length > 0) {
      setRowsPerPage(lecturers.length)
    }
  }, [lecturers])

  //get all assign course after generate schedule
  useEffect(() => {
    if(scheduleId){
      request.get('CourseAssign', {
        params: {ScheduleId: scheduleId, sortBy: 'LecturerId', 
          order: 'Asc', pageIndex: 1, pageSize: 500}
      }).then(res => {
        if(res.data.length > 0){
          setAssignCourses(res.data)
        }
      }).catch(err => {alert('Fail to get assigned courses of lecturers')})
    }
  }, [scheduleId, isSelected, refresh, semester.State])

  //get lecturer course group to show min max course
  useEffect(() => {
    if(semester.Id){
      request.get('LecturerCourseGroup', {
        params: {SemesterId: semester.Id, pageIndex:1, pageSize:100}
      }).then(res => {
        if(res.data.length > 0){
          setLecCourseGroups(res.data)
        }
      }).catch(err => {alert('Fail to get min max course of lecturer')})
    }
  }, [semester.Id, isSelected, refresh, semester.State])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectDepartment = (e) => {
    setSelectedDepartment(e.target.value);
    setPage(0);
  }

  const myDepartment = () => {
    if (selectedDepartment !== account.DepartmentId) {
      setSelectedDepartment(account.DepartmentId)
      setPage(0);
    }
  }

  const selectLecturer = (lecturerId) => {
    let obj = {};
    for(let i in lecturers){
      if(lecturers[i].Id === lecturerId){
        obj = lecturers[i]
        break;
      }
    }

    handleSelect(obj)
  }

  const checkMinMaxCourse= (lecturerId) => {
    const assignedNumber = assignCourses.filter(course => course.LecturerId === lecturerId).length
    const min = lecCourseGroups.find(group => group.LecturerId === lecturerId)?.MinCourse
    const max = lecCourseGroups.find(group => group.LecturerId === lecturerId)?.MaxCourse

    return assignedNumber >= min && assignedNumber <= max
  }

  const clickConfirm = () => {
    request.get(`CheckConstraint/CheckCourseOflecrurerInDepartment/${account.DepartmentId}&${semester.Id}`)
    .then(res => {
      if(res.data){
        const resCheck = res.data
        if(resCheck.success === true){
          setIsConfirm(true);
        }
        else{
          setContentAlert('Please check again about course number.')
          setIsAlert(true);
        }
      }
    })
    .catch(err => {alert('Fail to check course number')}) 
  }

  const afterConfirm = (status) => {
    if(status){
      setReloadConfirm(pre => !pre)
      toast.success('Confirm schedule successfully!', {
        position: "top-right", autoClose: 3000, hideProgressBar: false,
        closeOnClick: true, pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
  }

  return (
    <>
      <Stack direction='row' alignItems='center' justifyContent='space-between' px={9} mb={1}>
        <Stack direction='row' alignItems='center' gap={1}>
          <Typography fontWeight={500}>Department:</Typography>
          <Select color='success' size='small'
            value={selectedDepartment} onChange={handleSelectDepartment}>
            {departments.map(department => (
              <MenuItem key={department.Id} value={department.Id}>
                {department.DepartmentName}</MenuItem>
            ))}
          </Select>
          {!admin && <Tooltip title='My Department' placement='top' arrow>
            <Beenhere onClick={myDepartment}
              sx={{ml: 1, color: selectedDepartment === account.DepartmentId ? green[600] : grey[400],
                fontSize: '28px', '&:hover': { cursor: 'pointer', color: green[600]}}}
            />
          </Tooltip>}
        </Stack>
        {!admin && semester.State === 5 && account.DepartmentId === selectedDepartment && myCourseGroup.Id &&
         ( myCourseGroup.GroupName === 'confirm' ? 
          <Typography color={red[600]} fontWeight={500}>Schedules have been confirmed</Typography>:
          <Button variant='contained' size='small' color='error' onClick={clickConfirm}>
            Confirm Schedule</Button>)}
      </Stack>
      {load && <Stack px={9}><HashLoader size={30} color={green[600]}/></Stack>}
      {!load && <Stack px={9} mb={2}>
        <Paper sx={{ minWidth: 700 }}>
          <TableContainer component={Box}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className='subject-header'>ID</TableCell>
                  <TableCell className='subject-header'>Name</TableCell>
                  <TableCell className='subject-header'>Email</TableCell>
                  <TableCell className='subject-header' align='center'>FullTime</TableCell>
                  {(admin || account.DepartmentId === selectedDepartment) && 
                    (semester.State === 5 || semester.State === 6) &&
                    <TableCell className='subject-header' align='center'>
                      Courses</TableCell>}
                  <TableCell className='subject-header' align='center'>More</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lecturers.length > 0 && 
                lecturers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((lecturer) => (
                    <TableRow key={lecturer.Id} hover onClick={() => selectLecturer(lecturer.Id)}
                      sx={{ '&:hover': { cursor: 'pointer' } }}>
                      <TableCell>{lecturer.Id}</TableCell>
                      <TableCell>
                        <Stack direction='row' alignItems='center' gap={1}>
                          <Typography fontSize='14px'>{lecturer.Name}</Typography>
                          {lecturer.RoleIDs && lecturer.RoleIDs.includes('DMA') &&
                            <Tooltip title='Department Manager'>
                              <ManageAccountsOutlined />
                            </Tooltip>
                          }
                        </Stack>
                      </TableCell>
                      <TableCell>{lecturer.Email}</TableCell>
                      <TableCell align='center'>
                        {lecturer.IsFullTime === 1 && <Check />}
                      </TableCell>
                      {(admin || account.DepartmentId === selectedDepartment) && 
                        (semester.State === 5 || semester.State === 6)  && 
                      <TableCell align='center' 
                        sx={{bgcolor: assignCourses.length > 0 && lecCourseGroups.length > 0 && checkMinMaxCourse(lecturer.Id) ? green[100] : red[100],
                          borderTop: '1px solid silver', borderBottom: '1px solid silver'
                        }}>
                        {assignCourses.filter(course => course.LecturerId === lecturer.Id).length} {' '}
                        ({lecCourseGroups.find(group => group.LecturerId === lecturer.Id)?.MinCourse}{'-'}
                        {lecCourseGroups.find(group => group.LecturerId === lecturer.Id)?.MaxCourse})
                      </TableCell>}
                      <TableCell align='center'>
                        <Tooltip title='More' placement='right'>
                          <IconButton><MoreHoriz /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, lecturers.length]}
            component='div'
            count={lecturers.length}
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
        <ConfirmSchedule isConfirm={isConfirm} setIsConfirm={setIsConfirm} 
          myCourseGroup={myCourseGroup} afterConfirm={afterConfirm}/>
        <Alert isAlert={isAlert} setIsAlert={setIsAlert} contentAlert={contentAlert}/>
        {!admin && isSelected === false && <ToastContainer/>}
      </Stack>}
    </>
  )
}

export default LecturerList