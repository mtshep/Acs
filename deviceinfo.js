
const axios = require('axios');
const xml2js = require('xml2js');

async function getDeviceInfo(deviceSN) {
    const url = 'https://demodm1.friendly-tech.com/ftacsws/acsws.asmx';
    
    const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:fri="http://www.friendly-tech.com">
        <soapenv:Header/>
        <soapenv:Body>
            <fri:FTGetDeviceInfo>
                <fri:devicesn>${deviceSN}</fri:devicesn>
            </fri:FTGetDeviceInfo>
        </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        const response = await axios.post(url, soapRequest, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'http://www.friendly-tech.com/FTGetDeviceInfo'
            }
        });

        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(response.data);
        
        const deviceInfo = result['soap:Envelope']['soap:Body']['FTGetDeviceInfoResponse']['FTGetDeviceInfoResult'];
        
        const extractedData = {
            OUI: deviceInfo.OUI,
            ManufacturerName: deviceInfo.ManufacturerName,
            ModelName: deviceInfo.ModelName,
            Created: deviceInfo.Created,
            Updated: deviceInfo.Updated,
            FirmwareVersion: deviceInfo.FirmwareVersion,
            ProtocolType: deviceInfo.ProtocolType
        };

        console.log(extractedData);
        return extractedData;
    } catch (error) {
        console.error('Error fetching device info:', error);
    }
}

// Example usage
getDeviceInfo('CP2130JC6T2');
