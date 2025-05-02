import axios from 'axios';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import snakecaseKeys from 'snakecase-keys';

declare module 'next-auth' {
  interface User {
    accessToken: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  basePath: '/api/auth',
  callbacks: {
    async signIn({ user, account, profile }) {
      const name = profile?.name;
      const githubId = account?.providerAccountId;
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/callback/github`;
      const params = snakecaseKeys({ name, github_id: githubId });
      try {
        const response = await axios.post(url, params);
        if (response.status === 200) {
          user.accessToken = response.data.access_token;
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error(error); // TODO: toastとかにする
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
});
