# FarolEdu – MVP

Aplicativo mobile (React Native + Expo) e API Node/Express para conectar estudantes e professores particulares. Inclui autenticação com JWT, aulas e agendamentos, fluxo de recomendação com IA (OpenAI) e telas principais do MVP.

## Arquitetura rápida
- **App (Expo/React Native + TypeScript)**: Context API para sessão, navegação com React Navigation, validação com `react-hook-form` + `zod`, consumo da API REST e IA.
- **API (Express + TypeScript + Prisma/PostgreSQL)**: Rotas autenticadas com JWT, CRUD de aulas, agendamentos e perfis, endpoint de IA usando OpenAI.
- **Banco**: PostgreSQL via Prisma (`prisma/schema.prisma`).
- **IA**: OpenAI `gpt-4o-mini` para sugerir plano rápido de aula/busca de professor.

## Rodando localmente
### Requisitos
- Node 18+
- PostgreSQL em execução
- npm ou pnpm/yarn

### Backend
```bash
cd backEnd
cp .env.example .env            # ajuste DATABASE_URL / OPENAI_API_KEY / JWT_SECRET
npm install
npx prisma migrate deploy       # ou prisma db push para desenvolvimento
npm run dev                     # porta padrão 5000
```

### Frontend (Expo)
```bash
cd app
npm install
# opcional: defina EXPO_PUBLIC_API_BASE_URL no app.json ou .env para apontar para a API (http://localhost:5000)
npm start
```

## Variáveis de ambiente
- **Backend**: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `PORT` (ver `backEnd/.env.example`).
- **Frontend**: `EXPO_PUBLIC_API_BASE_URL` (fallback automático para http://localhost:5000 ou 10.0.2.2 no emulador Android).

## Rotas principais (REST)
- `POST /api/users/register` — cria estudante
- `POST /api/users/login` — login estudante (JWT)
- `POST /api/professors/register` — cria professor
- `POST /api/professors/login` — login professor (JWT)
- `GET /api/professors/public/:id` — perfil público + aulas
- `GET /api/teacher-classes/public[?q=...&city=...&modality=...&teacherId=...]` — aulas públicas
- `POST /api/teacher-classes` — criar aula (professor, auth)
- `PUT /api/teacher-classes/:id` — atualizar aula (professor, auth)
- `DELETE /api/teacher-classes/:id` — remover aula (professor, auth)
- `GET /api/teacher-classes` — aulas do professor logado (auth professor)
- `POST /api/schedules` — criar agendamento (auth)
- `GET /api/schedules` — listar agenda do usuário (auth)
- `POST /api/ai/suggest` — sugestão rápida via IA (público)

## Fluxos principais do app
- **Autenticação**: telas de Login/Registro validadas com `react-hook-form` + `zod`, sessão persistida em `AsyncStorage` via `AuthContext`.
- **Descoberta de professores**: tela "Encontrar aulas" consome `/teacher-classes/public`, filtros por cidade/modalidade e botão de sugestão IA.
- **Detalhe do professor**: perfil público + aulas e CTA para agendar.
- **Agendamentos**: tela de agendar (data/hora validada) e listagem de agenda (`/api/schedules`). Painel do professor mostra aulas e agenda.
- **IA**: botão “Sugestão IA” envia filtros atuais para `/api/ai/suggest` e exibe dica curta de plano/abordagem.

## Credenciais de teste
Crie usuários pela própria interface (não há seed). Para testar fluxos protegidos, registre-se e faça login como estudante ou professor.

## Testes manuais sugeridos
- Registrar estudante e professor; validar mensagens de erro de formulário.
- Login de cada perfil, fechar/reabrir app e confirmar sessão persistida.
- Professor: criar aula no painel, editar/excluir via API (curl) e ver na listagem pública.
- Estudante: buscar aulas, abrir detalhe, tentar agendar (sem login deve redirecionar; logado deve criar).
- Chamar botão “Sugestão IA” com e sem `OPENAI_API_KEY` para conferir tratamento de erro.

## Decisões técnicas
- **Estado global**: Context API para sessão simples; telas usam hooks locais + react-hook-form.
- **Validação**: `zod` no app (formularios) e no backend (payloads de aula/agendamento).
- **Navegação**: React Navigation stack com rotas públicas e privadas (TeacherDashboard, Agenda).
- **Persistência**: AsyncStorage + fallback em memória para sessão; Prisma para banco.
- **Segurança**: JWT em rotas protegidas, checagem de role para aulas do professor, sanitização básica de entrada.
- **IA**: endpoint dedicado e opcional (retorna 501 se não configurado) para evitar quebra do fluxo.

## Limitações e backlog
- Não há fluxo de recuperação de senha.
- Falta UI para editar/excluir aulas (apenas API disponível).
- Sem testes automatizados; apenas fluxo manual.
- Sem upload de imagem; perfil usa dados textuais.

