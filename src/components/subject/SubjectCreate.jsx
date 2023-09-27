import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { red } from '@mui/material/colors'
import { useEffect, useState, useMemo } from 'react'
import { ClipLoader } from 'react-spinners';
import request from '../../utils/request';

const SubjectCreate = ({isCreate, setIsCreate, afterCreate, departments}) => {
  const [selectedDepart, setSelectedDepart] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [des, setDes] = useState('');
  const [load, setLoad] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const duplicateCode = useMemo(() => {
    if(code.length > 0 && subjects.length > 0){
      return subjects.find(item => item.Id.toLowerCase() === code.toLowerCase()) ? true : false
    }
    return false
  }, [code, subjects])

  //get departments
  useEffect(() => {
    if(departments.length > 0){
      setSelectedDepart(departments[0].Id)
    }
  }, [departments])

  //get subjects
  useEffect(() => {
    request.get('Subject', {params: {pageIndex: 1, pageSize: 500}})
      .then(res => {
        if (res.data.length > 0) {
          setSubjects(res.data)
        }
      })
  }, [])

  const createSubject = () => {
    if(code && name && selectedDepart){
      setLoad(true)
      request.post('Subject', {
        Id: code.toUpperCase(), SubjectName: name,
        Description: des, DepartmentId: selectedDepart
      }).then(res => {
        if(res.status === 200 || res.status === 201){
          setIsCreate(false)
          setCode('')
          setName('')
          setDes('')
          setLoad(false)
          afterCreate(true)
        }
      }).catch(err => {setLoad(false)})
    }
  }

  return (
    <Dialog open={isCreate} onClose={() => setIsCreate(false)} fullWidth={true}>
      <DialogTitle variant='h5' fontWeight={500} mb={1}>
        Create Subject
      </DialogTitle>
      <DialogContent>
        {duplicateCode && 
          <Typography color={red[600]} mb={1}>This code was created.</Typography>
        }
        <Stack mb={2}>
          <Typography fontWeight={500}>Department</Typography>
          <Select size='small' value={selectedDepart} 
            onChange={(e) => setSelectedDepart(e.target.value)}>
            {departments.map(depart => (
              <MenuItem key={depart.Id} value={depart.Id}>{depart.Id} - {depart.DepartmentName}</MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Code<span style={{color: red[600]}}>*</span></Typography>
          <TextField size='small' value={code} onChange={(e) => setCode(e.target.value)}/>
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Name<span style={{color: red[600]}}>*</span></Typography>
          <TextField size='small' value={name} onChange={(e) => setName(e.target.value)}/>
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Description</Typography>
          <TextField size='small' value={des} onChange={(e) => setDes(e.target.value)}/>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color='info' variant='outlined' onClick={() => setIsCreate(false)}>Cancel</Button>
        {load ? <Button variant='contained'><ClipLoader size={20} color='white'/></Button> : 
        <Button variant='contained' onClick={createSubject} 
          disabled={code.length === 0 || name.length === 0 || selectedDepart.length === 0 || duplicateCode}>
          Create</Button>}
      </DialogActions>
    </Dialog>
  )
}

export default SubjectCreate