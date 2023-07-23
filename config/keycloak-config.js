const session = require('express-session');
const Keycloak = require('keycloak-connect');
const crypto = require('crypto');

const sessionSecret = crypto.randomBytes(32).toString('hex');
const memoryStore = new session.MemoryStore();

let _keycloak;

const keycloakConfig = {
    clientId: 'cico-client',
    bearerOnly: true,
    sslRequired: 'external',
    authServerUrl: 'http://127.0.0.1:8089/auth/',
    realm: 'cico',
    credentials: {
        secret: 'NqzuD31tARXzeqa1YeMqAzCl7oeYWBV4'
    },
    confidentialPort: 0
};


function initKeycloak() {
    if (_keycloak) {
        console.warn("Trying to init Keycloak again!");
        return _keycloak;
    } else {
        console.log("Initializing Keycloak...");
        _keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
        return _keycloak;
    }
}

function getKeycloak() {
    if (!_keycloak) {
        console.error('Keycloak has not been initialized. Please called init first.');
    }
    return _keycloak;
}

module.exports = {
    initKeycloak,
    getKeycloak,
    sessionSecret,
    memoryStore
};