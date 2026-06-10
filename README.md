# ApoiaMente 🧠💚

O **ApoiaMente** é um aplicativo mobile multiplataforma desenvolvido para oferecer suporte emocional, incentivar hábitos de autocuidado e auxiliar no controle diário da ansiedade. O projeto foi concebido dentro do âmbito universitário como uma ação prática de impacto social e suporte à comunidade externa (Extensão Universitária).

---

## 📱 Telas e Funcionalidades do App

O aplicativo conta com interfaces limpas, intuitivas e acolhedoras, focadas na melhor experiência de usuário (UI/UX) para momentos de estresse ou ansiedade:

* **Autenticação e Boas-Vindas:** Tela inicial de login com mensagens humanizadas e ambiente seguro.
* **Dashboard Principal (Home):** Organizado em cartões (cards) interativos com acesso rápido a todas as ferramentas.
* **Diário de Emoções:** Registro interativo onde o usuário escolhe seu humor do dia por meio de emojis e faz um desabafo textual.
* **Histórico com Calendário Dinâmico:** Visualização mensal que destaca os dias preenchidos, permitindo acompanhar o histórico de bem-estar cronologicamente.
* **Exercício de Respiração Guiada:** Tela com um contador visual progressivo para auxiliar o usuário a se acalmar através de ciclos de inspiração, retenção e expiração.
* **Rede de Apoio:** Lista útil com contatos e links diretos de órgãos de utilidade pública e suporte emocional (como o CVV).

---

## 🛠️ Tecnologias e Dependências Utilizadas

O desenvolvimento do front-end e da lógica do aplicativo foi construído utilizando a seguinte base técnica:

* **Framework Base:** Expo (~v55.0.0) & React Native (v0.83.6)
* **Linguagem:** TypeScript (Configuração estrita para maior segurança do código)
* **Navegação:** Expo Router (Navegação nativa baseada em arquivos por abas inferiores e pilhas)
* **Persistência de Dados:** SQLite (Banco de dados local para salvar os registros no celular)
* **Componente Visual:** React Native Calendars (Renderização do histórico mensal de humor)
* **Ícones:** Lucide React Native (Iconografia vetorial moderna e limpa)

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
Antes de começar, é necessário ter instalado na máquina o Node.js (Versão LTS recomendada), um gerenciador de pacotes (npm) e o aplicativo Expo Go instalado no celular (disponível para Android e iOS).

### Passo a Passo

1. Clonar o repositório utilizando o comando: git clone https://github.com/l3xt-3r/apoiamente_app_full.git
2. Entrar na pasta do projeto utilizando o comando: cd apoiamente_app_full
3. Instalar as dependências utilizando o comando: npm install
4. Iniciar o servidor do Expo utilizando o comando: npx expo start
5. Para executar no celular, abra o aplicativo Expo Go no seu aparelho. Se usar Android, faça o escaneamento do QR Code que apareceu no terminal da sua máquina. Se usar iOS, abra a câmera nativa do celular para ler o QR Code.

---

## 🤝 Divisão e Organização da Equipe

Para garantir a entrega do ecossistema, o projeto dividiu-se de forma colaborativa nas seguintes frentes de trabalho:

* **Engenharia de Software e Front-end (Código):** Desenvolvido em parceria direta por Alexandre e colega de programação. Fomos os corresponsáveis por idealizar, estruturar e codificar todos os ecrãs, componentes reutilizáveis, fluxo de rotas (Expo Router) e a lógica de persistência local (AsyncStorage).
* **Identidade Visual e Comunicação:** Membros da equipe focados no desenvolvimento dos banners promocionais e divulgação externa do projeto de extensão.
* **Documentação Textual:** Membros da equipe focados na redação e estruturação do relatório geral.
