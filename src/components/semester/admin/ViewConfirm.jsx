import { CheckCircleOutlined } from '@mui/icons-material'
import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { green, red } from '@mui/material/colors'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import request from '../../../utils/request'
import Alert from '../../alert/Alert'
import ViewConfirmModal from './ViewConfirmModal'

const ViewConfirm = ({semesterId, semesterState, refresh}) => {
  const [managers, setManagers] = useState([])
  const [lecGroups, setLecGroups] = useState([])
  const [isSet, setIsSet] = useState(false)
  const [reload, setReload] = useState(false)
  const [checkAllConfirm, setCheckAllConfirm] = useState({})
  const [isAlert, setIsAlert] = useState(false)
  const [contentAlert, setContentAlert] = useState('')

  useEffect(() => {
    request.get('User', {
      params: {RoleIDs:'DMA', sortBy: 'Id', order: 'Asc',
        pageIndex: 1, pageSize: 100}
    }).then(res => {
      if(res.data.length > 0){
        setManagers(res.data)
      }
    }).catch(err => {alert('Fail to get managers')})
  }, [])

  //check all manager confirmed
  useEffect(() => {
    if(semesterId){
      request.get(`CheckConstraint/CheckAllDepartmentManagerConfirm/${semesterId}`)
      .then(res => {
        if(res.data){
          setCheckAllConfirm(res.data)
        }
      })
      .catch(err => {alert('Fail to check managers confirmed')})
    }
  }, [semesterId, reload, refresh, semesterState])

  //get confirm of departments
  useEffect(() => {
    if(semesterId){
      request.get('LecturerCourseGroup', {
        params: {SemesterId: semesterId, pageIndex: 1, pageSize: 100}
      }).then(res => {
        if(res.data.length > 0){
          setLecGroups(res.data)
        }
      }).catch(err => {alert('Fail to get confirmation status')})
    }
  }, [semesterId, reload, refresh, semesterState])

  const checkCourseConstraint = () => {
    if(semesterId){
      request.get(`CheckConstraint/CheckSemesterPublic/${semesterId}`)
      .then(res => {
        if(res.data){
          const data = res.data
          if(data.success === false){
            setContentAlert('Please inform department managers check again about course constraint')
            setIsAlert(true)
          }
          else{
            setIsSet(true)
          }
        }
      })
    }
  }

  const setAllConfirmed = () => {
    if(semesterId){
      request.put(`CheckConstraint/SetAllDepartmentManagerConfirm/${semesterId}`)
      .then(res => {
        if(res.status === 200){
          setIsSet(false)
          setReload(pre => !pre)
          toast.success('Set confirmation successfully', {
            position: "top-right", autoClose: 3000, 
            hideProgressBar: false, closeOnClick: true,
            pauseOnHover: true, draggable: true, 
            progress: undefined, theme: "light",
          })
        }
      })
      .catch(err => {alert('Fail to set all confirmed ')})
    }
  }

  return (
    <Stack height='90vh' px={9}>
      {semesterState === 5 && <>
      <Stack mb={1} direction='row' justifyContent='space-between'>
        <Typography fontWeight={500}>Managers of each Department</Typography>
        {checkAllConfirm.success === false && 
          <Button size='small' variant='contained' onClick={checkCourseConstraint}>
            Set All Confirmed</Button>}
      </Stack>
      <Paper sx={{ minWidth: 700 }}>
        <TableContainer component={Box} sx={{ overflow: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell className='subject-header'>Name</TableCell>
                <TableCell className='subject-header'>Email</TableCell>
                <TableCell className='subject-header'>Department</TableCell>
                <TableCell className='subject-header' align='center'>Confirmed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {managers.map(manager => (
                <TableRow key={manager.Id} hover>
                  <TableCell>{manager.Id} - {manager.Name}</TableCell>
                  <TableCell>{manager.Email}</TableCell>
                  <TableCell>{manager.DepartmentName}</TableCell>
                  <TableCell align='center'>
                    {lecGroups.length > 0 && lecGroups.find(item => item.LecturerId === manager.Id) &&
                      (lecGroups.find(item => item.LecturerId === manager.Id).GroupName === 'confirm' ? 
                        <CheckCircleOutlined sx={{color: green[500]}}/> : 
                        <span style={{color: red[600]}}>not yet</span>
                      )
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <ViewConfirmModal isSet={isSet} setIsSet={setIsSet} handleSetAll={setAllConfirmed}/>
      <Alert isAlert={isAlert} setIsAlert={setIsAlert} contentAlert={contentAlert}/>
      </>}
    </Stack>
  )
}

export default ViewConfirm