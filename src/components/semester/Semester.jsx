import { Grid, Stack, Typography } from '@mui/material'
import { useState, useEffect } from 'react'
import './Semester.css'
import {HashLoader} from 'react-spinners';
import request from '../../utils/request';
import SemesterCard from './SemesterCard';
import { green, red } from '@mui/material/colors';
import { semestersData } from '../../data/Semesters';

const Semester = () => {
  const [semesters, setSemesters] = useState(semestersData);
  const [loading, setLoading] = useState(false);

  //get semester list
  useEffect(() => {
    // setLoading(true)
    // request.get('Semester', {
    //   params: {
    //     sortBy: 'DateEnd',
    //     order: 'Des',
    //     pageIndex: 1,
    //     pageSize: 100
    //   }
    // })
    //   .then(res => {
    //     if (res.status === 200) {
    //       setSemesters(res.data)
    //       setLoading(false);
    //     }
    //   })
    //   .catch(err => {
    //     alert('Fail to load semesters!')
    //     setLoading(false)
    //   })
  }, [])

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Typography variant='h5' color='#778899' fontWeight={500} px={9} mt={1}>
        Semester
      </Typography>
      <Typography color='gray' px={9} variant='subtitle1' mb={4}>
        List of all semesters
      </Typography>
      {loading && <Stack px={9}><HashLoader size={30} color={green[600]}/></Stack>}
      {!loading && semesters.length === 0 && 
        <Typography px={9} color={red[600]}>No semesters have been created.</Typography>}
      {!loading && <Grid container spacing={6} px={9} mb={2}>
        {semesters.map(semester => (
          <Grid item xs={4} key={semester.Id}>
            <SemesterCard semester={semester} />
          </Grid>
        ))}
      </Grid>}
    </Stack>
  )
}

export default Semester
