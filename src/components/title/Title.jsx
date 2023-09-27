import { Stack, Typography } from '@mui/material'
import React from 'react'

const Title = ({title, subTitle}) => {
  return (
    <Stack>
      <Typography variant='h5' color='#778899' fontWeight={500}>
        {title ? title : ''}
      </Typography>
      <Typography color='gray' variant='subtitle1'>
        {subTitle ? subTitle : ''}
      </Typography>
    </Stack>
  )
}

export default Title