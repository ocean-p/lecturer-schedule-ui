import { ArrowBackIosNew, Check, HorizontalRule, Refresh } from '@mui/icons-material'
import { Button, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { blue, green, grey } from '@mui/material/colors'
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {ConfirmModal, CourseList, SlotType, SummarySubject, 
  ViewConfirm} from '../admin'
import Title from '../../title/Title'
import LecturerContainer from '../manager/LecturerContainer'
import Alert from '../../alert/Alert'
import request from '../../../utils/request'

const SemesterDetailAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selected, setSelected] = useState('courses')
  const [semester, setSemester] = useState({});
  const [isConfirm, setIsConfirm] = useState(false);
  const [content, setContent] = useState('');
  const [mode, setMode] = useState('');
  const [schedule, setSchedule] = useState({});
  const [slotTypes, setSlotTypes] = useState([]);
  const [courseNumber, setCourseNumber] = useState(0);
  const [isAlert, setIsAlert] = useState(false);
  const [contentAlert, setContentAlert] = useState('');
  const [reloadCourseNumber, setReloadCourseNumber] = useState(false);
  const [refresh, setRefresh] = useState(false)

  //set semester
  useEffect(() => {
    request.get(`Semester/${id}`)
      .then(res => {
        if (res.data) {
          setSemester(res.data);
        }
      })
      .catch(err => {
        alert('Fail to load semester')
      })
  }, [id, isConfirm, refresh])

  //set schedule
  useEffect(() => {
    request.get('Schedule', {
      params: {SemesterId: id, pageIndex: 1, pageSize: 10}
    })
    .then(res => {
      if(res.data.length > 0) setSchedule(res.data[0])
    })
    .catch(err => alert('Fail to get schedule'))
  }, [id])

  //get list slot types by semester
  useEffect(() => {
    request.get('SlotType', {
      params: {
        SemesterId: id, sortBy: 'DayOfWeekAndTimeStart', order: 'Asc',
        pageIndex: 1, pageSize: 100
      }
    }).then(res => {
      if (res.data) setSlotTypes(res.data);
    }).catch(err => alert('Fail to load slottype'))
  }, [id])

  //get course number
  useEffect(() => {
    setCourseNumber(0)
    if(id){
      request.get('Course', {
        params: {SemesterId: id, sortBy: 'Id', order: 'Asc',
          pageIndex: 1, pageSize: 1000}
      }).then(res => {
        if(res.data.length > 0){
          setCourseNumber(res.data.length)
        }
      }).catch(err => {alert('Fail to get course number')})
    }
  }, [id, reloadCourseNumber])

  const backToSemester = () => {
    navigate('/admin/semester')
  }

  const clickNextState = () => {
    if(semester.State === 6) return;

    setMode('next');
    if(semester.State === 1){
      if(courseNumber === 0){
        setContentAlert('The course number in this semester is 0. Please import or add courses to change to Voting state.')
        setIsAlert(true)
      }
      else{
        setContent('Next state is Voting. Lecturers can rate subjects, slots and send requests.')
        setIsConfirm(true)
      }
    } 
    else if(semester.State === 2) setContent('Next state is Evaluating. Department Managers can evaluate subjects, courses and slots to Lecturers. ')
    else if(semester.State === 3) setContent('Next state is Blocked. All functions are blocked to begin generating schedule.')
    else if(semester.State === 4){
      request.get('CourseAssign', {
        params: {ScheduleId: schedule.Id ,isAssign: 0, 
          pageIndex: 1, pageSize: 1000}
      }).then(res => {
        if(res.status === 200){
          if(res.data.length > 0){
            setContent('Next state is Adjusting. The schedule will be shown for Lecturers and Department Managers. The Managers can adjust the schedule.')
            setIsConfirm(true);
          }
          else{
            setContentAlert('Please send schedule from winform app before changing to Adjusting state.')
            setIsAlert(true)
          }
        }
      }).catch(err => {})
    } 
    else{
      checkPublic();
    } 
    
    if(semester.State !== 1 && semester.State !== 4 && semester.State !== 5){
      setIsConfirm(true);
    }
  }

  const clickPrevState = () => {
    if(semester.State === 1) return;

    setMode('prev')
    if(semester.State === 6) setContent('Previous state is Adjusting. The schedule will be shown for Lecturers and Department Managers. The Managers can adjust the schedule.')
    else if(semester.State === 5) setContent('Previous state is Blocked. All functions are blocked to begin generating schedule.')
    else if(semester.State === 4) setContent('Previous state is Evaluating. Department Managers can evaluate subjects, courses and slots to Lecturers.')
    else if(semester.State === 3) setContent('Previous state is Voting. Lecturers can rate subjects, slots and send requests.')
    else setContent('Previous state is New.')
    setIsConfirm(true);
  }

  const saveNextState = () => {
    if(semester.State === 6) return;

    if(semester.State === 5){
      request.put(`Schedule/${schedule.Id}`, {
        IsPublic: 1, SemesterId: id,
        Description: '', DateCreate: ''
      }).then(res => {

      }).catch(err => {alert('Fail to public schedule')})
    }

    if(semester.State === 3){
      request.put(`Request/UpdateAllRequestWaiting/${semester.Id}`)
      .then(res => {

      })
      .catch(err => {})
    }

    if(semester.State === 4){
      request.put(`LecturerCourseGroup/UpdateAllGroupNameNotConfirm/${id}`)
      .then(res => {})
    }

    request.put(`Semester/${id}`, {
      Term: semester.Term, DateStart: semester.DateStart,
      DateEnd: semester.DateEnd, State: (semester.State + 1)
    }).then(res => {
      if (res.status === 200) {
        setIsConfirm(false)
        toast.success('Success to change next state!', {
          position: "top-right", autoClose: 2000, hideProgressBar: false, closeOnClick: true,
          pauseOnHover: true, draggable: true, progress: undefined, theme: "light",
        });
      }
    }).catch(err => {
      alert('Fail to change next state')
      setIsConfirm(false)
    })
  }

  const savePrevState = () => {
    if(semester.State === 1) return;

    if(semester.State === 6){
      request.put(`Schedule/${schedule.Id}`, {
        IsPublic: 0, SemesterId: id,
        Description: '', DateCreate: ''
      }).then(res => {})

      request.put(`LecturerCourseGroup/UpdateAllGroupNameNotConfirm/${id}`)
      .then(res => {})
    }

    if(semester.State === 4){
      request.put(`Request/RollBackToUpdateAllRequestWaiting/${semester.Id}`)
      .then(res => {

      })
      .catch(err => {alert('Fail to return state of request')})
    }

    request.put(`Semester/${id}`, {
      Term: semester.Term, DateStart: semester.DateStart,
      DateEnd: semester.DateEnd, State: (semester.State - 1)
    }).then(res => {
      if (res.status === 200) {
        setIsConfirm(false)
        toast.success('Success to return previous state', {
          position: "top-right", autoClose: 2000, hideProgressBar: false, closeOnClick: true,
          pauseOnHover: true, draggable: true, progress: undefined, theme: "light",
        });
      }
    }).catch(err => {
      alert('Fail to return previous state')
      setIsConfirm(false)
    })
  }

  const checkPublic = async() => {
    try{
      const resCheckCourse = await request.get(`CheckConstraint/CheckSemesterPublic/${id}`)
      const checkCourse = resCheckCourse.data
      const resCheckAllConfirm = await request.get(`CheckConstraint/CheckAllDepartmentManagerConfirm/${id}`)
      const checkAllConfirm = resCheckAllConfirm.data
      if (checkAllConfirm.message && checkCourse.message) {
        if (checkAllConfirm.success === false) {
          setContentAlert('All department managers have not confirmed schedule yet.')
          setIsAlert(true)
        }
        else if (checkCourse.success === false) {
          setContentAlert('Please check again about course constraint.')
          setIsAlert(true)
        }
        else {
          setContent('Next state is Public. The schedule will be public and can not be edited.')
          setIsConfirm(true);
        }
      }
    }catch(err){

    }
  }

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Stack direction='row' justifyContent='space-between' mt={1} alignItems='center'>
        <Stack direction='row' alignItems='center' gap={4}>
          <Tooltip title='Back to Semester'>
            <IconButton onClick={backToSemester}>
              <ArrowBackIosNew />
            </IconButton>
          </Tooltip>
          <Stack direction='row' alignItems='center' gap={1}>
            <Title title={`Semester: ${semester.Term ? semester.Term : ''}`} />
            <span>|</span>
            <Tooltip title='refresh' placement='top' arrow>
              <IconButton size='small' onClick={() => setRefresh(pre => !pre)}>
                <Refresh/></IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Stack pr={9} direction='row' gap={1}>
          {semester.State !== 1 && 
            <Button variant='outlined' color='info' size='small' onClick={clickPrevState}>
            Previous State</Button>}
          {semester.State !== 6 && 
            <Button variant='contained' color='error' size='small' onClick={clickNextState}>
            Next State</Button>}
        </Stack>
      </Stack>
      <Stack px={11} gap={1} mb={1}>
        <Typography><span style={{fontWeight: 500}}>Start:</span> {' '}
          {semester.DateStartFormat && semester.DateStartFormat.split('-').reverse().join('/')}
        </Typography>
        <Typography><span style={{fontWeight: 500}}>End:</span> {' '}
          {semester.DateEndFormat && semester.DateEndFormat.split('-').reverse().join('/')}
        </Typography>
        <Typography><span style={{fontWeight: 500}}>Time Status:</span> {semester.DateStatus}</Typography>
      </Stack>
      <Stack px={9} mb={2}>
        <Stack direction='row' gap={1} border='1px solid #e3e3e3' py={0.5} borderRadius={2}
          justifyContent='center' flexWrap='wrap'>
          {states.map(state => (
            <Stack key={state.id} direction='row' alignItems='center' gap={1}>
              <Stack width={40} height={40} borderRadius='50%' alignItems='center' justifyContent='center'
                bgcolor={semester.State >= state.id ? blue[600] : grey[300]}>
                {semester.State >= state.id && <Check sx={{ color: 'white' }} />}
              </Stack>
              <Typography>{state.name}</Typography>
              {state.id !== 6 && <HorizontalRule />}
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Stack px={9} mb={2}>
        <Stack direction='row' gap={6} borderBottom='1px solid #e3e3e3'>
          <Typography color={selected === 'courses' ? green[600] : grey[500]} py={0.5}
            borderBottom={selected === 'courses' && `4px solid ${green[600]}`}
            fontSize='20px' onClick={() => setSelected('courses')}
            sx={{ '&:hover': { cursor: 'pointer', color: green[600] } }}>
            Courses
          </Typography>
          <Typography color={selected === 'subjects' ? green[600] : grey[500]} py={0.5}
            borderBottom={selected === 'subjects' && `4px solid ${green[600]}`}
            fontSize='20px' onClick={() => setSelected('subjects')}
            sx={{ '&:hover': { cursor: 'pointer', color: green[600] } }}>
            Subjects
          </Typography>
          <Typography color={selected === 'slot' ? green[600] : grey[500]} py={0.5}
            borderBottom={selected === 'slot' && `4px solid ${green[600]}`}
            fontSize='20px' onClick={() => setSelected('slot')}
            sx={{ '&:hover': { cursor: 'pointer', color: green[600] } }}>
            Slot Type
          </Typography>
          <Typography color={selected === 'lecturers' ? green[600] : grey[500]} py={0.5}
            borderBottom={selected === 'lecturers' && `4px solid ${green[600]}`}
            fontSize='20px' onClick={() => setSelected('lecturers')}
            sx={{ '&:hover': { cursor: 'pointer', color: green[600] } }}>
            Lecturers</Typography>
          {semester.State === 5 && 
          <Typography color={selected === 'confirm' ? green[600] : grey[500]} py={0.5}
            borderBottom={selected === 'confirm' && `4px solid ${green[600]}`}
            fontSize='20px' onClick={() => setSelected('confirm')}
            sx={{ '&:hover': { cursor: 'pointer', color: green[600] } }}>
            Confirmation</Typography>}
        </Stack>
      </Stack>
      {selected === 'courses' && <CourseList semesterId={id} scheduleId={schedule.Id} refresh={refresh}
        slotTypes={slotTypes} semesterState={semester.State} setReloadCourseNumber={setReloadCourseNumber}/>}
      {selected === 'subjects' && <SummarySubject semesterId={id} scheduleId={schedule.Id}/>}
      {selected === 'slot' && <SlotType semesterId={id} />}
      {selected === 'lecturers' && <LecturerContainer semester={semester} admin={true} 
        scheduleId={schedule.Id} refresh={refresh}/>}
      {selected === 'confirm' && <ViewConfirm semesterId={semester.Id} semesterState={semester.State}
        refresh={refresh}/>}
      <ConfirmModal isConfirm={isConfirm} setIsConfirm={setIsConfirm} content={content} 
        mode={mode} saveNextState={saveNextState} savePrevState={savePrevState} />
      <Alert isAlert={isAlert} setIsAlert={setIsAlert} contentAlert={contentAlert}/>
      <ToastContainer />
    </Stack>
  )
}

export default SemesterDetailAdmin

const states = [
  {id: 1, name: 'New'},
  {id: 2, name: 'Voting'},
  {id: 3, name: 'Evaluating'},
  {id: 4, name: 'Blocked'},
  {id: 5, name: 'Adjusting'},
  {id: 6, name: 'Public'},
]