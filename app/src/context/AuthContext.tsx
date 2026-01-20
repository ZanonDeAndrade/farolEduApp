import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';
import {
  loginStudent,
  registerStudent,
  type LoginStudentResponse,
  type StudentProfile,
} from '../services/userService';
import {
  loginTeacher,
  registerTeacher,
  type LoginTeacherResponse,
  type TeacherProfile,
} from '../services/professorService';
import {
  getPersistedValue,
  persistValue,
  removePersistedValue,
} from '../utils/storage';

export type UserType = 'student' | 'teacher';

export type AuthProfile = StudentProfile | TeacherProfile;

type SignInInput = {
  email: string;
  password: string;
  userType: UserType;
};

type SignUpInput = {
  name: string;
  email: string;
  password: string;
  userType: UserType;
  phone?: string;
  city?: string;
  experience?: string;
};

type PersistedAuth = {
  token: string;
  profile: AuthProfile;
};

type AuthContextValue = {
  token: string | null;
  profile: AuthProfile | null;
  isRestoring: boolean;
  signIn: (input: SignInInput) => Promise<PersistedAuth>;
  signUp: (input: SignUpInput) => Promise<AuthProfile>;
  signOut: () => Promise<void>;
  setSession: (auth: PersistedAuth | null) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const extractProfile = (
  response: LoginStudentResponse | LoginTeacherResponse,
): AuthProfile | null => {
  if (!response) return null;
  if ('teacher' in response && response.teacher) return response.teacher;
  if ('user' in response && response.user) return response.user;
  if ('student' in response && response.student) return response.student;
  return null;
};

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const [storedToken, storedProfile] = await Promise.all([
          getPersistedValue('token'),
          getPersistedValue('profile'),
        ]);

        if (storedToken) {
          setToken(storedToken);
        }

        if (storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile) as AuthProfile;
            if (parsed && typeof parsed === 'object') {
              setProfile(parsed);
            }
          } catch (error) {
            console.warn('Não foi possível carregar o perfil salvo:', error);
          }
        }
      } finally {
        setIsRestoring(false);
      }
    };

    restore();
  }, []);

  const persistAuth = useCallback(async (auth: PersistedAuth | null) => {
    if (!auth) {
      setToken(null);
      setProfile(null);
      await Promise.all([
        removePersistedValue('token'),
        removePersistedValue('profile'),
      ]);
      return;
    }

    setToken(auth.token);
    setProfile(auth.profile);

    await Promise.all([
      persistValue('token', auth.token),
      persistValue('profile', JSON.stringify(auth.profile)),
    ]);
  }, []);

  const signIn = useCallback<AuthContextValue['signIn']>(
    async ({ email, password, userType }) => {
      const request =
        userType === 'teacher'
          ? await loginTeacher({ email, password })
          : await loginStudent({ email, password });

      if (!request?.token) {
        throw new Error('Token de autenticação não recebido.');
      }

      const resolvedProfile = extractProfile(request);
      if (!resolvedProfile) {
        throw new Error('Perfil não encontrado na resposta do servidor.');
      }

      const auth: PersistedAuth = {
        token: request.token,
        profile: resolvedProfile,
      };

      await persistAuth(auth);
      return auth;
    },
    [persistAuth],
  );

  const signUp = useCallback<AuthContextValue['signUp']>(
    async ({ name, email, password, userType, phone, city, experience }) => {
      const request =
        userType === 'teacher'
          ? await registerTeacher({
              name,
              email,
              password,
              phone: phone ?? '',
              city: city ?? '',
              experience,
            })
          : await registerStudent({ name, email, password });

      if (!request || typeof request !== 'object') {
        throw new Error('Resposta inesperada ao criar conta.');
      }

      return request as AuthProfile;
    },
    [],
  );

  const signOut = useCallback(async () => {
    await persistAuth(null);
  }, [persistAuth]);

  const setSession = useCallback<AuthContextValue['setSession']>(
    async auth => {
      await persistAuth(auth);
    },
    [persistAuth],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      profile,
      isRestoring,
      signIn,
      signUp,
      signOut,
      setSession,
    }),
    [token, profile, isRestoring, signIn, signUp, signOut, setSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return context;
};
