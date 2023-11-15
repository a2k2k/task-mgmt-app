import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_URI = 'isPublicURI'
export const Public = () => SetMetadata(IS_PUBLIC_URI, true)