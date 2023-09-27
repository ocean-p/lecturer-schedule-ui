import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, TextField, Typography
} from '@mui/material';
import { Assignment } from '@mui/icons-material';
import React, { useEffect, useMemo, useState } from 'react'
import { green, red } from '@mui/material/colors';
import request from '../../utils/request';
import { ClipLoader } from 'react-spinners';

const AssignmentModal = ({ isAssign, setIsAssign, lecturer, semesterId, allFixCourses, scheduleId, scheduleCourses, listSubject, setRefreshCourse}) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSlot, setSelectedSlot] = useState({});
  const [assignCourses, setAssignCourses] = useState([]);
  const [slots, setSlots] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [disableSlots, setDisableSlots] = useState([]);
  const [loadCourse, setLoadCourse] = useState(false);
  const [loadSlot, setLoadSlot] = useState(false);
  const courseTime = useMemo(() => {
    if (selectedCourse && allFixCourses.length > 0) {
      let time = [];
      for (let i in allFixCourses) {
        const obj = allFixCourses[i];
        const classId = obj?.CourseId?.split('_')[1];
        if (classId === selectedCourse.split('_')[1]) {
          time.push(obj.SlotTypeId);
        }
      }
      return time
    }
    return []
  }, [selectedCourse, allFixCourses])
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

  useEffect(() => {
    setSelectedSubject('')
    setSelectedCourse('')
    setSelectedSlot({})
  }, [lecturer])

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

  //get course by selected subject and filter all already assigned courses
  useEffect(() => {
    if (selectedSubject && semesterId) {
      setLoadCourse(true)
      request.get('Course', {
        params: { SubjectId: selectedSubject, SemesterId: semesterId, 
          sortBy: 'Id', order: 'Asc', pageIndex: 1, pageSize: 500}
      }).then(res => {
        if (res.data) {
          let dataCourse = res.data
          for (let i in allFixCourses) {
            const obj = allFixCourses[i]
            dataCourse = dataCourse.filter(data => data.Id !== obj.CourseId)
          }
          setAssignCourses(dataCourse)
          setLoadCourse(false);
        }
      }).catch(err => {
        alert('Fail to load course by subject')
        setLoadCourse(false)
      })
    }
  }, [selectedSubject, semesterId, allFixCourses])

  //get slots are disable
  useEffect(() => {
    if(lecturer.Id && semesterId){
      request.get('LecturerSlotConfig', {
        params: {LecturerId: lecturer.Id, SemesterId: semesterId, 
          IsEnable: 0, pageIndex: 1, pageSize:100}
      }).then(res => {
        if(res.data){
          setDisableSlots(res.data)
        }
      }).catch(err => {alert('Fail to load disable slots')})
    }
  }, [lecturer.Id, semesterId])

  //get slot and filter
  useEffect(() => {
    setLoadSlot(true)
    request.get('SlotType', {
      params: {
        SemesterId: semesterId, sortBy: 'DayOfWeekAndTimeStart', order: 'Asc',
        pageIndex: 1, pageSize: 100,
      }
    })
      .then(res => {
        if (res.status === 200) {
          let dataSlot = res.data;
          for (let i in scheduleCourses) {
            dataSlot = dataSlot.filter(data => data.Id !== scheduleCourses[i].SlotTypeId)
          }
          if (courseTime.length > 0) {
            for (let i in courseTime) {
              dataSlot = dataSlot.filter(data => data.Id !== courseTime[i])
            }
          }
          if(disableSlots.length > 0){
            for(let i in disableSlots){
              dataSlot = dataSlot.filter(data => data.Id !== disableSlots[i].SlotTypeId)
            }
          }
          setSlots(dataSlot)
          setLoadSlot(false);
        }
      })
      .catch(err => {
        alert('Fail to load slot!')
        setLoadSlot(false)
      })
  }, [semesterId, scheduleCourses, courseTime, disableSlots])

  const selectSubject = (subjectID) => {
    setSelectedSubject(subjectID);
    setSelectedCourse('');
    setSelectedSlot({})
  }

  const selectCourse = (course) => {
    setSelectedCourse(course);
    setSelectedSlot({});
  }

  const selectSlot = (slot) => {
    setSelectedSlot(slot)
  }

  const handleSearch = (value) => {
    setSearchValue(value.toLowerCase());
  }

  const handleSave = () => {
    request.post('CourseAssign', {
      LecturerId: lecturer.Id,
      CourseId: selectedCourse,
      SlotTypeId: selectedSlot.Id,
      ScheduleId: scheduleId,
      isAssign: 1
    })
      .then(res => {
        if (res.status === 201) {
          setIsAssign(false);
          setRefreshCourse(pre => !pre)
          setSelectedSubject('');
          setSelectedCourse('');
          setSelectedSlot({});
        }
      })
      .catch(err => {
        alert('Fail to save!')
      })
  }

  return (
    <Dialog maxWidth='md' fullWidth={true}
      open={isAssign} onClose={() => setIsAssign(false)}>
      <DialogTitle>
        <Stack direction='row' alignItems='center' gap={1}>
          <Assignment />
          <Typography variant='h5' fontWeight={500}>Assign course to lecturer</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack direction='row' mb={1} gap={1}>
          <Typography fontWeight={500}>Lecturer: </Typography>
          <Typography>{lecturer.Name} - {lecturer.Email}</Typography>
        </Stack>
        <Stack direction='row' gap={4} mb={1}>
          <Stack direction='row' gap={1}>
            <Typography fontWeight={500}>Subject<span style={{ color: red[500] }}>*</span>:</Typography>
            <Typography>{selectedSubject || <span style={{ color: red[600] }}>required</span>}</Typography>
          </Stack>
          <Stack direction='row' gap={1}>
            <Typography fontWeight={500}>Course<span style={{ color: red[500] }}>*</span>:</Typography>
            <Typography>{selectedCourse || <span style={{ color: red[600] }}>required</span>}</Typography>
          </Stack>
          <Stack direction='row' gap={1}>
            <Typography fontWeight={500}>Slot<span style={{ color: red[500] }}>*</span>:</Typography>
            <Typography>
              {selectedSlot?.Id ? `${selectedSlot.Duration} (${selectedSlot.ConvertDateOfWeek})` :
                <span style={{ color: red[600] }}>required</span>}
            </Typography>
          </Stack>
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
              {renderSubjects.filter(subject => subject.Id.toLowerCase().includes(searchValue) ||
                subject.SubjectName.toLowerCase().includes(searchValue))
                .map(subject => (
                  <Typography key={subject.Id} p={1} fontSize='15px'
                    borderBottom='1px solid #e3e3e3' bgcolor={subject.Id === selectedSubject && green[300]}
                    sx={{
                      transition: 'all 0.1s linear',
                      '&:hover': {
                        cursor: 'pointer',
                        bgcolor: green[300]
                      }
                    }}
                    onClick={() => selectSubject(subject.Id)}
                  >
                    <span style={{ fontWeight: 500 }}>{subject.Id}</span> - {subject.SubjectName}
                  </Typography>
              ))}
            </Box>
          </Stack>
          <Stack flex={1}>
            <Stack flex={1} mb={1} fontWeight={500} justifyContent='center'>Available Courses</Stack>
            <Box flex={9} border='1px solid gray' overflow='auto'>
              {loadCourse && <Stack p={1}><ClipLoader size={30} color={green[700]}/></Stack>}
              {!loadCourse && selectedSubject && assignCourses.length === 0 &&
                <Typography p={1} color={red[600]}>No available courses</Typography>
              }
              {
                !loadCourse && selectedSubject &&
                assignCourses.map(course => (
                  <Typography key={course.Id} p={1} fontSize='15px'
                    borderBottom='1px solid #e3e3e3' bgcolor={selectedCourse === course.Id && green[300]}
                    sx={{
                      transition: 'all 0.1s linear',
                      '&:hover': {
                        cursor: 'pointer',
                        bgcolor: green[300]
                      }
                    }}
                    onClick={() => selectCourse(course.Id)}
                  >
                    {course.Id}
                  </Typography>
                ))
              }
            </Box>
          </Stack>
          <Stack flex={1} >
            <Stack flex={1} mb={1} fontWeight={500} justifyContent='center'>Available Slots</Stack>
            <Box flex={9} border='1px solid gray' overflow='auto'>
              {loadSlot && <Stack p={1}><ClipLoader size={30} color={green[700]}/></Stack>}
              {!loadSlot && selectedSubject && selectedCourse && slots.length === 0 &&
                <Typography p={1} color={red[600]}>No available slots</Typography>
              }
              {selectedSubject && selectedCourse && !loadSlot &&
                slots.map(slot => (
                  <Typography key={slot.Id} p={1} fontSize='15px'
                    bgcolor={JSON.stringify(selectedSlot) === JSON.stringify(slot) && green[300]}
                    borderBottom='1px solid #e3e3e3'
                    sx={{
                      transition: 'all 0.1s linear',
                      '&:hover': {
                        cursor: 'pointer',
                        bgcolor: green[300]
                      }
                    }}
                    onClick={() => selectSlot(slot)}
                  >
                    {slot.Duration} ({slot.ConvertDateOfWeek})
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
          selectedSubject && selectedCourse && Object.values(selectedSlot).length > 0 &&
          <Typography variant='subtitle1' color={green[500]}>*Ready to save</Typography>
        }
        {
          (!selectedSubject || !selectedCourse || Object.values(selectedSlot).length === 0) &&
          <Typography variant='subtitle1' color={red[600]}>*Choose subject then choose course and slot type</Typography>
        }
        </Stack>
        <Button onClick={() => setIsAssign(false)} color='info' variant='outlined'>Cancel</Button>
        <Button variant='contained' onClick={handleSave} color='success'
          disabled={(!selectedSubject || !selectedCourse || Object.values(selectedSlot).length === 0) && true}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AssignmentModal