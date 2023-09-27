import { Box, FormControl, FormControlLabel, Paper, Radio, RadioGroup, Stack, Switch, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import React, { useState, useEffect } from 'react'
import request from '../../utils/request'
import configData from '../../utils/configData.json';
import { blue, green, grey, red } from '@mui/material/colors'
import { ToastContainer, toast } from 'react-toastify';
import { ThumbDown, ThumbUp } from '@mui/icons-material';
import { ClipLoader, HashLoader } from 'react-spinners';

const SlotType = ({ semesterId, semesterState }) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [slots, setSlots] = useState([]);
  const [favoriteSlots, setFavoriteSlots] = useState([]);
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [reload, setReload] = useState(false);
  const [mode, setMode] = useState('like')
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState('');
  const [loadSlot, setLoadSlot] = useState(false);

  //get slottype list
  useEffect(() => {
    setLoadSlot(true)
    if(semesterId){
      request.get('SlotType', {
        params: {SemesterId: semesterId, sortBy: 'DayOfWeekAndTimeStart', 
          order: 'Asc', pageIndex: 1, pageSize: 100}
      }).then(res => {
        if (res.status === 200) {
          setSlots(res.data)
          setLoadSlot(false)
        }
      }).catch(err => {alert('Fail to load slot!'); setLoadSlot(false)})
    }
  }, [semesterId])

  //get slotfavorite by lecturerId, semesterId
  useEffect(() => {
    if(account.Id && semesterId){
      request.get('LecturerSlotConfig', {
        params: {
          LecturerId: account.Id, SemesterId: semesterId,
          pageIndex: 1, pageSize: 100
        }
      }).then(res => {
        if (res.status === 200) {
          setFavoriteSlots(res.data)
        }
      }).catch(err => {
        alert('Fail to load favorite slots!');
      })
    }
  }, [account.Id, semesterId, reload])

  //set pickedslot
  useEffect(() => {
    if (favoriteSlots.length > 0) {
      for (let i in favoriteSlots) {
        if (favoriteSlots[i].PreferenceLevel === 1) {
          setLikes(prev => [...prev, favoriteSlots[i].SlotTypeId])
        }
        else if (favoriteSlots[i].PreferenceLevel === -1) {
          setDislikes(prev => [...prev, favoriteSlots[i].SlotTypeId])
        }
      }
    }

    return () => {
      setLikes([])
      setDislikes([])
    }
  }, [favoriteSlots])

  const handleChangeMode = (e) => {
    setMode(e.target.value);
  }

  const handlePick = (id) => {
    if (!isEdit || loading || semesterState !== 2) {
      return;
    }

    setPicked(id);
    let obj = {}
    if (mode === 'like') {
      if (likes.find(like => like === id) || dislikes.find(dislike => dislike === id)) {
        return;
      }
      if (likes.length >= configData.LIKE_SLOT_NUMBER) {
        return;
      }
      for (let i in favoriteSlots) {
        if (favoriteSlots[i].SlotTypeId === id && obj.PreferenceLevel !== 1) {
          obj = favoriteSlots[i]
          break;
        }
      }
      if (Object.values(obj).length > 0) {
        setLoading(true)
        request.put(`LecturerSlotConfig/${obj.Id}`, {
          SlotTypeId: id, LecturerId: account.Id, SemesterId: semesterId,
          PreferenceLevel: 1, IsEnable: obj.IsEnable
        }).then(res => {
          if (res.status === 200) {
            setReload(prev => !prev)
            setLoading(false)
            toast.success('Like Successfully!', {
              position: "top-right", autoClose: 2000, hideProgressBar: false,
              closeOnClick: true, pauseOnHover: true, draggable: true,
              progress: undefined, theme: "light",
            });
          }
        }).catch(err => { alert('Save like Fail!'); setLoading(false)})
      }
    }
    else if (mode === 'dislike') {
      if (likes.find(like => like === id) || dislikes.find(dislike => dislike === id)) {
        return;
      }
      if (dislikes.length >= configData.DISLIKE_SLOT_NUMBER) {
        return;
      }
      for (let i in favoriteSlots) {
        if (favoriteSlots[i].SlotTypeId === id && obj.PreferenceLevel !== -1) {
          obj = favoriteSlots[i]
          break;
        }
      }
      if (Object.values(obj).length > 0) {
        setLoading(true)
        request.put(`LecturerSlotConfig/${obj.Id}`, {
          SlotTypeId: id,LecturerId: account.Id, SemesterId: semesterId,
          PreferenceLevel: -1, IsEnable: obj.IsEnable
        }).then(res => {
          if (res.status === 200) {
            setLoading(false)
            setReload(prev => !prev)
            toast.success('Dislike Successfully!', {
              position: "top-right", autoClose: 2000, hideProgressBar: false,
              closeOnClick: true, pauseOnHover: true, draggable: true,
              progress: undefined, theme: "light",
            });
          }
        }).catch(err => {
            alert('Save disLike Fail!')
            setLoading(false)
          })
      }
    }
    else {
      if (likes.find(like => like === id) || dislikes.find(dislike => dislike === id)) {
        for (let i in favoriteSlots) {
          if (favoriteSlots[i].SlotTypeId === id) {
            obj = favoriteSlots[i]
            break;
          }
        }
        if (Object.values(obj).length > 0) {
          setLoading(true)
          request.put(`LecturerSlotConfig/${obj.Id}`, {
            SlotTypeId: id, LecturerId: account.Id, SemesterId: semesterId,
            PreferenceLevel: 0, IsEnable: obj.IsEnable
          }).then(res => {
              if (res.status === 200) {
                setLoading(false)
                setReload(prev => !prev)
                toast.success('Eraser Successfully!', {
                  position: "top-right", autoClose: 1000, hideProgressBar: false,
                  closeOnClick: true, pauseOnHover: true, draggable: true,
                  progress: undefined, theme: "light",
                });
              }
          }).catch(err => {
              alert('Save disLike Fail!')
              setLoading(false)
            })
        }
      }
    }
  }

  return (
    <Box px={9} mb={2}>
      <Stack direction='row' gap={4}>
        <Typography color={blue[600]}>
          <span style={{fontWeight: 500}}>Like:</span> {likes.length}/{configData.LIKE_SLOT_NUMBER}
        </Typography>
        <Typography color={red[600]}>
          <span style={{fontWeight: 500}}>Dislike:</span> {dislikes.length}/{configData.DISLIKE_SLOT_NUMBER}
        </Typography>
      </Stack>
      {semesterState === 2 &&
      <Stack direction='row' alignItems='center' justifyContent='space-between' mb={1}>
        <Stack direction='row' alignItems='center' gap={2}>
          <Typography fontWeight={500}>Mode: </Typography>
          <FormControl>
            <RadioGroup value={mode} onChange={handleChangeMode}>
              <Stack direction='row' >
                <FormControlLabel value='like' control={<Radio color='primary' />} label="Like" />
                <FormControlLabel value='dislike' control={<Radio color='error' />} label="Dislike" />
                <FormControlLabel value='delete' control={<Radio color='info' />} label="Eraser" />
              </Stack>
            </RadioGroup>
          </FormControl>
        </Stack>
        <Stack direction='row' alignItems='center' bgcolor={grey[200]}>
          <Switch checked={isEdit} onChange={() => setIsEdit(!isEdit)} />
          <Typography pr={2}>
            {isEdit ? <span style={{ color: blue[600] }}>Rating On</span> : 'Rating Off'}
          </Typography>
        </Stack>
      </Stack>}
      {loadSlot && <HashLoader size={30} color={green[600]}/>}
      {!loadSlot && <Stack mb={2}>
        <Paper sx={{ minWidth: 700, mb: 2 }}>
          <TableContainer component={Box}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell align='center' className='subject-header manage-slot'>
                    Code
                  </TableCell>
                  <TableCell align='center' className='subject-header manage-slot'>
                    Day of Week
                  </TableCell>
                  <TableCell align='center' className='subject-header manage-slot'>
                    Duration
                  </TableCell>
                  <TableCell align='center' className='subject-header manage-slot'>
                    Slot Number
                  </TableCell>
                  <TableCell align='center' className='subject-header manage-slot'>
                    Rating
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slots.map(slot => (
                  <TableRow key={slot.Id} hover sx={{ '&:hover': { cursor: semesterState === 2 && isEdit ? 'pointer' : 'default' } }} 
                    onClick={() => handlePick(slot.Id)}>
                    <TableCell align='center' className='manage-slot'>{slot.SlotTypeCode}</TableCell>
                    <TableCell align='center' className='manage-slot'>{slot.ConvertDateOfWeek}</TableCell>
                    <TableCell align='center' className='manage-slot'>{slot.Duration}</TableCell>
                    <TableCell align='center' className='manage-slot'>{slot.SlotNumber}</TableCell>
                    <TableCell align='center' className='manage-slot'
                      sx={{
                        bgcolor: (likes.find(like => like === slot.Id) || dislikes.find(dislike => dislike === slot.Id))
                          ? '' : (likes.length === configData.LIKE_SLOT_NUMBER && dislikes.length === configData.DISLIKE_SLOT_NUMBER) ? grey[100] : ''
                      }}
                    >
                      {likes.find(like => like === slot.Id) &&
                        <ThumbUp sx={{ color: blue[600], fontSize: '20px' }} />}
                      {dislikes.find(dislike => dislike === slot.Id) &&
                        <ThumbDown sx={{ color: red[600], fontSize: '20px' }} />}
                      {loading && picked === slot.Id && <ClipLoader size={20} color='grey'/>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>}
      <ToastContainer />
    </Box>
  )
}

export default SlotType

