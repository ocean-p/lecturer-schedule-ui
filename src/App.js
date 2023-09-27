import { Route, Routes } from "react-router-dom";
import {AdminPage, LecturerPage, ManagerPage, Login} from './pages';
import {Main, Profile, Semester, SemesterDetail, DepartmentManager, 
  Department, ManagerHome, Lecturer, LecturerInfo, SubjectOfManager, 
  ScheduleManager, ScheduleDetail, SemesterDetailManager, LecturerAdmin, 
  LecturerInfoAdmin, DepartmentAdmin, SubjectAdmin, Slot, SemesterAdmin,
  SemesterDetailAdmin} from './components';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path="/lecturer" element={<LecturerPage />}>
          <Route index element={<Main />} />
          <Route path='profile' element={<Profile />} />
          <Route path='semester' element={<Semester />} />
          <Route path='semester/:id' element={<SemesterDetail />} />
          <Route path='department' element={<DepartmentManager />} />
          <Route path='subject' element={<Department />} />
        </Route>
        <Route path="manager" element={<ManagerPage />}>
          <Route index element={<ManagerHome />} />
          <Route path='lecturer' element={<Lecturer />}/>
          <Route path='lecturer/:id' element={<LecturerInfo />} />
          <Route path='subject' element={<SubjectOfManager />} />
          <Route path='department' element={<DepartmentManager />} />
          <Route path='profile' element={<Profile />} />
          <Route path='schedule' element={<ScheduleManager />} />
          <Route path='schedule/:id' element={<ScheduleDetail />} />
          <Route path='semester' element={<Semester/>}/>
          <Route path='semester/:id' element={<SemesterDetailManager/>}/>
        </Route>
        <Route path="admin" element={<AdminPage/>}>
          <Route index element={<ManagerHome admin={true}/>}/>
          <Route path="lecturer" element={<LecturerAdmin/>}/>
          <Route path="lecturer/:id" element={<LecturerInfoAdmin/>}/>
          <Route path="department" element={<DepartmentAdmin/>}/>
          <Route path="subject" element={<SubjectAdmin/>}/>
          <Route path="slot" element={<Slot/>}/>
          <Route path="semester" element={<SemesterAdmin/>}/>
          <Route path="semester/:id" element={<SemesterDetailAdmin/>}/>
          <Route path="schedule" element={<ScheduleManager admin={true}/>}/>
          <Route path='schedule/:id' element={<ScheduleDetail admin={true}/>} />
          <Route path='profile' element={<Profile/>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
