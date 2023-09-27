import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { ClipLoader } from 'react-spinners';
import request from '../../../utils/request';
import { getMondays, getSundays } from '../../../utils/weeksInYear';

const SemesterUpdate = ({isUpdate, setIsUpdate, selectedSemester, handleAfterUpdate}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loadUpdate, setLoadUpdate] = useState(false);

  useEffect(() => {
    if(selectedSemester.DateStartFormat && selectedSemester.DateEndFormat){
      setStartDate(selectedSemester.DateStartFormat)
      setEndDate(selectedSemester.DateEndFormat)
    }
  }, [selectedSemester.DateStartFormat, selectedSemester.DateEndFormat])

  const mondays = useMemo(() => {
    if(selectedSemester.Term){
      const selectedTerm = selectedSemester.Term.split(' ')[0];
      const selectedYear = selectedSemester.Term.split(' ')[1];
      return getMondays(Number(selectedYear), selectedTerm)
    }
    return []
  }, [selectedSemester.Term])

  const sundays = useMemo(() => {
    if(selectedSemester.Term){
      const selectedTerm = selectedSemester.Term.split(' ')[0];
      const selectedYear = selectedSemester.Term.split(' ')[1];
      return getSundays(Number(selectedYear), selectedTerm)
    }
    return []
  }, [selectedSemester.Term])

  const updateSemester = () => {
    if(startDate!==selectedSemester.DateStartFormat || endDate!==selectedSemester.DateEndFormat){
      setLoadUpdate(true)
      request.put(`Semester/${selectedSemester.Id}`, {
        Term: selectedSemester.Term,
        DateStart: startDate,
        DateEnd: endDate,
        State: selectedSemester.State
      }).then(res => {
        if(res.status === 200){
          setIsUpdate(false)
          setLoadUpdate(false)
          handleAfterUpdate(true)
        }
      }).catch(err => {alert('Fail to update semester'); setLoadUpdate(false)})
    }
  }

  return (
    <Dialog fullWidth={true} open={isUpdate} 
      onClose={() => setIsUpdate(false)}>
      <DialogTitle>
        <Typography variant='h5' fontWeight={500}>Update Semester: {selectedSemester.Term}</Typography>
      </DialogTitle>
      <DialogContent>
        <Stack mb={2}>
          <Typography fontWeight={500}>Start Date</Typography>
          <Select size='small' value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}>
            {mondays.map(monday => (
              <MenuItem key={monday} value={monday}>{monday.split('-').reverse().join('/')}</MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack mb={2}>
          <Typography fontWeight={500}>End Date</Typography>
          <Select size='small' value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}>
            {sundays.map(sunday => (
              <MenuItem key={sunday} value={sunday}>{sunday.split('-').reverse().join('/')}</MenuItem>
            ))}
          </Select>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color='info' variant='outlined' onClick={() => setIsUpdate(false)}>Cancel</Button>
        {loadUpdate ? 
        <Button variant='contained'><ClipLoader size={20} color='white'/></Button>:
        <Button variant='contained' disabled={(startDate!==selectedSemester.DateStartFormat || endDate!==selectedSemester.DateEndFormat) ? false : true}
          onClick={updateSemester}>
          Update
        </Button>}
      </DialogActions>
    </Dialog>
  )
}

export default SemesterUpdate