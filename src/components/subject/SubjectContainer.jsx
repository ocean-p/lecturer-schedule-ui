import { FormControl, FormControlLabel, Radio, RadioGroup, Stack } from '@mui/material'
import { useState } from 'react'
import ExternalSubject from './ExternalSubject'
import RegisteredSubject from './RegisteredSubject'
import Subject from './Subject'

const SubjectContainer = ({semesterId, semesterState}) => {
  const [value, setValue] = useState(1)

  return (
    <Stack height='90vh'>
      <Stack px={9} mb={1}>
        <FormControl margin='none'>
          <RadioGroup value={value} onChange={(e) => setValue(Number(e.target.value)) }>
            <Stack direction='row' alignItems='center' gap={1}>
              <FormControlLabel value='1' control={<Radio />} label="My Department" />
              <FormControlLabel value='2' control={<Radio />} label="External Departments" />
              <FormControlLabel value='3' control={<Radio />} label="Registered Subjects" />
            </Stack>
          </RadioGroup>
        </FormControl>
      </Stack>
      {value === 1 && <Subject semesterId={semesterId} semesterState={semesterState} />}
      {value === 2 && <ExternalSubject semesterId={semesterId} semesterState={semesterState} />}
      {value === 3 && <RegisteredSubject semesterId={semesterId} semesterState={semesterState} />}
    </Stack>
  )
}

export default SubjectContainer