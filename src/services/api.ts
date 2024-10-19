import axios from 'axios';

// Substitua pela URL correta do seu backend no Heroku
const API_URL = 'https://young-journey-58853-4deb73cbc284.herokuapp.com/api'; 

// Função para buscar todas as faturas
export const fetchInvoices = async () => {
  try {
    console.log('Tentando buscar todas as faturas...');
    const response = await axios.get(`${API_URL}/invoices`);
    console.log('Faturas encontradas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar as faturas:', error);
    throw error;
  }
};

// Função para buscar faturas com parâmetros de busca (filtragem)
export const fetchInvoicesSearch = async (filterParams: any) => {
  try {
    const queryParams = new URLSearchParams(filterParams).toString(); // Converte o objeto de filtros em string de query
    console.log('Tentando buscar faturas com parâmetros:', queryParams);
    
    const response = await fetch(`${API_URL}/invoices/search?${queryParams}`);
    
    if (!response.ok) {
      console.error(`Erro na requisição: ${response.status} - ${response.statusText}`);
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Faturas encontradas com filtro:', data);
    return data;
  } catch (error) {
    console.error('Erro ao buscar faturas com filtro:', error);
    throw error;
  }
};

// Função para buscar fatura por cliente e mês de referência
export const fetchInvoiceByClient = async (no_cliente: string, mes_referencia: string) => {
  try {
    console.log(`Tentando buscar fatura para cliente ${no_cliente} no mês ${mes_referencia}...`);
    const response = await axios.get(`${API_URL}/invoices/${no_cliente}/${mes_referencia}`);
    console.log('Fatura encontrada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar fatura por cliente:', error);
    throw error;
  }
};
