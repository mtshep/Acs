const axios = require('axios');

const url = "https://demodm1.friendly-tech.com/ftacsws/acsws.asmx";
const headers = {
    "Content-Type": "text/xml; charset=utf-8",
    "SOAPAction": "http://www.friendly-tech.com/FTSetDeviceParameters"
};

const deviceSN = "CP2130JC6T2";
const creator = "Cal Shep";

const setDeviceParameters = async (name, value) => {
    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fri="http://www.friendly-tech.com">
        <soapenv:Header/>
        <soapenv:Body>
            <fri:FTSetDeviceParameters>
                <fri:devicesn>${deviceSN}</fri:devicesn>
                <fri:arrayparams>
                    <fri:Param>
                        <fri:Name>${name}</fri:Name>
                        <fri:Value>${value}</fri:Value>
                    </fri:Param>
                </fri:arrayparams>
                <fri:push>true</fri:push>
                <fri:endsession>false</fri:endsession>
                <fri:creator>${creator}</fri:creator>
            </fri:FTSetDeviceParameters>
        </soapenv:Body>
    </soapenv:Envelope>`;

    const response = await axios.post(url, body, { headers });
    return response.data;
};

const getTransactionStatus = async (transactionId) => {
    const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fri="http://www.friendly-tech.com">
        <soapenv:Header/>
        <soapenv:Body>
            <fri:FTGetTransactionStatus>
                <fri:transactionId>${transactionId}</fri:transactionId>
            </fri:FTGetTransactionStatus>
        </soapenv:Body>
    </soapenv:Envelope>`;

    const response = await axios.post(url, body, { headers });
    return response.data;
};

const main = async () => {
    try {
        // Disable WiFi radios
        await setDeviceParameters("Device.WiFi.Radio.1.Enable", "0");
        await setDeviceParameters("Device.WiFi.Radio.2.Enable", "0");

        // Wait for 30 seconds
        await new Promise(resolve => setTimeout(resolve, 30000));

        // Enable WiFi radios
        const response1 = await setDeviceParameters("Device.WiFi.Radio.1.Enable", "1");
        const response2 = await setDeviceParameters("Device.WiFi.Radio.2.Enable", "1");

        // Extract transaction IDs from responses
        const transactionId1 = extractTransactionId(response1);
        const transactionId2 = extractTransactionId(response2);

        // Get transaction status
        const status1 = await getTransactionStatus(transactionId1);
        const status2 = await getTransactionStatus(transactionId2);

        console.log("Transaction Status 1:", status1);
        console.log("Transaction Status 2:", status2);
    } catch (error) {
        console.error(error);
    }
};

const extractTransactionId = (response) => {
    // Implement the logic to extract the transaction ID from the response
    // This will depend on the structure of the response
    return "extractedTransactionId";
};

main();
