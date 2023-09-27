import { Alert, Button, Dialog, DialogContent, DialogTitle, MenuItem, Select, Stack, Typography } from '@mui/material'
import { green, grey } from '@mui/material/colors'
import { useState, useEffect, useMemo  } from 'react'
import ScheduleAdmin from './admin/ScheduleAdmin'
import FeedbackSelection from '../feedback/FeedbackSelection'
import SlotManage from './SlotManage';
import { Check, Close } from '@mui/icons-material'
import request from '../../utils/request'
import AssignmentContainer from './AssignmentContainer'
import CourseNumber from './CourseNumber'
import GetCourse from '../swap/GetCourse'

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const InforModal = ({ isSelected, setIsSelected, semester, selectedLecturer, admin, myCourseGroup, scheduleId }) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [selected, setSelected] = useState(tabs[0].name)
  const [allSubjects, setAllSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedLec, setSelectedLec] = useState('');
  const passLec = useMemo(() => {
    if (selectedLec && lecturers.length > 0) {
      for (let i in lecturers) {
        if (lecturers[i].Id === selectedLec) {
          return lecturers[i]
        }
      }
    }
    return {}
  }, [lecturers, selectedLec])
  const [assignedCourses, setAssignedCourses] = useState([])
  const [lecGroup, setLecGroup] = useState({})
  const [refreshCourse, setRefreshCourse] = useState(false)

  //get all subjects
  useEffect(() => {
    request.get('Subject', {
      params: {sortBy: 'Id', order:'Asc', pageIndex:1, pageSize:1000}
    }).then(res => {
      if(res.data){
        setAllSubjects(res.data)
      }
    }).catch(err => alert('Fail to get all subjects'))
  }, [])

  //get lecturers by department
  useEffect(() => {
    if(selectedLecturer.Id){
      setSelectedLec(selectedLecturer.Id)
      request.get('User', {
        params: {DepartmentId: selectedLecturer.DepartmentId, RoleIDs:'LC', sortBy:'Id', 
          order: 'Asc', pageIndex:1, pageSize:100}
      }).then(res => {
        if(res.status === 200){
          setLecturers(res.data)
        }
      }).catch(err => {alert('Fail to get lecturers')})
    }
  }, [selectedLecturer])

  //get all assign course after generate schedule
  useEffect(() => {
    if(scheduleId && passLec.Id){
      request.get('CourseAssign', {
        params: {ScheduleId: scheduleId, LecturerId: passLec.Id,  
          pageIndex: 1, pageSize: 500}
      }).then(res => {
        if(res.data.length > 0){
          setAssignedCourses(res.data)
        }
      }).catch(err => {alert('Fail to get assigned courses of lecturers')})
    }
  }, [scheduleId, passLec.Id, refreshCourse])

  //get lecturer course group to show min max course
  useEffect(() => {
    if(semester.Id && passLec.Id){
      request.get('LecturerCourseGroup', {
        params: {SemesterId: semester.Id, LecturerId: passLec.Id,
          pageIndex:1, pageSize:1}
      }).then(res => {
        if(res.data.length > 0){
          setLecGroup(res.data[0])
        }
      }).catch(err => {alert('Fail to get min max course of lecturer')})
    }
  }, [semester.Id, passLec.Id, refreshCourse])

  return (
    <Dialog maxWidth='lg' fullWidth={true}
      open={isSelected} onClose={() => setIsSelected(false)}>
      <DialogTitle>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={1}>
          <Typography variant='h5' fontWeight={500}>Lecturer In Semester: {semester.Term}</Typography>
          <Button variant='outlined' endIcon={<Close/>} size='small' color='error'
            onClick={() => setIsSelected(false)}>
            Close</Button>
        </Stack>
        {(!admin && (selectedLecturer.DepartmentId !== account.DepartmentId)) && 
          <Alert severity='warning'>This lecturer is external</Alert>}
      </DialogTitle>
      <DialogContent>
        <Stack mb={1} direction='row' gap={2} alignItems='center'>
          <Stack direction='row' alignItems='center' gap={1}>
            <Typography fontWeight={500}>Name:</Typography>
            <Select size='small' color='success' MenuProps={MenuProps} sx={{width: '230px'}}
              value={selectedLec} onChange={(e) => setSelectedLec(e.target.value)}>
              {lecturers.map(lec => (
                <MenuItem key={lec.Id} value={lec.Id}>{lec.Name}</MenuItem>
              ))}
            </Select>
          </Stack>
          <Typography><span style={{fontWeight:500}}>Department:</span> {passLec.DepartmentName}</Typography>
        </Stack>
        <Stack mb={2} direction='row' gap={2} alignItems='center'>
          <Typography><span style={{fontWeight:500}}>Email:</span> {passLec.Email}</Typography>
          <Stack direction='row' gap={1} alignItems='center'>
            <Typography fontWeight={500}>Full-time:</Typography>
            {passLec.IsFullTime === 1 ? <Check/> : <Close/>}
          </Stack>
          <Stack direction='row' gap={1}>
            <Typography fontWeight={500}>Courses: </Typography>
            <Typography>{assignedCourses.length} ({lecGroup.MinCourse} - {lecGroup.MaxCourse})</Typography>
          </Stack>
        </Stack>
        <Stack direction='row' gap={4} borderBottom='1px solid #e3e3e3' mb={2}>
          <Typography color={selected === tabs[0].name ? green[600] : grey[500]} py={0.5}
            borderBottom={selected === tabs[0].name && `4px solid ${green[600]}`}
            fontSize='20px' onClick={() => setSelected(tabs[0].name)}
            sx={{ '&:hover': { cursor: 'pointer', color: green[600] } }}>
            {tabs[0].name}
          </Typography>
          {!admin && semester.State === 5 && selectedLecturer.DepartmentId === account.DepartmentId &&
            myCourseGroup.GroupName !== 'confirm' &&
            <Typography color={selected === tabs[5].name ? green[600] : grey[500]} py={0.5}
              borderBottom={selected === tabs[5].name && `4px solid ${green[600]}`}
              fontSize='20px' onClick={() => setSelected(tabs[5].name)}
              sx={{ '&:hover': { cursor: 'pointer', color: green[600] } }}>
              {tabs[5].name}
            </Typography>
          }
          <Typography color={selected === tabs[1].name ? green[600] : grey[500]} py={0.5}
            borderBottom={selected === tabs[1].name && `4px solid ${green[600]}`}
            fontSize='20px' onClick={() => setSelected(tabs[1].name)}
            sx={{ '&:hover': { cursor: 'pointer', color: green[600] } }}>
            {tabs[1].name}
          </Typography>
          {(admin || selectedLecturer.DepartmentId === account.DepartmentId) &&<>
          <Typography color={selected === tabs[2].name ? green[600] : grey[500]} py={0.5}
            borderBottom={selected === tabs[2].name && `4px solid ${green[600]}`}
            fontSize='20px' onClick={() => setSelected(tabs[2].name)}
            sx={{ '&:hover': { cursor: 'pointer', color: green[600] } }}>
            {tabs[2].name}
          </Typography>
          <Typography color={selected === tabs[3].name ? green[600] : grey[500]} py={0.5}
            borderBottom={selected === tabs[3].name && `4px solid ${green[600]}`}
            fontSize='20px' onClick={() => setSelected(tabs[3].name)}
            sx={{ '&:hover': { cursor: 'pointer', color: green[600] } }}>
            {tabs[3].name}
          </Typography>
          <Typography color={selected === tabs[4].name ? green[600] : grey[500]} py={0.5}
            borderBottom={selected === tabs[4].name && `4px solid ${green[600]}`}
            fontSize='20px' onClick={() => setSelected(tabs[4].name)}
            sx={{ '&:hover': { cursor: 'pointer', color: green[600] } }}>
            {tabs[4].name}
          </Typography>
          </>}
        </Stack>
        {selected === tabs[0].name && <ScheduleAdmin lecturerId={passLec.Id} myCourseGroup={myCourseGroup}
          lecturerDepart={selectedLecturer.DepartmentId} semester={semester} admin={admin}/>}

        {selected === tabs[1].name && <AssignmentContainer lecturer={passLec} semester={semester} 
          allSubjects={allSubjects} admin={admin} myCourseGroup={myCourseGroup} setRefreshCourse={setRefreshCourse}/>}

        {selected === tabs[2].name && <FeedbackSelection lecturer={passLec} semester={semester} admin={admin}/>}

        {selected === tabs[3].name && <SlotManage lecturer={passLec} semester={semester} admin={admin}/>}

        {selected === tabs[4].name && <CourseNumber lecturer={passLec} setRefreshCourse={setRefreshCourse}
          semesterId={semester.Id} semesterState={semester.State} admin={admin}/>}
          
        {selected === tabs[5].name && <GetCourse semesterId={semester.Id} semesterState={semester.State}
          lecturer={passLec} myCourseGroup={myCourseGroup} setRefreshCourse={setRefreshCourse}/>}
      </DialogContent>
    </Dialog>
  )
}

export default InforModal

const tabs = [
  { id: 1, name: 'Schedule' },
  { id: 2, name: 'Assignment'},
  { id: 3, name: 'Subject Evaluation' },
  { id: 4, name: 'Preference Slot' },
  { id: 5, name: 'Course Number'},
  { id: 6, name: 'Get Course'},
]