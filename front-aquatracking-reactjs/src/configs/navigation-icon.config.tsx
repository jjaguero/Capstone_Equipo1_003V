import {
    PiHouseLineDuotone,
    PiUsersDuotone,
    PiHouseDuotone,
    PiCircuitryDuotone,
    PiMapPinDuotone,
    PiChartLineDuotone,
    PiBellRingingDuotone,
    PiGearDuotone,
    PiDropDuotone,
    PiChartBarDuotone,
    PiMonitorDuotone,
} from 'react-icons/pi'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiHouseLineDuotone />,
    dashboard: <PiChartBarDuotone />,
    users: <PiUsersDuotone />,
    homes: <PiHouseDuotone />,
    sensors: <PiCircuitryDuotone />,
    sectors: <PiMapPinDuotone />,
    consumption: <PiDropDuotone />,
    alerts: <PiBellRingingDuotone />,
    statistics: <PiChartLineDuotone />,
    settings: <PiGearDuotone />,
    realtime: <PiMonitorDuotone />,
}

export default navigationIcon
