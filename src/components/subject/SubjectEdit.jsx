import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { red } from '@mui/material/colors'
import { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners';
import request from '../../utils/request';

const SubjectEdit = ({isEdit, setIsEdit, pickedSubject, afterEdit, departments}) => {
  const [selectedDepart, setSelectedDepart] = useState('');
  const [subName, setSubName] = useState('');
  const [subDes, setSubDes] = useState('');
  const [loadSave, setLoadSave] = useState(false)

  useEffect(() => {
    if(pickedSubject.Id){
      setSelectedDepart(pickedSubject.DepartmentId)
      setSubName(pickedSubject.SubjectName)
      setSubDes(pickedSubject.Description || '')
    }
  }, [pickedSubject, isEdit])

  const saveEdit = () => {
    if(selectedDepart && subName && (selectedDepart !== pickedSubject.DepartmentId || 
      subName !== pickedSubject.SubjectName || subDes !== pickedSubject.Description)){
      setLoadSave(true)
      request.put(`Subject/${pickedSubject.Id}`, {
        SubjectName: subName,
        Description: subDes,
        DepartmentId: selectedDepart
      }).then(res => {
        if(res.status === 200){
          setIsEdit(false)
          setLoadSave(false)
          afterEdit(true)
        }
      }).catch(err => {setLoadSave(false)})
    }
  }

  return (
    <Dialog open={isEdit} onClose={() => setIsEdit(false)} fullWidth={true}>
      <DialogTitle variant='h5' fontWeight={500} mb={1}>
        Edit Subject
      </DialogTitle>
      <DialogContent>
        <Stack mb={2} direction='row' gap={1}>
          <Typography fontWeight={500}>Code: </Typography>
          <Typography>{pickedSubject.Id}</Typography>
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Department</Typography>
          {departments.length > 0 && 
          <Select size='small' value={selectedDepart} 
            onChange={(e) => setSelectedDepart(e.target.value)}>
            {departments.map(depart => (
              <MenuItem key={depart.Id} value={depart.Id}>{depart.Id} - {depart.DepartmentName}</MenuItem>
            ))}
          </Select>}
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Name<span style={{color: red[600]}}>*</span></Typography>
          <TextField size='small' value={subName} onChange={(e) => setSubName(e.target.value)}/>
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Description</Typography>
          <TextField size='small' value={subDes} onChange={(e) => setSubDes(e.target.value)}/>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color='info' variant='outlined' onClick={() => setIsEdit(false)}>Cancel</Button>
        {loadSave ? <Button variant='contained'><ClipLoader size={20} color='white'/></Button> :
         <Button variant='contained' onClick={saveEdit} 
         disabled={subName.length === 0 || (subName === pickedSubject.SubjectName && selectedDepart === pickedSubject.DepartmentId && subDes === pickedSubject.Description)}>
          Edit</Button>}
      </DialogActions>
    </Dialog>
  )
}

export default SubjectEdit