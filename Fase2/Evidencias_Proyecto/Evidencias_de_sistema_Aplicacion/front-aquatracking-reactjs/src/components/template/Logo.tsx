import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
}

const Logo = (props: LogoProps) => {
    const {
        type = 'full',
        mode = 'light',
        className,
        style,
        logoWidth = 'auto',
    } = props

    const textColor = mode === 'dark' ? 'text-white' : 'text-gray-900'
    const iconColor = mode === 'dark' ? '#60a5fa' : '#3b82f6'

    return (
        <div
            className={classNames('logo flex items-center gap-2', className)}
            style={{
                ...style,
                ...{ width: logoWidth },
            }}
        >
            {/* Ícono de gota de agua */}
            <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 2.69L17.66 8.35C19.78 10.47 19.78 13.87 17.66 15.99C15.54 18.11 12.14 18.11 10.02 15.99C7.9 13.87 7.9 10.47 10.02 8.35L12 2.69Z"
                    fill={iconColor}
                />
                <path
                    d="M12 22C9.79 22 7.58 21.16 5.93 19.51C2.63 16.21 2.63 10.79 5.93 7.49L12 1.42L18.07 7.49C21.37 10.79 21.37 16.21 18.07 19.51C16.42 21.16 14.21 22 12 22ZM12 4.28L7.34 8.94C4.88 11.4 4.88 15.6 7.34 18.06C9.8 20.52 14 20.52 16.46 18.06C18.92 15.6 18.92 11.4 16.46 8.94L12 4.28Z"
                    fill={iconColor}
                />
            </svg>

            {/* Texto del logo */}
            {type === 'full' && (
                <span className={classNames('font-bold text-xl', textColor)}>
                    {APP_NAME}
                </span>
            )}
        </div>
    )
}

export default Logo
