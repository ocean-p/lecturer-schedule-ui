import { Box, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material'
import { green } from '@mui/material/colors';
import { useEffect, useState } from 'react';
import { HashLoader } from 'react-spinners';
import request from '../../utils/request';

const RegisteredSubject = ({ semesterId }) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [regisSubs, setRegisSubs] = useState([]);
  const [subs, setSubs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [load, setLoad] = useState(false);
  
  //get subject of lecturer
  useEffect(() => {
    if(semesterId && account.Id){
      setLoad(true)
      request.get('SubjectOfLecturer', {
        params: {SemesterId: semesterId, LecturerId: account.Id, isEnable: 1, 
          sortBy: 'SubjectId', order: 'Asc', pageIndex:1, pageSize:100}
      }).then(res => {
        if(res.data.length > 0){
          setRegisSubs(res.data)
          setLoad(false)
        }
      }).catch(err => {alert('Fail to get registered subjects'); setLoad(false)})
    }
  }, [semesterId, account.Id])

  //get subjects
  useEffect(() => {
    request.get('Subject', {
      params: {sortBy:'Id', order: 'Asc', pageIndex: 1, pageSize: 500}
    }).then(res => {
      if(res.data.length > 0){
        setSubs(res.data)
      }
    }).catch(err => {alert('Fail to get subjects')})
  }, [])

  //set rows = subject.length
  useEffect(() => {
    if (regisSubs.length > 0) {
      setRowsPerPage(regisSubs.length)
    }
  }, [regisSubs])

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Stack height='90vh' px={9}>
      {load && <HashLoader size={30} color={green[600]}/>}
      {!load && <><Stack direction='row' gap={1} mb={1}>
        <Typography fontWeight={500}>Total: </Typography>
        <Typography>{regisSubs.length}</Typography>
      </Stack>
      <Paper sx={{ minWidth: 700, mb: 2 }}>
        <TableContainer component={Box} sx={{ overflow: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell className='subject-header'>Code</TableCell>
                <TableCell className='subject-header'>Name</TableCell>
                <TableCell className='subject-header'>Department</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {regisSubs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(sub => (
                  <TableRow key={sub.Id}>
                    <TableCell>{sub.SubjectId}</TableCell>
                    <TableCell>{sub.SubjectName}</TableCell>
                    <TableCell>
                      {subs.length > 0 && 
                        subs.find(item => item.Id === sub.SubjectId)?.DepartmentName} {' '}
                      {subs.length > 0 && 
                      subs.find(item => item.Id === sub.SubjectId)?.DepartmentId !== account.DepartmentId ? 
                      '(External)' : ''}
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, regisSubs.length]}
          component='div' count={regisSubs.length}
          rowsPerPage={rowsPerPage} page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton showLastButton
          sx={{ bgcolor: 'ghostwhite'}}
        />
      </Paper></>}
    </Stack>
  )
}

export default RegisteredSubject