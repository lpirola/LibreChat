import axios from 'axios';

export interface AssistantInfo {
  Id: string;
  Nome: string;
  Icone: string;
  PerguntasDoDia: string
}

export default async function GetAssistantsInfo() {
  const hasAssistant = localStorage.getItem('AssistantList');
  if (hasAssistant == null) {
    try {
      const [assistantResponse] = await Promise.all([
        axios.get('https://automacao.iasolaris.com.br/webhook/96e356ba-8ebe-4710-a8d3-2fd2e8acc98a'),
      ]);
      console.log(assistantResponse);

      localStorage.setItem('AssistantList', JSON.stringify(assistantResponse.data));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
}