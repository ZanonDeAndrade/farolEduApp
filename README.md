# FarolEdu
Marketplace de aulas particulares (web + mobile) com autenticação JWT, ofertas, busca, agendamentos com bloqueio de conflito, agenda/calendário e upload de avatar/foto de professor. Backend usa **Firestore + Firebase Storage** via `firebase-admin`.

## Stack rápida
- **Web (web/)**: React + Vite + TS, serviços REST, avatar com upload multipart e atualização instantânea no Header e nos cards.
- **Mobile (app/)**: Expo/React Native + TS, React Navigation, AuthContext em AsyncStorage, formulários com zod.
- **Backend (backEnd/)**: Express 5 + TS, Firestore (repositórios tipados), Firebase Storage para fotos, JWT (Authorization), zod, rate limit em login/booking, checagem de role.
- **Dados**: coleções `users`, `teacherProfiles`, `teacherClasses`, `schedules` (IDs numéricos via contador `counters/{collection}`).

## Decisões técnicas
- Desacoplamento controller → módulo → repositório (permite trocar storage).
- Transações Firestore para criar/cancelar booking e evitar corrida de conflito.
- Payloads compatíveis com contratos antigos (IDs numéricos, `priceCents`, etc.).
- Upload de foto vai para Firebase Storage (`avatars/{userId}/{timestamp}.{ext}`) e só salva `photoUrl` no usuário.

## Rodar local
### Backend
```bash
cd backEnd
cp .env.example .env   # configure JWT_SECRET, FIREBASE_SERVICE_ACCOUNT (JSON ou base64) e FIREBASE_STORAGE_BUCKET
npm install
npm run dev            # http://localhost:5000
```

### Web (Vite)
```bash
cd web
cp .env.example .env   # se existir; defina VITE_API_BASE_URL se não for localhost
npm install
npm run dev            # http://localhost:5173
```

### Mobile (Expo)
```bash
cd app
npm install
# opcional: EXPO_PUBLIC_API_BASE_URL (ex.: http://localhost:5000)
npm start
```

## Variáveis de ambiente (backend)
- `JWT_SECRET` (obrigatória)
- `FIREBASE_SERVICE_ACCOUNT` (obrigatória): JSON do service account ou base64 do JSON
- `FIREBASE_STORAGE_BUCKET` (obrigatória): bucket do Storage (ex.: `faroledu.appspot.com`)
- `OPENAI_API_KEY` (opcional)
- `PORT` (padrão 5000)

## Principais endpoints (REST)
- Auth/usuários
  - `POST /api/users/register` — estudante
  - `POST /api/users/login` — estudante
  - `POST /api/professors/register` — professor + perfil
  - `POST /api/professors/login` — professor
  - `POST /api/auth/google` — login/registro com Google
  - `GET /api/users/me` — dados do usuário autenticado (inclui `photoUrl`)
  - `PATCH /api/users/me/photo` — upload de avatar (multipart campo `photo`, 2MB, jpg/png/webp)
- Professores (público): `GET /api/professors/public/:id` — perfil + aulas
- Ofertas (professor)
  - `GET /api/offers/public?q&city&modality&teacherId&teacherName&take`
  - `POST /api/offers` — criar
  - `PUT|PATCH /api/offers/:id` — atualizar
  - `DELETE /api/offers/:id`
  - Compatibilidade: `/api/teacher-classes/*`
- Bookings/agenda
  - `POST /api/bookings` — estudante agenda `{ offerId, startTimeISO, notes? }` (bloqueia conflito professor/estudante, 409)
  - `GET /api/bookings` ou `/api/bookings/me` — agenda do usuário (`from`/`to`)
  - `PATCH /api/bookings/:id/cancel` — cancela se vinculado
  - Alias: `GET /api/calendar`
- IA: `POST /api/ai/suggest` — sugestão baseada em ofertas ativas (sem OpenAI).

## Rotas do app (web)
- `/login`, `/register`
- `/search` (cards já exibem foto do professor)
- `/teachers/:id` (detalhe + “Aulas oferecidas” com foto)
- `/schedule` (agendar oferta)
- `/student` e `/calendar` (home e agenda do estudante)
- `/dashboard` (painel do professor)

## Regras e validação
- Roles: professor cria/edita ofertas; estudante cria bookings. `requireRole` protege rotas.
- Booking calcula `endTime` pela oferta; conflito gera 409 para professor e estudante.
- Upload de foto valida tipo (jpg/png/webp) e tamanho (2MB). Erros claros: 400 formato, 413 tamanho, 401 auth.

## Tests
- Backend: `npm test` (vitest + supertest). 
- Web: `npm run build` garante tipagem; testar manualmente fluxo de avatar (tamanhos e formatos).

## Checklist rápido
- Login ok (student/teacher ou Google).
- Header mostra avatar (ou iniciais) e permite troca de foto com persistência.
- Cards de aulas/busca/detalhe exibem foto do professor.
- Conflito de horário retorna 409 adequado para ambos (professor/estudante).
## Avatar Upload (Firebase Admin + Storage)

Backend endpoint:
- `PATCH /api/users/me/photo`
- `Content-Type: multipart/form-data`
- Multipart field name: `avatar`
- Response: `{ "photoUrl": "..." }`

Upload behavior:
- Accepts only `image/jpeg`, `image/png`, `image/webp`
- Uses `multer` memory storage
- Max file size controlled by `AVATAR_MAX_SIZE_MB` (default `5`)
- Upload path in bucket: `avatars/{userId}/{uuid}.{ext}`
- Stores only URL in database (`photoUrl`)
- Files stay private; access URL is generated using Signed URL
- Replaces old avatar file when possible

### Required env vars (backend)

Use one credential mode:
1. `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON file
2. `FIREBASE_SERVICE_ACCOUNT_JSON` with full JSON content

Also required:
- `FIREBASE_STORAGE_BUCKET=faroledu-740ef.firebasestorage.app` (without `gs://`)

Example local `.env` (development):

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://user:password@localhost:5432/faroledu

# Firebase Admin - choose one mode:
GOOGLE_APPLICATION_CREDENTIALS=C:\secrets\faroledu-service-account.json
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

FIREBASE_STORAGE_BUCKET=faroledu-740ef.firebasestorage.app
AVATAR_MAX_SIZE_MB=5
```

Notes:
- Do not commit service account files or JSON credentials.
- Admin SDK bypasses Firebase Storage security rules, so production rules can stay restrictive (`deny all`) for clients if needed.
