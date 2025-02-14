const axios = require('axios');

async function checkDeviceStatus(devicesn) {
    const url = "https://demodm1.friendly-tech.com/ftacsws/acsws.asmx";
    const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fri="http://www.friendly-tech.com">
        <soapenv:Header/>
        <soapenv:Body>
            <fri:FTCPEStatus>
                <fri:devicesn>${devicesn}</fri:devicesn>
                <fri:creator>Cals ACS View</fri:creator>
            </fri:FTCPEStatus>
        </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        const response = await axios.post(url, soapRequest, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'http://www.friendly-tech.com/FTCPEStatus'
            }
        });

        const match = response.data.match(/<Online>(.*?)<\/Online>/);
        const onlineStatus = match ? match[1] : "false";
        
        return onlineStatus === "true" ? "Connected" : "Error";
    } catch (error) {
        console.error("Error fetching device status:", error.message);
        return "Error";
    }
}

// Example Usage
checkDeviceStatus("CP2130JC6T2").then(status => console.log("Device Status:", status));
