import { Check, EditOutlined } from '@mui/icons-material';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Stack, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import { useEffect, useMemo, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import request from '../../utils/request';

const MaxCourseModal = ({ isMax, setIsMax, lecturer, subjectId, points, loadPoint }) => {
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
      setValue(subject.MaxCourseSubject)
    }
    setIsSuccess(false);
    setIsLoading(false);
  }, [subject, loadPoint])

  const handleSave = () => {
    if (subject) {
      setIsLoading(true)
      request.put(`SubjectOfLecturer/${subject.Id}`, {
        DepartmentManagerId: account.Id,
        SemesterId: subject.SemesterId,
        SubjectId: subject.SubjectId,
        LecturerId: subject.LecturerId,
        FavoritePoint: subject.FavoritePoint,
        FeedbackPoint: subject.FeedbackPoint,
        MaxCourseSubject: value,
        isEnable: subject.isEnable
      })
        .then(res => {
          if (res.status === 200) {
            setTimeout(() => {
              setIsMax(false)
            }, 500)
            setIsLoading(false)
            setIsSuccess(true)
          }
        })
        .catch(err => {
          alert('Fail to edit max courses')
        })
    }
  }

  return (
    <Dialog open={isMax} onClose={() => setIsMax(false)}>
      <DialogTitle color={blue[700]} mb={1}>
        <Stack direction='row' alignItems='center' gap={1}>
          <EditOutlined />
          <Typography variant='h5'>Edit max courses number of each subject</Typography>
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
        <Stack direction='row' alignItems='center' gap={1}>
          <Typography fontWeight={500}>Max number: </Typography>
          <Select color='success' size='small'
            value={value} onChange={(e) => setValue(Number(e.target.value))}>
            <MenuItem value='1'>1 course</MenuItem>
            <MenuItem value='2'>2 courses</MenuItem>
            <MenuItem value='3'>3 courses</MenuItem>
            <MenuItem value='4'>4 courses</MenuItem>
            <MenuItem value='5'>5 courses</MenuItem>
          </Select>
        </Stack>
      </DialogContent>
      <DialogActions>
        {isLoading &&
          <ClipLoader size={30} color={blue[600]} />
        }
        {!isLoading && !isSuccess &&
          <>
            <Button onClick={() => setIsMax(false)} color='info' variant='outlined'>Cancel</Button>
            <Button variant='contained' onClick={handleSave} autoFocus
              disabled={value === subject?.MaxCourseSubject}>
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

export default MaxCourseModal