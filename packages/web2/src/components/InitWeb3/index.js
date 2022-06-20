import Web3 from "web3";

const Web3Init = async () => {
    let web3;
    if (window.ethereum) {
        try {
            web3 = new Web3(window.ethereum);
        }
        catch (error) {
            console.log(error);
        }
    }
    else if (window.web3) {
        web3 = window.web3;
    }
    else {
        const provider = new Web3.providers.HttpProvider(

        );
        web3 = new Web3(provider);
    }
    return web3;
}

export default Web3Init;