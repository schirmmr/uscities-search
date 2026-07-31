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

function search() {
    var query = searchInput.value.trim();
    if (!query || query.length === 0) return;   // empty messages are ignored
    console.log(`Debug>query: ${query}`); //for UI testing only
}

function displaySearch(data) {
    //todo
}
