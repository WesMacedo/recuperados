const axios = require('axios');    
const colors = require("colors");      
const { spawn } = require('child_process');
process.title = 'SERVIDOR';

let startTime = new Date().getTime();
let elapsedTime = 0;
let tempo_de_atividade = '';

 
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
 




function verificar_conexao_internet() {   
      console.log(colors.yellow(' VERIFICANDO CONEXÃO COM A INTERNET...'));   
  axios.get('https://crateus.net/webhook.php', { cache: false })
    .then(function(response) { 
      console.clear(); 
      console.log(colors.green(' CONEXÃO COM A INTERNET ESTABELECIDA!\n'+colors.white(' Iniciando servidor...'))); 
      setInterval(verificar_status_servidor, 7000);
    })
    .catch(function(error) {
      console.clear(); 
      console.log(colors.red(' SEM CONEXÃO COM A INTERNET.\n'+colors.yellow(' Aguardando conexão...'))); 
      setTimeout(verificar_conexao_internet, 7000);
    });
}

function verificar_status_servidor() {   
  axios.get('https://crateus.net/webhook.php?servidor=local', { cache: false })
    .then(return_servidor_assistencia_status => {
      if (return_servidor_assistencia_status.data == 'ATIVO') {
        console.clear(); 
        console.log(' SERVIDOR:  WhatsApp ');
        console.log(' STATUS:    ' +colors.green(return_servidor_assistencia_status.data));
        console.log(' ATIVIDADE: ' +colors.bold(tempo_de_atividade));
        iniciar_robos();
      } else if (return_servidor_assistencia_status.data == 'MANUTENCAO') {
        console.clear(); 
        console.log(' SERVIDOR:  WHATSAPP ');
        console.log(' STATUS:    ' +colors.yellow(return_servidor_assistencia_status.data));
        console.log(' ATIVIDADE: ' +colors.bold(tempo_de_atividade));
      } else if (return_servidor_assistencia_status.data == 'INATIVO') {
        console.clear(); 
        console.log(' SERVIDOR:  WHATSAPP ');
        console.log(' STATUS:    ' +colors.red(return_servidor_assistencia_status.data));
        console.log(' ATIVIDADE: ' +colors.bold(tempo_de_atividade));
      } else {
        console.clear();
        console.log(colors.red(' ERRO AO CONECTAR COM O SERVIDOR!' + colors.yellow('\n Reiniciando...'))); 
          verificar_conexao_internet(); 
      }
    })
    .catch(error => {
      console.clear();
      console.log(colors.red('  O SERVIDOR NÃO ESTÁ RESPONDENDO!' + colors.yellow('\n Reiniciando...'))); 
        verificar_conexao_internet(); 
    });
}

function iniciar_robos() { 
  axios.get('https://crateus.net/webhook.php?conectar', { cache: false }).then(return_con_numero_robo => {
    result_numero = return_con_numero_robo.data;
    if (result_numero && result_numero !== '') {
      console.log(colors.green('\r\n INICIANDO INSTANCIA ') + colors.yellow(result_numero) + '...');

      const child = spawn('start', ['cmd', '/c', 'node', 'robo.js', result_numero], { 
        shell: true,
        detached: true,
        stdio: 'ignore'
      }); 
      child.unref();


      setTimeout(function() {
        console.log('\r\n A INSTANCIA ' + colors.yellow(result_numero) + colors.green(' FOI INICIADO COM SUCESSO!'));
      }, 1000);
    }
  })
  .catch(error => {
    console.clear();
    console.log(colors.red(' ERRO AO OBTER AO OBTER LISTA DE ROBOS.' + colors.yellow('\n Reiniciando...')));
    verificar_conexao_internet();
  });
}

 
verificar_conexao_internet();

//const { state, saveCreds } = await useMultiFileAuthState('sessions/'+process.argv[2])