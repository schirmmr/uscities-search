/* =============================================================================
 * EECE/CS 3093C Software Engineering — Lab 1
 * client.js — code skeleton provided by Dr. Phu Phung
 * Code complete implementation by Morgan Schirmer
 * ===============================================================================
 */

// UI DOM references
var searchBtnElm = document.getElementById('search-button');
if(!searchBtnElm) {
    console.log("Error in getting 'search-button' button");
}

searchBtnElm.addEventListener('click', ()=> {
    search();
    searchInput.value = ''; //clear the field after an explicit Enter search
});

var searchInput = document.getElementById('search-input');
if(!searchInput) {
    console.log('Error in getting "search-input" input');
}

searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        search();
        searchInput.value = ''; //clear the field after an Enter search
    }
});

const BASE_URL = "https://schirmmr-uscities-microservices-a4h9fufeg7djbhfm.canadacentral-01.azurewebsites.net"

async function search() {
    const query = searchInput.value.trim();
    if (!query || query.length === 0) return;   // AC9: empty/whitespace queries never reach fetch()
    console.log(`Debug>query: ${query}`); //for UI testing only
    try {
        const response = await fetch(`${BASE_URL}/uscities-search/${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`Unexpected status ${response.status}`); //AC4/AC11: fail safely, not open
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Malformed response'); //AC10: validate shape before display
        }
        displaySearch(data);
    } catch (err) {
        console.log(`Debug>search error: ${err.message}`);
        responses.textContent = 'Error: could not load results.'; //AC4/AC11
    }
}

var responsesElm = document.getElementById('responses');

function displaySearch(data) {
    if (!responsesElm) {
        console.log('Error in getting "responses"');
        return;
    }
    // AC1/AC2: matches found
    // AC3: no matches - explicit message instead of a blank/empty display
    responsesElm.innerHTML = json2htmllist(data);
}

function data_sanitize(v) {
    return DOMPurify.sanitize(typeof v === 'string' ? v : '');
}


function json2htmllist(data) {
    if (!Array.isArray(data) || data.length === 0) return "No cities found"; // AC10/AC11
    var items = data.map(function (c) {
        return '<li class="city-card"><strong>' + data_sanitize(c.city) + '</strong>, ' + data_sanitize(c.state_name) + ' <span class="zips">' + data_sanitize(c.zips) + '</span></li>';
    }).join('');
    return '<ul class="city-list">' + items + '</ul>';
}

var debounceTimer = null;
searchInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        clearTimeout(debounceTimer);
        search();
        searchInput.value = ''; //clear the field after an Enter search
        return;
    }
    clearTimeout(debounceTimer);
    var query = searchInput.value.trim();
    if (query.length < 2) return; // AC5: need at least 2 characters before suggesting
    debounceTimer = setTimeout(search, 300); //AC7: debounce ~300ms after the last keystroke
});
