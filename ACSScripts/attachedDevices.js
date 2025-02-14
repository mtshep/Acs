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

            // Regex to match "AssociatedDevice.<number>.MACAddress"
            const associatedDeviceRegex = /Device\.WiFi\.MultiAP\.APDevice\.(\d+)\.Radio\.\d+\.AP\.\d+\.AssociatedDevice\.(\d+)\.MACAddress/;
            const hostPhysAddressRegex = /Device\.Hosts\.Host\.(\d+)\.PhysAddress/;

            // Extract associated device MAC addresses and their APDevice
            const associatedDevices = {};
            params.forEach(param => {
                const match = param.Name.match(associatedDeviceRegex);
                if (match) {
                    const apDeviceNumber = match[1]; // APDevice.<number>
                    const deviceNumber = match[2]; // AssociatedDevice.<number>

                    associatedDevices[param.Value] = {
                        apDeviceNumber,
                        deviceNumber,
                        macAddress: param.Value
                    };
                }
            });

            // Extract Hosts information (PhysAddress, FriendlyName, InterfaceType)
            const hosts = {};
            params.forEach(param => {
                const match = param.Name.match(hostPhysAddressRegex);
                if (match) {
                    const hostNumber = match[1];
                    hosts[param.Value] = { hostNumber, macAddress: param.Value };
                }
            });

            // Match MAC Addresses and retrieve corresponding FriendlyName & InterfaceType
            Object.values(associatedDevices).forEach(device => {
                const host = hosts[device.macAddress];
                if (host) {
                    const friendlyNameKey = `Device.Hosts.Host.${host.hostNumber}.X_000E50_FriendlyName`;
                    const interfaceTypeKey = `Device.Hosts.Host.${host.hostNumber}.InterfaceType`;

                    const friendlyName = params.find(p => p.Name === friendlyNameKey)?.Value || "N/A";
                    const interfaceType = params.find(p => p.Name === interfaceTypeKey)?.Value || "N/A";

                    // Find additional device properties
                    const deviceBase = `Device.WiFi.MultiAP.APDevice.${device.apDeviceNumber}.Radio.1.AP.3.AssociatedDevice.${device.deviceNumber}`;
                    const operatingStandard = params.find(p => p.Name === `${deviceBase}.OperatingStandard`)?.Value || "N/A";
                    const signalStrength = params.find(p => p.Name === `${deviceBase}.SignalStrength`)?.Value || "N/A";
                    const active = params.find(p => p.Name === `${deviceBase}.Active`)?.Value || "N/A";
                    const isBackHaulSta = params.find(p => p.Name === `${deviceBase}.X_000E50_IsBackHaulSta`)?.Value || "N/A";

                    device.friendlyName = friendlyName;
                    device.interfaceType = interfaceType;
                    device.operatingStandard = operatingStandard;
                    device.signalStrength = signalStrength;
                    device.active = active;
                    device.isBackHaulSta = isBackHaulSta;
                }
            });

            // Output the formatted data
            console.log('Matched Associated Devices:', Object.values(associatedDevices));
        });

    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

fetchDeviceData();