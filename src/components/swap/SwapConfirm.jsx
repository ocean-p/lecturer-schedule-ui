import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import React from 'react'

const SwapConfirm = ({isConfirm, setIsConfirm, alertConfirm, handleSwap}) => {
  return (
    <Dialog maxWidth='sm' fullWidth={true}
      open={isConfirm} onClose={() => setIsConfirm(false)}>
      <DialogTitle>
        <Typography variant='h5' fontWeight={500}>Swap Confirm</Typography>
      </DialogTitle>
      <DialogContent>
        {alertConfirm}
      </DialogContent>
      <DialogActions>
        <Button color='info' variant='outlined' onClick={() => setIsConfirm(false)}>
          Cancel</Button>
        <Button variant='contained' onClick={handleSwap}>
          Continue</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SwapConfirm