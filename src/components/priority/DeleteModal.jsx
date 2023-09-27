import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { useState, useEffect } from 'react';

const DeleteModal = ({isDelete, setIsDelete, saveDelete, contentDelete}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [isDelete])

  const clickDelete = () => {
    setLoading(true);
    saveDelete();
  }

  return (
    <Dialog open={isDelete}
      onClose={() => setIsDelete(false)}>
      <DialogTitle variant='h5' fontWeight={500}>
        Delete Confirm
      </DialogTitle>
      <DialogContent>
        <Typography fontSize='20px'>
          Are you sure to delete {contentDelete} ?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsDelete(false)} color='info' variant='outlined'>Cancel</Button>
        {loading && <Button color='error' variant='contained'>
          <ClipLoader size={24} color='white'/>  
        </Button>}
        {!loading && <Button color='error' variant='contained' onClick={clickDelete} autoFocus>
          Delete
        </Button>}
      </DialogActions>
    </Dialog>
  )
}

export default DeleteModal