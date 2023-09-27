import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { ArrowBackIosNew} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { green } from '@mui/material/colors';
import { useState, useEffect } from 'react';
import { HashLoader } from 'react-spinners';
import request from '../../utils/request';

const LecturerInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecturer, setLecturer] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    request.get(`User/${id}`)
    .then(res => {
      if(res.data){
        setLecturer(res.data);
        setLoading(false);
      }
    })
    .catch(err => {
      alert('Fail to load information of lecturer')
      setLoading(false);
    })
  }, [id])

  const backToList = () => {
    navigate('/manager/lecturer')
  }
  
  return (
    <Stack flex={5} height='90vh' overflow='auto'>
      <Stack direction='row' alignItems='center' color='#778899' gap={4} 
        mt={1} mb={4}>
        <Tooltip title='Back to Lecturer' arrow>
          <IconButton onClick={backToList}>
            <ArrowBackIosNew />
          </IconButton>
        </Tooltip>
        <Typography variant='h5' fontWeight={500}>
          Lecturer Information: <span style={{ color: green[600] }}>{lecturer.Name} - {lecturer.Id}</span>
        </Typography>
      </Stack>
      {loading && <Stack px={9}><HashLoader size={30} color={green[600]}/></Stack>}
      {!loading &&
      <Stack px={9} width='100%' mb={2}>
        <Stack direction='row' gap={4} mb={2}>
          <Typography width='300px'>
            <span style={{ fontWeight: 500 }}>Name: </span>
            <span>{lecturer.Name}</span>
          </Typography>
          <Typography width='300px'>
            <span style={{ fontWeight: 500 }}>Email: </span>
            <span>{lecturer.Email}</span>
          </Typography>
        </Stack>
        <Stack direction='row' gap={4} mb={2}>
          <Typography width='300px'>
            <span style={{ fontWeight: 500 }}>Department: </span>
            <span>{lecturer.DepartmentName}</span>
          </Typography>
          <Typography width='300px'>
            <span style={{ fontWeight: 500 }}>Lecturer Type: </span>
            <span>{lecturer.IsFullTime === 1 ? 'Full time' : 'Contract'}</span>
          </Typography>
        </Stack>
        <Stack direction='row' gap={4} mb={2}>
          <Typography width='300px'>
            <span style={{ fontWeight: 500 }}>Birthday: </span>
            <span>{lecturer.DateOfBirthFormatted}</span>
          </Typography>
          <Typography width='300px'>
            <span style={{ fontWeight: 500 }}>Gender: </span>
            <span>{lecturer.Gender === 1 ? 'Male' : 'Female'}</span>
          </Typography>
        </Stack>
        <Stack direction='row' gap={4} mb={2}>
          <Typography width='300px'>
            <span style={{ fontWeight: 500 }}>Phone: </span>
            <span>{lecturer.Phone}</span>
          </Typography>
          <Typography width='300px'>
            <span style={{ fontWeight: 500 }}>Card ID: </span>
            <span>{lecturer.Idcard}</span>
          </Typography>
        </Stack>
        <Typography width='600px'>
          <span style={{ fontWeight: 500 }}>Address: </span>
          <span>{lecturer.Address}</span>
        </Typography>
      </Stack>}
    </Stack>
  )
}

export default LecturerInfo