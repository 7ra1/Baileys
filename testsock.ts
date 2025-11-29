import makeWASocket, { makeCacheableSignalKeyStore, useMultiFileAuthState } from '/home/ronin/Projects/Baileys/src/index.ts';

const {state, saveCreds} = await useMultiFileAuthState('auth_info_multi');
import P from 'pino'

const logger = P({ level: 'debug' })
const sock = makeWASocket({
  auth: {
    creds:state.creds,
    keys:makeCacheableSignalKeyStore(state.keys,logger)

,  }, // auth state of your choosing,
  logger: P() 
})