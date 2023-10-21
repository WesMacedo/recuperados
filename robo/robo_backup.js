
process.title = 'robo_'+process.argv[2]+' | PID:'+process.pid;
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'logs', 'robo_' + process.argv[2] + '.txt');

function saveLog(logMessage) {
  const timestamp = new Date().toLocaleString();
  const logEntry = `[ ${timestamp} ]: ${logMessage}\n`;

  const writeStream = fs.createWriteStream(logFilePath, { flags: 'a' });

  writeStream.write(logEntry, 'utf8');
  writeStream.end();

  writeStream.on('finish', () => {
    
  });

  writeStream.on('error', (err) => {
    console.error('Erro ao salvar o log:', err);
  });
}
	function changeStatus(newStatus) { 
	axios.get(`https://api.crateus.net/autoatendimento/delivery/api.php?robo=`+process.argv[2]+`&change=${newStatus}`)
	  .then(() => { 
		saveLog(`Status do robô alterado para ${newStatus}.`);
	  })
	  .catch((error) => {
		console.error(`Erro ao alterar o status do robô para ${newStatus}.`, error);
		saveLog(`Erro ao alterar o status do robô para ${newStatus}.`);
	  });
  	}
  	function attQr(newQr) {   
	const robonum = process.argv[2];
	axios.get(`https://api.crateus.net/autoatendimento/delivery/api.php?robo=${robonum}&qr=${newQr}`)
	  .then(() => { 
		saveLog(`QR do robô atualizado para ${newQr}.`);
	  })
	  .catch((error) => {
		console.error(`Erro ao atualizar o QR do robô.`, error);
		saveLog(`Erro ao atualizar o QR do robô.`);
	  });
  	}
 
	  function checkStatus() {   
		const robonum = process.argv[2];  
		axios.get(`https://api.crateus.net/autoatendimento/delivery/api.php?robo=${robonum}&check=status`, { cache: false })
			.then(checkStatus_return => {
			if(checkStatus_return.data == "Desconectado"){
				saveLog(`Robo desconectado atraves do painel.`); 
				process.exit();
			}
			console.log(checkStatus_return.data); 
		  })
		  .catch(error => { 
			saveLog(`Erro ao obter status do robo: ${error.message}`);
		})
	}
	setInterval(checkStatus, 10000);

	function atualizaconexao() {   
		const robonum = process.argv[2];   
		axios.get(`https://api.crateus.net/autoatendimento/delivery/api.php?robo=${robonum}&time=atualizar`, { cache: false })
		  .catch(error => { 
			saveLog(`Erro ao atualizar time do robo: ${error.message}`);
		})
	}
	setInterval(checkStatus, 40000);

  
function replaceVariables(text, variables_resposta) { 
	const variableRegex = /{([^}]+)}/g;
   
	const replacedText = text.replace(variableRegex, (match, variableName) => { 
	  if (variables_resposta.hasOwnProperty(variableName)) {
		return variables_resposta[variableName];
	  } 
	  return match;
	}); 
	return replacedText;
  }

function strText(str1, str2) {
	return str1.toLowerCase() == str2.toLowerCase();
} 
const axios = require('axios');
const removeAcentos = (texto) => {
return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}; 
const removeLetrasRepetidas = (texto) => {
return texto.replace(/(.)\1+/g, "$1");
}; 
 
const dataAtual = new Date();
const horaAtual = dataAtual.getHours();
 
const manhaInicio = 6; // 6h
const manhaFim = 12; // 12h
const tardeInicio = 12; // 12h
const tardeFim = 18; // 18h

let saudacao;
 
if (horaAtual >= manhaInicio && horaAtual < manhaFim) {
  saudacao = 'Bom dia';
} else if (horaAtual >= tardeInicio && horaAtual < tardeFim) {
  saudacao = 'Boa tarde';
} else {
  saudacao = 'Boa noite';
}
 
const { Boom } = require('@hapi/boom')
const { default: makeWASocket, delay, DisconnectReason, fetchLatestBaileysVersion, isJidBroadcast, makeCacheableSignalKeyStore, makeInMemoryStore, useMultiFileAuthState, Browsers, MessageType, MessageOptions, Mimetype } = require('@whiskeysockets/baileys')
const P = require("pino"); 
let MAIN_LOGGER = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }); 
const logger = MAIN_LOGGER.child({});
logger.level = 'silent'; 
const doReplies = !process.argv.includes('--no-reply'); 
const msgRetryCounterMap = {};

 
const startSock = async() => {
	const { state, saveCreds } = await useMultiFileAuthState('sessions/'+process.argv[2]) 
	const { version, isLatest } = await fetchLatestBaileysVersion()
	console.clear();
	console.log(`VERSÃO WA v${version.join('.')}, isLatest: ${isLatest}`);
	 
	const sock = makeWASocket({
		version,
		logger,
		printQRInTerminal: true,  
		browser: ['SISTEC [V 3.1]', 'Desktop',''],
		syncFullHistory: true,
		auth: {
			creds: state.creds,
			/** caching makes the store faster to send/recv messages */
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		msgRetryCounterMap,
		generateHighQualityLinkPreview: true,
		shouldIgnoreJid: jid => isJidBroadcast(jid),
		
		
	})
	const sendMessageWTyping = async (msg, jid) => {
		await sock.sendPresenceUpdate('composing', jid)
		await delay(40)
		await sock.sendPresenceUpdate('paused', jid)
		await sock.sendMessage(jid, msg)
	}
	sock.ev.process(async(events) => { 
			if(events['connection.update']) {
				const update = events['connection.update']
				const { connection, lastDisconnect } = update  
				
				if (connection === 'connecting') {
					changeStatus('Conectando');    
				  } 
				  
				if (connection === 'open') {
					changeStatus('Conectado'); 
				  }
				if (!connection === 'open') { 
					// 
				  }
				  
				  if(connection === 'close') {
					 
					if (new Boom(lastDisconnect?.error)?.output.statusCode !== DisconnectReason.loggedOut) {
						startSock()
					} else {  
						const fs = require('fs-extra'); 
						fs.remove('sessions/'+process.argv[2])
						  .then(() => { 
							console.log('Robô desconectado pelo celular! Sessão local excluída.'); 
							saveLog('Robô desconectado pelo celular! Sessão local excluída.');
						  startSock();
						// Alterar status do robô para "Desconectado"
						axios.get('https://api.crateus.net/autoatendimento/delivery/api.php?robo=88997143163&change=Desconectado')
						.then(() => { 
						  saveLog('Status do robô alterado para Desconectado.');
						})
						.catch((error) => {
						  console.error('Erro ao alterar o status do robô para Desconectado.', error);
						  saveLog('Erro ao alterar o status do robô para Desconectado.');
						});
					})
					.catch((err) => {
					  console.error('Robô desconectado pelo celular! Erro ao excluir sessão local.', err);
					  saveLog('Robô desconectado pelo celular! Erro ao excluir sessão local.');
					  process.exit();
					});
				}
			  
				}
				  console.clear();     
				  console.log('info:', update);
				  attQr(encodeURIComponent(update.qr)); 
				   
				  
				}
		 

			// credentials updated -- save them
			if(events['creds.update']) { await saveCreds() } 
			if(events.call) {
				//console.log('recv_call_event', events.call)
			}

			// history received
			if(events['messaging-history.set']) {
				const { chats, contacts, messages, isLatest } = events['messaging-history.set']
				//console.log(`recv ${chats.length} chats, ${contacts.length} contacts, ${messages.length} msgs (is latest: ${isLatest})`)
			}
			 
			// received a new message
			if(events['messages.upsert']) {
				
				const upsert = events['messages.upsert']
				//console.log(JSON.stringify(upsert, undefined,2))
				 
				if(upsert.type === 'notify') {
 
					for(const msg of upsert.messages) {  //&& !msg?.key.remoteJid.endsWith('@g.us')
						if(!msg.key.fromMe && doReplies && !msg?.key.remoteJid.endsWith('@g.us') ) {
							let clientName, clientNum , resposta;
							 
							const variables_resposta = { 
							saudacao,
							endereco: "Rua coronel lúcio N° 00, Centro. Crateús-ce",
							clientName: msg?.pushName, 
							clientNum: msg?.key.remoteJid.split("@")[0],  
							};
							
							await sock.readMessages([msg.key]); 
							// MSG: AÚDIO
							if (msg.message.hasOwnProperty("audioMessage")) { 
								resposta ='🤖 Por favor, aguarde! \n\nUm de nossos atendentes vai dar continuidade ao seu atendimento.'
								await sock.sendMessage(msg.key.remoteJid, { text: resposta }, { quoted: msg });  
								   
							}else 
							// MSG: IMAGEM
							if (msg.message.hasOwnProperty("imageMessage")) {
								resposta ='🤖 Por favor, aguarde! \n\nUm de nossos atendentes vai dar continuidade ao seu atendimento.'
								await sock.sendMessage(msg.key.remoteJid, { text: resposta }, { quoted: msg }); 
							}else
							// MSG: TEXTO
							if (msg.message.hasOwnProperty("extendedTextMessage") ) {
							 
							let clientMsg; clientMsg = msg?.message?.extendedTextMessage?.text;  
							const fs = require('fs'); 
							const categorias = JSON.parse(fs.readFileSync('bot/delivery.json')); 
							const respostas = [];
							Object.entries(categorias).forEach(([categoria, dados]) => {
								if (dados.palavra_chave.some(palavra => {
									const palavraProcessada = removeLetrasRepetidas(removeAcentos(palavra.toLowerCase()));
									const mensagemProcessada = removeLetrasRepetidas(removeAcentos(clientMsg.toLowerCase()));
									const regex = new RegExp(`\\b${palavraProcessada}\\b`);
									return regex.test(mensagemProcessada);
								  })) {
								if (dados.resposta) {
								  respostas.push(dados.resposta);
								}
								if (dados.resposta_2) {
								  respostas.push(dados.resposta_2);
								}
								if (dados.resposta_3) {
								  respostas.push(dados.resposta_3);
								}
							  }
							   
							});
							
							if (respostas.length === 0) {
								const naoEntendi = categorias["MENU"];
								if (naoEntendi && naoEntendi.resposta) {
								  respostas.push(naoEntendi.resposta);
								}
								if (naoEntendi && naoEntendi.resposta_2) {
								  respostas.push(naoEntendi.resposta_2);
								}
								if (naoEntendi && naoEntendi.resposta_3) {
								  respostas.push(naoEntendi.resposta_3);
								}
							  }

							for (const resposta of respostas) {
								
								const respostaFormatada = replaceVariables(resposta, variables_resposta); 
								await sendMessageWTyping({ text: respostaFormatada }, msg.key.remoteJid);
							  }
							 
										 
									 
							} else {  }
							   
							   
						    //await sock.sendMessage(msg.key.remoteJid, { text: '.' }, { quoted: msg }); 
							//await sock.sendMessage(msg.key.remoteJid, { text: '.' }); 
							//await sendMessageWTyping({ text: clientNum }, msg.key.remoteJid);
							//const reactionMessage = { react: { text: "👍",   key: msg.key } };
							//await sock.sendMessage(msg.key.remoteJid, reactionMessage);
  
						}
					}
				}
			} 
			 
			if(events['messages.update']) {
				//console.log(events['messages.update'])  
			} 
			if(events['message-receipt.update']) {
				//console.log(events['message-receipt.update'])
			} 
			if(events['messages.reaction']) {
				//console.log(events['messages.reaction'])
			} 
			if(events['presence.update']) {
				//console.log(events['presence.update'])
			} 
			if(events['chats.update']) {
				//console.log(events['chats.update'])
			}

			if(events['contacts.update']) {
				for(const contact of events['contacts.update']) {
					if(typeof contact.imgUrl !== 'undefined') {
						const newUrl = contact.imgUrl === null
							? null
							: await sock.profilePictureUrl(contact.id).catch(() => null)
						//console.log( `O contato ${contact.id}tem uma nova foto de perfil: ${newUrl}` )
					}
				}
			}

			if(events['chats.delete']) {
				//console.log('chats deleted ', events['chats.delete'])
			}
		
		}
	)

	return sock;
}

startSock(); 