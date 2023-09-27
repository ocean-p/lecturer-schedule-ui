import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { ClipLoader } from 'react-spinners'
import request from '../../utils/request'

const RegisterConfirm = ({isRegister, setIsRegister, subjectId, subjects, favoriteSubjects, afterRegister}) => {
  const [loadSave, setLoadSave] = useState(false)

  const subject = useMemo(() => {
    if(subjectId && subjects.length > 0){
      return subjects.find(sub => sub.Id === subjectId) || {}
    }
    return {}
  }, [subjectId, subjects])

  const subOfLec = useMemo(() => {
    if(subjectId && favoriteSubjects.length > 0){
      return favoriteSubjects.find(item => item.SubjectId === subjectId) || {}
    }
    return {}
  }, [subjectId, favoriteSubjects])

  const handleSave = () => {
    if(subOfLec.Id){
      const content = subOfLec.isEnable === 1 ? 'Unregister successfully' : 'Register successfully'
      setLoadSave(true)
      request.put(`SubjectOfLecturer/${subOfLec.Id}`, {
        DepartmentManagerId: subOfLec.DepartmentManagerId,
        SemesterId: subOfLec.SemesterId, SubjectId: subOfLec.SubjectId,
        LecturerId: subOfLec.LecturerId, FavoritePoint: subOfLec.FavoritePoint,
        FeedbackPoint: subOfLec.FeedbackPoint, MaxCourseSubject: subOfLec.MaxCourseSubject,
        isEnable: subOfLec.isEnable === 1 ? 0 : 1
      }).then(res => {
        if(res.status === 200){
          setIsRegister(false)
          setLoadSave(false)
          afterRegister(content)
        }
      }).catch(err => {alert('Fail to save of registration'); setLoadSave(false)})
    }
  }

  return (
    <Dialog open={isRegister} onClose={() => setIsRegister(false)} fullWidth={true}>
      <DialogTitle variant='h5' fontWeight={500} mb={1}>
        {subOfLec.isEnable === 1 ? 'Do you want to unregister this subject?' : 
          'Do you want to register this subject?'}
      </DialogTitle>
      <DialogContent>
        <Stack direction='row' gap={1}>
          <Typography>Subject:</Typography>
          <Typography>{subject.Id} - {subject.SubjectName}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color='info' variant='outlined' onClick={() => setIsRegister(false)}>Cancel</Button>
        {loadSave ? <Button variant='contained' color='info'><ClipLoader size={20} color='white'/></Button> :
          <Button variant='contained' color={subOfLec.isEnable === 1 ? 'error' : 'success'} 
            onClick={handleSave}>
            {subOfLec.isEnable === 1 ? 'Unregister' : 'Register'}
          </Button>}
      </DialogActions>
    </Dialog>
  )
}

export default RegisterConfirm