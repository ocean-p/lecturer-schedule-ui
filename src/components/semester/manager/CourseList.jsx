import { AssignmentOutlined, Clear } from '@mui/icons-material';
import { Box, IconButton, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Tooltip, Typography
} from '@mui/material'
import { green } from '@mui/material/colors';
import { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { HashLoader } from 'react-spinners';
import request from '../../../utils/request';
import AssignModal from '../AssignModal';
import ClearConfirm from '../ClearConfirm';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const CourseList = ({ semesterId, semesterState, scheduleId, refresh }) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [slotTypes, setSlotTypes] = useState([]);
  const [isAssign, setIsAssign] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isClear, setIsClear] = useState(false);
  const [loadCourse, setLoadCourse] = useState(false);
  const assignedTotal = useMemo(() => {
    if(assignedCourses.length > 0 && subjects.length > 0){
      if(selectedSubject !== 'all'){
        return assignedCourses.filter(item => item.CourseId.split('_')[0] === selectedSubject).length
      }
      
      let external = assignedCourses;
      let internal = assignedCourses
      for(let i in subjects){
        external = external.filter(ex => ex.CourseId.split('_')[0] !== subjects[i].Id)
      }
      for(let i in external){
        internal = internal.filter(inter => inter.CourseId.split('_')[0] !== external[i].CourseId.split('_')[0])
      }
      return internal.length;
    }
    return 0;
  }, [assignedCourses, selectedSubject, subjects])

  //get subjects by selected department
  useEffect(() => {
    if (account.DepartmentId) {
      request.get('Subject', {
        params: {
          DepartmentId: account.DepartmentId, sortBy: 'Id', order: 'Asc',
          pageIndex: 1, pageSize: 100
        }
      }).then(res => {
        if (res.data) {
          setSubjects(res.data);
        }
      }).catch(err => {alert('Fail to load subjects');})
    }
  }, [account.DepartmentId])

  //get courses by selected subject
  useEffect(() => {
    setLoadCourse(true)
    if (selectedSubject && semesterId && subjects.length > 0) {
      request.get('Course', {
        params: {
          SubjectId: selectedSubject === 'all' ? '' : selectedSubject, 
          SemesterId: semesterId, sortBy: 'Id', order: 'Asc',
          pageIndex: 1, pageSize: 1000
        }
      }).then(res => {
        if (res.data) {
          let internal = res.data
          let external = res.data
          for (let i in subjects) {
            external = external.filter(course => course.SubjectId !== subjects[i].Id)
          }
          for (let i in external) {
            internal = internal.filter(course => course.SubjectId !== external[i].SubjectId)
          }
          setCourses(internal)
          setLoadCourse(false);
        }
      }).catch(err => { alert('Fail to load courses'); setLoadCourse(false)})
    }
  }, [semesterId, selectedSubject, subjects])

  //get assign courses
  useEffect(() => {
    if(scheduleId){
      request.get('CourseAssign', {
        params: { ScheduleId: scheduleId, order: 'Asc', pageIndex: 1, pageSize: 1000 }
      }).then(res => {
        if (res.data) {
          setAssignedCourses(res.data)
        }
      }).catch(err => alert('Fail to load course assign'))
    }
  }, [scheduleId, isAssign, isClear, refresh])

  //get slot types
  useEffect(() => {
    if(semesterId){
      request.get('SlotType', {
        params: {
          SemesterId: semesterId, sortBy: 'DayOfWeekAndTimeStart', order: 'Asc',
          pageIndex: 1, pageSize: 100
        }
      }).then(res => {
        if (res.data) setSlotTypes(res.data);
      }).catch(err => alert('Fail to load slottype'))
    }
  }, [semesterId])

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSelectSubject = (e) => {
    setSelectedSubject(e.target.value);
    setPage(0);
  }

  const getInforSlot = (slotId) => {
    if (slotTypes.length > 0) {
      for (let i in slotTypes) {
        if (slotTypes[i].Id === slotId) {
          const obj = slotTypes[i];
          return `${obj.Duration} (${obj.ConvertDateOfWeek})`
        }
      }
      return ''
    }
    return ''
  }

  const handleAssign = (courseId) => {
    let already = false;
    for (let i in assignedCourses) {
      if (assignedCourses[i].CourseId === courseId) {
        already = true;
        break;
      }
    }
    if (!already) {
      setSelectedCourse(courseId)
      setIsAssign(true);
    }
  }

  const afterAssign = (status) => {
    if(status){
      toast.success('Assign successfully', {
        position: "top-right", autoClose: 3000,
        hideProgressBar: false, closeOnClick: true,
        pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
  }

  const confirmClear = (courseId) => {
    let already = false;
    for (let i in assignedCourses) {
      if (assignedCourses[i].CourseId === courseId) {
        already = true;
        break;
      }
    }
    if (already) {
      setSelectedCourse(courseId)
      setIsClear(true);
    }
  }

  const saveClear = () => {
    if (selectedCourse) {
      let assignId = ''
      for (let i in assignedCourses) {
        if (assignedCourses[i].CourseId === selectedCourse) {
          assignId = assignedCourses[i].Id
          break;
        }
      }
      if (assignId) {
        request.delete(`CourseAssign/${assignId}`)
          .then(res => {
            if (res.status === 200) {
              setIsClear(false);
              toast.success('Clear assigment successfully', {
                position: "top-right", autoClose: 3000,
                hideProgressBar: false, closeOnClick: true,
                pauseOnHover: true, draggable: true,
                progress: undefined, theme: "light",
              });
            }
          })
          .catch(err => {
            setIsClear(false)
            alert('Fail to Clear Assignment')
          })
      }
    }
  }

  return (
    <Stack px={9} mb={2}>
      <Stack mb={2} gap={1} flexWrap='wrap'>
        <Stack direction='row' alignItems='center' gap={1}>
          <Typography fontWeight={500}> Department: </Typography>
          <Typography>{account.DepartmentName}</Typography>
        </Stack>
        <Stack direction='row' alignItems='center'>
          <Typography fontWeight={500}> Subject: </Typography>
          <Select color='success' size='small' sx={{ ml: 1 }}
            value={selectedSubject} onChange={handleSelectSubject} MenuProps={MenuProps}>
            <MenuItem value='all'>All</MenuItem>
            {subjects.map(subject => (
              <MenuItem key={subject.Id} value={subject.Id}>{subject.Id} - {subject.SubjectName}</MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack direction='row' gap={4}>
          <Typography>Total Courses: {courses.length}</Typography>
          <Typography>Total Assigned: {assignedTotal}</Typography>
        </Stack>
      </Stack>
      {loadCourse && <HashLoader color={green[600]} size={30}/>}
      {!loadCourse && <Paper sx={{ minWidth: 700, mb: 2 }}>
        <TableContainer component={Box}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell className='subject-header'>Course</TableCell>
                <TableCell className='subject-header'>Subject</TableCell>
                <TableCell className='subject-header' align='center'>Slot Amount</TableCell>
                <TableCell className='subject-header'>Assigned To</TableCell>
                <TableCell className='subject-header request-border'>Teaching Slot</TableCell>
                {(semesterState === 3 || semesterState === 5) &&
                  <TableCell className='subject-header' align='center'>Option</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.length > 0 && 
              courses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(course => (
                  <TableRow key={course.Id} hover>
                    <TableCell>{course.Id}</TableCell>
                    <TableCell>{course.SubjectId}</TableCell>
                    <TableCell align='center'>{course.SlotAmount}</TableCell>
                    <TableCell>
                      {assignedCourses.find(item => item.CourseId === course.Id)?.LecturerId ||
                        <span style={{ color: 'red' }}>Not Yet</span>
                      }
                    </TableCell>
                    <TableCell className='request-border'>
                      {assignedCourses.find(item => item.CourseId === course.Id) ?
                        getInforSlot(assignedCourses.find(item => item.CourseId === course.Id).SlotTypeId)
                        : <span style={{ color: 'red' }}>Not Yet</span>
                      }
                    </TableCell>
                    {(semesterState === 3 || semesterState === 5) &&
                      <TableCell align='center'>
                        <Tooltip title='Assign' placement='top' arrow>
                          <span><IconButton size='small' color='primary'
                            disabled={assignedCourses.find(item => item.CourseId === course.Id) && true}
                            onClick={() => handleAssign(course.Id)}>
                            <AssignmentOutlined />
                          </IconButton></span>
                        </Tooltip>
                        {semesterState === 3 && 
                        <><span>|</span>
                        <Tooltip title='Clear Assign' placement='top' arrow>
                          <span><IconButton color='error' size='small'
                            disabled={assignedCourses.find(item => item.CourseId === course.Id) ? false : true}
                            onClick={() => confirmClear(course.Id)}>
                            <Clear />
                          </IconButton></span>
                        </Tooltip></>}
                      </TableCell>}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20]}
          component='div'
          count={courses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton
          showLastButton
          sx={{
            bgcolor: 'ghostwhite'
          }}
        />
      </Paper>}
      <AssignModal isAssign={isAssign} setIsAssign={setIsAssign} selectedCourse={selectedCourse}
        semesterId={semesterId} scheduleId={scheduleId} assignedCourses={assignedCourses}
        afterAssign={afterAssign} />

      <ClearConfirm isClear={isClear} setIsClear={setIsClear} selectedCourse={selectedCourse}
        saveClear={saveClear} />
      <ToastContainer/>
    </Stack>
  )
}

export default CourseList