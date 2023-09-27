import {
  Box, IconButton, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, Tooltip, Typography
} from '@mui/material';
import { Visibility, Beenhere, ManageAccountsOutlined, Check } from '@mui/icons-material';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { green, grey } from '@mui/material/colors';
import { HashLoader } from 'react-spinners';
import request from '../../utils/request';
import Title from '../title/Title';

const Lecturer = () => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDepartment, setSelectedDepartment] = useState(account.DepartmentId);
  const [departments, setDepartments] = useState([]);
  const [lecturers, setlecturers] = useState([]);
  const [loadDepart, setLoadDepart] = useState(false);
  const [loadLecturer, setLoadLecturer] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    const getDepartments = async () => {
      setLoadDepart(true)
      try {
        const response = await request.get(`Department/${account.DepartmentId}`);
        const departmentList = await request.get('Department', {
          params: {
            DepartmentGroupId: response.data.DepartmentGroupId,
            pageIndex: 1,
            pageSize: 1000
          }
        })
        if (departmentList.data) {
          setDepartments(departmentList.data)
          setLoadDepart(false)
        }
      }
      catch (error) {
        alert('Fail to get Department!')
        setLoadDepart(false)
      }
    }

    getDepartments();
  }, [account.DepartmentId])

  useEffect(() => {
    setLoadLecturer(true)
    request.get('User', {
      params: {
        DepartmentId: selectedDepartment,
        RoleIDs: 'LC',
        pageIndex: 1,
        pageSize: 500
      }
    })
    .then(res => {
      if(res.data){
        setlecturers(res.data)
        setLoadLecturer(false)
      }
    })
    .catch(err => {
      alert('Fail to load lecturers');
      setLoadLecturer(false);
    })
  }, [selectedDepartment])

  useEffect(() => {
    if(lecturers.length > 0){
      setRowsPerPage(lecturers.length)
    }
  }, [lecturers])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectDepartment = (e) => {
    setSelectedDepartment(e.target.value);
  }

  const myDepartment = () => {
    if (selectedDepartment !== account.DepartmentId){
      setSelectedDepartment(account.DepartmentId)
      setPage(0);
    }
  }

  const viewDetail = (id) => {
    navigate(`/manager/lecturer/${id}`)
  }

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Stack px={9} mt={1} mb={4}>
        <Title title='Lecturer' subTitle='All lecturers in my department and relative department'/>
      </Stack>
      <Stack direction='row' mb={2} alignItems='center' gap={1} px={9}>
        <Typography fontWeight={500}>
          Department:
        </Typography>
        <Select color='success'
          size='small'
          value={selectedDepartment}
          onChange={handleSelectDepartment}
        >
          {
            departments.map(department => (
              <MenuItem key={department.Id} value={department.Id}>
                {department.DepartmentName}</MenuItem>
            ))
          }
        </Select>
        <Tooltip title='My Department' placement='top' arrow>
          <Beenhere onClick={myDepartment}
            sx={{
              ml: 2,
              color: selectedDepartment === account.DepartmentId ? green[600] : grey[400],
              fontSize: '28px',
              '&:hover': {
                cursor: 'pointer',
                color: green[600]
              }
            }}
          />
        </Tooltip>
      </Stack>
      <Stack px={9} mb={2}>
        {(loadDepart || loadLecturer) && <HashLoader size={30} color={green[600]}/>}
        {!loadDepart && !loadLecturer && 
        <Paper sx={{ minWidth: 700 }}>
          <TableContainer component={Box}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size='small' className='subject-header'>ID</TableCell>
                  <TableCell size='small' className='subject-header'>Name</TableCell>
                  <TableCell size='small' className='subject-header'>Email</TableCell>
                  <TableCell size='small' className='subject-header'>Full-time</TableCell>
                  <TableCell size='small' className='subject-header'>Detail</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  lecturers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((lecturer) => (
                      <TableRow key={lecturer.Id} hover sx={{ '&:hover': { cursor: 'pointer' } }}
                        onClick={() => viewDetail(lecturer.Id)}>
                        <TableCell size='small'>{lecturer.Id}</TableCell>
                        <TableCell size='small'>
                          <Stack direction='row' alignItems='center' gap={1}>
                            <Typography fontSize='14px'>{lecturer.Name}</Typography>
                            {lecturer.RoleIDs && lecturer.RoleIDs.includes('DMA') &&
                              <Tooltip title='Department Manager'>
                                <ManageAccountsOutlined/>
                              </Tooltip>
                            }
                          </Stack>
                        </TableCell>
                        <TableCell size='small'>{lecturer.Email}</TableCell>
                        <TableCell size='small'>
                          {lecturer.IsFullTime === 1 && 
                            <Check/>}
                        </TableCell>
                        <TableCell size='small'>
                          <Tooltip title='More Information' placement='right' arrow>
                            <IconButton>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                }
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
        </Paper>}
      </Stack>
    </Stack>
  )
}

export default Lecturer