import { Button, Stack, Typography } from '@mui/material';
import { green } from "@mui/material/colors";
import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Leftbar.css'

const Leftbar = ({ isExtend, user, tabs }) => {
  const indexTab = tabs[0];
  const [selectedTab, setSelectedTab] = useState();
  const location = useLocation();
  const navigate = useNavigate();
  const account = JSON.parse(localStorage.getItem('web-user'));

  useEffect(() => {
    const tabName = location.pathname.split('/')[2];
    if (tabName) {
      if (tabName === indexTab.name) {
        setSelectedTab(indexTab.name)
        return;
      }
      setSelectedTab(tabName)
      return;
    }
    setSelectedTab(indexTab.name)
  }, [location, indexTab])

  const changeRole = () => {
    if(location.pathname.startsWith('/lecturer')){
      navigate('/manager')
    }
    else if(location.pathname.startsWith('/manager')){
      navigate('/lecturer')
    }
  }

  return (
    <Stack flex={isExtend ? 0.9 : 0.34} height='90vh'
      borderRight='1px solid lightgray'
    >
      {(account.RoleIDs.includes('LC') && account.RoleIDs.includes('DMA')) &&
        <Stack borderBottom='1px solid #e3e3e3' alignItems='center' mt={2} gap={1}>  
          <Button size='small' variant='outlined' sx={{ mb: 2, width: '80%', fontSize: '14px', textTransform: 'none' }}
            onClick={changeRole}>
              {location.pathname.startsWith('/lecturer') ? 'Switch to Manager' : 'Switch to Lecturer'}
          </Button>
        </Stack>
      }
      <Stack py={2}>
        {
          tabs.map((tab, index) => (
            <Link
              key={index}
              to={tab.name === indexTab.name ? `/${user}` : `/${user}/${tab.name}`}
              style={{
                textDecoration: 'none',
                color: 'black'
              }}
            >
              <Stack key={index} px={4}
                direction='row'
                alignItems='center'
                justifyContent='flex-start'
                height='50px'
                sx={{
                  bgcolor: selectedTab === tab.name && '#e3e3e3',
                  borderRight: isExtend && selectedTab === tab.name && `4px solid ${green[600]}`,
                  '&:hover': {
                    bgcolor: 'lightgrey'
                  },
                  transition: 'all 0.2s linear'
                }}

              >
                <span style={{ color: selectedTab === tab.name && green[600] }}>
                  {tab.icon}
                </span>
                {isExtend &&
                  <Typography
                    ml='16px'
                    color={selectedTab === tab.name && 'success.main'}
                    fontWeight={selectedTab === tab.name && '500'}
                  >
                    {tab.name[0].toUpperCase() + tab.name.slice(1)}
                  </Typography>
                }
              </Stack>
            </Link>
          ))
        }
      </Stack>
    </Stack>
  )
}

export default Leftbar