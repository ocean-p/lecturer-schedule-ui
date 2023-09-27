import { Assignment, Try } from '@mui/icons-material';
import { Button, Stack } from '@mui/material'
import { useEffect, useState } from 'react';
import request from '../../utils/request';
import AssignmentList from '../assignment/AssignmentList';
import PriorityList from '../priority/PriorityList';

const AssignmentContainer = ({lecturer, semester, allSubjects, admin, myCourseGroup, setRefreshCourse}) => {
  const [selected, setSelected] = useState('fixed');
  const [lecCourseGroup, setLecCourseGroup] = useState({});

  useEffect(() => {
    if(semester.Id && lecturer.Id){
      request.get('LecturerCourseGroup', {
        params: {LecturerId: lecturer.Id, SemesterId: semester.Id, 
          pageIndex: 1, pageSize: 1}
      }).then(res => {
        if(res.data.length > 0){
          setLecCourseGroup(res.data[0])
        }
      }).catch(err => {alert('Fail to get min max course of lecturer')})
    }
  }, [semester.Id, lecturer.Id])

  return (
    <Stack>
      <Stack direction='row' gap={2} mb={2}>
        <Button variant={selected === 'fixed' ? 'contained' : 'outlined'} sx={{textTransform: 'none'}} 
          startIcon={<Assignment/>} onClick={() => setSelected('fixed')}>
          Fixed Courses
        </Button>
        <Button variant={selected === 'priority' ? 'contained' : 'outlined'} sx={{textTransform: 'none'}} 
          startIcon={<Try/>} onClick={() => setSelected('priority')}>
          Priority Courses
        </Button>
      </Stack>
      {selected === 'fixed' && <AssignmentList lecturer={lecturer} semester={semester} setRefreshCourse={setRefreshCourse}
        allSubjects={allSubjects} admin={admin} myCourseGroup={myCourseGroup} lecCourseGroup={lecCourseGroup}/>}
      {selected === 'priority' && <PriorityList lecturer={lecturer} semester={semester} 
          allSubjects={allSubjects} admin={admin}/>}
    </Stack>
  )
}

export default AssignmentContainer

