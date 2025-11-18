import ApiService from './ApiService'
import type { User } from '@/@types/auth'

export async function apiGetUserByEmail(email: string) {
    return ApiService.fetchDataWithAxios<User>({
        url: `/users/email/${email}`,
        method: 'get',
    })
}