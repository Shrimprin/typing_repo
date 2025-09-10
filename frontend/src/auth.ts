import axios from 'axios';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import axiosCaseConverter from 'simple-axios-case-converter';

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
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;

      if (pathname.startsWith('/repositories') && !auth) {
        return Response.redirect(new URL('/', request.nextUrl));
        // TODO: メッセージを表示する
      }

      if (pathname === '/' && auth) {
        return Response.redirect(new URL('/repositories', request.nextUrl));
      }

      return true;
    },
    async signIn({ user, account, profile }) {
      const name = profile?.name || profile?.login;
      const githubId = account?.providerAccountId;
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/callback/github`;
      const params = { name, githubId };
      try {
        axiosCaseConverter(axios);
        const response = await axios.post(url, params);
        if (response.status === 200) {
          user.accessToken = response.data.accessToken;
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
    async redirect({ url, baseUrl }) {
      // 相対URLの場合はbaseUrlと結合
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // 同じオリジンのURLの場合はそのまま
      else if (new URL(url).origin === baseUrl) return url;
      // デフォルトは/repositories（サインイン時）
      return `${baseUrl}/repositories`;
    },
  },
});
