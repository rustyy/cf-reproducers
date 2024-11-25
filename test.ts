import {HttpsProxyAgent} from "https-proxy-agent";
import {createClient} from "contentful-management";
import axios from "axios";

console.log("PROXY_URL set:", typeof process.env.PROXY_URL !== 'undefined')
console.log("CMA_TOKEN set:", typeof process.env.CMA_TOKEN !== 'undefined')
console.log("SPACE_ID set:", typeof process.env.SPACE_ID !== 'undefined')
console.log("ENVIRONMENT_ID set:", typeof process.env.ENVIRONMENT_ID !== 'undefined')

const accessToken = process.env.CMA_TOKEN!
const proxyUrl = process.env.PROXY_URL!
const spaceId = process.env.SPACE_ID!
const environmentId = process.env.ENVIRONMENT_ID!
const httpsAgent = new HttpsProxyAgent(proxyUrl, {keepAlive: true})

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
    tryRawAxios() // works
]).catch(console.error)
