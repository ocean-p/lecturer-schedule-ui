import { Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  FormControl, 
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import {ClipLoader} from 'react-spinners'
import request from '../../utils/request'

const RejectModal = ({ isReject, setIsReject, selectedRequest, handleAfterSave }) => {
  const [loadReject, setLoadReject] = useState(false)
  const [lecturer, setLecturer] = useState({})
  const [value, setValue] = useState(100)
  const [reason, setReason] = useState('')

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

  const handleChangeValue = (e) => {
    setValue(Number(e.target.value))
  }

  const handleSave = () => {
    if(value<=3 && value >=1){
      if(value === 3 && reason.length === 0) return;

      setLoadReject(true)
      request.put(`Request/${selectedRequest.Id}`, {
        Title: selectedRequest.Title, Description: value===3 ? reason : reasons[value-1].name,
        LecturerId: selectedRequest.LecturerId, DepartmentManagerId: selectedRequest.DepartmentManagerId,
        SubjectId: selectedRequest.SubjectId, SemesterId: selectedRequest.SemesterId,
        ResponseState: -1
      }).then(res => {
        if (res.status === 200) {
          setIsReject(false)
          setLoadReject(false)
          setValue(100);
          setReason('');
          handleAfterSave('Reject Successfully')
        }
      }).catch(err => { alert('Fail to update request'); setLoadReject(false) })
    }
  }

  return (
    <Dialog maxWidth='sm' fullWidth={true}
      open={isReject} onClose={() => setIsReject(false)}>
      <DialogTitle>
        <Typography variant='h5' fontWeight={500}>Reject for teaching external subject</Typography>
        <Typography variant='subtitle1' color='gray'>*Choose a reason for rejection</Typography>
      </DialogTitle>
      <DialogContent>
        <Stack mb={1} gap={0.5}>
          <Typography><span style={{fontWeight: 500}}>Lecturer:</span> {' '}
            {lecturer.Name} (Department: {lecturer.DepartmentId})</Typography>
          <Typography><span style={{fontWeight: 500}}>Subject:</span> {' '}
            {selectedRequest.SubjectId} - {selectedRequest.SubjectName}</Typography>
        </Stack>
        <Stack alignItems='center'>
          <FormControl>
            <RadioGroup value={value} onChange={handleChangeValue}>
              {reasons.map(item => (
                <FormControlLabel key={item.id} value={item.id}
                  control={<Radio color='error' />} label={item.name} />
              ))}
            </RadioGroup>
          </FormControl>
          {value === 3 && <TextField variant='outlined' size='small' fullWidth autoFocus
            placeholder='Type reason here' value={reason} onChange={(e) => setReason(e.target.value)} />}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color='info' variant='outlined' onClick={() => setIsReject(false)}>Cancel</Button>
        {loadReject ? 
          <Button color='error' variant='contained'><ClipLoader size={20} color='white'/></Button>:
          <Button color='error' variant='contained' onClick={handleSave}
            disabled={(value < 3 || (value===3 && reason)) ? false : true}>
            Reject
          </Button>}
      </DialogActions>
    </Dialog>
  )
}

export default RejectModal

const reasons = [
  {id:1, name:'No available courses of this subject'},
  {id:2, name:'No available slots for teaching'},
  {id:3, name:'Other'},
]