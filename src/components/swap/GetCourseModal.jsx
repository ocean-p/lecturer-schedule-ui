import { Box, Button, Dialog, DialogContent, DialogTitle, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import {ClipLoader} from 'react-spinners'
import { useEffect, useMemo, useState } from 'react'
import request from '../../utils/request'
import GetCourseConfirm from './GetCourseConfirm'

const GetCourseModal = ({isGet, setIsGet, insideLecs, pickedSlot, scheduleId, semesterId, lecturer, afterGet, setRefreshCourse}) => {
  const [slotCourses, setSlotCourses] = useState([])
  const [isConfirm, setIsConfirm] = useState(false)
  const [pickedCourse, setPickedCourse] = useState({})
  const [loadSave, setLoadSave] = useState(false)
  const [regisSubjects, setRegisSubjects] = useState([])

  const filterCourses = useMemo(() => {
    if(slotCourses.length > 0 && insideLecs.length > 0){
      let internal = slotCourses;
      let external = slotCourses;
      for(let i in insideLecs){
        external = external.filter(ex => ex.LecturerId !== insideLecs[i].Id)
      }
      for(let i in external){
        internal = internal.filter(inter => inter.LecturerId !== external[i].LecturerId)
      }
      return internal;
    }
    return []
  }, [slotCourses, insideLecs])

  //get course assign by scheduleId and slottype id
  useEffect(() => {
    if(scheduleId && pickedSlot.Id && regisSubjects.length > 0){
      request.get('CourseAssign', {
        params: {ScheduleId: scheduleId, SlotTypeId: pickedSlot.Id,
          sortBy: 'LecturerId', order: 'Asc', pageIndex: 1, pageSize: 500}
      }).then(res => {
        if(res.data.length > 0){
          let regis = res.data
          let unregis = res.data
          for(let i in regisSubjects){
            unregis = unregis.filter(item => item.CourseId.split('_')[0] !== regisSubjects[i].SubjectId)
          }
          for(let i in unregis){
            regis = regis.filter(item => item.CourseId !== unregis[i].CourseId)
          }
          setSlotCourses(regis)
        }
      }).catch(err => {alert('Fail to get courses of other lecturers')})
    }
  }, [scheduleId, pickedSlot.Id, regisSubjects])

  //get registered subjects
  useEffect(() => {
    if(semesterId && lecturer.Id){
      request.get('SubjectOfLecturer', {
        params: {SemesterId: semesterId, LecturerId: lecturer.Id, isEnable: 1, 
          sortBy: 'SubjectId', order: 'Asc', pageIndex:1, pageSize:100}
      }).then(res => {
        if(res.data.length > 0){
          setRegisSubjects(res.data)
        }
      }).catch(err => {alert('Fail to get registered subjects');})
    }
  }, [semesterId, lecturer.Id])

  const clickGet = (course) => {
    setPickedCourse(course);
    setIsConfirm(true);
  }

  const handleGet = () => {
    if(pickedCourse.Id){
      setIsConfirm(false)
      setLoadSave(true)
      request.put(`CourseAssign/${pickedCourse.Id}`, {
        LecturerId: lecturer.Id, CourseId: pickedCourse.CourseId,
        SlotTypeId: pickedCourse.SlotTypeId, ScheduleId: pickedCourse.ScheduleId,
        isAssign: pickedCourse.isAssign
      }).then(res => {
        if(res.status === 200){
          setRefreshCourse(pre => !pre)
          setIsGet(false)
          setLoadSave(false)
          afterGet(true)
        }
      }).catch(err => {alert('Fail to get course'); setLoadSave(false)})
    }
  }

  return (
    <Dialog maxWidth='md' fullWidth={true}
      open={isGet} onClose={() => setIsGet(false)}>
      <DialogTitle variant='h5' fontWeight={500}>
        Courses from other internal lecturers
      </DialogTitle>
      <DialogContent>
        <Stack>
          <Stack direction='row' justifyContent='space-between' mb={1}>
            <Typography><span style={{fontWeight: 500}}>Courses in slot:</span> {' '}
              {pickedSlot.SlotTypeCode}, {pickedSlot.Duration}, {pickedSlot.ConvertDateOfWeek}
            </Typography>
            <Typography>
              Total: {filterCourses.length}
            </Typography>
          </Stack>
          <Paper sx={{ minWidth: 700, mb: 2 }}>
            <TableContainer component={Box}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell className='subject-header'>Course</TableCell>
                    <TableCell className='subject-header'>Lecturer</TableCell>
                    <TableCell className='subject-header' align='center'>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filterCourses.map(course => (
                    <TableRow key={course.Id} hover>
                      <TableCell>{course.CourseId}</TableCell>
                      <TableCell>{course.LecturerId} - {course.LecturerName}</TableCell>
                      <TableCell align='center'>
                        {loadSave ? (pickedCourse.Id === course.Id ? 
                          <Button size='small' variant='contained'>
                            <ClipLoader size={20} color='white'/>
                          </Button> : 
                          <Button size='small' variant='contained' disabled={true}>
                            Get</Button>) : 
                          <Button variant='contained' size='small' onClick={() => clickGet(course)}>
                            Get</Button>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      </DialogContent>
      <GetCourseConfirm isConfirm={isConfirm} setIsConfirm={setIsConfirm} 
        pickedCourse={pickedCourse} lecturer={lecturer} handleGet={handleGet}/>
    </Dialog>
  )
}

export default GetCourseModal