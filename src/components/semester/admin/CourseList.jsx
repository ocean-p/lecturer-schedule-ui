import { Add, DeleteOutlined, EditOutlined, FileUploadOutlined } from '@mui/icons-material';
import { Box, Button, IconButton, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, 
  TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from '@mui/material'
import { green } from '@mui/material/colors';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HashLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import request from '../../../utils/request';
import DeleteModal from '../../priority/DeleteModal';
import AddModal from './AddModal';
import ImportModal from './ImportModal';
import UpdateModal from './UpdateModal';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const CourseList = ({ semesterId, scheduleId, slotTypes, semesterState, setReloadCourseNumber, refresh }) => {
  const fileInput = useRef(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [isImport, setIsImport] = useState(false);
  const [importCourses, setImportCourses] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [isAdd, setIsAdd] = useState(false);
  const [reload, setReload] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [contentDelete, setContentDelete] = useState('');
  const [pickedCourse, setPickedCourse] = useState({});
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
  const [loadCourse, setLoadCourse] = useState(false)

  //get all departments 
  useEffect(() => {
    const getDepartments = async () => {
      try {
        const resDepart = await request.get('Department', {
          params: {
            sortBy: 'Id', order: 'Asc',
            pageIndex: 1, pageSize: 1000
          }
        })
        if (resDepart.data) {
          setDepartments(resDepart.data)
          setSelectedDepartment(resDepart.data[0]?.Id)
        }
      }
      catch (error) { alert('Fail to get Department!') }
    }

    getDepartments();
  }, [])

  //get subjects by department
  useEffect(() => {
    if (selectedDepartment) {
      request.get('Subject', {
        params: {
          DepartmentId: selectedDepartment, sortBy: 'Id', order: 'Asc',
          pageIndex: 1, pageSize: 100
        }
      }).then(res => {
        if (res.data) {
          setSubjects(res.data);
        }
      }).catch(err => { alert('Fail to load subjects'); })
    }
  }, [selectedDepartment])

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
        if (res.status === 200) {
          let internal = res.data
          let external = res.data
          for (let i in subjects) {
            external = external.filter(course => course.SubjectId !== subjects[i].Id)
          }
          for (let i in external) {
            internal = internal.filter(course => course.SubjectId !== external[i].SubjectId)
          }
          setCourses(internal)
          setLoadCourse(false)
        }
      }).catch(err => { alert('Fail to load courses'); setLoadCourse(false) })
    }
  }, [semesterId, selectedSubject, subjects, reload])

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
  }, [scheduleId, refresh])

  //get all courses to show total
  useEffect(() => {
    if(semesterId){
      request.get('Course', {
        params: {
          SemesterId: semesterId, sortBy: 'Id', order: 'Asc',
          pageIndex: 1, pageSize: 1000
        }
      }).then(res => {
        if (res.data.length > 0) {
          setAllCourses(res.data)
        }
      }).catch(err => { alert('Fail to load courses') })
    }
  }, [semesterId, reload])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const clickImport = () => {
    fileInput.current.click();
  }

  const checkFileName = (name) => {
    const acceptableName = ['xlsx', 'xls'];
    return acceptableName.includes(name.split('.').pop().toLowerCase())
  }

  const changeFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!checkFileName(file.name)) {
      alert('Please import file excel')
      return;
    }
    e.target.value = null;
    readExcel(file);
  }

  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: "buffer" });

        const wsname = wb.SheetNames[0];

        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);

        resolve(data);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
      setImportCourses(d);
      setIsImport(true);
    });

  }

  const handleSelectDepartment = (e) => {
    setSelectedDepartment(e.target.value)
    setPage(0);
    setSelectedSubject('all');
  }

  const handleSelectSubject = (e) => {
    setSelectedSubject(e.target.value)
    setPage(0)
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

  const handleAfterImport = (content) => {
    if(content) {
      setReload(prev => !prev)
      setReloadCourseNumber(prev => !prev)
      toast.success(content, {
        position: "top-right", autoClose: 3000, hideProgressBar: false,
        closeOnClick: true, pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
  }

  const clickDelete = (course) => {
    const isAssigned = assignedCourses.find(item => item.CourseId === course.Id)
    if(isAssigned) return;

    setPickedCourse(course);
    setContentDelete(`course: ${course.Id}`)
    setIsDelete(true);
  }

  const saveDelete = () => {
    const isAssigned = assignedCourses.find(item => item.CourseId === pickedCourse.Id)
    if(isAssigned) return;

    request.delete(`Course/${pickedCourse.Id}`)
    .then(res => {
      if(res.status === 200){
        setIsDelete(false)
        setReloadCourseNumber(prev => !prev)
        setReload(prev => !prev)
        toast.success('Delete successfully', {
          position: "top-right", autoClose: 3000, hideProgressBar: false,
          closeOnClick: true, pauseOnHover: true, draggable: true,
          progress: undefined, theme: "light",
        });
      }
    })
    .catch(err => {alert('Fail to delete course'); setIsDelete(false)})
  }

  const clickUpdate = (course) => {
    const isAssigned = assignedCourses.find(item => item.CourseId === course.Id)
    if(isAssigned) return;

    setPickedCourse(course)
    setIsUpdate(true)
  }

  const afterUpdate = (status) => {
    if (status) {
      setReload(prev => !prev)
      toast.success('Edit successfully', {
        position: "top-right", autoClose: 3000, hideProgressBar: false,
        closeOnClick: true, pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
  }

  return (
    <Stack height='90vh' px={9}>
      <Stack direction='row' alignItems='center' gap={1} mb={1}>
        <Typography fontWeight={500}> Department: </Typography>
        <Select color='success' size='small'
          value={selectedDepartment} onChange={handleSelectDepartment}>
          {
            departments.map(department => (
              <MenuItem key={department.Id} value={department.Id}>
                {department.DepartmentName}</MenuItem>
            ))
          }
        </Select>
      </Stack>
      <Stack direction='row' alignItems='center' gap={1} mb={1}>
        <Typography fontWeight={500}> Subject: </Typography>
        <Select color='success' size='small'
          value={selectedSubject} onChange={handleSelectSubject} MenuProps={MenuProps}>
          <MenuItem value='all'>All</MenuItem>
          {subjects.map(subject => (
            <MenuItem key={subject.Id} value={subject.Id}>{subject.Id} - {subject.SubjectName}</MenuItem>
          ))}
        </Select>
      </Stack>
      <Stack direction='row' mb={2} alignItems='center' justifyContent='space-between'>
        <Stack direction='row' gap={4}>
          <Typography>Total All: {allCourses.length}</Typography>
          <Typography>Total: {courses.length}</Typography>
          <Typography>Total Assigned: {assignedTotal}</Typography>
        </Stack>
        {semesterState === 1 && <Stack direction='row' gap={2}>
          <input ref={fileInput} style={{ display: 'none' }} type="file"
            onChange={(e) => changeFile(e)}
          />
          <Button variant='contained' size='small' endIcon={<FileUploadOutlined />}
            onClick={clickImport}>
            Import
          </Button>
          <Button variant='contained' size='small' endIcon={<Add />}
            onClick={() => setIsAdd(true)}>
            Add
          </Button>
        </Stack>}
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
                {semesterState === 1 && 
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
                    {semesterState===1 &&
                    <TableCell align='center'>
                      <Tooltip title='Edit' placement='top' arrow>
                        <IconButton size='small' color='primary' onClick={() => clickUpdate(course)}>
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>
                      <span>|</span>
                      <Tooltip title='Delete' placement='top' arrow>
                        <IconButton size='small' color='error' onClick={() => clickDelete(course)}>
                          <DeleteOutlined />
                        </IconButton>
                      </Tooltip>
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
      <ImportModal isImport={isImport} setIsImport={setIsImport} importCourses={importCourses}
        semesterId={semesterId} handleAfterImport={handleAfterImport}/>
      <AddModal isAdd={isAdd} setIsAdd={setIsAdd} departments={departments} semesterId={semesterId}
        handleAfterImport={handleAfterImport}/>
      <DeleteModal isDelete={isDelete} setIsDelete={setIsDelete} saveDelete={saveDelete}
        contentDelete={contentDelete}/>
      <UpdateModal isUpdate={isUpdate} setIsUpdate={setIsUpdate} course={pickedCourse}
        afterUpdate={afterUpdate}/>
    </Stack>
  )
}

export default CourseList