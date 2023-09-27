import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import React from 'react'

const GetCourseConfirm = ({isConfirm, setIsConfirm, pickedCourse, lecturer, handleGet}) => {
  return (
    <Dialog maxWidth='sm' fullWidth={true}
      open={isConfirm} onClose={() => setIsConfirm(false)}>
      <DialogTitle variant='h5' fontWeight={500}>
        Get Course Confirm
      </DialogTitle>
      <DialogContent>
        <Typography mb={0.5}><span style={{fontWeight: 500}}>Course:</span> {pickedCourse.CourseId}</Typography>
        <Typography mb={0.5}><span style={{fontWeight: 500}}>Slot:</span> {pickedCourse.SlotTypeCode}, {pickedCourse.Duration}, {pickedCourse.ConvertDateOfWeek}</Typography>
        <Typography mb={2}><span style={{fontWeight: 500}}>From Lecturer:</span> {pickedCourse.LecturerId} - {pickedCourse.LecturerName}</Typography>
        <Typography>If confirm, this course will be belong to lecturer: {' '}
          <span style={{fontWeight: 500}}>{lecturer.Id} - {lecturer.Name}.</span></Typography>
      </DialogContent>
      <DialogActions>
        <Button color='info' variant='outlined' onClick={() => setIsConfirm(false)}>
          Cancel</Button>
        <Button variant='contained' onClick={handleGet}>
          Confirm</Button>
      </DialogActions>
    </Dialog>
  )
}

export default GetCourseConfirm