import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { red } from '@mui/material/colors';

const Alert = ({isAlert, setIsAlert, contentAlert}) => {
  return (
    <Dialog fullWidth={true} maxWidth='sm'
      open={isAlert} onClose={() => setIsAlert(false)}>
      <DialogContent>
        <Typography color={red[600]} fontWeight={500} fontSize='18px'>{contentAlert}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='info' onClick={() => setIsAlert(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default Alert