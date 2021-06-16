import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { destroyCookie, parseCookies } from "nookies"
import { AuthTokenError } from "../services/errors/AuthTokenError"

export function withSSRAuth<P>(fn: GetServerSideProps<P>) {
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(context)

    if (!cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    try {
      return await fn(context)
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(context, 'nextauth.token')
        destroyCookie(context, 'nextauth.refreshToken')
    
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }
    }
  }
}