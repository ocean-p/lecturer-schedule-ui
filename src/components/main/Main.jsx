import { MenuItem, Select, Stack, Typography } from '@mui/material'
import Timetable from './Timetable';
import './Main.css'
import { useState, useEffect } from 'react';
import request from '../../utils/request';
import {getWeeksInYear, getSemesterWeeks} from '../../utils/weeksInYear'

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const Main = () => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterObj, setSelectedSemesterObj] = useState({});
  const [selectedSemester, setSelectedSemester] = useState('');
  const [weeksInYear, setWeeksInYear] = useState([]);
  const [weeksInSemester, setWeeksInSemester] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedWeekObj, setSelectedWeekObj] = useState({});
  const [overTen, setOverTen] = useState(false);

  //get semester list
  useEffect(() => {
    const getSemesters = async() => {
      // try {
      //   const response = await request.get('Semester', {
      //     params: {
      //       sortBy: 'DateEnd',
      //       order: 'Des',
      //       pageIndex: 1,
      //       pageSize: 999
      //     }
      //   })
      //   if(response.status === 200){
      //     setSemesters(response.data)
      //   }
      // } 
      // catch (error) {
      //   alert('Fail to load Semester!')
      // }
    }

    getSemesters();
  }, [])

  //after response semester list, set selected semester by current time
  useEffect(() => {
    if(semesters.length > 0){
      let state = false;
      const currentDate = new Date();
      for(let i in semesters){
        if(currentDate >= new Date(semesters[i].DateStartFormat) && 
            currentDate <= new Date(semesters[i].DateEndFormat))
        {
          state = true;
          setSelectedSemester(semesters[i].Id)
          setSelectedSemesterObj(semesters[i]);
          break;
        }
      }
      if(!state){
        setSelectedSemester(semesters[0].Id)
        setSelectedSemesterObj(semesters[0]);
      }
    }
  }, [semesters])

  //set week in years after selected semester
  useEffect(() => {
    if(selectedSemesterObj.Term){
      const year = Number(selectedSemesterObj.Term.split(' ')[1])
      setWeeksInYear(getWeeksInYear(year))
    }
  }, [selectedSemesterObj])

  //get weeks in semesters after set selected semester
  useEffect(() => {
    if(Object.values(selectedSemesterObj).length > 0 && weeksInYear.length > 0){
      const result = getSemesterWeeks(weeksInYear, selectedSemesterObj.DateStartFormat, selectedSemesterObj.DateEndFormat)
      setWeeksInSemester(result);
    }
  }, [selectedSemesterObj, weeksInYear])

  //set selected weeks by current time
  useEffect(() => {
    if(weeksInSemester.length > 0){
      const currentDay = new Date();
      let state = false;
      for(let i in weeksInSemester){
        const week = weeksInSemester[i].week;
        const start = new Date(week.split(' to ')[0]);
        start.setDate(start.getDate() - 1);
        const end = new Date(week.split(' to ')[1]);
        end.setDate(end.getDate() + 1)
        if(currentDay >= start && currentDay <= end){
          state=true;
          setSelectedWeek(weeksInSemester[i].id)
          setSelectedWeekObj(weeksInSemester[i])
          break;
        }
      }
      if(!state){
        setSelectedWeek(weeksInSemester[0].id)
        setSelectedWeekObj(weeksInSemester[0])
      }
    }
  }, [weeksInSemester])

  //get over ten week or not
  useEffect(() => {
    if(selectedWeek && selectedWeekObj.id && weeksInSemester.length > 0){
      let numberWeek = 0
      for (let i in weeksInSemester) {
        if (weeksInSemester[i].id === selectedWeek) {
          numberWeek = Number(i)
          break;
        }
      }
      if (numberWeek >= 10) setOverTen(true)
      else setOverTen(false)
    }
  }, [selectedWeek, selectedWeekObj, weeksInSemester])

  const handleSelectSemester = (e) => {
    setSelectedSemester(e.target.value)
    const selected = semesters.find(item => item.Id === e.target.value)
    setSelectedSemesterObj(selected)
  }

  const handleSelectWeek = (e) => {
    setSelectedWeek(e.target.value)
    setSelectedWeekObj(weeksInSemester.find(item => item.id === e.target.value))
  }

  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Stack direction='row' mb={2} px={9} justifyContent='space-between' mt={1}>
        <Typography variant='h5' color='#778899' fontWeight='500'>
          Schedule of Lecturer ({account && account.Name})
        </Typography>
        <Stack direction='row' gap={4}>
          <Stack direction='row' gap={1} alignItems='center'>
            <Typography fontWeight={500}>Semester</Typography>
            <Select color='success' size='small'
              value={selectedSemester} onChange={handleSelectSemester}>
              {semesters.map(semester => (
                <MenuItem value={semester.Id} key={semester.Id}>
                  {semester.Term}
                </MenuItem>
              ))}
            </Select>
          </Stack>
          <Stack direction='row' gap={1} alignItems='center'>
            <Typography fontWeight={500}>Week</Typography>
            <Select color='success' size='small' MenuProps={MenuProps}
              value={selectedWeek} onChange={handleSelectWeek}>
              {weeksInSemester.length > 0 &&
                weeksInSemester.map(week => (
                  <MenuItem value={week.id} key={week.id}>
                    <span>{week.week.split(' to ')[0].split('-')[2]}</span>
                    <span>/{week.week.split(' to ')[0].split('-')[1]}</span>
                    <span>{' - '}</span>
                    <span>{week.week.split(' to ')[1].split('-')[2]}</span>
                    <span>/{week.week.split(' to ')[1].split('-')[1]}</span>
                  </MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>
      </Stack>
      <Timetable selectedSemester={selectedSemester} selectedWeekObj={selectedWeekObj}
        lecturerId={1} isPublic={true} overTen={overTen}/>
    </Stack>
  )
}

export default Main