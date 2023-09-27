import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormControlLabel, IconButton, Radio, RadioGroup, Stack, Tooltip, Typography
}
  from '@mui/material';
import { Check, Star, ThumbUp, ThumbDown } from '@mui/icons-material';
import React, { useState, useEffect } from 'react'
import { blue, red } from '@mui/material/colors'
import { ClipLoader } from 'react-spinners'
import request from '../../utils/request';
import configData from '../../utils/configData.json';

const RatingModal = ({ isRating, setIsRating, subjectId, favoriteSubjects, loadPoint, subjectName, manager, semesterId }) => {
  const subjectFavorite = favoriteSubjects?.length > 0 &&
    favoriteSubjects.find(item => item.SubjectId === subjectId)
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [value, setValue] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // for first load to get current point
  useEffect(() => {
    if (subjectFavorite) {
      setValue(subjectFavorite.FavoritePoint)
    }
    setIsSuccess(false);
    setError('');
    setIsLoading(false);
  }, [subjectFavorite, loadPoint])

  const handleSave = () => {
    setIsLoading(true);
    if (subjectFavorite) {
      if (value === 5) {
        const pointfive = favoriteSubjects.filter(item => item.FavoritePoint === 5)
        if (pointfive.length >= configData.POINT_FIVE_NUMBER) {
          return;
        }
      }
      if (value === 1) {
        const pointone = favoriteSubjects.filter(item => item.FavoritePoint === 1)
        if (pointone.length >= configData.POINT_ONE_NUMBER) {
          return;
        }
      }
      request.put(`SubjectOfLecturer/${subjectFavorite.Id}`, {
        DepartmentManagerId: subjectFavorite.DepartmentManagerId,
        SemesterId: subjectFavorite.SemesterId,
        SubjectId: subjectFavorite.SubjectId,
        LecturerId: subjectFavorite.LecturerId,
        FavoritePoint: value,
        FeedbackPoint: subjectFavorite.FeedbackPoint,
        MaxCourseSubject: subjectFavorite.MaxCourseSubject,
        isEnable: subjectFavorite.isEnable
      })
        .then(res => {
          if (res.status === 200) {
            setTimeout(() => {
              setIsRating(false)
            }, 500)
            setIsLoading(false)
            setIsSuccess(true)
          }
        })
        .catch(err => {
          setError('Fail to save new point')
          setIsLoading(false)
        })
    }
    else {
      request.post('SubjectOfLecturer', {
        DepartmentManagerId: manager ? manager.Id : null,
        SemesterId: semesterId,
        SubjectId: subjectId,
        LecturerId: account.Id,
        FavoritePoint: value,
        FeedbackPoint: 0,
        MaxCourseSubject: 3,
        isEnable: 1
      })
        .then(res => {
          if (res.status === 201) {
            setTimeout(() => {
              setIsRating(false)
            }, 500)
            setIsLoading(false)
            setIsSuccess(true)
          }
        })
        .catch(err => {
          alert('Fail to rate!')
          setIsLoading(false)
        })
    }
  }

  const handleChangeValue = (e) => {
    setError('');
    const point = Number(e.target.value);
    setValue(point);
    if (point === 5) {
      const pointfive = favoriteSubjects.filter(item => item.FavoritePoint === 5)
      const pointfiveExpect = pointfive.filter(item => item.SubjectId !== subjectId)
      if (pointfiveExpect.length >= configData.POINT_FIVE_NUMBER) {
        setError(`You already have ${configData.POINT_FIVE_NUMBER} subjects at point 5`);
        return;
      }
    }
    if (point === 1) {
      const pointone = favoriteSubjects.filter(item => item.FavoritePoint === 1)
      const pointoneExpect = pointone.filter(item => item.SubjectId !== subjectId)
      if (pointoneExpect.length >= configData.POINT_ONE_NUMBER) {
        setError(`You already have ${configData.POINT_ONE_NUMBER} subjects at point 1`);
        return;
      }
    }
  }

  const handleLike = () => {
    setError('');
    setValue(5);
    const pointfive = favoriteSubjects.filter(item => item.FavoritePoint === 5)
    const pointfiveExpect = pointfive.filter(item => item.SubjectId !== subjectId)
    if (pointfiveExpect.length >= configData.POINT_FIVE_NUMBER) {
      setError(`You already have ${configData.POINT_FIVE_NUMBER} subjects at point 5`);
    }
  }

  const handleDislike = () => {
    setError('');
    setValue(1);
    const pointone = favoriteSubjects.filter(item => item.FavoritePoint === 1)
    const pointoneExpect = pointone.filter(item => item.SubjectId !== subjectId)
    if (pointoneExpect.length >= configData.POINT_ONE_NUMBER) {
      setError(`You already have ${configData.POINT_ONE_NUMBER} subjects at point 1`);
    }
  }

  return (
    <Dialog open={isRating}>
      <DialogTitle color={blue[600]} mb={1}>
        <Stack direction='row' alignItems='center' gap={1}>
          <Star />
          <Typography variant='h5'>Subject Rating</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack direction='row' mb={1}>
          <Typography width='100px' fontWeight={500}>Subject: </Typography>
          <Typography>{subjectId} - {subjectName}</Typography>
        </Stack>
        <Stack direction='row' mb={1}>
          <Typography width='100px' fontWeight={500}>Department: </Typography>
          <Typography>{account.DepartmentName}</Typography>
        </Stack>
        <Stack alignItems='center' gap={2}>
          <FormControl margin='normal'>
            <RadioGroup
              value={value}
              onChange={handleChangeValue}
            >
              <Stack direction='row' alignItems='center'>
                <Tooltip title='Dislike' placement='bottom'>
                  <IconButton onClick={handleDislike}>
                    <ThumbDown sx={{ color: red[500], fontSize: '28px' }} />
                  </IconButton>
                </Tooltip>
                <FormControlLabel value='1' control={<Radio color='error' />} label="1" labelPlacement='bottom' />
                <FormControlLabel value='2' control={<Radio color='error' />} label="2" labelPlacement='bottom' />
                <FormControlLabel value='3' control={<Radio color='success' />} label="3" labelPlacement='bottom' />
                <FormControlLabel value='4' control={<Radio />} label="4" labelPlacement='bottom' />
                <FormControlLabel value='5' control={<Radio />} label="5" labelPlacement='bottom' />
                <Tooltip title='Like' placement='bottom'>
                  <IconButton onClick={handleLike}>
                    <ThumbUp sx={{ color: blue[600], fontSize: '28px' }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </RadioGroup>
          </FormControl>
          <Typography>{value} {value === 1 ? 'point' : 'points' }</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        {isLoading &&
          <ClipLoader size={30} color={blue[600]} />
        }
        {!isLoading && !isSuccess &&
          <>
            {error &&
              <Alert severity="error" sx={{mr: 2}}>{error}</Alert>
            }
            <Button onClick={() => setIsRating(false)} color='info' variant='outlined'>Cancel</Button>
            <Button variant='contained' onClick={handleSave} autoFocus
              disabled={value === subjectFavorite?.FavoritePoint || error.length > 0}>
              Save
            </Button>
          </>
        }
        {!isLoading && isSuccess &&
          <Alert icon={<Check fontSize="inherit" />} severity="success">
            Save Successfully!
          </Alert>
        }
      </DialogActions>
    </Dialog>
  )
}

export default RatingModal