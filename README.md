# FarolEdu MVP

Marketplace de aulas particulares (mobile Expo + API Express). Autenticação JWT, perfis (professor/estudante), ofertas, busca, agendamentos com bloqueio de conflito e agenda/calendário. Backend agora usa **Firestore** via `firebase-admin` (repositórios) em vez de Postgres/Prisma.

## Stack rápida
- **Mobile (app/)**: Expo/React Native + TS, React Navigation (stack), AuthContext com AsyncStorage, formulários com zod.
- **Backend (backEnd/)**: Express 5 + TS, Firestore (via firebase-admin), repositórios tipados, JWT (header Authorization), validação zod, rate limit em login/booking, checagem de role.
- **Arquitetura de dados**: coleções `users`, `teacherProfiles`, `teacherClasses`, `schedules` no Firestore. ID numérico preservado via contador (`counters/{collection}`) para manter compatibilidade com a API.

## Decisões técnicas
- **Desacoplamento**: controllers chamam módulos que usam repositórios (interfaces + implementações Firestore). Permite trocar storage sem alterar a API.
- **Transações**: criação e cancelamento de booking usam `firestore.runTransaction` para garantir atomicidade e evitar condições de corrida na checagem de conflitos.
- **Compatibilidade**: rotas e payloads mantêm contratos antigos (IDs numéricos, campos `priceCents`, etc.).
- **Migração**: script opcional `src/scripts/migrate-postgres-to-firestore.ts` lê via Prisma e grava no Firestore mantendo IDs.

## Rodar local
### Backend
```bash
cd backEnd
cp .env.example .env   # configure JWT_SECRET / OPENAI_API_KEY opcional / FIREBASE_SERVICE_ACCOUNT
npm install
npm run dev            # http://localhost:5000
```

### Mobile (Expo)
```bash
cd app
npm install
# opcional: EXPO_PUBLIC_API_BASE_URL no app/.env ou app.json (ex.: http://localhost:5000)
npm start
```

## Variáveis de ambiente (backend)
- `JWT_SECRET` (obrigatória)
- `FIREBASE_SERVICE_ACCOUNT` (obrigatória): JSON do service account ou base64 do JSON.
- `OPENAI_API_KEY` (opcional)
- `PORT` (padrão 5000)

## Principais endpoints (REST)
- Auth/usuários
  - `POST /api/users/register` — cria estudante
  - `POST /api/users/login` — login estudante (JWT)
  - `POST /api/professors/register` — cria professor + perfil
  - `POST /api/professors/login` — login professor (JWT)
  - `GET /api/professors/public/:id` — perfil público + ofertas
- Ofertas (TeacherClass) — protegidas para professor
  - `GET /api/offers/public?q&city&modality&teacherId&teacherName&take`
  - `POST /api/offers` — criar oferta (duration, modality ONLINE/PRESENCIAL/AMBOS, priceCents, location, active)
  - `PUT|PATCH /api/offers/:id` — atualizar oferta
  - `DELETE /api/offers/:id`
  - Compatibilidade: `/api/teacher-classes/*` segue ativo.
- Bookings/agenda — protegidas
  - `POST /api/bookings` — estudante agenda aula `{ offerId, startTimeISO, notes? }` (bloqueia conflitos professor/estudante; erro 409 com code BOOKING_CONFLICT_*).
  - `GET /api/bookings` ou `/api/bookings/me` — agenda do usuário logado (`from`/`to` opcionais)
  - `PATCH /api/bookings/:id/cancel` — professor ou estudante relacionado cancela
  - Alias: `GET /api/calendar`
  - Compatibilidade: `/api/schedules` aceita payload legado `{ teacherId, date/startTime }` e resolve oferta ativa do professor.
- IA
  - `POST /api/ai/suggest` — sugestão rápida baseada nas ofertas ativas (não depende de OpenAI).

## Rotas do app
- `/login`, `/signup`
- `/search` (busca com filtro cidade/modalidade)
- `/teacher/offers` (painel professor, cria/pausa ofertas, agenda)
- `/calendar` (agenda do usuário)
- `/schedule` (agendar oferta)
- `/onboarding-role` opcional via fluxo de signup

## Regras e validação
- Roles: professor pode criar/editar ofertas; estudante cria bookings. Middleware `requireRole` protege rotas; cancelamento exige vínculo com booking.
- Booking calcula `endTime = startTime + durationMinutes` da oferta e bloqueia sobreposições (`status` != CANCELLED) para professor e estudante.
- Modality normalizada para `ONLINE | PRESENCIAL | AMBOS`; ofertas públicas retornam apenas `active=true`.
- Dados sensíveis protegidos por JWT + rate limit (login/professores e bookings).

## Tests
- Backend: `npm test` (vitest + supertest, mocks de Firestore e repositórios para não depender de banco real).

## Checklist rápido
- Criar conta, escolher role e logar.
- Professor: cadastrar/pausar oferta, aparece na busca pública.
- Estudante: buscar por matéria ou nome do professor e agendar oferta.
- Calendário/agenda traz somente bookings do usuário, com status.
- API retorna 409 claro em conflito de horário para professor ou estudante.
