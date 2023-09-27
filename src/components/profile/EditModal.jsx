import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import {ClipLoader} from 'react-spinners'

const EditModal = ({ show, handleClose, handleSave }) => {
  const [load, setLoad] = useState(false)

  useEffect(() => {
    setLoad(false)
  }, [show])

  const clickSave = () => {
    setLoad(true)
    handleSave()
  }

  return (
    <Dialog open={show} onClose={handleClose}>
      <DialogContent>
        <Typography fontSize='18px'>Are you sure to save modification in profile ?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='info' variant='outlined'>Cancel</Button>
        {load ? <Button color='success' variant='contained'><ClipLoader size={20} color='white'/></Button>: 
          <Button color='success' variant='contained' onClick={clickSave}>
            Save
          </Button>}
      </DialogActions>
    </Dialog>
  )
}

export default EditModal