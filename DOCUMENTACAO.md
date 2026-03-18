# FarolEdu — Dossiê Completo

Marketplace de aulas particulares (web + mobile) com autenticação JWT, ofertas públicas, busca, agendamentos com prevenção de conflito, agenda/calendário e upload de avatar/foto. Este documento consolida o histórico de entregas, estado atual, impedimentos e próximos passos.

## 1. Linha do tempo de entregas
- **Nov/2025 — MVP inicial (Postgres/Prisma)**
  - Cadastro/Login de estudante e professor com JWT.
  - Criação e edição de ofertas (TeacherClass) por professores.
  - Busca pública de aulas com filtros básicos e agendamento pelo estudante.
  - Agenda/calendário e bloqueio de conflitos (409) para professor e estudante.
  - Painel do professor para gerenciar ofertas e visualizar agenda.
- **Jan/2026 — Migração de dados para Firestore**
  - Repositórios tipados para `users`, `teacherProfiles`, `teacherClasses`, `schedules` em Firestore.
  - Preservação de IDs numéricos via contador (`counters/{collection}`) para manter compatibilidade de API.
  - Scripts/módulos de migração e refino de conflito de agenda em transações (`firestore.runTransaction`).
- **Jan/2026 (final) — Upload de avatar/foto**
  - Endpoint `PATCH /api/users/me/photo` (multipart, 2MB, JPG/PNG/WEBP) gravando `photoUrl` no usuário.
  - Upload para Firebase Storage (`avatars/{userId}/{timestamp}.{ext}`) com metadata e URL pública (fallback para signed URL).
  - Front-end: componente Avatar + uploader com preview e mensagens de erro; foto exibida no Header e em todos os cards de aulas/professores.
- **Google Login**
  - Endpoint `POST /api/auth/google` integrado ao `GOOGLE_CLIENT_ID`; cria/associa usuário estudante e retorna JWT.
  - Impedimento conhecido: requer configuração/validação da tela de consentimento e das URIs de redirecionamento em produção (ver seção 7).

## 2. Arquitetura e stack
- **Backend (backEnd/)**: Express 5 + TypeScript; Firestore e Firebase Storage via `firebase-admin`; JWT no header `Authorization`; validação com zod; rate limit para login/bookings; middlewares de role.
- **Web (web/)**: React + Vite + TypeScript; serviços REST; estado do usuário no `localStorage`; avatar uploader com FormData; exibição de fotos em Header, busca, home do estudante e detalhe do professor.
- **Mobile (app/)**: Expo/React Native + TS; React Navigation (stack); AuthContext com AsyncStorage; formulários zod; serviços REST compartilhados.
- **Dados (Firestore)**: coleções `users`, `teacherProfiles`, `teacherClasses`, `schedules`; contador numérico por coleção.

## 3. Funcionalidades atuais
- **Autenticação e perfis**: login/registro (email) para estudante e professor; login Google para estudante; roles aplicadas em middleware; resposta inclui `photoUrl` e `teacherProfile` quando aplicável.
- **Ofertas de aula**: CRUD protegido para professor; modalidades ONLINE/PRESENCIAL/AMBOS; preços em `price`/`priceCents`; campo `active` para pausar oferta.
- **Busca pública**: `GET /api/offers/public` com filtros (q, city, modality, teacherId, teacherName, take); resposta inclui dados do professor + `photoUrl`.
- **Agenda/Bookings**: criação de booking pelo estudante; cálculo de `endTime` pela duração da oferta; bloqueio de conflito (409) para professor e estudante; cancelamento permitido a quem está vinculado.
- **Painel do professor**: cadastro/edição de ofertas, listagem e agenda futura.
- **Avatar/foto**: upload com validação (2MB, jpg/png/webp), gravação em Storage e atualização imediata na UI; fallback para iniciais.

## 4. Principais endpoints
- Auth/Usuários: `POST /api/users/register`, `POST /api/users/login`, `POST /api/auth/google`, `GET /api/users/me`, `PATCH /api/users/me/photo` (multipart campo `photo`).
- Professores: `POST /api/professors/register`, `POST /api/professors/login`, `GET /api/professors/public/:id` (perfil + aulas).
- Ofertas: `GET /api/offers/public`, `POST /api/offers`, `PUT|PATCH /api/offers/:id`, `DELETE /api/offers/:id`; compatível com `/api/teacher-classes/*`.
- Bookings/Agenda: `POST /api/bookings`, `GET /api/bookings` ou `/api/bookings/me` (`from`/`to`), `PATCH /api/bookings/:id/cancel`; alias `/api/calendar`; legado `/api/schedules`.
- IA: `POST /api/ai/suggest` (sem dependência de OpenAI).

## 5. Variáveis de ambiente (backend)
- `JWT_SECRET` — assinatura do JWT.
- `FIREBASE_SERVICE_ACCOUNT` — JSON ou base64 do service account.
- `FIREBASE_STORAGE_BUCKET` — bucket usado para fotos (ex.: faroledu.appspot.com).
- `GOOGLE_CLIENT_ID` — necessário para login Google.
- `OPENAI_API_KEY` — opcional (IA).
- `PORT`, `FRONTEND_ORIGINS`, `TRUST_PROXY` — rede/CORS.

## 6. Testes e builds realizados
- `npm run build` (backend) — tipagem OK.
- `npm run build` (web) — bundling OK.
- Testes manuais recomendados: upload válido; upload tipo inválido; upload >2MB; persistência da foto após reload; exibição de foto em cards; conflito de booking retorna 409.

## 7. Impedimentos e riscos
- **Google Login (produção)**: exige publicar/validar tela de consentimento, configurar URIs de redirecionamento e dominios autorizados. Sem isso, o login Google pode falhar fora do ambiente de desenvolvimento.
- **Permissões do Firebase Storage**: `makePublic()` pode ser bloqueado conforme política do projeto; fallback de signed URL com expiração longa (1 ano) já implementado, mas requer validação de compliance/performance.
- **Limpeza de fotos antigas**: uploads não removem arquivos antigos; pode gerar custo extra de Storage.
- **Cobertura de testes**: faltam testes automatizados para upload e para fluxos de autorização do Google.
- **Recuperação de senha**: ainda não implementada.

## 8. Próximos passos sugeridos
- Publicar/validar configuração do Google OAuth em produção (origins/redirects) e adicionar testes end-to-end do fluxo.
- Rotina de limpeza de imagens antigas no bucket ao substituir avatar.
- Testes automatizados para upload (400/401/413) e para conflito de agenda.
- Recuperação de senha e auditoria de login (logs/alertas de erro 401/403).
- Observabilidade: métricas de tamanho médio de upload e taxa de erro por tipo.

## 9. Execução rápida
- Backend: `cd backEnd && cp .env.example .env && npm install && npm run dev` (porta 5000).
- Web: `cd web && npm install && npm run dev` (http://localhost:5173; configure `VITE_API_BASE_URL` se necessário).
- Mobile (Expo): `cd app && npm install && npm start` (opcional `EXPO_PUBLIC_API_BASE_URL`).
