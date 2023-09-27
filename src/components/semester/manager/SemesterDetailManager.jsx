import { ArrowBackIosNew, Check, HorizontalRule, Refresh } from '@mui/icons-material'
import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { blue, green, grey } from '@mui/material/colors';
import React, { useState, useEffect } from 'react'
import LecturerContainer from './LecturerContainer';
import CourseList from './CourseList';
import { useNavigate, useParams } from 'react-router-dom';
import request from '../../../utils/request';
import Title from '../../title/Title';
import SubjectRequest from '../../subject/SubjectRequest';

const SemesterDetailManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(tabs[0].name);
  const [semester, setSemester] = useState({});
  const [schedule, setSchedule] = useState({});
  const [refresh, setRefresh] = useState(false)

  //get semester
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
  }, [id, refresh])

  //get schedule by semesterId
  useEffect(() => {
    request.get('Schedule', {
      params: { SemesterId: id, pageIndex: 1, pageSize: 10 }
    })
      .then(res => {
        if (res.data.length > 0) setSchedule(res.data[0])
      })
      .catch(err => alert('Fail to get schedule'))
  }, [id])

  const backToSemesters = () => {
    navigate('/manager/semester')
  }

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Stack mt={1} direction='row' justifyContent='space-between'>
        <Stack direction='row' alignItems='center' gap={4}>
          <Tooltip title='Back to Semester' arrow>
            <IconButton onClick={backToSemesters}>
              <ArrowBackIosNew />
            </IconButton>
          </Tooltip>
          <Stack direction='row' alignItems='center' gap={1}>
            <Title title={`Semester: ${semester.Term ? semester.Term  : ''}`} />
            <span>|</span>
            <Tooltip title='refresh' placement='top' arrow>
              <IconButton size='small' onClick={() => setRefresh(pre => !pre)}>
                <Refresh/></IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Stack pr={9} alignItems='center'>
          {semester.State === 1 &&
            <Typography bgcolor={blue[100]} p={1} borderRadius={2}>
              Semester has been created</Typography>}
          {semester.State === 2 &&
            <Stack bgcolor={blue[100]} p={0.5} alignItems='center' borderRadius={2}>
              <Typography>Voting is opened</Typography>
              <Typography>Lecturers are rating subjects and slots</Typography>
            </Stack>}
          {semester.State === 3 &&
            <Stack bgcolor={blue[100]} p={0.5} alignItems='center' borderRadius={2}>
              <Typography>Evaluating is opened</Typography>
              <Typography>Now you can evaluate to Lecturers</Typography>
            </Stack>}
          {semester.State === 4 &&
            <Stack bgcolor={blue[100]} p={0.5} alignItems='center' borderRadius={2}>
              <Typography>Semester has blocked</Typography>
              <Typography>Waiting for schedule generation</Typography>
            </Stack>}
          {semester.State === 5 &&
            <Stack bgcolor={blue[100]} p={0.5} alignItems='center' borderRadius={2}>
              <Typography>Schedule is generated</Typography>
              <Typography>Go to preview, adjust then confirm</Typography>
            </Stack>}
          {semester.State === 6 &&
            <Typography bgcolor={blue[100]} p={1} borderRadius={2}>
              Schedule is public</Typography>}
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
          {tabs.map(tab => (
            <Typography key={tab.id} color={selected === tab.name ? green[600] : grey[500]} py={0.5}
              borderBottom={selected === tab.name && `4px solid ${green[600]}`}
              fontSize='20px' onClick={() => setSelected(tab.name)}
              sx={{ '&:hover': { cursor: 'pointer', color: green[600] } }}>
              {tab.name}</Typography>
          ))}
        </Stack>
      </Stack>
      {selected === tabs[0].name && <CourseList semesterId={id} semesterState={semester.State} 
          scheduleId={schedule.Id} refresh={refresh}/>}
      {selected === tabs[1].name && <SubjectRequest semesterId={id} semesterState={semester.State} scheduleId={schedule.Id}/>}
      {selected === tabs[2].name && <LecturerContainer semester={semester} scheduleId={schedule.Id}
          refresh={refresh}/>}
    </Stack>
  )
}

export default SemesterDetailManager

const tabs = [
  { id: 1, name: 'Courses' },
  { id: 2, name: 'Subjects' },
  { id: 3, name: 'Lecturers' },
]

const states = [
  {id: 1, name: 'New'},
  {id: 2, name: 'Voting'},
  {id: 3, name: 'Evaluating'},
  {id: 4, name: 'Blocked'},
  {id: 5, name: 'Adjusting'},
  {id: 6, name: 'Public'},
]