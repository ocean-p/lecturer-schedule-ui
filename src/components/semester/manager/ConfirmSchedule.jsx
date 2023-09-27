import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useState } from 'react'
import { ClipLoader } from 'react-spinners'
import request from '../../../utils/request'

const ConfirmSchedule = ({isConfirm, setIsConfirm, myCourseGroup, afterConfirm}) => {
  const [load, setLoad] = useState(false)

  const handleConfirm = () => {
    if(myCourseGroup.Id){
      setLoad(true)
      request.put(`LecturerCourseGroup/${myCourseGroup.Id}`, {
        LecturerId: myCourseGroup.LecturerId,
        SemesterId: myCourseGroup.SemesterId, GroupName: 'confirm',
        MinCourse: myCourseGroup.MinCourse, MaxCourse: myCourseGroup.MaxCourse
      }).then(res => {
        if(res.status === 200){
          setIsConfirm(false)
          setLoad(false)
          afterConfirm(true)
        }
      }).catch(err => {alert('Fail to confirm schedule'); setLoad(false)})
    }
  }

  return (
    <Dialog maxWidth='sm' fullWidth={true}
      open={isConfirm} onClose={() => setIsConfirm(false)}>
      <DialogTitle variant='h5' fontWeight={500}>
        Confirm Schedule
      </DialogTitle>
      <DialogContent>
        <Typography>Please sure that you have seen the schedule of all lecturers in your department. If Confirm, the schedule won't be edited.</Typography>
      </DialogContent>
      <DialogActions>
        <Button color='info' variant='outlined' onClick={() => setIsConfirm(false)}>
          Cancel</Button>
        {load ? <Button variant='contained' color='error'><ClipLoader size={20} color='white'/></Button> :
        <Button variant='contained' color='error' onClick={handleConfirm}>
          Confirm</Button>}
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmSchedule