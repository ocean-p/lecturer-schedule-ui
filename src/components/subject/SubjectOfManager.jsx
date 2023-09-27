import { Beenhere } from '@mui/icons-material';
import { Box, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from '@mui/material'
import { green, grey } from '@mui/material/colors';
import { useEffect, useState } from 'react';
import { HashLoader } from 'react-spinners';
import Title from '../title/Title'
import request from '../../utils/request';

const SubjectOfManager = () => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [page, setPage] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState(account.DepartmentId);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [manager, setManager] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadDepart, setLoadDepart] = useState(false);
  const [loadSubject, setLoadSubject] = useState(false);

  //get department list
  useEffect(() => {
    const getDepartments = async () => {
      setLoadDepart(true);
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
          setLoadDepart(false);
        }
      }
      catch (error) {
        alert('Fail to get Department!')
        setLoadDepart(false)
      }
    }

    getDepartments();
  }, [account.DepartmentId])

  //get list subject by departments
  useEffect(() => {
    setLoadSubject(true)
    const getSubjects = async () => {
      try {
        const response = await request.get('Subject', {
          params: {
            DepartmentId: selectedDepartment, sortBy: 'Id', order: 'Asc',
            pageIndex: 1, pageSize: 1000
          }
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

    if(selectedDepartment){
      getSubjects();
    }
  }, [selectedDepartment])

  useEffect(() => {
    if(subjects.length > 0){
      setRowsPerPage(subjects.length)
    }
  }, [subjects])

  //get manager of department
  useEffect(() => {
    if (selectedDepartment) {
      request.get('User', {
        params: {
          DepartmentId: selectedDepartment, RoleIDs: 'DMA',
          pageIndex: 1, pageSize: 1
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

  const myDepartment = () => {
    if (selectedDepartment !== account.DepartmentId){
      setSelectedDepartment(account.DepartmentId)
      setPage(0);
    }
  }

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Stack px={9} mt={1} mb={4}>
        <Title title='Subject' subTitle='All subjects in my department and relative departments'/>
      </Stack>
      <Stack px={9} direction='row' alignItems='center' mb={2} gap={2}>
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
      <Stack direction='row' px={9} mb={2} gap={1}>
        <Typography fontWeight={500}>Manager:</Typography>
        <Typography>{Object.values(manager).length > 0 && manager?.Name + ' (' + manager?.Email + ') '}</Typography>
      </Stack>
      <Stack px={9} mb={2}>
        {(loadDepart || loadSubject) && <HashLoader size={30} color={green[600]}/>}
        {!loadDepart && !loadSubject && <Paper sx={{ minWidth: 700 }}>
          <TableContainer component={Box} sx={{ overflow: 'auto' }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className='subject-header'>
                    Code </TableCell>
                  <TableCell className='subject-header'>
                    Name </TableCell>
                  <TableCell className='subject-header' align='center'>
                    Department</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((subject) => (
                    <TableRow key={subject.Id} hover>
                      <TableCell>{subject.Id}</TableCell>
                      <TableCell>{subject.SubjectName}</TableCell>
                      <TableCell align='center'>{subject.DepartmentId}</TableCell>
                    </TableRow>
                ))}
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

export default SubjectOfManager