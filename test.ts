import {HttpsProxyAgent} from "https-proxy-agent";
import {createClient, RestAdapter} from "contentful-management";
import axios from "axios";
import {RestAdapterParams} from "contentful-management/dist/typings/adapters/REST/rest-adapter";

console.log("PROXY_URL set:", typeof process.env.PROXY_URL !== 'undefined')
console.log("CMA_TOKEN set:", typeof process.env.CMA_TOKEN !== 'undefined')
console.log("SPACE_ID set:", typeof process.env.SPACE_ID !== 'undefined')
console.log("ENVIRONMENT_ID set:", typeof process.env.ENVIRONMENT_ID !== 'undefined')

const accessToken = process.env.CMA_TOKEN!
const proxyUrl = process.env.PROXY_URL!
const spaceId = process.env.SPACE_ID!
const environmentId = process.env.ENVIRONMENT_ID!
const httpsAgent = new HttpsProxyAgent(proxyUrl, {keepAlive: true})

class CustomCmaRestAdapter extends RestAdapter {
    constructor(params: RestAdapterParams) {
        super(params);

        const defaultHostParameters = {
            defaultHostname: 'api.contentful.com',
            defaultHostnameUpload: 'upload.contentful.com',
        };

        // Although these props are marked as private, we are forced to override.
        // Luckily, these props are not private properties in the original class.
        // @ts-ignore
        this.params = {
            ...defaultHostParameters,
            ...params,
        };
    }
}

/**
 * Makes an HTTP GET request to the Contentful Management API using contentful-management
 */
async function tryCmaClient() {
    const client = createClient({
        accessToken,
        httpsAgent,
    }, {type: "plain"})

    console.log(await client.environment.get({
        spaceId,
        environmentId
    }))
}

/**
 * Workaround: Makes an HTTP GET request to the Contentful Management API using contentful-management with a custom adapter
 */
async function tryCmaClientWithCustomAdapter() {
    const client = createClient({
        apiAdapter: new CustomCmaRestAdapter({
            accessToken,
            httpsAgent,
        }),
    }, {type: "plain"})

    console.log(await client.environment.get({
        spaceId,
        environmentId
    }))
}

/**
 * Makes an HTTP GET request to the Contentful Management API using plain axios
 */
async function tryRawAxios() {
    const response = await axios.get(`https://api.contentful.com/spaces/${spaceId}/environments/${environmentId}`, {
        httpsAgent,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })

    console.log(response.data)
}

Promise.all([
    tryCmaClient(), // will fail
    tryRawAxios(), // works
    tryCmaClientWithCustomAdapter() // now fails as well
]).catch(console.error)
