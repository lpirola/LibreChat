import axios from 'axios';
import { useEffect, useState } from 'react';

export interface Topic {
  row_number: number;
  Tópico: string;
  Setor: string;
}

export interface CNAE {
  row_number: number;
  'Codigo CNAE': string;
  Descrição: string;
}

export default function GetPromptFiltersLists() {
  const [topicList, setTopicList] = useState<Topic[] | null>(null);
  const [cnaeList, setCnaeList] = useState<CNAE[] | null>(null);

  useEffect(() => {
    const fetchAndStoreData = async () => {
      const storedTopicList = localStorage.getItem('TopicList');
      const storedCnaeList = localStorage.getItem('CNAEList');

      try {
        const [topicResponse, cnaeResponse] = await Promise.all([
          axios.get('https://automacao.iasolaris.com.br/webhook/topics'),
          axios.get('https://automacao.iasolaris.com.br/webhook/CNAE'),
        ]);

        setTopicList(topicResponse.data);
        setCnaeList(cnaeResponse.data);

        localStorage.setItem('TopicList', JSON.stringify(topicResponse.data));
        localStorage.setItem('CNAEList', JSON.stringify(cnaeResponse.data));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAndStoreData();
  }, []);
}