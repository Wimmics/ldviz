import Swal from 'sweetalert2'

import state from "../mgexplorer/store"
import isHTML from 'is-html';
import detectCSV from 'detect-csv';
import { transform } from './trans_mg4'

/**
* Clear cache that stored from server
*/
function clearQueryCache(query) {
    // Send request
    let url = "/ldviz/clearcache";
    fetch(url, {
        method:'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ query: query })
    }).then(response => {
        toast("Cache cleared!")
    }).catch(error => {
        console.log(error);
    });
}

      
/**
 * Process the request query with selected query
 * The process includes complete SPARQL query path, send request to server and process result from server
 */
function processQuery(form, query, dataIndex) {
    let data = null
    if (form)  
        data = getFormData(form);

    if (data.uri !== null && data.uri.length == 0) {
        alert('You must provide a SPARQL Endpoint!')
        return
    } 

    if (data.query !== null && data.query.trim().length == 0) {
        alert('You must provide a query!')
        return
    }

    if (query && query.params) {
        data.params.prefixes = query.params.prefixes 
        data.id = query.id
    }

    tune(data)
    sendRequest(data, dataIndex);
}

/**
  * This funtion will send the request to the server to get the data from completely SPARQL query
  * 
*/
function sendRequest(values, dataIndex) {
    

    const url = "/ldviz/sparql"; // local server
    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( values )
    })
    .then(response => response.text())
    .then(text => {
        let result = {}
        // console.log("text = ", text)
        try{
            let res = JSON.parse(text)
            // result.response = res
            console.log('res = ', res)
    
            if (res.results) {
                if (res.results.bindings && res.results.bindings.length) {
                    const keys = res.head.vars
                    if (keys.includes('p') && (keys.includes('author') || (keys.includes('s') && keys.includes('o')))) {
                        getResult(res, values, dataIndex);
                    } else result.message = 'Missing mandatory variables'
                } else if (!res.results.bindings) {
                    result.message = "Data format issue: Not W3C compliant"
                } else if (!res.results.bindings.length) {
                    result.message = 'No results'
                }
            } else if (Object.keys(res).includes('status')) {
                
                switch(res.status) {
                    case 0:
                        if (res.statusText) {
                            switch(e.statusText.code) {
                                case 'ERR_TLS_CERT_ALTNAME_INVALID':
                                    result.message = 'Invalid Certificate'
                                    break;
                                case 'ETIMEDOUT':
                                    result.message = 'Timeout'
                                    break;
                                case 'ENOTFOUND':
                                    result.message = 'Service Not Found'
                                    break;
                                default: // 'ECONNREFUSED', EPROTO, etc.
                                    result.message = 'Service Unreachable'
                            }
                        } 
                        else {
                            result.message = 'Service Unreachable'
                        }
                        break;
                    case 400:
                        result.message = "Bad Request"
                        break;
                    case 401:
                    case 403:
                    case 407:
                    case 511:
                        result.message = 'Access Unauthorized'
                        break;
                    case 404:
                    case 410:
                        result.message = 'Service Not Found'
                        break;
                    case 406:
                        result.message = 'Format Not Supported'
                        break;
                    case 408:
                    case 504:
                        result.message = 'Timeout'
                        break;
                    case 503:
                    case 500:
                        if (e.response.includes('Virtuoso 42000 Error')) result.message = 'Timeout'
                        else result.message = "Service Unavailable"
                        break;
                    default:
                        if (isHTML(e.response)) {
                            let title = e.response.match(/<title[^>]*>([^<]+)<\/title>/)
                            if (!title) {
                                if (e.response.includes('Virtuoso 42000 Error')) {
                                    result.message = 'Timeout'
                                } else {
                                    result.message = e.response.split('\n')[0]
                                }
                            }
                            else result.message = title[1]
                        }
                }
            } else if (!res.results) {
                result.message = "Data format issue: Not W3C compliant"
            }                  
        } catch(e) {
            result.response = text
            if (text === undefined) result.message = undefined
            else if (typeof text === "string" && text.startsWith("Virtuoso 42000 Error")) 
                result.message = "Timeout"
            else if (isHTML(text)) { 
                result.message = 'Data format issue: HTML'
            } else if (detectCSV(text)) {
                result.message = 'Data format issue: CSV'
            } else {
                result.message = 'Unknown'
            } 
        }

        // console.log('result = ', result)
        if (Object.keys(result).length)
            getResult(result, values, dataIndex);
        })
    .catch(e => {
        console.log("e = ", e)
        // console.log('erreur response = ', e.response) 
    })

    

}

async function requestFile(data, dataIndex) {
    let result = await fetch('/ldviz/hceres/data/' + data.filename, { method: 'GET' })
        .then( async function(response){
        if(response.status >= 200 && response.status < 300){
            return await response.text().then(text => {
                return JSON.parse(text);
            })}
        else return response
    })

    console.log(result)

    if (!result.data.length) 
        result = { message: `No publications found in the HAL database. Please verify that the publications are corrected associated to the idHal of the author (this search uses idHal=${data.idHal}).`}

    getResult(result.data, result.stylesheet, dataIndex)
}

/**
Receives the result from the query and proceed to visualization
*/
async function getResult(res, query, dataIndex) {
    let result = res

    // transform data for MGExplorer
    if (!res.message) {
        if (res.results) {
            result = await transform(res.results.bindings, query.params ? query.params.type : 1, query.stylesheetActive ? query.stylesheet : null);
            result.sparql = res
        }
        else {
            result = await transform(res, 1, query) // for HCERES data -> query == stylesheet
        }
    }

    saveData(result, dataIndex)
}

/*------------------ query functions ------------------------*/

/**
*Get data from the form after user chose option for endpoint, query and custom variable
* 
*/
function getFormData(form) {
    return {
        'query': form['query_content'] ? form['query_content'].value : null,
        'name': form['query_name'] ? form['query_name'].value: null,
        'uri': form['query_endpoint'] ? form['query_endpoint'].value.trim() : null,
        'params': {
            "type": form['query_type'].value,
            'lab': [ form['query_lab1'].value, form['query_lab2'].value ],
            'country': form['query_country'].value,
            'period': [+form['from_year'].value, +form['to_year'].value],
            'variables': [form['custom_value1'].value, form['custom_value2'].value]
        },
        'stylesheetActive': form['check_stylesheet'].checked,
        'stylesheet': form['stylesheet_content'].value.length > 0 ? JSON.parse(form['stylesheet_content'].value) : null
    }
}

function getVariables(form) {
    let variables = []
    let i = 1
    while (form['term'+i]) {
        variables.push(form['term'+i].value)
        i++
    }
    return variables
}

/**
 * complete SPARQL query with data from HTML form such as year, lab, country
 */
function tune(data) {
    let params = data.params;

    Object.keys(params).forEach((p) => {
        // Replace metadata by selected value of corresponding list
        if (p == 'country' && params[p]) {
            // Parse country for Virtuoso
            data.query = data.query.replaceAll('$country', params[p])
            data.query = data.query.replace(/countrye/, params[p].replace(/ /, "_"));
            data.query = data.query.replace(/countryf/, getFrenchName(params[p]));
        } else if (p == 'period') {
            data.query = data.query.replaceAll('$beginYear', params[p][0])
            data.query = data.query.replaceAll('$endYear', params[p][1])
        } else if (p == 'lab' && params.type == 2) {
            data.query = data.query.replaceAll('$lab1', params[p][0])
            data.query = data.query.replaceAll('$lab2', params[p][1])
        } else if (p == 'lab') {
            data.query = data.query.replaceAll('$lab1', params[p][0])
        } else if (p == 'variables') {
            params[p].forEach((v,i) => {
                data.query = data.query.replaceAll('$term'+(i+1), v)
            })
        } else if (p == 'prefixes'){
            if (params[p] != null)
            params[p].forEach(pre => {
                data.query = pre + '\n' + data.query;
            })
        }
    });
}

/**
 * Display a new visualization technique after get result from requested query
 * After convert format of recieved data, it will create a new component include chart to represent new data
 * New dataset will be stored to global variable
 */
function saveData(data, dataIndex){
    if (data.mge)
        data.mge.nodes.dataNodes.forEach(node => node.idOrig = node.id) /// to-do: verify why this is being done
    state._data["data-"+dataIndex] = data.mge || data
}

/*---------------- helper functions --------------*/

function getFrenchName(country) {
    if (country == "France") return "France";
    if (country == "United Kingdom") return "Royaume-Uni";
    if (country == "United States") return "États-Unis";
    if (country == "Spain") return "Espagne";
    if (country == "Germany") return "Allemagne";
    if (country == "Italy") return "Italie";
    if (country == "Portugal") return "Portugal";
    if (country == "China") return "Chine";
    if (country == "Japan") return "Japon";
    if (country == "Vietnam") return "Vietnam";
    if (country == "Russia") return "Russie";
    if (country == "Brazil") return "Brésil";
    if (country == "Mexico") return "Mexique";
    if (country == "Morocco") return "Maroc";
    return "unknown";
}

/**
 * Create a toast notification to inform to users
 */
 function toast(message) {
    const options = {
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        type: "success",
        title: message
    } 
    Swal.fire(options);
}

export { processQuery, clearQueryCache, sendRequest, requestFile }