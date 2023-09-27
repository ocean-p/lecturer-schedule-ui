import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { useState, useEffect } from 'react';

const ConfirmModal = ({isConfirm, setIsConfirm, content, mode, saveNextState, savePrevState}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [isConfirm])

  const clickOK = () => {
    setLoading(true);
    if(mode === 'next'){
      saveNextState();
    }
    else{
      savePrevState();
    }
  }

  return (
    <Dialog fullWidth={true} maxWidth='xs'
      open={isConfirm} onClose={() => setIsConfirm(false)}>
      <DialogContent>
        <Typography fontSize='18px'>
          {content}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsConfirm(false)} color='info' variant='outlined'>Cancel</Button>
        {loading && <Button color='error' variant='contained'>
          <ClipLoader size={24} color='white'/>  
        </Button>}
        {!loading && <Button color='error' variant='contained' onClick={clickOK} autoFocus>
          Change
        </Button>}
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmModal