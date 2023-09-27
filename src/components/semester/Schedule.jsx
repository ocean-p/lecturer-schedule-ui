import { Box, MenuItem, Select, Stack, Switch, Typography } from '@mui/material'
import { blue, grey } from '@mui/material/colors';
import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { getWeeksInYear, getSemesterWeeks } from '../../utils/weeksInYear';
import Timetable from '../main/Timetable';
import SwapModal from '../swap/SwapModal';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

const Schedule = ({ semester, selectedId, popUp, isManager, lecturerDepart, myCourseGroup }) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [weeksInYear, setWeeksInYear] = useState([]);
  const [weeksInSemester, setWeeksInSemester] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedWeekObj, setSelectedWeekObj] = useState({});
  const [isSwap, setIsSwap] = useState(false);
  const [isSwapModal, setIsSwapModal] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState({});
  const [afterSwap, setAfterSwap] = useState(false);
  const [overTen, setOverTen] = useState(false);

  //set Week in year
  useEffect(() => {
    if (Object.values(semester).length > 0) {
      setWeeksInYear(getWeeksInYear(Number(semester.Term.split(' ')[1])))
    }
  }, [semester])

  //set Week in semester
  useEffect(() => {
    if (Object.values(semester).length > 0 && weeksInYear.length > 0) {
      const result = getSemesterWeeks(weeksInYear, semester.DateStartFormat, semester.DateEndFormat)
      setWeeksInSemester(result);
    }
  }, [semester, weeksInYear])

  //set slected week by current time
  useEffect(() => {
    if (weeksInSemester.length > 0) {
      const currentDay = new Date();
      let state = false;
      for (let i in weeksInSemester) {
        const week = weeksInSemester[i].week;
        const start = new Date(week.split(' to ')[0]);
        start.setDate(start.getDate() - 1);
        const end = new Date(week.split(' to ')[1]);
        end.setDate(end.getDate() + 1);
        if (currentDay >= start && currentDay <= end) {
          state = true;
          setSelectedWeek(weeksInSemester[i].id)
          setSelectedWeekObj(weeksInSemester[i])
          break;
        }
      }
      if (!state) {
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

  const handleSelectWeek = (e) => {
    setSelectedWeek(e.target.value)
    setSelectedWeekObj(weeksInSemester.find(item => item.id === e.target.value))
  }

  const clickSlotToSwap = (pickedSlot) => {
    if(isSwap && pickedSlot.Id){
      console.log(pickedSlot)
      setSelectedSwap(pickedSlot)
      setIsSwapModal(true)
    }
  }

  const handleAfterSwap = (status) => {
    if(status){
      setAfterSwap(prev => !prev)
      toast.success('Swap Successfully!', {
        position: "top-right", autoClose: 3000, hideProgressBar: false,
        closeOnClick: true, pauseOnHover: true, draggable: true,
        progress: undefined, theme: "light",
      });
    }
  }

  return (
    <Box height='100%' mb={1}>
      <Stack direction='row' alignItems='center' justifyContent='space-between'  
        px={popUp ? '' : 9} mb={2}>
        <Stack direction='row' gap={1} alignItems='center'>
          <Typography fontWeight={500}>Week</Typography>
          <Select color='success' MenuProps={MenuProps}
            size='small' value={selectedWeek} onChange={handleSelectWeek}>
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
        {isManager && semester.State === 5 && lecturerDepart === account.DepartmentId &&
          myCourseGroup.GroupName !== 'confirm' &&
          <Stack direction='row' alignItems='center' bgcolor={grey[200]}>
            <Switch checked={isSwap} onChange={() => setIsSwap(!isSwap)} />
            <Typography pr={2}>
              {isSwap ? <span style={{ color: blue[700] }}>Swap On</span> : 'Swap Off'}
            </Typography>
          </Stack>
        }
      </Stack>
      {semester.State && (semester.State !== 5 && semester.State !== 6) && 
        <Typography px={popUp ? '' : 9}>The system haven't generated the schedule yet</Typography>}
      
      {semester.State && (semester.State === 5 || semester.State === 6) && <>
      <Timetable selectedSemester={semester?.Id} selectedWeekObj={selectedWeekObj}
        lecturerId={selectedId ? selectedId : account.Id} popUp={popUp} isSwap={isSwap}
        clickSlotToSwap={clickSlotToSwap} afterSwap={afterSwap} overTen={overTen}/>
      <Box height='16px'>
      </Box>
      <SwapModal isSwapModal={isSwapModal} setIsSwapModal={setIsSwapModal} 
        selectedSwap={selectedSwap} handleAfterSwap={handleAfterSwap}/>
      <ToastContainer/></>}
    </Box>
  )
}

export default Schedule