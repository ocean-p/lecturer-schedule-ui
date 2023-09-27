import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { useEffect, useState } from 'react';

const ClearConfirm = ({isClear, setIsClear, selectedCourse, saveClear}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [isClear])

  const clear = () => {
    setLoading(true);
    saveClear();
  }

  return (
    <Dialog fullWidth={true} maxWidth='xs'
      open={isClear} onClose={() => setIsClear(false)}>
      <DialogContent>
        <Typography fontSize='18px'>
          Clear Assignment of Course: <span style={{fontWeight: 500}}>{selectedCourse}</span>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsClear(false)} color='info' variant='outlined'>Cancel</Button>
        {loading && <Button color='error' variant='contained'>
          <ClipLoader size={24} color='white'/>  
        </Button>}
        {!loading && <Button color='error' variant='contained' onClick={clear} autoFocus>
          Clear
        </Button>}
      </DialogActions>
    </Dialog>
  )
}

export default ClearConfirm