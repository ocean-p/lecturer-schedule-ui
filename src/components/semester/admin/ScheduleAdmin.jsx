import { Stack } from '@mui/material'
import Schedule from '../Schedule'

const ScheduleAdmin = ({ lecturerId, lecturerDepart, semester, admin, myCourseGroup }) => {

  return (
    <Stack height='90vh'>
      <Schedule semester={semester} selectedId={lecturerId} popUp={true} 
        isManager={admin ? false : true} lecturerDepart={lecturerDepart} myCourseGroup={myCourseGroup}/> 
    </Stack>
  )
}

export default ScheduleAdmin