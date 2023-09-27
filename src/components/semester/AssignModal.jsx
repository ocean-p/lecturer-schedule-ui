import { AssignmentOutlined, Beenhere } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Select, Stack, Tooltip, Typography
} from '@mui/material';
import { green, grey, red } from '@mui/material/colors';
import { useEffect, useState, useMemo } from 'react';
import { ClipLoader } from 'react-spinners';
import request from '../../utils/request';

const AssignModal = ({ isAssign, setIsAssign, selectedCourse, semesterId, scheduleId, assignedCourses, afterAssign }) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [selectedDepartment, setSelectedDepartment] = useState(account.DepartmentId);
  const [departments, setDepartments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState({});
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState({});
  const [disableSlots, setDisableSlots] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loadSlot, setLoadSlot] = useState(false);
  const [loadLecturer, setLoadLecturer] = useState(false);
  const courseTime = useMemo(() => {
    if(selectedCourse && assignedCourses.length > 0){
      let time = [];
      for (let i in assignedCourses) {
        const obj = assignedCourses[i];
        const classId = obj?.CourseId?.split('_')[1];
        if (classId === selectedCourse.split('_')[1]) {
          time.push(obj.SlotTypeId);
        }
      }
      return time;
    }
    return [];
  }, [selectedCourse, assignedCourses])
  const [subjectOfLecs, setSubjectOfLecs] = useState([]);
  const renderLecs = useMemo(() => {
    if(subjectOfLecs.length > 0 && lecturers.length > 0){
      let external = lecturers
      let internal = lecturers
      for(let i in subjectOfLecs){
        external = external.filter(item => item.Id !== subjectOfLecs[i].LecturerId)
      }
      for(let i in external){
        internal = internal.filter(item => item.Id !== external[i].Id)
      }
      return internal 
    }
    return []
  }, [subjectOfLecs, lecturers])

  // get lecturers registered subject of selected course
  useEffect(() => {
    if(selectedCourse && semesterId){
      const subjectId = selectedCourse.split('_')[0]
      request.get('SubjectOfLecturer', {
        params: {SemesterId: semesterId, SubjectId: subjectId, isEnable: 1, 
          pageIndex: 1, pageSize: 100}
      }).then(res => {
        if(res.status === 200){
          setSubjectOfLecs(res.data);
        }
      }).catch(err => {alert('Fail to get lecturers who registered the subject of this course')})
    }
  }, [selectedCourse, semesterId])

  //get departments by group
  useEffect(() => {
    const getDepartments = async () => {
      try {
        const response = await request.get(`Department/${account.DepartmentId}`);
        const departmentList = await request.get('Department', {
          params: {
            DepartmentGroupId: response.data.DepartmentGroupId,
            pageIndex: 1, pageSize: 1000
          }
        })
        if (departmentList.data) { setDepartments(departmentList.data) }
      }
      catch (error) { alert('Fail to get Department!') }
    }

    getDepartments();
  }, [account.DepartmentId])

  //get lecturers by selected department
  useEffect(() => {
    setLoadLecturer(true)
    request.get('User', {
      params: {
        DepartmentId: selectedDepartment, RoleIDs: 'LC', sortBy: 'Id', order: 'Asc',
        pageIndex: 1, pageSize: 100
      }
    }).then(res => {
      if (res.data) {
        setLecturers(res.data)
        setLoadLecturer(false)
      }
    }).catch(err => alert('Fail to load lecturers'))
  }, [selectedDepartment])

  //get disables slots of lecturer
  useEffect(() => {
    if(selectedLecturer.Id && semesterId){
      request.get('LecturerSlotConfig', {
        params: {
          LecturerId: selectedLecturer.Id, SemesterId: semesterId, 
          IsEnable: 0, pageIndex: 1, pageSize:100
        }
      }).then(res => {
        if(res.data){
          setDisableSlots(res.data)
        }
      }).catch(err => {
        alert('Fail to load disable slots')
      }) 
    }
  }, [selectedLecturer.Id, semesterId, isAssign])

  //get my assigned courses
  useEffect(() => {
    if(selectedLecturer.Id && scheduleId){
      request.get('CourseAssign', {
        params: {
          LecturerId: selectedLecturer.Id, ScheduleId: scheduleId,
          pageIndex: 1, pageSize: 1000
        }
      }).then(res => {
        if(res.data) {
          setMyCourses(res.data)
        }
      }).catch(err => alert('Fail to get my assigned courses'))
    }
  }, [selectedLecturer.Id, scheduleId, isAssign])

  //get slots type by semesterId
  useEffect(() => {
    setLoadSlot(true);
    if(semesterId){
      request.get('SlotType', {
        params: {
          SemesterId: semesterId, sortBy: 'DayOfWeekAndTimeStart', order: 'Asc',
          pageIndex: 1, pageSize: 100,
        }
      }).then(res => {
        if (res.data) {
          let dataSlot = res.data; 
          for(let i in myCourses){
            dataSlot = dataSlot.filter(data => data.Id !== myCourses[i].SlotTypeId)
          }
          for(let i in courseTime){
            dataSlot = dataSlot.filter(data => data.Id !== courseTime[i])
          }
          for(let i in disableSlots){
            dataSlot = dataSlot.filter(data => data.Id !== disableSlots[i].SlotTypeId)
          }
          setSlots(dataSlot)
          setTimeout(() => {
            setLoadSlot(false); 
          }, 200)
        }
      }).catch(err => alert('Fail to load slots'))
    }
  }, [semesterId, myCourses, courseTime, disableSlots])

  const handleSelectDepartment = (e) => {
    setSelectedDepartment(e.target.value);
    setSelectedLecturer({});
    setSelectedSlot({});
  }

  const myDepartment = () => {
    if (selectedDepartment !== account.DepartmentId) {
      setSelectedDepartment(account.DepartmentId)
      setSelectedLecturer({});
      setSelectedSlot({});
    }
  }

  const handleSelectLecturer = (lecturer) => {
    setSelectedLecturer(lecturer)
    setSelectedSlot({})
  }

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot)
  }

  const handleSave = () => {
    if(selectedLecturer.Id && selectedSlot.Id){
      request.post('CourseAssign', {
        LecturerId: selectedLecturer.Id, CourseId: selectedCourse,
        SlotTypeId: selectedSlot.Id, ScheduleId: scheduleId,
        isAssign: 1
      }).then(res => {
        if (res.status === 201) {
          setIsAssign(false);
          setSelectedLecturer({});
          setSelectedSlot({});
          afterAssign(true)
        }
      }).catch(err => {
        alert('Fail to save!')
      })
    }
  }

  return (
    <Dialog maxWidth='md' fullWidth={true}
      open={isAssign} onClose={() => setIsAssign(false)}>
      <DialogTitle>
        <Stack direction='row' alignItems='center' gap={1} mb={2}>
          <AssignmentOutlined />
          <Typography variant='h5' fontWeight={500}>Assign Course: </Typography>
          <Typography variant='h5'>{selectedCourse}</Typography>
        </Stack>
        <Stack direction='row' mb={1} gap={1}>
          <Typography fontWeight={500}>Lecturer<span style={{ color: red[500] }}>*</span>:</Typography>
          <Typography>
            {selectedLecturer.Id ? `${selectedLecturer.Name} (${selectedLecturer.Email} - ${selectedLecturer.DepartmentName})` 
              : <span style={{ color: red[600] }}>required</span>}
          </Typography>
        </Stack>
        <Stack direction='row' gap={1}>
          <Typography fontWeight={500}>Slot<span style={{ color: red[500] }}>*</span>: </Typography>
          <Typography>
            {selectedSlot.Id ? `${selectedSlot.SlotTypeCode} (${selectedSlot.Duration}, ${selectedSlot.ConvertDateOfWeek})`
              :<span style={{ color: red[600] }}>required</span>}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack direction='row' height='400px' gap={2}>
          <Stack flex={1}>
            <Stack flex={1} mb={1} direction='row' alignItems='center'>
              <Typography fontWeight={500}> Department: </Typography>
              <Select color='success' size='small' sx={{ ml: 1 }}
                value={selectedDepartment} onChange={handleSelectDepartment}>
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
                    fontSize: '24px', color: selectedDepartment === account.DepartmentId ? green[600] : grey[400],
                    '&:hover': { cursor: 'pointer', color: green[600] }
                  }}
                />
              </Tooltip>
            </Stack>
            <Box flex={9} border='1px solid gray' overflow='auto'>
              {loadLecturer && <Stack px={2} py={1}><ClipLoader size={30} color={green[700]}/></Stack>}
              {!loadLecturer && renderLecs.length === 0 && 
                <Typography px={2} py={1} color={red[600]}>
                  No lecturers registered this subject of course</Typography>}
              {!loadLecturer && renderLecs.map(lecturer => (
                <Typography key={lecturer.Id} px={2} py={1} borderBottom='1px solid #e3e3e3'
                  bgcolor={JSON.stringify(selectedLecturer) === JSON.stringify(lecturer) && green[300]}
                  sx={{
                    transition: 'all 0.1s linear',
                    '&:hover': { cursor: 'pointer', bgcolor: green[300] }
                  }}
                  onClick={() => handleSelectLecturer(lecturer)}
                >
                  {lecturer.Name} ({lecturer.Id})</Typography>
              ))}
            </Box>
          </Stack>
          <Stack flex={1}>
            <Stack flex={1} mb={1} fontWeight={500} justifyContent='center'>
              Available Slots
            </Stack>
            <Box flex={9} border='1px solid gray' overflow='auto'>
              {selectedLecturer.Id && loadSlot && 
                <Stack px={2} py={1}><ClipLoader size={30} color={green[700]}/></Stack>
              }
              {selectedLecturer.Id && !loadSlot && slots.length === 0 && 
                <Typography px={2} py={1} color={red[600]}>No available slots</Typography>}
              {selectedLecturer.Id && !loadSlot && slots.map(slot => (
                <Typography key={slot.Id} px={2} py={1} borderBottom='1px solid #e3e3e3'
                  bgcolor={JSON.stringify(selectedSlot) === JSON.stringify(slot) && green[300]}
                  sx={{
                    transition: 'all 0.1s linear',
                    '&:hover': { cursor: 'pointer', bgcolor: green[300] }
                  }}
                  onClick={() => handleSelectSlot(slot)}
                >
                  {slot.Duration} ({slot.ConvertDateOfWeek})</Typography>
              ))}
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
      <Stack mr={4}>
        {
          selectedLecturer.Id && selectedSlot.Id  &&
          <Typography variant='subtitle1' color={green[600]}>*Ready to save</Typography>
        }
        {
          (!selectedLecturer.Id || !selectedSlot.Id ) &&
          <Typography variant='subtitle1' color={red[500]}>*Choose lecturer then choose slot</Typography>
        }
        </Stack>
        <Button color='info' variant='outlined' onClick={() => setIsAssign(false)}>Cancel</Button>
        <Button variant='contained' color='success' onClick={handleSave}
          disabled={(selectedLecturer.Id && selectedSlot.Id) ? false : true}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AssignModal