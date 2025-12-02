# FarolEdu – Documentação App (Expo) e API (Express/Prisma)

Este documento consolida visão geral, arquitetura, setup, variáveis, modelos, endpoints e fluxos do MVP FarolEdu (aplicativo mobile em React Native + Expo e API Node/Express + Prisma/PostgreSQL).

## Visão geral
- Conecta estudantes a professores particulares.
- Autenticação JWT com perfis de estudante (`student`) e professor (`teacher`).
- Professores cadastram aulas; estudantes buscam, veem detalhes e agendam.
- Sugestão rápida por IA (OpenAI `gpt-4o-mini`) para plano/abordagem de aula.

## Arquitetura
- **Frontend (app/ – Expo/React Native + TypeScript)**  
  - Navegação: React Navigation (stack).  
  - Estado global: Context API para sessão (`AuthContext`), persistência em `AsyncStorage`.  
  - Formulários: `react-hook-form` + `zod` (validação de login/registro).  
  - Serviços REST em `src/services/*` com client que resolve a `baseURL` via `EXPO_PUBLIC_API_BASE_URL` ou fallback automático (`localhost`/`10.0.2.2`).  
  - Telas principais: Home, Login, Registro (wizard), Buscar aulas, Detalhe do professor, Agendar, Agenda, Painel do professor.
- **Backend (backEnd/ – Express + TypeScript + Prisma/PostgreSQL)**  
  - Autenticação JWT (middleware `authenticate`).  
  - Models Prisma: `User`, `TeacherProfile`, `TeacherClass`, `Schedule`.  
  - Validação de entrada com `zod` (aulas, agendamentos).  
  - IA opcional com OpenAI; retorna 501 se não configurado.  
  - Estrutura: `controller` (regras + respostas), `modules` (acesso Prisma), `routes` (REST), `middlewares`, `utils/validators`.

## Estrutura de pastas (resumo)
- `app/` — código do aplicativo Expo.
  - `src/context/AuthContext.tsx` — sessão, login/registro, persistência.
  - `src/navigation/AppNavigator.tsx` — stack de rotas.
  - `src/screens/*` — telas (home, login, registro, busca, detalhe, agenda, painel professor).
  - `src/services/*` — client REST (`apiClient`) e serviços (users, professors, classes, schedules, IA).
  - `src/theme/*` — cores/gradientes/estilos auxiliares.
- `backEnd/` — API Express.
  - `src/index.ts` — bootstrap do servidor.
  - `src/routes/*.ts` — definição de rotas públicas e protegidas.
  - `src/controller/*.ts` — validação e resposta HTTP.
  - `src/modules/*.ts` — queries Prisma.
  - `src/utils/validators.ts` — esquemas zod.
  - `prisma/schema.prisma` — modelo de dados.

## Setup rápido
### Requisitos
- Node 18+
- PostgreSQL em execução
- npm ou pnpm/yarn

### Backend (`backEnd/`)
```bash
cd backEnd
cp .env.example .env          # edite DATABASE_URL / OPENAI_API_KEY / JWT_SECRET
npm install
npx prisma migrate deploy     # ou prisma db push para dev
npm run dev                   # porta padrão 5000
```

### Frontend (`app/`)
```bash
cd app
npm install
# opcional: EXPO_PUBLIC_API_BASE_URL no .env ou app.config.* (ex.: http://localhost:5000)
npm start                     # expo start
```
- Fallback de URL da API: tenta `EXPO_PUBLIC_API_BASE_URL`, `extra.apiBaseUrl`, host do bundle; Android emulador usa `http://10.0.2.2:5000`, demais `http://localhost:5000`.

## Variáveis de ambiente
- **Backend** (`backEnd/.env`):
  - `DATABASE_URL` (PostgreSQL)
  - `JWT_SECRET` (assinatura do token)
  - `OPENAI_API_KEY` (opcional para rota de IA)
  - `PORT` (padrão 5000)
- **Frontend** (`app`):
  - `EXPO_PUBLIC_API_BASE_URL` (URL da API; se ausente aplica fallback acima).

## Modelagem de dados (Prisma)
- **User**: `id`, `name`, `email` (único), `password`, `role` (`student`/`teacher`), `authProvider`, timestamps; relações com `TeacherProfile`, `TeacherClass`, `Schedule`.
- **TeacherProfile**: `phone`, `city`, `region`, `experience`, `profilePhoto`, flags de anúncio, `userId` (1:1 com User professor).
- **TeacherClass**: `teacherId`, `title`, `description?`, `subject?`, `modality` (online/home/travel/hybrid/presencial), `startTime?`, `durationMinutes`, `price?`, timestamps.
- **Schedule**: `studentId`, `teacherId`, `date`, `createdAt`.

## API (REST)
Base: `http://<host>:5000/api`

### Autenticação e usuários
- `POST /users/register` — cria estudante. Body: `{ name, email, password }`. Retorna perfil.
- `POST /users/login` — login estudante. Body: `{ email, password }`. Retorna `{ token, user }`.

### Professores
- `POST /professors/register` — cria professor + perfil. Campos mínimos: `name`, `email`, `password` (>=6), `phone`, `city`; opcionais `region`, `experience`, `profilePhoto`, `authProvider`, `authProviderId`, `wantsToAdvertise`. Retorna `teacher`.
- `POST /professors/login` — body `{ email, password }`. Retorna `{ token, teacher }`; bloqueia se role ≠ teacher.
- `GET /professors/public/:id` — público. Perfil + aulas do professor.
- `GET /professors/me` — autenticado; retorna usuário do token.
- `GET /professors` / `GET /professors/:id` — autenticado (uso administrativo/debug).

### Aulas (Teacher Classes)
- `GET /teacher-classes/public` — público. Query suportada: `q` (busca título/assunto/descrição/nome do professor), `city`, `modality`, `teacherId`, `take` (1–50).
- `POST /teacher-classes` — professor autenticado. Body (`zod`): `{ title, description?, subject?, modality, startTime?, durationMinutes?, price? }`. `startTime` ISO, `durationMinutes` 15–600.
- `GET /teacher-classes` — professor autenticado; lista aulas próprias.
- `PUT /teacher-classes/:id` — professor autenticado; atualiza qualquer campo (pelo menos um).
- `DELETE /teacher-classes/:id` — professor autenticado; remove aula.

### Agendamentos
- `POST /schedules` — autenticado (estudante agenda com professor). Body: `{ teacherId, date }` (`date` ISO). Retorna agendamento.
- `GET /schedules` — autenticado. Se role=student lista como aluno; se role=teacher lista como professor (inclui contraparte).

### IA
- `POST /ai/suggest` — público. Body: `{ subject, city?, modality? }`. Retorna `{ suggestion }`. Se `OPENAI_API_KEY` ausente, responde 501.

### Códigos e validações principais
- JWT via header `Authorization: Bearer <token>`.
- Validações de aula/agendamento em `src/utils/validators.ts` (zod).
- Serialização de preço converte `Decimal` Prisma para número no payload público.

## Fluxos do aplicativo (app/)
- **Home** (`HomeScreen`): landing com busca rápida (assunto/local, filtros online/perto), lista de aulas públicas, seção sobre e CTA para professores.
- **Login**: seleção de tipo (estudante/professor), validação zod, toggle de senha, feedback de sucesso/erro, redireciona para Home ou Painel do professor. Sessão persistida em AsyncStorage (`token`, `profile`).
- **Registro**: wizard em 4 passos (tipo → dados pessoais → senha → perfil). Professores escolhem matérias e descrevem experiência; cria conta e já autentica.
- **Buscar aulas**: filtros `subject`, `city`, `modality`, paginação limitada (`take`=20); botão “Sugestão IA” chama `/api/ai/suggest`; cards levam ao detalhe ou agendamento (se logado).
- **Detalhe do professor**: carrega `/professors/public/:id`, mostra perfil, aulas e CTA para agendar (redireciona para login se anônimo).
- **Agendar**: form simples com data/hora (`AAAA-MM-DD HH:mm`), validação local e envio para `/schedules`.
- **Agenda**: lista agendamentos do usuário, ordenados por data.
- **Painel do professor**: requer token com role `teacher`; cria aulas (modalidade, duração, preço, descrição), lista aulas existentes, mostra agenda de próximos encontros; suporta pull-to-refresh.
- **Navbar**: botões de Login/Registro (quando aplicável) e navegação entre seções da home.

## Serviços do app (API client)
- `apiClient`: resolve baseURL considerando `EXPO_PUBLIC_API_BASE_URL`, `extra.apiBaseUrl` (manifest), host do bundle ou `10.0.2.2/localhost`; adiciona `Authorization` quando token presente.
- `userService` / `professorService`: login/registro, fetch público de professor.
- `teacherClassService`: criar/listar aulas privadas, listar públicas com query params, listar agendas de professor.
- `scheduleService`: criar/listar agendamentos.
- `aiService`: wrapper para `/api/ai/suggest`.

## Testes manuais sugeridos
- Criar estudante e professor; validar mensagens de erro de formulário.
- Login de cada perfil; fechar/reabrir app e verificar sessão persistida.
- Professor: cadastrar aula no painel; editar/excluir via API (PUT/DELETE) e conferir listagem pública.
- Estudante: buscar aulas, abrir detalhe, tentar agendar (sem login deve pedir login; logado deve criar).
- IA: chamar “Sugestão IA” com e sem `OPENAI_API_KEY` para validar fallback 501/erro amigável.

## Limitações conhecidas
- Sem fluxo de recuperação de senha.
- UI não expõe edição/exclusão de aulas (apenas via API).
- Sem testes automatizados; apenas fluxo manual.
- Sem upload real de imagem (campo `profilePhoto` armazenaria string/base64).
