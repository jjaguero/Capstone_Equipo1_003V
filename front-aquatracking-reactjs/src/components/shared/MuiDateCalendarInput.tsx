import * as React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';


interface MuiDateCalendarInputProps {
  value: Dayjs | null;
  onChange: (date: Dayjs | null) => void;
  availableDates: Dayjs[];
  label?: string;
}

const MuiDateCalendarInput: React.FC<MuiDateCalendarInputProps> = ({ value, onChange, availableDates, label }) => {
  // Solo permitir fechas en availableDates
  const shouldDisableDate = (date: Dayjs) => {
    return !availableDates.some((d: Dayjs) => d.isSame(date, 'day'));
  };

  return (
    <div>
      {label && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
      <DatePicker
        value={value}
        onChange={onChange}
        shouldDisableDate={shouldDisableDate}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            sx: {
              borderRadius: 2,
              backgroundColor: 'background.paper',
              minWidth: 0,
              maxWidth: 220,
            },
          },
        }}
      />
    </div>
  );
};

export default MuiDateCalendarInput;
