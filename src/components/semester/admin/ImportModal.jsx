import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography
} from '@mui/material';
import { useState } from 'react';
import { ClipLoader } from 'react-spinners';
import request from '../../../utils/request';

const ImportModal = ({ isImport, setIsImport, importCourses, semesterId, handleAfterImport }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loadImport, setLoadImport] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const saveImportCourse = () => {
    if (importCourses.length > 0) {
      setLoadImport(true)
      request.post(`Course/AddListCourse/${semesterId}`, importCourses)
        .then(res => {
          if (res.status === 200) {
            setIsImport(false);
            setLoadImport(false);
            handleAfterImport('Import successfully')
          }
        })
        .catch(err => {alert('Fail to import course'); setLoadImport(false)})
    }
  }

  return (
    <Dialog fullWidth={true} maxWidth='md'
      open={isImport} onClose={() => setIsImport(false)}>
      <DialogTitle>Import Courses</DialogTitle>
      <DialogContent>
        <Typography>Total: {importCourses.length}</Typography>
        <Paper sx={{ minWidth: 700, mb: 2 }}>
          <TableContainer component={Box}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell size='small' className='subject-header'>Course</TableCell>
                  <TableCell size='small' className='subject-header'>Subject</TableCell>
                  <TableCell size='small' className='subject-header'>Description</TableCell>
                  <TableCell size='small' className='subject-header'>Slot Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  importCourses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(course => (
                      <TableRow key={course.Id} hover>
                        <TableCell size='small'>{course.Id}</TableCell>
                        <TableCell size='small'>{course.SubjectId}</TableCell>
                        <TableCell size='small'>{course.Description}</TableCell>
                        <TableCell size='small'>{course.SlotAmount}</TableCell>
                      </TableRow>
                    ))
                }
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20]} component='div'
            count={importCourses.length} rowsPerPage={rowsPerPage}
            page={page} onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            showFirstButton showLastButton
            sx={{ bgcolor: 'ghostwhite' }}
          />
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button variant='outlined' color='info' onClick={() => setIsImport(false)}>Cancel</Button>
        {loadImport ? 
          <Button variant='contained'><ClipLoader size={20} color='white'/></Button> :
          <Button variant='contained' onClick={saveImportCourse}>Import</Button>}
      </DialogActions>
    </Dialog>
  )
}

export default ImportModal