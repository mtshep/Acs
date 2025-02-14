const axios = require('axios');
const xml2js = require('xml2js');

const SOAP_URL = 'https://demodm1.friendly-tech.com/ftacsws/acsws.asmx';
const SOAP_ACTION = '"http://www.friendly-tech.com/FTGetDeviceParameters"';
const DEVICE_SN = 'CP2130JC6T2';

const soapRequest = `
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:fri="http://www.friendly-tech.com">
   <soap:Header/>
   <soap:Body>
      <fri:FTGetDeviceParameters>
         <fri:devicesn>${DEVICE_SN}</fri:devicesn>
         <fri:arraynames>
            <fri:string>Device.WiFi.MultiAP.APDevice.</fri:string>
            <fri:string>Device.Hosts.</fri:string>
            <fri:string>Device.WiFi.MultiAP.X_000E50_ControllerSN</fri:string>
         </fri:arraynames>
      </fri:FTGetDeviceParameters>
   </soap:Body>
</soap:Envelope>`;

async function fetchDeviceData() {
    try {
        const response = await axios.post(SOAP_URL, soapRequest, {
            headers: {
                'Content-Type': 'application/soap+xml; charset=utf-8',
                'SOAPAction': SOAP_ACTION
            }
        });

        const parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(response.data, (err, result) => {
            if (err) {
                console.error('Error parsing response:', err);
                return;
            }

            const params = result['soap:Envelope']['soap:Body']['FTGetDeviceParametersResponse']['FTGetDeviceParametersResult']['Params']['ParamWSDL'];

            // Extract Controller Serial Number
            const controllerSN = params.find(p => p.Name === "Device.WiFi.MultiAP.X_000E50_ControllerSN")?.Value || null;

            // Extract APDevice Information
            const apDevices = [];
            params.forEach(param => {
                const match = param.Name.match(/Device\.WiFi\.MultiAP\.APDevice\.(\d+)\.(.+)/);
                if (match) {
                    const apDeviceNumber = match[1];
                    const key = match[2];

                    let apDevice = apDevices.find(d => d.apDeviceNumber === apDeviceNumber);
                    if (!apDevice) {
                        apDevice = { apDeviceNumber, data: {} };
                        apDevices.push(apDevice);
                    }

                    if ([
                        "MACAddress",
                        "X_000E50_Parent",
                        "SerialNumber",
                        "ProductClass",
                        "Device Type",
                        "X_000E50_BackhaulLinkStatus",
                        "BackhaulLinkType"
                    ].includes(key)) {
                        apDevice.data[key] = param.Value || "N/A";
                    }
                }
            });

            // Determine Device Type (Router or Mesh Extender)
            apDevices.forEach(device => {
                device.data["Type"] = (device.data.SerialNumber === controllerSN) ? "Router" : "Mesh Extender";
            });

            // Output the formatted data
            console.log('Filtered AP Devices:', apDevices);
        });

    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

fetchDeviceData();
