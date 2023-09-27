import { Button, FormControl, FormControlLabel, Radio, RadioGroup, Stack, TextField, Tooltip, Typography } from '@mui/material'
import React, { useState } from 'react';
import { Save } from '@mui/icons-material';
import './Profile.css';
import EditModal from './EditModal';
import request from '../../utils/request';
import { ToastContainer, toast } from 'react-toastify';

const initialAccount = {
  Name: '',
  DateOfBirthFormatted: '',
  Phone: '',
  Address: '',
  Gender: '',
  Idcard: '',
  Email: '',
  DepartmentName: '',
  IsFullTime: 1,
}

const Profile = () => {
  //const [account, setAccount] = useState(JSON.parse(localStorage.getItem('web-user')));
  const [account, setAccount] = useState(initialAccount)
  const [name, setName] = useState(account.Name);
  const [dob, setDob] = useState(account.DateOfBirthFormatted);
  const [phone, setPhone] = useState(account.Phone);
  const [address, setAddress] = useState(account.Address);
  const [radioValue, setRadioValue] = useState(account.Gender);
  const [idCard, setIdCard] = useState(account.Idcard);
  const email = account.Email;
  const department = account.DepartmentName;
  const type = account.IsFullTime === 1 ? 'Full-time' : 'Contract';
  const [show, setShow] = useState(false);

  const handleChange = (event) => {
    setRadioValue(Number(event.target.value));
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSave = () => {
    // request.put(`User/${account.Id}`, {
    //   Name: name, Email: email,
    //   Dob: dob, Gender: radioValue,
    //   Idcard: idCard, Address: address,
    //   Phone: phone, PriorityLecturer: account.PriorityLecturer,
    //   IsFullTime: account.IsFullTime, DepartmentId: account.DepartmentId
    // }).then(res => {
    //   if (res.status === 200) {
    //     localStorage.setItem('web-user', JSON.stringify(res.data))
    //     setAccount(res.data)
    //     setShow(false);
    //     toast.success('Update profile successfully', {
    //       position: "top-right", autoClose: 3000,
    //       hideProgressBar: false, closeOnClick: true,
    //       pauseOnHover: true, draggable: true,
    //       progress: undefined, theme: "light",
    //     });
    //   }
    // }).catch(err => {
    //   toast.error('Fail to update profile', {
    //     position: "top-right", autoClose: 3000,
    //     hideProgressBar: false, closeOnClick: true,
    //     pauseOnHover: true, draggable: true,
    //     progress: undefined, theme: "light",
    //   });
    // })
  }

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Typography variant='h5' color='#778899' fontWeight={500}
        px={9} mt={1}>
        Profile
      </Typography>
      <Stack px={9} width='60%' mb={2}>
        <TextField label='Full Name' variant='outlined' color='success' required
          margin='normal' size='small' value={name} onChange={(e) => setName(e.target.value)}
          error={name.length === 0} helperText={name.length === 0 && 'Name is required'} />
        <Stack direction={'row'} justifyContent='space-between'>
          <TextField label='Birthday' variant='outlined' color='success' margin='normal' size='small'
            type='date' InputLabelProps={{ shrink: true, }} value={dob} onChange={(e) => setDob(e.target.value)} />
          <FormControl margin='normal'>
            <RadioGroup
              value={radioValue}
              onChange={handleChange}
            >
              <Stack direction='row' >
                <FormControlLabel value='1' control={<Radio color='success' />} label="Male" />
                <FormControlLabel value='0' control={<Radio color='success' />} label="Female" />
              </Stack>
            </RadioGroup>
          </FormControl>
        </Stack>
        <Stack direction='row' justifyContent='space-between'>
          <TextField label='Phone' variant='outlined' color='success' margin='normal' size='small' required
            error={!/^([0-9]{10,11})$/.test(phone)} helperText={!/^([0-9]{10,11})$/.test(phone) && 'Phone must be 10 or 11 numbers'}
            value={phone} onChange={(e) => setPhone(e.target.value)} />
          <TextField label='Card ID' variant='outlined' color='success' margin='normal' size='small' required
            error={!/^([0-9]{12})$/.test(idCard)} helperText={!/^([0-9]{12})$/.test(idCard) && 'Card ID must be 12 numbers'}
            value={idCard} onChange={(e) => setIdCard(e.target.value)} />
        </Stack>
        <TextField label='Address' variant='outlined' color='success' margin='normal' size='small'
          multiline rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
        <Tooltip title='Can not modify' placement='right' arrow>
          <TextField label='Email' variant='outlined' color='success' margin='normal' size='small'
            defaultValue={email}
            InputProps={{ readOnly: true }} />
        </Tooltip>
        {//(account.RoleIDs.includes('LC') || account.RoleIDs.includes('DMA')) &&
          <Tooltip title='Can not modify' placement='right' arrow>
            <TextField label='Department' variant='outlined' color='success' margin='normal' size='small'
              defaultValue={department}
              InputProps={{ readOnly: true }} />
          </Tooltip>}
        {//account.RoleIDs.includes('LC') &&
          <Tooltip title='Can not modify' placement='right' arrow>
            <TextField label='Lecturer Type' variant='outlined' color='success' margin='normal' size='small'
              defaultValue={type}
              InputProps={{ readOnly: true }} />
          </Tooltip>}
        <Button variant='contained' color='success'
          endIcon={<Save />} onClick={handleShow} size='small'
          disabled={
            (!/^([0-9]{12})$/.test(idCard) || !/^([0-9]{10,11})$/.test(phone)) || 
            ((name === account.Name || name.length === 0) && 
            dob === account.DateOfBirthFormatted &&
            radioValue === account.Gender && phone === account.Phone && 
            idCard === account.Idcard  && address === account.Address)}>
          Save
        </Button>
      </Stack>
      <EditModal show={show} handleClose={handleClose} handleSave={handleSave} />
      <ToastContainer />
    </Stack>
  )
}

export default Profile