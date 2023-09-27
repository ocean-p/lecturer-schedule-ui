import {
  Box, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography
} from '@mui/material';
import { Beenhere } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { green, grey } from '@mui/material/colors';
import { HashLoader } from 'react-spinners';
import request from '../../utils/request'
import Title from '../title/Title';

const Department = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [manager, setManager] = useState({});
  const [loadSubject, setLoadSubject] = useState(false);

  //get Department Group List
  useEffect(() => {
    setLoadSubject(true);
    const getDepartments = async () => {
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
          setSelectedDepartment(account.DepartmentId)
          setLoadSubject(false);
        }
      }
      catch (error) {
        alert('Fail to get Department!')
        setLoadSubject(false)
      }
    }

    getDepartments();
  }, [account.DepartmentId])

  //get subject list by department
  useEffect(() => {
    const getSubjects = async () => {
      try {
        const response = await request.get('Subject', {
          params: {
            DepartmentId: selectedDepartment,
            pageIndex: 1,
            pageSize: 1000
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
  }, [selectedDepartment])

  //get Manager by department
  useEffect(() => {
    if (selectedDepartment) {
      request.get('User', {
        params: {
          DepartmentId: selectedDepartment,
          RoleIDs: 'DMA',
          pageIndex: 1,
          pageSize: 1
        }
      })
        .then(res => {
          if (res.status === 200) {
            if (res.data.length > 0) {
              setManager(res.data[0])
            }
            else{
              setManager({})
            }
          }
        })
        .catch(err => {
          alert('Fail to get manger!')
        })
    }
  }, [selectedDepartment])

  useEffect(() => {
    if (subjects.length > 0) {
      setRowsPerPage(subjects.length);
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

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Stack px={9} mt={1}>
        <Title title='Subject' subTitle='All subjects in my department and relative departments'/>
      </Stack>
      <Box mt={4} px={9}>
        <Stack direction='row' mb={2} alignItems='center' gap={1}>
          <Typography fontWeight={500}>
            Department:
          </Typography>
          <Select color='success'
            size='small'
            value={selectedDepartment}
            onChange={handleSelect}
          >
            {
              departments.map(department => (
                <MenuItem value={department.Id} key={department.Id}>
                  {department.DepartmentName}
                </MenuItem>
              ))
            }
          </Select>
          <Tooltip title='My Department' placement='top' arrow>
            <Beenhere onClick={() => { if (selectedDepartment !== account.DepartmentId) setSelectedDepartment(account.DepartmentId) }}
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
        <Box>
          <Stack direction='row' mb={2} gap={1}>
            <Typography fontWeight={500}>
              Manager:
            </Typography>
            <Typography>
              {Object.values(manager).length > 0 && manager?.Name + ' (' + manager?.Email + ') '}
            </Typography>
          </Stack>
          <Stack>
            {loadSubject && <HashLoader size={40} color={green[600]} />}
            {!loadSubject &&
              <Paper sx={{ minWidth: 700, mb: 2 }}>
                <TableContainer component={Stack} overflow='auto'>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell className='subject-header'>Code</TableCell>
                        <TableCell className='subject-header'>Name</TableCell>
                        <TableCell className='subject-header' align='center'>Department</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        subjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((subject) => (
                            <TableRow key={subject.Id} hover>
                              <TableCell>{subject.Id}</TableCell>
                              <TableCell>{subject.SubjectName}</TableCell>
                              <TableCell align='center'>{subject.DepartmentId}</TableCell>
                            </TableRow>
                          ))
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[10, subjects.length]}
                  component='div'
                  count={subjects.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage={<span>Rows:</span>}
                  showFirstButton
                  showLastButton
                  sx={{
                    bgcolor: 'ghostwhite'
                  }}
                />
              </Paper>}
          </Stack>
        </Box>
      </Box>
    </Stack>
  )
}

export default Department