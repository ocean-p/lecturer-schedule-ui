import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Select, Stack, TextField, Typography
} from '@mui/material';
import { Try } from '@mui/icons-material';
import React, { useEffect, useMemo, useState } from 'react'
import { green, red } from '@mui/material/colors';
import request from '../../utils/request';
import { ClipLoader } from 'react-spinners';

const PriorityModal = ({ isPriority, setIsPriority, lecturer, semesterId, courseItems, groupId, listSubject }) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCourse, setSelectedCourse] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [priority, setPriority] = useState('');
  const [assignCourses, setAssignCourses] = useState([]);
  const [external, setExternal] = useState(false);
  const [loadCourse, setLoadCourse] = useState(false);
  const [subjectOfLecs, setSubjectOfLecs] = useState([]);
  const renderSubjects = useMemo(() => {
    if(listSubject.length > 0 && subjectOfLecs.length >0){
      let different = listSubject;
      let similar = listSubject;
      for(let i in subjectOfLecs){
        different = different.filter(item => item.Id !== subjectOfLecs[i].SubjectId)
      }
      for(let i in different){
        similar = similar.filter(item => item.Id !== different[i].Id)
      }
      return similar
    }
    return []
  }, [listSubject, subjectOfLecs])

  //get registered subjects of lecturer
  useEffect(() => {
    if(semesterId && lecturer.Id){
      request.get('SubjectOfLecturer', {
        params: {SemesterId: semesterId, LecturerId: lecturer.Id, isEnable: 1, 
          pageIndex:1, pageSize:100}
      }).then(res => {
        if(res.data.length > 0){
          setSubjectOfLecs(res.data)
        }
      }).catch(err => {alert('Fail to get registered subjects');})
    }
  }, [semesterId, lecturer.Id])

  //set priority for lecturer outside department
  useEffect(() => {
    if (lecturer.DepartmentId) {
      if (lecturer.DepartmentId !== account.DepartmentId) {
        setExternal(true)
        setPriority(1)
      }
    }
  }, [lecturer.DepartmentId, account.DepartmentId, isPriority])

  //get assigned courses to filter
  useEffect(() => {
    const getAssignCourse = async () => {
      if (lecturer.Id && semesterId) {
        try {
          const resSchedule = await request.get('Schedule', {
            params: {
              SemesterId: semesterId, pageIndex: 1, pageSize: 1
            }
          })
          if (resSchedule.data.length > 0) {
            const scheduleId = resSchedule.data[0].Id;
            const resAssignCourse = await request.get('CourseAssign', {
              params: {
                ScheduleId: scheduleId, pageIndex: 1, pageSize: 1000
              }
            })
            if (resAssignCourse.data) {
              setAssignCourses(resAssignCourse.data)
            }
          }
        }
        catch (err) {
          alert('Fail to load courseAssign!')
        }
      }
    }
    getAssignCourse();
  }, [semesterId, lecturer.Id])

  //get courses by subject and filter with assigned and myself courses
  useEffect(() => {
    setLoadCourse(true);
    if (selectedSubject) {
      request.get('Course', {
        params: {
          SubjectId: selectedSubject, SemesterId: semesterId,
          sortBy: 'Id', order: 'Asc', pageIndex: 1, pageSize: 500
        }
      })
        .then(res => {
          if (res.data) {
            let dataCourses = res.data
            for (let i in assignCourses) {
              dataCourses = dataCourses.filter(data => data.Id !== assignCourses[i].CourseId)
            }
            for (let i in courseItems) {
              dataCourses = dataCourses.filter(data => data.Id !== courseItems[i].CourseId)
            }
            setCourses(dataCourses)
            setLoadCourse(false)
          }
        })
        .catch(err => {
          alert('Fail to load course by subject')
          setLoadCourse(false)
        })
    }
  }, [selectedSubject, semesterId, assignCourses, courseItems])

  const handleChangePriority = (event) => {
    setPriority(Number(event.target.value));
  }

  const selectSubject = (subjectID) => {
    setSelectedSubject(subjectID);
    //setSelectedCourse('');
  }

  const selectCourse = (course) => {
    if (selectedCourse.find(select => select === course)) {
      setSelectedCourse(selectedCourse.filter(select => select !== course))
    }
    else {
      setSelectedCourse(prev => [...prev, course]);
    }
  }

  const handleSearch = (value) => {
    setSearchValue(value.toLowerCase());
  }

  const handleSave = () => {
    if (selectedCourse.length > 0 && priority) {
      for (let i in selectedCourse) {
        request.post('CourseGroupItem', {
          LecturerCourseGroupId: groupId,
          CourseId: selectedCourse[i],
          PriorityCourse: priority
        })
          .then(res => {
            if (res.status === 201) {
              setIsPriority(false)
              setSelectedCourse([])
              setSelectedSubject('')
              setPriority('')
            }
          })
          .catch(err => {
            alert('Fail to save priority course')
          })
      }
    }
  }

  return (
    <Dialog maxWidth='md' fullWidth={true}
      open={isPriority} onClose={() => setIsPriority(false)}>
      <DialogTitle>
        <Stack direction='row' alignItems='center' gap={1}>
          <Try />
          <Typography variant='h5' fontWeight={500}>Add priority course</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack direction='row' mb={1} gap={1}>
          <Typography fontWeight={500}>Lecturer:</Typography>
          <Typography>{lecturer.Name} - {lecturer.Email}</Typography>
        </Stack>
        <Stack direction='row' gap={1} mb={1}>
          <Typography fontWeight={500}>Courses ({selectedCourse.length})<span style={{ color: red[500] }}>*</span>:</Typography>
          <Typography>
            {selectedCourse.length > 0 ? selectedCourse.map((course, index) => (
                <span key={course}>{course}{index === (selectedCourse.length-1) ? '.' : ',  '}</span>))
              : <span style={{ color: red[600] }}>required</span>}
          </Typography>
        </Stack>
        <Stack direction='row' alignItems='center' gap={1} mb={1}>
          <Typography fontWeight={500}>Priority<span style={{ color: red[500] }}>*</span></Typography>
          {external && <Typography color={red[600]}>External</Typography>}
          {!external &&
            <Select color='success' size='small' placeholder='Choose priority'
              value={priority} onChange={handleChangePriority} margin='none'>
              <MenuItem value='4'>High</MenuItem>
              <MenuItem value='3'>Medium</MenuItem>
              <MenuItem value='2'>Low</MenuItem>
            </Select>}
        </Stack>
        <Stack direction='row' height='400px' gap={2}>
          <Stack flex={1}>
            <Stack flex={1} mb={1}>
              <TextField label='Subject' variant='outlined' size='small'
                placeholder='Search by id or name' color='success'
                value={searchValue} onChange={(e) => handleSearch(e.target.value)} />
            </Stack>
            <Box flex={9} border='1px solid gray' overflow='auto'>
              {renderSubjects.length === 0 && 
                <Typography p={1} color={red[600]}>No registerd subjects</Typography>}
              {renderSubjects.filter(subject => subject.Id.toLowerCase().includes(searchValue) || subject.SubjectName.toLowerCase().includes(searchValue))
                .map(subject => (
                  <Typography key={subject.Id} p={1} fontSize='15px'
                    borderBottom='1px solid #e3e3e3' bgcolor={subject.Id === selectedSubject && green[300]}
                    sx={{
                      transition: 'all 0.1s linear',
                      '&:hover': { cursor: 'pointer', bgcolor: green[300] }
                    }}
                    onClick={() => selectSubject(subject.Id)}
                  >
                    <span style={{ fontWeight: 500 }}>{subject.Id}</span> - {subject.SubjectName}
                  </Typography>
                ))}
            </Box>
          </Stack>
          <Stack flex={1}>
            <Stack flex={1} mb={1} fontWeight={500} justifyContent='center'>Available Courses (multiple select)</Stack>
            <Box flex={9} border='1px solid gray' overflow='auto'>
              {selectedSubject && loadCourse && 
                <Stack p={1}><ClipLoader size={30} color={green[700]}/></Stack>}
              {selectedSubject && !loadCourse && courses.length === 0 &&
                <Typography p={1} color={red[600]}>No available courses</Typography>}
              {
                selectedSubject && !loadCourse &&
                courses.map(course => (
                  <Typography key={course.Id} p={1} fontSize='15px'
                    borderBottom='1px solid #e3e3e3' bgcolor={selectedCourse.find(select => select === course.Id) && green[300]}
                    sx={{
                      transition: 'all 0.1s linear',
                      '&:hover': { cursor: 'pointer', bgcolor: green[300] }
                    }}
                    onClick={() => selectCourse(course.Id)}
                  >
                    {course.Id}
                  </Typography>
                ))
              }
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack mr={4}>
          {
            selectedSubject && selectedCourse.length > 0 && priority &&
            <Typography variant='subtitle1' color={green[500]}>*Ready to save</Typography>
          }
          {
            (!selectedSubject || selectedCourse.length === 0 || !priority) &&
            <Typography variant='subtitle1' color={red[600]}>*Choose subject then choose course and priority level</Typography>
          }
        </Stack>
        <Button onClick={() => setIsPriority(false)} color='info' variant='outlined'>Cancel</Button>
        <Button variant='contained' onClick={handleSave} autoFocus
          color='success' disabled={(!selectedSubject || selectedCourse.length === 0 || !priority) && true}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PriorityModal