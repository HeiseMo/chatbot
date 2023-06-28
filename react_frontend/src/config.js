let backendHost;

const hostname = window && window.location && window.location.hostname;

if(hostname === 'localhost') {
    backendHost = 'http://localhost:5601';
} else if(hostname === '135.125.204.233') {
    backendHost = 'http://135.125.204.233:5601';
} else {
    backendHost = 'http://localhost:5601';
}

export const API_BASE_URL = `${backendHost}`;
