import {
  Box, IconButton, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, Tooltip, Typography
} from '@mui/material';
import { Visibility, ManageAccountsOutlined, Check } from '@mui/icons-material';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import {HashLoader} from 'react-spinners';
import Title from '../title/Title'
import request from '../../utils/request';
import { green } from '@mui/material/colors';

const LecturerAdmin = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [load, setLoad] = useState(false);

  //get list departments
  useEffect(() => {
    request.get('Department', {
      params: { sortBy: 'Id', order:'Asc',
        pageIndex: 1, pageSize: 1000
      }
    })
    .then(res => {
      if(res.data.length > 0){
        setDepartments(res.data);
      }
    })
    .catch(err => {
      alert('Fail to load departments')
    })
  }, [])

  //get list lecturers by selectedDepartment
  useEffect(() => {
    setLoad(true)
    if(selectedDepartment){
      request.get('User', {
        params: {
          DepartmentId: selectedDepartment === 'all' ? '' : selectedDepartment,
          RoleIDs: 'LC', sortBy:'DepartmentId', order:'Asc',
          pageIndex: 1, pageSize: 500
        }
      })
      .then(res => {
        if(res.data){
          setLecturers(res.data)
          setLoad(false)
        }
      })
      .catch(err => {
        alert('Fail to load lecturers');
        setLoad(false)
      })
    }
  }, [selectedDepartment])

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

  const viewDetail = (id) => {
    navigate(`/admin/lecturer/${id}`)
  }

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Stack mt={1} mb={4} px={9}>
        <Title title='Lecturer' subTitle='List of all lecturers'/>
      </Stack>
      <Stack direction='row' mb={1} alignItems='center' gap={1} px={9}>
        <Typography fontWeight={500}>Department:</Typography>
        <Select color='success' size='small'
          value={selectedDepartment} onChange={handleSelectDepartment}>
          <MenuItem value='all'>All</MenuItem>
          {departments.map(department => (
            <MenuItem key={department.Id} value={department.Id}>
              {department.DepartmentName}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      {load && <Stack px={9}><HashLoader size={30} color={green[600]}/></Stack>}
      {!load && <Stack px={9} mb={2}>
        <Paper sx={{ minWidth: 700 }}>
          <TableContainer component={Box}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size='small' className='subject-header'>ID</TableCell>
                  <TableCell size='small' className='subject-header'>Name</TableCell>
                  <TableCell size='small' className='subject-header'>Email</TableCell>
                  <TableCell size='small' className='subject-header'>Department</TableCell>
                  <TableCell size='small' className='subject-header'>FullTime</TableCell>
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
                        <TableCell size='small'>{lecturer.DepartmentId}</TableCell>
                        <TableCell size='small'>
                          {lecturer.IsFullTime === 1 && 
                            <Check/>}
                        </TableCell>
                        <TableCell size='small'>
                          <Tooltip title='More Information' placement='right' arrow>
                            <IconButton onClick={() => viewDetail(lecturer.Id)}>
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
            rowsPerPageOptions={[10, 20]}
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
      </Stack>}
    </Stack>
  )
}

export default LecturerAdmin