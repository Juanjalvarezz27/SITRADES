import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // 1. Definimos el proveedor de credenciales (Email y Password)
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo Electrónico", type: "email", placeholder: "usuario@sitrades.inhrr.gob.ve" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Por favor, ingresa tu correo y contraseña.");
        }

        // 2. Buscamos al usuario en la base de datos de SITRADES e incluimos su Rol
        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: { rol: true } 
        });

        if (!usuario) {
          throw new Error("No existe un usuario con este correo en el sistema.");
        }

        // 3. Comparamos la contraseña encriptada
        const passwordValida = await bcrypt.compare(credentials.password, usuario.password_hash);

        if (!passwordValida) {
          throw new Error("La contraseña es incorrecta.");
        }

        // 4. Si todo es correcto, retornamos los datos que irán al Token JWT
        return {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol.nombre, 
        };
      }
    })
  ],

  // 5. Configuración de la sesión y páginas personalizadas
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // La sesión dura 8 horas (una jornada laboral del INHRR)
  },
  pages: {
    signIn: "/", 
  },

  // 6. Callbacks: El secreto para proteger rutas según el rol
  callbacks: {
    // Cuando se crea el token JWT, le metemos el rol del usuario
    async jwt({ token, user }) {
      if (user) {
        token.rol = user.rol;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.rol = token.rol as string;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };