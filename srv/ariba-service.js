const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const { getDestination } = require('@sap-cloud-sdk/core');
const axios = require('axios');

function lPad(str, size) {
    var s = str.toString();
    while (s.length < size) {
        s = "0" + s;
    }
    return s; // return new number
}

module.exports = async function (srv) {

async function getSRToken() {                                               //Sourcing Reporting View Token
    const tokenUrl = 'https://api.jp.cloud.ariba.com/v2/oauth/token';
    const credentials = 'ODQzZWJiZjQtNGJmMi00ZTUxLTg3YTYtOWYyOTJmMTZiZTBmOjZYNlAzTnpCd3VqeXhoZGNabnlydEtWdUsyNVhieHhn';

    try {
        const response = await axios.post(
            tokenUrl,
            new URLSearchParams({ 'grant_type': 'openapi_2lo' }), // Correct request body
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded' // Correct content type
                }
            }
        );

        console.log('Access Token:', response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching token:', error.response ? error.response.data : error.message);
    }
}

srv.on('getWorkSpaceInfo', async (req) => {
    try {
        // const dt = new Date();
        // const currentDate = dt.getFullYear()+'-'+lPad(dt.getMonth()+1,2)+'-'+lPad(dt.getDate(),2);

        const currentDateF = '2025-05-29', currentDateT = '2025-05-29';

        const accessToken = await getSRToken(); // Fetch token before calling the API
        const DESTINATION_NAME = 'Ariba_Sourcing_API';

        // // Log the destination to ensure it is correctly configured
        // const destination = await getDestination(DESTINATION_NAME);
        // console.log('Destination Details:', destination);

        // // Proceed only if the destination URL is available
        // if (!destination || !destination.url) {
        //     throw new Error(`Destination ${DESTINATION_NAME} not found or URL is missing`);
        // }


        const response = await executeHttpRequest(
            { destinationName: DESTINATION_NAME },
            {
                method: 'GET',
                url: `/api/sourcing-reporting-view/v1/prod/views/SourcingProjectSourcingSystemView?realm=744321605-T&filters=%7B%22createdDateFrom%22%3A%22${currentDateF}T00%3A00%3A00Z%22%2C%22createdDateTo%22%3A%22${currentDateT}T23%3A59%3A59Z%22%7D`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'apiKey': 'ZPHYMsHqA3qe7xGzxYY056vaDDRobRg7',
                    'Content-Type': 'application/json'
                }
            }
        );

        var WorkSpaceData = response.data;
        var WorkSpace = []; // Reset the WorkSpace array before use
        var record = {};
        //console.log(WorkSpaceData);

        // Check if the records already exist in the table
        const existingWorkSpaces = await SELECT.from('T_WorkSpace').columns('InternalId'); // Select only InternalId to check existing ones

        // Insert only those records which do not exist in the table
        for (var i = 0; i < WorkSpaceData.Records.length; i++) {
            const internalId = WorkSpaceData.Records[i].InternalId;

            if (WorkSpaceData.Records[i].Status === 'Active' && WorkSpaceData.Records[i].TemplateObject !== null) {  //&& WorkSpaceData.Records[i].Owner.UniqueName === 'JASPREET' && internalId === 'WS2796971023'
                record = {};
                record.InternalId = internalId;
                record.WSTitle = WorkSpaceData.Records[i].Title; // WorkSpace title
                record.Status = WorkSpaceData.Records[i].Status;
                record.ID = cds.utils.uuid(); // Generate a new UUID
                record.owner = WorkSpaceData.Records[i].Owner.UniqueName;
                WorkSpace.push(record);
            }

        }

        // Insert only new records
        if (WorkSpace.length > 0) {
            const newWorkSpaces = WorkSpace.filter(record =>
                !existingWorkSpaces.some(existingRecord => existingRecord.InternalId === record.InternalId)
            );
            //console.log('Existing WorkSpaces:', existingWorkSpaces);
            if (newWorkSpaces.length > 0) {
                await INSERT.into('T_WorkSpace').entries(newWorkSpaces);
            }
        }

        return { WorkSpace };

    } catch (error) {
        console.error('Error calling destination API:', error);
        throw new Error('Failed to fetch data from the destination API');
    }
});
}