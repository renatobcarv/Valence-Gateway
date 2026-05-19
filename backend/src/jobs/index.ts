// Importar handlers registra os processors no Bull automaticamente
import './handlers/calculateSplits';
import './handlers/sendTransfer';
import './handlers/sendEmail';

export { splitQueue, transferQueue, notificationQueue } from './queues';
