import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Stack, Typography } from '@mui/material'
import {Send} from '@mui/icons-material'
import { useEffect, useState } from 'react';
import {ClipLoader} from 'react-spinners';
import request from '../../utils/request';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const RequestModal = ({ isRequest, setIsRequest, requests, semesterId, sendRequest}) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [managerId, setManagerId] = useState('');
  const [loadCreate, setLoadCreate] = useState(false);

  //get list department
  useEffect(() => {
    const getDepartments = async () => {
      try {
        const response = await request.get(`Department/${account.DepartmentId}`);
        const departmentList = await request.get('Department', {
          params: {
            DepartmentGroupId: response.data.DepartmentGroupId, sortBy: 'Id', order: 'Asc',
            pageIndex: 1, pageSize: 100
          }
        })
        if(departmentList.data.length > 0){
          let dataDepart = departmentList.data
          dataDepart = dataDepart.filter(item => item.Id !== account.DepartmentId)
          setDepartments(dataDepart)
          setSelectedDepartment(dataDepart[0]?.Id)
        }
      }
      catch (error) {alert('Fail to get Department!' + error)}
    }

    getDepartments();
  }, [account.DepartmentId])

  //get manager by department
  useEffect(() => {
    if(selectedDepartment){
      request.get('User', {
        params: {DepartmentId:selectedDepartment, RoleIDs:'DMA', pageIndex:1, pageSize:1}
      }).then(res => {
        if(res.data.length > 0){
          setManagerId(res.data[0].Id)
        }
      }).catch(err => {alert('Fail to get manager')})
    }
  }, [selectedDepartment])

  //get subjects and filter requested subjects
  useEffect(() => {
    if (selectedDepartment) {
      request.get('Subject', {
        params: {
          DepartmentId: selectedDepartment, sortBy: 'Id', order: 'Asc',
          pageIndex: 1, pageSize: 100
        }
      }).then(res => {
        if (res.data) {
          let dataSubject = res.data;
          for(let i in requests){
            dataSubject = dataSubject.filter(data => (data.Id !== requests[i].SubjectId))
          }
          setSubjects(dataSubject);
          setSelectedSubject(dataSubject[0]?.Id)
        }
      }).catch(err => { alert('Fail to load subjects !!' + err); })
    }
  }, [selectedDepartment, requests])

  const createRequest = () => {
    if(selectedDepartment && selectedSubject && managerId){
      setLoadCreate(true)
      request.post('Request', {
        Title: 'Teaching Subject', Description: '',
        LecturerId: account.Id, DepartmentManagerId: managerId,
        SubjectId: selectedSubject, SemesterId: semesterId
      }).then(res => {
        if(res.status === 201){
          setIsRequest(false)
          sendRequest(true)
          setLoadCreate(false)
        }
      }).catch(err => {alert('Fail to request'); setLoadCreate(false)})
    }
  }

  return (
    <Dialog fullWidth maxWidth='sm' 
      open={isRequest} onClose={() => setIsRequest(false)}>
      <DialogTitle>
        <Stack direction='row' alignItems='center' gap={1}>
          <Send />
          <Typography variant='h5'>Request for teaching external subjects</Typography>
        </Stack>
        <Typography color='gray' fontSize='14px'>
          *Request Manager a subject which you want to teach</Typography>
      </DialogTitle>
      <DialogContent>
        <Stack mb={2}>
          <Typography fontWeight={500}>External Departments: </Typography>
          <Select size='small' fullWidth value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            {departments.map(item => (
              <MenuItem key={item.Id} value={item.Id}>{item.Id} - {item.DepartmentName}</MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Subjects: </Typography>
          <Select size='small' fullWidth value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
            MenuProps={MenuProps}>
            {subjects.map(item => (
              <MenuItem key={item.Id} value={item.Id}>{item.Id} - {item.SubjectName}</MenuItem>
            ))}
          </Select>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='info' onClick={() => setIsRequest(false)}>Cancel</Button>
        {loadCreate ?
          <Button variant='contained'><ClipLoader size={20} color='white'/></Button> :
          <Button variant='contained' onClick={createRequest}>
            Send</Button>}
      </DialogActions>
    </Dialog>
  )
}

export default RequestModal
