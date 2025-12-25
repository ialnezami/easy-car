import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    agencyId?: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      agencyId?: string;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    agencyId?: string;
    role?: string;
  }
}

