import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { useState, useEffect } from 'react';

const ViewConfirmModal = ({isSet, setIsSet, handleSetAll}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false)
  }, [isSet])

  const clickAccept = () => {
    setLoading(true)
    handleSetAll()
  }
 
  return (
    <Dialog fullWidth={true} maxWidth='xs'
      open={isSet} onClose={() => setIsSet(false)}>
      <DialogTitle variant='h5' fontWeight={500}>
        Set All Confirmed
      </DialogTitle>
      <DialogContent>
        <Typography fontSize='18px'>
          Sure to set all Department Managers confirm their lecturer's schedule ?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsSet(false)} color='info' variant='outlined'>Cancel</Button>
        {loading && <Button variant='contained'>
          <ClipLoader size={24} color='white'/>  
        </Button>}
        {!loading && <Button variant='contained' onClick={clickAccept} >
          Accept
        </Button>}
      </DialogActions>
    </Dialog>
  )
}

export default ViewConfirmModal