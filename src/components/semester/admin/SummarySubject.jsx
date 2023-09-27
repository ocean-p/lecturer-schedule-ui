import { Box, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useEffect, useState } from 'react';
import request from '../../../utils/request';

const SummarySubject = ({semesterId, scheduleId}) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);

  useEffect(() => {
    request.get('Department', {
      params: {sortBy: 'Id', order: 'Asc', pageIndex: 1, pageSize: 100}
    }).then(res => {
      if(res.data.length > 0){
        setDepartments(res.data)
        setSelectedDepartment(res.data[0]?.Id)
      }
    }).catch(err => {alert('Fail to get departments')})
  }, [])

  useEffect(() => {
    if(selectedDepartment){
      request.get('Subject', {
        params: {DepartmentId: selectedDepartment, sortBy: 'Id', order: 'Asc',
          pageIndex: 1, pageSize: 100}
      }).then(res => {
        if(res.data.length > 0){
          setSubjects(res.data)
        }
      }).catch(err => {alert('Fail to get subjects')})
    }
  }, [selectedDepartment])

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

  useEffect(() => {
    request.get('CourseAssign', {
      params: {ScheduleId: scheduleId, sortBy: 'CourseId', order: 'Asc',
        pageIndex:1, pageSize:1000}
    }).then(res => {
      if(res.status === 200){
        setAssignedCourses(res.data)
      }
    }).catch(err => {alert('Fail to get assigned courses')})
  }, [scheduleId])

  return (
    <Stack px={9} height='90vh'>
      <Stack direction='row' mb={1} alignItems='center' justifyContent='space-between'>
        <Stack direction='row' alignItems='center' gap={1}>
          <Typography fontWeight={500}>Department:</Typography>
          <Select color='success' size='small'
            value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            {departments.map(department => (
                <MenuItem key={department.Id} value={department.Id}>
                  {department.DepartmentName}</MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack direction='row' gap={1}>
          <Typography fontWeight={500}>Total:</Typography>
          <Typography>{subjects.length}</Typography>
        </Stack>
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
                  <TableCell className='subject-header' align='center'>
                    Total Assigned Courses</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.length > 0 &&
                  subjects.map(subject => (
                    <TableRow hover key={subject.Id}>
                      <TableCell>{subject.Id}</TableCell>
                      <TableCell className='request-border'>{subject.SubjectName}</TableCell>
                      <TableCell className='request-border' align='center'>
                        {courses.filter(course => course.SubjectId === subject.Id).length}</TableCell>
                      <TableCell align='center'>
                        {assignedCourses.length > 0 &&
                          assignedCourses.filter(course => course.CourseId.split('_')[0] === subject.Id).length}
                        {assignedCourses.length === 0 && '0'}
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

export default SummarySubject