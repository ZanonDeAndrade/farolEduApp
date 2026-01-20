# FarolEdu – Documentação rápida (API + App)

MVP de marketplace de aulas particulares com ofertas, busca, agendamentos com prevenção de conflito e agenda/calendário.

## Arquitetura
- **Mobile (app/ – Expo/React Native + TS)**: React Navigation (stack), AuthContext + AsyncStorage, formulários com zod, serviços REST em `src/services`.
- **Backend (backEnd/ – Express + TS + Prisma/PostgreSQL)**: JWT via header `Authorization`, validação zod, rate limit (login/bookings), roles por middleware, Prisma em `prisma/schema.prisma`.

## Modelagem (Prisma)
- `User { id, name, email, password, role, authProvider, createdAt, updatedAt }`
- `TeacherProfile { userId, phone, city, region?, experience?, profilePhoto?, ... }`
- `TeacherClass` (oferta) `{ id, teacherId, title, subject?, description?, modality (string upper), durationMinutes, priceCents?, price?, location?, active, createdAt, updatedAt }`
- `Schedule` (bookings, mapeado para tabela existente) `{ id, offerId?, teacherId, studentId, startTime, endTime, status(PENDING|CONFIRMED|CANCELLED), notes?, createdAt, updatedAt, legacyDate? }` + índices em `teacherId+startTime` e `studentId+startTime`.

## Endpoints principais
- **Auth**
  - `POST /api/users/register` | `/api/users/login` – estudante
  - `POST /api/professors/register` | `/api/professors/login` – professor
  - `GET /api/professors/public/:id` – perfil + ofertas
- **Ofertas (professor)**
  - `GET /api/offers/public?q&city&modality&teacherId&teacherName&take`
  - `POST /api/offers` – criar (role=teacher)
  - `PUT|PATCH /api/offers/:id` – atualizar (role=teacher)
  - `DELETE /api/offers/:id`
  - Compatibilidade: `/api/teacher-classes/*`
- **Bookings/agenda**
  - `POST /api/bookings` – estudante agenda `{ offerId, startTimeISO, notes? }`
  - `GET /api/bookings` ou `/api/bookings/me` – agenda do usuário (`from`/`to` opcionais)
  - `PATCH /api/bookings/:id/cancel` – cancelamento por professor ou estudante vinculado
  - Alias: `GET /api/calendar`
  - Compatibilidade: `/api/schedules` aceita payload legado `{ teacherId, startTime|date }` e resolve oferta ativa do professor
- **IA**
  - `POST /api/ai/suggest` – sugestão baseada nas ofertas ativas (não depende de OpenAI).

### Regras de negócio
- Apenas `role=teacher` cria/edita ofertas; apenas `role=student` cria bookings.
- Booking calcula `endTime = startTime + durationMinutes` da oferta. Conflitos (status != CANCELLED) são bloqueados para professor **e** estudante com código 409 (`BOOKING_CONFLICT_TEACHER`/`BOOKING_CONFLICT_STUDENT`).
- Ofertas públicas retornam apenas `active = true`.
- `legacyMigrateSchedule()` preenche `startTime/endTime/status` a partir de `date` para linhas antigas.

## App (fluxos)
- **Auth**: Login/Registro com seleção de role, sessão persistida em AsyncStorage.
- **Busca**: `/search` filtra por assunto/teacher name (q), cidade e modalidade; botões de sugestão IA.
- **Detalhe do professor**: lista ofertas e permite agendar cada oferta.
- **Agendamento**: `/schedule` envia `offerId + startTime ISO`; feedback de sucesso/erro.
- **Painel professor**: criar oferta (modality, duração, preço em cents, location opcional), listar/pausar ofertas, ver agenda próxima (status).
- **Agenda/Calendário**: `/calendar` agrupa bookings do usuário logado.

## Rodar
Backend:
```bash
cd backEnd
cp .env.example .env   # configure DATABASE_URL, JWT_SECRET, OPENAI_API_KEY opcional
npm install
npx prisma migrate deploy   # ou prisma db push em dev
npm run dev                 # porta 5000
```

Mobile:
```bash
cd app
npm install
# opcional EXPO_PUBLIC_API_BASE_URL (http://localhost:5000)
npm start
```

## Testes
- Backend: `npm test` (vitest + supertest). Inclui cenários:
  - conflito de booking retorna 409
  - professor não consegue criar booking (403)

## Notas/pending
- Sem recuperação de senha ou upload de avatar.
- Sem UI de edição completa de oferta (parcial: toggle de ativo).
- Ajustar migrações reais conforme dados existentes (schema muda `modality` e bookings).
