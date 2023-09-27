import {Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormControlLabel, Radio, RadioGroup, Stack, Typography
}from '@mui/material';
import { Chat, Check} from '@mui/icons-material';
import React, { useState, useEffect, useMemo } from 'react'
import { blue} from '@mui/material/colors';
import request from '../../utils/request';
import { ClipLoader } from 'react-spinners';

const FeedbackModal = ({ isFeedback, setIsFeedback, lecturer, subjectId, points, loadPoint }) => {
  const [value, setValue] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const account = JSON.parse(localStorage.getItem('web-user'));
  const subject = useMemo(() => {
    const result = points.length > 0 && points.find(item => item.SubjectId === subjectId);
    return result;
  }, [subjectId, points])

  useEffect(() => {
    if (subject) {
      setValue(subject.FeedbackPoint)
    }
    setIsSuccess(false);
    setIsLoading(false);
  }, [subject, loadPoint])

  const handleChangeValue = (e) => {
    setValue(Number(e.target.value));
  }

  const handleSave = () => {
    if (subject) {
      setIsLoading(true)
      request.put(`SubjectOfLecturer/${subject.Id}`, {
        DepartmentManagerId: account.Id,
        SemesterId: subject.SemesterId,
        SubjectId: subject.SubjectId,
        LecturerId: subject.LecturerId,
        FavoritePoint: subject.FavoritePoint,
        FeedbackPoint: value,
        MaxCourseSubject: subject.MaxCourseSubject,
        isEnable: subject.isEnable
      })
        .then(res => {
          if (res.status === 200) {
            setTimeout(() => {
              setIsFeedback(false)
            }, 500)
            setIsLoading(false)
            setIsSuccess(true)
          }
        })
        .catch(err => {
          alert('Fail to save feedback')
        })
    }
  }

  return (
    <Dialog open={isFeedback} onClose={() => setIsFeedback(false)}>
      <DialogTitle color={blue[700]} mb={1}>
        <Stack direction='row' alignItems='center' gap={1}>
          <Chat />
          <Typography variant='h5'>Evaluate to Lecturer with each subject</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack direction='row' mb={1} gap={1}>
          <Typography fontWeight={500}>Lecturer: </Typography>
          <Typography>{lecturer?.Name} ({lecturer?.Email})</Typography>
        </Stack>
        <Stack direction='row' mb={1} gap={1}>
          <Typography fontWeight={500}>Department: </Typography>
          <Typography>{lecturer?.DepartmentName}</Typography>
        </Stack>
        <Stack direction='row' mb={1} gap={1}>
          <Typography fontWeight={500}>Subject: </Typography>
          <Typography>{subjectId} - {subject?.SubjectName}</Typography>
        </Stack>
        <Stack alignItems='center'>
          <FormControl margin='normal'>
            <RadioGroup value={value} onChange={handleChangeValue}>
              <Stack direction='row' alignItems='center'>
                <FormControlLabel value='1' control={<Radio color='error' />} label="Weak" labelPlacement='bottom' />
                <FormControlLabel value='2' control={<Radio color='error' />} label="Not Good" labelPlacement='bottom' />
                <FormControlLabel value='3' control={<Radio color='success' />} label="Normal" labelPlacement='bottom' />
                <FormControlLabel value='4' control={<Radio />} label="Good" labelPlacement='bottom' />
                <FormControlLabel value='5' control={<Radio />} label="Excellent" labelPlacement='bottom' />
              </Stack>
            </RadioGroup>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        {isLoading &&
          <ClipLoader size={30} color={blue[600]} />
        }
        {!isLoading && !isSuccess &&
          <>
            <Button onClick={() => setIsFeedback(false)} color='info' variant='outlined'>Cancel</Button>
            <Button variant='contained' onClick={handleSave} autoFocus
              disabled={value === subject?.FeedbackPoint}>
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

export default FeedbackModal