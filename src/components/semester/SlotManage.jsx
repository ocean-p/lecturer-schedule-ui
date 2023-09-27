import { CancelOutlined, ThumbDown, ThumbUp } from '@mui/icons-material'
import { Alert, Box, Button, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { blue, grey, red } from '@mui/material/colors'
import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import AlertComponent from '../alert/Alert';
import request from '../../utils/request'
import configData from '../../utils/configData.json';

const SlotManage = ({ lecturer, semester, admin }) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [slots, setSlots] = useState([]);
  const [configSlots, setConfigSlots] = useState([]);
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [bans, setBans] = useState([]);
  const [disables, setDisables] = useState([]);
  const [reload, setReload] = useState(false);
  const [edit, setEdit] = useState(false);
  const [loadDisable, setLoadDisable] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [scheduledCourses, setScheduledCourses] = useState([]);
  const [isAlert, setIsAlert] = useState(false);
  const [contentAlert, setContentAlert] = useState('');

  //get slot type list by semester
  useEffect(() => {
    if (semester.Id) {
      request.get('SlotType', {
        params: {SemesterId: semester.Id, sortBy: 'DayOfWeekAndTimeStart', 
          order: 'Asc', pageIndex: 1, pageSize: 100}
      }).then(res => {
        if (res.status === 200) {
          setSlots(res.data)
        }
      }).catch(err => {alert('Fail to load slot!')})
    }
  }, [semester.Id])

  //get lecturer slot config
  useEffect(() => {
    if(semester.Id && lecturer.Id){
      request.get('LecturerSlotConfig', {
        params: {LecturerId: lecturer.Id, SemesterId: semester.Id,
          pageIndex: 1, pageSize: 100}
      }).then(res => {
        if (res.status === 200) {
          setConfigSlots(res.data)
        }
      }).catch(err => {alert('Fail to load favorite slots!');})
    }
  }, [lecturer.Id, semester.Id, reload])

  //clarify slot rating of lecturer to like and dislike
  useEffect(() => {
    if (configSlots.length > 0) {
      for (let i in configSlots) {
        if (configSlots[i].PreferenceLevel === 1) {
          setLikes(prev => [...prev, configSlots[i].SlotTypeId])
        }
        else if (configSlots[i].PreferenceLevel === -1) {
          setDislikes(prev => [...prev, configSlots[i].SlotTypeId])
        }

        if (configSlots[i].IsEnable === 0) {
          setDisables(prev => [...prev, configSlots[i].SlotTypeId])
          setBans(prev => [...prev, configSlots[i].SlotTypeId])
        }
      }
    }

    return () => {
      setLikes([])
      setDislikes([])
      setBans([])
      setDisables([])
    }
  }, [configSlots])

  //get scheduled courses of lecturer
  useEffect(() => {
    const getScheduledCourses = async() => {
      try {
        const resSchedule = await request.get('Schedule', {
          params: {SemesterId: semester.Id, pageIndex: 1, pageSize: 1}
        })
        if(resSchedule.data.length > 0){
          const scheduleId = resSchedule.data[0]?.Id
          const resCourse = await request.get('CourseAssign', {
            params: {LecturerId: lecturer.Id, ScheduleId: scheduleId, 
              sortBy: 'CourseId', order: 'Asc', pageIndex: 1, pageSize: 100}
          })
          if(resCourse.data.length > 0){
            setScheduledCourses(resCourse.data)
          }
        }
      }catch (error) {}
    }

    if(semester.Id && lecturer.Id){
      getScheduledCourses();
    }
  }, [semester.Id, lecturer.Id])

  const handleBan = (slotId) => {
    if (!edit) return;

    if (configSlots.length > 0) {
      const obj = configSlots.find(slot => slot.SlotTypeId === slotId)
      if (obj) {
        if (obj.IsEnable === 1) {
          if (disables.length >= configData.DISABLE_SLOT) return;
          if(scheduledCourses.length > 0){
            const checkSlot = scheduledCourses.find(item => item.SlotTypeId === slotId);
            if(checkSlot){
              setContentAlert(`This slot was assigned a course: ${checkSlot.CourseId}.`)
              setIsAlert(true);
              return;
            }
          }
        }
        setSelectedId(slotId)
        setLoadDisable(true)
        request.put(`LecturerSlotConfig/${obj.Id}`, {
          SlotTypeId: obj.SlotTypeId, LecturerId: obj.LecturerId,
          SemesterId: obj.SemesterId, PreferenceLevel: obj.PreferenceLevel,
          IsEnable: obj.IsEnable === 1 ? 0 : 1
        }).then(res => {
          if (res.status === 200) {
            setReload(!reload)
            setLoadDisable(false)
            toast.success('Save Successfully!', {
              position: "top-right", autoClose: 3000, hideProgressBar: false,
              closeOnClick: true, pauseOnHover: true, draggable: true,
              progress: undefined, theme: "light",
            });
          }
        }).catch(err => {
          alert('Fail to disable slot!')
          setLoadDisable(false)
        })
      }
    }
  }

  const handleApply = () => {
    if (dislikes.length > 0 && configSlots.length > 0 && disables.length === 0) {
      for (let i in dislikes) {
        const checkSlot = scheduledCourses.find(item => item.SlotTypeId === dislikes[i])
        if(checkSlot){
          setContentAlert('Having assigned courses in dislike slots.')
          setIsAlert(true);
          break;
        }
        const obj = configSlots.find(item => item.SlotTypeId === dislikes[i])
        request.put(`LecturerSlotConfig/${obj.Id}`, {
          SlotTypeId: obj.SlotTypeId, LecturerId: obj.LecturerId,
          SemesterId: obj.SemesterId, PreferenceLevel: obj.PreferenceLevel,
          IsEnable: 0
        }).then(res => {
          if (res.status === 200) {
            if (Number(i) === (dislikes.length - 1)) {
              setReload(!reload)
              toast.success('Apply Successfully!', {
                position: "top-right", autoClose: 3000, hideProgressBar: false,
                closeOnClick: true, pauseOnHover: true, draggable: true,
                progress: undefined, theme: "light",
              });
            }
          }
        }).catch(err => {alert('Fail to apply')})
      }
    }
  }

  return (
    <Stack height='90vh'>
      {(admin || lecturer.DepartmentId === account.DepartmentId) &&
        <Typography color='gray' variant='subtitle1' mb={1}>
          *View favorite point and Disable teaching slot
        </Typography>}
      {!admin && lecturer.DepartmentId && lecturer.DepartmentId !== account.DepartmentId &&
        <Alert severity="error">Can not disable slot to the external lecturer.</Alert>
      }
      {((lecturer.DepartmentId && lecturer.DepartmentId === account.DepartmentId) || admin) &&
      <><Stack direction='row' justifyContent='space-between' mb={1} alignItems='center'>
          <Stack direction='row' alignItems='center' gap={2}>
            <Typography color={grey[500]} variant='subtitle1'>(*Re-select to disable new one)</Typography>
          </Stack>
          {semester.State === 3 && !admin &&
            <Stack direction='row' alignItems='center' gap={2}>
              <Button variant='contained' color='warning' size='small' sx={{ textTransform: 'none' }}
                disabled={disables.length > 0 || dislikes.length === 0} onClick={handleApply}>
                Apply Dislike for Disable
              </Button>
              <Stack direction='row' alignItems='center' bgcolor={grey[200]}>
                <Switch checked={edit} onChange={() => setEdit(!edit)} />
                <Typography pr={2}>
                  {edit ? <span style={{ color: blue[600] }}>Disable On</span> : 'Disable Off'}
                </Typography>
              </Stack>
            </Stack>}
        </Stack>
        <Stack>
          <Paper sx={{ minWidth: 700 }}>
            <TableContainer component={Box}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell align='center' className='subject-header manage-slot'>
                      Code</TableCell>
                    <TableCell align='center' className='subject-header manage-slot'>
                      Day of Week</TableCell>
                    <TableCell align='center' className='subject-header manage-slot'>
                      Duration</TableCell>
                    <TableCell align='center' className='subject-header manage-slot'>
                      Slot Number</TableCell>
                    <TableCell align='center' className='subject-header manage-slot'>
                      Rating</TableCell>
                    <TableCell align='center' className='subject-header'>
                      Disable ({bans.length}/{configData.DISABLE_SLOT})
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slots.map(slot => (
                    <TableRow key={slot.Id} hover sx={{ '&:hover': { cursor: edit ? 'pointer' : 'default' } }}
                      onClick={() => handleBan(slot.Id)}>
                      <TableCell align='center' className='manage-slot'>{slot.SlotTypeCode}</TableCell>
                      <TableCell align='center' className='manage-slot'>{slot.ConvertDateOfWeek}</TableCell>
                      <TableCell align='center' className='manage-slot'>{slot.Duration}</TableCell>
                      <TableCell align='center' className='manage-slot'>{slot.SlotNumber}</TableCell>
                      <TableCell align='center' className='manage-slot'
                        sx={{
                          bgcolor: (likes.find(like => like === slot.Id) || dislikes.find(dislike => dislike === slot.Id))
                            ? '' : grey[100]
                        }}>
                        {likes.find(like => like === slot.Id) &&
                          <ThumbUp sx={{ color: blue[600] }} />}
                        {dislikes.find(dislike => dislike === slot.Id) &&
                          <ThumbDown sx={{ color: red[600] }} />}
                      </TableCell>
                      <TableCell align='center'
                        sx={{ bgcolor: disables.find(disable => disable === slot.Id) ? '' : (disables.length >= configData.DISABLE_SLOT ? grey[100] : '') }}
                      >
                        {disables.find(disable => disable === slot.Id) &&
                          <CancelOutlined sx={{ color: red[600] }} />}
                        {loadDisable && selectedId === slot.Id && <ClipLoader size={20} color={grey[400]} />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      </>}
      <AlertComponent isAlert={isAlert} setIsAlert={setIsAlert} contentAlert={contentAlert}/>
      <ToastContainer />
    </Stack>
  )
}

export default SlotManage