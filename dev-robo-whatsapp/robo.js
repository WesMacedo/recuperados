const { Boom } = require('@hapi/boom')
const { default: makeWASocket, delay, DisconnectReason, fetchLatestBaileysVersion, isJidBroadcast, makeCacheableSignalKeyStore, makeInMemoryStore, useMultiFileAuthState, Browsers, MessageType, MessageOptions, Mimetype } = require('@adiwajshing/baileys')
const P = require("pino");

let MAIN_LOGGER = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` });
//console.clear();
const logger = MAIN_LOGGER.child({});
logger.level = 'silent';

//const useStore = !process.argv.includes('--no-store');
const doReplies = !process.argv.includes('--no-reply');

// external map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
const msgRetryCounterMap = {};

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
//const store = useStore ? makeInMemoryStore({ logger }) : undefined
//store?.readFromFile('./baileys_store_multi.json')
// save every 10s
//setInterval(() => {
//	store?.writeToFile('./baileys_store_multi.json')
//}, 10_000)

// start a connection
const startSock = async() => {
	const { state, saveCreds } = await useMultiFileAuthState('sessions/'+process.argv[2])
	// fetch latest version of WA Web
	const { version, isLatest } = await fetchLatestBaileysVersion()
	console.clear();
	console.log(`VERSÃO WA v${version.join('.')}, isLatest: ${isLatest}`);

	const sock = makeWASocket({
		version,
		logger,
		printQRInTerminal: true,  
		browser: ['API Wesley [ V 1.0 ]', 'Desktop',''],
		syncFullHistory: true,
		auth: {
			creds: state.creds,
			/** caching makes the store faster to send/recv messages */
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		msgRetryCounterMap,
		generateHighQualityLinkPreview: true,
		// ignore all broadcast messages -- to receive the same
		// comment the line below out
		shouldIgnoreJid: jid => isJidBroadcast(jid),
		// implement to handle retries
		//getMessage: async key => {
		//	if(store) {
		//		const msg = await store.loadMessage(key.remoteJid, key.id);
		//		return msg.message || undefined
		//	}

			// only if store is present
		//	return {
		//		conversation: 'hello'
		//	}
		//}
	})
	
	//store.bind(sock.ev)
	 
	const sendMessageWTyping = async (msg, jid) => {
		//await sock.presenceSubscribe(jid)
		//await delay(500)

		await sock.sendPresenceUpdate('composing', jid)
		await delay(2000)

		await sock.sendPresenceUpdate('paused', jid)

		await sock.sendMessage(jid, msg)
	}

 
	sock.ev.process( 
		async(events) => { 
			if(events['connection.update']) {
				const update = events['connection.update']
				const { connection, lastDisconnect } = update
				 
				if(connection === 'close') {
					 
					if (new Boom(lastDisconnect?.error)?.output.statusCode !== DisconnectReason.loggedOut) {
						startSock()
					} else {  
						const fs = require('fs-extra'); 
						fs.remove('sessions/'+process.argv[2])
						  .then(() => { console.log('Robô desconectado pelo celular! Sessão local excluída.'); 
						  startSock();
						})
						  .catch((err) => { console.error('Robô desconectado pelo celular! Erro ao excluir sessão local.', err);  
						  process.exit();
						});
						    
					}
				}
				 
				//console.clear();
				console.log('conexao_update:', update) 
			}

			// credentials updated -- save them
			if(events['creds.update']) {
				await saveCreds()
			}

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
				//console.log('recv messages ', JSON.stringify(upsert, undefined, 2))

				if(upsert.type === 'notify') {
					for(const msg of upsert.messages) {
						if(!msg.key.fromMe && doReplies) {
 
							//console.log('new_msg_event', msg.key.remoteJid);
							await sock.readMessages([msg.key]); 
							// responder a msg 
						    await sock.sendMessage(msg.key.remoteJid, { text: '.' }, { quoted: msg });
							// enviar msg 
							//await sock.sendMessage(msg.key.remoteJid, { text: '.' });
							// enviar msg e digitar
							//await sendMessageWTyping({ text: '.' }, msg.key.remoteJid);
							// enviar localização
							//await sock.sendMessage( msg.key.remoteJid, { location: { degreesLatitude: -5.175478421414567, degreesLongitude: -40.66853339325414 }});
							const reactionMessage = { react: { text: "👍",   key: msg.key } };
							await sock.sendMessage(msg.key.remoteJid, reactionMessage);
 
 
 



						}
					}
				}
			} 
			// messages updated like status delivered, message deleted etc.
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