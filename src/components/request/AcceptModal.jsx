import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import request from '../../utils/request';

const AcceptModal = ({ isAccept, setIsAccept, selectedRequest, handleAfterSave }) => {
  const [lecturer, setLecturer] = useState({})
  const [loadAccept, setLoadAccept] = useState(false)

  useEffect(() => {
    if(selectedRequest.LecturerId){
      request.get(`User/${selectedRequest.LecturerId}`)
      .then(res => {
        if(res.data){
          setLecturer(res.data)
        }
      })
      .catch(err => {alert('Fail to get lecturer')})
    }
  }, [selectedRequest])

  const handleUpdateRequest = () => {
    request.put(`Request/${selectedRequest.Id}`, {
      Title: selectedRequest.Title, Description: 'Request is accepted',
      LecturerId: selectedRequest.LecturerId, DepartmentManagerId: selectedRequest.DepartmentManagerId,
      SubjectId: selectedRequest.SubjectId, SemesterId: selectedRequest.SemesterId,
      ResponseState: 1
    }).then(res => {
      if(res.status === 200){
        setIsAccept(false)
        setLoadAccept(false)
        handleAfterSave('Accept Successfully')
      }
    }).catch(err => {alert('Fail to update request'); setLoadAccept(false)})
  }

  const handleAccept = () => {
    if(selectedRequest.SubjectId){
      setLoadAccept(true)
      request.post('SubjectOfLecturer', {
        DepartmentManagerId: selectedRequest.DepartmentManagerId,
        SemesterId: selectedRequest.SemesterId, SubjectId: selectedRequest.SubjectId,
        LecturerId: selectedRequest.LecturerId,
        FavoritePoint: 4, FeedbackPoint: 4,
        MaxCourseSubject: 3, isEnable: 1
      }).then(res => {
        if(res.status === 200 || res.status === 201){
          handleUpdateRequest();
        }
      }).catch(err => {alert('Fail to accept subject'); setLoadAccept(false)})
    }
  }
 
  return (
    <Dialog maxWidth='sm' fullWidth={true}
      open={isAccept} onClose={() => setIsAccept(false)}>
      <DialogTitle variant='h5' fontWeight={500}>
        Accept for teaching external subject
      </DialogTitle>
      <DialogContent>
        <Stack direction='row' gap={1} mb={1}>
          <Typography fontWeight={500}>Lecturer: </Typography>
          <Typography>{lecturer.Id} - {lecturer.Name} (Department: {lecturer.DepartmentId})</Typography>
        </Stack>
        <Stack direction='row' gap={1} mb={1}>
          <Typography fontWeight={500}>Subject: </Typography>
          <Typography>{selectedRequest.SubjectId} - {selectedRequest.SubjectName}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='info' onClick={() => setIsAccept(false)}>Cancel</Button>
        {loadAccept ? <Button variant='contained' color='success'>
          <ClipLoader size={20} color='white'/></Button> :
         <Button variant='contained' color='success' onClick={handleAccept}>
          Accept</Button>}
      </DialogActions>
    </Dialog>
  )
}

export default AcceptModal