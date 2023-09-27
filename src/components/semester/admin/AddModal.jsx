import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, 
  Stack, TextField, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
import { useEffect, useMemo, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import request from '../../../utils/request';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const AddModal = ({ isAdd, setIsAdd, departments, semesterId, handleAfterImport }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [inputClass, setInputClass] = useState('');
  const [inputDes, setInputDes] = useState('');
  const [amount, setAmount] = useState(30);
  const [loadSave, setLoadSave] = useState(false);
  const [subjectCourses, setSubjectCourses] = useState([]);
  const duplicateCourse = useMemo(() => {
    if(subjectCourses.length > 0){
      return subjectCourses.find(item => item.Id === `${selectedSubject}_${inputClass.toUpperCase()}`)
    }
    return false
  }, [subjectCourses, inputClass, selectedSubject])

  useEffect(() => {
    if (departments.length > 0) {
      setSelectedDepartment(departments[0].Id)
    }
  }, [departments])

  useEffect(() => {
    if (selectedDepartment) {
      request.get('Subject', {
        params: {
          DepartmentId: selectedDepartment, sortBy: 'Id', order: 'Asc',
          pageIndex: 1, pageSize: 100
        }
      }).then(res => {
        if (res.data) {
          setSubjects(res.data);
          setSelectedSubject(res.data[0]?.Id)
        }
      }).catch(err => { alert('Fail to load subjects'); })
    }
  }, [selectedDepartment])

  //get courses by selected subject to check duplicate course
  useEffect(() => {
    if(selectedSubject){
      request.get('Course', {
        params: {
          SubjectId: selectedSubject, SemesterId: semesterId, sortBy: 'Id', 
          order: 'Asc', pageIndex: 1, pageSize: 1000
        }
      }).then(res => {
        if (res.data) {
          setSubjectCourses(res.data)
        }
      }).catch(err => { alert('Fail to load courses') })
    } 
  }, [selectedSubject, semesterId])

  const handleSelectDepartment = (e) => {
    setSelectedDepartment(e.target.value)
  }

  const handleSelectSubject = (e) => {
    setSelectedSubject(e.target.value)
  }

  const createCourse = () => {
    if(selectedSubject && inputClass && semesterId && amount > 0){
      setLoadSave(true)
      request.post('Course', {
        Id: `${selectedSubject}_${inputClass.toUpperCase()}`,
        SubjectId: selectedSubject, SemesterId: semesterId,
        Description: inputDes, SlotAmount: amount
      }).then(res => {
        if(res.status === 200 || res.status === 201){
          setIsAdd(false);
          setLoadSave(false);
          setInputClass('');
          setInputDes('');
          handleAfterImport('Add course successfully')
        }
      }).catch(err => {alert('Fail to create course'); setLoadSave(false)})
    }
  }

  return (
    <Dialog fullWidth={true} maxWidth='sm'
      open={isAdd} onClose={() => setIsAdd(false)}>
      <DialogTitle variant='h5' fontWeight={500}>Add Course</DialogTitle>
      <DialogContent>
        <Stack mb={2}>
          <Typography fontWeight={500}>Department</Typography>
          <Select color='success' size='small'
            value={selectedDepartment} onChange={handleSelectDepartment}>
            {
              departments.map(department => (
                <MenuItem key={department.Id} value={department.Id}>
                  {department.DepartmentName}</MenuItem>
              ))
            }
          </Select>
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Subject</Typography>
          <Select color='success' size='small'
            value={selectedSubject} onChange={handleSelectSubject} MenuProps={MenuProps}>
            {subjects.map(subject => (
              <MenuItem key={subject.Id} value={subject.Id}>{subject.Id} - {subject.SubjectName}</MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Class<span style={{color: red[600]}}>*</span></Typography>
          <TextField variant='outlined' size='small' placeholder='Enter Class Group' 
            color='success' value={inputClass} onChange={(e) => setInputClass(e.target.value)} 
            error={duplicateCourse} helperText={duplicateCourse && `This class with subject: ${selectedSubject} was added`}/>
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Description (Optional)</Typography>
          <TextField variant='outlined' size='small' placeholder='Enter Description' 
            color='success' value={inputDes} onChange={(e) => setInputDes(e.target.value)} />
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Slot Amount</Typography>
          <TextField variant='outlined' size='small' placeholder='Enter Slot Amount' type='number'
            color='success' value={amount} onChange={(e) => setAmount(e.target.value)} 
            error={amount <= 0} helperText={amount <=0 && 'Slot amount must be > 0'}/>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='info' onClick={() => setIsAdd(false)}>Cancel</Button>
        {loadSave ? <Button variant='contained'><ClipLoader size={20} color='white'/></Button>:
          <Button variant='contained' onClick={createCourse}
          disabled={(inputClass && amount > 0 && !duplicateCourse) ? false : true} >
          Add
        </Button>}
      </DialogActions>
    </Dialog>
  )
}

export default AddModal