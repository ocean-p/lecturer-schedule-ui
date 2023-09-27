import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import { green, grey } from '@mui/material/colors'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CountUp from 'react-countup'
import request from '../../utils/request'
import './Home.css'
import { Check } from '@mui/icons-material'

const ManagerHome = ({admin}) => {
  const navigate = useNavigate();
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [semester, setSemester] = useState({});
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  //get current semester
  useEffect(() => {
    request.get('Semester', {
      params: {
        sortBy: 'DateEnd', order: 'Des',
        pageIndex: 1, pageSize: 100
      }
    }).then(res => {
      if (res.data.length > 0) {
        const data = res.data
        for (let i in data) {
          if (data[i].DateStatus.toLowerCase() === 'on going') {
            setSemester(data[i]);
            break;
          }
        }
      }
    }).catch(err => {alert('Fail to load semesters!')})
  }, [])

  //get list departments
  useEffect(() => {
    request.get('Department', {
      params: {
        sortBy: 'Id', order: 'Asc', pageIndex: 1, pageSize: 100
      }
    }).then(res => {
      if(res.data){
        setDepartments(res.data);
      }
    }).catch(err => alert('Fail to load departments'))
  }, [])

  //get list subjects
  useEffect(() => {
    request.get('Subject', {
      params: {
        sortBy: 'Id', order: 'Asc', pageIndex: 1, pageSize: 1000
      }
    }).then(res => {
      if(res.data){
        setSubjects(res.data);
      }
    }).catch(err => alert('Fail to load subjects'))
  }, [])

  //get list lecturers
  useEffect(() => {
    request.get('User', {
      params: {
        RoleIDs: 'LC', sortBy: 'Name', order: 'Asc', pageIndex: 1, pageSize: 1000
      }
    }).then(res => {
      if(res.data){
        setLecturers(res.data);
      }
    }).catch(err => alert('Fail to load lecturers'))
  }, [])

  const toSemester = () => {
    if(admin){navigate('/admin/semester')}
    else{navigate('/manager/semester')}
  }

  const toDepartment = () => {
    if(admin) navigate('/admin/department')
    else navigate('/manager/department')
  }

  const toSubject = () => {
    if(admin) navigate('/admin/subject')
    else navigate('/manager/subject')
  }

  const toLecturer = () => {
    if(admin) navigate('/admin/lecturer')
    else navigate('/manager/lecturer')
  }

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Typography px={9} variant='h5' mt={1} mb={6}>
        Welcome {admin ? 'Admin' : 'Department Manager'}, {account.Name}
      </Typography>
      <Stack direction='row' px={9} gap={2} flexWrap='wrap' mb={4}>
        <Stack flex={1} className='summary-box' alignItems='center'>
          <Typography mt={1} color={grey[700]}>Current Semester</Typography>
          <Typography variant='h5' my={2}>{semester.Term}</Typography>
          <Button variant='contained' size='small' color='success' sx={{mb: 1}}
            onClick={toSemester}>
            Go to Semester
          </Button>
        </Stack>
        <Stack flex={1} className='summary-box' alignItems='center'>
          <Typography mt={1} color={grey[700]}>Total Departments</Typography>
          <Typography variant='h5' my={2}>
            <CountUp end={departments.length || 0} duration={0.5}/>
          </Typography>
          <Button variant='contained' size='small' color='success' sx={{mb: 1}}
            onClick={toDepartment}>
            Go to Department</Button>
        </Stack>
        <Stack flex={1} className='summary-box' alignItems='center'>
          <Typography mt={1} color={grey[700]}>Total Subjects</Typography>
          <Typography variant='h5' my={2}>
            <CountUp end={subjects.length || 0} duration={1}/>
          </Typography>
          <Button variant='contained' size='small' color='success' sx={{mb: 1}}
            onClick={toSubject}>
            Go to Subject</Button>
        </Stack>
        <Stack flex={1} className='summary-box' alignItems='center'>
          <Typography mt={1} color={grey[700]}>Total Lecturers</Typography>
          <Typography variant='h5' my={2}>
            <CountUp end={lecturers.length || 0} duration={1}/>
          </Typography>
          <Button variant='contained' size='small' color='success' sx={{mb: 1}}
            onClick={toLecturer}>
            Go to Lecturer</Button>
        </Stack>
      </Stack>
      <Stack px={9}>
        <Paper sx={{ minWidth: 700, mb: 2 }}>
          <TableContainer component={Box}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className='subject-header'>Departments</TableCell>
                  <TableCell className='subject-header' align='center'>Total Subjects</TableCell>
                  <TableCell className='subject-header' align='center'>Total Lecturers</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
               {departments.map(department => (
                <TableRow key={department.Id} hover>
                  <TableCell>
                    <Stack direction='row' alignItems='center' gap={2}>
                    <span>{department.DepartmentName}</span>
                    {!admin && account.DepartmentId === department.Id &&
                      <Tooltip title='My Department' placement='right' arrow>
                        <Check sx={{ color: green[600] }} />
                      </Tooltip>}
                    </Stack>
                  </TableCell>
                  <TableCell align='center'>
                    {subjects.filter(subject => subject.DepartmentId === department.Id).length}
                  </TableCell>
                  <TableCell align='center'>
                    {lecturers.filter(lecturer => lecturer.DepartmentId === department.Id).length}
                  </TableCell>
                </TableRow>
               ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>
    </Stack>
  )
}

export default ManagerHome