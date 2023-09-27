import {
  Box, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography
} from '@mui/material'
import { green } from '@mui/material/colors';
import { useEffect, useState } from 'react';
import { HashLoader } from 'react-spinners';
import request from '../../utils/request';
import Title from '../title/Title'

const Slot = () => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [slots, setSlots] = useState([]);
  const [load, setLoad] = useState(false);

  //get semester lists
  useEffect(() => {
    const getSemesters = async () => {
      try {
        const response = await request.get('Semester', {
          params: {sortBy: 'DateEnd', order: 'Des',
            pageIndex: 1, pageSize: 100
          }
        })
        if (response.status === 200) {
          setSemesters(response.data)
        }
      }
      catch (error) {
        alert('Fail to load Semester!')
      }
    }

    getSemesters();
  }, [])

  //get current semester
  useEffect(() => {
    if (semesters.length > 0) {
      let state = false;
      const currentDate = new Date();
      for (let i in semesters) {
        if (currentDate >= new Date(semesters[i].DateStartFormat) &&
          currentDate <= new Date(semesters[i].DateEndFormat)) {
          state = true;
          setSelectedSemester(semesters[i].Id)
          break;
        }
      }
      if (!state) {
        setSelectedSemester(semesters[0].Id)
      }
    }
  }, [semesters])

  //get list slots
  useEffect(() => {
    setLoad(true)
    if (selectedSemester) {
      request.get('SlotType', {
        params: { SemesterId: selectedSemester, sortBy: 'DayOfWeekAndTimeStart',
          order: 'Asc', pageIndex: 1, pageSize: 100,
        }
      }).then(res => {
        if (res.status === 200) {
          setSlots(res.data)
          setLoad(false)
        }
      }).catch(err => {
        alert('Fail to load slot!')
        setLoad(false)
      })
    }
  }, [selectedSemester])

  const changeSemester = (e) => {
    setSelectedSemester(e.target.value)
  }

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Stack mt={1} mb={4} px={9}>
        <Title title='Slot' subTitle='List of slot type and time' />
      </Stack>
      <Stack direction='row' gap={1} alignItems='center' px={9} mb={1}>
        <Typography fontWeight={500}>Semester</Typography>
        <Select color='success'
          size='small'
          value={selectedSemester}
          onChange={changeSemester}
        >
          {
            semesters.map(semester => (
              <MenuItem value={semester.Id} key={semester.Id}>
                {semester.Term}
              </MenuItem>
            ))
          }
        </Select>
      </Stack>
      {load && <Stack px={9}><HashLoader size={30} color={green[600]}/></Stack>}
      {!load && <Stack px={9} mb={2}>
        <Paper sx={{ minWidth: 700 }}>
          <TableContainer component={Box}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell className='subject-header' align='center'>Code</TableCell>
                  <TableCell className='subject-header'>Day of Week</TableCell>
                  <TableCell className='subject-header'>Duration</TableCell>
                  <TableCell className='subject-header' align='center'>Slot Number</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slots.map(slot => (
                  <TableRow key={slot.Id} hover>
                    <TableCell align='center'>{slot.SlotTypeCode}</TableCell>
                    <TableCell>{slot.ConvertDateOfWeek}</TableCell>
                    <TableCell>{slot.Duration}</TableCell>
                    <TableCell align='center'>{slot.SlotNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>}
    </Stack>
  )
}

export default Slot