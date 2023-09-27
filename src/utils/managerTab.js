import {Group, LocalLibraryOutlined, AccountBox, 
   CalendarMonth, Home, AccessTime, Business} from '@mui/icons-material';

export const managerTabs = [
  {
    name: 'home',
    icon: <Home/>
  },
  {
    name: 'semester',
    icon: <AccessTime/>
  },
  {
    name: 'schedule',
    icon: <CalendarMonth/>
  },
  {
    name: 'lecturer',
    icon: <Group/>
  },
  {
    name: 'department',
    icon: <Business/>
  },
  {
    name: 'subject',
    icon: <LocalLibraryOutlined/>
  },
  {
    name: 'profile',
    icon: <AccountBox/>
  }
]