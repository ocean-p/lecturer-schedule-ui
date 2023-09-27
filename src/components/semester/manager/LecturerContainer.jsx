import { useEffect, useState } from 'react';
import LecturerList from './LecturerList';
import InforModal from '../InforModal';
import request from '../../../utils/request';

const LecturerContainer = ({admin, semester, scheduleId, refresh}) => {
  const account = JSON.parse(localStorage.getItem('web-user'));
  const [isSelected, setIsSelected] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState({});
  const [myCourseGroup, setMyCourseGroup] = useState({});
  const [reloadConfirm, setReloadConfirm] = useState(false);

  useEffect(() => {
    if(account.Id && semester.Id){
      request.get('LecturerCourseGroup', {
        params: {SemesterId: semester.Id, LecturerId: account.Id,
          pageIndex:1, pageSize:1}
      }).then(res => {
        if(res.data.length > 0){
          setMyCourseGroup(res.data[0])
        }
      }).catch(err => {alert('Fail to get manager course group')})
    }
  }, [account.Id, semester, reloadConfirm, refresh])

  const handleSelect = (lecturer) => {
    setSelectedLecturer(lecturer)
    setIsSelected(true);
  }

  return (
    <>
      <LecturerList handleSelect={handleSelect} admin={admin} scheduleId={scheduleId} refresh={refresh}
        isSelected={isSelected} semester={semester} myCourseGroup={myCourseGroup} setReloadConfirm={setReloadConfirm}/>
      <InforModal isSelected={isSelected} setIsSelected={setIsSelected} semester={semester} scheduleId={scheduleId}
        selectedLecturer={selectedLecturer} admin={admin} myCourseGroup={myCourseGroup}/>
    </>
  )
}

export default LecturerContainer
