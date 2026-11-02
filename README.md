# Flashcards

App de flashcards com repetição espaçada (**FSRS**), para **web e iPhone** com uma única base de código (Expo / React Native) e **Firebase**.

- Baralhos independentes
- Geração de cartões com IA: o app monta o prompt a partir de **assunto + objetivo**. Você cola a resposta (JSON) de qualquer LLM **ou** gera direto com o **Gemini** usando a sua chave de API
- Agendamento com [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs), histórico de revisões salvo para otimização futura
- Login com Google (e Sign in with Apple no iOS, exigido pela App Store)
- Design minimalista, modo claro/escuro, modo foco no estudo, atalhos de teclado na web (espaço, 1–4, Esc)

## Estrutura

```
src/app/            rotas (Expo Router)
  login.tsx
  (app)/index.tsx               baralhos
  (app)/settings.tsx            chave do Gemini, retenção, conta
  (app)/deck/[id]/index.tsx     detalhes do baralho
  (app)/deck/[id]/study.tsx     sessão de estudo (FSRS)
  (app)/deck/[id]/generate.tsx  assunto → objetivo → prompt/Gemini → revisão → importar
  (app)/deck/[id]/card.tsx      criar/editar cartão
src/ai/             prompt, parser (zod), cliente Gemini, armazenamento da chave
src/fsrs/           wrapper do ts-fsrs e conversão para o Firestore
src/data/           Firestore (baralhos, cartões, revisões, hooks, fila)
src/auth/           Google / Apple (arquivos .web.ts para a web)
src/ui/, src/theme/ componentes e tokens de design
tests/              testes unitários (vitest)
```

Dados no Firestore: `users/{uid}/decks/{deckId}/cards/{cardId}` e `.../reviewLogs/{logId}`; regras em `firestore.rules`.

## Configuração

1. **Firebase**: crie um projeto, ative o **Firestore** e, em Authentication, os provedores **Google** e **Apple**.
2. Registre um **app Web** e um **app iOS** (bundle id `com.ariribeiro.flashcards`, ou altere em `app.json`).
3. No Google Cloud Console (Credenciais), crie um cliente OAuth do tipo **iOS** com o mesmo bundle id.
4. Copie `.env.example` para `.env` e preencha os valores.
5. Publique as regras: `npx firebase deploy --only firestore`.

## Rodando

```bash
npm install
npm run web          # web em http://localhost:8081
npm test             # testes unitários
npm run typecheck
```

iPhone: o login nativo do Google exige um **development build** (não funciona no Expo Go):

```bash
npx eas-cli@latest build -p ios --profile development
npx expo start --dev-client
```

Desenvolvimento local sem projeto real (Firebase Emulator Suite): defina `EXPO_PUBLIC_USE_EMULATORS=1` e `EXPO_PUBLIC_FIREBASE_PROJECT_ID=demo-flashcards`, depois rode `npx firebase emulators:start --project demo-flashcards`. Com `EXPO_PUBLIC_EMULATOR_FAKE_GOOGLE=1`, o botão "Entrar com Google" na web usa um usuário de teste do emulador.

## Deploy

### Web (GitHub Actions → Firebase Hosting)

O workflow `.github/workflows/web.yml`:
- em todo push e PR: `npm ci`, typecheck, testes e build web (`expo export`);
- em **PRs**: publica um preview temporário (7 dias) e comenta o link no PR;
- em **push na `main`** (ou execução manual em *Actions → Web → Run workflow*): publica em produção, https://flashcards-31c38.web.app, junto com as regras do Firestore.

Configuração única: crie o secret **`FIREBASE_SERVICE_ACCOUNT`** no repositório (Settings → Secrets and variables → Actions) com o JSON de uma conta de serviço. Para gerar: Firebase Console → Configurações do projeto → Contas de serviço → Gerar nova chave privada.

Deploy manual: `npx expo export -p web && npx firebase deploy --only hosting`.
- iOS: `npx eas-cli@latest build -p ios` e `npx eas-cli@latest submit -p ios`.

## Formato da resposta da IA

```json
{
  "deck": "título sugerido",
  "cards": [{ "front": "pergunta", "back": "resposta", "tags": ["opcional"] }]
}
```

O parser aceita a resposta dentro de ```json e com texto antes/depois, além de um array direto. Cartões inválidos são ignorados e listados.
