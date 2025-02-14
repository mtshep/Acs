const axios = require('axios');

async function getBackhaulLinkStatus() {
    const url = 'https://demodm1.friendly-tech.com/ftacsws/acsws.asmx';
    const soapAction = 'http://www.friendly-tech.com/FTGetDeviceParameters';

    const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:fri="http://www.friendly-tech.com">
        <soap:Header/>
        <soap:Body>
            <fri:FTGetDeviceParameters>
                <fri:devicesn>CP2130JC6T2</fri:devicesn>
                <fri:arraynames>
                    <fri:string>Device.WiFi.MultiAP.APDevice.</fri:string>
                </fri:arraynames>
                <fri:creator>Cals ACS View</fri:creator>
            </fri:FTGetDeviceParameters>
        </soap:Body>
    </soap:Envelope>`;

    try {
        const response = await axios.post(url, soapRequest, {
            headers: {
                'Content-Type': 'application/soap+xml; charset=utf-8',
                'SOAPAction': soapAction
            }
        });

        const responseData = response.data;
        
        // Extracting relevant information manually using regex
        const matches = responseData.match(/<Name>(.*?)<\/Name>\s*<Value>(.*?)<\/Value>/g);
        const result = {};
        
        if (matches) {
            matches.forEach(match => {
                const nameMatch = match.match(/<Name>(.*?)<\/Name>/);
                const valueMatch = match.match(/<Value>(.*?)<\/Value>/);
                
                if (nameMatch && valueMatch) {
                    const name = nameMatch[1];
                    const value = valueMatch[1];
                    if (name.endsWith('X_000E50_BackhaulLinkStatus')) {
                        result[name] = value;
                    }
                }
            });
        }
        
        // Determine the highest severity status to display
        const values = Object.values(result);
        let status = "Good";
        if (values.includes("Not Connected")) {
            status = "Error";
        } else if (values.includes("Marginal")) {
            status = "Marginal";
        }
        
        console.log('Overall Backhaul Link Status:', status);
        return status;
    } catch (error) {
        console.error('Error fetching device parameters:', error.message);
    }
}

getBackhaulLinkStatus();
