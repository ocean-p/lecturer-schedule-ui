import {Box, Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, TablePagination, Tooltip, IconButton
} from '@mui/material';
import { blue, green, grey, red } from '@mui/material/colors';
import { StarBorder, DoDisturb, CheckCircleOutlined } from '@mui/icons-material';
import {HashLoader} from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import React, { useState, useEffect, useMemo } from 'react';
import RatingModal from '../department/RatingModal';
import RegisterConfirm from './RegisterConfirm';
import AlertComponent from '../alert/Alert';
import request from '../../utils/request';
import configData from  '../../utils/configData.json';
import './Subject.css';

const Subject = ({ semesterId, semesterState }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isRating, setIsRating] = useState(false);
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [subjects, setSubjects] = useState([]);
  const [favoriteSubjects, setFavoriteSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [loadPoint, setLoadPoint] = useState(false);
  const [pointFive, setPointFive] = useState(0);
  const [pointOne, setPointOne] = useState(0);
  const [loadSubject, setLoadSubject] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [contentAlert, setContentAlert] = useState('');
  const disableSubs = useMemo(() => {
    if(favoriteSubjects.length > 0){
      return favoriteSubjects.filter(item => item.isEnable === 0)
    }
    return []
  }, [favoriteSubjects])

  //get Subject by my department
  useEffect(() => {
    const getSubjects = async () => {
      setLoadSubject(true)
      try {
        const response = await request.get('Subject', {
          params: { DepartmentId: account.DepartmentId, sortBy:'Id', order: 'Asc',
            pageIndex: 1, pageSize: 1000
          }
        })
        if (response.data) {
          setSubjects(response.data)
          setLoadSubject(false)
        }
      }
      catch (error) {
        alert('Fail to load subjects!');
        setLoadSubject(false)
      }
    }

    getSubjects();
  }, [account.DepartmentId])

  //get subjectoflecturer (get point) by semesterId, lecturerId
  useEffect(() => {
    const getFavoriteSubjects = async () => {
      try {
        const response = await request.get('SubjectOfLecturer', {
          params: {SemesterId: semesterId, LecturerId: account.Id,
            pageIndex: 1,pageSize: 1000}
        })
        if (response.data) {
          setFavoriteSubjects(response.data)
        }
      }
      catch (error) {
        alert('Fail to load favortite points')
      }
    }

    if(semesterId && account.Id){
      getFavoriteSubjects();
    }
  }, [isRating, account.Id, semesterId, isRegister])

  //set number subjecs at point 1 and 5
  useEffect(() => {
    if (favoriteSubjects.length > 0) {
      setPointFive(favoriteSubjects.filter(item => item.FavoritePoint === 5).length)
      setPointOne(favoriteSubjects.filter(item => item.FavoritePoint === 1).length)
    }
  }, [favoriteSubjects])

  //set rows per page of subject'length
  useEffect(() => {
    if (subjects.length > 0) {
      setRowsPerPage(subjects.length)
    }
  }, [subjects])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRating = (id, name) => {
    setSubjectId(id);
    setSubjectName(name);
    setLoadPoint(prev => !prev);
    setIsRating(true);
  }

  const clickRegister = (id) => {
    if(semesterState !== 2) return;

    if(favoriteSubjects.length > 0){
      const obj = favoriteSubjects.find(item => item.SubjectId === id)
      if(obj.isEnable === 1){
        if(disableSubs.length >= configData.DISABLE_SUBJECT){
          setContentAlert(`You have reached max number of unregistration: ${configData.DISABLE_SUBJECT}.`)
          setIsAlert(true)
          return;
        }
      }
      setSubjectId(id)
      setIsRegister(true)
    }
  }

  const afterRegister = (content) => {
    if(content){
      toast.success(content, {
        position: "top-right", autoClose: 2000,
        hideProgressBar: false, closeOnClick: true,
        pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
    else{
      toast.error('Fail to update registered status', {
        position: "top-right", autoClose: 3000,
        hideProgressBar: false, closeOnClick: true,
        pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
  }

  return (
    <Stack height='90vh'>
      <Stack direction='row' alignItems='center' justifyContent='space-between'
        px={9} mb={1}>
        <Stack direction='row' alignItems='center' gap={1}>
          <Typography fontWeight={500}>Department:</Typography>
          <Typography>{account.DepartmentName}</Typography>
        </Stack>
        <Stack direction='row' alignItems='center' gap={4}>
          <Stack bgcolor={grey[100]} borderRadius={2} p={1}>
            <Typography color={red[600]} fontSize='14px'>
              <span style={{fontWeight: 500}}>Subjects at point 1:</span> {pointOne}/{configData.POINT_ONE_NUMBER}
            </Typography>
            <Typography color={red[600]} fontSize='14px'>
              <span style={{fontWeight: 500}}>Subjects at point 5:</span> {pointFive}/{configData.POINT_FIVE_NUMBER}
            </Typography>
          </Stack>
          <Stack bgcolor={grey[100]} p={1} fontSize='14px' borderRadius={2}>
            {semesterState === 2 ? 
              <>
                <Typography fontSize='14px' color={green[600]}>Can register or unregister</Typography>
                <Typography fontSize='14px' textAlign='center' color={red[600]}>
                  <span style={{fontWeight: 500}}>Unregistration:</span> {disableSubs.length}/{configData.DISABLE_SUBJECT}
                </Typography>
              </> : 
            <Typography fontSize='14px' color={red[600]}>Registration is closed</Typography>}
          </Stack>
        </Stack>
      </Stack>
      <Stack px={9}>
        {loadSubject && <HashLoader size={30} color={green[600]}/>}
        {!loadSubject && <Paper sx={{ minWidth: 700, mb: 2 }}>
          <TableContainer component={Box} sx={{ overflow: 'auto' }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className='subject-header'>Code</TableCell>
                  <TableCell className='subject-header request-border'>Name</TableCell>
                  <TableCell className='subject-header request-border' align='center'>
                    Favorite Point</TableCell>
                  <TableCell className='subject-header' align='center'>
                    Registered</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((subject) => (
                    <TableRow key={subject.Id} hover>
                      <TableCell>{subject.Id}</TableCell>
                      <TableCell className='request-border'>{subject.SubjectName}</TableCell>
                      <TableCell className='request-border'>
                        {favoriteSubjects.find(item => item.SubjectId === subject.Id)?.isEnable === 1 ?
                        <Stack direction='row' alignItems='center' gap={1} justifyContent='center'>
                          <Typography>
                            {favoriteSubjects.length > 0 &&
                              favoriteSubjects.find(item => item.SubjectId === subject.Id)?.FavoritePoint
                            }
                          </Typography>
                          {semesterState === 2 &&
                            <Tooltip title='Rating' placement='right' arrow>
                              <IconButton color='primary' size='small'
                                onClick={() => handleRating(subject.Id, subject.SubjectName)}>
                                <StarBorder />
                              </IconButton>
                            </Tooltip>}
                        </Stack> : <Typography textAlign='center'>-</Typography>}
                      </TableCell>
                      <TableCell align='center' onClick={() => clickRegister(subject.Id)}
                        sx={{ '&:hover': { bgcolor: semesterState === 2 ? blue[100] : '', cursor: semesterState === 2 ? 'pointer' : 'default' } }}>
                        {favoriteSubjects.length > 0 &&
                          favoriteSubjects.find(item => item.SubjectId === subject.Id)?.isEnable === 1 &&
                          <CheckCircleOutlined sx={{ color: green[800] }} />
                        }
                        {favoriteSubjects.length > 0 &&
                          favoriteSubjects.find(item => item.SubjectId === subject.Id)?.isEnable === 0 &&
                          <DoDisturb sx={{ color: red[600] }} />
                        }
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, subjects.length]}
            component='div'
            count={subjects.length}
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
      </Stack>
      <RatingModal isRating={isRating} setIsRating={setIsRating}
        subjectId={subjectId} subjectName={subjectName} semesterId={semesterId}
        favoriteSubjects={favoriteSubjects} loadPoint={loadPoint} />
      <RegisterConfirm isRegister={isRegister} setIsRegister={setIsRegister}
        subjectId={subjectId} subjects={subjects} favoriteSubjects={favoriteSubjects}
        afterRegister={afterRegister}/>
      <AlertComponent isAlert={isAlert} setIsAlert={setIsAlert} contentAlert={contentAlert}/>
      <ToastContainer />
    </Stack>
  )
}

export default Subject

