import { Amplify } from 'aws-amplify';
import config from '@aws-amplify/backend/exported-backend-config.json';

// Configure Amplify in your app
Amplify.configure(config);

export { Amplify }; 