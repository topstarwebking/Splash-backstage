const ipfsApi = require("ipfs-api");
const ipfs = new ipfsApi('localhost', 5000, {protocol: 'http', 'api-path': '/api/v1/'});

export default ipfs;