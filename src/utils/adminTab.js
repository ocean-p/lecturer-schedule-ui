import {Group, LocalLibraryOutlined, AccountBox, 
  CalendarMonth, Home, AccessTime, Business, HourglassEmpty} from '@mui/icons-material';

export const adminTabs = [
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
    name: 'slot',
    icon: <HourglassEmpty/>
  },
  {
    name: 'profile',
    icon: <AccountBox/>
  }
]