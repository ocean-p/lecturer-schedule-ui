import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { red } from '@mui/material/colors'
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import request from '../../utils/request';

const DepartmentEdit = ({isEdit, setIsEdit, pickedDepart, afterEdit}) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [inputName, setInputName] = useState('');
  const [loadSave, setLoadSave] = useState(false);

  useEffect(() => {
    if(pickedDepart.Id){
      setSelectedGroup(pickedDepart.DepartmentGroupId)
      setInputName(pickedDepart.DepartmentName)
    }
  }, [pickedDepart, isEdit])

  useEffect(() => {
    request.get('DepartmentGroup', {
      params: {pageIndex: 1, pageSize: 100}
    }).then(res => {
      if(res.data.length > 0){
        setGroups(res.data)
      }
    }).catch(err => {alert('Fail to get department groups')})
  }, [])

  const saveEdit = () => {
    if(inputName && (selectedGroup !== pickedDepart.DepartmentGroupId ||
      inputName !== pickedDepart.DepartmentName)){
      setLoadSave(true)
      request.put(`Department/${pickedDepart.Id}`, {
        DepartmentName: inputName,
        DepartmentGroupId: selectedGroup
      }).then(res => {
        if(res.status === 200){
          setIsEdit(false)
          setLoadSave(false)
          afterEdit(true)
        }
      }).catch(err => setLoadSave(false))
    }
  }

  return (
    <Dialog open={isEdit} onClose={() => setIsEdit(false)} fullWidth={true}>
      <DialogTitle variant='h5' fontWeight={500} mb={1}>
        Edit Department
      </DialogTitle>
      <DialogContent>
        <Stack mb={2} direction='row' gap={1}>
          <Typography fontWeight={500}>Code:</Typography>
          <Typography>{pickedDepart.Id}</Typography>
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Group</Typography>
          <Select size='small' value={selectedGroup} 
            onChange={(e) => setSelectedGroup(e.target.value)}>
            {groups.map(group => (
              <MenuItem key={group.Id} value={group.Id}>{group.Id} - {group.DepartmentGroupName}</MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Name<span style={{color: red[600]}}>*</span></Typography>
          <TextField size='small' value={inputName} onChange={(e) => setInputName(e.target.value)}/>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color='info' variant='outlined' onClick={() => setIsEdit(false)}>Cancel</Button>
        {loadSave ? <Button variant='contained'><ClipLoader size={20} color='white'/></Button> : 
        <Button variant='contained' onClick={saveEdit} disabled={inputName.length === 0 || (inputName === pickedDepart.DepartmentName && selectedGroup === pickedDepart.DepartmentGroupId) }>
          Save</Button>}
      </DialogActions>
    </Dialog>
  )
}

export default DepartmentEdit