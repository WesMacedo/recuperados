process.title = 'AUTO-ATENDIMENTO | PID:'+process.pid;
const fs = require('fs');
const path = require('path'); 
const logFilePath = path.join(__dirname, 'logs', 'serv.txt');
const axios = require('axios');    
const colors = require("colors");      
const { spawn } = require('child_process'); 
const { exec } = require('child_process');
const Table = require('cli-table3');

let startTime = new Date().getTime();
let elapsedTime = 0;
let tempo_de_atividade = '';
let isVerificandoConexao = false;
let isVerificandoStatus = false;
let DadosServidor = '';

function saveLog(logMessage) {
  const timestamp = new Date().toLocaleString();
  const logEntry = `[ ${timestamp} ]: ${logMessage}\n`;

  const writeStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  writeStream.write(logEntry);
  writeStream.end();

  writeStream.on('finish', () => {
  });

  writeStream.on('error', (err) => {
    console.error('Erro ao salvar o log:', err);
  });
}
saveLog('Iniciando sistema...');

setInterval(() => {
  elapsedTime = new Date().getTime() - startTime;
  let seconds = Math.floor(elapsedTime / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);

  seconds %= 60;
  minutes %= 60;
  hours %= 24;
  tempo_de_atividade = `${days} Dias  ${hours}h:${minutes}m:${seconds}s`;
}, 1000);

// Cria a tabela inicialmente
const table = new Table({
  head: ['PID', 'Uso de CPU', 'Uso de Memória'],
});

// Função para atualizar os dados da tabela
function atualizarTabela() {
  exec('tasklist /FI "IMAGENAME eq node.exe" /NH /FO CSV', (error, stdout) => {
    if (error) {
      console.error('Erro ao obter a lista de processos do Node.js:', error);
      return;
    }

    const lines = stdout.trim().split('\n');
    const processes = lines.map((line) => {
      const [imageName, pid, sessionName, sessionNumber, memoryUsage] = line.split(',');
      const [memoryUsageValue, memoryUsageUnit] = memoryUsage.trim().split(' ');
      const cpuUsage = 0; // Não é possível obter o uso de CPU diretamente no Windows usando tasklist
      return {
        pid: parseInt(pid.replace(/"/g, ''), 10),
        sessionName: sessionName.replace(/"/g, ''),
        sessionNumber: parseInt(sessionNumber.replace(/"/g, ''), 10),
        cpuUsage,
        memoryUsage: {
          value: parseFloat(memoryUsageValue.replace(/"/g, '').replace(',', '')),
          unit: memoryUsageUnit.replace(/"/g, ''),
        },
      };
    });

    // Limpa a tabela existente
    table.length = 0;

    processes.forEach((process) => {
      table.push([
        process.pid,
        `${process.cpuUsage}%`,
        `${process.memoryUsage.value} ${process.memoryUsage.unit}`,
      ]);
    });
    console.clear();
    console.log(DadosServidor);
    console.log('\n' + table.toString());
  });
}

// Chama a função de atualização da tabela a cada intervalo
setInterval(atualizarTabela, 1000);

// servidor

  function verificar_conexao_internet() {
    if (isVerificandoConexao) {
      return;
    }
  
    isVerificandoConexao = true;
  
    DadosServidor = (colors.yellow('VERIFICANDO CONEXÃO COM A INTERNET...'));
  
    const request = axios.get('https://www.api.crateus.net/', { cache: false });
  
    const timeout = setTimeout(() => {
      request.cancel(); 
      DadosServidor = (colors.red('SEM CONEXÃO COM A INTERNET.\n' + colors.yellow('Aguardando conexão...')));
      saveLog('[LOG_ERROR]: Sem conexão com a internet. Aguardando conexão...');
      isVerificandoConexao = false;
      setTimeout(verificar_conexao_internet, 7000);
    }, 10000); 
  
    request.then(function (response) {
      clearTimeout(timeout);
       
      DadosServidor = (colors.green('CONEXÃO COM A INTERNET ESTABELECIDA!\n' + colors.white('Iniciando sistema...')));
      saveLog('Conexão com a internet estabelecida!');
      setInterval(verificar_status_servidor, 7000);
      isVerificandoConexao = false;
    }).catch(function (error) {
      if (!axios.isCancel(error)) {
        clearTimeout(timeout);
         
        DadosServidor = (colors.red('SEM CONEXÃO COM A INTERNET.\n' + colors.yellow('Aguardando conexão...')));
        saveLog('[LOG_ERROR]: Sem conexão com a internet. Aguardando conexão...');
        isVerificandoConexao = false;
        setTimeout(verificar_conexao_internet, 7000);
      } else {
        isVerificandoConexao = false;
      }
    });
  }
   

  function verificar_status_servidor() {
    if (isVerificandoStatus) { 
      return;
    }
     
    isVerificandoStatus = true;
  
    axios.get('https://api.crateus.net/autoatendimento/servidor/api.php?status=servidor', { cache: false })
      .then(return_servidor_assistencia_status => {
        function exibirDadosServidor(status, tempoAtividade) {
          const tableServidor = new Table({
            head: ['SERVIDOR', 'TEMPO DE ATIVIDADE'],
            colWidths: [15, 21],
          });
        
          tableServidor.push([status, tempoAtividade]);
        
          return tableServidor.toString();
        }
         
        async function parar_robos() { 
          try {
            const { data: stop_robo } = await axios.get('https://api.crateus.net/autoatendimento/delivery/api.php?robos=stop', { cache: false });
        
            console.log(stop_robo); 
             
          } catch (error) {
            if (error.response) {
              console.log('[ERRO AO PARAR ROBOS]');
            } else if (error.request) {
              console.log('[ERRO DE CONEXÃO]');
            } else {
              console.log('[ERRO DESCONHECIDO]');
            }
          }
        }

        if (return_servidor_assistencia_status.data == 'ONLINE') {
          const status = colors.green(return_servidor_assistencia_status.data);
          const tempoAtividade = colors.bold(tempo_de_atividade);
          DadosServidor = exibirDadosServidor(status, tempoAtividade);
          parar_robos();
          iniciar_robos();
        } else if (return_servidor_assistencia_status.data == 'MANUTENÇÃO') {
          const status = colors.yellow(return_servidor_assistencia_status.data);
          const tempoAtividade = colors.bold(tempo_de_atividade);
          DadosServidor = exibirDadosServidor(status, tempoAtividade);
        } else if (return_servidor_assistencia_status.data == 'OFFLINE') {
          const status = colors.red(return_servidor_assistencia_status.data);
          const tempoAtividade = colors.bold(tempo_de_atividade);
          DadosServidor = exibirDadosServidor(status, tempoAtividade);
        } else { 
          DadosServidor = (colors.red('Erro ao obter status do servidor.' + colors.yellow('\nReiniciando...'))); 
          saveLog('[LOG_ERROR]: '+return_servidor_assistencia_status.data+' Reiniciando...');
          verificar_conexao_internet();
        }
        isVerificandoStatus = false;
      })
      .catch(error => {
         
        DadosServidor = (colors.red('O servidor WEB não está respondendo.' + colors.yellow('\nReiniciando...')));
        saveLog('[LOG_ERROR]: O servidor WEB não está respondendo. Reiniciando...');
        verificar_conexao_internet();
        isVerificandoStatus = false;
      });
  }
  
  

  async function iniciar_robos() {
    let isIniciandoRobo = true;
  
    try {
      const { data: start_robo } = await axios.get('https://api.crateus.net/autoatendimento/delivery/api.php?robos=start', { cache: false });
      const telefoneRegex = /^\d{11}$/; // Expressão regular para validar um número de telefone com 11 dígitos
  
      if (telefoneRegex.test(start_robo)) {
        DadosServidor = DadosServidor +(`\n\nIniciando robo ${colors.yellow(start_robo)}...`);
        saveLog(`Iniciando robo ${start_robo} ...`);
  
        const child = spawn('start', ['cmd', '/c', 'start /min node', 'robo.js', start_robo], {
          shell: true,
          detached: true,
          stdio: 'ignore',
          windowsHide: true,
        });
        child.unref(); 
        setTimeout(() => {
          DadosServidor = DadosServidor +(`\n\nRobo ${colors.green(start_robo)} foi iniciado com sucesso!`);
          saveLog(`Robo ${start_robo} foi iniciado com sucesso!`);
        }, 1000);
      }
    } catch (error) {
      
  
      if (error.response) {
        DadosServidor = DadosServidor +(colors.red('\n\nErro ao obter lista de robos. ' + colors.yellow('\nReiniciando...')));
        saveLog('[LOG_ERROR]: Erro ao obter lista de robos. Reiniciando...');
      } else if (error.request) {
        DadosServidor = DadosServidor +(colors.red('\n\nErro de conexão. ' + colors.yellow('\nReiniciando...')));
        saveLog('[LOG_ERROR]: Erro de conexão. Reiniciando...');
      } else {
        DadosServidor = DadosServidor +(colors.red('\n\nErro desconhecido. ' + colors.yellow('\nReiniciando...')));
        saveLog('[LOG_ERROR]: Erro desconhecido. Reiniciando...');
      }
  
      verificar_status_servidor();
    }
  
    isIniciandoRobo = false;
  }


   
  
  

 
verificar_conexao_internet();

//const { state, saveCreds } = await useMultiFileAuthState('sessions/'+process.argv[2])