import { AssignmentOutlined, DeleteOutline } from '@mui/icons-material';
import { Box, Button, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Tooltip, Typography
} from '@mui/material'
import { red } from '@mui/material/colors';
import { useEffect, useState, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import request from '../../utils/request';
import Alert from '../alert/Alert';
import DeleteModal from '../priority/DeleteModal';
import AssignmentModal from './AssignmentModal';

const AssignmentList = ({ lecturer, semester, allSubjects, admin, myCourseGroup, lecCourseGroup, setRefreshCourse }) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAssign, setIsAssign] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [scheduleId, setScheduleId] = useState('');
  const [fixCourses, setFixCourses] = useState([]);
  const [allFixCourses, setAllFixCourses] = useState([]);
  const [scheduleCourses, setScheduleCourses] = useState([]);
  const [deleteId, setDeleteId] = useState('');
  const [slots, setSlots] = useState([]);
  const [insideSubjects, setInSideSubjects] = useState([]);
  const outSide = useMemo(() => {
    if(lecturer.DepartmentId && account.DepartmentId){
      return lecturer.DepartmentId !== account.DepartmentId
    }
    return false
  }, [lecturer.DepartmentId, account.DepartmentId])
  const [isAlert, setIsAlert] = useState(false);
  const [contentAlert, setContentAlert] = useState('');

  //get scheduleId by semesterId
  useEffect(() => {
    if (semester.Id) {
      request.get('Schedule', {
        params: {
          SemesterId: semester.Id,
          pageIndex: 1,
          pageSize: 1
        }
      })
        .then(res => {
          if (res.data.length > 0) {
            setScheduleId(res.data[0].Id)
          }
        })
        .catch(err => {
          alert('Fail to get schedule id')
        })
    }
  }, [semester.Id])

  //get slot type to display info
  useEffect(() => {
    if (semester.Id) {
      request.get('SlotType', {
        params: { SemesterId: semester.Id, sortBy: 'DayOfWeekAndTimeStart', order: 'Asc', 
          pageIndex: 1, pageSize: 100 }
      })
        .then(res => {
          if (res.data) {
            setSlots(res.data)
          }
        })
        .catch(err => {
          alert('Fail to load slot type!')
        })
    }
  }, [semester.Id])

  //get assigned courses by current lecturer to view
  useEffect(() => {
    const getAssignCourse = async () => {
      if (lecturer.Id && scheduleId) {
        try {
          const resAssignCourse = await request.get('CourseAssign', {
            params: {
              LecturerId: lecturer.Id, ScheduleId: scheduleId, isAssign: 1, 
              sortBy: 'CourseId', order: 'Asc', pageIndex: 1, pageSize: 1000
            }
          })
          if (resAssignCourse.data) {
            setFixCourses(resAssignCourse.data)
          }
        }
        catch (err) {alert('Fail to load courseAssign!')}
      }
    }
    getAssignCourse();
  }, [scheduleId, lecturer.Id, isAssign, isDelete])

  //get all courses whether assigned or not by current lecturer to filter slot
  useEffect(() => {
    const getAssignCourse = async () => {
      if (lecturer.Id && scheduleId) {
        try {
          const resAssignCourse = await request.get('CourseAssign', {
            params: {
              LecturerId: lecturer.Id, ScheduleId: scheduleId,
              pageIndex: 1, pageSize: 1000
            }
          })
          if (resAssignCourse.data) {
            setScheduleCourses(resAssignCourse.data)
          }
        }
        catch (err) {
          alert('Fail to load courseAssign!')
        }
      }
    }
    getAssignCourse();
  }, [scheduleId, lecturer.Id, isAssign, isDelete])

  //get all courses in CourseAssign table to filter course
  useEffect(() => {
    const getAssignCourse = async () => {
      if (scheduleId) {
        try {
          const resAssignCourse = await request.get('CourseAssign', {
            params: {
              ScheduleId: scheduleId, pageIndex: 1, pageSize: 1000
            }
          })
          if (resAssignCourse.data) {
            setAllFixCourses(resAssignCourse.data)
          }
        }
        catch (err) {
          alert('Fail to load courseAssign!')
        }
      }
    }
    getAssignCourse();
  }, [scheduleId, isAssign, isDelete])

  //get subjects by department of manager
  useEffect(() => {
    request.get('Subject', {
      params: { DepartmentId: account.DepartmentId, sortBy: 'Id', order: 'Asc', 
        pageIndex: 1, pageSize: 1000 }
    })
      .then(res => {
        if (res.data) {
          setInSideSubjects(res.data);
        }
      })
      .catch(err => alert('Fail to load subjects of manager deparment'))
  }, [account.DepartmentId])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = (id) => {
    setDeleteId(id)
    setIsDelete(true);
  }

  const saveDelete = () => {
    if (deleteId) {
      request.delete(`CourseAssign/${deleteId}`)
        .then(res => {
          if (res.status === 200) {
            setIsDelete(false);
            setRefreshCourse(pre => !pre)
            toast.success('Delete Successfully!', {
              position: "top-right", autoClose: 1000, hideProgressBar: false,
              closeOnClick: true, pauseOnHover: true, draggable: true, 
              progress: undefined, theme: "colored",
            });
          }
        })
        .catch(err => {
          alert('Fail to Delete')
        })
    }
  }

  const checkAssignMore = () => {
    if(lecCourseGroup.Id){
      const scheduled = scheduleCourses.length;
      const max = lecCourseGroup.MaxCourse;
      if(scheduled >= max){
        setContentAlert(`This lecturer has reached max course number: ${max}`)
        setIsAlert(true)
      }
      else setIsAssign(true)
    }
  }

  return (
    <Stack height='90vh'>
      <Typography color='gray' variant='subtitle1'>
        *Courses which lecturer is fixed a course and time
      </Typography>
      <Stack direction='row' alignItems='center' mb={1} justifyContent='space-between'>
        <Typography fontWeight={500}>Fixed Courses: {fixCourses.length}</Typography>
        {(semester.State === 3 || (semester.State === 5 && myCourseGroup.GroupName !== 'confirm')) && !admin && 
        <Button variant='contained' color='success' size='small' endIcon={<AssignmentOutlined />}
          onClick={checkAssignMore}>
          More
        </Button>}
      </Stack>
      <Stack mb={2}>
        <Paper sx={{ minWidth: 700 }}>
          <TableContainer component={Box}
            sx={{ overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size='small' className='subject-header'>Course</TableCell>
                  <TableCell size='small' className='subject-header'>Subject</TableCell>
                  <TableCell size='small' className='subject-header'>Slot</TableCell>
                  {semester.State === 3 && !admin && 
                  <TableCell size='small' className='subject-header'>
                    Option</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {fixCourses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(course => (
                    <TableRow hover key={course.Id}>
                      <TableCell size='small'>{course.CourseId}</TableCell>
                      <TableCell size='small'>
                        {allSubjects.find(subject => subject.Id === course.CourseId.split('_')[0])?.SubjectName}
                      </TableCell>
                      <TableCell size='small'>
                        {slots.find(slot => slot.Id === course.SlotTypeId)?.Duration} {' '}
                        ({slots.find(slot => slot.Id === course.SlotTypeId)?.ConvertDateOfWeek})
                      </TableCell>
                      {semester.State === 3 && !admin && 
                      <TableCell size='small'>
                        {outSide ? <>
                          {(outSide && insideSubjects.find(inside => inside.Id === course.CourseId.split('_')[0])) ? (
                            <Tooltip title='delete' placement='right' arrow>
                              <IconButton size='small' color='error'
                                onClick={() => handleDelete(course.Id)}>
                                <DeleteOutline />
                              </IconButton>
                            </Tooltip>
                          ) : <Typography color={red[700]} fontSize='14px'>Can not delete</Typography>}
                        </> : <>
                          <Tooltip title='delete' placement='right' arrow>
                            <IconButton size='small' color='error'
                              onClick={() => handleDelete(course.Id)}>
                              <DeleteOutline />
                            </IconButton>
                          </Tooltip>
                        </>}
                      </TableCell>}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20]}
            component='div'
            count={fixCourses.length}
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
        </Paper>
      </Stack>
      <AssignmentModal isAssign={isAssign} setIsAssign={setIsAssign} lecturer={lecturer}
        semesterId={semester.Id} allFixCourses={allFixCourses} scheduleId={scheduleId}
        scheduleCourses={scheduleCourses} listSubject={insideSubjects} setRefreshCourse={setRefreshCourse}/>
      <DeleteModal isDelete={isDelete} setIsDelete={setIsDelete} saveDelete={saveDelete} />
      <Alert isAlert={isAlert} setIsAlert={setIsAlert} contentAlert={contentAlert}/>
      <ToastContainer />
    </Stack>
  )
}

export default AssignmentList