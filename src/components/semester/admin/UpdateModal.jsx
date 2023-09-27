import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners';
import request from '../../../utils/request';

const UpdateModal = ({isUpdate, setIsUpdate, course, afterUpdate}) => {
  const [inputDes, setInputDes] = useState('');
  const [amount, setAmount] = useState(0);
  const [load, setLoad] = useState(false)

  useEffect(() => {
    setAmount(course.SlotAmount)
    setInputDes(course.Description || '')
  }, [course])

  const changeAmount = (e) => {
    if(e.target.value === ''){
      setAmount('');
    }
    else{
      setAmount(Number(e.target.value))
    }
  }

  const saveUpdate = () => {
    if(amount > 0 && (amount !== course.SlotAmount || inputDes !== course.Description)){
      setLoad(true)
      request.put(`Course/${course.Id}`, {
        SubjectId: course.SubjectId, SemesterId: course.SemesterId,
        Description: inputDes, SlotAmount: amount
      }).then(res => {
        if(res.status === 200){
          setIsUpdate(false)
          setLoad(false)
          afterUpdate(true)
        }
      }).catch(err => {alert('Fail to edit course'); setLoad(false)})
    }
  }

  return (
    <Dialog fullWidth={true} maxWidth='sm'
      open={isUpdate} onClose={() => setIsUpdate(false)}>
      <DialogTitle variant='h5' fontWeight={500}>Edit Course: {course.Id}</DialogTitle>
      <DialogContent>
        <Stack mb={2}>
          <Typography fontWeight={500}>Description (Optional)</Typography>
          <TextField variant='outlined' size='small' placeholder='Enter Description'
            color='success' value={inputDes} onChange={(e) => setInputDes(e.target.value)} />
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>Slot Amount</Typography>
          <TextField variant='outlined' size='small' placeholder='Enter Slot Amount' type='number'
            color='success' value={amount} onChange={changeAmount}
            error={amount <= 0} helperText={amount <= 0 && 'Slot amount must be > 0'} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='info' onClick={() => setIsUpdate(false)}>Cancel</Button>
        {load ? <Button variant='contained'><ClipLoader size={20} color='white'/></Button>: 
          <Button variant='contained' onClick={saveUpdate} 
            disabled={(amount <= 0 || inputDes === '' ||
              (amount === course.SlotAmount && inputDes === course.Description)) ? true : false}>
            Save</Button>}
      </DialogActions>
    </Dialog>
  )
}

export default UpdateModal